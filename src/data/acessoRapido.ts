import {
  BadgeCheck, Ban, Banknote, BookOpen, Briefcase, Building2, CalendarDays, ClipboardList, FileCheck, FileSearch, FileSignature, Gavel,
  GraduationCap, HandCoins, HardHat, HelpCircle, Landmark, ListChecks, Megaphone, MessageCircleQuestion, Newspaper, Plane, Receipt, Scale,
  ScrollText, ShieldCheck, ShoppingCart, Stamp, Table2, UserCheck, Users, Vote, Wallet, type LucideIcon,
} from "lucide-react";
import { findItem, itemHref } from "@/data/transparenciaCatalogo";
import { ROUTES } from "@/lib/site-links";

export type AtalhoRapido = { titulo: string; desc: string; href: string; icone: LucideIcon };
export type PerfilAcesso = { id: string; rotulo: string; icone: LucideIcon; destaque: AtalhoRapido; itens: AtalhoRapido[] };

/** Item do catálogo da Transparência: título, descrição e endereço vêm de lá, para não ficarem diferentes do portal. */
function doPortal(slug: string, icone: LucideIcon): AtalhoRapido {
  const item = findItem(slug);
  if (!item) throw new Error(`Acesso Rápido: "${slug}" não existe no catálogo da Transparência.`);
  return { titulo: item.label, desc: item.desc, href: itemHref(item), icone };
}

// Cada perfil tem 1 destaque e 8 atalhos, para a grade fechar sem buracos.
export const PERFIS: PerfilAcesso[] = [
  {
    id: "cidadaos",
    rotulo: "Cidadãos",
    icone: Users,
    destaque: { titulo: "Peça uma informação pública", desc: "Pelo e-SIC, qualquer pessoa pode pedir dados à Câmara, sem precisar justificar.", href: ROUTES.esic, icone: MessageCircleQuestion },
    itens: [
      { titulo: "Ouvidoria", desc: "Denúncias, sugestões e elogios", href: ROUTES.contato, icone: Megaphone },
      { titulo: "Portal da Transparência", desc: "Receitas, despesas e contratos", href: ROUTES.transparencia, icone: FileSearch },
      { titulo: "Sessões Plenárias", desc: "Pautas, atas e transmissões", href: ROUTES.sessoes, icone: CalendarDays },
      { titulo: "Vereadores", desc: "Conheça os parlamentares", href: ROUTES.vereadores, icone: Users },
      { titulo: "Notícias", desc: "Comunicados oficiais", href: ROUTES.noticias, icone: Newspaper },
      { titulo: "Carta de Serviços", desc: "O que a Câmara oferece", href: ROUTES.cartaServicos, icone: ListChecks },
      { titulo: "Perguntas Frequentes", desc: "Dúvidas mais comuns", href: ROUTES.faq, icone: HelpCircle },
      { titulo: "LGPD", desc: "Proteção dos seus dados", href: ROUTES.lgpd, icone: ShieldCheck },
    ],
  },
  {
    id: "servidores",
    rotulo: "Servidores",
    icone: Briefcase,
    destaque: doPortal("folha", Wallet),
    itens: [
      doPortal("servidores", Users),
      doPortal("remuneracao", Banknote),
      doPortal("diarias", Plane),
      doPortal("tabela-diarias", Table2),
      doPortal("estrutura", Building2),
      doPortal("concursos", GraduationCap),
      doPortal("terceirizados", UserCheck),
      doPortal("estagiarios", BadgeCheck),
    ],
  },
  {
    id: "empresas",
    rotulo: "Empresas",
    icone: Building2,
    destaque: doPortal("licitacoes", Gavel),
    itens: [
      doPortal("dispensas", FileCheck),
      doPortal("contratos", FileSignature),
      doPortal("ordem-de-fornecimento", ShoppingCart),
      doPortal("plano-de-contratacao", ClipboardList),
      doPortal("pagamentos", HandCoins),
      doPortal("fiscais", UserCheck),
      doPortal("obras", HardHat),
      doPortal("sancionados", Ban),
    ],
  },
  {
    id: "legislacao",
    rotulo: "Legislação",
    icone: Scale,
    destaque: { titulo: "Projetos de Lei", desc: "Acompanhe as proposições em tramitação e as já aprovadas pela Câmara.", href: ROUTES.projetos, icone: Gavel },
    itens: [
      { titulo: "Lei Orgânica Municipal", desc: "Norma máxima do município", href: ROUTES.leiOrganica, icone: Landmark },
      { titulo: "Regimento Interno", desc: "Regras de funcionamento da Casa", href: ROUTES.regimentoInterno, icone: BookOpen },
      { titulo: "Portarias", desc: "Atos da Presidência", href: ROUTES.portarias, icone: Stamp },
      doPortal("legislacao-municipal", Scale),
      doPortal("legislacao-federal", Receipt),
      doPortal("votacoes-nominais", Vote),
      doPortal("atas-sessoes", ScrollText),
      doPortal("pauta-plenario", CalendarDays),
    ],
  },
];
