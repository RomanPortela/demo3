import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const portal = searchParams.get('portal');
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/portals/mercadolibre/auth/callback`;

    if (portal !== 'mercadolibre') {
        return NextResponse.json({ error: 'Invalid portal' }, { status: 400 });
    }

    const clientId = process.env.MERCADO_LIBRE_APP_ID;

    if (!clientId) {
        console.error('MERCADO_LIBRE_APP_ID is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Mercado Libre Argentina Auth URL
    const authUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return NextResponse.json({ url: authUrl });
}
