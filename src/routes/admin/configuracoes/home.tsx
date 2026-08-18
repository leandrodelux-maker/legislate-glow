import { createFileRoute } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, GripVertical } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/configuracoes/home")({
  component: HomePage,
});

const blockLabels: Record<string, string> = {
  hero: "Banner Principal (Hero)",
  atalhos: "Atalhos Rápidos",
  noticias: "Últimas Notícias",
  sessoes: "Próximas Sessões",
  vereadores: "Vereadores",
};

function SortableBlock({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-700">
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="font-medium text-sm text-slate-800">{blockLabels[id] || id}</span>
    </div>
  );
}

function HomePage() {
  const { settings, loading, saving, save, update } = useSiteSettings();
  if (loading || !settings) return <div className="p-12 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const blocos: string[] = settings.ordem_blocos || ["hero","atalhos","noticias","sessoes","vereadores"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({
      hero_title: settings.hero_title, hero_subtitle: settings.hero_subtitle, hero_eyebrow: settings.hero_eyebrow,
      hero_botao_texto: settings.hero_botao_texto, hero_botao_url: settings.hero_botao_url,
      hero_media_url: settings.hero_media_url, hero_media_type: settings.hero_media_type,
      ordem_blocos: settings.ordem_blocos,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-4xl animate-[fade-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Home Page</h1>
        <p className="text-slate-500">Banner principal, textos e ordem das seções.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Banner Principal</h2>
        <div className="grid gap-4">
          <div><Label>Eyebrow (texto pequeno acima do título)</Label><Input value={settings.hero_eyebrow ?? ""} onChange={(e) => update({ hero_eyebrow: e.target.value })} /></div>
          <div><Label>Título Principal</Label><Input value={settings.hero_title ?? ""} onChange={(e) => update({ hero_title: e.target.value })} /></div>
          <div><Label>Subtítulo</Label><Textarea rows={2} value={settings.hero_subtitle ?? ""} onChange={(e) => update({ hero_subtitle: e.target.value })} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Texto do Botão</Label><Input value={settings.hero_botao_texto ?? ""} onChange={(e) => update({ hero_botao_texto: e.target.value })} placeholder="Saiba mais" /></div>
            <div><Label>Link do Botão</Label><Input value={settings.hero_botao_url ?? ""} onChange={(e) => update({ hero_botao_url: e.target.value })} placeholder="/sobre" /></div>
          </div>
          <ImageUploader value={settings.hero_media_url} onChange={(u) => update({ hero_media_url: u, hero_media_type: "image" })} folder="hero" label="Imagem de Fundo" height={180} />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Ordem dos Blocos</h2>
        <p className="text-xs text-slate-500">Arraste para reorganizar as seções da home.</p>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!over || active.id === over.id) return;
            const oldI = blocos.indexOf(active.id as string);
            const newI = blocos.indexOf(over.id as string);
            update({ ordem_blocos: arrayMove(blocos, oldI, newI) });
          }}
        >
          <SortableContext items={blocos} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocos.map((id) => <SortableBlock key={id} id={id} />)}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-primary-deep">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar alterações
        </Button>
      </div>
    </form>
  );
}
