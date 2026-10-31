import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, ParametrosRota, useLocation } from "@/lib/roteador-transparencia";

const TransparenciaIndex = lazy(() => import("./TransparenciaIndex"));
const LicitacoesPage = lazy(() => import("./LicitacoesPage"));
const ContratosPage = lazy(() => import("./ContratosPage"));
const DispensasPage = lazy(() => import("./DispensasPage"));
const OrdemFornecimentoPage = lazy(() => import("./OrdemFornecimentoPage"));
const DocumentosPage = lazy(() => import("./DocumentosPage"));
const ObrasPage = lazy(() => import("./ObrasPage"));
const FolhaPage = lazy(() => import("./FolhaPage"));
const DiariasPage = lazy(() => import("./DiariasPage"));
const FiscaisPage = lazy(() => import("./FiscaisPage"));
const RemuneracaoPage = lazy(() => import("./RemuneracaoPage"));
const ServidoresPage = lazy(() => import("./ServidoresPage"));
const ReceitasDespesasPage = lazy(() => import("./ReceitasDespesasPage"));
const RelatorioFiscalPage = lazy(() => import("./RelatorioFiscalPage"));
const LegislacaoFederalPage = lazy(() => import("./LegislacaoFederalPage"));
const EstatisticasEsicPage = lazy(() => import("./EstatisticasEsicPage"));
const AtendimentoPresencialPage = lazy(() => import("./AtendimentoPresencialPage"));
const ProgramasPage = lazy(() => import("./ProgramasPage"));
const ContasPage = lazy(() => import("./ContasPage"));
const EstruturaPage = lazy(() => import("./EstruturaPage"));
const DadosAbertosPage = lazy(() => import("./DadosAbertosPage"));
const PerguntasPage = lazy(() => import("./PerguntasPage"));
const RadarPage = lazy(() => import("./RadarPage"));
const ReferenciasPage = lazy(() => import("./ReferenciasPage"));
const AtriconPage = lazy(() => import("./AtriconPage"));
const AtriconMetodologiaPage = lazy(() => import("./AtriconMetodologiaPage"));
const GovernoDigitalPage = lazy(() => import("./GovernoDigitalPage"));
const TemaPage = lazy(() => import("./TemaPage"));
const ConsultaPage = lazy(() => import("./ConsultaPage"));
const LegislacaoPage = lazy(() => import("./LegislacaoPage"));

