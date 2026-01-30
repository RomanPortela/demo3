-- ===== FIX FOR PORTAL_CREDENTIALS =====
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)
-- This will ensure all permissions are correctly set for the portal_credentials table

-- Step 1: Disable RLS completely
ALTER TABLE public.portal_credentials DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'portal_credentials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.portal_credentials', pol_name);
    END LOOP;
END $$;

-- Step 3: Grant FULL permissions to anon role (this is what the browser uses)
GRANT ALL ON public.portal_credentials TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 4: Grant to authenticated (just in case)
GRANT ALL ON public.portal_credentials TO authenticated;

-- Step 5: Grant to service_role
GRANT ALL ON public.portal_credentials TO service_role;

-- Step 6: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'portal_credentials'
ORDER BY ordinal_position;

-- Step 7: Verify RLS status
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as rls_forced
FROM pg_class 
WHERE relname = 'portal_credentials';

-- Step 8: Verify grants on the table
SELECT 
    grantee, 
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'portal_credentials';

-- Step 9: Check if there are any records
SELECT id, user_id, portal_name, username, is_active, created_at 
FROM portal_credentials 
ORDER BY created_at DESC 
LIMIT 5;
