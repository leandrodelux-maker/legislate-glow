import { CalendarDays, MapPin, Plane } from "lucide-react";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import BotaoLei from "@/components/transparency/compras/BotaoLei";
import TabelaLista, { type ColunaLista } from "@/components/transparency/compras/TabelaLista";
import { Resumo, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { brl, formatar, numero } from "@/components/transparency/compras/formato";

// Rótulos da cópia sincronizada (scripts/sync-transparencia/datasets.mjs → diarias). "Valor" é o valor
// de cada diária: o total da viagem é valor × número de diárias (confere com a ordem de pagamento).
const L = { servidor: "Servidor", matricula: "Matrícula", cargo: "Cargo", destino: "Destino", saida: "Saída", chegada: "Chegada", diarias: "Diárias", valor: "Valor", motivo: "Motivo", liquidacao: "Liquidação" };

const totalDe = (l: Linha) => (numero(l[L.valor]) || 0) * (numero(l[L.diarias]) || 1);
const quantidade = (v: unknown) => { const n = numero(v); return Number.isFinite(n) ? n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—"; };

const RESUMO: CampoResumo[] = [
  ["nomeDoFuncionario", "Servidor", L.servidor],
  ["matriculaDoFuncionario", "Matrícula", L.matricula],
  ["cargoDoFuncionario", "Cargo", L.cargo],
  ["nomeDoOrgao", "Órgão"],
  ["destino", "Destino", L.destino],
  ["dataDaSaida", "Saída", L.saida],
  ["dataDaChegada", "Chegada", L.chegada],
  ["numeroDeDiarias", "Número de diárias", L.diarias],
  ["valorDaDiaria", "Valor de cada diária", L.valor],
  ["portaria", "Portaria"],
  ["numeroDoProcesso", "Processo"],
  ["numeroDoEmpenho", "Empenho"],
  ["numeroDaLiquidacao", "Liquidação", L.liquidacao],
  ["valorDaDevolucao", "Valor devolvido"],
  ["tipoDeDevolucao", "Tipo de devolução"],
  ["historicoDaDevolucao", "Histórico da devolução", undefined, true],
  ["motivoDaViagem", "Motivo da viagem", L.motivo, true],
];

const PAGAMENTOS: ColunaLista[] = [
  { campo: "numero", rotulo: "Ordem de pagamento" },
  { campo: "dataPagamento", rotulo: "Data" },
  { campo: "valor", rotulo: "Valor pago" },
];
const ANULACOES: ColunaLista[] = [{ campo: "data", rotulo: "Data" }, { campo: "valor", rotulo: "Valor anulado" }];

const lei = (cor: string) => (
  <BotaoLei rotulo="Legislação de diárias" descricao="Valores das diárias definidos pela legislação municipal." origem={{ local: 1, tipo: 12 }} cor={cor} />
);

const config: ConfigCompras = {
  slug: "diarias",
  rotuloSituacao: "Destino",
  situacaoDe: (l) => (/goi[aâ]nia/i.test(l[L.destino] ?? "") ? "Goiânia" : l[L.destino] ? "Outros destinos" : ""),
  campoData: L.saida,
  campoValor: L.valor,
  placeholderBusca: "Buscar por servidor, destino, motivo…",
  acoes: lei,
  indicadores: (linhas) => {
    const total = linhas.reduce((s, l) => s + totalDe(l), 0);
    const dias = linhas.reduce((s, l) => s + (numero(l[L.diarias]) || 0), 0);
    const servidores = new Set(linhas.map((l) => l[L.matricula]).filter(Boolean)).size;
    const destinos = new Map<string, number>();
    for (const l of linhas) if (l[L.destino]) destinos.set(l[L.destino].toUpperCase(), (destinos.get(l[L.destino].toUpperCase()) ?? 0) + 1);
    const [principal] = [...destinos.entries()].sort((a, b) => b[1] - a[1]);
    return [
      { rotulo: "Viagens no ano", valor: linhas.length.toLocaleString("pt-BR"), detalhe: `${dias.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} diárias concedidas` },
      { rotulo: "Valor em diárias", valor: brl(total) },
      { rotulo: "Servidores", valor: servidores.toLocaleString("pt-BR"), detalhe: "receberam diárias" },
      { rotulo: "Destino mais frequente", valor: principal?.[0] ?? "—", detalhe: principal ? `${principal[1]} viagem(ns)` : undefined },
    ];
  },
  Cartao: ({ linha, cor }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: cor }}>
          <MapPin className="h-3.5 w-3.5" aria-hidden /> {linha[L.destino] || "Destino não informado"}
        </span>
        <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">{quantidade(linha[L.diarias])} diária(s)</span>
      </div>
      <p className="font-display text-lg font-bold text-foreground mt-2 leading-snug">{linha[L.servidor]}</p>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{linha[L.cargo]}</p>
      <div className="flex-1"><p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{linha[L.motivo]}</p></div>
      <div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {linha[L.saida]}{linha[L.chegada] && linha[L.chegada] !== linha[L.saida] ? ` → ${linha[L.chegada]}` : ""}
        </span>
        <span className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</span>
          <span className="block text-base font-bold text-foreground tabular-nums">{brl(totalDe(linha))}</span>
        </span>
      </div>
    </div>
  ),
  cabecalho: ({ linha, detalhe }) => {
    const d = detalhe ?? {};
    return (
      <>
        <p className="text-sm font-semibold text-white/85 inline-flex items-center gap-1.5"><Plane className="h-4 w-4" aria-hidden /> Viagem a {String(d.destino ?? linha[L.destino] ?? "—")}</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-1">{linha[L.servidor]}</h2>
        <p className="text-sm text-white/85 mt-0.5">{[linha[L.cargo], d.nomeDoOrgao].filter(Boolean).join(" · ")}</p>
        <dl className="grid grid-cols-3 gap-3 mt-5">
          {[
            ["Período", `${formatar("data", d.dataDaSaida ?? linha[L.saida])}${(d.dataDaChegada ?? linha[L.chegada]) !== (d.dataDaSaida ?? linha[L.saida]) ? ` a ${formatar("data", d.dataDaChegada ?? linha[L.chegada])}` : ""}`],
            ["Diárias", `${quantidade(linha[L.diarias])} × ${brl(numero(linha[L.valor]) || 0)}`],
            ["Total", brl(totalDe(linha))],
          ].map(([r, v]) => (
            <div key={r} className="rounded-2xl px-3.5 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-white/75">{r}</dt>
              <dd className="text-sm sm:text-base font-bold tabular-nums mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </>
    );
  },
  abas: ({ linha, detalhe, cor }) => {
    const ls = detalhe.listas ?? {};
    const n = (k: string) => ls[k]?.length ?? 0;
    return [
      { id: "resumo", rotulo: "Resumo", conteudo: <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} /> },
      { id: "pagamentos", rotulo: "Pagamentos", contagem: n("ordensDePagamento"), conteudo: <TabelaLista colunas={PAGAMENTOS} linhas={ls.ordensDePagamento ?? []} arquivo={`diaria-${linha._chave}-pagamentos`} cor={cor} /> },
      { id: "anulacoes", rotulo: "Anulações", contagem: n("anulacoesDeLiquidacoes"), conteudo: <TabelaLista colunas={ANULACOES} linhas={ls.anulacoesDeLiquidacoes ?? []} arquivo={`diaria-${linha._chave}-anulacoes`} cor={cor} /> },
      { id: "lei", rotulo: "Legislação", conteudo: <div className="rounded-2xl border border-border/60 p-5"><p className="text-sm text-muted-foreground mb-4">Os valores das diárias são definidos pela legislação municipal.</p>{lei(cor)}</div> },
    ];
  },
};

const DiariasPage = () => <ComprasConsulta config={config} />;

export default DiariasPage;
