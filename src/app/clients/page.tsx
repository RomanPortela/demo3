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

export default function ClientsPage() {
    const { data: clients, isLoading } = useClients();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | undefined>();

    const filteredClients = clients?.filter(client =>
        client.property_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.owner_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.owner_last_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Clientes</h1>
                        <p className="text-muted-foreground font-medium">Gestión de propietarios e inquilinos.</p>
                    </div>
                    <Button onClick={handleCreate} className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                </div>

                <div className="flex items-center gap-4 glass-panel p-4 rounded-2xl">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por propiedad o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/70"
                    />
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 rounded-3xl bg-card/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-8">
                        {filteredClients?.map((client) => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onEdit={handleEdit}
                            />
                        ))}
                        {filteredClients?.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground">
                                <p>No se encontraron clientes</p>
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
