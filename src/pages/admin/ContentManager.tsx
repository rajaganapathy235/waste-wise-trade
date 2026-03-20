import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, Plus, Edit2, Trash2, 
  Save, RefreshCw, Layers, Globe,
  Image as ImageIcon, Layout, Type, 
  Search, ShieldCheck, Sparkles, Zap,
  ChevronRight, ArrowUpRight, Check, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContentManager() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("banners");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("content")
        .select("*")
        .order("section", { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, value: any) => {
    try {
      const { error } = await (supabase as any)
        .from("content")
        .update({ value })
        .eq("id", id);

      if (error) throw error;
      toast.success("Content node updated successfully");
      fetchContent();
    } catch (error: any) {
      toast.error("Protocol violation: Update failed");
    }
  };

  const sections = Array.from(new Set(content.map(c => c.section)));

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Content Mesh</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Dynamic CMS • Platform Assets</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-black text-[10px] tracking-widest uppercase shadow-sm" onClick={fetchContent}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> RELOAD ASSETS
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <Plus className="h-4 w-4 mr-2" /> CREATE ENTRY
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-6">
            <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Asset Spectrum</p>
                <div className="space-y-2">
                    {sections.length === 0 ? (
                        <p className="text-xs text-slate-300 italic">No sections detected</p>
                    ) : (
                        sections.map(s => (
                            <button 
                                key={s} 
                                onClick={() => setActiveTab(s)}
                                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${activeTab === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {s}
                                <ChevronRight className="h-3 w-3" />
                            </button>
                        ))
                    )}
                </div>
            </div>
            
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white p-8 relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <Globe className="h-6 w-6 mb-4 opacity-40" />
                <h3 className="text-sm font-black tracking-tight mb-2 uppercase italic">Global Sync</h3>
                <p className="text-[10px] text-white/50 font-bold leading-relaxed mb-6">Modifications here propagate to all nodes in ~200ms.</p>
                <Badge className="bg-white/10 text-white font-black text-[8px] tracking-widest uppercase border-none">SYSTEM READY</Badge>
            </Card>
        </aside>

        <section className="lg:col-span-3 space-y-8">
            <div className="relative group max-w-md">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Locate asset via key or value..." 
                    className="pl-14 h-14 bg-white border-none rounded-2xl text-xs font-bold tracking-tight shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse border-none shadow-sm rounded-[2.5rem] bg-white h-40" />
                    ))
                ) : content.filter(c => c.section === activeTab).length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-100 opacity-20">
                        <Layers className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No active assets in this spectrum</p>
                    </div>
                ) : (
                    content.filter(c => c.section === activeTab).map((item) => (
                        <ContentNode key={item.id} item={item} onUpdate={handleUpdate} />
                    ))
                )}
            </div>
        </section>
      </div>
    </div>
  );
}

function ContentNode({ item, onUpdate }: { item: any, onUpdate: (id: string, value: any) => Promise<void> }) {
    const [jsonValue, setJsonValue] = useState(JSON.stringify(item.value, null, 2));
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        try {
            const parsed = JSON.parse(jsonValue);
            setIsSaving(true);
            await onUpdate(item.id, parsed);
            setIsEditing(false);
        } catch (e) {
            toast.error("Invalid JSON syntax");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group transition-all hover:shadow-xl">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                        {item.section === 'banners' ? <ImageIcon className="h-6 w-6" /> : <Type className="h-6 w-6" />}
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1.5 uppercase">{item.key}</CardTitle>
                        <Badge className="bg-slate-50 text-slate-300 border-none font-black text-[8px] tracking-widest px-2 py-0">REF: {item.id.slice(0, 8)}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button size="icon" className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" className="h-10 w-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Button size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                {isEditing ? (
                    <Textarea 
                        value={jsonValue} 
                        onChange={(e) => setJsonValue(e.target.value)}
                        className="font-mono text-xs bg-slate-50 border-none rounded-2xl h-40 focus:ring-1 ring-primary/20 shadow-inner p-4"
                    />
                ) : (
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <pre className="font-mono text-[10px] text-slate-500 overflow-x-auto whitespace-pre-wrap max-h-40 no-scrollbar">
                            {JSON.stringify(item.value, null, 2)}
                        </pre>
                    </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Protocol V.1 • JSON Manifest</p>
                    <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Last Modified: {new Date(item.updated_at).toLocaleTimeString()}</p>
                </div>
            </CardContent>
        </Card>
    );
}
