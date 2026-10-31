import logoAsset from "@/assets/logo-camara.png.asset.json";
import { Link } from "@tanstack/react-router";
import { useContactInfo } from "@/hooks/use-contact-info";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Mail, Phone, Clock, Map, Menu, X, ChevronDown, Info, MessageSquare, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BuscaSite } from "@/components/busca-site";
import radarLogo from "@/assets/radar-transparencia.png.asset.json";
import { ROUTES, INFO_ACCESS_LINKS, CAMARA_LINKS, ATOS_LEGISLATIVOS_LINKS } from "@/lib/site-links";

/** Maior altura do logotipo no cabeçalho: um valor maior no painel não pode esticar a barra. */
const LOGO_ALTURA_MAX = 76;

const mainNav = [
  { to: ROUTES.home, label: "INÍCIO" },
  { to: ROUTES.historia, label: "A CÂMARA", children: CAMARA_LINKS },
  { to: ROUTES.vereadores, label: "VEREADORES" },
  { to: ROUTES.sessoes, label: "SESSÕES" },
  { to: ROUTES.projetos, label: "ATOS LEGISLATIVOS", children: ATOS_LEGISLATIVOS_LINKS },
  { to: ROUTES.noticias, label: "NOTÍCIAS" },
  { to: ROUTES.contato, label: "CONTATO" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { settings } = useSiteSettings();
  const contato = useContactInfo();
  const phone = contato.telefone;
  const email = contato.email;
  const hours = contato.horario;
  const logoAltura = Math.min(Number(settings?.header_logo_height) || LOGO_ALTURA_MAX, LOGO_ALTURA_MAX);

  // Fio dourado na barra de navegação: mostra quanto da página já foi lido.
  const fio = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let quadro = 0;
    const atualizar = () => {
      quadro = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (fio.current) fio.current.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
    };
    const aoRolar = () => { if (!quadro) quadro = requestAnimationFrame(atualizar); };
    atualizar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>

      {/* TOP STRIP — institutional blue */}
      <div className="bg-primary-deep text-white text-xs">
        <div className="container-page flex h-9 items-center gap-5">
          <div className="hidden md:flex items-center gap-5">
            <Link to={ROUTES.mapaDoSite} className="inline-flex items-center gap-1.5 hover:text-gold transition-colors">
              <Map className="h-3.5 w-3.5 text-gold" aria-hidden /> Mapa do Site
            </Link>
            <a href={contato.telefoneHref} className="inline-flex items-center gap-1.5 hover:text-gold transition-colors">
              <Phone className="h-3.5 w-3.5 text-gold" aria-hidden /> {phone}
            </a>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-gold transition-colors">
              <Mail className="h-3.5 w-3.5 text-gold" aria-hidden /> {email}
            </a>
            <span className="hidden lg:inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold" aria-hidden /> {hours}
            </span>
          </div>
          <a href={contato.telefoneHref} className="md:hidden inline-flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-gold" aria-hidden /> {phone}
          </a>
        </div>
      </div>

      {/* WHITE HEADER — logo + search + CTAs */}
      <div className="cabecalho-marca border-b border-slate-100">
        <div className="container-page py-3 md:py-[22px] flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-4 gap-y-3">
          <Link to="/" aria-label={`${contato.nome}: página inicial`} className="shrink-0 transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={settings?.header_logo_url || logoAsset.url}
              alt=""
              decoding="async"
              style={{ "--logo-altura": `${logoAltura}px` } as React.CSSProperties}
              className="h-[min(var(--logo-altura),60px)] md:h-[var(--logo-altura)] w-auto max-w-full object-contain"
            />
          </Link>

          <div className="order-last w-full lg:order-none lg:ml-auto lg:w-auto lg:flex-1 lg:max-w-[340px]">
            <BuscaSite />
          </div>

          <div className="hidden md:flex items-center gap-2 ml-auto lg:ml-0 shrink-0">
            <a
              href="https://radardatransparencia.atricon.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 h-12 pl-2 pr-3 rounded-2xl bg-white text-primary-deep font-semibold text-sm ring-1 ring-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30 whitespace-nowrap"
              aria-label="Radar da Transparência Pública (abre em nova aba)"
            >
              <span className="cabecalho-radar relative grid h-9 w-12 place-items-center">
                <img src={radarLogo.url} alt="" className="relative h-9 w-auto object-contain" />
              </span>
              <span className="hidden xl:inline">Radar da Transparência</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden />
            </a>
            <Link
              to={ROUTES.transparencia}
              className="cabecalho-cta relative inline-flex items-center gap-2.5 h-12 pl-2 pr-4 rounded-2xl overflow-hidden text-white font-semibold text-sm shadow-md transition hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gold text-gold-foreground">
                <Info className="h-4 w-4" aria-hidden />
              </span>
              Acesso à Transparência
            </Link>
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-lg text-primary-deep hover:bg-slate-100"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* BLUE NAV BAR */}
      <nav id="menu-principal" aria-label="Principal" className="hidden lg:block bg-primary-deep border-t border-white/10 sticky top-0 z-40" tabIndex={-1}>
        <span ref={fio} className="absolute inset-x-0 bottom-0 z-10 h-0.5 origin-left scale-x-0 bg-gold pointer-events-none" aria-hidden />
        <div className="container-page flex items-center justify-between gap-2">
          {/* MAIN MENU — left side */}
          <ul className="flex items-stretch -ml-2.5">
            {mainNav.map((item) =>
              "children" in item && item.children ? (
                <li key={item.to} className="relative group">
                  <Link
                    to={item.to}
                    className="relative inline-flex items-center gap-1 px-1.5 xl:px-2.5 py-4 text-[12px] xl:text-[14px] font-semibold tracking-wide text-white/90 hover:text-white hover:bg-white/5 transition-colors uppercase whitespace-nowrap"
                    activeProps={{
                      className: "text-white after:absolute after:left-1.5 after:right-1.5 xl:after:left-2.5 xl:after:right-2.5 after:bottom-0 after:h-[3px] after:rounded-t after:bg-gold",
                    }}
                  >
                    {item.label} <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Link>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute left-0 top-full min-w-[260px] bg-white text-slate-700 shadow-xl rounded-b-md border border-slate-100 py-2 z-50">
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        className="block px-4 py-2.5 text-sm font-medium hover:bg-slate-50 hover:text-primary"
                        activeProps={{ className: "bg-slate-50 text-primary" }}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </li>
              ) : (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    className={cn(
                      "relative inline-flex items-center gap-1 px-1.5 xl:px-2.5 py-4 text-[12px] xl:text-[14px] font-semibold tracking-wide text-white/90 hover:text-white hover:bg-white/5 transition-colors uppercase whitespace-nowrap"
                    )}
                    activeProps={{
                      className: "text-white after:absolute after:left-1.5 after:right-1.5 xl:after:left-2.5 xl:after:right-2.5 after:bottom-0 after:h-[3px] after:rounded-t after:bg-gold",
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          {/* RIGHT GROUP — Transparency + Info Access, separated by a divider */}
          <div className="flex items-stretch gap-1 text-white/90 shrink-0 border-l border-white/20 pl-1 xl:pl-3">
            <Link
              to={ROUTES.transparencia}
              className="relative inline-flex items-center gap-1 px-1.5 xl:px-2.5 py-4 text-[12px] xl:text-[14px] font-semibold tracking-wide hover:bg-white/5 hover:text-white transition-colors uppercase whitespace-nowrap"
              activeProps={{
                className: "text-white after:absolute after:left-1.5 after:right-1.5 xl:after:left-2.5 xl:after:right-2.5 after:bottom-0 after:h-[3px] after:rounded-t after:bg-gold",
              }}
            >
              <Info className="h-3.5 w-3.5" /> Transparência
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="relative inline-flex items-center gap-1 px-1.5 xl:px-2.5 py-4 text-[12px] xl:text-[14px] font-semibold tracking-wide hover:bg-white/5 hover:text-white transition-colors uppercase whitespace-nowrap"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Acesso à Informação <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute right-0 top-full min-w-[220px] bg-white text-slate-700 shadow-xl rounded-md border border-slate-100 py-2 z-50">
                {INFO_ACCESS_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="block px-4 py-2 text-sm hover:bg-slate-50 hover:text-primary">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      {open && (
        <nav aria-label="Menu mobile" className="lg:hidden bg-primary-deep text-white animate-[fade-in_0.2s_ease-out]">
          <ul className="container-page py-3 flex flex-col">
            {mainNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  className="block rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wider text-white/85 hover:bg-white/10"
                  activeProps={{ className: "text-white bg-white/10" }}
                >
                  {item.label}
                </Link>
                {"children" in item && item.children && (
                  <ul className="mb-1 ml-3 border-l border-white/15 pl-3">
                    {item.children.map((c) => (
                      <li key={c.to}>
                        <Link
                          to={c.to}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
                          activeProps={{ className: "text-white bg-white/10" }}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="pt-3 mt-2 border-t border-white/10 flex gap-2">
              <Link
                to={ROUTES.transparencia}
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-4 rounded-xl bg-gold text-gold-foreground font-semibold text-sm text-center leading-tight"
              >
                <Info className="h-4 w-4 shrink-0" aria-hidden /> Acesso à Transparência
              </Link>
              <a
                href="https://radardatransparencia.atricon.org.br/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-4 rounded-xl bg-white text-primary-deep font-semibold text-sm ring-1 ring-white/20"
              >
                <img src={radarLogo.url} alt="" className="h-7 w-auto" /> Radar
              </a>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
