'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardStats } from "@/lib/supabase/stats-queries";
import { UserCircle, Users, Lightbulb, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <DashboardLayout><div className="animate-pulse space-y-4">...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            Resumen operativo para <span className="text-primary px-2 py-0.5 bg-primary/5 rounded-lg border border-primary/10">InmoAria</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Clientes', value: stats?.totalClients || 0, icon: UserCircle, color: 'text-blue-500' },
            { label: 'Leads Activos', value: stats?.activeLeads || 0, icon: Users, color: 'text-indigo-500' },
            { label: 'Oportunidades', value: stats?.opportunitiesOpen || 0, icon: Lightbulb, color: 'text-amber-500' },
            { label: 'Tareas Pendientes', value: stats?.tasksPending || 0, icon: CheckSquare, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-[2rem] group hover:border-primary/40 transition-all duration-500 relative overflow-hidden">
              <div className="flex flex-col gap-4 relative z-10">
                <div className={cn("h-12 w-12 rounded-2xl bg-background/50 flex items-center justify-center shadow-sm", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-4xl font-black">{stat.value}</p>
                </div>
              </div>
              {/* Decorative background element for card */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-panel p-8 rounded-[2rem] min-h-[350px] flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Rendimiento de Ventas</h3>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/40 rounded-3xl bg-accent/20">
              <p className="text-xs font-medium text-muted-foreground italic">Visualización de datos en proceso...</p>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-[2rem] min-h-[350px] flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Distribución de Leads</h3>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/40 rounded-3xl bg-accent/20">
              <p className="text-xs font-medium text-muted-foreground italic">Cargando métricas dinámicas...</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
