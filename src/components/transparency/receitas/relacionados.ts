import { useEffect, useState } from "react";
import { fetchTransparenciaDataset } from "@/hooks/useTransparenciaDataset";
import type { Linha } from "@/components/transparency/compras/ComprasConsulta";

// Outro conjunto do mesmo exercício lido uma vez por visita (ex.: as liquidações e os pagamentos de um
// empenho aberto no painel), para ligar os registros entre as páginas sem copiar nada a mais.
const cache = new Map<string, Promise<Linha[]>>();

export function carregarConjunto(conjunto: string, ano: number): Promise<Linha[]> {
  const k = `${conjunto}|${ano}`;
  if (!cache.has(k)) cache.set(k, fetchTransparenciaDataset<Linha>(conjunto, ano, true).then((r) => r?.data ?? []).catch(() => { cache.delete(k); return []; }));
  return cache.get(k)!;
}

export function useConjunto(conjunto: string, ano: number | undefined) {
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  useEffect(() => {
    if (!ano) { setLinhas([]); return; }
    let ativo = true;
    setLinhas(null);
    carregarConjunto(conjunto, ano).then((l) => ativo && setLinhas(l));
    return () => { ativo = false; };
  }, [conjunto, ano]);
  return linhas;
}
