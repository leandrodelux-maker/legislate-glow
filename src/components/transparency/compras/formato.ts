// Formatação dos dados copiados do portal para as páginas de Licitações, Contratos e Obras.
// A lista sincronizada já vem em texto ("R$ 1.230,28", "29/09/2026"); o detalhe vem como o portal
// entrega (números e datas brutos), então tudo passa por aqui antes de aparecer na tela.

export type Registro = Record<string, unknown>;
export interface Detalhe extends Registro { listas?: Record<string, Registro[]> }

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const brl = (n: number) => BRL.format(n);

/** "R$ 1.230,28" → 1230.28; números passam direto; o resto vira NaN. */
export function numero(v: unknown): number {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim();
  if (!s) return NaN;
  if (/^-?(R\$\s*)?-?[\d.]+(,\d+)?%?$/.test(s)) return Number(s.replace(/[^\d,-]/g, "").replace(",", "."));
  return Number(s);
}

/** "29/09/2026", "2026-09-29T00:00" ou milissegundos → Date. */
export function data(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v > 1e11 ? new Date(v) : null;
  const s = String(v).trim();
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return Number(br[3]) < 1901 ? null : new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  return null;
}

export const dataBr = (d: Date) => d.toLocaleDateString("pt-BR");

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
/** "09/2026" → "Setembro de 2026" */
export const rotuloCompetencia = (v: string) => {
  const [m, a] = v.split("/");
  const nome = MESES[Number(m) - 1];
  return nome ? `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${a}` : v;
};

const MOEDA = /^(valor|saldo)|Valor|Saldo|Financeira|Total$|^total(?!$)/;
const DATA = /^data|^inicio|^fim|Data$|^vigencia$/i;

