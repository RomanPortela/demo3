'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle2, AlertCircle, Loader2, ArrowUpRight, ExternalLink, Settings, Key, User, Lock, Link as LinkIcon } from 'lucide-react';
import { Property } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortalCredentials, useUpsertPortalCredentials } from "@/lib/supabase/portal-queries";
import { useUpdateProperty } from "@/lib/supabase/queries";

interface PortalesFormProps {
    property?: Property;
}

export function PortalesForm({ property }: PortalesFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // ZonaProp Credentials
    const { data: zpCredentials, isLoading: loadingZp } = usePortalCredentials('zonaprop');

    // Mercado Libre Credentials
    const { data: meliCredentials, isLoading: loadingMeli } = usePortalCredentials('mercadolibre');

    const upsertCreds = useUpsertPortalCredentials();
    const { mutate: updateProperty } = useUpdateProperty();

    const [publishingPortal, setPublishingPortal] = React.useState<string | null>(null);

    // Check for success param from redirect
    React.useEffect(() => {
        if (searchParams?.get('success') === 'mercadolibre') {
            toast.success("Mercado Libre conectado exitosamente");
            queryClient.invalidateQueries({ queryKey: ['portal_credentials'] });
            router.replace(window.location.pathname); // Clean URL
        }
    }, [searchParams, queryClient, router]);

    // ZonaProp Status
    const zonapropStatus = property?.zonaprop_status || 'idle';
    const zonapropUrl = property?.zonaprop_url;

    // Login Dialog State (ZonaProp)
    const [isLoginOpen, setIsLoginOpen] = React.useState(false);
    const [loginData, setLoginData] = React.useState({ username: '', password: '' });

    React.useEffect(() => {
        if (zpCredentials) {
            setLoginData({ username: zpCredentials.username, password: '(guardado)' });
        }
    }, [zpCredentials]);

    // --- ZONAPROP HANDLERS ---
    const handleSaveZpCredentials = async () => {
        if (!loginData.username || !loginData.password) {
            toast.error("Complete todos los campos");
            return;
        }

        const isUpdatingCached = loginData.password === '(guardado)';
        const finalPassword = isUpdatingCached ? zpCredentials?.password : loginData.password;

        if (!finalPassword) {
            toast.error("Contraseña no encontrada");
            return;
        }

        try {
            await upsertCreds.mutateAsync({
                portal_name: 'zonaprop',
                username: loginData.username,
                password: finalPassword,
                is_active: true
            });
            toast.success("Credenciales de ZonaProp guardadas");
            setIsLoginOpen(false);
        } catch (error: any) {
            console.error('Error saving credentials:', error);
            const msg = error.message || "Error desconocido";
            toast.error(`Error al guardar: ${msg}`);
        }
    };

    const handlePublishZonaProp = async () => {
        if (!property?.id) {
            toast.error("Guarde la propiedad antes de publicar");
            return;
        }

        if (!zpCredentials) {
            setIsLoginOpen(true);
            toast.error("Debe configurar sus credenciales de ZonaProp primero");
            return;
        }

        setPublishingPortal('zonaprop');
        try {
            const response = await fetch('/api/portals/zonaprop/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    credentialsId: zpCredentials.id
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Portal Error");

            router.refresh();
            await queryClient.invalidateQueries({ queryKey: ['properties'] });
            if (property?.id) {
                await queryClient.invalidateQueries({ queryKey: ['property', property.id] });
            }

            toast.success("Propiedad publicada exitosamente en ZonaProp");

        } catch (error: any) {
            toast.error(`Error al publicar: ${error.message}`);
        } finally {
            setPublishingPortal(null);
        }
    };

    // --- MERCADO LIBRE HANDLERS ---
    const handleConnectMeli = async () => {
        try {
            const response = await fetch('/api/portals/mercadolibre/auth/url');
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error("Error al obtener URL de autorización");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const handlePublishMeli = async () => {
        if (!property?.id) {
            toast.error("Guarde la propiedad antes de publicar");
            return;
        }

        if (!meliCredentials) {
            toast.error("Debe conectar Mercado Libre primero");
            return;
        }

        setPublishingPortal('mercadolibre');
        try {
            const response = await fetch('/api/portals/mercadolibre/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: property.id
                })
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Sesión expirada. Por favor reconecte Mercado Libre.");
                    // Optionally trigger reconnect flow info
                }
                throw new Error(result.details || "Portal Error");
            }

            toast.success("Propiedad publicada en Mercado Libre");

            // Save the update locally (MeLi ID) if needed or just rely on manual refresh
            if (result.permalink) {
                // If we want to store the URL, we might need a DB update or the API already did it?
                // The API currently doesn't update the property table with the URL, strictly speaking.
                // Let's manually update the description or a note for now if not part of schema, 
                // OR better, we assume the user will see it in MeLi.
                // Ideally, we add `mercadolibre_url` to schema. For now, showing toast is good.
                window.open(result.permalink, '_blank');
            }

        } catch (error: any) {
            console.error(error);
            toast.error(`Error al publicar: ${error.message}`);
        } finally {
            setPublishingPortal(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-black tracking-tight">Portales Inmobiliarios</h3>
                <p className="text-sm text-muted-foreground font-medium">Gestiona la visibilidad de esta propiedad en plataformas externas.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">

                {/* --- MERCADO LIBRE CARD --- */}
                <Card className="p-6 bg-background/40 border-muted rounded-[2rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-[#FFE600]/50 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-[#FFE600] shadow-sm flex items-center justify-center p-2 border border-[#FFE600] group-hover:scale-110 transition-transform shrink-0">
                            <img src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png" alt="MercadoLibre" className="w-full h-auto object-contain mix-blend-multiply" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-lg tracking-tight">Mercado Libre</h4>
                                {meliCredentials ? (
                                    <Badge variant="secondary" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20 h-5 font-bold uppercase tracking-widest">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Conectado
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[9px] text-muted-foreground border-muted h-5 font-bold uppercase tracking-widest">
                                        No Conectado
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                {meliCredentials ? `Cuenta: ${meliCredentials.username}` : 'Publica tus propiedades en el marketplace líder.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!meliCredentials ? (
                            <Button
                                onClick={handleConnectMeli}
                                className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black rounded-xl px-6 h-11 font-bold flex gap-2 shadow-lg shadow-[#FFE600]/20 transition-all active:scale-95"
                            >
                                <LinkIcon className="h-4 w-4" />
                                Conectar Cuenta
                            </Button>
                        ) : (
                            <Button
                                onClick={handlePublishMeli}
                                disabled={publishingPortal === 'mercadolibre'}
                                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-11 font-black flex gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                {publishingPortal === 'mercadolibre' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpRight className="h-4 w-4" />
                                        Publicar
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* --- ZONAPROP CARD --- */}
                <Card className="p-6 bg-background/40 border-muted rounded-[2rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2 border border-muted group-hover:scale-110 transition-transform shrink-0">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6s7r7u8H1j9I7z_A6q1S6l1S6l1S6l1S6l1S6l1S6l1S6l1S6" alt="ZonaProp" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-lg tracking-tight">ZonaProp</h4>
                                <Badge variant="outline" className={cn(
                                    "text-[9px] font-black uppercase tracking-widest h-5",
                                    zonapropStatus === 'published' ? "text-green-500 border-green-500/20 bg-green-500/5" : "text-muted-foreground border-muted"
                                )}>
                                    {zonapropStatus === 'published' ? 'Publicado' : 'No Publicado'}
                                </Badge>
                                {zpCredentials && (
                                    <Badge variant="secondary" className="text-[8px] bg-primary/10 text-primary border-none h-5">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Sesión Guardada
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                {zpCredentials ? `Conectado como ${zpCredentials.username}` : 'Requiere configuración de acceso.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-muted/50"
                            onClick={() => setIsLoginOpen(true)}
                        >
                            <Settings className="h-5 w-5 text-muted-foreground" />
                        </Button>

                        {zonapropStatus === 'published' ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="rounded-xl font-bold h-11 px-6 border-muted bg-background/50 hover:bg-muted/30"
                                    onClick={() => window.open(zonapropUrl, '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Ver Aviso
                                </Button>
                                <Button
                                    onClick={() => updateProperty({ id: property?.id, zonaprop_status: 'idle' } as any)}
                                    className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl font-bold h-11 px-6 border-none"
                                >
                                    Desvincular
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handlePublishZonaProp}
                                disabled={publishingPortal === 'zonaprop'}
                                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-11 font-black flex gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                {publishingPortal === 'zonaprop' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpRight className="h-4 w-4" />
                                        Publicar Ahora
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Argenprop Placeholder */}
                <Card className="p-6 bg-muted/5 border-muted border-dashed rounded-[2rem] flex items-center justify-between gap-6 opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/50 flex items-center justify-center p-2 border border-muted grayscale">
                            <img src="https://www.argenprop.com/favicon.ico" alt="Argenprop" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg tracking-tight">Argenprop</h4>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Portal no conectado.</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="rounded-xl font-bold h-11 px-6 bg-muted/20">
                        Vincular Portal
                    </Button>
                </Card>
            </div>

            {/* Login Dialog (ZONAPROP) */}
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Conectar ZonaProp</DialogTitle>
                        <DialogDescription className="font-medium">
                            Ingresa tus credenciales para mantener la conexión activa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuario / Email</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    placeholder="email@example.com"
                                    className="pl-10 rounded-xl h-12 bg-muted/20 border-none"
                                    value={loginData.username}
                                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 rounded-xl h-12 bg-muted/20 border-none"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsLoginOpen(false)} className="rounded-xl h-12">Cancelar</Button>
                        <Button
                            onClick={handleSaveZpCredentials}
                            disabled={upsertCreds.isPending}
                            className="bg-primary rounded-xl h-12 px-8 font-bold"
                        >
                            {upsertCreds.isPending ? "Guardando..." : "Guardar y Conectar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publication Tips */}
            <div className="p-6 bg-primary/5 border-primary/10 rounded-[2rem] flex flex-col gap-4">
                <div className="flex gap-4">
                    <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div className="space-y-1">
                        <h5 className="font-bold text-sm">Consejos de publicación</h5>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc ml-4">
                            <li>Asegúrate de que la dirección sea exacta para mejorar el posicionamiento.</li>
                            <li>Las propiedades con más de 10 fotos reciben un 40% más de consultas.</li>
                            <li>Completa todas las características técnicas (m², ambientes, antigüedad).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

