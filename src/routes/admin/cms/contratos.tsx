import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";

export const Route = createFileRoute("/admin/cms/contratos")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "numero", label: "Número do Contrato", required: true },
      { name: "contratado", label: "Contratado", required: true },
      { name: "objeto", label: "Objeto", type: "textarea", required: true },
      { name: "valor", label: "Valor (R$)", type: "number" },
      { name: "data_assinatura", label: "Data de Assinatura", type: "date" },
      { name: "data_vigencia_fim", label: "Vigência Final", type: "date" },
      { name: "documento_url", label: "URL do Documento", type: "url" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Contratos"
        description="Contratos firmados pela Câmara."
        table="transparencia_contratos"
        orderBy={{ column: "data_assinatura", ascending: false }}
        defaultValues={{ publicado: true }}
        columns={[
          { key: "numero", label: "Número" },
          { key: "contratado", label: "Contratado" },
          { key: "objeto", label: "Objeto", render: (r: any) => <span className="line-clamp-1 max-w-xs">{r.objeto}</span> },
          { key: "valor", label: "Valor", render: (r: any) => r.valor ? `R$ ${Number(r.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—" },
          { key: "data_vigencia_fim", label: "Vigência" },
        ]}
        fields={fields}
      />
    );
  },
});
