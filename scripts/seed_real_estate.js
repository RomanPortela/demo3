const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables desde .env.local manualmente
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY; // Usamos service role para bypass RLS

if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan variables de Supabase en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('--- Iniciando Seeding de Datos para Inmobiliaria ---');

    // 1. Obtener un agente (profile) para asignar tareas y leads
    const { data: profiles } = await supabase.from('profiles').select('user_id').limit(1);
    const agentId = profiles?.[0]?.user_id || null;

    if (!agentId) {
        console.log('Aviso: No se encontró ningún perfil de usuario. Algunos campos de asignación quedarán vacíos.');
    }

    // 2. Propiedades
    console.log('Cargando propiedades...');
    const properties = [
        {
            property_type: 'Departamento',
            operation_type: 'Venta',
            internal_status: 'Disponible',
            city: 'Buenos Aires',
            zone: 'Palermo Soho',
            address: 'Thames 1800',
            floor_unit: '4º B',
            bedrooms: 2,
            environments: 3,
            bathrooms: 1,
            m2_total: 65,
            price: 185000,
            currency: 'USD',
            amenities: ['Piscina', 'SUM', 'Seguridad 24hs'],
            internal_description: 'Excelente semipiso en el corazón de Soho.'
        },
        {
            property_type: 'Departamento',
            operation_type: 'Venta',
            internal_status: 'Disponible',
            city: 'Buenos Aires',
            zone: 'Recoleta',
            address: 'Av. Alvear 1900',
            floor_unit: '10º A',
            bedrooms: 3,
            environments: 4,
            bathrooms: 2,
            m2_total: 120,
            price: 450000,
            currency: 'USD',
            amenities: ['Balcón corrido', 'Dependencia'],
            internal_description: 'Estilo francés, impecable estado.'
        },
        {
            property_type: 'Casa',
            operation_type: 'Venta',
            internal_status: 'Disponible',
            city: 'Buenos Aires',
            zone: 'Belgrano R',
            address: 'Melián 2100',
            bedrooms: 4,
            environments: 6,
            bathrooms: 3,
            m2_total: 350,
            price: 890000,
            currency: 'USD',
            amenities: ['Jardín', 'Parrilla', 'Garaje'],
            internal_description: 'Casa señorial sobre lote propio.'
        },
        {
            property_type: 'PH',
            operation_type: 'Alquiler',
            internal_status: 'Disponible',
            city: 'Buenos Aires',
            zone: 'San Telmo',
            address: 'Defensa 800',
            bedrooms: 1,
            environments: 2,
            bathrooms: 1,
            m2_total: 55,
            price: 650000,
            currency: 'ARS',
            amenities: ['Sin expensas', 'Terraza propia'],
            internal_description: 'Reciclado a nuevo, techos altos.'
        }
    ];

    const { data: insertedProps, error: propError } = await supabase.from('properties').insert(properties).select();
    if (propError) console.error('Error cargando propiedades:', propError);
    else console.log(`${insertedProps.length} propiedades cargadas.`);

    // 3. Leads (Prospectos y Propietarios)
    console.log('Cargando leads...');
    const leads = [
        {
            lead_type: 'prospecto',
            full_name: 'Juan Pérez',
            owner_phone: '1145678901',
            property_type: 'Departamento',
            status: 'Pendientes de Contactar',
            source: 'Zonaprop',
            location: 'Palermo',
            assigned_agent_id: agentId,
            interest_zones: ['Palermo', 'Belgrano'],
            max_budget: 200000,
            notes: 'Busca 3 ambientes con balcón.'
        },
        {
            lead_type: 'prospecto',
            full_name: 'María García',
            owner_phone: '1198765432',
            property_type: 'Casa',
            status: 'En Proceso',
            source: 'Instagram',
            location: 'Nordelta',
            assigned_agent_id: agentId,
            max_budget: 500000,
            notes: 'Interesada en casas en barrios cerrados.'
        },
        {
            lead_type: 'propietario',
            full_name: 'Roberto Sánchez',
            owner_phone: '1122334455',
            property_type: 'Departamento',
            status: 'Tasación Pendiente',
            source: 'Referido',
            address: 'Corrientes 2500',
            expected_price: 150000,
            notes: 'Quiere vender para mudarse al interior.'
        }
    ];

    const { data: insertedLeads, error: leadError } = await supabase.from('leads').insert(leads).select();
    if (leadError) console.error('Error cargando leads:', leadError);
    else console.log(`${insertedLeads.length} leads cargados.`);

    // 4. Clientes
    console.log('Cargando clientes...');
    const clients = [
        {
            property_type: 'Departamento',
            owner_first_name: 'Elena',
            owner_last_name: 'Rodríguez',
            owner_phone: '1133445566',
            property_status: 'in_progress',
            notes: 'Cliente fiel con varias propiedades.'
        },
        {
            property_type: 'Local',
            owner_first_name: 'Carlos',
            owner_last_name: 'López',
            owner_phone: '1166778899',
            property_status: 'sold',
            notes: 'Local vendido en Octubre 2023.'
        }
    ];

    const { data: insertedClients, error: clientError } = await supabase.from('clients').insert(clients).select();
    if (clientError) console.error('Error cargando clientes:', clientError);
    else console.log(`${insertedClients.length} clientes cargados.`);

    // 5. Tareas
    console.log('Cargando tareas...');
    const tasks = [
        {
            title: 'Llamar a Juan Pérez por Thames 1800',
            importance: 'alta',
            status: 'pendiente',
            due_date: new Date().toISOString().split('T')[0],
            assigned_to: agentId,
            notes: 'Confirmar si necesita crédito hipotecario.'
        },
        {
            title: 'Coordinar tasación Melián',
            importance: 'media',
            status: 'en_progreso',
            due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            assigned_to: agentId
        }
    ];

    const { data: insertedTasks, error: taskError } = await supabase.from('tasks').insert(tasks).select();
    if (taskError) console.error('Error cargando tareas:', taskError);
    else console.log(`${insertedTasks.length} tareas cargadas.`);

    // 6. Tracking (Datos históricos para gráficas)
    console.log('Cargando tracking diario...');
    const { data: definitions } = await supabase.from('tracking_definitions').select('id, name');

    if (definitions && definitions.length > 0 && agentId) {
        const trackingData = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            definitions.forEach(def => {
                trackingData.push({
                    agent_id: agentId,
                    date: dateStr,
                    definition_id: def.id,
                    count: Math.floor(Math.random() * 10)
                });
            });
        }

        const { error: trackError } = await supabase.from('tracking_daily').upsert(trackingData);
        if (trackError) console.error('Error cargando tracking:', trackError);
        else console.log('Datos de tracking generados para los últimos 7 días.');
    }

    console.log('--- Seeding Finalizado ---');
}

seed();
