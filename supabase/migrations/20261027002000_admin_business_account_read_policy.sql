create or replace function public.is_active_business_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_accounts as account
    where account.id = (select auth.uid())
      and account.role = 'admin'
      and account.status = 'active'
      and account.is_active
  );
$$;

revoke all on function public.is_active_business_admin() from public, anon;
grant execute on function public.is_active_business_admin() to authenticated;

drop policy if exists business_admins_read_all_business_accounts
  on public.business_accounts;

create policy business_admins_read_all_business_accounts
  on public.business_accounts
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or (select public.is_active_business_admin())
  );
