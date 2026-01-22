import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Lead, type LeadColumn, type Client, type Task, type Subtask, type Opportunity, type Profile, type TrackingDefinition, type TrackingDaily, type TrackingFunnelSnapshot, type ContentItem, type WhatsAppChat, type WhatsAppMessage, type Property, type PropertyMultimedia, type LeadProperty, type Visit, type WhatsAppSession, type WhatsAppConversation, type Tag } from '@/types';

// LEADS QUERIES & MUTATIONS
export function useLeads() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Lead[];
        },
    });
}

export function useLeadColumns() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['lead_columns'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('lead_columns')
                .select('*')
                .order('position', { ascending: true });
            if (error) throw error;
            return data as LeadColumn[];
        },
    });
}

export function useUpdateLeadStatus() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ leadId, status }: { leadId: number; status: string }) => {
            const { data, error } = await supabase
                .from('leads')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', leadId)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useCreateLead() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (lead: Partial<Lead>) => {
            const { data, error } = await supabase
                .from('leads')
                .insert(lead)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useUpdateLead() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...lead }: Partial<Lead> & { id: number }) => {
            const { data, error } = await supabase
                .from('leads')
                .update(lead)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

// CLIENT QUERIES & MUTATIONS
export function useClients() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Client[];
        },
    });
}

export function useCreateClient() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (client: Partial<Client>) => {
            const { data, error } = await supabase
                .from('clients')
                .insert([client])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

export function useUpdateClient() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...client }: Partial<Client> & { id: number }) => {
            const { data, error } = await supabase
                .from('clients')
                .update(client)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

// TASKS QUERIES & MUTATIONS
export function useTasks() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          subtasks (*)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Task[];
        },
    });
}

export function useCreateTask() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (task: Partial<Task>) => {
            const { data, error } = await supabase
                .from('tasks')
                .insert([task])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

export function useUpdateTask() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...task }: Partial<Task> & { id: number }) => {
            const { data, error } = await supabase
                .from('tasks')
                .update(task)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

export function useDeleteTask() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

// SUBTASKS MUTATIONS
export function useUpdateSubtask() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...subtask }: Partial<Subtask> & { id: number }) => {
            const { data, error } = await supabase
                .from('subtasks')
                .update(subtask)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useCreateSubtask() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (subtask: Partial<Subtask>) => {
            const { data, error } = await supabase
                .from('subtasks')
                .insert([subtask])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useDeleteSubtask() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('subtasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

// OPPORTUNITIES QUERIES & MUTATIONS
export function useOpportunities() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['opportunities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('opportunities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Opportunity[];
        },
    });
}

export function useCreateOpportunity() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (opportunity: Partial<Opportunity>) => {
            const { data, error } = await supabase
                .from('opportunities')
                .insert([opportunity])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

export function useUpdateOpportunity() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...opportunity }: Partial<Opportunity> & { id: number }) => {
            const { data, error } = await supabase
                .from('opportunities')
                .update(opportunity)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

// PROFILES QUERIES & MUTATIONS
export function useProfiles() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Profile[];
        },
    });
}

export function useUpdateProfile() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ user_id, ...profile }: Partial<Profile> & { user_id: string }) => {
            const { data, error } = await supabase
                .from('profiles')
                .update(profile)
                .eq('user_id', user_id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
    });
}

// TRACKING QUERIES & MUTATIONS
// TRACKING QUERIES & MUTATIONS
export function useTrackingDefinitions() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['tracking_definitions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tracking_definitions')
                .select('*')
                .order('position', { ascending: true });

            if (error) throw error;
            return data as TrackingDefinition[];
        },
    });
}

export function useTrackingDaily(date?: string) {
    const supabase = createClient();
    const targetDate = date || new Date().toISOString().split('T')[0];

    return useQuery({
        queryKey: ['tracking_daily', targetDate],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tracking_daily')
                .select('*')
                .eq('date', targetDate);

            if (error) throw error;
            return data as TrackingDaily[];
        },
    });
}

