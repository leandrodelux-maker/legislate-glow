import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { PaginaHero } from "@/components/pagina-hero";
import { Landmark as IconeHero } from "lucide-react";
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

// Artes dos pilares. Cada uma tem título gravado, por isso aparece inteira, sem corte.
const ARTES_PILARES: Record<string, { src: string; largura: number; altura: number; alt: string }> = {
  "Consolidação religiosa": { src: "/historia/fe-e-tradicao.webp", largura: 431, altura: 183, alt: "Igreja branca entre palmeiras, com o título Fé e Tradição" },
  "Desenvolvimento econômico": { src: "/historia/economia-e-trabalho.webp", largura: 437, altura: 171, alt: "Espigas de milho diante de uma lavoura, com o título Economia e Trabalho" },
  "Cultura, tradições e identidade": { src: "/historia/cultura-e-identidade.webp", largura: 436, altura: 170, alt: "Duas araras ao pôr do sol sobre a paisagem do Cerrado, com o título Cultura e Identidade" },
  "A cidade da Água Santa": { src: "/historia/belezas-naturais.webp", largura: 420, altura: 170, alt: "Cachoeira entre pedras e vegetação, com o título Belezas Naturais" },
};

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
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="A Câmara"
        title="História"
        description={<>Do povoado formado em 1945 às margens do córrego à emancipação em 14 de novembro de 1958: conheça a trajetória de Cachoeira de Goiás, a cidade da Água Santa.</>}
      />

      {/* ARTE PRINCIPAL E FATOS */}
      <section className="container-page relative z-10 -mt-6 md:-mt-8">
        <img src="/historia/nossa-historia.webp" width={1334} height={347} alt="Brasão da Câmara Municipal de Cachoeira de Goiás entre a fonte da praça, a igreja, a vista da cidade e a estátua do Cristo, com o título Nossa História" fetchPriority="high" decoding="async" className="h-auto w-full rounded-3xl shadow-2xl shadow-primary-deep/20" />
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {FACTS.map((f) => (
            <div key={f.label} className="rounded-2xl border border-border bg-card p-4">
              <f.icon className="h-4 w-4 text-primary" aria-hidden />
              <dt className="mt-2 text-xs text-muted-foreground">{f.label}</dt>
              <dd className="font-display font-bold leading-tight text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* NOSSA HISTÓRIA */}
      <section className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <article>
            <TituloSecao eyebrow="Nossa história" titulo="A cidade e sua origem" />
            <img src="/historia/origens-e-formacao.webp" width={437} height={183} alt="Rua de terra com casas antigas e árvores, em imagem envelhecida, com o título Origens e Formação" loading="lazy" decoding="async" className="mb-6 h-auto w-full rounded-2xl" />
            <div className="space-y-4 text-base leading-8 text-muted-foreground">
              <p className="text-lg leading-8 text-foreground first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-primary">
                O município de Cachoeira de Goiás surgiu em 1945, com a chegada de trabalhadores que vinham em busca de terras férteis. Eles construíram suas moradias nas margens do córrego que corta a cidade, em território pertencente ao município de Goiás.
              </p>
              <p>
                A fertilidade do solo e as características climáticas da região favoreceram o surgimento de grandes fazendas agropecuárias, causando a expansão do povoado — motivo que levou a Câmara Municipal de Goiás a elevar a colônia a distrito. O lugar recebeu o nome de Cachoeira da Fumaça, mudado tempos depois para Cachoeira de Goiás, conhecida também como a cidade da Água Santa.
              </p>
              <blockquote className="my-6 border-l-4 border-gold py-1 pl-5 font-display text-xl font-semibold leading-snug text-primary-deep md:text-2xl">
                De Cachoeira da Fumaça a Cachoeira de Goiás, conhecida como a cidade da Água Santa.
              </blockquote>
              <p>
                Em 1953 foi elevada a distrito pela Lei Municipal nº 138 e, em 14 de novembro de 1958, à categoria de município por lei estadual. As primeiras eleições municipais ocorreram em 3 de outubro de 1960 e, em 2 de maio de 1965, o município foi elevado à categoria de comarca, tornando-se autônomo política e administrativamente.
              </p>
              <p>
                Hoje o município tem 1.419 habitantes (Censo IBGE 2022) e 415,7304 km² de área, faz limite com Ivolândia, Aurilândia, Moiporá e Paraúna e celebra seu aniversário em 10 de novembro. O gentílico é cachoeirense.
              </p>
            </div>
          </article>

          <aside className="acesso-destaque rounded-3xl p-6 text-white shadow-xl md:p-8 lg:sticky lg:top-20">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Linha do tempo</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Marcos da cidade</h2>
            <ol className="relative mt-6 space-y-5 border-l-2 border-white/20 pl-6">
              {TIMELINE.map((t) => (
                <li key={t.year} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-gold ring-4 ring-gold/25" aria-hidden />
                  <p className="font-display text-sm font-bold text-gold">{t.year}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/90">{t.text}</p>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      {/* PILARES */}
      <section className="border-y border-border/60 bg-secondary/40 py-12 md:py-16">
        <div className="container-page">
          <TituloSecao eyebrow="Formação do município" titulo="Fé, trabalho e identidade cachoeirense" descricao="Os eixos que moldaram a vida comunitária de Cachoeira de Goiás ao longo das décadas." />
          <div className="grid gap-4 md:grid-cols-2">
            {PILLARS.map((p) => (
              <article key={p.title} className="group overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-elegant">
                {ARTES_PILARES[p.title] && (
                  <img src={ARTES_PILARES[p.title].src} width={ARTES_PILARES[p.title].largura} height={ARTES_PILARES[p.title].altura} alt={ARTES_PILARES[p.title].alt} loading="lazy" decoding="async" className="h-auto w-full" />
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{p.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="container-page py-12 md:py-16">
        <TituloSecao eyebrow="Cachoeira de Goiás em números" titulo="Dados e marcos oficiais do município" descricao="Informações de território, marcos legais, economia e serviços públicos." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INDICATORS.map((block) => (
            <article key={block.title} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2.5 bg-primary-deep px-5 py-3.5 text-white">
                <block.icon className="h-5 w-5 text-gold" aria-hidden />
                <h3 className="font-display font-semibold">{block.title}</h3>
              </div>
              <dl className="divide-y divide-border/70 px-5 text-sm">
                {block.rows.map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-semibold text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <ContinueNavegando itens={[
        { to: ROUTES.mesaDiretora, titulo: "Mesa Diretora", texto: "Quem dirige a Câmara", icone: Landmark },
        { to: ROUTES.comissoes, titulo: "Comissões", texto: "Comissões permanentes", icone: Users },
        { to: ROUTES.vereadores, titulo: "Vereadores", texto: "Legislatura atual", icone: Users },
      ]} />
    </div>
  );
}
