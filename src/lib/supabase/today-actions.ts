import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { subHours, subDays, parseISO, isBefore, isAfter } from 'date-fns';
import { Lead, Property, Visit, Opportunity, LeadInteraction } from '@/types';

export interface SmartAlert {
    id: string;
    type: 'critical' | 'high' | 'attention' | 'optimization';
    count: number;
    title: string;
    description: string;
    href: string;
}

export function useTodayActions() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['today-actions'],
        queryFn: async () => {
            const now = new Date();
            const twelveHoursAgo = subHours(now, 12);
            const twentyFourHoursAgo = subHours(now, 24);
            const fortyEightHoursAgo = subHours(now, 48);
            const fiveDaysAgo = subDays(now, 5);
            const thirtyDaysAgo = subDays(now, 30);

            // Parallel fetching of all relevant data
            const [
                { data: newLeads },
                { data: allInteractions },
                { data: completedVisits },
                { data: stalledOpportunities },
                { data: stagnantProperties },
                { data: hotLeads },
                { data: historyClients }
            ] = await Promise.all([
                // 1. Leads Nuevos
                supabase.from('leads').select('*').eq('status', 'Nuevo'),
                // Interactions for checking activity
                supabase.from('lead_interactions').select('*').order('interaction_date', { ascending: false }),
                // 2. Visitas completadas recientes
                supabase.from('visits').select('*, lead:leads(*)').eq('status', 'completed').gt('scheduled_at', subDays(now, 7).toISOString()),
                // 3. Oportunidades
                supabase.from('opportunities').select('*').eq('status', 'abierta'),
                // 4. Propietarios / Propiedades
                supabase.from('properties').select('*, visits(id, scheduled_at)').eq('internal_status', 'Disponible'),
                // 5. Leads Calientes
                supabase.from('leads').select('*').eq('interest_level', 'Alto'),
                // 6. Clientes históricos
                supabase.from('clients').select('*')
            ]);

            const alerts: SmartAlert[] = [];

            // --- 🔴 RULES ---

            // Leads nuevos sin contactar (> 24h)
            const criticalLeads = (newLeads || []).filter(lead => {
                const hasInteractions = (allInteractions || []).some(int => int.lead_id === lead.id);
                return !hasInteractions && isBefore(parseISO(lead.created_at), twentyFourHoursAgo);
            });

            if (criticalLeads.length > 0) {
                alerts.push({
                    id: 'critical-leads-24',
                    type: 'critical',
                    count: criticalLeads.length,
                    title: 'Leads nuevos sin contactar',
                    description: `Hace más de 24 hs que ingresaron ${criticalLeads.length} leads y no hubo contacto.`,
                    href: '/leads?status=Nuevo'
                });
            }

            // --- 🟠 RULES ---

            // Leads nuevos sin contactar (12h - 24h)
            const highLeads = (newLeads || []).filter(lead => {
                const hasInteractions = (allInteractions || []).some(int => int.lead_id === lead.id);
                const createdDate = parseISO(lead.created_at);
                return !hasInteractions && isBefore(createdDate, twelveHoursAgo) && isAfter(createdDate, twentyFourHoursAgo);
            });

            if (highLeads.length > 0) {
                alerts.push({
                    id: 'high-leads-12',
                    type: 'high',
                    count: highLeads.length,
                    title: 'Leads nuevos sin contactar (12h+)',
                    description: `Prioriza contactar a estos ${highLeads.length} leads antes que se enfríen.`,
                    href: '/leads?status=Nuevo'
                });
            }

            // Visitas sin seguimiento post-visita (dentro de las 48h posteriores)
            const pendingVisitFollowups = (completedVisits || []).filter(visit => {
                const visitDate = parseISO(visit.scheduled_at);
                // Si la visita terminó hace menos de 48hs y no hay interacciones posteriores a la visita
                const hasRecentInteraction = (allInteractions || []).some(int =>
                    int.lead_id === visit.lead_id && isAfter(parseISO(int.interaction_date), visitDate)
                );
                return !hasRecentInteraction && isBefore(visitDate, now) && isAfter(visitDate, fortyEightHoursAgo);
            });

            if (pendingVisitFollowups.length > 0) {
                alerts.push({
                    id: 'visit-followup',
                    type: 'high',
                    count: pendingVisitFollowups.length,
                    title: 'Visitas sin seguimiento post-visita',
                    description: `${pendingVisitFollowups.length} visitas terminaron recientemente y requieren un llamado de feedback.`,
                    href: '/leads'
                });
            }

            // Leads calientes sin próxima acción
            const hotLeadsWithoutTasks = (hotLeads || []).filter(lead => {
                // Ideally check tasks, for now if no recent interaction
                return !lead.next_follow_up || isBefore(parseISO(lead.next_follow_up), now);
            });

            if (hotLeadsWithoutTasks.length > 0) {
                alerts.push({
                    id: 'hot-leads-no-action',
                    type: 'high',
                    count: hotLeadsWithoutTasks.length,
                    title: 'Leads "calientes" sin próxima acción',
                    description: `${hotLeadsWithoutTasks.length} leads con interés Alto no tienen un seguimiento programado.`,
                    href: '/leads'
                });
            }

            // --- 🟡 RULES ---

            // Oportunidades estancadas (5 días sin avance)
            const stalledOps = (stalledOpportunities || []).filter(op => {
                return isBefore(parseISO(op.created_at), fiveDaysAgo); // Should check updated_at if exists
            });

            if (stalledOps.length > 0) {
                alerts.push({
                    id: 'stalled-opportunities',
                    type: 'attention',
                    count: stalledOps.length,
                    title: 'Oportunidades estancadas',
                    description: `${stalledOps.length} oportunidades no han tenido movimiento en los últimos 5 días.`,
                    href: '/opportunities'
                });
            }

            // Propietarios sin movimiento comercial (>30 días)
            const stagnantProps = (stagnantProperties || []).filter(prop => {
                const hasRecentVisit = (prop.visits || []).some((v: any) => isAfter(parseISO(v.scheduled_at), thirtyDaysAgo));
                return !hasRecentVisit && isBefore(parseISO(prop.created_at), thirtyDaysAgo);
            });

            if (stagnantProps.length > 0) {
                alerts.push({
                    id: 'stagnant-properties',
                    type: 'attention',
                    count: stagnantProps.length,
                    title: 'Propietarios sin movimiento comercial',
                    description: `${stagnantProps.length} propiedades activas sin visitas en los últimos 30 días. Revisar precio.`,
                    href: '/properties'
                });
            }

            // --- 🚨 PROD SYSTEM ALERTS (Properties) ---

            // Propiedad con muchas visitas y cero ofertas
            const highValueVisitsProps = (stagnantProperties || []).filter(prop => {
                const recentVisitsCount = (prop.visits || []).filter((v: any) => isAfter(parseISO(v.scheduled_at), thirtyDaysAgo)).length;
                // Since TodayActions fetch already joined visits, we can use that
                return recentVisitsCount >= 5;
            });

            if (highValueVisitsProps.length > 0) {
                alerts.push({
                    id: 'high-visits-no-offers',
                    type: 'critical',
                    count: highValueVisitsProps.length,
                    title: 'Bloqueo: Visitas sin Ofertas',
                    description: `${highValueVisitsProps.length} propiedades tienen alta rotación de visitas pero ninguna oferta. Revisar precio con urgencia.`,
                    href: '/properties'
                });
            }

            // --- 🟢 RULES ---

            // Clientes históricos sin recontacto (6 - 12 meses)
            // Implementation logic...

            return alerts;
        }
    });
}
