import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Gavel,
  HandCoins,
  MessagesSquare,
  Receipt,
  Scale,
  Search,
  Target,
  TrendingDown,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
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
  {
    key: "orgaos-e-servidores",
    title: "Órgãos e Servidores",
    subtitle: "Servidores, remuneração, diárias e concursos",
    icon: Users,
    accent: "bg-sky-600",
    items: [
      { label: "Servidores", path: "orgaos-e-servidores/servidor" },
      { label: "Diárias", path: "orgaos-e-servidores/diaria" },
      {
        label: "Estrutura organizacional e competências",
        path: "orgaos-e-servidores/estrutura-organizacional-e-competencias",
      },
      { label: "Estrutura de remuneração", path: "orgaos-e-servidores/estrutura-de-remuneracao" },
      {
        label: "Tabela explicativa de valores de diárias",
        path: "orgaos-e-servidores/tabela-explicativa-diarias",
      },
      {
        label: "Aprovados em concursos e processos seletivos",
        path: "orgaos-e-servidores/lista-de-aprovados-em-concursos-e-processos-seletivos",
      },
      {
        label: "Situação do concurso público",
        path: "orgaos-e-servidores/situacao-do-concurso-publico",
      },
      {
        label: "Terceirizados",
        path: "orgaos-e-servidores/lista-de-terceirizados-que-prestam-de-servicos-a-instituicao",
      },
      { label: "Estagiários", path: "orgaos-e-servidores/lista-de-estagiarios-da-instituicao" },
      { label: "Servidores de licença", path: "orgaos-e-servidores/servidores-de-licenca" },
      { label: "Servidores de férias", path: "orgaos-e-servidores/servidores-de-ferias" },
      {
        label: "Servidores à disposição de outro município",
        path: "orgaos-e-servidores/servidores-a-disposicao-de-outro-municipio",
      },
      {
        label: "Servidores cedidos para o município",
        path: "orgaos-e-servidores/servidores-cedidos-para-o-municipio",
      },
    ],
  },
  {
    key: "planejamento",
    title: "Planejamento e Políticas Públicas",
    subtitle: "Planos, projetos, pareceres e relatórios de gestão",
    icon: Target,
    accent: "bg-indigo-600",
    items: [
      {
        label: "Acompanhamento de ações e projetos",
        path: "planejamento-e-politicas-publicas/projeto",
      },
      { label: "Parecer prévio do Tribunal", path: "planejamento-e-politicas-publicas/parecer-previo" },
      { label: "Planos (PPA, LDO e LOA)", path: "planejamento-e-politicas-publicas/planos" },
      {
        label: "Relatório de gestão ou atividades",
        path: "planejamento-e-politicas-publicas/relatorio-de-gestao-ou-atividades",
      },
    ],
  },
  {
    key: "responsabilidade-fiscal",
    title: "Responsabilidade Fiscal",
    subtitle: "Relatórios exigidos pela Lei de Responsabilidade Fiscal",
    icon: Scale,
    accent: "bg-teal-600",
    items: [
      {
        label: "Relatório de Gestão Fiscal (RGF)",
        path: "responsabilidade-fiscal/relatorio-de-gestao-fiscal",
      },
    ],
  },
  {
    key: "legislacao",
    title: "Legislação e Publicações",
    subtitle: "Leis, atas, pautas, projetos e dados abertos",
    icon: BookOpen,
    accent: "bg-slate-700",
    items: [
      { label: "Legislação municipal", path: "legislacao-e-publicacoes/legislacao-municipal" },
      { label: "Legislação federal", path: "legislacao-e-publicacoes/legislacao-federal" },
      {
        label: "Leis e atos infralegais",
        path: "legislacao-e-publicacoes/leis-e-atos-infralegais",
      },
      {
        label: "Projetos de leis e atos infralegais",
        path: "legislacao-e-publicacoes/projetos-de-leis-e-atos-infralegais",
      },
      { label: "Atas das sessões", path: "legislacao-e-publicacoes/atas-das-sessoes" },
      {
        label: "Pauta das sessões do plenário",
        path: "legislacao-e-publicacoes/pauta-das-sessoes-do-plenario",
      },
      { label: "Pauta das comissões", path: "legislacao-e-publicacoes/pauta-das-comissoes" },
      {
        label: "Votações nominais",
        path: "legislacao-e-publicacoes/lista-sobre-as-votacoes-nominais",
      },
      {
        label: "Atividades legislativas dos parlamentares",
        path: "legislacao-e-publicacoes/atividades-legislativas-dos-parlamentares",
      },
      {
        label: "Apreciação das contas do Executivo",
        path: "legislacao-e-publicacoes/apreciacao-das-contas-do-chefe-do-poder-executivo",
      },
      { label: "Composição da Casa", path: "legislacao-e-publicacoes/composicao-da-casa" },
      { label: "Dados abertos", path: "legislacao-e-publicacoes/dados-abertos" },
      { label: "Outras publicações", path: "legislacao-e-publicacoes/outras-publicacoes" },
      {
        label: "Política de privacidade e proteção de dados",
        path: "legislacao-e-publicacoes/politica-de-privacidade-e-protecao-de-dados",
      },
      {
        label: "Responsável pelo tratamento de dados",
        path: "legislacao-e-publicacoes/resposavel-pelo-tratamento-de-dados",
      },
    ],
  },
  {
    key: "ouvidoria",
    title: "Ouvidoria e e-SIC",
    subtitle: "Pedidos de informação, ouvidoria e estatísticas",
    icon: MessagesSquare,
    accent: "bg-emerald-700",
    items: [
      {
        label: "Solicitação de informação",
        path: "ouvidoria-e-e-sic/solicitacao-informacao",
      },
      {
        label: "Acompanhamento de solicitação",
        path: "ouvidoria-e-e-sic/acompanhamento-de-solicitacao",
      },
      { label: "Ouvidoria", path: "ouvidoria-e-e-sic/ouvidoria" },
      { label: "Informações da ouvidoria", path: "ouvidoria-e-e-sic/informacoes-da-ouvidoria" },
      { label: "Estatísticas do e-SIC", path: "ouvidoria-e-e-sic/estatistica-do-e-sic" },
      { label: "Rol de informações", path: "ouvidoria-e-e-sic/rol-de-informacoes" },
      { label: "Informação do SIC físico", path: "ouvidoria-e-e-sic/informacao-do-sic-fisico" },
      {
        label: "Perguntas e respostas do SIC físico",
        path: "ouvidoria-e-e-sic/perguntas-frequentes",
      },
      { label: "Pesquisa de satisfação", path: "ouvidoria-e-e-sic/pesquisa-de-satisfacao" },
      { label: "Governo digital", path: "ouvidoria-e-e-sic/governo-digital" },
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
