import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkTable() {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log('--- Checking portal_credentials table ---');

    // 1. Check if table exists
    const { data: tableData, error: tableError } = await adminClient
        .from('portal_credentials')
        .select('*')
        .limit(1);

    if (tableError) {
        console.error('Error accessing portal_credentials:', tableError.message);
        if (tableError.message.includes('not found')) {
            console.log('TABLE DOES NOT EXIST. Did you run the migration?');
        }
    } else {
        console.log('Table portal_credentials exists.');
        console.log('Current row count:', tableData?.length || 0);

        // 2. Check schema
        const { data: columnData, error: columnError } = await adminClient.rpc('get_table_columns', { table_name: 'portal_credentials' });
        // (Note: this RPC might not exist, but we can try a direct select on information_schema if needed)
    }

    // Attempt a test insert with service key
    console.log('\n--- Testing test insert (Service Role) ---');
    const { data: inserted, error: insertError } = await adminClient
        .from('portal_credentials')
        .insert([{
            user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for test
            portal_name: 'test_portal',
            username: 'test_user',
            password: 'test_password'
        }])
        .select();

    if (insertError) {
        console.error('Test insert failed:', insertError.message);
    } else {
        console.log('Test insert success! ID:', inserted[0].id);
        // Clean up
        await adminClient.from('portal_credentials').delete().eq('id', inserted[0].id);
        console.log('Test cleanup done.');
    }
}

checkTable().catch(console.error);
