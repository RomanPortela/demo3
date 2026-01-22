'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

export function InternaForm() {
    const { control } = useFormContext();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <FormField
                control={control}
                name="internal_description"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Descripción Pública / Comercial</FormLabel>
                        <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-40 focus:ring-primary/20" placeholder="Escribe una descripción atractiva para los portales..." {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="private_notes"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Notas Privadas (Solo Staff)</FormLabel>
                        <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-32 focus:ring-primary/20" placeholder="Detalles irrelevantes para el público, contraseñas, alarmas..." {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="agent_observations"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Observaciones del Agente</FormLabel>
                        <FormControl><Textarea className="bg-background/50 border-muted rounded-2xl resize-none h-32 focus:ring-primary/20" placeholder="Tu opinión profesional, potencial de negociación..." {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
