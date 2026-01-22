'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useContentItems } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { useState } from "react";
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
            <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Contenido</h1>
                        <p className="text-muted-foreground font-medium">Planificación de marketing y redes sociales.</p>
                    </div>
                    <Button onClick={handleCreate} className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Post
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-44 rounded-3xl bg-card/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pb-8">
                        {items?.map((item) => (
                            <ContentCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                            />
                        ))}
                        {items?.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground min-h-[300px] glass-panel rounded-3xl">
                                <Megaphone className="h-12 w-12 text-primary/30 mb-4" />
                                <p>No hay contenido planificado.</p>
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
