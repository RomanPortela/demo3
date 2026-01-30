import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function inspectData() {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log('--- Portal Credentials Content ---');

    const { data, error } = await adminClient
        .from('portal_credentials')
        .select('id, user_id, portal_name, username');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No credentials found in table.');
    } else {
        console.table(data);
    }
}

inspectData().catch(console.error);
