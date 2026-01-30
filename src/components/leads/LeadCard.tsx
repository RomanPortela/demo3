'use client';

import { type Lead } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Calendar, DollarSign, User, MessageCircle, Clock, Trash2, Edit2, Zap, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface LeadCardProps {
    lead: Lead;
    onEdit?: (lead: Lead) => void;
}

export function LeadCard({ lead, onEdit }: LeadCardProps) {
    const priorityColors: Record<string, string> = {
        'Alto': "bg-rose-500 text-white shadow-rose-200",
        'Medio': "bg-amber-500 text-white shadow-amber-200",
        'Bajo': "bg-emerald-500 text-white shadow-emerald-200",
        'Exploratorio': "bg-indigo-500 text-white shadow-indigo-200",
    };

    const sourceColors: Record<string, string> = {
        whatsapp: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20",
        email: "bg-blue-100 text-blue-600 border-blue-200",
        portal: "bg-purple-100 text-purple-600 border-purple-200",
        referral: "bg-orange-100 text-orange-600 border-orange-200",
    };

    const timeAgo = formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es });
    const fullName = lead.full_name || "Lead sin nombre";

    return (
        <Card
            className="group relative bg-white hover:shadow-2xl hover:shadow-black/5 rounded-3xl border border-border/40 transition-all duration-300 cursor-grab active:cursor-grabbing hover:-translate-y-1 overflow-hidden"
            onClick={() => onEdit?.(lead)}
        >
            {/* Priority Indicator Dot */}
            <div className={cn(
                "absolute top-5 left-5 h-2 w-2 rounded-full shadow-lg",
                priorityColors[lead.interest_level || 'Medio']
            )} />

            <div className="p-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="pl-6 space-y-1">
                        <h4 className="font-black text-lg tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight truncate max-w-[180px]">
                            {fullName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                            <Clock className="h-3 w-3" />
                            {timeAgo}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest border-none px-2.5 h-6", sourceColors[lead.source || 'portal'])}>
                        {lead.source || 'S/F'}
                    </Badge>
                    {lead.max_budget && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 font-black text-[9px] uppercase tracking-widest border-none px-2.5 h-6">
                            ${lead.max_budget.toLocaleString()}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dashed border-border/50">
                    <div className="flex -space-x-2">
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                            {lead.assigned_agent_id ? <User className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full hover:bg-emerald-500 hover:text-white transition-all bg-emerald-50 text-emerald-600"
                        >
                            <MessageCircle className="h-5 w-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full hover:bg-primary hover:text-white transition-all bg-primary/5 text-primary"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hover highlight line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Card>
    );
}
