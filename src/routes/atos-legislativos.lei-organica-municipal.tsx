import { ContinueNavegando, FaixaDestaques } from "@/components/pagina-ui";
import { Landmark as IconeLei, BookOpen as IconeLivro, Gavel as IconeProjeto } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Scale, Landmark, BookOpen } from "lucide-react";
import {
  DocumentLibrary,
  DocumentPageHero,
  type LegalDocument,
} from "@/components/document-library";
import { WPFD_DOWNLOAD, WPFD_PREVIEW, buildGoogleViewer } from "@/lib/legal-documents";
import { useOfficialDocuments } from "@/lib/official-documents";

export const Route = createFileRoute("/atos-legislativos/lei-organica-municipal")({
  head: () => ({
    meta: [
      { title: "Lei Orgânica Municipal — Câmara de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Leia e baixe a Lei Orgânica do Município de Cachoeira de Goiás, a norma máxima que organiza os poderes, competências e direitos no âmbito municipal.",
      },
      { property: "og:title", content: "Lei Orgânica Municipal — Câmara de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Norma fundamental do município, disponível para consulta e download.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeiOrganicaPage,
});

const FALLBACK_DOCS: LegalDocument[] = [
  {
    title: "Lei Orgânica do Município de Cachoeira de Goiás",
    date: "06/10/2023",
    description: "Texto consolidado da Lei Orgânica Municipal.",
    downloadUrl: WPFD_DOWNLOAD(68, 6813),
    viewerUrl: buildGoogleViewer(WPFD_PREVIEW(68, 6813)),
  },
];

const TOPICS = [
  {
    icon: Landmark,
    title: "Organização do município",
    text: "Define território, símbolos, competências e a estrutura dos Poderes Legislativo e Executivo.",
  },
  {
    icon: Scale,
    title: "Processo legislativo",
    text: "Estabelece as espécies normativas, quóruns, prazos de votação, vetos e promulgação.",
  },
  {
    icon: BookOpen,
    title: "Direitos e serviços",
    text: "Trata da administração pública, servidores, tributos, orçamento e políticas municipais.",
  },
];

function LeiOrganicaPage() {
  const { documents } = useOfficialDocuments("lei-organica-municipal", FALLBACK_DOCS);

  return (
    <>
      <DocumentPageHero
        eyebrow="Atos Legislativos"
        title="Lei Orgânica Municipal"
        description="A Lei Orgânica é a 'Constituição do município': organiza os Poderes, fixa competências e assegura os direitos do cidadão cachoeirense."
      />

      <FaixaDestaques itens={TOPICS.map(({ icon, title, text }) => ({ icone: icon, titulo: title, texto: text }))} />

      <section className="container-page pb-4 pt-12 md:pt-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Documento oficial</h2>
        <p className="mt-2 text-muted-foreground">
          Visualize o texto integral no portal ou baixe o arquivo em PDF.
        </p>
        <div className="mt-6">
          <DocumentLibrary documents={documents} />
        </div>
      </section>

      <ContinueNavegando itens={[
        { to: "/atos-legislativos/lei-organica-municipal", titulo: "Lei Orgânica", texto: "A norma máxima do município", icone: IconeLei },
        { to: "/atos-legislativos/regimento-interno", titulo: "Regimento Interno", texto: "Como a Câmara funciona", icone: IconeLivro },
        { to: "/projetos", titulo: "Projetos de Lei", texto: "Matérias em tramitação", icone: IconeProjeto },
      ].filter((i) => i.to !== "/atos-legislativos/lei-organica-municipal")} />
    </>
  );
}
