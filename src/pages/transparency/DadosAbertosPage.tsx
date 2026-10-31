import { MUNICIPIO } from "@/config/municipio";
import { useInstitutionalData } from "@/hooks/useInstitutionalData";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/roteador-transparencia";
import { Braces, Clock, Database, FileSpreadsheet, Loader2, Search } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { TEMAS, TODOS_ITENS, findItem, itemHref } from "@/data/transparenciaCatalogo";
import { transparenciaDb } from "@/integrations/transparencia/client";
import { fetchTransparenciaDataset } from "@/hooks/useTransparenciaDataset";

// Catálogo de dados abertos: cada conjunto que o site copia do Portal da Transparência, com a quantidade de
// registros e a data da cópia, para baixar em CSV ou JSON (Decreto nº 8.777/2016, Lei nº 12.527/2011).
interface Sinc { dataset: string; ano: number; total_gravado: number | null; concluido_em: string }
interface Conjunto { dataset: string; nome: string; temaId: string; href: string; anos: { ano: number; registros: number; em: string }[] }

// Conjuntos com nome próprio que não correspondem a um item do catálogo.
const NOMES: Record<string, { slug: string; nome?: string }> = {
  folha: { slug: "folha" },
};

const baixar = (nome: string, conteudo: string, tipo: string) => {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  Object.assign(document.createElement("a"), { href: url, download: nome }).click();
  URL.revokeObjectURL(url);
};

