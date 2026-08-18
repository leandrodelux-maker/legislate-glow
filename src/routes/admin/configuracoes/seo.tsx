import { createFileRoute } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes/seo")({
  component: SeoPage,
});

function SeoPage() {
  const { settings, loading, saving, save, update } = useSiteSettings();
  if (loading || !settings) return <div className="p-12 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({
      seo_title: settings.seo_title, seo_description: settings.seo_description, og_image_url: settings.og_image_url,
      google_analytics_id: settings.google_analytics_id, gtm_id: settings.gtm_id,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl animate-[fade-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">SEO & Analytics</h1>
        <p className="text-slate-500">Otimização para buscadores e integração com ferramentas de análise.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Meta Tags</h2>
        <div>
          <Label>Título do Site (até 60 caracteres)</Label>
          <Input maxLength={60} value={settings.seo_title ?? ""} onChange={(e) => update({ seo_title: e.target.value })} placeholder="Câmara Municipal — Portal Oficial" />
          <p className="text-[11px] text-slate-500 mt-1">{(settings.seo_title ?? "").length}/60</p>
        </div>
        <div>
          <Label>Meta Descrição (até 160 caracteres)</Label>
          <Textarea rows={3} maxLength={160} value={settings.seo_description ?? ""} onChange={(e) => update({ seo_description: e.target.value })} />
          <p className="text-[11px] text-slate-500 mt-1">{(settings.seo_description ?? "").length}/160</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Open Graph (Redes Sociais)</h2>
        <p className="text-xs text-slate-500">Imagem exibida quando o site for compartilhado. Recomendado: 1200×630px.</p>
        <div className="max-w-md">
          <ImageUploader value={settings.og_image_url} onChange={(u) => update({ og_image_url: u })} folder="og" label="Imagem OG" height={160} />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Analytics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Google Analytics ID</Label>
            <Input value={settings.google_analytics_id ?? ""} onChange={(e) => update({ google_analytics_id: e.target.value })} placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <Label>Google Tag Manager ID</Label>
            <Input value={settings.gtm_id ?? ""} onChange={(e) => update({ gtm_id: e.target.value })} placeholder="GTM-XXXXXXX" />
          </div>
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
