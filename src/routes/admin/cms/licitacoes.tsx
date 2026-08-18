import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/licitacoes")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "numero", label: "Número", required: true, placeholder: "001/2026" },
      { name: "modalidade", label: "Modalidade", type: "select", required: true, options: [
        { label: "Pregão Eletrônico", value: "Pregão Eletrônico" },
        { label: "Pregão Presencial", value: "Pregão Presencial" },
        { label: "Concorrência", value: "Concorrência" },
        { label: "Tomada de Preços", value: "Tomada de Preços" },
        { label: "Convite", value: "Convite" },
        { label: "Dispensa", value: "Dispensa" },
        { label: "Inexigibilidade", value: "Inexigibilidade" },
      ] },
      { name: "objeto", label: "Objeto", type: "textarea", required: true },
      { name: "valor_estimado", label: "Valor Estimado (R$)", type: "number" },
      { name: "data_abertura", label: "Data de Abertura", type: "datetime-local" },
      { name: "status", label: "Status", type: "select", options: [
        { label: "Aberta", value: "aberta" },
        { label: "Em andamento", value: "andamento" },
        { label: "Homologada", value: "homologada" },
        { label: "Cancelada", value: "cancelada" },
      ] },
      { name: "edital_url", label: "URL do Edital", type: "url" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Licitações"
        description="Processos licitatórios da Câmara."
        table="transparencia_licitacoes"
        orderBy={{ column: "data_abertura", ascending: false }}
        defaultValues={{ status: "aberta", publicado: true }}
        columns={[
          { key: "numero", label: "Número" },
          { key: "modalidade", label: "Modalidade", render: (r: any) => <Badge variant="outline">{r.modalidade}</Badge> },
          { key: "objeto", label: "Objeto", render: (r: any) => <span className="line-clamp-1 max-w-xs">{r.objeto}</span> },
          { key: "valor_estimado", label: "Valor", render: (r: any) => r.valor_estimado ? `R$ ${Number(r.valor_estimado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—" },
          { key: "status", label: "Status", render: (r: any) => <Badge>{r.status}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
