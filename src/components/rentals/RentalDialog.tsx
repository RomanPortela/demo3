'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea"; // Asegurado import
import { useProperties, useLeads, useProfiles, useCreateRentalContract } from "@/lib/supabase/queries";
import { RentalContract } from "@/types";
import { Key, User, Home, Calendar, Percent, DollarSign, X, Save, FileText, Settings, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { DocumentSection } from "@/components/documents/DocumentSection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const rentalSchema = z.object({
    property_id: z.coerce.number().min(1, "Debe seleccionar una propiedad"),
    owner_id: z.coerce.number().min(1, "Debe seleccionar un propietario"),
    tenant_id: z.coerce.number().min(1, "Debe seleccionar un inquilino"),
    agent_id: z.string().min(1, "Debe asignar un agente"),
    start_date: z.string().min(1, "Fecha de inicio requerida"),
    end_date: z.string().min(1, "Fecha de fin requerida"),
    duration_months: z.coerce.number().min(1),
    adjustment_type: z.enum(['fijo', 'ipc', 'icl', 'otro']),
    adjustment_frequency: z.enum(['mensual', 'trimestral', 'cuatrimestral', 'semestral', 'anual']),
    base_amount: z.coerce.number().min(1),
    currency: z.string().default("ARS"),
    agency_commission_percentage: z.coerce.number().min(0).max(100).default(5),
    agent_commission_percentage: z.coerce.number().min(0).max(100).default(0),
    notes: z.string().optional(),
});

interface RentalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental?: RentalContract;
}

const TABS = [
    { id: 'partes', label: 'Vinculación de Partes', icon: Users },
    { id: 'condiciones', label: 'Condiciones Económicas', icon: DollarSign },
    { id: 'documentos', label: 'Documentos y Archivos', icon: FileText },
];

