import { useCallback, useEffect, useState } from "react";
import { transparenciaDb } from "@/integrations/transparencia/client";
import { lerConjuntoLocal, lerRegistroLocal, temFonteLocal } from "@/lib/fontes-legislativas";

const PAGE = 1000; // limite padrão de linhas por requisição do PostgREST

interface Resultado<T> {
  data: T[];
  atualizadoEm: string | null;
}

// Lê do banco sincronizado todos os registros de um conjunto/ano, na ordem do portal.
// Devolve null quando o banco não está configurado ou ainda não tem sincronização concluída,
// para a página cair no método antigo. Com `comChave`, cada linha traz também `_chave`
// (o identificador do registro no portal, usado para abrir o detalhe).
export async function fetchTransparenciaDataset<T>(dataset: string, ano: number, comChave = false): Promise<Resultado<T> | null> {
  if (temFonteLocal(dataset)) return lerConjuntoLocal(dataset) as unknown as Resultado<T>;
  if (!transparenciaDb) return null;
  const { data: sync, error: syncError } = await transparenciaDb
    .from("transparencia_sincronizacoes")
    .select("concluido_em")
    .eq("dataset", dataset)
    .eq("ano", ano)
    .eq("status", "concluida")
    .order("concluido_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (syncError) throw syncError;
  if (!sync) return null;

  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await transparenciaDb
      .from("transparencia_registros")
      .select(comChave ? "chave, dados" : "dados")
      .eq("dataset", dataset)
      .eq("ano", ano)
      .order("ordem")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as unknown as { chave?: string; dados: T }[]).map((r) => (comChave ? { ...r.dados, _chave: r.chave } : r.dados) as T));
    if (!data || data.length < PAGE) break;
  }
  return { data: rows, atualizadoEm: sync.concluido_em };
}

// Um registro de um conjunto (ex.: a tela de detalhe "contratos-detalhe" de um contrato).
export async function fetchTransparenciaRegistro<T>(dataset: string, ano: number, chave: string): Promise<T | null> {
  if (temFonteLocal(dataset)) return lerRegistroLocal(dataset, chave) as Promise<T | null>;
  if (!transparenciaDb) return null;
  const { data, error } = await transparenciaDb
    .from("transparencia_registros")
    .select("dados")
    .eq("dataset", dataset)
    .eq("ano", ano)
    .eq("chave", chave)
    .maybeSingle();
  if (error) throw error;
  return (data?.dados as T) ?? null;
}

export function useTransparenciaDataset<T>(dataset: string, ano: number, fallback: () => Promise<Resultado<T> & { fonte: string }>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fonte, setFonte] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sincronizado = await fetchTransparenciaDataset<T>(dataset, ano).catch(() => null);
      const result = sincronizado
        ? { ...sincronizado, fonte: "Portal da Transparência (cópia sincronizada)" }
        : await fallback();
      setData(result.data);
      setFonte(result.fonte);
      setAtualizadoEm(result.atualizadoEm ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar dados do portal");
    } finally {
      setLoading(false);
    }
  }, [dataset, ano, fallback]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, fonte, atualizadoEm, reload: load };
}
