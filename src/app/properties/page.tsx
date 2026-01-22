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

export default function PropertiesPage() {
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const { data: properties, isLoading } = useProperties();

    const filteredProperties = properties?.filter(p => {
        const matchesSearch = `${p.property_type} ${p.zone} ${p.address} ${p.price}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !selectedStatus || p.internal_status === selectedStatus;
        return matchesSearch && matchesStatus;
    }) || [];

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-6 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Propiedades</h1>
                        <p className="text-sm text-muted-foreground font-medium">Gestiona tu catálogo de activos inmobiliarios</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn("rounded-xl transition-all", viewMode === 'grid' ? "bg-primary/10 text-primary border-primary/20" : "bg-background/50 border-muted")}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn("rounded-xl transition-all", viewMode === 'list' ? "bg-primary/10 text-primary border-primary/20" : "bg-background/50 border-muted")}
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                        <div className="h-8 w-[1px] bg-muted/30 mx-2" />
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-bold shadow-lg shadow-primary/20 flex gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Nueva Propiedad
                        </Button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Buscar por zona, dirección, precio..."
                                className="pl-10 h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 rounded-2xl border-muted bg-background/50 px-6 font-bold flex gap-2 hover:bg-muted/30">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            Filtros Avanzados
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['Todos', 'Disponible', 'Reservada', 'En negociación', 'Vendida', 'Alquilada'].map((status) => (
                            <Button
                                key={status}
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStatus(status === 'Todos' ? null : status)}
                                className={cn(
                                    "rounded-full px-4 text-[10px] font-black uppercase tracking-widest h-8 transition-all",
                                    (selectedStatus === status || (status === 'Todos' && !selectedStatus))
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <ScrollArea className="flex-1 -mx-2 px-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                            <div className="relative h-16 w-16">
                                <Loader2 className="h-16 w-16 text-primary animate-spin opacity-20" />
                                <Home className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground animate-pulse">Cargando catálogo...</p>
                        </div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
                            <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center">
                                <Home className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-foreground">No se encontraron propiedades</p>
                                <p className="text-sm text-muted-foreground">Ajusta los filtros o crea una nueva propiedad para comenzar.</p>
                            </div>
                            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setSearchQuery('')}>Limpiar búsqueda</Button>
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-6 pb-12",
                            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}>
                            {filteredProperties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    variant={viewMode}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <PropertyDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            </div>
        </DashboardLayout>
    );
}

function PropertyCard({ property, variant }: { property: any, variant: 'grid' | 'list' }) {
    if (variant === 'list') {
        return (
            <Card className="group relative overflow-hidden bg-background/40 hover:bg-muted/10 border-muted rounded-2xl transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Image Placeholder */}
                    <div className="w-full md:w-48 h-32 bg-muted/30 flex items-center justify-center overflow-hidden">
                        {property.multimedia?.[0]?.url ? (
                            <img src={property.multimedia[0].url} alt={property.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <Home className="h-8 w-8 text-muted-foreground/20" />
                        )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/20 bg-primary/5">
                                        {property.property_type}
                                    </Badge>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase text-secondary border-secondary/20 bg-secondary/5">
                                        {property.internal_status}
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-sm tracking-tight truncate line-clamp-1">{property.address || property.zone || 'Sin dirección'}</h3>
                                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 opacity-70">
                                    <MapPin className="h-3 w-3" />
                                    {property.city}, {property.zone}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black tracking-tighter text-foreground">
                                    {property.currency === 'USD' ? '$' : 'S/'} {property.price?.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">Exensas: {property.expenses || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-l border-muted/30 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-bold">{property.bedrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Square className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-bold">{property.m2_total || 0}m²</span>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="group relative overflow-hidden bg-background/40 hover:bg-muted/10 border-muted rounded-[2rem] transition-all cursor-pointer flex flex-col h-full border-2 hover:border-primary/20 shadow-xl shadow-black/5">
            {/* Image Section */}
            <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
                {property.multimedia?.[0]?.url ? (
                    <img src={property.multimedia[0].url} alt={property.address} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/50 to-muted/20">
                        <Home className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-white/90 backdrop-blur-md text-black border-none text-[9px] font-black uppercase tracking-tight h-6 px-3 shadow-xl">
                        {property.property_type}
                    </Badge>
                </div>

                <div className="absolute top-4 right-4 h-8 w-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <MoreVertical className="h-4 w-4 text-white" />
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-2xl shadow-2xl shadow-primary/40 font-black tracking-tighter text-sm">
                    {property.currency === 'USD' ? '$' : 'S/'} {property.price?.toLocaleString()}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-4">
                <div>
                    <h3 className="font-bold text-lg tracking-tighter truncate line-clamp-1 group-hover:text-primary transition-colors">
                        {property.address || property.zone || 'Sin dirección'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                        <MapPin className="h-3 w-3" />
                        <span className="text-[11px] font-medium truncate uppercase tracking-widest leading-none">{property.city} • {property.zone}</span>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-muted/50">
                        <div className="h-8 w-8 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
                            <Bed className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black">{property.bedrooms || 0}</span>
                            <span className="text-[8px] uppercase font-bold text-muted-foreground opacity-60 leading-none tracking-tighter">Habits.</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-muted/50">
                        <div className="h-8 w-8 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
                            <Square className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black">{property.m2_total || 0}</span>
                            <span className="text-[8px] uppercase font-bold text-muted-foreground opacity-60 leading-none tracking-tighter">M² Totales</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
