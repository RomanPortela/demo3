'use client';

import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { LeadSelector } from "@/components/leads/LeadSelector";
import { Home, ClipboardList, Eye, Image as ImageIcon, Plus, X, Star, Film, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GeneralesForm() {
    const { control, watch, setValue } = useFormContext();
    const images = watch('multimedia') || [];

    const handleAddImage = () => {
        const newImage = {
            id: Date.now(),
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
            type: 'image',
            is_cover: images.length === 0,
            position: images.length
        };
        setValue('multimedia', [...images, newImage]);
    };

    const removeImage = (id: number) => {
        setValue('multimedia', images.filter((img: any) => img.id !== id));
    };

    const setCover = (id: number) => {
        setValue('multimedia', images.map((img: any) => ({
            ...img,
            is_cover: img.id === id
        })));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            {/* Propietario Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 rounded-full bg-primary/40" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Vinculación de Propietario</h3>
                </div>
                <FormField
                    control={control}
                    name="owner_id"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">Seleccionar Propietario del Lead</FormLabel>
                            <FormControl>
                                <LeadSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Buscar Lead de tipo Propietario..."
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {/* Basic Info Section */}
            <div className="grid grid-cols-2 gap-6 p-6 rounded-[2rem] bg-muted/20 border border-muted/20">
                <FormField
                    control={control}
                    name="property_type"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                <Home className="h-3 w-3" /> Tipo de Propiedad
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium text-sm">
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-muted/20 bg-background/80 backdrop-blur-xl shadow-2xl">
                                    <SelectItem value="casa">Casa</SelectItem>
                                    <SelectItem value="departamento">Departamento</SelectItem>
                                    <SelectItem value="terreno">Terreno</SelectItem>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="oficina">Oficina</SelectItem>
                                    <SelectItem value="galpon">Galpón</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="operation_type"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                <ClipboardList className="h-3 w-3" /> Operación
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium text-sm">
                                        <SelectValue placeholder="Seleccionar operación" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-muted/20 bg-background/80 backdrop-blur-xl shadow-2xl">
                                    <SelectItem value="venta">Venta</SelectItem>
                                    <SelectItem value="alquiler">Alquiler</SelectItem>
                                    <SelectItem value="alquiler_temporario">Alquiler Temporario</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
            </div>

            {/* Status Section */}
            <div className="grid grid-cols-2 gap-6 p-6 rounded-[2rem] bg-muted/20 border border-muted/20">
                <FormField
                    control={control}
                    name="internal_status"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                <ClipboardList className="h-3 w-3" /> Estado Interno
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium text-sm">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-muted/20 bg-background/80 backdrop-blur-xl shadow-2xl">
                                    <SelectItem value="Disponible">Disponible</SelectItem>
                                    <SelectItem value="Reservada">Reservada</SelectItem>
                                    <SelectItem value="En negociación">En negociación</SelectItem>
                                    <SelectItem value="Vendida">Vendida</SelectItem>
                                    <SelectItem value="Alquilada">Alquilada</SelectItem>
                                    <SelectItem value="Inactiva">Inactiva</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="internal_visibility"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                <Eye className="h-3 w-3" /> Visibilidad
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium text-sm">
                                        <SelectValue placeholder="Seleccionar visibilidad" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-muted/20 bg-background/80 backdrop-blur-xl shadow-2xl">
                                    <SelectItem value="Activa para ventas">Activa para ventas</SelectItem>
                                    <SelectItem value="Oculta">Oculta (Borrador)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
            </div>

            {/* Multimedia Integration */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-1 rounded-full bg-primary/40" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Galería de Imágenes</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddImage}
                        className="rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary transition-all flex gap-2 font-black text-[10px] uppercase h-9"
                    >
                        <Plus className="h-3 w-3" />
                        Añadir Fotos
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 px-2">
                    {images.map((img: any) => (
                        <div key={img.id} className="group relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-muted bg-muted/20 hover:border-primary/50 transition-all shadow-lg">
                            <img src={img.url} alt="Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-between items-start">
                                    <Button size="icon" variant="destructive" onClick={() => removeImage(img.id)} className="h-6 w-6 rounded-lg scale-75 group-hover:scale-100 transition-transform">
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant={img.is_cover ? "default" : "secondary"}
                                        onClick={() => setCover(img.id)}
                                        className={cn("h-6 w-6 rounded-lg scale-75 group-hover:scale-100 transition-transform", img.is_cover ? "bg-yellow-500" : "")}
                                    >
                                        <Star className={cn("h-3 w-3", img.is_cover ? "fill-white" : "")} />
                                    </Button>
                                </div>
                            </div>
                            {img.is_cover && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-yellow-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-md shadow-lg">
                                    Portada
                                </div>
                            )}
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div onClick={handleAddImage} className="aspect-square rounded-[1.5rem] border-2 border-dashed border-muted bg-muted/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/10 transition-all">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Sin Imágenes</span>
                        </div>
                    )}
                </div>

                {/* Extra Multimedia: Video & Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[2rem] bg-muted/10 border border-muted/10">
                    <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 flex items-center gap-2">
                            <Film className="h-3 w-3" /> URL Video (YouTube / Vimeo)
                        </FormLabel>
                        <Input className="h-11 bg-background/50 border-muted rounded-xl text-sm" placeholder="https://..." />
                    </FormItem>
                    <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70 flex items-center gap-2">
                            <FileText className="h-3 w-3" /> Planos / PDFs
                        </FormLabel>
                        <div className="h-11 bg-background/50 border-2 border-dotted border-muted rounded-xl flex items-center px-4 cursor-pointer hover:bg-muted/10 transition-all">
                            <span className="text-xs font-bold text-muted-foreground/60 uppercase">Elegir archivo para subir</span>
                        </div>
                    </FormItem>
                </div>
            </div>
        </div>
    );
}
