import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/roteador-transparencia";
import { Search, ArrowRight } from "lucide-react";
import { buscarItens, itemHref, type ItemComTema } from "@/data/transparenciaCatalogo";

interface Props {
  size?: "lg" | "sm";
  placeholder?: string;
  autoFocus?: boolean;
  tom?: "claro" | "escuro";
}

// Busca no catálogo da transparência: mostra os itens enquanto o cidadão digita
// (setas para navegar, Enter para abrir, Esc para fechar).
const TransparenciaBusca = ({ size = "sm", placeholder = "O que você procura? Ex.: salário, licitação, diárias", autoFocus, tom = "claro" }: Props) => {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const listId = useId();
  const resultados: ItemComTema[] = buscarItens(termo);
  const lg = size === "lg";
  const escuro = tom === "escuro";

  useEffect(() => {
    const fora = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false); };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  useEffect(() => { setAtivo(0); }, [termo]);

  const abrir = (item: ItemComTema) => { setAberto(false); setTermo(""); navigate(itemHref(item)); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAberto(true); setAtivo((i) => Math.min(i + 1, resultados.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && resultados[ativo]) { e.preventDefault(); abrir(resultados[ativo]); }
    else if (e.key === "Escape") setAberto(false);
  };

  return (
    <div ref={ref} className="relative w-full" role="search">
      <div className={escuro
        ? "group/busca flex items-center h-12 rounded-xl pl-3.5 pr-1 bg-white/[0.09] text-white ring-1 ring-white/15 transition focus-within:bg-white focus-within:text-foreground focus-within:ring-2 focus-within:ring-sun"
        : `flex items-center bg-card text-foreground border border-border/60 shadow-sm focus-within:ring-4 focus-within:ring-primary/15 focus-within:border-primary/40 transition ${lg ? "rounded-2xl h-14 md:h-16 pl-5 pr-2" : "rounded-xl h-11 pl-4 pr-1.5"}`}>
        <Search className={`${lg ? "h-5 w-5" : "h-4 w-4"} shrink-0 ${escuro ? "text-white/60 group-focus-within/busca:text-primary" : "text-muted-foreground"}`} aria-hidden />
        <input
          type="search"
          value={termo}
          autoFocus={autoFocus}
          onChange={(e) => { setTermo(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Buscar no Portal da Transparência"
          role="combobox"
          aria-expanded={aberto && resultados.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          className={`flex-1 min-w-0 bg-transparent px-3 focus:outline-none ${escuro ? "text-[0.9375rem] placeholder:text-white/55 group-focus-within/busca:placeholder:text-muted-foreground" : `placeholder:text-muted-foreground/80 ${lg ? "text-base md:text-lg" : "text-sm"}`}`}
        />
        <button
          type="button"
          onClick={() => resultados[ativo] && abrir(resultados[ativo])}
          className={escuro
            ? "shrink-0 h-10 rounded-lg px-4 text-sm font-bold text-white/80 transition-colors hover:bg-white/10 group-focus-within/busca:bg-primary group-focus-within/busca:text-primary-foreground"
            : `shrink-0 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition ${lg ? "px-5 md:px-7 h-11 md:h-12 text-sm md:text-base" : "px-3.5 h-8 text-xs"}`}
        >
          Buscar
        </button>
      </div>

      {aberto && termo.trim().length > 1 && (
        <div id={listId} role="listbox" className="absolute left-0 right-0 top-full mt-2 z-50 bg-card text-foreground border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
          {resultados.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">
              Nada encontrado para “{termo}”. Tente outra palavra ou{" "}
              <Link to="/e-sic" className="text-primary font-semibold hover:underline">peça a informação pelo e-SIC</Link>.
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1.5">
              {resultados.map((item, i) => (
                <li key={item.slug} role="option" aria-selected={i === ativo}>
                  <button
                    type="button"
                    onMouseEnter={() => setAtivo(i)}
                    onClick={() => abrir(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${i === ativo ? "bg-muted/70" : ""}`}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: item.tema.color }}>
                      <item.tema.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold truncate">{item.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">{item.tema.label} · {item.desc}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TransparenciaBusca;
