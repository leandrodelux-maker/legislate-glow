import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/roteador-transparencia";
import { CheckCircle2, Clock, Hourglass, Inbox, Loader2, Send, XCircle } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { findItem } from "@/data/transparenciaCatalogo";
import { fetchTransparenciaDataset } from "@/hooks/useTransparenciaDataset";
import { useEstatisticasSic } from "@/hooks/useEstatisticasSic";
import { mesclarEstatisticas } from "@/lib/atendimento";

// Estatísticas do e-SIC: os pedidos feitos neste site somados aos do Portal da Transparência (cópia "estatisticas-esic":
// um registro por ano, com os totais e as séries dos gráficos). "Todos os anos" soma a série.
type Serie = { label: string; data: number }[];
interface Ano { ano: number; solicitados: number; atendidos: number; abertos: number; indeferidos: number; series: Record<string, Serie> }
type Linha = Record<string, unknown>;

const num = (v: unknown) => Number(v) || 0;
const doRegistro = (dados: Linha): Ano => ({
  ano: num(dados["Ano"]), solicitados: num(dados["Solicitados"]), atendidos: num(dados["Atendidos"]), abertos: num(dados["Em aberto"]), indeferidos: num(dados["Indeferidos"]),
  series: { ...((dados["Números"] ?? {}) as Record<string, Serie>), ...((dados["Perfil"] ?? {}) as Record<string, Serie>) },
});
const somar = (anos: Ano[]): Ano => {
  const series: Record<string, Serie> = {};
  for (const a of anos) for (const [k, s] of Object.entries(a.series)) {
    const alvo = (series[k] ??= []);
    for (const { label, data } of s ?? []) { const i = alvo.find((x) => x.label === label); if (i) i.data += data; else alvo.push({ label, data }); }
  }
  return { ano: 0, series, ...(["solicitados", "atendidos", "abertos", "indeferidos"] as const).reduce((o, k) => ({ ...o, [k]: anos.reduce((s, a) => s + a[k], 0) }), {} as Pick<Ano, "solicitados" | "atendidos" | "abertos" | "indeferidos">) };
};

const GRAFICOS: { serie: string; titulo: string; descricao: string }[] = [
  { serie: "tipoSolicitacao", titulo: "Tipo de solicitação", descricao: "O que as pessoas registraram" },
  { serie: "situacao", titulo: "Situação dos pedidos", descricao: "Em que etapa cada pedido está" },
  { serie: "tipoDeResposta", titulo: "Tipo de resposta", descricao: "Deferidos, indeferidos e em análise" },
  { serie: "formaRecebimentoResposta", titulo: "Como a resposta é recebida", descricao: "Canal escolhido pelo solicitante" },
  { serie: "faixaEtaria", titulo: "Faixa etária", descricao: "Idade de quem informou" },
  { serie: "sexo", titulo: "Sexo", descricao: "De quem informou" },
];

