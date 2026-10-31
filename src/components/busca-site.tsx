import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, FileText, Search, type LucideIcon } from "lucide-react";
import { Link, useNavigate } from "@/lib/roteador-transparencia";
import { ALL_SITE_LINKS, ATOS_LEGISLATIVOS_LINKS, CAMARA_LINKS, INFO_ACCESS_LINKS, ROUTES } from "@/lib/site-links";
import { TODOS_ITENS, buscarItens, itemHref, type ItemComTema } from "@/data/transparenciaCatalogo";

type Resultado = { chave: string; titulo: string; desc?: string; href: string; grupo: string; icone: LucideIcon; cor: string };

const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const PAGINAS = [...ALL_SITE_LINKS, ...CAMARA_LINKS, ...ATOS_LEGISLATIVOS_LINKS, ...INFO_ACCESS_LINKS]
  .filter((l, i, todos) => l.to !== ROUTES.home && todos.findIndex((o) => o.to === l.to) === i);

const deItem = (i: ItemComTema, grupo: string): Resultado => ({
  chave: `t-${i.slug}`, titulo: i.label, desc: i.tema.label, href: itemHref(i), grupo, icone: i.tema.icon, cor: i.tema.color,
});

function buscar(termo: string): Resultado[] {
  const t = normalizar(termo.trim());
  if (t.length < 2) return TODOS_ITENS.filter((i) => i.popular).slice(0, 5).map((i) => deItem(i, "Mais procurados"));
  const paginas: Resultado[] = PAGINAS
    .filter((l) => normalizar(`${l.label} ${l.description ?? ""}`).includes(t))
    .slice(0, 4)
    .map((l) => ({ chave: `s-${l.to}`, titulo: l.label, desc: l.description, href: l.to, grupo: "Páginas do site", icone: FileText, cor: "var(--primary)" }));
  return [...paginas, ...buscarItens(termo, 5).map((i) => deItem(i, "Portal da Transparência"))];
}

/** Busca do cabeçalho: páginas do site e itens da Transparência. Ctrl+K foca, setas navegam, Enter abre, Esc fecha. */
export function BuscaSite({ destaque = false }: { /** Versão maior, sobre o fundo escuro da página inicial, sem o atalho Ctrl+K. */ destaque?: boolean }) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const listaId = useId();
  const resultados = useMemo(() => buscar(termo), [termo]);

  useEffect(() => setAtivo(0), [termo]);

  useEffect(() => {
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false); };
    const atalho = (e: KeyboardEvent) => {
      if (!destaque && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); campo.current?.focus(); }
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", atalho);
    return () => { document.removeEventListener("mousedown", fora); document.removeEventListener("keydown", atalho); };
  }, [destaque]);

  const abrir = (r?: Resultado) => {
    if (!r) return;
    setAberto(false);
    setTermo("");
    campo.current?.blur();
    navigate(r.href);
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAberto(true); setAtivo((i) => Math.min(i + 1, resultados.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); abrir(resultados[ativo]); }
    else if (e.key === "Escape") { setAberto(false); campo.current?.blur(); }
  };

  const mostrar = aberto;
  return (
    <div ref={caixa} role="search" className="relative w-full">
      <div className={`group/busca flex items-center rounded-2xl pl-4 pr-1.5 ring-1 transition focus-within:bg-white focus-within:shadow-lg focus-within:ring-primary/40 ${destaque ? "h-14 bg-white shadow-xl shadow-black/20 ring-white/20 md:h-16 md:pl-5" : "h-12 bg-slate-100/80 ring-transparent"}`}>
        <Search className="h-[18px] w-[18px] shrink-0 text-primary" aria-hidden />
        <input
          ref={campo}
          type="search"
          value={termo}
          onChange={(e) => { setTermo(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onKeyDown={teclas}
          placeholder={destaque ? "O que você procura? Ex.: licitações, vereadores, atas" : "O que você procura?"}
          aria-label="Buscar no site da Câmara e na Transparência"
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={mostrar && resultados[ativo] ? `${listaId}-${ativo}` : undefined}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm md:text-[0.95rem] text-slate-800 placeholder:text-slate-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {!destaque && <kbd className="hidden shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 font-sans text-[11px] font-semibold text-slate-500 xl:block group-focus-within/busca:hidden">Ctrl K</kbd>}
      </div>

      {mostrar && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 min-w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl animate-[fade-in_0.15s_ease-out]">
          {resultados.length === 0 ? (
            <div id={listaId} className="px-5 py-4 text-sm text-slate-600">
              Nada encontrado para “{termo}”. Tente outra palavra ou{" "}
              <Link to={ROUTES.esic} className="font-semibold text-primary hover:underline">peça a informação pelo e-SIC</Link>.
            </div>
          ) : (
            <ul id={listaId} role="listbox" aria-label="Resultados da busca" className="max-h-[60vh] overflow-y-auto py-1.5">
              {resultados.map((r, i) => (
                <li key={r.chave} id={`${listaId}-${i}`} role="option" aria-selected={i === ativo}>
                  {r.grupo !== resultados[i - 1]?.grupo && (
                    <p className="px-4 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{r.grupo}</p>
                  )}
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setAtivo(i)}
                    onClick={() => abrir(r)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${i === ativo ? "bg-slate-100" : ""}`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: r.cor }}>
                      <r.icone className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{r.titulo}</span>
                      {r.desc && <span className="block truncate text-xs text-slate-500">{r.desc}</span>}
                    </span>
                    <ArrowRight className={`h-4 w-4 shrink-0 text-slate-400 transition-opacity ${i === ativo ? "opacity-100" : "opacity-0"}`} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
