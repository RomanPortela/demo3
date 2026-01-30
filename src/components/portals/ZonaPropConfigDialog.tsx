'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface ZonaPropConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ZonaPropConfigDialog({ open, onOpenChange, onSuccess }: ZonaPropConfigDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [formData, setFormData] = React.useState({
        user: '',
        password: '',
        autoPublish: true,
        includeMultimedia: true
    });

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulating API connection
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success("Conectado exitosamente con ZonaProp");
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al conectar con ZonaProp. Verifica tus credenciales.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 border-none bg-background/60 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="flex flex-col relative">
                    {/* Header */}
                    <div className="px-8 py-6 bg-primary/5 border-b border-muted/10">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black tracking-tight">Vincular ZonaProp</DialogTitle>
                                    <DialogDescription className="text-xs font-medium">Ingresa tus credenciales para sincronizar tu catálogo.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleConnect}>
                        <div className="p-8 space-y-6">
                            {/* Security Note */}
                            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                <p className="text-[11px] font-bold text-green-600 leading-tight">
                                    Tus credenciales están encriptadas y se utilizan exclusivamente para la sincronización de propiedades siguiendo los protocolos de seguridad de ZonaProp.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Usuario / Email</Label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="tu-usuario@inmobiliaria.com"
                                            className="pl-11 h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium"
                                            value={formData.user}
                                            onChange={e => setFormData({ ...formData, user: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contraseña</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••••••"
                                            className="pl-11 h-12 bg-background/50 border-muted rounded-2xl focus:ring-primary/20 transition-all font-medium"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="space-y-4 pt-4 border-t border-muted/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Preferencias de Publicación</p>

                                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold">Publicación Automática</p>
                                        <p className="text-[10px] text-muted-foreground">Publicar nuevas propiedades inmediatamente.</p>
                                    </div>
                                    <Switch
                                        checked={formData.autoPublish}
                                        onCheckedChange={v => setFormData({ ...formData, autoPublish: v })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold">Incluir Multimedia</p>
                                        <p className="text-[10px] text-muted-foreground">Sincronizar fotos y videos automáticamente.</p>
                                    </div>
                                    <Switch
                                        checked={formData.includeMultimedia}
                                        onCheckedChange={v => setFormData({ ...formData, includeMultimedia: v })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-muted/20 bg-background/40 flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="flex-1 rounded-xl font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-xl font-black flex gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Conectando...
                                    </>
                                ) : (
                                    <>
                                        Confirmar Conexión
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
