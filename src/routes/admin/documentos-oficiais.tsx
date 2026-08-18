import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type ColumnDef, type FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_CATEGORIES } from "@/lib/official-documents";

export const Route = createFileRoute("/admin/documentos-oficiais")({
  component: AdminDocumentosOficiais,
});

type DocRow = {
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
  {
    name: "categoria",
    label: "Onde será exibido",
    type: "select",
    required: true,
    options: DOCUMENT_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
  },
  { name: "titulo", label: "Título do documento", required: true },
  { name: "descricao", label: "Descrição", type: "textarea" },
  { name: "data_documento", label: "Data (ex: 06/10/2023)" },
  { name: "download_url", label: "Link do arquivo (PDF)", type: "url", required: true },
  {
    name: "viewer_url",
    label: "Link do visualizador (opcional)",
    type: "url",
    placeholder: "Deixe vazio para gerar automaticamente",
  },
  { name: "ordem", label: "Ordem de exibição", type: "number" },
  { name: "publicado", label: "Publicado", type: "checkbox" },
];

const columns: ColumnDef<DocRow>[] = [
  { key: "titulo", label: "Documento" },
  {
    key: "categoria",
    label: "Página",
    render: (r) => (
      <Badge variant="secondary">
        {DOCUMENT_CATEGORIES.find((c) => c.value === r.categoria)?.label ?? r.categoria}
      </Badge>
    ),
  },
  { key: "data_documento", label: "Data" },
  { key: "ordem", label: "Ordem" },
  {
    key: "publicado",
    label: "Status",
    render: (r) => (
      <Badge variant={r.publicado ? "default" : "outline"}>
        {r.publicado ? "Publicado" : "Rascunho"}
      </Badge>
    ),
  },
];

function AdminDocumentosOficiais() {
  return (
    <CrudPage<DocRow>
      title="Documentos Oficiais"
      description="Carta de Serviços, Lei Orgânica Municipal e Regimento Interno exibidos em Atos Legislativos."
      table="documentos_oficiais"
      columns={columns}
      fields={fields}
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ publicado: true, ordem: 1, categoria: "carta-de-servicos" } as Partial<DocRow>}
    />
  );
}
