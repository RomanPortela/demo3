-- Bypass auth for portal_credentials (Corrected)
-- 1. Drop the policy that depends on user_id
drop policy if exists "Users can manage their own credentials" on public.portal_credentials;

-- 2. Drop the foreign key constraint
alter table public.portal_credentials 
drop constraint if exists portal_credentials_user_id_fkey;

-- 3. Change user_id from uuid to text to support "1"
alter table public.portal_credentials 
alter column user_id type text;

-- 4. Disable RLS to allow access without session
alter table public.portal_credentials disable row level security;
