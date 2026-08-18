import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";

export const Route = createFileRoute("/admin/cms/folha")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "servidor", label: "Servidor", required: true },
      { name: "cargo", label: "Cargo", required: true },
      { name: "vinculo", label: "Vínculo", type: "select", options: [
        { label: "Efetivo", value: "Efetivo" },
        { label: "Comissionado", value: "Comissionado" },
        { label: "Temporário", value: "Temporário" },
      ] },
      { name: "mes_referencia", label: "Mês de Referência", type: "date", required: true },
      { name: "remuneracao_bruta", label: "Remuneração Bruta (R$)", type: "number" },
      { name: "descontos", label: "Descontos (R$)", type: "number" },
      { name: "remuneracao_liquida", label: "Remuneração Líquida (R$)", type: "number" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Folha de Pagamento"
        description="Transparência salarial dos servidores."
        table="transparencia_folha"
        orderBy={{ column: "mes_referencia", ascending: false }}
        defaultValues={{ publicado: true }}
        columns={[
          { key: "servidor", label: "Servidor" },
          { key: "cargo", label: "Cargo" },
          { key: "mes_referencia", label: "Mês" },
          { key: "remuneracao_liquida", label: "Líquido", render: (r: any) => r.remuneracao_liquida ? `R$ ${Number(r.remuneracao_liquida).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—" },
        ]}
        fields={fields}
      />
    );
  },
});
