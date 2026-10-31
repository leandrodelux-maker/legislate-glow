import { Search, SearchX } from "lucide-react";
import { useState } from "react";
import { EstadoVazio } from "@/components/pagina-hero";
import { PaginaHero } from "@/components/pagina-hero";
import { Map as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Map as MapIcon, ArrowUpRight } from "lucide-react";
import { SITE_SECTIONS, ALL_SITE_LINKS } from "@/lib/site-links";

export const Route = createFileRoute("/mapa-do-site")({
  head: () => ({
    meta: [
      { title: "Mapa do Site — Câmara Municipal" },
      {
        name: "description",
        content:
          "Índice completo com todas as páginas, serviços e canais oficiais do portal da Câmara Municipal.",
      },
      { property: "og:title", content: "Mapa do Site — Câmara Municipal" },
      { property: "og:description", content: "Todas as páginas e links deste portal em um único lugar." },
    ],
  }),
  component: MapaDoSitePage,
});

function MapaDoSitePage() {
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();
  const secoes = SITE_SECTIONS.map((s) => ({
    ...s,
    links: s.links.filter((l) => !termo || `${l.label} ${l.description ?? ""}`.toLowerCase().includes(termo)),
  })).filter((s) => s.links.length > 0);

  return (
    <div>
      <PaginaHero
        icone={IconeHero}
        eyebrow="Índice"
        title="Mapa do Site"
        description={<>Todas as páginas e serviços do portal, organizadas por assunto.</>}
      />

      <section className="container-page relative z-10 -mt-7">
        <div className="relative mx-auto max-w-3xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" aria-hidden />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Filtrar páginas"
            aria-label="Filtrar páginas do site"
            className="h-14 w-full rounded-2xl border border-border bg-card pl-13 pr-5 text-base shadow-xl shadow-primary-deep/15 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        {secoes.length === 0 ? (
          <EstadoVazio icone={SearchX} titulo="Nenhuma página encontrada" texto="Tente outra palavra." />
        ) : (
          <div className="gap-4 md:columns-2 lg:columns-3">
            {secoes.map((section) => (
              <div key={section.title} className="mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-border bg-card">
                <div className="flex items-center justify-between gap-3 bg-primary-deep px-5 py-3.5 text-white">
                  <h2 className="font-display font-semibold">{section.title}</h2>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold">{section.links.length}</span>
                </div>
                <ul className="divide-y divide-border/70">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to as never} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/60">
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground group-hover:text-primary">{link.label}</span>
                          {link.description && <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{link.description}</span>}
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
