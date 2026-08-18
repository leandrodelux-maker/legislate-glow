import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";

export const Route = createFileRoute("/admin/cms/prestacao-contas")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "titulo", label: "Título", required: true },
      { name: "periodo", label: "Período", required: true, placeholder: "1º Trimestre 2026" },
      { name: "exercicio", label: "Exercício (ano)", type: "number" },
      { name: "descricao", label: "Descrição", type: "textarea" },
      { name: "documento_url", label: "URL do Documento", type: "url" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Prestação de Contas"
        description="Documentos de prestação de contas."
        table="transparencia_prestacao_contas"
        orderBy={{ column: "exercicio", ascending: false }}
        defaultValues={{ publicado: true, exercicio: new Date().getFullYear() }}
        columns={[
          { key: "titulo", label: "Título" },
          { key: "periodo", label: "Período" },
          { key: "exercicio", label: "Exercício" },
        ]}
        fields={fields}
      />
    );
  },
});
