import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type ColumnDef, type FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/roteiro-sessoes")({
  component: AdminRoteiroSessoes,
});

type RoteiroRow = {
  id: string;
  numero_etapa: string;
  titulo: string;
  descricao: string;
  nota_quorum: string | null;
  icone: string | null;
  ordem: number;
  ativo: boolean;
};

const fields: FieldDef[] = [
  { name: "numero_etapa", label: "Número/Ordem (ex: 1º)", required: true },
  { name: "titulo", label: "Título da Etapa", required: true },
  { name: "descricao", label: "Descrição Detalhada", type: "textarea", required: true },
  { name: "nota_quorum", label: "Nota de Quórum (opcional)", type: "textarea" },
  { name: "icone", label: "Ícone (Lucide)", placeholder: "Gavel, FileText, ListOrdered..." },
  { name: "ordem", label: "Ordem Numérica", type: "number" },
  { name: "ativo", label: "Ativo", type: "checkbox" },
];

const columns: ColumnDef<RoteiroRow>[] = [
  { key: "numero_etapa", label: "Etapa" },
  { key: "titulo", label: "Título" },
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

function AdminRoteiroSessoes() {
  return (
    <CrudPage<RoteiroRow>
      title="Roteiro das Sessões"
      description="Gerencie as etapas que descrevem o funcionamento de uma sessão plenária."
      table="roteiro_sessoes"
      columns={columns}
      fields={fields}
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ ativo: true, ordem: 10 } as Partial<RoteiroRow>}
    />
  );
}
