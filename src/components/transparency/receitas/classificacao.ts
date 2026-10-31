import { MUNICIPIO } from "@/config/municipio";
// Funções de governo (Portaria MOG nº 42/1999): o código que abre a classificação da despesa.
const FUNCOES: Record<number, string> = {
  1: "Legislativa", 2: "Judiciária", 3: "Essencial à Justiça", 4: "Administração", 5: "Defesa Nacional", 6: "Segurança Pública",
  7: "Relações Exteriores", 8: "Assistência Social", 9: "Previdência Social", 10: "Saúde", 11: "Trabalho", 12: "Educação",
  13: "Cultura", 14: "Direitos da Cidadania", 15: "Urbanismo", 16: "Habitação", 17: "Saneamento", 18: "Gestão Ambiental",
  19: "Ciência e Tecnologia", 20: "Agricultura", 21: "Organização Agrária", 22: "Indústria", 23: "Comércio e Serviços",
  24: "Comunicações", 25: "Energia", 26: "Transporte", 27: "Desporto e Lazer", 28: "Encargos Especiais", 99: "Reserva de Contingência",
};

/** "10" ou "10 - Saúde" → "Saúde". */
export const nomeDaFuncao = (v: string | undefined) => {
  const n = Number(String(v ?? "").match(/^\s*(\d+)/)?.[1]);
  return FUNCOES[n] ?? (v?.replace(/^\s*\d+\s*-\s*/, "") || undefined);
};

/** Classificação da Despesa Sintética ("10.43.04.122.4913.1.294.449030 - MATERIAL DE CONSUMO"):
 *  órgão, unidade, função, subfunção, programa, ação e elemento, mais a descrição. */
export function partesDaClassificacao(c: string | undefined) {
  const [codigo = "", ...resto] = String(c ?? "").split(" - ");
  const p = codigo.split(".");
  return {
    orgao: p[0], unidade: p[1], funcao: nomeDaFuncao(p[2]), subfuncao: p[3], programa: p[4],
    acao: p[5] && p[6] ? `${p[5]}.${p[6]}` : undefined, elemento: p[7], descricao: resto.join(" - ").trim() || codigo,
  };
}

/** Natureza da despesa pelo elemento ("339030", "3.3.90.39.79"): corrente/capital e o grupo. */
export function categoriaEconomica(elemento: string | undefined) {
  const d = String(elemento ?? "").replace(/\D/g, "");
  if (!d) return undefined;
  const grupo = { "31": "Pessoal e encargos", "32": "Juros da dívida", "33": "Outras despesas correntes", "44": "Investimentos", "45": "Inversões financeiras", "46": "Amortização da dívida" }[d.slice(0, 2)];
  return grupo;
}

// Órgãos do município no portal (/api/orgao): a Despesa Sintética só traz o código, no início da classificação.
export const nomeDoOrgao = (codigo: string | undefined) => MUNICIPIO.orgaos[Number(codigo)] ?? (codigo ? `Órgão ${codigo}` : undefined);

/** Número do documento sem o ano na frente: "202645092" e "2026000045092" → "45092" (chave nas outras listas). */
export const numeroSemAno = (v: string | undefined) => {
  const s = String(v ?? "").replace(/\D/g, "");
  return s.length > 4 ? String(Number(s.slice(4))) : s;
};
