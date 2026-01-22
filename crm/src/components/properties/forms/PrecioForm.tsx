'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

export function PrecioForm() {
    const { control, watch } = useFormContext();
    const currency = watch('currency') || 'USD';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-4">
                <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Precio de Lista</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-black text-lg px-8"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">{currency === 'USD' ? '$' : 'S/'}</span>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="currency"
                    render={({ field }) => (
                        <FormItem className="w-24 space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Moneda</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || 'USD'}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-background/50 border-muted rounded-2xl">
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

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="min_price_acceptable"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Mínimo Aceptable (Cierre)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-bold px-8"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">{currency === 'USD' ? '$' : 'S/'}</span>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="expenses"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Expensas</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-bold px-8"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">{currency === 'USD' ? '$' : 'S/'}</span>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="relevant_taxes"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Impuestos / ABL / Otros</FormLabel>
                        <FormControl><Input className="h-12 bg-background/50 border-muted rounded-2xl" placeholder="Ej: ABL $1200, ARBA bimestral..." {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
