import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  aberto: "default",
  em_andamento: "secondary",
  respondido: "outline",
  encerrado: "secondary",
};

export const Route = createFileRoute("/admin/cms/ouvidoria")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "protocolo", label: "Protocolo" },
      { name: "nome", label: "Nome", required: true },
      { name: "email", label: "E-mail", type: "email" },
      { name: "telefone", label: "Telefone" },
      { name: "tipo", label: "Tipo", type: "select", options: [
        { label: "Solicitação", value: "solicitacao" },
        { label: "Reclamação", value: "reclamacao" },
        { label: "Elogio", value: "elogio" },
        { label: "Sugestão", value: "sugestao" },
        { label: "Denúncia", value: "denuncia" },
      ] },
      { name: "assunto", label: "Assunto", required: true },
      { name: "mensagem", label: "Mensagem", type: "textarea", required: true },
      { name: "status", label: "Status", type: "select", options: [
        { label: "Aberto", value: "aberto" },
        { label: "Em andamento", value: "em_andamento" },
        { label: "Respondido", value: "respondido" },
        { label: "Encerrado", value: "encerrado" },
      ] },
      { name: "resposta", label: "Resposta", type: "textarea" },
    ];
    return (
      <CrudPage<any>
        title="Ouvidoria"
        description="Protocolos e respostas da ouvidoria."
        table="ouvidoria_protocolos"
        orderBy={{ column: "created_at", ascending: false }}
        defaultValues={{ tipo: "solicitacao", status: "aberto" }}
        columns={[
          { key: "protocolo", label: "Protocolo", render: (r: any) => <span className="font-mono text-xs">{r.protocolo}</span> },
          { key: "nome", label: "Cidadão" },
          { key: "assunto", label: "Assunto", render: (r: any) => <span className="line-clamp-1 max-w-xs">{r.assunto}</span> },
          { key: "tipo", label: "Tipo", render: (r: any) => <Badge variant="outline">{r.tipo}</Badge> },
          { key: "status", label: "Status", render: (r: any) => <Badge variant={statusColor[r.status] || "default"}>{r.status}</Badge> },
        ]}
        fields={fields}
      />
    );
  },
});
