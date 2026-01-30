-- Add situational fields to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS is_hurried TEXT DEFAULT 'No sabe',
ADD COLUMN IF NOT EXISTS legal_problem TEXT DEFAULT 'Ninguno',
ADD COLUMN IF NOT EXISTS legal_problem_other TEXT,
ADD COLUMN IF NOT EXISTS has_other_agency TEXT DEFAULT 'No sabe',
ADD COLUMN IF NOT EXISTS is_price_out_of_market BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.leads.is_hurried IS '¿Está apurado? (Sí, No, No sabe)';
COMMENT ON COLUMN public.leads.legal_problem IS '¿Tiene problema legal? (Ninguno, Herencia, Divorcio, Sucesión, Otro)';
COMMENT ON COLUMN public.leads.has_other_agency IS '¿Tiene otra inmobiliaria? (Sí, No, No sabe)';
COMMENT ON COLUMN public.leads.is_price_out_of_market IS '¿Precio fuera de mercado?';
