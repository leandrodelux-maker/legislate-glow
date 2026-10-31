import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "@/lib/roteador-transparencia";
import { type Aba, type ConfigCompras } from "@/components/transparency/compras/ComprasConsulta";
import ArquivosLista from "@/components/transparency/compras/ArquivosLista";
import EmpenhosLista from "@/components/transparency/compras/EmpenhosLista";
import TabelaLista, { type ColunaLista } from "@/components/transparency/compras/TabelaLista";
import { Etapas, Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { brl, data, formatar, numero, type Detalhe, type Registro } from "@/components/transparency/compras/formato";

// Rótulos da cópia sincronizada (scripts/sync-transparencia/datasets.mjs → COLUNAS_PROCESSO), comuns a
// licitações, dispensas e atas de adesão: as três usam a mesma tela de detalhe do portal.
const L = { numero: "Número/Ano", modalidade: "Modalidade", situacao: "Situação", publicacao: "Publicação", julgamento: "Julgamento", objeto: "Objeto", estimado: "Valor estimado", vencedor: "Valor vencedor", orgao: "Órgão" };

const RESUMO: CampoResumo[] = [
  ["numeroAno", "Número/Ano", L.numero],
  ["numeroDoProtocolo", "Número do protocolo"],
  ["modalidade", "Modalidade", L.modalidade],
  ["situacao", "Situação", L.situacao],
  ["orgao", "Órgão", L.orgao],
  ["dataDeProtocolo", "Data do protocolo"],
  ["dataDePublicacao", "Data de publicação", L.publicacao],
  ["dataDeAbertura", "Data de abertura"],
  ["dataDeJulgamento", "Data de julgamento", L.julgamento],
  ["dataDeHomologacao", "Data de homologação"],
  ["valorEstimadoTotal", "Valor estimado", L.estimado],
  ["valorVencedorTotal", "Valor total vencedor"],
  ["historico", "Objeto", L.objeto, true],
  ["naturezaDoObjeto", "Finalidade"],
  ["naturezaDoProcedimento", "Natureza do procedimento"],
  ["descricaoDoFundamentoLegalDispensa", "Fundamento legal", undefined, true],
  ["numeroDeEnvioAoPncp", "Número de envio ao PNCP"],
  ["dataDeEnvioAoPncp", "Data de envio ao PNCP"],
  ["urlDoComprovanteDoEnvioAoPncp", "Publicação no PNCP", undefined, true],
];

const col = (...pares: [string, string][]): ColunaLista[] => pares.map(([campo, rotulo]) => ({ campo, rotulo }));
const ITENS_ABERTO = col(["loteEItem", "Lote/Item"], ["produto", "Produto"], ["descricao", "Descrição"], ["unidade", "Unidade"], ["quantidade", "Quantidade"], ["valorEstimado", "Valor estimado"], ["valorEstimadoTotal", "Valor estimado total"]);
const ITENS_VENCEDORES = col(["loteEItem", "Lote/Item"], ["produto", "Produto"], ["descricao", "Descrição"], ["quantidade", "Quantidade"], ["unidade", "Unidade"], ["fornecedor", "Fornecedor vencedor"], ["valorEstimado", "Valor estimado"], ["valorEstimadoTotal", "Valor estimado total"], ["valorUnitario", "Valor unitário"], ["valorTotal", "Valor total"], ["adjudicada", "Adjudicada"]);
const ITENS_FRACASSADOS = col(["loteEItem", "Lote/Item"], ["produto", "Produto"], ["unidade", "Unidade"], ["quantidade", "Quantidade"]);
const CANCELADOS = col(["data", "Data"], ["situacao", "Situação"], ["loteEItem", "Lote/Item"], ["produto", "Produto"], ["quantidade", "Quantidade"], ["unidade", "Unidade"], ["fornecedor", "Fornecedor"], ["valorUnitario", "Valor unitário"], ["valorTotal", "Valor total"]);
const CREDENCIADAS = col(["nomeDoCredenciado", "Nome"], ["cpfOuCnpjDoCredenciado", "CNPJ/CPF"], ["meEppCredenciado", "ME/EPP"]);
const COMISSAO = col(["nome", "Nome"], ["funcao", "Função"], ["decreto", "Decreto/Portaria"], ["dataDoDecreto", "Data da nomeação"]);
const EDITAIS = col(["numeroDoEdital", "Número do edital"], ["dataDePublicacao", "Data de publicação"]);
const ATAS = col(["numero", "Número da ata"], ["ano", "Ano"], ["nomeDoFornecedor", "Fornecedor"], ["inicioDaVigencia", "Início da vigência"], ["fimDaVigencia", "Fim da vigência"], ["valorTotal", "Total da ata"]);

// Orçamento sigiloso (Lei 14.133/21, art. 24): como no portal, o valor estimado só aparece depois do julgamento.
function semEstimadoSigiloso(d: Detalhe, colunas: ColunaLista[]) {
  const julgada = /julgad|homolog/i.test(String(d.situacao ?? ""));
  return d.isOrcamentoSigiloso && !julgada ? colunas.filter((c) => !/^valorEstimado/.test(c.campo)) : colunas;
}

const Explica = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{children}</p>;

// Contratos assinados a partir da licitação: abrem direto no painel da página de Contratos.
const ContratosVinculados = ({ linhas, cor }: { linhas: Registro[]; cor: string }) => (
  <ul className="grid gap-2.5">
    {linhas.map((c, i) => {
      const ano = data(c.data)?.getFullYear();
      const destino = c.codigo != null ? `/transparencia/contratos?registro=${c.codigo}${ano && ano !== new Date().getFullYear() ? `&ano=${ano}` : ""}` : null;
      const conteudo = (
        <>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-foreground">Contrato nº {String(c.numero ?? "—")}</span>
            <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">{[c.nomeDoFornecedor, c.objeto].filter(Boolean).join(" · ")}</span>
            <span className="block text-xs text-muted-foreground mt-1">{[c.data && `de ${formatar("data", c.data)}`, c.vigencia && `até ${formatar("vigencia", c.vigencia)}`].filter(Boolean).join(" ")}</span>
          </span>
          <span className="text-right shrink-0">
            <span className="block text-sm font-bold tabular-nums text-foreground">{c.valor != null ? formatar("valor", c.valor) : ""}</span>
            {destino && <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: cor }}>Abrir <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>}
          </span>
        </>
      );
      return (
        <li key={String(c.codigo ?? i)}>
          {destino ? (
            <Link to={destino} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-4 hover:shadow-lg hover:border-transparent transition">{conteudo}</Link>
          ) : <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-4">{conteudo}</div>}
        </li>
      );
    })}
  </ul>
);

