import { ContinueNavegando, FaixaDestaques } from "@/components/pagina-ui";
import { Landmark as IconeLei, BookOpen as IconeLivro, Gavel as IconeProjeto } from "lucide-react";
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

      <FaixaDestaques itens={HIGHLIGHTS.map(({ icon, title, text }) => ({ icone: icon, titulo: title, texto: text }))} />

      <section className="container-page pb-4 pt-12 md:pt-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Documento oficial</h2>
        <p className="mt-2 text-muted-foreground">
          Visualize diretamente no portal ou faça o download em PDF.
        </p>
        <div className="mt-6">
          <DocumentLibrary documents={documents} />
        </div>
      </section>

      <ContinueNavegando itens={[
        { to: "/atos-legislativos/lei-organica-municipal", titulo: "Lei Orgânica", texto: "A norma máxima do município", icone: IconeLei },
        { to: "/atos-legislativos/regimento-interno", titulo: "Regimento Interno", texto: "Como a Câmara funciona", icone: IconeLivro },
        { to: "/projetos", titulo: "Projetos de Lei", texto: "Matérias em tramitação", icone: IconeProjeto },
      ].filter((i) => i.to !== "/atos-legislativos/carta-de-servicos")} />
    </>
  );
}
