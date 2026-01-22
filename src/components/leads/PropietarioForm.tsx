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
    History as HistoryIcon,
    ChevronRight,
    FileText,
    Trash2,
    Upload,
    Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PropertySelector } from "@/components/properties/PropertySelector";
import { useProperties } from "@/lib/supabase/queries";
import { type Property } from "@/types";

export const PROPIETARIO_SECTIONS = [
    { id: 'basica', label: 'Información básica', icon: User },
    { id: 'propietario-detalles', label: 'Propietario', icon: Heart },
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'propiedades-vinculadas', label: 'Propiedades', icon: Home },
    { id: 'seguimiento-p', label: 'Actividad y Seguimiento', icon: HistoryIcon },
];

export function PropietarioForm({ activeTab }: { activeTab: string }) {
    const { control, watch, setValue } = useFormContext();
    const { data: allProperties } = useProperties();

    const expectedPrice = watch('expected_price') || 0;
    const minPrice = watch('min_price_acceptable') || 0;
    const commType = watch('commission_type') || 'percentage';
    const commPercExp = watch('commission_percentage_expected') || 0;
    const commPercMin = watch('commission_percentage_min') || 0;
    const commFixedExp = watch('commission_fixed_expected') || 0;
    const commFixedMin = watch('commission_fixed_min') || 0;

    const calcCommExp = commType === 'percentage' ? (expectedPrice * (commPercExp / 100)) : commFixedExp;
    const calcCommMin = commType === 'percentage' ? (minPrice * (commPercMin / 100)) : commFixedMin;

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
                        name="preferred_channel"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Canal Preferido</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl">
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
                    <div className="grid grid-cols-2 gap-6 p-6 rounded-[2rem] bg-muted/20 border border-muted/20">
                        <FormField
                            control={control}
                            name="expected_price"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                        <DollarSign className="h-3 w-3" /> Precio Esperado
                                    </FormLabel>
                                    <FormControl><Input type="number" className="h-12 bg-background/50 border-muted rounded-2xl" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="price_currency"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Moneda</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 bg-background/50 border-muted rounded-2xl">
                                                <SelectValue placeholder="USD" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USD">Dólares (USD)</SelectItem>
                                            <SelectItem value="ARS">Pesos (ARS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Calculator className="h-4 w-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Esquema de Comisión</h4>
                        </div>
                        <FormField
                            control={control}
                            name="commission_type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="percentage" /></FormControl>
                                                <FormLabel className="font-bold text-xs">Porcentaje (%)</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="fixed" /></FormControl>
                                                <FormLabel className="font-bold text-xs">Monto Fijo</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name={commType === 'percentage' ? "commission_percentage_expected" : "commission_fixed_expected"}
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-black text-muted-foreground uppercase">{commType === 'percentage' ? 'Comisión %' : 'Monto'}</FormLabel>
                                        <FormControl><Input type="number" className="h-10 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col justify-end pb-2">
                                <span className="text-[8px] font-black text-muted-foreground uppercase">Comisión Estimada</span>
                                <span className="text-sm font-black text-primary">${calcCommExp.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <FormField
                        control={control}
                        name="motivation_reason"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Motivación de Venta / Alquiler</FormLabel>
                                <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-24" placeholder="¿Por qué vende? ¿Tiene apuro?..." {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {activeTab === 'legal' && (
                <div className="space-y-6">
                    <div className="grid gap-4 p-6 rounded-[2rem] bg-muted/20 border border-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Documentación y Estado Legal</h4>
                        </div>

                        <FormField
                            control={control}
                            name="legal_deed_available"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0 p-3 rounded-xl bg-background/50 border border-muted/20">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-[10px] font-black uppercase">Escritura Disponible</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="legal_free_of_charges"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0 p-3 rounded-xl bg-background/50 border border-muted/20">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-[10px] font-black uppercase">Libre de Deudas / Gravámenes</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="legal_mortgage_existing"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0 p-3 rounded-xl bg-background/50 border border-muted/20">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-[10px] font-black uppercase">Hipoteca Existente</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="legal_notes"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Observaciones Legales</FormLabel>
                                <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-24" placeholder="Detalles sobre sucesión, poderes, planos..." {...field} /></FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Documentación Adjunta</FormLabel>
                            <div className="relative">
                                <Input
                                    type="file"
                                    className="hidden"
                                    id="legal-upload"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        const currentUrls = watch('attachment_urls') || [];
                                        // Simulator: In a real app, upload to Supabase Storage and get URL
                                        const newUrls = files.map(f => URL.createObjectURL(f));
                                        setValue('attachment_urls', [...currentUrls, ...newUrls]);
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-8 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                                    onClick={() => document.getElementById('legal-upload')?.click()}
                                >
                                    <Upload className="h-3 w-3" />
                                    Subir Archivo
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {(() => {
                                const urls = watch('attachment_urls') || [];
                                if (urls.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center p-8 bg-muted/5 rounded-2xl border border-dashed border-muted text-center gap-2">
                                            <FileText className="h-6 w-6 text-muted-foreground/20" />
                                            <p className="text-[10px] font-bold text-muted-foreground">Sin documentos adjuntos</p>
                                        </div>
                                    );
                                }
                                return urls.map((url: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-muted/20 group animate-in fade-in slide-in-from-bottom-2">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">Documento {idx + 1}</p>
                                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">Legal / Escritura</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-primary"
                                                onClick={() => window.open(url, '_blank')}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-destructive"
                                                onClick={() => {
                                                    const filtered = urls.filter((_: any, i: number) => i !== idx);
                                                    setValue('attachment_urls', filtered);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'propiedades-vinculadas' && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground whitespace-normal">Seleccionar una o varias propiedades existentes</FormLabel>
                        <PropertySelector
                            multi
                            value={watch('property_ids')}
                            onChange={(ids) => setValue('property_ids', ids)}
                            placeholder="Buscar propiedades para vincular..."
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-muted/20">
                        {(() => {
                            const selectedIds = watch('property_ids') || [];
                            const selectedProperties = (allProperties as Property[])?.filter(p => selectedIds.includes(p.id)) || [];

                            if (selectedProperties.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center p-12 bg-muted/10 rounded-3xl border-2 border-dashed border-muted text-center gap-3">
                                        <Home className="h-8 w-8 text-muted-foreground/30" />
                                        <p className="text-xs font-bold text-muted-foreground">No hay propiedades vinculadas</p>
                                    </div>
                                );
                            }

                            return (selectedProperties as Property[]).map(p => (
                                <Card key={p.id} className="p-4 bg-background/50 border-muted rounded-2xl flex items-center gap-4 group hover:border-primary/40 transition-all">
                                    <div className="h-16 w-16 rounded-xl bg-muted/30 overflow-hidden shrink-0">
                                        {p.multimedia?.[0]?.url ? (
                                            <img src={p.multimedia[0].url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center"><Home className="h-6 w-6 text-muted-foreground/20" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="secondary" className="text-[8px] h-4 font-black uppercase tracking-widest">{p.property_type}</Badge>
                                            <Badge variant="outline" className="text-[8px] h-4 font-black uppercase tracking-widest text-primary border-primary/20">{p.internal_status}</Badge>
                                        </div>
                                        <h4 className="text-sm font-bold truncate tracking-tight">{p.address || p.zone || 'Sin dirección'}</h4>
                                        <p className="text-[10px] text-muted-foreground font-medium truncate">{p.zone}, {p.city}</p>
                                    </div>
                                    <div className="text-right px-4">
                                        <p className="text-sm font-black text-foreground">{p.currency === 'USD' ? '$' : 'S/'} {p.price?.toLocaleString()}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl font-bold text-xs gap-2 shrink-0 h-10 px-4 hover:bg-primary/5 hover:text-primary transition-all"
                                        onClick={() => window.open(`/properties?id=${p.id}`, '_blank')}
                                    >
                                        Abrir propiedad
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </Card>
                            ));
                        })()}
                    </div>
                </div>
            )}

            {activeTab === 'seguimiento-p' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="next_follow_up"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Próximo Seguimiento</FormLabel>
                                    <FormControl><Input type="date" className="h-11 bg-background/50 border-muted rounded-xl" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="follow_up_channel"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Medio</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 bg-background/50 border-muted rounded-xl">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            <SelectItem value="llamada">Llamada</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="visita">Visita Presencial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={control}
                        name="internal_note"
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Notas internas y seguimiento</FormLabel>
                                <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-48" placeholder="Historial de contacto, observaciones clave..." {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
