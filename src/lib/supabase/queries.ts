import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Lead, type LeadColumn, type Client, type Task, type Subtask, type Opportunity, type Profile, type TrackingDefinition, type TrackingDaily, type TrackingFunnelSnapshot, type ContentItem, type WhatsAppChat, type WhatsAppMessage, type Property, type PropertyMultimedia, type LeadProperty, type Visit, type WhatsAppSession, type WhatsAppConversation, type Tag, type LeadInteraction, type LeadInteractionAudit, type PropertyAssignment, type RentalContract, type RentalPayment, type RentalStatus, type RentalPaymentStatus } from '@/types';

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

export function useDeleteLead() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useCreateLeadColumn() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (column: Partial<LeadColumn>) => {
            const { data, error } = await supabase
                .from('lead_columns')
                .insert(column)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead_columns'] });
        },
    });
}

export function useUpdateLeadColumn() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...column }: Partial<LeadColumn> & { id: number }) => {
            const { data, error } = await supabase
                .from('lead_columns')
                .update(column)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead_columns'] });
        },
    });
}

export function useDeleteLeadColumn() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('lead_columns')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead_columns'] });
        },
    });
}

export function useUpdateLeadColumnsOrder() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (columns: { id: number; position: number }[]) => {
            const { error } = await supabase
                .from('lead_columns')
                .upsert(columns);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead_columns'] });
        },
    });
}

export function useLeadInteractions(leadId?: number, includeDeleted = false) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['lead_interactions', leadId, includeDeleted],
        queryFn: async () => {
            if (!leadId) return [];
            let query = supabase
                .from('lead_interactions')
                .select(`
                    *,
                    property:properties (*)
                `)
                .eq('lead_id', leadId);

            if (!includeDeleted) {
                query = query.eq('is_deleted', false);
            }

            const { data, error } = await query.order('interaction_date', { ascending: false });
            if (error) throw error;
            return data as LeadInteraction[];
        },
        enabled: !!leadId,
    });
}

export function useCreateLeadInteraction() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (interaction: Partial<LeadInteraction>) => {
            const { data, error } = await supabase
                .from('lead_interactions')
                .insert(interaction)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lead_interactions', variables.lead_id] });
        },
    });
}

export function useUpdateLeadInteraction() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, leadId, reason, ...payload }: Partial<LeadInteraction> & { id: number; leadId: number; reason: string }) => {
            // 1. Get current snapshot
            const { data: original } = await supabase
                .from('lead_interactions')
                .select('*')
                .eq('id', id)
                .single();

            if (!original) throw new Error("Interaction not found");

            // 2. Perform update
            const { data: updated, error } = await supabase
                .from('lead_interactions')
                .update({ ...payload, is_edited: true })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // 3. Log audit
            await supabase.from('lead_interaction_audit').insert({
                interaction_id: id,
                action_type: 'EDIT',
                old_content: original,
                new_content: updated,
                reason,
                changed_by: (await supabase.auth.getUser()).data.user?.id || '1'
            });

            return updated;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lead_interactions', variables.leadId] });
            queryClient.invalidateQueries({ queryKey: ['lead_interaction_audit', variables.id] });
        },
    });
}

export function useDeleteLeadInteraction() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, leadId, reason }: { id: number; leadId: number; reason: string }) => {
            // 1. Get snapshot
            const { data: original } = await supabase
                .from('lead_interactions')
                .select('*')
                .eq('id', id)
                .single();

            // 2. Soft delete
            const { error } = await supabase
                .from('lead_interactions')
                .update({ is_deleted: true })
                .eq('id', id);

            if (error) throw error;

            // 3. Log audit
            await supabase.from('lead_interaction_audit').insert({
                interaction_id: id,
                action_type: 'DELETE',
                old_content: original,
                reason,
                changed_by: (await supabase.auth.getUser()).data.user?.id || '1'
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lead_interactions', variables.leadId] });
        },
    });
}

export function useRestoreLeadInteraction() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, leadId, reason }: { id: number; leadId: number; reason: string }) => {
            const { error } = await supabase
                .from('lead_interactions')
                .update({ is_deleted: false })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('lead_interaction_audit').insert({
                interaction_id: id,
                action_type: 'RESTORE',
                reason,
                changed_by: (await supabase.auth.getUser()).data.user?.id || '1'
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lead_interactions', variables.leadId] });
        },
    });
}

