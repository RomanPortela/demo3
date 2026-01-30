'use client';

import { usePropertyVisits } from "@/lib/supabase/queries";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Phone, Calendar, Mail, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyVisitsListProps {
    propertyId: number;
}

export function PropertyVisitsList({ propertyId }: PropertyVisitsListProps) {
    const { data: visits = [], isLoading } = usePropertyVisits(propertyId);

    if (isLoading) {
        return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Cargando historial de visitas...</div>;
    }

    if (visits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-muted/50 rounded-3xl bg-muted/5">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <UserCheck className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">Sin visitas registradas</h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                    Nadie ha visitado esta propiedad todavía. Registra una visita desde la ficha del Lead.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Historial de Visitas
                </h3>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {visits.length} Total
                </span>
            </div>

            <div className="grid gap-3">
                {visits.map((visit) => (
                    <div key={visit.id} className="group relative overflow-hidden bg-card/50 border border-muted/50 hover:border-primary/20 rounded-2xl transition-all duration-300">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="p-4 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <User className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold truncate text-foreground">
                                        {visit.lead?.full_name || "Lead Desconocido"}
                                    </h4>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-lg">
                                        {format(new Date(visit.interaction_date), "d MMM yyyy", { locale: es })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
                                    {visit.lead?.property_phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="h-3 w-3" />
                                            <span>{visit.lead.property_phone}</span>
                                        </div>
                                    )}
                                    {visit.lead?.source && (
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3 w-3" />
                                            <span className="capitalize">{visit.lead.source}</span>
                                        </div>
                                    )}
                                </div>

                                {visit.notes && (
                                    <div className="relative pl-3 border-l-2 border-primary/20">
                                        <p className="text-xs text-muted-foreground/80 italic line-clamp-2">
                                            "{visit.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
