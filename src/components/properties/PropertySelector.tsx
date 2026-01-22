'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Search, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProperties } from '@/lib/supabase/queries';
import { type Property } from '@/types';
import { Badge } from '@/components/ui/badge';

interface PropertySelectorProps {
    value?: number | number[];
    onChange: (propertyId: number | number[]) => void;
    onAddNew?: () => void;
    placeholder?: string;
    multi?: boolean;
}

export function PropertySelector({ value, onChange, onAddNew, placeholder = "Buscar propiedad...", multi = false }: PropertySelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const { data: properties, isLoading } = useProperties();

    const selectedProperty = properties?.find((p) => p.id === value);

    const filteredProperties = properties?.filter((p) => {
        const searchStr = `${p.property_type} ${p.zone} ${p.address} ${p.price}`.toLowerCase();
        return searchStr.includes(search.toLowerCase());
    }) || [];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-11 bg-background/50 border-muted rounded-xl hover:bg-muted/30 transition-all font-medium"
                >
                    {multi ? (
                        Array.isArray(value) && value.length > 0 ? (
                            <div className="flex items-center gap-2 truncate">
                                <Badge variant="secondary" className="text-[10px] font-black">{value.length} Seleccionadas</Badge>
                                <span className="text-muted-foreground truncate">{placeholder}</span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )
                    ) : selectedProperty ? (
                        <div className="flex items-center gap-2 truncate">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase truncate px-1.5 h-5 bg-primary/10 text-primary border-primary/20">
                                {selectedProperty.property_type}
                            </Badge>
                            <span className="truncate">{selectedProperty.address || selectedProperty.zone || 'Sin dirección'}</span>
                            <span className="text-muted-foreground font-bold text-[10px]">
                                {selectedProperty.currency === 'USD' ? '$' : 'S/'} {selectedProperty.price?.toLocaleString()}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 rounded-2xl border-muted shadow-2xl overflow-hidden" align="start">
                <div className="flex items-center border-b border-muted px-4 h-12 bg-muted/10">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tipo, zona, dirección..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="p-2 space-y-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                                Cargando propiedades...
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <Home className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm font-medium text-muted-foreground">No se encontraron propiedades</p>
                            </div>
                        ) : (
                            filteredProperties.map((property) => (
                                <div
                                    key={property.id}
                                    onClick={() => {
                                        if (multi) {
                                            const currentValues = Array.isArray(value) ? value : [];
                                            const isSelected = currentValues.includes(property.id);
                                            const nextValues = isSelected
                                                ? currentValues.filter(id => id !== property.id)
                                                : [...currentValues, property.id];
                                            onChange(nextValues);
                                        } else {
                                            onChange(property.id);
                                            setOpen(false);
                                        }
                                    }}
                                    className={cn(
                                        "flex flex-col gap-1.5 p-3 rounded-xl cursor-pointer transition-all",
                                        (multi ? (Array.isArray(value) && value.includes(property.id)) : value === property.id)
                                            ? "bg-primary/10 border border-primary/20"
                                            : "hover:bg-muted/50 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="text-[8px] h-4 font-black uppercase tracking-tighter">
                                            {property.property_type}
                                        </Badge>
                                        <span className="text-xs font-black text-primary font-mono">
                                            {property.currency === 'USD' ? '$' : 'S/'} {property.price?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold truncate">
                                            {property.address || property.zone || 'Sin dirección'}
                                        </span>
                                        {(multi ? (Array.isArray(value) && value.includes(property.id)) : value === property.id) && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                                        <span>{property.zone}</span>
                                        <span>•</span>
                                        <span>{property.bedrooms || 0} Dorm.</span>
                                        <span>•</span>
                                        <span>{property.m2_total || 0}m²</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                {onAddNew && (
                    <div className="p-2 border-t border-muted bg-muted/5">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 h-10 rounded-xl text-primary font-bold text-xs hover:bg-primary/5 hover:text-primary transition-all"
                            onClick={() => {
                                onAddNew();
                                setOpen(false);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Nueva Propiedad
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
