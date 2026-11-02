import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Newspaper, Star } from "lucide-react";
import { toast } from "sonner";
import { CrudPage, slugify, type FieldDef } from "@/components/admin/painel/CrudModulo";
import { Selo } from "@/components/admin/painel/PaginaModulo";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/cms/RichTextEditor";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/noticias")({
  component: AdminNoticiasPage,
});

type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string;
  imagem_url: string | null;
  categoria: string | null;
  categoria_id: string | null;
  autor: string | null;
  publicado: boolean;
  destaque: boolean;
  publicado_em: string | null;
  agendado_para: string | null;
  created_at: string;
};
type Categoria = { id: string; nome: string };

const dataBr = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "");

function AdminNoticiasPage() {
  const [cats, setCats] = useState<Categoria[]>([]);

  useEffect(() => {
    supabase.from("noticias_categorias").select("id, nome").order("ordem").then(({ data }) => setCats((data as Categoria[]) ?? []));
  }, []);

  const fields: FieldDef[] = [
    { name: "titulo", label: "Título", required: true, largo: true, placeholder: "Ex.: Câmara aprova o orçamento de 2027", ajuda: "Escreva como uma manchete: curto e direto." },
    { name: "slug", label: "Endereço da página", slugDe: "titulo", largo: true, ajuda: "Criado a partir do título. Só mude se precisar corrigir." },
    { name: "categoria_id", label: "Categoria", type: "select", options: cats.map((c) => ({ label: c.nome, value: c.id })), placeholder: "Sem categoria" },
    { name: "autor", label: "Autor", placeholder: "Assessoria de Comunicação" },
    {
      name: "imagem_url",
      label: "Imagem de capa",
      type: "custom",
      ajuda: "Use uma foto na horizontal. Sem imagem, o site mostra um fundo na cor da Câmara.",
      renderCustom: (_r, form, setForm) => <ImageUploader label="" folder="noticias" height={160} value={form.imagem_url ?? null} onChange={(url) => setForm((f: any) => ({ ...f, imagem_url: url }))} />,
    },
    { name: "resumo", label: "Resumo", type: "textarea", ajuda: "Duas ou três linhas. Aparecem nos cartões de notícia e no início do texto." },
    {
      name: "conteudo",
      label: "Texto da notícia",
      type: "custom",
      required: true,
      renderCustom: (_r, form, setForm) => <RichTextEditor content={form.conteudo ?? ""} onChange={(html: string) => setForm((f: any) => ({ ...f, conteudo: html }))} />,
    },
    { name: "publicado", label: "Publicação", type: "checkbox", placeholder: "Publicar no site", ajuda: "Desligado, a notícia fica como rascunho." },
    { name: "destaque", label: "Destaque", type: "checkbox", placeholder: "Marcar como destaque" },
    { name: "publicado_em", label: "Data de publicação", type: "datetime-local", ajuda: "Vazia, usa o momento em que publicar." },
    { name: "agendado_para", label: "Agendar para", type: "datetime-local", ajuda: "Opcional: registra a data prevista. A publicação continua manual." },
  ];

  const alternarPublicacao = async (r: Noticia, recarregar: () => void) => {
    const publicado = !r.publicado;
    const { error } = await supabase.from("noticias").update({ publicado, publicado_em: publicado ? r.publicado_em ?? new Date().toISOString() : r.publicado_em }).eq("id", r.id);
    if (error) return toast.error(`Não foi possível alterar: ${error.message}`);
    toast.success(publicado ? "Notícia publicada no site." : "Notícia voltou a ser rascunho.");
    recarregar();
  };

  const alternarDestaque = async (r: Noticia, recarregar: () => void) => {
    const { error } = await supabase.from("noticias").update({ destaque: !r.destaque }).eq("id", r.id);
    if (error) return toast.error(`Não foi possível alterar: ${error.message}`);
    recarregar();
  };

  return (
    <CrudPage<Noticia>
      title="Notícias"
      description="Escreva, publique e destaque as notícias da Câmara."
      table="noticias"
      singular="notícia"
      feminino
      orderBy={{ column: "created_at", ascending: false }}
      defaultValues={{ publicado: false, destaque: false }}
      fields={fields}
      instrucoes={{
        intro: "A notícia aparece na página Notícias e, quando publicada, na página inicial.",
        passos: ["Escreva o título e escolha a categoria.", "Envie a imagem de capa e escreva o texto.", "Ligue \"Publicar no site\" quando estiver pronta. Sem isso, ela fica como rascunho."],
      }}
      secoes={[
        { titulo: "Manchete", campos: ["titulo", "slug", "categoria_id", "autor"] },
        { titulo: "Conteúdo", campos: ["imagem_url", "resumo", "conteudo"] },
        { titulo: "Publicação", campos: ["publicado", "destaque", "publicado_em", "agendado_para"] },
      ]}
      transformar={(dados) => {
        const publicado = Boolean(dados.publicado);
        return {
          slug: slugify(String(dados.slug || dados.titulo || "")),
          categoria: cats.find((c) => c.id === dados.categoria_id)?.nome ?? null,
          publicado_em: dados.publicado_em ?? (publicado ? new Date().toISOString() : null),
        };
      }}
      indicadores={(rows) => {
        const publicadas = rows.filter((r) => r.publicado).length;
        return [
          { rotulo: "Total", valor: rows.length },
          { rotulo: "Publicadas", valor: publicadas },
          { rotulo: "Rascunhos", valor: rows.length - publicadas },
          { rotulo: "Em destaque", valor: rows.filter((r) => r.destaque).length },
        ];
      }}
      filtros={[
        { campo: "situacao", rotulo: "Situação", valor: (r) => (r.publicado ? "Publicada" : "Rascunho") },
        { campo: "categoria", rotulo: "Categoria" },
      ]}
      buscaEm={["titulo", "resumo", "autor", "categoria"]}
      nomeDe={(r) => r.titulo}
      vazio="Nenhuma notícia publicada ainda"
      columns={[
        { key: "titulo", label: "Título" },
        { key: "categoria", label: "Categoria" },
        { key: "publicado_em", label: "Publicação", render: (r) => dataBr(r.publicado_em) || "—" },
        { key: "publicado", label: "Situação", render: (r) => <Selo cor={r.publicado ? "#0B7A4B" : undefined}>{r.publicado ? "Publicada" : "Rascunho"}</Selo> },
      ]}
      cartao={{
        titulo: (r) => r.titulo,
        subtitulo: (r) => [r.categoria, dataBr(r.publicado_em ?? r.created_at)].filter(Boolean).join(" · "),
        texto: (r) => r.resumo,
        selo: (r) => <Selo cor={r.publicado ? "#0B7A4B" : undefined}>{r.publicado ? "Publicada" : "Rascunho"}</Selo>,
        imagem: (r) => (r.imagem_url
          ? <img src={r.imagem_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
          : <span className="grid h-16 w-16 place-items-center rounded-xl bg-primary/10 text-primary"><Newspaper className="h-6 w-6" aria-hidden /></span>),
        rodape: (r) => (r.destaque ? "Em destaque" : r.autor),
      }}
      acoesCartao={(r, recarregar) => (
        <>
          <Button type="button" size="icon" variant="ghost" title={r.publicado ? "Voltar para rascunho" : "Publicar"} aria-label={r.publicado ? `Voltar ${r.titulo} para rascunho` : `Publicar ${r.titulo}`} onClick={() => alternarPublicacao(r, recarregar)}>
            {r.publicado ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button type="button" size="icon" variant="ghost" title="Destaque" aria-label={`Alternar destaque de ${r.titulo}`} aria-pressed={r.destaque} onClick={() => alternarDestaque(r, recarregar)}>
            <Star className={`h-4 w-4 ${r.destaque ? "fill-gold text-gold" : ""}`} />
          </Button>
        </>
      )}
      previa={(form) => (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-[16/10] bg-gradient-to-br from-primary-deep to-primary">
            {form.imagem_url && <img src={form.imagem_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{cats.find((c) => c.id === form.categoria_id)?.nome || "Notícia"}</p>
            <p className="mt-1.5 font-display font-semibold leading-snug">{form.titulo || "O título aparece aqui"}</p>
            <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{form.resumo || "O resumo aparece aqui."}</p>
          </div>
        </div>
      )}
    />
  );
}
