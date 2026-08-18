import { ArrowUpRight, Gavel, HandCoins, Receipt, TrendingDown, type LucideIcon } from "lucide-react";
import { getTransparencyUrl } from "@/lib/transparency-url";

export const MEGASOFT_BASE_URL =
  "https://camaracachoeiradegoias.megasofttransparencia.com.br";

type Dataset = {
  key: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  items: { label: string; path: string; note?: string }[];
};

/**
 * Estrutura oficial do Portal da Transparência (Megasoft) da
 * Câmara Municipal de Cachoeira de Goiás.
 */
export const OFFICIAL_DATASETS: Dataset[] = [
  {
    key: "receitas",
    title: "Receitas",
    subtitle: "Repasses, receitas orçamentárias e extraorçamentárias",
    icon: HandCoins,
    accent: "bg-emerald-600",
    items: [
      { label: "Receita orçamentária", path: "receitas-e-despesas/receita" },
      { label: "Receita extraorçamentária", path: "receitas-e-despesas/extra-orcamentaria" },
      {
        label: "Repasses e transferências de recursos",
        path: "receitas-e-despesas/repasse-ou-transferencia-de-recursos",
      },
      {
        label: "Movimentação orçamentária e financeira",
        path: "receitas-e-despesas/movimentacao-orcamentaria-financeira",
      },
    ],
  },
  {
    key: "despesas",
    title: "Despesas",
    subtitle: "Empenhos, liquidações, pagamentos e diárias",
    icon: TrendingDown,
    accent: "bg-rose-500",
    items: [
      { label: "Despesa sintética", path: "receitas-e-despesas/despesa-sintetica" },
      { label: "Empenhos", path: "receitas-e-despesas/empenho" },
      { label: "Liquidações", path: "receitas-e-despesas/liquidacao" },
      { label: "Ordens de pagamento", path: "receitas-e-despesas/ordem-de-pagamento" },
      { label: "Despesas fixadas", path: "receitas-e-despesas/despesas-fixadas" },
      { label: "Diárias", path: "orgaos-e-servidores/diaria" },
    ],
  },
  {
    key: "contratos",
    title: "Contratos e Convênios",
    subtitle: "Contratos vigentes, convênios e fiscais responsáveis",
    icon: Receipt,
    accent: "bg-primary",
    items: [
      { label: "Contratos", path: "contratos-convenios-e-licitacoes/contrato" },
      { label: "Convênios", path: "contratos-convenios-e-licitacoes/convenio" },
      {
        label: "Atas de registro de preço",
        path: "contratos-convenios-e-licitacoes/ata-de-registro-de-preco",
      },
      {
        label: "Fiscais de contratos",
        path: "contratos-convenios-e-licitacoes/fiscais-de-contratos",
      },
      {
        label: "Ordens de fornecimento",
        path: "contratos-convenios-e-licitacoes/ordem-de-fornecimento",
      },
    ],
  },
  {
    key: "licitacoes",
    title: "Licitações",
    subtitle: "Editais, dispensas, inexigibilidades e plano de contratações",
    icon: Gavel,
    accent: "bg-amber-500",
    items: [
      {
        label: "Procedimentos licitatórios",
        path: "contratos-convenios-e-licitacoes/procedimentos-licitatorios",
      },
      {
        label: "Dispensas e inexigibilidades",
        path: "contratos-convenios-e-licitacoes/dispensas-inexigibilidades",
      },
      {
        label: "Aviso de intenção de registro de preços",
        path: "contratos-convenios-e-licitacoes/aviso-de-intencao-de-registro-de-precos",
      },
      {
        label: "Plano de contratação anual",
        path: "contratos-convenios-e-licitacoes/plano-de-contratacao-anual",
      },
      { label: "Obras", path: "contratos-convenios-e-licitacoes/obra" },
    ],
  },
];

export function OfficialDatasets({ baseUrl }: { baseUrl?: string }) {
  const base = baseUrl?.trim() || MEGASOFT_BASE_URL;

  return (
    <section className="border-b border-border bg-card">
      <div className="container-page py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-4">
              <span className="h-8 w-1.5 rounded-full bg-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Dados oficiais em destaque
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Consultas diretas de receitas, despesas, contratos e licitações no Portal da
              Transparência oficial da Câmara (Megasoft). Os dados são atualizados diariamente na
              fonte.
            </p>
          </div>
          <a
            href={getTransparencyUrl(base)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Abrir portal completo <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {OFFICIAL_DATASETS.map((d) => {
            const Icon = d.icon;
            return (
              <article
                key={d.key}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md"
              >
                <header className="flex items-start gap-3 border-b border-border p-5">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white ${d.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold leading-tight text-foreground">
                      {d.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{d.subtitle}</p>
                  </div>
                </header>
                <ul className="flex-1 divide-y divide-border">
                  {d.items.map((item) => (
                    <li key={item.path}>
                      <a
                        href={getTransparencyUrl(base, item.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-3 px-5 py-3 text-sm text-foreground transition-colors hover:bg-secondary/50 hover:text-primary"
                      >
                        <span className="min-w-0">{item.label}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
