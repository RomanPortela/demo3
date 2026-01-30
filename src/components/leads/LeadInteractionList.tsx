import { useState } from "react";
import {
    useLeadInteractions,
    useCreateLeadInteraction,
    useDeleteLeadInteraction,
    useUpdateLeadInteraction,
    useRestoreLeadInteraction,
    useLeadInteractionAudit,
    useProperties
} from "@/lib/supabase/queries";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Phone, MessageSquare, Mail, UserCheck, MapPin, History, Edit2, RotateCcw, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function LeadInteractionList({ leadId }: { leadId?: number }) {
    const { isAdmin } = useAuth();
    const [isAuditMode, setIsAuditMode] = useState(false);

    const { data: interactions = [], isLoading } = useLeadInteractions(leadId, isAuditMode);
    const { data: properties = [] } = useProperties();
    const createInteraction = useCreateLeadInteraction();
    const deleteInteraction = useDeleteLeadInteraction();
    const updateInteraction = useUpdateLeadInteraction();
    const restoreInteraction = useRestoreLeadInteraction();

    const [isAdding, setIsAdding] = useState(false);
    const [newInteraction, setNewInteraction] = useState({
        channel: "WhatsApp",
        notes: "",
        interaction_date: new Date().toISOString().split('T')[0],
        property_id: undefined as number | undefined
    });

    const [openPropertySelect, setOpenPropertySelect] = useState(false);

    // Audit / Reason State
    const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
    const [auditReason, setAuditReason] = useState("");
    const [pendingAction, setPendingAction] = useState<{
        type: 'EDIT' | 'DELETE' | 'RESTORE',
        id: number,
        data?: any
    } | null>(null);

    const [editingInteraction, setEditingInteraction] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        channel: "",
        notes: "",
        interaction_date: ""
    });

    const handleAdd = () => {
        if (!leadId) return;
        createInteraction.mutate({
            lead_id: leadId,
            ...newInteraction
        }, {
            onSuccess: () => {
                setIsAdding(false);
                setNewInteraction({
                    channel: "WhatsApp",
                    notes: "",
                    interaction_date: new Date().toISOString().split('T')[0],
                    property_id: undefined
                });
                toast.success("Contacto registrado");
            }
        });
    };

    const confirmAuditAction = () => {
        if (!auditReason.trim() || !pendingAction || !leadId) {
            toast.error("Debe ingresar un motivo");
            return;
        }

        const { type, id, data } = pendingAction;

        if (type === 'DELETE') {
            deleteInteraction.mutate({ id, leadId, reason: auditReason }, {
                onSuccess: () => {
                    setReasonDialogOpen(false);
                    setAuditReason("");
                    setPendingAction(null);
                    toast.success("Entrada eliminada (soft-delete)");
                }
            });
        } else if (type === 'EDIT') {
            updateInteraction.mutate({ id, leadId, reason: auditReason, ...data }, {
                onSuccess: () => {
                    setReasonDialogOpen(false);
                    setAuditReason("");
                    setPendingAction(null);
                    setEditingInteraction(null);
                    toast.success("Entrada editada y auditada");
                }
            });
        } else if (type === 'RESTORE') {
            restoreInteraction.mutate({ id, leadId, reason: auditReason }, {
                onSuccess: () => {
                    setReasonDialogOpen(false);
                    setAuditReason("");
                    setPendingAction(null);
                    toast.success("Entrada restaurada");
                }
            });
        }
    };

    const getIcon = (channel: string) => {
        switch (channel.toLowerCase()) {
            case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
            case 'llamada': return <Phone className="h-4 w-4" />;
            case 'email': return <Mail className="h-4 w-4" />;
            case 'visita': return <Calendar className="h-4 w-4" />;
            default: return <UserCheck className="h-4 w-4" />;
        }
    };

    const getPropertyTitle = (p: any) => {
        if (!p) return "";
        return `${p.property_type} ${p.operation_type} - ${p.address || 'Sin dirección'}`;
    };

    const selectedProperty = properties.find(p => p.id === newInteraction.property_id);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <UserCheck className="h-3 w-3" /> Historial de Contactos
                    </h4>
                    {isAdmin && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-6 px-2 rounded-lg text-[9px] font-black uppercase tracking-tight gap-1.5 transition-all",
                                isAuditMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "text-muted-foreground hover:bg-muted"
                            )}
                            onClick={() => setIsAuditMode(!isAuditMode)}
                        >
                            {isAuditMode ? (
                                <>
                                    <Eye className="h-3 w-3" /> Modo Auditoría Activo
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="h-3 w-3" /> Activar Auditoría
                                </>
                            )}
                        </Button>
                    )}
                </div>
                {!isAdding && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="h-3 w-3" /> Registrar Contacto
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground/70">Medio</label>
                            <Select
                                value={newInteraction.channel}
                                onValueChange={(v) => setNewInteraction({ ...newInteraction, channel: v, property_id: undefined })}
                            >
                                <SelectTrigger className="h-9 bg-background/50 border-muted rounded-xl text-xs font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                    <SelectItem value="Llamada">Llamada</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Visita">Visita</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground/70">Fecha</label>
                            <Input
                                type="date"
                                value={newInteraction.interaction_date}
                                onChange={(e) => setNewInteraction({ ...newInteraction, interaction_date: e.target.value })}
                                className="h-9 bg-background/50 border-muted rounded-xl text-xs font-bold"
                            />
                        </div>
                    </div>

                    {/* Property Selector for Visits */}
                    {newInteraction.channel === 'Visita' && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground/70">Propiedad Visitada</label>
                            <Popover open={openPropertySelect} onOpenChange={setOpenPropertySelect}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openPropertySelect}
                                        className="w-full justify-between h-9 bg-background/50 border-muted rounded-xl text-xs font-bold"
                                    >
                                        {selectedProperty ? (
                                            <span className="truncate">{getPropertyTitle(selectedProperty)}</span>
                                        ) : (
                                            <span className="text-muted-foreground">Seleccionar propiedad...</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Buscar propiedad..." className="h-8 text-xs" />
                                        <CommandList>
                                            <CommandEmpty>No se encontraron propiedades.</CommandEmpty>
                                            <CommandGroup>
                                                {properties.map((property) => (
                                                    <CommandItem
                                                        key={property.id}
                                                        value={getPropertyTitle(property) || String(property.id)}
                                                        onSelect={() => {
                                                            setNewInteraction({ ...newInteraction, property_id: property.id });
                                                            setOpenPropertySelect(false);
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-3 w-3",
                                                                newInteraction.property_id === property.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="truncate">{getPropertyTitle(property)}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground/70">Notas</label>
                        <Textarea
                            placeholder={newInteraction.channel === 'Visita' ? "¿Qué le pareció la propiedad?..." : "¿De qué hablaron?..."}
                            value={newInteraction.notes}
                            onChange={(e) => setNewInteraction({ ...newInteraction, notes: e.target.value })}
                            className="bg-background/50 border-muted rounded-xl text-xs resize-none h-20"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        <Button size="sm" className="rounded-xl text-[10px] font-black uppercase" onClick={handleAdd}>Guardar</Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {interactions.length === 0 ? (
                    <div className="p-8 text-center bg-muted/5 rounded-2xl border border-dashed border-muted">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Sin registros de contacto todavía</p>
                    </div>
                ) : (
                    interactions.map((it) => (
                        <div key={it.id} className={cn(
                            "group relative p-3 bg-card/50 border border-muted rounded-2xl hover:border-primary/20 transition-all",
                            it.is_deleted && "opacity-60 bg-red-500/5 border-red-500/10"
                        )}>
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    {getIcon(it.channel)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                                                {it.channel}
                                                {it.property && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[9px] font-bold flex items-center gap-1 max-w-[120px] truncate">
                                                        <MapPin className="h-2 w-2" />
                                                        <span className="truncate">{getPropertyTitle(it.property)}</span>
                                                    </span>
                                                )}
                                            </span>
                                            {it.is_edited && (
                                                <Badge variant="outline" className="text-[8px] h-4 px-1 border-amber-500/20 text-amber-600 bg-amber-500/5 font-black uppercase tracking-widest">
                                                    Editado
                                                </Badge>
                                            )}
                                            {it.is_deleted && (
                                                <Badge variant="outline" className="text-[8px] h-4 px-1 border-destructive/20 text-destructive bg-destructive/5 font-black uppercase tracking-widest">
                                                    Eliminado
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                {format(new Date(it.interaction_date), "d MMM, yyyy", { locale: es })}
                                            </span>
                                            {isAdmin && <AuditTrail interactionId={it.id} />}
                                        </div>
                                    </div>

                                    {editingInteraction === it.id ? (
                                        <div className="space-y-3 mt-2 p-3 bg-background/50 rounded-xl border border-primary/20">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select
                                                    value={editForm.channel}
                                                    onValueChange={(v) => setEditForm(prev => ({ ...prev, channel: v }))}
                                                >
                                                    <SelectTrigger className="h-8 text-[10px] font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                                        <SelectItem value="Llamada">Llamada</SelectItem>
                                                        <SelectItem value="Email">Email</SelectItem>
                                                        <SelectItem value="Visita">Visita</SelectItem>
                                                        <SelectItem value="Otro">Otro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type="date"
                                                    value={editForm.interaction_date}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, interaction_date: e.target.value }))}
                                                    className="h-8 text-[10px] font-bold"
                                                />
                                            </div>
                                            <Textarea
                                                value={editForm.notes}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                                className="min-h-[60px] text-[10px] resize-none"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase" onClick={() => setEditingInteraction(null)}>Cancelar</Button>
                                                <Button size="sm" className="h-7 text-[10px] font-black uppercase" onClick={() => {
                                                    setPendingAction({ type: 'EDIT', id: it.id, data: editForm });
                                                    setReasonDialogOpen(true);
                                                }}>Guardar Cambios</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {it.notes || "Sin especificaciones"}
                                        </p>
                                    )}
                                </div>

                                {isAdmin && !editingInteraction && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!it.is_deleted ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary"
                                                    onClick={() => {
                                                        setEditingInteraction(it.id);
                                                        setEditForm({
                                                            channel: it.channel,
                                                            notes: it.notes || "",
                                                            interaction_date: it.interaction_date.split('T')[0]
                                                        });
                                                    }}
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-lg text-destructive"
                                                    onClick={() => {
                                                        setPendingAction({ type: 'DELETE', id: it.id });
                                                        setReasonDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 rounded-lg text-[9px] font-black uppercase tracking-tight bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1.5"
                                                onClick={() => {
                                                    setPendingAction({ type: 'RESTORE', id: it.id });
                                                    setReasonDialogOpen(true);
                                                }}
                                            >
                                                <RotateCcw className="h-3 w-3" /> Restaurar
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Reason Dialog */}
            <Dialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" /> Justificación Requerida
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {pendingAction?.type === 'DELETE' && "Está a punto de eliminar un registro del historial. Esta acción será auditada."}
                            {pendingAction?.type === 'EDIT' && "Está editando información histórica. Es obligatorio registrar el motivo del cambio."}
                            {pendingAction?.type === 'RESTORE' && "Restaurar una entrada eliminada requiere una justificación para el registro de auditoría."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-[10px] font-black uppercase text-muted-foreground/70 mb-2 block">Motivo del cambio</label>
                        <Textarea
                            placeholder="Ej: Corrección de fecha errónea / Error de carga..."
                            value={auditReason}
                            onChange={(e) => setAuditReason(e.target.value)}
                            className="min-h-[100px] text-xs resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" size="sm" onClick={() => {
                            setReasonDialogOpen(false);
                            setAuditReason("");
                        }}>Cancelar</Button>
                        <Button size="sm" onClick={confirmAuditAction}>Confirmar Acción Auditable</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AuditTrail({ interactionId }: { interactionId: number }) {
    const { data: audits = [], isLoading } = useLeadInteractionAudit(interactionId);

    if (isLoading || audits.length === 0) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-md text-muted-foreground hover:text-primary">
                    <History className="h-3 w-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="end">
                <div className="p-3 border-b border-muted bg-primary/5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <History className="h-3.5 w-3.5" /> Trail de Auditoría
                    </h5>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {audits.map((audit) => (
                        <div key={audit.id} className="relative pl-4 border-l-2 border-muted">
                            <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-muted" />
                            <div className="flex items-center justify-between mb-1">
                                <Badge variant="secondary" className={cn(
                                    "text-[8px] h-4 px-1 font-black uppercase tracking-widest min-w-fit",
                                    audit.action_type === 'EDIT' && "bg-amber-500/10 text-amber-600",
                                    audit.action_type === 'DELETE' && "bg-destructive/10 text-destructive",
                                    audit.action_type === 'RESTORE' && "bg-green-500/10 text-green-600"
                                )}>
                                    {audit.action_type}
                                </Badge>
                                <span className="text-[9px] font-bold text-muted-foreground">
                                    {format(new Date(audit.created_at), "d MMM, HH:mm", { locale: es })}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-foreground mb-1 italic">"{audit.reason}"</p>

                            {audit.action_type === 'EDIT' && audit.old_content && (
                                <div className="mt-2 space-y-2 p-2 bg-muted/30 rounded-lg text-[9px]">
                                    <div>
                                        <span className="font-black uppercase text-muted-foreground/70 block mb-0.5">Antes:</span>
                                        <p className="line-through opacity-60 text-destructive">{audit.old_content.notes || "Sin notas"}</p>
                                    </div>
                                    <div>
                                        <span className="font-black uppercase text-muted-foreground/70 block mb-0.5">Después:</span>
                                        <p className="text-green-600">{audit.new_content?.notes || "Sin notas"}</p>
                                    </div>
                                </div>
                            )}

                            {audit.action_type === 'DELETE' && audit.old_content && (
                                <div className="mt-2 p-2 bg-destructive/5 rounded-lg text-[9px]">
                                    <span className="font-black uppercase text-destructive/70 block mb-0.5">Contenido Eliminado:</span>
                                    <p className="opacity-70">{audit.old_content.notes || "Sin notas"}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
