import { CheckCircle2, Clock3, MinusCircle, PlusCircle, Wallet } from "lucide-react";
import type { Aba, Linha } from "./ComprasConsulta";
import TabelaLista, { type ColunaLista } from "./TabelaLista";
import { Resumo, type CampoResumo } from "./Blocos";
import { brl, numero, rotuloCompetencia, type Detalhe, type Registro } from "./formato";

// Cores fixas da folha, iguais em todas as telas: o cidadão aprende a ler uma vez.
export const COR = { proventos: "#0E9F6E", descontos: "#E02424", liquido: "#1C64F2" };

// Rótulos da cópia sincronizada (scripts/sync-transparencia/datasets.mjs → folha).
export const F = {
  competencia: "Competência", matricula: "Matrícula", nome: "Nome", cargo: "Cargo", departamento: "Departamento",
  vinculo: "Vínculo", situacao: "Situação", proventos: "Proventos", descontos: "Descontos", liquido: "Líquido",
  pagamento: "Pagamento", admissao: "Admissão",
};

const ordemCompetencia = (v: string) => { const [m, a] = (v ?? "").split("/"); return Number(a) * 100 + Number(m) || 0; };
export const pago = (s: unknown) => /^pago$/i.test(String(s ?? "").trim());
export const iniciais = (nome: string) => (nome ?? "").split(/\s+/).filter((p) => p.length > 2).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export const SeloPagamento = ({ situacao, claro = false }: { situacao?: string; claro?: boolean }) => {
  if (!situacao) return null;
  const ok = pago(situacao);
  const Icone = ok ? CheckCircle2 : Clock3;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
      claro ? (ok ? "bg-emerald-400/25 text-white" : "bg-amber-300 text-amber-950")
        : ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"}`}>
      <Icone className="h-3.5 w-3.5" aria-hidden /> {ok ? "Pago" : "Pagamento pendente"}
    </span>
  );
};

/** Proventos, descontos e líquido lado a lado, cada um com sua cor. */
export const Valores = ({ proventos, descontos, liquido, tamanho = "md" }: { proventos: unknown; descontos: unknown; liquido: unknown; tamanho?: "sm" | "md" | "lg" }) => {
  const itens = [
    { rotulo: "Proventos", valor: proventos, cor: COR.proventos, Icone: PlusCircle },
    { rotulo: "Descontos", valor: descontos, cor: COR.descontos, Icone: MinusCircle },
    { rotulo: "Líquido", valor: liquido, cor: COR.liquido, Icone: Wallet },
  ];
  const texto = { sm: "text-sm", md: "text-base", lg: "text-xl sm:text-2xl" }[tamanho];
  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-4">
      {itens.map(({ rotulo, valor, cor, Icone }) => {
        const n = numero(valor);
        return (
          <div key={rotulo} className="min-w-0">
            <dt className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Icone className="h-3 w-3 shrink-0" style={{ color: cor }} aria-hidden /> {rotulo}
            </dt>
            <dd className={`${texto} font-bold tabular-nums truncate`} style={{ color: cor }}>{Number.isFinite(n) ? brl(n) : "—"}</dd>
          </div>
        );
      })}
    </dl>
  );
};

