'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useClients } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { Client } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
    const { data: clients, isLoading } = useClients();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | undefined>();

    const filteredClients = clients?.filter(client =>
        (client.property_type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (client.owner_first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (client.owner_last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedClient(undefined);
        setIsDialogOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 pb-20 relative min-h-screen">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-blue-100 text-blue-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Stakeholder Management
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-foreground">Clientes</h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1">Gestión integral de propietarios, inquilinos y contrapartes.</p>
                    </div>
                    <Button onClick={handleCreate} className="h-14 px-8 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all font-black text-base gap-3 text-white">
                        <Plus className="h-6 w-6" /> Nuevo Cliente
                    </Button>
                </div>

                <div className="relative group z-10">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-5 bg-white border-none shadow-xl shadow-black/5 p-6 rounded-[2.5rem] focus-within:shadow-2xl focus-within:shadow-primary/10 transition-all">
                        <Search className="h-7 w-7 text-muted-foreground group-focus-within:text-primary transition-colors ml-2" />
                        <Input
                            placeholder="Buscar por nombre, propiedad, teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-none bg-transparent focus-visible:ring-0 text-2xl font-medium placeholder:text-muted-foreground/40 h-auto p-0"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 rounded-[2.5rem] bg-white/50 animate-pulse border-2 border-dashed border-gray-100" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 pb-8 relative z-10">
                        {filteredClients?.map((client) => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onEdit={handleEdit}
                            />
                        ))}
                        {filteredClients?.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center glass-panel rounded-[3rem] border-dashed border-2">
                                <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                                    <Search className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground">Sin resultados</h3>
                                <p className="text-muted-foreground font-medium mt-2 max-w-sm mx-auto">No encontramos clientes que coincidan con "{searchTerm}". Prueba con otros términos.</p>
                                <Button variant="ghost" className="mt-6 font-bold text-primary" onClick={() => setSearchTerm("")}>Limpiar búsqueda</Button>
                            </div>
                        )}
                    </div>
                )}

                <ClientDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    client={selectedClient}
                />
            </div>
        </DashboardLayout>
    );
}
