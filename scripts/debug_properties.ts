import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function runDebug() {
    console.log('--- DB Debug ---');
    console.log('URL:', supabaseUrl);

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Check Properties Count (Admin)
    console.log('\n[1] Checking properties (ADMIN)...');
    const { data: adminProps, error: adminError, count: adminCount } = await adminClient
        .from('properties')
        .select('*', { count: 'exact' });

    if (adminError) {
        console.error('Admin Fetch Error:', adminError);
    } else {
        console.log(`Found ${adminCount} properties in DB.`);
        if (adminProps && adminProps.length > 0) {
            console.log('First property ID:', adminProps[0].id);
        }
    }

    // 2. Check Properties Count (Anon)
    console.log('\n[2] Checking properties (ANON)...');
    const { data: anonProps, error: anonError, count: anonCount } = await anonClient
        .from('properties')
        .select('*', { count: 'exact' });

    if (anonError) {
        console.error('Anon Fetch Error:', anonError);
    } else {
        console.log(`Anon client sees ${anonCount} properties.`);
    }

    // 3. Test Insertion (Admin)
    console.log('\n[3] Testing small insertion (ADMIN)...');
    const testProp = {
        property_type: 'casa',
        operation_type: 'venta',
        internal_status: 'Disponible',
        internal_visibility: 'Activa para ventas',
        address: 'DEBUG_TEST_123',
        price: 999999
    };

    const { data: inserted, error: insertError } = await adminClient
        .from('properties')
        .insert([testProp])
        .select()
        .single();

    if (insertError) {
        console.error('Insert Error:', JSON.stringify(insertError, null, 2));
    } else {
        console.log('Insert Success! ID:', inserted.id);
        // Clean up
        await adminClient.from('properties').delete().eq('id', inserted.id);
        console.log('Cleanup: Test property deleted.');
    }

    // 4. Check multimedia table
    console.log('\n[4] Checking property_multimedia table...');
    const { error: mediaError } = await adminClient
        .from('property_multimedia')
        .select('count', { count: 'exact', head: true });

    if (mediaError) {
        console.error('property_multimedia Error:', mediaError);
    } else {
        console.log('property_multimedia table exists and is accessible.');
    }
}

runDebug().catch(console.error);
