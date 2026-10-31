import { ArrowRight, Building2, CalendarClock, MapPin } from "lucide-react";
import { Link } from "@/lib/roteador-transparencia";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import ArquivosLista from "@/components/transparency/compras/ArquivosLista";
import EmpenhosLista from "@/components/transparency/compras/EmpenhosLista";
import { Anel, Barra, Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { brl, data, dataBr, formatar, numero, type Detalhe, type Registro } from "@/components/transparency/compras/formato";

// Rótulos da cópia sincronizada (scripts/sync-transparencia/datasets.mjs → obras).
// O portal não informa etapa, medição nem situação da obra: o andamento mostrado aqui é o do prazo
// previsto e o do dinheiro já pago pelos empenhos da obra.
const L = { titulo: "Título", objeto: "Objeto", bairro: "Bairro", endereco: "Endereço", valor: "Valor", inicio: "Início", fim: "Previsão de término", orgao: "Órgão" };
const DIA = 86_400_000;

const RESUMO: CampoResumo[] = [
  ["titulo", "Título", L.titulo],
  ["nomeOrgao", "Órgão", L.orgao],
  ["valor", "Valor", L.valor],
  ["dataInicial", "Data inicial", L.inicio],
  ["dataFinal", "Previsão de término", L.fim],
  ["endereco", "Endereço", L.endereco],
  ["bairro", "Bairro", L.bairro],
  ["objeto", "Objeto", L.objeto, true],
];

/** Prazo previsto da obra hoje: % decorrido, situação e frase para o cidadão. */
function prazo(inicio: unknown, fim: unknown) {
  const i = data(inicio), f = data(fim);
  if (!i && !f) return null;
  const hoje = Date.now();
  if (i && i.getTime() > hoje) return { pct: 0, situacao: "A iniciar", frase: `Início previsto para ${dataBr(i)}` };
  if (!f) return { pct: 0, situacao: "Em execução", frase: `Iniciada em ${dataBr(i!)}` };
  const fimDia = f.getTime() + DIA;
  if (fimDia <= hoje) return { pct: 100, situacao: "Prazo previsto encerrado", frase: `Prazo previsto até ${dataBr(f)}` };
  const dias = Math.ceil((fimDia - hoje) / DIA);
  const pct = i ? ((hoje - i.getTime()) / (fimDia - i.getTime())) * 100 : 0;
  return { pct, situacao: "No prazo", frase: dias === 1 ? "Prazo termina amanhã" : `Faltam ${dias} dias do prazo previsto` };
}

const situacaoDe = (l: Linha) => prazo(l[L.inicio], l[L.fim])?.situacao ?? "";

/** Quanto da obra já foi pago, somando os empenhos dela. */
function pago(d: Detalhe, valor: number) {
  const empenhos = d.listas?.empenhos ?? [];
  if (!empenhos.length || !(valor > 0)) return null;
  const soma = (k: string) => empenhos.reduce((s, e) => s + (numero(e[k]) || 0), 0);
  const p = soma("valorPago");
  return { pago: p, liquidado: soma("valorLiquidado"), empenhado: soma("valorEmpenhado"), pct: (p / valor) * 100 };
}

// Empresas contratadas para a obra: cada uma abre o contrato no painel da página de Contratos.
const Contratadas = ({ linhas, cor }: { linhas: Registro[]; cor: string }) => (
  <ul className="grid gap-2.5">
    {linhas.map((e, i) => {
      const corpo = (
        <>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}><Building2 className="h-5 w-5" aria-hidden /></span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-foreground">{String(e.nome ?? "—")}</span>
            {e.cpfOuCnpj != null && <span className="block text-xs text-muted-foreground tabular-nums">CPF/CNPJ {String(e.cpfOuCnpj)}</span>}
          </span>
          {e.codigoContrato != null && <span className="inline-flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: cor }}>Ver contrato <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>}
        </>
      );
      return (
        <li key={i}>
          {e.codigoContrato != null ? (
            <Link to={`/transparencia/contratos?registro=${e.codigoContrato}`} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4 hover:shadow-lg hover:border-transparent transition">{corpo}</Link>
          ) : <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4">{corpo}</div>}
        </li>
      );
    })}
  </ul>
);

const config: ConfigCompras = {
  slug: "obras",
  acumulado: true,
  situacaoDe,
  campoData: L.inicio,
  campoValor: L.valor,
  placeholderBusca: "Buscar por obra, bairro, endereço…",
  indicadores: (linhas) => {
    const conta = (s: string) => linhas.filter((l) => situacaoDe(l) === s).length;
    const bairros = new Set(linhas.map((l) => l[L.bairro]).filter(Boolean)).size;
    return [
      { rotulo: "Obras cadastradas", valor: linhas.length.toLocaleString("pt-BR"), detalhe: bairros ? `em ${bairros} bairro(s) e localidade(s)` : undefined },
      { rotulo: "Dentro do prazo", valor: conta("No prazo").toLocaleString("pt-BR"), detalhe: conta("A iniciar") ? `${conta("A iniciar")} a iniciar` : undefined },
      { rotulo: "Prazo previsto encerrado", valor: conta("Prazo previsto encerrado").toLocaleString("pt-BR") },
      { rotulo: "Investimento total", valor: brl(linhas.reduce((s, l) => s + (numero(l[L.valor]) || 0), 0)) },
    ];
  },
  Cartao: ({ linha, cor }) => {
    const p = prazo(linha[L.inicio], linha[L.fim]);
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">{linha[L.orgao] || "Obra"}</span>
          <SeloSituacao situacao={p?.situacao} />
        </div>
        <p className="font-display text-lg font-bold text-foreground mt-2 leading-snug line-clamp-2">{linha[L.titulo] || linha[L.objeto]}</p>
        {(linha[L.bairro] || linha[L.endereco]) && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 mt-px shrink-0" aria-hidden /> {linha[L.bairro] || linha[L.endereco]}
          </p>
        )}
        <div className="flex-1"><p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{linha[L.objeto]}</p></div>
        <div className="mt-4 pt-3 border-t border-border/50">
          {p && (
            <div className="mb-3">
              <Barra pct={p.pct} cor={cor} />
              <p className="text-xs text-muted-foreground mt-1.5 flex justify-between gap-2">
                <span>{p.frase}</span><span className="tabular-nums whitespace-nowrap">{linha[L.inicio]} → {linha[L.fim]}</span>
              </p>
            </div>
          )}
          <p className="text-right text-lg font-bold text-foreground tabular-nums">{linha[L.valor] || "—"}</p>
        </div>
      </div>
    );
  },
  cabecalho: ({ linha, detalhe }) => {
    const d = detalhe ?? {};
    const valor = numero(d.valor ?? linha[L.valor]);
    const p = prazo(d.dataInicial ?? linha[L.inicio], d.dataFinal ?? linha[L.fim]);
    const dinheiro = detalhe ? pago(detalhe, valor) : null;
    const local = [d.endereco ?? linha[L.endereco], d.bairro ?? linha[L.bairro]].filter(Boolean).join(" · ");
    return (
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        {dinheiro && (
          <Anel pct={dinheiro.pct} cor="" claro tamanho={112} espessura={10}>
            <span className="text-center leading-none">
              <span className="block font-display text-2xl font-black tabular-nums">{Math.round(dinheiro.pct)}%</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/75 mt-1">já pago</span>
            </span>
          </Anel>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white/85">{String(d.nomeOrgao ?? linha[L.orgao] ?? "")}</span>
            {p && <SeloSituacao situacao={p.situacao} claro />}
          </div>
          <h2 className="font-display text-2xl font-bold mt-1 leading-tight">{String(d.titulo ?? linha[L.titulo] ?? linha[L.objeto] ?? "")}</h2>
          {local && <p className="text-sm text-white/90 mt-1.5 inline-flex items-start gap-1.5"><MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden /> {local}</p>}
          <dl className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-white/75">Valor da obra</dt>
              <dd className="text-lg font-bold tabular-nums">{formatar("valor", d.valor ?? linha[L.valor])}</dd>
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-white/75">{dinheiro ? "Pago até agora" : "Previsão de término"}</dt>
              <dd className="text-lg font-bold tabular-nums">{dinheiro ? brl(dinheiro.pago) : formatar("dataFinal", d.dataFinal ?? linha[L.fim])}</dd>
            </div>
          </dl>
          {p && (
            <div className="mt-4">
              <Barra pct={p.pct} cor="" claro />
              <p className="text-xs text-white/85 mt-1.5 flex justify-between gap-2">
                <span className="font-semibold inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" aria-hidden /> {p.frase}</span>
                <span className="tabular-nums">{formatar("dataInicial", d.dataInicial ?? linha[L.inicio])} → {formatar("dataFinal", d.dataFinal ?? linha[L.fim])}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
  abas: ({ linha, detalhe, cor, portal }) => {
    const ls = detalhe.listas ?? {};
    const n = (k: string) => ls[k]?.length ?? 0;
    return [
      { id: "resumo", rotulo: "Resumo", conteudo: <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} /> },
      { id: "empenhos", rotulo: "Empenhos", contagem: n("empenhos"), conteudo: <EmpenhosLista linhas={ls.empenhos ?? []} cor={cor} portal={portal} /> },
      { id: "contratadas", rotulo: "Contratadas", contagem: n("empresasContratadas"), conteudo: <Contratadas linhas={ls.empresasContratadas ?? []} cor={cor} /> },
      { id: "arquivos", rotulo: "Arquivos", contagem: n("arquivos"), conteudo: <ArquivosLista arquivos={ls.arquivos ?? []} portal={portal} /> },
    ];
  },
};

const ObrasPage = () => <ComprasConsulta config={config} />;

export default ObrasPage;
