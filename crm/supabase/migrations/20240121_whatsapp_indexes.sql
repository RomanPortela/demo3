-- Add indexes for performance optimization in WhatsApp module
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_last_message_at ON public.whatsapp_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation_id_timestamp ON public.whatsapp_messages(conversation_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_waha_id ON public.whatsapp_messages(waha_message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone_number ON public.whatsapp_conversations(phone_number);
