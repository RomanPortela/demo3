import { type Lead } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Copy, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isBefore, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface LeadCardProps {
    lead: Lead;
    onEdit?: (lead: Lead) => void;
}

export function LeadCard({ lead, onEdit }: LeadCardProps) {
    const getFollowUpStatus = (dateStr?: string) => {
        if (!dateStr) return { label: "Sin fecha", class: "bg-muted text-muted-foreground" };
        const date = new Date(dateStr);
        const today = new Date();
        if (isBefore(date, today) && !isSameDay(date, today)) return { label: "Atrasado", class: "bg-destructive/10 text-destructive border-destructive/20" };
        if (isSameDay(date, today)) return { label: "Hoy", class: "bg-orange-500/10 text-orange-600 border-orange-200" };
        return { label: format(date, "d MMM", { locale: es }), class: "bg-primary/5 text-primary border-primary/10" };
    };

    const followUp = getFollowUpStatus(lead.next_follow_up);
    const leadName = lead.full_name || (lead.owner_first_name || lead.owner_last_name ? `${lead.owner_first_name || ""} ${lead.owner_last_name || ""}` : "S/N");

    return (
        <Card
            className="group relative overflow-hidden glass-card border-none hover:ring-2 hover:ring-primary/20 transition-all duration-300 cursor-pointer"
            onClick={() => onEdit?.(lead)}
        >
            <CardContent className="p-4 space-y-3">
                {/* Header: Name and Status */}
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {leadName}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-tighter bg-primary/5 text-primary-foreground/70 border-primary/10">
                                {lead.lead_type === 'propietario'
                                    ? (lead.expected_price ? 'Vende' : 'Alquila')
                                    : (lead.max_budget ? 'Compra' : 'Busca')}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">
                                {lead.location || lead.area || "Sin zona"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", followUp.class)}>
                            {followUp.label}
                        </div>
                    </div>
                </div>

                {/* Body: Price/Budget and Property type */}
                <div className="flex items-end justify-between border-t border-border/40 pt-2 shadow-[0_-1px_0_rgba(0,0,0,0.02)]">
                    <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                            {lead.lead_type === 'propietario' ? 'Precio Esperado' : 'Presupuesto'}
                        </p>
                        <p className="font-black text-sm text-foreground tracking-tight">
                            {lead.lead_type === 'propietario'
                                ? `$${(lead.expected_price || 0).toLocaleString()}`
                                : `$${(lead.max_budget || 0).toLocaleString()}`}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <Badge variant="secondary" className="text-[10px] h-5 bg-card/80 border-none font-bold text-muted-foreground">
                            {lead.property_type || "Propiedad"}
                        </Badge>
                    </div>
                </div>

                {/* Footer: Agent and Source */}
                <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            <div className="h-6 w-6 rounded-full ring-2 ring-background bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary overflow-hidden">
                                <User className="h-3 w-3" />
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            {lead.source || "Web"}
                        </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary">
                            <Phone className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
        </Card>
    );
}
