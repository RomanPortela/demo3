'use client';

import React, { useState } from 'react';
import { useDocuments, useUploadDocument, useUpdateDocumentStatus, useDeleteDocument } from '@/lib/supabase/document-queries';
import { Document, DocumentType, DocumentStatus } from '@/types';
import {
    FileText,
    Upload,
    MoreVertical,
    Download,
    Eye,
    History,
    CheckCircle2,
    Clock,
    AlertCircle,
    FilePlus,
    X,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface DocumentSectionProps {
    entityType: 'client' | 'property' | 'operation' | 'rental';
    entityId: number;
    title?: string;
    requiredTypes?: DocumentType[];
}

const TYPE_LABELS: Record<DocumentType, string> = {
    boleto: 'Boleto',
    reserva: 'Reserva',
    contrato: 'Contrato',
    señal: 'Señal',
    pdf_firmado: 'PDF Firmado',
    identidad: 'Identidad',
    garantia: 'Garantía',
    otro: 'Otro'
};

export function DocumentSection({ entityType, entityId, title = "Documentación", requiredTypes = [] }: DocumentSectionProps) {
    const { data: documents = [], isLoading } = useDocuments(entityType, entityId);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const updateStatus = useUpdateDocumentStatus();
    const deleteDoc = useDeleteDocument();

    const getStatusIcon = (status: DocumentStatus) => {
        switch (status) {
            case 'firmado': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'en_revision': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'vencido': return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <FileText className="h-4 w-4 text-muted-foreground" />;
        }
    };

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

    const missingRequired = requiredTypes.filter(type => !documents.some(doc => doc.type === type));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {title}
                </h3>
                <Button size="sm" onClick={() => setIsUploadOpen(true)} className="rounded-xl gap-2 font-bold">
                    <Upload className="h-4 w-4" /> Subir
                </Button>
            </div>

            {missingRequired.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-amber-700 uppercase tracking-tight">Documentación Faltante</p>
                        <p className="text-[10px] text-amber-600 font-bold">
                            Pendiente: {missingRequired.map((t: any) => TYPE_LABELS[t as DocumentType]).join(', ')}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Cargando documentos...</div>
                ) : documents.length === 0 ? (
                    <div className="p-12 border-2 border-dashed rounded-[2rem] text-center space-y-3 bg-muted/10">
                        <FilePlus className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
                        <p className="text-sm font-bold text-muted-foreground">Sin documentos asociados</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <Card key={doc.id} className="border-none bg-muted/30 rounded-2xl overflow-hidden hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm">
                                    {getStatusIcon(doc.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">{doc.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px] uppercase h-5 font-black">{doc.type}</Badge>
                                        <span className="text-[10px] text-muted-foreground font-bold">
                                            {format(new Date(doc.created_at), "d 'de' MMM, HH:mm", { locale: es })}
                                        </span>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl">
                                        <DropdownMenuItem onClick={() => handleDownload(doc)} className="gap-2 font-bold cursor-pointer">
                                            <Download className="h-4 w-4" /> Descargar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 font-bold cursor-pointer">
                                            <History className="h-4 w-4" /> Historial
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => updateStatus.mutate({ id: doc.id, status: 'firmado' })}
                                            className="text-emerald-500 gap-2 font-bold cursor-pointer"
                                        >
                                            Marcar como Firmado
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setDocToDelete(doc)}
                                            className="text-rose-500 gap-2 font-bold cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <DocumentUploadDialog
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                entityType={entityType}
                entityId={entityId}
            />

            <Dialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
                <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-rose-500">¿Eliminar Documento?</DialogTitle>
                        <DialogDescription className="font-bold">
                            "{docToDelete?.name}" será removido de la vista activa pero permanecerá en los registros de auditoría.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex gap-3">
                        <Button variant="ghost" onClick={() => setDocToDelete(null)} className="flex-1 rounded-2xl font-bold">
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (docToDelete) {
                                    deleteDoc.mutate(docToDelete.id, {
                                        onSuccess: () => setDocToDelete(null)
                                    });
                                }
                            }}
                            className="flex-1 rounded-2xl font-black bg-rose-500 hover:bg-rose-600"
                            disabled={deleteDoc.isPending}
                        >
                            {deleteDoc.isPending ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DocumentUploadDialog({ open, onOpenChange, entityType, entityId }: any) {
    const uploadDoc = useUploadDocument();
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [type, setType] = useState<DocumentType>('otro');

    const handleUpload = async () => {
        if (!file || !name) {
            toast.error("Complete todos los campos");
            return;
        }

        uploadDoc.mutate({
            file,
            name,
            type,
            status: 'borrador',
            entityType,
            entityId
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setFile(null);
                setName('');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Subir Documento</DialogTitle>
                    <DialogDescription className="font-bold">Asociado a {entityType} ID: {entityId}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black opacity-50">Archivo</Label>
                        <div
                            className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center cursor-pointer transition-all ${file ? 'border-primary bg-primary/5' : 'hover:bg-muted/50 border-muted-foreground/20'}`}
                            onClick={() => window.document.getElementById('file-upload')?.click()}
                        >
                            {file ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-[10px] opacity-50">{(file.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="rounded-full">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground opacity-30" />
                                    <p className="text-xs font-bold text-muted-foreground">Click para seleccionar archivo</p>
                                </div>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const selected = e.target.files?.[0];
                                    if (selected) {
                                        setFile(selected);
                                        if (!name) setName(selected.name);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black opacity-50">Nombre del Documento</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-muted/30 border-none rounded-xl h-10 font-bold"
                                placeholder="Ej: Contrato de Alquiler P12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black opacity-50">Tipo</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger className="bg-muted/30 border-none rounded-xl h-10 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                    <SelectItem value="reserva">Reserva</SelectItem>
                                    <SelectItem value="contrato">Contrato</SelectItem>
                                    <SelectItem value="señal">Señal</SelectItem>
                                    <SelectItem value="pdf_firmado">PDF Firmado</SelectItem>
                                    <SelectItem value="identidad">Identidad</SelectItem>
                                    <SelectItem value="garantia">Garantía</SelectItem>
                                    <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-2xl font-bold">Cancelar</Button>
                    <Button
                        disabled={uploadDoc.isPending || !file}
                        onClick={handleUpload}
                        className="flex-1 rounded-2xl font-black"
                    >
                        {uploadDoc.isPending ? "Procesando..." : "Confirmar Carga"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
