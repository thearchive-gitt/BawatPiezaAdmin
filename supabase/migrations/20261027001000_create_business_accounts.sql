create table if not exists public.business_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  firstname text not null,
  middlename text,
  lastname text,
  "contactNo" text,
  email text not null unique,
  role text not null default 'staff'
    check (role in ('admin', 'staff')),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended')),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.business_accounts enable row level security;

drop policy if exists business_users_read_own_account
  on public.business_accounts;

create policy business_users_read_own_account
  on public.business_accounts
  for select
  to authenticated
  using ((select auth.uid()) = id);
