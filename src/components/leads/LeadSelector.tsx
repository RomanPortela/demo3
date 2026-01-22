'use client';

import * as React from "react";
import { Check, ChevronsUpDown, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useLeads } from "@/lib/supabase/queries";
import { Badge } from "@/components/ui/badge";
import { type Lead } from "@/types";

interface LeadSelectorProps {
    value?: number;
    onChange: (value: number) => void;
    placeholder?: string;
}

export function LeadSelector({ value, onChange, placeholder = "Seleccionar Propietario..." }: LeadSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const { data: leads, isLoading } = useLeads();

    const selectedLead = (leads as Lead[])?.find((lead) => lead.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-12 w-full justify-between bg-background/50 border-muted rounded-2xl hover:bg-muted/30 transition-all px-4"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {selectedLead ? (
                            <span className="truncate font-medium">{selectedLead.full_name || selectedLead.owner_phone}</span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-muted/20 bg-background/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden" align="start">
                <Command className="bg-transparent">
                    <div className="flex items-center border-b border-muted/10 px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <CommandInput placeholder="Buscar propietario..." className="h-11 bg-transparent border-none focus:ring-0 text-sm" />
                    </div>
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <User className="h-8 w-8 opacity-20" />
                            <span>No se encontraron propietarios</span>
                        </CommandEmpty>
                        <CommandGroup>
                            {(leads as Lead[])?.filter(l => l.lead_type === 'propietario').map((lead) => (
                                <CommandItem
                                    key={lead.id}
                                    value={lead.full_name || lead.owner_phone}
                                    onSelect={() => {
                                        onChange(lead.id);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-primary/5 transition-colors group mx-1 my-0.5 rounded-xl"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="font-bold text-sm truncate">{lead.full_name || 'Sin nombre'}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{lead.owner_phone || 'Sin teléfono'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant="outline" className="text-[9px] uppercase font-black bg-primary/5 border-primary/20 text-primary px-1.5 py-0">
                                            Propietario
                                        </Badge>
                                        <Check
                                            className={cn(
                                                "h-4 w-4 text-primary transition-all",
                                                value === lead.id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                            )}
                                        />
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
