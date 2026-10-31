import { SearchX } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import cidadeAsset from "@/assets/hero-cachoeira.jpg.asset.json";
import { PaginaHero } from "@/components/pagina-hero";
import { Users as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Mail, 
  Phone, 
  User, 
  Search, 
  Filter, 
  ChevronRight, 
  Camera as InstagramIcon, 
  Share2 as TwitterIcon, 
  MessageSquare as FacebookIcon,
  Trophy,
  CalendarCheck,
  Zap,
  LayoutGrid,
  List,
  MapPin,
  Loader2
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { VereadorAvatar } from "@/components/vereador-avatar";

export const Route = createFileRoute("/vereadores/")({
  head: () => ({
    meta: [
      { title: "Vereadores — Câmara Municipal" },
      {
        name: "description",
        content: "Conheça os vereadores, sua biografia, projetos e desempenho parlamentar.",
      },
    ],
  }),
  component: VereadoresPage,
});

type Vereador = Omit<Tables<"vereadores">, "email" | "telefone" | "data_nascimento">;

function VereadoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [loading, setLoading] = useState(true);
  const [plenarioImage, setPlenarioImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVereadores() {
      try {
        const { data, error } = await supabase
          .from("vereadores")
          .select("id, nome, partido, cargo, foto_url, biografia, gabinete, mandato_inicio, mandato_fim, ativo, ordem, created_at, updated_at, naturalidade, escolaridade, profissao, redes_sociais, stats, data_posse, mandato_atual, slug, legislatura, comissoes")
          .eq("ativo", true)
          .order("ordem", { ascending: true });

        if (error) throw error;
        setVereadores(data || []);
      } catch (error) {
        console.error("Erro ao buscar vereadores:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchPlenario() {
      const { data } = await supabase
        .from("site_settings")
        .select("plenario_image_url")
        .limit(1)
        .maybeSingle();
      setPlenarioImage((data as any)?.plenario_image_url ?? null);
    }

    fetchVereadores();
    fetchPlenario();
  }, []);

  const filteredVereadores = vereadores.filter(v => 
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.partido?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <>
      <PaginaHero
        icone={IconeHero}
        eyebrow="Legislatura 2025–2028"
        title="Nossos"
        destaque="Vereadores"
        description={<>Conheça os representantes do povo na Câmara Municipal e acompanhe o trabalho de cada um.</>}
      />

      {/* BUSCA */}
      <section className="container-page relative z-10 -mt-7">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary-deep/15">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" aria-hidden />
            <Input
              type="search"
              placeholder="Buscar por nome ou partido"
              aria-label="Buscar vereadores por nome ou partido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 border-0 pl-11 text-base shadow-none focus-visible:ring-0"
            />
          </div>
          <span className="hidden shrink-0 px-2 text-sm text-muted-foreground sm:block" aria-live="polite">
            <strong className="text-foreground">{filteredVereadores.length}</strong> {filteredVereadores.length === 1 ? "parlamentar" : "parlamentares"}
          </span>
          <div className="flex shrink-0 gap-1" role="group" aria-label="Forma de exibição">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" aria-label="Exibir em grade" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")} className="h-11 w-11">
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" aria-label="Exibir em lista" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")} className="h-11 w-11">
              <List className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="container-page py-10 md:py-14">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : filteredVereadores.length === 0 ? (
          <EstadoVazio icone={SearchX} titulo="Nenhum vereador encontrado" texto="Tente buscar por outro nome ou partido." />
        ) : viewMode === "grid" ? (
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {filteredVereadores.map((v, i) => (
              <Link
                key={v.id}
                to="/vereadores/$slug"
                params={{ slug: v.slug || v.id }}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group flex w-[calc(50%-0.375rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl animate-[fade-up_0.5s_ease-out_both] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)]"
              >
                <div className="relative">
                  <FotoEstudio nome={v.nome} foto={v.foto_url} partido={v.partido} className="aspect-[4/5]" />
                  {v.partido && <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-primary-deep shadow-sm">{v.partido}</span>}
                </div>
                <span className="h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
                <div className="flex flex-1 flex-col p-4">
                  <p className={`text-xs font-bold ${/^vereador/i.test(v.cargo ?? "Vereador") ? "text-muted-foreground" : "text-[oklch(0.5_0.11_70)]"}`}>{v.cargo || "Vereador(a)"}</p>
                  <h2 className="mt-1 font-display text-[0.95rem] font-semibold leading-snug group-hover:text-primary">{v.nome}</h2>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-primary">
                    Ver perfil <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <ul className="grid gap-3">
            {filteredVereadores.map((v) => (
              <li key={v.id}>
                <Link to="/vereadores/$slug" params={{ slug: v.slug || v.id }} className="group flex items-stretch overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-elegant">
                  <FotoEstudio nome={v.nome} foto={v.foto_url} partido={v.partido} className="min-h-28 w-24 shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col justify-center p-4">
                    <span className="text-xs font-bold text-primary">{v.cargo || "Vereador(a)"}{v.partido ? ` · ${v.partido}` : ""}</span>
                    <span className="mt-0.5 font-display text-lg font-semibold leading-snug group-hover:text-primary">{v.nome}</span>
                    {v.biografia && <span className="mt-1 line-clamp-1 text-sm text-muted-foreground">{v.biografia}</span>}
                  </span>
                  <ChevronRight className="mr-4 h-5 w-5 shrink-0 self-center text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* O PODER LEGISLATIVO */}
      <section className="relative overflow-hidden bg-primary-deep py-12 text-white md:py-16">
        <div className="textura-pontos absolute inset-0" aria-hidden />
        <div className="container-page relative grid items-center gap-8 lg:grid-cols-2">
          <div>
            <TituloSecao claro eyebrow="O Poder Legislativo" titulo="Transparência e representatividade" />
            <p className="-mt-3 leading-relaxed text-white/90">
              A Câmara Municipal é composta por {vereadores.length || 9} vereadores eleitos para mandatos de 4 anos. Sua função principal é legislar sobre assuntos de interesse local e fiscalizar o Poder Executivo.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { to: "/vereadores/ranking", icon: Trophy, t: "Desempenho", d: "Projetos e presença de cada vereador" },
                { to: "/projetos", icon: Zap, t: "Projetos de Lei", d: "Indicações, requerimentos e leis" },
              ].map((c) => (
                <Link key={c.to} to={c.to as never} className="group rounded-2xl border border-white/15 bg-white/[0.07] p-4 transition hover:bg-white/[0.14]">
                  <c.icon className="h-5 w-5 text-gold" aria-hidden />
                  <span className="mt-2 block font-display font-semibold">{c.t}</span>
                  <span className="block text-sm text-white/85">{c.d}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="aspect-video overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
            <img src={plenarioImage || cidadeAsset.url} alt={plenarioImage ? "Plenário da Câmara Municipal" : "Vista de Cachoeira de Goiás"} loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
