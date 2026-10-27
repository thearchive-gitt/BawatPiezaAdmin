alter table public.user_accounts enable row level security;

drop policy if exists business_users_read_own_account
  on public.user_accounts;

create policy business_users_read_own_account
  on public.user_accounts
  for select
  to authenticated
  using ((select auth.uid()) = id);
