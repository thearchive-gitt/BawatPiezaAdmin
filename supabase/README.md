# Business portal sign-in setup

1. Copy `.env.example` to `.env.local` and set `SUPABASE_URL` to the plain project URL (for example, `https://your-project.supabase.co`) and `SUPABASE_ANON_KEY` to the anon/publishable key. Do not paste Markdown link formatting into `.env.local`.
2. Run the migrations in `supabase/migrations/` in order in the Supabase SQL Editor. These create a separate `public.business_accounts` table, configure account and device-pairing read policies, and allow admins and assigned staff to read relevant device pairings and authorized device-owner emails.
3. Create business credentials through Supabase Auth or your trusted account-provisioning process. Each business user must have a matching `public.business_accounts` row whose `id` matches the Auth user ID, `role` is `admin` or `staff`, `status` is `active`, and `is_active` is `true`.
4. Start the app with `npm run dev`. The sign-in page is `/`; successful sign-in opens `/business`.

There is no public sign-up form. Never put a Supabase service-role key in a `NEXT_PUBLIC_` variable or in browser code.

## Admin-created business accounts

The admin Business accounts tab lists records from `public.business_accounts`. Its Create business account button opens a modal to provision an active staff or admin account in Supabase Auth and `business_accounts`. The action checks that the current user is an active business admin, and uses the same server-only `SUPABASE_SERVICE_ROLE_KEY` described above. Keep the service-role key out of browser code and never add it to a `NEXT_PUBLIC_` variable. The new user must receive their temporary password through a separate secure channel.

## Create the test business admin

After the email has been invited or created in Supabase Authentication and both business-account migrations have been applied, run `supabase/manual-scripts/create_test_business_admin.sql` in the Supabase SQL Editor. It creates or updates the matching business profile as an active admin and returns the resulting row. It does not create an Auth user or set a password.
