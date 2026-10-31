import { MUNICIPIO } from "@/config/municipio";
import { CONTACT_FALLBACK } from "@/hooks/use-contact-info";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/transparencia/client";

export interface InstitutionalData {
  // Identificação do município
  municipio: string;
  uf: string;
  // Dados gerais
  telefone_geral: string;
  email_geral: string;
  endereco: string;
  cep: string;
  horario: string;
  // Ouvidoria presencial
  ouvidoria_responsavel: string;
  ouvidoria_endereco: string;
  ouvidoria_telefone: string;
  ouvidoria_email: string;
  ouvidoria_horario: string;
  // SIC presencial
  sic_responsavel: string;
  sic_endereco: string;
  sic_telefone: string;
  sic_email: string;
  sic_horario: string;
  // DPO / LGPD
  dpo_nome: string;
  dpo_email: string;
  dpo_telefone: string;
  // Redes sociais
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
}

// O que o portal informa vale até o banco responder; o resto fica vazio: nunca mostrar contato de exemplo como oficial
export const defaultInstitutionalData: InstitutionalData = {
  municipio: MUNICIPIO.cidade,
  uf: MUNICIPIO.uf,
  telefone_geral: MUNICIPIO.telefone,
  email_geral: MUNICIPIO.email,
  endereco: CONTACT_FALLBACK.endereco,
  cep: "",
  horario: MUNICIPIO.horario,
  ouvidoria_responsavel: "",
  ouvidoria_endereco: "",
  ouvidoria_telefone: "",
  ouvidoria_email: "",
  ouvidoria_horario: "",
  sic_responsavel: "",
  sic_endereco: "",
  sic_telefone: "",
  sic_email: "",
  sic_horario: "",
  dpo_nome: "",
  dpo_email: "",
  dpo_telefone: "",
  facebook: "",
  instagram: "",
  youtube: "",
  twitter: "",
};

/*
 * Example values shipped with the original template. Some were saved into the CMS
 * unchanged (e.g. "(00) 0000-0000", "ouvidoria@prefeitura.gov.br"), so they are
 * recognised here and treated as "not informed" instead of being published.
 */
const TEMPLATE_PATTERNS: RegExp[] = [
  /^\(0{2}\)/,                         // (00) 0000-0000
  /^\(62\)\s*3333-0000$/,              // (62) 3333-0000
  /@prefeitura\.(go\.)?gov\.br$/i,     // generic template domain
  /Pra[çc]a C[íi]vica/i,
  /Pra[çc]a Central, s\/n/i,
  /^0{5}-?0{3}$|^75000-?000$/,         // template CEPs
  /^00\.000\.000\/0001-00$/,           // template CNPJ
  /^Encarregado designado pela Prefeitura$/i,
  // Template opening hours for the Ouvidoria / SIC channels (saved alongside the fake contacts)
  /^Seg–Sex, 8h às 14h$/,
  /^Seg a Sex, 8h às 12h e 14h às 17h$/,
  /Exemplo/,
];

export const isTemplateValue = (value?: string | null) =>
  !value || !value.trim() || TEMPLATE_PATTERNS.some((re) => re.test(value.trim()));

/** The value when it is real CMS data, or null when missing / still a template example. */
export const officialValue = (value?: string | null) =>
  isTemplateValue(value) ? null : value!.trim();

const CACHE_KEY = "cached_institutional_data";

function readCache(): InstitutionalData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return { ...defaultInstitutionalData, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

let cached: InstitutionalData | null = readCache();

export function useInstitutionalData() {
  const [data, setData] = useState<InstitutionalData>(cached || defaultInstitutionalData);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "dados_institucionais")
      .maybeSingle()
      .then(({ data: row }) => {
        if (row?.valor) {
          const merged = { ...defaultInstitutionalData, ...(row.valor as any) };
          cached = merged;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch {}
          setData(merged);
        }
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

// Force refresh (for admin after save)
export function invalidateInstitutionalCache() {
  cached = null;
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

// O painel grava o que acabou de salvar, para o site refletir sem esperar nova leitura.
export function setInstitutionalCache(data: Partial<InstitutionalData>) {
  const merged = { ...defaultInstitutionalData, ...data };
  cached = merged;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch {}
}
