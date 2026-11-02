import { MUNICIPIO } from "@/config/municipio";
import type { LucideIcon } from "lucide-react";
import {
  Wallet, Gavel, Users, Compass, ShieldCheck, Scale, MessagesSquare,
} from "lucide-react";

// Catálogo único da área de Transparência: os mesmos 7 temas e itens do Portal da Transparência
// (Megasoft), em linguagem do cidadão. Alimenta o menu, a busca, a página inicial e as páginas de tema.
//
// href: página do site que já mostra o dado. Sem href, o item abre a página padrão de consulta
// (/transparencia/consulta/:slug), que mostra a cópia sincronizada ou leva ao portal oficial.
// portal: caminho da página equivalente no portal Megasoft.

export interface TransparenciaItem {
  slug: string;
  label: string;
  desc: string;
  portal?: string;
  href?: string;
  keywords?: string;
  popular?: boolean;
  /** "acumulado": cadastro sem exercício (a cópia fica no ano corrente). */
  periodo?: "acumulado";
  /** "relatorio": documento gerado no portal sob demanda, não é tabela. */
  tipo?: "relatorio";
  /** Quantas colunas da cópia sincronizada aparecem na tabela (as demais ficam no detalhe). Padrão: 7. */
  colunasTabela?: number;
}

export interface TransparenciaTema {
  id: string;
  label: string;
  short: string;
  menu: string; // rótulo curto da barra de temas
  desc: string;
  icon: LucideIcon;
  color: string; // cor do tema (mesma lógica de cores do portal Megasoft, harmonizada)
  items: TransparenciaItem[];
}

const RD = "receitas-e-despesas/";
const CL = "contratos-convenios-e-licitacoes/";
const OS = "orgaos-e-servidores/";
const PP = "planejamento-e-politicas-publicas/";
const RF = "responsabilidade-fiscal/";
const LP = "legislacao-e-publicacoes/";
const OE = "ouvidoria-e-e-sic/";

