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
            <div className="flex flex-col gap-8 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Tracking Diario</h1>
                        <p className="text-muted-foreground font-medium">
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                        </p>
                    </div>
                    <Button onClick={handleSaveSnapshot} className="gap-2">
                        <Save className="h-4 w-4" />
                        Guardar Métricas
                    </Button>
                </div>

                {/* Daily Counters Grid */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {definitions?.map((def) => {
                        const count = getCount(def.id);
                        return (
                            <div key={def.id} className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 hover:border-primary/50 transition-all group relative overflow-hidden">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center line-clamp-1" title={def.name}>
                                    {def.name}
                                </h3>
                                <div className="flex items-center justify-between w-full bg-accent/30 rounded-lg p-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-background/50 hover:text-primary rounded-md"
                                        onClick={() => handleUpdate(def.id, count - 1)}
                                        disabled={count <= 0}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-2xl font-black text-foreground min-w-[2ch] text-center">
                                        {count}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-background/50 hover:text-primary rounded-md"
                                        onClick={() => handleUpdate(def.id, count + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {/* Background decoration */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {/* Funnel Analysis Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Active Funnel Metrics */}
                    <Card className="glass-panel border-none p-6">
                        <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Embudo de Conversión (Hoy)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 flex flex-col gap-6">
                            {definitions && definitions.length > 1 && (
                                <>
                                    {/* Step by Step */}
                                    <div className="space-y-4">
                                        {definitions.slice(0, -1).map((current, idx) => {
                                            const next = definitions[idx + 1];
                                            const countCurrent = getCount(current.id);
                                            const countNext = getCount(next.id);
                                            const percent = countCurrent > 0 ? Math.round((countNext / countCurrent) * 100) : 0;

                                            return (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                        <span>{current.name} <ArrowRight className="inline h-3 w-3 mx-1" /> {next.name}</span>
                                                        <span>{percent}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Total Conversion */}
                                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-primary uppercase">Conversión Total</span>
                                            <Badge className="bg-primary text-primary-foreground">
                                                {definitions.length > 0 && getCount(definitions[0].id) > 0
                                                    ? Math.round((getCount(definitions[definitions.length - 1].id) / getCount(definitions[0].id)) * 100)
                                                    : 0}%
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            De {definitions[0].name} a {definitions[definitions.length - 1].name}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Historical Snapshots */}
                    <Card className="glass-panel border-none p-6">
                        <CardHeader className="px-0 pt-0 pb-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Historial de Métricas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {snapshots?.map((snap) => {
                                    const defFrom = definitions?.find(d => d.id === snap.step_from_id)?.name;
                                    const defTo = definitions?.find(d => d.id === snap.step_to_id)?.name;

                                    return (
                                        <div key={snap.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/30 border border-border/50 text-sm">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-foreground">
                                                    {defFrom} <ArrowRight className="inline h-3 w-3 mx-1 text-muted-foreground" /> {defTo}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(snap.created_at), "d MMM yyyy HH:mm", { locale: es })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-primary">{snap.percentage.toFixed(1)}%</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {snap.count_from} → {snap.count_to}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {!snapshots?.length && (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No hay métricas guardadas
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
