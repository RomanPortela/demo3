'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { WhatsAppConversation, WhatsAppMessage, Tag } from "@/types";
import { format } from "date-fns";
import {
    Search, MoreVertical, Paperclip, Send, RefreshCw,
    Home, User, MessageSquare, Tag as TagIcon, Plus, X, Trash2, Check, CheckCheck, Smile, Shield, CheckSquare
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
import { Badge } from "@/components/ui/badge";

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

    const [isAriaThinking, setIsAriaThinking] = useState(false);
    const [optimisticMessages, setOptimisticMessages] = useState<WhatsAppMessage[]>([]);

    // Reset optimistic messages when real messages change (simple sync approach)
    useEffect(() => {
        setOptimisticMessages([]);
    }, [messages?.length]);

    const displayMessages = [...(messages || []), ...optimisticMessages];

    const handleAriaCall = async () => {
        if (!conversation) return;
        setIsAriaThinking(true);
        try {
            const response = await fetch('/api/aria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: conversation.phone_number,
                    message_history: messages?.slice(-5), // Send last 5 messages context
                    user_context: { role: 'agent' }
                })
            });
            const data = await response.json();

            if (data.success) {
                // Add optimistic message
                const newMsg: any = {
                    id: `aria-${Date.now()}`,
                    content: data.message,
                    direction: 'outgoing', // technically outgoing from system/agent
                    timestamp: new Date().toISOString(),
                    status: 'read',
                    is_aria: true // Custom flag for styling
                };
                setOptimisticMessages(prev => [...prev, newMsg]);
                // In a real app, you'd also save this to the DB here or let the backend do it
            }
        } catch (error) {
            toast.error("Aria no pudo responder en este momento");
        } finally {
            setIsAriaThinking(false);
        }
    };

    const handleSend = () => {
        if (!newMessage.trim() || isSending) return;
        onSendMessage(newMessage);
        setNewMessage("");
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full relative overflow-hidden bg-gray-50/10">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

                <div className="relative mb-10 group">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative h-32 w-32 bg-white rounded-[2.5rem] border border-gray-100 flex items-center justify-center shadow-2xl transition-transform duration-700 group-hover:scale-110">
                        <MessageSquare className="h-14 w-14 text-primary opacity-30" />
                    </div>
                </div>
                <h3 className="text-3xl font-black tracking-tighter mb-3">Messaging Cloud</h3>
                <p className="max-w-xs text-muted-foreground font-medium text-lg leading-relaxed">
                    Sincronización segura punto a punto activa. Escoge un hilo para comenzar.
                </p>
            </div>
        );
    }

    const lead = conversation.lead;
    const name = lead?.full_name || conversation.contact_name || `+${conversation.phone_number}`;

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[#F8FAFC] pointer-events-none" />

            {/* Chat Header */}
            <div className="h-16 px-6 flex items-center justify-between bg-white border-b border-border/40 z-20 shrink-0 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                        <AvatarImage src={lead?.avatar_url || conversation.avatar_url} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                            {name}
                            {lead && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-emerald-200 text-emerald-600 bg-emerald-50">
                                    {lead.lead_type}
                                </Badge>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] text-muted-foreground font-medium">Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <User className="h-4 w-4" />
                    </Button>
                    {/* Aria Helper Placeholder Toggle */}
                    <div className="w-px h-4 bg-border/60 mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messaging Canvas */}
            <ScrollArea className="flex-1 z-10">
                <div className="flex flex-col gap-4 p-6 min-h-full">
                    <div className="flex-1" />
                    {isLoading && (
                        <div className="flex justify-center py-4 opacity-50">
                            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}

                    {displayMessages.map((msg: any, index: number) => {
                        const isOutgoing = msg.direction === 'outgoing';
                        const isAria = msg.is_aria; // Check for custom flag

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "max-w-[85%] flex flex-col gap-1 relative group",
                                    isOutgoing ? "self-end items-end" : "self-start items-start"
                                )}
                            >
                                {isAria && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 mb-0.5 flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                                        Aria Suggestion
                                    </span>
                                )}
                                <div className={cn(
                                    "px-4 py-3 text-sm leading-relaxed shadow-sm relative transition-all duration-200",
                                    isAria
                                        ? "bg-gradient-to-br from-purple-50 to-white text-foreground border border-purple-100 rounded-2xl rounded-tr-sm shadow-purple-500/10"
                                        : isOutgoing
                                            ? "bg-[#F3E8FF] text-foreground rounded-2xl rounded-tr-sm" // My messages (Purple Light)
                                            : "bg-white text-foreground rounded-2xl rounded-tl-sm border border-border/40" // Other messages (White/Gray)
                                )}>
                                    {msg.content}
                                </div>
                                <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-medium text-muted-foreground mr-2">
                                        {format(new Date(msg.timestamp), "HH:mm")}
                                    </span>

                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-gray-100 text-muted-foreground hover:text-primary" title="Create Task" onClick={() => toast.success("Task created from message!")}>
                                        <CheckSquare className="h-3 w-3" />
                                    </Button>

                                    {isOutgoing && (
                                        <div className="flex items-center text-primary/60 ml-1">
                                            {msg.status === 'read' ? (
                                                <CheckCheck className="h-3 w-3" />
                                            ) : (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Aria Thinking Indicator */}
                    {isAriaThinking && (
                        <div className="self-start max-w-[85%] flex flex-col gap-1 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-4 py-3 bg-white border border-purple-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-xs font-medium text-purple-700">Aria is thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} className="h-px" />
                </div>
            </ScrollArea>

            {/* Smart Composer */}
            <div className="p-4 bg-white border-t border-border/40 shrink-0 z-20">
                <div className="flex items-end gap-2 bg-gray-50 border border-border/50 rounded-2xl p-2 shadow-inner focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/20 transition-all">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-white hover:text-foreground shrink-0 transition-all">
                        <Plus className="h-5 w-5" />
                    </Button>
                    <textarea
                        rows={1}
                        placeholder="Write a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-2.5 text-sm font-medium max-h-32 min-h-[44px] resize-none placeholder:text-muted-foreground/60 focus-visible:ring-0 outline-none leading-relaxed"
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

                    {/* Send Button or Aria Button logic could go here */}
                    <div className="flex items-center gap-1">
                        <Button
                            className={cn(
                                "h-10 px-4 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:opacity-90",
                                !newMessage.trim() && "hidden"
                            )}
                            onClick={handleSend}
                            disabled={isSending}
                        >
                            Send
                        </Button>

                        {/* ARIA Button - Always visible or when empty */}
                        {!newMessage.trim() && (
                            <Button
                                className="h-10 pl-3 pr-4 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white group relative overflow-hidden"
                                onClick={() => toast.info("Aria integration coming soon!")}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out" />
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-lg bg-white/20 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5c0-5 5-5 5-5" /></svg>
                                    </div>
                                    <span>Aria</span>
                                </div>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
