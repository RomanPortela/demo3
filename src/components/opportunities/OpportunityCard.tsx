import { Opportunity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Lightbulb, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OpportunityCardProps {
    opportunity: Opportunity;
    onEdit?: (opportunity: Opportunity) => void;
}

export function OpportunityCard({ opportunity, onEdit }: OpportunityCardProps) {
    const statusConfig = {
        abierta: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Abierta" },
        ejecutada: { color: "text-orange-500", bg: "bg-orange-500/10", label: "Ejecutada" },
        cerrada: { color: "text-green-500", bg: "bg-green-500/10", label: "Cerrada" }
    };

    return (
        <Card
            className="glass-card cursor-pointer group relative overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-amber-500"
            onClick={() => onEdit?.(opportunity)}
        >
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col">
                    <CardTitle className="text-sm font-bold truncate max-w-[160px] group-hover:text-primary transition-colors">
                        {opportunity.client_name}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(opportunity.created_at), "d MMM yyyy", { locale: es })}</span>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-5 border-none font-bold uppercase tracking-wider", statusConfig[opportunity.status].bg, statusConfig[opportunity.status].color)}>
                    {statusConfig[opportunity.status].label}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                {opportunity.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{opportunity.phone}</span>
                    </div>
                )}

                {opportunity.ai_advice && (
                    <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-1 text-amber-600 font-bold text-xs uppercase tracking-wide">
                            <Lightbulb className="h-3.5 w-3.5" />
                            <span>Consejo IA</span>
                        </div>
                        <p className="text-xs text-foreground/80 italic leading-relaxed">
                            "{opportunity.ai_advice}"
                        </p>
                    </div>
                )}

                {opportunity.ai_message && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/30 p-2 rounded-lg">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{opportunity.ai_message}</span>
                    </div>
                )}
            </CardContent>
            {/* Hover effect highlight */}
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Card>
    );
}
