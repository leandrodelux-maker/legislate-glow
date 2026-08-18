import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SiteSettings = Record<string, any> & { id: string };

// Cache compartilhado entre header/footer/etc. evita N queries por página.
let _cache: SiteSettings | null = null;
let _inflight: Promise<SiteSettings | null> | null = null;
const _subs = new Set<(s: SiteSettings | null) => void>();

function notify() {
  _subs.forEach((fn) => fn(_cache));
}

function fetchSettings(force = false): Promise<SiteSettings | null> {
  if (!force && _cache) return Promise.resolve(_cache);
  if (!force && _inflight) return _inflight;
  const p = (async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    _inflight = null;
    if (error) {
      toast.error(error.message);
      return null;
    }
    _cache = (data as SiteSettings | null) ?? null;
    notify();
    return _cache;
  })();
  _inflight = p;
  return p;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(_cache);
  const [loading, setLoading] = useState(_cache === null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sub = (s: SiteSettings | null) => setSettings(s);
    _subs.add(sub);
    if (_cache === null) {
      fetchSettings().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      _subs.delete(sub);
    };
  }, []);

  const save = async (patch: Partial<SiteSettings>) => {
    if (!settings) return;
    setSaving(true);
    const { error } = await (supabase as any).from("site_settings").update(patch).eq("id", settings.id);
    setSaving(false);
    if (error) { toast.error(error.message); return false; }
    _cache = { ...settings, ...patch };
    notify();
    toast.success("Configurações salvas");
    return true;
  };

  const update = (patch: Partial<SiteSettings>) => {
    if (_cache) {
      _cache = { ...(_cache as SiteSettings), ...patch };
      notify();
    }
  };

  return { settings, loading, saving, save, update };
}

export async function uploadToSiteMedia(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    cacheControl: "3600", upsert: true, contentType: file.type,
  });
  if (error) { toast.error(error.message); return null; }
  const { data } = await supabase.storage.from("site-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (!data?.signedUrl) { toast.error("Falha ao gerar URL"); return null; }
  return data.signedUrl;
}
