import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/projetos/")({
  component: AdminProjetos,
});

type Projeto = {
  id: string;
  numero: string;
  ano: number;
  tipo: string;
  ementa: string;
  autor: string | null;
  autor_id: string | null;
  status: "protocolado" | "comissao" | "plenario" | "aprovado" | "sancionado" | "arquivado" | "rejeitado";
  documento_url: string | null;
  tramitacao: string | null;
  vereadores?: {
    nome: string;
  };
};

function AdminProjetos() {
  return (
    <CrudPage<Projeto>
      title="Projetos"
      description="Gerencie o trâmite de projetos de lei, indicações e outros documentos."
      table="projetos_legislativos"
      orderBy={{ column: "data_apresentacao", ascending: false }}
      defaultValues={{ status: "protocolado", ano: new Date().getFullYear() }}
      columns={[
        {
          key: "numero",
          label: "Identificação",
          render: (r) => `${r.tipo} ${r.numero}/${r.ano}`,
        },
        { key: "ementa", label: "Ementa" },
        { 
          key: "autor", 
          label: "Autor",
          render: (r) => r.vereadores?.nome || r.autor || "Não informado"
        },
        { 
          key: "status", 
          label: "Situação", 
          render: (r) => (
            <Badge variant={
              r.status === 'aprovado' || r.status === 'sancionado' ? 'default' : 
              r.status === 'arquivado' || r.status === 'rejeitado' ? 'destructive' : 
              'secondary'
            }>
              {r.status.toUpperCase()}
            </Badge>
          ) 
        },
      ]}
      fields={[
        { 
          name: "tipo", 
          label: "Tipo de Documento", 
          type: "select",
          options: [
            { label: "Projeto de Lei", value: "Projeto de Lei" },
            { label: "Projeto de Lei Complementar", value: "Projeto de Lei Complementar" },
            { label: "Indicação", value: "Indicação" },
            { label: "Requerimento", value: "Requerimento" },
            { label: "Moção", value: "Moção" },
            { label: "Projeto de Decreto Legislativo", value: "Projeto de Decreto Legislativo" },
            { label: "Emenda", value: "Emenda" },
          ],
          required: true 
        },
        { name: "numero", label: "Número", required: true },
        { name: "ano", label: "Ano", type: "number", required: true },
        { name: "ementa", label: "Ementa / Resumo", type: "textarea", required: true },
        { 
          name: "autor_id", 
          label: "Vereador Autor", 
          type: "select",
          table: "vereadores",
          optionLabel: "nome",
          optionValue: "id"
        },
        { name: "autor", label: "Outro Autor (Externo/Texto)" },
        { 
          name: "status", 
          label: "Etapa do Fluxo", 
          type: "select",
          options: [
            { label: "Protocolado", value: "protocolado" },
            { label: "Em Comissão", value: "comissao" },
            { label: "Em Plenário", value: "plenario" },
            { label: "Aprovado", value: "aprovado" },
            { label: "Sancionado", value: "sancionado" },
            { label: "Arquivado", value: "arquivado" },
            { label: "Rejeitado", value: "rejeitado" },
          ],
          required: true
        },
        { name: "data_apresentacao", label: "Data de Protocolo", type: "date" },
        { name: "documento_url", label: "Arquivo PDF (Documento)", type: "file" },
        { name: "tramitacao", label: "Histórico de Tramitação (Texto)", type: "textarea" },
        { name: "observacoes", label: "Observações Internas", type: "textarea" },
      ]}
    />
  );
}
