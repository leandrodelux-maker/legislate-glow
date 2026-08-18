import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SaveTransparencySettingsInput = {
  id: string | null;
  portal_url: string;
  portal_name: string;
  is_active: boolean;
  show_full_portal_embed: boolean;
};

function normalizePortalUrl(value: string) {
  const url = new URL(value.trim());
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Link inválido");
  url.hash = "";
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "") + "/";
}

export const saveTransparencySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SaveTransparencySettingsInput) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw new Error(roleError.message);
    if (!roleRow) throw new Error("Sem permissão para salvar esta configuração.");

    const normalizedUrl = normalizePortalUrl(data.portal_url);
    const name = data.portal_name.trim() || "Portal da Transparência";
    const payload = {
      portal_url: normalizedUrl,
      portal_base_url: normalizedUrl,
      portal_name: name,
      entity_name: name,
      is_active: data.is_active,
      show_full_portal_embed: data.show_full_portal_embed,
    };

    const query = data.id
      ? supabaseAdmin.from("transparency_settings").update(payload).eq("id", data.id).select("id").single()
      : supabaseAdmin.from("transparency_settings").insert(payload).select("id").single();

    const { data: saved, error } = await query;
    if (error) throw new Error(error.message);

    return { id: saved.id, ...payload };
  });