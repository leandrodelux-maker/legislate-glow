import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Gavel,
  Users,
  MessageSquare,
  Shield,
  FileText,
  BookOpen,
  Search,
  Sparkles,
  Newspaper,
  Camera as InstagramIcon,
  Share2 as FacebookIcon,
  AtSign as TwitterIcon,
  Mail,
  PlayCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Eye,
  HandCoins,
  Megaphone,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import heroAsset from "@/assets/hero-cachoeira.jpg.asset.json";
const heroImg = heroAsset.url;
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { QuickAccess } from "@/components/quick-access";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { AnimatedCounter } from "@/components/animated-counter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Câmara Municipal — Portal Oficial" },
      {
        name: "description",
        content:
          "Acompanhe vereadores, sessões, projetos de lei, transparência, ouvidoria e e-SIC da Câmara Municipal.",
      },
      { property: "og:title", content: "Câmara Municipal — Portal Oficial" },
      { property: "og:description", content: "Transparência, legislação e participação cidadã." },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: heroImg, fetchPriority: "high" } as any,
    ],
  }),
  component: HomePage,
});

const heroPills = [
  { icon: Shield, label: "Transparência", to: "/transparencia-portal" },
  { icon: FileText, label: "e-SIC", to: "/contato" },
  { icon: MessageSquare, label: "Ouvidoria", to: "/contato" },
  { icon: BookOpen, label: "Carta de Serviços", to: "/transparencia-portal" },
  { icon: Gavel, label: "Licitações", to: "/transparencia-portal" },
  { icon: Newspaper, label: "Diário Oficial", to: "/noticias" },
];

type HeroData = {
  hero_media_url: string | null;
  hero_media_type: string;
  hero_title: string;
  hero_subtitle: string;
  hero_eyebrow: string;
};

type Vereador = Omit<Tables<"vereadores">, "email" | "telefone" | "data_nascimento">;
type MesaMember = {
  id: string;
  cargo: string;
  vereadores: { id: string; slug?: string | null; nome: string; partido: string | null; foto_url: string | null; cargo: string | null };
};
type DbSessao = {
  id: string;
  titulo: string;
  tipo: string | null;
  data_sessao: string;
  local: string | null;
  status: string;
};

type CamaraStats = {
  vereadores: number;
  sessoesRealizadas: number;
  projetosTramitacao: number;
  leisPublicadas: number;
};

type TransparenciaStats = {
  licitacoes: number;
  contratos: number;
  documentos: number;
  prestacoes: number;
};

