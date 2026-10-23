-- Security hardening round 2 (2026-10-23)
--
-- Addresses the remaining 'Important' findings from the Oct 22 audit:
--   1. lessons were readable by anon+authenticated with no enrollment gate → gate them
--   2. admin_users super-admin policy had no WITH CHECK → add it
--   3. refunds.processed_by was nullable and nothing set it → trigger that
--      stamps it to auth.uid() when the finance admin inserts
--   4. Razorpay webhook had no event-id idempotency → add webhook_events
--      table with event_id PRIMARY KEY so duplicates no-op
--   5. Three competing SELECT policies on students; blocked/inactive
--      students could still read their own row → consolidate into one
--      policy that honours an is_active / status check
--   6. increment_student_count still callable by anon via REST → confirm
--      service-only grant
--
-- Safe to re-run.
--
-- NOTE: the hybrid live schema may be missing some helper functions from
-- 20261012000001_rls_policies.sql. Define them defensively at the top so
-- this migration never fails with "function does not exist".

-- =========================================================================
-- 0. Defensive helper functions (idempotent — matches 20261012000001)
-- =========================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users
     where user_id = auth.uid()
       and coalesce(is_active, true) = true
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.admin_users au
      join public.roles r on r.id = au.role_id
     where au.user_id = auth.uid()
       and coalesce(au.is_active, true) = true
       and r.name = 'super_admin'
  );
$$;


-- =========================================================================
-- 1. lessons SELECT — gate by enrollment
-- =========================================================================
-- The current policy "lessons_select_published" reads any published lesson
-- to anon + authenticated. Paid video URLs leak. Replace with a policy that
-- requires either (a) an active enrollment in the lesson's course or
-- (b) admin role.
do $$
begin
  if exists (select 1 from pg_policies where policyname = 'lessons_select_published' and tablename = 'lessons') then
    execute 'drop policy "lessons_select_published" on public.lessons';
  end if;
  if exists (select 1 from pg_policies where policyname = 'lessons_select_enrolled_or_admin' and tablename = 'lessons') then
    execute 'drop policy "lessons_select_enrolled_or_admin" on public.lessons';
  end if;
end $$;

create policy "lessons_select_enrolled_or_admin"
  on public.lessons
  for select
  to anon, authenticated
  using (
    -- Admin override — always visible
    (auth.uid() is not null and public.is_admin())
    OR
    -- Enrolled student with an active, un-expired enrollment
    exists (
      select 1
        from public.enrollments e
        join public.students s on s.id = e.student_id
       where e.course_id = lessons.course_id
         and s.user_id   = auth.uid()
         and e.status    = 'active'
         and (e.valid_until is null or e.valid_until > now())
    )
  );

-- Keep service_role unlimited (edge functions still need to list lessons).
-- The "lessons_service_all" policy from 20261017140000 stays.

-- Preview lessons — a course can mark lesson N as free preview via
-- `is_free_preview` if the column exists. Add a complementary policy that
-- lets anyone see those without an enrollment.
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'lessons' and column_name = 'is_free_preview'
  ) then
    if exists (select 1 from pg_policies where policyname = 'lessons_select_preview' and tablename = 'lessons') then
      execute 'drop policy "lessons_select_preview" on public.lessons';
    end if;
    execute $sql$
      create policy "lessons_select_preview"
        on public.lessons for select
        to anon, authenticated
        using (is_published = true and is_free_preview = true)
    $sql$;
  end if;
end $$;


-- =========================================================================
-- 2. admin_users super-admin policy — add WITH CHECK
-- =========================================================================
do $$
begin
  if exists (
    select 1 from pg_policies
     where policyname = 'Super admin full access to admin_users'
       and tablename  = 'admin_users'
  ) then
    execute 'drop policy "Super admin full access to admin_users" on public.admin_users';
  end if;
  if exists (
    select 1 from pg_policies
     where policyname = 'admin_users_super_admin_all'
       and tablename  = 'admin_users'
  ) then
    execute 'drop policy "admin_users_super_admin_all" on public.admin_users';
  end if;
