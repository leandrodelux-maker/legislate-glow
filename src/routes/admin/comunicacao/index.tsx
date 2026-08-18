import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/comunicacao/")({
  component: AdminNoticias,
});

type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  categoria: string | null;
  autor: string | null;
  publicado: boolean;
  destaque: boolean;
  publicado_em: string | null;
};

function AdminNoticias() {
  return (
    <CrudPage<Noticia>
      title="Notícias"
      description="Publique e gerencie as notícias do site."
      table="noticias"
      orderBy={{ column: "created_at", ascending: false }}
      defaultValues={{ publicado: false, destaque: false }}
      columns={[
        { key: "titulo", label: "Título" },
        { key: "categoria", label: "Categoria" },
        { key: "autor", label: "Autor" },
        {
          key: "publicado",
          label: "Status",
          render: (r) => (
            <Badge variant={r.publicado ? "default" : "secondary"}>
              {r.publicado ? "Publicado" : "Rascunho"}
            </Badge>
          ),
        },
        {
          key: "destaque",
          label: "Destaque",
          render: (r) => (r.destaque ? "⭐" : "—"),
        },
      ]}
      fields={[
        { name: "titulo", label: "Título", required: true },
        { name: "slug", label: "Slug (URL)", required: true, placeholder: "ex: aprovacao-plano-diretor" },
        { name: "categoria", label: "Categoria", placeholder: "Sessão, Audiência, Comissão..." },
        { name: "autor", label: "Autor" },
        { name: "imagem_url", label: "URL da imagem", type: "url" },
        { name: "resumo", label: "Resumo", type: "textarea" },
        { name: "conteudo", label: "Conteúdo completo", type: "textarea", required: true },
        { name: "publicado_em", label: "Data de publicação", type: "datetime-local" },
        { name: "publicado", label: "Publicado", type: "checkbox", placeholder: "Visível no site" },
        { name: "destaque", label: "Destaque", type: "checkbox", placeholder: "Exibir no topo" },
      ]}
    />
  );
}
