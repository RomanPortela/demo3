import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useCreateTask, useUpdateTask } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect } from "react";
import { Task } from "@/types";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateSubtask, useDeleteSubtask } from "@/lib/supabase/queries";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
    title: z.string().min(2, "Título requerido"),
    importance: z.enum(["baja", "media", "alta"]),
    due_date: z.date().optional(),
    notes: z.string().optional(),
});

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const createSubtask = useCreateSubtask();
    const deleteSubtask = useDeleteSubtask();

    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            importance: "media",
            notes: "",
        },
    });

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                importance: task.importance as any,
                due_date: task.due_date ? new Date(task.due_date) : undefined,
                notes: task.notes || "",
            });
        } else {
            form.reset({
                title: "",
                importance: "media",
                notes: "",
            });
        }
    }, [task, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const payload = {
                ...values,
                due_date: values.due_date ? values.due_date.toISOString() : undefined,
            };

            if (task) {
                await updateTask.mutateAsync({ id: task.id, ...payload });
                toast.success("Tarea actualizada");
            } else {
                const newTask = await createTask.mutateAsync(payload);
                toast.success("Tarea creada");
            }
            form.reset();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al guardar tarea");
            console.error(error);
        }
    }

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim() || !task) return;
        try {
            await createSubtask.mutateAsync({
                task_id: task.id,
                title: newSubtaskTitle.trim(),
                completed: false
            });
            setNewSubtaskTitle("");
            toast.success("Subtarea añadida");
        } catch (error) {
            toast.error("Error al añadir subtarea");
        }
    };

    const handleDeleteSubtask = async (id: number) => {
        try {
            await deleteSubtask.mutateAsync(id);
            toast.success("Subtarea eliminada");
        } catch (error) {
            toast.error("Error al eliminar subtarea");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] glass-panel border-none">
                <DialogHeader>
                    <DialogTitle>{task ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
                    <DialogDescription>
                        Organiza tus pendientes y seguimientos.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Llamar a Juan Perez..." {...field} className="bg-background/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="importance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Seleccione prioridad" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="baja">Baja</SelectItem>
                                                <SelectItem value="media">Media</SelectItem>
                                                <SelectItem value="alta">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="due_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha Vencimiento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal bg-background/50 border-input",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: es })
                                                        ) : (
                                                            <span>Seleccionar fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detalles adicionales..." {...field} className="bg-background/50 resize-none" rows={3} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {task && (
                            <div className="space-y-3">
                                <Label>Subtareas</Label>
                                <div className="space-y-2">
                                    {task.subtasks?.map((st) => (
                                        <div key={st.id} className="flex items-center justify-between gap-2 bg-accent/20 p-2 rounded-lg text-sm">
                                            <span className={st.completed ? "line-through text-muted-foreground" : ""}>{st.title}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDeleteSubtask(st.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nueva subtarea..."
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSubtask();
                                                }
                                            }}
                                            className="bg-background/50 h-8 text-sm"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={handleAddSubtask}
                                            disabled={!newSubtaskTitle.trim()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
