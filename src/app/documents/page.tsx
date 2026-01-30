'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalDocumentList } from "@/components/documents/GlobalDocumentList";
import { Files, ShieldCheck, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DocumentsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 pb-20 relative min-h-screen">
                {/* Subtle dot background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-emerald-100 text-emerald-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Secure Asset Repository
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-foreground">Sistema Documental</h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1 max-w-2xl">
                            Repositorio central con <span className="text-primary font-bold">Control de Versiones</span> y <span className="text-primary font-bold">Seguimiento RLS</span> para activos inmobiliarios.
                        </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-8 bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-xl shadow-black/5">
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <ShieldCheck className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Encriptación Activa</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-60">AES-256 / SHA-256 Compliant</span>
                        </div>
                        <div className="h-10 w-px bg-border/40" />
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-primary">
                                <Database className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Almacenamiento SEGURO</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-60">Bucket: "InmoAria-Production"</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <GlobalDocumentList />
                </div>
            </div>
        </DashboardLayout>
    );
}
