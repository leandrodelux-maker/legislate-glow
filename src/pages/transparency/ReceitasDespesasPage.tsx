import { MUNICIPIO } from "@/config/municipio";
import { Link, Navigate, useLocation } from "@/lib/roteador-transparencia";
import { ArrowRight, Building2, CalendarDays, FileText, Loader2, Receipt, User } from "lucide-react";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import { SeloSituacao } from "@/components/transparency/compras/Blocos";
import { brl, data, numero, type Detalhe } from "@/components/transparency/compras/formato";
import { Cartao, Funil, MesAMes, Ranking } from "@/components/transparency/receitas/Panorama";
import { agrupar, mesDaData, pct, somar, type Grupo } from "@/components/transparency/receitas/calculos";
import { categoriaEconomica, nomeDaFuncao, nomeDoOrgao, numeroSemAno, partesDaClassificacao } from "@/components/transparency/receitas/classificacao";
import { carregarConjunto, useConjunto } from "@/components/transparency/receitas/relacionados";

// Páginas de Receitas e Despesas sobre as cópias do Portal da Transparência: indicadores do período,
// uma análise dos dados (de onde vem e para onde vai o dinheiro, mês a mês, maiores fornecedores) e a
// lista com o painel de detalhe. Pagamentos, liquidações e empenhos se ligam pelo número do empenho.

const v = (l: Linha, campo: string) => numero(l[campo]) || 0;
const semCodigo = (s: string | undefined) => String(s ?? "").replace(/^[\d.]+\s*-\s*/, "").trim();
const qtd = (n: number) => n.toLocaleString("pt-BR");
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const anoDe = (l: Linha, campo = "Data") => data(l[campo])?.getFullYear();
const busca = (g: Grupo) => g.busca ?? g.rotulo;
const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "a", "o"]);
/** "FUNDO MUNICIPAL DE SAUDE" → "Fundo Municipal de Saude" (nomes que o portal grava em maiúsculas). */
const nomeProprio = (s: string | undefined) => String(s ?? "").toLowerCase().replace(/\S+/g, (w, i) => (i && MINUSCULAS.has(w) ? w : w[0].toUpperCase() + w.slice(1)));
// O portal lança cada repasse duas vezes: a saída no Município e a entrada no órgão que recebe. Os totais contam
// só a saída; com um órgão selecionado (que tem só as próprias entradas), contam as linhas dele.
const doMunicipio = (l: Linha) => /^(MUNICIPIO|PREFEITURA)/i.test(l["Órgão"] ?? "") || l["Órgão"] === MUNICIPIO.orgaos[MUNICIPIO.orgaoPrincipal];
const semDuplicar = (ls: Linha[]) => (ls.some(doMunicipio) ? ls.filter(doMunicipio) : ls);
/** Repasse: a sigla do título ("FMS") com o nome do órgão que recebe, tirado do lançamento de entrada. */
const destinos = (ls: Linha[]) => {
  const nomes = new Map(ls.filter((l) => !doMunicipio(l)).map((l) => [l["Título"], l["Órgão"]]));
  return (l: Linha) => (l["Título"]?.length <= 6 && nomes.get(l["Título"]) ? `${l["Título"]} · ${nomeProprio(nomes.get(l["Título"]))}` : l["Título"]);
};

// ---------- Blocos do painel ----------

const Campos = ({ linha, campos }: { linha: Linha; campos: [string, string?][] }) => (
  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
    {campos.filter(([r, c]) => linha[c ?? r]).map(([rotulo, campo]) => (
      <div key={rotulo} className={(linha[campo ?? rotulo] ?? "").length > 60 ? "sm:col-span-2" : ""}>
        <dt className="text-xs font-semibold text-muted-foreground">{rotulo}</dt>
        <dd className="text-sm text-foreground mt-0.5 leading-relaxed break-words">{linha[campo ?? rotulo]}</dd>
      </div>
    ))}
  </dl>
);

const Valores = ({ itens }: { itens: { rotulo: string; valor: string }[] }) => (
  <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
    {itens.map((i) => (
      <div key={i.rotulo} className="rounded-xl bg-white/12 px-3 py-2" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
        <dt className="text-[11px] font-semibold text-white/80">{i.rotulo}</dt>
        <dd className="font-display text-base font-bold tabular-nums">{i.valor}</dd>
      </div>
    ))}
  </dl>
);

/** Barra de três etapas (empenhado → liquidado → pago) de um empenho. */
const Etapas3 = ({ emp, liq, pago, cor }: { emp: number; liq: number; pago: number; cor: string }) => (
  <div className="mt-3" title={`Liquidado ${pct(liq, emp)}% · Pago ${pct(pago, emp)}%`}>
    <div className="relative h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, pct(liq, emp))}%`, backgroundColor: cor, opacity: 0.35 }} />
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, pct(pago, emp))}%`, backgroundColor: cor }} />
    </div>
    <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground tabular-nums">
      <span>Liquidado {pct(liq, emp).toLocaleString("pt-BR")}%</span><span>Pago {pct(pago, emp).toLocaleString("pt-BR")}%</span>
    </div>
  </div>
);

/** Outros registros do mesmo fornecedor no período (a partir da lista já carregada). */
const DoMesmo = ({ linhas, atual, chave, campoValor, campoData, rotulo, cor, descricao }: {
  linhas: Linha[]; atual: Linha; chave: string; campoValor: string; campoData: string; rotulo: (l: Linha) => string; cor: string; descricao: string;
}) => {
  const outros = linhas.filter((l) => l[chave] && l[chave] === atual[chave]).sort((a, b) => (data(b[campoData])?.getTime() ?? 0) - (data(a[campoData])?.getTime() ?? 0));
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{descricao}: <strong className="text-foreground">{qtd(outros.length)}</strong> registro(s), somando <strong className="text-foreground">{brl(somar(outros, campoValor))}</strong>.</p>
      <ul className="rounded-2xl border border-border/60 divide-y divide-border/50 overflow-hidden">
        {outros.slice(0, 50).map((l) => (
          <li key={l._chave} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${l._chave === atual._chave ? "bg-muted/50" : ""}`}>
            <span className="text-xs text-muted-foreground tabular-nums w-20 shrink-0">{l[campoData]}</span>
            <span className="flex-1 min-w-0 truncate text-foreground">{rotulo(l)}</span>
            <span className="font-semibold tabular-nums shrink-0" style={l._chave === atual._chave ? { color: cor } : undefined}>{l[campoValor]}</span>
          </li>
        ))}
      </ul>
      {outros.length > 50 && <p className="text-xs text-muted-foreground mt-2">Mostrando os 50 mais recentes.</p>}
    </div>
  );
};

