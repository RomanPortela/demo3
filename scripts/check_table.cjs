const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Checking tables...');

    const { error: propError } = await supabase.from('properties').select('count', { count: 'exact', head: true });
    if (propError) {
        console.log('Table "properties" error:', propError.message);
    } else {
        console.log('Table "properties" exists.');
    }

    const { error: mediaError } = await supabase.from('property_multimedia').select('count', { count: 'exact', head: true });
    if (mediaError) {
        console.log('Table "property_multimedia" error:', mediaError.message);
    } else {
        console.log('Table "property_multimedia" exists.');
    }
}

check();
