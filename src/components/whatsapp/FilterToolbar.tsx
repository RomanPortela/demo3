import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, User, Home, Tag as TagIcon, Calendar, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/types";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useCreateTag, useDeleteTag } from "@/lib/supabase/queries";
import { useState } from "react";
import { toast } from "sonner";

interface FilterToolbarProps {
    search: string;
    setSearch: (s: string) => void;
    roleFilter: string;
    setRoleFilter: (r: string) => void;
    tagFilters: number[];
    setTagFilters: (tags: number[]) => void;
    allTags?: Tag[];
}

export function FilterToolbar({
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    tagFilters,
    setTagFilters,
    allTags
}: FilterToolbarProps) {
    const createTagMutation = useCreateTag();
    const deleteTagMutation = useDeleteTag();
    const [newTagName, setNewTagName] = useState("");

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            await createTagMutation.mutateAsync({
                name: newTagName,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
            });
            setNewTagName("");
            toast.success("Etiqueta creada");
        } catch (error) {
            toast.error("Error al crear etiqueta");
        }
    };

    const handleDeleteTag = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar esta etiqueta permanentemente?")) return;
        try {
            await deleteTagMutation.mutateAsync(id);
            toast.success("Etiqueta eliminada");
        } catch (error) {
            toast.error("Error al eliminar etiqueta");
        }
    };

    const activeFiltersCount = (roleFilter !== 'all' ? 1 : 0) + tagFilters.length;

    const toggleTag = (id: number) => {
        if (tagFilters.includes(id)) {
            setTagFilters(tagFilters.filter(t => t !== id));
        } else {
            setTagFilters([...tagFilters, id]);
        }
    };

    const clearFilters = () => {
        setRoleFilter('all');
        setTagFilters([]);
        setSearch("");
    };

    return (
        <div className="p-4 border-b border-border/40 bg-card/5 space-y-4">
            {/* Search and Manage Tags Row */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar chats o mensajes..."
                        className="pl-9 h-11 bg-background border-border/40 shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/10 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Filters Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-9 rounded-xl border-dashed gap-2 px-3 text-[11px] font-black uppercase tracking-wider transition-all",
                                activeFiltersCount > 0 ? "bg-primary/5 border-primary/40 text-primary" : "text-muted-foreground hover:border-primary/40"
                            )}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 rounded-full text-[10px] bg-primary text-primary-foreground font-black">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-3xl shadow-2xl border-border/40 backdrop-blur-xl bg-card/95" align="start">
                        <div className="space-y-5">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Rol del Lead</h4>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {[
                                        { id: 'all', label: 'Todos', icon: Filter, color: 'primary' },
                                        { id: 'propietario', label: 'Propietarios', icon: Home, color: 'orange' },
                                        { id: 'demandante', label: 'Demandantes', icon: User, color: 'blue' }
                                    ].map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => setRoleFilter(role.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                                                roleFilter === role.id
                                                    ? `bg-${role.color}-500/10 text-${role.color}-600 border-${role.color}-500/20`
                                                    : "bg-transparent text-muted-foreground border-transparent hover:bg-accent/50 hover:text-foreground"
                                            )}
                                        >
                                            <role.icon className="h-4 w-4" />
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {allTags && allTags.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Etiquetas</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {allTags.map(tag => (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                                                    tagFilters.includes(tag.id)
                                                        ? "bg-primary text-primary-foreground border-primary scale-105 active:scale-95"
                                                        : "bg-background text-muted-foreground border-border/50 hover:border-primary/40 hover:text-primary active:scale-95"
                                                )}
                                                style={!tagFilters.includes(tag.id) ? { borderLeft: `4px solid ${tag.color}` } : {}}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-border/40">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                                    onClick={clearFilters}
                                >
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 rounded-xl border-dashed p-0 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                        >
                            <TagIcon className="h-3.5 w-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-3xl shadow-2xl border-border/40 backdrop-blur-xl bg-card/95" align="start">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Gestionar Etiquetas</h4>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {allTags?.map(tag => (
                                    <div key={tag.id} className="flex items-center justify-between group bg-accent/30 p-2 rounded-xl border border-transparent hover:border-border/50 transition-all">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                                            <span className="text-xs font-bold">{tag.name}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteTag(tag.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {(!allTags || allTags.length === 0) && (
                                    <p className="text-[10px] text-muted-foreground italic text-center py-4">No hay etiquetas.</p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-border/40">
                                <div className="flex gap-1.5">
                                    <Input
                                        placeholder="Nueva..."
                                        className="h-9 text-xs rounded-xl bg-background border-border/40"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                                    />
                                    <Button
                                        size="icon"
                                        className="h-9 w-9 shrink-0 rounded-xl"
                                        onClick={handleCreateTag}
                                        disabled={!newTagName.trim() || createTagMutation.isPending}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Active Filter Badges */}
                <div className="flex gap-2 items-center flex-1 overflow-x-auto no-scrollbar">
                    {roleFilter !== 'all' && (
                        <Badge variant="secondary" className="h-9 gap-2 px-3 rounded-xl bg-primary/10 text-primary border border-primary/20 animate-in fade-in zoom-in duration-300 shadow-sm">
                            {roleFilter === 'propietario' ? <Home className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{roleFilter}</span>
                            <X className="h-3.5 w-3.5 cursor-pointer hover:bg-primary/20 rounded-full p-0.5" onClick={() => setRoleFilter('all')} />
                        </Badge>
                    )}

                    {tagFilters.map(tid => {
                        const tag = allTags?.find(t => t.id === tid);
                        if (!tag) return null;
                        return (
                            <Badge
                                key={tid}
                                variant="secondary"
                                className="h-9 gap-2 px-3 rounded-xl bg-background text-foreground border border-border/50 animate-in fade-in zoom-in duration-300 shadow-sm"
                                style={{ borderLeft: `4px solid ${tag.color}` }}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">{tag.name}</span>
                                <X className="h-3.5 w-3.5 cursor-pointer hover:bg-accent rounded-full p-0.5 transition-colors" onClick={() => toggleTag(tid)} />
                            </Badge>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
