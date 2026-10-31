import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "@/lib/roteador-transparencia";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Download, ExternalLink, Eye, FileText, Hourglass, Info, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { VisualizadorDocumento, linkDocumento, type OrigemLei } from "@/components/transparency/compras/BotaoLei";
import { TODOS_ITENS, itemHref, portalUrl } from "@/data/transparenciaCatalogo";
import { useTransparenciaUrls } from "@/hooks/useTransparenciaUrls";
import { supabase } from "@/integrations/transparencia/client";

// Relatórios periódicos publicados pelo sistema contábil do portal (função portal-documento, ?lrf-periodos=):
// RREO a cada bimestre (tipo 1), RGF a cada quadrimestre (tipo 2), Movimentação Orçamentária (4) e PCASP (6)
// a cada mês e o Balanço Anual (5). Com prazo legal (`prazoDias`), o exercício atual mostra a situação de cada
// período frente ao prazo; os demais mostram o que foi publicado. Os anteriores ficam no histórico.
interface Relatorio {
  slug: string; tipo: number; sigla: string; nome: string; resumo: string;
  periodo: "mes" | "bimestre" | "quadrimestre" | "ano";
  prazo?: string;
  /** Dias após o fim do período para publicar (LRF): sem isso, não há alerta de atraso. */
  prazoDias?: number;
  /** Nome legível dos anexos que o portal só numera ("Anexo XII"). */
  nomes?: Record<number, string>;
}

const RELATORIOS: Relatorio[] = [
  {
    slug: "rreo", tipo: 1, sigla: "RREO", nome: "Relatório Resumido da Execução Orçamentária", periodo: "bimestre",
    resumo: "Mostra, a cada dois meses, como o orçamento está sendo executado: quanto foi arrecadado, quanto foi gasto e os principais resultados das contas.",
    prazo: "Publicado até 30 dias após o fim de cada bimestre (LRF, art. 52).", prazoDias: 30,
  },
  {
    slug: "rgf", tipo: 2, sigla: "RGF", nome: "Relatório de Gestão Fiscal", periodo: "quadrimestre",
    resumo: "Mostra, a cada quatro meses, se o município respeita os limites da Lei de Responsabilidade Fiscal: gastos com pessoal, dívida, garantias e operações de crédito.",
    prazo: "Publicado até 30 dias após o fim de cada quadrimestre (LRF, art. 55).", prazoDias: 30,
  },
  {
    slug: "balanco-anual", tipo: 5, sigla: "Balanço", nome: "Balanço Anual", periodo: "ano",
    resumo: "O fechamento das contas de cada ano: o que foi previsto e o que foi arrecadado, o orçamento e o que foi gasto, o caixa e o patrimônio do município.",
    prazo: "Os demonstrativos da Lei nº 4.320/1964 (anexos X a XV) acompanham a prestação de contas anual.",
    nomes: {
      80: "Anexo X – Comparativo da Receita Orçada com a Arrecadada", 81: "Anexo XI – Comparativo da Despesa Autorizada com a Realizada",
      82: "Anexo XII – Balanço Orçamentário", 83: "Anexo XIII – Balanço Financeiro", 84: "Anexo XIV – Balanço Patrimonial",
      85: "Anexo XV – Demonstração das Variações Patrimoniais",
    },
  },
  {
    slug: "pcasp", tipo: 6, sigla: "PCASP", nome: "Demonstrativos contábeis (PCASP)", periodo: "mes",
    resumo: "Os balanços mês a mês no padrão do Plano de Contas Aplicado ao Setor Público: orçamentário, financeiro, patrimonial e as variações do patrimônio.",
  },
  {
    slug: "movimentacao-orcamentaria", tipo: 4, sigla: "Movimentação", nome: "Movimentação Orçamentária e Financeira", periodo: "mes",
    resumo: "Relatórios mensais com os tributos arrecadados, as transferências da União e do Estado, as compras, os contratos e a execução da receita e da despesa.",
  },
];

