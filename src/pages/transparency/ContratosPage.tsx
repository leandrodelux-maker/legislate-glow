import { Building2 } from "lucide-react";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import ArquivosLista from "@/components/transparency/compras/ArquivosLista";
import EmpenhosLista from "@/components/transparency/compras/EmpenhosLista";
import TabelaLista, { type ColunaLista } from "@/components/transparency/compras/TabelaLista";
import { Anel, Barra, LinkOrigem, Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { brl, data, dataBr, formatar, linkProcesso, numero, type Detalhe } from "@/components/transparency/compras/formato";

// Rótulos da cópia sincronizada (scripts/sync-transparencia/datasets.mjs → contratos).
const L = { numero: "Número", ano: "Ano", modalidade: "Modalidade", situacao: "Situação", inicio: "Início", fim: "Fim da vigência", fornecedor: "Fornecedor", objeto: "Objeto", valor: "Valor", orgao: "Órgão" };
const DIA = 86_400_000;

const RESUMO: CampoResumo[] = [
  ["numero", "Número do contrato", L.numero],
  ["numeroEAnoDaLicitacao", "Licitação/Ano"],
  ["exercicioAno", "Exercício", L.ano],
  ["numeroDoProcesso", "Processo de aquisição ou contratação"],
  ["modalidade", "Modalidade", L.modalidade],
  ["situacao", "Situação", L.situacao],
  ["finalidade", "Finalidade", "Finalidade"],
  ["nomeDoOrgao", "Órgão", L.orgao],
  ["nomeDoFornecedor", "Contratado(a)", L.fornecedor],
  ["cpfOuCnpjDoFornecedor", "CPF/CNPJ do(a) contratado(a)", "CPF/CNPJ"],
  ["valor", "Valor total", L.valor],
  ["valorAditado", "Valor aditado"],
  ["valorTotal", "Valor total com aditivos"],
  ["valorExecutado", "Valor executado"],
  ["saldo", "Saldo do contrato"],
  ["data", "Início da vigência", L.inicio],
  ["vigencia", "Fim da vigência", L.fim],
  ["periodo", "Período"],
  ["dataDaPublicacao", "Data de publicação"],
  ["nomeDoFiscalDoContrato", "Fiscal do contrato", "Fiscal"],
  ["nomeDoGestorDoContrato", "Gestor do contrato"],
  ["localDaExecucaoOuEntrega", "Local da execução ou entrega"],
  ["objeto", "Objeto", L.objeto, true],
  ["numeroDeEnvioAoPncp", "Número de envio ao PNCP"],
  ["dataDeEnvioAoPncp", "Data de envio ao PNCP"],
  ["urlDoComprovanteDoEnvioAoPncp", "Publicação no PNCP", undefined, true],
];

const col = (...pares: [string, string][]): ColunaLista[] => pares.map(([campo, rotulo]) => ({ campo, rotulo }));
const ADITIVOS = col(["numero", "Número"], ["dataDaFirmatura", "Firmado em"], ["dataFinal", "Data final"], ["tipoDeAditivo", "Tipo"], ["descricao", "Descrição"], ["valorDoAcrescimo", "Acréscimo"], ["valorDoDecrescimo", "Decréscimo"], ["valor", "Valor atualizado"]);
const APOSTILAMENTOS = col(["numero", "Número"], ["data", "Data"], ["dataFinal", "Data final"], ["tipoDeAlteracao", "Tipo de alteração"], ["tipoDeApostilamento", "Tipo de apostilamento"], ["valor", "Valor"], ["valorAtualizadoDoContrato", "Valor atualizado"]);
const ALTERACOES = col(["data", "Data"], ["tipoDoProcedimento", "Tipo"], ["descricao", "Descrição"]);
const ITENS = col(["produto", "Produto"], ["descricao", "Descrição"], ["unidade", "Unidade"], ["quantidade", "Quantidade"], ["valorUnitario", "Valor unitário"], ["valorTotal", "Valor total"]);

/** Andamento da vigência hoje: % do prazo já passado e a frase para o cidadão. */
function vigencia(inicio: unknown, fim: unknown) {
  const i = data(inicio), f = data(fim);
  if (!f) return null;
  const hoje = Date.now();
  const dias = Math.ceil((f.getTime() + DIA - hoje) / DIA);
  const pct = i && f > i ? ((hoje - i.getTime()) / (f.getTime() + DIA - i.getTime())) * 100 : dias > 0 ? 0 : 100;
  const frase = dias <= 0 ? `Encerrado em ${dataBr(f)}` : i && i.getTime() > hoje ? `Começa em ${dataBr(i)}` : dias === 1 ? "Termina amanhã" : `Termina em ${dias} dias`;
  return { pct: Math.min(100, Math.max(0, pct)), dias, frase, vigente: dias > 0 };
}

// A situação vem do portal (Vigente, Em Vencimento, Encerrado, Rescindido); sem ela, sai da vigência.
const situacaoDe = (l: Linha) => { if (l[L.situacao]) return l[L.situacao]; const v = vigencia(l[L.inicio], l[L.fim]); return v ? (v.vigente ? "Vigente" : "Encerrado") : ""; };
/** "35" + "2026" → "35/2026"; "55082026" (licitação/ano colados) → "5508/2026". */
const numeroAno = (n: unknown, ano?: unknown) => {
  const s = String(n ?? "").trim();
  if (!s || s.includes("/")) return s || "—";
  if (ano) return `${s}/${ano}`;
  const m = s.match(/^(\d+)(\d{4})$/);
  return m ? `${m[1]}/${m[2]}` : s;
};

const Execucao = ({ d, linha, claro = false }: { d: Detalhe; linha: Linha; claro?: boolean }) => {
  const total = numero(d.valor ?? linha[L.valor]);
  const executado = numero(d.valorExecutado);
  if (!(total > 0) || !Number.isFinite(executado)) return null;
  const pct = (executado / total) * 100;
  return (
    <div className="flex items-center gap-4">
      <Anel pct={pct} cor="" claro={claro} tamanho={76} espessura={8}>
        <span className="text-sm font-black tabular-nums">{Math.round(pct)}%</span>
      </Anel>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <dt className="text-white/75">Executado</dt><dd className="font-bold tabular-nums">{brl(executado)}</dd>
        <dt className="text-white/75">Saldo</dt><dd className="font-bold tabular-nums">{d.saldo != null ? formatar("saldo", d.saldo) : brl(total - executado)}</dd>
      </dl>
    </div>
  );
};

const config: ConfigCompras = {
  slug: "contratos",
  situacaoDe,
  campoData: L.inicio,
  campoValor: L.valor,
  placeholderBusca: "Buscar por fornecedor, objeto, número…",
  indicadores: (linhas) => {
    const vigentes = linhas.filter((l) => /vigente|vencimento/i.test(situacaoDe(l))).length;
    const vencendo = linhas.filter((l) => /vencimento/i.test(situacaoDe(l))).length;
    const fornecedores = new Set(linhas.map((l) => l[L.fornecedor]).filter(Boolean)).size;
    return [
      { rotulo: "Contratos no ano", valor: linhas.length.toLocaleString("pt-BR") },
      { rotulo: "Vigentes hoje", valor: vigentes.toLocaleString("pt-BR"), detalhe: vencendo ? `${vencendo} perto do vencimento` : undefined },
      { rotulo: "Valor contratado", valor: brl(linhas.reduce((s, l) => s + (numero(l[L.valor]) || 0), 0)) },
      { rotulo: "Fornecedores", valor: fornecedores.toLocaleString("pt-BR"), detalhe: "empresas e pessoas contratadas" },
    ];
  },
  Cartao: ({ linha, cor }) => {
    const v = vigencia(linha[L.inicio], linha[L.fim]);
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">{linha[L.modalidade] || "Contrato"}</span>
          <SeloSituacao situacao={situacaoDe(linha)} />
        </div>
        <p className="font-display text-xl font-bold text-foreground mt-2">Contrato nº {numeroAno(linha[L.numero], linha[L.ano])}</p>
        <p className="text-sm font-semibold text-foreground mt-1 flex items-start gap-1.5">
          <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden /> {linha[L.fornecedor] || "—"}
        </p>
        <div className="flex-1"><p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{linha[L.objeto]}</p></div>
        <div className="mt-4 pt-3 border-t border-border/50">
          {v && (
            <div className="mb-3">
              <Barra pct={v.pct} cor={cor} />
              <p className="text-xs text-muted-foreground mt-1.5 flex justify-between gap-2">
                <span>{v.frase}</span><span className="tabular-nums">{linha[L.inicio]} → {linha[L.fim]}</span>
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
    const v = vigencia(d.data ?? linha[L.inicio], d.vigencia ?? linha[L.fim]);
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white/85">{String(d.modalidade ?? linha[L.modalidade] ?? "")}</span>
          <SeloSituacao situacao={String(d.situacao ?? situacaoDe(linha))} claro />
        </div>
        <h2 className="font-display text-3xl font-bold mt-1">Contrato nº {numeroAno(d.numero ?? linha[L.numero], d.exercicioAno ?? linha[L.ano])}</h2>
        <p className="text-base font-semibold mt-1">{String(d.nomeDoFornecedor ?? linha[L.fornecedor] ?? "")}</p>
        <p className="text-sm text-white/85 mt-2 leading-relaxed line-clamp-3">{String(d.objeto ?? linha[L.objeto] ?? "")}</p>
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/75">Valor total</p>
            <p className="font-display text-3xl font-bold tabular-nums">{formatar("valor", d.valor ?? linha[L.valor])}</p>
          </div>
          <Execucao d={d} linha={linha} claro />
        </div>
        {v && (
          <div className="mt-5">
            <Barra pct={v.pct} cor="" claro />
            <p className="text-xs text-white/85 mt-1.5 flex justify-between gap-2">
              <span className="font-semibold">{v.frase}</span>
              <span className="tabular-nums">{formatar("data", d.data ?? linha[L.inicio])} → {formatar("vigencia", d.vigencia ?? linha[L.fim])}</span>
            </p>
          </div>
        )}
      </>
    );
  },
  abas: ({ linha, detalhe, cor, portal }) => {
    const ls = detalhe.listas ?? {};
    const n = (k: string) => ls[k]?.length ?? 0;
    const nome = `contrato-${numeroAno(linha[L.numero], linha[L.ano]).replace(/\//g, "-")}`;
    const nLicitacao = numeroAno(detalhe.numeroEAnoDaLicitacao);
    const destino = detalhe.numeroEAnoDaLicitacao ? linkProcesso(detalhe.codigoDaLicitacao, detalhe.urlDetalhamento, nLicitacao) : null;
    const dispensa = /dispensa/i.test(String(detalhe.urlDetalhamento ?? ""));
    const licitacao = destino ? <LinkOrigem para={destino} titulo={dispensa ? "Contrato originado da dispensa ou inexigibilidade" : "Contrato originado da licitação"} numero={nLicitacao} cor={cor} /> : null;
    return [
      { id: "resumo", rotulo: "Resumo", conteudo: <>{licitacao}<Resumo campos={RESUMO} detalhe={detalhe} linha={linha} /></> },
      { id: "empenhos", rotulo: "Empenhos", contagem: n("empenhos"), conteudo: <EmpenhosLista linhas={ls.empenhos ?? []} cor={cor} portal={portal} /> },
      { id: "arquivos", rotulo: "Arquivos", contagem: n("arquivos"), conteudo: <ArquivosLista arquivos={ls.arquivos ?? []} portal={portal} /> },
      { id: "aditivos", rotulo: "Aditivos", contagem: n("aditivos"), conteudo: <TabelaLista colunas={ADITIVOS} linhas={ls.aditivos ?? []} arquivo={`${nome}-aditivos`} cor={cor} /> },
      { id: "apostilamentos", rotulo: "Apostilamentos", contagem: n("apostilamentos"), conteudo: <TabelaLista colunas={APOSTILAMENTOS} linhas={ls.apostilamentos ?? []} arquivo={`${nome}-apostilamentos`} cor={cor} /> },
      { id: "itens", rotulo: "Itens", contagem: n("itensLicitados"), conteudo: <TabelaLista colunas={ITENS} linhas={ls.itensLicitados ?? []} arquivo={`${nome}-itens`} cor={cor} barra="valorTotal" /> },
      { id: "alteracoes", rotulo: "Alterações", contagem: n("situacoesDoProcedimento"), conteudo: <TabelaLista colunas={ALTERACOES} linhas={ls.situacoesDoProcedimento ?? []} arquivo={`${nome}-alteracoes`} cor={cor} /> },
    ];
  },
};

const ContratosPage = () => <ComprasConsulta config={config} />;

export default ContratosPage;
