'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useOpportunities } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Plus, ListFilter, Lightbulb } from "lucide-react";
import { useState } from "react";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { OpportunityDialog } from "@/components/opportunities/OpportunityDialog";
import { Opportunity } from "@/types";

export default function OpportunitiesPage() {
    const { data: opportunities, isLoading } = useOpportunities();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | undefined>();
    const [filter, setFilter] = useState<'all' | 'abierta' | 'ejecutada' | 'cerrada'>('all');

    const filteredOpps = opportunities?.filter(op =>
        filter === 'all' ? true : op.status === filter
    );

    const handleEdit = (opp: Opportunity) => {
        setSelectedOpp(opp);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedOpp(undefined);
        setIsDialogOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Oportunidades</h1>
                        <p className="text-muted-foreground font-medium">Detecta y convierte potenciales clientes con IA.</p>
                    </div>
                    <Button onClick={handleCreate} className="rounded-full shadow-lg hover:shadow-amber-500/25 transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Oportunidad
                    </Button>
                </div>

                <div className="flex gap-2 pb-2 overflow-x-auto">
                    {(['all', 'abierta', 'ejecutada', 'cerrada'] as const).map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(f)}
                            className="rounded-full capitalize"
                        >
                            {f === 'all' ? 'Todas' : f}
                        </Button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 rounded-3xl bg-card/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-8">
                        {filteredOpps?.map((opp) => (
                            <OpportunityCard
                                key={opp.id}
                                opportunity={opp}
                                onEdit={handleEdit}
                            />
                        ))}
                        {filteredOpps?.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground min-h-[300px] glass-panel rounded-3xl">
                                <Lightbulb className="h-12 w-12 text-amber-500/50 mb-4" />
                                <p>No hay oportunidades en esta categoría.</p>
                            </div>
                        )}
                    </div>
                )}

                <OpportunityDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    opportunity={selectedOpp}
                />
            </div>
        </DashboardLayout>
    );
}
