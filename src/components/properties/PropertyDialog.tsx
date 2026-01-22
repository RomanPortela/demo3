'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Home, DollarSign, Image, Lock, FileText, History, X, Save, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCreateProperty, useUpdateProperty } from "@/lib/supabase/queries";
import { Property } from "@/types";
import { cn } from "@/lib/utils";
import { UbicacionForm } from "./forms/UbicacionForm";
import { CaracteristicasForm } from "./forms/CaracteristicasForm";
import { PrecioForm } from "./forms/PrecioForm";
import { MultimediaForm } from "./forms/MultimediaForm";
import { InternaForm } from "./forms/InternaForm";
import { GeneralesForm } from "./forms/GeneralesForm";
import { ComercialForm } from "./forms/ComercialForm";

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
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property?: Property;
}

const TABS = [
    { id: 'generales', label: 'Datos generales', icon: Home },
    { id: 'ubicacion', label: 'Ubicación', icon: MapPin },
    { id: 'caracteristicas', label: 'Características', icon: Heart },
    { id: 'precio', label: 'Precio', icon: DollarSign },
    { id: 'interna', label: 'Información interna', icon: Lock },
    { id: 'comercial', label: 'Relación comercial', icon: History },
];

export function PropertyDialog({ open, onOpenChange, property }: PropertyDialogProps) {
    const [activeTab, setActiveTab] = React.useState('generales');
    const { mutate: createProperty } = useCreateProperty();
    const { mutate: updateProperty } = useUpdateProperty();

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema as any),
        defaultValues: property ? (property as any) : {
            property_type: 'casa',
            operation_type: 'venta',
            internal_status: 'Disponible',
            internal_visibility: 'Activa para ventas',
            currency: 'USD',
            amenities: [],
        }
    });

    const onSubmit = (values: PropertyFormValues) => {
        if (property?.id) {
            updateProperty({ id: property.id, ...values } as any);
        } else {
            createProperty(values as any);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1100px] h-[85vh] p-0 gap-0 border-none bg-background/60 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="flex flex-col h-full relative">
                    {/* Header Wrap */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-muted/20 bg-background/20">
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Home className="h-5 w-5" />
                                    </div>
                                    {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 ml-11">
                                {property ? `ID: ${property.id} • ${property.internal_status}` : 'Configura los detalles del activo'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Horizontal Tabs Navigation */}
                    <div className="px-8 bg-muted/5 border-b border-muted/10">
                        <ScrollArea className="w-full">
                            <div className="flex gap-2 p-1 min-w-max">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center gap-2.5 px-6 py-3.5 rounded-2xl transition-all duration-300 relative group",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                    : "hover:bg-muted/50 text-muted-foreground"
                                            )}
                                        >
                                            <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "scale-110" : "opacity-70")} />
                                            <span className="text-xs font-bold tracking-tight">{tab.label}</span>
                                            {isActive && (
                                                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 h-1 w-1 bg-white rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                            <ScrollArea className="flex-1 p-8">
                                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                                    {activeTab === 'generales' && <GeneralesForm />}
                                    {activeTab === 'ubicacion' && <UbicacionForm />}
                                    {activeTab === 'caracteristicas' && <CaracteristicasForm />}
                                    {activeTab === 'precio' && <PrecioForm />}
                                    {activeTab === 'interna' && <InternaForm />}
                                    {activeTab === 'comercial' && <ComercialForm property={property} />}
                                </div>
                            </ScrollArea>

                            {/* Sticky Footer */}
                            <div className="px-8 py-6 border-t border-muted/20 bg-background/40 backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Autoguardado habilitado</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">Cancelar</Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 font-black flex gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95">
                                        <Save className="h-4 w-4" />
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