/** Liquidações e pagamentos de um empenho, das outras listas do mesmo exercício. */
const MovimentosDoEmpenho = ({ numeroEmpenho, ano, cor }: { numeroEmpenho: string; ano?: number; cor: string }) => {
  const liquidacoes = useConjunto("liquidacao", ano);
  const pagamentos = useConjunto("pagamentos", ano);
  if (!liquidacoes || !pagamentos) return <p className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Procurando liquidações e pagamentos…</p>;
  const liq = liquidacoes.filter((l) => numeroSemAno(l["Empenho"]) === numeroEmpenho);
  const pag = pagamentos.filter((l) => numeroSemAno(l["Empenho"]) === numeroEmpenho);
  const Bloco = ({ titulo, itens, href, campoValor }: { titulo: string; itens: Linha[]; href: string; campoValor: string }) => (
    <section>
      <h3 className="text-sm font-bold text-foreground mb-2">{titulo} <span className="font-normal text-muted-foreground">({itens.length})</span></h3>
      {itens.length ? (
        <ul className="rounded-2xl border border-border/60 divide-y divide-border/50 overflow-hidden">
          {itens.map((l) => (
            <li key={l._chave}>
              <Link to={`${href}?ano=${ano}&registro=${l._chave}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50">
                <span className="text-xs text-muted-foreground tabular-nums w-20 shrink-0">{l["Data"]}</span>
                <span className="flex-1 min-w-0 text-foreground">Nº {numeroSemAno(l["Número"])}{l["Fase"] && l["Fase"] !== "Emissão" ? ` · ${l["Fase"]}` : ""}</span>
                <span className="font-semibold tabular-nums">{l[campoValor]}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border px-4 py-3">Nenhum registro {titulo.toLowerCase().startsWith("liq") ? "de liquidação" : "de pagamento"} para este empenho no exercício.</p>}
    </section>
  );
  return (
    <div className="space-y-6">
      <Bloco titulo="Liquidações" itens={liq} href="/transparencia/liquidacao" campoValor="Valor" />
      <Bloco titulo="Pagamentos" itens={pag} href="/transparencia/pagamentos" campoValor="Valor pago" />
      <p className="text-xs text-muted-foreground">Liquidação é a conferência de que o bem foi entregue ou o serviço prestado; só depois dela o pagamento é feito.</p>
    </div>
  );
};

/** Anulações e estornos do registro, com o motivo informado no portal (data, valor e motivo variam de nome). */
const anulacoesDe = (d: Detalhe, listas: [string, string][]) => listas.flatMap(([lista, etapa]) => (d.listas?.[lista] ?? []).map((a) => ({
  etapa, data: String(a.data ?? a.dataDoEstorno ?? ""), valor: numero(a.valor ?? a.valorDoEstorno) || 0, motivo: String(a.motivo ?? a.motivoDoEstorno ?? ""),
})));

const Anulacoes = ({ itens, cor }: { itens: ReturnType<typeof anulacoesDe>; cor: string }) => (
  <ul className="space-y-3">
    {itens.map((a, i) => (
      <li key={i} className="rounded-2xl border border-border/60 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: cor }}>{a.etapa}</span>
          <span className="text-sm tabular-nums"><span className="text-muted-foreground">{a.data}</span> · <strong className="text-foreground">{brl(a.valor)}</strong></span>
        </div>
        <p className="text-sm text-foreground mt-2 leading-relaxed"><span className="font-semibold">Motivo:</span> {a.motivo || "não informado no portal"}</p>
      </li>
    ))}
  </ul>
);

const abaAnulacoes = (d: Detalhe, listas: [string, string][], cor: string) => {
  const itens = anulacoesDe(d, listas);
  return { id: "anulacoes", rotulo: "Anulações", contagem: itens.length, conteudo: <Anulacoes itens={itens} cor={cor} /> };
};

const LinkPara = ({ href, rotulo, numero: n, cor, icone: Icone }: { href: string; rotulo: string; numero: string; cor: string; icone: typeof FileText }) => (
  <Link to={href} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 hover:shadow-md hover:bg-background transition">
    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}><Icone className="h-5 w-5" aria-hidden /></span>
    <span className="flex-1 min-w-0"><span className="block text-xs text-muted-foreground">{rotulo}</span><span className="block text-sm font-bold text-foreground">Nº {n}</span></span>
    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
  </Link>
);

const Grade = ({ children, colunas = 2 }: { children: React.ReactNode; colunas?: 2 | 3 }) => (
  <div className={`grid gap-4 ${colunas === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>{children}</div>
);

// ---------- Base comum ----------

const base = (slug: string, extra: Partial<ConfigCompras> & Pick<ConfigCompras, "situacaoDe" | "campoData" | "campoValor" | "indicadores" | "Cartao" | "cabecalho" | "abas">): ConfigCompras => ({
  slug, semDetalhe: true, placeholderBusca: "Buscar por nome, número, CNPJ…", ...extra,
});

const statusEmpenho = (emp: number, liq: number, pago: number) =>
  emp <= 0 ? "Anulado" : pago >= emp - 0.005 ? "Pago" : pago > 0 ? "Pago em parte" : liq > 0 ? "A pagar" : "A liquidar";

// ---------- Configurações ----------

const CONFIGS: Record<string, ConfigCompras> = {
  receitas: base("receitas", {
    situacaoDe: (l) => l["Origem dos recursos"], rotuloSituacao: "Origem",
    campoData: "Mês de referência", campoValor: "Arrecadado no ano", ordemInicial: "maior",
    placeholderBusca: "Buscar receita: IPTU, ISS, FPM, ICMS…",
    indicadores: (ls) => {
      const prev = somar(ls, "Previsto no ano"), arr = somar(ls, "Arrecadado no ano");
      const mes = Number(ls[0]?.["Mês de referência"]);
      return [
        { rotulo: "Previsto no ano", valor: brl(prev) },
        { rotulo: "Arrecadado no ano", valor: brl(arr), detalhe: `${pct(arr, prev).toLocaleString("pt-BR")}% da previsão`, cor: "#16a36a" },
        { rotulo: mes ? `Arrecadado em ${MESES[mes - 1]}` : "Arrecadado no mês", valor: brl(somar(ls, "Arrecadado no mês")) },
        { rotulo: "Falta arrecadar", valor: brl(Math.max(0, prev - arr)), detalhe: "para atingir a previsão" },
      ];
    },
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade colunas={3}>
        <Cartao titulo="De onde vem o dinheiro" descricao="Arrecadado no ano por origem">
          <Ranking itens={agrupar(linhas, (l) => l["Origem dos recursos"], (l) => v(l, "Arrecadado no ano"))} cor={cor} rotuloQtd="receita" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Maiores receitas" descricao="Somando todas as fontes de cada receita">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Natureza da receita"]), (l) => v(l, "Arrecadado no ano"))} cor={cor} rotuloQtd="fonte" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por fonte de recurso" descricao="Para onde o dinheiro está vinculado">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Fonte de recurso"]), (l) => v(l, "Arrecadado no ano"))} cor={cor} rotuloQtd="receita" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha, cor }) => {
      const prev = v(linha, "Previsto no ano"), arr = v(linha, "Arrecadado no ano");
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2"><SeloSituacao situacao={linha["Origem dos recursos"]} /></div>
          <p className="font-display text-base font-bold text-foreground mt-3 leading-snug line-clamp-3">{semCodigo(linha["Natureza da receita"])}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{semCodigo(linha["Fonte de recurso"])}</p>
          <div className="flex-1" />
          <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Arrecadado no ano"]}</p>
          <p className="text-xs text-muted-foreground">arrecadado de {linha["Previsto no ano"]} previstos</p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden" aria-hidden><div className="h-full rounded-full" style={{ width: `${Math.min(100, pct(arr, prev))}%`, backgroundColor: cor }} /></div>
          <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{prev ? `${pct(arr, prev).toLocaleString("pt-BR")}% da previsão` : "sem previsão no orçamento"}</p>
        </div>
      );
    },
    cabecalho: ({ linha }) => (
      <>
        <SeloSituacao situacao={linha["Origem dos recursos"]} claro />
        <h2 className="font-display text-2xl font-bold leading-tight mt-2">{semCodigo(linha["Natureza da receita"])}</h2>
        <p className="text-sm text-white/85 mt-1">{linha["Fonte de recurso"]}</p>
        <Valores itens={[{ rotulo: "Previsto no ano", valor: linha["Previsto no ano"] }, { rotulo: "Arrecadado no ano", valor: linha["Arrecadado no ano"] }, { rotulo: "No mês", valor: linha["Arrecadado no mês"] }, { rotulo: "Da previsão", valor: `${pct(v(linha, "Arrecadado no ano"), v(linha, "Previsto no ano")).toLocaleString("pt-BR")}%` }]} />
      </>
    ),
    abas: ({ linha }) => [{ id: "resumo", rotulo: "Resumo", conteudo: <Campos linha={linha} campos={[["Natureza da receita"], ["Origem dos recursos"], ["Fonte de recurso"], ["Órgão"], ["Previsto no ano"], ["Arrecadado no ano"], ["Arrecadado no mês"], ["Mês de referência"]]} /> }],
  }),

  despesas: base("despesas", {
    situacaoDe: (l) => partesDaClassificacao(l.classificacao).funcao ?? "", rotuloSituacao: "Área",
    orgaoDe: (l) => nomeDoOrgao(partesDaClassificacao(l.classificacao).orgao),
    campoData: "classificacao", campoValor: "valor_empenhado", ordemInicial: "maior",
    placeholderBusca: "Buscar despesa: material, obras, pessoal…",
    indicadores: (ls) => {
      const dot = somar(ls, "dotacao_atualizada"), emp = somar(ls, "valor_empenhado"), liq = somar(ls, "valor_liquidado"), pago = somar(ls, "valor_pago");
      return [
        { rotulo: "Orçamento atualizado", valor: brl(dot), detalhe: `inicial: ${brl(somar(ls, "valor_orcado"))}` },
        { rotulo: "Empenhado", valor: brl(emp), detalhe: `${pct(emp, dot).toLocaleString("pt-BR")}% do orçamento` },
        { rotulo: "Liquidado", valor: brl(liq), detalhe: `${pct(liq, emp).toLocaleString("pt-BR")}% do empenhado` },
        { rotulo: "Pago", valor: brl(pago), detalhe: `${pct(pago, emp).toLocaleString("pt-BR")}% do empenhado`, cor: "#16a36a" },
      ];
    },
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade colunas={3}>
        <Cartao titulo="Do orçamento ao pagamento" descricao="Quanto do orçamento já virou gasto">
          <Funil cor={cor} etapas={[
            { rotulo: "Orçamento atualizado", valor: somar(linhas, "dotacao_atualizada") },
            { rotulo: "Empenhado", valor: somar(linhas, "valor_empenhado"), nota: "reservado" },
            { rotulo: "Liquidado", valor: somar(linhas, "valor_liquidado"), nota: "entregue" },
            { rotulo: "Pago", valor: somar(linhas, "valor_pago") },
          ]} />
        </Cartao>
        <Cartao titulo="Para onde vai o dinheiro" descricao="Empenhado por área de governo">
          <Ranking itens={agrupar(linhas, (l) => partesDaClassificacao(l.classificacao).funcao, (l) => v(l, "valor_empenhado"))} cor={cor} rotuloQtd="dotação" />
        </Cartao>
        <Cartao titulo="Em que é gasto" descricao="Empenhado por tipo de despesa">
          <Ranking itens={agrupar(linhas, (l) => partesDaClassificacao(l.classificacao).descricao, (l) => v(l, "valor_empenhado"))} cor={cor} rotuloQtd="dotação" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha, cor }) => {
      const c = partesDaClassificacao(linha.classificacao);
      const dot = v(linha, "dotacao_atualizada"), emp = v(linha, "valor_empenhado");
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-2">
            {c.funcao && <SeloSituacao situacao={c.funcao} />}
            <span className="min-w-0 text-[11px] text-muted-foreground tabular-nums truncate">{linha.classificacao?.split(" - ")[0]}</span>
          </div>
          <p className="font-display text-base font-bold text-foreground mt-3 leading-snug line-clamp-2">{c.descricao}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{categoriaEconomica(c.elemento)}</p>
          <div className="flex-1" />
          <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div><dt className="text-muted-foreground">Orçamento</dt><dd className="font-semibold text-foreground tabular-nums">{linha.dotacao_atualizada}</dd></div>
            <div><dt className="text-muted-foreground">Empenhado</dt><dd className="font-semibold text-foreground tabular-nums">{linha.valor_empenhado}</dd></div>
            <div><dt className="text-muted-foreground">Pago</dt><dd className="font-semibold text-foreground tabular-nums">{linha.valor_pago}</dd></div>
          </dl>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden" title={`${pct(emp, dot)}% do orçamento empenhado`} aria-hidden><div className="h-full rounded-full" style={{ width: `${Math.min(100, pct(emp, dot))}%`, backgroundColor: cor }} /></div>
        </div>
      );
    },
    cabecalho: ({ linha }) => {
      const c = partesDaClassificacao(linha.classificacao);
      return (
        <>
          {c.funcao && <SeloSituacao situacao={c.funcao} claro />}
          <h2 className="font-display text-2xl font-bold leading-tight mt-2">{c.descricao}</h2>
          <p className="text-sm text-white/85 mt-1 tabular-nums">{linha.classificacao?.split(" - ")[0]}</p>
          <Valores itens={[{ rotulo: "Orçamento atualizado", valor: linha.dotacao_atualizada }, { rotulo: "Empenhado", valor: linha.valor_empenhado }, { rotulo: "Liquidado", valor: linha.valor_liquidado }, { rotulo: "Pago", valor: linha.valor_pago }]} />
        </>
      );
    },
    abas: ({ linha, cor }) => {
      const c = partesDaClassificacao(linha.classificacao);
      const l = { ...linha, Área: c.funcao ?? "", "Tipo de despesa": c.descricao, Grupo: categoriaEconomica(c.elemento) ?? "", Órgão: c.orgao, Unidade: c.unidade, Subfunção: c.subfuncao, Programa: c.programa, Ação: c.acao ?? "", Elemento: c.elemento } as Linha;
      return [
        { id: "execucao", rotulo: "Execução", conteudo: <Funil cor={cor} etapas={[{ rotulo: "Orçamento inicial", valor: v(linha, "valor_orcado") }, { rotulo: "Orçamento atualizado", valor: v(linha, "dotacao_atualizada") }, { rotulo: "Empenhado", valor: v(linha, "valor_empenhado") }, { rotulo: "Liquidado", valor: v(linha, "valor_liquidado") }, { rotulo: "Pago", valor: v(linha, "valor_pago") }]} /> },
        { id: "classificacao", rotulo: "Classificação", conteudo: <Campos linha={l} campos={[["Área"], ["Tipo de despesa"], ["Grupo"], ["Órgão"], ["Unidade"], ["Subfunção"], ["Programa"], ["Ação"], ["Elemento"]]} /> },
      ];
    },
  }),

  pagamentos: base("pagamentos", {
    layout: "lista", situacaoDe: (l) => l["Fase"], rotuloSituacao: "Fase", semDetalhe: false, detalheOpcional: true, campoData: "Data", campoValor: "Valor pago",
    placeholderBusca: "Buscar fornecedor, CNPJ, número…",
    indicadores: (ls) => [
      { rotulo: "Total pago", valor: brl(somar(ls, "Valor pago")), cor: "#16a36a" },
      { rotulo: "Pagamentos", valor: qtd(ls.length) },
      { rotulo: "Fornecedores", valor: qtd(new Set(ls.map((l) => l["CPF/CNPJ"] || l["Fornecedor"])).size) },
      { rotulo: "Retenções", valor: brl(somar(ls, "Retenções")), detalhe: "impostos e consignações retidos" },
    ],
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade>
        <Cartao titulo="Pagamentos mês a mês" descricao="Valor pago em cada mês do exercício" className="lg:col-span-2">
          <MesAMes linhas={linhas} mes={mesDaData("Data")} valor={(l) => v(l, "Valor pago")} cor={cor} />
        </Cartao>
        <Cartao titulo="Quem mais recebeu" descricao="Fornecedores por valor pago">
          <Ranking itens={agrupar(linhas, (l) => l["Fornecedor"], (l) => v(l, "Valor pago"))} cor={cor} rotuloQtd="pagamento" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Quem pagou" descricao="Valor pago por órgão">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Órgão"]), (l) => v(l, "Valor pago"))} cor={cor} rotuloQtd="pagamento" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha }) => (
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-xs text-muted-foreground tabular-nums w-20 shrink-0">{linha["Data"]}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{linha["Fornecedor"]}</p>
          <p className="text-xs text-muted-foreground truncate"><span className="sm:hidden">{linha["Data"]} · </span>{semCodigo(linha["Órgão"])} · Nº {numeroSemAno(linha["Número"])}</p>
        </div>
        {linha["Fase"] && linha["Fase"] !== "Emissão" && <SeloSituacao situacao={linha["Fase"]} />}
        <span className="font-display text-base font-bold text-foreground tabular-nums shrink-0">{linha["Valor pago"]}</span>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <p className="text-sm text-white/85">Pagamento nº {numeroSemAno(linha["Número"])} · {linha["Data"]}</p>
        <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha["Fornecedor"]}</h2>
        <p className="text-sm text-white/85 mt-1">{linha["CPF/CNPJ"]} · {semCodigo(linha["Órgão"])}</p>
        <Valores itens={[{ rotulo: "Valor pago", valor: linha["Valor pago"] }, { rotulo: "Valor total", valor: linha["Valor total"] }, { rotulo: "Retenções", valor: linha["Retenções"] }, { rotulo: "Anulado", valor: linha["Valor anulado"] }]} />
      </>
    ),
    abas: ({ linha, linhas, cor, detalhe }) => {
      const ano = anoDe(linha);
      return [
        { id: "resumo", rotulo: "Pagamento", conteudo: (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              {linha["Empenho"] && <LinkPara href={`/transparencia/empenhos?ano=${ano}&registro=${numeroSemAno(linha["Empenho"])}`} rotulo="Empenho que originou o pagamento" numero={numeroSemAno(linha["Empenho"])} cor={cor} icone={FileText} />}
              {linha["Liquidação"] && <LinkPara href={`/transparencia/liquidacao?ano=${ano}&registro=${numeroSemAno(linha["Liquidação"])}`} rotulo="Liquidação" numero={numeroSemAno(linha["Liquidação"])} cor={cor} icone={Receipt} />}
            </div>
            <Campos linha={linha} campos={[["Fornecedor"], ["CPF/CNPJ"], ["Órgão"], ["Data"], ["Fase"], ["Valor total"], ["Valor pago"], ["Retenções"], ["Valor anulado"]]} />
          </div>
        ) },
        abaAnulacoes(detalhe, [["estornos", "Estorno do pagamento"]], cor),
        { id: "fornecedor", rotulo: "Do mesmo fornecedor", conteudo: <DoMesmo linhas={linhas} atual={linha} chave="CPF/CNPJ" campoValor="Valor pago" campoData="Data" rotulo={(l) => `Nº ${numeroSemAno(l["Número"])} · ${semCodigo(l["Órgão"])}`} cor={cor} descricao="Pagamentos a este fornecedor no exercício" /> },
      ];
    },
  }),

  empenhos: base("empenhos", {
    situacaoDe: (l) => statusEmpenho(v(l, "Empenhado"), v(l, "Liquidado"), v(l, "Pago")), semDetalhe: false, detalheOpcional: true,
    campoData: "Data", campoValor: "Empenhado", placeholderBusca: "Buscar credor, objeto, número…",
    indicadores: (ls) => {
      const emp = somar(ls, "Empenhado"), liq = somar(ls, "Liquidado"), pago = somar(ls, "Pago");
      return [
        { rotulo: "Empenhado", valor: brl(emp), detalhe: `${qtd(ls.length)} empenhos` },
        { rotulo: "Liquidado", valor: brl(liq), detalhe: `${pct(liq, emp).toLocaleString("pt-BR")}% do empenhado` },
        { rotulo: "Pago", valor: brl(pago), detalhe: `${pct(pago, emp).toLocaleString("pt-BR")}% do empenhado`, cor: "#16a36a" },
        { rotulo: "Ainda a pagar", valor: brl(Math.max(0, emp - pago)), detalhe: `${qtd(new Set(ls.map((l) => l["Fornecedor"])).size)} credores no ano` },
      ];
    },
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade colunas={3}>
        <Cartao titulo="Do empenho ao pagamento" descricao="Etapas da despesa no exercício">
          <Funil cor={cor} etapas={[{ rotulo: "Empenhado", valor: somar(linhas, "Empenhado"), nota: "reservado" }, { rotulo: "Liquidado", valor: somar(linhas, "Liquidado"), nota: "entregue" }, { rotulo: "Pago", valor: somar(linhas, "Pago") }]} />
          <div className="mt-6"><MesAMes linhas={linhas} mes={mesDaData("Data")} valor={(l) => v(l, "Empenhado")} cor={cor} /></div>
        </Cartao>
        <Cartao titulo="Por área de governo" descricao="Empenhado por função">
          <Ranking itens={agrupar(linhas, (l) => nomeDaFuncao(l["Função"]), (l) => v(l, "Empenhado"))} cor={cor} rotuloQtd="empenho" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Maiores credores" descricao="Empenhado por fornecedor">
          <Ranking itens={agrupar(linhas, (l) => l["Fornecedor"], (l) => v(l, "Empenhado"))} cor={cor} rotuloQtd="empenho" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha, cor }) => {
      const emp = v(linha, "Empenhado"), liq = v(linha, "Liquidado"), pago = v(linha, "Pago");
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground tabular-nums">Nº {linha["Número"]} <span className="font-normal text-muted-foreground">· {linha["Data"]}</span></span>
            <SeloSituacao situacao={statusEmpenho(emp, liq, pago)} />
          </div>
          <p className="font-display text-base font-bold text-foreground mt-3 leading-snug line-clamp-2">{linha["Fornecedor"]}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-3 flex-1">{linha["Histórico"]}</p>
          <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Empenhado"]}</p>
          <p className="text-[11px] text-muted-foreground">{nomeDaFuncao(linha["Função"])} · {semCodigo(linha["Natureza da despesa"])}</p>
          <Etapas3 emp={emp} liq={liq} pago={pago} cor={cor} />
        </div>
      );
    },
    cabecalho: ({ linha }) => {
      const emp = v(linha, "Empenhado");
      return (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/85">Empenho nº {linha["Número"]} · {linha["Data"]}</span>
            <SeloSituacao situacao={statusEmpenho(emp, v(linha, "Liquidado"), v(linha, "Pago"))} claro />
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha["Fornecedor"]}</h2>
          <p className="text-sm text-white/85 mt-1">{semCodigo(linha["Órgão"])}</p>
          <Valores itens={[{ rotulo: "Empenhado", valor: linha["Empenhado"] }, { rotulo: "Liquidado", valor: linha["Liquidado"] }, { rotulo: "Pago", valor: linha["Pago"] }, { rotulo: "Anulado", valor: linha["Valor anulado do empenho"] || "R$ 0,00" }]} />
        </>
      );
    },
    abas: ({ linha, linhas, cor, detalhe }) => [
      { id: "resumo", rotulo: "Resumo", conteudo: (
        <div className="space-y-5">
          {linha["Histórico"] && <p className="rounded-2xl bg-muted/40 p-4 text-sm text-foreground leading-relaxed">{linha["Histórico"]}</p>}
          <Campos linha={linha} campos={[["Credor", "Fornecedor (CPF/CNPJ)"], ["Órgão"], ["Unidade"], ["Função"], ["Subfunção"], ["Programa"], ["Ação"], ["Natureza da despesa"], ["Fonte de recurso"], ["Classificação orçamentária"]]} />
        </div>
      ) },
      { id: "movimentos", rotulo: "Liquidações e pagamentos", conteudo: <MovimentosDoEmpenho numeroEmpenho={linha["Número"]} ano={anoDe(linha)} cor={cor} /> },
      abaAnulacoes(detalhe, [["anulacoes", "Anulação do empenho"], ["anulacoesDaLiquidacao", "Anulação da liquidação"], ["estornosDeOrdemDePagamento", "Estorno do pagamento"]], cor),
      { id: "credor", rotulo: "Do mesmo credor", conteudo: <DoMesmo linhas={linhas} atual={linha} chave="Fornecedor" campoValor="Empenhado" campoData="Data" rotulo={(l) => `Nº ${l["Número"]} · ${l["Histórico"] ?? ""}`} cor={cor} descricao="Empenhos deste credor no exercício" /> },
    ],
  }),

  liquidacao: base("liquidacao", {
    layout: "lista", situacaoDe: (l) => l["Fase"], rotuloSituacao: "Fase", semDetalhe: false, detalheOpcional: true, campoData: "Data", campoValor: "Valor",
    // A liquidação não informa o órgão: vem do empenho liquidado.
    enriquecer: async (linhas, ano) => {
      const orgaos = new Map((await carregarConjunto("empenhos", ano)).map((e) => [e["Número"], e["Órgão"]]));
      return linhas.map((l) => ({ ...l, "Órgão": orgaos.get(numeroSemAno(l["Empenho"])) ?? "" }));
    },
    placeholderBusca: "Buscar fornecedor, CNPJ, número…",
    indicadores: (ls) => {
      const total = somar(ls, "Valor");
      return [
        { rotulo: "Total liquidado", valor: brl(total) },
        { rotulo: "Liquidações", valor: qtd(ls.length) },
        { rotulo: "Fornecedores", valor: qtd(new Set(ls.map((l) => l["CPF/CNPJ"] || l["Fornecedor"])).size) },
        { rotulo: "Valor médio", valor: brl(ls.length ? total / ls.length : 0) },
      ];
    },
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade>
        <Cartao titulo="Liquidações mês a mês" descricao="Bens entregues e serviços prestados, em valor" className="lg:col-span-2">
          <MesAMes linhas={linhas} mes={mesDaData("Data")} valor={(l) => v(l, "Valor")} cor={cor} />
        </Cartao>
        <Cartao titulo="Maiores fornecedores" descricao="Valor liquidado por fornecedor">
          <Ranking itens={agrupar(linhas, (l) => l["Fornecedor"], (l) => v(l, "Valor"))} cor={cor} rotuloQtd="liquidação" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Tipo de gasto" descricao="Pelo grupo da natureza da despesa">
          <Ranking itens={agrupar(linhas, (l) => categoriaEconomica(l["Elemento"]), (l) => v(l, "Valor"))} cor={cor} rotuloQtd="liquidação" />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha }) => (
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-xs text-muted-foreground tabular-nums w-20 shrink-0">{linha["Data"]}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{linha["Fornecedor"]}</p>
          <p className="text-xs text-muted-foreground truncate"><span className="sm:hidden">{linha["Data"]} · </span>Liquidação nº {numeroSemAno(linha["Número"])} · empenho {numeroSemAno(linha["Empenho"])}</p>
        </div>
        {linha["Fase"] && linha["Fase"] !== "Emissão" && <SeloSituacao situacao={linha["Fase"]} />}
        <span className="font-display text-base font-bold text-foreground tabular-nums shrink-0">{linha["Valor"]}</span>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <p className="text-sm text-white/85">Liquidação nº {numeroSemAno(linha["Número"])} · {linha["Data"]}</p>
        <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha["Fornecedor"]}</h2>
        <p className="text-sm text-white/85 mt-1">{linha["CPF/CNPJ"]}</p>
        <Valores itens={[{ rotulo: "Valor liquidado", valor: linha["Valor"] }, { rotulo: "Elemento", valor: linha["Elemento"] }, { rotulo: "Programa", valor: linha["Programa"] }, { rotulo: "Unidade", valor: linha["Unidade"] }]} />
      </>
    ),
    abas: ({ linha, cor, detalhe }) => {
      const ano = anoDe(linha);
      return [
        { id: "resumo", rotulo: "Liquidação", conteudo: (
          <div className="space-y-5">
            {linha["Empenho"] && <LinkPara href={`/transparencia/empenhos?ano=${ano}&registro=${numeroSemAno(linha["Empenho"])}`} rotulo="Empenho liquidado" numero={numeroSemAno(linha["Empenho"])} cor={cor} icone={FileText} />}
            <Campos linha={{ ...linha, "Tipo de gasto": categoriaEconomica(linha["Elemento"]) ?? "" } as Linha} campos={[["Fornecedor"], ["CPF/CNPJ"], ["Órgão"], ["Data"], ["Fase"], ["Valor"], ["Tipo de gasto"], ["Elemento"], ["Programa"], ["Unidade"]]} />
          </div>
        ) },
        abaAnulacoes(detalhe, [["anulacoes", "Anulação da liquidação"]], cor),
        { id: "pagamentos", rotulo: "Pagamentos do empenho", conteudo: <MovimentosDoEmpenho numeroEmpenho={numeroSemAno(linha["Empenho"])} ano={ano} cor={cor} /> },
      ];
    },
  }),

  repasses: base("repasses", {
    situacaoDe: (l) => l["Tipo de repasse"], rotuloSituacao: "Tipo", campoData: "Mês", campoValor: "Acumulado no ano", ordemInicial: "maior", semOrdenacao: true,
    indicadores: (ls) => {
      const unicos = semDuplicar(ls);
      return [
        { rotulo: "Repassado no ano", valor: brl(somar(unicos, "Acumulado no ano")) },
        { rotulo: "Repassado no mês", valor: brl(somar(unicos, "Movimento no mês")), detalhe: ls[0]?.["Mês"] ? MESES[Number(ls[0]["Mês"]) - 1] : undefined },
        { rotulo: "Destinos", valor: qtd(new Set(unicos.map((l) => l["Título"])).size) },
        { rotulo: "Anulações no mês", valor: brl(somar(unicos, "Anulação no mês")) },
      ];
    },
    panorama: ({ linhas, cor }) => (
      <Cartao titulo="Para quem a Câmara repassou" descricao="Acumulado no ano por destino (Câmara, fundos municipais…)">
        <Ranking itens={agrupar(semDuplicar(linhas), destinos(linhas), (l) => v(l, "Acumulado no ano"))} cor={cor} limite={10} rotuloQtd="lançamento" />
        <p className="text-xs text-muted-foreground mt-4">O portal registra cada repasse duas vezes, na saída do Município e na entrada do órgão que recebe. Os totais desta página contam cada repasse uma vez.</p>
      </Cartao>
    ),
    Cartao: ({ linha }) => (
      <div className="flex flex-col h-full">
        <SeloSituacao situacao={linha["Tipo de repasse"]} />
        <p className="font-display text-lg font-bold text-foreground mt-3 leading-snug">{linha["Título"]}</p>
        <p className="text-xs text-muted-foreground mt-0.5 flex-1">{nomeProprio(linha["Órgão"])}</p>
        <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Acumulado no ano"]}</p>
        <p className="text-xs text-muted-foreground">no ano · {linha["Movimento no mês"]} no mês</p>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <SeloSituacao situacao={linha["Tipo de repasse"]} claro />
        <h2 className="font-display text-2xl font-bold leading-tight mt-2">{linha["Título"]}</h2>
        <p className="text-sm text-white/85 mt-1">{linha["Órgão"]}</p>
        <Valores itens={[{ rotulo: "Acumulado no ano", valor: linha["Acumulado no ano"] }, { rotulo: "No mês", valor: linha["Movimento no mês"] }, { rotulo: "Anulado no mês", valor: linha["Anulação no mês"] }, { rotulo: "Mês", valor: MESES[Number(linha["Mês"]) - 1] ?? linha["Mês"] }]} />
      </>
    ),
    abas: ({ linha }) => [{ id: "resumo", rotulo: "Resumo", conteudo: <Campos linha={linha} campos={[["Título"], ["Órgão"], ["Tipo de repasse"], ["Mês"], ["Movimento no mês"], ["Anulação no mês"], ["Acumulado no ano"]]} /> }],
  }),

  "extra-orcamentaria": base("extra-orcamentaria", {
    situacaoDe: (l) => l["Tipo de lançamento"], rotuloSituacao: "Tipo", campoData: "Título", campoValor: "Acumulado no ano", ordemInicial: "maior", semOrdenacao: true,
    placeholderBusca: "Buscar: INSS, IRRF, consignações, caução…",
    indicadores: (ls) => [
      { rotulo: "Líquido no ano", valor: brl(somar(ls, "Acumulado no ano")), detalhe: "movimentado menos anulações" },
      { rotulo: "Movimentado", valor: brl(somar(ls, "Movimento no mês")) },
      { rotulo: "Anulações", valor: brl(somar(ls, "Anulação no mês")) },
      { rotulo: "Lançamentos", valor: qtd(ls.length) },
    ],
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade>
        <Cartao titulo="O que mais movimenta" descricao="Acumulado no ano por tipo (retenções, consignações, cauções…)">
          <Ranking itens={agrupar(linhas, (l) => l["Tipo de lançamento"], (l) => v(l, "Acumulado no ano"))} cor={cor} rotuloQtd="lançamento" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por órgão" descricao="Acumulado no ano">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Órgão"]), (l) => v(l, "Acumulado no ano"))} cor={cor} rotuloQtd="lançamento" />
        </Cartao>
        <p className="lg:col-span-2 text-xs text-muted-foreground">Receitas e despesas extraorçamentárias são valores que passam pelo caixa sem pertencer à prefeitura, como impostos retidos dos fornecedores e descontos em folha repassados a bancos.</p>
      </Grade>
    ),
    Cartao: ({ linha }) => (
      <div className="flex flex-col h-full">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{linha["Tipo de lançamento"]}</p>
        <p className="font-display text-base font-bold text-foreground mt-1 leading-snug">{linha["Título"]}</p>
        <p className="text-xs text-muted-foreground mt-0.5 flex-1">{semCodigo(linha["Órgão"])}</p>
        <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Acumulado no ano"]}</p>
        <p className="text-xs text-muted-foreground">líquido no ano{v(linha, "Anulação no mês") ? ` · ${linha["Anulação no mês"]} anulados` : ""}</p>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <p className="text-sm text-white/85">{linha["Tipo de lançamento"]}</p>
        <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha["Título"]}</h2>
        <p className="text-sm text-white/85 mt-1">{linha["Órgão"]}</p>
        <Valores itens={[{ rotulo: "Líquido no ano", valor: linha["Acumulado no ano"] }, { rotulo: "Movimentado", valor: linha["Movimento no mês"] }, { rotulo: "Anulado", valor: linha["Anulação no mês"] }]} />
      </>
    ),
    abas: ({ linha }) => [{ id: "resumo", rotulo: "Resumo", conteudo: <Campos linha={linha} campos={[["Título"], ["Tipo de lançamento"], ["Órgão"], ["Movimentado", "Movimento no mês"], ["Anulado", "Anulação no mês"], ["Líquido no ano", "Acumulado no ano"]]} /> }],
  }),

  "despesas-fixadas": base("despesas-fixadas", {
    situacaoDe: (l) => nomeDaFuncao(l["Função"]) ?? "", rotuloSituacao: "Área", campoData: "Ação", campoValor: "Dotação inicial", ordemInicial: "maior",
    placeholderBusca: "Buscar: obras, material, órgão…",
    indicadores: (ls) => [
      { rotulo: "Orçamento inicial", valor: brl(somar(ls, "Dotação inicial")), detalhe: "fixado na Lei Orçamentária" },
      { rotulo: "Dotações", valor: qtd(ls.length) },
      { rotulo: "Órgãos", valor: qtd(new Set(ls.map((l) => l["Órgão"])).size) },
      { rotulo: "Investimentos", valor: brl(ls.filter((l) => categoriaEconomica(l["Elemento de despesa"]) === "Investimentos").reduce((s, l) => s + v(l, "Dotação inicial"), 0)), detalhe: "obras e equipamentos" },
    ],
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade colunas={3}>
        <Cartao titulo="Por área de governo" descricao="Orçamento inicial por função">
          <Ranking itens={agrupar(linhas, (l) => nomeDaFuncao(l["Função"]), (l) => v(l, "Dotação inicial"))} cor={cor} rotuloQtd="dotação" />
        </Cartao>
        <Cartao titulo="Por órgão" descricao="Quem recebeu o orçamento">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Órgão"]), (l) => v(l, "Dotação inicial"))} cor={cor} rotuloQtd="dotação" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por grupo de despesa" descricao="Pessoal, custeio, investimentos…">
          <Ranking itens={agrupar(linhas, (l) => categoriaEconomica(l["Elemento de despesa"]), (l) => v(l, "Dotação inicial"))} cor={cor} rotuloQtd="dotação" />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha }) => (
      <div className="flex flex-col h-full">
        <SeloSituacao situacao={nomeDaFuncao(linha["Função"])} />
        <p className="font-display text-base font-bold text-foreground mt-3 leading-snug">{semCodigo(linha["Elemento de despesa"])}</p>
        <p className="text-xs text-muted-foreground mt-0.5 flex-1">{semCodigo(linha["Órgão"])}</p>
        <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Dotação inicial"]}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{linha["Fonte de recurso"]}</p>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <SeloSituacao situacao={nomeDaFuncao(linha["Função"])} claro />
        <h2 className="font-display text-2xl font-bold leading-tight mt-2">{semCodigo(linha["Elemento de despesa"])}</h2>
        <p className="text-sm text-white/85 mt-1">{linha["Órgão"]}</p>
        <Valores itens={[{ rotulo: "Dotação inicial", valor: linha["Dotação inicial"] }, { rotulo: "Grupo", valor: categoriaEconomica(linha["Elemento de despesa"]) ?? "—" }]} />
      </>
    ),
    abas: ({ linha }) => [{ id: "resumo", rotulo: "Resumo", conteudo: <Campos linha={{ ...linha, Área: nomeDaFuncao(linha["Função"]) ?? "" } as Linha} campos={[["Elemento de despesa"], ["Órgão"], ["Área"], ["Subfunção"], ["Programa"], ["Ação"], ["Fonte de recurso"], ["Dotação inicial"]]} /> }],
  }),

  "restos-a-pagar": base("restos-a-pagar", {
    situacaoDe: (l) => (l["Ano do empenho"] ? `Empenhos de ${l["Ano do empenho"]}` : ""), rotuloSituacao: "Origem", campoData: "Ano do empenho", campoValor: "Empenhado",
    indicadores: (ls) => {
      const emp = somar(ls, "Empenhado"), pago = somar(ls, "Pago");
      return [
        { rotulo: "Inscrito em restos a pagar", valor: brl(emp), detalhe: `${qtd(ls.length)} empenhos` },
        { rotulo: "Liquidado", valor: brl(somar(ls, "Liquidado")) },
        { rotulo: "Pago", valor: brl(pago), detalhe: `${pct(pago, emp).toLocaleString("pt-BR")}% do inscrito`, cor: "#16a36a" },
        { rotulo: "Saldo a pagar", valor: brl(Math.max(0, emp - pago)), cor: "#d97706" },
      ];
    },
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade>
        <Cartao titulo="Saldo a pagar por credor" descricao="Dívidas de anos anteriores ainda não quitadas">
          <Ranking itens={agrupar(linhas, (l) => l["Fornecedor"], (l) => Math.max(0, v(l, "Empenhado") - v(l, "Pago")))} cor={cor} rotuloQtd="empenho" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por ano de origem" descricao="Valor inscrito por ano do empenho">
          <Ranking itens={agrupar(linhas, (l) => l["Ano do empenho"], (l) => v(l, "Empenhado"))} cor={cor} rotuloQtd="empenho" />
          <p className="text-xs text-muted-foreground mt-4">Restos a pagar são despesas empenhadas num ano e pagas nos seguintes. Em excesso, comprometem o orçamento dos anos seguintes.</p>
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha, cor }) => (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-foreground tabular-nums">Empenho {numeroSemAno(linha["Empenho"])}/{linha["Ano do empenho"]}</span>
          <SeloSituacao situacao={statusEmpenho(v(linha, "Empenhado"), v(linha, "Liquidado"), v(linha, "Pago"))} />
        </div>
        <p className="font-display text-base font-bold text-foreground mt-3 leading-snug line-clamp-2">{linha["Fornecedor"]}</p>
        <p className="text-xs text-muted-foreground mt-1 flex-1 line-clamp-2">{semCodigo(linha["Rubrica"])}</p>
        <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Empenhado"]}</p>
        <Etapas3 emp={v(linha, "Empenhado")} liq={v(linha, "Liquidado")} pago={v(linha, "Pago")} cor={cor} />
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <p className="text-sm text-white/85">Empenho {numeroSemAno(linha["Empenho"])} de {linha["Ano do empenho"]}</p>
        <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha["Fornecedor"]}</h2>
        <p className="text-sm text-white/85 mt-1">{semCodigo(linha["Órgão"])}</p>
        <Valores itens={[{ rotulo: "Empenhado", valor: linha["Empenhado"] }, { rotulo: "Liquidado", valor: linha["Liquidado"] }, { rotulo: "Pago", valor: linha["Pago"] }, { rotulo: "Saldo", valor: brl(Math.max(0, v(linha, "Empenhado") - v(linha, "Pago"))) }]} />
      </>
    ),
    abas: ({ linha }) => [{ id: "resumo", rotulo: "Resumo", conteudo: <Campos linha={linha} campos={[["Fornecedor"], ["CPF/CNPJ"], ["Empenho"], ["Ano do empenho"], ["Órgão"], ["Rubrica"], ["Fonte de recurso"], ["Empenhado"], ["Liquidado"], ["Pago"]]} /> }],
  }),

  "informacoes-consolidadas": base("informacoes-consolidadas", {
    situacaoDe: (l) => statusEmpenho(v(l, "Empenhado"), v(l, "Liquidado"), v(l, "Pago")), campoData: "Empenho", campoValor: "Empenhado",
    placeholderBusca: "Buscar credor, rubrica, fonte…",
    indicadores: (ls) => {
      const emp = somar(ls, "Empenhado"), pago = somar(ls, "Pago");
      return [
        { rotulo: "Empenhado", valor: brl(emp) },
        { rotulo: "Liquidado", valor: brl(somar(ls, "Liquidado")) },
        { rotulo: "Pago", valor: brl(pago), cor: "#16a36a" },
        { rotulo: "A pagar", valor: brl(Math.max(0, emp - pago)) },
      ];
    },
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade colunas={3}>
        <Cartao titulo="Por órgão" descricao="Empenhado no exercício">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Órgão"]), (l) => v(l, "Empenhado"))} cor={cor} rotuloQtd="empenho" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por rubrica" descricao="O detalhamento do gasto">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Rubrica"]), (l) => v(l, "Empenhado"))} cor={cor} rotuloQtd="empenho" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por fonte de recurso" descricao="De onde sai o dinheiro">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Fonte de recurso"]), (l) => v(l, "Empenhado"))} cor={cor} rotuloQtd="empenho" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha, cor }) => (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-foreground tabular-nums">Empenho {numeroSemAno(linha["Empenho"])}</span>
          <SeloSituacao situacao={statusEmpenho(v(linha, "Empenhado"), v(linha, "Liquidado"), v(linha, "Pago"))} />
        </div>
        <p className="font-display text-base font-bold text-foreground mt-3 leading-snug line-clamp-2">{linha["Fornecedor"]?.replace(/^[\d./-]+\s*-\s*/, "")}</p>
        <p className="text-xs text-muted-foreground mt-1 flex-1 line-clamp-2">{semCodigo(linha["Rubrica"])}</p>
        <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Empenhado"]}</p>
        <Etapas3 emp={v(linha, "Empenhado")} liq={v(linha, "Liquidado")} pago={v(linha, "Pago")} cor={cor} />
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <p className="text-sm text-white/85">Empenho {numeroSemAno(linha["Empenho"])} · {linha["Órgão"]}</p>
        <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha["Fornecedor"]?.replace(/^[\d./-]+\s*-\s*/, "")}</h2>
        <Valores itens={[{ rotulo: "Empenhado", valor: linha["Empenhado"] }, { rotulo: "Liquidado", valor: linha["Liquidado"] }, { rotulo: "Pago", valor: linha["Pago"] }]} />
      </>
    ),
    abas: ({ linha, cor }) => [
      { id: "resumo", rotulo: "Resumo", conteudo: (
        <div className="space-y-5">
          <LinkPara href={`/transparencia/empenhos?ano=${linha["Empenho"]?.slice(0, 4)}&registro=${numeroSemAno(linha["Empenho"])}`} rotulo="Ver o empenho completo" numero={numeroSemAno(linha["Empenho"])} cor={cor} icone={FileText} />
          <Campos linha={linha} campos={[["Fornecedor"], ["Órgão"], ["Rubrica"], ["Fonte de recurso"], ["Empenhado"], ["Liquidado"], ["Pago"]]} />
        </div>
      ) },
    ],
  }),

  "transferencias-recebidas": base("transferencias-recebidas", {
    situacaoDe: (l) => l["Origem"], rotuloSituacao: "Origem", campoData: "Data do repasse", campoValor: "Valor recebido",
    placeholderBusca: "Buscar: PNAE, FUNDEB, saúde, emenda…",
    indicadores: (ls) => [
      { rotulo: "Recebido no ano", valor: brl(somar(ls, "Valor recebido")), cor: "#16a36a" },
      { rotulo: "Da União", valor: brl(ls.filter((l) => /federa|uni[aã]o/i.test(l["Origem"] ?? "")).reduce((s, l) => s + v(l, "Valor recebido"), 0)) },
      { rotulo: "Do Estado", valor: brl(ls.filter((l) => /estad/i.test(l["Origem"] ?? "")).reduce((s, l) => s + v(l, "Valor recebido"), 0)) },
      { rotulo: "Repasses", valor: qtd(ls.length) },
    ],
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade>
        <Cartao titulo="Recebido mês a mês" descricao="Data em que o dinheiro chegou" className="lg:col-span-2">
          <MesAMes linhas={linhas} mes={mesDaData("Data do repasse")} valor={(l) => v(l, "Valor recebido")} cor={cor} />
        </Cartao>
        <Cartao titulo="Por programa" descricao="Fonte do recurso recebido">
          <Ranking itens={agrupar(linhas, (l) => semCodigo(l["Fonte"]), (l) => v(l, "Valor recebido"))} cor={cor} rotuloQtd="repasse" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por origem" descricao="União, Estado e outros">
          <Ranking itens={agrupar(linhas, (l) => l["Origem"], (l) => v(l, "Valor recebido"))} cor={cor} rotuloQtd="repasse" />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha }) => (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-2"><SeloSituacao situacao={linha["Origem"]} /><span className="text-xs text-muted-foreground inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> {linha["Data do repasse"]}</span></div>
        <p className="font-display text-base font-bold text-foreground mt-3 leading-snug line-clamp-2">{semCodigo(linha["Fonte"])}</p>
        <p className="text-xs text-muted-foreground mt-1 flex-1 line-clamp-3">{linha["Objeto"]}</p>
        <p className="font-display text-xl font-bold text-foreground tabular-nums mt-4">{linha["Valor recebido"]}</p>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <SeloSituacao situacao={linha["Origem"]} claro />
        <h2 className="font-display text-2xl font-bold leading-tight mt-2">{linha["Receita"]}</h2>
        <Valores itens={[{ rotulo: "Valor recebido", valor: linha["Valor recebido"] }, { rotulo: "Data", valor: linha["Data do repasse"] }]} />
      </>
    ),
    abas: ({ linha }) => [{ id: "resumo", rotulo: "Resumo", conteudo: <Campos linha={linha} campos={[["Objeto"], ["Receita"], ["Origem"], ["Fonte"], ["Natureza da receita"], ["Data do repasse"], ["Valor recebido"]]} /> }],
  }),

  "transferencias-realizadas": base("transferencias-realizadas", {
    acumulado: true, situacaoDe: (l) => (anoDe(l, "Data do repasse") ? String(anoDe(l, "Data do repasse")) : ""), rotuloSituacao: "Ano",
    campoData: "Data do repasse", campoValor: "Valor concedido",
    indicadores: (ls) => [
      { rotulo: "Total repassado", valor: brl(somar(ls, "Valor concedido")) },
      { rotulo: "Repasses", valor: qtd(ls.length) },
      { rotulo: "Entidades beneficiadas", valor: qtd(new Set(ls.map((l) => l["CPF/CNPJ"] || l["Beneficiário"])).size) },
    ],
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade>
        <Cartao titulo="Entidades que mais receberam" descricao="Associações e instituições apoiadas pelo município">
          <Ranking itens={agrupar(linhas, (l) => l["Beneficiário"], (l) => v(l, "Valor concedido"))} cor={cor} rotuloQtd="repasse" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por ano" descricao="Valor repassado em cada ano">
          <Ranking itens={agrupar(linhas, (l) => String(anoDe(l, "Data do repasse") ?? ""), (l) => v(l, "Valor concedido")).sort((a, b) => b.rotulo.localeCompare(a.rotulo))} cor={cor} rotuloQtd="repasse" />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha }) => (
      <div className="flex flex-col h-full">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> {linha["Data do repasse"]}</span>
        <p className="font-display text-base font-bold text-foreground mt-2 leading-snug flex-1">{linha["Beneficiário"]}</p>
        <p className="text-xs text-muted-foreground">{linha["CPF/CNPJ"]}</p>
        <p className="font-display text-xl font-bold text-foreground tabular-nums mt-3">{linha["Valor concedido"]}</p>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <p className="text-sm text-white/85">Repasse de {linha["Data do repasse"]}</p>
        <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha["Beneficiário"]}</h2>
        <Valores itens={[{ rotulo: "Valor concedido", valor: linha["Valor concedido"] }, { rotulo: "CNPJ", valor: linha["CPF/CNPJ"] }]} />
      </>
    ),
    abas: ({ linha, linhas, cor }) => [
      { id: "historico", rotulo: "Repasses à entidade", conteudo: <DoMesmo linhas={linhas} atual={linha} chave="CPF/CNPJ" campoValor="Valor concedido" campoData="Data do repasse" rotulo={(l) => l["Beneficiário"]} cor={cor} descricao="Todos os repasses a esta entidade" /> },
    ],
  }),

  patrimonio: base("patrimonio", {
    acumulado: true, situacaoDe: (l) => l["Tipo do bem"], rotuloSituacao: "Tipo do bem", campoData: "Aquisição", campoValor: "Valor atual",
    placeholderBusca: "Buscar bem: veículo, computador, tombamento…",
    indicadores: (ls) => {
      const orig = somar(ls, "Valor original"), atual = somar(ls, "Valor atual");
      return [
        { rotulo: "Valor atual dos bens", valor: brl(atual) },
        { rotulo: "Bens cadastrados", valor: qtd(ls.reduce((s, l) => s + (Number(l["Quantidade"]) || 1), 0)), detalhe: `${qtd(ls.length)} registros` },
        { rotulo: "Valor de compra", valor: brl(orig) },
        { rotulo: "Variação desde a compra", valor: `${atual >= orig ? "+" : "−"}${Math.abs(pct(atual - orig, orig)).toLocaleString("pt-BR")}%`, detalhe: "valor atual em relação ao de compra" },
      ];
    },
    panorama: ({ linhas, cor, filtrar }) => (
      <Grade colunas={3}>
        <Cartao titulo="Por categoria" descricao="Valor atual dos bens">
          <Ranking itens={agrupar(linhas, (l) => l["Categoria"], (l) => v(l, "Valor atual"))} cor={cor} rotuloQtd="bem" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Por departamento" descricao="Onde os bens estão">
          <Ranking itens={agrupar(linhas, (l) => l["Departamento"], (l) => v(l, "Valor atual"))} cor={cor} rotuloQtd="bem" aoEscolher={(g) => filtrar(busca(g))} />
        </Cartao>
        <Cartao titulo="Ano de aquisição" descricao="Valor de compra por ano">
          <Ranking itens={agrupar(linhas, (l) => String(data(l["Aquisição"])?.getFullYear() ?? ""), (l) => v(l, "Valor original")).sort((a, b) => b.rotulo.localeCompare(a.rotulo))} cor={cor} rotuloQtd="bem" />
        </Cartao>
      </Grade>
    ),
    Cartao: ({ linha }) => (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-2">
          <SeloSituacao situacao={linha["Tipo do bem"]} />
          <span className="text-[11px] text-muted-foreground tabular-nums">Tomb. {linha["Tombamento"]}</span>
        </div>
        <p className="font-display text-base font-bold text-foreground mt-3 leading-snug line-clamp-3 flex-1">{linha["Descrição"]}</p>
        <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" aria-hidden /> {linha["Departamento"] || linha["Órgão"]}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div><p className="font-display text-lg font-bold text-foreground tabular-nums">{linha["Valor atual"]}</p><p className="text-[11px] text-muted-foreground">valor atual · comprado por {linha["Valor original"]}</p></div>
          <span className="text-[11px] text-muted-foreground">{linha["Aquisição"]}</span>
        </div>
      </div>
    ),
    cabecalho: ({ linha }) => (
      <>
        <div className="flex items-center gap-2"><SeloSituacao situacao={linha["Tipo do bem"]} claro /><span className="text-sm text-white/85">Tombamento {linha["Tombamento"]}</span></div>
        <h2 className="font-display text-2xl font-bold leading-tight mt-2">{linha["Descrição"]}</h2>
        <p className="text-sm text-white/85 mt-1">{linha["Departamento"]} · {linha["Órgão"]}</p>
        <Valores itens={[{ rotulo: "Valor atual", valor: linha["Valor atual"] }, { rotulo: "Valor de compra", valor: linha["Valor original"] }, { rotulo: "Aquisição", valor: linha["Aquisição"] }, { rotulo: "Quantidade", valor: linha["Quantidade"] || "1" }]} />
      </>
    ),
    abas: ({ linha }) => [{ id: "resumo", rotulo: "Resumo", conteudo: <Campos linha={linha} campos={[["Descrição"], ["Tombamento"], ["Tipo do bem"], ["Categoria"], ["Departamento"], ["Órgão"], ["Aquisição"], ["Fornecedor"], ["CPF/CNPJ do fornecedor"], ["Valor original"], ["Valor atual"], ["Quantidade"]]} /> }],
  }),
};

const ReceitasDespesasPage = () => {
  const { pathname } = useLocation();
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";
  const config = CONFIGS[slug];
  if (!config) return <Navigate to="/transparencia/tema/receitas-e-despesas" replace />;
  return <ComprasConsulta key={slug} config={config} />;
};

export default ReceitasDespesasPage;
