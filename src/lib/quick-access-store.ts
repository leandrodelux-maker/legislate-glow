import { useEffect, useState } from "react";

export type QuickAccessCategory = "cidadaos" | "servidores" | "empresas" | "legislacao";

export const CATEGORY_LABELS: Record<QuickAccessCategory, string> = {
  cidadaos: "Cidadãos",
  servidores: "Servidores",
  empresas: "Empresas",
  legislacao: "Legislação",
};

export const ICON_OPTIONS = [
  "FileText",
  "ClipboardList",
  "Monitor",
  "BookOpen",
  "Users",
  "Building2",
  "Phone",
  "Mail",
  "Gavel",
  "Scale",
  "ShieldCheck",
  "Calendar",
  "Wallet",
  "Receipt",
  "Landmark",
  "Globe",
] as const;

export type QuickAccessIcon = (typeof ICON_OPTIONS)[number];

export type QuickAccessItem = {
  id: string;
  category: QuickAccessCategory;
  label: string;
  tag?: string;
  icon: QuickAccessIcon;
  url: string;
  external: boolean;
};

const STORAGE_KEY = "cm:quick-access:v2";

const DEFAULT_ITEMS: QuickAccessItem[] = [
  // Cidadãos
  { id: "1", category: "cidadaos", label: "Ouvidoria", icon: "Phone", url: "/contato", external: false },
  { id: "2", category: "cidadaos", label: "e-SIC", tag: "ACESSO À INFORMAÇÃO", icon: "ShieldCheck", url: "/e-sic", external: false },
  { id: "3", category: "cidadaos", label: "Solicitações", icon: "ClipboardList", url: "/e-sic", external: false },
  { id: "4", category: "cidadaos", label: "Perguntas e Respostas", icon: "BookOpen", url: "/perguntas-frequentes", external: false },
  { id: "5", category: "cidadaos", label: "Notícias", icon: "FileText", url: "/noticias", external: false },
  { id: "6", category: "cidadaos", label: "Sessões Plenárias", icon: "Calendar", url: "/sessoes", external: false },
  { id: "7", category: "cidadaos", label: "Vereadores", icon: "Users", url: "/vereadores", external: false },
  { id: "8", category: "cidadaos", label: "LGPD", tag: "PRIVACIDADE", icon: "ShieldCheck", url: "/lgpd", external: false },

  // Servidores
  { id: "9", category: "servidores", label: "Folha de Pagamento", icon: "Users", url: "/transparencia-portal", external: false },
  { id: "10", category: "servidores", label: "Diárias", icon: "Wallet", url: "/transparencia-portal", external: false },
  { id: "11", category: "servidores", label: "Estrutura e Cargos", icon: "Landmark", url: "/transparencia-portal", external: false },
  { id: "12", category: "servidores", label: "Estatísticas", icon: "Monitor", url: "/transparencia-portal", external: false },

  // Empresas
  { id: "13", category: "empresas", label: "Licitações", icon: "Gavel", url: "/transparencia-portal", external: false },
  { id: "14", category: "empresas", label: "Contratos", icon: "ClipboardList", url: "/transparencia-portal", external: false },
  { id: "15", category: "empresas", label: "Dispensas e Inexigibilidades", icon: "FileText", url: "/transparencia-portal", external: false },
  { id: "16", category: "empresas", label: "Receitas e Despesas", icon: "Receipt", url: "/transparencia-portal", external: false },

  // Legislação
  { id: "17", category: "legislacao", label: "Legislação Municipal", icon: "Scale", url: "/transparencia-portal", external: false },
  { id: "18", category: "legislacao", label: "Lei Orgânica", icon: "BookOpen", url: "/transparencia-portal", external: false },
  { id: "19", category: "legislacao", label: "Regimento Interno", icon: "Gavel", url: "/transparencia-portal", external: false },
  { id: "20", category: "legislacao", label: "Projetos Legislativos", icon: "FileText", url: "/projetos", external: false },
  { id: "21", category: "legislacao", label: "Gestão Fiscal (LRF)", icon: "Landmark", url: "/transparencia-portal", external: false },
  { id: "22", category: "legislacao", label: "Portal da Transparência", icon: "Globe", url: "/transparencia-portal", external: false },
];


function load(): QuickAccessItem[] {
  if (typeof window === "undefined") return DEFAULT_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ITEMS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ITEMS;
    return parsed;
  } catch {
    return DEFAULT_ITEMS;
  }
}

function save(items: QuickAccessItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("quick-access:changed"));
}

export function useQuickAccess() {
  const [items, setItems] = useState<QuickAccessItem[]>(DEFAULT_ITEMS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
    const onChange = () => setItems(load());
    window.addEventListener("quick-access:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("quick-access:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = (item: Omit<QuickAccessItem, "id">) => {
    const next = [...items, { ...item, id: crypto.randomUUID() }];
    setItems(next);
    save(next);
  };
  const update = (id: string, patch: Partial<QuickAccessItem>) => {
    const next = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setItems(next);
    save(next);
  };
  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    save(next);
  };
  const reset = () => {
    setItems(DEFAULT_ITEMS);
    save(DEFAULT_ITEMS);
  };

  return { items, ready, add, update, remove, reset };
}
