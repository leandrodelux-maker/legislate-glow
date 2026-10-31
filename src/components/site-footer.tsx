import logoAsset from "@/assets/logo-camara.png.asset.json";
import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  ArrowUpRight,
  Clock,
  FileSearch,
  Mail,
  MapPin,
  Megaphone,
  MessageCircleQuestion,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ROUTES, FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from "@/lib/site-links";
import { useContactInfo } from "@/hooks/use-contact-info";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { FiosCachoeira } from "@/components/fios-cachoeira";

const ACOES: { to: string; titulo: string; desc: string; icone: LucideIcon }[] = [
  { to: ROUTES.transparencia, titulo: "Portal da Transparência", desc: "Receitas, despesas e contratos", icone: FileSearch },
  { to: ROUTES.esic, titulo: "e-SIC", desc: "Peça uma informação pública", icone: MessageCircleQuestion },
  { to: ROUTES.contato, titulo: "Ouvidoria", desc: "Denúncias, sugestões e elogios", icone: Megaphone },
];

// A biblioteca de ícones do projeto não traz marcas.
const ICONES_REDES: Record<string, string> = {
  Facebook: "M14 8.5V6.8c0-.8.5-1 1-1h2V2.5h-2.8C11.300 2.500 10 4.500 10 6.600V8.500H7.500V12H10v9.500h4V12h2.700l.5-3.500H14z",
  Instagram: "M7.500 2.500h9a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-9a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-9zM12 7.500a4.500 4.500 0 1 1 0 9 4.500 4.500 0 0 1 0-9zm0 2a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5zm5-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
  YouTube: "M21.600 7.200a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4a2.500 2.500 0 0 0-1.800 1.800C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3-5.200 3z",
};

export function SiteFooter() {
  const { settings } = useSiteSettings();
  const contact = useContactInfo();

  const logo = (settings?.footer_logo_url as string | null) || logoAsset.url;
  const redesSalvas = (settings?.redes_sociais ?? {}) as Record<string, string | undefined>;
  const redes = [
    { nome: "Facebook", url: redesSalvas.facebook },
    { nome: "Instagram", url: redesSalvas.instagram },
    { nome: "YouTube", url: redesSalvas.youtube },
  ].filter((r) => r.url);

  const contatos = [
    { rotulo: "Telefone", valor: contact.telefone, href: contact.telefoneHref, icone: Phone },
    { rotulo: "E-mail", valor: contact.email, href: `mailto:${contact.email}`, icone: Mail },
    { rotulo: "Atendimento", valor: contact.horario, icone: Clock },
  ];

  return (
    <footer className="rodape mt-24 text-white">
      {/* Faixa de participação */}
      <section aria-labelledby="rodape-chamada" className="rodape-faixa relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none" aria-hidden
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <FiosCachoeira />

        <div className="container-page relative py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/85 bg-white/10 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Participação cidadã
            </p>
            <h2 id="rodape-chamada" className="font-display text-3xl md:text-4xl font-bold leading-[1.1] mt-4 text-balance">
              A Câmara é feita de quem <span className="text-gold">acompanha, pergunta e participa.</span>
            </h2>
          </div>

          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {ACOES.map(({ to, titulo, desc, icone: Icone }) => (
              <li key={to}>
                <Link to={to} className="rodape-acao group flex h-full items-center gap-3.5 rounded-2xl border border-white/15 bg-white/[0.08] p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.14] hover:border-white/30">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground">
                    <Icone className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-semibold leading-snug">{titulo}</span>
                    <span className="block text-sm text-white/80 leading-snug mt-0.5">{desc}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contato e navegação */}
      <div className="bg-primary-deep">
        <div className="container-page py-12 md:py-14">
          <ul className="grid gap-3 md:grid-cols-3 pb-10 border-b border-white/10">
            {contatos.map(({ rotulo, valor, href, icone: Icone }) => (
              <li key={rotulo} className="flex items-center gap-3 min-w-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-gold">
                  <Icone className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-white/70">{rotulo}</span>
                  {href ? (
                    <a href={href} className="block text-sm font-semibold hover:text-gold transition-colors [overflow-wrap:anywhere]">{valor}</a>
                  ) : (
                    <span className="block text-sm font-semibold">{valor}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="grid gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.25fr_1.15fr]">
            <div>
              {/* Placa clara: o logotipo tem letras azul-escuras, que somem sobre o fundo do rodapé. */}
              <span className="inline-block max-w-full rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/20">
                <img
                  src={logo}
                  alt={contact.nome}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-auto max-w-full object-contain"
                />
              </span>
              <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-xs">
                O portal oficial do Poder Legislativo de Cachoeira de Goiás.
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm text-white/80 leading-relaxed max-w-xs">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" aria-hidden />
                <span>{contact.endereco}</span>
              </p>
              {redes.length > 0 && (
                <ul className="mt-5 flex gap-2">
                  {redes.map(({ nome, url }) => (
                    <li key={nome}>
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${nome} da Câmara (abre em nova aba)`}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.08] hover:bg-gold hover:text-gold-foreground transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden><path fillRule="evenodd" d={ICONES_REDES[nome]} /></svg>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{col.title}</h3>
                <ul className="mt-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="rodape-link inline-block py-1.5 text-white/85 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Nome da cidade como assinatura visual */}
        <div className="rodape-assinatura container-page select-none" aria-hidden>Cachoeira de Goiás</div>

        <div className="border-t border-white/10">
          <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/75">
            <p className="text-center md:text-left">© {new Date().getFullYear()} {contact.nome} · Todos os direitos reservados</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {FOOTER_LEGAL_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="py-1 hover:text-gold transition-colors">
                  {l.label}
                </Link>
              ))}
              <span className="rounded-full bg-white px-3 py-1 font-display font-bold text-primary-deep">VirtusGov</span>
              <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-1.5 py-1 font-semibold hover:text-gold transition-colors">
                Voltar ao topo <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
