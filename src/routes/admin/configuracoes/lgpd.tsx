import { createFileRoute } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes/lgpd")({
  component: LgpdPage,
});

function LgpdPage() {
  const { settings, loading, saving, save, update } = useSiteSettings();
  if (loading || !settings) return <div className="p-12 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({
      cookies_enabled: settings.cookies_enabled, cookies_text: settings.cookies_text,
      privacy_policy: settings.privacy_policy, terms_of_use: settings.terms_of_use,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-4xl animate-[fade-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">LGPD & Privacidade</h1>
        <p className="text-slate-500">Configure cookies, política de privacidade e termos de uso.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg">Banner de Cookies</h2>
            <p className="text-xs text-slate-500">Exibe um aviso de cookies no site público.</p>
          </div>
          <Switch checked={!!settings.cookies_enabled} onCheckedChange={(v) => update({ cookies_enabled: v })} />
        </div>
        <div>
          <Label>Mensagem do Banner</Label>
          <Textarea rows={3} value={settings.cookies_text ?? ""} onChange={(e) => update({ cookies_text: e.target.value })} />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h2 className="font-display font-bold text-lg">Política de Privacidade</h2>
        <Textarea rows={10} value={settings.privacy_policy ?? ""} onChange={(e) => update({ privacy_policy: e.target.value })} placeholder="Cole aqui sua política de privacidade..." />
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h2 className="font-display font-bold text-lg">Termos de Uso</h2>
        <Textarea rows={10} value={settings.terms_of_use ?? ""} onChange={(e) => update({ terms_of_use: e.target.value })} placeholder="Cole aqui os termos de uso..." />
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-primary-deep">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar alterações
        </Button>
      </div>
    </form>
  );
}
