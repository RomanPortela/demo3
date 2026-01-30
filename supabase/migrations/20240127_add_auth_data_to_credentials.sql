-- Add auth_data column to portal_credentials for storing OAuth tokens
ALTER TABLE public.portal_credentials 
ADD COLUMN IF NOT EXISTS auth_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.portal_credentials.auth_data IS 'Stores OAuth tokens (access_token, refresh_token) and other provider-specific auth metadata';
