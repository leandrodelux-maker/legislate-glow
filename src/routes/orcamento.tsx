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
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
        <div className="container-page relative py-10 md:py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
            <Landmark className="h-3 w-3" /> Transparência orçamentária
          </span>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight md:text-4xl">
            Orçamento da Câmara Municipal
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85 md:text-base">
            Plano anual (PPA, LDO e LOA) e orçamento vigente do exercício {CURRENT_YEAR}, com acesso
            direto às consultas oficiais do Portal da Transparência.
          </p>
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
              to="/transparencia-portal"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/10"
            >
              <ArrowUpRight className="h-4 w-4" /> Portal da Transparência
            </Link>
          </div>
        </div>
      </section>

      {/* CICLO ORÇAMENTÁRIO */}
      <section className="border-b border-border bg-card">
        <div className="container-page py-10">
          <h2 className="font-display text-xl font-bold text-foreground">
            Como funciona o ciclo orçamentário
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Da elaboração do plano à execução da despesa, cada etapa é pública.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CICLO.map((c) => (
              <li
                key={c.step}
                className="rounded-xl border border-border bg-background p-4 shadow-sm"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {c.step}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BLOCOS DE CONSULTA */}
      <section className="container-page py-12">
        <div className="space-y-10">
          {BLOCKS.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.key} id={block.key}>
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md ${block.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold text-foreground md:text-xl">
                      {block.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{block.subtitle}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {block.items.map((item) => (
                    <a
                      key={item.path}
                      href={href(item.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RODAPÉ DA PÁGINA */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-8">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 h-5 w-5 text-primary" />
            <p className="max-w-xl text-sm text-muted-foreground">
              Não encontrou a informação orçamentária que procurava? Solicite pelo e-SIC ou consulte
              todas as bases disponíveis no Portal da Transparência.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/e-sic"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <HandCoins className="h-4 w-4" /> Pedir informação (e-SIC)
            </Link>
            <a
              href={href()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <ExternalLink className="h-4 w-4" /> Abrir portal oficial
            </a>
          </div>
        </div>
        <div className="container-page pb-8">
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-primary" /> Dados atualizados diariamente pelo
            sistema contábil oficial · exercício {CURRENT_YEAR}
            <TrendingDown className="h-3.5 w-3.5 opacity-0" />
          </p>
        </div>
      </section>
    </main>
  );
}
