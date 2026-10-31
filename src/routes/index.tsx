import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  FileSignature,
  Gavel,
  HandCoins,
  MapPin,
  PlayCircle,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import heroAsset from "@/assets/hero-cachoeira.jpg.asset.json";
const heroImg = heroAsset.url;
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { QuickAccess } from "@/components/quick-access";
import { BuscaSite } from "@/components/busca-site";
import { FiosCachoeira } from "@/components/fios-cachoeira";
import { supabase } from "@/integrations/supabase/client";
import { transparenciaDb } from "@/integrations/transparencia/client";
import type { Tables } from "@/integrations/supabase/types";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { AnimatedCounter } from "@/components/animated-counter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Câmara Municipal de Cachoeira de Goiás — Portal Oficial" },
      {
        name: "description",
        content:
          "Acompanhe vereadores, sessões, projetos de lei, transparência, ouvidoria e e-SIC da Câmara Municipal de Cachoeira de Goiás.",
      },
      { property: "og:title", content: "Câmara Municipal de Cachoeira de Goiás — Portal Oficial" },
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

type HeroData = {
  hero_media_url: string | null;
  hero_media_type: string;
  hero_title: string;
  hero_subtitle: string;
  hero_eyebrow: string;
};

type Vereador = Omit<Tables<"vereadores">, "email" | "telefone" | "data_nascimento">;
type DbSessao = {
  id: string;
  titulo: string;
  tipo: string | null;
  data_sessao: string;
  local: string | null;
  status: string;
};
type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  categoria: string | null;
  publicado_em: string | null;
  created_at: string;
  imagem_url: string | null;
};

type CamaraStats = {
  vereadores: number;
  sessoesRealizadas: number;
  projetosTramitacao: number;
  projetosAprovados: number;
};

// Indicadores lidos do banco analítico, a cópia do portal Megasoft.
const ANO_ATUAL = new Date().getFullYear();
const INDICADORES_PORTAL = [
  { dataset: "licitacoes", icon: Gavel, label: "Licitações", to: "/transparencia/licitacoes" },
  { dataset: "contratos", icon: FileSignature, label: "Contratos", to: "/transparencia/contratos" },
  { dataset: "receitas", icon: HandCoins, label: "Receitas", to: "/transparencia/receitas" },
  { dataset: "despesas", icon: Receipt, label: "Despesas", to: "/transparencia/despesas" },
];

