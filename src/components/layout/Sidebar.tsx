'use client';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    BarChart3,
    UserCircle,
    FileText,
    Users2,
    CheckSquare,
    Lightbulb,
    ChevronLeft,
    ChevronRight,
    Home,
    CalendarDays,
    Globe,
    Key,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
    title: string;
    href: string;
    icon: any;
    roles: string[];
}

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'CAPTADOR', 'AGENTE'] },
    { title: 'Leads', href: '/leads', icon: Users, roles: ['ADMIN', 'AGENTE', 'CAPTADOR'] },
    { title: 'Propiedades', href: '/properties', icon: Home, roles: ['ADMIN', 'AGENTE', 'CAPTADOR'] },
    { title: 'Alquileres', href: '/rentals', icon: Key, roles: ['ADMIN', 'AGENTE', 'CAPTADOR'] },
    { title: 'Oportunidades', href: '/opportunities', icon: Lightbulb, roles: ['ADMIN', 'CAPTADOR', 'AGENTE'] },
    { title: 'Clientes', href: '/clients', icon: UserCircle, roles: ['ADMIN', 'AGENTE'] },
    { title: 'Tareas', href: '/tasks', icon: CheckSquare, roles: ['ADMIN', 'CAPTADOR', 'AGENTE'] },
    { title: 'WhatsApp', href: '/whatsapp', icon: MessageSquare, roles: ['ADMIN', 'CAPTADOR', 'AGENTE'] },
    { title: 'Tracking', href: '/tracking', icon: BarChart3, roles: ['ADMIN', 'AGENTE', 'CAPTADOR'] },
    { title: 'Calendario', href: '/calendar', icon: CalendarDays, roles: ['ADMIN', 'AGENTE', 'CAPTADOR'] },
    { title: 'Documentos', href: '/documents', icon: FileText, roles: ['ADMIN', 'AGENTE', 'CAPTADOR'] },
    { title: 'Portales', href: '/portals', icon: Globe, roles: ['ADMIN', 'AGENTE'] },
    { title: 'Contenido', href: '/content', icon: FileText, roles: ['ADMIN', 'CAPTADOR'] },
    { title: 'Equipo', href: '/team', icon: Users2, roles: ['ADMIN'] },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { profile } = useAuth();

    // Show all items for demo purposes, or fallback to permissive filtering
    const filteredItems = navItems; // .filter((item) => profile?.role === 'ADMIN' || item.roles.includes(profile?.role || ''));

    return (
        <aside
            className={cn(
                'relative flex flex-col transition-all duration-300 ease-in-out glass-panel h-screen z-20',
                collapsed ? 'w-16' : 'w-72'
            )}
        >
            <div className="flex h-20 items-center px-4 border-b border-border/50">
                <div className={cn("flex items-center gap-3 transition-all", collapsed && "opacity-0 invisible")}>
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                        <UserCircle className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight leading-none uppercase">
                            CRM
                        </span>
                        <span className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase mt-1">
                            InmoAria
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("hover:bg-accent/50 rounded-full transition-transform", !collapsed && "ml-auto")}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <ScrollArea className="flex-1 px-3 py-6">
                <nav className="flex flex-col gap-1.5">
                    {filteredItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative',
                                pathname === item.href
                                    ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]'
                                    : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                                pathname === item.href ? "text-primary" : "text-muted-foreground/70"
                            )} />
                            {!collapsed && <span>{item.title}</span>}
                            {pathname === item.href && !collapsed && (
                                <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    ))}
                </nav>
            </ScrollArea>
        </aside>
    );
}
