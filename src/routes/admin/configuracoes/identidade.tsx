import { createFileRoute } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes/identidade")({
  component: IdentidadePage,
});

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded border border-slate-200 cursor-pointer" />
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="font-mono text-sm" />
      </div>
    </div>
  );
}

function IdentidadePage() {
  const { settings, loading, saving, save, update } = useSiteSettings();
  if (loading || !settings) return <div className="p-12 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({
      cor_primaria: settings.cor_primaria, cor_secundaria: settings.cor_secundaria, cor_destaque: settings.cor_destaque,
      cor_menu: settings.cor_menu, cor_botoes: settings.cor_botoes, cor_cards: settings.cor_cards,
      fonte_titulo: settings.fonte_titulo, fonte_corpo: settings.fonte_corpo,
      favicon_url: settings.favicon_url, logo_claro_url: settings.logo_claro_url, logo_escuro_url: settings.logo_escuro_url,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl animate-[fade-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Identidade Visual</h1>
        <p className="text-slate-500">Cores, tipografia e logotipos do site público.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Paleta de Cores</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ColorField label="Cor Primária" value={settings.cor_primaria} onChange={(v) => update({ cor_primaria: v })} />
          <ColorField label="Cor Secundária" value={settings.cor_secundaria} onChange={(v) => update({ cor_secundaria: v })} />
          <ColorField label="Cor de Destaque" value={settings.cor_destaque} onChange={(v) => update({ cor_destaque: v })} />
          <ColorField label="Cor do Menu" value={settings.cor_menu} onChange={(v) => update({ cor_menu: v })} />
          <ColorField label="Cor dos Botões" value={settings.cor_botoes} onChange={(v) => update({ cor_botoes: v })} />
          <ColorField label="Cor dos Cards" value={settings.cor_cards} onChange={(v) => update({ cor_cards: v })} />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Tipografia</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Fonte dos Títulos</Label><Input value={settings.fonte_titulo ?? ""} onChange={(e) => update({ fonte_titulo: e.target.value })} placeholder="Poppins" /></div>
          <div><Label>Fonte do Corpo</Label><Input value={settings.fonte_corpo ?? ""} onChange={(e) => update({ fonte_corpo: e.target.value })} placeholder="Open Sans" /></div>
        </div>
        <p className="text-xs text-slate-500">Use nomes de fontes do Google Fonts. As fontes serão carregadas dinamicamente.</p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Logos e Favicon</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ImageUploader value={settings.favicon_url} onChange={(u) => update({ favicon_url: u })} folder="favicon" label="Favicon (32×32)" height={120} />
          <ImageUploader value={settings.logo_claro_url} onChange={(u) => update({ logo_claro_url: u })} folder="logos" label="Logo Clara" height={120} />
          <ImageUploader value={settings.logo_escuro_url} onChange={(u) => update({ logo_escuro_url: u })} folder="logos" label="Logo Escura" height={120} />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-primary-deep">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar alterações
        </Button>
      </div>
    </form>
  );
}
