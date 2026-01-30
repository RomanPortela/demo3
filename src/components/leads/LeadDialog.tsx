'use client';

import { type Lead } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProspectoForm, PROSPECTO_SECTIONS } from "./ProspectoForm";
import { PropietarioForm, PROPIETARIO_SECTIONS } from "./PropietarioForm";
import { LeadInteractionList } from "./LeadInteractionList";
import { VisitSchedulerInner } from "./VisitScheduler";
import { Badge } from "@/components/ui/badge";
import { User, Activity, Calendar, History, Smartphone, Brain, Save, X, Layers, Briefcase, MapPin, DollarSign, BarChart3, Clock, Plus, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useCreateLead, useUpdateLead } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead?: Lead;
    initialTab?: string;
}

export function LeadDialog({ open, onOpenChange, lead, initialTab = "datos" }: LeadDialogProps) {
    const isEditing = !!lead;
    const createLead = useCreateLead();
    const updateLead = useUpdateLead();

    const [activeSection, setActiveSection] = useState('basica');

    const form = useForm<Partial<Lead>>({
        defaultValues: lead || {
            lead_type: 'prospecto',
            full_name: '',
            status: 'Nuevo',
            follow_up_count: 0,
            has_control: false
        }
    });

    useEffect(() => {
        if (open) {
            form.reset(lead || {
                lead_type: 'prospecto',
                full_name: '',
                status: 'Nuevo',
                follow_up_count: 0,
                has_control: false
            });
            setActiveSection('basica');
        }
    }, [open, lead, form]);

    const onSubmit = async (data: Partial<Lead>) => {
        try {
            if (isEditing && lead?.id) {
                await updateLead.mutateAsync({ id: lead.id, ...data });
                toast.success("Lead actualizado correctamente");
            } else {
                await createLead.mutateAsync(data);
                toast.success("Lead creado correctamente");
            }
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el lead");
        }
    };

    const sections = lead?.lead_type === 'propietario' ? PROPIETARIO_SECTIONS : PROSPECTO_SECTIONS;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* 
                CRITICAL FIX: Overriding sm:max-w-lg from base component 
                Using max-w-none and sm:max-w-none to ensure the modal fills the screen area.
            */}
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

                        {/* Layout Principal Ampliado: Sidebar + Contenido de Ancho Completo */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* Sidebar de Navegación "EXPEDIENTE" */}
                            <div className="w-[350px] flex flex-col p-8 gap-3 shrink-0 overflow-y-auto no-scrollbar bg-gray-50/20 border-r border-gray-100">
                                <div className="px-2 mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">EXPEDIENTE DIGITAL</h3>
                                </div>
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => setActiveSection(section.id)}
                                        className={cn(
                                            "flex items-center gap-5 p-4 rounded-[20px] transition-all duration-400 text-left group",
                                            activeSection === section.id
                                                ? "bg-white shadow-[0_15px_30px_rgba(0,0,0,0.06)] scale-[1.03] border border-gray-100"
                                                : "hover:bg-white/60 text-gray-400"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-[16px] flex items-center justify-center transition-all duration-400 shadow-sm",
                                            activeSection === section.id ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20" : "bg-gray-100 group-hover:bg-gray-200"
                                        )}>
                                            <section.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-lg font-black tracking-tight leading-none",
                                                activeSection === section.id ? "text-[#111827]" : "group-hover:text-gray-600 transition-colors"
                                            )}>
                                                {section.label}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#7C3AED]/30 mt-1">Gestión Activa</span>
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-auto pt-8">
                                    <Button
                                        type="submit"
                                        disabled={updateLead.isPending || createLead.isPending}
                                        className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                    >
                                        <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        Actualizar Expediente
                                    </Button>
                                </div>
                            </div>

                            {/* Panel de Contenido de Máxima Visibilidad */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-16 pt-24 w-full max-w-[1600px] mx-auto"> {/* Contenido masivo y centrado */}
                                        <div className="bg-white">
                                            {form.watch('lead_type') === 'propietario' ? (
                                                <PropietarioForm activeTab={activeSection} leadId={lead?.id} />
                                            ) : (
                                                <ProspectoForm activeTab={activeSection} leadId={lead?.id} />
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
