import { Task, Subtask } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TaskItemProps {
    task: Task;
    onToggleStatus: (task: Task) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
    onToggleSubtask: (subtask: Subtask) => void;
}

export function TaskItem({ task, onToggleStatus, onDelete, onEdit, onToggleSubtask }: TaskItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    const priorityConfig = {
        alta: { color: "text-destructive", bg: "bg-destructive/10", label: "Alta" },
        media: { color: "text-orange-500", bg: "bg-orange-500/10", label: "Media" },
        baja: { color: "text-green-500", bg: "bg-green-500/10", label: "Baja" }
    };

    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'completada';

    return (
        <div className={cn(
            "group glass-card rounded-xl p-4 transition-all hover:bg-card/60",
            task.status === 'completada' ? "opacity-60" : "opacity-100"
        )}>
            <div className="flex items-start gap-4">
                <Checkbox
                    checked={task.status === 'completada'}
                    onCheckedChange={() => onToggleStatus(task)}
                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />

                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                        <span
                            className={cn(
                                "font-semibold text-sm cursor-pointer hover:text-primary transition-colors",
                                task.status === 'completada' && "line-through text-muted-foreground"
                            )}
                            onClick={() => onEdit(task)}
                        >
                            {task.title}
                        </span>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn("text-[10px] h-5 border-none font-bold uppercase", priorityConfig[task.importance].bg, priorityConfig[task.importance].color)}>
                                {priorityConfig[task.importance].label}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(task.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.due_date && (
                            <div className={cn(
                                "flex items-center gap-1.5",
                                isOverdue ? "text-destructive font-bold" : ""
                            )}>
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(task.due_date), "d MMM", { locale: es })}
                            </div>
                        )}
                        {task.subtasks && task.subtasks.length > 0 && (
                            <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
                                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                                    <span className="font-medium">{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </div>
                            </CollapsibleTrigger>
                        )}
                    </div>

                    {(task.notes) && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-1">{task.notes}</p>
                    )}
                </div>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleContent className="mt-3 pl-8 space-y-2 border-l-2 border-border/40 ml-2">
                        {task.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2 text-xs">
                                <Checkbox
                                    checked={subtask.completed}
                                    onCheckedChange={() => onToggleSubtask(subtask)}
                                    className="h-3 w-3"
                                />
                                <span className={subtask.completed ? "line-through text-muted-foreground" : ""}>{subtask.title}</span>
                            </div>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
}
