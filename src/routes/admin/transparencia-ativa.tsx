import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { saveTransparencySettings } from "@/lib/transparency-settings.functions";

export const Route = createFileRoute("/admin/transparencia-ativa")({
  component: AdminTransparenciaAtiva,
});

type Settings = {
  id: string | null;
  portal_url: string;
  portal_name: string;
  is_active: boolean;
  show_full_portal_embed: boolean;
  last_sync_at: string | null;
};

const emptySettings: Settings = {
  id: null,
  portal_url: "",
  portal_name: "Portal da Transparência",
  is_active: true,
  show_full_portal_embed: false,
  last_sync_at: null,
};

function normalizePortalUrl(value: string) {
  const url = new URL(value.trim());
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("invalid");
  url.hash = "";
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "") + "/";
}

function AdminTransparenciaAtiva() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveSettingsFn = useServerFn(saveTransparencySettings);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("transparency_settings")
        .select("id, portal_url, portal_base_url, portal_name, entity_name, is_active, show_full_portal_embed, last_sync_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) toast.error(error.message);
      if (data) {
        setSettings({
          id: data.id,
          portal_url: data.portal_url || data.portal_base_url || "",
          portal_name: data.portal_name || data.entity_name || "Portal da Transparência",
          is_active: data.is_active ?? true,
          show_full_portal_embed: data.show_full_portal_embed ?? false,
          last_sync_at: data.last_sync_at || null,
        });
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let normalizedUrl = "";
    try {
      normalizedUrl = normalizePortalUrl(settings.portal_url);
    } catch {
      toast.error("Link inválido. Informe uma URL completa do Portal Megasoft.");
      return;
    }

    setSaving(true);
    const payload = {
      id: settings.id,
      portal_url: normalizedUrl,
      portal_name: settings.portal_name.trim() || "Portal da Transparência",
      is_active: settings.is_active,
      show_full_portal_embed: settings.show_full_portal_embed,
    };

    try {
      const saved = await saveSettingsFn({ data: payload });
      setSettings((current) => ({ ...current, ...saved, id: saved.id }));
      toast.success("Configuração salva com sucesso");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Transparência Ativa</h1>
        <p className="mt-1 max-w-3xl text-slate-500">
          Configure o endereço oficial do Portal Megasoft usado pela página pública de Transparência.
        </p>
      </div>

      <section className="max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="grid min-h-48 place-items-center text-slate-500">
            <Loader2 className="mb-3 h-6 w-6 animate-spin" /> Carregando configuração...
          </div>
        ) : (
          <form onSubmit={saveSettings} className="space-y-6">
            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Os cards públicos serão gerados sempre a partir desta URL salva. Nenhum dado demonstrativo será exibido.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="portal_name">Nome do portal</Label>
                <Input
                  id="portal_name"
                  value={settings.portal_name}
                  onChange={(event) => setSettings({ ...settings, portal_name: event.target.value })}
                  placeholder="Portal da Transparência"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portal_url">Link do Portal Megasoft *</Label>
                <Input
                  id="portal_url"
                  type="url"
                  required
                  value={settings.portal_url}
                  onChange={(event) => setSettings({ ...settings, portal_url: event.target.value })}
                  placeholder="https://camaraadelandia.megasofttransparencia.com.br/"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <Label htmlFor="is_active" className="font-semibold">Página publicada</Label>
                  <p className="mt-1 text-sm text-slate-500">Mantém a página pública disponível para visitantes.</p>
                </div>
                <Switch
                  id="is_active"
                  checked={settings.is_active}
                  onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <Label htmlFor="show_full_portal_embed" className="font-semibold">Exibir Portal Completo Incorporado</Label>
                  <p className="mt-1 text-sm text-slate-500">Quando ativo, exibe o Portal Megasoft em iframe responsivo.</p>
                </div>
                <Switch
                  id="show_full_portal_embed"
                  checked={settings.show_full_portal_embed}
                  onCheckedChange={(checked) => setSettings({ ...settings, show_full_portal_embed: checked })}
                />
              </div>
            </div>

            {settings.portal_url && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Link configurado: {" "}
                  <a href={settings.portal_url} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                    abrir Portal Megasoft <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-primary-deep hover:bg-primary">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}