export const TEMAS: TransparenciaTema[] = [
  {
    id: "receitas-e-despesas",
    menu: "Receitas e Despesas",
    label: "Receitas e Despesas",
    short: "Dinheiro público",
    desc: "Quanto o município arrecada, quanto gasta e com quem.",
    icon: Wallet,
    color: "#E0574A",
    items: [
      { slug: "receitas", href: "/transparencia/receitas", colunasTabela: 6, label: "Receitas", desc: "Arrecadação prevista e realizada, por origem e natureza.", portal: RD + "receita", keywords: "arrecadação impostos iptu iss repasses fpm", popular: true },
      { slug: "despesas", label: "Despesa Sintética", desc: "Gastos por classificação orçamentária: orçado, empenhado, liquidado e pago.", portal: RD + "despesa-sintetica", href: "/transparencia/despesas", keywords: "gastos orçamento dotação", popular: true },
      { slug: "pagamentos", href: "/transparencia/pagamentos", label: "Pagamentos", desc: "Pagamentos feitos a fornecedores, com data, valor e histórico.", portal: RD + "ordem-de-pagamento", keywords: "fornecedor pago ordem cronológica" },
      { slug: "empenhos", href: "/transparencia/empenhos", label: "Despesa e Empenho", desc: "Cada despesa empenhada, com credor, objeto e licitação de origem.", portal: RD + "empenho", keywords: "empenho credor fornecedor nota" },
      { slug: "liquidacao", href: "/transparencia/liquidacao", label: "Liquidação", desc: "Despesas liquidadas: bens entregues ou serviços prestados.", portal: RD + "liquidacao" },
      { slug: "movimentacao-orcamentaria", href: "/transparencia/movimentacao-orcamentaria", tipo: "relatorio", label: "Movimentação Orçamentária e Financeira", desc: "Créditos, suplementações e movimentação do orçamento.", portal: RD + "movimentacao-orcamentaria-financeira" },
      { slug: "repasses", href: "/transparencia/repasses", label: "Repasse ou Transferência de Recursos", desc: "Recursos repassados a outros órgãos e entidades.", portal: RD + "repasse-ou-transferencia-de-recursos" },
      { slug: "balanco-anual", href: "/transparencia/balanco-anual", tipo: "relatorio", label: "Relatório de Balanço Anual", desc: "Balanços orçamentário, financeiro e patrimonial (Lei 4.320/64).", portal: RD + "relatorio-de-balanco-anual", keywords: "prestação de contas balanço geral" },
      { slug: "pcasp", href: "/transparencia/pcasp", tipo: "relatorio", label: "Relatório PCASP", desc: "Demonstrativos pelo Plano de Contas Aplicado ao Setor Público.", portal: RD + "relatorio-pcasp" },
      { slug: "patrimonio", href: "/transparencia/patrimonio", periodo: "acumulado", label: "Patrimônio e Almoxarifado", desc: "Bens móveis, imóveis e estoque do almoxarifado.", portal: RD + "patrimonio-e-almoxarifado", keywords: "bens veículos imóveis estoque" },
      { slug: "extra-orcamentaria", href: "/transparencia/extra-orcamentaria", colunasTabela: 6, label: "Extra Orçamentária", desc: "Movimentações que não passam pelo orçamento (cauções, retenções).", portal: RD + "extra-orcamentaria" },
      { slug: "despesas-fixadas", href: "/transparencia/despesas-fixadas", colunasTabela: 4, label: "Despesas Fixadas", desc: "Dotação inicial de cada despesa prevista na LOA.", portal: RD + "despesas-fixadas" },
      { slug: "restos-a-pagar", href: "/transparencia/restos-a-pagar", label: "Restos a Pagar", desc: "Despesas de anos anteriores ainda não pagas.", portal: RD + "informacao-consolidada-resto-a-pagar" },
      { slug: "informacoes-consolidadas", href: "/transparencia/informacoes-consolidadas", label: "Informações Consolidadas", desc: "Visão geral consolidada de receitas e despesas.", portal: RD + "informacoes-consolidadas" },
      { slug: "transferencias-recebidas", href: "/transparencia/transferencias-recebidas", colunasTabela: 5, label: "Transferências Voluntárias Recebidas", desc: "Recursos recebidos da União e do Estado.", portal: RD + "transferencias-recebidas", keywords: "repasse federal estadual emenda" },
      { slug: "transferencias-realizadas", href: "/transparencia/transferencias-realizadas", periodo: "acumulado", label: "Transferências Voluntárias Realizadas", desc: "Repasses do município a entidades e associações.", portal: RD + "transferencia-voluntaria-realizada", keywords: "subvenção associação entidade" },
    ],
  },
  {
    id: "licitacoes-e-contratos",
    menu: "Licitações e Obras",
    label: "Licitações, Contratos e Obras",
    short: "Compras públicas",
    desc: "Como a Câmara compra, contrata e acompanha obras.",
    icon: Gavel,
    color: "#9A5B2E",
    items: [
      { slug: "licitacoes", label: "Procedimentos Licitatórios", desc: "Licitações abertas e encerradas, com edital e resultado.", portal: CL + "procedimentos-licitatorios", href: "/transparencia/licitacoes", keywords: "pregão edital concorrência compra", popular: true },
      { slug: "dispensas", href: "/transparencia/dispensas", label: "Dispensas e Inexigibilidades", desc: "Contratações diretas, sem licitação, e seus documentos.", portal: CL + "dispensas-inexigibilidades", keywords: "contratação direta compra" },
      { slug: "contratos", label: "Contratos", desc: "Contratos firmados, valores, vigência e aditivos.", portal: CL + "contrato", href: "/transparencia/contratos", keywords: "aditivo vigência fornecedor", popular: true },
      { slug: "fiscais", label: "Fiscais de Contratos", desc: "Servidores responsáveis por fiscalizar cada contrato.", portal: CL + "fiscais-de-contratos", href: "/transparencia/fiscais" },
      { slug: "ordem-de-fornecimento", href: "/transparencia/ordem-de-fornecimento", label: "Ordem de Fornecimento", desc: "Pedidos de entrega emitidos aos fornecedores.", portal: CL + "ordem-de-fornecimento" },
      { slug: "plano-de-contratacao", href: "/transparencia/documentos/plano-de-contratacao", label: "Plano de Contratação Anual", desc: "O que a Câmara planeja comprar no ano (Lei 14.133/21).", portal: CL + "plano-de-contratacao-anual", keywords: "pca planejamento compras" },
      { slug: "sancionados", href: "/transparencia/documentos/sancionados", label: "Licitantes e Contratados Sancionados", desc: "Empresas punidas administrativamente pelo município.", portal: CL + "relacao-dos-licitantes-e-ou-contratados-sancionados-admnistrativamente", keywords: "punição impedidas" },
      { slug: "obras", label: "Acompanhamento de Obras", desc: "Obras do município, empresa contratada, valor e andamento.", portal: CL + "obra", href: "/transparencia/obras", keywords: "construção reforma pavimentação", popular: true },
      { slug: "obras-paralisadas", periodo: "acumulado", label: "Obras Paralisadas", desc: "Obras interrompidas, motivo e previsão de retorno.", portal: CL + "movimentos-de-obras-paralisadas" },
      { slug: "convenios", label: "Convênios", desc: "Convênios celebrados com a União, o Estado e entidades.", portal: CL + "convenio", periodo: "acumulado" },
      { slug: "convenios-concedidos", periodo: "acumulado", label: "Transferências Concedidas de Convênios", desc: "Recursos repassados pelo município por meio de convênios.", portal: CL + "transferencias-concedidas-de-convenio" },
    ],
  },
  {
    id: "servidores",
    menu: "Servidores",
    label: "Órgãos e Servidores",
    short: "Pessoal",
    desc: "Quem trabalha na Câmara, quanto recebe e como está organizada.",
    icon: Users,
    color: "#1C93CF",
    items: [
      { slug: "servidores", label: "Servidores", desc: "Relação nominal de servidores, cargo, lotação e vínculo.", portal: OS + "servidor", href: "/transparencia/servidores", keywords: "funcionários cargo lotação", popular: true },
      { slug: "folha", label: "Folha de Pagamento", desc: "Remuneração mensal de cada servidor: proventos e descontos.", portal: OS + "servidor", href: "/transparencia/folha", keywords: "salário quanto ganha remuneração holerite", popular: true },
      { slug: "remuneracao", label: "Estrutura de Remuneração", desc: "Tabela de cargos, vagas e salários previstos em lei.", portal: OS + "estrutura-de-remuneracao", href: "/transparencia/remuneracao", keywords: "tabela salarial cargos vagas" },
      { slug: "diarias", label: "Diárias", desc: "Diárias pagas: servidor, destino, motivo e valor.", portal: OS + "diaria", href: "/transparencia/diarias", keywords: "viagem passagem", popular: true },
      { slug: "tabela-diarias", href: "/transparencia/documentos/tabela-diarias", label: "Tabela de Valores de Diárias", desc: "Valores das diárias dentro e fora do Estado.", portal: OS + "tabela-explicativa-diarias" },
      { slug: "estrutura", label: "Estrutura Organizacional e Competências", desc: "Setores, responsáveis, endereços e atribuições.", portal: OS + "estrutura-organizacional-e-competencias", href: "/transparencia/estrutura", keywords: "organograma secretarias secretário" },
      { slug: "concursos", periodo: "acumulado", label: "Concursos e Seleções Públicas", desc: "Editais de concursos e processos seletivos.", portal: OS + "situacao-do-concurso-publico", keywords: "edital processo seletivo vaga emprego" },
      { slug: "aprovados", periodo: "acumulado", label: "Aprovados em Concursos e Seleções", desc: "Listas de aprovados, classificação e nomeações.", portal: OS + "lista-de-aprovados-em-concursos-e-processos-seletivos" },
      { slug: "terceirizados", href: "/transparencia/documentos/terceirizados", label: "Terceirizados", desc: "Profissionais terceirizados que prestam serviço ao município.", portal: OS + "lista-de-terceirizados-que-prestam-de-servicos-a-instituicao" },
      { slug: "estagiarios", href: "/transparencia/documentos/estagiarios", label: "Estagiários", desc: "Relação de estagiários da Câmara.", portal: OS + "lista-de-estagiarios-da-instituicao" },
      { slug: "servidores-licenca", periodo: "acumulado", label: "Servidores de Licença", desc: "Servidores afastados por licença.", portal: OS + "servidores-de-licenca" },
      { slug: "servidores-ferias", periodo: "acumulado", label: "Servidores de Férias", desc: "Servidores em gozo de férias.", portal: OS + "servidores-de-ferias" },
      { slug: "servidores-cedidos", periodo: "acumulado", label: "Servidores Cedidos a Outros Órgãos", desc: "Servidores à disposição de outros municípios ou órgãos.", portal: OS + "servidores-a-disposicao-de-outro-municipio" },
      { slug: "servidores-recebidos", periodo: "acumulado", label: "Servidores Cedidos ao Município", desc: "Servidores de outros órgãos trabalhando no município.", portal: OS + "servidores-cedidos-para-o-municipio" },
    ],
  },
  {
    id: "planejamento",
    menu: "Planejamento",
    label: "Planejamento e Políticas Públicas",
    short: "Planejamento",
    desc: "Ações e projetos, planos e parecer do Tribunal.",
    icon: Compass,
    color: "#2E5FC8",
    items: [
      { slug: "acoes-projetos", href: "/transparencia/acoes-projetos", label: "Acompanhamento de Ações e Projetos", desc: "Ações e projetos do orçamento e sua execução.", portal: PP + "projeto" },
      { slug: "planos", href: "/transparencia/documentos/planos", label: "Planos Municipais", desc: "Planos setoriais publicados pelo município.", portal: PP + "planos" },
      { slug: "parecer-previo", href: "/transparencia/parecer-previo", label: "Parecer Prévio do Tribunal", desc: `Parecer do ${MUNICIPIO.tribunal} sobre as contas do prefeito.`, portal: PP + "parecer-previo", keywords: "tcm tribunal de contas" },
    ],
  },
  {
    id: "responsabilidade-fiscal",
    menu: "Resp. Fiscal",
    label: "Responsabilidade Fiscal",
    short: "Contas e LRF",
    desc: "Relatórios exigidos pela Lei de Responsabilidade Fiscal.",
    icon: ShieldCheck,
    color: "#E98A00",
    items: [
      { slug: "rgf", label: "Relatório de Gestão Fiscal (RGF)", desc: "Publicado a cada quatro meses: pessoal, dívida e limites.", portal: RF + "relatorio-de-gestao-fiscal", href: "/transparencia/rgf", keywords: "rgf quadrimestral limite pessoal" },
    ],
  },
  {
    id: "legislacao",
    menu: "Legislação",
    label: "Legislação e Publicações",
    short: "Leis e dados",
    desc: "Leis, atividade legislativa, publicações e dados abertos.",
    icon: Scale,
    color: "#B07F12",
    items: [
      { slug: "legislacao-municipal", label: "Legislação Municipal", desc: "Leis, decretos e demais atos publicados pela Câmara.", href: "/transparencia/legislacao", keywords: "lei decreto portaria", popular: true },
      { slug: "legislacao-federal", href: "/transparencia/legislacao-federal", label: "Legislação Federal", desc: "Leis federais de transparência e acesso à informação.", portal: LP + "legislacao-federal" },
      { slug: "outras-publicacoes", href: "/transparencia/documentos/outras-publicacoes", label: "Outras Publicações", desc: "Documentos e publicações diversas.", portal: LP + "outras-publicacoes" },
      { slug: "dados-abertos", label: "Dados Abertos", desc: "Bases do portal para download em formato aberto.", portal: LP + "dados-abertos", href: "/transparencia/dados-abertos", keywords: "csv download base de dados" },
      { slug: "atividades-legislativas", href: "/transparencia/documentos/atividades-legislativas", label: "Atividades Legislativas dos Parlamentares", desc: "Atuação e produção legislativa dos vereadores.", keywords: "vereador vereadores parlamentar atuação" },
      { slug: "cotas-verba-indenizatoria", href: "/transparencia/documentos/cotas-verba-indenizatoria", label: "Regulamentação das Cotas para Verba Indenizatória", desc: "Regras e valores das cotas para verba indenizatória.", portal: LP + "regulamentacao-dos-valores-relativos-as-cotas", keywords: "cota verba indenizatória vereador" },
      { slug: "apreciacao-contas-executivo", href: "/transparencia/documentos/apreciacao-contas-executivo", label: "Apreciação das Contas do Chefe do Poder Executivo", desc: "Julgamento das contas do prefeito pela Câmara.", portal: LP + "apreciacao-das-contas-do-chefe-do-poder-executivo", keywords: "prefeito julgamento contas" },
      { slug: "votacoes-nominais", href: "/transparencia/documentos/votacoes-nominais", label: "Lista sobre as Votações Nominais", desc: "Como cada vereador votou nas matérias.", keywords: "voto votação vereador plenário" },
      { slug: "atas-sessoes", href: "/transparencia/documentos/atas-sessoes", label: "Atas das Sessões", desc: "Registros das sessões ordinárias e extraordinárias.", keywords: "ata sessão plenário ordinária extraordinária" },
      { slug: "pauta-comissoes", href: "/transparencia/documentos/pauta-comissoes", label: "Pauta das Comissões", desc: "Assuntos previstos nas reuniões das comissões.", keywords: "comissão reunião pauta" },
      { slug: "pauta-plenario", href: "/transparencia/documentos/pauta-plenario", label: "Pauta das Sessões do Plenário", desc: "Matérias previstas para as sessões do plenário.", keywords: "plenário sessão ordem do dia pauta" },
      { slug: "projetos-leis", href: "/transparencia/documentos/projetos-leis", label: "Projetos de Leis e de Atos Infralegais", desc: "Projetos em tramitação e sua situação.", keywords: "projeto lei tramitação proposição" },
      { slug: "leis-atos-infralegais", href: "/transparencia/documentos/leis-atos-infralegais", label: "Leis e Atos Infralegais", desc: "Resoluções, decretos legislativos e demais atos.", keywords: "resolução decreto legislativo ato" },
      { slug: "composicao-casa", href: "/transparencia/documentos/composicao-casa", label: "Composição da Casa", desc: "Vereadores, partidos e formação da Câmara.", keywords: "vereadores partido mesa diretora bancada" },
      { slug: "privacidade", label: "Política de Privacidade e Proteção de Dados", desc: "Como o município trata dados pessoais (LGPD).", portal: LP + "politica-de-privacidade-e-protecao-de-dados", href: "/lgpd", keywords: "lgpd privacidade" },
      { slug: "encarregado-dados", label: "Responsável pelo Tratamento de Dados", desc: "Encarregado (DPO) e canal de contato.", portal: LP + "resposavel-pelo-tratamento-de-dados", href: "/lgpd", keywords: "dpo encarregado lgpd" },
    ],
  },
  {
    id: "ouvidoria-esic",
    menu: "Ouvidoria e e-SIC",
    label: "Ouvidoria e e-SIC",
    short: "Fale com a Câmara",
    desc: "Peça informações, registre manifestações e acompanhe respostas.",
    icon: MessagesSquare,
    color: "#0E8A55",
    items: [
      { slug: "solicitar-informacao", label: "Solicitação de Informação (e-SIC)", desc: "Peça qualquer informação pública à Câmara.", portal: OE, href: "/e-sic", keywords: "lai pedido sic acesso à informação", popular: true },
      { slug: "ouvidoria", label: "Ouvidoria", desc: "Denúncias, reclamações, sugestões e elogios.", portal: OE + "ouvidoria", href: "/contato", keywords: "denúncia reclamação sugestão elogio", popular: true },
      { slug: "acompanhar-solicitacao", label: "Acompanhamento de Solicitação", desc: "Consulte o andamento do seu pedido pelo protocolo.", portal: OE + "acompanhamento-de-solicitacao", href: "/contato", keywords: "protocolo andamento" },
      { slug: "estatisticas-esic", label: "Estatísticas do e-SIC", desc: "Pedidos recebidos, atendidos e indeferidos.", portal: OE + "estatistica-do-e-sic", href: "/transparencia/estatisticas-e-sic", keywords: "números pedidos lai relatório estatístico" },
      { slug: "perguntas-frequentes", label: "Perguntas Frequentes", desc: "Respostas para as dúvidas mais comuns.", portal: OE + "perguntas-frequentes", href: "/transparencia/perguntas-frequentes", keywords: "faq dúvidas" },
      { slug: "rol-informacoes", label: "Rol de Informações Classificadas", desc: "Informações sigilosas e desclassificadas nos últimos 12 meses.", portal: OE + "rol-de-informacoes", href: "/transparencia/documentos/rol-informacoes", keywords: "sigilo classificadas desclassificadas" },
      { slug: "sic-fisico", label: "SIC Presencial", desc: "Endereço, horário e responsável pelo atendimento presencial.", href: "/transparencia/sic-presencial", keywords: "endereço telefone horário atendimento" },
      { slug: "informacoes-ouvidoria", label: "Atendimento da Ouvidoria", desc: "Endereço, telefone e horário da Ouvidoria.", href: "/transparencia/atendimento-ouvidoria" },
      { slug: "relatorios-ouvidoria", label: "Relatórios da Ouvidoria", desc: "Relatórios das manifestações recebidas e respondidas.", portal: OE + "ouvidoria/relatorios-da-ouvidoria", href: "/transparencia/documentos/relatorios-ouvidoria", keywords: "relatório estatístico manifestações" },
      { slug: "pesquisa-satisfacao", label: "Pesquisa de Satisfação", desc: "Resultados das pesquisas de satisfação com os serviços.", portal: OE + "pesquisa-de-satisfacao", href: "/transparencia/documentos/pesquisa-satisfacao" },
      { slug: "governo-digital", label: "Governo Digital", desc: "Serviços digitais e a Lei 14.129/2021.", href: "/transparencia/governo-digital", keywords: "serviços online digital" },
    ],
  },
];

