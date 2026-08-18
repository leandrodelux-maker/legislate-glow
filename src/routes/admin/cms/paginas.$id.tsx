import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, GripVertical, Trash2, ArrowUp, ArrowDown, Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cms/paginas/$id")({
  component: PageEditor,
});

type Bloco = {
  id: string;
  pagina_id: string;
  tipo: string;
  conteudo: any;
  ordem: number;
};

const BLOCK_TYPES = [
  { value: "heading", label: "Título" },
  { value: "text", label: "Texto" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "button", label: "Botão" },
  { value: "divider", label: "Divisor" },
  { value: "html", label: "HTML Customizado" },
];

function PageEditor() {
  const { id } = useParams({ from: "/admin/cms/paginas/$id" });
  const [pagina, setPagina] = useState<any>(null);
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, b] = await Promise.all([
      supabase.from("paginas").select("*").eq("id", id).single(),
      supabase.from("paginas_blocos").select("*").eq("pagina_id", id).order("ordem"),
    ]);
    setPagina(p.data);
    setBlocos((b.data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const addBlock = async (tipo: string) => {
    const { data, error } = await supabase
      .from("paginas_blocos")
      .insert({ pagina_id: id, tipo, conteudo: defaultContent(tipo), ordem: blocos.length })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setBlocos([...blocos, data as Bloco]);
  };

  const removeBlock = async (bid: string) => {
    await supabase.from("paginas_blocos").delete().eq("id", bid);
    setBlocos(blocos.filter((b) => b.id !== bid));
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocos.length) return;
    const reordered = [...blocos];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setBlocos(reordered);
    await Promise.all(
      reordered.map((b, i) => supabase.from("paginas_blocos").update({ ordem: i }).eq("id", b.id)),
    );
  };

  const updateBlock = (bid: string, conteudo: any) => {
    setBlocos(blocos.map((b) => (b.id === bid ? { ...b, conteudo } : b)));
  };

  const saveAll = async () => {
    setSaving(true);
    await Promise.all(blocos.map((b) => supabase.from("paginas_blocos").update({ conteudo: b.conteudo }).eq("id", b.id)));
    setSaving(false);
    toast.success("Página salva!");
  };

  if (loading) {
    return <div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!pagina) return <p>Página não encontrada.</p>;

  return (
    <div className="space-y-6 animate-[fade-up_0.4s_ease-out]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/cms/paginas"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">{pagina.titulo}</h1>
            <p className="text-sm text-muted-foreground">/{pagina.slug} · {blocos.length} blocos</p>
          </div>
        </div>
        <Button onClick={saveAll} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-3">
          {blocos.length === 0 && (
            <Card className="p-10 text-center text-muted-foreground">
              Nenhum bloco ainda. Adicione blocos pela barra lateral.
            </Card>
          )}
          {blocos.map((b, idx) => (
            <Card key={b.id} className="p-4 group">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(idx, 1)} disabled={idx === blocos.length - 1}>
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                      {BLOCK_TYPES.find((t) => t.value === b.tipo)?.label ?? b.tipo}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBlock(b.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <BlockEditor bloco={b} onChange={(c) => updateBlock(b.id, c)} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 h-fit sticky top-20">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar Bloco</h3>
          <div className="space-y-1.5">
            {BLOCK_TYPES.map((t) => (
              <Button key={t.value} variant="outline" className="w-full justify-start" onClick={() => addBlock(t.value)}>
                {t.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function defaultContent(tipo: string) {
  switch (tipo) {
    case "heading": return { texto: "Título", nivel: "h2" };
    case "text": return { texto: "" };
    case "image": return { url: "", alt: "" };
    case "video": return { url: "" };
    case "button": return { texto: "Clique aqui", url: "", variant: "default" };
    case "divider": return {};
    case "html": return { html: "" };
    default: return {};
  }
}

function BlockEditor({ bloco, onChange }: { bloco: Bloco; onChange: (c: any) => void }) {
  const c = bloco.conteudo || {};
  switch (bloco.tipo) {
    case "heading":
      return (
        <div className="flex gap-2">
          <Select value={c.nivel || "h2"} onValueChange={(v) => onChange({ ...c, nivel: v })}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1</SelectItem>
              <SelectItem value="h2">H2</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
            </SelectContent>
          </Select>
          <Input value={c.texto || ""} onChange={(e) => onChange({ ...c, texto: e.target.value })} placeholder="Texto do título" />
        </div>
      );
    case "text":
      return <Textarea rows={3} value={c.texto || ""} onChange={(e) => onChange({ ...c, texto: e.target.value })} placeholder="Conteúdo do parágrafo..." />;
    case "image":
      return (
        <div className="space-y-2">
          <Input value={c.url || ""} onChange={(e) => onChange({ ...c, url: e.target.value })} placeholder="URL da imagem" />
          <Input value={c.alt || ""} onChange={(e) => onChange({ ...c, alt: e.target.value })} placeholder="Texto alternativo" />
        </div>
      );
    case "video":
      return <Input value={c.url || ""} onChange={(e) => onChange({ ...c, url: e.target.value })} placeholder="URL do vídeo (YouTube/Vimeo)" />;
    case "button":
      return (
        <div className="space-y-2">
          <Input value={c.texto || ""} onChange={(e) => onChange({ ...c, texto: e.target.value })} placeholder="Texto do botão" />
          <Input value={c.url || ""} onChange={(e) => onChange({ ...c, url: e.target.value })} placeholder="URL de destino" />
        </div>
      );
    case "divider":
      return <p className="text-xs text-muted-foreground italic">— linha divisória —</p>;
    case "html":
      return <Textarea rows={5} value={c.html || ""} onChange={(e) => onChange({ ...c, html: e.target.value })} placeholder="<div>HTML customizado...</div>" className="font-mono text-xs" />;
    default:
      return null;
  }
}
