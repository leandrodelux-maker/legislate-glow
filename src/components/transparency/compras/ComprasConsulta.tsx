import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "@/lib/roteador-transparencia";
import { Check, Clock, ExternalLink, FileSpreadsheet, Inbox, Link2, Loader2, MessageCircleQuestion, RefreshCw, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { findItem, itemHref, portalUrl } from "@/data/transparenciaCatalogo";
import { fetchTransparenciaDataset, fetchTransparenciaRegistro } from "@/hooks/useTransparenciaDataset";
import { useTransparenciaUrls } from "@/hooks/useTransparenciaUrls";
import { baixarCsv, data, normalizar, numero, rotuloCompetencia, type Detalhe } from "./formato";

export type Linha = Record<string, string> & { _chave: string };

export interface Aba { id: string; rotulo: string; contagem?: number; conteudo: ReactNode }
export interface Indicador { rotulo: string; valor: string; detalhe?: string; /** cor do valor e da faixa (ex.: proventos em verde) */ cor?: string }

export interface ConfigCompras {
  /** Item do catálogo; também é o conjunto sincronizado, salvo `conjunto`. O detalhe fica em "<conjunto>-detalhe". */
  slug: string;
  /** Conjunto lido quando difere do slug (Servidores e Folha leem a mesma cópia "folha"). */
  conjunto?: string;
  /** Conjuntos mensais: seletor da competência (campo da lista, ex.: "09/2026"); começa na mais recente. */
  /** Com `todos`, a lista começa com todos os períodos e a opção traz esse rótulo (ex.: "Todos os anos"). */
  periodo?: { campo: string; rotulo: string; todos?: string };
  /** Situação já filtrada ao abrir (ex.: só decretos em /transparencia/decretos). */
  situacaoInicial?: string;
  /** "lista": uma linha por registro (folha), em vez da grade de cartões. */
  layout?: "lista";
  /** Rótulo da caixa de seleção da situação (padrão: "Situação"). */
  rotuloSituacao?: string;
  /** Órgão de cada registro, para a caixa de seleção (padrão: o campo "Órgão" da lista, sem o código). */
  orgaoDe?: (l: Linha) => string | undefined;
  /** Rótulo da caixa de seleção do órgão (padrão: "Órgão"). */
  rotuloOrgao?: string;
  /** Completa os registros depois de lidos (ex.: órgão da liquidação, que vem do empenho). */
  enriquecer?: (linhas: Linha[], ano: number) => Promise<Linha[]>;
  /** Só parte dos registros tem cópia do detalhe (ex.: os que têm anulação): os demais não mostram aviso. */
  detalheOpcional?: boolean;
  /** Esconde a escolha de ordenação (a lista fica na ordem de `ordemInicial`). */
  semOrdenacao?: boolean;
  /** Exercício ao abrir a página, quando o do ano corrente ainda não é publicado (ações: fechamento do ano). */
  anoInicial?: number;
  /** Ordenação ao abrir a página (padrão: mais recentes). */
  ordemInicial?: Ordem;
  /** Botões extras na barra de consulta (ex.: a lei que regulamenta o assunto). */
  acoes?: (cor: string) => ReactNode;
  /** Cadastro sem exercício (obras): a cópia fica no ano corrente (na falta dela, vale a do ano anterior). */
  acumulado?: boolean;
  /** Conjunto sem cópia do detalhe: o painel é montado só com os dados da lista. */
  semDetalhe?: boolean;
  /** Análise dos registros do período entre os indicadores e a lista (rankings, mês a mês...);
   *  `filtrar` põe um texto na busca da lista (ex.: tocar num fornecedor do ranking). */
  panorama?: (p: { linhas: Linha[]; cor: string; filtrar: (texto: string) => void }) => ReactNode;
  /** Situação usada nos filtros e no selo do cartão. */
  situacaoDe: (l: Linha) => string;
  /** Descarta linhas sem conteúdo que o portal às vezes lista. */
  filtrar?: (l: Linha) => boolean;
  campoData: string;
  campoValor: string;
  placeholderBusca: string;
  indicadores: (linhas: Linha[]) => Indicador[];
  Cartao: (p: { linha: Linha; cor: string }) => React.JSX.Element;
  /** Topo do painel de detalhe (título, situação e números principais). */
  cabecalho: (p: { linha: Linha; detalhe: Detalhe | null; cor: string }) => ReactNode;
  /** `linhas`: todos os registros do ano (ex.: histórico de pagamentos do servidor em outros meses). */
  abas: (p: { linha: Linha; detalhe: Detalhe; cor: string; portal?: string; linhas: Linha[] }) => Aba[];
}

const ANO_ATUAL = new Date().getFullYear();
const ANOS = [ANO_ATUAL, ANO_ATUAL - 1, ANO_ATUAL - 2, ANO_ATUAL - 3];
const LOTE = 24;

export type Ordem = "recentes" | "antigos" | "maior" | "menor";

// Página das consultas de compras públicas: indicadores do ano, filtro por situação, cartões e um painel
// lateral com tudo o que o portal mostra no detalhe (listas e arquivos para baixar). O registro aberto
// fica no endereço (?registro=), então o link do painel pode ser compartilhado.
const ComprasConsulta = ({ config }: { config: ConfigCompras }) => {
  const item = findItem(config.slug)!;
  const cor = item.tema.color;
  const { urls } = useTransparenciaUrls();
  const portal = portalUrl(item, `${urls.base_url}/`);
  const [params, setParams] = useSearchParams();
  const anoPadrao = config.anoInicial ?? ANO_ATUAL;
  const ano = config.acumulado ? ANO_ATUAL : Number(params.get("ano")) || anoPadrao;
  const chaveAberta = params.get("registro");
  const conjunto = config.conjunto ?? config.slug;

  // sincronizado: já existe cópia concluída (mesmo vazia: o portal não tem nada publicado).
  const [estado, setEstado] = useState<{ carregando: boolean; linhas: Linha[]; atualizado: string | null; sincronizado: boolean; ano: number }>({ carregando: true, linhas: [], atualizado: null, sincronizado: false, ano });
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<string | null>(config.situacaoInicial ?? null);
  const [ordem, setOrdem] = useState<Ordem>(config.ordemInicial ?? "recentes");
  const [limite, setLimite] = useState(LOTE);
  const [detalhe, setDetalhe] = useState<{ chave: string; carregando: boolean; dados: Detalhe | null } | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setEstado((e) => ({ ...e, carregando: true }));
    (async () => {
      let r = await fetchTransparenciaDataset<Linha>(conjunto, ano, true), anoLido = ano;
      // Cadastro sem exercício cuja cópia do ano corrente ainda não ficou pronta: mostra a do ano anterior.
      if (!r && config.acumulado) { anoLido = ano - 1; r = await fetchTransparenciaDataset<Linha>(conjunto, anoLido, true); }
      let linhas = (r?.data ?? []).filter((l) => !config.filtrar || config.filtrar(l));
      if (config.enriquecer && linhas.length) linhas = await config.enriquecer(linhas, anoLido);
      setEstado({ carregando: false, linhas, atualizado: r?.atualizadoEm ?? null, sincronizado: !!r, ano: anoLido });
    })().catch(() => setEstado({ carregando: false, linhas: [], atualizado: null, sincronizado: false, ano }));
    setSituacao(config.situacaoInicial ?? null); setBusca(""); setLimite(LOTE);
  }, [config, conjunto, ano]);

  useEffect(() => {
    if (!chaveAberta) { setDetalhe(null); return; }
    if (config.semDetalhe) { setDetalhe({ chave: chaveAberta, carregando: false, dados: { listas: {} } }); return; }
    if (estado.carregando) return;
    setDetalhe({ chave: chaveAberta, carregando: true, dados: null });
    fetchTransparenciaRegistro<Detalhe>(`${conjunto}-detalhe`, estado.ano, chaveAberta)
      .then((d) => setDetalhe({ chave: chaveAberta, carregando: false, dados: d }))
      .catch(() => setDetalhe({ chave: chaveAberta, carregando: false, dados: null }));
  }, [chaveAberta, conjunto, estado.ano, estado.carregando, config.semDetalhe]);

  const mudarParam = (k: string, v: string | null) => setParams((p) => { const n = new URLSearchParams(p); if (v == null) n.delete(k); else n.set(k, v); return n; }, { replace: k === "ano" });

  // Link de outra página (ex.: contrato de uma obra) sem o exercício: procura o registro nos anos anteriores.
  useEffect(() => {
    if (config.acumulado || !chaveAberta || params.get("ano") || estado.carregando) return;
    if (estado.linhas.some((l) => l._chave === chaveAberta)) return;
    let ativo = true;
    (async () => {
      for (const a of ANOS.slice(1)) {
        const achou = await fetchTransparenciaRegistro(conjunto, a, chaveAberta).catch(() => null);
        if (!ativo) return;
        if (achou) { mudarParam("ano", String(a)); return; }
      }
    })();
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveAberta, estado.carregando, estado.linhas, conjunto, config.acumulado]);

  // Competências disponíveis ("10/2026", "09/2026"...), da mais recente para a mais antiga.
  const periodos = useMemo(() => {
    if (!config.periodo) return [];
    const ordem = (v: string) => { if (!v.includes("/")) return Number(v) * 100 || 0; const [m, a] = v.split("/"); return Number(a) * 100 + Number(m) || 0; };
    return [...new Set(estado.linhas.map((l) => l[config.periodo!.campo]).filter(Boolean))].sort((a, b) => ordem(b) - ordem(a));
  }, [estado.linhas, config.periodo]);
  const periodoSel = config.periodo ? (periodos.includes(params.get("competencia") ?? "") ? params.get("competencia")! : config.periodo.todos ? null : periodos[0]) : null;
  const linhasDoPeriodo = useMemo(
    () => (config.periodo && periodoSel ? estado.linhas.filter((l) => l[config.periodo!.campo] === periodoSel) : estado.linhas),
    [estado.linhas, config.periodo, periodoSel],
  );

  // A página abre com todos os órgãos; a caixa de seleção detalha indicadores, análise e lista.
  const orgaoDe = useMemo(() => {
    const de = config.orgaoDe ?? ((l: Linha) => l["Órgão"]);
    return (l: Linha) => (de(l) ?? "").replace(/^\s*\d+\s*-\s*/, "").trim();
  }, [config.orgaoDe]);
  const orgaos = useMemo(() => [...new Set(linhasDoPeriodo.map(orgaoDe).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")), [linhasDoPeriodo, orgaoDe]);
  const orgaoSel = orgaos.includes(params.get("orgao") ?? "") ? params.get("orgao") : null;
  const linhasPeriodo = useMemo(() => (orgaoSel ? linhasDoPeriodo.filter((l) => orgaoDe(l) === orgaoSel) : linhasDoPeriodo), [linhasDoPeriodo, orgaoDe, orgaoSel]);

  const situacoes = useMemo(() => {
    const cont = new Map<string, number>();
    for (const l of linhasPeriodo) { const s = config.situacaoDe(l) || "Sem situação"; cont.set(s, (cont.get(s) ?? 0) + 1); }
    return [...cont.entries()].sort((a, b) => b[1] - a[1]);
  }, [linhasPeriodo, config]);

  const filtradas = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    const lista = linhasPeriodo.filter((l) => {
      if (situacao && (config.situacaoDe(l) || "Sem situação") !== situacao) return false;
      if (!termos.length) return true;
      const t = normalizar(Object.entries(l).filter(([k]) => k !== "_chave").map(([, v]) => v).join(" "));
      return termos.every((p) => t.includes(p));
    });
    const chave = (l: Linha) => ordem === "maior" || ordem === "menor" ? numero(l[config.campoValor]) || 0 : data(l[config.campoData])?.getTime() ?? 0;
    const sinal = ordem === "recentes" || ordem === "maior" ? -1 : 1;
    return [...lista].sort((a, b) => sinal * (chave(a) - chave(b)));
  }, [linhasPeriodo, busca, situacao, ordem, config]);

  const linhaAberta = chaveAberta ? estado.linhas.find((l) => l._chave === chaveAberta) ?? null : null;
  const colunasCsv = useMemo(() => Object.keys(estado.linhas[0] ?? {}).filter((k) => k !== "_chave").map((k) => ({ campo: k, rotulo: k })), [estado.linhas]);
  const temDados = estado.linhas.length > 0;
  // Sem a cópia do detalhe, o painel mostra ao menos o resumo montado com os dados da lista.
  const semDetalhe = !!detalhe && !detalhe.carregando && !detalhe.dados && !config.detalheOpcional;
  const abas = linhaAberta && detalhe && !detalhe.carregando
    ? config.abas({ linha: linhaAberta, detalhe: detalhe.dados ?? { listas: {} }, cor, portal, linhas: estado.linhas }).filter((a) => a.contagem !== 0)
    : [];
  const [aba, setAba] = useState<string | null>(null);
  useEffect(() => { setAba(null); }, [chaveAberta]);
  const abaAtiva = abas.find((a) => a.id === aba) ?? abas[0];

  const copiarLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => { setCopiado(true); window.setTimeout(() => setCopiado(false), 1800); }).catch(() => {});
  };

  return (
    <TransparencyLayout
      title={item.label}
      description={item.desc}
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Transparência", href: "/transparencia" },
        { label: item.tema.label, href: `/transparencia/tema/${item.tema.id}` },
        { label: item.label },
      ]}
    >
      {/* Indicadores */}
      {temDados && !estado.carregando && config.indicadores(linhasPeriodo).length > 0 && (
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {config.indicadores(linhasPeriodo).map((ind, i) => (
            <div key={ind.rotulo} className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 md:p-5">
              <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: ind.cor ?? cor, opacity: ind.cor ? 1 : 1 - i * 0.2 }} aria-hidden />
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{ind.rotulo}</dt>
              <dd className="font-display text-xl md:text-2xl font-bold mt-1 tabular-nums leading-tight break-words" style={{ color: ind.cor }}>{ind.valor}</dd>
              {ind.detalhe && <dd className="text-xs text-muted-foreground mt-1">{ind.detalhe}</dd>}
            </div>
          ))}
        </dl>
      )}

      {temDados && !estado.carregando && config.panorama && (
        <div className="mb-8">{config.panorama({ linhas: linhasPeriodo, cor, filtrar: (t) => { setBusca(t); setLimite(LOTE); document.getElementById("lista-registros")?.scrollIntoView({ behavior: "smooth", block: "start" }); } })}</div>
      )}

      {/* Barra de consulta */}
      <div id="lista-registros" className="flex flex-wrap items-center gap-3 mb-4 scroll-mt-24">
        {!config.acumulado && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="ano" className="text-sm font-semibold text-foreground">Exercício</label>
            <select id="ano" value={ano} onChange={(e) => mudarParam("ano", e.target.value === String(anoPadrao) ? null : e.target.value)}
              className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
              {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}
        {config.periodo && periodos.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="competencia" className="text-sm font-semibold text-foreground">{config.periodo.rotulo}</label>
            <select id="competencia" value={periodoSel ?? ""} onChange={(e) => { mudarParam("competencia", !e.target.value || (!config.periodo!.todos && e.target.value === periodos[0]) ? null : e.target.value); setSituacao(null); setLimite(LOTE); }}
              className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
              {config.periodo.todos && <option value="">{config.periodo.todos}</option>}
              {periodos.map((p) => <option key={p} value={p}>{rotuloCompetencia(p)}</option>)}
            </select>
          </div>
        )}
        {temDados && orgaos.length > 1 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="orgao" className="text-sm font-semibold text-foreground">{config.rotuloOrgao ?? "Órgão"}</label>
            <select id="orgao" value={orgaoSel ?? ""} onChange={(e) => { mudarParam("orgao", e.target.value || null); setSituacao(null); setLimite(LOTE); }}
              className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
              <option value="">Todos</option>
              {orgaos.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}
        {temDados && situacoes.length > 1 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="situacao" className="text-sm font-semibold text-foreground">{config.rotuloSituacao ?? "Situação"}</label>
            <select id="situacao" value={situacao ?? ""} onChange={(e) => { setSituacao(e.target.value || null); setLimite(LOTE); }}
              className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
              <option value="">Todos ({linhasPeriodo.length})</option>
              {situacoes.map(([s, n]) => <option key={s} value={s}>{s} ({n})</option>)}
            </select>
          </div>
        )}
        {!temDados && config.acoes?.(cor)}
        {temDados && (
          <>
            <div className="relative flex-1 min-w-full sm:min-w-[16rem]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <input type="search" value={busca} onChange={(e) => { setBusca(e.target.value); setLimite(LOTE); }}
                placeholder={config.placeholderBusca} aria-label="Filtrar registros"
                className="w-full h-11 rounded-xl border border-border/60 bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15" />
            </div>
            {!config.semOrdenacao && <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} aria-label="Ordenar"
              className="h-11 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15 shrink-0">
              <option value="recentes">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
              <option value="maior">Maior valor</option>
              <option value="menor">Menor valor</option>
            </select>}
            {config.acoes?.(cor)}
            <button type="button" onClick={() => baixarCsv(`${config.slug}-${periodoSel?.replace("/", "-") ?? (config.acumulado ? "atual" : ano)}`, colunasCsv, filtradas)}
              className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl border border-border/60 bg-card text-sm font-semibold hover:bg-muted/50 transition shrink-0">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" aria-hidden /> Baixar CSV
            </button>
          </>
        )}
      </div>

      {temDados && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{filtradas.length.toLocaleString("pt-BR")}</strong>
            {filtradas.length !== linhasPeriodo.length ? ` de ${linhasPeriodo.length.toLocaleString("pt-BR")}` : ""} registros
            {orgaoSel ? ` · ${orgaoSel}` : ""}
            {periodoSel ? ` · ${rotuloCompetencia(periodoSel)}` : config.acumulado ? " · cadastro atual" : ` · exercício ${ano}`} · toque em um registro para ver o detalhe
          </span>
          {estado.atualizado && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Copiado do portal oficial em {new Date(estado.atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </span>
          )}
        </div>
      )}

      {estado.carregando ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label={`Carregando ${item.label.toLowerCase()}`}>
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-52 rounded-3xl bg-muted/60 animate-pulse" />)}
        </div>
      ) : temDados ? (
        <>
          <ul className={config.layout === "lista" ? "grid gap-2.5" : "grid md:grid-cols-2 xl:grid-cols-3 gap-4"}>
            {filtradas.slice(0, limite).map((l) => (
              <li key={l._chave} className="min-w-0">
                <button type="button" onClick={() => mudarParam("registro", l._chave)}
                  className={`group w-full min-w-0 h-full text-left border border-border/50 bg-card hover:shadow-xl hover:border-transparent focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 transition ${config.layout === "lista" ? "rounded-2xl px-4 py-3.5 sm:px-5" : "rounded-3xl p-5 hover:-translate-y-0.5"}`}>
                  <config.Cartao linha={l} cor={cor} />
                </button>
              </li>
            ))}
          </ul>
          {filtradas.length === 0 && (
            <p className="text-center text-muted-foreground py-16">Nenhum registro encontrado com esses filtros.</p>
          )}
          {filtradas.length > limite && (
            <button type="button" onClick={() => setLimite((n) => n + LOTE)}
              className="mt-6 mx-auto flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md hover:opacity-90 transition" style={{ backgroundColor: cor }}>
              Mostrar mais ({filtradas.length - limite} restantes)
            </button>
          )}
        </>
      ) : (
        <section className="relative overflow-hidden bg-card border border-border/50 rounded-3xl p-8 md:p-12 text-center">
          <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: cor }} aria-hidden />
          <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: cor }}>
            {estado.sincronizado ? <Inbox className="h-6 w-6" aria-hidden /> : <RefreshCw className="h-6 w-6" aria-hidden />}
          </span>
          {estado.sincronizado ? (
            <>
              <h2 className="font-display text-2xl font-bold text-foreground mt-5">Nenhum registro publicado{config.acumulado ? "" : ` em ${ano}`}</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                O Portal da Transparência do município não tem registros de <strong className="text-foreground">{item.label}</strong>{config.acumulado ? "" : ` para ${ano}`}.
                {estado.atualizado && <> Conferido em {new Date(estado.atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.</>}{" "}
                Se você procura uma informação que deveria estar aqui, peça pelo e-SIC.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-foreground mt-5">Estamos trazendo estes dados para o site</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Enquanto a cópia automática de <strong className="text-foreground">{item.label}</strong>{config.acumulado ? "" : ` (${ano})`} não fica pronta,
                a consulta completa e oficial está disponível no Portal da Transparência do município.
              </p>
            </>
          )}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {portal && (
              <a href={portal} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition" style={{ backgroundColor: cor }}>
                <ExternalLink className="h-4 w-4" aria-hidden /> Consultar no portal oficial
              </a>
            )}
            <Link to="/e-sic" className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl border border-border/70 text-foreground hover:bg-muted/50 transition">
              <MessageCircleQuestion className="h-4 w-4" aria-hidden /> Pedir pelo e-SIC
            </Link>
          </div>
        </section>
      )}

      {/* Painel de detalhe */}
      <Sheet open={!!chaveAberta && !!linhaAberta} onOpenChange={(aberto) => !aberto && mudarParam("registro", null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-[60rem] p-0 overflow-y-auto bg-background [&>button:last-child]:hidden">
          {linhaAberta && (
            <>
              <div className="relative text-white" style={{ background: `linear-gradient(135deg, ${cor}, color-mix(in srgb, ${cor} 65%, #0b1f1a))` }}>
                <div className="absolute inset-0 opacity-[0.12] pointer-events-none" aria-hidden
                  style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "18px 18px" }} />
                <div className="relative p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 min-w-0 truncate">{item.label}</span>
                    <span className="flex items-center gap-1.5">
                      <button type="button" onClick={copiarLink} className="inline-flex items-center gap-1.5 h-8 rounded-full px-3 text-xs font-semibold whitespace-nowrap bg-white/15 hover:bg-white/25 transition">
                        {copiado ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Link2 className="h-3.5 w-3.5" aria-hidden />}
                        <span className={copiado ? "" : "sr-only sm:not-sr-only"}>{copiado ? "Link copiado" : "Copiar link"}</span>
                      </button>
                      <button type="button" onClick={() => mudarParam("registro", null)} className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition">
                        <X className="h-4 w-4" aria-hidden /><span className="sr-only">Fechar</span>
                      </button>
                    </span>
                  </div>
                  <SheetTitle className="sr-only">{item.label}</SheetTitle>
                  <SheetDescription className="sr-only">Detalhes, listas e arquivos do registro</SheetDescription>
                  {config.cabecalho({ linha: linhaAberta, detalhe: detalhe?.dados ?? null, cor })}
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {detalhe?.carregando ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center"><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Abrindo o detalhe…</p>
                ) : abas.length ? (
                  <>
                    {semDetalhe && (
                      <p className="mb-5 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        Empenhos, itens e arquivos deste registro ainda não foram copiados para o site.
                        {portal && <> <a href={portal} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: cor }}>Ver no portal oficial</a>.</>}
                      </p>
                    )}
                    <div role="tablist" aria-label="Seções do detalhe" className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1 mb-5 border-b border-border/60">
                      {abas.map((a) => {
                        const ativa = a.id === abaAtiva?.id;
                        return (
                          <button key={a.id} type="button" role="tab" aria-selected={ativa} onClick={() => setAba(a.id)}
                            className={`relative shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold transition ${ativa ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            {a.rotulo}
                            {a.contagem != null && (
                              <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center ${ativa ? "" : "bg-muted text-muted-foreground"}`}
                                style={ativa ? { backgroundColor: cor, color: "white" } : undefined}>{a.contagem}</span>
                            )}
                            {ativa && <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-full" style={{ backgroundColor: cor }} aria-hidden />}
                          </button>
                        );
                      })}
                    </div>
                    <div role="tabpanel">{abaAtiva?.conteudo}</div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      O detalhe completo deste registro (empenhos, itens e arquivos) ainda não foi copiado para o site.
                    </p>
                    {portal && (
                      <a href={portal} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: cor }}>
                        <ExternalLink className="h-4 w-4" aria-hidden /> Ver no portal oficial
                      </a>
                    )}
                  </div>
                )}
                {portal && abas.length > 0 && (
                  <a href={portal} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Fonte oficial: Portal da Transparência
                  </a>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Outros itens do tema */}
      <h2 className="font-display text-lg font-bold text-foreground mt-12 mb-3">Mais em {item.tema.label}</h2>
      <div className="flex flex-wrap gap-2">
        {item.tema.items.filter((i) => i.slug !== item.slug).map((i) => (
          <Link key={i.slug} to={itemHref(i)} className="text-sm font-medium bg-card border border-border/60 rounded-full px-4 py-2 hover:shadow-md hover:border-transparent transition text-foreground">
            {i.label}
          </Link>
        ))}
      </div>
    </TransparencyLayout>
  );
};

export default ComprasConsulta;
