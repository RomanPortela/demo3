/**
 * Debug script to test portal_credentials table
 * Run with: npx tsx scripts/debug_portal.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('=== Portal Credentials Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n--- 1. Testing connection by reading table ---');
    const { data: allData, error: readError } = await supabase
        .from('portal_credentials')
        .select('*');

    if (readError) {
        console.error('❌ Read Error:', readError.message);
        console.error('   Code:', readError.code);
        console.error('   Details:', readError.details);
    } else {
        console.log('✅ Read success. Found', allData?.length || 0, 'rows');
        console.log('   Data:', JSON.stringify(allData, null, 2));
    }

    console.log('\n--- 2. Attempting to insert/upsert a test credential ---');
    const testPayload = {
        user_id: '1',
        portal_name: 'zonaprop',
        username: 'test_debug@example.com',
        password: 'test_password_123',
        is_active: true
    };

    console.log('   Payload:', testPayload);

    const { data: upsertData, error: upsertError } = await supabase
        .from('portal_credentials')
        .upsert(testPayload, { onConflict: 'user_id, portal_name' })
        .select()
        .single();

    if (upsertError) {
        console.error('❌ Upsert Error:', upsertError.message);
        console.error('   Code:', upsertError.code);
        console.error('   Details:', upsertError.details);
        console.error('   Hint:', upsertError.hint);
    } else {
        console.log('✅ Upsert success!');
        console.log('   Returned data:', upsertData);
    }

    console.log('\n--- 3. Reading back to confirm persistence ---');
    const { data: finalData, error: finalError } = await supabase
        .from('portal_credentials')
        .select('*')
        .eq('portal_name', 'zonaprop')
        .eq('user_id', '1')
        .maybeSingle();

    if (finalError) {
        console.error('❌ Final Read Error:', finalError.message);
    } else if (!finalData) {
        console.log('⚠️ No data found after insert - DATA NOT PERSISTING!');
    } else {
        console.log('✅ Data persisted successfully:');
        console.log('   ', finalData);
    }

    console.log('\n=== Debug Complete ===');
}

main().catch(console.error);