export function useLeadInteractionAudit(interactionId: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['lead_interaction_audit', interactionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('lead_interaction_audit')
                .select('*')
                .eq('interaction_id', interactionId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as LeadInteractionAudit[];
        },
        enabled: !!interactionId,
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
        mutationFn: async ({ id, ...payload }: Partial<Client> & { id: number }) => {
            // Log Status Change if any
            if (payload.customer_status) {
                const { data: currentClient } = await supabase
                    .from('clients')
                    .select('customer_status')
                    .eq('id', id)
                    .single();

                if (currentClient && currentClient.customer_status !== payload.customer_status) {
                    await supabase.from('client_status_history').insert([{
                        client_id: id,
                        old_status: currentClient.customer_status || 'Activo',
                        new_status: payload.customer_status,
                        changed_by: (await supabase.auth.getUser()).data.user?.id
                    }]);
                }
            }

            const { data, error } = await supabase
                .from('clients')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data as Client;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
}

export function useClientProposals(clientId?: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['client_proposals', clientId],
        queryFn: async () => {
            if (!clientId) return [];
            // Assuming 'client_proposals' table exists
            const { data, error } = await supabase
                .from('client_proposals')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching proposals:", error);
                return [];
            }
            return data;
        },
        enabled: !!clientId,
    });
}