export const PORTAL_BASE = `${MUNICIPIO.portal}/`;

export interface ItemComTema extends TransparenciaItem { tema: TransparenciaTema; }

export const TODOS_ITENS: ItemComTema[] = TEMAS.flatMap((tema) => tema.items.map((item) => ({ ...item, tema })));

export const itemHref = (item: TransparenciaItem) => item.href ?? `/transparencia/consulta/${item.slug}`;
export const portalUrl = (item: TransparenciaItem, base = PORTAL_BASE) => (item.portal != null ? base + item.portal : undefined);

export const findItem = (slug: string) => TODOS_ITENS.find((i) => i.slug === slug);
export const findTema = (id: string) => TEMAS.find((t) => t.id === id);
// A LGPD fica no menu de Legislação, como no portal, mas a página usa o cabeçalho de Ouvidoria e e-SIC.
export const temaDaRota = (pathname: string) =>
  (pathname === "/lgpd" ? findTema("ouvidoria-esic") : undefined) ?? TODOS_ITENS.find((i) => itemHref(i) === pathname)?.tema ?? TEMAS.find((t) => pathname === `/transparencia/tema/${t.id}`);

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Busca por todas as palavras digitadas no título, descrição, palavras-chave e tema.
export function buscarItens(termo: string, limite = 8): ItemComTema[] {
  const palavras = normalizar(termo).split(/\s+/).filter((p) => p.length > 1);
  if (!palavras.length) return [];
  return TODOS_ITENS
    .map((item) => {
      const titulo = normalizar(item.label);
      const resto = normalizar(`${item.desc} ${item.keywords ?? ""} ${item.tema.label}`);
      if (!palavras.every((p) => titulo.includes(p) || resto.includes(p))) return null;
      const pontos = palavras.reduce((s, p) => s + (titulo.includes(p) ? 3 : 1), 0) + (item.popular ? 1 : 0);
      return { item, pontos };
    })
    .filter((x): x is { item: ItemComTema; pontos: number } => x !== null)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limite)
    .map((x) => x.item);
}

// Atalhos em linguagem do cidadão para a página inicial.
export const PERGUNTAS_CIDADAO: { pergunta: string; slug: string }[] = [
  { pergunta: "Quanto ganha um servidor?", slug: "folha" },
  { pergunta: "Em que a Câmara está gastando?", slug: "despesas" },
  { pergunta: "Quais licitações estão abertas?", slug: "licitacoes" },
  { pergunta: "Quais obras estão em andamento?", slug: "obras" },
  { pergunta: "Quanto o município arrecada?", slug: "receitas" },
  { pergunta: "Quem viajou com diárias?", slug: "diarias" },
  { pergunta: "Como pedir uma informação?", slug: "solicitar-informacao" },
  { pergunta: "Quais ações a Câmara executa?", slug: "acoes-projetos" },
];
