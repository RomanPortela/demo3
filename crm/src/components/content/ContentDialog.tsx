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
import { useCreateContentItem, useUpdateContentItem } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect } from "react";
import { ContentItem } from "@/types";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    title: z.string().min(2, "Título requerido"),
    description: z.string().optional(),
    content_type: z.enum(["post", "email", "campaign"]),
    status: z.enum(["draft", "scheduled", "published"]),
    scheduled_at: z.date().optional(),
});

interface ContentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: ContentItem;
}

export function ContentDialog({ open, onOpenChange, item }: ContentDialogProps) {
    const createItem = useCreateContentItem();
    const updateItem = useUpdateContentItem();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            content_type: "post",
            status: "draft",
        },
    });

    useEffect(() => {
        if (item) {
            form.reset({
                title: item.title,
                description: item.description || "",
                content_type: item.content_type,
                status: item.status,
                scheduled_at: item.scheduled_at ? new Date(item.scheduled_at) : undefined,
            });
        } else {
            form.reset({
                title: "",
                content_type: "post",
                status: "draft",
            });
        }
    }, [item, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const payload = {
                ...values,
                scheduled_at: values.scheduled_at ? values.scheduled_at.toISOString() : undefined,
            };

            if (item) {
                await updateItem.mutateAsync({ id: item.id, ...payload });
                toast.success("Contenido actualizado");
            } else {
                await createItem.mutateAsync(payload);
                toast.success("Contenido creado");
            }
            form.reset();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al guardar contenido");
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] glass-panel border-none">
                <DialogHeader>
                    <DialogTitle>{item ? "Editar Contenido" : "Nuevo Contenido"}</DialogTitle>
                    <DialogDescription>
                        Planifica tus publicaciones y correos.
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
                                        <Input placeholder="Ej: Nuevo lanzamiento..." {...field} className="bg-background/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="content_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Seleccione tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="post">Instagram Post</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="campaign">Campaña</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50">
                                                    <SelectValue placeholder="Seleccione estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Borrador</SelectItem>
                                                <SelectItem value="scheduled">Programado</SelectItem>
                                                <SelectItem value="published">Publicado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="scheduled_at"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha Programada</FormLabel>
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
                                                        format(field.value, "PPP HH:mm", { locale: es })
                                                    ) : (
                                                        <span>Seleccionar fecha y hora</span>
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
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                            {/* Note: Standard Calendar component doesn't have time picker built-in, simplified for now */}
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción / Caption</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Contenido del post o email..." {...field} className="bg-background/50 resize-none" rows={5} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

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
