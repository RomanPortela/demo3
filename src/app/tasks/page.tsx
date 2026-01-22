'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTasks, useUpdateTask, useDeleteTask, useUpdateSubtask } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, ListTodo } from "lucide-react";
import { useState } from "react";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Task, Subtask } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Tareas</h1>
                        <p className="text-muted-foreground font-medium">Gestiona tus pendientes y prioridades.</p>
                    </div>
                    <Button onClick={handleCreate} className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Tarea
                    </Button>
                </div>

                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="active" className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4" />
                            Pendientes ({activeTasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Completadas ({completedTasks.length})
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        {isLoading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 rounded-xl bg-card/50 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <TabsContent value="active" className="space-y-4">
                                    {activeTasks.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 className="h-8 w-8 text-primary" />
                                            </div>
                                            <p>¡Todo al día! No tienes tareas pendientes.</p>
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
                                <TabsContent value="completed" className="space-y-4">
                                    {completedTasks.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <p>No has completado tareas aún.</p>
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

                <TaskDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    task={selectedTask}
                />
            </div>
        </DashboardLayout>
    );
}
