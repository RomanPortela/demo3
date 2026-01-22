import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log('Incoming WhatsApp webhook:', JSON.stringify(body, null, 2));

        // Check if it's a message from WhatsApp Cloud API
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (message) {
                const textBody = message.text?.body;
                const from = message.from; // Phone number
                const name = value.contacts?.[0]?.profile?.name || from;

                if (textBody && from) {
                    // 1. Ensure Chat exists or create it
                    const { data: chat } = await supabase
                        .from('whatsapp_chats')
                        .select('id, unread_count')
                        .eq('contact_phone', from)
                        .single();

                    let chatId = chat?.id;

                    if (!chatId) {
                        const { data: newChat, error: chatError } = await supabase
                            .from('whatsapp_chats')
                            .insert([{
                                contact_phone: from,
                                contact_name: name,
                                status: 'Abierto',
                                unread_count: 1,
                                last_message_at: new Date().toISOString()
                            }])
                            .select()
                            .single();

                        if (chatError) throw chatError;
                        chatId = newChat.id;
                    } else {
                        // Update last_message_at and increment unread
                        await supabase
                            .from('whatsapp_chats')
                            .update({
                                last_message_at: new Date().toISOString(),
                                unread_count: (chat?.unread_count || 0) + 1 // Ideally atomic increment
                            })
                            .eq('id', chatId);
                    }

                    // 2. Save Message
                    const { error: msgError } = await supabase
                        .from('whatsapp_messages')
                        .insert([{
                            chat_id: chatId,
                            content: textBody,
                            sender: from, // 'agent' for us, or phone for them
                            created_at: new Date().toISOString()
                        }]);

                    if (msgError) console.error('Error saving message:', msgError);
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Verification logic for Meta Webhook setup
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('Webhook verified!');
        // Meta expects the challenge to be returned as plain text
        return new Response(challenge, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    // Return 403 if token doesn't match
    if (mode && token) {
        return new Response('Forbidden', { status: 403 });
    }

    return new Response('Bad Request', { status: 400 });
}