/** Configuração da página de um conjunto de procedimentos; `tipo` nomeia o processo no cartão ("Licitação"). */
export const configProcesso = (slug: string, tipo: string): ConfigCompras => ({
  slug,
  situacaoDe: (l) => l[L.situacao],
  campoData: L.publicacao,
  campoValor: L.estimado,
  placeholderBusca: "Buscar por objeto, número, modalidade…",
  indicadores: (linhas) => {
    const conta = (re: RegExp) => linhas.filter((l) => re.test(l[L.situacao] ?? "")).length;
    const soma = (k: string) => linhas.reduce((s, l) => s + (numero(l[k]) || 0), 0);
    const abertas = conta(/abert|andamento|publicad|aguard/i);
    const vencedor = soma(L.vencedor);
    return [
      { rotulo: "Processos no ano", valor: linhas.length.toLocaleString("pt-BR") },
      { rotulo: "Em andamento", valor: abertas.toLocaleString("pt-BR"), detalhe: abertas ? "recebendo propostas ou em disputa" : undefined },
      { rotulo: "Concluídos", valor: conta(/homolog|adjudic/i).toLocaleString("pt-BR"), detalhe: conta(/desert|fracass/i) ? `${conta(/desert|fracass/i)} deserto(s) ou fracassado(s)` : "homologados ou adjudicados" },
      vencedor > 0
        ? { rotulo: "Valor contratado", valor: brl(vencedor), detalhe: `estimado: ${brl(soma(L.estimado))}` }
        : { rotulo: "Valor estimado", valor: brl(soma(L.estimado)) },
    ];
  },
  Cartao: ({ linha }) => {
    const vencedor = numero(linha[L.vencedor]) > 0;
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">{linha[L.modalidade] || tipo}</span>
          <SeloSituacao situacao={linha[L.situacao]} />
        </div>
        <p className="font-display text-xl font-bold text-foreground mt-2">Nº {linha[L.numero]}</p>
        <div className="flex-1"><p className="text-sm text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">{linha[L.objeto]}</p></div>
        <div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {linha[L.publicacao] || "—"}
          </span>
          <span className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{vencedor ? "Contratado" : "Estimado"}</span>
            <span className="block text-base font-bold text-foreground tabular-nums">{(vencedor ? linha[L.vencedor] : linha[L.estimado]) || "—"}</span>
          </span>
        </div>
      </div>
    );
  },
  cabecalho: ({ linha, detalhe }) => {
    const d = detalhe ?? {};
    const estimado = d.isOrcamentoSigiloso && !/julgad|homolog/i.test(String(d.situacao ?? "")) ? null : d.valorEstimadoTotal ?? linha[L.estimado];
    const vencedor = d.valorVencedorTotal ?? (numero(linha[L.vencedor]) > 0 ? linha[L.vencedor] : undefined);
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white/85">{String(d.modalidade ?? linha[L.modalidade] ?? "")}</span>
          <SeloSituacao situacao={String(d.situacao ?? linha[L.situacao] ?? "")} claro />
        </div>
        <h2 className="font-display text-3xl font-bold mt-1">Nº {String(d.numeroAno ?? linha[L.numero])}</h2>
        <p className="text-sm text-white/90 mt-2 leading-relaxed line-clamp-4">{String(d.historico ?? linha[L.objeto] ?? "")}</p>
        <dl className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-white/75">Valor estimado</dt>
            <dd className="text-lg font-bold tabular-nums">{estimado == null ? "Sigiloso" : formatar("valorEstimadoTotal", estimado)}</dd>
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-white/75">Valor vencedor</dt>
            <dd className="text-lg font-bold tabular-nums">{vencedor != null ? formatar("valorVencedorTotal", vencedor) : "A definir"}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <Etapas claro etapas={[
            { rotulo: "Publicação", data: String(d.dataDePublicacao ?? linha[L.publicacao] ?? "") || null },
            { rotulo: "Abertura", data: d.dataDeAbertura ? String(d.dataDeAbertura) : null },
            { rotulo: "Julgamento", data: String(d.dataDeJulgamento ?? linha[L.julgamento] ?? "") || null },
            { rotulo: "Homologação", data: d.dataDeHomologacao ? String(d.dataDeHomologacao) : null },
          ]} />
        </div>
      </>
    );
  },
  abas: ({ linha, detalhe, cor, portal }) => {
    const ls = detalhe.listas ?? {};
    const n = (k: string) => ls[k]?.length ?? 0;
    const nome = `${slug}-${linha[L.numero]?.replace(/\//g, "-")}`;
    const totalAberto = (ls.itensEmAberto ?? []).reduce((s, i) => s + (numero(i.valorEstimadoTotal) || 0), 0);
    const abas: Aba[] = [
      { id: "resumo", rotulo: "Resumo", conteudo: <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} /> },
      {
        id: "itens-aberto", rotulo: "Itens em aberto", contagem: n("itensEmAberto"),
        conteudo: <>
          <Explica>
            Itens ainda sem vencedor definido. Os valores são a estimativa da Câmara para cada item
            {totalAberto > 0 && semEstimadoSigiloso(detalhe, ITENS_ABERTO).length === ITENS_ABERTO.length && <> — juntos, os <strong className="text-foreground">{n("itensEmAberto")} itens</strong> somam <strong className="text-foreground">{brl(totalAberto)}</strong></>}.
          </Explica>
          <TabelaLista colunas={semEstimadoSigiloso(detalhe, ITENS_ABERTO)} linhas={ls.itensEmAberto ?? []} arquivo={`${nome}-itens-em-aberto`} cor={cor} barra="valorEstimadoTotal" />
        </>,
      },
      {
        id: "itens-licitados", rotulo: "Itens licitados", contagem: n("itensVencedores"),
        conteudo: <>
          <Explica>Itens com fornecedor vencedor e o valor pelo qual cada um foi arrematado.</Explica>
          <TabelaLista colunas={semEstimadoSigiloso(detalhe, ITENS_VENCEDORES)} linhas={ls.itensVencedores ?? []} arquivo={`${nome}-itens-licitados`} cor={cor} barra="valorTotal" />
        </>,
      },
      { id: "arquivos", rotulo: "Arquivos", contagem: n("arquivos"), conteudo: <ArquivosLista arquivos={ls.arquivos ?? []} portal={portal} /> },
      { id: "fracassados", rotulo: "Fracassados ou desertos", contagem: n("itensFracassadosOuDesertos"), conteudo: <TabelaLista colunas={ITENS_FRACASSADOS} linhas={ls.itensFracassadosOuDesertos ?? []} arquivo={`${nome}-itens-fracassados`} cor={cor} /> },
      { id: "contratos", rotulo: "Contratos", contagem: n("contratos"), conteudo: <ContratosVinculados linhas={ls.contratos ?? []} cor={cor} /> },
      { id: "empenhos", rotulo: "Empenhos", contagem: n("empenhos"), conteudo: <EmpenhosLista linhas={ls.empenhos ?? []} cor={cor} portal={portal} /> },
      { id: "editais", rotulo: "Editais", contagem: n("editais"), conteudo: <TabelaLista colunas={EDITAIS} linhas={ls.editais ?? []} arquivo={`${nome}-editais`} cor={cor} /> },
      { id: "atas", rotulo: "Atas de registro de preço", contagem: n("atasDeRegistroDePreco"), conteudo: <TabelaLista colunas={ATAS} linhas={ls.atasDeRegistroDePreco ?? []} arquivo={`${nome}-atas`} cor={cor} /> },
      { id: "credenciadas", rotulo: "Empresas credenciadas", contagem: n("empresasCredenciadas"), conteudo: <TabelaLista colunas={CREDENCIADAS} linhas={ls.empresasCredenciadas ?? []} arquivo={`${nome}-credenciadas`} cor={cor} /> },
      { id: "cancelados", rotulo: "Cancelamentos", contagem: n("itensCanceladosESubstituidos"), conteudo: <TabelaLista colunas={CANCELADOS} linhas={ls.itensCanceladosESubstituidos ?? []} arquivo={`${nome}-cancelamentos`} cor={cor} /> },
      { id: "comissao", rotulo: "Comissão", contagem: n("responsaveisPelaComissao"), conteudo: <TabelaLista colunas={COMISSAO} linhas={ls.responsaveisPelaComissao ?? []} arquivo={`${nome}-comissao`} cor={cor} /> },
    ];
    return abas;
  },
});

