'use client';

import React from 'react';
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, X, Star } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

export function MultimediaForm() {
    const { watch, setValue } = useFormContext();
    const images = watch('multimedia') || [];

    const handleAddImage = () => {
        // Mock add image for now
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-foreground">Galería de Fotos</FormLabel>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Sube imágenes de alta calidad. La primera será la portada.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddImage}
                    className="rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary transition-all flex gap-2 font-black text-[10px] uppercase"
                >
                    <Plus className="h-3 w-3" />
                    Añadir Fotos
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img: any) => (
                    <div key={img.id} className="group relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-muted bg-muted/20 hover:border-primary/50 transition-all shadow-xl">
                        <img src={img.url} alt="Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-between items-start">
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => removeImage(img.id)}
                                    className="h-6 w-6 rounded-lg scale-75 group-hover:scale-100 transition-transform"
                                >
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
                    <div
                        onClick={handleAddImage}
                        className="aspect-square rounded-[1.5rem] border-2 border-dashed border-muted bg-muted/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/20 transition-all opacity-50 hover:opacity-100"
                    >
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sin Imágenes</span>
                    </div>
                )}
            </div>
        </div>
    );
}
