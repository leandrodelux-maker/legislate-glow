import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, GripVertical, Save } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/configuracoes/menu")({
  component: MenuPage,
});

type MenuItem = {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
  ordem: number;
  ativo: boolean;
  abrir_nova_aba: boolean;
};

function SortableRow({ item, onChange, onDelete, onAddSub, depth = 0 }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, marginLeft: depth * 24 }}
      className="bg-white border border-slate-200 rounded-lg p-3"
    >
      <div className="flex items-center gap-2">
        <button type="button" {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-700 shrink-0">
          <GripVertical className="w-4 h-4" />
        </button>
        <Input value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} placeholder="Nome" className="h-8 text-sm flex-1" />
        <Input value={item.url} onChange={(e) => onChange({ ...item, url: e.target.value })} placeholder="/url" className="h-8 text-sm flex-1" />
        <label className="flex items-center gap-1 text-xs text-slate-600 shrink-0">
          <input type="checkbox" checked={item.ativo} onChange={(e) => onChange({ ...item, ativo: e.target.checked })} />
          Ativo
        </label>
        <Button type="button" variant="ghost" size="icon" onClick={() => onAddSub(item.id)} className="h-8 w-8" title="Adicionar submenu">
          <Plus className="w-3.5 h-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8">
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_menus").select("*").order("ordem", { ascending: true });
    if (error) toast.error(error.message);
    else setItems((data as MenuItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateItem = (next: MenuItem) => setItems((prev) => prev.map((i) => i.id === next.id ? next : i));
  const deleteItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id && i.parent_id !== id));
  const addRoot = () => {
    setItems((prev) => [...prev, {
      id: crypto.randomUUID(), label: "Novo menu", url: "#", parent_id: null,
      ordem: prev.filter((i) => !i.parent_id).length, ativo: true, abrir_nova_aba: false,
    }]);
  };
  const addSub = (parentId: string) => {
    setItems((prev) => [...prev, {
      id: crypto.randomUUID(), label: "Submenu", url: "#", parent_id: parentId,
      ordem: prev.filter((i) => i.parent_id === parentId).length, ativo: true, abrir_nova_aba: false,
    }]);
  };

  const saveAll = async () => {
    setSaving(true);
    // Atribui ordem por grupo
    const byParent: Record<string, MenuItem[]> = {};
    items.forEach((i) => {
      const k = i.parent_id ?? "root";
      (byParent[k] ||= []).push(i);
    });
    const payload: MenuItem[] = [];
    Object.values(byParent).forEach((group) => {
      group.forEach((it, idx) => payload.push({ ...it, ordem: idx }));
    });

    // Apaga tudo e reinsere (mais simples; menu é pequeno)
    const { error: delErr } = await supabase.from("site_menus").delete().not("id", "is", null);
    if (delErr) { toast.error(delErr.message); setSaving(false); return; }
    if (payload.length) {
      const { error } = await supabase.from("site_menus").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success("Menu salvo");
    setSaving(false);
    load();
  };

  const roots = items.filter((i) => !i.parent_id);
  const childrenOf = (id: string) => items.filter((i) => i.parent_id === id);

  if (loading) return <div className="p-12 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6 max-w-4xl animate-[fade-up_0.4s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Menu do Site</h1>
          <p className="text-slate-500">Crie e organize os itens de navegação do portal.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addRoot}><Plus className="w-4 h-4 mr-1" /> Novo menu</Button>
          <Button type="button" onClick={saveAll} disabled={saving} className="bg-primary-deep">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Salvar
          </Button>
        </div>
      </div>

      {roots.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
          Nenhum item de menu. Clique em "Novo menu" para começar.
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!over || active.id === over.id) return;
            const oldI = roots.findIndex((i) => i.id === active.id);
            const newI = roots.findIndex((i) => i.id === over.id);
            if (oldI < 0 || newI < 0) return;
            const newRoots = arrayMove(roots, oldI, newI);
            setItems([...newRoots, ...items.filter((i) => i.parent_id)]);
          }}
        >
          <SortableContext items={roots.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {roots.map((root) => (
                <div key={root.id} className="space-y-2">
                  <SortableRow item={root} onChange={updateItem} onDelete={deleteItem} onAddSub={addSub} />
                  {childrenOf(root.id).map((sub) => (
                    <SortableRow key={sub.id} item={sub} onChange={updateItem} onDelete={deleteItem} onAddSub={addSub} depth={1} />
                  ))}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
