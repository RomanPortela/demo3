'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Key,
    DollarSign,
    AlertCircle,
    Calendar,
    User,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Filter,
    Search,
    TrendingUp,
    Wallet,
    Home,
    Plus,
    FileText
} from "lucide-react";
import { useRentalContracts, useRentalPayments } from "@/lib/supabase/queries";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RentalDialog } from "@/components/rentals/RentalDialog";

export default function RentalsPage() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: contracts = [], isLoading: loadingContracts } = useRentalContracts();
    const currentMonth = format(new Date(), 'yyyy-MM');
    const { data: monthlyPayments = [], isLoading: loadingPayments } = useRentalPayments(undefined, currentMonth);

    // Financial calculations for the dashboard
    const expectedThisMonth = monthlyPayments.reduce((acc, p) => acc + Number(p.amount_rent), 0);
    const collectedThisMonth = monthlyPayments.filter(p => p.status === 'cobrado').reduce((acc, p) => acc + Number(p.amount_collected), 0);
    const pendingThisMonth = monthlyPayments.filter(p => p.status === 'pendiente').reduce((acc, p) => acc + Number(p.amount_rent), 0);
    const delayedThisMonth = monthlyPayments.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + Number(p.amount_rent), 0);

    // Agency Net (Profit)
    const agencyNet = monthlyPayments.filter(p => p.status === 'cobrado').reduce((acc, p) => acc + Number(p.agency_commission_amount || 0), 0);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-12 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit px-3 py-1 bg-emerald-100 text-emerald-600 border-none text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            Financial Management
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tight text-foreground">Alquileres & Caja</h1>
                        <p className="text-muted-foreground font-medium text-lg mt-1">Gestión de cobros, contratos y rentabilidad.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => setIsDialogOpen(true)} className="h-14 px-8 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all font-black text-base gap-2 text-white">
                            <Plus className="h-6 w-6" /> Nuevo Contrato
                        </Button>
                    </div>
                </div>

                <RentalDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />

                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-10 rounded-[3rem] border border-emerald-100/50 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="premium-card p-8 border-none bg-white/60 backdrop-blur-xl group/kpi">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover/kpi:scale-110 transition-transform shadow-sm">
                                <Wallet className="h-7 w-7" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">Total a Cobrar</p>
                            <div className="text-5xl font-black tracking-tighter text-foreground">${expectedThisMonth.toLocaleString()}</div>
                            <p className="text-[10px] font-bold text-muted-foreground mt-4">Previsión mensual</p>
                        </Card>

                        <Card className="premium-card p-8 border-none bg-white/60 backdrop-blur-xl group/kpi">
                            <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover/kpi:scale-110 transition-transform shadow-sm">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Cobrado Real</p>
                            <div className="text-5xl font-black tracking-tighter text-foreground">${collectedThisMonth.toLocaleString()}</div>
                            <p className="text-[10px] font-bold text-muted-foreground mt-4">Efectivo ingresado</p>
                        </Card>

                        <Card className="premium-card p-8 border-none bg-white/60 backdrop-blur-xl group/kpi">
                            <div className="h-14 w-14 rounded-2xl bg-[#FFF1F2] text-red-500 flex items-center justify-center mb-6 group-hover/kpi:scale-110 transition-transform shadow-sm">
                                <Clock className="h-7 w-7" />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-black uppercase tracking-widest text-red-500">Pendiente</p>
                                {delayedThisMonth > 0 && <Badge className="bg-red-500 text-white border-none text-[8px] animate-bounce-subtle">MORA!</Badge>}
                            </div>
                            <div className="text-5xl font-black tracking-tighter text-foreground">${pendingThisMonth.toLocaleString()}</div>
                            <p className="text-[10px] font-bold text-muted-foreground mt-4">Por cobrar en el mes</p>
                        </Card>

                        <Card className="premium-card p-8 border-none bg-primary text-white group/kpi shadow-2xl shadow-primary/40">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-6 group-hover/kpi:scale-110 transition-transform">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-white/80 mb-2">Ganancia Neta</p>
                            <div className="text-5xl font-black tracking-tighter text-white">${agencyNet.toLocaleString()}</div>
                            <p className="text-[10px] font-bold text-white/60 mt-4">Comisiones de agencia</p>
                        </Card>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
                    <TabsList className="bg-white/50 p-2 rounded-2xl h-16 border border-border/50 backdrop-blur-sm inline-flex">
                        <TabsTrigger value="dashboard" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2 transition-all">
                            <TrendingUp className="h-4 w-4" /> Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="contracts" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2 transition-all">
                            <FileText className="h-4 w-4" /> Contratos
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2 transition-all">
                            <Wallet className="h-4 w-4" /> Cobros del Mes
                        </TabsTrigger>
                        <TabsTrigger value="debts" className="rounded-xl px-8 h-full data-[state=active]:bg-red-500 data-[state=active]:text-white font-bold gap-2 text-red-500 transition-all">
                            <AlertCircle className="h-4 w-4" /> Moras
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <Card className="lg:col-span-2 p-10 premium-card overflow-hidden relative">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Caja de Alquileres</h3>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Últimos cobros realizados</p>
                                    </div>
                                    <Button variant="outline" className="rounded-full px-6 font-bold text-[10px]">VER HISTORIAL</Button>
                                </div>

                                <div className="space-y-4">
                                    {monthlyPayments.filter(p => p.status === 'cobrado').slice(0, 5).map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-6 bg-muted/30 border border-transparent hover:border-border hover:bg-white hover:shadow-xl rounded-[2rem] transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110 shadow-sm">
                                                    <DollarSign className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black">{payment.contract?.property?.address || 'Sin dirección'}</p>
                                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">inquilino: {payment.contract?.tenant?.full_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-emerald-600">${payment.amount_collected?.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold">{format(new Date(payment.collected_at || ''), 'dd MMMM, yyyy', { locale: es })}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {monthlyPayments.filter(p => p.status === 'cobrado').length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/40">
                                            <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                                                <Wallet className="h-10 w-10" />
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-widest text-center max-w-[200px]">Sin cobros registrados este mes</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div className="space-y-8">
                                <Card className="p-10 bg-[#FFF1F2] border-[#FEE2E2] rounded-[3rem] shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700">
                                        <AlertCircle className="h-32 w-32 text-red-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-8 text-red-500">
                                            <div className="h-8 w-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                                                <AlertCircle className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Alertas de Mora</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {monthlyPayments.filter(p => p.status === 'atrasado').map((payment) => (
                                                <div key={payment.id} className="p-6 bg-white shadow-xl shadow-red-500/5 border border-red-100 rounded-[2rem] flex flex-col gap-3 transition-transform hover:-translate-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-black uppercase text-foreground">{payment.contract?.tenant?.full_name}</p>
                                                        <Badge className="bg-red-500 text-white border-none text-[8px] px-2 py-0.5 font-black uppercase">MORA CRÍTICA</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-2xl font-black text-red-600">${payment.amount_rent.toLocaleString()}</p>
                                                        <Button variant="link" className="text-[10px] text-red-500 font-black uppercase underline p-0 h-auto">
                                                            Notificar Agent
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {monthlyPayments.filter(p => p.status === 'atrasado').length === 0 && (
                                                <div className="text-center py-10 opacity-40">
                                                    <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                                        <CheckCircle2 className="h-8 w-8" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cero moras activas</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-10 premium-card bg-white shadow-sm">
                                    <div className="flex items-center gap-3 mb-8 text-primary">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Vencimientos</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {contracts.filter(c => c.status === 'activo').slice(0, 3).map(c => (
                                            <div key={c.id} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-2xl transition-all cursor-pointer">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black uppercase text-foreground truncate pr-4">{c.property?.address}</p>
                                                    <p className="text-[9px] text-muted-foreground font-bold mt-1">FINALIZA EN: {format(new Date(c.end_date), 'MMMM yyyy', { locale: es })}</p>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <ArrowUpRight className="h-4 w-4 text-primary" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="contracts" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                        <Card className="p-10 premium-card bg-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Todos los Contratos</h3>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Base de datos de vigencias</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Buscar propiedad..." className="pl-11 w-72 rounded-full bg-muted/30 border-none shadow-none focus-visible:bg-white focus-visible:ring-primary/20" />
                                    </div>
                                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-full">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-muted/10">
                                            <th className="text-left pb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Propiedad</th>
                                            <th className="text-left pb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inquilino / Dueño</th>
                                            <th className="text-left pb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vigencia</th>
                                            <th className="text-left pb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Renta</th>
                                            <th className="text-left pb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                                            <th className="pb-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/5">
                                        {contracts.map((contract) => (
                                            <tr key={contract.id} className="group hover:bg-muted/10 transition-colors">
                                                <td className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                            <Home className="h-6 w-6" />
                                                        </div>
                                                        <p className="text-sm font-black text-foreground">{contract.property?.address}</p>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <p className="text-sm font-bold text-foreground">{contract.tenant?.full_name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">Prop: {contract.owner?.full_name}</p>
                                                </td>
                                                <td className="py-6">
                                                    <p className="text-xs font-bold text-foreground">{format(new Date(contract.start_date), 'dd/MM/yy')} - {format(new Date(contract.end_date), 'dd/MM/yy')}</p>
                                                </td>
                                                <td className="py-6">
                                                    <p className="text-sm font-black text-primary">${contract.base_amount.toLocaleString()}</p>
                                                    <p className="text-[9px] text-muted-foreground font-black uppercase">{contract.adjustment_frequency}</p>
                                                </td>
                                                <td className="py-6">
                                                    <Badge className={cn(
                                                        "rounded-full text-[9px] font-black uppercase px-3 py-1",
                                                        contract.status === 'activo' ? "bg-emerald-100 text-emerald-600 border-none" :
                                                            contract.status === 'en_mora' ? "bg-red-100 text-red-600 border-none" : "bg-muted text-muted-foreground border-none"
                                                    )}>
                                                        {contract.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-6 text-right">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                                        <ArrowUpRight className="h-5 w-5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
