import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Download, ExternalLink, Info, Link2Off, Radar, Search, X } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { supabase } from "@/integrations/transparencia/client";
import usePageSEO from "@/hooks/usePageSEO";
import { TODOS_ITENS, itemHref } from "@/data/transparenciaCatalogo";
import { lerConjuntoLocal, temFonteLocal } from "@/lib/fontes-legislativas";

type LinkItem = { rotulo?: string | null; url: string };
type Item = {
  id: string;
  grupo: string;
  grupo_ordem: number;
  numero: string;
  pergunta: string;
  base_legal: string | null;
  classificacao: string | null;
  links: LinkItem[] | null;
  ordem: number;
};

const COR_CLASSIFICACAO: Record<string, string> = { Essencial: "#B42318", Obrigatório: "#1F5FBF", Recomendado: "#0B7A4B" };
const COR = "#14505F";
const RADAR_PADRAO = "https://radardatransparencia.atricon.org.br";

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const linksDe = (i: Item) => (i.links ?? []).filter((l) => l.url);
const completo = (url: string) => (url.startsWith("/") ? `${window.location.origin}${url}` : url);

// ---------- Avaliação ----------
// Um link conta como divulgado quando o destino tem informação: páginas fixas do site, ou listas com registros.
type Situacao = "divulgado" | "parcial" | "sem-dados" | "sem-link";

const SITUACOES: Record<Situacao, { rotulo: string; cor: string }> = {
  divulgado: { rotulo: "Divulgado", cor: "#0B7A4B" },
  parcial: { rotulo: "Divulgação parcial", cor: "#A8540F" },
  "sem-dados": { rotulo: "Link sem dados", cor: "#B42318" },
  "sem-link": { rotulo: "Sem link", cor: "#64748B" },
};

// Telas da Transparência com nome diferente do conjunto de dados que mostram.
const CONJUNTO_DA_TELA: Record<string, string> = { servidores: "folha" };
const PAGINAS_FIXAS = new Set(["/transparencia", "/transparencia/sic-presencial", "/transparencia/atendimento-ouvidoria"]);
// Lidos do Megasoft na hora em que o cidadão abre: dependem da função de documentos.
const RELATORIOS_AO_VIVO = new Set(["/transparencia/rgf", "/transparencia/balanco-anual"]);

