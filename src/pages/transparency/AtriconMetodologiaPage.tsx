import { Link } from "@/lib/roteador-transparencia";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { motion } from "framer-motion";
import {
  BookOpen,
  Database,
  ClipboardCheck,
  Scale,
  Radar,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";
import usePageSEO from "@/hooks/usePageSEO";
import useSchemaMarkup from "@/hooks/useSchemaMarkup";
import { useInstitutionalData } from "@/hooks/useInstitutionalData";

const AtriconMetodologiaPage = () => {
  const { data: inst } = useInstitutionalData();
  const municipio = inst?.municipio
    ? `${inst.municipio}${inst.uf ? " - " + inst.uf : ""}`
    : "";

  usePageSEO({
    title: "Metodologia do Radar ATRICON",
    description: `Entenda a metodologia do Radar da Transparência ATRICON: matriz de avaliação, fonte das informações, critérios de pontuação e como o portal ${municipio ? "de " + municipio + " " : ""}atende à Resolução ATRICON nº 04/2020.`,
    ogType: "article",
  });

  useSchemaMarkup({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Metodologia do Radar da Transparência ATRICON",
    description:
      "Documento explicativo sobre a matriz ATRICON, fontes de dados e critérios de avaliação da transparência pública municipal.",
    inLanguage: "pt-BR",
    about: {
      "@type": "Thing",
      name: "Resolução ATRICON nº 04/2020",
    },
  });

  return (
    <TransparencyLayout
      title="Metodologia do Radar ATRICON"
      description="Como avaliamos, de onde vêm as informações e quais critérios seguimos para garantir transparência pública."
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Transparência", href: "/transparencia" },
        { label: "Radar ATRICON", href: "/transparencia/atricon" },
        { label: "Metodologia" },
      ]}
    >
      <div className="space-y-8">
        {/* Intro */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/20 rounded-2xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                O que é o Radar da Transparência ATRICON?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                O Radar da Transparência é um instrumento nacional da{" "}
                <strong>ATRICON (Associação dos Membros dos Tribunais de Contas do Brasil)</strong>{" "}
                que avalia os portais de transparência de estados e municípios brasileiros com base
                em uma matriz padronizada de critérios. Seu objetivo é medir a qualidade da
                divulgação de informações públicas e induzir melhorias contínuas na transparência
                ativa dos entes federativos.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Base legal */}
        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">Base Legal e Normativa</h2>
          </div>
          <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
            <li className="flex gap-3">
              <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Resolução ATRICON nº 04/2020</strong> — aprova
                as Diretrizes de Controle Externo Atricon 3208/2020 sobre transparência dos entes
                públicos.
              </span>
            </li>
            <li className="flex gap-3">
              <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Lei nº 12.527/2011</strong> — Lei de Acesso à
                Informação (LAI).
              </span>
            </li>
            <li className="flex gap-3">
              <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Lei Complementar nº 101/2000</strong> — Lei de
                Responsabilidade Fiscal (LRF).
              </span>
            </li>
            <li className="flex gap-3">
              <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Lei Complementar nº 131/2009</strong> — Lei da
                Transparência.
              </span>
            </li>
            <li className="flex gap-3">
              <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Lei nº 13.709/2018</strong> — Lei Geral de
                Proteção de Dados (LGPD).
              </span>
            </li>
          </ul>
        </section>

        {/* Matriz */}
        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              A Matriz de Avaliação ATRICON
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
            A matriz é organizada em <strong>dimensões</strong> (blocos temáticos) que agrupam
            critérios objetivos avaliáveis por qualquer cidadão. Cada critério verifica a presença,
            atualização e acessibilidade de uma informação específica no portal.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Receita e Despesa",
              "Licitações, Contratos e Convênios",
              "Obras Públicas",
              "Servidores e Remuneração",
              "Planejamento e Prestação de Contas",
              "Serviço de Informação ao Cidadão (SIC)",
              "Ouvidoria",
              "Acessibilidade e Usabilidade",
              "LGPD e Governo Digital",
              "Saúde e Educação",
            ].map((dim) => (
              <div
                key={dim}
                className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-3 text-sm text-foreground"
              >
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                {dim}
              </div>
            ))}
          </div>
        </section>

        {/* Fonte das informações */}
        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              Fonte das Informações
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            Os dados publicados neste portal são obtidos de forma automatizada e periódica dos
            sistemas oficiais utilizados pela Administração Municipal, bem como de conteúdo
            institucional inserido diretamente pela equipe responsável:
          </p>
          <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Portal Megasoft</strong> — sistema de gestão
                pública que fornece dados de execução orçamentária, despesas, receitas,
                licitações, contratos, convênios, folha de pagamento, patrimônio, obras e demais
                informações financeiras.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">CMS Institucional</strong> — atos oficiais
                (leis, decretos, portarias), notícias, avisos, diário oficial, estrutura
                organizacional e conteúdo das secretarias.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Sistemas de Ouvidoria e e-SIC</strong> —
                registros e estatísticas de manifestações e pedidos de acesso à informação.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
              <span>
                <strong className="text-foreground">Órgãos externos</strong> — TCE/GO, TCU, Portal
                da Transparência Federal e demais fontes oficiais referenciadas.
              </span>
            </li>
          </ul>
        </section>

        {/* Como avaliamos */}
        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              Como os Critérios São Avaliados
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
            Para cada critério, o avaliador (auditor do Tribunal de Contas ou cidadão) verifica se
            a informação está disponível no portal, atualizada e em formato adequado. A pontuação
            é atribuída em três níveis:
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-foreground">Atende</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Informação disponível, atualizada e de fácil acesso pelo cidadão.
              </p>
            </div>
            <div className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-foreground">Atende Parcialmente</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Informação existe, mas está desatualizada, incompleta ou pouco acessível.
              </p>
            </div>
            <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-foreground">Não Atende</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Informação indisponível ou inacessível no portal.
              </p>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-5 leading-relaxed">
            A somatória das pontuações define o <strong>índice de transparência</strong> do
            município, que pode conferir o <em>Selo Diamante</em>, <em>Selo Ouro</em>,{" "}
            <em>Selo Prata</em> ou <em>Selo Bronze</em>, conforme o percentual atingido.
          </p>
        </section>

        {/* Atualização */}
        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Radar className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              Periodicidade de Atualização
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Dados financeiros e orçamentários são atualizados <strong>diariamente</strong> a partir
            do Portal Megasoft. Atos normativos, notícias e o Diário Oficial são publicados{" "}
            <strong>em tempo real</strong> pelo CMS. Relatórios fiscais (RREO, RGF) seguem os
            prazos legais estabelecidos pela LRF (bimestral/quadrimestral).
          </p>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/transparencia/atricon"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Radar className="h-4 w-4" /> Ver Matriz Completa no Portal
          </Link>
          <a
            href="https://radardatransparencia.atricon.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          >
            <ExternalLink className="h-4 w-4" /> Radar Oficial ATRICON
          </a>
        </div>
      </div>
    </TransparencyLayout>
  );
};

export default AtriconMetodologiaPage;
