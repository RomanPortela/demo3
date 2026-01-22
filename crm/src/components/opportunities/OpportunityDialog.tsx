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
import { useCreateOpportunity, useUpdateOpportunity } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect } from "react";
import { Opportunity } from "@/types";
import { Sparkles, Wand2 } from "lucide-react";

const formSchema = z.object({
    client_name: z.string().min(2, "Nombre requerido"),
    phone: z.string().optional(),
    status: z.enum(["abierta", "ejecutada", "cerrada"]),
    notes: z.string().optional(),
    ai_advice: z.string().optional(),
    ai_message: z.string().optional(),
});

interface OpportunityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opportunity?: Opportunity;
}

export function OpportunityDialog({ open, onOpenChange, opportunity }: OpportunityDialogProps) {
    const createOpp = useCreateOpportunity();
    const updateOpp = useUpdateOpportunity();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_name: "",
            phone: "",
            status: "abierta",
            notes: "",
            ai_advice: "",
            ai_message: "",
        },
    });

    useEffect(() => {
        if (opportunity) {
            form.reset({
                client_name: opportunity.client_name,
                phone: opportunity.phone || "",
                status: opportunity.status as any,
                notes: opportunity.notes || "",
                ai_advice: opportunity.ai_advice || "",
                ai_message: opportunity.ai_message || "",
            });
        } else {
            form.reset({
                client_name: "",
                status: "abierta",
                ai_advice: "Generando estrategia de venta personalizada...",
                ai_message: "Hola, vi que estás interesado en...",
            });
        }
    }, [opportunity, form]);

    const handleGenerateAI = () => {
        // Mock AI generation
        const advices = [
            "Enfócate en la rentabilidad a largo plazo de la zona.",
            "Menciona las nuevas obras de infraestructura cercanas.",
            "Ofrece una visita virtual antes de la presencial.",
            "Destaca la luminosidad y los espacios abiertos."
        ];
        const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
        form.setValue("ai_advice", randomAdvice);
        toast.info("¡Estrategia IA generada!");
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (opportunity) {
                await updateOpp.mutateAsync({ id: opportunity.id, ...values });
                toast.success("Oportunidad actualizada");
            } else {
                await createOpp.mutateAsync(values);
                toast.success("Oportunidad creada");
            }
            form.reset();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al guardar oportunidad");
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] glass-panel border-none">
                <DialogHeader>
                    <DialogTitle>{opportunity ? "Editar Oportunidad" : "Nueva Oportunidad"}</DialogTitle>
                    <DialogDescription>
                        Registra y gestiona oportunidades de venta.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="client_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del cliente" {...field} className="bg-background/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+54 9 11..." {...field} className="bg-background/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            <SelectItem value="abierta">Abierta</SelectItem>
                                            <SelectItem value="ejecutada">Ejecutada</SelectItem>
                                            <SelectItem value="cerrada">Cerrada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="p-4 rounded-xl bg-accent/20 border border-accent/40 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    Inteligencia Artificial
                                </h4>
                                <Button type="button" size="sm" variant="outline" onClick={handleGenerateAI} className="h-7 text-xs gap-1">
                                    <Wand2 className="h-3 w-3" />
                                    Generar
                                </Button>
                            </div>

                            <FormField
                                control={form.control}
                                name="ai_advice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea placeholder="Consejo generado por IA..." {...field} className="bg-background/50 resize-none text-xs min-h-[60px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ai_message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea placeholder="Mensaje sugerido..." {...field} className="bg-background/50 resize-none text-xs min-h-[60px]" />
                                        </FormControl>
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
                                        <Textarea placeholder="Notas internas..." {...field} className="bg-background/50 resize-none" rows={2} />
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
