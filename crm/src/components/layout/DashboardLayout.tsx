'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DashboardLayout({
    children,
    noPadding = false
}: {
    children: React.ReactNode,
    noPadding?: boolean
}) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!user && typeof window !== 'undefined') {
        // In a real app we'd redirect to /login
        // For now, let's just render to avoid infinite loading if not logged in during development
        // redirect('/login');
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden relative z-10">
                <Header />
                <main className={cn(
                    "flex-1 overflow-hidden relative flex flex-col",
                    !noPadding && "p-8 overflow-y-auto custom-scrollbar"
                )}>
                    <div className={cn(
                        "flex-1 w-full mx-auto",
                        !noPadding && "max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8"
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
