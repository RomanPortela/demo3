'use client';

import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PortalCard } from "@/components/portals/PortalCard";
import { ZonaPropConfigDialog } from "@/components/portals/ZonaPropConfigDialog";

const PORTALS_DATA: Portal[] = [
    {
        id: 'zonaprop',
        name: 'ZonaProp',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6s7r7u8H1j9I7z_A6q1S6l1S6l1S6l1S6l1S6l1S6l1S6l1S6', // We'll use the generated one properly later
        description: 'Líder en anuncios inmobiliarios en Argentina. Permite publicar tus propiedades de forma inmediata.',
        status: 'disconnected' as const,
        last_sync: null,
    },
    {
        id: 'argenprop',
        name: 'Argenprop',
        logo: 'https://www.argenprop.com/favicon.ico',
        description: 'Portal de clasificados inmobiliarios con gran alcance en Buenos Aires.',
        status: 'disconnected' as const,
        last_sync: null,
    }
];

export interface Portal {
    id: string;
    name: string;
    logo: string;
    description: string;
    status: 'connected' | 'disconnected' | 'pending';
    last_sync: string | null;
}

export default function PortalsPage() {
    const [isZonaPropLoginOpen, setIsZonaPropLoginOpen] = React.useState(false);
    const [portals, setPortals] = React.useState<Portal[]>(PORTALS_DATA);

    const handleConnect = (id: string) => {
        if (id === 'zonaprop') {
            setIsZonaPropLoginOpen(true);
        }
    };

    const handleZonaPropConnected = () => {
        setPortals(prev => prev.map(p =>
            p.id === 'zonaprop'
                ? { ...p, status: 'connected' as const, last_sync: 'Ahora mismo' }
                : p
        ));
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Portales Inmobiliarios</h1>
                        <p className="text-sm text-muted-foreground font-medium">Sincroniza tus propiedades con los principales portales</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-bold shadow-lg shadow-primary/20 flex gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Portal
                    </Button>
                </div>

                {/* Portals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portals.map((portal) => (
                        <PortalCard
                            key={portal.id}
                            portal={portal}
                            onConnect={handleConnect}
                            onConfigure={handleConnect}
                        />
                    ))}
                </div>

                {/* Info Card */}
                <Card className="p-6 bg-primary/5 border-primary/20 rounded-[2rem] flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight">Publicación Automática</h3>
                        <p className="text-sm text-muted-foreground">Una vez conectado, podrás elegir qué propiedades se publican automáticamente y cuáles requieren aprobación manual.</p>
                    </div>
                </Card>

                <ZonaPropConfigDialog
                    open={isZonaPropLoginOpen}
                    onOpenChange={setIsZonaPropLoginOpen}
                    onSuccess={handleZonaPropConnected}
                />
            </div>
        </DashboardLayout>
    );
}
