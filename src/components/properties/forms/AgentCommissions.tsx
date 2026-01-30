'use client';

import React, { useState } from 'react';
import { usePropertyAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment, useProfiles } from "@/lib/supabase/queries";
import { type PropertyAssignment, type Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Trash2, UserPlus, Check, ChevronsUpDown, DollarSign, Percent, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AgentCommissionsProps {
    propertyId: number;
}

export function AgentCommissions({ propertyId }: AgentCommissionsProps) {
    const { data: assignments = [], isLoading } = usePropertyAssignments(propertyId);
    const { data: agents = [] } = useProfiles();

    const createAssignment = useCreateAssignment();
    const updateAssignment = useUpdateAssignment();
    const deleteAssignment = useDeleteAssignment();

    const [openAgentSelect, setOpenAgentSelect] = useState(false);

    const handleAddAgent = (agent: Profile) => {
        createAssignment.mutate({
            property_id: propertyId,
            agent_id: agent.user_id,
            role: 'vendedor',
            commission_type: agent.commission_type || 'percentage',
            agreed_commission_percentage: Number(agent.base_commission_percentage) || 0,
            agreed_commission_fixed: Number(agent.base_commission_fixed) || 0,
            commission_status: 'pendiente'
        }, {
            onSuccess: () => {
                toast.success(`Agente ${agent.full_name} asignado`);
                setOpenAgentSelect(false);
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Agentes Asignados y Comisiones</h3>
                </div>

                <Popover open={openAgentSelect} onOpenChange={setOpenAgentSelect}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary gap-2 font-black text-[10px] uppercase">
                            <UserPlus className="h-3.5 w-3.5" /> Asignar Agente
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 rounded-2xl overflow-hidden shadow-2xl border-none bg-background" align="end">
                        <Command>
                            <CommandInput placeholder="Buscar agente..." className="h-10 text-xs font-bold" />
                            <CommandList>
                                <CommandEmpty>No se encontraron agentes.</CommandEmpty>
                                <CommandGroup>
                                    {agents.filter(a => !assignments.some(as => as.agent_id === a.user_id)).map((agent) => (
                                        <CommandItem
                                            key={agent.user_id}
                                            onSelect={() => handleAddAgent(agent)}
                                            className="text-xs font-bold p-3 gap-3 border-b border-muted/5 last:border-0 hover:bg-primary/5 cursor-pointer"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                {agent.full_name?.[0] || 'A'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold">{agent.full_name}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase">{agent.role}</p>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted/10 rounded-[2.5rem] bg-muted/5">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/20 mb-4" />
                    <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest text-center">No hay agentes asignados a esta propiedad</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((assignment) => (
                        <Card key={assignment.id} className="group p-6 bg-background/50 border-muted/20 rounded-[2.5rem] hover:border-primary/20 transition-all shadow-sm">
                            <div className="flex flex-col gap-6">
                                {/* Agent Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                            {assignment.agent?.full_name?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm">{assignment.agent?.full_name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="text-[8px] uppercase font-black px-1.5 py-0">
                                                    {assignment.role}
                                                </Badge>
                                                <span className="text-[9px] text-muted-foreground font-bold uppercase">
                                                    Base: {assignment.agent?.base_commission_percentage}% / ${assignment.agent?.base_commission_fixed}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge className={cn(
                                            "rounded-full text-[9px] font-black uppercase px-3 py-1",
                                            assignment.commission_status === 'pagada' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                assignment.commission_status === 'parcial' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-muted text-muted-foreground"
                                        )}>
                                            {assignment.commission_status}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteAssignment.mutate({ id: assignment.id, propertyId })}
                                            className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Configuration Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-muted/10">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground/70">Rol en Operación</label>
                                        <Select
                                            value={assignment.role}
                                            onValueChange={(v) => updateAssignment.mutate({ id: assignment.id, role: v as any })}
                                        >
                                            <SelectTrigger className="h-9 bg-background/20 rounded-xl text-[10px] font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="captador">Captador</SelectItem>
                                                <SelectItem value="vendedor">Vendedor</SelectItem>
                                                <SelectItem value="colaborador">Colaborador</SelectItem>
                                                <SelectItem value="referidor">Referidor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground/70">Comisión (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={assignment.agreed_commission_percentage}
                                                onChange={(e) => updateAssignment.mutate({ id: assignment.id, agreed_commission_percentage: Number(e.target.value) })}
                                                className="pl-8 h-9 bg-background/20 rounded-xl text-[10px] font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground/70">Fijo ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                value={assignment.agreed_commission_fixed}
                                                onChange={(e) => updateAssignment.mutate({ id: assignment.id, agreed_commission_fixed: Number(e.target.value) })}
                                                className="pl-8 h-9 bg-background/20 rounded-xl text-[10px] font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground/70">Monto Pagado ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-green-500" />
                                            <Input
                                                type="number"
                                                value={assignment.paid_amount}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    updateAssignment.mutate({
                                                        id: assignment.id,
                                                        paid_amount: val,
                                                        commission_status: val > 0 ? (val >= (assignment.agreed_commission_fixed || 0) ? 'pagada' : 'parcial') : 'pendiente'
                                                    });
                                                }}
                                                className="pl-8 h-9 bg-green-500/5 border-green-500/10 rounded-xl text-[10px] font-black text-green-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
