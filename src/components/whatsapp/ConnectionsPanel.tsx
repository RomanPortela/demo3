import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckSquare, FileText, Link as LinkIcon, Plus, X } from "lucide-react";

interface ConnectionsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConnectionsPanel({ isOpen, onClose }: ConnectionsPanelProps) {
    if (!isOpen) return null;

    return (
        <div className="w-[300px] xl:w-[350px] flex flex-col border-l border-border/40 bg-white/50 backdrop-blur-3xl h-full shrink-0 animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground">Connections</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="tasks" className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                    <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-4 border-b border-border/40 pb-px rounded-none">
                        <TabsTrigger
                            value="tasks"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground"
                        >
                            Tasks
                        </TabsTrigger>
                        <TabsTrigger
                            value="docs"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground"
                        >
                            Docs
                        </TabsTrigger>
                        <TabsTrigger
                            value="links"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground"
                        >
                            Links
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <TabsContent value="tasks" className="mt-0 space-y-4 p-1">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-sm font-bold text-foreground">Next Steps</h4>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                <Plus className="h-3 w-3" /> Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {[
                                { title: "Send property proposal", due: "Today", priority: "high" },
                                { title: "Schedule viewing", due: "Tomorrow", priority: "medium" },
                                { title: "Update client requirements", due: "in 2 days", priority: "low" }
                            ].map((task, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-xl border border-border/50 flex flex-col gap-1 hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                                        <div className={cn("h-1.5 w-1.5 rounded-full mt-1",
                                            task.priority === 'high' ? "bg-rose-500" :
                                                task.priority === 'medium' ? "bg-amber-500" : "bg-emerald-500"
                                        )} />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium">Due {task.due}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-0 h-9 text-xs font-bold uppercase tracking-wide">
                            View All Tasks
                        </Button>
                    </TabsContent>

                    <TabsContent value="docs" className="mt-0 space-y-3">
                        <div className="rounded-xl border border-border/50 bg-white p-3 shadow-sm flex items-center gap-3 hover:border-primary/20 transition-all cursor-pointer">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Property Details.pdf</p>
                                <p className="text-[10px] text-muted-foreground">1.2 MB • PDF</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full text-xs font-medium border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary">
                            <Plus className="h-3 w-3 mr-2" />
                            Link Document
                        </Button>
                    </TabsContent>

                    <TabsContent value="links" className="mt-0 space-y-3">
                        <div className="rounded-xl border border-border/50 bg-white p-3 shadow-sm flex items-center gap-3 hover:border-primary/20 transition-all cursor-pointer">
                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <LinkIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Zonaprop Listing</p>
                                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">zonaprop.com/propiedades/...</p>
                            </div>
                        </div>
                    </TabsContent>
                </ScrollArea>

                {/* Bottom Actions or Summary could go here */}
            </Tabs>
        </div>
    );
}
