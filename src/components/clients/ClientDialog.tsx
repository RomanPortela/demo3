import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Calendar as CalendarIcon, Check, X, User, Users, ClipboardList, History, FileText, Settings, Heart, DollarSign, Save } from "lucide-react";
import { useCreateClient, useUpdateClient, useClientProposals, useCreateClientProposal } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { useEffect, useState, useMemo } from "react";
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
    monthly_rent: z.any().optional(),
    contract_due_day: z.any().optional(),
    next_contract_date: z.string().optional(),
    notes: z.string().optional(),
    transactions_count: z.any().optional(),
    min_budget: z.any().optional(),
    max_budget: z.any().optional(),
    family_composition: z.string().optional(),
    zones_interest: z.string().optional(),
    customer_status: z.enum(["Activo", "Dormido", "Ex cliente", "Inversor"]),
});

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: Client;
}

const TABS = [
    { id: 'general', label: 'Datos Generales', icon: User },
    { id: 'proposals', label: 'Propuestas de Negocio', icon: ClipboardList },
    { id: 'history', label: 'Historial de Actividad', icon: History },
];

export function ClientDialog({ open, onOpenChange, client }: ClientDialogProps) {
    const [activeTab, setActiveTab] = useState('general');
    const createClient = useCreateClient();
    const updateClient = useUpdateClient();

    const { data: proposals, isLoading: isLoadingProposals } = useClientProposals(client?.id);
    const createProposal = useCreateClientProposal();
    const [isCreatingProposal, setIsCreatingProposal] = useState(false);

    const [newProposal, setNewProposal] = useState({
        type: 'Venta',
        price: '',
        status: 'Pendiente',
        notes: ''
    });

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
            customer_status: "Activo",
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
                transactions_count: client.transactions_count || 0,
                min_budget: client.min_budget || "",
                max_budget: client.max_budget || "",
                family_composition: client.family_composition || "",
                zones_interest: client.zones_interest?.join(", ") || "",
                customer_status: (client as any).customer_status || "Activo",
            });
        }
    }, [client, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const payload: any = { ...values };
            if (!payload.monthly_rent) payload.monthly_rent = null;
            if (!payload.contract_due_day) payload.contract_due_day = null;
            if (payload.next_contract_date === "") payload.next_contract_date = null;

            if (payload.min_budget) payload.min_budget = Number(payload.min_budget);
            if (payload.max_budget) payload.max_budget = Number(payload.max_budget);
            if (payload.transactions_count) payload.transactions_count = Number(payload.transactions_count);
            if (payload.zones_interest && typeof payload.zones_interest === 'string') {
                payload.zones_interest = payload.zones_interest.split(',').map((s: string) => s.trim()).filter(Boolean);
            }

            if (client) {
                await updateClient.mutateAsync({ id: client.id, ...payload });
                toast.success("Perfil de cliente actualizado");
            } else {
                await createClient.mutateAsync(payload);
                toast.success("Cliente creado correctamente");
            }
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al procesar el perfil");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none sm:max-w-none w-[97vw] h-[95vh] p-0 overflow-hidden bg-white border-none shadow-[0_25px_100px_rgba(0,0,0,0.15)] rounded-[24px]">
                <div className="flex flex-col h-full relative bg-white">

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
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">RELACIÓN COMERCIAL</h3>
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
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={createClient.isPending || updateClient.isPending}
                                    className="h-20 w-full rounded-[24px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white shadow-2xl shadow-[#7C3AED]/15 font-black text-sm uppercase tracking-[0.1em] gap-3 group transition-all"
                                >
                                    <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                    {client ? 'Actualizar Cliente' : 'Crear Registro'}
                                </Button>
                            </div>
                        </div>

                        {/* Panel de Contenido de Máxima Visibilidad */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white">
                            <ScrollArea className="flex-1 custom-scrollbar">
                                <div className="p-16 pt-24 w-full max-w-[1400px] mx-auto">
                                    <div className="bg-white">
                                        {activeTab === 'general' && (
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                                    <div className="grid grid-cols-2 gap-10">
                                                        <div className="space-y-6">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                                <User className="h-4 w-4" /> Información Personal
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <FormField control={form.control} name="owner_first_name" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Nombre</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="owner_last_name" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Apellido</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>
                                                                )} />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <FormField control={form.control} name="owner_phone" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Teléfono</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="email" render={({ field }) => (
                                                                    <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Email</FormLabel><FormControl><Input type="email" {...field} className="h-12 rounded-xl" /></FormControl></FormItem>
                                                                )} />
                                                            </div>
                                                            <FormField control={form.control} name="instagram" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Instagram</FormLabel><FormControl><Input placeholder="@usuario" {...field} className="h-12 rounded-xl" /></FormControl></FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="space-y-6">
                                                            <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                                <Settings className="h-4 w-4" /> Configuración de Cuenta
                                                            </h3>
                                                            <FormField control={form.control} name="customer_status" render={({ field }) => (
                                                                <FormItem className="space-y-4">
                                                                    <FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 block">Estado Operativo</FormLabel>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        {['Activo', 'Dormido', 'Ex cliente', 'Inversor'].map((status) => (
                                                                            <button type="button" key={status} onClick={() => field.onChange(status)} className={cn("px-6 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-tighter", field.value === status ? "border-[#7C3AED] bg-[#F3E8FF]/20 text-[#7C3AED]" : "border-gray-50 text-gray-400 hover:border-gray-200")}>
                                                                                {status}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="property_status" render={({ field }) => (
                                                                <FormItem className="mt-8">
                                                                    <FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Etapa en Funnel</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-2xl shadow-2xl border-none">
                                                                            <SelectItem value="in_progress">En Proceso Directo</SelectItem>
                                                                            <SelectItem value="rented">Alquilado con Éxito</SelectItem>
                                                                            <SelectItem value="sold">Venta Cerrada</SelectItem>
                                                                            <SelectItem value="cancelled">Operación Cancelada</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                    </div>

                                                    <div className="pt-12 border-t border-gray-50">
                                                        <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                            <Heart className="h-4 w-4" /> Perfil de Búsqueda
                                                        </h3>
                                                        <div className="grid grid-cols-3 gap-10">
                                                            <FormField control={form.control} name="property_type" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 text-center block">Tag de Búsqueda</FormLabel><FormControl><Input placeholder="Ej: Busqueda Depto" {...field} className="h-12 rounded-xl text-center" /></FormControl></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="min_budget" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 text-center block">Min USD</FormLabel><FormControl><Input type="number" {...field} className="h-12 rounded-xl text-center" /></FormControl></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="max_budget" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 text-center block">Max USD</FormLabel><FormControl><Input type="number" {...field} className="h-12 rounded-xl text-center" /></FormControl></FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-10 mt-8">
                                                            <FormField control={form.control} name="zones_interest" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Zonas Requeridas</FormLabel><FormControl><Input placeholder="Ej: Palermo, Recoleta..." {...field} className="h-12 rounded-xl" /></FormControl></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="family_composition" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400">Integración Familiar</FormLabel><FormControl><Input placeholder="Ej: Pareja + 2 hijos" {...field} className="h-12 rounded-xl" /></FormControl></FormItem>
                                                            )} />
                                                        </div>
                                                    </div>

                                                    <div className="pt-12 border-t border-gray-50">
                                                        <h3 className="text-sm font-black uppercase text-[#7C3AED] tracking-widest flex items-center gap-2 mb-8">
                                                            <FileText className="h-4 w-4" /> Notas de Gestión Privadas
                                                        </h3>
                                                        <FormField control={form.control} name="notes" render={({ field }) => (
                                                            <FormItem><FormControl><Textarea className="min-h-[200px] rounded-[24px] bg-gray-50/50 border-gray-100 p-8 text-lg font-medium resize-none shadow-inner" placeholder="Escribir detalles críticos sobre la relación con el cliente..." {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </div>
                                                </form>
                                            </Form>
                                        )}

                                        {activeTab === 'proposals' && (
                                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-[#F3E8FF]/20 p-10 rounded-[32px] border border-[#7C3AED]/10">
                                                    <h3 className="text-xl font-black text-[#7C3AED] uppercase tracking-tighter mb-8 flex items-center gap-3">
                                                        <DollarSign className="h-6 w-6" /> Registro de Propuesta
                                                    </h3>
                                                    <div className="grid grid-cols-4 gap-6 items-end">
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Modalidad</Label>
                                                            <Select value={newProposal.type} onValueChange={(val: any) => setNewProposal({ ...newProposal, type: val })}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="rounded-2xl shadow-2xl border-none"><SelectItem value="Venta">Venta Activa</SelectItem><SelectItem value="Alquiler">Alquiler Anual</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Monto (USD)</Label>
                                                            <Input className="h-12 rounded-xl" placeholder="0.00" type="number" value={newProposal.price} onChange={(e) => setNewProposal({ ...newProposal, price: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-3 col-span-2 relative">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contexto / Propiedad</Label>
                                                            <div className="flex gap-4">
                                                                <Input className="h-12 rounded-xl flex-1" placeholder="Vínculo con activo o condiciones..." value={newProposal.notes} onChange={(e) => setNewProposal({ ...newProposal, notes: e.target.value })} />
                                                                <Button className="h-12 rounded-xl bg-[#7C3AED] hover:bg-[#7C3AED]/90 px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#7C3AED]/20" disabled={!newProposal.price || isCreatingProposal} onClick={async () => {
                                                                    if (!client) return; setIsCreatingProposal(true); try {
                                                                        await createProposal.mutateAsync({ client_id: client.id, type: newProposal.type, price: Number(newProposal.price), notes: newProposal.notes, status: 'Pendiente' });
                                                                        toast.success("Propuesta registrada"); setNewProposal({ ...newProposal, price: '', notes: '' });
                                                                    } catch (e) { toast.error("Error operativo"); } finally { setIsCreatingProposal(false); }
                                                                }}>
                                                                    <Plus className="h-4 w-4 mr-2" /> Certificar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-sm font-black text-gray-300 uppercase tracking-[0.2em] px-4">Histórico de Propuestas Certificadas</h3>
                                                    {!proposals || proposals.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100 opacity-50">
                                                            <ClipboardList className="h-16 w-16 mb-4 opacity-10" />
                                                            <p className="font-black uppercase text-[10px] tracking-widest">Sin propuestas vigentes</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-6">
                                                            {proposals.map((p: any) => (
                                                                <div key={p.id} className="bg-white border border-gray-100 rounded-[28px] p-8 flex items-center justify-between group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                                                                    <div className="flex items-center gap-6">
                                                                        <div className={cn("h-16 w-16 rounded-[20px] flex items-center justify-center text-xl font-black shadow-lg", p.type === 'Venta' ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" : "bg-blue-50 text-blue-600 shadow-blue-500/10")}>
                                                                            {p.type.substring(0, 1)}
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-2xl font-black tracking-tighter text-[#111827]">{Number(p.price).toLocaleString('es-AR', { style: 'currency', currency: p.currency || 'USD' })}</p>
                                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.notes || 'Inmueble General'} • {new Date(p.created_at).toLocaleDateString()}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge className={cn("rounded-full px-4 h-8 font-black uppercase text-[9px] tracking-widest border-none", p.status === 'Aceptada' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>{p.status}</Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'history' && (
                                            <div className="flex flex-col items-center justify-center p-32 text-gray-300 gap-6 opacity-30 animate-pulse">
                                                <History className="h-24 w-24" />
                                                <p className="font-black uppercase tracking-[0.5em] text-sm">Registro Cronológico Protegido</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="h-24" />
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
