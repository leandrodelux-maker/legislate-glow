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
          Visualize o texto integral no portal ou baixe o arquivo em PDF.
        </p>
        <div className="mt-6">
          <DocumentLibrary documents={documents} />
        </div>
      </section>
    </>
  );
}
