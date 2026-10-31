import { Newspaper } from "lucide-react";
import { ChipsFiltro } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import { SearchX } from "lucide-react";
import { PaginaHero } from "@/components/pagina-hero";
import { Newspaper as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/noticias/")({
  head: () => ({
    meta: [
      { title: "Notícias — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content: "Cobertura das sessões, audiências públicas e ações do legislativo municipal.",
      },
      { property: "og:title", content: "Notícias — Câmara Municipal de Cachoeira de Goiás" },
      { property: "og:description", content: "Últimas notícias da Câmara Municipal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/noticias" },
    ],
    links: [{ rel: "canonical", href: "/noticias" }],
  }),
  component: NoticiasPage,
});

type DbNoticia = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  categoria: string | null;
  publicado_em: string | null;
  created_at: string;
  imagem_url: string | null;
};

function NoticiasPage() {
  const [noticias, setNoticias] = useState<DbNoticia[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [ativa, setAtiva] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("noticias")
        .select("id, titulo, slug, resumo, categoria, publicado_em, created_at, imagem_url")
        .eq("publicado", true)
        .order("publicado_em", { ascending: false, nullsFirst: false }),
      supabase.from("noticias_categorias").select("nome").order("ordem"),
    ]).then(([{ data }, { data: cats }]) => {
      setNoticias((data as DbNoticia[]) ?? []);
      setCategorias(["Todas", ...((cats ?? []).map((c: any) => c.nome as string))]);
      setLoading(false);
    });
  }, []);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return noticias.filter((n) => {
      if (ativa !== "Todas" && n.categoria !== ativa) return false;
      if (!q) return true;
      return [n.titulo, n.resumo, n.categoria]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [noticias, ativa, busca]);

  return (
    <>
      <PaginaHero
        icone={IconeHero}
        eyebrow="Comunicação Institucional"
        title="Notícias"
        description={<>Acompanhe a cobertura editorial das sessões, audiências públicas e atividades dos parlamentares.</>}
      >
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notícias..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-11 bg-white/95 text-foreground border-white/20"
                aria-label="Buscar notícias"
              />
            </div>
          </div>
      </PaginaHero>

      <section className="container-page py-10 md:py-14">
        {categorias.length > 1 && <ChipsFiltro opcoes={categorias} ativa={ativa} aoEscolher={setAtiva} rotulo="Filtrar por categoria" />}

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />)}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="mt-8"><EstadoVazio icone={SearchX} titulo="Nenhuma notícia encontrada" texto={noticias.length ? "Tente outra palavra ou escolha outra categoria." : "As notícias da Câmara aparecem aqui assim que forem publicadas."} /></div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((n, i) => {
              const data = new Date(n.publicado_em ?? n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
              const principal = i === 0 && !busca && ativa === "Todas";
              return (
                <Link
                  key={n.id}
                  to="/noticias/$slug"
                  params={{ slug: n.slug }}
                  className={`group flex overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl ${principal ? "flex-col md:col-span-2 lg:col-span-3 lg:flex-row" : "flex-col"}`}
                >
                  <div className={`relative overflow-hidden bg-gradient-to-br from-primary-deep to-primary ${principal ? "aspect-[16/9] lg:aspect-auto lg:w-3/5" : "aspect-[16/10]"}`}>
                    {n.imagem_url ? (
                      <img src={n.imagem_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <Newspaper className="absolute bottom-4 right-4 h-16 w-16 text-white/15" aria-hidden />
                    )}
                  </div>
                  <div className={`flex flex-1 flex-col p-5 ${principal ? "lg:justify-center lg:p-8" : ""}`}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{n.categoria || "Notícia"}</p>
                    <h2 className={`mt-2 font-display font-semibold leading-snug transition-colors group-hover:text-primary ${principal ? "text-2xl md:text-3xl" : "text-lg"}`}>{n.titulo}</h2>
                    {n.resumo && <p className={`mt-2 text-sm leading-relaxed text-muted-foreground ${principal ? "" : "line-clamp-3"}`}>{n.resumo}</p>}
                    <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
                      <time className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden /> {data}</time>
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
