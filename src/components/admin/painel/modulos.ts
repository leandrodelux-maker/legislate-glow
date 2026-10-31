import { Library, Radar, Scale, type LucideIcon } from "lucide-react";

// Telas do painel vindas do modelo da Transparência. As demais telas seguem o menu em AdminSidebar.
export type Modulo = { label: string; path: string; icone: LucideIcon; desc: string; site?: string };
export type GrupoModulos = { id: string; label: string; cor: string; icone: LucideIcon; itens: Modulo[] };

export const GRUPOS: GrupoModulos[] = [
  {
    id: "transparencia",
    label: "Transparência",
    cor: "#14505F",
    icone: Scale,
    itens: [
      { label: "Publicações", path: "/admin/publicacoes", icone: Library, desc: "Legislação, atos, pautas de comissões e publicações exibidas na Transparência.", site: "/transparencia/tema/legislacao" },
      { label: "Matriz Atricon", path: "/admin/matriz-atricon", icone: Radar, desc: "Critérios da avaliação de transparência e o link de cada informação no site.", site: "/transparencia/atricon" },
    ],
  },
];

const TODOS = GRUPOS.flatMap((g) => g.itens.map((m) => ({ ...m, grupo: g })));

export function moduloDaRota(pathname: string) {
  return TODOS.find((m) => pathname === m.path || pathname.startsWith(`${m.path}/`));
}
