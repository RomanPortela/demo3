import { NextResponse } from 'next/server';
import { waha } from '@/lib/whatsapp/waha';
import { createClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const { chatId, content, conversationId } = await req.json();

        if (!chatId || !content) {
            Logger.warn('Send message failed: Missing chatId or content');
            return NextResponse.json({ error: 'Missing chatId or content' }, { status: 400 });
        }

        // 1. Send via WAHA
        const cleanPhone = chatId.replace(/\D/g, '');
        Logger.info(`Attempting to send message to ${cleanPhone}`, { conversationId });
        const result = await waha.sendMessage(cleanPhone, content);

        // 2. Persist in DB
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        if (conversationId) {
            const { error: msgError } = await supabase.from('whatsapp_messages').insert({
                conversation_id: conversationId,
                direction: 'outgoing',
                content: content,
                message_type: 'text',
                waha_message_id: result.id,
                timestamp: new Date().toISOString()
            });

            if (msgError) {
                Logger.error(`Error saving outgoing message to DB:`, { error: msgError });
            }

            await supabase.from('whatsapp_conversations').update({
                last_message_at: new Date().toISOString(),
                last_message_content: content,
                updated_at: new Date().toISOString()
            }).eq('id', conversationId);
        }

        Logger.info(`Message sent and saved successfully to ${cleanPhone}`);
        return NextResponse.json(result);
    } catch (error: any) {
        Logger.error('WAHA Send Error:', { error: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
