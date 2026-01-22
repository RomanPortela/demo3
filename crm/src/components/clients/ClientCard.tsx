import { type Client } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Calendar, DollarSign, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";

interface ClientCardProps {
    client: Client;
    onEdit?: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
    const statusColors: Record<string, string> = {
        in_progress: "bg-blue-500/10 text-blue-600",
        sold: "bg-green-500/10 text-green-600",
        rented: "bg-indigo-500/10 text-indigo-600",
        cancelled: "bg-destructive/10 text-destructive",
    };

    const statusLabels: Record<string, string> = {
        in_progress: "En Proceso",
        sold: "Vendido",
        rented: "Alquilado",
        cancelled: "Cancelado",
    };

    const isContractDueSoon = client.next_contract_date &&
        isBefore(new Date(client.next_contract_date), addDays(new Date(), 30));

    return (
        <Card
            className="glass-card cursor-pointer group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
            onClick={() => onEdit?.(client)}
        >
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold truncate max-w-[160px] group-hover:text-primary transition-colors">
                    {client.property_type}
                </CardTitle>
                <Badge variant="secondary" className={cn("text-[10px] px-2 h-5 border-none font-bold uppercase tracking-wider", statusColors[client.property_status])}>
                    {statusLabels[client.property_status]}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
                        <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-[10px]">
                            <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">
                            {client.owner_first_name || client.owner_last_name
                                ? `${client.owner_first_name || ""} ${client.owner_last_name || ""}`
                                : "Propietario no registrado"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2">
                    {(client.owner_phone || client.property_phone) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground group/phone">
                            <Phone className="h-3 w-3 group-hover/phone:text-primary transition-colors" />
                            <span className="truncate">{client.owner_phone || client.property_phone}</span>
                        </div>
                    )}
                    {client.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{client.email}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    {client.monthly_rent && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <DollarSign className="h-3.5 w-3.5 text-green-600" />
                            {client.monthly_rent.toLocaleString('es-AR', { style: 'currency', currency: 'USD' })}
                        </div>
                    )}

                    {client.next_contract_date && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ml-auto",
                            isContractDueSoon ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-primary"
                        )}>
                            <Calendar className="h-3 w-3" />
                            {format(new Date(client.next_contract_date), "d MMM", { locale: es })}
                        </div>
                    )}
                </div>
            </CardContent>
            {/* Hover effect highlight */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Card>
    );
}
