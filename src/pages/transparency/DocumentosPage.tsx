import { FileText } from "lucide-react";
import { Navigate, useParams } from "@/lib/roteador-transparencia";
import ComprasConsulta, { type ConfigCompras } from "@/components/transparency/compras/ComprasConsulta";
import ArquivosLista from "@/components/transparency/compras/ArquivosLista";
import { Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { findItem } from "@/data/transparenciaCatalogo";

// Itens que no portal são listas de documentos publicados (tabela de diárias, terceirizados, estagiários,
// plano de contratação, sancionados): cada documento com seus arquivos para baixar.
const L = { numero: "Número", ano: "Ano", documento: "Documento", descricao: "Descrição", situacao: "Situação", tipo: "Tipo" };
const RESUMO: CampoResumo[] = [
  ["nomeDoDocumento", "Documento", L.documento, true],
  ["numeroDoDecreto", "Número", L.numero],
  ["anoDoDecreto", "Ano", L.ano],
  ["situacao", "Situação", L.situacao],
  ["descricaoDoDocumento", "Descrição", L.descricao, true],
];
const SLUGS_DOCUMENTOS = [
  "tabela-diarias", "terceirizados", "estagiarios", "plano-de-contratacao", "sancionados",
  "planos",
  "outras-publicacoes",
  "atividades-legislativas", "cotas-verba-indenizatoria", "apreciacao-contas-executivo", "votacoes-nominais", "atas-sessoes", "pauta-comissoes", "pauta-plenario", "projetos-leis", "leis-atos-infralegais", "composicao-casa",
  "rol-informacoes", "relatorios-ouvidoria", "pesquisa-satisfacao",
];

// Itens alimentados pelo painel do site: nem todos têm arquivo para baixar.
const SEM_ARQUIVO = ["votacoes-nominais", "pauta-plenario", "composicao-casa"];
const COR_VOTO: Record<string, string> = { sim: "#0B7A4B", nao: "#B42318", abstencao: "#475569" };

const ListaDeNomes = ({ itens, valor }: { itens: Record<string, unknown>[]; valor: (i: Record<string, unknown>) => { texto: string; cor: string } }) => (
  <ul className="grid gap-1.5">
    {itens.map((i) => {
      const v = valor(i);
      return (
        <li key={String(i.nome)} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3.5 py-2.5">
          <span className="text-sm font-semibold text-foreground">{String(i.nome)}</span>
          <span className="text-xs font-bold text-white rounded-full px-2.5 py-1" style={{ backgroundColor: v.cor }}>{v.texto}</span>
        </li>
      );
    })}
  </ul>
);

const configDocumentos = (slug: string): ConfigCompras => ({
  slug,
  acumulado: true,
  // Documentos legais têm situação (vigente, revogado); planos municipais têm tipo (saúde, assistência...).
  situacaoDe: (l) => l[L.situacao] || l[L.tipo], rotuloSituacao: "Classificação",
  campoData: L.ano,
  campoValor: L.ano,
  placeholderBusca: "Buscar documento…",
  semOrdenacao: slug === "composicao-casa",
  indicadores: () => [],
  Cartao: ({ linha, cor }) => {
    if (slug === "composicao-casa") {
      return (
        <div className="flex items-center gap-4 h-full">
          {linha._foto
            ? <img src={linha._foto} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
            : <span className="w-20 h-20 rounded-2xl grid place-items-center text-white font-display text-xl font-bold shrink-0" style={{ backgroundColor: cor }}>{linha[L.documento].split(" ").slice(0, 2).map((p) => p[0]).join("")}</span>}
          <div className="min-w-0">
            <p className="text-xs font-bold" style={{ color: cor }}>{linha[L.tipo]}</p>
            <p className="font-display text-base font-bold text-foreground leading-snug mt-0.5">{linha[L.documento]}</p>
            <p className="text-sm text-muted-foreground mt-1">{linha[L.descricao]}</p>
          </div>
        </div>
      );
    }
    // Tipos longos (ex.: "Rol das Informações Desclassificadas nos Últimos 12 (Doze) Meses") viram uma linha de texto.
    const selo = linha[L.situacao] || linha[L.tipo];
    const longo = (selo?.length ?? 0) > 28;
    return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}><FileText className="h-5 w-5" aria-hidden /></span>
        {!longo && <SeloSituacao situacao={selo} />}
      </div>
      {longo && <p className="text-xs font-semibold mt-3" style={{ color: cor }}>{selo}</p>}
      {linha[L.ano] && <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-3">{[linha[L.numero] && `Nº ${linha[L.numero]}`, linha[L.ano]].filter(Boolean).join(" · ")}</p>}
      <p className="font-display text-base font-bold text-foreground mt-1 leading-snug">{linha[L.documento]}</p>
      <div className="flex-1"><p className="text-sm text-muted-foreground mt-1.5 line-clamp-3">{linha[L.descricao]}</p></div>
      <p className="text-xs font-semibold mt-3" style={{ color: cor }}>{SEM_ARQUIVO.includes(slug) ? "Ver detalhes →" : "Ver e baixar o documento →"}</p>
    </div>
    );
  },
  cabecalho: ({ linha }) => (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-white/85">{[linha[L.numero] && `Nº ${linha[L.numero]}`, linha[L.ano]].filter(Boolean).join(" · ")}</span>
        <SeloSituacao situacao={linha[L.situacao]} claro />
      </div>
      <h2 className="font-display text-2xl font-bold leading-tight mt-1">{linha[L.documento]}</h2>
      {linha[L.descricao] && <p className="text-sm text-white/90 mt-2">{linha[L.descricao]}</p>}
    </>
  ),
  abas: ({ linha, detalhe, portal }) => {
    const listas = (detalhe.listas ?? {}) as Record<string, Record<string, unknown>[]>;
    const extra = detalhe as { texto?: string; link?: { rotulo: string; href: string } };
    const abas = [];
    if (slug === "votacoes-nominais") abas.push({ id: "votos", rotulo: "Votos", contagem: listas.votos?.length || undefined, conteudo: <ListaDeNomes itens={listas.votos ?? []} valor={(i) => ({ texto: String(i.rotulo), cor: COR_VOTO[String(i.voto)] ?? "#475569" })} /> });
    if (extra.texto) abas.push({ id: "texto", rotulo: slug === "projetos-leis" ? "Tramitação" : "Pauta", conteudo: <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{extra.texto}</p> });
    if (!SEM_ARQUIVO.includes(slug)) {
      abas.push({ id: "arquivos", rotulo: "Arquivos", contagem: listas.arquivos?.length || undefined, conteudo: listas.arquivos?.length
        ? <ArquivosLista arquivos={listas.arquivos} portal={portal} />
        : <p className="text-sm text-muted-foreground">Nenhum arquivo anexado a este documento.</p> });
    }
    if (listas.presencas?.length) abas.push({ id: "presenca", rotulo: "Presença", contagem: listas.presencas.length, conteudo: <ListaDeNomes itens={listas.presencas} valor={(i) => (i.presente ? { texto: "Presente", cor: "#0B7A4B" } : { texto: "Ausente", cor: "#B42318" })} /> });
    abas.push({ id: "resumo", rotulo: "Resumo", conteudo: (
      <>
        <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} />
        {extra.link && <a href={extra.link.href} className="inline-block mt-4 text-sm font-semibold underline underline-offset-2 text-foreground">{extra.link.rotulo}</a>}
      </>
    ) });
    return abas;
  },
});

const CONFIGS = Object.fromEntries(SLUGS_DOCUMENTOS.map((s) => [s, configDocumentos(s)]));

const DocumentosPage = () => {
  const { slug = "" } = useParams();
  const config = CONFIGS[slug];
  if (!config || !findItem(slug)) return <Navigate to="/transparencia" replace />;
  return <ComprasConsulta key={slug} config={config} />;
};

export default DocumentosPage;
