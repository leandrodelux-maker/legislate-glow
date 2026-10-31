import { ChevronRight } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { PaginaHero } from "@/components/pagina-hero";
import { PieChart as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  HandCoins,
  Landmark,
  PieChart,
  Scale,
  Target,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getTransparencyUrl } from "@/lib/transparency-url";
import { MEGASOFT_BASE_URL } from "@/components/transparencia/official-datasets";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Orçamento — Plano Anual e Orçamento Vigente" },
      {
        name: "description",
        content:
          "Plano anual (PPA, LDO e LOA) e orçamento vigente da Câmara Municipal de Cachoeira de Goiás, com acesso direto às consultas do Portal da Transparência.",
      },
      { property: "og:title", content: "Orçamento — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content:
          "Consulte o plano anual, o orçamento vigente, a execução de receitas e despesas e os relatórios fiscais da Câmara.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrcamentoPage,
});

const CURRENT_YEAR = new Date().getFullYear();

type Item = { label: string; description: string; path: string };
type Block = {
  key: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  items: Item[];
};

const PLANO_ANUAL: Block = {
  key: "plano-anual",
  title: "Plano anual e instrumentos de planejamento",
  subtitle: "PPA, LDO e LOA — as peças que definem o orçamento de cada exercício",
  icon: Target,
  accent: "bg-primary-deep",
  items: [
    {
      label: "Planos (PPA, LDO e LOA)",
      description:
        "Plano Plurianual, Lei de Diretrizes Orçamentárias e Lei Orçamentária Anual publicados na íntegra.",
      path: "planejamento-e-politicas-publicas/planos",
    },
    {
      label: "Acompanhamento de ações e projetos",
      description: "Execução física e financeira das ações previstas no planejamento.",
      path: "planejamento-e-politicas-publicas/projeto",
    },
    {
      label: "Relatório de gestão ou atividades",
      description: "Prestação de contas anual das atividades e resultados alcançados.",
      path: "planejamento-e-politicas-publicas/relatorio-de-gestao-ou-atividades",
    },
    {
      label: "Parecer prévio do Tribunal de Contas",
      description: "Manifestação do TCM/GO sobre as contas do exercício.",
      path: "planejamento-e-politicas-publicas/parecer-previo",
    },
  ],
};

const ORCAMENTO_VIGENTE: Block = {
  key: "orcamento-vigente",
  title: `Orçamento vigente — exercício ${CURRENT_YEAR}`,
  subtitle: "Dotação, execução da despesa e realização da receita atualizadas diariamente",
  icon: PieChart,
  accent: "bg-emerald-600",
  items: [
    {
      label: "Movimentação orçamentária e financeira",
      description: "Dotação inicial, créditos adicionais, valores empenhados e saldos disponíveis.",
      path: "receitas-e-despesas/movimentacao-orcamentaria-financeira",
    },
    {
      label: "Receita orçamentária",
      description: "Repasses duodecimais recebidos e demais receitas do exercício.",
      path: "receitas-e-despesas/receita",
    },
    {
      label: "Despesas — empenhos",
      description: "Todos os empenhos emitidos, por credor, elemento de despesa e valor.",
      path: "receitas-e-despesas/empenho",
    },
    {
      label: "Despesas — liquidações e pagamentos",
      description: "Etapas de liquidação e pagamento da despesa orçamentária.",
      path: "receitas-e-despesas/liquidacao",
    },
  ],
};

const COMPLEMENTOS: Block = {
  key: "complementos",
  title: "Prestação de contas e responsabilidade fiscal",
  subtitle: "Relatórios exigidos pela LRF e demais documentos de controle",
  icon: Scale,
  accent: "bg-teal-600",
  items: [
    {
      label: "Relatório de Gestão Fiscal (RGF)",
      description: "Limites de despesa com pessoal e demais indicadores da LRF.",
      path: "responsabilidade-fiscal/relatorio-de-gestao-fiscal",
    },
    {
      label: "Apreciação das contas do Executivo",
      description: "Processos e decisões da Câmara sobre as contas municipais.",
      path: "legislacao-e-publicacoes/apreciacao-das-contas-do-chefe-do-poder-executivo",
    },
    {
      label: "Legislação municipal",
      description: "Leis orçamentárias sancionadas e demais atos normativos.",
      path: "legislacao-e-publicacoes/legislacao-municipal",
    },
    {
      label: "Dados abertos",
      description: "Bases em formato aberto para reuso e análise pela sociedade.",
      path: "legislacao-e-publicacoes/dados-abertos",
    },
  ],
};

const BLOCKS = [PLANO_ANUAL, ORCAMENTO_VIGENTE, COMPLEMENTOS];

