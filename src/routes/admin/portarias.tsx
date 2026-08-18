import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type ColumnDef, type FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/portarias")({
  component: AdminPortarias,
});

type PortariaRow = {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string | null;
  data_documento: string | null;
  download_url: string;
  viewer_url: string | null;
  ordem: number;
  publicado: boolean;
};

const fields: FieldDef[] = [
  { name: "titulo", label: "Título (ex: Portaria nº 001/2025)", required: true },
  { name: "descricao", label: "Ementa / descrição", type: "textarea" },
  { name: "data_documento", label: "Data (ex: 02/01/2025)" },
  { name: "download_url", label: "Link do arquivo (PDF)", type: "url", required: true },
  {
    name: "viewer_url",
    label: "Link do visualizador (opcional)",
    type: "url",
    placeholder: "Deixe vazio para gerar automaticamente",
  },
  { name: "ordem", label: "Ordem de exibição", type: "number" },
  { name: "publicado", label: "Publicado no site", type: "checkbox" },
];

const columns: ColumnDef<PortariaRow>[] = [
  { key: "titulo", label: "Portaria" },
  { key: "data_documento", label: "Data" },
  { key: "ordem", label: "Ordem" },
  {
    key: "publicado",
    label: "Status",
    render: (r) => (
      <Badge variant={r.publicado ? "default" : "outline"}>
        {r.publicado ? "Publicada" : "Rascunho"}
      </Badge>
    ),
  },
];

function AdminPortarias() {
  return (
    <CrudPage<PortariaRow>
      title="Portarias"
      description="Cadastre as portarias da Presidência. Tudo o que estiver marcado como publicado aparece automaticamente em Atos Legislativos → Portarias."
      table="documentos_oficiais"
      filter={{ categoria: "portarias" }}
      columns={columns}
      fields={fields}
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ publicado: true, ordem: 1 } as Partial<PortariaRow>}
    />
  );
}
