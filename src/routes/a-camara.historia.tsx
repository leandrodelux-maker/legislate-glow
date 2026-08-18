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
  Church,
  Droplets,
  Theater,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ROUTES } from "@/lib/site-links";

export const Route = createFileRoute("/a-camara/historia")({
  head: () => ({
    meta: [
      { title: "História de Cachoeira de Goiás — Câmara Municipal" },
      {
        name: "description",
        content:
          "História de Cachoeira de Goiás (GO): povoamento em 1945, distrito em 1953, emancipação em 14 de novembro de 1958, comarca em 1965, economia e cultura da cidade da Água Santa.",
      },
      { property: "og:title", content: "História de Cachoeira de Goiás — Câmara Municipal" },
      {
        property: "og:description",
        content:
          "De Cachoeira da Fumaça à cidade da Água Santa: origem, emancipação em 1958 e o panorama atual de Cachoeira de Goiás (GO).",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoriaPage,
});

const FACTS = [
  { icon: CalendarDays, label: "Fundação", value: "1945" },
  { icon: Landmark, label: "Emancipação", value: "14/11/1958" },
  { icon: CalendarDays, label: "Aniversário", value: "10 de novembro" },
  { icon: Users, label: "População", value: "1.419 hab." },
  { icon: Ruler, label: "Área", value: "415,73 km²" },
  { icon: MapPin, label: "Gentílico", value: "Cachoeirense" },
];

const INDICATORS: { title: string; icon: typeof Users; rows: [string, string][] }[] = [
  {
    title: "População e território",
    icon: Users,
    rows: [
      ["População (Censo IBGE 2022)", "1.419"],
      ["Área territorial", "415,7304 km²"],
      ["Densidade demográfica", "≈ 3,4 hab/km²"],
      ["Limítrofes", "Ivolândia, Aurilândia, Moiporá e Paraúna"],
    ],
  },
  {
    title: "Marcos legais",
    icon: Landmark,
    rows: [
      ["Distrito", "Lei Municipal nº 138 (1953)"],
      ["Município", "Lei estadual de 14/11/1958"],
      ["Comarca", "2 de maio de 1965"],
      ["Primeiras eleições", "3 de outubro de 1960"],
    ],
  },
  {
    title: "Economia",
    icon: Coins,
    rows: [
      ["Base econômica", "Setor primário"],
      ["Agricultura familiar", "Milho, feijão, mandioca e hortaliças"],
      ["Pecuária", "Corte e leite"],
      ["Serviços", "Comércio local e setor público"],
    ],
  },
  {
    title: "Educação",
    icon: GraduationCap,
    rows: [
      ["Rede de ensino", "Municipal e estadual"],
      ["Etapas atendidas", "Infantil, fundamental e médio"],
      ["Transporte escolar", "Atendimento à zona rural"],
    ],
  },
  {
    title: "Saúde",
    icon: HeartPulse,
    rows: [
      ["Atenção básica", "Unidade de saúde municipal"],
      ["Estratégia Saúde da Família", "Equipe em atuação"],
      ["Referência regional", "São Luís de Montes Belos"],
    ],
  },
  {
    title: "Gestão e transparência",
    icon: Sprout,
    rows: [
      ["Poder Legislativo", "Câmara Municipal de Cachoeira de Goiás"],
      ["Sessões ordinárias", "Conforme Regimento Interno"],
      ["Portal da Transparência", "Publicação permanente"],
    ],
  },
];

const TIMELINE = [
  {
    year: "1945",
    text: "Trabalhadores em busca de terras férteis erguem as primeiras moradias às margens do córrego que corta a cidade, então em território do município de Goiás.",
  },
  {
    year: "Anos 1940–50",
    text: "O solo fértil e o clima favorável impulsionam grandes fazendas agropecuárias e a expansão do povoado, primeiro chamado Cachoeira da Fumaça e depois Cachoeira de Goiás, conhecida como a cidade da Água Santa.",
  },
  {
    year: "1953",
    text: "A Lei Municipal nº 138 eleva a localidade à categoria de distrito, pela Câmara Municipal de Goiás.",
  },
  {
    year: "14 de novembro de 1958",
    text: "Lei estadual eleva Cachoeira de Goiás à categoria de município — marco da emancipação político-administrativa.",
  },
  {
    year: "3 de outubro de 1960",
    text: "Realizam-se as primeiras eleições municipais, com a escolha dos primeiros representantes locais.",
  },
  {
    year: "2 de maio de 1965",
    text: "O município é elevado à categoria de comarca, consolidando sua autonomia política e administrativa.",
  },
  {
    year: "Hoje",
    text: "A Câmara Municipal exerce as funções legislativa e fiscalizadora, com sessões públicas, comissões permanentes e publicação dos atos no Portal da Transparência.",
  },
];

const PILLARS = [
  {
    icon: Church,
    title: "Consolidação religiosa",
    text: "Com o crescimento do povoado surgiram as primeiras construções permanentes — casas de adobe, comércios rudimentares e, principalmente, a igreja, centro da organização social e cultural. Festas religiosas, novenas e celebrações tradicionais reuniam moradores de toda a região e consolidaram Cachoeira como núcleo populacional estável.",
  },
  {
    icon: Leaf,
    title: "Desenvolvimento econômico",
    text: "A economia sempre esteve ligada ao setor primário: agricultura familiar de milho, feijão, mandioca e hortaliças, pecuária de corte e leiteira, pequenos comércios e serviços. Nos últimos anos o município busca diversificação, com apoio a pequenos empreendedores, fortalecimento do comércio local e agricultura sustentável.",
  },
  {
    icon: Theater,
    title: "Cultura, tradições e identidade",
    text: "Festas religiosas tradicionais, eventos comunitários, valorização das raízes rurais e a hospitalidade cachoeirense formam um patrimônio imaterial transmitido de geração em geração.",
  },
  {
    icon: Droplets,
    title: "A cidade da Água Santa",
    text: "O nome nasce das águas que cortam o território e deram origem ao povoado. De Cachoeira da Fumaça a Cachoeira de Goiás, a relação com córregos e nascentes segue como símbolo da identidade local, no coração do Cerrado goiano.",
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
            Do povoado formado em 1945 às margens do córrego à emancipação em 14 de novembro de 1958:
            conheça a trajetória de Cachoeira de Goiás, a cidade da Água Santa.
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
                O município de Cachoeira de Goiás surgiu em 1945, com a chegada de trabalhadores que
                vinham em busca de terras férteis. Eles construíram suas moradias nas margens do
                córrego que corta a cidade, em território pertencente ao município de Goiás.
              </p>
              <p>
                A fertilidade do solo e as características climáticas da região favoreceram o
                surgimento de grandes fazendas agropecuárias, causando a expansão do povoado — motivo
                que levou a Câmara Municipal de Goiás a elevar a colônia a distrito. O lugar recebeu o
                nome de Cachoeira da Fumaça, mudado tempos depois para Cachoeira de Goiás, conhecida
                também como a cidade da Água Santa.
              </p>
              <p>
                Em 1953 foi elevada a distrito pela Lei Municipal nº 138 e, em 14 de novembro de 1958,
                à categoria de município por lei estadual. As primeiras eleições municipais ocorreram
                em 3 de outubro de 1960 e, em 2 de maio de 1965, o município foi elevado à categoria
                de comarca, tornando-se autônomo política e administrativamente.
              </p>
              <p>
                Hoje o município tem 1.419 habitantes (Censo IBGE 2022) e 415,7304 km² de área, faz
                limite com Ivolândia, Aurilândia, Moiporá e Paraúna e celebra seu aniversário em 10 de
                novembro. O gentílico é cachoeirense.
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

      {/* PILARES */}
      <section className="container-page pb-10 md:pb-14">
        <SectionHeading
          eyebrow="Formação do município"
          title="Fé, trabalho e identidade cachoeirense"
          description="Os eixos que moldaram a vida comunitária de Cachoeira de Goiás ao longo das décadas."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {PILLARS.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* INDICADORES */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-10 md:py-14">
          <SectionHeading
            eyebrow="Cachoeira de Goiás em números"
            title="Dados e marcos oficiais do município"
            description="Informações de território, marcos legais, economia e serviços públicos de Cachoeira de Goiás."
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
                      <dd className="text-right font-semibold text-foreground">{v}</dd>
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
