import { createClient } from "@/lib/supabase/client";

export const CALENDAR_scope = 'https://www.googleapis.com/auth/calendar';

export async function signInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            scopes: CALENDAR_scope,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
            redirectTo: `${window.location.origin}/calendar`,
        },
    });

    if (error) throw error;
    return data;
}

export async function getGoogleToken() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token;
}

export async function listEvents(accessToken: string) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
}

export async function createEvent(accessToken: string, event: any) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
}

export async function deleteEvent(accessToken: string, eventId: string) {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return true; // 204 No Content
}
