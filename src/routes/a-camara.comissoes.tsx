import { ListOrdered, Crown } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { PaginaHero } from "@/components/pagina-hero";
import { Gavel as IconeHero } from "lucide-react";
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
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="A Câmara"
        title="Comissões"
        description={<>As comissões permanentes analisam e emitem parecer sobre as proposições antes da votação em plenário, garantindo o exame técnico e o debate qualificado das matérias.</>}
      >
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
      </PaginaHero>

      <section className="container-page space-y-5 py-12 md:py-16">
        {comissoes.map((c) => (
          <article key={c.sigla} id={c.sigla.toLowerCase()} className="grid scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[340px_1fr]">
            <header className="acesso-destaque relative overflow-hidden p-6 text-white md:p-7">
              <c.icon className="absolute -bottom-6 -right-5 h-32 w-32 opacity-10" aria-hidden />
              <p className="relative font-display text-4xl font-bold text-gold">{c.sigla}</p>
              <h2 className="relative mt-2 font-display text-xl font-bold leading-snug">{c.nome}</h2>
              <p className="relative mt-3 text-sm leading-relaxed text-white/90">{c.competencia}</p>
            </header>

            <div className="p-5 md:p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <Users className="h-3.5 w-3.5" aria-hidden /> Composição
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {c.membros.map((m) => {
                  const v = byName.get(normalize(m.nome));
                  const conteudo = (
                    <>
                      <FotoEstudio nome={m.nome} foto={v?.foto_url} partido={v?.partido} className="h-20 w-16 shrink-0 rounded-xl" />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-[oklch(0.5_0.11_70)]">{m.funcao}</span>
                        <span className="mt-0.5 block font-display text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{m.nome}</span>
                        {v?.partido && <span className="block text-xs text-muted-foreground">{v.partido}</span>}
                      </span>
                    </>
                  );
                  const classe = "group flex h-full items-center gap-3 rounded-2xl border border-border/70 bg-background p-2.5 pr-3 transition hover:border-primary/40 hover:shadow-sm";
                  return (
                    <li key={`${c.sigla}-${m.nome}-${m.funcao}`}>
                      {v ? <Link to="/vereadores/$slug" params={{ slug: v.slug || v.id }} className={classe}>{conteudo}</Link> : <div className={classe}>{conteudo}</div>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="border-y border-border/60 bg-secondary/40 py-12">
        <div className="container-page">
          <TituloSecao eyebrow="Saiba mais" titulo="Como as comissões atuam" descricao="Toda proposição apresentada é distribuída às comissões competentes, que emitem parecer técnico antes da deliberação em plenário." />
        </div>
      </section>

      <ContinueNavegando itens={[
        { to: ROUTES.roteiroSessoes, titulo: "Roteiro das Sessões", texto: "Como uma sessão acontece", icone: ListOrdered },
        { to: ROUTES.projetos, titulo: "Projetos de Lei", texto: "Matérias em tramitação", icone: Gavel },
        { to: ROUTES.mesaDiretora, titulo: "Mesa Diretora", texto: "Quem dirige a Câmara", icone: Crown },
      ]} />
    </div>
  );
}
