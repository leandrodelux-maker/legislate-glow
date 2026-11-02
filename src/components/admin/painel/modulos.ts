import {
  BookOpen, Building2, Calendar, Crown, FileText, FolderTree, Gavel, Globe, HelpCircle, History, Home, Images, Landmark, Library, ListOrdered, Mail, MessageSquare,
  Newspaper, Radar, Scale, ScrollText, Settings, Trophy, Users, UsersRound, type LucideIcon,
} from "lucide-react";

// Fonte única do menu lateral, da busca do topo e do cabeçalho de cada tela.
// Só entram aqui as telas cujo conteúdo aparece no site ou é necessário para atender o cidadão.
export type Modulo = { label: string; path: string; icone: LucideIcon; desc: string; site?: string };
export type GrupoModulos = { id: string; label: string; cor: string; icone: LucideIcon; itens: Modulo[] };

/** Cor única do painel: a mesma azul-petróleo do site. */
export const COR_PAINEL = "oklch(0.408 0.079 230)";

export const GRUPOS: GrupoModulos[] = [
  {
    id: "geral",
    label: "Visão geral",
    cor: COR_PAINEL,
    icone: Home,
    itens: [{ label: "Início", path: "/admin/dashboard", icone: Home, desc: "O que precisa da sua atenção hoje e os atalhos para o dia a dia." }],
  },
  {
    id: "legislativo",
    label: "Legislativo",
    cor: COR_PAINEL,
    icone: Landmark,
    itens: [
      { label: "Vereadores", path: "/admin/vereadores", icone: Users, desc: "Cadastro completo de cada parlamentar: dados, contato, mandato e redes sociais.", site: "/vereadores" },
      { label: "Mandatos", path: "/admin/vereadores/mandatos", icone: History, desc: "Histórico de mandatos e cargos de cada vereador, exibido no perfil.", site: "/vereadores" },
      { label: "Galeria dos Vereadores", path: "/admin/vereadores/galeria", icone: Images, desc: "Fotos que aparecem na aba Galeria do perfil de cada vereador.", site: "/vereadores" },
      { label: "Ranking", path: "/admin/vereadores/ranking", icone: Trophy, desc: "Calculado automaticamente a partir dos projetos e da presença nas sessões.", site: "/vereadores/ranking" },
      { label: "Mesa Diretora", path: "/admin/mesa-diretora", icone: Crown, desc: "Quem compõe a direção da Câmara no biênio atual.", site: "/a-camara/mesa-diretora" },
      { label: "Comissões", path: "/admin/comissoes", icone: Scale, desc: "Comissões permanentes e o que cada uma analisa.", site: "/a-camara/comissoes" },
      { label: "Membros das Comissões", path: "/admin/comissoes-membros", icone: UsersRound, desc: "Quem participa de cada comissão e em qual função.", site: "/a-camara/comissoes" },
      { label: "Sessões", path: "/admin/sessoes", icone: Calendar, desc: "Agenda, pauta, ata, presença e votos de cada sessão plenária.", site: "/sessoes" },
      { label: "Projetos", path: "/admin/projetos", icone: Gavel, desc: "Projetos de lei, indicações, requerimentos e a etapa em que cada um está.", site: "/projetos" },
      { label: "Roteiro das Sessões", path: "/admin/cms/roteiro-sessoes", icone: ListOrdered, desc: "As etapas que explicam ao cidadão como funciona uma sessão.", site: "/a-camara/roteiro-das-sessoes" },
    ],
  },
  {
    id: "documentos",
    label: "Documentos",
    cor: COR_PAINEL,
    icone: FileText,
    itens: [
      { label: "Documentos Oficiais", path: "/admin/documentos-oficiais", icone: BookOpen, desc: "Carta de Serviços, Lei Orgânica e Regimento Interno.", site: "/atos-legislativos/carta-de-servicos" },
      { label: "Portarias", path: "/admin/portarias", icone: ScrollText, desc: "Atos da Presidência publicados em Atos Legislativos.", site: "/atos-legislativos/portarias" },
    ],
  },
  {
    id: "comunicacao",
    label: "Comunicação",
    cor: COR_PAINEL,
    icone: Newspaper,
    itens: [
      { label: "Notícias", path: "/admin/noticias", icone: Newspaper, desc: "Escreva, publique e destaque as notícias da Câmara.", site: "/noticias" },
      { label: "Categorias de Notícias", path: "/admin/cms/categorias", icone: FolderTree, desc: "Os filtros que o cidadão usa na página de Notícias.", site: "/noticias" },
      { label: "Perguntas Frequentes", path: "/admin/cms/faq", icone: HelpCircle, desc: "Respostas prontas para as dúvidas mais comuns.", site: "/perguntas-frequentes" },
    ],
  },
  {
    id: "atendimento",
    label: "Atendimento",
    cor: COR_PAINEL,
    icone: MessageSquare,
    itens: [
      { label: "e-SIC", path: "/admin/cms/esic", icone: Mail, desc: "Pedidos de informação dos cidadãos e o prazo legal de cada resposta.", site: "/e-sic" },
      { label: "Ouvidoria", path: "/admin/cms/ouvidoria", icone: MessageSquare, desc: "Manifestações recebidas e as respostas da Câmara.", site: "/contato" },
    ],
  },
  {
    id: "transparencia",
    label: "Transparência",
    cor: COR_PAINEL,
    icone: Scale,
    itens: [
      { label: "Publicações", path: "/admin/publicacoes", icone: Library, desc: "Legislação, atos, pautas de comissões e publicações exibidas na Transparência.", site: "/transparencia/tema/legislacao" },
      { label: "Matriz Atricon", path: "/admin/matriz-atricon", icone: Radar, desc: "Critérios da avaliação de transparência e o link de cada informação no site.", site: "/transparencia/atricon" },
    ],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    cor: COR_PAINEL,
    icone: Settings,
    itens: [
      { label: "Dados da Câmara", path: "/admin/configuracoes/geral", icone: Building2, desc: "Contato, endereço e redes sociais usados em todo o site." },
      { label: "Página Inicial e Logotipos", path: "/admin/configuracoes-site", icone: Globe, desc: "Imagem e textos do topo da página inicial, logotipos e transmissão ao vivo.", site: "/" },
    ],
  },
];

const TODOS = GRUPOS.flatMap((g) => g.itens.map((m) => ({ ...m, grupo: g })));
// O caminho mais longo vence: /admin/vereadores/mandatos não pode cair em /admin/vereadores.
const POR_TAMANHO = [...TODOS].sort((a, b) => b.path.length - a.path.length);

export function moduloDaRota(pathname: string) {
  return POR_TAMANHO.find((m) => pathname === m.path || pathname.startsWith(`${m.path}/`));
}
