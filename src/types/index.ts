export type UserRole = 'ADMIN' | 'CAPTADOR' | 'AGENTE';

export interface Profile {
    user_id: string; // From Supabase Auth
    email: string;
    role: UserRole;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    // Commercial Conditions
    commission_type?: 'percentage' | 'fixed' | 'mixed';
    base_commission_percentage?: number;
    base_commission_fixed?: number;
    base_collaboration_share?: number;
    commercial_notes?: string;
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

    // Situational Fields
    is_hurried?: 'Sí' | 'No' | 'No sabe';
    legal_problem?: 'Ninguno' | 'Herencia' | 'Divorcio' | 'Sucesión' | 'Otro';
    legal_problem_other?: string;
    has_other_agency?: 'Sí' | 'No' | 'No sabe';
    is_price_out_of_market?: boolean;

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

    // Portal Info
    zonaprop_status?: 'idle' | 'published' | 'error';
    zonaprop_url?: string;

    // Multimedia
    multimedia?: PropertyMultimedia[];

    created_at: string;
    updated_at: string;

    // Fees and Commissions
    fee_type?: 'percentage' | 'fixed' | 'mixed';
    agreed_fee_percentage?: number;
    agreed_fee_fixed?: number;
    fee_payer?: 'comprador' | 'vendedor' | 'ambos';
    fee_notes?: string;
    real_fee_collected?: number;
    collection_date?: string;
    collection_status?: 'pendiente' | 'parcial' | 'cobrado';
    collection_notes?: string;
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

export interface PropertyAssignment {
    id: number;
    property_id: number;
    agent_id: string; // user_id (UUID)
    role: 'captador' | 'vendedor' | 'colaborador' | 'referidor';
    commission_type?: 'percentage' | 'fixed' | 'mixed';
    agreed_commission_percentage?: number;
    agreed_commission_fixed?: number;
    commission_status?: 'pendiente' | 'parcial' | 'pagada';
    paid_amount?: number;
    observations?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    agent?: Profile;
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
    customer_status?: 'Activo' | 'Dormido' | 'Ex cliente' | 'Inversor';
    // Enhanced Client Fields
    is_vip?: boolean;
    transactions_count?: number;
    last_transaction_date?: string;

    // Budget & Preferences (from Lead)
    min_budget?: number;
    max_budget?: number;
    zones_interest?: string[];
    property_types_interest?: string[];
    bedrooms_needed?: string;
    description?: string;
    family_composition?: string;

    // Contact & Relations
    proposals?: ClientProposal[];

    created_at: string;
}

export interface ClientProposal {
    id: number;
    client_id: number;
    property_id?: number;
    property_address?: string; // Fallback if no ID
    status: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'En Negociación';
    type: 'Venta' | 'Alquiler';
    price: number;
    currency: string;
    notes?: string;
    sent_date: string;
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
export interface LeadInteraction {
    id: number;
    lead_id: number;
    interaction_date: string;
    channel: string;
    notes?: string;
    created_at: string;
    // New fields for linking visits
    property_id?: number;
    property?: Property;
    // Audit fields
    is_edited: boolean;
    is_deleted: boolean;
}

export interface LeadInteractionAudit {
    id: number;
    interaction_id: number;
    action_type: 'EDIT' | 'DELETE' | 'RESTORE';
    old_content: Partial<LeadInteraction> | null;
    new_content: Partial<LeadInteraction> | null;
    reason: string;
    changed_by?: string;
    created_at: string;
}

// --- Rentals Module ---

export type RentalStatus = 'activo' | 'finalizado' | 'rescindido' | 'en_mora';
export type RentalPaymentStatus = 'pendiente' | 'parcial' | 'cobrado' | 'atrasado';

export interface RentalContract {
    id: number;
    property_id: number;
    owner_id: number; // Lead with lead_type='propietario'
    tenant_id: number; // Lead with lead_type='prospecto'
    agent_id: string; // user_id
    status: RentalStatus;
    start_date: string;
    end_date: string;
    duration_months: number;
    adjustment_type: 'fijo' | 'ipc' | 'icl' | 'otro';
    adjustment_frequency: 'mensual' | 'trimestral' | 'cuatrimestral' | 'semestral' | 'anual';
    base_amount: number;
    currency: string;
    agency_commission_percentage: number;
    agent_commission_percentage: number; // Percentage of the agency_commission
    notes?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    property?: Property;
    owner?: Lead;
    tenant?: Lead;
    agent?: Profile;
}

export interface RentalPayment {
    id: number;
    contract_id: number;
    period: string; // ISO Date (usually first day of month)
    due_date: string;
    amount_rent: number;
    amount_late_fees: number;
    total_to_collect: number;
    status: RentalPaymentStatus;
    amount_collected: number;
    collected_at?: string;
    payment_method?: string;
    notes?: string;
    // Calculated financials
    agency_commission_amount?: number;
    agent_commission_amount?: number;
    owner_net_amount?: number;
    created_at: string;
    updated_at: string;
    // Joined data
    contract?: RentalContract;
}
// --- Document Management System ---

export type DocumentType = 'boleto' | 'reserva' | 'contrato' | 'señal' | 'pdf_firmado' | 'identidad' | 'garantia' | 'otro';
export type DocumentStatus = 'borrador' | 'en_revision' | 'firmado' | 'vencido';

export interface Document {
    id: number;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    storage_path: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by: string; // UUID
    is_deleted: boolean;
    // Joined data
    versions?: DocumentVersion[];
    relations?: DocumentRelation[];
}

export interface DocumentRelation {
    id: number;
    document_id: number;
    entity_type: 'client' | 'property' | 'operation' | 'rental';
    entity_id: number;
    created_at: string;
}

export interface DocumentVersion {
    id: number;
    document_id: number;
    storage_path: string;
    version_number: number;
    change_description?: string;
    created_at: string;
    created_by: string; // UUID
}
