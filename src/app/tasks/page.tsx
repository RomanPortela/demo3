'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTasks, useUpdateTask, useDeleteTask, useUpdateSubtask } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, ListTodo, Sparkles } from "lucide-react";
import { useState } from "react";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Task, Subtask } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TasksPage() {
    const { data: tasks, isLoading } = useTasks();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>();

    const activeTasks = tasks?.filter(t => t.status !== 'completada') || [];
    const completedTasks = tasks?.filter(t => t.status === 'completada') || [];

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedTask(undefined);
        setIsDialogOpen(true);
    };

    const updateSubtask = useUpdateSubtask();

    const handleToggleStatus = (task: Task) => {
        const newStatus = task.status === 'completada' ? 'pendiente' : 'completada';
        updateTask.mutate({ id: task.id, status: newStatus as any });
    };

    const handleToggleSubtask = (subtask: Subtask) => {
        updateSubtask.mutate({ id: subtask.id, completed: !subtask.completed });
    };

    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de eliminar esta tarea?")) {
            deleteTask.mutate(id);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 pb-20 relative min-h-screen">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 text-foreground">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-violet-100 text-violet-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Productivity Matrix
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
                            Tareas <Sparkles className="h-8 w-8 text-violet-400" />
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1">Gestión integral de pendientes, prioridades y micro-tareas.</p>
                    </div>
                    <Button onClick={handleCreate} className="h-14 px-8 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all font-black text-base gap-3 text-white">
                        <Plus className="h-6 w-6" /> Nueva Tarea
                    </Button>
                </div>

                <div className="relative z-10">
                    <Tabs defaultValue="active" className="w-full">
                        <TabsList className="bg-white/50 backdrop-blur-sm p-1.5 rounded-3xl h-16 border border-white/50 shadow-sm inline-flex mb-8">
                            <TabsTrigger value="active" className="rounded-2xl px-10 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest gap-3 transition-all">
                                <ListTodo className="h-5 w-5" />
                                Pendientes
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{activeTasks.length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="rounded-2xl px-10 h-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-xl shadow-emerald-500/20 font-black text-xs uppercase tracking-widest gap-3 transition-all">
                                <CheckCircle2 className="h-5 w-5" />
                                Completadas
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{completedTasks.length}</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4">
                            {isLoading ? (
                                <div className="grid gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-24 rounded-[2rem] bg-white/40 animate-pulse border border-dashed border-gray-100" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="active" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {activeTasks.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-[3rem] border-dashed border-2">
                                                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-primary/5">
                                                    <CheckCircle2 className="h-12 w-12 text-primary" />
                                                </div>
                                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">¡Misión Cumplida!</h3>
                                                <p className="text-muted-foreground font-medium mt-2 max-w-sm mx-auto">Has despejado todos tus pendientes activos. Es un buen momento para planificar el mañana.</p>
                                                <Button variant="ghost" className="mt-8 font-black text-primary uppercase tracking-widest text-xs" onClick={handleCreate}>Crear nueva tarea</Button>
                                            </div>
                                        )}
                                        {activeTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggleStatus={handleToggleStatus}
                                                onToggleSubtask={handleToggleSubtask}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="completed" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {completedTasks.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-32 text-center glass-panel rounded-[3rem] border-dashed border-2 opacity-60">
                                                <p className="text-lg font-bold text-muted-foreground">No hay registro de tareas finalizadas aún.</p>
                                            </div>
                                        )}
                                        {completedTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggleStatus={handleToggleStatus}
                                                onToggleSubtask={handleToggleSubtask}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        ))}
                                    </TabsContent>
                                </>
                            )}
                        </div>
                    </Tabs>
                </div>

                <TaskDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    task={selectedTask}
                />
            </div>
        </DashboardLayout>
    );
}
