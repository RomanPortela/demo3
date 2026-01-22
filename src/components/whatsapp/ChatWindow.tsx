import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { WhatsAppConversation, WhatsAppMessage, Tag } from "@/types";
import { format } from "date-fns";
import {
    Search, MoreVertical, Paperclip, Send, RefreshCw,
    Home, User, MessageSquare, Tag as TagIcon, Plus, X, Trash2, Check
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    useTags,
    useCreateTag,
    useAssignTag,
    useRemoveTag,
    useDeleteTag
} from "@/lib/supabase/queries";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatWindowProps {
    conversation?: WhatsAppConversation;
    messages?: WhatsAppMessage[];
    isLoading: boolean;
    isSending: boolean;
    onSendMessage: (content: string) => void;
}

export function ChatWindow({
    conversation,
    messages,
    isLoading,
    isSending,
    onSendMessage
}: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: allTags } = useTags();
    const createTagMutation = useCreateTag();
    const deleteTagMutation = useDeleteTag();
    const assignTagMutation = useAssignTag();
    const removeTagMutation = useRemoveTag();

    const [newTagName, setNewTagName] = useState("");

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            await createTagMutation.mutateAsync({
                name: newTagName,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}` // Random color
            });
            setNewTagName("");
            toast.success("Etiqueta creada");
        } catch (error) {
            toast.error("Error al crear etiqueta");
        }
    };

    const handleDeleteTag = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar esta etiqueta permanentemente?")) return;
        try {
            await deleteTagMutation.mutateAsync(id);
            toast.success("Etiqueta eliminada");
        } catch (error) {
            toast.error("Error al eliminar etiqueta");
        }
    };

    const toggleTag = async (tag: Tag) => {
        if (!conversation) return;
        const isAssigned = conversation.tags?.some(t => t.id === tag.id);
        try {
            if (isAssigned) {
                await removeTagMutation.mutateAsync({ chatId: conversation.id, tagId: tag.id });
            } else {
                await assignTagMutation.mutateAsync({ chatId: conversation.id, tagId: tag.id });
            }
        } catch (error) {
            toast.error("Error al actualizar etiquetas");
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "auto", block: "end" });
        }
    }, [messages?.length]);

    const handleSend = () => {
        if (!newMessage.trim() || isSending) return;
        onSendMessage(newMessage);
        setNewMessage("");
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="h-24 w-24 bg-primary/5 rounded-[40px] flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-[40px] animate-ping opacity-20" />
                    <MessageSquare className="h-10 w-10 text-primary opacity-40" />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">Bandeja de Entrada</h3>
                <p className="max-w-xs text-sm text-muted-foreground font-medium">
                    Selecciona un chat para ver el historial y responder.
                </p>
            </div>
        );
    }

    const lead = conversation.lead;
    const name = lead?.full_name || conversation.contact_name || `+${conversation.phone_number}`;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-card/50">
            {/* Chat Header */}
            <div className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-card/40 backdrop-blur-xl z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                        <AvatarImage src={lead?.avatar_url || conversation.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-sm flex items-center gap-2">
                            {name}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {lead && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded border font-medium flex items-center gap-1",
                                    lead.lead_type === 'propietario'
                                        ? "bg-orange-50 text-orange-600 border-orange-200"
                                        : "bg-blue-50 text-blue-600 border-blue-200"
                                )}>
                                    {lead.lead_type === 'propietario'
                                        ? <Home className="h-3 w-3" />
                                        : <User className="h-3 w-3" />
                                    }
                                    {lead.lead_type}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                En línea
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1 items-center">
                    <div className="flex gap-1 mr-2 px-2 border-r border-border/40">
                        {conversation.tags?.map(tag => (
                            <span
                                key={tag.id}
                                className="text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap"
                                style={{ backgroundColor: tag.color + '20', color: tag.color, border: `1px solid ${tag.color}40` }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                                <TagIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 rounded-2xl shadow-xl border-border/40" align="end">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Etiquetas</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                                    {allTags?.map(tag => {
                                        const isAssigned = conversation.tags?.some(t => t.id === tag.id);
                                        return (
                                            <div key={tag.id} className="group relative">
                                                <button
                                                    onClick={() => toggleTag(tag)}
                                                    className={cn(
                                                        "text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all border pr-6 w-full text-left",
                                                        isAssigned
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-accent/30 text-muted-foreground border-transparent hover:border-border"
                                                    )}
                                                    style={!isAssigned ? { borderLeft: `3px solid ${tag.color}` } : {}}
                                                >
                                                    {tag.name}
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteTag(tag.id, e)}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                                                >
                                                    <Trash2 className="h-2.5 w-2.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {(!allTags || allTags.length === 0) && (
                                        <p className="text-[10px] text-muted-foreground italic p-2">No hay etiquetas creadas.</p>
                                    )}
                                </div>
                                <div className="pt-2 border-t border-border/40">
                                    <div className="flex items-center gap-1">
                                        <Input
                                            placeholder="Nueva etiqueta..."
                                            className="h-8 text-xs rounded-lg"
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                                        />
                                        <Button
                                            size="icon"
                                            className="h-8 w-8 shrink-0 rounded-lg"
                                            onClick={handleCreateTag}
                                            disabled={!newTagName.trim() || createTagMutation.isPending}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messaging Canvas */}
            <ScrollArea className="flex-1 bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col gap-4 p-6 min-h-full">
                    <div className="flex-1" /> {/* Spacer to push messages to bottom if few */}
                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {messages?.map((msg) => {
                        const isOutgoing = msg.direction === 'outgoing';
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "max-w-[80%] flex flex-col gap-1 relative group animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    isOutgoing ? "self-end items-end" : "self-start items-start"
                                )}
                            >
                                <div className={cn(
                                    "px-4 py-3 text-sm shadow-sm leading-relaxed break-words relative transition-transform hover:scale-[1.005]",
                                    isOutgoing
                                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                        : "bg-slate-200 dark:bg-blue-950 text-foreground dark:text-blue-50 rounded-2xl rounded-tl-sm border-none shadow-none"
                                )}>
                                    {msg.content}
                                </div>
                                <div className="mt-0.5 flex items-center gap-1.5 px-1 opacity-60">
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        {format(new Date(msg.timestamp), "HH:mm")}
                                    </span>
                                    {isOutgoing && (
                                        <div className="flex -space-x-1.5">
                                            <Check className={cn("h-3 w-3", msg.status === 'read' ? "text-blue-500" : "text-muted-foreground")} />
                                            <Check className={cn("h-3 w-3", msg.status === 'read' ? "text-blue-500" : "text-muted-foreground")} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} className="h-2" />
                </div>
            </ScrollArea>

            {/* Smart Composer */}
            <div className="p-4 bg-background/60 backdrop-blur-md border-t border-border/40 shrink-0">
                <div className="flex items-end gap-2 p-2 bg-background border border-input rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary shrink-0">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <textarea
                        rows={1}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-transparent border-none focus:ring-0 p-2 text-sm max-h-32 min-h-[36px] resize-none placeholder:text-muted-foreground focus-visible:ring-0 outline-none"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className={cn(
                            "h-9 w-9 rounded-xl shrink-0 transition-all",
                            !newMessage.trim() && "opacity-50 grayscale"
                        )}
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                    >
                        {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
