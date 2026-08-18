import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type ColumnDef, type FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/faq")({
  component: AdminFaq,
});

type FaqRow = {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
};

const fields: FieldDef[] = [
  { name: "pergunta", label: "Pergunta", required: true },
  { name: "resposta", label: "Resposta", type: "textarea", required: true },
  { 
    name: "categoria", 
    label: "Categoria", 
    type: "select", 
    options: [
      { label: "Institucional", value: "Institucional" },
      { label: "Sessões", value: "Sessões" },
      { label: "Transparência", value: "Transparência" },
      { label: "e-SIC / LAI", value: "e-SIC / LAI" },
      { label: "LGPD", value: "LGPD" },
      { label: "Ouvidoria", value: "Ouvidoria" },
    ]
  },
  { name: "ordem", label: "Ordem", type: "number" },
  { name: "ativo", label: "Ativo", type: "checkbox" },
];

const columns: ColumnDef<FaqRow>[] = [
  { key: "pergunta", label: "Pergunta" },
  { key: "categoria", label: "Categoria" },
  { key: "ordem", label: "Ordem" },
  {
    key: "ativo",
    label: "Status",
    render: (r) => (
      <Badge variant={r.ativo ? "default" : "outline"}>
        {r.ativo ? "Ativo" : "Inativo"}
      </Badge>
    ),
  },
];

function AdminFaq() {
  return (
    <CrudPage<FaqRow>
      title="Perguntas Frequentes (FAQ)"
      description="Gerencie as perguntas e respostas exibidas na página pública de FAQ."
      table="faq"
      columns={columns}
      fields={fields}
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ ativo: true, ordem: 10, categoria: "Institucional" } as Partial<FaqRow>}
    />
  );
}
