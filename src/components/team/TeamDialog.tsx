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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useUpdateProfile } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Profile } from "@/types";
import { ShieldCheck, User, DollarSign, X, Save, Briefcase, Mail, Phone, Settings, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    full_name: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "CAPTADOR", "AGENTE"]),
    commission_type: z.enum(["percentage", "fixed", "mixed"]).default("percentage"),
    base_commission_percentage: z.coerce.number().default(0),
    base_commission_fixed: z.coerce.number().default(0),
    base_collaboration_share: z.coerce.number().default(50),
    commercial_notes: z.string().optional(),
});

interface TeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile?: Profile;
}

const TABS = [
    { id: 'perfil', label: 'Perfil de Usuario', icon: User },
    { id: 'condiciones', label: 'Esquema de Comisiones', icon: DollarSign },
];

export function TeamDialog({ open, onOpenChange, profile }: TeamDialogProps) {
    const [activeTab, setActiveTab] = useState('perfil');
    const updateProfile = useUpdateProfile();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            role: "AGENTE",
            commission_type: "percentage",
            base_commission_percentage: 0,
            base_commission_fixed: 0,
            base_collaboration_share: 50,
            commercial_notes: "",
        } as z.infer<typeof formSchema>,
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                full_name: profile.full_name || "",
                phone: profile.phone || "",
                role: profile.role,
                commission_type: profile.commission_type || "percentage",
                base_commission_percentage: Number(profile.base_commission_percentage) || 0,
                base_commission_fixed: Number(profile.base_commission_fixed) || 0,
                base_collaboration_share: Number(profile.base_collaboration_share) || 50,
                commercial_notes: profile.commercial_notes || "",
            } as any);
        }
    }, [profile, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!profile) return;
        try {
            await updateProfile.mutateAsync({ user_id: profile.user_id, ...values });
            toast.success("Perfil de miembro actualizado");
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
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">ESTRUCTURA RRHH</h3>
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
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#7C3AED]/30 mt-1">Configuración</span>
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-auto pt-8">
                                    <Button
                                        type="submit"
                                        disabled={updateProfile.isPending}
                                        className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                    >
                                        <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        Certificar Perfil
                                    </Button>
                                </div>
                            </div>

                            {/* Panel de Contenido de Máxima Visibilidad */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-16 pt-24 w-full max-w-[1400px] mx-auto">
                                        <div className="bg-white">
                                            {activeTab === 'perfil' && (
                                                <div className="space-y-12">
                                                    <div className="grid grid-cols-2 gap-12">
                                                        <div className="space-y-6">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                                <User className="h-4 w-4" /> Datos de Identidad
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <FormField control={form.control} name="full_name" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Nombre Completo</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner" /></FormControl></FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="phone" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Teléfono Operativo</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner" /></FormControl></FormItem>
                                                                )} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                                <Briefcase className="h-4 w-4" /> Roles Operacionales
                                                            </h3>
                                                            <FormField control={form.control} name="role" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Grado de Autoridad</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-2xl shadow-3xl border-none">
                                                                            <SelectItem value="ADMIN">Administrador de Sistema</SelectItem>
                                                                            <SelectItem value="CAPTADOR">Estratega en Captación</SelectItem>
                                                                            <SelectItem value="AGENTE">Agente Comercial</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'condiciones' && (
                                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="grid grid-cols-2 gap-12">
                                                        <div className="space-y-8">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8"><DollarSign className="h-4 w-4" /> Modelo de Liquidación</h3>
                                                            <FormField control={form.control} name="commission_type" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Estructura Base</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-[#F3E8FF]/20 border-[#7C3AED]/10 font-black text-[#7C3AED] px-6"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-2xl shadow-3xl border-none">
                                                                            <SelectItem value="percentage">Variable por Porcentaje (%)</SelectItem>
                                                                            <SelectItem value="fixed">Monto Fijo por Venta ($)</SelectItem>
                                                                            <SelectItem value="mixed">Esquema Mixto</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                            <div className="grid grid-cols-2 gap-6">
                                                                {(form.watch("commission_type") === "percentage" || form.watch("commission_type") === "mixed") && (
                                                                    <FormField control={form.control} name="base_commission_percentage" render={({ field }) => (
                                                                        <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Comisión (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-black text-xl text-center" /></FormControl></FormItem>
                                                                    )} />
                                                                )}
                                                                {(form.watch("commission_type") === "fixed" || form.watch("commission_type") === "mixed") && (
                                                                    <FormField control={form.control} name="base_commission_fixed" render={({ field }) => (
                                                                        <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Monto ($)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-black text-xl text-center" /></FormControl></FormItem>
                                                                    )} />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-8">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8"><Settings className="h-4 w-4" /> Parámetros Avanzados</h3>
                                                            <FormField control={form.control} name="base_collaboration_share" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Share en Colaboración (%)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-black text-center" /></FormControl></FormItem>
                                                            )} />
                                                        </div>
                                                    </div>

                                                    <div className="pt-12 border-t border-gray-50">
                                                        <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest mb-8 flex items-center gap-2"><History className="h-4 w-4" /> Bitácora Comercial / RRHH</h3>
                                                        <FormField control={form.control} name="commercial_notes" render={({ field }) => (
                                                            <FormItem><FormControl><Textarea className="min-h-[250px] rounded-[32px] bg-gray-50/50 border-gray-100 p-10 text-xl font-medium resize-none shadow-inner leading-relaxed" placeholder="Registrar acuerdos privados, historial de incentivos o feedback crítico del miembro..." {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </div>
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