interface Indice {
  meses: number[];
  atualizadoEm: string | null;
  anexos: { codigo: number; descricao: string; meses: number[] }[];
  anos: { ano: number; periodos: { mes: number; anexos: number[] }[] }[];
}
interface DocPainel { id: string; tipo: string; periodo: string | null; exercicio: number; titulo: string; arquivo_url: string | null; arquivos_urls: string[] | null; arquivos_nomes: string[] | null }

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const PALAVRA = { mes: "mês", bimestre: "bimestre", quadrimestre: "quadrimestre", ano: "exercício" } as const;
const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const DIA = 86_400_000;

type Situacao = "publicado" | "andamento" | "prazo" | "atrasado" | "ausente";
const SITUACAO: Record<Situacao, { rotulo: string; Icone: typeof CheckCircle2; classe: string }> = {
  publicado: { rotulo: "Publicado", Icone: CheckCircle2, classe: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  andamento: { rotulo: "Período em andamento", Icone: Hourglass, classe: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
  prazo: { rotulo: "No prazo", Icone: Clock, classe: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
  atrasado: { rotulo: "Atrasado", Icone: AlertTriangle, classe: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
  ausente: { rotulo: "Não publicado", Icone: AlertTriangle, classe: "bg-muted text-muted-foreground" },
};

const RelatorioFiscalPage = () => {
  const { pathname } = useLocation();
  const rel = RELATORIOS.find((r) => pathname === `/transparencia/${r.slug}`);
  const item = TODOS_ITENS.find((i) => rel && itemHref(i) === pathname);
  const [params, setParams] = useSearchParams();
  const { urls } = useTransparenciaUrls();
  const [estado, setEstado] = useState<{ carregando: boolean; indice: Indice | null; erro: boolean }>({ carregando: true, indice: null, erro: false });
  const [painel, setPainel] = useState<DocPainel[]>([]);
  const [aberto, setAberto] = useState<{ titulo: string; origem: OrigemLei } | null>(null);

  useEffect(() => {
    if (!rel) return;
    setEstado({ carregando: true, indice: null, erro: false });
    fetch(`${import.meta.env.VITE_TRANSPARENCIA_SUPABASE_URL}/functions/v1/portal-documento?lrf-periodos=${rel.tipo}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((indice: Indice) => setEstado({ carregando: false, indice, erro: false }))
      .catch(() => setEstado({ carregando: false, indice: null, erro: true }));
    // Arquivos que a Câmara enviou pelo painel do site (complementam o portal).
    supabase.from("relatorios_fiscais_documentos").select("id, tipo, periodo, exercicio, titulo, arquivo_url, arquivos_urls, arquivos_nomes").eq("ativo", true).eq("tipo", rel.sigla)
      .then(({ data }) => setPainel((data ?? []) as DocPainel[]));
  }, [rel]);

  const hoje = Date.now();
  const anoAtual = new Date().getFullYear();
  const anos = estado.indice?.anos ?? [];
  // Sem prazo legal, abre no ano mais recente com publicação (o portal pode ter parado de publicar).
  const anoPadrao = (!rel?.prazoDias && anos.find((a) => a.periodos.some((p) => p.anexos.length))) || anos[0];
  const anoSel = anos.find((a) => String(a.ano) === params.get("ano")) ?? anoPadrao;
  const ultimoPublicado = anos.find((a) => a.periodos.some((p) => p.anexos.length))?.ano;
  const atual = anoSel?.ano === anoAtual;

  // Período n (1º, 2º...) e situação de cada um no exercício escolhido.
  const periodos = useMemo(() => (anoSel?.periodos ?? []).map((p, i) => {
    const tamanho = { mes: 1, bimestre: 2, quadrimestre: 4, ano: 12 }[rel?.periodo ?? "mes"];
    const fim = new Date(anoSel!.ano, p.mes, 0).getTime() + DIA - 1; // último dia do mês de fechamento
    const prazo = fim + (rel?.prazoDias ?? 0) * DIA;
    let situacao: Situacao = "publicado";
    if (!p.anexos.length) {
      if (!atual) situacao = "ausente";
      else if (hoje <= fim) situacao = "andamento";
      else situacao = !rel?.prazoDias ? "ausente" : hoje <= prazo ? "prazo" : "atrasado";
    }
    return {
      ...p, n: i + 1, situacao, prazo: new Date(prazo),
      meses: tamanho === 1 ? MESES_LONGOS[p.mes - 1] : `${MESES[p.mes - tamanho]}–${MESES[p.mes - 1]}`,
    };
  }), [anoSel, rel, atual, hoje]);

  const selPadrao = [...periodos].reverse().find((p) => p.situacao === "publicado") ?? periodos[0];
  const sel = periodos.find((p) => String(p.mes) === params.get("mes")) ?? selPadrao;
  const atrasados = periodos.filter((p) => p.situacao === "atrasado");
  const proximo = periodos.find((p) => p.situacao === "prazo" || p.situacao === "andamento");

  const arquivosPainel = useMemo(() => painel
    .filter((d) => sel && anoSel && Number(d.exercicio) === anoSel.ano && new RegExp(`^\\s*${sel.n}\\s*[ºo°]`, "i").test(d.periodo ?? ""))
    .flatMap((d) => {
      const lista = d.arquivos_urls?.length ? d.arquivos_urls : d.arquivo_url ? [d.arquivo_url] : [];
      return lista.filter(Boolean).map((url, i) => ({ url, nome: d.arquivos_nomes?.[i]?.trim() || decodeURIComponent(url.split("/").pop() ?? "Arquivo") }));
    }), [painel, sel, anoSel]);

  if (!rel || !item) return <Navigate to="/transparencia" replace />;
  const cor = item.tema.color;
  const portal = portalUrl(item, `${urls.base_url}/`);
  const nomePeriodo = (n: number) => rel.periodo === "ano" ? "exercício" : rel.periodo === "mes" ? MESES_LONGOS[(periodos[n - 1]?.mes ?? n) - 1] : `${n}º ${PALAVRA[rel.periodo]}`;
  const parouEm = !rel.prazoDias && ultimoPublicado && ultimoPublicado < anoAtual - (rel.periodo === "ano" ? 1 : 0) ? ultimoPublicado : null;
  const mudar = (k: string, v: string | null) => setParams((p) => { const n = new URLSearchParams(p); if (v == null) n.delete(k); else n.set(k, v); if (k === "ano") n.delete("mes"); return n; }, { replace: true });
  const anexosDoPeriodo = sel ? (estado.indice?.anexos ?? []).filter((a) => sel.anexos.includes(a.codigo)) : [];

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
      <section className="rounded-2xl border border-border/50 bg-card px-5 py-4 mb-6 flex gap-4 items-start">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}><ShieldCheck className="h-5 w-5" aria-hidden /></span>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{rel.nome}{rel.nome.includes(rel.sigla) ? "" : ` (${rel.sigla})`}</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-4xl">{rel.resumo}</p>
          {rel.prazo && <p className="text-xs font-semibold text-foreground/80 mt-2 inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" aria-hidden /> {rel.prazo}</p>}
        </div>
      </section>

      {estado.carregando ? (
        <div className="grid gap-3" aria-busy="true">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-24 rounded-2xl bg-muted/60 animate-pulse" />)}</div>
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />)}
        </div>
      ) : !anoSel || !sel ? (
        <section className="rounded-3xl border border-border/50 bg-card p-8 md:p-12 text-center">
          <span className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: cor }}><FileText className="h-6 w-6" aria-hidden /></span>
          <h2 className="font-display text-2xl font-bold text-foreground mt-5">{estado.erro ? "Não foi possível consultar o portal agora" : "Nenhum relatório publicado"}</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{estado.erro ? "O Portal da Transparência não respondeu. A consulta oficial continua disponível no portal do município." : "O Portal da Transparência ainda não tem publicações deste relatório."}</p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {portal && <a href={portal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md hover:opacity-90" style={{ backgroundColor: cor }}><ExternalLink className="h-4 w-4" aria-hidden /> Consultar no portal oficial</a>}
            <Link to="/e-sic" className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl border border-border/70 hover:bg-muted/50"><MessageCircleQuestion className="h-4 w-4" aria-hidden /> Pedir pelo e-SIC</Link>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="exercicio" className="text-sm font-semibold text-foreground">Exercício</label>
              <select id="exercicio" value={anoSel.ano} onChange={(e) => mudar("ano", e.target.value === String(anos[0].ano) ? null : e.target.value)}
                className="h-11 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
                {anos.map((a) => <option key={a.ano} value={a.ano}>{a.ano}{a.ano === anoAtual ? " (atual)" : ""}</option>)}
              </select>
            </div>
            {estado.indice?.atualizadoEm && (
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden /> Dados contábeis do portal atualizados até {new Date(`${estado.indice.atualizadoEm}T12:00:00`).toLocaleDateString("pt-BR")}</span>
            )}
          </div>

          {parouEm && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex gap-3 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Info className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm">O Portal da Transparência não publica este relatório desde <strong>{parouEm}</strong>. Os relatórios anteriores continuam disponíveis abaixo. Para períodos mais recentes, <Link to="/e-sic" className="font-semibold underline underline-offset-2">peça pelo e-SIC</Link>.</p>
            </div>
          )}

          {/* Alertas do exercício atual */}
          {atual && atrasados.length > 0 && (
            <div role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex gap-3 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm">
                <strong>Relatório em atraso:</strong> o {rel.sigla} do {atrasados.map((p) => nomePeriodo(p.n)).join(", ")} de {anoSel.ano} deveria ter sido publicado até {atrasados.map((p) => p.prazo.toLocaleDateString("pt-BR")).join(", ")} e ainda não está no Portal da Transparência.
              </p>
            </div>
          )}
          {atual && !atrasados.length && proximo && (
            <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 flex gap-3 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
              <Info className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm">
                Publicações em dia. O próximo é o <strong>{nomePeriodo(proximo.n)} ({proximo.meses})</strong>, com prazo até <strong>{proximo.prazo.toLocaleDateString("pt-BR")}</strong>.
              </p>
            </div>
          )}

          {/* Períodos do exercício */}
          {periodos.length > 1 && <div role="tablist" aria-label={`Períodos de ${anoSel.ano}`} className={`grid gap-2 mb-6 grid-cols-2 sm:grid-cols-3 ${periodos.length > 6 ? "md:grid-cols-4 lg:grid-cols-6" : periodos.length > 3 ? "lg:grid-cols-6" : ""}`}>
            {periodos.map((p) => {
              const s = SITUACAO[p.situacao];
              const ativo = p.mes === sel.mes;
              return (
                <button key={p.mes} type="button" role="tab" aria-selected={ativo} onClick={() => mudar("mes", p === selPadrao ? null : String(p.mes))}
                  className={`text-left rounded-2xl border bg-card p-3.5 transition ${ativo ? "border-transparent shadow-lg ring-2" : "border-border/60 hover:shadow-md"}`}
                  style={ativo ? { ["--tw-ring-color" as string]: cor } : undefined}>
                  <span className="block text-sm font-bold text-foreground capitalize">{rel.periodo === "mes" ? p.meses : nomePeriodo(p.n)}</span>
                  {rel.periodo !== "mes" && <span className="block text-xs text-muted-foreground">{p.meses}</span>}
                  <span className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.classe}`}>
                    <s.Icone className="h-3 w-3" aria-hidden /> {p.situacao === "prazo" ? `Prazo até ${p.prazo.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}` : s.rotulo}
                  </span>
                </button>
              );
            })}
          </div>}

          {/* Documentos do período escolhido */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h3 className="font-display text-lg font-bold text-foreground">{rel.sigla} · {rel.periodo === "ano" ? `exercício de ${anoSel.ano}` : rel.periodo === "mes" ? `${sel.meses} de ${anoSel.ano}` : <>{nomePeriodo(sel.n)} de {anoSel.ano} <span className="font-normal text-muted-foreground">({sel.meses})</span></>}</h3>
            {anexosDoPeriodo.length > 0 && <span className="text-sm text-muted-foreground">{anexosDoPeriodo.length} anexo(s)</span>}
          </div>
          {anexosDoPeriodo.length ? (
            <ul className="rounded-2xl border border-border/60 bg-card divide-y divide-border/50 overflow-hidden">
              {anexosDoPeriodo.map((a) => {
                const origem: OrigemLei = { anexo: a.codigo, tipo: rel.tipo, ano: anoSel.ano, mes: sel.mes };
                const titulo = rel.nomes?.[a.codigo] ?? a.descricao.replace(/\s+-\s+/, " – ");
                return (
                  <li key={a.codigo} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: cor }}><FileText className="h-4 w-4" aria-hidden /></span>
                      <p className="text-sm font-semibold text-foreground leading-snug">{titulo}</p>
                    </div>
                    <div className="flex gap-2 sm:shrink-0 pl-12 sm:pl-0">
                      <button type="button" onClick={() => setAberto({ titulo: `${rel.sigla} ${nomePeriodo(sel.n)}/${anoSel.ano} – ${titulo}`, origem })}
                        className="h-9 inline-flex items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold border border-border/60 hover:bg-muted/60">
                        <Eye className="h-4 w-4" aria-hidden /> Ver
                      </button>
                      <a href={linkDocumento(origem, `${rel.sigla}-${anoSel.ano}-${sel.n}-${titulo}`.slice(0, 100), false)} download
                        className="h-9 inline-flex items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: cor }}>
                        <Download className="h-4 w-4" aria-hidden /> Baixar
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={`rounded-2xl border px-5 py-6 text-sm flex gap-3 ${sel.situacao === "atrasado" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" : "border-dashed border-border bg-muted/20 text-muted-foreground"}`}>
              {sel.situacao === "atrasado" ? <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden /> : <Hourglass className="h-5 w-5 shrink-0" aria-hidden />}
              <p>
                {sel.situacao === "andamento" && <>Este {PALAVRA[rel.periodo]} ainda está em andamento.{rel.prazoDias ? <> O relatório deve ser publicado até <strong>{sel.prazo.toLocaleDateString("pt-BR")}</strong>.</> : " O relatório sai depois do fechamento."}</>}
                {sel.situacao === "prazo" && <>O {PALAVRA[rel.periodo]} terminou e o relatório ainda está dentro do prazo legal, que vai até <strong>{sel.prazo.toLocaleDateString("pt-BR")}</strong>.</>}
                {sel.situacao === "atrasado" && <>O prazo terminou em <strong>{sel.prazo.toLocaleDateString("pt-BR")}</strong> e o relatório ainda não foi publicado no Portal da Transparência. <Link to="/e-sic" className="font-semibold underline underline-offset-2">Peça pelo e-SIC</Link>.</>}
                {sel.situacao === "ausente" && <>Não há relatório deste {PALAVRA[rel.periodo]} publicado no Portal da Transparência. <Link to="/e-sic" className="font-semibold underline underline-offset-2">Peça pelo e-SIC</Link>.</>}
              </p>
            </div>
          )}

          {arquivosPainel.length > 0 && (
            <>
              <h3 className="font-display text-base font-bold text-foreground mt-8 mb-3">Arquivos enviados pela prefeitura</h3>
              <ul className="rounded-2xl border border-border/60 bg-card divide-y divide-border/50 overflow-hidden">
                {arquivosPainel.map((f) => (
                  <li key={f.url} className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted shrink-0"><FileText className="h-4 w-4 text-muted-foreground" aria-hidden /></span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-foreground truncate">{f.nome}</span>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="h-9 inline-flex items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold border border-border/60 hover:bg-muted/60 shrink-0">
                      <ExternalLink className="h-4 w-4" aria-hidden /> Abrir
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {aberto && <VisualizadorDocumento aberto aoFechar={() => setAberto(null)} titulo={aberto.titulo} origem={aberto.origem} cor={cor} />}

      <h2 className="font-display text-lg font-bold text-foreground mt-12 mb-3">Mais em {item.tema.label}</h2>
      <div className="flex flex-wrap gap-2">
        {TODOS_ITENS.filter((i) => i.tema.id === item.tema.id && i.slug !== item.slug).map((i) => (
          <Link key={i.slug} to={itemHref(i)} className="text-sm font-medium bg-card border border-border/60 rounded-full px-4 py-2 hover:shadow-md hover:border-transparent transition text-foreground">{i.label}</Link>
        ))}
      </div>
    </TransparencyLayout>
  );
};

export default RelatorioFiscalPage;
