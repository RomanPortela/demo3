-- Add refinement fields to leads table
ALTER TABLE leads 
  ADD COLUMN IF NOT EXISTS budget_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS price_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_notes TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visit_date DATE,
  ADD COLUMN IF NOT EXISTS urgency_notes TEXT,
  ADD COLUMN IF NOT EXISTS rooms TEXT,
  ADD COLUMN IF NOT EXISTS environments TEXT,
  ADD COLUMN IF NOT EXISTS extra_info TEXT,
  ADD COLUMN IF NOT EXISTS legal_notes TEXT,
  ADD COLUMN IF NOT EXISTS commission_type TEXT DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS commission_percentage_expected NUMERIC,
  ADD COLUMN IF NOT EXISTS commission_percentage_min NUMERIC,
  ADD COLUMN IF NOT EXISTS commission_fixed_expected NUMERIC,
  ADD COLUMN IF NOT EXISTS commission_fixed_min NUMERIC;

-- Enable RLS (should already be enabled, but for safety)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
