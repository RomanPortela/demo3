-- Database Migration: Properties Module

-- 1. Create Properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    -- General
    property_type TEXT NOT NULL, -- Casa, Departamento, etc.
    operation_type TEXT NOT NULL, -- Venta, Alquiler
    internal_status TEXT NOT NULL DEFAULT 'Disponible', -- Disponible, Reservada, Negociación, Vendida, Alquilada, Inactiva
    internal_visibility TEXT NOT NULL DEFAULT 'Activa para ventas', -- Activa, Oculta
    
    -- Location (Structured)
    country TEXT DEFAULT 'Argentina',
    city TEXT,
    zone TEXT, -- Zona / Barrio (Normalized)
    address TEXT, -- Exact address
    floor_unit TEXT, -- Floor/Unit
    
    -- Features (Advanced)
    bedrooms INT DEFAULT 0,
    environments INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    parkings INT DEFAULT 0,
    m2_built DECIMAL(10,2) DEFAULT 0,
    m2_total DECIMAL(10,2) DEFAULT 0,
    age INT, -- Antigüedad
    orientation TEXT,
    pets_allowed BOOLEAN DEFAULT true,
    furnished_status TEXT DEFAULT 'Sin muebles', -- Amoblado, Semi, Sin muebles
    heating_ac_type TEXT,
    amenities TEXT[] DEFAULT '{}',
    expenses DECIMAL(15,2) DEFAULT 0, -- Expensas
    
    -- Price
    price DECIMAL(15,2) DEFAULT 0,
    min_price_acceptable DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    relevant_taxes TEXT,
    
    -- Internal Info
    internal_description TEXT, -- Description for agent only
    private_notes TEXT,
    agent_observations TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Property Multimedia table
CREATE TABLE IF NOT EXISTS property_multimedia (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image', -- image, video, plan, tour
    is_cover BOOLEAN DEFAULT false,
    position INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Lead-Property Join Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS lead_properties (
    lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    relation_type TEXT DEFAULT 'interesado', -- propietario, interesado, visitado
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (lead_id, property_id, relation_type)
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_properties ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Public read for authenticated, write for authenticated)
CREATE POLICY "Allow authenticated full access to properties" ON properties 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to property_multimedia" ON property_multimedia 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to lead_properties" ON lead_properties 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
