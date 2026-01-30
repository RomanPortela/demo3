'use client';

import { useLeads, useLeadColumns, useUpdateLeadStatus } from "@/lib/supabase/queries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { LeadCard } from "@/components/leads/LeadCard";
import { type Lead, type LeadColumn } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, LayoutGrid, Filter, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import { LeadDialog } from "@/components/leads/LeadDialog";
import { LeadTabs } from "@/components/leads/LeadTabs";
import { StatusConfigDialog } from "@/components/leads/StatusConfigDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
    const { data: leads = [] } = useLeads();
    const { data: columns = [] } = useLeadColumns();
    const updateStatus = useUpdateLeadStatus();
    const { isAdmin } = useAuth();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
    const [activeTab, setActiveTab] = useState<'prospecto' | 'propietario'>('prospecto');
    const [isStatusConfigOpen, setIsStatusConfigOpen] = useState(false);

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
            <div className="flex flex-col h-full gap-10 overflow-hidden pb-10 relative">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-emerald-100 text-emerald-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Sales Funnel Management
                        </Badge>
                        <div className="flex items-center gap-6">
                            <h1 className="text-5xl font-black tracking-tight text-foreground">CRM Leads</h1>
                            <LeadTabs activeTab={activeTab} onTabChange={setActiveTab} />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="h-14 px-6 rounded-full border-muted-foreground/20 bg-white/50 backdrop-blur-sm font-black text-xs uppercase tracking-widest hover:bg-white transition-all"
                            onClick={() => setIsStatusConfigOpen(true)}
                        >
                            <Settings2 className="mr-2 h-5 w-5" />
                            Configurar
                        </Button>
                        <Button onClick={() => {
                            setSelectedLead(undefined);
                            setIsDialogOpen(true);
                        }} className="h-14 px-8 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all font-black text-base gap-3 text-white">
                            <Plus className="h-6 w-6" /> Nuevo Lead
                        </Button>
                    </div>
                </div>

                <div className="flex-1 relative z-10 min-h-0">
                    <ScrollArea className="h-full w-full whitespace-nowrap">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex gap-8 h-full pb-8">
                                {columns.map((column) => (
                                    <div key={column.id} className="flex flex-col w-[340px] shrink-0 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-sm relative overflow-hidden group/column">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover/column:opacity-100 transition-opacity" />

                                        <div className="flex items-center justify-between p-6 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-3 w-3 rounded-full shadow-sm", `bg-${column.color || 'primary'}`)} />
                                                <h3 className="font-black text-sm uppercase tracking-widest text-foreground/80">
                                                    {column.name}
                                                </h3>
                                            </div>
                                            <Badge variant="secondary" className="bg-white/80 text-foreground font-black text-[10px] px-2.5 rounded-full border shadow-sm">
                                                {getLeadsInColumn(column.name).length}
                                            </Badge>
                                        </div>

                                        <Droppable droppableId={column.name}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className={cn(
                                                        "flex-1 p-4 pt-2 space-y-4 overflow-y-auto custom-scrollbar transition-colors min-h-[500px]",
                                                        snapshot.isDraggingOver ? "bg-primary/5" : "bg-transparent"
                                                    )}
                                                >
                                                    {getLeadsInColumn(column.name).map((lead, index) => (
                                                        <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={cn(
                                                                        "transition-all",
                                                                        snapshot.isDragging ? "rotate-2 scale-105" : ""
                                                                    )}
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
                </div>

                <LeadDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    lead={selectedLead}
                />
                <StatusConfigDialog
                    open={isStatusConfigOpen}
                    onOpenChange={setIsStatusConfigOpen}
                />
            </div>
        </DashboardLayout>
    );
}