const conjuntoDoLink = (url: string) => {
  const caminho = url.split(/[?#]/)[0];
  const item = TODOS_ITENS.find((i) => itemHref(i) === caminho);
  const nome = item?.slug ?? /^\/transparencia\/(?:consulta|documentos)\/([a-z-]+)$/.exec(caminho)?.[1];
  return nome ? (CONJUNTO_DA_TELA[nome] ?? nome) : null;
};

type Verificacao = { totais: Map<string, number>; estrutura: boolean; relatorios: boolean; dadosAbertos: boolean };

const linkTemInformacao = (url: string, v: Verificacao) => {
  // Link externo e páginas próprias do site não são listas: existindo, estão divulgados.
  if (!url.startsWith("/transparencia") || PAGINAS_FIXAS.has(url)) return true;
  if (url === "/transparencia/estrutura") return v.estrutura;
  if (url === "/transparencia/dados-abertos") return v.dadosAbertos;
  if (RELATORIOS_AO_VIVO.has(url)) return v.relatorios;
  const c = conjuntoDoLink(url);
  return c ? (v.totais.get(c) ?? 0) > 0 : false;
};

const situacaoDe = (i: Item, v: Verificacao): Situacao => {
  const links = linksDe(i);
  if (!links.length) return "sem-link";
  const comDados = links.filter((l) => linkTemInformacao(l.url, v)).length;
  return comDados === links.length ? "divulgado" : comDados ? "parcial" : "sem-dados";
};

async function verificar(itens: Item[]): Promise<Verificacao> {
  const totais = new Map<string, number>();
  const { data: copias } = await (supabase as any).from("transparencia_sincronizacoes").select("dataset,total_gravado,concluido_em").eq("status", "concluida").order("concluido_em", { ascending: false });
  // A cópia mais recente de cada conjunto é a que vale.
  for (const c of copias ?? []) if (!totais.has(c.dataset)) totais.set(c.dataset, c.total_gravado ?? 0);

  const locais = [...new Set(itens.flatMap((i) => linksDe(i).map((l) => conjuntoDoLink(l.url))).filter((c): c is string => !!c && temFonteLocal(c)))];
  await Promise.all(locais.map(async (c) => { totais.set(c, await lerConjuntoLocal(c).then((r) => r.data.length).catch(() => 0)); }));

  const [sec, dir, rel] = await Promise.all([
    (supabase as any).from("secretarias").select("id", { count: "exact", head: true }),
    (supabase as any).from("dirigentes").select("id", { count: "exact", head: true }),
    fetch("/api/portal-documento?lrf-periodos=2").then((r) => r.ok).catch(() => false),
  ]);
  return { totais, estrutura: (sec.count ?? 0) + (dir.count ?? 0) > 0, relatorios: rel, dadosAbertos: (copias ?? []).some((c: { total_gravado: number | null }) => (c.total_gravado ?? 0) > 0) };
}

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

function Medidor({ valor, rotulo, detalhe, cor }: { valor: number; rotulo: string; detalhe: string; cor: string }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0" role="img" aria-label={`${rotulo}: ${valor}%`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={cor} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(valor / 100) * c} ${c}`} transform="rotate(-90 60 60)" />
        <text x="60" y="68" textAnchor="middle" className="font-display" fontSize="26" fontWeight="700" fill="var(--foreground)">{valor}%</text>
      </svg>
      <div className="min-w-0">
        <p className="font-display font-bold text-foreground leading-snug">{rotulo}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{detalhe}</p>
      </div>
    </div>
  );
}

const seletor = "h-11 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground min-w-0";

function BotaoCopiar({ url, nome }: { url: string; nome: string }) {
  const [feito, setFeito] = useState(false);
  const copiar = async () => {
    await navigator.clipboard.writeText(completo(url));
    setFeito(true);
    window.setTimeout(() => setFeito(false), 1800);
  };
  return (
    <button type="button" onClick={copiar} aria-label={`Copiar o link de ${nome}`} title="Copiar link" className="w-10 h-10 grid place-items-center rounded-xl border border-border text-muted-foreground hover:bg-muted transition focus-visible:outline-2 focus-visible:outline-offset-2">
      {feito ? <Check className="w-4 h-4 text-emerald-700" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
      <span className="sr-only" aria-live="polite">{feito ? "Link copiado" : ""}</span>
    </button>
  );
}

function Criterio({ item, situacao }: { item: Item; situacao?: Situacao }) {
  const links = linksDe(item);
  const cor = COR_CLASSIFICACAO[item.classificacao ?? ""] ?? "#475569";
  return (
    <li className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center p-4 md:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display font-bold text-foreground tabular-nums">{item.numero}</span>
          {item.classificacao && (
            <span className="rounded-full border px-2 py-0.5 text-[11px] font-bold" style={{ color: `color-mix(in srgb, ${cor} 75%, var(--foreground))`, borderColor: `color-mix(in srgb, ${cor} 35%, transparent)`, backgroundColor: `color-mix(in srgb, ${cor} 9%, transparent)` }}>{item.classificacao}</span>
          )}
          {situacao && situacao !== "sem-link" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: `color-mix(in srgb, ${SITUACOES[situacao].cor} 80%, var(--foreground))` }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SITUACOES[situacao].cor }} aria-hidden /> {SITUACOES[situacao].rotulo}
            </span>
          )}
        </div>
        <p className="text-sm md:text-[15px] text-foreground leading-relaxed mt-1.5">{item.pergunta}</p>
        {item.base_legal && <p className="text-xs text-muted-foreground mt-1.5">{item.base_legal}</p>}
      </div>
      <div className="flex flex-col gap-1.5 md:items-end shrink-0">
        {links.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-muted text-sm font-semibold text-muted-foreground"><Link2Off className="w-4 h-4" aria-hidden /> Sem link</span>
        ) : links.map((l, i) => {
          const nome = l.rotulo || `critério ${item.numero}`;
          const externo = !l.url.startsWith("/");
          return (
            <div key={`${l.url}-${i}`} className="flex items-center gap-1.5">
              <a href={l.url} target={externo ? "_blank" : undefined} rel={externo ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-semibold bg-gold text-gold-foreground hover:opacity-90 transition focus-visible:outline-2 focus-visible:outline-offset-2">
                <ExternalLink className="w-4 h-4 shrink-0" aria-hidden /> {l.rotulo || "Acessar"}
                {!l.rotulo && <span className="sr-only"> critério {item.numero}</span>}
              </a>
              <BotaoCopiar url={l.url} nome={nome} />
            </div>
          );
        })}
      </div>
    </li>
  );
}

