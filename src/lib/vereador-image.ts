import { supabase } from "@/integrations/supabase/client";

/**
 * Extrai o caminho dentro do bucket "vereadores" a partir de:
 * - caminho simples (ex: "fotos/123.jpg")
 * - URL assinada (ex: "https://.../vereadores/fotos/123.jpg?token=...")
 * - URL pública (ex: "https://.../object/public/vereadores/fotos/123.jpg")
 */
function extractVereadorPath(urlOrPath: string): string | null {
  if (!urlOrPath) return null;

  // URL pública do Supabase: /object/public/vereadores/<path>
  const publicMarker = "/object/public/vereadores/";
  const publicIdx = urlOrPath.indexOf(publicMarker);
  if (publicIdx !== -1) {
    return decodeURIComponent(urlOrPath.substring(publicIdx + publicMarker.length).split("?")[0]);
  }

  // URL assinada ou qualquer outra URL contendo /vereadores/
  const marker = "/vereadores/";
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) {
    return decodeURIComponent(urlOrPath.substring(idx + marker.length).split("?")[0]);
  }

  // Assume que já é um caminho relativo dentro do bucket
  return urlOrPath;
}

/**
 * Retorna a URL pública de uma imagem do bucket "vereadores".
 * Requer que o bucket seja público. Se o bucket ainda estiver privado,
 * a URL retornada não será acessível sem token.
 */
export function getVereadorPublicUrl(urlOrPath: string | null | undefined): string | null {
  const path = extractVereadorPath(urlOrPath || "");
  if (!path) return null;
  const { data } = supabase.storage.from("vereadores").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Verifica se um valor já é uma URL pública do bucket vereadores.
 */
export function isVereadorPublicUrl(urlOrPath: string | null | undefined): boolean {
  if (!urlOrPath) return false;
  return urlOrPath.includes("/object/public/vereadores/");
}
