import { MUNICIPIO } from "@/config/municipio";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/transparencia/client";

interface TransparenciaUrls {
  base_url: string;
  portal_licitacoes: string;
  portal_contratos: string;
  portal_despesas: string;
  portal_receitas: string;
  portal_diarias: string;
  portal_empenhos: string;
  portal_pagamentos: string;
  portal_liquidacao: string;
  portal_convenios: string;
  portal_obras: string;
  portal_fiscais: string;
  portal_servidores: string;
  portal_remuneracao: string;
  portal_patrimonio: string;
}

// Fallback used until the CMS value (configuracoes.transparencia_urls) loads — must be this municipality's portal
const defaults: TransparenciaUrls = {
  base_url: MUNICIPIO.portal,
  portal_licitacoes: "/contratos-convenios-e-licitacoes/procedimentos-licitatorios?tipoDeConsultaDeModalidade=1",
  portal_contratos: "/contratos-convenios-e-licitacoes/contrato",
  portal_despesas: "/receitas-e-despesas/despesa-sintetica",
  portal_receitas: "/receitas-e-despesas/receita",
  portal_diarias: "/orgaos-e-servidores/diaria",
  portal_empenhos: "/receitas-e-despesas/empenho",
  portal_pagamentos: "/receitas-e-despesas/ordem-de-pagamento",
  portal_liquidacao: "/receitas-e-despesas/liquidacao",
  portal_convenios: "/contratos-convenios-e-licitacoes/convenio",
  portal_obras: "/contratos-convenios-e-licitacoes/obra",
  portal_fiscais: "/contratos-convenios-e-licitacoes/fiscais-de-contratos",
  portal_servidores: "/orgaos-e-servidores/servidor",
  portal_remuneracao: "/orgaos-e-servidores/estrutura-de-remuneracao",
  portal_patrimonio: "/receitas-e-despesas/patrimonio-e-almoxarifado",
};

let cachedUrls: TransparenciaUrls | null = null;

export function useTransparenciaUrls() {
  const [urls, setUrls] = useState<TransparenciaUrls>(cachedUrls || defaults);

  useEffect(() => {
    if (cachedUrls) return;
    (async () => {
      const { data } = await supabase
        .from("configuracoes")
        .select("valor")
        .eq("chave", "transparencia_urls")
        .maybeSingle();
      if (data?.valor) {
        const merged = { ...defaults, ...(data.valor as any) };
        cachedUrls = merged;
        setUrls(merged);
      }
    })();
  }, []);

  const getPortalUrl = (key: keyof Omit<TransparenciaUrls, "base_url">) => {
    return `${urls.base_url}${urls[key]}`;
  };

  return { urls, getPortalUrl };
}