function HomePage() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [ultimasSessoes, setUltimasSessoes] = useState<DbSessao[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [stats, setStats] = useState<CamaraStats | null>(null);
  const [registrosPortal, setRegistrosPortal] = useState<Record<string, number>>({});
  const [loadingVer, setLoadingVer] = useState(true);
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
      .then(({ data }) => {
        setVereadores(data || []);
        setLoadingVer(false);
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

    supabase
      .from("noticias")
      .select("id, titulo, slug, resumo, categoria, publicado_em, created_at, imagem_url")
      .eq("publicado", true)
      .order("publicado_em", { ascending: false, nullsFirst: false })
      .limit(3)
      .then(({ data }) => setNoticias((data as Noticia[]) || []));

    (async () => {
      const [v, sR, pT, pA] = await Promise.all([
        supabase.from("vereadores").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("sessoes").select("id", { count: "exact", head: true }).eq("status", "realizada"),
        supabase.from("projetos_legislativos").select("id", { count: "exact", head: true }).neq("status", "arquivado"),
        supabase.from("projetos_legislativos").select("id", { count: "exact", head: true }).eq("status", "aprovado"),
      ]);
      setStats({
        vereadores: v.count ?? 0,
        sessoesRealizadas: sR.count ?? 0,
        projetosTramitacao: pT.count ?? 0,
        projetosAprovados: pA.count ?? 0,
      });
    })();

    const banco = transparenciaDb;
    if (banco) {
      Promise.all(
        INDICADORES_PORTAL.map(({ dataset }) =>
          banco
            .from("transparencia_registros")
            .select("*", { count: "exact", head: true })
            .eq("dataset", dataset)
            .eq("ano", ANO_ATUAL)
            .then(({ count }) => [dataset, count ?? 0] as const),
        ),
      ).then((pares) => setRegistrosPortal(Object.fromEntries(pares)));
    }
  }, []);

  const mediaUrl = hero?.hero_media_url || null;
  const isVideo = hero?.hero_media_type === "video";
  const title = hero?.hero_title || "Câmara Municipal";
  const subtitle = hero?.hero_subtitle || "Transparência, serviços e informação ao alcance do cidadão";
  const eyebrow = hero?.hero_eyebrow || "Portal Oficial do Município";

  const presidente = vereadores.find(ehPresidente);
  const demais = vereadores.filter((v) => v !== presidente);

  const sessaoDestaque = ultimasSessoes[0];
  const dataDestaque = sessaoDestaque ? new Date(sessaoDestaque.data_sessao) : null;
  const sessaoFutura = dataDestaque ? dataDestaque.getTime() > Date.now() : false;

  return (
    <>
      {/* ======================= DESTAQUE ======================= */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {isVideo && mediaUrl ? (
            <video src={mediaUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={mediaUrl || heroImg} alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/95 via-primary-deep/85 to-primary/80" />
          <div className="absolute inset-0 textura-pontos" />
          <FiosCachoeira />
        </div>

        <div className="container-page grid gap-8 pb-32 pt-10 text-white md:pb-40 md:pt-14 lg:grid-cols-[1.45fr_1fr] lg:items-center">
          <div className="animate-[fade-up_0.6s_ease-out_both]">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden /> {eyebrow}
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">{subtitle}</p>
            <div className="mt-7 hidden max-w-2xl md:block">
              <BuscaSite destaque />
            </div>
          </div>

          <aside aria-label="Plenário" className="animate-[fade-up_0.8s_ease-out_both] rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
              <Calendar className="h-3.5 w-3.5" aria-hidden /> {sessaoDestaque && sessaoFutura ? "Próxima sessão" : "Plenário"}
            </p>
            {loadingSes ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-6 w-4/5 bg-white/15" />
                <Skeleton className="h-4 w-1/2 bg-white/15" />
              </div>
            ) : sessaoDestaque && dataDestaque ? (
              <div className="mt-3 flex gap-4">
                <div className="grid h-[72px] w-[68px] shrink-0 place-items-center rounded-2xl bg-gold text-center text-gold-foreground">
                  <div>
                    <div className="font-display text-2xl font-bold leading-none">{dataDestaque.toLocaleDateString("pt-BR", { day: "2-digit" })}</div>
                    <div className="mt-1 text-xs font-bold uppercase">{dataDestaque.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</div>
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="line-clamp-2 font-display text-lg font-semibold leading-snug">{sessaoDestaque.titulo}</h2>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/85">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {dataDestaque.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {sessaoDestaque.local && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{sessaoDestaque.local}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <h2 className="mt-3 font-display text-lg font-semibold leading-snug">Acompanhe os trabalhos da Câmara</h2>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/sessoes" className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-primary-deep transition hover:bg-white/90">
                Ver sessões <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/sessoes/ao-vivo" className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/30 px-4 text-sm font-semibold transition hover:bg-white/10">
                <PlayCircle className="h-4 w-4 text-gold" aria-hidden /> Ao vivo
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ======================= ACESSO RÁPIDO ======================= */}
      <QuickAccess />

      {/* ======================= NOTÍCIAS (só aparece quando há publicações) ======================= */}
      {noticias.length > 0 && (
        <section className="container-page pt-20 md:pt-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Comunicação" title="Últimas Notícias" description="O que está acontecendo na Câmara Municipal." />
            <Button asChild variant="outline">
              <Link to="/noticias">Ver todas <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {noticias.map((n) => (
              <Link key={n.id} to="/noticias/$slug" params={{ slug: n.slug }} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-deep to-primary">
                  {n.imagem_url && <img src={n.imagem_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{n.categoria || "Notícia"}</p>
                  <h3 className="mt-2 line-clamp-3 font-display text-lg font-semibold leading-snug group-hover:text-primary">{n.titulo}</h3>
                  {n.resumo && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{n.resumo}</p>}
                  <p className="mt-auto pt-4 text-xs text-muted-foreground">
                    {new Date(n.publicado_em || n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ======================= VEREADORES E MESA DIRETORA ======================= */}
      <section className="container-page py-20 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={`Legislatura 2025–2028${vereadores.length ? ` · ${vereadores.length} parlamentares` : ""}`}
            title="Quem representa você"
            description="Conheça os vereadores e a Mesa Diretora, responsável pela gestão da Câmara."
          />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/a-camara/mesa-diretora">Mesa Diretora</Link>
            </Button>
            <Button asChild>
              <Link to="/vereadores">Todos os vereadores <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-4 md:gap-4 xl:grid-cols-6">
          {loadingVer ? (
            <>
              <VereadorCardSkeleton destaque />
              {Array.from({ length: 8 }).map((_, i) => <VereadorCardSkeleton key={i} />)}
            </>
          ) : (
            <>
              {presidente && <PresidenteCard v={presidente} />}
              {demais.map((v, i) => <VereadorCard key={v.id} v={v} delay={i * 50} />)}
            </>
          )}
        </div>
      </section>

      {/* ======================= ÚLTIMAS SESSÕES (some enquanto não há sessões) ======================= */}
      {(loadingSes || ultimasSessoes.length > 0) && <section className="container-page pb-20 pt-20 md:pb-24 md:pt-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            eyebrow="Plenário"
            title="Últimas Sessões"
            description="Acompanhe as atividades recentes do plenário da Câmara Municipal."
          />
          <Button asChild variant="outline">
            <Link to="/sessoes">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {loadingSes
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-2xl border border-border bg-card p-6">
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
                    <Link
                      key={s.id}
                      to="/sessoes"
                      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all animate-[fade-up_0.5s_ease-out_both] hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{s.tipo || "Sessão"}</span>
                        <Badge variant={realizada ? "secondary" : "default"} className="text-[11px] capitalize">
                          {realizada ? <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden /> : <Clock className="mr-1 h-3 w-3" aria-hidden />} {s.status}
                        </Badge>
                      </div>
                      <h3 className="mt-3 line-clamp-2 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">{s.titulo}</h3>
                      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                        <span>{d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span>{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </Link>
                  );
                })
              : null}
        </div>
      </section>}

      {/* ======================= TRANSPARÊNCIA EM NÚMEROS ======================= */}
      <section className="relative overflow-hidden bg-primary-deep py-16 text-white md:py-20">
        <div className="absolute inset-0 textura-pontos" aria-hidden />
        <div className="absolute inset-0" aria-hidden style={{ background: "radial-gradient(800px 400px at 0% 100%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 60%)" }} />
        <div className="container-page relative grid gap-10 lg:grid-cols-[1fr_1.55fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
              <Eye className="h-3.5 w-3.5 text-gold" aria-hidden /> Lei de Acesso à Informação
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">
              A Câmara em <span className="text-gold">números</span>
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-white/85">
              Acompanhe o trabalho do plenário e consulte como o dinheiro público é aplicado.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 bg-gold px-6 font-bold text-gold-foreground hover:bg-gold/90">
              <Link to="/transparencia">Acessar o Portal da Transparência <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
            </Button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: Users, label: "Vereadores", value: stats?.vereadores ?? 0 },
                { icon: CheckCircle2, label: "Sessões realizadas", value: stats?.sessoesRealizadas ?? 0 },
                { icon: Gavel, label: "Projetos em tramitação", value: stats?.projetosTramitacao ?? 0 },
                { icon: BookOpen, label: "Projetos aprovados", value: stats?.projetosAprovados ?? 0 },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/15 bg-white/[0.07] p-4">
                  <s.icon className="h-5 w-5 text-gold" aria-hidden />
                  <div className="mt-3 font-display text-3xl font-bold tracking-tight">
                    {stats ? <AnimatedCounter value={s.value} /> : <Skeleton className="h-9 w-16 bg-white/15" />}
                  </div>
                  <div className="mt-1 text-xs leading-snug text-white/80">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Sem carga no banco analítico, o cartão convida a consultar em vez de exibir um zero enganoso. */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {INDICADORES_PORTAL.map((t) => {
                const total = registrosPortal[t.dataset] ?? 0;
                return (
                  <Link key={t.dataset} to={t.to as never} className="group rounded-2xl bg-white p-4 text-primary-deep transition hover:-translate-y-0.5 hover:shadow-xl">
                    <span className="flex items-center justify-between">
                      <t.icon className="h-5 w-5 text-primary" aria-hidden />
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-primary" aria-hidden />
                    </span>
                    <span className="mt-3 block font-display text-base font-semibold">{t.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      {total > 0 ? `${total.toLocaleString("pt-BR")} registros em ${ANO_ATUAL}` : "Consultar dados"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============ Subcomponents ============ */

const ehPresidente = (v: Vereador) => /^presidente/i.test(v.cargo ?? "");
/** Mesa Diretora: quem tem cargo além de vereador(a). */
const ehDaMesa = (v: Vereador) => Boolean(v.cargo) && !/^vereador/i.test(v.cargo ?? "");

function PresidenteCard({ v }: { v: Vereador }) {
  return (
    <Link
      to="/vereadores/$slug"
      params={{ slug: v.slug || v.id }}
      className="group col-span-2 flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg transition hover:-translate-y-1 hover:shadow-2xl md:row-span-2 animate-[fade-up_0.5s_ease-out_both]"
    >
      <div className="vereador-estudio vereador-estudio-ouro relative min-h-[340px] flex-1 overflow-hidden">
        <VereadorAvatar
          nome={v.nome}
          foto={v.foto_url}
          partido={v.partido}
          size={400}
          fill
          rounded="lg"
          objectPosition="center 12%"
          className="!absolute inset-0 !rounded-none !border-0 !bg-none !bg-transparent mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {v.partido && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-deep shadow-sm">{v.partido}</span>}
      </div>
      <div className="acesso-destaque relative p-5 text-white md:p-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold">
          <Crown className="h-3.5 w-3.5" aria-hidden /> {v.cargo} da Câmara
        </p>
        <h3 className="mt-1.5 font-display text-2xl font-bold leading-tight">{v.nome}</h3>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
          Ver perfil <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function VereadorCard({ v, delay }: { v: Vereador; delay: number }) {
  const mesa = ehDaMesa(v);
  return (
    <Link
      to="/vereadores/$slug"
      params={{ slug: v.slug || v.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl animate-[fade-up_0.5s_ease-out_both]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="vereador-estudio relative aspect-[4/5] overflow-hidden">
        <VereadorAvatar
          nome={v.nome}
          foto={v.foto_url}
          partido={v.partido}
          size={240}
          fill
          rounded="lg"
          objectPosition="center 12%"
          className="!h-full !w-full !rounded-none !border-0 !bg-none !bg-transparent mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        {v.partido && <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary-deep shadow-sm">{v.partido}</span>}
      </div>
      <span className="h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
      <div className="flex flex-1 flex-col p-3.5">
        <p className={`text-xs font-bold ${mesa ? "text-[oklch(0.5_0.11_70)]" : "text-muted-foreground"}`}>{v.cargo || "Vereador(a)"}</p>
        <h3 className="mt-1 font-display text-sm font-semibold leading-snug group-hover:text-primary">{v.nome}</h3>
      </div>
    </Link>
  );
}

function VereadorCardSkeleton({ destaque = false }: { destaque?: boolean }) {
  return <Skeleton className={destaque ? "col-span-2 min-h-[420px] rounded-3xl md:row-span-2" : "aspect-[3/4] rounded-2xl"} />;
}
