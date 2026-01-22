'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User, Bell } from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';

export function Header() {
    const { profile, signOut } = useAuth();

    return (
        <header className="flex h-20 items-center justify-between glass-panel px-8 z-10">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-foreground">
                        Hola, {profile?.full_name || profile?.email?.split('@')[0] || 'Usuario'} 👋
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {profile?.role || 'Agente'} | InmoAria
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />

                <div className="h-8 w-[1px] bg-border/50 mx-2" />

                <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50 relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                                <AvatarFallback>
                                    {(profile?.full_name || profile?.email || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
