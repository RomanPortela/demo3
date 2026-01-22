'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { CalendarIcon, User, Phone, MapPin, DollarSign, Clock, BarChart3, History as HistoryIcon, Plus, Minus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PropertySelector } from "@/components/properties/PropertySelector";
import { useProperties } from "@/lib/supabase/queries";
import { type Property } from "@/types";

export const PROSPECTO_SECTIONS = [
    { id: 'basica', label: 'Básica', icon: User },
    { id: 'operacion', label: 'Operación', icon: HistoryIcon },
    { id: 'necesidad', label: 'Necesidad', icon: MapPin },
    { id: 'financiera', label: 'Finanzas', icon: DollarSign },
    { id: 'calificacion', label: 'Calificación', icon: BarChart3 },
    { id: 'seguimiento', label: 'Seguimiento', icon: CalendarIcon },
];

export function ProspectoForm({ activeTab }: { activeTab: string }) {
    const { control, watch, setValue } = useFormContext();
    const followUpCount = watch('follow_up_count') || 0;
    const { data: allProperties } = useProperties();

    return (
        <div className="space-y-6 pt-2 pb-8">
            {activeTab === 'basica' && (
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Nombre y Apellido</FormLabel>
                                <FormControl><Input className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="owner_phone"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Teléfono</FormLabel>
                                    <FormControl><Input className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Email</FormLabel>
                                    <FormControl><Input className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={control}
                        name="source"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Fuente</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Prospección">Prospección</SelectItem>
                                        <SelectItem value="ADS">ADS</SelectItem>
                                        <SelectItem value="Fisico">Fisico</SelectItem>
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
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="operation_type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Operación</FormLabel>
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
                                                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                    : "border-muted bg-popover hover:border-muted-foreground/50"
                                            )}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <RadioGroupItem value="compra" id="compra" className="sr-only" />
                                                <span className={cn("font-bold text-sm", field.value === 'compra' ? "text-primary" : "text-foreground")}>Compra</span>
                                                <span className="text-[10px] text-muted-foreground leading-none">Busca adquirir propiedad</span>
                                            </div>
                                            {field.value === 'compra' && <Check className="h-5 w-5 text-primary" />}
                                        </div>
                                        <div
                                            onClick={() => setValue('operation_type', 'alquiler')}
                                            className={cn(
                                                "flex items-center justify-between rounded-2xl border-2 p-6 transition-all cursor-pointer group",
                                                field.value === 'alquiler'
                                                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                    : "border-muted bg-popover hover:border-muted-foreground/50"
                                            )}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <RadioGroupItem value="alquiler" id="alquiler" className="sr-only" />
                                                <span className={cn("font-bold text-sm", field.value === 'alquiler' ? "text-primary" : "text-foreground")}>Alquiler</span>
                                                <span className="text-[10px] text-muted-foreground leading-none">Busca rentar propiedad</span>
                                            </div>
                                            {field.value === 'alquiler' && <Check className="h-5 w-5 text-primary" />}
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div
                        onClick={() => setValue('use_type', !watch('use_type'))}
                        className={cn(
                            "flex items-center gap-4 rounded-2xl border-2 p-5 bg-background/30 cursor-pointer transition-all",
                            watch('use_type') ? "border-primary bg-primary/5" : "border-muted"
                        )}
                    >
                        <Checkbox
                            checked={watch('use_type')}
                            onCheckedChange={(v) => setValue('use_type', v)}
                            className="h-5 w-5"
                        />
                        <div className="space-y-0.5">
                            <span className="text-sm font-bold block">Uso para Inversión</span>
                            <p className="text-[10px] text-muted-foreground font-medium">Marcar si el lead busca rentabilidad.</p>
                        </div>
                        {watch('use_type') && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </div>
                </div>
            )}

            {activeTab === 'necesidad' && (
                <div className="space-y-6">
                    <FormField
                        control={control}
                        name="property_types"
                        render={() => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Tipo de propiedad</FormLabel>
                                <div className="grid grid-cols-3 gap-3">
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
                                                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                                    isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-muted bg-popover hover:border-muted-foreground/30"
                                                )}
                                            >
                                                <Checkbox checked={isSelected} className="h-4 w-4" />
                                                <span className={cn("text-xs font-bold", isSelected ? "text-primary" : "text-foreground")}>{type}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <FormField
                                    control={control}
                                    name="min_budget"
                                    render={({ field }) => (
                                        <FormItem className="flex-1 space-y-1">
                                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Presupuesto Min.</FormLabel>
                                            <FormControl><Input type="number" className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="max_budget"
                                    render={({ field }) => (
                                        <FormItem className="flex-1 space-y-1">
                                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Presupuesto Max.</FormLabel>
                                            <FormControl><Input type="number" className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="budget_currency"
                                    render={({ field }) => (
                                        <FormItem className="w-24 space-y-1">
                                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Moneda</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || 'USD'}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="Pesos">Pesos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <FormField
                            control={control}
                            name="location"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Zonas de interés</FormLabel>
                                    <FormControl><Input className="h-11 bg-background/50 border-muted rounded-xl" placeholder="Ej: Zona Norte, Palermo..." {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-muted/20">
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Propiedades de Interés (Vinculadas)</FormLabel>
                        <PropertySelector
                            multi
                            value={watch('property_ids') || []}
                            onChange={(ids) => setValue('property_ids', ids)}
                            placeholder="Buscar propiedades para vincular..."
                        />

                        <div className="grid grid-cols-1 gap-3 pt-2">
                            {(() => {
                                const selectedIds = watch('property_ids') || [];
                                const selectedProperties = (allProperties as Property[])?.filter(p => selectedIds.includes(p.id)) || [];

                                if (selectedProperties.length > 0) {
                                    return (selectedProperties as Property[]).map(p => (
                                        <Card key={p.id} className="p-3 bg-background/50 border-muted rounded-2xl flex items-center gap-4 group hover:border-primary/40 transition-all">
                                            <div className="h-12 w-12 rounded-xl bg-muted/30 overflow-hidden shrink-0">
                                                {p.multimedia?.[0]?.url ? (
                                                    <img src={p.multimedia[0].url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/20"><User className="h-4 w-4" /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold truncate tracking-tight">{p.address || p.zone || 'Sin dirección'}</h4>
                                                <p className="text-[9px] text-muted-foreground font-medium truncate">{p.property_type} • {p.currency === 'USD' ? '$' : 'S/'} {p.price?.toLocaleString()}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                                                onClick={() => window.open(`/properties?id=${p.id}`, '_blank')}
                                            >
                                                <Plus className="h-3.5 w-3.5 rotate-45" />
                                            </Button>
                                        </Card>
                                    ));
                                }
                                return null;
                            })()}
                        </div>
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
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Forma de pago (Multi-seleccionable)</FormLabel>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Contado', 'Crédito Bancario', 'Permuta', 'Financiación Propia'].map((method) => {
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
                                                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                                    isSelected ? "border-primary bg-primary/5" : "border-muted"
                                                )}
                                            >
                                                <Checkbox checked={isSelected} className="h-4 w-4" />
                                                <span className="text-xs font-bold">{method}</span>
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
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Notas de pago</FormLabel>
                                <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-24" {...field} /></FormControl>
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
                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Nivel de Interés</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl px-4">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Alto">🔥 Alto</SelectItem>
                                            <SelectItem value="Medio">⚡ Medio</SelectItem>
                                            <SelectItem value="Bajo">❄️ Bajo</SelectItem>
                                            <SelectItem value="Exploratorio">🔍 Exploratorio</SelectItem>
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
                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Nivel de Urgencia</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl px-4">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Inmediata">🚀 Inmediata</SelectItem>
                                            <SelectItem value="Corto plazo">📅 Corto plazo</SelectItem>
                                            <SelectItem value="Mediano plazo">⏳ Mediano plazo</SelectItem>
                                            <SelectItem value="Sin urgencia">🌿 Sin urgencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <FormField
                            control={control}
                            name="financial_status"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Capacidad Financiera</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl px-4">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Confirmada">💰 Confirmada</SelectItem>
                                            <SelectItem value="Parcial">🏦 Parcial (Crédito)</SelectItem>
                                            <SelectItem value="No confirmada">❓ No confirmada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="lead_status"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Estado del Lead</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl px-4">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Calificado">💎 Calificado</SelectItem>
                                            <SelectItem value="En seguimiento">📨 En seguimiento</SelectItem>
                                            <SelectItem value="En negociación">🤝 En negociación</SelectItem>
                                            <SelectItem value="Frío">🧊 Frío</SelectItem>
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
                            name="urgency_level"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Nivel de urgencia</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="inmediata">Inmediata</SelectItem>
                                            <SelectItem value="3_meses">Menos de 3 meses</SelectItem>
                                            <SelectItem value="6_meses">3 a 6 meses</SelectItem>
                                            <SelectItem value="mas_6_meses">Más de 6 meses</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="next_follow_up"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Fecha Seguimiento</FormLabel>
                                    <FormControl><Input type="date" className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Sumador de seguimiento</FormLabel>
                            <div className="flex items-center gap-3 h-11 bg-background/50 border border-muted rounded-xl px-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => setValue('follow_up_count', Math.max(0, followUpCount - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="flex-1 text-center font-bold text-sm font-mono tracking-tighter">{followUpCount}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => setValue('follow_up_count', followUpCount + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <FormField
                            control={control}
                            name="visit_date"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Fecha de Visita</FormLabel>
                                    <FormControl><Input type="date" className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={control}
                        name="internal_note"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Notas de Seguimiento y Urgencia</FormLabel>
                                <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-40" placeholder="Historial, detalles de urgencia, notas internas..." {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
