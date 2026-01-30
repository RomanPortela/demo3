
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for guaranteed access
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HARDCODED_USER_ID = '1';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error: `Mercado Libre Auth Error: ${error}` }, { status: 400 });
    }

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        const clientId = process.env.MERCADO_LIBRE_APP_ID;
        const clientSecret = process.env.MERCADO_LIBRE_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/portals/mercadolibre/auth/callback`;

        if (!clientId || !clientSecret) {
            throw new Error('Missing server configuration for Mercado Libre');
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUri
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('MeLi Token Error:', tokenData);
            throw new Error(tokenData.message || tokenData.error || 'Failed to exchange token');
        }

        // Save to database
        const { error: dbError } = await supabaseAdmin
            .from('portal_credentials')
            .upsert({
                user_id: HARDCODED_USER_ID,
                portal_name: 'mercadolibre',
                username: `MeLi User ${tokenData.user_id}`, // We can fetch real username later if needed
                password: '(oauth)', // Placeholder
                is_active: true,
                auth_data: tokenData
            }, {
                onConflict: 'user_id, portal_name'
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            throw new Error('Failed to save credentials to database');
        }

        // Redirect back to settings page with success
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=mercadolibre`);

    } catch (err: any) {
        console.error('Callback Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
