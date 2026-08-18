import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { TRANSPARENCY_ICON_NAMES, getTransparencyIcon } from "@/lib/transparency-icons";

export const Route = createFileRoute("/admin/transparencia-links")({
  component: AdminTransparenciaLinks,
});

type LinkRow = {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  external_url: string | null;
  category: string;
  sort_order: number;
  is_active: boolean;
};

/** Categorias do Portal Megasoft usadas para agrupar os cards na página pública. */
export const TRANSPARENCY_CATEGORIES = [
  "Informações Institucionais",
  "Receita e Despesa",
  "Planejamento e Prestação de Contas",
  "Recursos Humanos e Diárias",
  "Licitações e Contratos",
  "Obras",
  "Convênios e Transferências",
  "SIC e Ouvidoria",
  "LGPD e Governo Digital",
  "Atividades Finalísticas",
] as const;

const emptyForm: Omit<LinkRow, "id"> = {
  title: "",
  description: "",
  icon: "ExternalLink",
  path: "",
  external_url: "",
  category: "Informações Institucionais",
  sort_order: 0,
  is_active: true,
};

function AdminTransparenciaLinks() {
  const [items, setItems] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LinkRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("transparency_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as LinkRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: (items.at(-1)?.sort_order ?? 0) + 10 });
  };

  const startEdit = (row: LinkRow) => {
    setEditing(row);
    setForm({
      title: row.title,
      description: row.description ?? "",
      icon: row.icon ?? "ExternalLink",
      path: row.path ?? "",
      external_url: row.external_url ?? "",
      category: row.category ?? "Informações Institucionais",
      sort_order: row.sort_order,
      is_active: row.is_active,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Informe o título");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon || "ExternalLink",
      path: form.path.trim(),
      external_url: form.external_url?.trim() || null,
      category: form.category || "Informações Institucionais",
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    const query = editing
      ? (supabase as any).from("transparency_links").update(payload).eq("id", editing.id)
      : (supabase as any).from("transparency_links").insert(payload);

    const { error } = await query;
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Link atualizado" : "Link adicionado");
    cancelEdit();
    load();
  };

  const remove = async (row: LinkRow) => {
    if (!confirm(`Remover "${row.title}"?`)) return;
    const { error } = await (supabase as any).from("transparency_links").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Link removido");
    load();
  };

  const toggleActive = async (row: LinkRow) => {
    const { error } = await (supabase as any)
      .from("transparency_links")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Links da Transparência</h1>
          <p className="mt-1 max-w-3xl text-slate-500">
            Gerencie os cards exibidos na página pública do Portal da Transparência.
          </p>
        </div>
        <Button onClick={startNew} className="bg-primary-deep hover:bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Novo link
        </Button>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            {editing ? `Editando: ${editing.title}` : "Adicionar novo link"}
          </h2>
          {editing && (
            <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
              <X className="mr-2 h-4 w-4" /> Cancelar edição
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Ícone</Label>
            <Select value={form.icon} onValueChange={(value) => setForm({ ...form, icon: value })}>
              <SelectTrigger id="icon"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRANSPARENCY_ICON_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger id="category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRANSPARENCY_CATEGORIES.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Define em qual grupo o card aparece na página pública.</p>
          </div>
        </div>


        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="path">Caminho relativo no Portal Megasoft</Label>
            <Input
              id="path"
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              placeholder="receitas-e-despesas/receita"
            />
            <p className="text-xs text-slate-500">Será concatenado à URL base salva em Transparência Ativa.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="external_url">URL externa (opcional)</Label>
            <Input
              id="external_url"
              type="url"
              value={form.external_url ?? ""}
              onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-slate-500">Se preenchido, abre este link em vez do caminho do portal.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sort_order">Ordem</Label>
            <Input
              id="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <Label htmlFor="is_active" className="font-semibold">Ativo</Label>
              <p className="mt-1 text-sm text-slate-500">Quando inativo, o card não aparece na página pública.</p>
            </div>
            <Switch id="is_active" checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-primary-deep hover:bg-primary">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {editing ? "Salvar alterações" : "Adicionar link"}
          </Button>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-slate-900">Links cadastrados</h2>
          <p className="mt-1 text-sm text-slate-500">{items.length} {items.length === 1 ? "link" : "links"} no total.</p>
        </div>
        {loading ? (
          <div className="grid min-h-32 place-items-center text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-500">Nenhum link cadastrado.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((row) => {
              const Icon = getTransparencyIcon(row.icon);
              return (
                <li key={row.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{row.title}</span>
                        <span className="text-xs text-slate-400">#{row.sort_order}</span>
                        {!row.is_active && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] uppercase text-slate-500">Inativo</span>
                        )}
                      </div>
                      <p className="mt-1 max-w-2xl text-sm text-slate-500">{row.description}</p>
                      <p className="mt-1 break-all text-xs text-slate-400">
                        {row.external_url || row.path || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={row.is_active} onCheckedChange={() => toggleActive(row)} />
                    <Button variant="outline" size="sm" onClick={() => startEdit(row)}>
                      <Pencil className="mr-1 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => remove(row)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="mr-1 h-4 w-4" /> Remover
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
