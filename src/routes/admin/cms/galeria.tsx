import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/galeria")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "titulo", label: "Título do Álbum", required: true },
      { name: "descricao", label: "Descrição", type: "textarea" },
      { name: "evento_data", label: "Data do Evento", type: "date" },
      { name: "capa_url", label: "URL da Capa", type: "url" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Galeria"
        description="Álbuns de fotos e vídeos de eventos."
        table="galeria_albuns"
        orderBy={{ column: "evento_data", ascending: false }}
        defaultValues={{ publicado: true }}
        columns={[
          { key: "capa_url", label: "Capa", render: (r: any) => r.capa_url ? <img src={r.capa_url} alt="" className="h-10 w-16 object-cover rounded" /> : "—" },
          { key: "titulo", label: "Título" },
          { key: "evento_data", label: "Evento" },
          { key: "publicado", label: "Status", render: (r: any) => <Badge variant={r.publicado ? "default" : "secondary"}>{r.publicado ? "Publicado" : "Rascunho"}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
