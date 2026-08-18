import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/banners")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "titulo", label: "Título", required: true },
      { name: "subtitulo", label: "Subtítulo" },
      { name: "imagem_url", label: "URL da Imagem", type: "url", required: true },
      { name: "link_url", label: "Link de Destino", type: "url" },
      { name: "ordem", label: "Ordem", type: "number" },
      { name: "inicio_em", label: "Início (agendamento)", type: "datetime-local" },
      { name: "fim_em", label: "Fim (agendamento)", type: "datetime-local" },
      { name: "ativo", label: "Ativo", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Banners"
        description="Banners do site com upload, agendamento e ordenação."
        table="banners"
        orderBy={{ column: "ordem", ascending: true }}
        defaultValues={{ ativo: true, ordem: 0 }}
        columns={[
          { key: "imagem_url", label: "Imagem", render: (r: any) => <img src={r.imagem_url} alt="" className="h-10 w-20 object-cover rounded" /> },
          { key: "titulo", label: "Título" },
          { key: "ordem", label: "Ordem" },
          { key: "ativo", label: "Status", render: (r: any) => <Badge variant={r.ativo ? "default" : "secondary"}>{r.ativo ? "Ativo" : "Inativo"}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
