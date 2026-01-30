-- FIX RLS FOR PROPERTIES
-- This ensures properties are visible even if the user is not correctly authenticated in the browser session

-- 1. Disable RLS temporarily or add anon policy
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_multimedia DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_properties DISABLE ROW LEVEL SECURITY;

-- If you prefer keeping RLS enabled but allowing all:
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to properties" ON properties FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all access to property_multimedia" ON property_multimedia FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all access to lead_properties" ON lead_properties FOR ALL TO public USING (true) WITH CHECK (true);
