import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/cms/RichTextEditor";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, Loader2, Eye, EyeOff, Star, Search, ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/admin/noticias")({
  component: AdminNoticiasPage,
});

type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string;
  imagem_url: string | null;
  categoria: string | null;
  categoria_id: string | null;
  autor: string | null;
  publicado: boolean;
  destaque: boolean;
  publicado_em: string | null;
  agendado_para: string | null;
  created_at: string;
};

type Categoria = { id: string; nome: string; slug: string; cor: string | null };

const emptyForm = (): Partial<Noticia> => ({
  titulo: "",
  slug: "",
  resumo: "",
  conteudo: "",
  imagem_url: null,
  categoria_id: null,
  categoria: null,
  autor: "",
  publicado: false,
  destaque: false,
  publicado_em: null,
  agendado_para: null,
});

function slugify(v: string) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function AdminNoticiasPage() {
  const [rows, setRows] = useState<Noticia[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Noticia | null>(null);
  const [form, setForm] = useState<Partial<Noticia>>(emptyForm());
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "publicadas" | "rascunhos">("todas");

  const load = async () => {
    setLoading(true);
    const [{ data: noticias, error }, { data: categorias }] = await Promise.all([
      supabase.from("noticias").select("*").order("created_at", { ascending: false }),
      supabase.from("noticias_categorias").select("id, nome, slug, cor").order("ordem"),
    ]);
    if (error) toast.error(`Falha ao carregar notícias: ${error.message}`);
    setRows((noticias as Noticia[]) ?? []);
    setCats((categorias as Categoria[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return rows.filter((r) => {
      if (filtro === "publicadas" && !r.publicado) return false;
      if (filtro === "rascunhos" && r.publicado) return false;
      if (!q) return true;
      return [r.titulo, r.resumo, r.categoria, r.autor, r.slug]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, busca, filtro]);

  const startNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const startEdit = (row: Noticia) => {
    setEditing(row);
    setForm({ ...row });
    setOpen(true);
  };

  const setField = <K extends keyof Noticia>(key: K, value: Noticia[K] | null) =>
    setForm((prev) => ({ ...prev, [key]: value as any }));

  const togglePublicado = async (row: Noticia) => {
    const publicado = !row.publicado;
    const { error } = await supabase
      .from("noticias")
      .update({
        publicado,
        publicado_em: publicado ? row.publicado_em ?? new Date().toISOString() : row.publicado_em,
      })
      .eq("id", row.id);
    if (error) return toast.error(`Erro ao publicar: ${error.message}`);
    toast.success(publicado ? "Notícia publicada no site" : "Notícia despublicada");
    load();
  };

  const toggleDestaque = async (row: Noticia) => {
    const { error } = await supabase
      .from("noticias")
      .update({ destaque: !row.destaque })
      .eq("id", row.id);
    if (error) return toast.error(`Erro: ${error.message}`);
    load();
  };

  const remove = async (row: Noticia) => {
    if (!confirm(`Excluir a notícia "${row.titulo}"?`)) return;
    const { error } = await supabase.from("noticias").delete().eq("id", row.id);
    if (error) return toast.error(`Erro ao excluir: ${error.message}`);
    toast.success("Notícia excluída");
    load();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo?.trim()) return toast.error("Informe o título");
    if (!form.conteudo?.trim()) return toast.error("Informe o conteúdo da notícia");

    const cat = cats.find((c) => c.id === form.categoria_id) ?? null;
    const slug = slugify(form.slug || form.titulo);
    const publicado = Boolean(form.publicado);

    const payload = {
      titulo: form.titulo.trim(),
      slug,
      resumo: form.resumo?.trim() || null,
      conteudo: form.conteudo,
      imagem_url: form.imagem_url || null,
      categoria_id: form.categoria_id || null,
      categoria: cat?.nome ?? null,
      autor: form.autor?.trim() || null,
      publicado,
      destaque: Boolean(form.destaque),
      publicado_em: publicado
        ? form.publicado_em ?? new Date().toISOString()
        : form.publicado_em || null,
      agendado_para: form.agendado_para || null,
    };

    setSaving(true);
    const { error } = editing
      ? await supabase.from("noticias").update(payload).eq("id", editing.id)
      : await supabase.from("noticias").insert(payload);
    setSaving(false);

    if (error) {
      const rls = error.code === "42501" || /row-level security/i.test(error.message);
      return toast.error(rls ? `Sem permissão: ${error.message}` : `Erro: ${error.message}`);
    }
    toast.success(
      publicado ? "Notícia salva e publicada no site" : "Notícia salva como rascunho",
    );
    setOpen(false);
    load();
  };

  const publicadas = rows.filter((r) => r.publicado).length;

  return (
    <div className="space-y-6 animate-[fade-up_0.4s_ease-out]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Notícias</h2>
          <p className="text-slate-500">
            Publique, edite e destaque as notícias exibidas na seção{" "}
            <a href="/noticias" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-1">
              Notícias do site <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
        <Button onClick={startNew} className="bg-primary-deep">
          <Plus className="w-4 h-4 mr-2" /> Nova notícia
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total", value: rows.length },
          { label: "Publicadas", value: publicadas },
          { label: "Rascunhos", value: rows.length - publicadas },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, categoria ou autor..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(["todas", "publicadas", "rascunhos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                filtro === f ? "bg-primary-deep text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhuma notícia encontrada.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Publicação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-40 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {r.imagem_url && (
                        <img src={r.imagem_url} alt="" className="w-10 h-10 rounded object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate max-w-[280px]">{r.titulo}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[280px]">/{r.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{r.categoria ?? "—"}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {r.publicado_em
                      ? new Date(r.publicado_em).toLocaleDateString("pt-BR")
                      : r.agendado_para
                        ? `Agendada: ${new Date(r.agendado_para).toLocaleDateString("pt-BR")}`
                        : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={r.publicado ? "default" : "secondary"}>
                        {r.publicado ? "Publicada" : "Rascunho"}
                      </Badge>
                      {r.destaque && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      size="icon"
                      variant="ghost"
                      title={r.publicado ? "Despublicar" : "Publicar"}
                      onClick={() => togglePublicado(r)}
                    >
                      {r.publicado ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Destaque"
                      onClick={() => toggleDestaque(r)}
                    >
                      <Star className={`w-4 h-4 ${r.destaque ? "text-amber-500 fill-amber-500" : ""}`} />
                    </Button>
                    <Button size="icon" variant="ghost" title="Editar" onClick={() => startEdit(r)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Excluir" onClick={() => remove(r)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar notícia" : "Nova notícia"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-5">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo ?? ""}
                onChange={(e) => {
                  const titulo = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    titulo,
                    slug: editing ? prev.slug : slugify(titulo),
                  }));
                }}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={form.slug ?? ""}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="ex-aprovacao-plano-diretor"
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={form.categoria_id ?? ""}
                  onValueChange={(v) => setField("categoria_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="autor">Autor</Label>
                <Input
                  id="autor"
                  value={form.autor ?? ""}
                  onChange={(e) => setField("autor", e.target.value)}
                  placeholder="Assessoria de Comunicação"
                />
              </div>
              <div>
                <Label htmlFor="publicado_em">Data de publicação</Label>
                <Input
                  id="publicado_em"
                  type="datetime-local"
                  value={form.publicado_em ? String(form.publicado_em).slice(0, 16) : ""}
                  onChange={(e) =>
                    setField("publicado_em", e.target.value ? new Date(e.target.value).toISOString() : null)
                  }
                />
              </div>
            </div>

            <ImageUploader
              label="Imagem de capa"
              folder="noticias"
              height={160}
              value={form.imagem_url ?? null}
              onChange={(url) => setField("imagem_url", url)}
            />

            <div>
              <Label htmlFor="resumo">Resumo (exibido nos cards)</Label>
              <Textarea
                id="resumo"
                rows={3}
                value={form.resumo ?? ""}
                onChange={(e) => setField("resumo", e.target.value)}
              />
            </div>

            <div>
              <Label>Conteúdo *</Label>
              <div className="mt-1">
                <RichTextEditor
                  content={form.conteudo ?? ""}
                  onChange={(html) => setField("conteudo", html)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium">Publicado</p>
                  <p className="text-xs text-slate-500">Visível na seção Notícias do site</p>
                </div>
                <Switch
                  checked={Boolean(form.publicado)}
                  onCheckedChange={(v) => setField("publicado", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium">Destaque</p>
                  <p className="text-xs text-slate-500">Exibir na página inicial</p>
                </div>
                <Switch
                  checked={Boolean(form.destaque)}
                  onCheckedChange={(v) => setField("destaque", v)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="agendado_para">Agendar publicação (opcional)</Label>
              <Input
                id="agendado_para"
                type="datetime-local"
                value={form.agendado_para ? String(form.agendado_para).slice(0, 16) : ""}
                onChange={(e) =>
                  setField("agendado_para", e.target.value ? new Date(e.target.value).toISOString() : null)
                }
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-primary-deep">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {form.publicado ? "Salvar e publicar" : "Salvar rascunho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
