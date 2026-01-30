-- Add audit fields to lead_interactions
ALTER TABLE public.lead_interactions 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Create lead_interaction_audit table
CREATE TABLE IF NOT EXISTS public.lead_interaction_audit (
    id SERIAL PRIMARY KEY,
    interaction_id INTEGER REFERENCES public.lead_interactions(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('EDIT', 'DELETE', 'RESTORE')),
    old_content JSONB,
    new_content JSONB,
    reason TEXT NOT NULL,
    changed_by TEXT, -- Using text for dev compatibility (hardcoded '1' or auth.uid())
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for dev mode (matching existing pattern)
ALTER TABLE public.lead_interaction_audit DISABLE ROW LEVEL SECURITY;

-- If we want to automatically mark as edited on update (optional, but good practice)
CREATE OR REPLACE FUNCTION public.mark_interaction_as_edited()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.notes IS DISTINCT FROM NEW.notes OR 
        OLD.channel IS DISTINCT FROM NEW.channel OR 
        OLD.interaction_date IS DISTINCT FROM NEW.interaction_date OR
        OLD.property_id IS DISTINCT FROM NEW.property_id) THEN
        NEW.is_edited := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_mark_interaction_as_edited ON public.lead_interactions;
CREATE TRIGGER tr_mark_interaction_as_edited
BEFORE UPDATE ON public.lead_interactions
FOR EACH ROW
WHEN (NEW.is_deleted = false)
EXECUTE FUNCTION public.mark_interaction_as_edited();
