"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardStats } from "@/lib/supabase/stats-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Target, Clock, PieChart as PieChartIcon, Settings2, Save } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

import { checkClientAutomations } from "@/lib/automations/client-tasks";

import { TodayActions } from "@/components/dashboard/TodayActions";

export default function Home() {
  const { data: stats, isLoading } = useDashboardStats();

  useEffect(() => {
    checkClientAutomations();
  }, []);

  // Goal Configuration State
  const [goalType, setGoalType] = useState<'sales' | 'rentals'>('sales');
  const [goalTarget, setGoalTarget] = useState<number>(10);
  const [isConfiguringGoal, setIsConfiguringGoal] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedType = localStorage.getItem('dashboard_goal_type') as 'sales' | 'rentals';
    const storedTarget = localStorage.getItem('dashboard_goal_target');

    if (storedType) setGoalType(storedType);
    if (storedTarget) setGoalTarget(parseInt(storedTarget));
  }, []);

  const handleSaveGoal = () => {
    localStorage.setItem('dashboard_goal_type', goalType);
    localStorage.setItem('dashboard_goal_target', goalTarget.toString());
    setIsConfiguringGoal(false);
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 animate-pulse">
        <div className="h-10 w-48 bg-muted/50 rounded-lg"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted/50 rounded-2xl"></div>)}
        </div>
      </div>
    </DashboardLayout>
  );

  // Calculate Goal Progress
  const currentSales = goalType === 'sales' ? (stats?.salesClosed || 0) : (stats?.rentalsClosed || 0);
  const goalPercentage = Math.min(100, Math.round((currentSales / goalTarget) * 100));
  const goalLabel = goalType === 'sales' ? 'Ventas' : 'Alquileres';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Badge className="w-fit px-3 py-1 bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em]">
              Real Estate Intelligence
            </Badge>
            <h1 className="text-5xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground font-medium text-lg">
              Resumen operativo para <span className="text-primary font-bold">InmoAria</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center overflow-hidden shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="team" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground ml-2">Equipo Activo</p>
          </div>
        </div>

        {/* Brain Block: Smart Alerts */}
        <TodayActions />

        {/* KPI Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="premium-card p-8 group/card">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/card:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-success/10 text-success border-none text-[10px] font-black">HOY</Badge>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Leads Nuevos</p>
              <div className="text-4xl font-black tracking-tight">{stats?.leadsToday}</div>
              <p className="text-xs text-muted-foreground font-medium mt-3 flex items-center gap-1.5">
                <span className="text-success font-black">+{stats?.leadsWeek}</span> esta semana
              </p>
            </div>
          </Card>

          <Card className="premium-card p-8 group/card">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl bg-info/10 text-info group-hover/card:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge className="bg-info/10 text-info border-none text-[10px] font-black">TASA</Badge>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Conversión</p>
              <div className="text-4xl font-black tracking-tight">{stats?.conversionRate}%</div>
              <p className="text-xs text-muted-foreground font-medium mt-3">De leads a visita agendada</p>
            </div>
          </Card>

          <Card className="premium-card p-8 group/card">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 group-hover/card:scale-110 transition-transform">
                <Target className="h-6 w-6" />
              </div>
              <Badge className="bg-purple-100 text-purple-600 border-none text-[10px] font-black">META</Badge>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {goalType === 'sales' ? 'Ventas Cerradas' : 'Alquileres Cerrados'}
              </p>
              <div className="text-4xl font-black tracking-tight">{currentSales}</div>
              <p className="text-xs text-muted-foreground font-medium mt-3">
                Objetivo: <span className="text-purple-600 font-black">{goalTarget}</span> {goalLabel}
              </p>
            </div>
          </Card>

          <Card className="premium-card p-8 group/card">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 group-hover/card:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <Badge className="bg-amber-100 text-amber-600 border-none text-[10px] font-black">VELOCIDAD</Badge>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Tiempo Promedio</p>
              <div className="text-4xl font-black tracking-tight">14d</div>
              <p className="text-xs text-muted-foreground font-medium mt-3">Promedio de cierre histórico</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Goal Widget */}
          <div className="glass-panel p-8 rounded-[2rem] min-h-[350px] flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button variant="ghost" size="sm" onClick={() => setIsConfiguringGoal(!isConfiguringGoal)} className="h-8 w-8 p-0">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Meta Mensual
              </h3>
              {!isConfiguringGoal && (
                <p className="text-xs text-muted-foreground">Progreso de {goalLabel}</p>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center">
              {isConfiguringGoal ? (
                <div className="w-full max-w-xs space-y-4 bg-background/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Objetivo</label>
                    <Select value={goalType} onValueChange={(val: 'sales' | 'rentals') => setGoalType(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Ventas</SelectItem>
                        <SelectItem value="rentals">Alquileres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Numérica</label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min="1" value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} />
                    </div>
                  </div>
                  <Button onClick={handleSaveGoal} className="w-full gap-2">
                    <Save className="h-4 w-4" /> Guardar Cambios
                  </Button>
                </div>
              ) : (
                <div className="relative w-48 h-48">
                  {/* Circular Progress Background */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-muted/20"
                    />
                    {/* Progress */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88" // Radius 88 -> Circumference ~553
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={553}
                      strokeDashoffset={553 - (553 * goalPercentage) / 100}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-foreground">{goalPercentage}%</span>
                    <span className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wide">{currentSales} / {goalTarget}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2rem] min-h-[350px] flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Distribución de Fuentes
            </h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.leadsBySource || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.leadsBySource || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '1rem', color: 'hsl(var(--popover-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
