import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { VereadorAvatar } from "@/components/vereador-avatar";

/** Foto de vereador sobre o fundo de estúdio. O tamanho vem de `className`, no contêiner. */
export function FotoEstudio({ nome, foto, partido, ouro = false, className = "" }: { nome: string; foto?: string | null; partido?: string | null; ouro?: boolean; className?: string }) {
  return (
    <div className={`vereador-estudio ${ouro ? "vereador-estudio-ouro" : ""} relative overflow-hidden ${className}`}>
      <VereadorAvatar
        nome={nome}
        foto={foto}
        partido={partido}
        size={240}
        fill
        rounded="lg"
        objectPosition="center 12%"
        className="!h-full !w-full !rounded-none !border-0 !bg-none !bg-transparent mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}

/** Título de seção no padrão do Portal da Transparência. */
export function TituloSecao({ eyebrow, titulo, descricao, centro = false, claro = false }: { eyebrow?: string; titulo: string; descricao?: ReactNode; centro?: boolean; claro?: boolean }) {
  return (
    <div className={`mb-6 md:mb-8 ${centro ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow && <p className={`text-xs font-bold uppercase tracking-[0.16em] ${claro ? "text-gold" : "text-primary"}`}>{eyebrow}</p>}
      <h2 className={`mt-1 font-display text-2xl font-bold leading-tight md:text-3xl ${claro ? "text-white" : "text-foreground"}`}>{titulo}</h2>
      {descricao && <p className={`mt-2 leading-relaxed ${claro ? "text-white/85" : "text-muted-foreground"}`}>{descricao}</p>}
    </div>
  );
}

/** Três ou quatro cartões que sobem sobre o banner da página. */
export function FaixaDestaques({ itens }: { itens: { icone: LucideIcon; titulo: string; texto: string }[] }) {
  const colunas = itens.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";
  return (
    <section className="container-page relative z-10 -mt-6 md:-mt-8">
      <ul className={`grid gap-3 md:gap-4 ${colunas}`}>
        {itens.map(({ icone: Icone, titulo, texto }, i) => (
          <li
            key={titulo}
            style={{ animationDelay: `${i * 60}ms` }}
            className="flex gap-3.5 rounded-2xl border border-border/70 bg-card p-5 shadow-lg shadow-primary-deep/10 animate-[fade-up_0.5s_ease-out_both]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground">
              <Icone className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display font-semibold leading-snug text-foreground">{titulo}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Atalhos ao fim da página, para a pessoa seguir navegando. */
export function ContinueNavegando({ itens }: { itens: { to: string; titulo: string; texto: string; icone: LucideIcon }[] }) {
  return (
    <section className="container-page pb-4 pt-12 md:pt-16">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">Continue navegando</p>
      <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
        {itens.map(({ to, titulo, texto, icone: Icone }) => (
          <li key={to}>
            <Link to={to as never} className="group flex h-full items-center gap-3.5 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icone className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-semibold leading-snug text-foreground">{titulo}</span>
                <span className="block text-sm leading-snug text-muted-foreground">{texto}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Filtros em forma de pílula. */
export function ChipsFiltro({ opcoes, ativa, aoEscolher, rotulo }: { opcoes: string[]; ativa: string; aoEscolher: (o: string) => void; rotulo: string }) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={ativa === o}
          onClick={() => aoEscolher(o)}
          className={`min-h-9 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
            ativa === o ? "border-primary-deep bg-primary-deep text-white" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
