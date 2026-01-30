'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTabsProps {
    activeTab: 'prospecto' | 'propietario';
    onTabChange: (tab: 'prospecto' | 'propietario') => void;
}

export function LeadTabs({ activeTab, onTabChange }: LeadTabsProps) {
    return (
        <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-border/50 shadow-sm flex items-center">
            <button
                onClick={() => onTabChange('prospecto')}
                className={cn(
                    "h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                    activeTab === 'prospecto'
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                        : "text-muted-foreground hover:bg-white/80"
                )}
            >
                <Sparkles className={cn("h-4 w-4", activeTab === 'prospecto' ? "animate-pulse" : "")} />
                Prospectos
            </button>
            <button
                onClick={() => onTabChange('propietario')}
                className={cn(
                    "h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                    activeTab === 'propietario'
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
                        : "text-muted-foreground hover:bg-white/80"
                )}
            >
                <Home className="h-4 w-4" />
                Propietarios
            </button>
        </div>
    );
}
