'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { CalendarIcon, User, Phone, MapPin, DollarSign, Clock, BarChart3, History as HistoryIcon, Plus, Minus, Check, Brain, AlertTriangle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PropertySelector } from "@/components/properties/PropertySelector";
import { LeadInteractionList } from "./LeadInteractionList";
import { useProperties } from "@/lib/supabase/queries";
import { type Property } from "@/types";

export const PROSPECTO_SECTIONS = [
    { id: 'basica', label: 'Básica', icon: User },
    { id: 'operacion', label: 'Operación', icon: HistoryIcon },
    { id: 'necesidad', label: 'Necesidad', icon: MapPin },
    { id: 'financiera', label: 'Finanzas', icon: DollarSign },
    { id: 'calificacion', label: 'Calificación', icon: BarChart3 },
    { id: 'seguimiento', label: 'Seguimiento', icon: CalendarIcon },
    { id: 'documentos', label: 'Documentos', icon: Plus },
    { id: 'contactos', label: 'Contactos', icon: User },
];

import { DocumentSection } from "@/components/documents/DocumentSection";

export function ProspectoForm({ activeTab, leadId }: { activeTab: string, leadId?: number }) {
    const { control, watch, setValue } = useFormContext();
    const followUpCount = watch('follow_up_count') || 0;
    const { data: allProperties } = useProperties();

    const inputClasses = "h-12 bg-white border-gray-200 rounded-[12px] shadow-sm focus:border-[#7C3AED] transition-all font-medium text-[#111827] px-4";
    const labelClasses = "text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1 block ml-1";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {activeTab === 'basica' && (
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className={labelClasses}>Nombre y Apellido</FormLabel>
                                <FormControl><Input className={inputClasses} {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="owner_phone"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Teléfono</FormLabel>
                                    <FormControl><Input className={inputClasses} {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Email</FormLabel>
                                    <FormControl><Input className={inputClasses} {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={control}
                        name="source"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className={labelClasses}>Fuente</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={inputClasses}>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="Prospección">Prospección</SelectItem>
                                        <SelectItem value="ADS">ADS</SelectItem>
                                        <SelectItem value="Fisico">Físico</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="web">Web Corporativa</SelectItem>
                                        <SelectItem value="referido">Referido</SelectItem>
                                        <SelectItem value="portal">Portal Inmobiliario</SelectItem>
                                        <SelectItem value="Desconocido">Desconocido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'operacion' && (
                <div className="space-y-6">
                    <FormField
                        control={control}
                        name="operation_type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className={labelClasses}>Operación</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div
                                            onClick={() => setValue('operation_type', 'compra')}
                                            className={cn(
                                                "flex items-center justify-between rounded-2xl border-2 p-6 transition-all cursor-pointer group",
                                                field.value === 'compra'
                                                    ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm"
                                                    : "border-gray-50 bg-white hover:border-gray-200"
                                            )}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <RadioGroupItem value="compra" id="compra" className="sr-only" />
                                                <span className={cn("font-bold text-sm", field.value === 'compra' ? "text-[#7C3AED]" : "text-[#111827]")}>Compra</span>
                                                <span className="text-[10px] text-gray-400">Busca adquirir propiedad</span>
                                            </div>
                                            {field.value === 'compra' && <Check className="h-4 w-4 text-[#7C3AED]" />}
                                        </div>
                                        <div
                                            onClick={() => setValue('operation_type', 'alquiler')}
                                            className={cn(
                                                "flex items-center justify-between rounded-2xl border-2 p-6 transition-all cursor-pointer group",
                                                field.value === 'alquiler'
                                                    ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm"
                                                    : "border-gray-50 bg-white hover:border-gray-200"
                                            )}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <RadioGroupItem value="alquiler" id="alquiler" className="sr-only" />
                                                <span className={cn("font-bold text-sm", field.value === 'alquiler' ? "text-[#7C3AED]" : "text-[#111827]")}>Alquiler</span>
                                                <span className="text-[10px] text-gray-400">Busca rentar propiedad</span>
                                            </div>
                                            {field.value === 'alquiler' && <Check className="h-4 w-4 text-[#7C3AED]" />}
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div
                        onClick={() => setValue('use_type', !watch('use_type'))}
                        className={cn(
                            "flex items-center gap-4 rounded-2xl border-2 p-6 transition-all cursor-pointer",
                            watch('use_type') ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-gray-50 bg-white hover:border-gray-200"
                        )}
                    >
                        <Checkbox
                            checked={watch('use_type')}
                            onCheckedChange={(v) => setValue('use_type', v)}
                            className="h-6 w-6 rounded-md"
                        />
                        <div className="space-y-0.5">
                            <span className="text-sm font-bold text-[#111827]">Uso para Inversión</span>
                            <p className="text-[10px] text-gray-400">Perfil orientado a rentabilidad.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'necesidad' && (
                <div className="space-y-6">
                    <FormField
                        control={control}
                        name="property_types"
                        render={() => (
                            <FormItem className="space-y-2">
                                <FormLabel className={labelClasses}>Tipología</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Casa', 'Departamento', 'Terreno', 'Oficina', 'Local', 'Bodega'].map((type) => {
                                        const isSelected = watch('property_types')?.includes(type);
                                        return (
                                            <div
                                                key={type}
                                                onClick={() => {
                                                    const current = watch('property_types') || [];
                                                    const next = isSelected
                                                        ? current.filter((v: string) => v !== type)
                                                        : [...current, type];
                                                    setValue('property_types', next);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-[16px] border-2 transition-all cursor-pointer",
                                                    isSelected ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-gray-50 bg-white hover:border-gray-200"
                                                )}
                                            >
                                                <Checkbox checked={isSelected} className="h-5 w-5" />
                                                <span className={cn("text-xs font-bold", isSelected ? "text-[#7C3AED]" : "text-gray-400")}>{type}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex gap-2">
                            <FormField
                                control={control}
                                name="min_budget"
                                render={({ field }) => (
                                    <FormItem className="flex-1 space-y-1">
                                        <FormLabel className={labelClasses}>Pres. Min.</FormLabel>
                                        <FormControl><Input type="number" className={inputClasses} {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="max_budget"
                                render={({ field }) => (
                                    <FormItem className="flex-1 space-y-1">
                                        <FormLabel className={labelClasses}>Pres. Max.</FormLabel>
                                        <FormControl><Input type="number" className={inputClasses} {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={control}
                            name="location"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Zonas</FormLabel>
                                    <FormControl><Input className={inputClasses} placeholder="Ej: Zona Norte..." {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'financiera' && (
                <div className="space-y-6">
                    <FormField
                        control={control}
                        name="payment_methods"
                        render={() => (
                            <FormItem className="space-y-3">
                                <FormLabel className={labelClasses}>Métodos de Pago</FormLabel>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Contado', 'Crédito', 'Permuta', 'Financiación'].map((method) => {
                                        const isSelected = watch('payment_methods')?.includes(method);
                                        return (
                                            <div
                                                key={method}
                                                onClick={() => {
                                                    const current = watch('payment_methods') || [];
                                                    const next = isSelected
                                                        ? current.filter((v: string) => v !== method)
                                                        : [...current, method];
                                                    setValue('payment_methods', next);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 p-5 rounded-[20px] border-2 transition-all cursor-pointer",
                                                    isSelected ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-gray-50 bg-white hover:border-gray-200"
                                                )}
                                            >
                                                <Checkbox checked={isSelected} className="h-6 w-6" />
                                                <span className={cn("text-sm font-bold", isSelected ? "text-[#7C3AED]" : "text-[#111827]")}>{method}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="payment_notes"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className={labelClasses}>Observaciones</FormLabel>
                                <FormControl><Textarea className="h-32 bg-white border-gray-200 rounded-[16px] shadow-sm focus:border-[#7C3AED] resize-none px-4 py-3 font-medium text-[#111827]" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'calificacion' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="interest_level"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Interés</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className={inputClasses}>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Alto">Alto</SelectItem>
                                            <SelectItem value="Medio">Medio</SelectItem>
                                            <SelectItem value="Bajo">Bajo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="urgency_level"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Urgencia</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className={inputClasses}>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Inmediata">Inmediata</SelectItem>
                                            <SelectItem value="Corto plazo">Corto plazo</SelectItem>
                                            <SelectItem value="Mediano plazo">Mediano plazo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'seguimiento' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="next_follow_up"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Próximo Seguimiento</FormLabel>
                                    <FormControl><Input type="date" className={inputClasses} {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="space-y-1">
                            <FormLabel className={labelClasses}>Conteo</FormLabel>
                            <div className="flex items-center gap-4 h-12 bg-gray-50 border border-gray-100 rounded-[12px] px-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setValue('follow_up_count', Math.max(0, followUpCount - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="flex-1 text-center font-black text-lg text-[#7C3AED]">{followUpCount}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setValue('follow_up_count', followUpCount + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <FormField
                        control={control}
                        name="internal_note"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className={labelClasses}>Notas Internas</FormLabel>
                                <FormControl><Textarea className="h-32 bg-white border-gray-200 rounded-[16px] shadow-sm focus:border-[#7C3AED] resize-none px-4 py-3 font-medium text-[#111827]" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'documentos' && leadId && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <DocumentSection
                        entityType="client"
                        entityId={leadId}
                        title="Documentación"
                        requiredTypes={['identidad']}
                    />
                </div>
            )}

            {activeTab === 'contactos' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <LeadInteractionList leadId={leadId} />
                </div>
            )}
        </div>
    );
}
