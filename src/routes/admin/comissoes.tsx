import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type ColumnDef, type FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";
import { COMMITTEE_ICON_NAMES } from "@/lib/committee-icons";

export const Route = createFileRoute("/admin/comissoes")({
  component: AdminComissoes,
});

type ComissaoRow = {
  id: string;
  nome: string;
  sigla: string;
  icone: string | null;
  competencia: string | null;
  ordem: number;
  ativo: boolean;
};

const fields: FieldDef[] = [
  { name: "nome", label: "Nome da comissão", required: true },
  { name: "sigla", label: "Sigla", required: true, placeholder: "Ex: CCJR" },
  {
    name: "icone",
    label: "Ícone",
    type: "select",
    options: COMMITTEE_ICON_NAMES.map((n) => ({ label: n, value: n })),
  },
  { name: "competencia", label: "Competência", type: "textarea" },
  { name: "ordem", label: "Ordem de exibição", type: "number" },
  { name: "ativo", label: "Ativa", type: "checkbox" },
];

const columns: ColumnDef<ComissaoRow>[] = [
  { key: "sigla", label: "Sigla" },
  { key: "nome", label: "Comissão" },
  { key: "ordem", label: "Ordem" },
  {
    key: "ativo",
    label: "Status",
    render: (r) => (
      <Badge variant={r.ativo ? "default" : "outline"}>{r.ativo ? "Ativa" : "Inativa"}</Badge>
    ),
  },
];

function AdminComissoes() {
  return (
    <CrudPage<ComissaoRow>
      title="Comissões"
      description="Comissões permanentes exibidas em A Câmara → Comissões."
      table="comissoes"
      columns={columns}
      fields={fields}
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ ativo: true, ordem: 1, icone: "Scale" } as Partial<ComissaoRow>}
    />
  );
}
