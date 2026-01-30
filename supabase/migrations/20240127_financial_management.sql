-- Add commercial conditions to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed', 'mixed')) DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS base_commission_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_commission_fixed NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_collaboration_share NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS commercial_notes TEXT;

-- Add fee management to properties
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS fee_type TEXT CHECK (fee_type IN ('percentage', 'fixed', 'mixed')) DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS agreed_fee_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS agreed_fee_fixed NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS fee_payer TEXT CHECK (fee_payer IN ('comprador', 'vendedor', 'ambos')) DEFAULT 'vendedor',
ADD COLUMN IF NOT EXISTS fee_notes TEXT,
ADD COLUMN IF NOT EXISTS real_fee_collected NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS collection_date DATE,
ADD COLUMN IF NOT EXISTS collection_status TEXT CHECK (collection_status IN ('pendiente', 'parcial', 'cobrado')) DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS collection_notes TEXT;

-- Create property_assignments table
CREATE TABLE IF NOT EXISTS public.property_assignments (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('captador', 'vendedor', 'colaborador', 'referidor')),
    commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed', 'mixed')),
    agreed_commission_percentage NUMERIC DEFAULT 0,
    agreed_commission_fixed NUMERIC DEFAULT 0,
    commission_status TEXT CHECK (commission_status IN ('pendiente', 'parcial', 'pagada')) DEFAULT 'pendiente',
    paid_amount NUMERIC DEFAULT 0,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create financial_history table for audit trail
CREATE TABLE IF NOT EXISTS public.financial_history (
    id SERIAL PRIMARY KEY,
    related_id INTEGER NOT NULL, -- Property or Assignment ID
    entity_type TEXT CHECK (entity_type IN ('property_fee', 'agent_commission')),
    action_type TEXT CHECK (action_type IN ('UPDATE', 'COLLECTION', 'PAYMENT')),
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    changed_by UUID REFERENCES public.profiles(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for dev mode
ALTER TABLE public.property_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_history DISABLE ROW LEVEL SECURITY;

-- Helper to track changes (trigger)
CREATE OR REPLACE FUNCTION public.track_financial_changes()
RETURNS TRIGGER AS $$
DECLARE
    entity_t TEXT;
    audit_user UUID;
BEGIN
    audit_user := (SELECT auth.uid()); -- Fallback to current user if possible
    
    IF (TG_RELNAME = 'properties') THEN
        entity_t := 'property_fee';
        -- Only track if fee fields changed
        IF (OLD.real_fee_collected IS DISTINCT FROM NEW.real_fee_collected OR OLD.collection_status IS DISTINCT FROM NEW.collection_status) THEN
             INSERT INTO financial_history (related_id, entity_type, action_type, old_value, new_value, changed_by)
             VALUES (NEW.id, entity_t, 'COLLECTION', to_jsonb(OLD), to_jsonb(NEW), audit_user);
        END IF;
    ELSIF (TG_RELNAME = 'property_assignments') THEN
        entity_t := 'agent_commission';
        INSERT INTO financial_history (related_id, entity_type, action_type, old_value, new_value, changed_by)
        VALUES (NEW.id, entity_t, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), audit_user);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
