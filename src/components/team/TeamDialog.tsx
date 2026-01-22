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
import { useUpdateProfile } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect } from "react";
import { Profile } from "@/types";

const formSchema = z.object({
    full_name: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "CAPTADOR", "AGENTE"]),
});

interface TeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile?: Profile;
}

export function TeamDialog({ open, onOpenChange, profile }: TeamDialogProps) {
    const updateProfile = useUpdateProfile();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            role: "AGENTE",
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                full_name: profile.full_name || "",
                phone: profile.phone || "",
                role: profile.role,
            });
        }
    }, [profile, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!profile) return; // Can create only via Auth setup usually, or add create function later

        try {
            await updateProfile.mutateAsync({ user_id: profile.user_id, ...values });
            toast.success("Perfil actualizado");
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al actualizar perfil");
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] glass-panel border-none">
                <DialogHeader>
                    <DialogTitle>Editar Miembro</DialogTitle>
                    <DialogDescription>
                        Modifica los datos y permisos del usuario.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Perez" {...field} className="bg-background/50" />
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
                                        <Input placeholder="+54 9..." {...field} className="bg-background/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Seleccione rol" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                            <SelectItem value="CAPTADOR">Captador</SelectItem>
                                            <SelectItem value="AGENTE">Agente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
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
