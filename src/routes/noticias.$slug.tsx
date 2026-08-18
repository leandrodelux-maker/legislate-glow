import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Calendar, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/noticias/$slug")({
  head: () => ({
    meta: [
      { title: "Notícia — Câmara Municipal de Adelândia" },
      {
        name: "description",
        content: "Leia a íntegra da notícia publicada pela Câmara Municipal de Adelândia.",
      },
      { property: "og:title", content: "Notícia — Câmara Municipal de Adelândia" },
      {
        property: "og:description",
        content: "Notícia institucional da Câmara Municipal de Adelândia.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NoticiaDetalhe,
});

type Noticia = {
  id: string;
  titulo: string;
  resumo: string | null;
  conteudo: string;
  categoria: string | null;
  autor: string | null;
  imagem_url: string | null;
  publicado_em: string | null;
  created_at: string;
};

function NoticiaDetalhe() {
  const { slug } = Route.useParams();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("noticias")
      .select("id, titulo, resumo, conteudo, categoria, autor, imagem_url, publicado_em, created_at")
      .eq("slug", slug)
      .eq("publicado", true)
      .maybeSingle()
      .then(({ data }) => {
        setNoticia((data as Noticia) ?? null);
        setLoading(false);
      });
  }, [slug]);

  const date = noticia?.publicado_em ?? noticia?.created_at;

  return (
    <>
      <section className="bg-gradient-to-br from-primary-deep to-primary text-primary-foreground">
        <div className="container-page py-8 md:py-10">
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Notícias
          </Link>
          {noticia?.categoria && (
            <div className="mt-4 inline-flex items-center rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
              {noticia.categoria}
            </div>
          )}
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold max-w-4xl">
            {loading ? "Carregando..." : (noticia?.titulo ?? "Notícia não encontrada")}
          </h1>
          {noticia && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
              {date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              {noticia.autor && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {noticia.autor}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <article className="container-page py-12 max-w-4xl">
        {loading ? (
          <p className="text-muted-foreground">Carregando notícia...</p>
        ) : !noticia ? (
          <p className="text-muted-foreground">
            Esta notícia não está disponível.{" "}
            <Link to="/noticias" className="text-primary underline">
              Ver todas as notícias
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary/70">
              {noticia.imagem_url ? (
                <img
                  src={noticia.imagem_url}
                  alt={noticia.titulo}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Building2 className="absolute right-6 bottom-6 h-20 w-20 text-white/15" />
              )}
            </div>
            {noticia.resumo && (
              <p className="mt-8 text-lg text-foreground/80 leading-relaxed">{noticia.resumo}</p>
            )}
            <div
              className="prose prose-slate mt-6 max-w-none prose-headings:font-display prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
            />
          </>
        )}
      </article>
    </>
  );
}
