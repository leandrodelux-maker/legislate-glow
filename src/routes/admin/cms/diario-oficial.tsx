import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";

export const Route = createFileRoute("/admin/cms/diario-oficial")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "numero_edicao", label: "Número da Edição", required: true, placeholder: "Nº 1.234" },
      { name: "data_publicacao", label: "Data de Publicação", type: "date", required: true },
      { name: "titulo", label: "Título", required: true },
      { name: "resumo", label: "Resumo", type: "textarea" },
      { name: "conteudo", label: "Conteúdo (texto pesquisável)", type: "textarea" },
      { name: "pdf_url", label: "URL do PDF", type: "url" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Diário Oficial"
        description="Edições do Diário Oficial da Câmara."
        table="diario_oficial"
        orderBy={{ column: "data_publicacao", ascending: false }}
        defaultValues={{ publicado: true }}
        columns={[
          { key: "numero_edicao", label: "Edição" },
          { key: "data_publicacao", label: "Data" },
          { key: "titulo", label: "Título", render: (r: any) => <span className="line-clamp-1 max-w-md">{r.titulo}</span> },
        ]}
        fields={fields}
      />
    );
  },
});