export function RentalDialog({ open, onOpenChange, rental }: RentalDialogProps) {
    const [activeTab, setActiveTab] = useState('partes');
    const createContract = useCreateRentalContract();
    const { data: properties = [] } = useProperties();
    const { data: leads = [] } = useLeads();
    const { data: agents = [] } = useProfiles();

    const owners = leads.filter(l => l.lead_type === 'propietario');
    const tenants = leads.filter(l => l.lead_type === 'prospecto');

    const form = useForm<z.infer<typeof rentalSchema>>({
        resolver: zodResolver(rentalSchema),
        defaultValues: {
            property_id: rental?.property_id || 0,
            owner_id: rental?.owner_id || 0,
            tenant_id: rental?.tenant_id || 0,
            agent_id: rental?.agent_id || "",
            start_date: rental?.start_date || "",
            end_date: rental?.end_date || "",
            duration_months: rental?.duration_months || 24,
            adjustment_type: rental?.adjustment_type || 'ipc',
            adjustment_frequency: rental?.adjustment_frequency || 'semestral',
            base_amount: rental?.base_amount || 0,
            currency: rental?.currency || "ARS",
            agency_commission_percentage: rental?.agency_commission_percentage || 5,
            agent_commission_percentage: rental?.agent_commission_percentage || 0,
            notes: rental?.notes || "",
        },
    });

    const onSubmit = (values: z.infer<typeof rentalSchema>) => {
        createContract.mutate(values, {
            onSuccess: () => {
                toast.success("Contrato de alquiler creado con éxito");
                onOpenChange(false);
                form.reset();
            }
        });
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
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">ESTRUCTURA LEGAL</h3>
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
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#7C3AED]/30 mt-1">Módulo</span>
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-auto pt-8">
                                    <Button
                                        type="submit"
                                        disabled={createContract.isPending}
                                        className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                    >
                                        <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        {rental ? 'Actualizar Contrato' : 'Cerrar y Certificar'}
                                    </Button>
                                </div>
                            </div>

                            {/* Panel de Contenido de Máxima Visibilidad */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-16 pt-24 w-full max-w-[1400px] mx-auto">
                                        <div className="bg-white">
                                            {activeTab === 'partes' && (
                                                <div className="space-y-12">
                                                    <div className="grid grid-cols-2 gap-12">
                                                        <div className="space-y-6">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                                <Home className="h-4 w-4" /> Activo Inmobiliario
                                                            </h3>
                                                            <FormField control={form.control} name="property_id" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Propiedad del Contrato</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                                                                        <FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner"><SelectValue placeholder="Vincular activo..." /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-2xl shadow-2xl border-none">
                                                                            {properties.filter(p => p.operation_type === 'alquiler').map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.address}</SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="space-y-6">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                                <Briefcase className="h-4 w-4" /> Asignación de Agente
                                                            </h3>
                                                            <FormField control={form.control} name="agent_id" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Responsable Operativo</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner"><SelectValue placeholder="Asignar agente comercial..." /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-2xl shadow-2xl border-none">
                                                                            {agents.map(a => (<SelectItem key={a.user_id} value={a.user_id}>{a.full_name}</SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                    </div>

                                                    <div className="pt-12 border-t border-gray-50">
                                                        <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                            <Users className="h-4 w-4" /> Entidades Involucradas
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-12">
                                                            <FormField control={form.control} name="owner_id" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Propietario / Locador</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                                                                        <FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner"><SelectValue placeholder="Seleccionar dueño..." /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-2xl shadow-2xl border-none">
                                                                            {owners.map(o => (<SelectItem key={o.id} value={o.id.toString()}>{o.full_name}</SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="tenant_id" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Inquilino / Locatario</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                                                                        <FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6 shadow-inner"><SelectValue placeholder="Seleccionar inquilino..." /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-2xl shadow-2xl border-none">
                                                                            {tenants.map(t => (<SelectItem key={t.id} value={t.id.toString()}>{t.full_name}</SelectItem>))}
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
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8"><DollarSign className="h-4 w-4" /> Monto y Divisa</h3>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <FormField control={form.control} name="base_amount" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Canon Mensual</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-black text-xl" /></FormControl></FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="currency" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Moneda</FormLabel>
                                                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-bold"><SelectValue /></SelectTrigger></FormControl>
                                                                            <SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="ARS">ARS - Pesos</SelectItem><SelectItem value="USD">USD - Dólares</SelectItem></SelectContent>
                                                                        </Select>
                                                                    </FormItem>
                                                                )} />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <FormField control={form.control} name="adjustment_type" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Fórmula de Ajuste</FormLabel>
                                                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-bold"><SelectValue /></SelectTrigger></FormControl>
                                                                            <SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="fijo">Indexación Fija</SelectItem><SelectItem value="ipc">IPC (Inflación)</SelectItem><SelectItem value="icl">ICL (Alquileres)</SelectItem><SelectItem value="otro">Personalizado</SelectItem></SelectContent>
                                                                        </Select>
                                                                    </FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="adjustment_frequency" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Ventana de Ajuste</FormLabel>
                                                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-bold"><SelectValue /></SelectTrigger></FormControl>
                                                                            <SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="mensual">Mensual</SelectItem><SelectItem value="trimestral">Cada 3 Meses</SelectItem><SelectItem value="cuatrimestral">Cada 4 Meses</SelectItem><SelectItem value="semestral">Semestral</SelectItem></SelectContent>
                                                                        </Select>
                                                                    </FormItem>
                                                                )} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-8">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8"><Calendar className="h-4 w-4" /> Cronograma y Comisiones</h3>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <FormField control={form.control} name="start_date" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Fecha de Inicio</FormLabel><FormControl><Input type="date" {...field} className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-bold" /></FormControl></FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="duration_months" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Duración (Meses)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-bold" /></FormControl></FormItem>
                                                                )} />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <FormField control={form.control} name="agency_commission_percentage" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Honorario Inmo (%)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-[#F3E8FF]/20 border-[#7C3AED]/10 px-6 font-black text-indigo-600" /></FormControl></FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="agent_commission_percentage" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 ml-1">Bono Agente (%)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-gray-50 shadow-inner px-6 font-bold" /></FormControl></FormItem>
                                                                )} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-12 border-t border-gray-50">
                                                        <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">Cláusulas y Observaciones</h3>
                                                        <FormField control={form.control} name="notes" render={({ field }) => (
                                                            <FormItem><FormControl><Textarea className="min-h-[200px] rounded-[32px] bg-gray-50/50 border-gray-100 p-10 text-xl font-medium resize-none shadow-inner leading-relaxed" placeholder="Registrar términos especiales, garantías o condiciones particulares del contrato..." {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'documentos' && (
                                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    {rental?.id ? (
                                                        <DocumentSection entityType="rental" entityId={rental.id} title="Repositorio Digital de Contratos" requiredTypes={['contrato', 'identidad']} />
                                                    ) : (
                                                        <div className="p-32 text-center bg-gray-50/20 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-6">
                                                            <FileText className="h-20 w-20 text-gray-100" />
                                                            <p className="font-black uppercase text-[10px] tracking-widest text-gray-300">Certifique el contrato para habilitar la carga de documentos legales</p>
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
