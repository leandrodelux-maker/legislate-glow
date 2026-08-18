import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, ArrowRight, Loader2, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { SectionHeading } from "@/components/section-heading";
import { ROUTES } from "@/lib/site-links";

export const Route = createFileRoute("/a-camara/mesa-diretora")({
  head: () => ({
    meta: [
      { title: "Mesa Diretora — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Composição da Mesa Diretora da Câmara Municipal: presidente, vice-presidente e secretários eleitos para o biênio em exercício.",
      },
      { property: "og:title", content: "Mesa Diretora — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Conheça os parlamentares que compõem a Mesa Diretora do Legislativo municipal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MesaDiretoraPage,
});

type Membro = {
  id: string;
  cargo: string | null;
  ordem: number | null;
  vereadores: {
    id: string;
    slug: string | null;
    nome: string;
    partido: string | null;
    foto_url: string | null;
    cargo: string | null;
  } | null;
};

const ATRIBUICOES = [
  {
    cargo: "Presidente",
    text: "Representa a Câmara, dirige os trabalhos do plenário, promulga resoluções e decretos legislativos e zela pelo cumprimento do Regimento Interno.",
  },
  {
    cargo: "Vice-Presidente",
    text: "Substitui o Presidente em suas ausências e impedimentos, assumindo a direção das sessões e dos atos administrativos da Casa.",
  },
  {
    cargo: "1ª Secretaria",
    text: "Faz a leitura das proposituras e da correspondência oficial, lavra as atas e responde pela guarda dos documentos legislativos.",
  },
  {
    cargo: "2ª Secretaria",
    text: "Auxilia e substitui a 1ª Secretaria, verifica a presença dos vereadores e apoia a apuração das votações.",
  },
];

function MesaDiretoraPage() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("mesa_diretora")
      .select("id, cargo, ordem, vereadores(id, slug, nome, partido, foto_url, cargo)")
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        setMembros((data as unknown as Membro[]) ?? []);
        setLoading(false);
      });
  }, []);

  const presidente = membros.find((m) => (m.cargo ?? "").toLowerCase().includes("presidente") && !(m.cargo ?? "").toLowerCase().includes("vice"));
  const demais = membros.filter((m) => m !== presidente);

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_25%,white,transparent_45%),radial-gradient(circle_at_85%_0%,white,transparent_40%)]"
        />
        <div className="container-page relative py-8 md:py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            <Crown className="h-3 w-3" /> A Câmara
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">Mesa Diretora</h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            A Mesa Diretora é o órgão de direção da Câmara Municipal, eleita entre os vereadores
            para conduzir os trabalhos legislativos e a administração da Casa.
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : membros.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            A composição da Mesa Diretora será divulgada em breve.
          </div>
        ) : (
          <>
            {presidente?.vereadores && (
              <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
                  <div className="bg-secondary/50 p-6">
                    <VereadorAvatar
                      nome={presidente.vereadores.nome}
                      foto={presidente.vereadores.foto_url}
                      partido={presidente.vereadores.partido}
                      size={180}
                      rounded="2xl"
                      fit="contain"
                      className="mx-auto bg-white"
                    />
                  </div>
                  <div className="p-6 md:pr-8">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-gold-foreground">
                      <Crown className="h-3 w-3" /> {presidente.cargo || "Presidente"}
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-bold text-foreground md:text-3xl">
                      {presidente.vereadores.nome}
                    </h2>
                    {presidente.vereadores.partido && (
                      <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-primary">
                        {presidente.vereadores.partido}
                      </p>
                    )}
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                      Preside as sessões plenárias, representa a Câmara Municipal em juízo e fora
                      dele e responde pela administração da Casa Legislativa.
                    </p>
                    <Link
                      to="/vereadores/$slug"
                      params={{ slug: presidente.vereadores.slug || presidente.vereadores.id }}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
                    >
                      Ver perfil completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {demais.map((m) =>
                m.vereadores ? (
                  <article
                    key={m.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="aspect-[3/4] bg-secondary/50">
                      <VereadorAvatar
                        nome={m.vereadores.nome}
                        foto={m.vereadores.foto_url}
                        partido={m.vereadores.partido}
                        size={220}
                        fill
                        rounded="lg"
                        fit="contain"
                        className="h-full w-full rounded-none border-0 bg-white"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                        {m.cargo || m.vereadores.cargo || "Membro"}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold leading-snug text-foreground">
                        {m.vereadores.nome}
                      </h3>
                      {m.vereadores.partido && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{m.vereadores.partido}</p>
                      )}
                      <Link
                        to="/vereadores/$slug"
                        params={{ slug: m.vereadores.slug || m.vereadores.id }}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                      >
                        Ver perfil{" "}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                ) : null,
              )}
            </div>
          </>
        )}
      </section>

      {/* ATRIBUIÇÕES */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-10 md:py-14">
          <SectionHeading
            eyebrow="Regimento Interno"
            title="Atribuições dos cargos"
            description="Competências definidas pelo Regimento Interno da Casa Legislativa para cada integrante da Mesa Diretora."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {ATRIBUICOES.map((a) => (
              <div key={a.cargo} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Landmark className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground">{a.cargo}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{a.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={ROUTES.comissoes}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Comissões permanentes <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.roteiroSessoes}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Roteiro das sessões <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
