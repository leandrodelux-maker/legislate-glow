import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/transparencia/")({
  component: AdminTransparencia,
});

type Doc = {
  id: string;
  titulo: string;
  categoria: string;
  ano: number | null;
  mes: number | null;
  publicado: boolean;
};

function AdminTransparencia() {
  return (
    <CrudPage<Doc>
      title="Transparência"
      description="Documentos publicados no portal da transparência."
      table="transparencia_documentos"
      orderBy={{ column: "created_at", ascending: false }}
      defaultValues={{ publicado: true, ano: new Date().getFullYear() }}
      columns={[
        { key: "titulo", label: "Título" },
        { key: "categoria", label: "Categoria" },
        { key: "ano", label: "Ano" },
        { key: "mes", label: "Mês" },
        {
          key: "publicado",
          label: "Status",
          render: (r) => (
            <Badge variant={r.publicado ? "default" : "secondary"}>
              {r.publicado ? "Publicado" : "Oculto"}
            </Badge>
          ),
        },
      ]}
      fields={[
        { name: "titulo", label: "Título", required: true },
        { name: "categoria", label: "Categoria", required: true, placeholder: "Licitações, Contratos, Despesas..." },
        { name: "descricao", label: "Descrição", type: "textarea" },
        { name: "arquivo_url", label: "URL do arquivo", type: "url" },
        { name: "ano", label: "Ano", type: "number" },
        { name: "mes", label: "Mês (1-12)", type: "number" },
        { name: "publicado", label: "Publicado", type: "checkbox" },
      ]}
    />
  );
}
