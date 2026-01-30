import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testAnonWrite() {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('--- Testing ANON Write Access ---');

    const testId = 'test_' + Date.now();
    const { data, error } = await anonClient
        .from('portal_credentials')
        .upsert({
            user_id: '1',
            portal_name: testId,
            username: 'anon_test_user',
            password: 'anon_test_password'
        }, { onConflict: 'user_id, portal_name' })
        .select();

    if (error) {
        console.error('ANON WRITE FAILED:', error.code, error.message, error.details);
    } else {
        console.log('ANON WRITE SUCCESS!', data);
        // Clean up if possible
        await anonClient.from('portal_credentials').delete().eq('portal_name', testId);
    }
}

testAnonWrite().catch(console.error);