export function useCreateClientProposal() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (proposal: any) => {
            const { data, error } = await supabase
                .from('client_proposals')
                .insert([proposal])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['client_proposals', variables.client_id] });
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
            // const { data: { user } } = await supabase.auth.getUser();
            const userId = '1';

            const { data, error } = await supabase
                .from('tracking_daily')
                .upsert({
                    agent_id: userId,
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
            const { data: { session } } = await supabase.auth.getSession();
            console.log("Current session for fetch:", session ? "Authenticated" : "Anonymous");
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    multimedia:property_multimedia (*)
                `)
                .order('created_at', { ascending: false });
            if (error) {
                console.error("Error fetching properties:", error.message, error.code, error.details);
                throw error;
            }
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
                    multimedia:property_multimedia (*)
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
        mutationFn: async (payload: Partial<Property> & { owner_id?: number }) => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log("Current session for create:", session ? "Authenticated" : "Anonymous");
            const { multimedia, owner_id, ...propertyData } = payload as any;

            // 1. Insert Property
            const { data: property, error: propError } = await supabase
                .from('properties')
                .insert([propertyData])
                .select()
                .single();

            if (propError) {
                console.error("Error creating property:", propError.message, propError.code, propError.details);
                throw propError;
            }

            // 2. Insert Multimedia if any
            if (multimedia && Array.isArray(multimedia) && multimedia.length > 0) {
                const mediaToInsert = multimedia.map((m: any, index: number) => ({
                    property_id: property.id,
                    url: m.url,
                    type: m.type || 'image',
                    is_cover: m.is_cover || false,
                    position: m.position !== undefined ? m.position : index
                }));
                const { error: mediaError } = await supabase
                    .from('property_multimedia')
                    .insert(mediaToInsert);
                if (mediaError) console.error("Error saving multimedia:", mediaError);
            }

            // 3. Link Owner if any
            if (owner_id) {
                const { error: linkError } = await supabase
                    .from('lead_properties')
                    .insert([{
                        lead_id: owner_id,
                        property_id: property.id,
                        relation_type: 'propietario'
                    }]);
                if (linkError) console.error("Error linking owner:", linkError);
            }

            return property as Property;
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
        mutationFn: async ({ id, ...payload }: Partial<Property> & { id: number, owner_id?: number }) => {
            const { multimedia, owner_id, ...propertyData } = payload as any;

            // 0. Detect Price Change for History
            if (propertyData.price !== undefined) {
                const { data: currentProp } = await supabase
                    .from('properties')
                    .select('price, currency')
                    .eq('id', id)
                    .single();

                if (currentProp && currentProp.price !== propertyData.price) {
                    await supabase.from('property_price_history').insert([{
                        property_id: id,
                        old_price: currentProp.price,
                        new_price: propertyData.price,
                        currency: propertyData.currency || currentProp.currency || 'USD'
                    }]);
                }
            }

            // 1. Update Property
            const { data: property, error: propError } = await supabase
                .from('properties')
                .update(propertyData)
                .eq('id', id)
                .select()
                .single();

            if (propError) {
                console.error("Error updating property:", propError);
                throw propError;
            }

            // 2. Handle Multimedia (Basic sync: delete all and re-insert)
            if (multimedia && Array.isArray(multimedia)) {
                await supabase.from('property_multimedia').delete().eq('property_id', id);
                if (multimedia.length > 0) {
                    const mediaToInsert = multimedia.map((m: any, index: number) => ({
                        property_id: id,
                        url: m.url,
                        type: m.type || 'image',
                        is_cover: m.is_cover || false,
                        position: m.position !== undefined ? m.position : index
                    }));
                    const { error: mediaError } = await supabase
                        .from('property_multimedia')
                        .insert(mediaToInsert);
                    if (mediaError) console.error("Error updating multimedia:", mediaError);
                }
            }

            // 3. Handle Owner Link
            if (owner_id) {
                // Upsert relation if it doesn't exist or update it
                const { error: linkError } = await supabase
                    .from('lead_properties')
                    .upsert({
                        lead_id: owner_id,
                        property_id: id,
                        relation_type: 'propietario'
                    }, { onConflict: 'lead_id, property_id, relation_type' });
                if (linkError) console.error("Error updating owner link:", linkError);
            }

            return property as Property;
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

export function usePropertyVisits(propertyId?: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['property_visits', propertyId],
        queryFn: async () => {
            if (!propertyId) return [];
            const { data, error } = await supabase
                .from('lead_interactions')
                .select(`
                    *,
                    lead:leads (
                        id,
                        full_name,
                        property_phone,
                        source
                    )
                `)
                .eq('property_id', propertyId)
                .eq('channel', 'Visita')
                .order('interaction_date', { ascending: false });

            if (error) throw error;
            return data as (LeadInteraction & { lead: { id: number, full_name: string, property_phone: string, source: string } })[];
        },
        enabled: !!propertyId,
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

// PROPERTY ASSIGNMENTS QUERIES & MUTATIONS
export function usePropertyAssignments(propertyId?: number) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['property_assignments', propertyId],
        queryFn: async () => {
            if (!propertyId) return [];
            const { data, error } = await supabase
                .from('property_assignments')
                .select(`
                    *,
                    agent:profiles (*)
                `)
                .eq('property_id', propertyId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as PropertyAssignment[];
        },
        enabled: !!propertyId,
    });
}

export function useCreateAssignment() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assignment: Partial<PropertyAssignment>) => {
            const { data, error } = await supabase
                .from('property_assignments')
                .insert([assignment])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['property_assignments', variables.property_id] });
        },
    });
}

export function useUpdateAssignment() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...assignment }: Partial<PropertyAssignment> & { id: number }) => {
            const { data, error } = await supabase
                .from('property_assignments')
                .update(assignment)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['property_assignments', data.property_id] });
        },
    });
}

export function useDeleteAssignment() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, propertyId }: { id: number; propertyId: number }) => {
            const { error } = await supabase
                .from('property_assignments')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['property_assignments', variables.propertyId] });
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

// --- Rentals Hooks (Alquileres) ---

export function useRentalContracts() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['rental_contracts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rental_contracts')
                .select(`
                    *,
                    property:properties (*),
                    owner:leads!rental_contracts_owner_id_fkey (*),
                    tenant:leads!rental_contracts_tenant_id_fkey (*),
                    agent:profiles (*)
                `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as RentalContract[];
        },
    });
}

export function useCreateRentalContract() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contract: Partial<RentalContract>) => {
            const { data, error } = await supabase
                .from('rental_contracts')
                .insert([contract])
                .select()
                .single();
            if (error) throw error;

            // Auto-generate initial payments (cronograma)
            if (data && data.start_date && data.duration_months) {
                const start = new Date(data.start_date);
                const payments = [];
                for (let i = 0; i < data.duration_months; i++) {
                    const periodDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
                    const dueDate = new Date(periodDate);
                    dueDate.setDate(10); // Default due day

                    payments.push({
                        contract_id: data.id,
                        period: periodDate.toISOString().split('T')[0],
                        due_date: dueDate.toISOString().split('T')[0],
                        amount_rent: data.base_amount,
                        status: 'pendiente'
                    });
                }
                await supabase.from('rental_payments').insert(payments);
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rental_contracts'] });
            queryClient.invalidateQueries({ queryKey: ['rental_payments'] });
        },
    });
}

export function useRentalPayments(contractId?: number, month?: string) {
    const supabase = createClient();
    return useQuery({
        queryKey: ['rental_payments', contractId, month],
        queryFn: async () => {
            let query = supabase
                .from('rental_payments')
                .select(`
                    *,
                    contract:rental_contracts (
                        *,
                        property:properties (*),
                        owner:leads!rental_contracts_owner_id_fkey (*),
                        tenant:leads!rental_contracts_tenant_id_fkey (*),
                        agent:profiles (*)
                    )
                `);

            if (contractId) query = query.eq('contract_id', contractId);
            if (month) {
                const start = `${month}-01`;
                // Simple logic for month filtering
                query = query.gte('period', start).lt('period', new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString().split('T')[0]);
            }

            const { data, error } = await query.order('period', { ascending: true });
            if (error) throw error;
            return data as RentalPayment[];
        },
    });
}

export function useUpdateRentalPayment() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payload }: Partial<RentalPayment> & { id: number }) => {
            // If marking as collected, calculate commissions
            if (payload.status === 'cobrado' || payload.amount_collected! > 0) {
                const { data: current } = await supabase
                    .from('rental_payments')
                    .select('*, contract:rental_contracts(*)')
                    .eq('id', id)
                    .single();

                if (current && current.contract) {
                    const agencyAmt = (payload.amount_collected || current.amount_rent) * (current.contract.agency_commission_percentage / 100);
                    const agentAmt = agencyAmt * (current.contract.agent_commission_percentage / 100);
                    payload.agency_commission_amount = agencyAmt;
                    payload.agent_commission_amount = agentAmt;
                    payload.owner_net_amount = (payload.amount_collected || current.amount_rent) - agencyAmt;
                    payload.collected_at = payload.collected_at || new Date().toISOString();
                }
            }

            const { data, error } = await supabase
                .from('rental_payments')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rental_payments'] });
        },
    });
}
