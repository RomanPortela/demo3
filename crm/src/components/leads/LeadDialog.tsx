import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Lead } from "@/types";
import { useCreateLead, useUpdateLead, useLinkPropertyToLead } from "@/lib/supabase/queries";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProspectoForm, PROSPECTO_SECTIONS } from "./ProspectoForm";
import { PropietarioForm, PROPIETARIO_SECTIONS } from "./PropietarioForm";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ScrollBar } from "@/components/ui/scroll-area";
import { VisitScheduler } from "./VisitScheduler";
import { Calendar, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWhatsAppConversations, useCreateWhatsAppConversation } from "@/lib/supabase/queries";
import { WhatsAppConversation } from "@/types";

const formSchema = z.object({
    lead_type: z.enum(['prospecto', 'propietario']),
    full_name: z.string().default(""),
    property_type: z.string().default("Departamento"),
    owner_phone: z.string().default(""),
    email: z.string().default(""),
    preferred_channel: z.string().default(""),
    language: z.string().default(""),
    current_city: z.string().default(""),
    source: z.string().default(""),
    entry_date: z.string().default(""),
    operation_type: z.string().default(""),
    use_type: z.boolean().default(false),
    property_types: z.array(z.string()).default([]),
    location: z.string().default(""),
    min_budget: z.coerce.number().default(0),
    max_budget: z.coerce.number().default(0),
    budget_currency: z.string().default('USD'),
    payment_methods: z.array(z.string()).default([]),
    payment_notes: z.string().default(""),
    credit_preapproved: z.boolean().default(false),
    bank: z.string().default(""),
    down_payment: z.coerce.number().default(0),
    urgency_level: z.enum(['Inmediata', 'Corto plazo', 'Mediano plazo', 'Sin urgencia']).default('Sin urgencia'),
    interest_level: z.enum(['Alto', 'Medio', 'Bajo', 'Exploratorio']).default('Exploratorio'),
    financial_status: z.enum(['Confirmada', 'Parcial', 'No confirmada']).default('No confirmada'),
    lead_status: z.enum(['Calificado', 'En seguimiento', 'En negociación', 'Frío']).default('En seguimiento'),
    target_date: z.string().default(""),
    urgency_reason: z.string().default(""),
    urgency_notes: z.string().default(""),
    visit_date: z.string().default(""),
    follow_up_count: z.coerce.number().default(0),
    closure_probability: z.coerce.number().default(0),
    objection: z.string().default(""),
    next_follow_up: z.string().default(""),
    follow_up_channel: z.string().default(""),
    internal_note: z.string().default(""),
    // Propietario specific
    address: z.string().default(""),
    area: z.string().default(""),
    m2_built: z.coerce.number().default(0),
    rooms: z.string().default(""),
    environments: z.string().default(""),
    bedrooms: z.string().default(""),
    bathrooms: z.string().default(""),
    parkings: z.string().default(""),
    expected_price: z.coerce.number().default(0),
    min_price_acceptable: z.coerce.number().default(0),
    price_currency: z.string().default('USD'),
    exclusivity: z.boolean().default(false),
    time_to_close: z.string().default(""),
    legal_free_of_charges: z.boolean().default(false),
    legal_deed_available: z.boolean().default(false),
    legal_mortgage_existing: z.boolean().default(false),
    legal_notes: z.string().default(""),
    motivation_reason: z.string().default(""),
    owner_urgency_level: z.string().default(""),
    commission_type: z.enum(['percentage', 'fixed']).default('percentage'),
    commission_percentage_expected: z.coerce.number().default(0),
    commission_percentage_min: z.coerce.number().default(0),
    commission_fixed_expected: z.coerce.number().default(0),
    commission_fixed_min: z.coerce.number().default(0),
    publish_date: z.string().default(""),
    extra_info: z.string().default(""),
    property_ids: z.array(z.number()).default([]),
}).passthrough();

interface LeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead?: Lead;
}

