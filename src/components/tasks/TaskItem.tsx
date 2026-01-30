'use client';

import { Task, Subtask } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, MoreVertical, Trash2, Edit2, ChevronDown, ListTodo, Calendar, AlertCircle, Check } from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TaskItemProps {
    task: Task;
    onToggleStatus: (task: Task) => void;
    onToggleSubtask: (subtask: Subtask) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
}

export function TaskItem({ task, onToggleStatus, onToggleSubtask, onDelete, onEdit }: TaskItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const importanceColors = {
        alta: "bg-rose-500 text-white shadow-rose-200",
        media: "bg-amber-500 text-white shadow-amber-200",
        baja: "bg-emerald-500 text-white shadow-emerald-200",
    };

    const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && task.status !== 'completada';
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    return (
        <Card className={cn(
            "group bg-white hover:bg-white hover:shadow-2xl hover:shadow-black/5 rounded-[2.5rem] p-8 transition-all duration-500 border-2 border-transparent hover:border-primary/20 relative overflow-hidden",
            task.status === 'completada' && "opacity-60 grayscale-[0.5]"
        )}>
            {/* Importance line indicator */}
            <div className={cn(
                "absolute top-0 left-0 w-2 h-full opacity-40 transition-opacity group-hover:opacity-100",
                importanceColors[task.importance as keyof typeof importanceColors] || importanceColors.media
            )} />

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <button
                    onClick={() => onToggleStatus(task)}
                    className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 border-4",
                        task.status === 'completada'
                            ? "bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-gray-50 border-gray-100 text-gray-300 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                    )}
                >
                    {task.status === 'completada' ? <Check className="h-6 w-6" strokeWidth={3} /> : <div className="h-2 w-2 rounded-full bg-current" />}
                </button>

                <div className="flex-1 space-y-4 pt-1">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h4 className={cn(
                                "text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors leading-none",
                                task.status === 'completada' && "line-through"
                            )}>
                                {task.title}
                            </h4>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 h-6 border-none shadow-lg", importanceColors[task.importance as keyof typeof importanceColors] || importanceColors.media)}>
                                    Prioridad {task.importance}
                                </Badge>
                                {task.due_date && (
                                    <div className={cn(
                                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                        isOverdue ? "text-rose-500 animate-pulse" : "text-muted-foreground opacity-40"
                                    )}>
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(task.due_date), "d MMM", { locale: es })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-gray-50 hover:bg-primary/10 hover:text-primary transition-all shadow-sm" onClick={() => onEdit(task)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-gray-50 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm" onClick={() => onDelete(task.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {task.notes && (
                        <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-2xl">
                            {task.notes}
                        </p>
                    )}

                    {hasSubtasks && (
                        <div className="pt-4 border-t border-gray-50">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-3 w-full group/sub"
                            >
                                <div className="h-8 flex-1 bg-gray-50 rounded-full overflow-hidden p-1 relative">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                        Subtareas: {completedSubtasks} de {totalSubtasks} finalizadas
                                    </span>
                                </div>
                                <div className={cn("h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform", isExpanded && "rotate-180")}>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="mt-4 pl-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    {task.subtasks?.map(sub => (
                                        <div key={sub.id} className="flex items-center gap-4 group/item">
                                            <button
                                                onClick={() => onToggleSubtask(sub)}
                                                className={cn(
                                                    "h-8 w-8 rounded-xl flex items-center justify-center shadow-sm border transition-all active:scale-95",
                                                    sub.completed
                                                        ? "bg-emerald-500 border-none text-white"
                                                        : "bg-white border-gray-100 hover:border-primary/40 text-transparent"
                                                )}
                                            >
                                                <Check className="h-4 w-4" strokeWidth={4} />
                                            </button>
                                            <span className={cn(
                                                "text-sm font-black tracking-tight text-foreground transition-all uppercase opacity-80",
                                                sub.completed && "line-through opacity-40 text-muted-foreground"
                                            )}>
                                                {sub.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
