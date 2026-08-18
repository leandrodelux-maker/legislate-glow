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
  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div className="container-page py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            <MapIcon className="h-3 w-3" /> Índice
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">Mapa do Site</h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            Todas as {ALL_SITE_LINKS.length} páginas e serviços do portal, organizadas por categoria.
            Novos links são adicionados automaticamente aqui.
          </p>
        </div>
      </section>

      {/* SEÇÕES */}
      <section className="container-page py-10 md:py-14 space-y-10">
        {SITE_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded-full bg-primary" />
              <h2 className="font-display text-xl font-bold md:text-2xl">{section.title}</h2>
              <span className="text-xs text-muted-foreground">
                {section.links.length} {section.links.length === 1 ? "página" : "páginas"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.links.map((link) => {
                const content = (
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base font-semibold text-foreground group-hover:text-primary">
                        {link.label}
                      </div>
                      {link.description && (
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {link.description}
                        </div>
                      )}
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </>
                );
                const cls =
                  "group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm";
                return link.external ? (
                  <a
                    key={link.to}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                  >
                    {content}
                  </a>
                ) : (
                  <Link key={link.to} to={link.to} className={cls}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
