import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PortalCredential {
    id: number;
    user_id: string;
    portal_name: string;
    username: string;
    password?: string;
    is_active: boolean;
    created_at: string;
}

export function usePortalCredentials(portalName: string) {
    return useQuery({
        queryKey: ['portal_credentials', portalName],
        queryFn: async () => {
            console.log('=== FETCHING CREDENTIALS via API ===');
            console.log('Portal:', portalName);

            const response = await fetch(`/api/portals/credentials?portal_name=${portalName}`);
            const result = await response.json();

            console.log('API Response:', result);

            if (!response.ok) {
                console.error('API Error:', result.error);
                throw new Error(result.error || 'Failed to fetch credentials');
            }

            console.log('Credential data:', result.data);
            return result.data as PortalCredential | null;
        },
    });
}

export function useUpsertPortalCredentials() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<PortalCredential>) => {
            console.log('=== SAVING CREDENTIALS via API ===');
            console.log('Payload:', { ...payload, password: '(hidden)' });

            const response = await fetch('/api/portals/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    portal_name: payload.portal_name,
                    username: payload.username,
                    password: payload.password,
                }),
            });

            const result = await response.json();
            console.log('API Response:', result);

            if (!response.ok) {
                console.error('API Error:', result.error);
                throw new Error(result.error || 'Failed to save credentials');
            }

            console.log('✅ Credentials saved successfully');
            return result.data;
        },
        onSuccess: (data) => {
            console.log('🔄 Invalidating query cache for:', data?.portal_name);
            if (data?.portal_name) {
                queryClient.invalidateQueries({ queryKey: ['portal_credentials', data.portal_name] });
            }
        },
        onError: (error) => {
            console.error('❌ Mutation error:', error);
        }
    });
}
