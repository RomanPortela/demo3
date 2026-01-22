-- DANGER: DROP TABLES TO ENSURE CLEAN SCHEMA (Fixes constraints)
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_chats CASCADE;
DROP TABLE IF EXISTS tracking_funnel_snapshots CASCADE;
DROP TABLE IF EXISTS tracking_daily CASCADE;
DROP TABLE IF EXISTS tracking_definitions CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS lead_columns CASCADE;
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- TABLA DE PERFILES (Usuarios)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'AGENTE', -- ADMIN, CAPTADOR, AGENTE
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE COLUMNAS PARA EL KANBAN DE LEADS
CREATE TABLE lead_columns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT 'slate-500',
  position INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSERTAR COLUMNAS POR DEFECTO
INSERT INTO lead_columns (name, color, position) VALUES
  ('Pendientes de Contactar', 'slate-500', 1),
  ('Esperando Respuesta', 'indigo-500', 2),
  ('En Proceso', 'pink-500', 3),
  ('Visita Agendada', 'rose-500', 4),
  ('Tomar Acción', 'orange-500', 5),
  ('Tasación Pendiente', 'amber-500', 6),
  ('Tasado', 'yellow-500', 7),
  ('Venta', 'green-500', 8),
  ('Congelado', 'gray-500', 9)
ON CONFLICT (name) DO NOTHING;

-- TABLA DE LEADS
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  lead_type TEXT DEFAULT 'prospecto', -- prospecto, propietario
  property_type TEXT NOT NULL,
  owner_first_name TEXT,
  owner_last_name TEXT,
  full_name TEXT,
  property_phone TEXT,
  owner_phone TEXT,
  preferred_channel TEXT,
  language TEXT,
  current_city TEXT,
  instagram TEXT,
  location TEXT,
  source TEXT,
  campaign TEXT,
  origin_property TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Pendientes de Contactar' REFERENCES lead_columns(name),
  notes TEXT,
  next_follow_up DATE,
  follow_up_count INT DEFAULT 0,
  objection TEXT,
  assigned_agent_id UUID REFERENCES profiles(user_id),
  has_control BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prospecto (Demanda)
  use_type TEXT,
  property_types TEXT[],
  interest_zones TEXT[],
  min_budget DECIMAL(15,2),
  max_budget DECIMAL(15,2),
  bedrooms TEXT,
  bathrooms TEXT,
  parkings TEXT,
  amenities TEXT[],
  payment_method TEXT,
  credit_preapproved BOOLEAN DEFAULT false,
  bank TEXT,
  down_payment DECIMAL(15,2),
  urgency_level TEXT,
  target_date DATE,
  urgency_reason TEXT,
  interest_level INT,
  closure_probability INT,
  sees_other_agencies BOOLEAN DEFAULT false,
  follow_up_channel TEXT,
  internal_note TEXT,

  -- Propietario (Oferta)
  address TEXT,
  area TEXT,
  m2_built DECIMAL(10,2),
  expected_price DECIMAL(15,2),
  min_price_acceptable DECIMAL(15,2),
  exclusivity BOOLEAN DEFAULT false,
  time_to_close TEXT,
  legal_free_of_charges BOOLEAN DEFAULT false,
  legal_deed_available BOOLEAN DEFAULT false,
  legal_mortgage_existing BOOLEAN DEFAULT false,
  motivation_reason TEXT,
  owner_urgency_level TEXT,
  commission_agreed DECIMAL(5,2),
  publish_date DATE,
  attachment_urls TEXT[]
);

-- TABLA DE CLIENTES
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  property_type TEXT NOT NULL,
  owner_first_name TEXT,
  owner_last_name TEXT,
  property_phone TEXT,
  owner_phone TEXT,
  email TEXT,
  instagram TEXT,
  property_status TEXT DEFAULT 'in_progress', -- in_progress, sold, rented, cancelled
  monthly_rent DECIMAL(10,2),
  contract_due_day INT CHECK (contract_due_day >= 1 AND contract_due_day <= 31),
  next_contract_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE TAREAS
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(user_id),
  due_date DATE,
  importance TEXT DEFAULT 'media', -- baja, media, alta
  status TEXT DEFAULT 'pendiente', -- pendiente, en_progreso, completada
  notes TEXT,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE SUBTAREAS
CREATE TABLE subtasks (
  id SERIAL PRIMARY KEY,
  task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  position INT DEFAULT 0
);

-- TABLA DE OPORTUNIDADES
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT,
  ai_advice TEXT,
  ai_message TEXT,
  status TEXT DEFAULT 'abierta', -- abierta, ejecutada, cerrada
  notes TEXT,
  assigned_to UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE WHATSAPP CHATS
CREATE TABLE whatsapp_chats (
  id SERIAL PRIMARY KEY,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  labels TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Abierto', -- Abierto, En Espera, Resuelto, Archivado
  unread_count INT DEFAULT 0,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(user_id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE WHATSAPP MESSAGES
CREATE TABLE whatsapp_messages (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'agent' or phone number
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE DEFINICIONES DE TRACKING (Pasos del embudo)
CREATE TABLE tracking_definitions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  position INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INICIALIZAR DEFINICIONES
INSERT INTO tracking_definitions (name, position) VALUES
  ('Contacto', 1),
  ('Propiedad Tasada', 2),
  ('FUP Propiedad', 3),
  ('Propuesta de Visita', 4),
  ('FUP Propuesta', 5),
  ('Visita Agendada', 6),
  ('Visita Realizada', 7),
  ('FUP Post-Visita', 8),
  ('Venta', 9),
  ('Alquiler', 10)
ON CONFLICT (name) DO NOTHING;

-- TABLA DE LOGS DIARIOS DE TRACKING
CREATE TABLE tracking_daily (
  id SERIAL PRIMARY KEY,
  agent_id UUID REFERENCES profiles(user_id),
  date DATE DEFAULT CURRENT_DATE,
  definition_id INT REFERENCES tracking_definitions(id),
  count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, date, definition_id)
);

-- TABLA DE SNAPSHOTS DEL EMBUDO (METRICAS GUARDADAS)
CREATE TABLE tracking_funnel_snapshots (
  id SERIAL PRIMARY KEY,
  agent_id UUID REFERENCES profiles(user_id),
  date DATE DEFAULT CURRENT_DATE,
  step_from_id INT REFERENCES tracking_definitions(id),
  step_to_id INT REFERENCES tracking_definitions(id),
  percentage DECIMAL(5,2),
  count_from INT,
  count_to INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE CONTENIDO
CREATE TABLE content_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT, -- post, email, campaign
  status TEXT DEFAULT 'draft', -- draft, published, scheduled
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