/** Valor de um campo pronto para exibir, conforme o tipo que o nome sugere. */
export function formatar(campo: string, v: unknown): string {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "number") {
    if (MOEDA.test(campo)) return brl(v);
    if (/percentual/i.test(campo)) return `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
    if (DATA.test(campo)) { const d = data(v); if (d) return dataBr(d); }
    return v.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
  }
  const s = String(v).replace(/<br\s*\/?>/gi, " / ").trim();
  if (DATA.test(campo) && /^\d{2}\/\d{2}\/18\d{2}$/.test(s)) return "—"; // data vazia no portal (29/12/1899)
  if (DATA.test(campo) && /^\d{4}-\d{2}-\d{2}/.test(s)) { const d = data(s); if (d) return dataBr(d); }
  return s;
}

export const ehMoeda = (campo: string) => MOEDA.test(campo);

/** Cor da situação de um processo, contrato ou obra. */
export function tomSituacao(s: unknown): { fundo: string; texto: string; ponto: string } {
  const t = String(s ?? "").toLowerCase();
  if (/paralis|suspens|cancel|revog|anulad|deserta|fracass|rescind|impugn/.test(t)) return { fundo: "bg-red-50 dark:bg-red-950/40", texto: "text-red-700 dark:text-red-300", ponto: "bg-red-500" };
  if (/acima do previsto/.test(t)) return { fundo: "bg-violet-50 dark:bg-violet-950/40", texto: "text-violet-700 dark:text-violet-300", ponto: "bg-violet-500" };
  if (/irregular|rejeitad|desaprovad/.test(t)) return { fundo: "bg-red-50 dark:bg-red-950/40", texto: "text-red-700 dark:text-red-300", ponto: "bg-red-500" };
  if (/^regular|aprovad|acima de 75/.test(t)) return { fundo: "bg-emerald-50 dark:bg-emerald-950/40", texto: "text-emerald-700 dark:text-emerald-300", ponto: "bg-emerald-500" };
  if (/entre 25/.test(t)) return { fundo: "bg-sky-50 dark:bg-sky-950/40", texto: "text-sky-700 dark:text-sky-300", ponto: "bg-sky-500" };
  if (/abaixo de 25|sem execu/.test(t)) return { fundo: "bg-amber-50 dark:bg-amber-950/40", texto: "text-amber-800 dark:text-amber-300", ponto: "bg-amber-500" };
  if (/nenhuma vaga/.test(t)) return { fundo: "bg-amber-50 dark:bg-amber-950/40", texto: "text-amber-800 dark:text-amber-300", ponto: "bg-amber-500" };
  if (/vagas preenchidas/.test(t)) return { fundo: "bg-emerald-50 dark:bg-emerald-950/40", texto: "text-emerald-700 dark:text-emerald-300", ponto: "bg-emerald-500" };
  if (/vagas livres/.test(t)) return { fundo: "bg-sky-50 dark:bg-sky-950/40", texto: "text-sky-700 dark:text-sky-300", ponto: "bg-sky-500" };
  if (/n[aã]o pago|pendente/.test(t)) return { fundo: "bg-amber-50 dark:bg-amber-950/40", texto: "text-amber-800 dark:text-amber-300", ponto: "bg-amber-500" };
  if (/pago em parte|parcial/.test(t)) return { fundo: "bg-sky-50 dark:bg-sky-950/40", texto: "text-sky-700 dark:text-sky-300", ponto: "bg-sky-500" };
  if (/^a (pagar|liquidar)$/.test(t)) return { fundo: "bg-amber-50 dark:bg-amber-950/40", texto: "text-amber-800 dark:text-amber-300", ponto: "bg-amber-500" };
  if (/^pago$/.test(t)) return { fundo: "bg-emerald-50 dark:bg-emerald-950/40", texto: "text-emerald-700 dark:text-emerald-300", ponto: "bg-emerald-500" };
  if (/vencimento|previsto encerrado|atrasad/.test(t)) return { fundo: "bg-amber-50 dark:bg-amber-950/40", texto: "text-amber-800 dark:text-amber-300", ponto: "bg-amber-500" };
  if (/homolog|conclu|finaliz|adjudic|julgad|executad/.test(t)) return { fundo: "bg-emerald-50 dark:bg-emerald-950/40", texto: "text-emerald-700 dark:text-emerald-300", ponto: "bg-emerald-500" };
  if (/vigente|andamento|abert|publicad|execu|iniciad|aguard|no prazo/.test(t)) return { fundo: "bg-sky-50 dark:bg-sky-950/40", texto: "text-sky-700 dark:text-sky-300", ponto: "bg-sky-500" };
  return { fundo: "bg-muted", texto: "text-muted-foreground", ponto: "bg-muted-foreground/60" };
}

export const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function baixarCsv(nome: string, colunas: { campo: string; rotulo: string }[], linhas: Registro[]) {
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const corpo = [
    colunas.map((c) => esc(c.rotulo)).join(";"),
    ...linhas.map((l) => colunas.map((c) => esc(l[c.campo] == null ? "" : formatar(c.campo, l[c.campo]))).join(";")),
  ];
  const url = URL.createObjectURL(new Blob(["﻿" + corpo.join("\r\n")], { type: "text/csv;charset=utf-8" }));
  Object.assign(document.createElement("a"), { href: url, download: `${nome}.csv` }).click();
  URL.revokeObjectURL(url);
}

/** Link de download de um arquivo anexado no portal, servido por /api/portal-documento. */
export function linkArquivo(arquivo: Registro, ver = false): string | null {
  // Arquivo publicado pelo painel do site: já tem o endereço pronto.
  if (typeof arquivo.url === "string") return arquivo.url;
  const codigo = arquivo.codigo;
  if (codigo == null || !/^\d+$/.test(String(codigo))) return null;
  const ext = String(arquivo.extensao ?? "").replace(/^\./, "").toLowerCase();
  let nome = String(arquivo.nome ?? arquivo.descricao ?? `documento-${codigo}`).trim();
  if (ext && !nome.toLowerCase().endsWith(`.${ext}`)) nome += `.${ext}`;
  return `/api/portal-documento?codigo=${codigo}&nome=${encodeURIComponent(nome)}${ver ? "&ver=1" : ""}`;
}

/**
 * Página do site do processo de origem (licitação ou dispensa) de um contrato ou ordem de fornecimento.
 * O portal indica a tela em `urlDetalhamento`; o ano sai do número ("6096/2026").
 */
export function linkProcesso(codigo: unknown, urlDetalhamento: unknown, numeroAno?: unknown): string | null {
  if (codigo == null || codigo === "") return null;
  const pagina = /dispensa/i.test(String(urlDetalhamento ?? "")) ? "dispensas" : "licitacoes";
  const ano = String(numeroAno ?? "").match(/\/(\d{4})$/)?.[1];
  return `/transparencia/${pagina}?registro=${codigo}${ano && Number(ano) !== new Date().getFullYear() ? `&ano=${ano}` : ""}`;
}
