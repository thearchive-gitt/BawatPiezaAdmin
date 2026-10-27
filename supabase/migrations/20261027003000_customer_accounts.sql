alter table public.user_accounts
  drop constraint if exists user_accounts_role_check;

alter table public.user_accounts
  add constraint user_accounts_role_check
  check (role in ('admin', 'staff', 'customer'));

alter table public.user_accounts enable row level security;

drop policy if exists business_admins_read_customer_accounts
  on public.user_accounts;

create policy business_admins_read_customer_accounts
  on public.user_accounts
  for select
  to authenticated
  using ((select public.is_active_business_admin()));