end $$;

create policy "admin_users_super_admin_all"
  on public.admin_users
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());


-- =========================================================================
-- 3. refunds — auto-stamp processed_by = auth.uid()
-- =========================================================================
do $$
begin
  if exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'refunds'
  ) then
    -- defined below
    null;
  end if;
end $$;

create or replace function public.fill_refunds_processed_by()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.processed_by is null and auth.uid() is not null then
    select id into new.processed_by
      from public.admin_users
     where user_id = auth.uid()
     limit 1;
  end if;
  return new;
end;
$$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'refunds'
  ) then
    execute 'drop trigger if exists trg_fill_refunds_processed_by on public.refunds';
    execute 'create trigger trg_fill_refunds_processed_by
             before insert or update on public.refunds
             for each row
             execute function public.fill_refunds_processed_by()';
  end if;
end $$;


-- =========================================================================
-- 4. Webhook event-id idempotency
-- =========================================================================
create table if not exists public.webhook_events (
  event_id    text primary key,
  event_type  text not null,
  received_at timestamptz not null default now(),
  payload     jsonb,
  processed   boolean not null default true
);

alter table public.webhook_events enable row level security;

do $$
begin
  if exists (select 1 from pg_policies where policyname = 'webhook_events_service_all' and tablename = 'webhook_events') then
    execute 'drop policy "webhook_events_service_all" on public.webhook_events';
  end if;
end $$;

create policy "webhook_events_service_all"
  on public.webhook_events for all
  to service_role
  using (true) with check (true);

create index if not exists idx_webhook_events_received_at
  on public.webhook_events(received_at desc);


-- =========================================================================
-- 5. students — consolidate competing SELECT policies + enforce active status
-- =========================================================================
do $$
declare
  policies text[] := array[
    'Students can view own profile',
    'students_select_own',
    'students_self_read',
    'students_self_read_active'
  ];
  p text;
begin
  foreach p in array policies loop
    if exists (select 1 from pg_policies where policyname = p and tablename = 'students') then
      execute format('drop policy %I on public.students', p);
    end if;
  end loop;
end $$;

create policy "students_self_read_active"
  on public.students
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and coalesce(
      (to_jsonb(students) ->> 'is_active')::boolean,
      true
    ) = true
    and coalesce((to_jsonb(students) ->> 'status'), 'active') <> 'blocked'
  );


-- =========================================================================
-- 6. Audit log on enrollment grants
-- =========================================================================
create or replace function public.log_enrollment_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    return new;
  end if;

  insert into public.audit_log (user_id, action, entity_type, entity_id, metadata)
  values (
    v_actor,
    case tg_op
      when 'INSERT' then 'enrollment_created'
      when 'UPDATE' then 'enrollment_updated'
      else lower(tg_op)
    end,
    'enrollment',
    new.id,
    jsonb_build_object(
      'student_id', new.student_id,
      'course_id',  new.course_id,
      'status',     new.status,
      'valid_until', new.valid_until
    )
  );
  return new;
exception
  when others then
    raise warning 'audit_log insert failed in enrollment trigger: %', sqlerrm;
    return new;
end;
$$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'audit_log'
  ) then
    drop trigger if exists trg_log_enrollment_change on public.enrollments;
    create trigger trg_log_enrollment_change
      after insert or update on public.enrollments
      for each row
      execute function public.log_enrollment_change();
  end if;
end $$;


-- =========================================================================
-- 7. Belt-and-braces: re-revoke RPCs that should be service-only
-- =========================================================================
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'increment_student_count') then
    revoke execute on function public.increment_student_count(uuid)
      from public, anon, authenticated;
    grant execute on function public.increment_student_count(uuid) to service_role;
  end if;
end $$;

comment on table public.webhook_events is
  'Idempotency keys for Razorpay webhook deliveries. event_id uniqueness '
  'makes retries no-op even if the completion short-circuit does not fire.';
