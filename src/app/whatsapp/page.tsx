'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    useWhatsAppConversations,
    useWhatsAppMessagesExtended,
    useWhatsAppSessionState,
    useLogoutWhatsApp,
    useTags,
    useMarkAsRead
} from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import {
    Wifi, WifiOff, RefreshCw, LogOut
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConversationList } from "@/components/whatsapp/ConversationList";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";
import { FilterToolbar } from "@/components/whatsapp/FilterToolbar";

export default function WhatsAppPage() {
    const queryClient = useQueryClient();
    const { data: session, isLoading: isLoadingSession, refetch: refetchSession } = useWhatsAppSessionState();
    const { data: conversations, isLoading: isLoadingConversations } = useWhatsAppConversations();
    const { data: allTags } = useTags();
    const logoutMutation = useLogoutWhatsApp();
    const markAsReadMutation = useMarkAsRead();

    const [selectedConvId, setSelectedConvId] = useState<number | undefined>();
    const { data: messages, isLoading: isLoadingMessages } = useWhatsAppMessagesExtended(selectedConvId);

    // Mark as read when selection changes or new messages arrive
    useEffect(() => {
        if (selectedConvId) {
            const conv = conversations?.find(c => c.id === selectedConvId);
            if (conv && (conv.unread_count || 0) > 0) {
                markAsReadMutation.mutate(selectedConvId);
            }
        }
    }, [selectedConvId, messages?.length, conversations]);

    const [isSending, setIsSending] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Filter state
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [tagFilters, setTagFilters] = useState<number[]>([]);

    const filteredConversations = useMemo(() => {
        if (!conversations) return [];
        return conversations.filter(conv => {
            // 1. Search Filter (Name, Phone, or Last Message)
            const searchLower = search.toLowerCase();
            const matchesSearch =
                conv.contact_name?.toLowerCase().includes(searchLower) ||
                conv.phone_number?.includes(search) ||
                conv.lead?.full_name?.toLowerCase().includes(searchLower) ||
                conv.last_message_content?.toLowerCase().includes(searchLower);

            if (search && !matchesSearch) return false;

            // 2. Role Filter
            if (roleFilter !== 'all') {
                if (conv.lead?.lead_type !== roleFilter) return false;
            }

            // 3. Tag Filter
            if (tagFilters.length > 0) {
                const convTagIds = conv.tags?.map(t => t.id) || [];
                // Must have at least one of the selected tags (OR logic)
                // Or must have ALL of them? (AND logic). Let's do OR for now as it's more common.
                const hasTag = tagFilters.some(tid => convTagIds.includes(tid));
                if (!hasTag) return false;
            }

            return true;
        });
    }, [conversations, search, roleFilter, tagFilters]);

    const isConnected = session?.status === 'CONNECTED';
    const selectedConv = conversations?.find(c => c.id === selectedConvId);

    const handleSend = async (content: string) => {
        if (!content.trim() || !selectedConvId || !selectedConv || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: selectedConv.phone_number,
                    content: content,
                    conversationId: selectedConv.id
                })
            });

            if (!response.ok) throw new Error('Error al enviar mensaje');

            // Invalidate queries to show the new message immediately
            queryClient.invalidateQueries({ queryKey: ['whatsapp_messages_ext', selectedConvId] });
            queryClient.invalidateQueries({ queryKey: ['whatsapp_conversations'] });

            toast.success("Mensaje enviado");
        } catch (error) {
            toast.error("No se pudo enviar el mensaje");
        } finally {
            setIsSending(false);
        }
    };

    const handleStartSession = async () => {
        try {
            await fetch('/api/whatsapp/session', { method: 'POST' });
            refetchSession();
            toast.info("Iniciando sesión...");
        } catch (error) {
            toast.error("Error al iniciar sesión");
        }
    };

    const handleLogout = async () => {
        const tid = toast.loading("Desvinculando WhatsApp...");
        try {
            await logoutMutation.mutateAsync();
            toast.success("WhatsApp desvinculado correctamente", { id: tid });
            window.location.reload(); // Reload to show QR screen cleanly
        } catch (error) {
            toast.error("Error al desvincular", { id: tid });
        }
    };

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const tid = toast.loading("Sincronizando chats...");
        try {
            const response = await fetch('/api/whatsapp/sync', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                toast.success(`Sincronización completada: ${data.synced} nuevos chats`, { id: tid });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error("Error al sincronizar chats", { id: tid });
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync on mount if connected (once)
    const hasSyncedRef = useRef(false);
    useEffect(() => {
        if (isConnected && !hasSyncedRef.current) {
            hasSyncedRef.current = true;
            // Initial silent sync
            fetch('/api/whatsapp/sync', { method: 'POST' })
                .then(() => {
                    refetchSession();
                })
                .catch(console.error);
        }
    }, [isConnected]);

    // Periodic Background Sync (every 60 seconds) to ensure consistency
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            // Only sync if the tab is visible to save resources
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

            fetch('/api/whatsapp/sync', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data?.synced > 0) {
                        // If there are new items, invalidate queries
                        queryClient.invalidateQueries({ queryKey: ['whatsapp_conversations'] });
                        if (selectedConvId) {
                            queryClient.invalidateQueries({ queryKey: ['whatsapp_messages_ext', selectedConvId] });
                        }
                    }
                })
                .catch(err => console.error("Periodic sync failed", err));
        }, 60000);

        return () => clearInterval(interval);
    }, [isConnected, selectedConvId, queryClient]);

    if (isLoadingSession) {
        return (
            <DashboardLayout>
                <div className="h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!isConnected) {
        return (
            <DashboardLayout>
                <div className="h-full flex items-center justify-center p-6">
                    <div className="max-w-md w-full glass-panel rounded-[32px] p-8 text-center space-y-6 border-primary/20 shadow-2xl">
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <WifiOff className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">WhatsApp no conectado</h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            Escanea el código QR desde tu aplicación de WhatsApp para sincronizar el CRM.
                        </p>

                        {session?.qr ? (
                            <div className="bg-white p-4 rounded-3xl inline-block shadow-inner border-8 border-accent/20">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(session.qr)}`}
                                    alt="QR Code"
                                    className="w-60 h-60"
                                />
                            </div>
                        ) : session?.status === 'STARTING' || session?.status === 'INITIALIZING' ? (
                            <div className="py-8 flex flex-col items-center gap-4">
                                <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center animate-pulse">
                                    <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground italic">Iniciando sesión... esto puede tardar unos segundos</p>
                            </div>
                        ) : (
                            <div className="py-8">
                                <Button
                                    onClick={handleStartSession}
                                    className="rounded-2xl h-12 px-8 font-bold uppercase tracking-widest text-xs"
                                >
                                    Generar Código QR
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-4 pt-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                            <span className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin" /> Esperando escaneo</span>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout noPadding>
            <div className="h-full flex overflow-hidden bg-background">
                {/* Conversations Sidebar */}
                <div className="w-[380px] flex flex-col overflow-hidden shrink-0 border-r border-border/40 bg-card/20 backdrop-blur-xl">
                    <div className="p-4 border-b border-border/40 flex items-center justify-between bg-card/40 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <h2 className="font-black text-xl tracking-tight">Chats</h2>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                                onClick={handleLogout}
                                title="Desvincular WhatsApp"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn(
                                    "h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all",
                                    isSyncing && "animate-spin"
                                )}
                                onClick={handleSync}
                                disabled={isSyncing}
                                title="Sincronizar ahora"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        <FilterToolbar
                            search={search}
                            setSearch={setSearch}
                            roleFilter={roleFilter}
                            setRoleFilter={setRoleFilter}
                            tagFilters={tagFilters}
                            setTagFilters={setTagFilters}
                            allTags={allTags}
                        />
                        <div className="flex-1 overflow-hidden">
                            <ConversationList
                                conversations={filteredConversations}
                                selectedId={selectedConvId}
                                onSelect={setSelectedConvId}
                                isLoading={isLoadingConversations}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Chat Interface */}
                <div className="flex-1 flex flex-col overflow-hidden relative bg-accent/5">
                    <ChatWindow
                        conversation={selectedConv}
                        messages={messages || []}
                        isLoading={isLoadingMessages}
                        isSending={isSending}
                        onSendMessage={handleSend}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
