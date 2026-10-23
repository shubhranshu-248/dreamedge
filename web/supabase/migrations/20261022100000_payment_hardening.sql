-- Payment-path security hardening (2026-10-22)
--
-- Addresses four audit findings:
--   1. Serialize verify-payment and webhook via a single atomic RPC
--      (eliminates the student_count double-increment race).
--   2. Enforce DB-level amount check inside the RPC (defense in depth —
--      the Edge Function also checks against Razorpay's payment-fetch API).
--   3. Lock down revenue-analytics RPCs so only admins can read totals.
--   4. Lock down increment_student_count so only service_role can call it.
--
-- Safe to re-run — all CREATE statements use OR REPLACE.

-- =========================================================================
-- 1. Atomic order completion RPC
-- =========================================================================
-- SELECT FOR UPDATE serializes concurrent callers on the orders row.
-- Returns a json flag `was_new` so the caller knows whether the counter
-- fired (we fire it inside this function, so the caller shouldn't).
create or replace function public.complete_paid_order(
  p_order_id            uuid,
  p_razorpay_payment_id text,
  p_razorpay_signature  text,
  p_captured_paise      bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_student_id   uuid;
  v_course_id    uuid;
  v_status       text;
  v_rzp_order_id text;
  v_final_amount numeric;
  v_validity_days int;
  v_valid_until  timestamptz;
  v_enrollment_id uuid;
  v_was_new      boolean;
  v_inserted_rows int;
begin
  -- Lock the order row for the lifetime of this transaction.
  select student_id, course_id, status::text, razorpay_order_id, final_amount
    into v_student_id, v_course_id, v_status, v_rzp_order_id, v_final_amount
    from public.orders
    where id = p_order_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'order_not_found');
  end if;

  -- Idempotent short-circuit: already completed → return existing enrollment.
  if v_status = 'completed' then
    select id into v_enrollment_id
      from public.enrollments
      where student_id = v_student_id
        and course_id = v_course_id
      limit 1;
    return jsonb_build_object(
      'ok', true,
      'order_id', p_order_id,
      'enrollment_id', v_enrollment_id,
      'was_new', false,
      'already_completed', true
    );
  end if;

  -- Amount cross-check — the caller computes paise from Razorpay's
  -- captured amount; we compare against the server-recorded order total.
  if p_captured_paise is not null
     and p_captured_paise <> round(coalesce(v_final_amount, 0) * 100)::bigint then
    return jsonb_build_object(
      'ok', false,
      'reason', 'amount_mismatch',
      'expected_paise', round(coalesce(v_final_amount, 0) * 100)::bigint,
      'captured_paise', p_captured_paise
    );
  end if;

  -- Determine validity window from the course's validity_days.
  select coalesce(validity_days, 365) into v_validity_days
    from public.courses
    where id = v_course_id;
  if v_validity_days is null then
    v_validity_days := 365;
  end if;
  v_valid_until := now() + make_interval(days => v_validity_days);

  -- Mark the order completed.
  update public.orders
     set status              = 'completed',
         razorpay_payment_id = p_razorpay_payment_id,
         razorpay_signature  = p_razorpay_signature,
         updated_at          = now()
   where id = p_order_id;

  -- Upsert the enrollment. xmax = 0 on the returned row means the row was
  -- just INSERTed (not updated by ON CONFLICT) — the only reliable way in
  -- Postgres to distinguish insert vs update inside an upsert.
  insert into public.enrollments
    (student_id, course_id, payment_id, status, purchased_at, valid_until)
  values
    (v_student_id, v_course_id, p_order_id, 'active', now(), v_valid_until)
  on conflict (student_id, course_id) do update
    set status      = 'active',
        valid_until = greatest(public.enrollments.valid_until, excluded.valid_until)
  returning id, (xmax = 0) into v_enrollment_id, v_was_new;

  -- Fire the counter exactly once per new enrollment.
  if v_was_new then
    update public.courses
       set student_count = coalesce(student_count, 0) + 1,
           updated_at    = now()
     where id = v_course_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'order_id', p_order_id,
    'enrollment_id', v_enrollment_id,
    'was_new', v_was_new
  );
end;
$$;

-- Only Edge Functions (service_role) should call this.
revoke execute on function public.complete_paid_order(uuid, text, text, bigint)
  from public, anon, authenticated;
grant execute on function public.complete_paid_order(uuid, text, text, bigint)
  to service_role;


-- =========================================================================
-- 2. Lock down increment_student_count (callable only by service_role)
-- =========================================================================
-- The RPC exists from migration 20261017150000. Any authenticated user
-- can call PostgREST RPCs by default, which lets a bored student inflate
-- any course's student_count. Restrict to service_role.
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'increment_student_count'
  ) then
    execute 'revoke execute on function public.increment_student_count(uuid) from public, anon, authenticated';
    execute 'grant execute on function public.increment_student_count(uuid) to service_role';
  end if;
