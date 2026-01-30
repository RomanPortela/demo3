'use client';

import React from 'react';
import { usePropertyPriceHistory, PriceHistoryItem } from '@/lib/supabase/property-alerts';
import { usePropertyVisits, useVisits } from '@/lib/supabase/queries';
import { Card } from '@/components/ui/card';
import { History, TrendingDown, TrendingUp, Calendar, User, ArrowRight, Activity, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PropertyPriceHistoryProps {
    propertyId: number;
    currentPrice?: number;
    currency?: string;
}

export function PropertyPriceHistory({ propertyId, currentPrice, currency }: PropertyPriceHistoryProps) {
    const { data: history, isLoading: loadingHistory } = usePropertyPriceHistory(propertyId);
    const { data: visits } = useVisits(undefined, propertyId);

    // Simplification for the demo: count visits since last price change
    const lastChangeDate = history && history.length > 0 ? new Date(history[0].changed_at) : null;
    const visitsSinceLastChange = visits?.filter(v =>
        lastChangeDate && new Date(v.scheduled_at) > lastChangeDate
    ).length || 0;

    if (loadingHistory) return <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 rounded-2xl" />)}
    </div>;

    const hasHistory = history && history.length > 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Performance Stats Overlay */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-primary/5 border-primary/10 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary mb-2">
                        <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Visitas Totales</span>
                    <span className="text-xl font-black text-primary">{(visits || []).length}</span>
                </Card>
                <Card className="p-4 bg-amber-500/5 border-amber-500/10 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 mb-2">
                        <History className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Días en Mercado</span>
                    <span className="text-xl font-black text-amber-600">--</span>
                </Card>
                <Card className="p-4 bg-green-500/5 border-green-500/10 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="p-2 rounded-xl bg-green-500/10 text-green-500 mb-2">
                        <Target className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Visitas/Cambio</span>
                    <span className="text-xl font-black text-green-600">{visitsSinceLastChange}</span>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-1 rounded-full bg-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Evolución de Precio</h3>
                </div>

                {!hasHistory ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-muted/20 text-center">
                        <div className="p-4 rounded-full bg-muted/10 mb-4">
                            <History className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Sin historial registrado</p>
                        <p className="text-[10px] text-muted-foreground/60 font-medium">Los cambios de precio se registrarán automáticamente aquí.</p>
                    </div>
                ) : (
                    <div className="relative space-y-4 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted/20">
                        {history.map((item, idx) => {
                            const isReduction = item.new_price < item.old_price;
                            const diff = Math.abs(item.new_price - item.old_price);
                            const percent = ((diff / item.old_price) * 100).toFixed(1);

                            return (
                                <div key={item.id} className="relative pl-14 transition-all hover:scale-[1.01]">
                                    {/* Timeline dot */}
                                    <div className={cn(
                                        "absolute left-[18px] top-6 h-3 w-3 rounded-full ring-4 ring-background z-10",
                                        idx === 0 ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                                    )} />

                                    <Card className="p-5 bg-background/50 border-muted/20 rounded-3xl group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    {format(parseISO(item.changed_at), "d MMM, yyyy • HH:mm", { locale: es })}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg",
                                                isReduction ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                            )}>
                                                {isReduction ? `-${percent}% Reducción` : `+${percent}% Aumento`}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Anterior</span>
                                                <span className="text-sm font-bold text-muted-foreground/50 line-through">
                                                    {item.currency === 'USD' ? '$' : 'S/'} {item.old_price.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="p-2 rounded-xl bg-muted/5">
                                                <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">Nuevo Precio</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black text-foreground tracking-tighter">
                                                        {item.currency === 'USD' ? '$' : 'S/'} {item.new_price.toLocaleString()}
                                                    </span>
                                                    {isReduction ? <TrendingDown className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-amber-500" />}
                                                </div>
                                            </div>
                                        </div>

                                        {idx === 0 && visitsSinceLastChange > 0 && (
                                            <div className="mt-4 pt-4 border-t border-muted/10 flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Impacto Comercial</span>
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-3 w-3 text-primary" />
                                                    <span className="text-[10px] font-bold text-primary">{visitsSinceLastChange} Visitas registradas desde este cambio</span>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
