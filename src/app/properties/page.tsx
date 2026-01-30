'use client';

import React from 'react';
import { Plus, Search, Filter, Home, MapPin, DollarSign, Bed, Square, ChevronRight, MoreVertical, LayoutGrid, List as ListIcon, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProperties } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyFilters, FilterState } from "@/components/properties/PropertyFilters";

export default function PropertiesPage() {
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedProperty, setSelectedProperty] = React.useState<any>(undefined);
    const [initialTab, setInitialTab] = React.useState('generales');
    const { data: properties, isLoading } = useProperties();

    const [filters, setFilters] = React.useState<FilterState>({
        minPrice: null,
        maxPrice: null,
        bedrooms: null,
        bathrooms: null,
        zones: [],
        propertyTypes: [],
        amenities: []
    });

    const uniqueZones = React.useMemo(() =>
        Array.from(new Set(properties?.map(p => p.zone).filter(Boolean) as string[])).sort(),
        [properties]);

    const uniqueTypes = React.useMemo(() =>
        Array.from(new Set(properties?.map(p => p.property_type).filter(Boolean) as string[])).sort(),
        [properties]);

    const filteredProperties = properties?.filter(p => {
        const matchesSearch = `${p.property_type} ${p.zone} ${p.address} ${p.price}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !selectedStatus || p.internal_status === selectedStatus;
        const matchesMinPrice = !filters.minPrice || (p.price || 0) >= filters.minPrice;
        const matchesMaxPrice = !filters.maxPrice || (p.price || 0) <= filters.maxPrice;
        const matchesZone = filters.zones.length === 0 || (p.zone && filters.zones.includes(p.zone));
        const matchesType = filters.propertyTypes.length === 0 || filters.propertyTypes.includes(p.property_type);

        let matchesBedrooms = true;
        if (filters.bedrooms) {
            const beds = p.bedrooms || 0;
            if (filters.bedrooms === '4+') matchesBedrooms = beds >= 4;
            else matchesBedrooms = beds === Number(filters.bedrooms);
        }

        let matchesBathrooms = true;
        if (filters.bathrooms) {
            const baths = p.bathrooms || 0;
            if (filters.bathrooms === '3+') matchesBathrooms = baths >= 3;
            else matchesBathrooms = baths === Number(filters.bathrooms);
        }

        const matchesAmenities = filters.amenities.length === 0 ||
            filters.amenities.every(a => p.amenities?.includes(a));

        return matchesSearch && matchesStatus && matchesMinPrice && matchesMaxPrice &&
            matchesZone && matchesType && matchesBedrooms && matchesBathrooms && matchesAmenities;
    }) || [];

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-10 overflow-hidden pb-20 relative">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-amber-100 text-amber-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                            Real Estate Asset Catalog
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-foreground">Propiedades</h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1">Gestión avanzada de activos y comercialización.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-muted/50 p-1.5 rounded-full border border-border/50 backdrop-blur-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-10 w-10 rounded-full transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50")}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-10 w-10 rounded-full transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50")}
                                onClick={() => setViewMode('list')}
                            >
                                <ListIcon className="h-5 w-5" />
                            </Button>
                        </div>
                        <Button
                            onClick={() => {
                                setSelectedProperty(undefined);
                                setIsDialogOpen(true);
                            }}
                            className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-full font-black shadow-xl shadow-primary/30 flex gap-3 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="h-6 w-6" />
                            Nueva Propiedad
                        </Button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="space-y-8 relative z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Buscar por zona, dirección, precio..."
                                className="pl-14 h-16 bg-white border-none shadow-xl shadow-black/5 rounded-3xl focus:ring-primary/20 transition-all text-lg font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <PropertyFilters
                            filters={filters}
                            setFilters={setFilters}
                            availableZones={uniqueZones}
                            availableTypes={uniqueTypes}
                            onClear={() => setFilters({
                                minPrice: null, maxPrice: null, bedrooms: null, bathrooms: null,
                                zones: [], propertyTypes: [], amenities: []
                            })}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 p-2 bg-muted/30 rounded-full border border-border/50 w-fit backdrop-blur-md">
                        {['Todos', 'Disponible', 'Reservada', 'En negociación', 'Vendida', 'Alquilada'].map((status) => (
                            <Button
                                key={status}
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStatus(status === 'Todos' ? null : status)}
                                className={cn(
                                    "rounded-full px-6 text-[11px] font-black uppercase tracking-widest h-10 transition-all",
                                    (selectedStatus === status || (status === 'Todos' && !selectedStatus))
                                        ? "bg-white text-primary shadow-xl shadow-black/10 ring-1 ring-black/5"
                                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                                )}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <ScrollArea className="flex-1 -mx-4 px-4 relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
                            <div className="relative h-24 w-24">
                                <Loader2 className="h-24 w-24 text-primary animate-spin opacity-20" />
                                <Home className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary" />
                            </div>
                            <p className="text-lg font-black text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Cargando catálogo premium</p>
                        </div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-6 glass-panel rounded-[3rem] border-dashed border-2">
                            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                                <Home className="h-12 w-12 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-foreground">No se encontraron propiedades</h3>
                                <p className="text-lg text-muted-foreground max-w-sm mx-auto mt-2">Ajusta los filtros o crea una nueva propiedad para comenzar de nuevo.</p>
                            </div>
                            <Button variant="outline" className="h-12 rounded-full font-bold px-8 border-primary/20 text-primary hover:bg-primary/5" onClick={() => setSearchQuery('')}>Limpiar búsqueda</Button>
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-8 pb-20",
                            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}>
                            {filteredProperties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    variant={viewMode}
                                    onClick={() => {
                                        setSelectedProperty(property);
                                        setInitialTab('generales');
                                        setIsDialogOpen(true);
                                    }}
                                    onPublishClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProperty(property);
                                        setInitialTab('portales');
                                        setIsDialogOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <PropertyDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    property={selectedProperty}
                    initialTab={initialTab}
                />
            </div>
        </DashboardLayout>
    );
}

function PropertyCard({ property, variant, onClick, onPublishClick }: { property: any, variant: 'grid' | 'list', onClick: () => void, onPublishClick: (e: React.MouseEvent) => void }) {
    const statusColors = {
        'Disponible': 'bg-emerald-500 text-white',
        'Vendida': 'bg-black text-white',
        'Alquilada': 'bg-blue-600 text-white',
        'Reservada': 'bg-amber-500 text-white',
        'En negociación': 'bg-indigo-600 text-white'
    };

    if (variant === 'list') {
        return (
            <Card
                onClick={onClick}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-2xl hover:shadow-black/5 border-border/50 rounded-[2.5rem] transition-all duration-500 cursor-pointer border-2 hover:border-primary/20">
                <div className="flex flex-col md:flex-row h-full">
                    <div className="w-full md:w-64 h-48 bg-muted/30 relative overflow-hidden">
                        {property.multimedia?.[0]?.url ? (
                            <img src={property.multimedia[0].url} alt={property.address} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Home className="h-10 w-10 text-gray-300" />
                            </div>
                        )}
                        <Badge className={cn("absolute top-4 left-4 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1", statusColors[property.internal_status as keyof typeof statusColors] || 'bg-gray-500 text-white')}>
                            {property.internal_status}
                        </Badge>
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[10px] font-black uppercase text-primary bg-primary/5 border-primary/20 rounded-full px-3">
                                        {property.property_type}
                                    </Badge>
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                        <div className="h-1 w-1 rounded-full bg-amber-500" /> EXCLUSIVO
                                    </span>
                                </div>
                                <h3 className="font-black text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">{property.address || property.zone || 'Sin dirección'}</h3>
                                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary/40" />
                                    {property.city}, {property.zone}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black tracking-tighter text-foreground">
                                    {property.currency === 'USD' ? '$' : 'S/'} {property.price?.toLocaleString()}
                                </p>
                                <p className="text-[10px] font-black text-primary uppercase mt-1">Expensas: {property.currency === 'USD' ? '$' : 'S/'} {property.expenses || 0}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                        <Bed className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-black text-foreground">{property.bedrooms || 0} Dorm.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                        <Square className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-black text-foreground">{property.m2_total || 0} m²</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={onPublishClick}
                                    className="h-10 px-6 bg-white border border-primary/20 text-primary hover:bg-primary/5 rounded-full font-bold text-xs uppercase tracking-widest"
                                >
                                    Publicar
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card
            onClick={onClick}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-2xl hover:shadow-black/5 border-border/50 rounded-[3rem] transition-all duration-500 cursor-pointer flex flex-col h-full border-2 hover:border-primary/20">
            {/* Image Section */}
            <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
                {property.multimedia?.[0]?.url ? (
                    <img src={property.multimedia[0].url} alt={property.address} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-100 to-gray-50">
                        <Home className="h-12 w-12 text-gray-200" />
                    </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                    <Badge className={cn("border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 h-7 flex items-center shadow-xl", statusColors[property.internal_status as keyof typeof statusColors] || 'bg-gray-500 text-white')}>
                        {property.internal_status}
                    </Badge>
                    <Badge className="bg-white/90 backdrop-blur-md text-black border-none text-[8px] font-black uppercase tracking-widest h-6 px-3 shadow-lg">
                        {property.property_type}
                    </Badge>
                </div>

                <div className="absolute top-5 right-5 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
                    <MoreVertical className="h-5 w-5 text-white group-hover:text-black transition-colors" />
                </div>

                <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> EXCLUSIVO
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col gap-6 flex-1">
                <div className="space-y-1">
                    <h3 className="font-black text-2xl tracking-tighter truncate group-hover:text-primary transition-colors">
                        {property.address || property.zone || 'Sin dirección'}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground/60 font-medium text-xs">
                        <MapPin className="h-3.5 w-3.5 text-primary/40" />
                        <span className="truncate uppercase tracking-wider text-[10px]">{property.city} • {property.zone}</span>
                    </div>
                </div>

                <div className="text-4xl font-black tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left">
                    {property.currency === 'USD' ? '$' : 'S/'} {property.price?.toLocaleString()}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50/50 border border-border/50 group-hover:bg-primary/5 transition-colors">
                        <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <Bed className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black leading-none">{property.bedrooms || 0}</span>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-tighter mt-1">Dorms.</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50/50 border border-border/50 group-hover:bg-primary/5 transition-colors">
                        <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <Square className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black leading-none">{property.m2_total || 0}</span>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-tighter mt-1">M² Totales</span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={onPublishClick}
                    className="w-full h-12 bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-sm group-hover:shadow-primary/20 transition-all font-sans"
                >
                    Publicar en Portales
                </Button>
            </div>
        </Card>
    );
}
