import { ContinueNavegando, FaixaDestaques } from "@/components/pagina-ui";
import { Landmark as IconeLei, BookOpen as IconeLivro, Gavel as IconeProjeto } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Gavel, ListOrdered, Users2 } from "lucide-react";
import {
  DocumentLibrary,
  DocumentPageHero,
  type LegalDocument,
} from "@/components/document-library";
import { WPFD_DOWNLOAD, WPFD_PREVIEW, buildGoogleViewer } from "@/lib/legal-documents";
import { useOfficialDocuments } from "@/lib/official-documents";

export const Route = createFileRoute("/atos-legislativos/regimento-interno")({
  head: () => ({
    meta: [
      { title: "Regimento Interno — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Consulte e baixe o Regimento Interno da Câmara Municipal de Cachoeira de Goiás: funcionamento das sessões, comissões, tramitação e ordem dos trabalhos.",
      },
      { property: "og:title", content: "Regimento Interno — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Regras de funcionamento interno do Legislativo municipal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegimentoInternoPage,
});

const FALLBACK_DOCS: LegalDocument[] = [
  {
    title: "Regimento Interno — Câmara Municipal",
    date: "06/10/2023",
    description: "Texto do Regimento Interno em vigor.",
    downloadUrl: WPFD_DOWNLOAD(63, 6812),
    viewerUrl: buildGoogleViewer(WPFD_PREVIEW(63, 6812)),
  },
];

const TOPICS = [
  {
    icon: Gavel,
    title: "Sessões plenárias",
    text: "Tipos de sessão, abertura, ordem do dia, discussão, votação e uso da palavra.",
  },
  {
    icon: Users2,
    title: "Mesa e comissões",
    text: "Composição, eleição, atribuições da Mesa Diretora e das comissões permanentes.",
  },
  {
    icon: ListOrdered,
    title: "Tramitação de matérias",
    text: "Protocolo, pareceres, emendas, prazos, redação final e recursos regimentais.",
  },
];

function RegimentoInternoPage() {
  const { documents } = useOfficialDocuments("regimento-interno", FALLBACK_DOCS);

  return (
    <>
      <DocumentPageHero
        eyebrow="Atos Legislativos"
        title="Regimento Interno"
        description="O Regimento Interno disciplina o funcionamento da Câmara: sessões, comissões, deliberações e a tramitação das proposições legislativas."
      />

      <FaixaDestaques itens={TOPICS.map(({ icon, title, text }) => ({ icone: icon, titulo: title, texto: text }))} />

      <section className="container-page pb-4 pt-12 md:pt-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Documento oficial</h2>
        <p className="mt-2 text-muted-foreground">
          Visualize no portal ou baixe o PDF do Regimento Interno.
        </p>
        <div className="mt-6">
          <DocumentLibrary documents={documents} />
        </div>
      </section>

      <ContinueNavegando itens={[
        { to: "/atos-legislativos/lei-organica-municipal", titulo: "Lei Orgânica", texto: "A norma máxima do município", icone: IconeLei },
        { to: "/atos-legislativos/regimento-interno", titulo: "Regimento Interno", texto: "Como a Câmara funciona", icone: IconeLivro },
        { to: "/projetos", titulo: "Projetos de Lei", texto: "Matérias em tramitação", icone: IconeProjeto },
      ].filter((i) => i.to !== "/atos-legislativos/regimento-interno")} />
    </>
  );
}
