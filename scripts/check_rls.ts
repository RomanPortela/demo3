import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkRLS() {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log('--- Checking RLS status ---');

    const { data: rlsInfo, error } = await adminClient.rpc('get_rls_status', { t_name: 'portal_credentials' });

    // If RPC is missing, use a direct query to pg_tables
    const { data: pgData, error: pgError } = await adminClient.from('properties').select('row_level_security').limit(1);
    // This won't work easily.

    // Let's try to fetch policies
    const { data: policies, error: polError } = await adminClient
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'portal_credentials');

    console.log('Policies found:', policies?.length || 0);
    if (policies) {
        console.table(policies);
    }

    // Check row_level_security field in pg_class/pg_tables if possible
    // Instead, I'll just try to insert one and see if it persists.
}

checkRLS().catch(console.error);
