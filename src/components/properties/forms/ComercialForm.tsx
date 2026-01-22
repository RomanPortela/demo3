'use client';

import { useLeads, useVisits } from "@/lib/supabase/queries";
import { type Lead, type Property, type Visit } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MessageSquare, History, ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface ComercialFormProps {
    property?: Property;
}

export function ComercialForm({ property }: ComercialFormProps) {
    const { data: allLeads } = useLeads();
    const { data: visits } = useVisits(undefined, property?.id);

    // Filtering leads that are linked to this property
    const linkedLeads = (allLeads as Lead[])?.filter(lead =>
        lead.property_ids?.includes(property?.id || 0)
    ) || [];

    const handleOpenLead = (id: number) => {
        window.open(`/dashboard?lead=${id}`, '_blank');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            {/* Header Info */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-1">Actividad Comercial</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Gestión centralizada desde el módulo de Leads</p>
                </div>
                <Badge variant="outline" className="rounded-full bg-primary/5 border-primary/20 text-primary px-4 py-1.5 font-black text-[10px]">
                    {linkedLeads.length} INTERESADOS
                </Badge>
            </div>

            {/* Linked Leads List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 rounded-full bg-primary/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Prospectos Interesados</h3>
                </div>

                {linkedLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5">
                        <User className="h-10 w-10 text-muted-foreground/20 mb-4" />
                        <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Sin prospectos vinculados actualmente</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {linkedLeads.map((lead) => (
                            <Card key={lead.id} className="p-5 bg-background/50 border-muted/20 rounded-[2rem] hover:border-primary/30 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm truncate">{lead.full_name || lead.owner_phone}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="secondary" className="text-[9px] uppercase font-black px-2 py-0">
                                                {lead.status || 'Nuevo'}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                Interés: {lead.interest_level || 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenLead(lead.id)}
                                        className="h-9 px-4 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary gap-2 font-black text-[10px] uppercase transition-all"
                                    >
                                        Abrir Lead
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Visit History */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 rounded-full bg-primary/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Historial de Visitas Programadas</h3>
                </div>

                {(!visits || visits.length === 0) ? (
                    <div className="flex flex-col items-center justify-center p-12 border border-muted/10 rounded-[2.5rem] bg-muted/5">
                        <Calendar className="h-10 w-10 text-muted-foreground/20 mb-4" />
                        <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest text-center">No hay visitas registradas para esta propiedad</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visits.map((visit: Visit) => (
                            <div key={visit.id} className="p-6 border border-muted/10 bg-background/50 rounded-[2rem] relative overflow-hidden group hover:border-primary/20 transition-all">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
                                                visit.status === 'completed' ? "bg-green-500/10 text-green-500" :
                                                    visit.status === 'cancelled' ? "bg-red-500/10 text-red-500" :
                                                        "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {visit.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> :
                                                    visit.status === 'cancelled' ? <XCircle className="h-5 w-5" /> :
                                                        <Clock className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary block leading-none mb-1">
                                                    {visit.status === 'scheduled' ? 'Visita Programada' :
                                                        visit.status === 'completed' ? 'Visita Realizada' : 'Visita Cancelada'}
                                                </span>
                                                <h5 className="text-sm font-bold text-foreground leading-none">
                                                    {format(new Date(visit.scheduled_at), "eeee d 'de' MMMM", { locale: es })}
                                                </h5>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "rounded-lg text-[9px] font-black uppercase px-2 py-0.5",
                                            visit.status === 'completed' ? "bg-green-500/5 text-green-500 border-green-500/20" :
                                                visit.status === 'cancelled' ? "bg-red-500/5 text-red-500 border-red-500/20" :
                                                    "bg-blue-500/5 text-blue-500 border-blue-500/20"
                                        )}>
                                            {visit.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/5 border border-muted/10">
                                            <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-muted-foreground/60">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[8px] font-black text-muted-foreground uppercase block">Interesado</span>
                                                <span className="text-[10px] font-bold truncate block">{visit.lead?.full_name || 'Desconocido'}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenLead(visit.lead_id)}
                                                className="ml-auto h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                            >
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {visit.notes && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                                <MessageSquare className="h-4 w-4 text-primary/60 mt-0.5" />
                                                <p className="text-[10px] text-muted-foreground/80 italic leading-relaxed">"{visit.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
