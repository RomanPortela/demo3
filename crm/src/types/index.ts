export type UserRole = 'ADMIN' | 'CAPTADOR' | 'AGENTE';

export interface Profile {
    user_id: string; // From Supabase Auth
    email: string;
    role: UserRole;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
}

export interface LeadColumn {
    id: number;
    name: string;
    color: string;
    position: number;
}

export interface Lead {
    id: number;
    lead_type: 'prospecto' | 'propietario';
    property_type: string;
    owner_first_name?: string;
    owner_last_name?: string;
    full_name?: string;
    property_phone?: string;
    owner_phone?: string;
    preferred_channel?: string;
    language?: string;
    current_city?: string;
    instagram?: string;
    location?: string;
    source?: string;
    entry_date?: string;
    status: string; // Refers to LeadColumn.name
    notes?: string;
    next_follow_up?: string;
    follow_up_count: number;
    objection?: string;
    assigned_agent_id?: string;
    has_control: boolean;
    avatar_url?: string;
    created_at: string;
    updated_at: string;

    // Prospecto (Demanda) fields
    use_type?: boolean;
    property_types?: string[];
    interest_zones?: string[];
    min_budget?: number;
    max_budget?: number;
    budget_currency?: string;
    payment_method?: string; // Legacy, keeping for compatibility if needed, but using payment_methods now
    payment_methods?: string[];
    payment_notes?: string;
    bedrooms?: string;
    bathrooms?: string;
    parkings?: string;
    amenities?: string[];
    credit_preapproved?: boolean;
    bank?: string;
    down_payment?: number;
    target_date?: string;
    urgency_reason?: string;
    urgency_notes?: string;
    visit_date?: string;
    interest_level?: 'Alto' | 'Medio' | 'Bajo' | 'Exploratorio';
    urgency_level?: 'Inmediata' | 'Corto plazo' | 'Mediano plazo' | 'Sin urgencia';
    financial_status?: 'Confirmada' | 'Parcial' | 'No confirmada';
    lead_status?: 'Calificado' | 'En seguimiento' | 'En negociación' | 'Frío';
    closure_probability?: number;
    sees_other_agencies?: boolean;
    follow_up_channel?: string;
    internal_note?: string;

    // Propietario (Oferta) fields
    address?: string;
    area?: string;
    m2_built?: number;
    rooms?: string;
    environments?: string;
    expected_price?: number;
    min_price_acceptable?: number;
    price_currency?: string;
    exclusivity?: boolean;
    time_to_close?: string;
    legal_free_of_charges?: boolean;
    legal_deed_available?: boolean;
    legal_mortgage_existing?: boolean;
    legal_notes?: string;
    motivation_reason?: string;
    owner_urgency_level?: string;
    commission_type?: 'percentage' | 'fixed';
    commission_percentage_expected?: number;
    commission_percentage_min?: number;
    commission_fixed_expected?: number;
    commission_fixed_min?: number;
    commission_agreed?: number;
    publish_date?: string;
    attachment_urls?: string[];
    extra_info?: string;

    // Relations
    properties?: Property[];
    property_ids?: number[];
}

export type PropertyStatus = 'Disponible' | 'Reservada' | 'En negociación' | 'Vendida' | 'Alquilada' | 'Inactiva';
export type PropertyVisibility = 'Activa para ventas' | 'Oculta';

export interface Property {
    id: number;
    property_type: string;
    operation_type: string;
    internal_status: PropertyStatus;
    internal_visibility: PropertyVisibility;

    // Location
    country?: string;
    city?: string;
    zone?: string;
    address?: string;
    floor_unit?: string;

    // Features
    bedrooms?: number;
    environments?: number;
    bathrooms?: number;
    parkings?: number;
    m2_built?: number;
    m2_total?: number;
    age?: number;
    orientation?: string;
    pets_allowed?: boolean;
    furnished_status?: string;
    heating_ac_type?: string;
    amenities?: string[];
    expenses?: number;

    // Price
    price?: number;
    min_price_acceptable?: number;
    currency?: string;
    relevant_taxes?: string;

