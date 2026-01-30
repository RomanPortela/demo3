/**
 * Debug script to verify what the frontend query sees
 * Run with: npx tsx scripts/debug_portal_read.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
    console.log('=== Simulating Frontend Query ===\n');

    const supabase = createClient(supabaseUrl, supabaseKey);
    const HARDCODED_USER_ID = '1';

    // This is exactly what usePortalCredentials does
    const { data, error } = await supabase
        .from('portal_credentials')
        .select('*')
        .eq('portal_name', 'zonaprop')
        .eq('user_id', HARDCODED_USER_ID)
        .maybeSingle();

    console.log('Query for zonaprop with user_id=1:');

    if (error) {
        console.error('❌ Error:', error);
    } else if (!data) {
        console.log('⚠️ No data found - credentials are NOT saved!');
    } else {
        console.log('✅ Credentials found:');
        console.log('   ID:', data.id);
        console.log('   Username:', data.username);
        console.log('   Portal:', data.portal_name);
        console.log('   Active:', data.is_active);
        console.log('   Created:', data.created_at);
    }

    // Also list all records
    console.log('\n--- All records in portal_credentials ---');
    const { data: allData, error: allError } = await supabase
        .from('portal_credentials')
        .select('id, user_id, portal_name, username, is_active');

    if (allError) {
        console.error('❌ Error:', allError);
    } else {
        console.log('Total records:', allData?.length || 0);
        allData?.forEach(row => {
            console.log(`  - ID: ${row.id}, User: "${row.user_id}", Portal: ${row.portal_name}, Username: ${row.username}`);
        });
    }
}

main().catch(console.error);
