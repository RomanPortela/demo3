import { ContentItem } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Send, Instagram, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ContentCardProps {
    item: ContentItem;
    onEdit?: (item: ContentItem) => void;
}

export function ContentCard({ item, onEdit }: ContentCardProps) {
    const statusConfig = {
        draft: { color: "text-muted-foreground", bg: "bg-muted", label: "Borrador" },
        scheduled: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Programado" },
        published: { color: "text-green-500", bg: "bg-green-500/10", label: "Publicado" }
    };

    const typeConfig: Record<string, { icon: any, label: string }> = {
        post: { icon: Instagram, label: "Post" },
        email: { icon: Mail, label: "Email" },
        campaign: { icon: Send, label: "Campaña" }
    };

    const TypeIcon = typeConfig[item.content_type]?.icon || FileText;

    return (
        <Card
            className="glass-card cursor-pointer group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md h-auto min-h-[180px] flex flex-col"
            onClick={() => onEdit?.(item)}
        >
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <TypeIcon className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 border-border/50 font-medium uppercase shrink-0">
                        {typeConfig[item.content_type]?.label || item.content_type}
                    </Badge>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-5 border-none font-bold uppercase shrink-0", statusConfig[item.status].bg, statusConfig[item.status].color)}>
                    {statusConfig[item.status].label}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                    {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {item.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-3 border-t border-border/30 mt-auto">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {item.scheduled_at ? (
                        <span className="truncate">Prog: {format(new Date(item.scheduled_at), "d MMM HH:mm", { locale: es })}</span>
                    ) : (
                        <span className="truncate">Creado: {format(new Date(item.created_at), "d MMM", { locale: es })}</span>
                    )}
                </div>
            </CardContent>
            {/* Hover effect highlight */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Card>
    );
}
