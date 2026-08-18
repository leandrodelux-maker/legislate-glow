import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, type ColumnDef, type FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/acesso-rapido/")({
  component: AdminQuickAccess,
});

type QuickAccessRow = {
  id: string;
  label: string;
  url: string;
  icon: string;
  ordem: number;
  ativo: boolean;
};

const fields: FieldDef[] = [
  { name: "label", label: "Título", required: true },
  { name: "url", label: "URL / Rota", required: true, placeholder: "/pagina ou https://..." },
  { name: "icon", label: "Ícone (Lucide)", placeholder: "Globe, Users, Gavel, Phone..." },
  { name: "ordem", label: "Ordem", type: "number" },
  { name: "ativo", label: "Ativo", type: "checkbox" },
];

const columns: ColumnDef<QuickAccessRow>[] = [
  { key: "label", label: "Título" },
  { key: "url", label: "URL" },
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

function AdminQuickAccess() {
  return (
    <CrudPage<QuickAccessRow>
      title="Acesso Rápido"
      description="Gerencie os atalhos exibidos na página inicial e rodapé do portal."
      table="acesso_rapido"
      columns={columns}
      fields={fields}
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ ativo: true, ordem: 10 } as Partial<QuickAccessRow>}
    />
  );
}
