-- Rentals Schema Migration
-- Focus: Financial control and monthly cash flow

-- 1. Rental Contracts
CREATE TABLE IF NOT EXISTS public.rental_contracts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
    owner_id BIGINT REFERENCES public.leads(id), 
    tenant_id BIGINT REFERENCES public.leads(id), 
    agent_id UUID REFERENCES public.profiles(user_id),
    status TEXT CHECK (status IN ('activo', 'finalizado', 'rescindido', 'en_mora')) DEFAULT 'activo',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_months INTEGER,
    adjustment_type TEXT CHECK (adjustment_type IN ('fijo', 'ipc', 'icl', 'otro')) DEFAULT 'ipc',
    adjustment_frequency TEXT CHECK (adjustment_frequency IN ('mensual', 'trimestral', 'cuatrimestral', 'semestral', 'anual')) DEFAULT 'semestral',
    base_amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'ARS',
    agency_commission_percentage DECIMAL(5,2) DEFAULT 5.00,
    agent_commission_percentage DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rental Payments (Cronograma)
CREATE TABLE IF NOT EXISTS public.rental_payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_id BIGINT REFERENCES public.rental_contracts(id) ON DELETE CASCADE,
    period DATE NOT NULL, 
    due_date DATE NOT NULL,
    amount_rent DECIMAL(15,2) NOT NULL,
    amount_late_fees DECIMAL(15,2) DEFAULT 0,
    status TEXT CHECK (status IN ('pendiente', 'parcial', 'cobrado', 'atrasado')) DEFAULT 'pendiente',
    amount_collected DECIMAL(15,2) DEFAULT 0,
    collected_at TIMESTAMPTZ,
    payment_method TEXT,
    notes TEXT,
    
    -- Financial breakdown
    agency_commission_amount DECIMAL(15,2),
    agent_commission_amount DECIMAL(15,2),
    owner_net_amount DECIMAL(15,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_payments ENABLE ROW LEVEL SECURITY;

-- Basic Policies (keeping it simple for demo/admin access)
CREATE POLICY "Allow all access to rental_contracts" ON public.rental_contracts FOR ALL USING (true);
CREATE POLICY "Allow all access to rental_payments" ON public.rental_payments FOR ALL USING (true);

-- Functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rental_contracts_updated_at
BEFORE UPDATE ON public.rental_contracts
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_rental_payments_updated_at
BEFORE UPDATE ON public.rental_payments
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Note: In a real scenario, we might want a DB trigger to auto-adjust total_to_collect
-- but for now we'll handle it in the app logic for flexibility.
