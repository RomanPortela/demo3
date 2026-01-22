'use client';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProfiles } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import { useState } from "react";
import { TeamCard } from "@/components/team/TeamCard";
import { TeamDialog } from "@/components/team/TeamDialog";
import { Profile } from "@/types";

export default function TeamPage() {
    const { data: profiles, isLoading } = useProfiles();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>();

    const handleEdit = (profile: Profile) => {
        setSelectedProfile(profile);
        setIsDialogOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Equipo</h1>
                        <p className="text-muted-foreground font-medium">Gestión de miembros y roles.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 rounded-3xl bg-card/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-8">
                        {profiles?.map((profile) => (
                            <TeamCard
                                key={profile.user_id}
                                profile={profile}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}

                <TeamDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    profile={selectedProfile}
                />
            </div>
        </DashboardLayout>
    );
}
