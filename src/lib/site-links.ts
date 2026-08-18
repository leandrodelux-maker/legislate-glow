// Central registry of public site sections. New pages should be added here
// so that they appear automatically no Mapa do Site, no sitemap.xml, no rodapé
// e nos menus do cabeçalho.

export type SiteLink = {
  to: string;
  label: string;
  description?: string;
  external?: boolean;
};

export type SiteSection = {
  title: string;
  links: SiteLink[];
};

/**
 * Fonte única de verdade das rotas públicas.
 * Use SEMPRE ROUTES.x em headers, rodapé, sidebars e acessos rápidos —
 * nunca strings literais — para que renomear uma rota atualize tudo.
 */
export const ROUTES = {
  home: "/",
  historia: "/a-camara/historia",
  comissoes: "/a-camara/comissoes",
  mesaDiretora: "/a-camara/mesa-diretora",
  roteiroSessoes: "/a-camara/roteiro-das-sessoes",
  vereadores: "/vereadores",
  vereadoresRanking: "/vereadores/ranking",
  sessoes: "/sessoes",
  sessoesAoVivo: "/sessoes/ao-vivo",
  noticias: "/noticias",
  projetos: "/projetos",
  cartaServicos: "/atos-legislativos/carta-de-servicos",
  leiOrganica: "/atos-legislativos/lei-organica-municipal",
  regimentoInterno: "/atos-legislativos/regimento-interno",
  portarias: "/atos-legislativos/portarias",
  transparencia: "/transparencia-portal",
  contato: "/contato",
  esic: "/e-sic",
  faq: "/perguntas-frequentes",
  lgpd: "/lgpd",
  mapaDoSite: "/mapa-do-site",
} as const;

/** Links do menu "Acesso à Informação" (cabeçalho). */
export const INFO_ACCESS_LINKS: SiteLink[] = [
  { to: ROUTES.esic, label: "e-SIC" },
  { to: ROUTES.contato, label: "Ouvidoria" },
  { to: ROUTES.faq, label: "Perguntas Frequentes" },
  { to: ROUTES.lgpd, label: "LGPD" },
];


/** Links do menu "A Câmara" (cabeçalho). */
export const CAMARA_LINKS: SiteLink[] = [
  { to: ROUTES.historia, label: "História" },
  { to: ROUTES.mesaDiretora, label: "Mesa Diretora" },
  { to: ROUTES.comissoes, label: "Comissões" },
  { to: ROUTES.roteiroSessoes, label: "Roteiro das Sessões" },
  { to: ROUTES.faq, label: "Perguntas Frequentes" },
];

/** Links do menu "Atos Legislativos" (cabeçalho). */
export const ATOS_LEGISLATIVOS_LINKS: SiteLink[] = [
  { to: ROUTES.projetos, label: "Projetos de Leis" },
  { to: ROUTES.cartaServicos, label: "Carta de Serviços" },
  { to: ROUTES.leiOrganica, label: "Lei Orgânica Municipal" },
  { to: ROUTES.regimentoInterno, label: "Regimento Interno" },
  { to: ROUTES.portarias, label: "Portarias" },
  { to: ROUTES.sessoes, label: "Sessões Plenárias" },
];

export const SITE_SECTIONS: SiteSection[] = [
  {
    title: "Atos Legislativos",
    links: [
      { to: ROUTES.projetos, label: "Projetos de Leis", description: "Fluxo e tramitação das matérias legislativas." },
      { to: ROUTES.cartaServicos, label: "Carta de Serviços", description: "Serviços prestados pela Câmara ao cidadão." },
      { to: ROUTES.leiOrganica, label: "Lei Orgânica Municipal", description: "Norma máxima de organização do município." },
      { to: ROUTES.regimentoInterno, label: "Regimento Interno", description: "Regras de funcionamento da Casa Legislativa." },
    ],
  },
  {

    title: "A Câmara",
    links: [
      { to: ROUTES.historia, label: "História", description: "Origem e trajetória do município de Cachoeira de Goiás." },
      { to: ROUTES.mesaDiretora, label: "Mesa Diretora", description: "Composição da direção da Casa Legislativa." },
      { to: ROUTES.comissoes, label: "Comissões", description: "Comissões permanentes e seus membros." },
      { to: ROUTES.roteiroSessoes, label: "Roteiro das Sessões", description: "Passo a passo de uma sessão plenária." },
    ],
  },
  {
    title: "Institucional",
    links: [
      { to: ROUTES.home, label: "Página Inicial", description: "Portal oficial da Câmara Municipal." },
      { to: ROUTES.vereadores, label: "Vereadores", description: "Conheça os parlamentares em exercício." },
      { to: ROUTES.vereadoresRanking, label: "Ranking de Vereadores", description: "Presença, projetos e participação." },
      { to: ROUTES.sessoes, label: "Sessões e Pautas", description: "Ordem do dia, atas e transmissões." },
      { to: ROUTES.sessoesAoVivo, label: "Sessões ao Vivo", description: "Transmissão em tempo real das sessões." },
      { to: ROUTES.noticias, label: "Notícias", description: "Últimas notícias e comunicados oficiais." },
      { to: ROUTES.projetos, label: "Projetos de Lei", description: "Proposições em tramitação e aprovadas." },
    ],
  },
  {
    title: "Transparência",
    links: [
      { to: ROUTES.transparencia, label: "Portal da Transparência", description: "Receitas, despesas, contratos e servidores." },
    ],
  },
  {
    title: "Serviços ao Cidadão",
    links: [
      { to: ROUTES.contato, label: "Contato e Ouvidoria", description: "Canais oficiais de atendimento." },
      { to: ROUTES.esic, label: "e-SIC", description: "Serviço de Informação ao Cidadão (Lei nº 12.527/2011)." },
      { to: ROUTES.faq, label: "Perguntas Frequentes", description: "Dúvidas mais comuns sobre a Câmara e serviços." },
    ],
  },
  {
    title: "Privacidade e Acessibilidade",
    links: [
      { to: ROUTES.lgpd, label: "LGPD", description: "Lei Geral de Proteção de Dados Pessoais." },
      { to: ROUTES.mapaDoSite, label: "Mapa do Site", description: "Todas as páginas e serviços deste portal." },
    ],
  },
];

