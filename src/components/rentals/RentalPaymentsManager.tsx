'use client';

import React from 'react';
import { useRentalPayments, useUpdateRentalPayment } from "@/lib/supabase/queries";
import { type RentalPayment } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    DollarSign,
    Calendar,
    ArrowUpRight,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface RentalPaymentsManagerProps {
    contractId: number;
}

export function RentalPaymentsManager({ contractId }: RentalPaymentsManagerProps) {
    const { data: payments = [], isLoading } = useRentalPayments(contractId);
    const updatePayment = useUpdateRentalPayment();

    const handleCollect = (payment: RentalPayment) => {
        updatePayment.mutate({
            id: payment.id,
            status: 'cobrado',
            amount_collected: payment.amount_rent + (payment.amount_late_fees || 0),
            collected_at: new Date().toISOString(),
        }, {
            onSuccess: () => toast.success("Cobro registrado correctamente")
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Cronograma de Pagos</h3>
                </div>
            </div>

            <div className="space-y-3">
                {payments.map((payment) => (
                    <Card
                        key={payment.id}
                        className={cn(
                            "p-4 bg-background/50 border-muted/20 rounded-[2rem] transition-all group hover:bg-muted/5",
                            payment.status === 'cobrado' && "border-green-500/20 bg-green-500/5",
                            payment.status === 'atrasado' && "border-destructive/20 bg-destructive/5"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center",
                                    payment.status === 'cobrado' ? "bg-green-500/10 text-green-600" :
                                        payment.status === 'atrasado' ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                                )}>
                                    {payment.status === 'cobrado' ? <CheckCircle2 className="h-5 w-5" /> :
                                        payment.status === 'atrasado' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight">
                                        {format(new Date(payment.period), 'MMMM yyyy', { locale: es })}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-muted-foreground font-bold">VENCE: {format(new Date(payment.due_date), 'dd/MM/yy')}</span>
                                        {payment.status === 'cobrado' && (
                                            <span className="text-[9px] text-green-600 font-bold uppercase">
                                                COBRADO: {format(new Date(payment.collected_at || ''), 'dd/MM/yy')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm font-black">${payment.amount_rent.toLocaleString()}</p>
                                    {(payment.amount_late_fees || 0) > 0 && (
                                        <p className="text-[9px] text-destructive font-bold uppercase">MORA: +${payment.amount_late_fees}</p>
                                    )}
                                </div>

                                {payment.status !== 'cobrado' ? (
                                    <Button
                                        onClick={() => handleCollect(payment)}
                                        size="sm"
                                        className="rounded-xl h-8 font-black text-[10px] uppercase gap-2 bg-green-500 hover:bg-green-600"
                                    >
                                        <DollarSign className="h-3.5 w-3.5" /> Registrar Pago
                                    </Button>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase border-green-500/30 text-green-600 px-2 py-0">
                                            Liquidado
                                        </Badge>
                                        <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase">Neto Inmo: ${payment.agency_commission_amount}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
