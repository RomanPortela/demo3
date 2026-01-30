import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CalendarEvent {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    color?: string;
    created_by: string;
    created_at: string;
    client_id?: number;
    property_id?: number;
    lead_id?: number;
    event_type?: 'meeting' | 'visit' | 'task' | 'other';
    // Joined fields
    client?: { owner_first_name: string; owner_last_name: string; };
    property?: { address: string; zone: string; };
}

export function useCalendarEvents() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['calendar_events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('calendar_events')
                .select(`
                    *,
                    client:clients(owner_first_name, owner_last_name),
                    property:properties(address, zone)
                `)
                .order('start_time', { ascending: true });
            if (error) throw error;
            return data as CalendarEvent[];
        },
    });
}

export function useCreateCalendarEvent() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: Partial<CalendarEvent>) => {
            // const { data: { user } } = await supabase.auth.getUser();
            const userId = '1';

            const { data, error } = await supabase
                .from('calendar_events')
                .insert([{ ...event, created_by: userId }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
        },
    });
}

export function useDeleteCalendarEvent() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
        },
    });
}
