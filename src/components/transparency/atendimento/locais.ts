import { useEffect, useState } from "react";
import { fetchTransparenciaDataset } from "@/hooks/useTransparenciaDataset";
import type { InstitutionalData } from "@/hooks/useInstitutionalData";

// Local de atendimento presencial (SIC físico ou Ouvidoria). O que foi preenchido no painel (/admin/institucional)
// tem prioridade; sem isso, vale a cópia do Portal da Transparência ("sic-fisico" / "informacoes-ouvidoria").
export interface Local { local?: string; endereco?: string; telefones: string[]; email?: string; responsavel?: string; horarios: string[] }
type Linha = Record<string, unknown>;

const doPortal = (l: Linha): Local => ({
  local: String(l["Local"] ?? "") || undefined,
  endereco: String(l["Endereço"] ?? "") || undefined,
  telefones: [...new Set([l["Telefone"], l["Telefone 2"]].map((t) => String(t ?? "").trim()).filter(Boolean))],
  email: String(l["E-mail"] ?? "") || undefined,
  responsavel: String(l["Responsável"] ?? "") || undefined,
  horarios: Array.isArray(l["Horários"]) ? (l["Horários"] as string[]) : String(l["Horários"] ?? "").split(/\s*,\s*/).filter(Boolean),
});

// Cadastro sem ano: a cópia fica no ano corrente; na virada do ano, vale a do ano anterior até a próxima cópia.
export function useLocaisAtendimento(conjunto: "sic-fisico" | "informacoes-ouvidoria") {
  const [locais, setLocais] = useState<Local[] | null>(null);
  useEffect(() => {
    const ano = new Date().getFullYear();
    (async () => {
      const r = (await fetchTransparenciaDataset<Linha>(conjunto, ano)) ?? (await fetchTransparenciaDataset<Linha>(conjunto, ano - 1));
      setLocais((r?.data ?? []).map(doPortal));
    })().catch(() => setLocais([]));
  }, [conjunto]);
  return locais;
}

export const temDados = (l: Local) => Boolean(l.endereco || l.email || l.responsavel || l.telefones.length || l.horarios.length);

export function localDoSite(inst: InstitutionalData, canal: "sic" | "ouvidoria"): Local {
  const v = canal === "sic"
    ? { endereco: inst.sic_endereco, telefone: inst.sic_telefone, email: inst.sic_email, responsavel: inst.sic_responsavel, horario: inst.sic_horario }
    : { endereco: inst.ouvidoria_endereco, telefone: inst.ouvidoria_telefone, email: inst.ouvidoria_email, responsavel: inst.ouvidoria_responsavel, horario: inst.ouvidoria_horario };
  return { endereco: v.endereco, email: v.email, responsavel: v.responsavel, telefones: v.telefone ? [v.telefone] : [], horarios: v.horario ? [v.horario] : [] };
}

export const formatarTelefone = (t: string) => {
  const d = t.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t;
};