function getSocial(redes: unknown, key: "instagram" | "facebook" | "twitter"): string | null {
  if (!redes || typeof redes !== "object") return null;
  const v = (redes as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v : null;
}

function HomePage() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [mesaDiretora, setMesaDiretora] = useState<MesaMember[]>([]);
  const [ultimasSessoes, setUltimasSessoes] = useState<DbSessao[]>([]);
  const [stats, setStats] = useState<CamaraStats | null>(null);
  const [transparencia, setTransparencia] = useState<TransparenciaStats | null>(null);
  const [loadingVer, setLoadingVer] = useState(true);
  const [loadingMesa, setLoadingMesa] = useState(true);
  const [loadingSes, setLoadingSes] = useState(true);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("hero_media_url, hero_media_type, hero_title, hero_subtitle, hero_eyebrow")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setHero(data as HeroData | null));

    supabase
      .from("vereadores")
      .select("id, nome, partido, cargo, foto_url, biografia, gabinete, mandato_inicio, mandato_fim, ativo, ordem, created_at, updated_at, naturalidade, escolaridade, profissao, redes_sociais, stats, data_posse, mandato_atual, slug, legislatura, comissoes")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .limit(8)
      .then(({ data }) => {
        setVereadores(data || []);
        setLoadingVer(false);
      });

    supabase
      .from("mesa_diretora")
      .select("id, cargo, vereadores(id, slug, nome, partido, foto_url, cargo)")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        setMesaDiretora((data as unknown as MesaMember[]) || []);
        setLoadingMesa(false);
      });

    supabase
      .from("sessoes")
      .select("id, titulo, tipo, data_sessao, local, status")
      .order("data_sessao", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        setUltimasSessoes((data as DbSessao[]) || []);
        setLoadingSes(false);
      });

    // Stats — counts in parallel
    (async () => {
      const [v, sR, pT, lP] = await Promise.all([
        supabase.from("vereadores").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("sessoes").select("id", { count: "exact", head: true }).eq("status", "realizada"),
        supabase.from("projetos_legislativos").select("id", { count: "exact", head: true }).neq("status", "arquivado"),
        supabase.from("projetos_legislativos").select("id", { count: "exact", head: true }).eq("status", "aprovado"),
      ]);
      setStats({
        vereadores: v.count ?? 0,
        sessoesRealizadas: sR.count ?? 0,
        projetosTramitacao: pT.count ?? 0,
        leisPublicadas: lP.count ?? 0,
      });

      const [lic, con, doc, pre] = await Promise.all([
        supabase.from("transparencia_licitacoes").select("id", { count: "exact", head: true }),
        supabase.from("transparencia_contratos").select("id", { count: "exact", head: true }),
        supabase.from("transparencia_documentos").select("id", { count: "exact", head: true }),
        supabase.from("transparencia_prestacao_contas").select("id", { count: "exact", head: true }),
      ]);
      setTransparencia({
        licitacoes: lic.count ?? 0,
        contratos: con.count ?? 0,
        documentos: doc.count ?? 0,
        prestacoes: pre.count ?? 0,
      });
    })();
  }, []);

  const mediaUrl = hero?.hero_media_url || null;
  const isVideo = hero?.hero_media_type === "video";
  const title = hero?.hero_title || "Câmara Municipal";
  const subtitle = hero?.hero_subtitle || "Transparência, serviços e informação ao alcance do cidadão";
  const eyebrow = hero?.hero_eyebrow || "Portal Oficial do Município";

  return (
    <>
      {/* ======================= HERO ======================= */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {isVideo && mediaUrl ? (
            <video src={mediaUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={mediaUrl || heroImg} alt="Município" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/90 via-primary-deep/80 to-primary/85" />
          <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-primary/40 blur-3xl" />
        </div>

        <div className="container-page py-6 md:py-9 lg:py-12 text-white text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold animate-[fade-up_0.6s_ease-out]">
            <Sparkles className="h-3 w-3" /> {eyebrow}
          </div>

          <h1 className="mt-2 font-display text-2xl md:text-3xl lg:text-4xl font-extrabold leading-[1.05] tracking-tight animate-[fade-up_0.7s_ease-out]">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl mx-auto text-xs md:text-sm text-white/85 leading-relaxed animate-[fade-up_0.8s_ease-out]">
            {subtitle}
          </p>

          <form className="mt-4 max-w-xl mx-auto animate-[fade-up_0.9s_ease-out]">
            <div className="flex items-stretch rounded-xl bg-white shadow-xl shadow-primary-deep/40 overflow-hidden ring-1 ring-white/10">
              <div className="flex items-center pl-4 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="search"
                placeholder="O que você procura? Ex: IPTU, licitações, vereador..."
                className="flex-1 px-3 h-10 text-slate-700 placeholder:text-slate-400 focus:outline-none text-sm"
              />
              <Button type="submit" className="h-10 rounded-none rounded-r-xl px-5 bg-gold hover:bg-gold/90 text-gold-foreground font-bold text-sm">
                Buscar
              </Button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap justify-center gap-2 animate-[fade-up_1s_ease-out]">
            {heroPills.map((p) => (
              <Link
                key={p.label}
                to={p.to}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-medium transition-all hover:-translate-y-0.5"
              >
                <p.icon className="h-3.5 w-3.5 text-gold" /> {p.label}
              </Link>
            ))}
          </div>
        </div>





        <svg aria-hidden viewBox="0 0 1440 80" className="block w-full h-12 md:h-16 -mb-px text-background" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,40 C240,90 480,0 720,30 C960,60 1200,80 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* QUICK ACCESS */}
      <QuickAccess />

      {/* ======================= CONHEÇA OS VEREADORES ======================= */}
      <section className="container-page py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            eyebrow="Legislativo"
            title="Conheça os Vereadores"
            description="Os representantes eleitos para o mandato 2025–2028 trabalhando pelo município."
          />
          <Button asChild variant="outline">
            <Link to="/vereadores">
              Ver todos os vereadores <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loadingVer
            ? Array.from({ length: 4 }).map((_, i) => <VereadorCardSkeleton key={i} />)
            : vereadores.slice(0, 8).map((v, i) => <VereadorCard key={v.id} v={v} delay={i * 70} />)}
        </div>
      </section>

      {/* ======================= MESA DIRETORA — HORIZONTAL ======================= */}
      <section className="bg-gradient-to-b from-secondary/40 to-background py-20 md:py-24 border-y border-border/60">
        <div className="container-page">
          <SectionHeading
            eyebrow="Liderança"
            title="Mesa Diretora"
            description="Parlamentares responsáveis pela gestão administrativa da Câmara."
            align="center"
          />

          <div className="mt-12 space-y-4 max-w-5xl mx-auto">
            {loadingMesa
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-card">
                    <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              : mesaDiretora.length > 0
                ? mesaDiretora.map((m, i) => (
                    <div
                      key={m.id}
                      className="group flex flex-col sm:flex-row items-center gap-5 p-5 md:p-6 rounded-2xl border border-border bg-card hover:border-gold/40 hover:shadow-lg transition-all animate-[fade-up_0.5s_ease-out_both]"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="relative shrink-0">
                        <VereadorAvatar
                          nome={m.vereadores.nome}
                          foto={m.vereadores.foto_url}
                          partido={m.vereadores.partido}
                          size={88}
                          rounded="2xl"
                          className="ring-2 ring-gold/30 group-hover:ring-gold/70 transition-all"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                          {m.cargo}
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <h4 className="font-display text-xl font-bold truncate">{m.vereadores.nome}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {m.vereadores.partido && <Badge variant="secondary">{m.vereadores.partido}</Badge>}
                          <span className="ml-2 uppercase tracking-widest text-xs">{m.vereadores.cargo || "Vereador(a)"}</span>
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <Link to="/vereadores/$slug" params={{ slug: m.vereadores.slug || m.vereadores.id }}>
                          Ver perfil <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))
                : (
                  <div className="text-center py-10 text-muted-foreground">Nenhum membro cadastrado.</div>
                )}
          </div>
        </div>
      </section>

      {/* ======================= ÚLTIMAS SESSÕES ======================= */}
      <section className="container-page py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            eyebrow="Plenário"
            title="Últimas Sessões"
            description="Acompanhe as atividades recentes do plenário da Câmara Municipal."
          />
          <Button asChild variant="outline">
            <Link to="/sessoes">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loadingSes
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))
            : ultimasSessoes.length > 0
              ? ultimasSessoes.map((s, i) => {
                  const d = new Date(s.data_sessao);
                  const realizada = s.status === "realizada";
                  return (
                    <article
                      key={s.id}
                      className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all animate-[fade-up_0.5s_ease-out_both]"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white flex items-center justify-center shadow-md">
                          {realizada ? <PlayCircle className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                        </div>
                        <Badge variant={realizada ? "secondary" : "default"} className="text-[10px] uppercase tracking-wider">
                          {realizada ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Realizada</> : <><Clock className="h-3 w-3 mr-1" /> {s.status}</>}
                        </Badge>
                      </div>
                      <div className="text-[11px] uppercase tracking-widest text-gold font-bold">
                        {s.tipo || "Sessão"}
                      </div>
                      <h4 className="mt-1 font-display text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {s.titulo}
                      </h4>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span>{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </article>
                  );
                })
              : <div className="col-span-full text-center py-10 text-muted-foreground">Nenhuma sessão cadastrada.</div>}
        </div>
      </section>

      {/* ======================= TRANSPARÊNCIA EM NÚMEROS ======================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-primary to-primary-deep py-20 md:py-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="container-page relative">
          <div className="text-center text-white mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              <Eye className="h-3 w-3" /> Lei de Acesso à Informação
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">
              Transparência em Números
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-white/80 text-base md:text-lg">
              Todos os dados públicos da Câmara, abertos, auditáveis e atualizados.
            </p>
          </div>

          {/* Linha 1 — Estatísticas institucionais da Câmara */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[
              { icon: Users, label: "Vereadores", value: stats?.vereadores ?? 0 },
              { icon: CheckCircle2, label: "Sessões realizadas", value: stats?.sessoesRealizadas ?? 0 },
              { icon: Gavel, label: "Projetos em tramitação", value: stats?.projetosTramitacao ?? 0 },
              { icon: BookOpen, label: "Leis publicadas", value: stats?.leisPublicadas ?? 0 },
            ].map((s, i) => (
              <div
                key={s.label}
                className="group rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md p-5 md:p-6 text-white animate-[fade-up_0.6s_ease-out_both] hover:bg-white/12 hover:-translate-y-1 transition-all"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <s.icon className="h-6 w-6 text-gold" />
                  <TrendingUp className="h-4 w-4 text-white/30 group-hover:text-gold transition-colors" />
                </div>
                <div className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-tight">
                  {stats ? <AnimatedCounter value={s.value} /> : <Skeleton className="h-9 w-20 bg-white/15" />}
                </div>
                <div className="mt-1 text-[11px] md:text-xs uppercase tracking-wider text-white/70">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Linha 2 — Indicadores de transparência */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Gavel, label: "Licitações", value: transparencia?.licitacoes ?? 0 },
              { icon: FileText, label: "Contratos", value: transparencia?.contratos ?? 0 },
              { icon: BookOpen, label: "Documentos", value: transparencia?.documentos ?? 0 },
              { icon: HandCoins, label: "Prestações de contas", value: transparencia?.prestacoes ?? 0 },
            ].map((t, i) => (

              <div
                key={t.label}
                className="group relative rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md p-6 text-white text-center hover:bg-white/15 hover:-translate-y-1 transition-all animate-[fade-up_0.6s_ease-out_both]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mx-auto h-12 w-12 rounded-xl bg-gold/20 text-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <t.icon className="h-6 w-6" />
                </div>
                <div className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
                  {transparencia ? <AnimatedCounter value={t.value} /> : <Skeleton className="h-12 w-20 bg-white/15 mx-auto" />}
                </div>
                <div className="mt-2 text-xs md:text-sm uppercase tracking-wider text-white/75">{t.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 h-12 px-8 font-bold">
              <Link to="/transparencia-portal">Acessar Portal de Transparência</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ======================= PARTICIPAÇÃO POPULAR ======================= */}
      <section className="container-page py-20 md:py-24">
        <SectionHeading
          eyebrow="Cidadão"
          title="Participação Popular"
          description="Sua voz constrói o município. Faça denúncias, peça informações e conheça nossos serviços."
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Megaphone,
              title: "Ouvidoria",
              description: "Registre denúncias, sugestões, reclamações e elogios sobre os serviços públicos.",
              cta: "Abrir protocolo",
              to: "/contato",
              accent: "from-blue-500 to-indigo-600",
            },
            {
              icon: HelpCircle,
              title: "e-SIC",
              description: "Sistema Eletrônico do Serviço de Informação ao Cidadão — Lei nº 12.527/2011.",
              cta: "Solicitar informação",
              to: "/contato",
              accent: "from-emerald-500 to-teal-600",
            },
            {
              icon: BookOpen,
              title: "Carta de Serviços",
              description: "Conheça todos os serviços oferecidos pela Câmara, prazos e formas de atendimento.",
              cta: "Ver carta",
              to: "/transparencia-portal",
              accent: "from-amber-500 to-orange-600",
            },
          ].map((item, i) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 hover:shadow-2xl hover:-translate-y-2 transition-all animate-[fade-up_0.6s_ease-out_both]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${item.accent} opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-700`} />
              <div className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-lg mb-5`}>
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-bold">{item.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{item.description}</p>
              <Button asChild className="mt-6 group/btn">
                <Link to={item.to}>
                  {item.cta}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

/* ============ Subcomponents ============ */

function VereadorCard({ v, delay }: { v: Vereador; delay: number }) {
  const instagram = getSocial(v.redes_sociais, "instagram");
  const facebook = getSocial(v.redes_sociais, "facebook");
  const twitter = getSocial(v.redes_sociais, "twitter");

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-border bg-card hover:shadow-2xl hover:-translate-y-1 transition-all animate-[fade-up_0.5s_ease-out_both]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary-deep to-primary">
        <VereadorAvatar
          nome={v.nome}
          foto={v.foto_url}
          partido={v.partido}
          size={400}
          rounded="lg"
          fit="contain"
          className="!h-full !w-full !rounded-none bg-white transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/30 to-transparent opacity-90" />

        {v.partido && (
          <Badge className="absolute top-4 left-4 bg-gold text-gold-foreground border-0 text-[10px] uppercase tracking-wider font-bold">
            {v.partido}
          </Badge>
        )}

        <div className="absolute bottom-0 inset-x-0 p-5 text-white">
          <div className="text-[10px] uppercase tracking-widest text-gold font-bold">
            {v.cargo || "Vereador(a)"}
          </div>
          <h4 className="mt-1 font-display text-lg font-bold leading-tight line-clamp-2">{v.nome}</h4>

          <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {instagram && (
              <a
                href={`https://instagram.com/${instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/15 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/15 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/15 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <Button asChild variant="outline" className="w-full group/btn">
          <Link to="/vereadores/$slug" params={{ slug: v.slug || v.id }}>
            Ver perfil
            <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function VereadorCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
