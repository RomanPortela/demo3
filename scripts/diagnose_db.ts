import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function diagnose() {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log('--- Database Diagnostics ---');

    // 1. Check portal_credentials column types
    const { data: cols, error: colError } = await adminClient.rpc('get_table_columns_info', { t_name: 'portal_credentials' });

    // If RPC doesn't exist, we'll try to just catch the error on a malformed insert
    console.log('Attempting to insert hardcoded ID "1" to check for type mismatch...');
    const { data: insData, error: insError } = await adminClient
        .from('portal_credentials')
        .upsert({
            user_id: '1',
            portal_name: 'diagnose_test',
            username: 'test',
            password: 'test'
        });

    if (insError) {
        console.error('INSERT ERROR:', insError.code, insError.message);
        if (insError.message.includes('invalid input syntax for type uuid')) {
            console.log('DIAGNOSIS: user_id is still a UUID. The migration to change it to TEXT failed or was not run.');
        }
    } else {
        console.log('INSERT SUCCESS: Table already supports "1" as user_id.');
    }

    // 2. Check if there are ANY credentials
    const { data: allCreds } = await adminClient.from('portal_credentials').select('*');
    console.log('Current existing credentials in table:', allCreds?.length || 0);
    if (allCreds && allCreds.length > 0) {
        console.log('Sample credential user_id:', allCreds[0].user_id);
    }
}

diagnose().catch(console.error);
