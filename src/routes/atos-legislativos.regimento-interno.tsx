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

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {TOPICS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold md:text-3xl">Documento oficial</h2>
        <p className="mt-2 text-muted-foreground">
          Visualize no portal ou baixe o PDF do Regimento Interno.
        </p>
        <div className="mt-6">
          <DocumentLibrary documents={documents} />
        </div>
      </section>
    </>
  );
}
