import { createFileRoute } from "@tanstack/react-router";
import { Building2, Image as ImageIcon, Loader2, MapPin, Share2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { BarraSalvar, PaginaModulo, SecaoPainel } from "@/components/admin/painel/PaginaModulo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/configuracoes/geral")({
  component: GeralPage,
});

function Campo({ id, rotulo, ajuda, children }: { id: string; rotulo: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block font-semibold">{rotulo}</Label>
      {children}
      {ajuda && <p className="mt-1 text-xs text-muted-foreground">{ajuda}</p>}
    </div>
  );
}

function GeralPage() {
  const { settings, loading, saving, save, update } = useSiteSettings();

  if (loading || !settings) {
    return <div className="grid place-items-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Carregando" /></div>;
  }

  const redes = settings.redes_sociais || {};
  const setRede = (k: string, v: string) => update({ redes_sociais: { ...redes, [k]: v } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({
      nome_camara: settings.nome_camara,
      contact_phone: settings.contact_phone,
      whatsapp: settings.whatsapp,
      contact_email: settings.contact_email,
      endereco: settings.endereco,
      contact_hours: settings.contact_hours,
      redes_sociais: settings.redes_sociais,
      plenario_image_url: settings.plenario_image_url,
      dpo_name: settings.dpo_name,
    });
  };

  return (
    <PaginaModulo titulo="Dados da Câmara" descricao="Contato, endereço e redes sociais usados no cabeçalho, no rodapé e nas páginas de atendimento.">
      <form onSubmit={submit} className="space-y-5">
        <SecaoPainel titulo="Identificação" descricao="Como a Câmara é chamada em todo o site." icone={Building2}>
          <div className="grid gap-4 md:grid-cols-2">
            <Campo id="nome_camara" rotulo="Nome da Câmara">
              <Input id="nome_camara" className="h-11" value={settings.nome_camara ?? ""} onChange={(e) => update({ nome_camara: e.target.value })} />
            </Campo>
            <Campo id="dpo_name" rotulo="Encarregado de Dados (DPO)" ajuda="Aparece na página LGPD.">
              <Input id="dpo_name" className="h-11" value={settings.dpo_name ?? ""} onChange={(e) => update({ dpo_name: e.target.value })} />
            </Campo>
          </div>
        </SecaoPainel>

        <SecaoPainel titulo="Atendimento" descricao="Aparece no cabeçalho, no rodapé, em Contato, no e-SIC e no SIC Presencial." icone={MapPin}>
          <div className="grid gap-4 md:grid-cols-2">
            <Campo id="contact_phone" rotulo="Telefone">
              <Input id="contact_phone" type="tel" className="h-11" value={settings.contact_phone ?? ""} onChange={(e) => update({ contact_phone: e.target.value })} placeholder="(64) 00000-0000" />
            </Campo>
            <Campo id="whatsapp" rotulo="WhatsApp" ajuda="Vazio, usa o telefone acima.">
              <Input id="whatsapp" type="tel" className="h-11" value={settings.whatsapp ?? ""} onChange={(e) => update({ whatsapp: e.target.value })} placeholder="(64) 00000-0000" />
            </Campo>
            <Campo id="contact_email" rotulo="E-mail">
              <Input id="contact_email" type="email" className="h-11" value={settings.contact_email ?? ""} onChange={(e) => update({ contact_email: e.target.value })} />
            </Campo>
            <Campo id="contact_hours" rotulo="Horário de atendimento">
              <Input id="contact_hours" className="h-11" value={settings.contact_hours ?? ""} onChange={(e) => update({ contact_hours: e.target.value })} placeholder="Segunda a Sexta, 08h às 11h e 13h às 17h" />
            </Campo>
            <div className="md:col-span-2">
              <Campo id="endereco" rotulo="Endereço" ajuda="Usado também no botão Como chegar.">
                <Textarea id="endereco" rows={2} value={settings.endereco ?? ""} onChange={(e) => update({ endereco: e.target.value })} />
              </Campo>
            </div>
          </div>
        </SecaoPainel>

        <SecaoPainel titulo="Redes sociais" descricao="Só as preenchidas aparecem no rodapé. Cole o endereço completo." icone={Share2}>
          <div className="grid gap-4 md:grid-cols-3">
            {[["facebook", "Facebook", "https://facebook.com/..."], ["instagram", "Instagram", "https://instagram.com/..."], ["youtube", "YouTube", "https://youtube.com/..."]].map(([k, rotulo, ph]) => (
              <Campo key={k} id={k} rotulo={rotulo}>
                <Input id={k} type="url" className="h-11" value={redes[k] ?? ""} onChange={(e) => setRede(k, e.target.value)} placeholder={ph} />
              </Campo>
            ))}
          </div>
        </SecaoPainel>

        <SecaoPainel titulo="Foto do Plenário" descricao="Aparece no fim da página Vereadores. Sem foto, o site usa a imagem da cidade." icone={ImageIcon}>
          <div className="max-w-md">
            <ImageUploader value={settings.plenario_image_url} onChange={(u) => update({ plenario_image_url: u })} folder="plenario" label="" height={200} />
          </div>
        </SecaoPainel>

        <BarraSalvar salvando={saving} />
      </form>
    </PaginaModulo>
  );
}
