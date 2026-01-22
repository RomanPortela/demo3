'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export function UbicacionForm() {
    const { control } = useFormContext();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Dirección</FormLabel>
                            <FormControl><Input className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="Ej: Av. Santa Fe 1234" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="floor_unit"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Piso / Depto</FormLabel>
                            <FormControl><Input className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="Ej: 4B" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="zone"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Zona / Barrio</FormLabel>
                            <FormControl><Input className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="Ej: Palermo Hollywood" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Ciudad</FormLabel>
                            <FormControl><Input className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="Ej: CABA" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={control}
                name="country"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">País</FormLabel>
                        <FormControl><Input className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="Ej: Argentina" {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
