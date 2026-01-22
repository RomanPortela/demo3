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
import { useCreateClient, useUpdateClient } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect } from "react";
import { Client } from "@/types";

const formSchema = z.object({
    property_type: z.string().min(2, "Tipo de propiedad requerido"),
    owner_first_name: z.string().optional(),
    owner_last_name: z.string().optional(),
    owner_phone: z.string().optional(),
    property_phone: z.string().optional(),
    email: z.string().optional(),
    instagram: z.string().optional(),
    property_status: z.enum(["in_progress", "sold", "rented", "cancelled"]),
    monthly_rent: z.any().optional(), // Updated to any to handle string/number transformation simply
    contract_due_day: z.any().optional(),
    next_contract_date: z.string().optional(),
    notes: z.string().optional(),
});

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: Client;
}

export function ClientDialog({ open, onOpenChange, client }: ClientDialogProps) {
    const createClient = useCreateClient();
    const updateClient = useUpdateClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            property_type: "",
            property_status: "in_progress",
            owner_first_name: "",
            owner_last_name: "",
            owner_phone: "",
            property_phone: "",
            email: "",
            instagram: "",
            monthly_rent: "",
            contract_due_day: "",
            next_contract_date: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (client) {
            form.reset({
                property_type: client.property_type,
                owner_first_name: client.owner_first_name || "",
                owner_last_name: client.owner_last_name || "",
                owner_phone: client.owner_phone || "",
                property_phone: client.property_phone || "",
                email: client.email || "",
                instagram: client.instagram || "",
                property_status: client.property_status as any,
                monthly_rent: client.monthly_rent || "",
                contract_due_day: client.contract_due_day || "",
                next_contract_date: client.next_contract_date || "",
                notes: client.notes || "",
            });
        } else {
            form.reset({
                property_type: "",
                property_status: "in_progress",
            });
        }
    }, [client, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Cast empty strings to undefined or types
            const payload: any = { ...values };
            if (!payload.monthly_rent) payload.monthly_rent = null;
            if (!payload.contract_due_day) payload.contract_due_day = null;
            if (payload.next_contract_date === "") payload.next_contract_date = null;

            if (client) {
                await updateClient.mutateAsync({ id: client.id, ...payload });
                toast.success("Cliente actualizado");
            } else {
                await createClient.mutateAsync(payload);
                toast.success("Cliente creado");
            }
            form.reset();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al guardar cliente");
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] glass-panel border-none">
                <DialogHeader>
                    <DialogTitle>{client ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
                    <DialogDescription>
                        Complete los detalles de la propiedad y el cliente.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="property_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Propiedad*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Depto 2 amb Palermo" {...field} className="bg-background/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="property_status"
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
                                                <SelectItem value="in_progress">En Proceso</SelectItem>
                                                <SelectItem value="rented">Alquilado</SelectItem>
                                                <SelectItem value="sold">Vendido</SelectItem>
                                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="owner_first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-background/50" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="owner_last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-background/50" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="owner_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono Propietario</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-background/50" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} className="bg-background/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="monthly_rent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alquiler (USD)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="bg-background/50" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contract_due_day"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Día Vto.</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" max="31" {...field} className="bg-background/50" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="next_contract_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vto. Contrato</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="bg-background/50" />
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
                                        <Textarea placeholder="Detalles adicionales..." {...field} className="bg-background/50 resize-none" rows={3} />
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