export function useUpdateDailyTracking() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ definition_id, date, count }: { definition_id: number; date: string; count: number }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { data, error } = await supabase
                .from('tracking_daily')
                .upsert({
                    agent_id: user.id,
                    date: date,
                    definition_id: definition_id,
                    count: count,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'agent_id, date, definition_id' })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tracking_daily', variables.date] });
        },
    });
}

export function useTrackingFunnelSnapshots() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['tracking_funnel_snapshots'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tracking_funnel_snapshots')
                .select('*')
                .order('date', { ascending: false });
            if (error) throw error;
            return data as TrackingFunnelSnapshot[];
        }
    });
}

export function useSaveFunnelSnapshot() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (snapshots: Partial<TrackingFunnelSnapshot>[]) => {
            const { data, error } = await supabase
                .from('tracking_funnel_snapshots')
                .insert(snapshots)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracking_funnel_snapshots'] });
        }
    });
}

// CONTENT QUERIES & MUTATIONS
export function useContentItems() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['content_items'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('content_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as ContentItem[];
        },
    });
}

export function useCreateContentItem() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (content: Partial<ContentItem>) => {
            const { data, error } = await supabase
                .from('content_items')
                .insert([content])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content_items'] });
        },
    });
}

export function useUpdateContentItem() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...content }: Partial<ContentItem> & { id: number }) => {
            const { data, error } = await supabase
                .from('content_items')
                .update(content)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content_items'] });
        },
    });
}

// WHATSAPP QUERIES & MUTATIONS
export function useWhatsAppChats() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['whatsapp_chats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('whatsapp_chats')
                .select('*')
                .order('last_message_at', { ascending: false });

            if (error) throw error;
            return data as WhatsAppChat[];
        },
    });
}

export function useWhatsAppMessages(chatId?: number) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['whatsapp_messages', chatId],
        queryFn: async () => {
            if (!chatId) return [];
            const { data, error } = await supabase
                .from('whatsapp_messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as WhatsAppMessage[];
        },
        enabled: !!chatId,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ chatId, content }: { chatId: number; content: string }) => {
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId, content }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error sending message');
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_messages', variables.chatId] });
            queryClient.invalidateQueries({ queryKey: ['whatsapp_chats'] });
        },
    });
}

// PROPERTIES QUERIES & MUTATIONS
export function useProperties() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    multimedia (*)
                `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Property[];
        },
    });
}

export function useProperty(id: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['property', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    multimedia (*)
                `)
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as Property;
        },
        enabled: !!id,
    });
}

export function useCreateProperty() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (property: Partial<Property>) => {
            const { data, error } = await supabase
                .from('properties')
                .insert([property])
                .select()
                .single();
            if (error) throw error;
            return data as Property;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
}

export function useUpdateProperty() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...property }: Partial<Property> & { id: number }) => {
            const { data, error } = await supabase
                .from('properties')
                .update(property)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data as Property;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', data.id] });
        },
    });
}

export function useDeleteProperty() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
}

// LEAD-PROPERTY RELATIONS
export function useLinkPropertyToLead() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (relation: Partial<LeadProperty>) => {
            const { data, error } = await supabase
                .from('lead_properties')
                .insert([relation])
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
}

// VISITS QUERIES & MUTATIONS
export function useVisits(leadId?: number, propertyId?: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['visits', { leadId, propertyId }],
        queryFn: async () => {
            let query = supabase.from('visits').select(`
                *,
                lead:leads(*),
                property:properties(*)
            `);

            if (leadId) query = query.eq('lead_id', leadId);
            if (propertyId) query = query.eq('property_id', propertyId);

            const { data, error } = await query.order('scheduled_at', { ascending: false });
            if (error) throw error;
            return data as Visit[];
        },
    });
}

export function useCreateVisit() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (visit: Partial<Visit>) => {
            const { data, error } = await supabase
                .from('visits')
                .insert([visit])
                .select()
                .single();
            if (error) throw error;
            return data as Visit;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['visits'] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['property', data.property_id] });
        },
    });
}

export function useUpdateVisit() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...visit }: Partial<Visit> & { id: number }) => {
            const { data, error } = await supabase
                .from('visits')
                .update(visit)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data as Visit;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['visits'] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['property', data.property_id] });
        },
    });
}

