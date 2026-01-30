'use client';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useCreateContentItem, useUpdateContentItem } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ContentItem } from "@/types";
import { CalendarIcon, Instagram, Mail, Megaphone, Palette, History, Target, X, Save, Clock, Brain } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
    title: z.string().min(2, "Título requerido"),
    description: z.string().optional(),
    content_type: z.enum(["post", "email", "campaign"]),
    status: z.enum(["draft", "scheduled", "published"]),
    scheduled_at: z.date().optional(),
});

interface ContentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: ContentItem;
}

const TABS = [
    { id: 'planificacion', label: 'Estrategia & Calendario', icon: Target },
    { id: 'creatividad', label: 'Copywriting & Diseño', icon: Palette },
    { id: 'historial', label: 'Métricas & Historial', icon: History },
];

export function ContentDialog({ open, onOpenChange, item }: ContentDialogProps) {
    const [activeTab, setActiveTab] = useState('planificacion');
    const createItem = useCreateContentItem();
    const updateItem = useUpdateContentItem();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            content_type: "post",
            status: "draft",
        },
    });

    useEffect(() => {
        if (item) {
            form.reset({
                title: item.title,
                description: item.description || "",
                content_type: item.content_type,
                status: item.status,
                scheduled_at: item.scheduled_at ? new Date(item.scheduled_at) : undefined,
            });
        }
    }, [item, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const payload = {
                ...values,
                scheduled_at: values.scheduled_at ? values.scheduled_at.toISOString() : undefined,
            };

            if (item) {
                await updateItem.mutateAsync({ id: item.id, ...payload });
                toast.success("Contenido actualizado");
            } else {
                await createItem.mutateAsync(payload);
                toast.success("Publicación agendada");
            }
            onOpenChange(false);
        } catch (error) {
            toast.error("Error operativo");
        }
    }

    const typeIcons = {
        post: <Instagram className="h-10 w-10 text-[#7C3AED]" />,
        email: <Mail className="h-10 w-10 text-[#7C3AED]" />,
        campaign: <Megaphone className="h-10 w-10 text-[#7C3AED]" />,
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none sm:max-w-none w-[97vw] h-[95vh] p-0 overflow-hidden bg-white border-none shadow-[0_25px_100px_rgba(0,0,0,0.15)] rounded-[24px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full relative bg-white">

                        {/* Botón de Cierre Minimalista */}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-6 right-8 h-12 w-12 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors z-[100] bg-white/80 backdrop-blur-sm shadow-sm"
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Layout Principal Ampliado: Sidebar + Contenido */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* Sidebar de Navegación "EXPEDIENTE" */}
                            <div className="w-[350px] flex flex-col p-8 gap-3 shrink-0 overflow-y-auto no-scrollbar bg-gray-50/20 border-r border-gray-100">
                                <div className="px-2 mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">CALENDARIO EDITORIAL</h3>
                                </div>
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-5 p-4 rounded-[20px] transition-all duration-400 text-left group",
                                            activeTab === tab.id
                                                ? "bg-white shadow-[0_15px_30px_rgba(0,0,0,0.06)] scale-[1.03] border border-gray-100"
                                                : "hover:bg-white/60 text-gray-400"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-[16px] flex items-center justify-center transition-all duration-400 shadow-sm",
                                            activeTab === tab.id ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20" : "bg-gray-100 group-hover:bg-gray-200"
                                        )}>
                                            <tab.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-lg font-black tracking-tight leading-none",
                                                activeTab === tab.id ? "text-[#111827]" : "group-hover:text-gray-600 transition-colors"
                                            )}>
                                                {tab.label}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#7C3AED]/30 mt-1">Gestión</span>
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-auto pt-8">
                                    <Button
                                        type="submit"
                                        disabled={createItem.isPending || updateItem.isPending}
                                        className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                    >
                                        <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        {item ? 'Actualizar Pieza' : 'Publicar / Agendar'}
                                    </Button>
                                </div>
                            </div>

                            {/* Panel de Contenido de Máxima Visibilidad */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-16 w-full max-w-[1400px] mx-auto">
                                        <div className="mb-12 flex items-center justify-between border-b border-gray-50 pb-8">
                                            <div>
                                                <h2 className="text-5xl font-black tracking-tighter text-[#111827] uppercase">
                                                    {TABS.find(t => t.id === activeTab)?.label || "ESTRATEGIA"}
                                                </h2>
                                                <div className="h-1.5 w-20 bg-[#7C3AED] mt-4 rounded-full" />
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="h-8 border-[#7C3AED]/10 bg-[#7C3AED]/5 rounded-full px-4 text-[10px] font-black uppercase text-[#7C3AED]">
                                                    ID CONTENT: {item?.id || 'ALPHA-BUILD'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="bg-white">
                                            {activeTab === 'planificacion' && (
                                                <div className="space-y-12">
                                                    <FormField control={form.control} name="title" render={({ field }) => (
                                                        <FormItem className="space-y-4">
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Campaña / Título de Pieza</FormLabel>
                                                            <FormControl><Input placeholder="Título estratégico de la publicación..." {...field} className="h-20 rounded-[28px] bg-gray-50/50 border-gray-100 text-3xl font-black px-10 shadow-inner" /></FormControl>
                                                        </FormItem>
                                                    )} />

                                                    <div className="grid grid-cols-2 gap-12">
                                                        <FormField control={form.control} name="content_type" render={({ field }) => (
                                                            <FormItem className="space-y-6">
                                                                <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Formato de Salida</FormLabel>
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    {[
                                                                        { id: 'post', label: 'Instagram', icon: Instagram },
                                                                        { id: 'email', label: 'E-Mail', icon: Mail },
                                                                        { id: 'campaign', label: 'Campaña', icon: Megaphone },
                                                                    ].map((type) => (
                                                                        <button type="button" key={type.id} onClick={() => field.onChange(type.id)} className={cn("px-4 py-8 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3", field.value === type.id ? "border-[#7C3AED] bg-[#F3E8FF]/20 text-[#7C3AED]" : "border-gray-50 text-gray-300 hover:border-gray-200")}>
                                                                            <type.icon className="h-10 w-10" />
                                                                            <span className="font-black text-[10px] uppercase tracking-widest">{type.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="status" render={({ field }) => (
                                                            <FormItem className="space-y-6">
                                                                <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Estatus Editorial</FormLabel>
                                                                <div className="grid grid-cols-1 gap-3">
                                                                    {['draft', 'scheduled', 'published'].map((st) => (
                                                                        <button type="button" key={st} onClick={() => field.onChange(st)} className={cn("h-14 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest", field.value === st ? "border-[#7C3AED] bg-[#F3E8FF]/20 text-[#7C3AED]" : "border-gray-50 text-gray-300 hover:border-gray-200")}>
                                                                            {st}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </FormItem>
                                                        )} />
                                                    </div>

                                                    <FormField control={form.control} name="scheduled_at" render={({ field }) => (
                                                        <FormItem className="space-y-4 pt-4 border-t border-gray-50">
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1 flex items-center gap-2"><Clock className="h-4 w-4" /> Ventana de Lanzamiento</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl><Button variant="ghost" className={cn("h-24 w-full rounded-[32px] bg-gray-50/50 border-2 border-gray-50 font-black text-2xl px-12 justify-start gap-4", !field.value && "text-gray-200")}>{field.value ? format(field.value, "PPP HH:mm", { locale: es }) : "DEFINIR FECHA Y HORA"}</Button></FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0 rounded-[32px] border-none shadow-3xl" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={es} disabled={(date) => date < new Date()} initialFocus /></PopoverContent>
                                                            </Popover>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            )}

                                            {activeTab === 'creatividad' && (
                                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="bg-[#7C3AED]/5 p-12 rounded-[40px] border border-[#7C3AED]/10 relative overflow-hidden mb-12">
                                                        <div className="flex items-center gap-4 mb-8">
                                                            <div className="h-12 w-12 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white shadow-xl shadow-[#7C3AED]/20"><Brain className="h-6 w-6" /></div>
                                                            <h3 className="text-2xl font-black text-[#7C3AED] uppercase tracking-tighter">Asistente de Copywriting</h3>
                                                        </div>
                                                        <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-2xl">Utiliza el motor de Aría para generar copies que conviertan. Nuestra IA analizará la propiedad vinculada para destacar los puntos de mayor impacto.</p>
                                                    </div>

                                                    <FormField control={form.control} name="description" render={({ field }) => (
                                                        <FormItem className="space-y-4">
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Descripción / Caption / Cuerpo</FormLabel>
                                                            <FormControl><Textarea placeholder="Escribir el contenido final de la pieza..." {...field} className="min-h-[500px] rounded-[32px] bg-gray-50/50 border-gray-100 p-12 text-2xl font-medium resize-none shadow-inner leading-relaxed" /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            )}

                                            {activeTab === 'historial' && (
                                                <div className="flex flex-col items-center justify-center p-32 text-gray-300 gap-6 opacity-30 animate-pulse">
                                                    <History className="h-24 w-24" />
                                                    <p className="font-black uppercase tracking-[0.5em] text-sm">Registro de Engagement Protegido</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-24" />
                                </ScrollArea>
                            </div>
                        </div>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
