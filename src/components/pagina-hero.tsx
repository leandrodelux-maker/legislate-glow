import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Home, type LucideIcon } from "lucide-react";
import { buildBreadcrumbs } from "@/lib/site-links";
import { FiosCachoeira } from "@/components/fios-cachoeira";

/** Grupos de menu sem página própria: aparecem na trilha, mas não são link. */
const SEM_PAGINA = new Set(["/a-camara", "/atos-legislativos"]);

/** Trilha de navegação, sobre o fundo escuro do topo da página. `ultimo` troca o texto gerado pelo endereço, como o nome de uma notícia. */
export function TrilhaNavegacao({ ultimo }: { ultimo?: string }) {
  const { pathname } = useLocation();
  const trilha = buildBreadcrumbs(pathname);
  if (trilha.length < 2) return null;

  return (
    <nav aria-label="Você está aqui" className="flex flex-wrap items-center gap-1 text-xs text-white/85">
      {trilha.map((item, i) => {
        const fim = i === trilha.length - 1;
        return (
          <span key={item.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-70" aria-hidden />}
            {fim ? (
              <span aria-current="page" className="line-clamp-1 font-semibold text-white">{ultimo ?? item.label}</span>
            ) : SEM_PAGINA.has(item.to) ? (
              <span>{item.label}</span>
            ) : (
              <Link to={item.to as never} className="inline-flex items-center gap-1 underline-offset-2 hover:text-white hover:underline">
                {i === 0 && <Home className="h-3 w-3" aria-hidden />}
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** Topo padrão das páginas internas, no modelo do cabeçalho do Portal da Transparência. */
export function PaginaHero({
  icone: Icone,
  eyebrow,
  title,
  destaque,
  description,
  ultimo,
  children,
}: {
  icone: LucideIcon;
  eyebrow?: string;
  title: string;
  /** Parte do título que recebe o sublinhado dourado. */
  destaque?: string;
  description?: ReactNode;
  ultimo?: string;
  children?: ReactNode;
}) {
  return (
    <section className="pagina-hero relative isolate overflow-hidden text-white">
      <div className="textura-pontos absolute inset-0 -z-10" aria-hidden />
      <Icone className="absolute -bottom-10 right-6 -z-10 hidden h-56 w-56 opacity-10 md:block" aria-hidden />
      <FiosCachoeira />
      <div className="container-page relative py-8 md:py-10">
        <TrilhaNavegacao ultimo={ultimo} />
        {eyebrow && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/85">
            <Icone className="h-3.5 w-3.5" aria-hidden /> {eyebrow}
          </p>
        )}
        <h1 className={`${eyebrow ? "mt-1.5" : "mt-4"} max-w-4xl text-balance font-display text-3xl font-bold leading-tight md:text-4xl`}>
          {title}
          {destaque && <> <span className="underline decoration-gold decoration-[3px] underline-offset-[6px]">{destaque}</span></>}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">{description}</p>}
        {children}
      </div>
    </section>
  );
}

/** Lista sem resultados, com orientação para a pessoa não ficar sem saída. */
export function EstadoVazio({ icone: Icone, titulo, texto, children }: { icone: LucideIcon; titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icone className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{titulo}</h3>
      {texto && <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{texto}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
