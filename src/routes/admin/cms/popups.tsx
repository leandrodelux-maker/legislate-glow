import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/popups")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "titulo", label: "Título", required: true },
      { name: "mensagem", label: "Mensagem", type: "textarea" },
      { name: "imagem_url", label: "URL da Imagem", type: "url" },
      { name: "link_url", label: "Link de Destino", type: "url" },
      { name: "tipo", label: "Tipo", type: "select", options: [
        { label: "Aviso", value: "aviso" },
        { label: "Campanha", value: "campanha" },
        { label: "Comunicado", value: "comunicado" },
      ] },
      { name: "inicio_em", label: "Início", type: "datetime-local" },
      { name: "fim_em", label: "Fim", type: "datetime-local" },
      { name: "ativo", label: "Ativo", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Popups"
        description="Avisos, campanhas e comunicados em popup."
        table="popups"
        orderBy={{ column: "created_at", ascending: false }}
        defaultValues={{ tipo: "aviso", ativo: true }}
        columns={[
          { key: "titulo", label: "Título" },
          { key: "tipo", label: "Tipo", render: (r: any) => <Badge variant="outline">{r.tipo}</Badge> },
          { key: "ativo", label: "Status", render: (r: any) => <Badge variant={r.ativo ? "default" : "secondary"}>{r.ativo ? "Ativo" : "Inativo"}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
