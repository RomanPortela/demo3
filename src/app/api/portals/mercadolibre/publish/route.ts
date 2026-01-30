import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMeLiToken, refreshMeLiToken } from '@/lib/portals/mercadolibre/auth';
import { mapPropertyToMeLiItem } from '@/lib/portals/mercadolibre/mapper';
import { Property } from '@/types';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HARDCODED_USER_ID = '1';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { property_id } = body;

        if (!property_id) {
            return NextResponse.json({ error: 'Missing property_id' }, { status: 400 });
        }

        // 1. Get Property Data
        const { data: property, error: propError } = await supabaseAdmin
            .from('properties')
            .select('*, multimedia:property_multimedia(*)')
            .eq('id', property_id)
            .single();

        if (propError || !property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        // 2. Get Valid Token
        let accessToken = await getMeLiToken(HARDCODED_USER_ID);
        if (!accessToken) {
            return NextResponse.json({ error: 'Mercado Libre not connected. Please connect in Settings.' }, { status: 401 });
        }

        // 3. Map Data
        const itemData = mapPropertyToMeLiItem(property as Property);

        // 4. Publish to MeLi
        let response = await fetch('https://api.mercadolibre.com/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        // Handle Token Expiration (401)
        if (response.status === 401) {
            console.log('Token expired, refreshing...');
            try {
                accessToken = await refreshMeLiToken(HARDCODED_USER_ID);
                // Retry request
                response = await fetch('https://api.mercadolibre.com/items', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(itemData)
                });
            } catch (refreshError) {
                return NextResponse.json({ error: 'Failed to refresh authentication. Please reconnect Mercado Libre.' }, { status: 401 });
            }
        }

        const result = await response.json();

        if (!response.ok) {
            console.error('MeLi Publish Error:', result);
            return NextResponse.json({
                error: 'Failed to publish to Mercado Libre',
                details: result.message || result.error,
                causes: result.cause
            }, { status: 500 });
        }

        // 5. Update Local Property with MeLi ID (optional but recommended)
        // We might want to store the MeLi ID in the property or a separate mapping table
        // For now, let's just return success

        console.log('Published successfully:', result.id);

        return NextResponse.json({
            success: true,
            meli_id: result.id,
            permalink: result.permalink
        });

    } catch (err: any) {
        console.error('Publish API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
