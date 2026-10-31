import { useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MotionConfig, motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { PERFIS, type AtalhoRapido } from "@/data/acessoRapido";

const ANIMACAO_CARTAO = "animate-[fade-up_0.4s_cubic-bezier(0.22,1,0.36,1)_both]";

function CartaoDestaque({ item }: { item: AtalhoRapido }) {
  const Icone = item.icone;
  return (
    <Link
      to={item.href as never}
      className={`acesso-destaque group relative col-span-2 flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl lg:row-span-2 ${ANIMACAO_CARTAO}`}
    >
      <Icone className="absolute -bottom-8 -right-6 h-44 w-44 text-white opacity-10 transition-transform duration-500 group-hover:scale-110" aria-hidden />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Comece por aqui</p>
        <span className="mt-4 grid h-12 w-12 place-items-center rounded-xl bg-gold text-gold-foreground">
          <Icone className="h-6 w-6" aria-hidden />
        </span>
      </div>
      <div className="relative mt-6">
        <h3 className="font-display text-2xl font-bold leading-tight">{item.titulo}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">{item.desc}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
          Acessar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function Cartao({ item, ordem }: { item: AtalhoRapido; ordem: number }) {
  const Icone = item.icone;
  return (
    <Link
      to={item.href as never}
      style={{ animationDelay: `${(ordem + 1) * 35}ms` }}
      className={`group relative flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant md:p-5 ${ANIMACAO_CARTAO}`}
    >
      <span className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icone className="h-5 w-5" aria-hidden />
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </span>
      <h3 className="mt-3.5 font-display text-[0.95rem] font-semibold leading-snug text-foreground">{item.titulo}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">{item.desc}</p>
    </Link>
  );
}

export function QuickAccess() {
  const [ativo, setAtivo] = useState(PERFIS[0].id);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const perfil = PERFIS.find((p) => p.id === ativo) ?? PERFIS[0];

  // Padrão de abas: setas, Home e End trocam de perfil; Tab segue direto para os cartões.
  const teclas = (e: React.KeyboardEvent, i: number) => {
    const destinos: Record<string, number> = { ArrowRight: (i + 1) % PERFIS.length, ArrowLeft: (i - 1 + PERFIS.length) % PERFIS.length, Home: 0, End: PERFIS.length - 1 };
    const destino = destinos[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    setAtivo(PERFIS[destino].id);
    abas.current[destino]?.focus();
  };

  return (
    <section aria-labelledby={`${base}-titulo`} className="container-page relative z-10 -mt-20 md:-mt-24">
      <div className="rounded-3xl border border-border/70 bg-background p-5 shadow-2xl shadow-primary-deep/15 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Zap className="h-3.5 w-3.5 text-gold" aria-hidden /> Tudo a um clique
            </p>
            <h2 id={`${base}-titulo`} className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Acesso Rápido
            </h2>
            <p className="mt-1 text-muted-foreground">Escolha seu perfil e encontre o que você precisa.</p>
          </div>

          <MotionConfig reducedMotion="user">
            <div role="tablist" aria-label="Perfil de acesso" className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary/60 p-1.5 sm:flex">
              {PERFIS.map((p, i) => {
                const selecionado = p.id === perfil.id;
                return (
                  <button
                    key={p.id}
                    ref={(el) => { abas.current[i] = el; }}
                    type="button"
                    role="tab"
                    id={`${base}-aba-${p.id}`}
                    aria-selected={selecionado}
                    aria-controls={`${base}-painel`}
                    tabIndex={selecionado ? 0 : -1}
                    onClick={() => setAtivo(p.id)}
                    onKeyDown={(e) => teclas(e, i)}
                    className={`relative inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${selecionado ? "text-white" : "text-foreground hover:bg-white"}`}
                  >
                    {selecionado && (
                      <motion.span layoutId="acesso-aba" className="absolute inset-0 rounded-xl bg-primary-deep shadow-md" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                    )}
                    <p.icone className={`relative h-4 w-4 ${selecionado ? "text-gold" : "text-primary"}`} aria-hidden />
                    <span className="relative">{p.rotulo}</span>
                  </button>
                );
              })}
            </div>
          </MotionConfig>
        </div>

        <div
          key={perfil.id}
          id={`${base}-painel`}
          role="tabpanel"
          aria-labelledby={`${base}-aba-${perfil.id}`}
          className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:gap-4 lg:grid-cols-4"
        >
          <CartaoDestaque item={perfil.destaque} />
          {perfil.itens.map((item, i) => (
            <Cartao key={item.href} item={item} ordem={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
