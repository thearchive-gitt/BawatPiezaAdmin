do $$
declare
  target_email constant text := 'soriano.althea.sucion@gmail.com';
  auth_user_id uuid;
begin
  select id
  into auth_user_id
  from auth.users
  where lower(email) = lower(target_email)
  limit 1;

  if auth_user_id is null then
    raise exception
      'No Supabase Auth user exists for %. Invite or create the user in Authentication, then run this script again.',
      target_email;
  end if;

  insert into public.business_accounts (
    id,
    firstname,
    middlename,
    lastname,
    email,
    role,
    status,
    is_active
  )
  values (
    auth_user_id,
    'Althea',
    'Soriano',
    'Sucion',
    target_email,
    'admin',
    'active',
    true
  )
  on conflict (id) do update
  set firstname = excluded.firstname,
      middlename = excluded.middlename,
      lastname = excluded.lastname,
      email = excluded.email,
      role = excluded.role,
      status = excluded.status,
      is_active = excluded.is_active;
end
$$;

select id, firstname, middlename, lastname, email, role, status, is_active
from public.business_accounts
where lower(email) = lower('soriano.althea.sucion@gmail.com');
