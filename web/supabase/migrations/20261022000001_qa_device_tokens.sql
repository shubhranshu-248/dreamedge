-- FCM / APNs device token registry. Rows are owned by auth.users (user_id),
-- not by students, because the app registers a token at startup before the
-- student profile is loaded (and because an auth user may have multiple
-- devices).
create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android','ios','web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists device_tokens_user_id_idx on public.device_tokens(user_id);

alter table public.device_tokens enable row level security;

drop policy if exists "device_tokens_self_upsert" on public.device_tokens;
create policy "device_tokens_self_upsert"
  on public.device_tokens
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
