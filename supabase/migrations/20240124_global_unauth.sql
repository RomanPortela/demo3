-- Global Auth Bypass for CRM (Dev Mode)
-- Disable Row Level Security on all primary tables to allow access with hardcoded user_id '1'

ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tracking_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tracking_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tracking_funnel_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portal_credentials DISABLE ROW LEVEL SECURITY;

-- If tables use UUID for foreign keys but we want to use '1' (text), 
-- we would need to change column types. 
-- However, for simple selects/inserts without session, disabling RLS is the first step.
