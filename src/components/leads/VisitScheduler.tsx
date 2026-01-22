'use client';

import { useState } from "react";
import { useCreateVisit, useProperties } from "@/lib/supabase/queries";
import { type Lead, type Property } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VisitSchedulerProps {
    lead: Lead;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VisitScheduler({ lead, open, onOpenChange }: VisitSchedulerProps) {
    const createVisit = useCreateVisit();
    const { data: allProperties } = useProperties();

    // Only allow selecting properties the lead is interested in
    const interestedProperties = (allProperties as Property[])?.filter(p =>
        lead.property_ids?.includes(p.id)
    ) || [];

    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    const handleSchedule = async () => {
        if (!selectedPropertyId || !date || !time) {
            toast.error("Por favor completa los campos obligatorios");
            return;
        }

        try {
            const scheduledAt = new Date(`${date}T${time}`).toISOString();

            await createVisit.mutateAsync({
                lead_id: lead.id,
                property_id: parseInt(selectedPropertyId),
                scheduled_at: scheduledAt,
                notes,
                status: 'scheduled'
            });

            toast.success("Visita programada correctamente");
            onOpenChange(false);
            // Reset fields
            setSelectedPropertyId("");
            setDate("");
            setTime("");
            setNotes("");
        } catch (error) {
            console.error(error);
            toast.error("Error al programar la visita");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border-none shadow-2xl rounded-[2.5rem]">
                <DialogHeader className="px-8 pt-8 pb-4 bg-primary/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight">Programar Nueva Visita</DialogTitle>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Lead: {lead.full_name}</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-8 py-6 space-y-6">
                    {/* Property Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> Propiedad a Visitar *
                        </label>
                        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                            <SelectTrigger className="h-12 bg-muted/20 border-muted rounded-2xl">
                                <SelectValue placeholder="Seleccionar propiedad vinculada" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                {interestedProperties.length === 0 ? (
                                    <div className="p-4 text-center">
                                        <p className="text-xs text-muted-foreground font-bold">No hay propiedades vinculadas a este lead</p>
                                    </div>
                                ) : (
                                    interestedProperties.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()} className="rounded-xl py-3 px-4 focus:bg-primary/10">
                                            <div className="flex flex-col text-left">
                                                <span className="font-bold text-sm leading-none mb-1">{p.address || p.zone}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-black">{p.property_type} • {p.currency} {p.price?.toLocaleString()}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* DateTime row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Fecha *
                            </label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-12 bg-muted/20 border-muted rounded-2xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Hora *
                            </label>
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="h-12 bg-muted/20 border-muted rounded-2xl"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" /> Notas de la visita
                        </label>
                        <Textarea
                            placeholder="Ej: El cliente quiere ver específicamente la cocina..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-muted/20 border-muted rounded-2xl resize-none h-24"
                        />
                    </div>
                </div>

                <DialogFooter className="px-8 py-6 bg-muted/10 border-t border-muted/20">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold px-6 h-12">
                        Cancelar
                    </Button>
                    <Button
                        disabled={createVisit.isPending}
                        onClick={handleSchedule}
                        className="rounded-2xl font-black uppercase tracking-widest px-8 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {createVisit.isPending ? "Programando..." : "Confirmar Visita"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
