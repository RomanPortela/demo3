'use client';

import React from 'react';
import { usePropertyAlerts, PropertyAlert } from '@/lib/supabase/property-alerts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyAlertsProps {
    propertyId: number;
}

export function PropertyAlerts({ propertyId }: PropertyAlertsProps) {
    const { data: alerts, isLoading } = usePropertyAlerts(propertyId);

    if (isLoading || !alerts || alerts.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    variant={alert.type === 'critical' ? 'destructive' : 'default'}
                    className={cn(
                        "rounded-3xl border-2 transition-all hover:shadow-lg",
                        alert.type === 'critical'
                            ? "bg-red-500/5 border-red-500/20"
                            : "bg-amber-500/5 border-amber-500/20"
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "p-2 rounded-2xl shrink-0 mt-1",
                            alert.type === 'critical' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                        )}>
                            {alert.type === 'critical' ? <AlertCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <AlertTitle className="text-sm font-black uppercase tracking-widest mb-1">
                                {alert.title}
                            </AlertTitle>
                            <AlertDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
                                {alert.description}
                            </AlertDescription>
                            {alert.action && (
                                <div className="mt-3 flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                                        Acción sugerida
                                    </span>
                                    <p className="text-[11px] font-bold text-primary">
                                        {alert.action}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Alert>
            ))}
        </div>
    );
}
