'use client';

import { type Client } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Calendar, DollarSign, User, Crown, MessageCircle, MoreVertical, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface ClientCardProps {
    client: Client;
    onEdit?: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
    const statusColors: Record<string, string> = {
        in_progress: "bg-blue-500 text-white",
        sold: "bg-emerald-500 text-white",
        rented: "bg-indigo-600 text-white",
        cancelled: "bg-rose-500 text-white",
    };

    const statusLabels: Record<string, string> = {
        in_progress: "En Proceso",
        sold: "Vendido",
        rented: "Alquilado",
        cancelled: "Cancelado",
    };

    const isContractDueSoon = client.next_contract_date &&
        isBefore(new Date(client.next_contract_date), addDays(new Date(), 30));

    const customerStatusColors: Record<string, string> = {
        'Activo': "bg-emerald-100 text-emerald-600",
        'Dormido': "bg-amber-100 text-amber-600",
        'Ex cliente': "bg-rose-100 text-rose-600",
        'Inversor': "bg-indigo-100 text-indigo-600",
    };

    const fullName = `${client.owner_first_name || ""} ${client.owner_last_name || ""}`.trim() || "Consumidor Final";
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <Card
            className="group relative overflow-hidden bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-2xl hover:shadow-black/5 border-border/50 rounded-[2.5rem] transition-all duration-500 cursor-pointer border-2 hover:border-primary/20"
            onClick={() => onEdit?.(client)}
        >
            <div className="flex flex-col md:flex-row h-full">
                {/* Visual Avatar Section */}
                <div className="w-full md:w-56 p-8 flex flex-col items-center justify-center gap-4 bg-muted/10 relative overflow-hidden">
                    <div className="relative h-24 w-24">
                        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-white flex items-center justify-center shadow-xl">
                            {client.is_vip ? (
                                <Crown className="h-10 w-10 text-primary animate-pulse" />
                            ) : (
                                <span className="text-3xl font-black text-primary opacity-60">{initials}</span>
                            )}
                        </div>
                        {/* Connection status dot */}
                        <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                    </div>

                    <Badge className={cn("border-none text-[9px] font-black uppercase tracking-widest px-3 h-6 flex items-center shadow-sm", statusColors[client.property_status] || 'bg-gray-500 text-white')}>
                        {statusLabels[client.property_status]}
                    </Badge>

                    {client.is_vip && (
                        <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                            VIP
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-8 flex flex-col justify-between gap-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest border-none px-2 rounded-full", customerStatusColors[client.customer_status || 'Activo'])}>
                                    {client.customer_status || 'Activo'}
                                </Badge>
                                <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">Client Identity</span>
                            </div>
                            <h3 className="font-black text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors leading-none">
                                {fullName}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground/60 font-medium text-xs mt-2">
                                <MapPin className="h-3.5 w-3.5 text-primary/40" />
                                <span className="truncate uppercase tracking-wider">{client.property_type}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white shadow-sm border border-border/50 hover:text-primary transition-all">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50/50 rounded-2xl border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer group/data">
                            <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover/data:bg-primary/10 transition-colors">
                                <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-black text-foreground tabular-nums">{client.owner_phone || client.property_phone || "+54 9 11 ..."}</span>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50/50 rounded-2xl border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer group/data">
                            <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover/data:bg-primary/10 transition-colors">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-black text-foreground truncate max-w-[140px] lowercase">{client.email || "no-email@inmoaria.com"}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-dotted border-border/50">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Volumen</span>
                                <span className="text-lg font-black text-foreground tracking-tighter">{client.transactions_count || 1} Ops.</span>
                            </div>
                            {client.monthly_rent && (
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Renta Mensual</span>
                                    <span className="text-lg font-black text-emerald-600 tracking-tighter">
                                        {client.monthly_rent.toLocaleString('es-AR', { style: 'currency', currency: 'USD' })}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button size="icon" className="h-12 w-12 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-90 transition-all">
                                <MessageCircle className="h-6 w-6" />
                            </Button>
                            <Button size="icon" className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-90 transition-all">
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract alert pill if due soon */}
            {isContractDueSoon && (
                <div className="absolute top-4 right-4 animate-bounce-subtle">
                    <Badge className="bg-rose-500 text-white border-none font-black text-[8px] uppercase tracking-widest px-3">
                        Vencimiento Próximo
                    </Badge>
                </div>
            )}
        </Card>
    );
}
