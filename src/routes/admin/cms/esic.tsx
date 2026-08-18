import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/esic")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "protocolo", label: "Protocolo" },
      { name: "nome", label: "Nome", required: true },
      { name: "cpf", label: "CPF" },
      { name: "email", label: "E-mail", type: "email", required: true },
      { name: "telefone", label: "Telefone" },
      { name: "pedido", label: "Pedido de Informação", type: "textarea", required: true },
      { name: "prazo_resposta", label: "Prazo de Resposta", type: "date" },
      { name: "status", label: "Status", type: "select", options: [
        { label: "Pendente", value: "pendente" },
        { label: "Em análise", value: "analise" },
        { label: "Respondido", value: "respondido" },
        { label: "Prorrogado", value: "prorrogado" },
        { label: "Negado", value: "negado" },
      ] },
      { name: "resposta", label: "Resposta", type: "textarea" },
    ];
    return (
      <CrudPage<any>
        title="e-SIC — Solicitações de Informação"
        description="Pedidos de acesso à informação (Lei nº 12.527/2011)."
        table="esic_solicitacoes"
        orderBy={{ column: "created_at", ascending: false }}
        defaultValues={{ status: "pendente" }}
        columns={[
          { key: "protocolo", label: "Protocolo", render: (r: any) => <span className="font-mono text-xs">{r.protocolo}</span> },
          { key: "nome", label: "Solicitante" },
          { key: "pedido", label: "Pedido", render: (r: any) => <span className="line-clamp-1 max-w-xs">{r.pedido}</span> },
          { key: "prazo_resposta", label: "Prazo", render: (r: any) => {
            const prazo = new Date(r.prazo_resposta);
            const days = Math.ceil((prazo.getTime() - Date.now()) / (1000*60*60*24));
            return <Badge variant={days < 0 ? "destructive" : days < 5 ? "default" : "outline"}>{days < 0 ? `${Math.abs(days)}d vencido` : `${days}d`}</Badge>;
          } },
          { key: "status", label: "Status", render: (r: any) => <Badge>{r.status}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
