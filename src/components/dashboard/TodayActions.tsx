'use client';

import React from 'react';
import { useTodayActions, SmartAlert } from '@/lib/supabase/today-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertCircle, Clock, TrendingUp, Info, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const ALERT_STYLES = {
    critical: {
        icon: AlertCircle,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        dot: 'bg-red-500',
        label: 'Crítico'
    },
    high: {
        icon: Zap,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        dot: 'bg-orange-500',
        label: 'Alta prioridad'
    },
    attention: {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        dot: 'bg-yellow-500',
        label: 'Atención'
    },
    optimization: {
        icon: TrendingUp,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500',
        label: 'Optimización'
    }
};

export function TodayActions() {
    const { data: alerts, isLoading } = useTodayActions();

    if (isLoading) {
        return (
            <div className="grid gap-4 animate-pulse">
                <div className="h-64 bg-white/50 rounded-[2rem] border border-border/50 shadow-sm" />
            </div>
        );
    }

    const hasAlerts = alerts && alerts.length > 0;

    return (
        <Card className="premium-card relative overflow-hidden border-none p-0 group">
            {/* Background Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-400 to-primary" />

            <CardHeader className="pt-10 pb-6 px-10">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                            <div className="relative h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white">
                                <Brain className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-primary">Hoy deberías hacer esto</h2>
                            <p className="text-muted-foreground font-medium mt-1">
                                Sistema de inteligencia predictiva InmoAria
                            </p>
                        </div>
                    </div>
                    {hasAlerts && (
                        <Badge className="px-5 py-2 rounded-full bg-primary/10 text-primary border-none text-xs font-black uppercase tracking-widest">
                            {alerts.length} acciones recomendadas
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-10 pb-10">
                {!hasAlerts ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full" />
                            <div className="relative h-24 w-24 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center transform transition-transform group-hover:scale-110">
                                <CheckCircle2 className="h-12 w-12 text-success" />
                            </div>
                        </div>
                        <h4 className="text-2xl font-black text-foreground">¡Todo en orden!</h4>
                        <p className="text-muted-foreground mt-3 max-w-md mx-auto font-medium text-lg">
                            Has completado todas tus prioridades. Tus leads y propiedades están perfectamente gestionados.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {alerts.map((alert) => {
                            const style = ALERT_STYLES[alert.type];
                            const Icon = style.icon;

                            return (
                                <Link key={alert.id} href={alert.href} className="group/alert">
                                    <div className={cn(
                                        "h-full relative flex flex-col gap-5 p-8 rounded-[2rem] border transition-all duration-300",
                                        "bg-muted/30 hover:bg-white hover:shadow-2xl hover:-translate-y-2",
                                        "border-transparent hover:border-border"
                                    )}>
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover/alert:scale-110 shadow-sm",
                                            style.bg,
                                            style.color
                                        )}>
                                            <Icon className="h-7 w-7" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", style.bg, style.border, style.color)}>
                                                    {style.label}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black tracking-tight leading-tight">
                                                <span className="text-primary font-black opacity-50 text-base">#{alert.count}</span> {alert.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground font-medium mt-3 line-clamp-2">
                                                {alert.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                Acción inmediata <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        InmoAria Engine analiza en tiempo real datos de portales, WhatsApp y comportamiento de leads para generar estas sugerencias. Prioriza estas tareas para aumentar tu tasa de cierre en hasta un 35%.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
