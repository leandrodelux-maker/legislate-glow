import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LegalDocument } from "@/components/document-library";
import { buildGoogleViewer } from "@/lib/legal-documents";

/** Categorias usadas na tabela `documentos_oficiais`. */
export const DOCUMENT_CATEGORIES = [
  { value: "carta-de-servicos", label: "Carta de Serviços" },
  { value: "lei-organica-municipal", label: "Lei Orgânica Municipal" },
  { value: "regimento-interno", label: "Regimento Interno" },
  { value: "portarias", label: "Portarias" },
] as const;

export type OfficialDocumentRow = {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string | null;
  data_documento: string | null;
  download_url: string;
  viewer_url: string | null;
  ordem: number;
  publicado: boolean;
};

function toLegalDocument(row: OfficialDocumentRow): LegalDocument {
  return {
    title: row.titulo,
    date: row.data_documento ?? undefined,
    description: row.descricao ?? undefined,
    downloadUrl: row.download_url,
    viewerUrl: row.viewer_url ?? buildGoogleViewer(row.download_url),
  };
}

/**
 * Carrega os documentos oficiais publicados de uma categoria, gerenciados
 * pelo painel administrativo. Enquanto carrega, devolve o fallback estático.
 */
export function useOfficialDocuments(categoria: string, fallback: LegalDocument[] = []) {
  const [documents, setDocuments] = useState<LegalDocument[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("documentos_oficiais")
        .select("*")
        .eq("categoria", categoria)
        .eq("publicado", true)
        .order("ordem", { ascending: true });
      if (!alive) return;
      if (!error && data) {
        const rows = data as OfficialDocumentRow[];
        setDocuments(rows.length ? rows.map(toLegalDocument) : fallback);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [categoria]);

  return { documents, loading };
}
