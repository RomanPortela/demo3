/**
 * Full flow simulation
 * Simulates exactly what the frontend does
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const HARDCODED_USER_ID = '1';

async function main() {
    console.log('=== FULL FLOW SIMULATION ===\n');
    console.log('URL:', supabaseUrl);
    console.log('Key prefix:', supabaseKey.substring(0, 20) + '...');

    // Simulate new instance per hook (this is what happens in the frontend)
    const supabase1 = createClient(supabaseUrl, supabaseKey);
    const supabase2 = createClient(supabaseUrl, supabaseKey);

    // Step 1: Initial read (what usePortalCredentials does)
    console.log('\n--- Step 1: Initial Read (usePortalCredentials) ---');
    const { data: initialData, error: initialError } = await supabase1
        .from('portal_credentials')
        .select('*')
        .eq('portal_name', 'zonaprop')
        .eq('user_id', HARDCODED_USER_ID)
        .maybeSingle();

    if (initialError) {
        console.error('Initial read error:', initialError);
    } else {
        console.log('Initial data:', initialData ? `Found: ${initialData.username}` : 'None');
    }

    // Step 2: Upsert (what handleSaveCredentials does)
    console.log('\n--- Step 2: Upsert (handleSaveCredentials) ---');
    const testTimestamp = Date.now();
    const payload = {
        portal_name: 'zonaprop',
        username: `frontend_test_${testTimestamp}@example.com`,
        password: 'test_password_frontend',
        is_active: true,
        user_id: HARDCODED_USER_ID
    };
    console.log('Payload:', { ...payload, password: '(hidden)' });

    const { data: upsertData, error: upsertError } = await supabase2
        .from('portal_credentials')
        .upsert(payload, {
            onConflict: 'user_id, portal_name'
        })
        .select()
        .single();

    if (upsertError) {
        console.error('❌ Upsert ERROR:', upsertError);
    } else {
        console.log('✅ Upsert SUCCESS:', { ...upsertData, password: '(hidden)' });
    }

    // Step 3: Simulate page refresh - new client instance
    console.log('\n--- Step 3: Simulating Page Refresh (new instance) ---');
    const supabase3 = createClient(supabaseUrl, supabaseKey);

    const { data: afterRefresh, error: refreshError } = await supabase3
        .from('portal_credentials')
        .select('*')
        .eq('portal_name', 'zonaprop')
        .eq('user_id', HARDCODED_USER_ID)
        .maybeSingle();

    if (refreshError) {
        console.error('❌ After refresh read ERROR:', refreshError);
    } else if (!afterRefresh) {
        console.log('⚠️ NO DATA AFTER REFRESH - This is the bug!');
    } else {
        console.log('✅ Data FOUND after refresh:', {
            id: afterRefresh.id,
            username: afterRefresh.username,
            is_active: afterRefresh.is_active
        });
    }

    // Step 4: Direct query without filters
    console.log('\n--- Step 4: Query all records (sanity check) ---');
    const { data: allRecords, error: allError } = await supabase3
        .from('portal_credentials')
        .select('id, user_id, portal_name, username');

    if (allError) {
        console.error('All records error:', allError);
    } else {
        console.log('Total records in table:', allRecords?.length || 0);
        allRecords?.forEach(r => {
            console.log(`  - ID ${r.id}: user_id="${r.user_id}", portal="${r.portal_name}", username="${r.username}"`);
        });
    }

    console.log('\n=== END SIMULATION ===');
}

main().catch(console.error);