const CICLO = [
  {
    step: "1",
    title: "PPA — Plano Plurianual",
    text: "Define diretrizes, objetivos e metas para quatro anos, orientando todo o planejamento da Casa.",
  },
  {
    step: "2",
    title: "LDO — Diretrizes Orçamentárias",
    text: "Estabelece as prioridades do exercício seguinte e as regras para a elaboração da LOA.",
  },
  {
    step: "3",
    title: "LOA — Orçamento Anual",
    text: "Fixa a despesa e estima a receita do exercício, incluindo o duodécimo do Legislativo.",
  },
  {
    step: "4",
    title: "Execução e controle",
    text: "Empenho, liquidação e pagamento das despesas, com publicação contínua no Portal da Transparência.",
  },
];

function isValidUrl(u: string) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

function OrcamentoPage() {
  const [baseUrl, setBaseUrl] = useState(MEGASOFT_BASE_URL);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("transparency_settings")
        .select("portal_url, portal_base_url")
        .limit(1)
        .maybeSingle();
      const url = (data?.portal_url || data?.portal_base_url || "").trim();
      if (mounted && url && isValidUrl(url)) setBaseUrl(url);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const href = (path?: string) => getTransparencyUrl(baseUrl, path);

  return (
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="Transparência orçamentária"
        title="Orçamento da Câmara Municipal"
        description={<>Plano anual (PPA, LDO e LOA) e orçamento vigente do exercício {CURRENT_YEAR}, com acesso direto às consultas oficiais do Portal da Transparência.</>}
      >
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={href("receitas-e-despesas/movimentacao-orcamentaria-financeira")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold px-4 py-2 text-sm font-semibold text-primary-deep transition-colors hover:bg-gold/90"
            >
              <PieChart className="h-4 w-4" /> Orçamento vigente
            </a>
            <a
              href={href("planejamento-e-politicas-publicas/planos")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/20"
            >
              <FileText className="h-4 w-4" /> Plano anual (PPA/LDO/LOA)
            </a>
            <Link
              to="/transparencia"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/10"
            >
              <ArrowUpRight className="h-4 w-4" /> Portal da Transparência
            </Link>
          </div>
      </PaginaHero>

      {/* CICLO ORÇAMENTÁRIO */}
      <section className="container-page py-12 md:py-16">
        <TituloSecao eyebrow="Do plano à execução" titulo="Como funciona o ciclo orçamentário" descricao="Cada etapa é pública e pode ser acompanhada." />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CICLO.map((c, i) => (
            <li key={c.step} className="relative rounded-2xl border border-border bg-card p-5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-deep font-display font-bold text-gold">{c.step}</span>
              {i < CICLO.length - 1 && <ChevronRight className="absolute -right-3.5 top-8 z-10 hidden h-6 w-6 rounded-full bg-gold p-1 text-gold-foreground lg:block" aria-hidden />}
              <h3 className="mt-3 font-display font-semibold leading-snug text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* BLOCOS DE CONSULTA */}
      <section className="border-y border-border/60 bg-secondary/40 py-12 md:py-16">
        <div className="container-page space-y-4">
          {BLOCKS.map((block) => {
            const Icon = block.icon;
            return (
              <article key={block.key} id={block.key} className="grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-[300px_1fr]">
                <header className="acesso-destaque relative overflow-hidden p-6 text-white">
                  <Icon className="absolute -bottom-6 -right-5 h-28 w-28 opacity-10" aria-hidden />
                  <Icon className="relative h-7 w-7 text-gold" aria-hidden />
                  <h2 className="relative mt-3 font-display text-xl font-bold leading-snug">{block.title}</h2>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/90">{block.subtitle}</p>
                </header>
                <ul className="grid gap-px bg-border/70 sm:grid-cols-2">
                  {block.items.map((item) => (
                    <li key={item.path} className="bg-card">
                      <a href={href(item.path)} target="_blank" rel="noopener noreferrer" className="group flex h-full items-start gap-3 p-5 transition-colors hover:bg-secondary/60">
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold leading-snug text-foreground group-hover:text-primary">{item.label}</span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{item.description}</span>
                        </span>
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* AJUDA */}
      <section className="container-page pt-12 md:pt-16">
        <div className="acesso-destaque flex flex-col gap-5 rounded-3xl p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="font-display text-2xl font-bold">Não encontrou o que procurava?</h2>
            <p className="mt-1 text-white/90">Peça a informação pelo e-SIC ou consulte todas as bases no portal oficial.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to="/e-sic" className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-gold-foreground transition hover:bg-gold/90">
              <HandCoins className="h-4 w-4" aria-hidden /> Pedir informação
            </Link>
            <a href={href()} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 px-4 text-sm font-semibold transition hover:bg-white/10">
              <ExternalLink className="h-4 w-4" aria-hidden /> Portal oficial
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
