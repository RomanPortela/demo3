import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, payload, session } = body;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        Logger.info(`WAHA Webhook [${event}] received`, { session, event });

        if (event === 'message') {
            const isFromMe = payload.fromMe;
            const chatId = payload.chatId || (isFromMe ? payload.to : payload.from);
            const bodyText = payload.body;
            const phone = chatId.split('@')[0];
            const contactName = payload.verifiedName || payload.pushname;

            Logger.info(`Processing message for chat ${phone}`, { isFromMe, bodyText });

            if (bodyText) {
                // 1. Find or create conversation
                let { data: conv, error: convError } = await supabase
                    .from('whatsapp_conversations')
                    .select('*')
                    .eq('phone_number', phone)
                    .single();

                if (!conv) {
                    // Try to link to a lead
                    const { data: lead } = await supabase
                        .from('leads')
                        .select('id')
                        .or(`owner_phone.ilike.%${phone}%,property_phone.ilike.%${phone}%`)
                        .limit(1)
                        .single();

                    Logger.info(`Creating new conversation for ${phone}`, { leadId: lead?.id });

                    const { data: newConv, error: createError } = await supabase
                        .from('whatsapp_conversations')
                        .insert({
                            phone_number: phone,
                            lead_id: lead?.id || null,
                            last_message_at: new Date().toISOString(),
                            last_message_content: bodyText,
                            contact_name: contactName,
                            unread_count: isFromMe ? 0 : 1
                        })
                        .select()
                        .single();

                    if (createError) {
                        Logger.error(`Error creating conversation for ${phone}:`, { error: createError });
                        throw createError;
                    }
                    conv = newConv;
                } else {
                    // Update conversation
                    const updates: any = {
                        last_message_at: new Date().toISOString(),
                        last_message_content: bodyText,
                        updated_at: new Date().toISOString()
                    };

                    if (contactName) updates.contact_name = contactName;
                    if (!isFromMe) {
                        updates.unread_count = (conv.unread_count || 0) + 1;
                    } else {
                        updates.unread_count = 0; // Reset if I reply
                    }

                    await supabase
                        .from('whatsapp_conversations')
                        .update(updates)
                        .eq('id', conv.id);
                }

                // 2. Save message (incoming or outgoing from me)
                // WAHA timestamp is usually in seconds
                const ts = payload.timestamp ? new Date(payload.timestamp * 1000).toISOString() : new Date().toISOString();

                const { error: msgError } = await supabase
                    .from('whatsapp_messages')
                    .insert({
                        conversation_id: conv.id,
                        direction: isFromMe ? 'outgoing' : 'incoming',
                        content: bodyText,
                        message_type: 'text',
                        waha_message_id: payload.id,
                        timestamp: ts
                    });

                if (msgError) {
                    if (msgError.code === '23505') {
                        Logger.info(`Duplicate message ${payload.id} ignored`);
                    } else {
                        Logger.error('Error saving message to DB:', { error: msgError });
                    }
                } else {
                    Logger.info(`Message for ${phone} (${isFromMe ? 'outgoing' : 'incoming'}) saved successfully`);
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        Logger.error('Webhook Error:', { error: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
