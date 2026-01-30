import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for guaranteed access
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HARDCODED_USER_ID = '1';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { portal_name, username, password } = body;

        console.log('=== CREDENTIALS API: POST ===');
        console.log('Portal:', portal_name);
        console.log('Username:', username);
        console.log('Password provided:', !!password);

        if (!portal_name || !username || !password) {
            return NextResponse.json(
                { error: 'Missing required fields: portal_name, username, password' },
                { status: 400 }
            );
        }

        const payload = {
            user_id: HARDCODED_USER_ID,
            portal_name,
            username,
            password,
            is_active: true
        };

        console.log('Upserting with payload:', { ...payload, password: '(hidden)' });

        const { data, error } = await supabaseAdmin
            .from('portal_credentials')
            .upsert(payload, {
                onConflict: 'user_id, portal_name'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: error.message, code: error.code, details: error.details },
                { status: 500 }
            );
        }

        console.log('Success! Saved credential ID:', data?.id);

        return NextResponse.json({
            success: true,
            data: {
                id: data.id,
                portal_name: data.portal_name,
                username: data.username,
                is_active: data.is_active
            }
        });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const portal_name = searchParams.get('portal_name');

        console.log('=== CREDENTIALS API: GET ===');
        console.log('Portal:', portal_name);

        let query = supabaseAdmin
            .from('portal_credentials')
            .select('id, portal_name, username, is_active, created_at')
            .eq('user_id', HARDCODED_USER_ID);

        if (portal_name) {
            query = query.eq('portal_name', portal_name);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        console.log('Found', data?.length || 0, 'credentials');

        // Return single if portal_name specified, otherwise array
        if (portal_name) {
            return NextResponse.json(
                { success: true, data: data?.[0] || null },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    }
                }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Unknown error' },
            { status: 500 }
        );
    }
}


export const dynamic = 'force-dynamic';

