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
        title="e-SIC"
        description="Pedidos de informação dos cidadãos (Lei nº 12.527/2011) e o prazo legal de cada resposta."
        indicadores={(rows: any[]) => {
          const abertos = rows.filter((r) => !["respondido", "negado"].includes(r.status));
          return [
            { rotulo: "Aguardando", valor: abertos.length },
            { rotulo: "Prazo vencido", valor: abertos.filter((r) => r.prazo_resposta && new Date(r.prazo_resposta).getTime() < Date.now()).length },
            { rotulo: "Respondidos", valor: rows.filter((r) => r.status === "respondido").length },
            { rotulo: "Total", valor: rows.length },
          ];
        }}
        table="esic_solicitacoes"
        orderBy={{ column: "created_at", ascending: false }}
        defaultValues={{ status: "pendente" }}
        columns={[
          { key: "protocolo", label: "Protocolo", render: (r: any) => <span className="font-mono text-xs">{r.protocolo}</span> },
          { key: "nome", label: "Solicitante" },
          { key: "pedido", label: "Pedido", render: (r: any) => <span className="line-clamp-1 max-w-xs">{r.pedido}</span> },
          { key: "prazo_resposta", label: "Prazo", render: (r: any) => {
            if (!r.prazo_resposta) return "—";
            if (["respondido", "negado"].includes(r.status)) return <Badge variant="outline">Encerrado</Badge>;
            const prazo = new Date(r.prazo_resposta);
            const days = Math.ceil((prazo.getTime() - Date.now()) / (1000*60*60*24));
            return <Badge variant={days < 0 ? "destructive" : days < 5 ? "default" : "outline"}>{days < 0 ? `Vencido há ${Math.abs(days)} dia(s)` : `${days} dia(s)`}</Badge>;
          } },
          { key: "status", label: "Status", render: (r: any) => <Badge variant="secondary">{({ pendente: "Pendente", analise: "Em análise", respondido: "Respondido", prorrogado: "Prorrogado", negado: "Negado" } as Record<string, string>)[r.status] ?? r.status}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
