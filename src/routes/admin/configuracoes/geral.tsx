import { createFileRoute } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes/geral")({
  component: GeralPage,
});

function GeralPage() {
  const { settings, loading, saving, save, update } = useSiteSettings();

  if (loading || !settings) {
    return <div className="p-12 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  const redes = settings.redes_sociais || {};
  const setRede = (k: string, v: string) => update({ redes_sociais: { ...redes, [k]: v } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({
      nome_camara: settings.nome_camara,
      brasao_url: settings.brasao_url,
      contact_phone: settings.contact_phone,
      whatsapp: settings.whatsapp,
      contact_email: settings.contact_email,
      endereco: settings.endereco,
      contact_hours: settings.contact_hours,
      redes_sociais: settings.redes_sociais,
      footer_text: settings.footer_text,
      plenario_image_url: settings.plenario_image_url,
      dpo_name: settings.dpo_name,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-4xl animate-[fade-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Configurações Gerais</h1>
        <p className="text-slate-500">Dados institucionais e informações de contato.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Identificação</h2>
        <div className="grid md:grid-cols-[1fr_auto] gap-6">
          <div className="space-y-3">
            <div>
              <Label>Nome da Câmara</Label>
              <Input value={settings.nome_camara ?? ""} onChange={(e) => update({ nome_camara: e.target.value })} />
            </div>
          </div>
          <div className="w-48">
            <ImageUploader value={settings.brasao_url} onChange={(u) => update({ brasao_url: u })} folder="brasao" label="Brasão" height={120} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Contato</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Telefone</Label><Input value={settings.contact_phone ?? ""} onChange={(e) => update({ contact_phone: e.target.value })} /></div>
          <div><Label>WhatsApp</Label><Input value={settings.whatsapp ?? ""} onChange={(e) => update({ whatsapp: e.target.value })} placeholder="5511999999999" /></div>
          <div><Label>E-mail</Label><Input type="email" value={settings.contact_email ?? ""} onChange={(e) => update({ contact_email: e.target.value })} /></div>
          <div><Label>Horário de Funcionamento</Label><Input value={settings.contact_hours ?? ""} onChange={(e) => update({ contact_hours: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Endereço</Label><Textarea rows={2} value={settings.endereco ?? ""} onChange={(e) => update({ endereco: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Encarregado de Dados (DPO)</Label><Input value={settings.dpo_name ?? ""} onChange={(e) => update({ dpo_name: e.target.value })} placeholder="Nome do DPO" /></div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Redes Sociais</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Facebook</Label><Input value={redes.facebook ?? ""} onChange={(e) => setRede("facebook", e.target.value)} placeholder="https://facebook.com/..." /></div>
          <div><Label>Instagram</Label><Input value={redes.instagram ?? ""} onChange={(e) => setRede("instagram", e.target.value)} placeholder="https://instagram.com/..." /></div>
          <div><Label>YouTube</Label><Input value={redes.youtube ?? ""} onChange={(e) => setRede("youtube", e.target.value)} placeholder="https://youtube.com/..." /></div>
          <div><Label>Twitter / X</Label><Input value={redes.twitter ?? ""} onChange={(e) => setRede("twitter", e.target.value)} placeholder="https://x.com/..." /></div>
          <div><Label>LinkedIn</Label><Input value={redes.linkedin ?? ""} onChange={(e) => setRede("linkedin", e.target.value)} /></div>
          <div><Label>TikTok</Label><Input value={redes.tiktok ?? ""} onChange={(e) => setRede("tiktok", e.target.value)} /></div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Imagem do Plenário</h2>
        <p className="text-xs text-slate-500">Exibida na seção institucional da página de Vereadores.</p>
        <div className="max-w-md">
          <ImageUploader
            value={settings.plenario_image_url}
            onChange={(u) => update({ plenario_image_url: u })}
            folder="plenario"
            label="Foto do Plenário"
            height={200}
          />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Rodapé</h2>
        <Textarea rows={3} value={settings.footer_text ?? ""} onChange={(e) => update({ footer_text: e.target.value })} placeholder="Texto exibido no rodapé do site" />
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-primary-deep">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar alterações
        </Button>
      </div>
    </form>
  );
}
