import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/paginas")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "titulo", label: "Título", required: true },
      { name: "slug", label: "Slug", required: true, placeholder: "ex-sobre-camara" },
      {
        name: "template", label: "Template", type: "select", required: true,
        options: [
          { label: "Padrão", value: "default" },
          { label: "Página Larga", value: "wide" },
          { label: "Landing", value: "landing" },
          { label: "Documento", value: "document" },
        ],
      },
      { name: "meta_descricao", label: "Meta descrição (SEO)", type: "textarea" },
      { name: "ordem", label: "Ordem", type: "number" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Páginas"
        description="Páginas dinâmicas do site. Use o editor de blocos para montar o conteúdo."
        table="paginas"
        orderBy={{ column: "ordem", ascending: true }}
        defaultValues={{ template: "default", publicado: false, ordem: 0 }}
        columns={[
          { key: "titulo", label: "Título" },
          { key: "slug", label: "Slug" },
          { key: "template", label: "Template", render: (r: any) => <Badge variant="outline">{r.template}</Badge> },
          { key: "publicado", label: "Status", render: (r: any) => <Badge variant={r.publicado ? "default" : "secondary"}>{r.publicado ? "Publicado" : "Rascunho"}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
