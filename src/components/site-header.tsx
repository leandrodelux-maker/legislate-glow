import logoAsset from "@/assets/logo-camara.png.asset.json";
import { Link } from "@tanstack/react-router";
import { CONTACT_FALLBACK } from "@/hooks/use-contact-info";

import {
  Mail,
  Phone,
  Clock,

  Map,
  Menu,
  X,
  ChevronDown,
  Shield,
  Info,
  MessageSquare,
  Search,
  Globe,
  Landmark,
  
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import radarLogo from "@/assets/radar-transparencia.png.asset.json";
import { ROUTES, INFO_ACCESS_LINKS, CAMARA_LINKS, ATOS_LEGISLATIVOS_LINKS } from "@/lib/site-links";

type SiteSettings = {
  contact_phone: string | null;
  contact_email: string | null;
  contact_hours: string | null;
  header_logo_url: string | null;
  header_logo_height: number;
};

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
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("contact_phone, contact_email, contact_hours, header_logo_url, header_logo_height")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSettings(data as SiteSettings | null));
  }, []);

  const phone = settings?.contact_phone ?? CONTACT_FALLBACK.telefone;
  const email = settings?.contact_email ?? CONTACT_FALLBACK.email;
  const hours = settings?.contact_hours ?? CONTACT_FALLBACK.horario;


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
        <div className="container-page flex h-10 items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-5">
            <Link to={ROUTES.mapaDoSite} className="inline-flex items-center gap-1.5 hover:text-gold transition-colors">
              <Map className="h-3.5 w-3.5" /> Mapa do Site
            </Link>
            <span className="opacity-30">|</span>
            <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 hover:text-gold transition-colors">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </a>
            <span className="opacity-30">|</span>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-gold transition-colors">
              <Mail className="h-3.5 w-3.5" /> {email}
            </a>
            <span className="opacity-30">|</span>
            <span className="inline-flex items-center gap-1.5 opacity-90">
              <Clock className="h-3.5 w-3.5" /> {hours}
            </span>
          </div>
          <div className="md:hidden inline-flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" /> {phone}
          </div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Redes sociais" className="hover:text-gold transition-colors">
              <Globe className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* WHITE HEADER — logo + search + CTAs */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-page py-3.5 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            {settings?.header_logo_url || logoAsset.url ? (
              <img
                src={settings?.header_logo_url || logoAsset.url}
                alt="Logo Câmara Municipal"
                decoding="async"
                style={{ height: `${(settings?.header_logo_height || 80) * 1.5}px` }}
                className="w-auto max-w-[200px] object-contain"
              />
            ) : (
              <>
                <div className="grid h-16 w-16 place-items-center rounded-lg bg-gradient-to-br from-primary-deep to-primary text-white shadow-md ring-1 ring-gold/30">
                  <Landmark className="h-8 w-8" />
                </div>
                <div className="leading-tight">
                  <div className="font-display font-extrabold text-xl md:text-2xl text-primary-deep tracking-tight uppercase">
                    Câmara Municipal
                  </div>
                  <div className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                    Governo · Poder Legislativo
                  </div>
                </div>
              </>
            )}
          </Link>

          <div className="hidden lg:flex ml-auto w-full max-w-[260px]">
            <div className="relative w-full flex items-stretch h-[48px] rounded-xl bg-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <input
                placeholder="Buscar serviços, notícia"
                className="flex-1 min-w-0 h-full pl-4 pr-3 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Buscar"
                className="h-full w-10 shrink-0 grid place-items-center bg-primary hover:bg-primary-deep text-white transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://radardatransparencia.atricon.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[48px] px-3 rounded-xl bg-white hover:bg-slate-50 text-primary-deep font-semibold text-sm shadow-sm ring-1 ring-slate-200 transition-colors whitespace-nowrap"
              aria-label="Radar da Transparência Pública"
            >
              <img src={radarLogo.url} alt="" className="h-7 w-auto" />
              <span className="hidden xl:inline">Radar da Transparência</span>
            </a>
            <Link
              to={ROUTES.transparencia}
              className="inline-flex items-center gap-2 h-[48px] px-4 rounded-xl bg-primary hover:bg-primary-deep text-white font-semibold text-sm shadow-sm transition-colors whitespace-nowrap"
            >
              <Info className="h-4 w-4" /> Acesso a Transparência
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
        <div className="container-page flex items-center justify-between gap-2">
          {/* MAIN MENU — left side */}
          <ul className="flex items-stretch -ml-2.5">
            {mainNav.map((item) =>
              "children" in item && item.children ? (
                <li key={item.to} className="relative group">
                  <Link
                    to={item.to}
                    className="relative inline-flex items-center gap-1 px-2.5 py-4 text-[14px] font-semibold tracking-wide text-white/90 hover:text-white hover:bg-white/5 transition-colors uppercase whitespace-nowrap"
                    activeProps={{
                      className: "text-white after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-[3px] after:bg-white",
                    }}
                  >
                    {item.label} <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Link>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute left-0 top-full min-w-[260px] bg-white text-slate-700 shadow-xl rounded-b-md border border-slate-100 py-2 z-50">
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
                      "relative inline-flex items-center gap-1 px-2.5 py-4 text-[14px] font-semibold tracking-wide text-white/90 hover:text-white hover:bg-white/5 transition-colors uppercase whitespace-nowrap"
                    )}
                    activeProps={{
                      className: "text-white after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-[3px] after:bg-white",
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          {/* RIGHT GROUP — Transparency + Info Access, separated by a divider */}
          <div className="flex items-stretch gap-1 text-white/90 shrink-0 border-l border-white/20 pl-3">
            <Link
              to={ROUTES.transparencia}
              className="relative inline-flex items-center gap-1 px-2.5 py-4 text-[14px] font-semibold tracking-wide hover:bg-white/5 hover:text-white transition-colors uppercase whitespace-nowrap"
              activeProps={{
                className: "text-white after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-[3px] after:bg-white",
              }}
            >
              <Info className="h-3.5 w-3.5" /> Transparência
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="relative inline-flex items-center gap-1 px-2.5 py-4 text-[14px] font-semibold tracking-wide hover:bg-white/5 hover:text-white transition-colors uppercase whitespace-nowrap"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Acesso à Informação <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute right-0 top-full min-w-[220px] bg-white text-slate-700 shadow-xl rounded-md border border-slate-100 py-2 z-50">
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
                className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm"
              >
                <Info className="h-4 w-4" /> Acesso a Transparência
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
