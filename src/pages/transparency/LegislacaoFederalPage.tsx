import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/roteador-transparencia";
import { BookOpenText, ExternalLink, Gavel, Landmark, Scale, Search, ShieldCheck, Wallet } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import LeiFederalPopup, { type LeiFederal } from "@/components/transparency/LeiFederalPopup";
import { findItem, itemHref } from "@/data/transparenciaCatalogo";

// Legislação federal que rege a transparência e as contas do município: as leis listadas pelo Portal da
// Transparência e as demais aplicáveis, com o texto oficial do Planalto (public/leis-federais, gerado por
// scripts/leis-federais/gerar.mjs) aberto num popup no formato da publicação oficial.
interface Indice { categorias: { id: string; nome: string }[]; leis: LeiFederal[]; geradoEm: string }

const ICONES: Record<string, typeof Scale> = { transparencia: ShieldCheck, financas: Wallet, compras: Gavel, controle: Landmark };
const COR_TIPO: Record<string, string> = {
  "Constituição": "bg-emerald-600", "Lei Complementar": "bg-indigo-600", Lei: "bg-sky-600", Decreto: "bg-amber-600", Portaria: "bg-slate-600",
};
const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const LegislacaoFederalPage = () => {
  const item = findItem("legislacao-federal")!;
  const cor = item.tema.color;
  const [indice, setIndice] = useState<Indice | null>(null);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [aberta, setAberta] = useState<LeiFederal | null>(null);

  useEffect(() => { fetch("/leis-federais/indice.json").then((r) => r.json()).then(setIndice).catch(() => setIndice({ categorias: [], leis: [], geradoEm: "" })); }, []);

  const leis = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    return (indice?.leis ?? []).filter((l) => (!categoria || l.categoria === categoria)
      && termos.every((t) => normalizar(`${l.apelido} ${l.titulo} ${l.resumo} ${l.ementa ?? ""}`).includes(t)));
  }, [indice, busca, categoria]);
  const doPortal = (indice?.leis ?? []).filter((l) => l.noPortal).length;
  const total = indice?.leis.length ?? 0;

  return (
    <TransparencyLayout title={item.label} description={item.desc}
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: item.tema.label, href: `/transparencia/tema/${item.tema.id}` }, { label: item.label }]}>

      {/* Destaque */}
      <section className="relative overflow-hidden rounded-3xl text-white p-6 md:p-10 mb-8" style={{ background: `linear-gradient(135deg, ${cor}, color-mix(in srgb, ${cor} 55%, #1a1203))` }}>
        <img src="/images/brasao-republica.svg" alt="" aria-hidden className="absolute -right-10 -bottom-12 h-72 w-auto opacity-[0.13] pointer-events-none" />
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">Legislação federal</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold mt-1 max-w-2xl leading-tight">As leis que garantem o seu direito de saber como o dinheiro público é usado</h2>
        <p className="text-white/85 mt-3 max-w-2xl">Leia o texto oficial de cada lei aqui mesmo, no formato da publicação, com a opção de ir direto a um artigo e ocultar os trechos revogados.</p>
        <dl className="mt-6 flex flex-wrap gap-3">
          {[[String(total), "leis e normas"], [String(doPortal), "listadas pelo portal oficial"], [String(total - doPortal), "complementares, incluídas pelo site"]].map(([n, r]) => (
            <div key={r} className="rounded-2xl bg-white/12 px-4 py-2.5" style={{ backgroundColor: "rgb(255 255 255 / 0.13)" }}>
              <dt className="sr-only">{r}</dt>
              <dd><span className="font-display text-2xl font-bold tabular-nums">{n}</span> <span className="text-sm text-white/85">{r}</span></dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Tema e busca */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="tema" className="text-sm font-semibold text-foreground">Tema</label>
          <select id="tema" value={categoria ?? ""} onChange={(e) => setCategoria(e.target.value || null)} className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
            <option value="">Todos</option>
            {indice?.categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="relative flex-1 min-w-full sm:min-w-[16rem]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar lei: acesso à informação, licitação, LGPD, 12.527…" aria-label="Buscar lei"
            className="w-full h-11 rounded-xl border border-border/60 bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15" />
        </div>
      </div>

      {/* Leis por tema */}
      {(indice?.categorias ?? []).map((c) => {
        const daCategoria = leis.filter((l) => l.categoria === c.id);
        if (!daCategoria.length) return null;
        const Icone = ICONES[c.id] ?? Scale;
        return (
          <section key={c.id} className="mb-10">
            <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-foreground mb-4">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cor }}><Icone className="h-4 w-4" aria-hidden /></span>
              {c.nome} <span className="text-sm font-normal text-muted-foreground">({daCategoria.length})</span>
            </h3>
            <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {daCategoria.map((l) => (
                <li key={l.slug} className="group relative flex flex-col rounded-3xl border border-border/50 bg-card p-5 hover:shadow-xl hover:-translate-y-0.5 hover:border-transparent transition">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white ${COR_TIPO[l.tipo] ?? "bg-slate-600"}`}>{l.tipo}</span>
                    {l.noPortal
                      ? <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">No portal oficial</span>
                      : <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-muted text-muted-foreground">Complementar</span>}
                    {l.revogada && <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">Revogada</span>}
                  </div>
                  <h4 className="font-display text-lg font-bold text-foreground mt-3 leading-snug">{l.apelido}</h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">{l.titulo}</p>
                  <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed flex-1">{l.resumo}</p>
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setAberta(l)}
                      className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: cor }}>
                      <BookOpenText className="h-4 w-4" aria-hidden /> Ler a lei
                    </button>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" title="Abrir no Planalto"
                      className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border/60 hover:bg-muted/60">
                      <ExternalLink className="h-4 w-4" aria-hidden /><span className="sr-only">Abrir {l.titulo} no Planalto</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {indice && !leis.length && <p className="text-center text-muted-foreground py-12">Nenhuma lei encontrada para “{busca}”.</p>}

      <p className="text-xs text-muted-foreground mt-2">
        Textos compilados do Portal da Legislação do Planalto{indice?.geradoEm ? `, copiados em ${new Date(`${indice.geradoEm}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}.
        As leis, decretos e portarias do município estão em <Link to={itemHref(findItem("legislacao-municipal")!)} className="font-semibold underline underline-offset-2">Legislação Municipal</Link>.
      </p>

      <LeiFederalPopup lei={aberta} aoFechar={() => setAberta(null)} />
    </TransparencyLayout>
  );
};

export default LegislacaoFederalPage;
