create or replace function public.can_read_device_owner_email(target_user_id uuid)
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
      and account.role = 'staff'
      and account.status = 'active'
      and account.is_active
      and (
        target_user_id = (select auth.uid())
        or exists (
          select 1
          from public.device_pairings as pairing
          join public.device_access as access
            on access.hub_id::text = pairing.hub_id::text
          where pairing.user_id = target_user_id
            and access.user_id = (select auth.uid())
        )
      )
  );
$$;

revoke all on function public.can_read_device_owner_email(uuid)
  from public, anon;
grant execute on function public.can_read_device_owner_email(uuid)
  to authenticated;

drop policy if exists assigned_staff_read_device_owner_email
  on public.user_accounts;

create policy assigned_staff_read_device_owner_email
  on public.user_accounts
  for select
  to authenticated
  using ((select public.can_read_device_owner_email(id)));
