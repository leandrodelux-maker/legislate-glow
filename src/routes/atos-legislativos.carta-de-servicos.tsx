import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Clock, Users2 } from "lucide-react";
import {
  DocumentLibrary,
  DocumentPageHero,
  type LegalDocument,
} from "@/components/document-library";
import { WPFD_DOWNLOAD, WPFD_PREVIEW, buildGoogleViewer } from "@/lib/legal-documents";
import { useOfficialDocuments } from "@/lib/official-documents";

export const Route = createFileRoute("/atos-legislativos/carta-de-servicos")({
  head: () => ({
    meta: [
      { title: "Carta de Serviços — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Consulte e baixe a Carta de Serviços ao Usuário da Câmara Municipal de Cachoeira de Goiás, com os serviços oferecidos, requisitos e prazos de atendimento.",
      },
      { property: "og:title", content: "Carta de Serviços — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Documento oficial com os serviços prestados pelo Legislativo municipal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartaDeServicosPage,
});

const FALLBACK_DOCS: LegalDocument[] = [
  {
    title: "Carta de Serviços ao Usuário",
    date: "29/12/2022",
    description: "Serviços prestados pela Câmara, formas de acesso, requisitos e prazos.",
    downloadUrl: WPFD_DOWNLOAD(73, 5292),
    viewerUrl: buildGoogleViewer(WPFD_PREVIEW(73, 5292)),
  },
];

const HIGHLIGHTS = [
  {
    icon: ClipboardList,
    title: "Serviços descritos",
    text: "Cada serviço traz finalidade, forma de solicitação e documentos necessários.",
  },
  {
    icon: Clock,
    title: "Prazos e horários",
    text: "Prazos de resposta e horário de atendimento ao cidadão em um só lugar.",
  },
  {
    icon: Users2,
    title: "Canais de atendimento",
    text: "Ouvidoria, e-SIC, telefone, e-mail e atendimento presencial na sede.",
  },
];

function CartaDeServicosPage() {
  const { documents } = useOfficialDocuments("carta-de-servicos", FALLBACK_DOCS);

  return (
    <>
      <DocumentPageHero
        eyebrow="Atos Legislativos"
        title="Carta de Serviços"
        description="Documento que reúne, de forma clara e objetiva, todos os serviços prestados pela Câmara Municipal ao cidadão — conforme a Lei nº 13.460/2017."
      />

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
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
          Visualize diretamente no portal ou faça o download em PDF.
        </p>
        <div className="mt-6">
          <DocumentLibrary documents={documents} />
        </div>
      </section>
    </>
  );
}
