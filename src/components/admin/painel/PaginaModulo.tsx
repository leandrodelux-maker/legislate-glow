import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, ExternalLink } from "lucide-react";
import { COR_PAINEL, moduloDaRota } from "./modulos";

export type Indicador = { rotulo: string; valor: string | number; detalhe?: string; cor?: string };

/** Página do painel: cabeçalho na cor do tema, no mesmo modelo da Transparência, e conteúdo com margem. */
export function PaginaModulo({
  titulo,
  descricao,
  acoes,
  children,
}: {
  titulo?: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const modulo = moduloDaRota(pathname);
  const cor = modulo?.grupo.cor ?? COR_PAINEL;
  const Icone = modulo?.icone;

  // Formulários e avisos abrem fora desta árvore: a cor do tema precisa valer na página inteira.
  useEffect(() => {
    document.documentElement.style.setProperty("--tema", cor);
    return () => {
      document.documentElement.style.removeProperty("--tema");
    };
  }, [cor]);

  return (
    <div className="-m-4 min-h-full md:-m-6 lg:-m-8" style={{ "--tema": cor } as React.CSSProperties}>
      <header
        className="relative overflow-hidden text-white"
        style={{ background: `linear-gradient(120deg, ${cor} 0%, ${cor} 45%, color-mix(in srgb, ${cor} 68%, #071a22) 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          aria-hidden
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />
        {Icone && <Icone className="absolute right-6 -bottom-10 h-48 w-48 opacity-10 hidden md:block pointer-events-none" aria-hidden />}
        <div className="relative px-4 md:px-8 py-6 md:py-8">
          <nav aria-label="Você está aqui" className="flex flex-wrap items-center gap-1 text-xs text-white/85">
            <Link to="/admin/dashboard" className="hover:underline underline-offset-2">Painel</Link>
            {modulo && modulo.grupo.id !== "geral" && (
              <>
                <ChevronRight className="h-3 w-3 opacity-70" aria-hidden />
                <span>{modulo.grupo.label}</span>
              </>
            )}
            <ChevronRight className="h-3 w-3 opacity-70" aria-hidden />
            <span className="font-semibold text-white">{modulo?.label ?? titulo}</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">{titulo ?? modulo?.label}</h1>
              <p className="text-sm md:text-base text-white/90 mt-1.5 leading-relaxed">{descricao ?? modulo?.desc}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {modulo?.site && (
                <a
                  href={modulo.site}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden /> Ver no site
                </a>
              )}
              {acoes}
            </div>
          </div>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">{children}</div>
    </div>
  );
}

export function Indicadores({ itens }: { itens: Indicador[] }) {
  if (!itens.length) return null;
  return (
    <dl className={`grid gap-3 grid-cols-2 ${itens.length >= 4 ? "lg:grid-cols-4" : itens.length === 3 ? "lg:grid-cols-3" : ""}`}>
      {itens.map((i) => (
        <div key={i.rotulo} className="relative overflow-hidden bg-card border border-border rounded-2xl p-4">
          <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: i.cor ?? "var(--tema)" }} aria-hidden />
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{i.rotulo}</dt>
          <dd className="font-display text-2xl font-bold text-foreground tabular-nums mt-1">{i.valor}</dd>
          {i.detalhe && <dd className="text-xs text-muted-foreground mt-0.5">{i.detalhe}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** Botão principal sobre o cabeçalho colorido. */
export function BotaoCabecalho({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold bg-white hover:bg-white/90 transition shadow-sm disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      style={{ color: "var(--tema)" }}
    >
      {children}
    </button>
  );
}

export function Selo({ children, cor }: { children: ReactNode; cor?: string }) {
  const c = cor ?? "#475569";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap border"
      style={{ color: `color-mix(in srgb, ${c} 72%, var(--foreground))`, backgroundColor: `color-mix(in srgb, ${c} 10%, transparent)`, borderColor: `color-mix(in srgb, ${c} 35%, transparent)` }}
    >
      {children}
    </span>
  );
}

/** Bloco de uma tela de configurações: título, explicação e conteúdo. */
export function SecaoPainel({ titulo, descricao, icone: Icone, children }: { titulo: string; descricao?: string; icone?: React.ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-start gap-3">
        {Icone && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icone className="h-5 w-5" /></span>}
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-foreground">{titulo}</h2>
          {descricao && <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Barra de salvar sempre à vista nas telas de configurações. */
export function BarraSalvar({ salvando, aviso }: { salvando?: boolean; aviso?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <p className="text-sm text-muted-foreground">{aviso ?? "As alterações só valem depois de salvar."}</p>
      <button type="submit" disabled={salvando} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-deep px-5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60">
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
    </div>
  );
}