end $$;


-- =========================================================================
-- 3. Admin gate on revenue-analytics RPCs
-- =========================================================================
-- The RPCs are SECURITY DEFINER with no caller check — any authenticated
-- user can read full revenue, payment-method mix, daily order counts, and
-- refund stats. Wrap each with an is_admin() check.

create or replace function public.get_revenue_stats(
  start_date timestamptz default null,
  end_date   timestamptz default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result json;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select json_build_object(
    'total_revenue', coalesce(sum(final_amount), 0),
    'total_orders',  count(*),
    'monthly_revenue', (
      select coalesce(json_agg(row_to_json(m)), '[]'::json)
      from (
        select
          date_trunc('month', created_at) as month,
          sum(final_amount)               as revenue,
          count(*)                        as order_count
        from public.orders
        where status = 'completed'
          and (start_date is null or created_at >= start_date)
          and (end_date   is null or created_at <= end_date)
        group by date_trunc('month', created_at)
        order by month desc
        limit 12
      ) m
    )
  ) into result
  from public.orders
  where status = 'completed'
    and (start_date is null or created_at >= start_date)
    and (end_date   is null or created_at <= end_date);

  return result;
end;
$$;

create or replace function public.get_payment_method_breakdown(
  start_date timestamptz default null,
  end_date   timestamptz default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return (
    select coalesce(json_agg(row_to_json(r)), '[]'::json)
    from (
      select
        payment_method as method,
        count(*)       as order_count,
        coalesce(sum(final_amount), 0) as total_amount
      from public.orders
      where status = 'completed'
        and (start_date is null or created_at >= start_date)
        and (end_date   is null or created_at <= end_date)
      group by payment_method
      order by total_amount desc
    ) r
  );
end;
$$;

create or replace function public.get_daily_orders(
  start_date timestamptz default null,
  end_date   timestamptz default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return (
    select coalesce(json_agg(row_to_json(d)), '[]'::json)
    from (
      select
        date_trunc('day', created_at)::date as day,
        count(*)                            as order_count,
        coalesce(sum(final_amount), 0)      as revenue
      from public.orders
      where status = 'completed'
        and (start_date is null or created_at >= start_date)
        and (end_date   is null or created_at <= end_date)
      group by date_trunc('day', created_at)::date
      order by day asc
    ) d
  );
end;
$$;

create or replace function public.get_refund_stats(
  start_date timestamptz default null,
  end_date   timestamptz default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result json;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select json_build_object(
    'total_refunds',        count(*),
    'total_refund_amount',  coalesce(sum(amount), 0),
    'pending_count',        count(*) filter (where status = 'requested'),
    'approved_count',       count(*) filter (where status = 'approved'),
    'processed_count',      count(*) filter (where status = 'processed'),
    'rejected_count',       count(*) filter (where status = 'rejected')
  ) into result
  from public.refunds
  where (start_date is null or created_at >= start_date)
    and (end_date   is null or created_at <= end_date);

  return result;
end;
$$;

-- get_top_courses references column names that differ between the two
-- competing `courses` schemas (`name/status` vs `title/is_published`).
-- The admin check applies regardless; the column reconciliation is
-- tracked separately — the function body is left alone here so this
-- migration is a no-op if get_top_courses's columns are already correct.
do $$
begin
  if exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'get_top_courses'
  ) then
    -- Add admin gate by wrapping the existing body isn't straightforward,
    -- so we revoke public execute instead. The admin panel calls this
    -- via server actions with the service role, so the gate holds.
    execute 'revoke execute on function public.get_top_courses(int) from public, anon, authenticated';
    execute 'grant execute on function public.get_top_courses(int) to service_role';
  end if;
end $$;


-- =========================================================================
-- 4. Defense-in-depth: unique razorpay_payment_id
-- =========================================================================
-- Even with the completed-order short-circuit, add a DB-level unique
-- constraint so a replay of the same payment_id against a different
-- order (shouldn't happen, but) is rejected at the DB.
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename  = 'orders'
      and indexname  = 'orders_razorpay_payment_id_unique'
  ) then
    execute $sql$
      create unique index orders_razorpay_payment_id_unique
        on public.orders(razorpay_payment_id)
        where razorpay_payment_id is not null
    $sql$;
  end if;
end $$;


-- =========================================================================
-- 5. Audit note (NO-OP SQL — reads as a comment to future maintainers)
-- =========================================================================
comment on function public.complete_paid_order(uuid, text, text, bigint) is
  'Atomic order completion. SELECT FOR UPDATE serializes the verify-payment Edge Function and the Razorpay webhook so student_count never double-increments. Caller MUST have already verified the HMAC signature AND cross-checked the captured amount against Razorpay''s payment-fetch API before invoking.';
