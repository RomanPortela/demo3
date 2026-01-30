'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useContentItems } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ContentCard } from "@/components/content/ContentCard";
import { ContentDialog } from "@/components/content/ContentDialog";
import { ContentItem } from "@/types";

export default function ContentPage() {
    const { data: items, isLoading } = useContentItems();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContentItem | undefined>();

    const handleEdit = (item: ContentItem) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedItem(undefined);
        setIsDialogOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-10 h-full pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Badge className="w-fit px-3 py-1 bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Social Media Engine
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-foreground">Planificación de Contenido</h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1">Estrategia de marketing y presencia digital.</p>
                    </div>
                    <Button onClick={handleCreate} className="h-14 px-8 rounded-[var(--radius-button)] shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all font-bold text-base">
                        <Plus className="mr-2 h-5 w-5" />
                        Nuevo Post
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 rounded-[var(--radius-card)] bg-white/50 border border-border/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {items?.map((item) => (
                            <ContentCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                            />
                        ))}
                        {(!items || items.length === 0) && (
                            <div className="col-span-full flex flex-col items-center justify-center p-20 text-center bg-[#FFF1F2] border-2 border-dashed border-primary/20 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-700">
                                    <Megaphone className="h-40 w-40 text-primary" />
                                </div>
                                <div className="relative z-10">
                                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mb-8 mx-auto shadow-xl shadow-primary/20">
                                        <Megaphone className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-primary mb-2">No hay posts planificados aún</h3>
                                    <p className="text-muted-foreground font-medium text-lg max-w-sm mx-auto mb-8">
                                        Tu calendario de contenido está esperando grandes ideas. 😊
                                    </p>
                                    <Button onClick={handleCreate} variant="outline" className="h-12 border-primary/20 text-primary hover:bg-primary/5 rounded-full font-bold px-8">
                                        Empezar ahora
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <ContentDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    item={selectedItem}
                />
            </div>
        </DashboardLayout>
    );
}
