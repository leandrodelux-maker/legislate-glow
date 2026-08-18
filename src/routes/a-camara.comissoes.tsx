import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Gavel, Scale, Coins, GraduationCap, ArrowRight, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { SectionHeading } from "@/components/section-heading";
import { ROUTES } from "@/lib/site-links";
import { getCommitteeIcon } from "@/lib/committee-icons";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/a-camara/comissoes")({
  head: () => ({
    meta: [
      { title: "Comissões Permanentes — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Composição das comissões permanentes da Câmara Municipal: Constituição e Justiça; Finanças e Orçamento; Educação, Saúde e Meio Ambiente.",
      },
      { property: "og:title", content: "Comissões Permanentes — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Presidentes, vice-presidentes e relatores das comissões permanentes do Legislativo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComissoesPage,
});

type Vereador = {
  id: string;
  slug: string | null;
  nome: string;
  partido: string | null;
  foto_url: string | null;
};

type Comissao = {
  nome: string;
  sigla: string;
  icon: LucideIcon;
  competencia: string;
  membros: { nome: string; funcao: string }[];
};

const FALLBACK_COMISSOES: Comissao[] = [
  {
    nome: "Comissão de Constituição, Justiça e Redação",
    sigla: "CCJR",
    icon: Scale,
    competencia:
      "Analisa a constitucionalidade, a legalidade, a juridicidade e a técnica legislativa das proposições, além da redação final dos textos aprovados.",
    membros: [
      { nome: "Ana Glaucia Cardoso da Silva Mendonça", funcao: "Presidente" },
      { nome: "Ana Maria Marques de Assis", funcao: "Vice-Presidente" },
      { nome: "Matheus Teodoro Pinheiro", funcao: "Relator" },
    ],
  },
  {
    nome: "Comissão de Finanças, Orçamento, Economia, Obras, Serviços Públicos e Urbanismo",
    sigla: "CFO",
    icon: Coins,
    competencia:
      "Examina matérias de natureza financeira e orçamentária, prestação de contas, obras públicas, serviços urbanos e desenvolvimento econômico do município.",
    membros: [
      { nome: "Rodrigo Teixeira Amaral", funcao: "Presidente" },
      { nome: "José Divino Pereira", funcao: "Vice-Presidente" },
      { nome: "Maria José Pereira de Morais Avelar", funcao: "Relator" },
    ],
  },
  {
    nome: "Comissão de Educação, Cultura, Saúde, Assistência Social, Lazer, Esporte e Meio Ambiente",
    sigla: "CECS",
    icon: GraduationCap,
    competencia:
      "Aprecia proposições relativas a educação, cultura, saúde pública, assistência social, esporte, lazer e proteção ao meio ambiente.",
    membros: [
      { nome: "João Carlos Barra", funcao: "Presidente" },
      { nome: "Ângela Diniz de Oliveira", funcao: "Vice-Presidente" },
      { nome: "José Divino Pereira", funcao: "Relator" },
    ],
  },
];

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function ComissoesPage() {
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [comissoes, setComissoes] = useState<Comissao[]>(FALLBACK_COMISSOES);

  useEffect(() => {
    supabase
      .from("vereadores")
      .select("id, slug, nome, partido, foto_url")
      .then(({ data }) => setVereadores((data as Vereador[]) ?? []));
  }, []);

  // Comissões gerenciadas pelo painel administrativo
  useEffect(() => {
    (async () => {
      const [{ data: rows }, { data: membros }] = await Promise.all([
        (supabase as any)
          .from("comissoes")
          .select("id, nome, sigla, icone, competencia, ordem, ativo")
          .eq("ativo", true)
          .order("ordem", { ascending: true }),
        (supabase as any)
          .from("comissoes_membros")
          .select("comissao_id, nome, funcao, ordem")
          .order("ordem", { ascending: true }),
      ]);
      if (!rows?.length) return;
      setComissoes(
        (rows as any[]).map((c) => ({
          nome: c.nome,
          sigla: c.sigla,
          icon: getCommitteeIcon(c.icone),
          competencia: c.competencia ?? "",
          membros: ((membros as any[]) ?? [])
            .filter((m) => m.comissao_id === c.id)
            .map((m) => ({ nome: m.nome, funcao: m.funcao })),
        })),
      );
    })();
  }, []);

  const byName = useMemo(() => {
    const map = new Map<string, Vereador>();
    vereadores.forEach((v) => map.set(normalize(v.nome), v));
    return map;
  }, [vereadores]);

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_18%_20%,white,transparent_45%),radial-gradient(circle_at_82%_0%,white,transparent_40%)]"
        />
        <div className="container-page relative py-8 md:py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            <Gavel className="h-3 w-3" /> A Câmara
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">Comissões</h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            As comissões permanentes analisam e emitem parecer sobre as proposições antes da votação
            em plenário, garantindo o exame técnico e o debate qualificado das matérias.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {comissoes.map((c) => (
              <a
                key={c.sigla}
                href={`#${c.sigla.toLowerCase()}`}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-white/20"
              >
                {c.sigla}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page space-y-10 py-10 md:py-14">
        {comissoes.map((c) => (
          <article
            key={c.sigla}
            id={c.sigla.toLowerCase()}
            className="scroll-mt-28 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
          >
            <header className="border-b border-border bg-secondary/40 p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Comissão permanente · {c.sigla}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold leading-snug text-foreground md:text-2xl">
                    {c.nome}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                    {c.competencia}
                  </p>
                </div>
              </div>
            </header>

            <div className="p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> Composição da comissão
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c.membros.map((m) => {
                  const v = byName.get(normalize(m.nome));
                  return (
                    <div
                      key={`${c.sigla}-${m.nome}-${m.funcao}`}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
                    >
                      <VereadorAvatar
                        nome={m.nome}
                        foto={v?.foto_url}
                        partido={v?.partido}
                        size={72}
                        rounded="xl"
                        fit="contain"
                        className="bg-white"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                          {m.funcao}
                        </p>
                        <h3 className="mt-0.5 font-display text-sm font-bold leading-snug text-foreground">
                          {m.nome}
                        </h3>
                        {v?.partido && (
                          <p className="text-xs text-muted-foreground">{v.partido}</p>
                        )}
                        {v && (
                          <Link
                            to="/vereadores/$slug"
                            params={{ slug: v.slug || v.id }}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            Ver perfil <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-10 md:py-14">
          <SectionHeading
            eyebrow="Saiba mais"
            title="Como as comissões atuam"
            description="Toda proposição apresentada é distribuída às comissões competentes, que emitem parecer técnico antes da deliberação em plenário."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={ROUTES.roteiroSessoes}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Roteiro das sessões <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.projetos}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Projetos de lei <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
