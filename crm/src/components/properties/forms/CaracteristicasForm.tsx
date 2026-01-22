'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

export function CaracteristicasForm() {
    const { control, watch, setValue } = useFormContext();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Core Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { name: 'bedrooms', label: 'Dorms', type: 'number' },
                    { name: 'environments', label: 'Ambientes', type: 'number' },
                    { name: 'bathrooms', label: 'Baños', type: 'number' },
                    { name: 'parkings', label: 'Cocheras', type: 'number' },
                ].map((item) => (
                    <FormField
                        key={item.name}
                        control={control}
                        name={item.name}
                        render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">{item.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-bold text-center"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
            </div>

            {/* Surfaces */}
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="m2_built"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">M2 Cubiertos</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-bold pr-12"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">M²</span>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="m2_total"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">M2 Totales</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-bold pr-12"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">M²</span>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                    control={control}
                    name="orientation"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Orientación</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-background/50 border-muted rounded-2xl">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="norte">Norte</SelectItem>
                                    <SelectItem value="sur">Sur</SelectItem>
                                    <SelectItem value="este">Este</SelectItem>
                                    <SelectItem value="oeste">Oeste</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="age"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Antigüedad (Años)</FormLabel>
                            <FormControl><Input type="number" className="h-12 bg-background/50 border-muted rounded-2xl" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                        </FormItem>
                    )}
                />
                <div
                    onClick={() => setValue('pets_allowed', !watch('pets_allowed'))}
                    className={cn(
                        "flex items-center gap-3 px-5 h-12 rounded-2xl border-2 transition-all cursor-pointer mt-5",
                        watch('pets_allowed') ? "border-primary bg-primary/5 text-primary" : "border-muted bg-popover"
                    )}
                >
                    <Checkbox checked={watch('pets_allowed')} className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-black tracking-[0.1em]">Acepta Mascotas</span>
                </div>
            </div>

            {/* Amenities (Multi-select) */}
            <div className="space-y-3">
                <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Amenities y Servicios</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Piscina', 'SUM', 'Gimnasio', 'Parrilla', 'Seguridad', 'Lavadero', 'Balcón', 'Baulera'].map((amenity) => {
                        const isSelected = (watch('amenities') || []).includes(amenity);
                        return (
                            <div
                                key={amenity}
                                onClick={() => {
                                    const current = watch('amenities') || [];
                                    const next = isSelected
                                        ? current.filter((a: string) => a !== amenity)
                                        : [...current, amenity];
                                    setValue('amenities', next);
                                }}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-tight text-center cursor-pointer transition-all",
                                    isSelected ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "bg-background/20 border-muted text-muted-foreground hover:border-muted-foreground/30"
                                )}
                            >
                                {amenity}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
