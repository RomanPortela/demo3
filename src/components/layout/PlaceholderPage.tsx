import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <DashboardLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center rounded-3xl">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <span className="text-2xl font-bold">...</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Módulo en Construcción</h2>
                    <p className="text-muted-foreground max-w-md">
                        Estamos preparando el módulo de {title} con las mejores herramientas para InmoAria. Próximamente disponible.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
