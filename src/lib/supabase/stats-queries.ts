import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            // Parallel queries for stats
            const [
                { count: totalClients },
                { count: activeLeads },
                { count: tasksCount },
                { count: opportunitiesCount }
            ] = await Promise.all([
                supabase.from('clients').select('*', { count: 'exact', head: true }),
                supabase.from('leads').select('*', { count: 'exact', head: true }).not('status', 'in', '("Congelado","Venta")'),
                supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
                supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'abierta')
            ]);

            return {
                totalClients: totalClients || 0,
                activeLeads: activeLeads || 0,
                tasksPending: tasksCount || 0,
                opportunitiesOpen: opportunitiesCount || 0,
                ventasMes: 0, // Placeholder
            };
        }
    });
}
