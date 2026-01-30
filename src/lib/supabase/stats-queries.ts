import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { startOfDay, subDays, isAfter, parseISO } from 'date-fns';

export function useDashboardStats() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            // Parallel queries for stats
            const [
                { count: totalClients },
                { data: allLeads },
                { count: tasksCount },
                { count: opportunitiesCount }
            ] = await Promise.all([
                supabase.from('clients').select('*', { count: 'exact', head: true }),
                // Fetch ALL leads to do client-side filtering for complex metrics
                // This is okay for small-medium datasets. For large datasets, use RPC or specific filtered queries.
                supabase.from('leads').select('id, status, created_at, source, lead_type'),
                supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
                supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'abierta')
            ]);

            const leads = allLeads || [];
            const now = new Date();
            const todayStart = startOfDay(now);
            const weekStart = subDays(now, 7);

            // Time-based metrics
            const leadsToday = leads.filter(l => isAfter(parseISO(l.created_at), todayStart)).length;
            const leadsWeek = leads.filter(l => isAfter(parseISO(l.created_at), weekStart)).length;

            // Conversion Rate (Leads that reached "Visita" or further)
            // Assuming status flow: New -> Contactado -> Visita -> ...
            // Simple proxy: Status is NOT 'Nuevo' or 'Intento Contacto'.
            const convertedCount = leads.filter(l => !['Nuevo', 'Intento Contacto', 'Contactado'].includes(l.status)).length;
            const conversionRate = leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0;

            // Sales Closed: Separated into Sales and Rentals
            const soldConfirmedCount = leads.filter(l => {
                const s = (l.status || '').toLowerCase();
                return s.includes('vendido') || s.includes('escriturado') || s === 'venta' || s === 'cerrado';
            }).length;

            const rentedCount = leads.filter(l => {
                const s = (l.status || '').toLowerCase();
                return s.includes('alquilado') || s.includes('rentado');
            }).length;

            // Sources for Pie Chart
            const sourcesMap: Record<string, number> = {};
            leads.forEach(l => {
                const src = l.source || 'Desconocido';
                sourcesMap[src] = (sourcesMap[src] || 0) + 1;
            });
            const leadsBySource = Object.entries(sourcesMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

            return {
                totalClients: totalClients || 0,
                activeLeads: leads.filter(l => !['Congelado', 'Venta', 'Perdido', 'Alquilado', 'Vendido'].includes(l.status || '')).length,
                tasksPending: tasksCount || 0,
                opportunitiesOpen: opportunitiesCount || 0,
                leadsToday,
                leadsWeek,
                conversionRate,
                salesClosed: soldConfirmedCount,
                rentalsClosed: rentedCount,
                leadsBySource,
                salesGoal: 10 // This will be overridden by client-side config
            };
        }
    });
}
