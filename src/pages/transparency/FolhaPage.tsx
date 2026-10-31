import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import { BarraFolha, COR, F, SeloPagamento, Valores, abasServidor, iniciais, pago } from "@/components/transparency/compras/Folha";
import { brl, numero, rotuloCompetencia } from "@/components/transparency/compras/formato";

// Folha de pagamento mês a mês (cópia "folha"): proventos, descontos e líquido de cada servidor, com as
// cores fixas da folha e o contracheque por rubrica no painel.
const soma = (linhas: Linha[], k: string) => linhas.reduce((s, l) => s + (numero(l[k]) || 0), 0);

const config: ConfigCompras = {
  slug: "folha",
  periodo: { campo: F.competencia, rotulo: "Mês de referência" },
  layout: "lista",
  ordemInicial: "maior",
  rotuloSituacao: "Pagamento", orgaoDe: (l) => l["Departamento"], rotuloOrgao: "Departamento",
  situacaoDe: (l) => (pago(l[F.pagamento]) ? "Pago" : l[F.pagamento] ? "Pagamento pendente" : ""),
  campoData: F.admissao,
  campoValor: F.liquido,
  placeholderBusca: "Buscar por nome, cargo, matrícula, departamento…",
  indicadores: (linhas) => {
    const pagos = linhas.filter((l) => pago(l[F.pagamento])).length;
    return [
      { rotulo: "Total de proventos", valor: brl(soma(linhas, F.proventos)), detalhe: "salários, gratificações e adicionais", cor: COR.proventos },
      { rotulo: "Total de descontos", valor: brl(soma(linhas, F.descontos)), detalhe: "previdência, impostos e consignados", cor: COR.descontos },
      { rotulo: "Total líquido", valor: brl(soma(linhas, F.liquido)), detalhe: "o que os servidores recebem", cor: COR.liquido },
      { rotulo: "Situação do pagamento", valor: `${pagos} de ${linhas.length}`, detalhe: pagos === linhas.length ? "todos os servidores pagos" : `${linhas.length - pagos} com pagamento pendente` },
    ];
  },
  Cartao: ({ linha, cor }) => (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)_auto] lg:items-center">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: cor }}>{iniciais(linha[F.nome])}</span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-foreground truncate">{linha[F.nome]}</span>
          <span className="block text-xs text-muted-foreground truncate">{[linha[F.cargo], linha[F.vinculo], `mat. ${linha[F.matricula]}`].filter(Boolean).join(" · ")}</span>
        </span>
      </div>
      <div>
        <Valores proventos={linha[F.proventos]} descontos={linha[F.descontos]} liquido={linha[F.liquido]} tamanho="sm" />
        <div className="mt-1.5"><BarraFolha proventos={linha[F.proventos]} descontos={linha[F.descontos]} /></div>
      </div>
      <div className="lg:justify-self-end"><SeloPagamento situacao={linha[F.pagamento]} /></div>
    </div>
  ),
  cabecalho: ({ linha }) => (
    <>
      <div className="flex items-center gap-4">
        <span className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-xl font-bold shrink-0 bg-white/15">{iniciais(linha[F.nome])}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/85">Folha de {rotuloCompetencia(linha[F.competencia]).toLowerCase()} · matrícula {linha[F.matricula]}</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{linha[F.nome]}</h2>
          <p className="text-sm text-white/85 mt-0.5">{[linha[F.cargo], linha[F.vinculo], linha[F.departamento]].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-white p-4 text-foreground shadow-lg dark:bg-card">
        <Valores proventos={linha[F.proventos]} descontos={linha[F.descontos]} liquido={linha[F.liquido]} tamanho="lg" />
        <div className="mt-3"><BarraFolha proventos={linha[F.proventos]} descontos={linha[F.descontos]} alto /></div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COR.liquido }} /> líquido</span>
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COR.descontos }} /> descontos</span>
          </span>
          <SeloPagamento situacao={linha[F.pagamento]} />
        </div>
      </div>
    </>
  ),
  abas: ({ linha, detalhe, cor, linhas }) => abasServidor({ linha, detalhe, cor, linhas, foco: "folha" }),
};

const FolhaPage = () => <ComprasConsulta config={config} />;

export default FolhaPage;
