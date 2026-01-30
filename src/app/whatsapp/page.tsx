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
    Wifi, WifiOff, RefreshCw, LogOut, MessageCircle, ShieldCheck, Zap, Smartphone, ExternalLink, QrCode
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConversationList } from "@/components/whatsapp/ConversationList";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";
import { FilterToolbar } from "@/components/whatsapp/FilterToolbar";
import { Badge } from "@/components/ui/badge";
import { ConnectionsPanel } from "@/components/whatsapp/ConnectionsPanel";
import { Search } from "lucide-react";

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
            const searchLower = search.toLowerCase();
            const matchesSearch =
                conv.contact_name?.toLowerCase().includes(searchLower) ||
                conv.phone_number?.includes(search) ||
                conv.lead?.full_name?.toLowerCase().includes(searchLower) ||
                conv.last_message_content?.toLowerCase().includes(searchLower);

            if (search && !matchesSearch) return false;
            if (roleFilter !== 'all') {
                if (conv.lead?.lead_type !== roleFilter) return false;
            }
            if (tagFilters.length > 0) {
                const convTagIds = conv.tags?.map(t => t.id) || [];
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
            window.location.reload();
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

    useEffect(() => {
        if (isConnected) {
            fetch('/api/whatsapp/sync', { method: 'POST' })
                .then(() => refetchSession())
                .catch(console.error);
        }
    }, [isConnected]);

    useEffect(() => {
        if (!isConnected) return;
        const interval = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            fetch('/api/whatsapp/sync', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data?.synced > 0) {
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
                <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-black text-sm uppercase tracking-widest text-muted-foreground animate-pulse">Inyectando Protocolos WhatsApp...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!isConnected) {
        return (
            <DashboardLayout>
                <div className="h-full flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                    <div className="max-w-xl w-full relative z-10">
                        <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-12 text-center border-none shadow-[0_32px_120px_-10px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                            {/* Gradient Header Decor */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#25D366] via-primary to-[#25D366]" />

                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse" />
                                <div className="relative h-28 w-28 bg-[#25D366] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-[#25D366]/30 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                                    <MessageCircle className="h-14 w-14 text-white fill-white/10" />
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <Badge className="bg-emerald-100 text-emerald-600 border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 h-8">
                                    Real-time CRM Sync
                                </Badge>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">Vincular WhatsApp</h1>
                                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-sm mx-auto">
                                    Conecta tu cuenta para sincronizar leads, propiedades y mensajes automáticamente.
                                </p>
                            </div>

                            {session?.qr ? (
                                <div className="relative group/qr">
                                    <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                                    <div className="relative bg-white p-8 rounded-[3rem] inline-block shadow-2xl border-4 border-gray-50 mb-8 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.02]" />
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(session.qr)}`}
                                            alt="QR Code"
                                            className="w-56 h-56 relative z-10"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 mb-8">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600 animate-pulse flex items-center justify-center gap-2">
                                            <QrCode className="h-3 w-3" /> Esperando escaneo del dispositivo
                                        </p>
                                    </div>
                                </div>
                            ) : session?.status === 'STARTING' || session?.status === 'INITIALIZING' ? (
                                <div className="py-12 flex flex-col items-center gap-6">
                                    <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center relative">
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Autenticando Handshake...</p>
                                </div>
                            ) : (
                                <div className="py-10">
                                    <Button
                                        onClick={handleStartSession}
                                        className="h-16 px-12 rounded-full font-black text-sm uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Generar Nuevo QR
                                    </Button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/50">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-foreground">Seguridad</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">End-to-End</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-left">
                                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-foreground">Sync</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Ultra Fast</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const [showConnections, setShowConnections] = useState(true);

    return (
        <DashboardLayout noPadding>
            <div className="h-full flex px-0 bg-[#F8FAFC] font-sans overflow-hidden">

                {/* LEFT COLUMN: Conversation List & Search */}
                <div className="w-[320px] 2xl:w-[360px] flex flex-col border-r border-border/40 bg-white shrink-0 relative z-20">
                    <div className="p-4 flex flex-col gap-4">
                        {/* Header & New Chat */}
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg text-foreground tracking-tight">Messaging</h2>
                            <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                <MessageCircle className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search or Ask AI..."
                                className="w-full h-10 pl-9 pr-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none placeholder:text-muted-foreground/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <ConversationList
                        conversations={filteredConversations}
                        selectedId={selectedConvId}
                        onSelect={setSelectedConvId}
                        isLoading={isLoadingConversations}
                    />
                </div>

                {/* CENTER COLUMN: Active Chat */}
                <div className="flex-1 flex flex-col min-w-0 bg-white/50 relative z-10 shadow-xl shadow-black/5 mx-4 my-2 rounded-3xl overflow-hidden border border-border/20">
                    <ChatWindow
                        conversation={selectedConv}
                        messages={messages || []}
                        isLoading={isLoadingMessages}
                        isSending={isSending}
                        onSendMessage={handleSend}
                    />
                </div>

                {/* RIGHT COLUMN: Connections Panel */}
                {selectedConvId && (
                    <div className={cn(
                        "transition-all duration-300 ease-in-out relative z-10",
                        showConnections ? "w-[300px] 2xl:w-[350px] mr-2" : "w-0 opacity-0 overflow-hidden"
                    )}>
                        <ConnectionsPanel
                            isOpen={showConnections}
                            onClose={() => setShowConnections(false)}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
