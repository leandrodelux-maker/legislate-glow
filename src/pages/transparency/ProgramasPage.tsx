import { Target } from "lucide-react";
import { useLocation } from "@/lib/roteador-transparencia";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import TabelaLista, { type ColunaLista } from "@/components/transparency/compras/TabelaLista";
import { Anel, Barra, Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { brl, numero } from "@/components/transparency/compras/formato";

// Execução dos programas de governo (cópia "programas") e das ações e projetos do orçamento (cópia
// "acoes-projetos", posição de fechamento do ano): quanto foi previsto e quanto foi executado.
const L = { codigo: "Código", previsto: "Previsto", executado: "Executado" };

const pct = (l: Linha) => { const p = numero(l[L.previsto]); return p > 0 ? (numero(l[L.executado]) / p) * 100 : 0; };
const faixa = (l: Linha) => {
  const v = pct(l);
  if (!(numero(l[L.executado]) > 0)) return "Sem execução";
  return v > 100 ? "Acima do previsto" : v >= 75 ? "Execução acima de 75%" : v >= 25 ? "Execução entre 25% e 75%" : "Execução abaixo de 25%";
};
const formatarPct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const configExecucao = (slug: "programas" | "acoes-projetos"): ConfigCompras => {
  const titulo = slug === "programas" ? "Programa" : "Ação";
  const campoTitulo = slug === "programas" ? "Programa" : "Ação";
  const RESUMO: CampoResumo[] = slug === "programas"
    ? [["titulo", "Programa", campoTitulo, true], ["codigoDoPrograma", "Código", L.codigo], ["ano", "Ano", "Ano"], ["valorPrevisto", "Previsto", L.previsto], ["valorExecutado", "Executado", L.executado], ["objetivo", "Objetivo", undefined, true], ["publicoAlvo", "Público-alvo", undefined, true]]
    : [["tituloDaAcao", "Ação", campoTitulo, true], ["codigoDaAcao", "Código", L.codigo], ["mesAno", "Posição", "Competência"], ["valorPrevisto", "Previsto", L.previsto], ["valorExecutado", "Executado", L.executado]];
  const METAS: ColunaLista[] = [
    { campo: "codigoDoItemPpa", rotulo: "Item do PPA" },
    ...[1, 2, 3, 4].flatMap((n) => [{ campo: `metaFiscalAno${n}`, rotulo: `Meta física ano ${n}` }, { campo: `metaFinanceiraAno${n}`, rotulo: `Meta financeira ano ${n}` }]),
  ];
  return {
    slug,
    anoInicial: slug === "acoes-projetos" ? new Date().getFullYear() - 1 : undefined,
    ordemInicial: "maior",
    situacaoDe: faixa, rotuloSituacao: "Execução",
    campoData: L.codigo,
    campoValor: L.previsto,
    placeholderBusca: `Buscar ${titulo.toLowerCase()} pelo nome ou código…`,
    indicadores: (linhas) => {
      const prev = linhas.reduce((s, l) => s + (numero(l[L.previsto]) || 0), 0);
      const exec = linhas.reduce((s, l) => s + (numero(l[L.executado]) || 0), 0);
      return [
        { rotulo: slug === "programas" ? "Programas" : "Ações e projetos", valor: linhas.length.toLocaleString("pt-BR") },
        { rotulo: "Previsto", valor: brl(prev) },
        { rotulo: "Executado", valor: brl(exec) },
        { rotulo: "Execução geral", valor: prev > 0 ? formatarPct((exec / prev) * 100) : "—", detalhe: "do valor previsto" },
      ];
    },
    Cartao: ({ linha, cor }) => (
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><Target className="h-3.5 w-3.5" aria-hidden /> {titulo} {linha[L.codigo]}</span>
          <SeloSituacao situacao={faixa(linha)} />
        </div>
        <div className="flex-1"><p className="font-display text-base font-bold text-foreground mt-2 leading-snug line-clamp-3">{linha[campoTitulo]}</p></div>
        <div className="mt-4 pt-3 border-t border-border/50">
          <Barra pct={pct(linha)} cor={cor} />
          <div className="flex items-end justify-between gap-2 mt-2 text-xs">
            <span><span className="block text-muted-foreground">Executado</span><span className="font-bold text-foreground tabular-nums">{linha[L.executado]}</span></span>
            <span className="font-display text-lg font-bold tabular-nums" style={{ color: cor }}>{formatarPct(pct(linha))}</span>
            <span className="text-right"><span className="block text-muted-foreground">Previsto</span><span className="font-bold text-foreground tabular-nums">{linha[L.previsto]}</span></span>
          </div>
        </div>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        <Anel pct={pct(linha)} cor="" claro tamanho={104} espessura={10}>
          <span className="text-center leading-none">
            <span className="block font-display text-xl font-black tabular-nums">{formatarPct(pct(linha))}</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/75 mt-1">executado</span>
          </span>
        </Anel>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white/85">{titulo} {linha[L.codigo]}</p>
          <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha[campoTitulo]}</h2>
          <dl className="grid grid-cols-2 gap-3 mt-4">
            {[["Previsto", linha[L.previsto]], ["Executado", linha[L.executado]]].map(([r, v]) => (
              <div key={r} className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-white/75">{r}</dt>
                <dd className="text-lg font-bold tabular-nums">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    ),
    abas: ({ linha, detalhe, cor }) => [
      { id: "resumo", rotulo: "Resumo", conteudo: <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} /> },
      ...(slug === "acoes-projetos" ? [{
        id: "metas", rotulo: "Metas no PPA", contagem: detalhe.listas?.metas?.length ?? 0,
        conteudo: <>
          <p className="text-sm text-muted-foreground mb-4">Metas físicas (quantidade a entregar) e financeiras (valor) previstas para cada um dos quatro anos do Plano Plurianual.</p>
          <TabelaLista colunas={METAS} linhas={detalhe.listas?.metas ?? []} arquivo={`acao-${linha[L.codigo]}-metas`} cor={cor} />
        </>,
      }] : []),
    ],
  };
};

const CONFIGS = { programas: configExecucao("programas"), "acoes-projetos": configExecucao("acoes-projetos") };

const ProgramasPage = () => {
  const { pathname } = useLocation();
  const slug = pathname.endsWith("/acoes-projetos") ? "acoes-projetos" : "programas";
  return <ComprasConsulta key={slug} config={CONFIGS[slug]} />;
};

export default ProgramasPage;
