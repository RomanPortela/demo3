import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoogleToken, listEvents, createEvent, deleteEvent } from "@/lib/google-calendar";

export function useGoogleEvents() {
    return useQuery({
        queryKey: ['google-events'],
        queryFn: async () => {
            const token = await getGoogleToken();
            if (!token) throw new Error("No Google Token");
            return listEvents(token);
        },
        retry: false
    });
}

export function useCreateGoogleEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: any) => {
            const token = await getGoogleToken();
            if (!token) throw new Error("No Google Token");
            return createEvent(token, event);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['google-events'] });
        }
    });
}

export function useDeleteGoogleEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventId: string) => {
            const token = await getGoogleToken();
            if (!token) throw new Error("No Google Token");
            return deleteEvent(token, eventId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['google-events'] });
        }
    });
}
