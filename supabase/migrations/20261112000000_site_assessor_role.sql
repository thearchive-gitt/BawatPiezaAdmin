alter table public.business_accounts
  drop constraint if exists business_accounts_role_check;

alter table public.business_accounts
  add constraint business_accounts_role_check
  check (role in ('admin', 'staff', 'site_assessor'));