export function LeadDialog({ open, onOpenChange, lead }: LeadDialogProps) {
    const createLead = useCreateLead();
    const updateLead = useUpdateLead();
    const linkProperty = useLinkPropertyToLead();
    const [activeType, setActiveType] = useState<'prospecto' | 'propietario'>(lead?.lead_type || 'prospecto');
    const [activeSection, setActiveSection] = useState<string>('basica');
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const router = useRouter();
    const { data: conversations } = useWhatsAppConversations();
    const createConversation = useCreateWhatsAppConversation();

    const openWhatsApp = async () => {
        if (!lead || !lead.owner_phone) {
            toast.error("El lead no tiene un teléfono configurado");
            return;
        }

        const phone = lead.owner_phone.replace(/\D/g, '');
        // Find existing conversation
        let conv = conversations?.find(c => c.phone_number === phone);

        if (!conv) {
            try {
                conv = await createConversation.mutateAsync({
                    phone_number: phone,
                    lead_id: lead.id,
                    last_message_at: new Date().toISOString()
                });
            } catch (error) {
                toast.error("Error al iniciar conversación de WhatsApp");
                return;
            }
        }

        onOpenChange(false);
        router.push(`/whatsapp?convId=${conv.id}`);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            lead_type: 'prospecto',
            property_type: "Departamento",
            interest_level: 'Exploratorio',
            urgency_level: 'Sin urgencia',
            financial_status: 'No confirmada',
            lead_status: 'En seguimiento',
            budget_currency: 'USD',
            price_currency: 'USD',
            follow_up_count: 0,
            commission_type: 'percentage',
            payment_methods: [],
            property_types: [],
            property_ids: [],
            ...lead,
        } as any,
    });

    useEffect(() => {
        if (open) {
            form.reset({
                lead_type: lead?.lead_type || 'prospecto',
                property_type: lead?.property_type || "Departamento",
                interest_level: lead?.interest_level || 'Exploratorio',
                urgency_level: lead?.urgency_level || 'Sin urgencia',
                financial_status: lead?.financial_status || 'No confirmada',
                lead_status: lead?.lead_status || 'En seguimiento',
                budget_currency: lead?.budget_currency || 'USD',
                price_currency: lead?.price_currency || 'USD',
                follow_up_count: lead?.follow_up_count || 0,
                commission_type: lead?.commission_type || 'percentage',
                payment_methods: lead?.payment_methods || [],
                property_types: lead?.property_types || [],
                property_ids: lead?.property_ids || [],
                ...lead,
            } as any);
            setActiveType(lead?.lead_type || 'prospecto');
            setActiveSection('basica');
        }
    }, [open, lead, form]);

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            const { property_ids, ...values } = data as any;
            let result;
            if (lead) {
                result = await updateLead.mutateAsync({ id: lead.id, ...values });
                toast.success("Lead actualizado");
            } else {
                result = await createLead.mutateAsync(values);
                toast.success("Lead creado");
            }

            if (property_ids && property_ids.length > 0 && result) {
                await Promise.all(property_ids.map((pid: number) =>
                    linkProperty.mutateAsync({
                        lead_id: result.id,
                        property_id: pid,
                        relation_type: activeType === 'propietario' ? 'propietario' : 'interesado'
                    })
                ));
            }

            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar");
        }
    }

    const currentSections = activeType === 'prospecto' ? PROSPECTO_SECTIONS : PROPIETARIO_SECTIONS;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden bg-background border-none shadow-2xl h-[90vh] flex flex-col">
                <DialogHeader className="px-8 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-3xl font-black tracking-tight text-foreground">
                            {lead ? "Editar Lead" : "Nuevo Lead Inmobiliario"}
                        </DialogTitle>
                        {lead && (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    onClick={openWhatsApp}
                                    variant="outline"
                                    className="h-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest gap-2"
                                >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    WhatsApp
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setIsSchedulerOpen(true)}
                                    className="h-10 rounded-xl bg-primary text-white hover:bg-primary/90 border-none font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg hover:shadow-primary/20"
                                >
                                    <Calendar className="h-3.5 w-3.5" />
                                    Programar Visita
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                {lead && (
                    <VisitScheduler
                        lead={lead}
                        open={isSchedulerOpen}
                        onOpenChange={setIsSchedulerOpen}
                    />
                )}

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="flex-1 overflow-hidden flex flex-col">
                        {/* Selector Principal: Demandante / Propietario */}
                        <div className="px-8 mb-6">
                            {!lead && (
                                <div className="flex p-1 bg-muted/50 rounded-2xl w-full max-w-sm">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveType('prospecto');
                                            form.setValue('lead_type', 'prospecto');
                                            setActiveSection('basica');
                                        }}
                                        className={cn(
                                            "flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                            activeType === 'prospecto' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        Demandante
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveType('propietario');
                                            form.setValue('lead_type', 'propietario');
                                            setActiveSection('propietario-info');
                                        }}
                                        className={cn(
                                            "flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                            activeType === 'propietario' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        Propietario
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Menú Secundario Horizontal (Tabs) */}
                        <div className="border-b border-border/50 bg-muted/10">
                            <ScrollArea className="w-full">
                                <div className="flex px-8 h-12 items-center">
                                    {currentSections.map((section) => {
                                        const Icon = section.icon;
                                        const isActive = activeSection === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                type="button"
                                                onClick={() => setActiveSection(section.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 h-full text-[10px] font-black uppercase tracking-widest border-b-2 transition-all shrink-0",
                                                    isActive
                                                        ? "border-primary text-primary bg-primary/5"
                                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                )}
                                            >
                                                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                                                {section.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>

                        {/* Área de Contenido */}
                        <ScrollArea className="flex-1 px-8 bg-card/10">
                            <div className="max-w-2xl mx-auto py-6">
                                {activeType === 'prospecto' ? (
                                    <ProspectoForm activeTab={activeSection} />
                                ) : (
                                    <PropietarioForm activeTab={activeSection} />
                                )}
                            </div>
                        </ScrollArea>

                        <DialogFooter className="px-8 py-6 bg-background border-t border-border/50">
                            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-12 px-6">
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createLead.isPending || updateLead.isPending}
                                className="rounded-xl font-black uppercase tracking-widest px-10 h-12 bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
                            >
                                {createLead.isPending || updateLead.isPending ? "Guardando..." : lead ? "Guardar Cambios" : "Crear Lead"}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
