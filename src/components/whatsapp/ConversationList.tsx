import { ScrollArea } from "@/components/ui/scroll-area";
import { WhatsAppConversation } from "@/types";
import { ConversationItem } from "./ConversationItem";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConversationListProps {
    conversations: WhatsAppConversation[];
    selectedId?: number;
    onSelect: (id: number) => void;
    isLoading: boolean;
}

export function ConversationList({ conversations, selectedId, onSelect, isLoading }: ConversationListProps) {
    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="h-12 w-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <p className="text-muted-foreground text-sm">No hay conversaciones activas.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden bg-transparent">
            <ScrollArea className="h-full">
                <div className="px-3 py-2 space-y-4">
                    {/* Mock Favorites Section - In real app, filter by favorite flag */}
                    <div className="space-y-1">
                        <h4 className="px-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Favorites</h4>
                        {/* Just showing first 2 as faves for demo */}
                        {conversations.slice(0, 2).map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedId === conv.id}
                                onClick={() => onSelect(conv.id)}
                            />
                        ))}
                    </div>

                    <div className="space-y-1">
                        <h4 className="px-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Direct Messages</h4>
                        {/* Showing rest */}
                        {conversations.slice(2).map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedId === conv.id}
                                onClick={() => onSelect(conv.id)}
                            />
                        ))}
                        {conversations.length <= 2 && (
                            <div className="px-4 py-8 text-center text-xs text-muted-foreground opacity-50">
                                No filtered results
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
