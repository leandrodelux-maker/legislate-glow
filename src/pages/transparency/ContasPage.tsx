import { MUNICIPIO } from "@/config/municipio";
import { Gavel } from "lucide-react";
import { useLocation } from "@/lib/roteador-transparencia";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import ArquivosLista from "@/components/transparency/compras/ArquivosLista";
import { Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";

// Julgamento das contas do município: parecer prévio do Tribunal de Contas (cópia "parecer-previo") e
// julgamento pela Câmara (cópia "julgamento-contas"). O acórdão fica nos arquivos de cada processo.
const L = { exercicio: "Exercício", modalidade: "Modalidade", resultado: "Resultado", registro: "Registro", data: "Data do resultado", processo: "Processo", descricao: "Descrição" };

/** O portal às vezes não preenche o exercício: ele aparece no texto do acórdão ("Período: Janeiro a Dezembro/2018"). */
const exercicio = (l: Linha, texto?: unknown) =>
  l[L.exercicio] || String(texto ?? "").match(/PER[IÍ]ODO:[^\n]*?(\d{4})/i)?.[1] || String(texto ?? "").match(/(?:GEST[ÃA]O|EXERC[IÍ]CIO)\s*\/?\s*(\d{4})/i)?.[1] || "";

const RESUMO: CampoResumo[] = [
  ["exercicio", "Exercício", L.exercicio],
  ["numeroEAnoDoProcesso", "Processo", L.processo],
  ["nomeDaModalidade", "Modalidade", L.modalidade],
  ["descricaoDoStatus", "Resultado", L.resultado],
  ["status", "Resultado"],
  ["dataDoRegistro", "Data do registro", L.registro],
  ["dataDoResultado", "Data do resultado", L.data],
];

const configContas = (slug: "parecer-previo" | "julgamento-contas"): ConfigCompras => {
  const orgao = slug === "parecer-previo" ? `Tribunal de Contas (${MUNICIPIO.tribunal})` : "Câmara Municipal";
  return {
    slug,
    acumulado: true,
    situacaoDe: (l) => l[L.resultado], rotuloSituacao: "Resultado",
    campoData: L.data,
    campoValor: L.data,
    semOrdenacao: true,
    placeholderBusca: "Buscar processo, exercício, resultado…",
    indicadores: () => [],
    Cartao: ({ linha, cor }) => (
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}><Gavel className="h-5 w-5" aria-hidden /></span>
          <SeloSituacao situacao={linha[L.resultado]} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-3">{linha[L.processo] ? `Processo ${linha[L.processo]}` : orgao}</p>
        <div className="flex-1"><p className="font-display text-lg font-bold text-foreground leading-snug">{exercicio(linha) ? `Contas de ${exercicio(linha)}` : linha[L.modalidade] || "Prestação de contas"}</p></div>
        <p className="text-xs text-muted-foreground mt-3">Resultado em {linha[L.data] || "—"} · toque para ver a decisão e o acórdão</p>
      </div>
    ),
    cabecalho: ({ linha, detalhe }) => {
      const d = detalhe ?? {};
      const ano = exercicio(linha, d.descricaoDoProcesso);
      return (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white/85">{orgao}</span>
            <SeloSituacao situacao={linha[L.resultado]} claro />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-1">{ano ? `Contas de ${ano}` : "Prestação de contas"}</h2>
          <p className="text-sm text-white/85 mt-1">{[linha[L.modalidade], linha[L.data] && `resultado em ${linha[L.data]}`].filter(Boolean).join(" · ")}</p>
        </>
      );
    },
    abas: ({ linha, detalhe, portal }) => {
      const arquivos = detalhe.listas?.arquivos ?? [];
      return [
        { id: "arquivos", rotulo: slug === "parecer-previo" ? "Acórdão e documentos" : "Documentos", contagem: arquivos.length || undefined,
          conteudo: arquivos.length ? <ArquivosLista arquivos={arquivos} portal={portal} /> : <p className="text-sm text-muted-foreground">Nenhum documento anexado a este processo no portal.</p> },
        ...(detalhe.descricaoDoProcesso ? [{ id: "texto", rotulo: "Decisão", conteudo: <div className="rounded-2xl border border-border/60 p-5 text-sm leading-relaxed whitespace-pre-line text-foreground">{String(detalhe.descricaoDoProcesso)}</div> }] : []),
        { id: "resumo", rotulo: "Resumo", conteudo: <Resumo campos={RESUMO} detalhe={{ ...detalhe, exercicio: exercicio(linha, detalhe.descricaoDoProcesso) || undefined }} linha={linha} /> },
      ];
    },
  };
};

const CONFIGS = { "parecer-previo": configContas("parecer-previo"), "julgamento-contas": configContas("julgamento-contas") };

const ContasPage = () => {
  const { pathname } = useLocation();
  const slug = pathname.endsWith("/julgamento-contas") ? "julgamento-contas" : "parecer-previo";
  return <ComprasConsulta key={slug} config={CONFIGS[slug]} />;
};

export default ContasPage;