const AtriconPage = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [config, setConfig] = useState<{ avaliacao?: string; radar_url?: string }>({});
  const [busca, setBusca] = useState("");
  const [dimensao, setDimensao] = useState("");
  const [classe, setClasse] = useState("");
  const [link, setLink] = useState("");
  const [verificacao, setVerificacao] = useState<Verificacao | null>(null);
  const [fechados, setFechados] = useState<Set<string>>(new Set());

  usePageSEO({
    title: "Matriz Atricon",
    description: "Todos os critérios da Matriz Atricon de transparência da Câmara Municipal, com o link de cada informação publicada.",
  });

  useEffect(() => {
    (async () => {
      const [i, c] = await Promise.all([
        (supabase as any).from("atricon_itens").select("id,grupo,grupo_ordem,numero,pergunta,base_legal,classificacao,links,ordem").eq("ativo", true).order("grupo_ordem").order("ordem"),
        (supabase as any).from("configuracoes").select("valor").eq("chave", "atricon_matriz").maybeSingle(),
      ]);
      setItens((i.data ?? []) as Item[]);
      setConfig(c.data?.valor ?? {});
      setCarregando(false);
      verificar((i.data ?? []) as Item[]).then(setVerificacao);
    })();
  }, []);

  const radar = config.radar_url || RADAR_PADRAO;

  const situacoes = useMemo(() => {
    const m = new Map<string, Situacao>();
    if (verificacao) for (const i of itens) m.set(i.id, situacaoDe(i, verificacao));
    return m;
  }, [itens, verificacao]);
  const contarSituacao = (s: Situacao, lista = itens) => lista.filter((i) => situacoes.get(i.id) === s).length;

  const dimensoes = useMemo(() => {
    const m = new Map<string, { total: number; comLink: number; divulgados: number }>();
    for (const i of itens) {
      const d = m.get(i.grupo) ?? { total: 0, comLink: 0, divulgados: 0 };
      d.total++;
      if (linksDe(i).length) d.comLink++;
      if (situacoes.get(i.id) === "divulgado") d.divulgados++;
      m.set(i.grupo, d);
    }
    return [...m.entries()].map(([nome, n]) => ({ nome, ...n }));
  }, [itens, situacoes]);

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim());
    return itens.filter((i) => {
      if (dimensao && i.grupo !== dimensao) return false;
      if (classe && i.classificacao !== classe) return false;
      if (link && situacoes.get(i.id) !== link) return false;
      return !q || normalizar(`${i.numero} ${i.pergunta} ${i.base_legal ?? ""} ${i.grupo}`).includes(q);
    });
  }, [itens, busca, dimensao, classe, link, situacoes]);

  const grupos = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const i of filtrados) m.set(i.grupo, [...(m.get(i.grupo) ?? []), i]);
    return [...m.entries()];
  }, [filtrados]);

  const comLink = itens.filter((i) => linksDe(i).length).length;
  const temFiltro = Boolean(busca || dimensao || classe || link);
  const contar = (c: string) => itens.filter((i) => i.classificacao === c).length;

  const baixarCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const linhas = [["Dimensão", "Número", "Classificação", "Situação", "Critério", "Base legal", "Links"].map(esc).join(";"),
      ...filtrados.map((i) => [i.grupo, i.numero, i.classificacao, SITUACOES[situacoes.get(i.id) ?? "sem-link"].rotulo, i.pergunta, i.base_legal, linksDe(i).map((l) => completo(l.url)).join(" | ")].map(esc).join(";"))];
    const url = URL.createObjectURL(new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: "matriz-atricon.csv" }).click();
    URL.revokeObjectURL(url);
  };

  const alternar = (g: string) => setFechados((f) => { const n = new Set(f); if (n.has(g)) n.delete(g); else n.add(g); return n; });

  return (
    <TransparencyLayout
      conteudoLivre
      accent={COR}
      title="Matriz Atricon"
      description={`Os critérios de transparência pública avaliados pelos Tribunais de Contas${config.avaliacao ? ` em ${config.avaliacao}` : ""}, com o link de cada informação publicada pela Câmara.`}
    >
      <div className="container mx-auto px-4 py-8 md:py-10 space-y-6">
        <section aria-label="Radar da Transparência" className="relative overflow-hidden rounded-3xl text-white p-6 md:p-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center" style={{ background: `linear-gradient(120deg, ${COR}, #0B7A6E)` }}>
          <Radar className="absolute -right-8 -bottom-10 w-56 h-56 opacity-10 pointer-events-none" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">Radar da Transparência Pública</h2>
            <p className="text-white/90 mt-2 max-w-2xl leading-relaxed">O resultado oficial de cada órgão é publicado no Radar, da Atricon. Esta página reúne os critérios e mostra onde encontrar cada informação no site da Câmara.</p>
          </div>
          <a href={radar} target="_blank" rel="noopener noreferrer" className="relative inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold bg-gold text-gold-foreground hover:opacity-90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <ExternalLink className="w-5 h-5" aria-hidden /> Acessar o Radar da Transparência
          </a>
        </section>

        {carregando ? (
          <div className="grid gap-3" aria-label="Carregando">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}</div>
        ) : itens.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
            <p className="font-display font-bold text-lg text-foreground">A matriz será publicada em breve</p>
            <p className="text-sm text-muted-foreground mt-1">Enquanto isso, consulte o resultado oficial no Radar da Transparência.</p>
          </div>
        ) : (
          <>
            <section aria-labelledby="titulo-avaliacao" className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-6">
              <div>
                <h2 id="titulo-avaliacao" className="font-display font-bold text-xl text-foreground">Avaliação da divulgação</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Cálculo automático deste site, com {itens.length} critérios{config.avaliacao ? ` da avaliação de ${config.avaliacao}` : ""}. Não é a nota oficial: o resultado oficial é o do Radar da Transparência.</p>
              </div>
              {!verificacao ? (
                <div className="h-28 rounded-xl bg-muted animate-pulse" role="status" aria-label="Conferindo as informações publicadas" />
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Medidor valor={pct(contarSituacao("divulgado"), itens.length)} rotulo="Informações divulgadas" detalhe={`${contarSituacao("divulgado")} de ${itens.length} critérios com a informação disponível`} cor="#0B7A4B" />
                    <Medidor valor={pct(comLink, itens.length)} rotulo="Critérios com link" detalhe={`${comLink} de ${itens.length} critérios com endereço cadastrado`} cor="#1F5FBF" />
                  </div>
                  <div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-muted" aria-hidden>
                      {(Object.keys(SITUACOES) as Situacao[]).map((s) => <span key={s} style={{ width: `${pct(contarSituacao(s), itens.length)}%`, backgroundColor: SITUACOES[s].cor }} />)}
                    </div>
                    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2.5 text-sm text-muted-foreground">
                      {(Object.keys(SITUACOES) as Situacao[]).map((s) => (
                        <li key={s} className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SITUACOES[s].cor }} aria-hidden /> {SITUACOES[s].rotulo}: <strong className="text-foreground tabular-nums">{contarSituacao(s)}</strong></li>
                      ))}
                    </ul>
                  </div>
                  <ul className="grid gap-3 md:grid-cols-3">
                    {Object.keys(COR_CLASSIFICACAO).map((c) => {
                      const lista = itens.filter((i) => i.classificacao === c);
                      const n = contarSituacao("divulgado", lista);
                      return (
                        <li key={c} className="rounded-xl border border-border p-3.5">
                          <p className="flex items-baseline justify-between gap-2 text-sm font-semibold text-foreground">{c === "Essencial" ? "Essenciais" : `${c}s`} <span className="font-display text-xl font-bold tabular-nums">{pct(n, lista.length)}%</span></p>
                          <span className="block h-1.5 rounded-full bg-muted overflow-hidden mt-2" aria-hidden><span className="block h-full rounded-full" style={{ width: `${pct(n, lista.length)}%`, backgroundColor: COR_CLASSIFICACAO[c] }} /></span>
                          <p className="text-xs text-muted-foreground mt-1.5">{n} de {lista.length} divulgados</p>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>

            <section aria-label="Filtros" className="bg-card border border-border rounded-2xl p-3 space-y-3 md:sticky md:top-20 lg:top-[124px] xl:top-[122px] z-20 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
                  <input aria-label="Pesquisar critério" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por número, critério ou base legal..." className="w-full h-11 rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-foreground" />
                </div>
                <select aria-label="Filtrar por dimensão" value={dimensao} onChange={(e) => setDimensao(e.target.value)} className={`${seletor} max-w-[250px]`}>
                  <option value="">Todas as dimensões</option>
                  {dimensoes.map((d) => <option key={d.nome} value={d.nome}>{d.nome} ({d.total})</option>)}
                </select>
                <select aria-label="Filtrar por classificação" value={classe} onChange={(e) => setClasse(e.target.value)} className={seletor}>
                  <option value="">Todas as classificações</option>
                  {Object.keys(COR_CLASSIFICACAO).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select aria-label="Filtrar por situação" value={link} onChange={(e) => setLink(e.target.value)} className={seletor}>
                  <option value="">Todas as situações</option>
                  {(Object.keys(SITUACOES) as Situacao[]).map((s) => <option key={s} value={s}>{SITUACOES[s].rotulo} ({contarSituacao(s)})</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-sm text-muted-foreground" aria-live="polite"><strong className="text-foreground">{filtrados.length}</strong> de {itens.length} critérios</p>
                <div className="flex items-center gap-2">
                  {temFiltro && <button type="button" onClick={() => { setBusca(""); setDimensao(""); setClasse(""); setLink(""); }} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm font-semibold text-foreground hover:bg-muted"><X className="w-4 h-4" aria-hidden /> Limpar</button>}
                  <button type="button" onClick={baixarCsv} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted"><Download className="w-4 h-4" aria-hidden /> Baixar CSV</button>
                </div>
              </div>
            </section>

            <p role="note" className="flex gap-2.5 rounded-2xl border border-amber-300/70 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-foreground">
              <Info className="w-5 h-5 shrink-0 text-amber-700" aria-hidden />
              <span>A avaliação confere se o link existe e se a página tem informação publicada. Ela não analisa o conteúdo, a atualidade nem o histórico exigidos pela Atricon.</span>
            </p>

            {grupos.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center font-semibold text-foreground">Nenhum critério encontrado com esses filtros.</div>
            ) : (
              <div className="space-y-4">
                {grupos.map(([g, lista]) => {
                  const d = dimensoes.find((x) => x.nome === g)!;
                  const aberto = !fechados.has(g) || temFiltro;
                  const percentual = pct(d.divulgados, d.total);
                  return (
                    <section key={g} aria-label={g} className="bg-card border border-border rounded-2xl overflow-hidden">
                      <h2>
                        <button type="button" aria-expanded={aberto} onClick={() => alternar(g)} className="w-full flex flex-wrap items-center gap-x-4 gap-y-2 p-4 md:p-5 text-left hover:bg-muted/40 transition focus-visible:outline-2 focus-visible:-outline-offset-2">
                          <span className="font-display font-bold text-lg text-foreground flex-1 min-w-[200px]">{g}</span>
                          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span className="w-24 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden><span className="block h-full rounded-full" style={{ width: `${percentual}%`, backgroundColor: "#0B7A4B" }} /></span>
                            {verificacao ? `${percentual}% divulgado · ${d.comLink} de ${d.total} com link` : `${d.comLink} de ${d.total} com link`}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${aberto ? "rotate-180" : ""}`} aria-hidden />
                        </button>
                      </h2>
                      {aberto && <ul className="divide-y divide-border border-t border-border">{lista.map((i) => <Criterio key={i.id} item={i} situacao={situacoes.get(i.id)} />)}</ul>}
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </TransparencyLayout>
  );
};

export default AtriconPage;
