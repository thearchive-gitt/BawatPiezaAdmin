create or replace function public.can_read_shared_device_pairing(target_hub_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.device_access as access
    where access.hub_id::text = target_hub_id
      and access.user_id = (select auth.uid())
  );
$$;

revoke all on function public.can_read_shared_device_pairing(text)
  from public, anon;
grant execute on function public.can_read_shared_device_pairing(text)
  to authenticated;

alter table public.device_pairings enable row level security;

drop policy if exists business_users_read_authorized_device_pairings
  on public.device_pairings;

create policy business_users_read_authorized_device_pairings
  on public.device_pairings
  for select
  to authenticated
  using (
    (select public.is_active_business_admin())
    or user_id = (select auth.uid())
    or (select public.can_read_shared_device_pairing(hub_id::text))
  );

grant select on public.device_pairings to authenticated;