// Mesmas rotas do projeto base. e-SIC, Ouvidoria e LGPD ficam nas páginas que o site já tem, ligadas ao painel da Câmara.
const ROTAS: { caminho: string; elemento: ReactNode }[] = [
  { caminho: "/transparencia", elemento: <TransparenciaIndex /> },
  { caminho: "/transparencia/licitacoes", elemento: <LicitacoesPage /> },
  { caminho: "/transparencia/contratos", elemento: <ContratosPage /> },
  { caminho: "/transparencia/convenios", elemento: <Navigate to="/transparencia/consulta/convenios" replace /> },
  { caminho: "/transparencia/dispensas", elemento: <DispensasPage /> },
  { caminho: "/transparencia/ordem-de-fornecimento", elemento: <OrdemFornecimentoPage /> },
  { caminho: "/transparencia/documentos/:slug", elemento: <DocumentosPage /> },
  { caminho: "/transparencia/obras", elemento: <ObrasPage /> },
  { caminho: "/transparencia/folha", elemento: <FolhaPage /> },
  { caminho: "/transparencia/diarias", elemento: <DiariasPage /> },
  { caminho: "/transparencia/fiscais", elemento: <FiscaisPage /> },
  { caminho: "/transparencia/remuneracao", elemento: <RemuneracaoPage /> },
  { caminho: "/transparencia/servidores", elemento: <ServidoresPage /> },
  { caminho: "/transparencia/relatorios-fiscais", elemento: <Navigate to="/transparencia/tema/responsabilidade-fiscal" replace /> },
  { caminho: "/transparencia/receitas", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/despesas", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/pagamentos", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/empenhos", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/liquidacao", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/repasses", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/patrimonio", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/extra-orcamentaria", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/despesas-fixadas", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/restos-a-pagar", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/informacoes-consolidadas", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/transferencias-recebidas", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/transferencias-realizadas", elemento: <ReceitasDespesasPage /> },
  { caminho: "/transparencia/balanco-anual", elemento: <RelatorioFiscalPage /> },
  { caminho: "/transparencia/pcasp", elemento: <RelatorioFiscalPage /> },
  { caminho: "/transparencia/movimentacao-orcamentaria", elemento: <RelatorioFiscalPage /> },
  { caminho: "/transparencia/legislacao-federal", elemento: <LegislacaoFederalPage /> },
  { caminho: "/transparencia/estatisticas-e-sic", elemento: <EstatisticasEsicPage /> },
  { caminho: "/transparencia/sic-presencial", elemento: <AtendimentoPresencialPage tipo="sic" /> },
  { caminho: "/transparencia/atendimento-ouvidoria", elemento: <AtendimentoPresencialPage tipo="ouvidoria" /> },
  { caminho: "/transparencia/rgf", elemento: <RelatorioFiscalPage /> },
  { caminho: "/transparencia/prestacao-contas", elemento: <Navigate to="/transparencia/parecer-previo" replace /> },
  { caminho: "/transparencia/planejamento", elemento: <Navigate to="/transparencia/tema/planejamento" replace /> },
  { caminho: "/transparencia/acoes-projetos", elemento: <ProgramasPage /> },
  { caminho: "/transparencia/parecer-previo", elemento: <ContasPage /> },
  { caminho: "/transparencia/estrutura", elemento: <EstruturaPage /> },
  { caminho: "/transparencia/dados-abertos", elemento: <DadosAbertosPage /> },
  { caminho: "/transparencia/perguntas-frequentes", elemento: <PerguntasPage /> },
  { caminho: "/transparencia/radar", elemento: <RadarPage /> },
  { caminho: "/transparencia/referencias", elemento: <ReferenciasPage /> },
  { caminho: "/transparencia/atricon", elemento: <AtriconPage /> },
  { caminho: "/transparencia/atricon/metodologia", elemento: <AtriconMetodologiaPage /> },
  { caminho: "/transparencia/governo-digital", elemento: <GovernoDigitalPage /> },
  { caminho: "/transparencia/tema/:tema", elemento: <TemaPage /> },
  { caminho: "/transparencia/consulta/:slug", elemento: <ConsultaPage /> },
  { caminho: "/transparencia/legislacao", elemento: <LegislacaoPage /> },
  { caminho: "/transparencia/leis-municipais", elemento: <LegislacaoPage defaultTab="leis" /> },
  { caminho: "/transparencia/decretos", elemento: <LegislacaoPage defaultTab="decretos" /> },
  { caminho: "/transparencia/portarias", elemento: <LegislacaoPage defaultTab="portarias" /> },
];

export function encontrarRota(pathname: string) {
  const partes = pathname.replace(/\/+$/, "").split("/");
  for (const rota of ROTAS) {
    const modelo = rota.caminho.split("/");
    if (modelo.length !== partes.length) continue;
    const parametros: Record<string, string> = {};
    if (modelo.every((m, i) => (m.startsWith(":") ? ((parametros[m.slice(1)] = decodeURIComponent(partes[i])), true) : m === partes[i]))) {
      return { elemento: rota.elemento, parametros };
    }
  }
  return null;
}

export default function PaginaTransparencia() {
  const { pathname } = useLocation();
  const rota = encontrarRota(pathname);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (!rota) return null;
  return (
    <div className="area-transparencia">
      <ParametrosRota.Provider value={rota.parametros}>
        <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" /></div>}>
          {rota.elemento}
        </Suspense>
      </ParametrosRota.Provider>
    </div>
  );
}
