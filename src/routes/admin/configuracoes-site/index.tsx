import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Image as ImageIcon, Video, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/configuracoes-site/")({
  component: SiteSettingsAdmin,
});

type Settings = {
  id: string;
  hero_media_url: string | null;
  hero_media_type: "image" | "video";
  hero_title: string;
  hero_subtitle: string;
  hero_eyebrow: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_hours: string | null;
  live_broadcast_url: string | null;
  header_logo_url: string | null;
  header_logo_height: number;
  footer_logo_url: string | null;
  footer_logo_height: number;
};

function SiteSettingsAdmin() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState<"header" | "footer" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const headerLogoRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) toast.error(error.message);
    else setSettings(data as Settings | null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        hero_media_url: settings.hero_media_url,
        hero_media_type: settings.hero_media_type,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        hero_eyebrow: settings.hero_eyebrow,
        contact_phone: settings.contact_phone,
        contact_email: settings.contact_email,
        contact_hours: settings.contact_hours,
        live_broadcast_url: settings.live_broadcast_url,
        header_logo_url: settings.header_logo_url,
        header_logo_height: settings.header_logo_height,
        footer_logo_url: settings.footer_logo_url,
        footer_logo_height: settings.footer_logo_height,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
  };

  const handleUpload = async (file: File) => {
    if (!settings) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("site-media").upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const { data } = await supabase.storage.from("site-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (!data?.signedUrl) { setUploading(false); return toast.error("Falha ao gerar URL"); }

    const type = file.type.startsWith("video/") ? "video" : "image";
    setSettings({ ...settings, hero_media_url: data.signedUrl, hero_media_type: type });

    setUploading(false);
    toast.success("Mídia enviada. Clique em Salvar para aplicar.");
  };

  const handleLogoUpload = async (file: File, type: "header" | "footer") => {
    if (!settings) return;
    setUploadingLogo(type);
    const ext = file.name.split(".").pop();
    const path = `logos/${type}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("site-media").upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });
    
    if (upErr) {
      setUploadingLogo(null);
      return toast.error(upErr.message);
    }
    
    const { data } = await supabase.storage.from("site-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (!data?.signedUrl) { setUploadingLogo(null); return toast.error("Falha ao gerar URL"); }
    if (type === "header") {
      setSettings({ ...settings, header_logo_url: data.signedUrl });
    } else {
      setSettings({ ...settings, footer_logo_url: data.signedUrl });
    }
    setUploadingLogo(null);
    toast.success(`Logotipo do ${type === "header" ? "cabeçalho" : "rodapé"} enviado.`);
  };

  if (loading || !settings) {
    return (
      <div className="p-12 grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8 animate-[fade-up_0.4s_ease-out] max-w-4xl">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900">Configurações do Site</h2>
        <p className="text-slate-500">Gerencie a mídia do hero, textos e contato exibidos no site público.</p>
      </div>

      {/* HERO MEDIA */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">Mídia do Hero (Imagem ou Vídeo)</h3>
          <p className="text-sm text-slate-500">Exibida no topo da página inicial.</p>
        </div>

        {settings.hero_media_url ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
            {settings.hero_media_type === "video" ? (
              <video src={settings.hero_media_url} controls className="w-full h-full object-cover" />
            ) : (
              <img src={settings.hero_media_url} alt="Hero" className="w-full h-full object-cover" />
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-3 right-3"
              onClick={() => setSettings({ ...settings, hero_media_url: null })}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Remover
            </Button>
            <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-semibold uppercase">
              {settings.hero_media_type === "video" ? <Video className="w-3 h-3 inline mr-1" /> : <ImageIcon className="w-3 h-3 inline mr-1" />}
              {settings.hero_media_type}
            </span>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            Nenhuma mídia. Faça upload abaixo.
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Enviar imagem ou vídeo
          </Button>
        </div>

        <div>
          <Label>Ou cole uma URL externa</Label>
          <Input
            value={settings.hero_media_url ?? ""}
            placeholder="https://..."
            onChange={(e) => setSettings({ ...settings, hero_media_url: e.target.value || null })}
          />
        </div>
        <div>
          <Label>Tipo de mídia</Label>
          <select
            value={settings.hero_media_type}
            onChange={(e) => setSettings({ ...settings, hero_media_type: e.target.value as "image" | "video" })}
            className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white"
          >
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </select>
        </div>
      </section>

      {/* LOGOTIPOS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">Logotipos do Site</h3>
          <p className="text-sm text-slate-500">Personalize a identidade visual no cabeçalho e rodapé.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Header Logo */}
          <div className="space-y-4 p-4 border rounded-xl bg-slate-50/50">
            <Label className="text-base font-bold">Logotipo do Cabeçalho</Label>
            
            <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg bg-white overflow-hidden">
              {settings.header_logo_url ? (
                <div className="relative group w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={`${settings.header_logo_url}?t=${Date.now()}`} 
                    alt="Logo Header" 
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setSettings({ ...settings, header_logo_url: null })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">Sem logotipo</p>
                </div>
              )}
            </div>

            <input
              ref={headerLogoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogoUpload(f, "header");
                e.target.value = "";
              }}
            />

            <div className="space-y-3">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => headerLogoRef.current?.click()}
                disabled={uploadingLogo === "header"}
              >
                {uploadingLogo === "header" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {settings.header_logo_url ? "Trocar Logotipo" : "Enviar Logotipo"}
              </Button>

              <div>
                <Label className="text-xs">Altura do Logotipo (px)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="range" 
                    min="30" 
                    max="200" 
                    step="1"
                    value={settings.header_logo_height}
                    onChange={(e) => setSettings({ ...settings, header_logo_height: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-14">{settings.header_logo_height}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Logo */}
          <div className="space-y-4 p-4 border rounded-xl bg-slate-50/50">
            <Label className="text-base font-bold">Logotipo do Rodapé</Label>
            
            <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg bg-white overflow-hidden">
              {settings.footer_logo_url ? (
                <div className="relative group w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={`${settings.footer_logo_url}?t=${Date.now()}`} 
                    alt="Logo Footer" 
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setSettings({ ...settings, footer_logo_url: null })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">Sem logotipo</p>
                </div>
              )}
            </div>

            <input
              ref={footerLogoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogoUpload(f, "footer");
                e.target.value = "";
              }}
            />

            <div className="space-y-3">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => footerLogoRef.current?.click()}
                disabled={uploadingLogo === "footer"}
              >
                {uploadingLogo === "footer" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {settings.footer_logo_url ? "Trocar Logotipo" : "Enviar Logotipo"}
              </Button>

              <div>
                <Label className="text-xs">Altura do Logotipo (px)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="range" 
                    min="20" 
                    max="100" 
                    step="1"
                    value={settings.footer_logo_height}
                    onChange={(e) => setSettings({ ...settings, footer_logo_height: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-10">{settings.footer_logo_height}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEXTOS HERO */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Textos do Hero</h3>
        <div>
          <Label>Eyebrow (chip superior)</Label>
          <Input value={settings.hero_eyebrow} onChange={(e) => setSettings({ ...settings, hero_eyebrow: e.target.value })} />
        </div>
        <div>
          <Label>Título principal</Label>
          <Input value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} />
        </div>
        <div>
          <Label>Subtítulo</Label>
          <Textarea
            rows={2}
            value={settings.hero_subtitle}
            onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
          />
        </div>
      </section>

      {/* CONTATO */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Contato (barra superior)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Telefone</Label>
            <Input value={settings.contact_phone ?? ""} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={settings.contact_email ?? ""} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Horário de atendimento</Label>
            <Input value={settings.contact_hours ?? ""} onChange={(e) => setSettings({ ...settings, contact_hours: e.target.value })} />
          </div>
        </div>
      </section>

      {/* TRANSMISSÃO AO VIVO */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Transmissão Ao Vivo</h3>
        <div>
          <Label>URL do Canal de Transmissão (YouTube/Facebook)</Label>
          <Input 
            value={settings.live_broadcast_url ?? ""} 
            placeholder="https://youtube.com/@seucanal/live"
            onChange={(e) => setSettings({ ...settings, live_broadcast_url: e.target.value })} 
          />
        </div>
      </section>


      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-primary-deep">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
