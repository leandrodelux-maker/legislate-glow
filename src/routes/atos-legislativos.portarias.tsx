import { ContinueNavegando, FaixaDestaques } from "@/components/pagina-ui";
import { Landmark as IconeLei, BookOpen as IconeLivro, Gavel as IconeProjeto } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { FileSignature, ShieldCheck, Users2 } from "lucide-react";
import {
  DocumentLibrary,
  DocumentPageHero,
} from "@/components/document-library";
import { useOfficialDocuments } from "@/lib/official-documents";
import { PORTARIAS_DOCUMENTS } from "@/lib/portarias";

export const Route = createFileRoute("/atos-legislativos/portarias")({
  head: () => ({
    meta: [
      { title: "Portarias — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Consulte e baixe as portarias da Câmara Municipal de Cachoeira de Goiás: nomeações, comissões, diárias e atos administrativos da Casa.",
      },
      { property: "og:title", content: "Portarias — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Atos administrativos da Câmara: nomeações, comissões e regulamentações internas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortariasPage,
});

const TOPICS = [
  {
    icon: Users2,
    title: "Nomeações e designações",
    text: "Portarias que nomeiam servidores, chefias de departamento e responsáveis técnicos.",
  },
  {
    icon: ShieldCheck,
    title: "Comissões e controle",
    text: "Constituição de comissões de licitação, pregoeiro, equipe de apoio e controle interno.",
  },
  {
    icon: FileSignature,
    title: "Regulamentações internas",
    text: "Normas sobre diárias, gratificações e demais rotinas administrativas da Casa.",
  },
];

function PortariasPage() {
  const { documents } = useOfficialDocuments("portarias", PORTARIAS_DOCUMENTS);

  return (
    <>
      <DocumentPageHero
        eyebrow="Atos Legislativos"
        title="Portarias"
        description="As portarias são os atos administrativos da Presidência da Câmara. Todos os arquivos abaixo estão hospedados neste portal e podem ser visualizados ou baixados livremente."
      />

      <FaixaDestaques itens={TOPICS.map(({ icon, title, text }) => ({ icone: icon, titulo: title, texto: text }))} />

      <section className="container-page pb-4 pt-12 md:pt-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Portarias publicadas</h2>
        <p className="mt-2 text-muted-foreground">
          {documents.length} documento(s) disponível(is) para visualização e download.
        </p>
        <div className="mt-6">
          <DocumentLibrary
            documents={documents}
            emptyLabel="Nenhuma portaria publicada no momento."
          />
        </div>
      </section>

      <ContinueNavegando itens={[
        { to: "/atos-legislativos/lei-organica-municipal", titulo: "Lei Orgânica", texto: "A norma máxima do município", icone: IconeLei },
        { to: "/atos-legislativos/regimento-interno", titulo: "Regimento Interno", texto: "Como a Câmara funciona", icone: IconeLivro },
        { to: "/projetos", titulo: "Projetos de Lei", texto: "Matérias em tramitação", icone: IconeProjeto },
      ].filter((i) => i.to !== "/atos-legislativos/portarias")} />
    </>
  );
}
