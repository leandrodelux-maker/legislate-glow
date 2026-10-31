import { data, numero } from "@/components/transparency/compras/formato";
import type { Linha } from "@/components/transparency/compras/ComprasConsulta";

// Contas da análise das páginas de Receitas e Despesas (somas, agrupamentos e percentuais).

export interface Grupo { rotulo: string; valor: number; qtd: number; busca?: string }

export const somar = (linhas: Linha[], campo: string) => linhas.reduce((s, l) => s + (numero(l[campo]) || 0), 0);

/** Soma `valor` por grupo (`chave` vazia fica de fora), do maior para o menor. */
export function agrupar(linhas: Linha[], chave: (l: Linha) => string | undefined, valor: (l: Linha) => number = () => 1): Grupo[] {
  const m = new Map<string, Grupo>();
  for (const l of linhas) {
    const k = chave(l)?.trim();
    if (!k) continue;
    const g = m.get(k) ?? { rotulo: k, valor: 0, qtd: 0 };
    g.valor += valor(l) || 0; g.qtd += 1;
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => b.valor - a.valor);
}

export const pct = (parte: number, todo: number) => (todo ? Math.round((parte / todo) * 1000) / 10 : 0);

export const mesDaData = (campo: string) => (l: Linha) => { const d = data(l[campo]); return d ? d.getMonth() + 1 : undefined; };
