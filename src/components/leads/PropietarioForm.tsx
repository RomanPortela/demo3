'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import {
    User,
    Home,
    MapPin,
    DollarSign,
    Scale,
    Heart,
    ShieldCheck,
    Plus,
    Minus,
    Calendar,
    History as HistoryIcon,
    ChevronRight,
    FileText,
    Trash2,
    Upload,
    Calculator,
    Brain,
    AlertTriangle,
    BarChart3,
    Mail,
    Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PropertySelector } from "@/components/properties/PropertySelector";
import { LeadInteractionList } from "./LeadInteractionList";
import { useProperties } from "@/lib/supabase/queries";
import { type Property } from "@/types";

export const PROPIETARIO_SECTIONS = [
    { id: 'basica', label: 'Información básica', icon: User },
    { id: 'propietario-detalles', label: 'Propietario', icon: Heart },
    { id: 'calificacion', label: 'Calificación', icon: BarChart3 },
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'propiedades-vinculadas', label: 'Propiedades', icon: Home },
    { id: 'documentos', label: 'Documentos', icon: Plus },
    { id: 'seguimiento-p', label: 'Actividad y Seguimiento', icon: HistoryIcon },
    { id: 'contactos-p', label: 'Contactos', icon: User },
];

import { DocumentSection } from "@/components/documents/DocumentSection";

export function PropietarioForm({ activeTab, leadId }: { activeTab: string, leadId?: number }) {
    const { control, watch, setValue } = useFormContext();
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
                        name="preferred_channel"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className={labelClasses}>Canal Preferido</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={inputClasses}>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="llamada">Llamada</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'propietario-detalles' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-6 rounded-[24px] bg-gray-50/50 border border-gray-100">
                        <FormField
                            control={control}
                            name="expected_price"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Precio Esperado</FormLabel>
                                    <FormControl><Input type="number" className={inputClasses} {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="price_currency"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className={labelClasses}>Moneda</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'USD'}>
                                        <FormControl>
                                            <SelectTrigger className={inputClasses}>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USD">Dólares (USD)</SelectItem>
                                            <SelectItem value="Pesos">Pesos (ARS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="exclusivity"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className={labelClasses}>Exclusividad</FormLabel>
                                <div
                                    onClick={() => setValue('exclusivity', !field.value)}
                                    className={cn(
                                        "flex items-center gap-4 p-6 rounded-[20px] border-2 transition-all cursor-pointer",
                                        field.value ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-gray-50 bg-white hover:border-gray-200"
                                    )}
                                >
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6" />
                                    <div className="flex-1">
                                        <span className={cn("text-sm font-bold", field.value ? "text-[#7C3AED]" : "text-[#111827]")}>GESTIÓN EXCLUSIVA</span>
                                        <p className="text-[10px] text-gray-400">Contrato de exclusividad firmado.</p>
                                    </div>
                                    {field.value && <ShieldCheck className="h-5 w-5 text-[#7C3AED]" />}
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'calificacion' && (
                <div className="space-y-6">
                    <FormField
                        control={control}
                        name="owner_urgency_level"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className={labelClasses}>Urgencia de Venta</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={inputClasses}>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Inmediata" className="text-rose-500">Inmediata</SelectItem>
                                        <SelectItem value="Corto plazo">Corto plazo</SelectItem>
                                        <SelectItem value="Mediano plazo">Mediano plazo</SelectItem>
                                        <SelectItem value="Exploratorio">Solo tasación</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'legal' && (
                <div className="space-y-6">
                    <FormField
                        control={control}
                        name="legal_problem"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className={labelClasses}>Situación Jurídica</FormLabel>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Ninguno', 'Herencia', 'Divorcio', 'Sucesión', 'Otro'].map((prob) => (
                                        <div
                                            key={prob}
                                            onClick={() => setValue('legal_problem', prob)}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-[16px] border-2 transition-all cursor-pointer",
                                                field.value === prob ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-gray-50 bg-white hover:border-gray-200"
                                            )}
                                        >
                                            <div className={cn("h-3 w-3 rounded-full border-2", field.value === prob ? "border-[#7C3AED] bg-white" : "border-gray-200")} />
                                            <span className={cn("text-xs font-bold", field.value === prob ? "text-[#7C3AED]" : "text-gray-400")}>{prob}</span>
                                        </div>
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'propiedades-vinculadas' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-[#111827] uppercase tracking-tight">Activos Vinculados</h3>
                        <Button className="rounded-full bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90 font-black text-[10px] uppercase px-6 h-10 tracking-widest gap-2 shadow-lg shadow-[#7C3AED]/10">
                            <Plus className="h-4 w-4" /> Vincular
                        </Button>
                    </div>
                    <PropertySelector
                        selectedIds={watch('property_ids') || []}
                        onChange={(ids) => setValue('property_ids', ids)}
                    />
                </div>
            )}

            {activeTab === 'documentos' && leadId && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <DocumentSection
                        entityType="client"
                        entityId={leadId}
                        title="Documentos"
                    />
                </div>
            )}

            {activeTab === 'seguimiento-p' && (
                <div className="space-y-6">
                    <FormField
                        control={control}
                        name="extra_info"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className={labelClasses}>Bitácora de Seguimiento</FormLabel>
                                <FormControl><Textarea className="h-48 bg-white border-gray-200 rounded-[24px] shadow-sm focus:border-[#7C3AED] resize-none px-6 py-4 font-medium text-[#111827]" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'contactos-p' && leadId && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <LeadInteractionList leadId={leadId} />
                </div>
            )}
        </div>
    );
}
