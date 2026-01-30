import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function refreshMeLiToken(userId: string) {
    // 1. Get current credentials
    const { data: creds, error } = await supabaseAdmin
        .from('portal_credentials')
        .select('*')
        .eq('user_id', userId)
        .eq('portal_name', 'mercadolibre')
        .single();

    if (error || !creds || !creds.auth_data?.refresh_token) {
        throw new Error('No credentials found for Mercado Libre');
    }

    const refreshToken = creds.auth_data.refresh_token;
    const clientId = process.env.MERCADO_LIBRE_APP_ID;
    const clientSecret = process.env.MERCADO_LIBRE_CLIENT_SECRET;

    // 2. Refresh with MeLi API
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId!,
            client_secret: clientSecret!,
            refresh_token: refreshToken
        })
    });

    const newData = await response.json();

    if (!response.ok) {
        console.error('Token Refresh Failed:', newData);
        throw new Error('Failed to refresh Mercado Libre token');
    }

    // 3. Update DB
    await supabaseAdmin
        .from('portal_credentials')
        .update({
            auth_data: {
                ...creds.auth_data,
                ...newData,
                updated_at: new Date().toISOString()
            }
        })
        .eq('id', creds.id);

    return newData.access_token;
}

export async function getMeLiToken(userId: string) {
    const { data: creds, error } = await supabaseAdmin
        .from('portal_credentials')
        .select('*')
        .eq('user_id', userId)
        .eq('portal_name', 'mercadolibre')
        .single();

    if (error || !creds) return null;

    // Check expiration (naive check, assuming expires_in is seconds)
    // If we want to be safe, we can always refresh or check a stored 'expires_at'
    // For now, let's just attempt refresh if it looks old or just rely on try/catch in main flow.
    // Better strategy: Return current, if API call fails with 401, trigger refresh.
    // Or proactive refresh if we store expiration time.

    // Simplest robust usage for this MVP: Always refresh if > 5 hours old? 
    // Let's implement a "ensureValidToken" that refreshes if needed.
    // For now, returning existing. The caller should handle 401 and retry with refresh.

    return creds.auth_data?.access_token;
}
