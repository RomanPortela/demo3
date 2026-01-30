'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Home, DollarSign, Image, Lock, FileText, History, X, Save, Heart, Calendar, Globe, Loader2, Files, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCreateProperty, useUpdateProperty } from "@/lib/supabase/queries";
import { Property } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DocumentSection } from "@/components/documents/DocumentSection";
import { UbicacionForm } from "./forms/UbicacionForm";
import { CaracteristicasForm } from "./forms/CaracteristicasForm";
import { PrecioForm } from "./forms/PrecioForm";
import { MultimediaForm } from "./forms/MultimediaForm";
import { InternaForm } from "./forms/InternaForm";
import { GeneralesForm } from "./forms/GeneralesForm";
import { ComercialForm } from "./forms/ComercialForm";
import { PropertyVisitsList } from "./PropertyVisitsList";
import { PortalesForm } from "./forms/PortalesForm";
import { PropertyAlerts } from "./PropertyAlerts";
import { PropertyPriceHistory } from "./PropertyPriceHistory";
import { FeeManagement } from "./forms/FeeManagement";
import { AgentCommissions } from "./forms/AgentCommissions";
import { Badge } from "@/components/ui/badge";

const propertySchema = z.object({
    property_type: z.string().default('casa'),
    operation_type: z.string().default('venta'),
    internal_status: z.string().default('Disponible'),
    internal_visibility: z.string().default('Activa para ventas'),
    owner_id: z.number().optional(),

    // Ubicación
    country: z.string().default(""),
    city: z.string().default(""),
    zone: z.string().default(""),
    address: z.string().default(""),
    floor_unit: z.string().default(""),

    // Características
    bedrooms: z.coerce.number().default(0),
    environments: z.coerce.number().default(0),
    bathrooms: z.coerce.number().default(0),
    parkings: z.coerce.number().default(0),
    m2_built: z.coerce.number().default(0),
    m2_total: z.coerce.number().default(0),
    age: z.coerce.number().default(0),
    orientation: z.string().default(""),
    pets_allowed: z.boolean().default(false),
    furnished_status: z.string().default(""),
    heating_ac_type: z.string().default(""),
    amenities: z.array(z.string()).default([]),
    expenses: z.coerce.number().default(0),

    // Precio
    price: z.coerce.number().default(0),
    min_price_acceptable: z.coerce.number().default(0),
    currency: z.string().default('USD'),
    relevant_taxes: z.string().default(""),

    // Info Interna
    internal_description: z.string().default(""),
    private_notes: z.string().default(""),
    agent_observations: z.string().default(""),

    // Honorarios y Comisiones
    fee_type: z.enum(['percentage', 'fixed', 'mixed']).default('percentage'),
    agreed_fee_percentage: z.coerce.number().default(0),
    agreed_fee_fixed: z.coerce.number().default(0),
    fee_payer: z.enum(['comprador', 'vendedor', 'ambos']).default('vendedor'),
    fee_notes: z.string().default(""),
    real_fee_collected: z.coerce.number().default(0),
    collection_date: z.string().default(""),
    collection_status: z.enum(['pendiente', 'parcial', 'cobrado']).default('pendiente'),
    collection_notes: z.string().default(""),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property?: Property;
    initialTab?: string;
}

const TABS = [
    { id: 'generales', label: 'Datos generales', icon: Home },
    { id: 'ubicacion', label: 'Ubicación', icon: MapPin },
    { id: 'caracteristicas', label: 'Características', icon: Heart },
    { id: 'precio', label: 'Precio', icon: DollarSign },
    { id: 'honorarios', label: 'Honorarios', icon: DollarSign },
    { id: 'interna', label: 'Información interna', icon: Lock },
    { id: 'comercial', label: 'Relación comercial', icon: Info },
    { id: 'documentos', label: 'Documentos', icon: Files },
    { id: 'visitas', label: 'Visitas', icon: Calendar },
    { id: 'historial', label: 'Historial', icon: History },
    { id: 'portales', label: 'Portales', icon: Globe },
];

export function PropertyDialog({ open, onOpenChange, property, initialTab }: PropertyDialogProps) {
    const [activeTab, setActiveTab] = React.useState('generales');
    const { mutate: createProperty, isPending: isCreating } = useCreateProperty();
    const { mutate: updateProperty, isPending: isUpdating } = useUpdateProperty();

    const normalizedData = React.useMemo(() => {
        const defaults = {
            property_type: 'casa',
            operation_type: 'venta',
            internal_status: 'Disponible',
            internal_visibility: 'Activa para ventas',
            currency: 'USD',
            amenities: [],
            country: 'Argentina',
            city: '',
            zone: '',
            address: '',
            floor_unit: '',
            orientation: '',
            furnished_status: 'Sin muebles',
            heating_ac_type: '',
            relevant_taxes: '',
            internal_description: '',
            private_notes: '',
            agent_observations: '',
            bedrooms: 0,
            environments: 0,
            bathrooms: 0,
            parkings: 0,
            m2_built: 0,
            m2_total: 0,
            age: 0,
            expenses: 0,
            price: 0,
            min_price_acceptable: 0,
            pets_allowed: false,
            multimedia: [],
            owner_id: undefined
        };

        if (!property) return defaults;

        return {
            ...defaults,
            ...property,
            country: property.country || 'Argentina',
            city: property.city || '',
            zone: property.zone || '',
            address: property.address || '',
            floor_unit: property.floor_unit || '',
            orientation: property.orientation || '',
            furnished_status: property.furnished_status || 'Sin muebles',
            heating_ac_type: property.heating_ac_type || '',
            relevant_taxes: property.relevant_taxes || '',
            internal_description: property.internal_description || '',
            private_notes: property.private_notes || '',
            agent_observations: property.agent_observations || '',
            amenities: property.amenities || [],
            bedrooms: property.bedrooms || 0,
            environments: property.environments || 0,
            bathrooms: property.bathrooms || 0,
            parkings: property.parkings || 0,
            m2_built: Number(property.m2_built) || 0,
            m2_total: Number(property.m2_total) || 0,
            age: property.age || 0,
            expenses: Number(property.expenses) || 0,
            price: Number(property.price) || 0,
            min_price_acceptable: Number(property.min_price_acceptable) || 0,
            pets_allowed: !!property.pets_allowed,
            multimedia: property.multimedia || [],
            owner_id: (property as any).owner_id || undefined,

            // Fees
            fee_type: property.fee_type || 'percentage',
            agreed_fee_percentage: Number(property.agreed_fee_percentage) || 0,
            agreed_fee_fixed: Number(property.agreed_fee_fixed) || 0,
            fee_payer: property.fee_payer || 'vendedor',
            fee_notes: property.fee_notes || '',
            real_fee_collected: Number(property.real_fee_collected) || 0,
            collection_date: property.collection_date || '',
            collection_status: property.collection_status || 'pendiente',
            collection_notes: property.collection_notes || '',
        };
    }, [property]);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema as any),
        defaultValues: normalizedData
    });

    React.useEffect(() => {
        if (open) {
            form.reset(normalizedData);
            setActiveTab(initialTab || 'generales');
        }
    }, [property, open, form, normalizedData, initialTab]);

    const onSubmit = (values: PropertyFormValues) => {
        if (property?.id) {
            updateProperty({ id: property.id, ...values } as any, {
                onSuccess: () => {
                    toast.success("Propiedad actualizada");
                    onOpenChange(false);
                },
                onError: (error) => {
                    console.error("Error updating property:", error);
                    toast.error("Error al actualizar la propiedad");
                }
            });
        } else {
            createProperty(values as any, {
                onSuccess: () => {
                    toast.success("Propiedad creada");
                    onOpenChange(false);
                },
                onError: (error) => {
                    console.error("Error creating property:", error);
                    toast.error("Error al crear la propiedad");
                }
            });
        }
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
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">EXPEDIENTE DE ACTIVO</h3>
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
                                        disabled={isCreating || isUpdating}
                                        className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                    >
                                        {isCreating || isUpdating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                                        {isCreating || isUpdating ? 'Guardando...' : 'Guardar Propiedad'}
                                    </Button>
                                </div>
                            </div>

                            {/* Panel de Contenido de Máxima Visibilidad */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-16 pt-24 w-full max-w-[1400px] mx-auto">
                                        <div className="bg-white">
                                            {property?.id && <PropertyAlerts propertyId={property.id} />}
                                            {activeTab === 'generales' && <GeneralesForm />}
                                            {activeTab === 'ubicacion' && <UbicacionForm />}
                                            {activeTab === 'caracteristicas' && <CaracteristicasForm />}
                                            {activeTab === 'precio' && <PrecioForm />}
                                            {activeTab === 'honorarios' && (
                                                <div className="space-y-12">
                                                    <FeeManagement />
                                                    {property?.id && <AgentCommissions propertyId={property.id} />}
                                                </div>
                                            )}
                                            {activeTab === 'interna' && <InternaForm />}
                                            {activeTab === 'comercial' && <ComercialForm property={property} />}
                                            {activeTab === 'historial' && property?.id && (
                                                <PropertyPriceHistory
                                                    propertyId={property.id}
                                                    currentPrice={form.getValues('price')}
                                                    currency={form.getValues('currency')}
                                                />
                                            )}
                                            {activeTab === 'portales' && <PortalesForm property={property} />}
                                            {activeTab === 'documentos' && property?.id && (
                                                <div className="space-y-6">
                                                    <DocumentSection
                                                        entityType="property"
                                                        entityId={property.id}
                                                        title="Archivo de la Propiedad"
                                                        requiredTypes={['identidad', 'otro']}
                                                    />
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
