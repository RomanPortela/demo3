"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CalendarView } from "@/components/calendar/CalendarView";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";

export default function CalendarPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 pb-20 relative min-h-screen">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-amber-100 text-amber-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Operational Schedule
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-foreground flex items-center gap-4">
                            Calendario <Sparkles className="h-8 w-8 text-amber-400" />
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1">Gestión avanzada de agenda, eventos internos y visitas agendadas.</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <CalendarView />
                </div>
            </div>
        </DashboardLayout>
    );
}
