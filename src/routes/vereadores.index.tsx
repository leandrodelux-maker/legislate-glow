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

  // Ordenar vereadores para o ranking baseado em projetos (se disponível)
  const rankings = {
    projetos: [...vereadores]
      .sort((a, b) => ((b.stats as any)?.projetos || 0) - ((a.stats as any)?.projetos || 0))
      .slice(0, 3),
    presenca: [...vereadores]
      .sort((a, b) => ((b.stats as any)?.presencas || 0) - ((a.stats as any)?.presencas || 0))
      .slice(0, 3),
    participacao: [...vereadores]
      .sort((a, b) => ((b.stats as any)?.participacoes || 0) - ((a.stats as any)?.participacoes || 0))
      .slice(0, 3),
  };

  return (
    <>
      <section className="bg-gradient-to-br from-primary-deep to-primary text-primary-foreground relative overflow-hidden">

        <div className="absolute top-0 right-0 w-1/4 h-full bg-gold/5 -skew-x-12 translate-x-1/2" />
        <div className="container-page py-11 md:py-16 relative z-10">
          <div className="text-xs uppercase tracking-[0.2em] text-gold flex items-center gap-3">
            <span className="gold-divider" /> Legislatura 2025–2028
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold leading-tight">
            Nossos <span className="text-gold">Vereadores</span>
          </h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/85 text-lg">
            Conheça os representantes do povo na Câmara Municipal, acompanhe seu trabalho e desempenho.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Sidebar / Filters */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <Search className="w-5 h-5 text-gold" /> Buscar
              </h3>
              <Input 
                placeholder="Nome ou Partido..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" /> Rankings
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-3">Mais Atuantes</p>
                  <div className="space-y-3">
                    {rankings.projetos.map((v, i) => (
                      <div key={v.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-gold font-bold">{i+1}º</span> {v.nome}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">{v.partido}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
              <div className="text-sm text-muted-foreground">
                Exibindo <span className="font-bold text-foreground">{filteredVereadores.length}</span> vereadores
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === "grid" 
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" 
              : "space-y-4"
            }>
              {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-gold animate-spin" />
                  <p className="text-muted-foreground font-medium">Carregando vereadores...</p>
                </div>
              ) : (
                filteredVereadores.map((v, i) => (
                  <article
                    key={v.id}
                    className={`card-premium card-premium-hover group overflow-hidden animate-[fade-up_0.5s_ease-out_both] ${
                      viewMode === "list" ? "flex flex-col md:flex-row p-0" : "p-0"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={`relative bg-white flex items-center justify-center overflow-hidden ${
                      viewMode === "list" ? "w-full md:w-48 aspect-[3/4] md:aspect-auto" : "aspect-[3/4]"
                    }`}>
                      <VereadorAvatar
                        nome={v.nome}
                        foto={v.foto_url}
                        partido={v.partido}
                        size={viewMode === "list" ? 192 : 320}
                        rounded="lg"
                        showLabelOnError
                        fit="contain"
                        className="!rounded-none w-full h-full bg-white"
                      />
                      {v.partido && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 backdrop-blur-sm text-primary border-none shadow-sm">
                            {v.partido}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        {v.cargo && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-gold mb-1 block">
                            {v.cargo}
                          </span>
                        )}
                        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {v.nome}
                        </h3>
                        {v.biografia && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {v.biografia}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-4 border-y border-border/50 my-4">
                        <div className="text-center border-r border-border/50">
                          <div className="text-xs font-bold text-primary">{v.gabinete || "-"}</div>
                          <div className="text-[8px] uppercase tracking-tighter text-muted-foreground font-bold">Gabinete</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-primary">{v.partido || "-"}</div>
                          <div className="text-[8px] uppercase tracking-tighter text-muted-foreground font-bold">Partido</div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-end">
                        <Button variant="link" asChild className="p-0 h-auto font-bold text-sm group-hover:text-primary">
                          <Link to="/vereadores/$slug" params={{ slug: (v as any).slug || v.id }}>
                            Perfil Completo <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {!loading && filteredVereadores.length === 0 && (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold">Nenhum vereador encontrado</h3>
                <p className="text-muted-foreground">Tente uma busca diferente ou remova os filtros.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Institutional Info Section */}
      <section className="bg-primary-deep text-primary-foreground py-20">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading 
                eyebrow="O Poder Legislativo" 
                title="Transparência e Representatividade" 
                className="text-left mb-6"
                light
              />
              <p className="text-primary-foreground/80 mb-8 leading-relaxed">
                A Câmara Municipal é composta por 21 vereadores eleitos para mandatos de 4 anos. 
                Sua função principal é legislar sobre assuntos de interesse local e fiscalizar o Poder Executivo.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Zap, label: "Ações Rápidas", desc: "Acesse indicações e requerimentos." },
                  { icon: CalendarCheck, label: "Frequência", desc: "Confira a presença nas sessões." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.label}</h4>
                      <p className="text-xs text-primary-foreground/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden glass-strong border border-white/10 p-2">
                {plenarioImage ? (
                  <img src={plenarioImage} alt="Plenário" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center rounded-xl">
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">Imagem do Plenário</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -right-6 p-6 bg-gold rounded-2xl text-primary-deep shadow-xl animate-bounce">
                <div className="text-4xl font-display font-bold">100%</div>
                <div className="text-[10px] uppercase font-bold tracking-widest">Digitalizado</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
