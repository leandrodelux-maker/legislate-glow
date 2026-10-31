import { EstadoVazio } from "@/components/pagina-hero";
import { PaginaHero } from "@/components/pagina-hero";
import { Newspaper } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Calendar, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/noticias/$slug")({
  head: () => ({
    meta: [
      { title: "Notícia — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content: "Leia a íntegra da notícia publicada pela Câmara Municipal de Cachoeira de Goiás.",
      },
      { property: "og:title", content: "Notícia — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Notícia institucional da Câmara Municipal de Cachoeira de Goiás.",
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
      <PaginaHero
        icone={Newspaper}
        eyebrow={noticia?.categoria || "Notícia"}
        title={loading ? "Carregando..." : (noticia?.titulo ?? "Notícia não encontrada")}
        ultimo={noticia?.titulo}
      >
          {noticia && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
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
      </PaginaHero>

      <article className="mx-auto max-w-4xl px-5 pb-12 md:px-8">
        {loading ? (
          <div className="mt-8 space-y-3">
            <div className="aspect-[16/9] animate-pulse rounded-3xl bg-muted" />
          </div>
        ) : !noticia ? (
          <div className="mt-10">
            <EstadoVazio icone={Newspaper} titulo="Esta notícia não está disponível" texto="Ela pode ter sido removida ou o endereço está incorreto.">
              <Link to="/noticias" className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Ver todas as notícias</Link>
            </EstadoVazio>
          </div>
        ) : (
          <>
            {noticia.imagem_url && (
              <div className="relative z-10 mt-8 aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl shadow-primary-deep/20">
                <img src={noticia.imagem_url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {noticia.resumo && (
              <p className="mt-8 border-l-4 border-gold pl-5 font-display text-xl font-medium leading-relaxed text-foreground">{noticia.resumo}</p>
            )}
            <div
              className="prose prose-slate mt-8 max-w-none text-[1.05rem] leading-8 prose-headings:font-display prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
            />
            <div className="mt-10 border-t border-border pt-6">
              <Link to="/noticias" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Todas as notícias
              </Link>
            </div>
          </>
        )}
      </article>
    </>
  );
}
