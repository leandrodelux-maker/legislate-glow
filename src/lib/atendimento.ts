// Estados e regras do atendimento (e-SIC e Ouvidoria), compartilhados pela consulta pública e pelo painel.
export type Origem = "sic" | "ouvidoria";
export type Status = "pendente" | "em_andamento" | "respondido" | "indeferido" | "arquivado";

export interface Situacao { rotulo: string; classe: string; final: boolean }

export const SITUACOES: Record<Status, Situacao> = {
  pendente: { rotulo: "Recebido", classe: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200", final: false },
  em_andamento: { rotulo: "Em análise", classe: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200", final: false },
  respondido: { rotulo: "Respondido", classe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200", final: true },
  indeferido: { rotulo: "Negado", classe: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200", final: true },
  arquivado: { rotulo: "Arquivado", classe: "bg-muted text-muted-foreground", final: true },
};

export const situacaoDe = (status: string): Situacao =>
  SITUACOES[status as Status] ?? { rotulo: status, classe: "bg-muted text-muted-foreground", final: false };

export const TIPOS_OUVIDORIA: Record<string, string> = { denuncia: "Denúncia", reclamacao: "Reclamação", sugestao: "Sugestão", elogio: "Elogio", informacao: "Informação" };

// Prazo legal: 20 dias no e-SIC (LAI, art. 11) e 30 na Ouvidoria (Lei 13.460/2017, art. 16).
export const PRAZO_DIAS: Record<Origem, number> = { sic: 20, ouvidoria: 30 };

export function diasParaPrazo(r: { created_at: string; prazo_resposta?: string | null }, origem: Origem, agora = new Date()): number {
  const prazo = r.prazo_resposta ? new Date(r.prazo_resposta) : new Date(new Date(r.created_at).getTime() + PRAZO_DIAS[origem] * 864e5);
  return Math.ceil((prazo.getTime() - agora.getTime()) / 864e5);
}

// Prorrogação: uma vez, com justificativa. 10 dias no e-SIC (LAI, art. 11, § 2º) e igual período na Ouvidoria (Lei 13.460/2017, art. 16).
export const DIAS_PRORROGACAO: Record<Origem, number> = { sic: 10, ouvidoria: 30 };

export function dadosProrrogacao(r: { status: string; created_at: string; prazo_resposta?: string | null; prorrogado_em?: string | null }, origem: Origem, justificativa: string, quando = new Date()) {
  const texto = justificativa.trim();
  if (r.prorrogado_em) throw new Error("Este pedido já foi prorrogado uma vez.");
  if (situacaoDe(r.status).final) throw new Error("O pedido já está encerrado.");
  if (!texto) throw new Error("Escreva a justificativa da prorrogação.");
  const base = r.prazo_resposta ? new Date(r.prazo_resposta).getTime() : new Date(r.created_at).getTime() + PRAZO_DIAS[origem] * 864e5;
  return { prazo_resposta: new Date(base + DIAS_PRORROGACAO[origem] * 864e5).toISOString(), prorrogado_em: quando.toISOString(), prorrogacao_justificativa: texto };
}

// Recurso do e-SIC (LAI, art. 15): 10 dias para o cidadão, depois da resposta ou da negativa. A função do banco confere de novo.
export const prazoDoRecurso = (respondidoEm: string) => new Date(new Date(respondidoEm).getTime() + 10 * 864e5);

export function podeRecorrer(r: { status: string; respondido_em?: string | null; recurso_em?: string | null }, agora = new Date()) {
  if (r.recurso_em || !r.respondido_em || !["respondido", "indeferido"].includes(r.status)) return false;
  return agora <= prazoDoRecurso(r.respondido_em);
}

export const RECURSO_ROTULO: Record<string, string> = { pendente: "Recurso em análise", deferido: "Recurso aceito", indeferido: "Recurso negado" };

export function decisaoRecurso(status: "deferido" | "indeferido", texto: string, usuarioId: string, quando = new Date()) {
  const resposta = texto.trim();
  if (!resposta) throw new Error("Escreva a decisão do recurso.");
  return { recurso_status: status, recurso_resposta: resposta, recurso_respondido_por: usuarioId, recurso_respondido_em: quando.toISOString() };
}

// Soma por ano os números copiados do Megasoft e os dos pedidos feitos neste site: são canais diferentes.
export interface TotaisAno { ano: number; solicitados: number; atendidos: number; abertos: number; indeferidos: number }

export function mesclarEstatisticas<S>(portal: (TotaisAno & { series: Record<string, S> })[], site: TotaisAno[]) {
  const anos = new Map(portal.map((a) => [a.ano, { ...a }]));
  for (const s of site) {
    const a = anos.get(s.ano);
    if (a) { a.solicitados += s.solicitados; a.atendidos += s.atendidos; a.abertos += s.abertos; a.indeferidos += s.indeferidos; }
    else anos.set(s.ano, { ...s, series: {} });
  }
  return [...anos.values()].sort((x, y) => x.ano - y.ano);
}

export interface Decisao { status: Status; resposta: string | null; respondido_por: string | null; respondido_em: string | null }

// O que o painel grava ao decidir um pedido. Responder ou negar exige texto, pois ele é mostrado ao cidadão.
export function atualizacaoParaDecisao(status: Status, texto: string, usuarioId: string, quando = new Date()): Decisao {
  const resposta = texto.trim() || null;
  if ((status === "respondido" || status === "indeferido") && !resposta) throw new Error("Escreva a resposta ou a justificativa.");
  if (!SITUACOES[status].final) return { status, resposta: null, respondido_por: null, respondido_em: null };
  return { status, resposta, respondido_por: usuarioId, respondido_em: quando.toISOString() };
}
