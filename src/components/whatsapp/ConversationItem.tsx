'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { WhatsAppConversation } from "@/types";
import { format } from "date-fns";
import { Home, User, Check, CheckCheck, Clock } from "lucide-react";
import { memo } from "react";

interface ConversationItemProps {
    conversation: WhatsAppConversation;
    isSelected: boolean;
    onClick: () => void;
}

export const ConversationItem = memo(({ conversation, isSelected, onClick }: ConversationItemProps) => {
    const lead = conversation.lead;
    const name = lead?.full_name || conversation.contact_name || `+${conversation.phone_number}`;
    const showPhone = !!(lead?.full_name || conversation.contact_name);

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all group relative mb-2 border border-transparent",
                isSelected
                    ? "bg-purple-50/50 border-primary/20 shadow-sm" // Active state
                    : "bg-transparent hover:bg-gray-100/80 hover:border-border/50" // Inactive state
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                    <AvatarImage src={lead?.avatar_url || conversation.avatar_url} />
                    <AvatarFallback className={cn(
                        "font-bold text-xs",
                        isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                    )}>
                        {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {/* Online Indicator (Mocked for now) or Lead Type */}
                <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white flex items-center justify-center",
                    lead ? "bg-white" : "bg-emerald-500" // Green dot if just a contact (simulating online)
                )}>
                    {lead && (
                        lead.lead_type === 'propietario'
                            ? <Home className="h-2 w-2 text-indigo-600" />
                            : <User className="h-2 w-2 text-primary" />
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        "font-bold text-sm truncate tracking-tight transition-colors",
                        isSelected ? "text-foreground" : "text-gray-700"
                    )}>
                        {name}
                    </span>
                    {conversation.last_message_at && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                            {format(new Date(conversation.last_message_at), "HH:mm")}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-0.5">
                    <p className={cn(
                        "text-xs truncate flex-1 pr-4",
                        (conversation.unread_count || 0) > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                        <span className="line-clamp-1 opacity-90">
                            {conversation.last_message_content || "..."}
                        </span>
                    </p>

                    {(conversation.unread_count || 0) > 0 && (
                        <span className="h-4 min-w-[16px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                            {conversation.unread_count}
                        </span>
                    )}
                </div>
            </div>

            {/* Left Border Accent for Hover/Active */}
            <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary transition-all duration-300",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100" // Show on active or hover
            )} />
        </button>
    );
}, (prev, next) => {
    return prev.isSelected === next.isSelected &&
        prev.conversation.id === next.conversation.id &&
        prev.conversation.last_message_at === next.conversation.last_message_at &&
        prev.conversation.unread_count === next.conversation.unread_count &&
        prev.conversation.last_message_content === next.conversation.last_message_content &&
        prev.conversation.avatar_url === next.conversation.avatar_url;
});
