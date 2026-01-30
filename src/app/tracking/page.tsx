'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    useTrackingDefinitions,
    useTrackingDaily,
    useUpdateDailyTracking,
    useTrackingFunnelSnapshots,
    useSaveFunnelSnapshot
} from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Save, TrendingUp, History, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TrackingPage() {
    const today = new Date().toISOString().split('T')[0];

    // Queries
    const { data: definitions } = useTrackingDefinitions();
    const { data: dailyMetrics } = useTrackingDaily(today);
    const { data: snapshots } = useTrackingFunnelSnapshots();

    // Mutations
    const updateTracking = useUpdateDailyTracking();
    const saveSnapshot = useSaveFunnelSnapshot();

    // Helper to get count for a definition
    const getCount = (defId: number) => {
        return dailyMetrics?.find(m => m.definition_id === defId)?.count || 0;
    };

    const handleUpdate = (defId: number, newCount: number) => {
        if (newCount < 0) return;
        updateTracking.mutate({
            definition_id: defId,
            date: today,
            count: newCount
        });
    };

    const handleSaveSnapshot = async () => {
        if (!definitions || definitions.length < 2) return;

        const newSnapshots = [];
        const countFirst = getCount(definitions[0].id);
        const countLast = getCount(definitions[definitions.length - 1].id);

        // Step to Step
        for (let i = 0; i < definitions.length - 1; i++) {
            const current = definitions[i];
            const next = definitions[i + 1];
            const countCurrent = getCount(current.id);
            const countNext = getCount(next.id);

            if (countCurrent > 0) {
                newSnapshots.push({
                    step_from_id: current.id,
                    step_to_id: next.id,
                    percentage: (countNext / countCurrent) * 100,
                    count_from: countCurrent,
                    count_to: countNext,
                    date: today
                });
            }
        }

        // Global (First to Last)
        if (countFirst > 0) {
            newSnapshots.push({
                step_from_id: definitions[0].id,
                step_to_id: definitions[definitions.length - 1].id,
                percentage: (countLast / countFirst) * 100,
                count_from: countFirst,
                count_to: countLast,
                date: today
            });
        }

        if (newSnapshots.length > 0) {
            try {
                await saveSnapshot.mutateAsync(newSnapshots);
                toast.success("Métricas del embudo guardadas");
            } catch (error) {
                toast.error("Error al guardar métricas");
            }
        } else {
            toast.error("No hay datos suficientes para generar reporte");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 pb-20 relative min-h-screen">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-indigo-100 text-indigo-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Performance Tracking
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-foreground">Actividad Diaria</h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1">
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                        </p>
                    </div>
                    <Button onClick={handleSaveSnapshot} className="h-14 px-8 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all font-black text-base gap-3 text-white">
                        <Save className="h-6 w-6" /> Guardar Reporte Hoy
                    </Button>
                </div>

                {/* Daily Counters Grid */}
                <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 relative z-10">
                    {definitions?.map((def, idx) => {
                        const count = getCount(def.id);
                        const gradients = [
                            'from-emerald-50 to-teal-50 border-emerald-100',
                            'from-blue-50 to-indigo-50 border-blue-100',
                            'from-purple-50 to-fuchsia-50 border-purple-100',
                            'from-amber-50 to-orange-50 border-amber-100',
                            'from-rose-50 to-pink-50 border-rose-100'
                        ];
                        const textColors = ['text-emerald-600', 'text-blue-600', 'text-purple-600', 'text-amber-600', 'text-rose-600'];
                        const bgColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];

                        const styleIdx = idx % gradients.length;

                        return (
                            <Card key={def.id} className={cn(
                                "p-8 rounded-[3rem] border-2 bg-gradient-to-br transition-all duration-500 group relative overflow-hidden flex flex-col items-center gap-6",
                                gradients[styleIdx],
                                "hover:scale-105 hover:shadow-2xl hover:shadow-black/5"
                            )}>
                                <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-center px-2 leading-tight h-8 flex items-center justify-center", textColors[styleIdx])}>
                                    {def.name}
                                </h3>

                                <div className="relative h-32 w-32 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-white rounded-full shadow-inner opacity-60" />
                                    <div className="relative z-10 text-5xl font-black tracking-tighter text-foreground group-hover:scale-110 transition-transform">
                                        {count}
                                    </div>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                        <circle
                                            cx="64" cy="64" r="60"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className={cn("opacity-10", textColors[styleIdx])}
                                        />
                                    </svg>
                                </div>

                                <div className="flex items-center gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-full border border-white shadow-sm w-full">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-foreground hover:bg-gray-100 rounded-full"
                                        onClick={() => handleUpdate(def.id, count - 1)}
                                        disabled={count <= 0}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <div className="flex-1 text-center font-black text-xs uppercase text-muted-foreground opacity-40">
                                        Stats
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-10 w-10 text-white hover:opacity-90 rounded-full transition-all active:scale-90", bgColors[styleIdx])}
                                        onClick={() => handleUpdate(def.id, count + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-8 lg:grid-cols-2 relative z-10">
                    <Card className="p-10 premium-card bg-white/80 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader className="px-0 pt-0 pb-10">
                            <CardTitle className="text-2xl font-black flex items-center gap-3">
                                <TrendingUp className="h-7 w-7 text-primary" />
                                Embudo de Conversión (Hoy)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 flex flex-col gap-10">
                            {definitions && definitions.length > 1 && (
                                <>
                                    <div className="space-y-8">
                                        {definitions.slice(0, -1).map((current, idx) => {
                                            const next = definitions[idx + 1];
                                            const countCurrent = getCount(current.id);
                                            const countNext = getCount(next.id);
                                            const percent = countCurrent > 0 ? Math.round((countNext / countCurrent) * 100) : 0;

                                            return (
                                                <div key={idx} className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Paso {idx + 1}</span>
                                                            <span className="text-sm font-black text-foreground uppercase tracking-tight">{current.name} <ArrowRight className="inline h-4 w-4 mx-1 text-primary" /> {next.name}</span>
                                                        </div>
                                                        <span className="text-2xl font-black text-primary tracking-tighter">{percent}%</span>
                                                    </div>
                                                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                                        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                                            <TrendingUp className="h-40 w-40" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Conversión Final</span>
                                                <div className="h-10 w-20 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-black text-xl">
                                                    {definitions.length > 0 && getCount(definitions[0].id) > 0
                                                        ? Math.round((getCount(definitions[definitions.length - 1].id) / getCount(definitions[0].id)) * 100)
                                                        : 0}%
                                                </div>
                                            </div>
                                            <p className="text-xl font-black tracking-tight leading-snug">
                                                Desde {definitions[0].name} hasta alcanzar {definitions[definitions.length - 1].name}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="p-10 premium-card bg-white/80 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader className="px-0 pt-0 pb-10">
                            <CardTitle className="text-2xl font-black flex items-center gap-3">
                                <History className="h-7 w-7 text-primary" />
                                Registro Histórico
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                {snapshots?.map((snap) => {
                                    const defFrom = definitions?.find(d => d.id === snap.step_from_id)?.name;
                                    const defTo = definitions?.find(d => d.id === snap.step_to_id)?.name;

                                    return (
                                        <div key={snap.id} className="group p-6 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-black/5 border border-transparent hover:border-border transition-all flex items-center justify-between">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs font-black text-foreground uppercase tracking-tight">
                                                    {defFrom} <ArrowRight className="inline h-3 w-3 mx-1 text-primary" /> {defTo}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                    {format(new Date(snap.created_at), "d MMM yyyy • HH:mm", { locale: es })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-2xl font-black text-primary tracking-tighter">{snap.percentage.toFixed(1)}%</span>
                                                <Badge variant="outline" className="text-[9px] font-black border-primary/20 bg-primary/5 text-primary">
                                                    {snap.count_from} → {snap.count_to}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {!snapshots?.length && (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                        <History className="h-16 w-16 mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">No hay registros históricos</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