export function useLogoutWhatsApp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/whatsapp/session', {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error logging out');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_session_state'] });
            queryClient.invalidateQueries({ queryKey: ['whatsapp_chats'] });
        },
    });
}

// WHATSAPP (WAHA) QUERIES & MUTATIONS
export function useWhatsAppSessions() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['whatsapp_sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('whatsapp_sessions')
                .select('*')
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data as WhatsAppSession[];
        },
    });
}

export function useWhatsAppSessionState() {
    return useQuery({
        queryKey: ['whatsapp_session_state'],
        queryFn: async () => {
            const response = await fetch('/api/whatsapp/session');
            if (!response.ok) throw new Error('Failed to fetch session state');
            return response.json() as Promise<{ status: string; qr?: string; session: string }>;
        },
        refetchInterval: (query) => (query?.state.data?.status === 'CONNECTED' ? 30000 : 5000), // Poll every 5s if not connected
    });
}

export function useWhatsAppConversations() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['whatsapp_conversations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('whatsapp_conversations')
                .select('*, lead:leads(*), whatsapp_chat_tags(whatsapp_tags(*))')
                .order('last_message_at', { ascending: false });
            if (error) throw error;

            const formattedData = (data as any[]).map(conv => ({
                ...conv,
                tags: conv.whatsapp_chat_tags?.map((ct: any) => ct.whatsapp_tags).filter(Boolean) || []
            }));

            return formattedData as WhatsAppConversation[];
        },
        refetchInterval: 10000, // Poll every 10s for new chats/updates
        staleTime: 5000,
    });
}

export function useWhatsAppMessagesExtended(conversationId?: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['whatsapp_messages_ext', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const { data, error } = await supabase
                .from('whatsapp_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('timestamp', { ascending: true });
            if (error) throw error;
            return data as WhatsAppMessage[];
        },
        enabled: !!conversationId,
        refetchInterval: 4000, // Poll every 4s for new messages when a chat is open
        staleTime: 2000,
    });
}

export function useMarkAsRead() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (conversationId: number) => {
            const { error } = await supabase
                .from('whatsapp_conversations')
                .update({ unread_count: 0 })
                .eq('id', conversationId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_conversations'] });
        }
    });
}

export function useCreateWhatsAppConversation() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (conv: Partial<WhatsAppConversation>) => {
            const { data, error } = await supabase
                .from('whatsapp_conversations')
                .insert([conv])
                .select()
                .single();
            if (error) throw error;
            return data as WhatsAppConversation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_conversations'] });
        },
    });
}

export function useCreateWhatsAppMessage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (msg: Partial<WhatsAppMessage>) => {
            const { data, error } = await supabase
                .from('whatsapp_messages')
                .insert([msg])
                .select()
                .single();
            if (error) throw error;
            return data as WhatsAppMessage;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_messages_ext', data.conversation_id] });
            queryClient.invalidateQueries({ queryKey: ['whatsapp_conversations'] });
        },
    });
}

// --- Tags Hooks ---

export function useTags() {
    return useQuery({
        queryKey: ['whatsapp_tags'],
        queryFn: async () => {
            const res = await fetch('/api/whatsapp/tags');
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<Tag[]>;
        }
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (tag: { name: string; color: string }) => {
            const res = await fetch('/api/whatsapp/tags', {
                method: 'POST',
                body: JSON.stringify(tag)
            });
            if (!res.ok) throw new Error('Error creating tag');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_tags'] });
        }
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/whatsapp/tags?id=${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Error deleting tag');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_tags'] });
        }
    });
}

export function useAssignTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { chatId: number; tagId: number }) => {
            const res = await fetch('/api/whatsapp/chat-tags', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error assigning tag');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_conversations'] });
        }
    });
}

export function useRemoveTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { chatId: number; tagId: number }) => {
            const res = await fetch('/api/whatsapp/chat-tags', {
                method: 'DELETE',
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error removing tag');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp_conversations'] });
        }
    });
}
