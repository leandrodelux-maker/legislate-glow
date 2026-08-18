import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/categorias")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "nome", label: "Nome", required: true },
      { name: "slug", label: "Slug", required: true, placeholder: "ex-noticias-locais" },
      { name: "cor", label: "Cor", placeholder: "#3b82f6" },
      { name: "ordem", label: "Ordem", type: "number" },
    ];
    return (
      <CrudPage<any>
        title="Categorias de Notícias"
        description="Organize as notícias por categoria."
        table="noticias_categorias"
        orderBy={{ column: "ordem", ascending: true }}
        defaultValues={{ cor: "#3b82f6", ordem: 0 }}
        columns={[
          { key: "nome", label: "Nome" },
          { key: "slug", label: "Slug" },
          { key: "cor", label: "Cor", render: (r: any) => (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border" style={{ background: r.cor }} />
              <span className="text-xs font-mono">{r.cor}</span>
            </div>
          ) },
          { key: "ordem", label: "Ordem" },
        ]}
        fields={fields}
      />
    );
  },
});
