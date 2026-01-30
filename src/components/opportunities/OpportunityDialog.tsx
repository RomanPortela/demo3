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
import { useCreateOpportunity, useUpdateOpportunity } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Opportunity } from "@/types";
import { Sparkles, Wand2, FileText, Info, MessageSquare, X, Save, History, Target, Brain, ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentSection } from "@/components/documents/DocumentSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    client_name: z.string().min(2, "Nombre requerido"),
    phone: z.string().optional(),
    status: z.enum(["abierta", "ejecutada", "cerrada"]),
    notes: z.string().optional(),
    ai_advice: z.string().optional(),
    ai_message: z.string().optional(),
});

interface OpportunityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opportunity?: Opportunity;
}

const TABS = [
    { id: 'detalles', label: 'Estructura de Negocio', icon: Target },
    { id: 'ia', label: 'IA Strategy & Coaching', icon: Brain },
    { id: 'documentos', label: 'Expediente Legal', icon: FileText },
];

export function OpportunityDialog({ open, onOpenChange, opportunity }: OpportunityDialogProps) {
    const [activeTab, setActiveTab] = useState('detalles');
    const createOpp = useCreateOpportunity();
    const updateOpp = useUpdateOpportunity();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_name: "",
            phone: "",
            status: "abierta",
            notes: "",
            ai_advice: "",
            ai_message: "",
        },
    });

    useEffect(() => {
        if (opportunity) {
            form.reset({
                client_name: opportunity.client_name,
                phone: opportunity.phone || "",
                status: opportunity.status as any,
                notes: opportunity.notes || "",
                ai_advice: opportunity.ai_advice || "",
                ai_message: opportunity.ai_message || "",
            });
        }
    }, [opportunity, form]);

    const handleGenerateAI = () => {
        const advices = [
            "Enfócate en la rentabilidad a largo plazo de la zona.",
            "Menciona las nuevas obras de infraestructura cercanas.",
            "Ofrece una visita virtual antes de la presencial.",
            "Destaca la luminosidad y los espacios abiertos."
        ];
        const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
        form.setValue("ai_advice", randomAdvice);
        toast.info("¡Estrategia IA recalibrada!");
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (opportunity) {
                await updateOpp.mutateAsync({ id: opportunity.id, ...values });
                toast.success("Oportunidad actualizada");
            } else {
                await createOpp.mutateAsync(values);
                toast.success("Oportunidad registrada");
            }
            onOpenChange(false);
        } catch (error) {
            toast.error("Error operativo");
        }
    }

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
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">CANAL DE VENTAS</h3>
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
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#7C3AED]/30 mt-1">Gestión Activa</span>
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-auto pt-8">
                                    <Button
                                        type="submit"
                                        disabled={createOpp.isPending || updateOpp.isPending}
                                        className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                    >
                                        <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        {opportunity ? 'Actualizar Negocio' : 'Registrar Oportunidad'}
                                    </Button>
                                </div>
                            </div>

                            {/* Panel de Contenido de Máxima Visibilidad */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-16 pt-24 w-full max-w-[1400px] mx-auto">
                                        <div className="bg-white">
                                            {activeTab === 'detalles' && (
                                                <div className="space-y-12">
                                                    <div className="grid grid-cols-2 gap-12">
                                                        <FormField control={form.control} name="client_name" render={({ field }) => (
                                                            <FormItem className="space-y-4">
                                                                <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Titular del Negocio</FormLabel>
                                                                <FormControl><Input placeholder="Nombre del prospecto o cliente..." {...field} className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner" /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                                            <FormItem className="space-y-4">
                                                                <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Contacto Directo</FormLabel>
                                                                <FormControl><Input placeholder="+54 9 11..." {...field} className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner" /></FormControl>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                    <FormField control={form.control} name="status" render={({ field }) => (
                                                        <FormItem className="space-y-6">
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Estado de la Operación</FormLabel>
                                                            <div className="grid grid-cols-3 gap-6">
                                                                {['abierta', 'ejecutada', 'cerrada'].map((st) => (
                                                                    <button type="button" key={st} onClick={() => field.onChange(st)} className={cn("px-6 py-10 rounded-[32px] border-2 transition-all font-black text-sm uppercase tracking-widest", field.value === st ? "border-[#7C3AED] bg-[#F3E8FF]/20 text-[#7C3AED] shadow-lg" : "border-gray-50 text-gray-300 hover:border-gray-200")}>
                                                                        {st}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </FormItem>
                                                    )} />
                                                    <div className="pt-12 border-t border-gray-50">
                                                        <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest mb-8 flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Notas de Seguimiento</h3>
                                                        <FormField control={form.control} name="notes" render={({ field }) => (
                                                            <FormItem><FormControl><Textarea placeholder="Registrar eventos críticos de esta negociación..." {...field} className="min-h-[250px] rounded-[32px] bg-gray-50/50 border-gray-100 p-10 text-xl font-medium resize-none shadow-inner leading-relaxed" /></FormControl></FormItem>
                                                        )} />
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'ia' && (
                                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="bg-[#7C3AED]/5 p-12 rounded-[40px] border border-[#7C3AED]/10 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-12 opacity-5"><Brain className="h-40 w-40 text-[#7C3AED]" /></div>
                                                        <div className="flex items-center justify-between mb-12">
                                                            <div className="space-y-1">
                                                                <h3 className="text-2xl font-black text-[#7C3AED] uppercase tracking-tighter">Motor de Estrategia IA</h3>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recomendaciones personalizadas basadas en perfil</p>
                                                            </div>
                                                            <Button type="button" onClick={handleGenerateAI} className="h-16 rounded-[20px] bg-[#7C3AED] text-white px-8 font-black uppercase text-xs tracking-widest shadow-2xl shadow-[#7C3AED]/20 gap-3 group">
                                                                <Wand2 className="h-5 w-5 group-hover:rotate-12 transition-transform" /> Recalibrar Estrategia
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-10">
                                                            <FormField control={form.control} name="ai_advice" render={({ field }) => (
                                                                <FormItem className="space-y-4">
                                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-[#7C3AED]/40 ml-4">Coaching de Venta</FormLabel>
                                                                    <FormControl><Textarea readOnly {...field} className="min-h-[150px] rounded-[24px] bg-white border-2 border-[#7C3AED]/10 p-8 text-lg font-bold text-[#111827] shadow-sm resize-none" /></FormControl>
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="ai_message" render={({ field }) => (
                                                                <FormItem className="space-y-4">
                                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-[#7C3AED]/40 ml-4">Script Sugerido</FormLabel>
                                                                    <FormControl><Textarea readOnly {...field} className="min-h-[150px] rounded-[24px] bg-white border-2 border-[#7C3AED]/10 p-8 text-lg font-bold text-[#111827] shadow-sm resize-none" /></FormControl>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'documentos' && (
                                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    {opportunity?.id ? (
                                                        <DocumentSection entityType="operation" entityId={opportunity.id} title="Repositorio Digital de Operación" requiredTypes={['reserva', 'boleto']} />
                                                    ) : (
                                                        <div className="p-32 text-center bg-gray-50/20 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-6">
                                                            <FileText className="h-20 w-20 text-gray-100" />
                                                            <p className="font-black uppercase text-[10px] tracking-widest text-gray-300">Registre la oportunidad para habilitar la carga de documentos de reserva</p>
                                                        </div>
                                                    )}
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
