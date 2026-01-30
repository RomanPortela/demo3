'use client';

import React from 'react';
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Percent, User, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeeManagement() {
    const { control, watch } = useFormContext();
    const feeType = watch("fee_type");
    const collectionStatus = watch("collection_status");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            {/* Agreement Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-1">Acuerdo de Honorarios</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Condiciones pactadas con el cliente</p>
                    </div>
                </div>

                <Card className="p-6 bg-background/50 border-muted/20 rounded-[2rem] shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <FormField
                                control={control}
                                name="fee_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black opacity-70">Tipo de Honorario</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/20 h-10 rounded-xl font-bold border-muted/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                                <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                                                <SelectItem value="mixed">Mixto (% + $)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {(feeType === 'percentage' || feeType === 'mixed') && (
                                    <FormField
                                        control={control}
                                        name="agreed_fee_percentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-black opacity-70">Honorario (%)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                        <Input type="number" step="0.1" {...field} className="pl-9 bg-background/20 h-10 rounded-xl font-bold" />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {(feeType === 'fixed' || feeType === 'mixed') && (
                                    <FormField
                                        control={control}
                                        name="agreed_fee_fixed"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-black opacity-70">Honorario Fijo ($)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                        <Input type="number" {...field} className="pl-9 bg-background/20 h-10 rounded-xl font-bold" />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <FormField
                                control={control}
                                name="fee_payer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black opacity-70">Parte que Paga</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/20 h-10 rounded-xl font-bold border-muted/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="vendedor">Vendedor</SelectItem>
                                                <SelectItem value="comprador">Comprador</SelectItem>
                                                <SelectItem value="ambos">Ambos (Compartido)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <FormField
                                control={control}
                                name="fee_notes"
                                render={({ field }) => (
                                    <FormItem className="h-full flex flex-col">
                                        <FormLabel className="text-[10px] uppercase font-black opacity-70">Observaciones del Acuerdo</FormLabel>
                                        <FormControl className="flex-1">
                                            <Textarea
                                                placeholder="Ej: Incluye gastos de escribanía, acuerdo por exclusividad..."
                                                className="bg-background/20 rounded-xl font-bold resize-none min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Collection Tracking Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 rounded-full bg-primary/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Seguimiento de Cobro</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className={cn(
                        "p-6 bg-background/50 border-muted/20 rounded-[2rem] transition-all",
                        collectionStatus === 'cobrado' ? "border-green-500/30 bg-green-500/5" :
                            collectionStatus === 'parcial' ? "border-amber-500/30 bg-amber-500/5" : ""
                    )}>
                        <FormField
                            control={control}
                            name="collection_status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] uppercase font-black opacity-70">Estado del Cobro</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-background/20 h-10 rounded-xl font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pendiente">Pendiente</SelectItem>
                                            <SelectItem value="parcial">Parcial</SelectItem>
                                            <SelectItem value="cobrado">Cobrado Total</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </Card>

                    <Card className="p-6 bg-background/50 border-muted/20 rounded-[2rem] md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name="real_fee_collected"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black opacity-70">Monto Cobrado Real ($)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input type="number" {...field} className="pl-9 bg-background/20 h-10 rounded-xl font-bold" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="collection_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black opacity-70">Fecha de Cobro</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="bg-background/20 h-10 rounded-xl font-bold" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