const DadosAbertosPage = () => {
  const { data: inst } = useInstitutionalData();
  const item = findItem("dados-abertos")!;
  const cor = item.tema.color;
  const [sinc, setSinc] = useState<Sinc[] | null>(null);
  const [busca, setBusca] = useState("");
  const [baixando, setBaixando] = useState<string | null>(null);
  const [anoDe, setAnoDe] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!transparenciaDb) { setSinc([]); return; }
    transparenciaDb.from("transparencia_sincronizacoes").select("dataset, ano, total_gravado, concluido_em")
      .eq("status", "concluida").order("concluido_em", { ascending: false }).limit(5000)
      .then(({ data }) => setSinc((data ?? []) as Sinc[]));
  }, []);

  // Última cópia concluída de cada conjunto e ano, só dos conjuntos que têm página no site.
  const conjuntos = useMemo(() => {
    const mapa = new Map<string, Conjunto>();
    for (const s of sinc ?? []) {
      const ref = NOMES[s.dataset] ?? { slug: s.dataset };
      const it = TODOS_ITENS.find((i) => i.slug === ref.slug);
      if (!it || !s.total_gravado) continue;
      const c = mapa.get(s.dataset) ?? { dataset: s.dataset, nome: ref.nome ?? it.label, temaId: it.tema.id, href: itemHref(it), anos: [] };
      if (!c.anos.some((a) => a.ano === s.ano)) c.anos.push({ ano: s.ano, registros: s.total_gravado, em: s.concluido_em });
      mapa.set(s.dataset, c);
    }
    return [...mapa.values()].map((c) => ({ ...c, anos: c.anos.sort((a, b) => b.ano - a.ano) }));
  }, [sinc]);

  const filtrados = conjuntos.filter((c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase()));
  const totalRegistros = conjuntos.reduce((s, c) => s + (c.anos[0]?.registros ?? 0), 0);

  const exportar = async (c: Conjunto, formato: "csv" | "json") => {
    const ano = anoDe[c.dataset] ?? c.anos[0].ano;
    setBaixando(`${c.dataset}-${formato}`);
    try {
      const r = await fetchTransparenciaDataset<Record<string, string>>(c.dataset, ano);
      const linhas = r?.data ?? [];
      const nome = `${c.dataset}-${ano}`;
      if (formato === "json") baixar(`${nome}.json`, JSON.stringify({ conjunto: c.nome, ano, fonte: `Portal da Transparência de ${inst.municipio || MUNICIPIO.cidade}`, copiadoEm: r?.atualizadoEm, registros: linhas }, null, 1), "application/json");
      else {
        const cols = Object.keys(linhas[0] ?? {});
        const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        baixar(`${nome}.csv`, "﻿" + [cols.map(esc).join(";"), ...linhas.map((l) => cols.map((k) => esc(l[k])).join(";"))].join("\r\n"), "text/csv;charset=utf-8");
      }
    } finally { setBaixando(null); }
  };

  return (
    <TransparencyLayout title={item.label} description={item.desc}
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: item.tema.label, href: `/transparencia/tema/${item.tema.id}` }, { label: item.label }]}>
      <section className="relative overflow-hidden rounded-3xl text-white p-6 md:p-10 mb-8" style={{ background: `linear-gradient(135deg, ${cor}, color-mix(in srgb, ${cor} 55%, #1a1203))` }}>
        <Database className="absolute -right-6 -bottom-8 h-56 w-56 opacity-10" aria-hidden />
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">Dados abertos</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold mt-1 max-w-2xl leading-tight">Baixe os dados públicos do município e use como quiser</h2>
        <p className="text-white/85 mt-3 max-w-2xl">Planilhas (CSV) e dados estruturados (JSON) copiados diariamente do Portal da Transparência, livres para reutilização (Decreto nº 8.777/2016).</p>
        <dl className="mt-6 flex flex-wrap gap-3">
          {[[conjuntos.length.toLocaleString("pt-BR"), "conjuntos de dados"], [totalRegistros.toLocaleString("pt-BR"), "registros no ano mais recente"], ["CSV · JSON", "formatos abertos"]].map(([n, r]) => (
            <div key={r} className="rounded-2xl px-4 py-2.5" style={{ backgroundColor: "rgb(255 255 255 / 0.13)" }}>
              <dt className="sr-only">{r}</dt><dd><span className="font-display text-2xl font-bold tabular-nums">{n}</span> <span className="text-sm text-white/85">{r}</span></dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar conjunto de dados: despesas, folha, licitações…" aria-label="Buscar conjunto de dados"
          className="w-full h-11 rounded-xl border border-border/60 bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15" />
      </div>

      {!sinc ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-16"><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Montando o catálogo…</p>
      ) : TEMAS.map((tema) => {
        const doTema = filtrados.filter((c) => c.temaId === tema.id);
        if (!doTema.length) return null;
        return (
          <section key={tema.id} className="mb-8">
            <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-foreground mb-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: tema.color }}><tema.icon className="h-4 w-4" aria-hidden /></span>
              {tema.label} <span className="text-sm font-normal text-muted-foreground">({doTema.length})</span>
            </h3>
            <ul className="rounded-2xl border border-border/60 bg-card divide-y divide-border/50 overflow-hidden">
              {doTema.map((c) => {
                const ano = anoDe[c.dataset] ?? c.anos[0].ano;
                const atual = c.anos.find((a) => a.ano === ano) ?? c.anos[0];
                return (
                  <li key={c.dataset} className="flex flex-col md:flex-row md:items-center gap-3 px-4 sm:px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link to={c.href} className="text-sm font-semibold text-foreground hover:underline underline-offset-2">{c.nome}</Link>
                      <p className="text-xs text-muted-foreground mt-0.5 inline-flex flex-wrap items-center gap-x-2">
                        <span className="tabular-nums">{atual.registros.toLocaleString("pt-BR")} registros</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> copiado em {new Date(atual.em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.anos.length > 1 && (
                        <select value={ano} onChange={(e) => setAnoDe((m) => ({ ...m, [c.dataset]: Number(e.target.value) }))} aria-label={`Ano de ${c.nome}`}
                          className="h-9 rounded-lg border border-border/60 bg-background px-2 text-sm font-semibold">
                          {c.anos.map((a) => <option key={a.ano} value={a.ano}>{a.ano}</option>)}
                        </select>
                      )}
                      {(["csv", "json"] as const).map((f) => (
                        <button key={f} type="button" onClick={() => exportar(c, f)} disabled={!!baixando}
                          className="h-9 inline-flex items-center gap-1.5 rounded-lg px-3 text-sm font-semibold border border-border/60 hover:bg-muted/60 disabled:opacity-50">
                          {baixando === `${c.dataset}-${f}` ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : f === "csv" ? <FileSpreadsheet className="h-4 w-4 text-emerald-600" aria-hidden /> : <Braces className="h-4 w-4 text-sky-600" aria-hidden />}
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="text-xs text-muted-foreground mt-4">Os dados são uma cópia do Portal da Transparência do município, atualizada todos os dias. Em caso de divergência, vale a informação do portal oficial.</p>
    </TransparencyLayout>
  );
};

export default DadosAbertosPage;
