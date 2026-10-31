import { Building2, CalendarDays, Package } from "lucide-react";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import ArquivosLista from "@/components/transparency/compras/ArquivosLista";
import TabelaLista, { type ColunaLista } from "@/components/transparency/compras/TabelaLista";
import { LinkOrigem, Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { brl, formatar, linkProcesso, numero } from "@/components/transparency/compras/formato";

// Rótulos da cópia sincronizada (scripts/sync-transparencia/datasets.mjs → ordem-de-fornecimento).
// Cada ordem é um pedido de entrega a um fornecedor, emitido a partir de uma licitação ou dispensa.
const L = { compra: "Compra", modalidade: "Modalidade", licitacao: "Licitação", data: "Data", fornecedor: "Fornecedor", valor: "Valor", situacao: "Situação" };

const RESUMO: CampoResumo[] = [
  ["codigoDaCompra", "Nº da compra", L.compra],
  ["data", "Data", L.data],
  ["situacao", "Situação", L.situacao],
  ["modalidade", "Modalidade", L.modalidade],
  ["licitacao", "Licitação/Ano", L.licitacao],
  ["tipoDeCompra", "Tipo de compra"],
  ["departamento", "Departamento"],
  ["fornecedor", "Fornecedor", L.fornecedor],
  ["valorTotalGeral", "Valor total", L.valor],
  ["valorTotalAnulado", "Valor anulado"],
  ["descontoGeral", "Descontos"],
  ["valorFinal", "Valor final"],
  ["historico", "Histórico", undefined, true],
];

const PRODUTOS: ColunaLista[] = [
  { campo: "nome", rotulo: "Produto" },
  { campo: "unidade", rotulo: "Unidade" },
  { campo: "quantidade", rotulo: "Quantidade" },
  { campo: "valorUnitario", rotulo: "Valor unitário" },
  { campo: "valorTotal", rotulo: "Valor total" },
  { campo: "valorAnulado", rotulo: "Anulado" },
  { campo: "valorFinal", rotulo: "Valor final" },
];

const config: ConfigCompras = {
  slug: "ordem-de-fornecimento",
  situacaoDe: (l: Linha) => l[L.situacao],
  campoData: L.data,
  campoValor: L.valor,
  placeholderBusca: "Buscar por fornecedor, licitação, número…",
  indicadores: (linhas) => {
    const total = linhas.reduce((s, l) => s + (numero(l[L.valor]) || 0), 0);
    const fornecedores = new Set(linhas.map((l) => l[L.fornecedor]).filter(Boolean)).size;
    const anuladas = linhas.filter((l) => /anulad|cancel/i.test(l[L.situacao] ?? "")).length;
    return [
      { rotulo: "Ordens no ano", valor: linhas.length.toLocaleString("pt-BR"), detalhe: anuladas ? `${anuladas} anulada(s)` : undefined },
      { rotulo: "Valor pedido", valor: brl(total) },
      { rotulo: "Fornecedores", valor: fornecedores.toLocaleString("pt-BR") },
      { rotulo: "Valor médio", valor: linhas.length ? brl(total / linhas.length) : "—", detalhe: "por ordem de fornecimento" },
    ];
  },
  Cartao: ({ linha }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">
          {[linha[L.modalidade], linha[L.licitacao]].filter(Boolean).join(" · ") || "Ordem de fornecimento"}
        </span>
        <SeloSituacao situacao={linha[L.situacao]} />
      </div>
      <p className="font-display text-xl font-bold text-foreground mt-2">Ordem nº {linha[L.compra]}</p>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground mt-1 flex items-start gap-1.5">
          <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden /> <span className="line-clamp-2">{linha[L.fornecedor] || "—"}</span>
        </p>
      </div>
      <div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {linha[L.data] || "—"}
        </span>
        <span className="text-base font-bold text-foreground tabular-nums">{linha[L.valor] || "—"}</span>
      </div>
    </div>
  ),
  cabecalho: ({ linha, detalhe }) => {
    const d = detalhe ?? {};
    const valores: [string, unknown][] = [
      ["Valor total", d.valorTotalGeral ?? linha[L.valor]],
      ["Anulado", d.valorTotalAnulado],
      ["Descontos", d.descontoGeral],
      ["Valor final", d.valorFinal],
    ];
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white/85">{[d.tipoDeCompra, d.departamento].filter(Boolean).join(" · ") || String(linha[L.modalidade] ?? "")}</span>
          <SeloSituacao situacao={String(d.situacao ?? linha[L.situacao] ?? "")} claro />
        </div>
        <h2 className="font-display text-3xl font-bold mt-1">Ordem nº {String(d.codigoDaCompra ?? linha[L.compra])}</h2>
        <p className="text-base font-semibold mt-1">{String(d.fornecedor ?? linha[L.fornecedor] ?? "")}</p>
        {d.historico != null && <p className="text-sm text-white/85 mt-2 leading-relaxed line-clamp-3">{String(d.historico)}</p>}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {valores.filter(([, v]) => v != null && v !== "").map(([rotulo, v]) => (
            <div key={rotulo} className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-white/75">{rotulo}</dt>
              <dd className="text-base font-bold tabular-nums">{formatar("valor", v)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-white/80 mt-4 inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> Emitida em {formatar("data", d.data ?? linha[L.data])}</p>
      </>
    );
  },
  abas: ({ linha, detalhe, cor, portal }) => {
    const ls = detalhe.listas ?? {};
    const n = (k: string) => ls[k]?.length ?? 0;
    const numeroOrigem = String(detalhe.licitacao ?? linha[L.licitacao] ?? "");
    const destino = numeroOrigem ? linkProcesso(detalhe.codigoDaLicitacao, detalhe.urlDetalhamento, numeroOrigem) : null;
    const dispensa = /dispensa/i.test(String(detalhe.urlDetalhamento ?? detalhe.modalidade ?? linha[L.modalidade] ?? ""));
    return [
      {
        id: "resumo", rotulo: "Resumo",
        conteudo: <>
          {destino && <LinkOrigem para={destino} titulo={dispensa ? "Pedido feito a partir da dispensa ou inexigibilidade" : "Pedido feito a partir da licitação"} numero={numeroOrigem} cor={cor} />}
          <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} />
        </>,
      },
      {
        id: "produtos", rotulo: "Produtos", contagem: n("produtos"),
        conteudo: <>
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5"><Package className="h-4 w-4" aria-hidden /> O que foi pedido ao fornecedor nesta ordem.</p>
          <TabelaLista colunas={PRODUTOS} linhas={ls.produtos ?? []} arquivo={`ordem-${linha[L.compra]}-produtos`} cor={cor} barra="valorFinal" />
        </>,
      },
      { id: "arquivos", rotulo: "Arquivos", contagem: n("arquivos"), conteudo: <ArquivosLista arquivos={ls.arquivos ?? []} portal={portal} /> },
    ];
  },
};

const OrdemFornecimentoPage = () => <ComprasConsulta config={config} />;

export default OrdemFornecimentoPage;
