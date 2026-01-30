'use client';

import React, { useState } from 'react';
import { useDocuments, useUpdateDocumentStatus, useDeleteDocument } from '@/lib/supabase/document-queries';
import { Document, DocumentType, DocumentStatus } from '@/types';
import {
    FileText,
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Home,
    Key,
    Target,
    Calendar,
    ExternalLink,
    Trash2,
    File,
    Shield,
    History as HistoryIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const supabase = createClient();

const TYPE_COLORS: Record<DocumentType, string> = {
    boleto: 'bg-blue-100 text-blue-600',
    reserva: 'bg-emerald-100 text-emerald-600',
    contrato: 'bg-indigo-100 text-indigo-600',
    señal: 'bg-amber-100 text-amber-600',
    pdf_firmado: 'bg-rose-100 text-rose-600',
    identidad: 'bg-cyan-100 text-cyan-600',
    garantia: 'bg-violet-100 text-violet-600',
    otro: 'bg-gray-100 text-gray-600'
};

const ENTITY_ICONS: Record<string, any> = {
    client: User,
    property: Home,
    rental: Key,
    operation: Target
};

export function GlobalDocumentList() {
    const { data: documents = [], isLoading } = useDocuments();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const updateStatus = useUpdateDocumentStatus();
    const deleteDoc = useDeleteDocument();

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDownload = async (doc: Document) => {
        const { data, error } = await supabase.storage
            .from('documents')
            .download(doc.storage_path);

        if (error) {
            toast.error("Error al descargar: " + error.message);
            return;
        }

        const url = URL.createObjectURL(data);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = doc.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusStyle = (status: DocumentStatus) => {
        switch (status) {
            case 'firmado': return 'bg-emerald-500 text-white';
            case 'en_revision': return 'bg-amber-500 text-white';
            case 'vencido': return 'bg-rose-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="space-y-10">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/50 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Filtrar por nombre, cliente o propiedad..."
                        className="pl-12 h-14 bg-white/50 border-none rounded-2xl text-lg font-medium placeholder:text-muted-foreground/50 shadow-inner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-full border border-border/50">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'firmado', label: 'Firmados' },
                        { id: 'en_revision', label: 'Revisión' },
                        { id: 'vencido', label: 'Vencidos' }
                    ].map((f) => (
                        <Button
                            key={f.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilter(f.id)}
                            className={cn(
                                "rounded-full px-6 h-10 text-[11px] font-black uppercase tracking-widest transition-all",
                                statusFilter === f.id ? "bg-white text-primary shadow-xl shadow-black/5" : "text-muted-foreground hover:bg-white/50"
                            )}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[3rem] opacity-20 pointer-events-none" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden border border-white shadow-2xl shadow-black/5">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-muted/10 hover:bg-transparent bg-muted/5">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8 pl-10">Documento Principal</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8">Clasificación</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8">Entidad Asociada</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-8">Fecha Carga</TableHead>
                                <TableHead className="text-right py-8 pr-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <p className="font-black text-sm uppercase tracking-widest text-muted-foreground opacity-50">Accediendo al Repositorio...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDocuments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-6">
                                            <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center">
                                                <File className="h-10 w-10 text-muted-foreground/30" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-foreground">Bóveda Vacía</h4>
                                                <p className="text-sm text-muted-foreground font-medium mt-1">No se hallaron archivos que coincidan con los criterios.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDocuments.map((doc) => {
                                    const relation = doc.relations?.[0];
                                    const EntityIcon = relation ? ENTITY_ICONS[relation.entity_type] : FileText;

                                    return (
                                        <TableRow key={doc.id} className="border-muted/5 group transition-all hover:bg-primary/[0.02]">
                                            <TableCell className="py-6 pl-10 border-none">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative h-14 w-14 shrink-0">
                                                        <div className="absolute inset-0 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform" />
                                                        <div className="relative h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-border/50">
                                                            <FileText className="h-7 w-7 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-lg tracking-tight text-foreground group-hover:text-primary transition-colors leading-none">{doc.name}</span>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="px-1.5 py-0.5 rounded bg-muted text-[8px] font-black uppercase text-muted-foreground">v{doc.versions?.length || 1}.0</div>
                                                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Verified SHA-256</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-none">
                                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest border-none px-3 h-7 rounded-lg shadow-sm whitespace-nowrap", TYPE_COLORS[doc.type])}>
                                                    {doc.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="border-none">
                                                {relation && (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <EntityIcon className="h-3.5 w-3.5 text-gray-400" />
                                                            </div>
                                                            <span className="text-xs font-black text-foreground uppercase tracking-tight">{relation.entity_type}</span>
                                                        </div>
                                                        <span className="text-[9px] font-black text-muted-foreground opacity-40 uppercase tracking-widest ml-8">UID: #{relation.entity_id}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="border-none">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-2 w-2 rounded-full", getStatusStyle(doc.status).split(' ')[0])} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{doc.status.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="h-1 w-20 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={cn("h-full transition-all duration-1000", getStatusStyle(doc.status).split(' ')[0])} style={{ width: doc.status === 'firmado' ? '100%' : '60%' }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-none">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-foreground tabular-nums">{format(new Date(doc.created_at), "dd/MM/yyyy", { locale: es })}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">{format(new Date(doc.created_at), "HH:mm 'hs'", { locale: es })}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-10 border-none">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button onClick={() => handleDownload(doc)} variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100">
                                                        <Download className="h-5 w-5" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/5">
                                                                <MoreVertical className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-[2rem] border-none shadow-2xl p-3 min-w-[220px] bg-white/95 backdrop-blur-xl">
                                                            <DropdownMenuItem onClick={() => handleDownload(doc)} className="gap-3 font-black text-[10px] uppercase tracking-widest cursor-pointer rounded-2xl p-4 focus:bg-primary/5 focus:text-primary transition-all">
                                                                <Download className="h-4 w-4" /> Download Original
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-3 font-black text-[10px] uppercase tracking-widest cursor-pointer rounded-2xl p-4 focus:bg-primary/5 focus:text-primary transition-all">
                                                                <Eye className="h-4 w-4" /> Quick Preview
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-3 font-black text-[10px] uppercase tracking-widest cursor-pointer rounded-2xl p-4 focus:bg-primary/5 focus:text-primary transition-all">
                                                                <HistoryIcon className="h-4 w-4" /> Version Control
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-muted/50 my-2" />
                                                            <DropdownMenuItem
                                                                onClick={() => updateStatus.mutate({ id: doc.id, status: 'firmado' })}
                                                                className="gap-3 font-black text-[10px] uppercase tracking-widest cursor-pointer rounded-2xl p-4 focus:bg-emerald-50 text-emerald-600 transition-all"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" /> Approve & Sign
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setDocToDelete(doc)}
                                                                className="gap-3 font-black text-[10px] uppercase tracking-widest cursor-pointer rounded-2xl p-4 focus:bg-rose-50 text-rose-500 transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" /> Archive Asset
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
                <DialogContent className="max-w-md rounded-[3rem] border-none shadow-2xl p-10 bg-white/95 backdrop-blur-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
                    <DialogHeader className="gap-4">
                        <div className="h-20 w-20 rounded-3xl bg-rose-100 flex items-center justify-center mb-2 mx-auto">
                            <Trash2 className="h-10 w-10 text-rose-500" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-center tracking-tighter text-foreground">Archivar Documento</DialogTitle>
                        <DialogDescription className="font-bold text-center text-muted-foreground text-lg leading-relaxed">
                            Esta acción retirará el archivo de la vista pública. Permanecerá encriptado en el repositorio de seguridad por 10 años.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-10 flex flex-col gap-3">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (docToDelete) {
                                    deleteDoc.mutate(docToDelete.id, {
                                        onSuccess: () => setDocToDelete(null)
                                    });
                                }
                            }}
                            className="w-full h-16 rounded-2xl font-black text-base uppercase tracking-widest bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200"
                            disabled={deleteDoc.isPending}
                        >
                            {deleteDoc.isPending ? "Procesando..." : "Confirmar Archivo"}
                        </Button>
                        <Button variant="ghost" onClick={() => setDocToDelete(null)} className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                            Mantener Activo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