/** Barra do contracheque: o que é proventos vira líquido (azul) e descontos (vermelho). */
export const BarraFolha = ({ proventos, descontos, alto = false }: { proventos: unknown; descontos: unknown; alto?: boolean }) => {
  const p = numero(proventos), d = numero(descontos);
  if (!(p > 0)) return null;
  const pd = Math.min(100, Math.max(0, (d / p) * 100));
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-muted ${alto ? "h-3" : "h-1.5"}`} role="img"
      aria-label={`Dos proventos, ${pd.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% foram descontos e o restante é líquido`}>
      <span style={{ width: `${100 - pd}%`, backgroundColor: COR.liquido }} />
      <span style={{ width: `${pd}%`, backgroundColor: COR.descontos }} />
    </div>
  );
};

// ---------- Contracheque (detalhe do mês) ----------

const FOLHAS: [string, string, string][] = [
  ["movimentoVencimentos", "somatorioMovimentoVencimentos", "Vencimentos"],
  ["movimento13Salario", "somatorioMovimento13Salario", "13º salário"],
  ["movimentoFerias", "somatorioMovimentoFerias", "Férias"],
  ["movimentoComplementar", "somatorioMovimentoComplementar", "Complementar"],
  ["movimentoSessoesExtraordinarias", "somatorioMovimentoSessoesExtraordinarias", "Sessões extraordinárias"],
  ["movimentoRescisao", "somatorioMovimentoRescisao", "Rescisão"],
];

export const Contracheque = ({ detalhe, linha }: { detalhe: Detalhe; linha: Linha }) => {
  const ls = detalhe.listas ?? {};
  const folhas = FOLHAS.filter(([lista]) => ls[lista]?.length);
  if (!folhas.length) {
    return (
      <div className="rounded-2xl border border-border/60 p-5">
        <p className="text-sm text-muted-foreground mb-4">O detalhamento por rubrica deste mês não está na cópia do site; estes são os totais informados pelo portal.</p>
        <Valores proventos={linha[F.proventos]} descontos={linha[F.descontos]} liquido={linha[F.liquido]} />
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      {folhas.map(([lista, soma, titulo]) => {
        const rubricas = ls[lista] ?? [];
        const s = (ls[soma] ?? [])[0] ?? {};
        const proventos = s.somatorioProventos ?? rubricas.reduce((a, r) => a + (numero(r.proventos) || 0), 0);
        const descontos = s.somatorioDescontos ?? rubricas.reduce((a, r) => a + (numero(r.descontos) || 0), 0);
        const liquido = s.totalLiquido ?? numero(proventos) - numero(descontos);
        return (
          <section key={lista} className="rounded-2xl border border-border/60 overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-muted/40 border-b border-border/50">
              <h3 className="font-display text-base font-bold text-foreground">{titulo}</h3>
              <span className="text-xs text-muted-foreground">{rubricas.length} rubrica(s)</span>
            </header>
            <table className="w-full text-sm">
              <thead className="sr-only sm:not-sr-only">
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="text-left font-bold px-4 pt-3 pb-1">Rubrica</th>
                  <th scope="col" className="text-right font-bold px-4 pt-3 pb-1" style={{ color: COR.proventos }}>Proventos</th>
                  <th scope="col" className="text-right font-bold px-4 pt-3 pb-1" style={{ color: COR.descontos }}>Descontos</th>
                </tr>
              </thead>
              <tbody>
                {rubricas.map((r, i) => {
                  const p = numero(r.proventos), d = numero(r.descontos);
                  return (
                    <tr key={i} className="border-t border-border/40 first:border-t-0 sm:first:border-t">
                      <td className="px-4 py-2.5 text-foreground">{String(r.nome ?? "—")}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap font-semibold" style={{ color: p > 0 ? COR.proventos : undefined }}>{p > 0 ? brl(p) : <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap font-semibold" style={{ color: d > 0 ? COR.descontos : undefined }}>{d > 0 ? `− ${brl(d)}` : <span className="text-muted-foreground/60">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <footer className="px-4 py-3.5 border-t-2 border-border bg-card">
              <Valores proventos={proventos} descontos={descontos} liquido={liquido} tamanho="sm" />
              <div className="mt-2.5"><BarraFolha proventos={proventos} descontos={descontos} /></div>
            </footer>
          </section>
        );
      })}
    </div>
  );
};

// ---------- Histórico do servidor no ano ----------

export const Historico = ({ linhas, matricula, atual }: { linhas: Linha[]; matricula: string; atual: string }) => {
  const meses = linhas.filter((l) => l[F.matricula] === matricula).sort((a, b) => ordemCompetencia(a[F.competencia]) - ordemCompetencia(b[F.competencia]));
  const maior = Math.max(...meses.map((l) => numero(l[F.proventos]) || 0), 1);
  const soma = (k: string) => meses.reduce((s, l) => s + (numero(l[k]) || 0), 0);
  return (
    <div>
      <div className="rounded-2xl border border-border/60 p-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Total no ano ({meses.length} {meses.length === 1 ? "mês" : "meses"})</p>
        <Valores proventos={soma(F.proventos)} descontos={soma(F.descontos)} liquido={soma(F.liquido)} />
      </div>
      {/* Uma coluna por mês: altura = proventos; azul = líquido, vermelho = descontos */}
      <div className="flex items-end gap-1.5 sm:gap-2 h-40 px-1 mb-1" role="img" aria-label="Proventos, descontos e líquido de cada mês">
        {meses.map((l) => {
          const p = numero(l[F.proventos]) || 0, d = numero(l[F.descontos]) || 0;
          const ativo = l[F.competencia] === atual;
          return (
            <div key={l._chave} className="flex-1 flex flex-col justify-end h-full min-w-0" title={`${rotuloCompetencia(l[F.competencia])}: líquido ${brl(p - d)}`}>
              <div className={`w-full rounded-t-md overflow-hidden flex flex-col-reverse ${ativo ? "ring-2 ring-offset-2 ring-foreground/70 ring-offset-background" : ""}`} style={{ height: `${Math.max((p / maior) * 100, 2)}%` }}>
                <span style={{ height: `${p ? ((p - d) / p) * 100 : 0}%`, backgroundColor: COR.liquido }} />
                <span style={{ height: `${p ? (d / p) * 100 : 0}%`, backgroundColor: COR.descontos }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 sm:gap-2 px-1 mb-5">
        {meses.map((l) => <span key={l._chave} className={`flex-1 text-center text-[10px] tabular-nums ${l[F.competencia] === atual ? "font-bold text-foreground" : "text-muted-foreground"}`}>{l[F.competencia]?.slice(0, 2)}</span>)}
      </div>
      <ul className="grid gap-2">
        {[...meses].reverse().map((l) => (
          <li key={l._chave} className={`rounded-2xl border px-4 py-3 ${l[F.competencia] === atual ? "border-foreground/40 bg-muted/40" : "border-border/60"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-foreground">{rotuloCompetencia(l[F.competencia])}</span>
              <SeloPagamento situacao={l[F.pagamento]} />
            </div>
            <Valores proventos={l[F.proventos]} descontos={l[F.descontos]} liquido={l[F.liquido]} tamanho="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------- Abas do painel (folha e servidores) ----------

const DADOS_FUNCIONAIS: CampoResumo[] = [
  ["nome", "Nome", F.nome],
  ["matricula", "Matrícula", F.matricula],
  ["cpf", "CPF", "CPF"],
  ["cargo", "Cargo", F.cargo],
  ["cargoRec", "Cargo de recebimento"],
  ["tipoDeVinculo", "Tipo de vínculo", F.vinculo],
  ["situacao", "Situação", F.situacao],
  ["orgao", "Órgão"],
  ["departamento", "Departamento", F.departamento],
  ["localDeTrabalho", "Local de trabalho"],
  ["nivel", "Nível"],
  ["classificacao", "Classificação"],
  ["cargaHoraria", "Carga horária mensal", "Carga horária"],
  ["jornadaSemanal", "Jornada semanal (horas)"],
  ["dataAdmissao", "Data de admissão", F.admissao],
  ["dataExoneracao", "Data de exoneração", "Exoneração"],
  ["decreto", "Decreto de nomeação"],
  ["dataDecreto", "Data do decreto"],
  ["categoriaDoTrabalhadorNoESocial", "Categoria no eSocial", undefined, true],
  ["observacao", "Observação", undefined, true],
];

const col = (...pares: [string, string][]): ColunaLista[] => pares.map(([campo, rotulo]) => ({ campo, rotulo }));
const FERIAS = col(["dataInicio", "Início"], ["dataFim", "Fim"], ["observacao", "Observação"]);
const LICENCA = col(["tipoDeLicenca", "Tipo"], ["dataDeAfastamento", "Afastamento"], ["dataDeRetorno", "Retorno"], ["numeroEAnoDoAto", "Ato"], ["dataDePublicacao", "Publicação"], ["historico", "Histórico"]);
const DISPOSICAO = col(["tipoDeDisposicao", "Tipo"], ["dataInicial", "Início"], ["dataFinal", "Fim"], ["nomeDoOrgao", "Órgão de destino"], ["cnpjDoOrgao", "CNPJ"]);
const PENSAO = col(["instituidorDaPensao", "Instituidor"], ["tipoDeBeneficio", "Benefício"], ["numeroDoAto", "Ato"], ["dataDePublicacao", "Publicação"]);

/** Abas do servidor no painel; `foco` define a primeira (contracheque na Folha, dados na página de Servidores). */
export function abasServidor({ linha, detalhe, cor, linhas, foco }: { linha: Linha; detalhe: Detalhe; cor: string; linhas: Linha[]; foco: "folha" | "servidor" }): Aba[] {
  const ls = detalhe.listas ?? {};
  const n = (k: string) => ls[k]?.length ?? 0;
  const nome = `servidor-${linha[F.matricula]}-${linha[F.competencia]?.replace("/", "-")}`;
  const lista = (id: string, rotulo: string, chave: string, colunas: ColunaLista[]): Aba =>
    ({ id, rotulo, contagem: n(chave), conteudo: <TabelaLista colunas={colunas} linhas={ls[chave] ?? []} arquivo={`${nome}-${id}`} cor={cor} /> });
  const contracheque: Aba = { id: "contracheque", rotulo: `Contracheque de ${rotuloCompetencia(linha[F.competencia]).toLowerCase()}`, conteudo: <Contracheque detalhe={detalhe} linha={linha} /> };
  const dados: Aba = { id: "dados", rotulo: "Dados funcionais", conteudo: <Resumo campos={DADOS_FUNCIONAIS} detalhe={detalhe} linha={linha as unknown as Registro} /> };
  const meses = linhas.filter((l) => l[F.matricula] === linha[F.matricula]).length;
  const historico: Aba = { id: "historico", rotulo: "Remuneração no ano", contagem: meses, conteudo: <Historico linhas={linhas} matricula={linha[F.matricula]} atual={linha[F.competencia]} /> };
  return [
    ...(foco === "folha" ? [contracheque, historico, dados] : [dados, historico, contracheque]),
    lista("ferias", "Férias", "ferias", FERIAS),
    lista("licencas", "Licenças", "licenca", LICENCA),
    lista("disposicao", "Disposição", "vidaFuncionalDisposicao", DISPOSICAO),
    lista("pensao", "Pensão", "instituidorDePensao", PENSAO),
  ];
}
