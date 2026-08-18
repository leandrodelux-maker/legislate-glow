import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Landmark,
  CalendarDays,
  Users,
  Ruler,
  Sprout,
  GraduationCap,
  HeartPulse,
  Leaf,
  Coins,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ROUTES } from "@/lib/site-links";

export const Route = createFileRoute("/a-camara/historia")({
  head: () => ({
    meta: [
      { title: "História de Adelândia — Câmara Municipal" },
      {
        name: "description",
        content:
          "Conheça a história do município de Adelândia (GO): fundação em 1987, a Capital do Feijão, economia, população e indicadores oficiais.",
      },
      { property: "og:title", content: "História de Adelândia — Câmara Municipal" },
      {
        property: "og:description",
        content:
          "Origem do município, emancipação em 1987, economia agropecuária e indicadores sociais de Adelândia (GO).",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoriaPage,
});

const FACTS = [
  { icon: CalendarDays, label: "Fundação", value: "1987" },
  { icon: Sprout, label: "Aniversário", value: "1º de junho" },
  { icon: Users, label: "População", value: "2.515 hab." },
  { icon: Ruler, label: "Área", value: "115,39 km²" },
  { icon: MapPin, label: "Gentílico", value: "Adelandense" },
  { icon: Landmark, label: "Microrregião", value: "Anicuns" },
];

const INDICATORS: { title: string; icon: typeof Users; rows: [string, string][] }[] = [
  {
    title: "População",
    icon: Users,
    rows: [
      ["População estimada (2021)", "2.515"],
      ["População no último censo (2010)", "2.477"],
      ["Densidade demográfica (2010)", "21,47 hab/km²"],
    ],
  },
  {
    title: "Trabalho e rendimento",
    icon: Coins,
    rows: [
      ["Salário médio mensal (2020)", "1,5 salário mínimo"],
      ["Pessoal ocupado (2020)", "508 pessoas"],
      ["População ocupada (2020)", "20,2%"],
      ["Rendimento até ½ salário mínimo (2010)", "34,7%"],
    ],
  },
  {
    title: "Educação",
    icon: GraduationCap,
    rows: [
      ["Escolarização de 6 a 14 anos (2010)", "100%"],
      ["IDEB anos iniciais (2021)", "5,1"],
      ["IDEB anos finais (2021)", "4,8"],
      ["Matrículas no ensino fundamental (2021)", "256"],
      ["Matrículas no ensino médio (2021)", "96"],
    ],
  },
  {
    title: "Economia",
    icon: Landmark,
    rows: [
      ["PIB per capita (2020)", "R$ 16.858,06"],
      ["Receitas de fontes externas (2015)", "93,9%"],
      ["IDHM (2010)", "0,702"],
      ["Receitas realizadas (2017)", "R$ 12.780,35 mil"],
      ["Despesas empenhadas (2017)", "R$ 11.340,79 mil"],
    ],
  },
  {
    title: "Saúde",
    icon: HeartPulse,
    rows: [
      ["Estabelecimentos de saúde SUS (2009)", "1"],
      ["Mortalidade infantil (2020)", "Sem dados"],
      ["Internações por diarreia (2016)", "Sem dados"],
    ],
  },
  {
    title: "Meio ambiente e território",
    icon: Leaf,
    rows: [
      ["Bioma (2019)", "Cerrado"],
      ["Área urbanizada (2019)", "0,86 km²"],
      ["Arborização de vias públicas (2010)", "98,3%"],
      ["Esgotamento sanitário adequado (2010)", "22,4%"],
      ["Região intermediária (2021)", "Goiânia"],
    ],
  },
];

const TIMELINE = [
  {
    year: "Década de 1950",
    text: "Erguida a capela em louvor a São Sebastião e, em seguida, uma pequena escola que atendia os moradores das fazendas da região de Mossâmedes, próxima ao Rio Turvo.",
  },
  {
    year: "1962",
    text: "Surge Adelândia, nome em homenagem a dona Adélia, esposa do fazendeiro Domingos Alves Sobrinho, que doou as terras onde se formou o núcleo populacional. No mesmo ano, o povoado é elevado a distrito de Mossâmedes.",
  },
  {
    year: "Década de 1980",
    text: "A fertilidade das terras e a grande produção de feijão rendem ao município o título de “Capital do Feijão”, marca histórica presente na bandeira municipal.",
  },
  {
    year: "30 de dezembro de 1987",
    text: "Com a Lei nº 10.396, Adelândia é emancipada e torna-se município. O hino municipal foi escolhido por concurso público, vencido pela professora Waldir da Silva Avelar.",
  },
  {
    year: "A partir de 1988",
    text: "Na primeira eleição direta foram eleitos Lourival Lobó (prefeito) e Francisco Quintiliano de Avelar Filho (vice). Seguiram-se Antonio dos Reis Pereira, André Gomes Duarte, Maurício Martins de Freitas, Victor Leonardo de Lima Soares (dois mandatos), Joaquim dos Reis e, em 2020, Edson Vieira de Paula.",
  },
];

function HistoriaPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_0%,white,transparent_40%)]"
        />
        <div className="container-page relative py-8 md:py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            <Landmark className="h-3 w-3" /> A Câmara
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">História</h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            Da capela de São Sebastião à emancipação em 1987: conheça a trajetória de Adelândia, a
            Capital do Feijão, e os números que retratam o município hoje.
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {FACTS.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
              >
                <f.icon className="h-4 w-4 text-gold" />
                <dt className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/70">
                  {f.label}
                </dt>
                <dd className="font-display text-lg font-bold leading-tight">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* NOSSA HISTÓRIA */}
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <SectionHeading eyebrow="Nossa história" title="A cidade e sua origem" />
            <div className="mt-6 space-y-4 text-[15px] leading-8 text-muted-foreground">
              <p>
                Adelândia é um município brasileiro do interior do estado de Goiás, na Região
                Centro-Oeste do país, integrante da microrregião de Anicuns. A população, formada
                originalmente por trabalhadores rurais, mantém forte vínculo com o campo.
              </p>
              <p>
                A economia é baseada na agropecuária e em pequenas empresas, com destaque para a
                bacia leiteira, o cultivo de bananas e a produção cerâmica — sobretudo de tijolos,
                com quatro empresas do gênero. Na área de laticínios, o município conta com uma das
                indústrias mais prósperas da região. Há também potencial expressivo em confecções e
                facções, além da usina de álcool e açúcar instalada em Anicuns, a 25 km, que gera
                empregos para a população adelandense.
              </p>
              <p>
                A grande concentração de pequenas propriedades rurais fixa a economia na região e
                sustenta, direta e indiretamente, centenas de empregos.
              </p>
            </div>
          </div>

          <ol className="relative space-y-6 border-l border-border pl-6">
            {TIMELINE.map((t) => (
              <li key={t.year} className="relative">
                <span className="absolute -left-[31px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-primary/15" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{t.year}</p>
                <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-10 md:py-14">
          <SectionHeading
            eyebrow="Adelândia em números"
            title="Indicadores oficiais do município"
            description="Dados de população, economia, educação, saúde e território reunidos a partir das bases públicas do IBGE."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {INDICATORS.map((block) => (
              <article
                key={block.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <block.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground">{block.title}</h3>
                </div>
                <dl className="mt-4 divide-y divide-border/70 text-sm">
                  {block.rows.map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-4 py-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="whitespace-nowrap font-semibold text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { to: ROUTES.mesaDiretora, label: "Mesa Diretora", desc: "Composição do biênio em exercício." },
            { to: ROUTES.comissoes, label: "Comissões", desc: "Comissões permanentes e seus membros." },
            { to: ROUTES.vereadores, label: "Vereadores", desc: "Parlamentares da legislatura atual." },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <h3 className="font-display text-lg font-bold text-foreground">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Acessar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
