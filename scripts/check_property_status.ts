/**
 * Check property status in DB
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
    console.log('=== Checking Properties Status ===');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get latest 5 properties
    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, address, zonaprop_status, zonaprop_url, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching properties:', error);
    } else {
        console.log('Latest properties:');
        properties?.forEach(p => {
            console.log(`- ID: ${p.id} | Status: ${p.zonaprop_status} | Updated: ${p.updated_at}`);
            console.log(`  URL: ${p.zonaprop_url}\n`);
        });
    }
}

main().catch(console.error);