/** Colunas de links do rodapé, derivadas das rotas canônicas. */
export const FOOTER_COLUMNS: SiteSection[] = [
  {
    title: "A Câmara",
    links: [
      { to: ROUTES.historia, label: "História" },
      { to: ROUTES.mesaDiretora, label: "Mesa Diretora" },
      { to: ROUTES.comissoes, label: "Comissões" },
      { to: ROUTES.roteiroSessoes, label: "Roteiro das Sessões" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { to: ROUTES.vereadores, label: "Vereadores" },
      { to: ROUTES.sessoes, label: "Sessões e Pautas" },
      { to: ROUTES.noticias, label: "Notícias" },
      { to: ROUTES.projetos, label: "Atos Legislativos" },
      { to: ROUTES.cartaServicos, label: "Carta de Serviços" },
      { to: ROUTES.leiOrganica, label: "Lei Orgânica Municipal" },
      { to: ROUTES.regimentoInterno, label: "Regimento Interno" },
      { to: ROUTES.contato, label: "Ouvidoria" },
      { to: ROUTES.faq, label: "Perguntas Frequentes" },
    ],
  },
  {
    title: "Transparência",
    links: [
      { to: ROUTES.transparencia, label: "Portal da Transparência" },
      { to: ROUTES.esic, label: "e-SIC — Acesso à Informação" },
      { to: ROUTES.lgpd, label: "LGPD" },
      { to: ROUTES.mapaDoSite, label: "Mapa do Site" },
    ],
  },
];

/** Links legais exibidos na barra inferior do rodapé. */
export const FOOTER_LEGAL_LINKS: SiteLink[] = [
  { to: ROUTES.lgpd, label: "LGPD" },
  { to: ROUTES.faq, label: "FAQ" },
  { to: ROUTES.mapaDoSite, label: "Mapa do Site" },
];


// Achatado (útil para sitemap.xml e buscas).
export const ALL_SITE_LINKS: SiteLink[] = SITE_SECTIONS.flatMap((s) => s.links);

/** Rótulo canônico por rota (derivado de todas as fontes de links). */
export const ROUTE_LABELS: Record<string, string> = Object.fromEntries(
  [
    ...ALL_SITE_LINKS,
    ...INFO_ACCESS_LINKS,
    ...FOOTER_COLUMNS.flatMap((c) => c.links),
  ].map((l) => [l.to, l.label]),
);

/** Rótulos extra para segmentos que não são páginas próprias. */
const SEGMENT_LABELS: Record<string, string> = {
  vereadores: "Vereadores",
  sessoes: "Sessões",
  noticias: "Notícias",
  projetos: "Projetos de Lei",
  ranking: "Ranking",
  "ao-vivo": "Ao Vivo",
  transparencia: "Transparência",
  "transparencia-portal": "Portal da Transparência",
  "transparencia-dados": "Dados da Transparência",
};

function humanize(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export type Crumb = { to: string; label: string };

/**
 * Constrói a trilha de navegação a partir do pathname, usando ROUTES /
 * SITE_SECTIONS como fonte dos rótulos. Retorna [] na home.
 */
export function buildBreadcrumbs(pathname: string): Crumb[] {
  const clean = pathname.replace(/\/+$/, "");
  if (!clean || clean === ROUTES.home) return [];

  const segments = clean.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ to: ROUTES.home, label: "Início" }];

  let acc = "";
  for (const segment of segments) {
    acc += `/${segment}`;
    crumbs.push({
      to: acc,
      label: ROUTE_LABELS[acc] ?? SEGMENT_LABELS[segment] ?? humanize(segment),
    });
  }
  return crumbs;
}
