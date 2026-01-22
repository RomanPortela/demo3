import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { waha } from '@/lib/whatsapp/waha';
import { Logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        Logger.info('Starting manual chat synchronization');

        // Determine base URL for webhook
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host') || 'localhost:3000';
        const webhookUrl = `${protocol}://${host}/api/whatsapp/webhook`;

        // Attempt to register webhook with WAHA
        try {
            await waha.setupWebhooks(webhookUrl);
        } catch (e) {
            Logger.warn('Could not auto-register webhook', { error: e });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get chats from WAHA
        const wahaChats = await waha.getChats();
        Logger.info(`Found ${wahaChats.length} chats in WAHA`);

        // Fetch all current conversations once to build a map for quick lookup
        const { data: allConversations } = await supabase
            .from('whatsapp_conversations')
            .select('id, phone_number, last_message_at');

        const convMap = new Map(allConversations?.map(c => [c.phone_number, c]) || []);

        let syncedCount = 0;
        let linkedCount = 0;
        let messagesSyncedCount = 0;

        // Create a list of promises for each chat to process in parallel
        // We'll use a smaller chunk sized approach or just parallel for all if count is reasonable
        // WAHA is usually fast enough to handle some parallel requests
        const syncPromises = wahaChats.map(async (chat: any) => {
            const chatId = typeof chat.id === 'string' ? chat.id : (chat.id?._serialized || chat.id?.id || '');
            if (!chatId) return;

            const phone = chatId.split('@')[0];
            if (!phone) return;

            const existingConv = convMap.get(phone);
            let conversationId = existingConv?.id;

            const wahaLastTs = chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp * 1000).toISOString() : null;
            const dbLastTs = existingConv?.last_message_at;

            // SKIP if NO changes and NO unread messages
            if (existingConv && wahaLastTs && dbLastTs && wahaLastTs <= dbLastTs && (chat.unreadCount || 0) === 0) {
                return;
            }

            if (!existingConv) {
                const { data: lead } = await supabase
                    .from('leads')
                    .select('id')
                    .or(`owner_phone.ilike.%${phone}%,property_phone.ilike.%${phone}%`)
                    .limit(1)
                    .single();

                const { data: newConv, error: createError } = await supabase
                    .from('whatsapp_conversations')
                    .insert({
                        phone_number: phone,
                        lead_id: lead?.id || null,
                        last_message_at: wahaLastTs || new Date().toISOString(),
                        last_message_content: chat.lastMessage?.body || null,
                        contact_name: chat.name || null,
                        unread_count: chat.unreadCount || 0,
                        avatar_url: chat.image || chat.profilePictureUrl || null
                    })
                    .select('id')
                    .single();

                if (!createError && newConv) {
                    conversationId = newConv.id;
                    syncedCount++;
                    if (lead) linkedCount++;
                } else {
                    return;
                }
            } else {
                await supabase.from('whatsapp_conversations').update({
                    last_message_content: chat.lastMessage?.body || null,
                    contact_name: chat.name || null,
                    unread_count: chat.unreadCount || 0,
                    last_message_at: wahaLastTs || existingConv.last_message_at,
                    avatar_url: chat.image || chat.profilePictureUrl || null,
                    updated_at: new Date().toISOString()
                }).eq('id', conversationId);
            }

            // Import history in parallel for the current chat
            if (conversationId) {
                const limit = existingConv ? 5 : 50; // Reduce limit for existing chats to speed up sync
                const messages = await waha.getMessages(chatId, limit);

                if (messages && Array.isArray(messages)) {
                    // Filter messages that aren't in DB yet
                    // Since we have a unique constraint on waha_message_id, we can optimize this
                    const msgPromises = messages.map(async (msg) => {
                        if (!msg.body) return;

                        const { error: msgInsertError } = await supabase
                            .from('whatsapp_messages')
                            .insert({
                                conversation_id: conversationId,
                                direction: msg.fromMe ? 'outgoing' : 'incoming',
                                content: msg.body,
                                message_type: 'text',
                                waha_message_id: msg.id,
                                timestamp: new Date((msg.timestamp || Date.now() / 1000) * 1000).toISOString()
                            });

                        if (!msgInsertError) messagesSyncedCount++;
                    });
                    await Promise.all(msgPromises.slice(0, 10)); // Process in small batches
                }
            }
        });

        await Promise.all(syncPromises);

        Logger.info(`Sync completed. New: ${syncedCount}, Linked: ${linkedCount}, Messages: ${messagesSyncedCount}`);

        return NextResponse.json({
            success: true,
            synced: syncedCount,
            linked: linkedCount,
            messagesSynced: messagesSyncedCount
        });
    } catch (error: any) {
        Logger.error('Sync Error:', { error: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
