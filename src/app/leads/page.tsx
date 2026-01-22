'use client';

import { useLeads, useLeadColumns, useUpdateLeadStatus } from "@/lib/supabase/queries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { LeadCard } from "@/components/leads/LeadCard";
import { type Lead, type LeadColumn } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { useState } from "react";
import { LeadDialog } from "@/components/leads/LeadDialog";
import { LeadTabs } from "@/components/leads/LeadTabs";
import { toast } from "sonner";

export default function LeadsPage() {
    const { data: leads = [] } = useLeads();
    const { data: columns = [] } = useLeadColumns();
    const updateStatus = useUpdateLeadStatus();
    const { isAdmin } = useAuth();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
    const [activeTab, setActiveTab] = useState<'prospecto' | 'propietario'>('prospecto');

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        updateStatus.mutate({
            leadId: parseInt(draggableId),
            status: destination.droppableId,
        }, {
            onSuccess: () => toast.success("Estado actualizado"),
            onError: () => toast.error("Error al actualizar estado")
        });
    };

    const getLeadsInColumn = (columnName: string) => {
        return leads.filter((lead) =>
            lead.status === columnName &&
            (lead.lead_type || 'prospecto') === activeTab
        );
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                            <p className="text-muted-foreground text-xs">
                                Gestiona tus prospectos inmobiliarios y oferta.
                            </p>
                        </div>
                        <LeadTabs activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <Button variant="outline" size="sm" className="h-9 px-4">
                                <Settings2 className="mr-2 h-4 w-4" />
                                Configurar
                            </Button>
                        )}
                        <Button size="sm" className="h-9 px-4" onClick={() => {
                            setSelectedLead(undefined);
                            setIsDialogOpen(true);
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Lead
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 w-full whitespace-nowrap rounded-md border bg-muted/30 p-4">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex gap-4 h-full min-h-[calc(100vh-280px)]">
                            {columns.map((column) => (
                                <div key={column.id} className="flex flex-col w-72 shrink-0 bg-background/50 rounded-lg border shadow-sm">
                                    <div className="flex items-center justify-between p-3 border-b bg-card">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full bg-${column.color}`} />
                                            <h3 className="font-semibold text-sm truncate max-w-[180px]">
                                                {column.name}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-full">
                                            {getLeadsInColumn(column.name).length}
                                        </span>
                                    </div>

                                    <Droppable droppableId={column.name}>
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="flex-1 p-2 space-y-2 overflow-y-auto"
                                            >
                                                {getLeadsInColumn(column.name).map((lead, index) => (
                                                    <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <LeadCard lead={lead} onEdit={(l) => {
                                                                    setSelectedLead(l);
                                                                    setIsDialogOpen(true);
                                                                }} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <LeadDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    lead={selectedLead}
                />
            </div>
        </DashboardLayout>
    );
}
