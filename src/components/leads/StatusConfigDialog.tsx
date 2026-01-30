import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeadColumns, useCreateLeadColumn, useUpdateLeadColumn, useDeleteLeadColumn, useUpdateLeadColumnsOrder } from "@/lib/supabase/queries";
import { Plus, Trash2, GripVertical, Check, X, Pencil, Paintbrush } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StatusConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
    "slate-500", "red-500", "orange-500", "amber-500", "yellow-500", "lime-500",
    "green-500", "emerald-500", "teal-500", "cyan-500", "sky-500", "blue-500",
    "indigo-500", "violet-500", "purple-500", "fuchsia-500", "pink-500", "rose-500"
];

function ColorPickerPopover({ currentColor, onSelect }: { currentColor: string, onSelect: (color: string) => void }) {
    const safeColor = currentColor.startsWith("bg-") ? currentColor.replace("bg-", "") : currentColor;
    const isTailwind = PRESET_COLORS.includes(safeColor);

    return (
        <PopoverContent className="w-64 p-3 rounded-2xl shadow-xl border-muted/50" align="start">
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl">
                    <div
                        className={cn(
                            "h-10 w-10 rounded-full shadow-sm ring-1 ring-black/5",
                            isTailwind ? `bg-${safeColor}` : "",
                        )}
                        style={!isTailwind ? { backgroundColor: safeColor } : {}}
                    />
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Color Seleccionado</p>
                        <p className="text-xs font-bold text-foreground">{safeColor}</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => onSelect(c)}
                            className={cn(
                                "h-6 w-6 rounded-full transition-all hover:scale-110",
                                `bg-${c}`,
                                safeColor === c && "ring-2 ring-primary ring-offset-2"
                            )}
                        />
                    ))}
                </div>

                <div className="relative pt-2 border-t border-muted/50">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-2">Personalizado</p>
                    <div className="h-8 w-full rounded-lg overflow-hidden relative group cursor-pointer ring-1 ring-black/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <Input
                            type="color"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 border-none"
                            onChange={(e) => onSelect(e.target.value)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-bold text-white drop-shadow-md">Tocar para elegir</span>
                        </div>
                    </div>
                </div>
            </div>
        </PopoverContent>
    );
}

export function StatusConfigDialog({ open, onOpenChange }: StatusConfigDialogProps) {
    const { data: serverColumns = [], isLoading } = useLeadColumns();
    const createColumn = useCreateLeadColumn();
    const updateColumn = useUpdateLeadColumn();
    const deleteColumn = useDeleteLeadColumn();
    const updateOrder = useUpdateLeadColumnsOrder();

    const [localColumns, setLocalColumns] = useState(serverColumns);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    useEffect(() => {
        if (serverColumns.length > 0) {
            setLocalColumns(serverColumns);
        }
    }, [serverColumns]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(localColumns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedColumns = items.map((item, index) => ({
            ...item,
            position: index,
        }));

        setLocalColumns(updatedColumns);

        const orderPayload = updatedColumns.map((item) => ({
            id: item.id,
            position: item.position
        }));

        updateOrder.mutate(orderPayload);
    };

    const handleAdd = () => {
        if (localColumns.length >= 20) {
            toast.error("Máximo 20 estados permitidos");
            return;
        }
        createColumn.mutate({
            name: "Nuevo Estado",
            color: "slate-500",
            position: localColumns.length,
        });
    };

    const handleDelete = (id: number) => {
        if (localColumns.length <= 1) {
            toast.error("Debe haber al menos 1 estado");
            return;
        }
        deleteColumn.mutate(id);
    };

    const startEditing = (column: any) => {
        setEditingId(column.id);
        setEditName(column.name);
        setEditColor(column.color);
    };

    const saveEdit = () => {
        if (editingId) {
            updateColumn.mutate({
                id: editingId,
                name: editName,
                color: editColor,
            });
            setEditingId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Removed overflow-hidden to help with DnD visibility clipping */}
            <DialogContent className="sm:max-w-[500px] p-0 bg-background border-none shadow-2xl rounded-[2.5rem]">
                <DialogHeader className="px-8 pt-8 pb-4 bg-primary/5">
                    <DialogTitle className="text-2xl font-black tracking-tight">Gestionar Estados de Leads</DialogTitle>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        Personaliza el flujo de tu embudo de ventas
                    </p>
                </DialogHeader>

                <div className="p-6">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="status-list">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-[60vh] overflow-y-auto px-1">
                                    {localColumns.map((column, index) => (
                                        <Draggable key={column.id} draggableId={column.id.toString()} index={index}>
                                            {(provided, snapshot) => {
                                                const isTailwind = PRESET_COLORS.includes(editColor || column.color);
                                                const displayColor = editingId === column.id ? editColor : column.color;

                                                return (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            ...(snapshot.isDragging && {
                                                                background: "hsl(var(--background))",
                                                                border: "1px solid hsl(var(--primary))",
                                                                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
                                                                zIndex: 9999,
                                                                opacity: 1,
                                                                transform: provided.draggableProps.style?.transform, // Preserve drag transform
                                                            })
                                                        }}
                                                        className={cn(
                                                            "group flex items-center gap-3 p-3 bg-card/50 border border-muted rounded-2xl hover:border-primary/30 transition-all",
                                                            editingId === column.id && "border-primary ring-2 ring-primary/10",
                                                            snapshot.isDragging && "scale-105"
                                                        )}
                                                    >
                                                        <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-muted-foreground move cursor-grab active:cursor-grabbing">
                                                            <GripVertical className="h-4 w-4" />
                                                        </div>

                                                        {!isTailwind ? (
                                                            <div className="h-4 w-4 rounded-full shadow-sm ring-1 ring-black/5 shrink-0" style={{ backgroundColor: displayColor }} />
                                                        ) : (
                                                            <div className={`h-4 w-4 rounded-full bg-${displayColor} shrink-0`} />
                                                        )}

                                                        {editingId === column.id ? (
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <Input
                                                                    value={editName}
                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                    className="h-9 rounded-xl text-sm font-bold flex-1"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="flex-1 font-bold text-sm tracking-tight truncate">{column.name}</span>
                                                        )}

                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {editingId === column.id ? (
                                                                <>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-primary bg-primary/10 hover:bg-primary/20">
                                                                                <Paintbrush className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <ColorPickerPopover
                                                                            currentColor={editColor}
                                                                            onSelect={setEditColor}
                                                                        />
                                                                    </Popover>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-primary" onClick={saveEdit}>
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground" onClick={() => setEditingId(null)}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                                                                        onClick={() => startEditing(column)}
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => handleDelete(column.id)}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            }}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <Button
                        onClick={handleAdd}
                        variant="outline"
                        className="w-full mt-4 h-12 rounded-[1.5rem] border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 text-primary font-black uppercase text-[10px] tracking-widest gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Nuevo Estado
                    </Button>
                </div>

                <DialogFooter className="px-8 py-6 bg-muted/10 border-t border-muted/20">
                    <Button onClick={() => onOpenChange(false)} className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest px-8 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        Listo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
