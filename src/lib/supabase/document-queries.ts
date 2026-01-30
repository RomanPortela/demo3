'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from './client';
import { Document, DocumentType, DocumentStatus, DocumentRelation, DocumentVersion } from '@/types';
import { toast } from 'sonner';

const supabase = createClient();

export function useDocuments(entityType?: string, entityId?: number) {
    return useQuery({
        queryKey: ['documents', entityType, entityId],
        queryFn: async () => {
            let query = supabase
                .from('documents')
                .select(`
                    *,
                    versions:document_versions(*),
                    relations:document_relations(*)
                `)
                .eq('is_deleted', false);

            if (entityType && entityId) {
                const { data: relations } = await supabase
                    .from('document_relations')
                    .select('document_id')
                    .eq('entity_type', entityType)
                    .eq('entity_id', entityId);

                const docIds = relations?.map((r: any) => r.document_id) || [];

                if (docIds.length > 0) {
                    query = query.in('id', docIds);
                } else {
                    return [];
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data as Document[];
        },
    });
}

interface UploadDocumentParams {
    file: File;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    notes?: string;
    entityType: 'client' | 'property' | 'operation' | 'rental';
    entityId: number;
}

export function useUploadDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, name, type, status, notes, entityType, entityId }: UploadDocumentParams) => {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const filePath = `${entityType}/${entityId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) {
                console.error("DMS: Storage Upload Error", uploadError);
                throw new Error(`Error de almacenamiento: ${uploadError.message}. Verifique que el bucket 'documents' exista y tenga permisos.`);
            }

            // 2. Create Document record
            const { data: doc, error: docError } = await supabase
                .from('documents')
                .insert({
                    name,
                    type,
                    status,
                    storage_path: filePath,
                    notes,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select()
                .single();

            if (docError) {
                console.error("DMS: Database Record Error", docError);
                throw new Error(`Error de base de datos (documento): ${docError.message}`);
            }

            // 3. Create Relation
            const { error: relError } = await supabase
                .from('document_relations')
                .insert({
                    document_id: doc.id,
                    entity_type: entityType,
                    entity_id: entityId
                });

            if (relError) {
                console.error("DMS: Relation Error", relError);
                throw new Error(`Error de vinculación: ${relError.message}`);
            }

            // 4. Create Initial Version
            const { error: verError } = await supabase
                .from('document_versions')
                .insert({
                    document_id: doc.id,
                    storage_path: filePath,
                    version_number: 1,
                    change_description: 'Carga inicial',
                    created_by: doc.created_by
                });

            if (verError) {
                console.error("DMS: Version History Error", verError);
                // We don't throw here to avoid failing the whole process if only versioning fails, 
                // but in a production system we might want to.
            }

            return doc;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success('Documento guardado en el sistema');
        },
        onError: (error: any) => {
            toast.error(`Error al procesar el archivo: ${error.message}`);
        }
    });
}

export function useUpdateDocumentStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: DocumentStatus }) => {
            const { error } = await supabase
                .from('documents')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success('Estado actualizado');
        }
    });
}

export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('documents')
                .update({ is_deleted: true, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success('Documento removido del sistema');
        },
        onError: (error: any) => {
            toast.error(`Error al remover documento: ${error.message}`);
        }
    });
}
