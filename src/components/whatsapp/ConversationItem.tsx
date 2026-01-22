import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { WhatsAppConversation } from "@/types";
import { format } from "date-fns";
import { Home, User, Check, CheckCheck } from "lucide-react";
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
                "w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all border border-transparent group relative",
                isSelected
                    ? "bg-primary/5 border-primary/20 shadow-[0_4px_20px_-4px_rgba(var(--primary),0.1)]"
                    : "hover:bg-accent/40"
            )}
        >
            {isSelected && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
            )}

            <div className="relative shrink-0">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                    <AvatarImage src={lead?.avatar_url || conversation.avatar_url} />
                    <AvatarFallback className={cn(
                        "font-bold text-sm",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                        {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {lead && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center shadow-sm border border-border/50">
                        {lead.lead_type === 'propietario'
                            ? <Home className="h-3 w-3 text-orange-500" />
                            : <User className="h-3 w-3 text-blue-500" />
                        }
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        "font-bold text-sm truncate flex items-center gap-1.5",
                        isSelected ? "text-primary" : "text-foreground"
                    )}>
                        {name}
                    </span>
                    {conversation.last_message_at && (
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap font-medium">
                            {format(new Date(conversation.last_message_at), "HH:mm")}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground/80 truncate flex-1 pr-2 font-medium">
                        {showPhone && <span className="block text-[10px] opacity-60 font-bold tracking-tight">+{conversation.phone_number}</span>}
                        <span className="line-clamp-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            {conversation.last_message_content ? (
                                <>
                                    {conversation.last_message_content}
                                </>
                            ) : <span className="italic opacity-50">Haga clic para ver mensajes...</span>}
                        </span>
                    </p>

                    {(conversation.unread_count || 0) > 0 && (
                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-[10px] font-black text-primary-foreground flex items-center justify-center shadow-lg animate-bounce-subtle">
                            {conversation.unread_count}
                        </span>
                    )}
                </div>

                {(lead || (conversation.tags && conversation.tags.length > 0)) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {lead && (
                            <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border shadow-sm",
                                lead.status === 'Nuevo' ? "bg-blue-500/10 text-blue-600 border-blue-200/50" :
                                    lead.status === 'En Negociación' ? "bg-orange-500/10 text-orange-600 border-orange-200/50" :
                                        "bg-gray-100/50 text-gray-500 border-gray-200/50"
                            )}>
                                {lead.status}
                            </span>
                        )}
                        {conversation.tags?.map(tag => (
                            <span
                                key={tag.id}
                                className="text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border bg-card/50 text-foreground flex items-center gap-1 shadow-sm"
                                style={{ borderColor: tag.color + '40', borderLeftWidth: '3px', borderLeftColor: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
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
