import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cms/sessoes-extras")({
  component: () => {
    const fields: FieldDef[] = [
      { name: "titulo", label: "Título", required: true },
      { name: "data_sessao", label: "Data da Sessão", type: "datetime-local", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: [
        { label: "Ordinária", value: "ordinaria" },
        { label: "Extraordinária", value: "extraordinaria" },
        { label: "Solene", value: "solene" },
      ] },
      { name: "video_url", label: "URL do Vídeo (YouTube)", type: "url" },
      { name: "pauta", label: "Pauta", type: "textarea" },
      { name: "ata_url", label: "URL da Ata (PDF)", type: "url" },
      { name: "publicado", label: "Publicado", type: "checkbox" },
    ];
    return (
      <CrudPage<any>
        title="Sessões — Vídeos, Pautas e Atas"
        description="Gestão completa de sessões com vídeos, pautas, atas e presenças."
        table="sessoes"
        orderBy={{ column: "data_sessao", ascending: false }}
        defaultValues={{ tipo: "ordinaria", publicado: true }}
        columns={[
          { key: "titulo", label: "Título" },
          { key: "data_sessao", label: "Data", render: (r: any) => new Date(r.data_sessao).toLocaleDateString("pt-BR") },
          { key: "tipo", label: "Tipo", render: (r: any) => <Badge variant="outline">{r.tipo}</Badge> },
          { key: "video_url", label: "Vídeo", render: (r: any) => r.video_url ? "✓" : "—" },
          { key: "ata_url", label: "Ata", render: (r: any) => r.ata_url ? "✓" : "—" },
        ]}
        fields={fields}
      />
    );
  },
});
