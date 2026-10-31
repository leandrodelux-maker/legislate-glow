import { Link, useLocation } from "@/lib/roteador-transparencia";
import { ChevronDown, ChevronRight, ArrowRight, ExternalLink, LayoutGrid, X } from "lucide-react";
const Layout = ({ children }: { children: React.ReactNode }) => <div className="area-transparencia">{children}</div>;
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TransparenciaBusca from "./TransparenciaBusca";
import { TEMAS, TODOS_ITENS, itemHref, portalUrl, temaDaRota, type TransparenciaTema } from "@/data/transparenciaCatalogo";
import { useTransparenciaUrls } from "@/hooks/useTransparenciaUrls";

interface BreadcrumbItem { label: string; href?: string; }
interface TransparencyLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showSearch?: boolean;
  /** "home": a página monta o próprio destaque (hero) e o layout só fornece o menu de temas. */
  variant?: "page" | "home";
  /** Cor do cabeçalho quando a rota não pertence a um tema do catálogo. */
  accent?: string;
  /** Páginas do site que já têm seções próprias: o conteúdo ocupa a largura toda, sem a margem do layout. */
  conteudoLivre?: boolean;
}

// ---------- Menu de temas (painel grande no desktop, sanfona no celular) ----------

const PainelTema = ({ tema, onNavigate }: { tema: TransparenciaTema; onNavigate: () => void }) => {
  const { pathname } = useLocation();
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-0 bg-card border border-border/60 rounded-b-2xl shadow-2xl overflow-hidden">
      <div className="p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(150deg, ${tema.color}, ${tema.color}dd)` }}>
        <tema.icon className="absolute -right-6 -bottom-6 h-32 w-32 opacity-15" aria-hidden />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">{tema.short}</p>
        <h3 className="font-display text-xl font-bold leading-tight mt-1">{tema.label}</h3>
        <p className="text-sm text-white/85 mt-2 leading-relaxed">{tema.desc}</p>
        <Link to={`/transparencia/tema/${tema.id}`} onClick={onNavigate}
          className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-lg transition">
          Ver tudo ({tema.items.length}) <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ul className="p-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-x-2 content-start">
        {tema.items.map((item) => {
          const ativo = pathname === itemHref(item);
          return (
            <li key={item.slug}>
              <Link to={itemHref(item)} onClick={onNavigate}
                className={`group flex gap-2.5 rounded-xl px-3 py-2.5 transition ${ativo ? "bg-muted" : "hover:bg-muted/60"}`}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tema.color }} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground leading-snug group-hover:underline underline-offset-2">{item.label}</span>
                  <span className="block text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{item.desc}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const MenuTemas = () => {
  const [aberto, setAberto] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileTema, setMobileTema] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const { pathname } = useLocation();
  const temaAtual = temaDaRota(pathname);

  useEffect(() => { setAberto(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(null);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const entrar = (id: string) => { window.clearTimeout(timer.current); setAberto(id); };
  const sair = () => { timer.current = window.setTimeout(() => setAberto(null), 160); };
  const temaAberto = TEMAS.find((t) => t.id === aberto);

  return (
    <nav aria-label="Temas da transparência" className="bg-card border-b border-border/60 shadow-sm sticky top-0 z-40">
      {/* Desktop */}
      <div className="hidden lg:block relative" onMouseLeave={sair}>
        <div className="container mx-auto px-4">
          <ul className="flex items-stretch justify-between gap-1">
            <li>
              <Link to="/transparencia" className={`flex flex-col xl:flex-row items-center justify-center gap-1 xl:gap-2 h-full px-2 xl:px-3 py-2 xl:py-3 text-[11px] xl:text-sm font-bold border-b-[3px] transition ${pathname === "/transparencia" ? "border-primary text-primary" : "border-transparent text-foreground hover:text-primary"}`}>
                <span className="w-7 h-7 flex items-center justify-center"><LayoutGrid className="h-4 w-4" aria-hidden /></span> Início
              </Link>
            </li>
            {TEMAS.map((tema) => {
              const ativo = aberto === tema.id || temaAtual?.id === tema.id;
              return (
                <li key={tema.id} onMouseEnter={() => entrar(tema.id)}>
                  <button
                    type="button"
                    aria-expanded={aberto === tema.id}
                    onClick={() => setAberto(aberto === tema.id ? null : tema.id)}
                    onFocus={() => entrar(tema.id)}
                    className="group flex flex-col xl:flex-row items-center gap-1 xl:gap-2 h-full px-2 xl:px-2.5 py-2 xl:py-3 text-[11px] xl:text-sm font-semibold border-b-[3px] transition"
                    style={{ borderColor: ativo ? tema.color : "transparent", color: ativo ? tema.color : undefined }}
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 transition group-hover:scale-105" style={{ backgroundColor: tema.color }}>
                      <tema.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="whitespace-nowrap" title={tema.label}>{tema.menu}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <AnimatePresence>
          {temaAberto && (
            <motion.div key={temaAberto.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
              className="absolute left-0 right-0 top-full" onMouseEnter={() => entrar(temaAberto.id)}>
              <div className="container mx-auto px-4">
                <PainelTema tema={temaAberto} onNavigate={() => setAberto(null)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Celular */}
      <div className="lg:hidden container mx-auto px-4 py-2.5">
        <button type="button" onClick={() => setMobile(!mobile)} aria-expanded={mobile}
          className="w-full flex items-center justify-between bg-muted/50 border border-border/60 rounded-xl px-4 py-3 text-sm font-semibold text-foreground">
          <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" aria-hidden /> Temas da Transparência</span>
          {mobile ? <X className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
        </button>
        <AnimatePresence>
          {mobile && (
            <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-card border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40">
              {TEMAS.map((tema) => (
                <li key={tema.id}>
                  <button type="button" onClick={() => setMobileTema(mobileTema === tema.id ? null : tema.id)} aria-expanded={mobileTema === tema.id}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: tema.color }}>
                      <tema.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="flex-1 text-left">{tema.label}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileTema === tema.id ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {mobileTema === tema.id && (
                    <ul className="pb-2">
                      {tema.items.map((item) => (
                        <li key={item.slug}>
                          <Link to={itemHref(item)} className="block pl-[60px] pr-4 py-2 text-sm text-foreground hover:bg-muted/60">{item.label}</Link>
                        </li>
                      ))}
                      <li>
                        <Link to={`/transparencia/tema/${tema.id}`} className="block pl-[60px] pr-4 py-2 text-sm font-semibold" style={{ color: tema.color }}>Ver tudo →</Link>
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// ---------- Layout ----------

const TransparencyLayout = ({ children, title, description, breadcrumbs, showSearch = true, variant = "page", accent, conteudoLivre }: TransparencyLayoutProps) => {
  const { pathname } = useLocation();
  const { urls } = useTransparenciaUrls();
  const tema = temaDaRota(pathname);
  const item = TODOS_ITENS.find((i) => itemHref(i) === pathname);
  const cor = tema?.color ?? accent ?? "var(--primary)";
  const linkPortal = item ? portalUrl(item, `${urls.base_url}/`) : undefined;
  const trilha: BreadcrumbItem[] = breadcrumbs ?? [{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: title }];

  return (
    <Layout>
      <MenuTemas />

      {variant === "page" && (
        // Só a decoração é recortada: a lista da busca precisa sair do cabeçalho e ficar por cima do conteúdo.
        <header className="relative z-30 text-white" style={{ background: `linear-gradient(120deg, ${cor} 0%, ${cor} 45%, color-mix(in srgb, ${cor} 70%, #0b1f1a) 100%)` }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
            {tema && <tema.icon className="absolute right-6 -bottom-10 h-56 w-56 opacity-10 hidden md:block" />}
          </div>
          <div className="container mx-auto px-4 py-8 md:py-10 relative">
            <nav aria-label="Você está aqui" className="flex flex-wrap items-center gap-1 text-xs text-white/80">
              {trilha.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3 opacity-70" aria-hidden />}
                  {b.href ? <Link to={b.href} className="hover:text-white hover:underline underline-offset-2">{b.label}</Link> : <span className="text-white font-semibold">{b.label}</span>}
                </span>
              ))}
            </nav>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
              <div>
                {tema && (
                  <Link to={`/transparencia/tema/${tema.id}`} className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 hover:text-white">
                    <tema.icon className="h-3.5 w-3.5" aria-hidden /> {tema.label}
                  </Link>
                )}
                <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mt-1">{title}</h1>
                {description && <p className="text-sm md:text-base text-white/85 mt-2 max-w-2xl leading-relaxed">{description}</p>}
                {linkPortal && (
                  <a href={linkPortal} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Fonte oficial: Portal da Transparência
                  </a>
                )}
              </div>
              {showSearch && <TransparenciaBusca />}
            </div>
          </div>
        </header>
      )}

      <div className={variant === "page" && !conteudoLivre ? "container mx-auto px-4 py-8 md:py-10" : ""}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="min-w-0">
          {children}
        </motion.div>
      </div>
    </Layout>
  );
};

export default TransparencyLayout;
