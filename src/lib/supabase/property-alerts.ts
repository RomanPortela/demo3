import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { subDays, parseISO, isBefore, isAfter } from 'date-fns';
import { Property, Visit, ClientProposal, LeadProperty } from '@/types';

export interface PropertyAlert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
}

export function usePropertyAlerts(propertyId?: number) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['property-alerts', propertyId],
        queryFn: async () => {
            if (!propertyId) return [];

            const now = new Date();
            const sevenDaysAgo = subDays(now, 7);
            const fifteenDaysAgo = subDays(now, 15);
            const thirtyDaysAgo = subDays(now, 30);

            // Fetch all data for analysis
            const [
                { data: property },
                { data: visits },
                { data: proposals },
                { data: priceHistory },
                { data: interestedLeads }
            ] = await Promise.all([
                supabase.from('properties').select('*').eq('id', propertyId).single(),
                supabase.from('visits').select('*').eq('property_id', propertyId).eq('status', 'completed'),
                supabase.from('client_proposals').select('*').eq('property_id', propertyId),
                supabase.from('property_price_history').select('*').eq('property_id', propertyId).order('changed_at', { ascending: false }),
                supabase.from('lead_properties').select('*').eq('property_id', propertyId).eq('relation_type', 'interesado')
            ]);

            if (!property || property.internal_status !== 'Disponible') return [];

            const alerts: PropertyAlert[] = [];

            // 1. Alerta: Muchas visitas y cero ofertas
            const recentVisits = (visits || []).filter(v => isAfter(parseISO(v.scheduled_at), thirtyDaysAgo));
            const recentProposals = (proposals || []).filter(p => isAfter(parseISO(p.created_at), thirtyDaysAgo));

            if (recentVisits.length >= 5 && recentProposals.length === 0) {
                alerts.push({
                    id: 'visits-no-offers',
                    type: 'critical',
                    title: 'Muchas visitas, cero ofertas',
                    description: `La propiedad ha tenido ${recentVisits.length} visitas en los últimos 30 días pero ninguna oferta. El precio podría estar desalineado.`,
                    action: 'Revisar estrategia de precio'
                });
            }

            // 2. Alerta: Publicada hace X días sin consultas
            const createdDate = parseISO(property.created_at);
            if (isBefore(createdDate, fifteenDaysAgo) && (interestedLeads || []).length === 0) {
                alerts.push({
                    id: 'no-inquiries',
                    type: 'warning',
                    title: 'Sin consultas recientes',
                    description: `Publicada hace más de 15 días sin leads asociados. Verifique la visibilidad y calidad de las fotos.`,
                    action: 'Optimizar publicación'
                });
            }

            // 3. Alerta: Precio modificado sin impacto comercial
            if (priceHistory && priceHistory.length > 0) {
                const lastChange = priceHistory[0];
                const lastChangeDate = parseISO(lastChange.changed_at);

                if (isBefore(lastChangeDate, sevenDaysAgo)) {
                    const activitySinceChange =
                        (visits || []).some(v => isAfter(parseISO(v.scheduled_at), lastChangeDate)) ||
                        (interestedLeads || []).some(l => isAfter(parseISO(l.created_at), lastChangeDate)) ||
                        (proposals || []).some(p => isAfter(parseISO(p.created_at), lastChangeDate));

                    if (!activitySinceChange) {
                        alerts.push({
                            id: 'price-change-no-impact',
                            type: 'warning',
                            title: 'Precio modificado sin impacto',
                            description: `Pasaron más de 7 días desde el último ajuste de precio ($${lastChange.new_price.toLocaleString()}) sin nuevas consultas o visitas.`,
                            action: 'Conversación estratégica con propietario'
                        });
                    }
                }
            }

            return alerts;
        },
        enabled: !!propertyId
    });
}

export interface PriceHistoryItem {
    id: number;
    property_id: number;
    old_price: number;
    new_price: number;
    currency: string;
    changed_at: string;
}

export function usePropertyPriceHistory(propertyId?: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['property-price-history', propertyId],
        queryFn: async () => {
            if (!propertyId) return [];
            const { data, error } = await supabase
                .from('property_price_history')
                .select('*')
                .eq('property_id', propertyId)
                .order('changed_at', { ascending: false });
            if (error) throw error;
            return data as PriceHistoryItem[];
        },
        enabled: !!propertyId
    });
}

export function useAllPropertiesAlerts() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['all-properties-alerts'],
        queryFn: async () => {
            const { data: properties } = await supabase.from('properties').select('id, address, internal_status').eq('internal_status', 'Disponible');
            if (!properties) return [];

            // This is simplified. In a real world scenario with many properties, 
            // this should be calculated via a stored procedure or a more efficient query.
            // For now, we'll return a count of properties with alerts for the dashboard.

            // Note: Parallel fetching for ALL properties might be heavy. 
            // We should ideally have a view or table for pre-calculated alerts.
            // For this demo, let's just implement the logic for the specific property view first.
            return properties;
        }
    });
}
