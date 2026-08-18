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

        <h2 className="mt-14 font-display text-2xl font-bold md:text-3xl">
          Portarias publicadas
        </h2>
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
    </>
  );
}
