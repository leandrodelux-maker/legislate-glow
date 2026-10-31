import { useState, type ReactNode } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { brl } from "@/components/transparency/compras/formato";
import { pct, type Grupo } from "./calculos";
import type { Linha } from "@/components/transparency/compras/ComprasConsulta";

// Peças da análise ("panorama") das páginas de Receitas e Despesas: rankings, mês a mês e o funil da
// despesa. Uma cor só por gráfico (magnitude) e o número sempre escrito ao lado, nunca só a cor.

const compacto = (n: number) => n >= 1e6 ? `R$ ${(n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi` : n >= 1e3 ? `R$ ${(n / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil` : brl(n);

export const Cartao = ({ titulo, descricao, children, className = "" }: { titulo: string; descricao?: string; children: ReactNode; className?: string }) => (
  <section className={`rounded-3xl border border-border/60 bg-card p-5 md:p-6 ${className}`}>
    <h2 className="font-display text-base font-bold text-foreground">{titulo}</h2>
    {descricao && <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

/** Ranking em barras horizontais; com `aoEscolher`, cada linha filtra a lista da página. */
export const Ranking = ({ itens, cor, limite = 6, moeda = true, aoEscolher, rotuloQtd = "registro" }: {
  itens: Grupo[]; cor: string; limite?: number; moeda?: boolean; aoEscolher?: (g: Grupo) => void; rotuloQtd?: string;
}) => {
  const [todos, setTodos] = useState(false);
  const total = itens.reduce((s, i) => s + i.valor, 0);
  const max = Math.max(1, ...itens.map((i) => i.valor));
  const visiveis = todos ? itens : itens.slice(0, limite);
  if (!itens.length) return <p className="text-sm text-muted-foreground py-4 text-center">Sem registros no período.</p>;
  return (
    <>
      <ol className="space-y-3">
        {visiveis.map((g, i) => {
          const conteudo = (
            <>
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 text-foreground"><span className="text-muted-foreground tabular-nums mr-1.5">{i + 1}.</span>{g.rotulo}</span>
                <span className="shrink-0 tabular-nums text-right"><strong className="text-foreground">{moeda ? compacto(g.valor) : g.valor.toLocaleString("pt-BR")}</strong> <span className="text-xs text-muted-foreground">{pct(g.valor, total).toLocaleString("pt-BR")}%</span></span>
              </span>
              <span className="mt-1.5 flex items-center gap-2">
                <span className="flex-1 h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
                  <span className="block h-full rounded-full" style={{ width: `${Math.max(0, g.valor / max) * 100}%`, minWidth: g.valor > 0 ? 4 : 0, backgroundColor: cor }} />
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{g.qtd.toLocaleString("pt-BR")} {rotuloQtd}{g.qtd === 1 ? "" : "s"}</span>
              </span>
            </>
          );
          return (
            <li key={g.rotulo}>
              {aoEscolher ? (
                <button type="button" onClick={() => aoEscolher(g)} title={`Mostrar na lista: ${g.rotulo}`}
                  className="group w-full text-left rounded-lg -mx-1.5 px-1.5 py-0.5 hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                  {conteudo}
                </button>
              ) : conteudo}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {aoEscolher && <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Filter className="h-3 w-3" aria-hidden /> Toque para ver na lista</span>}
        {itens.length > limite && (
          <button type="button" onClick={() => setTodos(!todos)} className="ml-auto text-xs font-semibold inline-flex items-center gap-1 hover:underline underline-offset-2" style={{ color: cor }}>
            {todos ? "Mostrar menos" : `Ver todos (${itens.length})`} <ChevronDown className={`h-3.5 w-3.5 transition ${todos ? "rotate-180" : ""}`} aria-hidden />
          </button>
        )}
      </div>
    </>
  );
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Colunas por mês (1 a 12) a partir de uma data dd/mm/aaaa ou do número do mês. */
export const MesAMes = ({ linhas, mes, valor, cor, moeda = true }: { linhas: Linha[]; mes: (l: Linha) => number | undefined; valor: (l: Linha) => number; cor: string; moeda?: boolean }) => {
  const somas = Array.from({ length: 12 }, () => 0);
  for (const l of linhas) { const m = mes(l); if (m && m >= 1 && m <= 12) somas[m - 1] += valor(l) || 0; }
  const ultimo = somas.reduce((u, v, i) => (v ? i : u), -1);
  const max = Math.max(1, ...somas);
  const fmt = (v: number) => (moeda ? compacto(v) : v.toLocaleString("pt-BR"));
  if (ultimo < 0) return <p className="text-sm text-muted-foreground py-4 text-center">Sem registros no período.</p>;
  const pico = somas.indexOf(Math.max(...somas));
  return (
    <div>
      <ol className="flex items-end gap-1.5 h-40" aria-label="Valores por mês">
        {somas.map((v, i) => (
          <li key={i} className="group relative flex-1 h-full flex flex-col justify-end items-center">
            <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 group-hover:opacity-100 transition z-10">
              {MESES[i]}: {fmt(v)}
            </span>
            <span className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80" title={`${MESES[i]}: ${fmt(v)}`}
              style={{ height: `${(v / max) * 100}%`, minHeight: v ? 3 : 0, backgroundColor: cor, opacity: i > ultimo ? 0.25 : 1 }} />
            <span className="sr-only">{MESES[i]}: {fmt(v)}</span>
          </li>
        ))}
      </ol>
      <div className="flex gap-1.5 mt-2 border-t border-border/60 pt-1.5" aria-hidden>
        {MESES.map((m, i) => <span key={m} className={`flex-1 text-center text-[10px] ${i === pico ? "font-bold text-foreground" : "text-muted-foreground"}`}>{m}</span>)}
      </div>
      <p className="text-xs text-muted-foreground mt-3">Maior mês: <strong className="text-foreground">{MESES[pico]}</strong>, com {fmt(somas[pico])}.</p>
    </div>
  );
};

/** Etapas da despesa (orçado → empenhado → liquidado → pago), cada uma em relação à primeira. */
export const Funil = ({ etapas, cor }: { etapas: { rotulo: string; valor: number; nota?: string }[]; cor: string }) => {
  const base = etapas[0]?.valor || 1;
  return (
    <ol className="space-y-3.5">
      {etapas.map((e, i) => (
        <li key={e.rotulo}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-foreground">{e.rotulo}{e.nota && <span className="font-normal text-xs text-muted-foreground"> · {e.nota}</span>}</span>
            <span className="text-sm tabular-nums"><strong className="text-foreground">{brl(e.valor)}</strong>{i > 0 && <span className="text-xs text-muted-foreground ml-1.5">{pct(e.valor, base).toLocaleString("pt-BR")}%</span>}</span>
          </div>
          <div className="mt-1.5 h-3 rounded-full bg-muted overflow-hidden" aria-hidden>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (e.valor / base) * 100)}%`, backgroundColor: cor, opacity: 1 - i * 0.18 }} />
          </div>
        </li>
      ))}
    </ol>
  );
};
