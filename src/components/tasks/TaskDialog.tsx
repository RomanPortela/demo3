'use client';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
import { useCreateTask, useUpdateTask, useCreateSubtask, useDeleteSubtask } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Task } from "@/types";
import { CalendarIcon, Plus, Trash2, ListTodo, Sparkles, Clock, Pin, Check, X, Save, History, ClipboardList, Target } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const TABS = [
    { id: 'planificacion', label: 'Planificación', icon: Target },
    { id: 'subtareas', label: 'Desglose / Subtareas', icon: ClipboardList },
    { id: 'bitacora', label: 'Historial / Notas', icon: History },
];

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
    const [activeTab, setActiveTab] = useState('planificacion');
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
                await createTask.mutateAsync(payload);
                toast.success("Tarea agendada");
            }
            onOpenChange(false);
        } catch (error) {
            toast.error("Error operativo");
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
            toast.success("Subobjetivo añadido");
        } catch (error) {
            toast.error("Error al añadir");
        }
    };

    const handleDeleteSubtask = async (id: number) => {
        try {
            await deleteSubtask.mutateAsync(id);
            toast.success("Removido");
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none sm:max-w-none w-[97vw] h-[95vh] p-0 overflow-hidden bg-white border-none shadow-[0_25px_100px_rgba(0,0,0,0.15)] rounded-[24px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full relative bg-white">

                        {/* Botón de Cierre Minimalista */}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-6 right-8 h-12 w-12 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors z-[100] bg-white/80 backdrop-blur-sm shadow-sm"
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Layout Principal Ampliado: Sidebar + Contenido */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* Sidebar de Navegación "EXPEDIENTE" */}
                            <div className="w-[350px] flex flex-col p-8 gap-3 shrink-0 overflow-y-auto no-scrollbar bg-gray-50/20 border-r border-gray-100">
                                <div className="px-2 mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">PLAN DE ACCIÓN</h3>
                                </div>
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-5 p-4 rounded-[20px] transition-all duration-400 text-left group",
                                            activeTab === tab.id
                                                ? "bg-white shadow-[0_15px_30px_rgba(0,0,0,0.06)] scale-[1.03] border border-gray-100"
                                                : "hover:bg-white/60 text-gray-400"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-[16px] flex items-center justify-center transition-all duration-400 shadow-sm",
                                            activeTab === tab.id ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20" : "bg-gray-100 group-hover:bg-gray-200"
                                        )}>
                                            <tab.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-lg font-black tracking-tight leading-none",
                                                activeTab === tab.id ? "text-[#111827]" : "group-hover:text-gray-600 transition-colors"
                                            )}>
                                                {tab.label}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#7C3AED]/30 mt-1">Gestión</span>
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-auto pt-8">
                                    <Button
                                        type="submit"
                                        disabled={createTask.isPending || updateTask.isPending}
                                        className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                    >
                                        <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        {task ? 'Actualizar Registro' : 'Confirmar Tarea'}
                                    </Button>
                                </div>
                            </div>

                            {/* Panel de Contenido de Máxima Visibilidad */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-16 pt-24 w-full max-w-[1400px] mx-auto">
                                        <div className="bg-white">
                                            {activeTab === 'planificacion' && (
                                                <div className="space-y-12">
                                                    <FormField control={form.control} name="title" render={({ field }) => (
                                                        <FormItem className="space-y-4">
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Objetivo Estratégico</FormLabel>
                                                            <FormControl><Input placeholder="Definir el foco de la acción..." {...field} className="h-20 rounded-[28px] bg-gray-50/50 border-gray-100 text-3xl font-black px-10 shadow-inner" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />

                                                    <div className="grid grid-cols-2 gap-12 pt-4">
                                                        <FormField control={form.control} name="importance" render={({ field }) => (
                                                            <FormItem className="space-y-4">
                                                                <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Nivel de Prioridad</FormLabel>
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    {['baja', 'media', 'alta'].map((lvl) => (
                                                                        <button type="button" key={lvl} onClick={() => field.onChange(lvl)} className={cn("px-6 py-8 rounded-[24px] border-2 transition-all font-black text-xs uppercase tracking-widest", field.value === lvl ? "border-[#7C3AED] bg-[#F3E8FF]/20 text-[#7C3AED]" : "border-gray-50 text-gray-300 hover:border-gray-200")}>
                                                                            {lvl}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="due_date" render={({ field }) => (
                                                            <FormItem className="space-y-4">
                                                                <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Vencimiento Objetivado</FormLabel>
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <FormControl>
                                                                            <Button variant="ghost" className={cn("h-24 w-full rounded-[24px] bg-gray-50/50 border-2 border-gray-50 font-black text-xl px-10 justify-start gap-4", !field.value && "text-gray-300")}>
                                                                                <CalendarIcon className="h-6 w-6 opacity-40 text-[#7C3AED]" />
                                                                                {field.value ? format(field.value, "d 'de' MMMM, yyyy", { locale: es }) : "SIN FECHA ASIGNADA"}
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0 rounded-[32px] border-none shadow-3xl" align="start">
                                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={es} initialFocus />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'subtareas' && (
                                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    {!task ? (
                                                        <div className="p-20 text-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                                                            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                                                            <p className="font-black uppercase text-[10px] tracking-widest text-gray-400">Guarde la tarea para habilitar el desglose operacional</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex gap-6">
                                                                <Input placeholder="Añadir paso operacional..." value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }} className="h-20 rounded-[28px] bg-[#F3E8FF]/20 border-[#7C3AED]/10 text-xl font-bold px-10 shadow-sm" />
                                                                <Button type="button" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()} className="h-20 w-32 rounded-[28px] bg-[#7C3AED] shadow-2xl shadow-[#7C3AED]/20"><Plus className="h-8 w-8 text-white" /></Button>
                                                            </div>
                                                            <div className="space-y-4">
                                                                {task.subtasks?.map((st) => (
                                                                    <div key={st.id} className="flex items-center justify-between p-8 bg-white border border-gray-100 rounded-[28px] group hover:shadow-2xl transition-all duration-500">
                                                                        <div className="flex items-center gap-6">
                                                                            <div className={cn("h-10 w-10 rounded-[14px] flex items-center justify-center transition-all", st.completed ? "bg-emerald-500 text-white" : "bg-gray-50 border-2 border-gray-100")}>
                                                                                {st.completed && <Check className="h-6 w-6" />}
                                                                            </div>
                                                                            <span className={cn("text-xl font-bold tracking-tight", st.completed ? "line-through text-gray-300" : "text-[#111827]")}>{st.title}</span>
                                                                        </div>
                                                                        <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-[18px] opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all" onClick={() => handleDeleteSubtask(st.id)}><Trash2 className="h-5 w-5" /></Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'bitacora' && (
                                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <FormField control={form.control} name="notes" render={({ field }) => (
                                                        <FormItem className="space-y-4">
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 ml-1">Bitácora Operativa / Instrucciones</FormLabel>
                                                            <FormControl><Textarea placeholder="Registrar detalles críticos, obstáculos o feedback sobre esta tarea..." {...field} className="min-h-[400px] rounded-[32px] bg-gray-50/50 border-gray-100 p-12 text-2xl font-medium resize-none shadow-inner leading-relaxed" /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-24" />
                                </ScrollArea>
                            </div>
                        </div>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