    // Internal Info
    internal_description?: string;
    private_notes?: string;
    agent_observations?: string;

    // Multimedia
    multimedia?: PropertyMultimedia[];

    created_at: string;
    updated_at: string;
}

export interface PropertyMultimedia {
    id: number;
    property_id: number;
    url: string;
    type: 'image' | 'video' | 'plan' | 'tour';
    is_cover: boolean;
    position: number;
    created_at: string;
}

export interface LeadProperty {
    lead_id: number;
    property_id: number;
    relation_type: 'propietario' | 'interesado' | 'visitado';
    created_at: string;
}

export interface Visit {
    id: number;
    lead_id: number;
    property_id: number;
    scheduled_at: string;
    notes?: string;
    status: 'scheduled' | 'cancelled' | 'completed';
    created_at: string;
    // Expanded data
    lead?: Lead;
    property?: Property;
}

export interface Client {
    id: number;
    property_type: string;
    owner_first_name?: string;
    owner_last_name?: string;
    property_phone?: string;
    owner_phone?: string;
    email?: string;
    instagram?: string;
    property_status: 'in_progress' | 'sold' | 'rented' | 'cancelled';
    monthly_rent?: number;
    contract_due_day?: number;
    next_contract_date?: string;
    notes?: string;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    assigned_to?: string;
    due_date?: string;
    importance: 'baja' | 'media' | 'alta';
    status: 'pendiente' | 'en_progreso' | 'completada';
    notes?: string;
    position: number;
    subtasks?: Subtask[];
    created_at: string;
}

export interface Subtask {
    id: number;
    task_id: number;
    title: string;
    completed: boolean;
    position: number;
}

export interface Opportunity {
    id: number;
    client_name: string;
    phone?: string;
    ai_advice?: string;
    ai_message?: string;
    status: 'abierta' | 'ejecutada' | 'cerrada';
    notes?: string;
    assigned_to?: string;
    created_at: string;
}

export interface WhatsAppChat {
    id: number;
    contact_phone: string;
    contact_name?: string;
    labels: string[];
    status: 'Abierto' | 'En Espera' | 'Resuelto' | 'Archivado';
    unread_count: number;
    notes?: string;
    assigned_to?: string;
    last_message_at?: string;
    created_at: string;
}

export interface WhatsAppMessage {
    id: number;
    chat_id: number;
    content: string;
    sender: string;
    attachment_url?: string;
    created_at: string;
}

export interface TrackingDefinition {
    id: number;
    name: string;
    position: number;
}

export interface TrackingDaily {
    id: number;
    agent_id: string;
    date: string;
    definition_id: number;
    count: number;
    updated_at: string;
}

export interface TrackingFunnelSnapshot {
    id: number;
    agent_id: string;
    date: string;
    step_from_id: number;
    step_to_id: number;
    percentage: number;
    count_from: number;
    count_to: number;
    created_at: string;
}

export interface ContentItem {
    id: number;
    title: string;
    description?: string;
    content_type: 'post' | 'email' | 'campaign';
    status: 'draft' | 'published' | 'scheduled';
    scheduled_at?: string;
    created_at: string;
}

// WhatsApp Integration (WAHA)
export interface WhatsAppSession {
    id: number;
    session_id: string;
    phone_number?: string;
    status: 'connected' | 'disconnected' | 'pairing';
    created_at: string;
    updated_at: string;
}

export interface WhatsAppConversation {
    id: number;
    phone_number: string;
    lead_id?: number;
    last_message_at: string;
    created_at: string;
    updated_at: string;
    // Relations
    lead?: Lead;
    messages?: WhatsAppMessage[];
    // Extended properties
    contact_name?: string;
    unread_count?: number;
    last_message_content?: string;
    tags?: Tag[];
    avatar_url?: string;
}

export interface Tag {
    id: number;
    name: string;
    color: string;
}

export interface WhatsAppMessage {
    id: number;
    conversation_id: number;
    direction: 'incoming' | 'outgoing';
    message_type: 'text' | 'image' | 'file' | 'video';
    content: string;
    timestamp: string;
    waha_message_id?: string;
    status?: 'sent' | 'delivered' | 'read';
}
