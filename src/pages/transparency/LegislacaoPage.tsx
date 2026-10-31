import { MUNICIPIO } from "@/config/municipio";
import { useInstitutionalData } from "@/hooks/useInstitutionalData";
import { CalendarDays, FileText, ScrollText } from "lucide-react";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import ArquivosLista from "@/components/transparency/compras/ArquivosLista";
import { Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";

// Leis, decretos e portarias do município (cópia "legislacao-municipal", com os arquivos de cada ato).
// /transparencia/leis-municipais, /decretos e /portarias abrem com o tipo já filtrado.
const L = { tipo: "Tipo", numero: "Número", ano: "Ano", documento: "Documento", descricao: "Descrição", publicacao: "Publicação", situacao: "Situação" };

const COR_TIPO: Record<string, string> = { Lei: "bg-sky-600", "Lei Complementar": "bg-indigo-600", Decreto: "bg-amber-600", Portaria: "bg-slate-600", Resolução: "bg-emerald-600" };
const tipoDe = (l: Linha) => l[L.tipo] || "Outros atos";

const RESUMO: CampoResumo[] = [
  ["tipoDoDocumento", "Tipo", L.tipo],
  ["numeroDoDocumento", "Número", L.numero],
  ["ano", "Ano", L.ano],
  ["dataDaPublicacao", "Data de publicação", L.publicacao],
  ["situacao", "Situação", L.situacao],
  ["nomeDoDocumento", "Documento", L.documento, true],
  ["descricao", "Ementa", L.descricao, true],
];

const TIPO_DA_ABA: Record<string, string> = { leis: "Lei", decretos: "Decreto", portarias: "Portaria" };

const NomeMunicipio = () => {
  const { data } = useInstitutionalData();
  return <>{data.municipio || MUNICIPIO.cidade}</>;
};

const configLegislacao = (tipoInicial?: string): ConfigCompras => ({
  slug: "legislacao-municipal",
  acumulado: true,
  periodo: { campo: L.ano, rotulo: "Ano", todos: "Todos os anos" },
  situacaoInicial: tipoInicial,
  situacaoDe: tipoDe, rotuloSituacao: "Tipo",
  semOrdenacao: true,
  campoData: L.publicacao,
  campoValor: L.numero,
  placeholderBusca: "Buscar por número, assunto, nome…",
  indicadores: (linhas) => {
    const conta = (t: string) => linhas.filter((l) => l[L.tipo] === t).length;
    const vigentes = linhas.filter((l) => /vigente/i.test(l[L.situacao] ?? "")).length;
    return [
      { rotulo: "Atos publicados", valor: linhas.length.toLocaleString("pt-BR"), detalhe: `${vigentes.toLocaleString("pt-BR")} vigentes` },
      { rotulo: "Leis", valor: conta("Lei").toLocaleString("pt-BR") },
      { rotulo: "Decretos", valor: conta("Decreto").toLocaleString("pt-BR") },
      { rotulo: "Portarias", valor: conta("Portaria").toLocaleString("pt-BR") },
    ];
  },
  Cartao: ({ linha }) => (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white ${COR_TIPO[linha[L.tipo]] ?? "bg-slate-500"}`}>{tipoDe(linha)}</span>
        <span className="text-xs font-bold text-foreground tabular-nums">nº {linha[L.numero]}{linha[L.ano] ? `/${linha[L.ano]}` : ""}</span>
        <span className="ml-auto"><SeloSituacao situacao={linha[L.situacao]} /></span>
      </div>
      <div className="flex-1"><p className="text-sm text-foreground mt-3 leading-relaxed line-clamp-4">{linha[L.descricao] || linha[L.documento]}</p></div>
      <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> {linha[L.publicacao] || "—"}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-foreground"><FileText className="h-3.5 w-3.5" aria-hidden /> Ler o ato</span>
      </p>
    </div>
  ),
  cabecalho: ({ linha }) => (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85"><ScrollText className="h-4 w-4" aria-hidden /> Município de <NomeMunicipio /></span>
        <SeloSituacao situacao={linha[L.situacao]} claro />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-1">{tipoDe(linha)} nº {linha[L.numero]}{linha[L.ano] ? `/${linha[L.ano]}` : ""}</h2>
      <p className="text-sm text-white/90 mt-2 leading-relaxed italic">{linha[L.descricao]}</p>
      <p className="text-xs text-white/80 mt-2">{[linha[L.documento], linha[L.publicacao] && `publicado em ${linha[L.publicacao]}`].filter(Boolean).join(" · ")}</p>
    </>
  ),
  abas: ({ linha, detalhe, portal }) => {
    const arquivos = detalhe.listas?.arquivos ?? [];
    return [
      { id: "arquivos", rotulo: "Texto do ato", contagem: arquivos.length || undefined, conteudo: arquivos.length
        ? <ArquivosLista arquivos={arquivos} portal={portal} />
        : <p className="text-sm text-muted-foreground">O arquivo deste ato não está anexado no Portal da Transparência.</p> },
      { id: "resumo", rotulo: "Resumo", conteudo: <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} /> },
    ];
  },
});

const CONFIGS: Record<string, ConfigCompras> = {
  todos: configLegislacao(),
  leis: configLegislacao("Lei"),
  decretos: configLegislacao("Decreto"),
  portarias: configLegislacao("Portaria"),
};

const LegislacaoPage = ({ defaultTab }: { defaultTab?: string }) => {
  const chave = defaultTab && TIPO_DA_ABA[defaultTab] ? defaultTab : "todos";
  return <ComprasConsulta key={chave} config={CONFIGS[chave]} />;
};

export default LegislacaoPage;
