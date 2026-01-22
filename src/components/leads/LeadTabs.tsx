'use client';

import { Button } from "@/components/ui/button";
import { Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTabsProps {
    activeTab: 'prospecto' | 'propietario';
    onTabChange: (tab: 'prospecto' | 'propietario') => void;
}

export function LeadTabs({ activeTab, onTabChange }: LeadTabsProps) {
    return (
        <div className="flex p-1 bg-muted/50 rounded-xl w-fit gap-1 border border-border/40 backdrop-blur-md">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('prospecto')}
                className={cn(
                    "rounded-lg transition-all px-4 gap-2 h-9 text-xs font-bold uppercase tracking-wider",
                    activeTab === 'prospecto'
                        ? "bg-background text-primary shadow-sm hover:bg-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
            >
                <Users className="h-3.5 w-3.5" />
                Prospectos
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('propietario')}
                className={cn(
                    "rounded-lg transition-all px-4 gap-2 h-9 text-xs font-bold uppercase tracking-wider",
                    activeTab === 'propietario'
                        ? "bg-background text-primary shadow-sm hover:bg-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
            >
                <Home className="h-3.5 w-3.5" />
                Propietarios
            </Button>
        </div>
    );
}
