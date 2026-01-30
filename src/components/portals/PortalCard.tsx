'use client';

import React from 'react';
import { Settings2, Link as LinkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Portal {
    id: string;
    name: string;
    logo: string;
    description: string;
    status: 'connected' | 'disconnected' | 'pending';
    last_sync?: string | null;
}

interface PortalCardProps {
    portal: Portal;
    onConnect?: (portalId: string) => void;
    onConfigure?: (portalId: string) => void;
}

export function PortalCard({ portal, onConnect, onConfigure }: PortalCardProps) {
    const isConnected = portal.status === 'connected';

    return (
        <Card className="group relative overflow-hidden bg-background/40 hover:bg-muted/10 border-muted rounded-[2rem] transition-all flex flex-col h-full border-2 hover:border-primary/20 shadow-xl shadow-black/5 p-6">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2 border border-muted overflow-hidden">
                        <img src={portal.logo} alt={portal.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl tracking-tight">{portal.name}</h3>
                        <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase tracking-widest h-5",
                            isConnected ? "text-green-500 border-green-500/20 bg-green-500/5" : "text-muted-foreground border-muted"
                        )}>
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </Badge>
                    </div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-8 flex-1">
                {portal.description}
            </p>

            <div className="flex flex-col gap-3">
                <Button
                    onClick={() => isConnected ? onConfigure?.(portal.id) : onConnect?.(portal.id)}
                    className={cn(
                        "w-full rounded-xl font-black py-6 flex gap-2 shadow-xl transition-all active:scale-95",
                        isConnected
                            ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-secondary/20"
                            : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                    )}
                >
                    {isConnected ? (
                        <>
                            <Settings2 className="h-4 w-4" />
                            Configurar Conexión
                        </>
                    ) : (
                        <>
                            <LinkIcon className="h-4 w-4" />
                            Conectar
                        </>
                    )}
                </Button>

                {isConnected && (
                    <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                        <span>Última sincronización</span>
                        <span>{portal.last_sync || 'Nunca'}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
