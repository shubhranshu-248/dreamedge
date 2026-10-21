-- Payment RPCs and indexes for server-first Razorpay flow

-- RPC: get current student's id from auth context
create or replace function current_student_id()
returns uuid
language sql
security definer
stable
as $$
  select id from students where user_id = auth.uid()
$$;

-- Fix: increment_total_students targeting the correct column name
create or replace function increment_total_students(p_course_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update courses
  set total_students = coalesce(total_students, 0) + 1
  where id = p_course_id;
end;
$$;

-- Composite index for fast idempotency checks on order creation
create index if not exists idx_orders_student_course_status
  on orders(student_id, course_id, status);
