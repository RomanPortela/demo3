'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    availableZones: string[];
    availableTypes: string[];
    onClear: () => void;
}

export interface FilterState {
    minPrice: number | null;
    maxPrice: number | null;
    bedrooms: string | null;
    bathrooms: string | null;
    zones: string[];
    propertyTypes: string[];
    amenities: string[];
}

const COMMON_AMENITIES = [
    "Piscina", "Gimnasio", "Seguridad 24hs", "SUM", "Parrilla",
    "Cochera", "Balcón", "Jardín", "Terraza", "Ascensor", "Laundry"
];

export function PropertyFilters({ filters, setFilters, availableZones, availableTypes, onClear }: PropertyFiltersProps) {
    const handleZoneToggle = (zone: string) => {
        setFilters({
            ...filters,
            zones: filters.zones.includes(zone)
                ? filters.zones.filter(z => z !== zone)
                : [...filters.zones, zone]
        });
    };

    const handleTypeToggle = (type: string) => {
        setFilters({
            ...filters,
            propertyTypes: filters.propertyTypes.includes(type)
                ? filters.propertyTypes.filter(t => t !== type)
                : [...filters.propertyTypes, type]
        });
    };

    const handleAmenityToggle = (amenity: string) => {
        setFilters({
            ...filters,
            amenities: filters.amenities.includes(amenity)
                ? filters.amenities.filter(a => a !== amenity)
                : [...filters.amenities, amenity]
        });
    };

    const activeFilterCount =
        (filters.minPrice ? 1 : 0) +
        (filters.maxPrice ? 1 : 0) +
        (filters.bedrooms ? 1 : 0) +
        (filters.bathrooms ? 1 : 0) +
        filters.zones.length +
        filters.propertyTypes.length +
        filters.amenities.length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="h-12 rounded-2xl border-muted bg-background/50 px-6 font-bold flex gap-2 hover:bg-muted/30 relative">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    Filtros
                    {activeFilterCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] flex flex-col h-full p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="text-xl font-bold flex items-center justify-between">
                        Filtros Avanzados
                        {activeFilterCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-xs text-muted-foreground hover:text-destructive">
                                <X className="h-3 w-3 mr-1" /> Limpiar todo
                            </Button>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="flex flex-col gap-8">
                        {/* Price Range */}
                        <div className="space-y-4">
                            <Label className="text-base font-bold">Rango de Precio</Label>
                            <div className="flex items-center gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : null })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                                    <Input
                                        type="number"
                                        placeholder="Sin límite"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null })}
                                        className="h-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Property Type */}
                        <div className="space-y-4">
                            <Label className="text-base font-bold">Tipo de Propiedad</Label>
                            <div className="flex flex-wrap gap-2">
                                {availableTypes.map(type => (
                                    <Badge
                                        key={type}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/50",
                                            filters.propertyTypes.includes(type)
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-background border-muted text-muted-foreground"
                                        )}
                                        onClick={() => handleTypeToggle(type)}
                                    >
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Zone */}
                        <div className="space-y-4">
                            <Label className="text-base font-bold">Zona / Barrio</Label>
                            <div className="flex flex-wrap gap-2">
                                {availableZones.map(zone => (
                                    <Badge
                                        key={zone}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/50",
                                            filters.zones.includes(zone)
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-background border-muted text-muted-foreground"
                                        )}
                                        onClick={() => handleZoneToggle(zone)}
                                    >
                                        {zone}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Rooms & Baths */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-base font-bold">Dormitorios</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Any', '1', '2', '3', '4+'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setFilters({ ...filters, bedrooms: opt === 'Any' ? null : opt })}
                                            className={cn(
                                                "h-8 w-8 rounded-lg text-xs font-bold border transition-all flex items-center justify-center",
                                                (filters.bedrooms === opt || (!filters.bedrooms && opt === 'Any'))
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background border-muted text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {opt === 'Any' ? 'All' : opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-base font-bold">Baños</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Any', '1', '2', '3+'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setFilters({ ...filters, bathrooms: opt === 'Any' ? null : opt })}
                                            className={cn(
                                                "h-8 w-8 rounded-lg text-xs font-bold border transition-all flex items-center justify-center",
                                                (filters.bathrooms === opt || (!filters.bathrooms && opt === 'Any'))
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background border-muted text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {opt === 'Any' ? 'All' : opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-4">
                            <Label className="text-base font-bold">Amenities</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {COMMON_AMENITIES.map(amenity => (
                                    <div
                                        key={amenity}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
                                            filters.amenities.includes(amenity)
                                                ? "bg-primary/5 border-primary/50"
                                                : "bg-background border-muted hover:bg-muted/20"
                                        )}
                                        onClick={() => handleAmenityToggle(amenity)}
                                    >
                                        <div className={cn(
                                            "h-4 w-4 rounded border flex items-center justify-center",
                                            filters.amenities.includes(amenity) ? "bg-primary border-primary" : "border-muted-foreground"
                                        )}>
                                            {filters.amenities.includes(amenity) && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <span className="text-xs font-medium">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter className="p-6 border-t bg-background/50 backdrop-blur-sm">
                    <SheetClose asChild>
                        <Button className="w-full font-bold h-12 rounded-xl">Ver Resultados</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