// Barras horizontais de uma só cor (magnitude); o número fica escrito ao lado, então a cor nunca é a única pista.
const Barras = ({ serie, cor }: { serie: Serie; cor: string }) => {
  const total = serie.reduce((s, x) => s + x.data, 0);
  const max = Math.max(1, ...serie.map((x) => x.data));
  if (!total) return <p className="text-sm text-muted-foreground py-6 text-center">Sem registros neste período.</p>;
  return (
    <ul className="space-y-3">
      {[...serie].sort((a, b) => b.data - a.data).map((x) => (
        <li key={x.label} title={`${x.label}: ${x.data} (${Math.round((x.data / total) * 100)}%)`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-foreground">{x.label.replace(/^Manifestação - /, "")}</span>
            <span className="tabular-nums shrink-0"><strong className="text-foreground">{x.data}</strong> <span className="text-xs text-muted-foreground">{Math.round((x.data / total) * 100)}%</span></span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(x.data / max) * 100}%`, backgroundColor: cor, minWidth: x.data ? 6 : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const EstatisticasEsicPage = () => {
  const item = findItem("estatisticas-esic")!;
  const cor = item.tema.color;
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [copiado, setCopiado] = useState<Date | null>(null);
  const [ano, setAno] = useState<number>(0);
  const doSite = useEstatisticasSic();

  // A série fica gravada no ano corrente; na virada do ano, vale a do ano anterior até a próxima cópia.
  useEffect(() => {
    const atual = new Date().getFullYear();
    (async () => {
      const r = (await fetchTransparenciaDataset<Linha>("estatisticas-esic", atual)) ?? (await fetchTransparenciaDataset<Linha>("estatisticas-esic", atual - 1));
      setLinhas(r?.data ?? []);
      setCopiado(r?.atualizadoEm ? new Date(r.atualizadoEm) : null);
    })().catch(() => setLinhas([]));
  }, []);

  const anos = useMemo(() => mesclarEstatisticas((linhas ?? []).map(doRegistro), doSite ?? []), [linhas, doSite]);
  const atual = ano ? anos.find((a) => a.ano === ano) : anos.length ? somar(anos) : null;
  const taxa = atual?.solicitados ? Math.round((atual.atendidos / atual.solicitados) * 100) : 0;
  const maxAno = Math.max(1, ...anos.map((a) => a.solicitados));
  // Os gráficos de perfil só existem na cópia do portal: sem ela, somem em vez de aparecer vazios.
  const graficos = GRAFICOS.filter((g) => atual?.series[g.serie]?.length);

  return (
    <TransparencyLayout title={item.label} description="Quantos pedidos de acesso à informação a Câmara recebeu, respondeu e ainda tem em aberto."
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: item.tema.label, href: `/transparencia/tema/${item.tema.id}` }, { label: item.label }]}>
      {!linhas || !doSite ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-16"><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Carregando as estatísticas…</p>
      ) : !atual ? (
        <p className="rounded-3xl border border-border/50 bg-card p-10 text-center text-muted-foreground">Ainda não há pedidos registrados.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              Período
              <select value={ano} onChange={(e) => setAno(Number(e.target.value))} className="h-10 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold">
                <option value={0}>Todos os anos</option>
                {anos.map((a) => <option key={a.ano} value={a.ano}>{a.ano}</option>)}
              </select>
            </label>
            {copiado && <p className="ml-auto text-xs text-muted-foreground inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden /> Copiado do portal oficial em {copiado.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>}
          </div>

          {/* Números principais */}
          <section className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
            <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${cor}, color-mix(in srgb, ${cor} 55%, #04180f))` }}>
              <Inbox className="absolute -right-4 -bottom-6 h-36 w-36 opacity-10" aria-hidden />
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{ano ? `Em ${ano}` : "Desde o início"}</p>
              <p className="font-display text-6xl font-bold tabular-nums mt-2 leading-none">{atual.solicitados}</p>
              <p className="text-white/90 mt-1">{atual.solicitados === 1 ? "pedido recebido" : "pedidos recebidos"}</p>
              <div className="mt-6">
                <div className="flex justify-between text-sm"><span>Atendidos</span><strong className="tabular-nums">{taxa}%</strong></div>
                <div className="mt-1.5 h-2.5 rounded-full bg-white/20 overflow-hidden" aria-hidden><div className="h-full rounded-full bg-white" style={{ width: `${taxa}%` }} /></div>
              </div>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { rotulo: "Atendidos", valor: atual.atendidos, icone: CheckCircle2, nota: "pedidos com resposta" },
                { rotulo: "Em aberto", valor: atual.abertos, icone: Hourglass, nota: "pendentes ou em análise" },
                { rotulo: "Indeferidos", valor: atual.indeferidos, icone: XCircle, nota: "com acesso negado" },
              ].map((k) => (
                <div key={k.rotulo} className="rounded-3xl border border-border/60 bg-card p-5 last:col-span-2 sm:last:col-span-1">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><k.icone className="h-4 w-4" style={{ color: cor }} aria-hidden /> {k.rotulo}</dt>
                  <dd className="font-display text-4xl font-bold text-foreground tabular-nums mt-2">{k.valor}</dd>
                  <dd className="text-xs text-muted-foreground mt-0.5">{k.nota}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Por ano */}
          {!ano && anos.length > 1 && (
            <section className="mt-6 rounded-3xl border border-border/60 bg-card p-6">
              <h2 className="font-display text-lg font-bold text-foreground">Pedidos recebidos por ano</h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-5">Toque num ano para ver só os números dele.</p>
              <ul className="space-y-2.5">
                {anos.map((a) => (
                  <li key={a.ano}>
                    <button type="button" onClick={() => setAno(a.ano)} className="group w-full grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 text-left" title={`${a.ano}: ${a.solicitados} recebidos, ${a.atendidos} atendidos`}>
                      <span className="text-sm font-bold text-foreground tabular-nums">{a.ano}</span>
                      <span className="h-6 rounded-md bg-muted overflow-hidden" aria-hidden>
                        <span className="block h-full rounded-md group-hover:opacity-80 transition" style={{ width: `${(a.solicitados / maxAno) * 100}%`, minWidth: a.solicitados ? 6 : 0, backgroundColor: cor }} />
                      </span>
                      <span className="text-sm tabular-nums w-28 text-right"><strong className="text-foreground">{a.solicitados}</strong> <span className="text-xs text-muted-foreground">· {a.atendidos} atendidos</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Detalhamento */}
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {graficos.map((g) => (
              <article key={g.serie} className="rounded-3xl border border-border/60 bg-card p-6">
                <h2 className="font-display text-base font-bold text-foreground">{g.titulo}</h2>
                <p className="text-xs text-muted-foreground mt-0.5 mb-5">{g.descricao}</p>
                <Barras serie={atual.series[g.serie] ?? []} cor={cor} />
              </article>
            ))}
          </section>

          <section className="mt-8 flex flex-col md:flex-row md:items-center gap-4 rounded-3xl border border-border/60 bg-card p-6">
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-foreground">Precisa de uma informação da Câmara?</p>
              <p className="text-sm text-muted-foreground mt-1">O pedido é gratuito e a resposta sai em até 20 dias, prorrogáveis por mais 10 (Lei nº 12.527/2011).</p>
            </div>
            <Link to="/e-sic" className="h-11 inline-flex items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white hover:opacity-90" style={{ backgroundColor: cor }}><Send className="h-4 w-4" aria-hidden /> Fazer um pedido</Link>
          </section>
          <p className="text-xs text-muted-foreground mt-4">Soma os pedidos feitos neste site, em tempo real, e os do sistema e-SIC do Portal da Transparência, copiados todos os dias. Os perfis (idade e sexo) vêm só do portal e contam quem informou esses dados.</p>
        </>
      )}
    </TransparencyLayout>
  );
};

export default EstatisticasEsicPage;
