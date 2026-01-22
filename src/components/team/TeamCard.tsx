import { Profile } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamCardProps {
    profile: Profile;
    onEdit?: (profile: Profile) => void;
}

export function TeamCard({ profile, onEdit }: TeamCardProps) {
    const roleConfig = {
        ADMIN: { color: "text-purple-500", bg: "bg-purple-500/10", label: "Administrador" },
        CAPTADOR: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Captador" },
        AGENTE: { color: "text-green-500", bg: "bg-green-500/10", label: "Agente" }
    };

    return (
        <Card
            className="glass-card cursor-pointer group relative overflow-hidden transition-all hover:-translate-y-1"
            onClick={() => onEdit?.(profile)}
        >
            <CardHeader className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl font-black text-primary shadow-inner">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        (profile.full_name || profile.email).substring(0, 2).toUpperCase()
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold text-lg truncate max-w-[200px]">
                        {profile.full_name || "Sin nombre"}
                    </h3>
                    <Badge variant="secondary" className={cn("text-[10px] h-5 border-none font-bold uppercase tracking-wider", roleConfig[profile.role].bg, roleConfig[profile.role].color)}>
                        {roleConfig[profile.role].label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/30 p-2 rounded-lg">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{profile.email}</span>
                </div>

                {profile.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/30 p-2 rounded-lg">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="truncate">{profile.phone}</span>
                    </div>
                )}
            </CardContent>
            {/* Hover effect highlight */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Card>
    );
}
