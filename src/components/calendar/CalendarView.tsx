'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCalendarEvent, useDeleteCalendarEvent, useCalendarEvents, CalendarEvent } from "@/lib/supabase/calendar-queries";
import { useClients, useProperties } from "@/lib/supabase/queries";
import { format, addHours, parseISO, startOfDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, X, User, Home, Briefcase, ChevronRight, Hash, Pin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CalendarView() {
    const { data: events, isLoading, error } = useCalendarEvents();
    const createEvent = useCreateCalendarEvent();
    const deleteEvent = useDeleteCalendarEvent();

    const { data: clients } = useClients();
    const { data: properties } = useProperties();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        color: 'blue',
        client_id: '',
        property_id: '',
        event_type: 'other' as 'meeting' | 'visit' | 'task' | 'other'
    });

    const dayEvents = events?.filter((e) => {
        if (!e.start_time) return false;
        const eventDate = parseISO(e.start_time);
        return date && isSameDay(eventDate, date);
    }) || [];

    const handleCreate = async () => {
        if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
            toast.error("Complete campos obligatorios");
            return;
        }

        try {
            await createEvent.mutateAsync({
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                start_time: new Date(newEvent.start_time).toISOString(),
                end_time: new Date(newEvent.end_time).toISOString(),
                color: newEvent.color,
                client_id: newEvent.client_id ? Number(newEvent.client_id) : undefined,
                property_id: newEvent.property_id ? Number(newEvent.property_id) : undefined,
                event_type: newEvent.event_type
            });
            toast.success("Evento creado");
            setIsDialogOpen(false);
            const now = new Date();
            if (date) now.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            setNewEvent({
                title: '', description: '', location: '',
                start_time: format(addHours(now, 1), "yyyy-MM-dd'T'HH:mm"),
                end_time: format(addHours(now, 2), "yyyy-MM-dd'T'HH:mm"),
                color: 'blue',
                client_id: '',
                property_id: '',
                event_type: 'other'
            });
        } catch (e) {
            toast.error("Error al crear evento");
        }
    };

    const handleDelete = async (eventId: number) => {
        if (window.confirm("¿Seguro que desea eliminar este evento?")) {
            try {
                await deleteEvent.mutateAsync(eventId);
                toast.success("Evento eliminado");
                setSelectedEvent(null);
            } catch (e) {
                toast.error("Error al eliminar");
            }
        }
    }

    if (error) return <div className="p-4 text-red-500">Error cargando calendario.</div>;

    const eventTypeStyles = {
        meeting: "bg-blue-500 text-white shadow-blue-200 border-blue-100",
        visit: "bg-emerald-500 text-white shadow-emerald-200 border-emerald-100",
        task: "bg-amber-500 text-white shadow-amber-200 border-amber-100",
        other: "bg-indigo-500 text-white shadow-indigo-200 border-indigo-100"
    };

    return (
        <div className="flex flex-col xl:flex-row gap-10 h-full">
            {/* Sidebar / Mini Calendar */}
            <div className="xl:w-[380px] shrink-0 flex flex-col gap-8 order-2 xl:order-1">
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 bg-white/70 backdrop-blur-xl overflow-hidden p-6">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-3xl border-none p-0"
                        locale={es}
                    />
                </Card>

                <Button
                    className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all rounded-[2rem] gap-3 text-white"
                    onClick={() => {
                        const now = new Date();
                        if (date) now.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                        const startStr = format(addHours(now, 1), "yyyy-MM-dd'T'HH:mm");
                        const endStr = format(addHours(now, 2), "yyyy-MM-dd'T'HH:mm");
                        setNewEvent({
                            title: '', description: '', location: '',
                            start_time: startStr, end_time: endStr,
                            color: 'blue', client_id: '', property_id: '', event_type: 'other'
                        });
                        setSelectedEvent(null);
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="h-6 w-6" /> Agendar Evento
                </Button>
            </div>

            {/* Main Content: Day View */}
            <div className="flex-1 order-1 xl:order-2">
                <div className="bg-white/40 backdrop-blur-3xl rounded-[3.5rem] p-12 border border-white/50 shadow-sm min-h-[700px] flex flex-col relative overflow-hidden group">
                    {/* Background decorative elements */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

                    <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100 relative z-10">
                        <div>
                            <h2 className="text-4xl font-black capitalize tracking-tighter text-foreground">
                                {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : "Seleccione fecha"}
                            </h2>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="bg-white/80 border-none shadow-sm text-[10px] font-black uppercase tracking-widest text-primary px-3 h-6">
                                    {dayEvents.length} Eventos Programados
                                </Badge>
                                <span className="text-[10px] font-black text-muted-foreground opacity-30 uppercase tracking-widest">InmoAria High Density Schedule</span>
                            </div>
                        </div>
                        {isLoading && <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>}
                    </div>

                    <ScrollArea className="flex-1 relative z-10">
                        <div className="space-y-6 pr-6">
                            {dayEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
                                    <div className="bg-muted/20 p-10 rounded-[3rem] mb-6">
                                        <CalendarIcon className="h-20 w-20" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-widest">Agenda Libre</h3>
                                    <p className="text-sm font-bold mt-2">No hay compromisos detectados para esta fecha</p>
                                </div>
                            ) : (
                                dayEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="group relative bg-white hover:bg-white hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 rounded-[2.5rem] p-8 transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-primary/20"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex flex-col items-center justify-center min-w-[100px] bg-gray-50/50 rounded-3xl p-4 border border-gray-50">
                                                <span className="text-xl font-black tracking-tighter text-foreground mb-1">
                                                    {format(parseISO(event.start_time), 'HH:mm')}
                                                </span>
                                                <div className="h-0.5 w-6 bg-primary/20 rounded-full mb-1" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                    {format(parseISO(event.end_time), 'HH:mm')}
                                                </span>
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest border-none px-3 h-6 flex items-center shadow-lg", eventTypeStyles[event.event_type || 'other'])}>
                                                            {event.event_type}
                                                        </Badge>
                                                        <h4 className="font-black text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors leading-none">
                                                            {event.title}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-gray-50 hover:bg-rose-50 hover:text-rose-500 transition-all" onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}>
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-gray-50 hover:bg-primary/10 hover:text-primary transition-all">
                                                            <ChevronRight className="h-6 w-6" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-6">
                                                    {event.client && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-xl border border-border/40">
                                                            <User className="h-4 w-4 text-primary" />
                                                            <span className="text-xs font-black text-foreground/80">{event.client.owner_first_name} {event.client.owner_last_name}</span>
                                                        </div>
                                                    )}
                                                    {event.property && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-xl border border-border/40">
                                                            <Home className="h-4 w-4 text-indigo-600" />
                                                            <span className="text-xs font-black text-foreground/80 truncate max-w-[200px]">{event.property.address || event.property.zone}</span>
                                                        </div>
                                                    )}
                                                    {event.location && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-xl border border-border/40">
                                                            <MapPin className="h-4 w-4 text-amber-500" />
                                                            <span className="text-xs font-black text-foreground/80">{event.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {event.description && (
                                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-1 opacity-60">
                                                        {event.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Create Event Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl rounded-[3rem] border-none shadow-2xl p-10 bg-white/95 backdrop-blur-2xl">
                    <DialogHeader className="mb-8">
                        <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
                            <Plus className="h-10 w-10 text-white" />
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tighter">Agendar compromiso</DialogTitle>
                        <DialogDescription className="text-lg font-medium leading-relaxed">
                            Vincula el evento a clientes o propiedades para un seguimiento íntegro.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 ml-1">Título del Evento</Label>
                            <Input
                                placeholder="Ej: Visita 3 amb Palermo"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner text-lg font-bold px-6"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 ml-1">Tipo</Label>
                                <Select
                                    value={newEvent.event_type}
                                    onValueChange={(val: any) => setNewEvent({ ...newEvent, event_type: val })}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner px-6 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="meeting" className="rounded-xl font-bold py-3">Reunión</SelectItem>
                                        <SelectItem value="visit" className="rounded-xl font-bold py-3">Visita Propiedad</SelectItem>
                                        <SelectItem value="task" className="rounded-xl font-bold py-3">Tarea Interna</SelectItem>
                                        <SelectItem value="other" className="rounded-xl font-bold py-3">Otros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 ml-1">Relación</Label>
                                <Select
                                    value={newEvent.client_id}
                                    onValueChange={(val) => setNewEvent({ ...newEvent, client_id: val })}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner px-6 font-bold">
                                        <SelectValue placeholder="Cliente (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl max-h-60 overflow-y-auto">
                                        {clients?.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()} className="rounded-xl font-bold py-3">
                                                {c.owner_first_name} {c.owner_last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 ml-1">Franja Horaria</Label>
                                <Input
                                    type="datetime-local"
                                    value={newEvent.start_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                    className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner font-bold px-6"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 invisible opacity-0">Fin</Label>
                                <Input
                                    type="datetime-local"
                                    value={newEvent.end_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                    className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner font-bold px-6"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-12 pt-8 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-16 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest">Descartar</Button>
                        <Button onClick={handleCreate} disabled={createEvent.isPending} className="h-16 flex-1 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30">
                            {createEvent.isPending ? "Guardando..." : "Confirmar Agenda"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Event Details View */}
            {selectedEvent && !isDialogOpen && (
                <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                    <DialogContent className="max-w-xl rounded-[3rem] border-none shadow-2xl p-12 bg-white/95 backdrop-blur-3xl overflow-hidden relative">
                        {/* Dynamic accent based on type */}
                        <div className={cn("absolute top-0 left-0 w-full h-2", eventTypeStyles[selectedEvent.event_type || 'other'].split(' ')[0])} />

                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-4 h-7 rounded-full shadow-lg", eventTypeStyles[selectedEvent.event_type || 'other'])}>
                                    {selectedEvent.event_type}
                                </Badge>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">Event ID</span>
                                        <span className="text-sm font-black text-foreground">#{selectedEvent.id}</span>
                                    </div>
                                </div>
                            </div>

                            <DialogTitle className="text-4xl font-black tracking-tighter text-foreground leading-[1.1]">{selectedEvent.title}</DialogTitle>

                            <div className="flex flex-col gap-6 p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-4 right-4 opacity-5">
                                    <Clock className="h-20 w-20" />
                                </div>

                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Schedule Target</span>
                                        <span className="text-lg font-black text-foreground tabular-nums">
                                            {`${format(parseISO(selectedEvent.start_time), "d 'de' MMMM", { locale: es })} • ${format(parseISO(selectedEvent.start_time), "HH:mm")} - ${format(parseISO(selectedEvent.end_time), "HH:mm")}`}
                                        </span>
                                    </div>
                                </div>

                                {selectedEvent.location && (
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                            <MapPin className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Primary Location</span>
                                            <span className="text-lg font-black text-foreground">{selectedEvent.location}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedEvent.description && (
                                <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                                        <Pin className="h-20 w-20" />
                                    </div>
                                    <p className="text-base font-medium text-primary leading-relaxed relative z-10">
                                        "{selectedEvent.description}"
                                    </p>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={() => setSelectedEvent(null)} className="h-16 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cerrar</Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(selectedEvent.id)}
                                    className="h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200"
                                >
                                    <Trash2 className="h-5 w-5 mr-3" /> Archivar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
