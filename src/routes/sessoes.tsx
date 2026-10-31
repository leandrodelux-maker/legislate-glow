import { CalendarClock, Clapperboard } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import { CalendarX } from "lucide-react";
import { PaginaHero } from "@/components/pagina-hero";
import { CalendarDays as IconeHero } from "lucide-react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { 
  Calendar, 
  Clock, 
  FileText, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight,
  Gavel,
  Users2,
  CheckCircle2,
  Stamp,
  PlayCircle as YoutubeIcon,
  Play,
  ClipboardList,
  Vote,
  ChevronRight,
  ChevronLeft,
  Loader2

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sessoes")({
  head: () => ({
    meta: [
      { title: "Atividade Legislativa — Câmara Municipal" },
      {
        name: "description",
        content: "Agenda de sessões, pautas, atas e processos legislativos em tramitação.",
      },
    ],
  }),
  component: SessoesRota,
});

type DbSessao = {
  id: string;
  titulo: string;
  tipo: string | null;
  data_sessao: string;
  local: string | null;
  status: string;
  video_url: string | null;
  pauta: string | null;
  ata_url: string | null;
  qtd_pautas: number | null;
  qtd_presencas: number | null;
  qtd_votacoes: number | null;
  ata_publicada: boolean | null;
  lista_presenca_url: string | null;
  resumo_votos_url: string | null;
};

const codigoYoutube = (url?: string | null) => url?.match(/(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/)([\w-]{6,})/)?.[1] ?? null;

function BlocoData({ data }: { data: Date }) {
  return (
    <div className="grid h-[72px] w-16 shrink-0 place-items-center rounded-2xl bg-primary-deep text-center text-white">
      <div>
        <div className="font-display text-2xl font-bold leading-none">{data.toLocaleDateString("pt-BR", { day: "2-digit" })}</div>
        <div className="mt-1 text-xs font-bold uppercase text-gold">{data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</div>
      </div>
    </div>
  );
}

/** /sessoes é rota pai: a transmissão ao vivo abre no lugar da lista. */
function SessoesRota() {
  const { pathname } = useLocation();
  return pathname.startsWith("/sessoes/ao-vivo") ? <Outlet /> : <SessoesPage />;
}

function SessoesPage() {
  const [mes, setMes] = useState<Date>(new Date());
  const [proximasSessoes, setProximasSessoes] = useState<DbSessao[]>([]);
  const [historicoSessoes, setHistoricoSessoes] = useState<DbSessao[]>([]);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(historicoSessoes.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const historicoPagina = historicoSessoes.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => {
    async function loadData() {
      const now = new Date().toISOString();

      const { data: proximas } = await supabase
        .from("sessoes")
        .select("*")
        .gte("data_sessao", now)
        .eq("status", "agendada")
        .order("data_sessao", { ascending: true });
      setProximasSessoes(proximas || []);

      const { data: historico } = await supabase
        .from("sessoes")
        .select("*")
        .lt("data_sessao", now)
        .order("data_sessao", { ascending: false });
      setHistoricoSessoes(historico || []);

      const { data: settings } = await supabase
        .from("site_settings")
        .select("live_broadcast_url")
        .limit(1)
        .maybeSingle();
      setLiveUrl(settings?.live_broadcast_url || null);
      setLoading(false);
    }
    loadData();
  }, []);

  const todas = [...proximasSessoes, ...historicoSessoes];
  const doMes = todas
    .filter((s) => {
      const d = new Date(s.data_sessao);
      return d.getMonth() === mes.getMonth() && d.getFullYear() === mes.getFullYear();
    })
    .sort((a, b) => a.data_sessao.localeCompare(b.data_sessao));
  const classeAba = "min-h-11 gap-2 rounded-xl px-4 data-[state=active]:bg-primary-deep data-[state=active]:text-white";

  return (
    <>
      <PaginaHero
        icone={IconeHero}
        eyebrow="Atividade Parlamentar"
        title="Sessões e"
        destaque="Processo Legislativo"
        description={<>Acompanhe as sessões, consulte pautas e atas e veja as gravações dos trabalhos do plenário.</>}
      >
        {liveUrl && (
          <Link to="/sessoes/ao-vivo" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-gold-foreground transition hover:bg-gold/90">
            <YoutubeIcon className="h-4 w-4" aria-hidden /> Assistir à transmissão
          </Link>
        )}
      </PaginaHero>

      <section className="container-page py-10 md:py-14">
        <Tabs defaultValue="proximas" className="space-y-8">
          <TabsList className="h-auto max-w-full flex-wrap justify-start gap-1 rounded-2xl border border-border bg-secondary/60 p-1.5">
            <TabsTrigger value="proximas" className={classeAba}><CalendarClock className="h-4 w-4" aria-hidden /> Próximas</TabsTrigger>
            <TabsTrigger value="historico" className={classeAba}><Clapperboard className="h-4 w-4" aria-hidden /> Histórico e vídeos</TabsTrigger>
            <TabsTrigger value="calendario" className={classeAba}><Calendar className="h-4 w-4" aria-hidden /> Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="proximas" className="animate-[fade-up_0.4s_ease-out]">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" /></div>
            ) : proximasSessoes.length > 0 ? (
              <ul className="grid gap-3 md:grid-cols-2">
                {proximasSessoes.map((s) => {
                  const d = new Date(s.data_sessao);
                  return (
                    <li key={s.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-elegant">
                      <BlocoData data={d} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-primary">{s.tipo || "Sessão"}</p>
                        <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug">{s.titulo}</h3>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" aria-hidden /> {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" aria-hidden /> {s.local || "Plenário"}</span>
                        </div>
                        {s.pauta ? (
                          <details className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm">
                            <summary className="cursor-pointer font-semibold text-primary">Ver pauta</summary>
                            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted-foreground">{s.pauta}</p>
                          </details>
                        ) : (
                          <p className="mt-3 text-sm text-muted-foreground">Pauta ainda não publicada.</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EstadoVazio icone={CalendarX} titulo="Nenhuma sessão agendada" texto="As próximas sessões aparecem aqui assim que forem publicadas pela Câmara." />
            )}
          </TabsContent>

          <TabsContent value="historico" className="animate-[fade-up_0.4s_ease-out]">
            <div className="space-y-3">
              {historicoPagina.map((s) => {
                const d = new Date(s.data_sessao);
                const video = codigoYoutube(s.video_url);
                const documentos = [
                  { url: s.ata_url, rotulo: "Ata", icone: FileText },
                  { url: s.lista_presenca_url, rotulo: "Lista de presença", icone: ClipboardList },
                  { url: s.resumo_votos_url, rotulo: "Resumo dos votos", icone: Vote },
                ].filter((x) => x.url);
                return (
                  <article key={s.id} className="grid gap-5 overflow-hidden rounded-2xl border border-border bg-card p-4 md:grid-cols-[240px_1fr] md:p-5">
                    {s.video_url ? (
                      <a href={s.video_url} target="_blank" rel="noopener noreferrer" aria-label={`Assistir à gravação: ${s.titulo}`} className="group relative aspect-video overflow-hidden rounded-xl bg-primary-deep">
                        {video && <img src={`https://img.youtube.com/vi/${video}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />}
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-gold text-gold-foreground transition-transform group-hover:scale-110"><Play className="h-5 w-5 fill-current" aria-hidden /></span>
                        </span>
                      </a>
                    ) : (
                      <div className="grid aspect-video place-items-center rounded-xl bg-secondary/70 text-center text-sm text-muted-foreground">
                        <span><YoutubeIcon className="mx-auto mb-1 h-7 w-7 opacity-50" aria-hidden /> Sem gravação</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary">{s.tipo || "Sessão"} · {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                      <h3 className="mt-1 font-display text-xl font-semibold leading-snug">{s.titulo || "Resumo dos trabalhos"}</h3>
                      <dl className="mt-3 flex flex-wrap gap-2 text-sm">
                        {[
                          { r: "Pautas", v: s.qtd_pautas ?? 0 },
                          { r: "Presenças", v: s.qtd_presencas ?? 0 },
                          { r: "Votações", v: s.qtd_votacoes ?? 0 },
                        ].map((x) => (
                          <div key={x.r} className="flex items-baseline gap-1.5 rounded-lg bg-secondary/70 px-3 py-1.5">
                            <dd className="font-display font-bold text-primary-deep">{x.v}</dd>
                            <dt className="text-xs text-muted-foreground">{x.r}</dt>
                          </div>
                        ))}
                        <div className="rounded-lg bg-secondary/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                          <dt className="sr-only">Ata</dt>
                          <dd className="inline-flex items-center gap-1">{s.ata_publicada && <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden />} Ata {s.ata_publicada ? "publicada" : "pendente"}</dd>
                        </div>
                      </dl>
                      {documentos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {documentos.map((x) => (
                            <Button key={x.rotulo} variant="outline" size="sm" className="h-10" asChild>
                              <a href={x.url!} target="_blank" rel="noopener noreferrer"><x.icone className="mr-1.5 h-4 w-4" aria-hidden /> {x.rotulo}</a>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
              {historicoSessoes.length === 0 && !loading && (
                <EstadoVazio icone={CalendarX} titulo="Nenhuma sessão registrada" texto="O histórico de sessões e vídeos aparece aqui depois de publicado." />
              )}

              {historicoSessoes.length > PER_PAGE && (
                <nav aria-label="Paginação do histórico de sessões" className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, historicoSessoes.length)}</strong> de {historicoSessoes.length} sessões
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft className="h-4 w-4" aria-hidden /> Anterior</Button>
                    <span className="px-2 text-sm font-semibold">{currentPage} / {totalPages}</span>
                    <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Próxima <ChevronRight className="h-4 w-4" aria-hidden /></Button>
                  </div>
                </nav>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendario" className="animate-[fade-up_0.4s_ease-out]">
            <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
              <div className="flex justify-center rounded-3xl border border-border bg-card p-4">
                <CalendarComponent
                  mode="single"
                  month={mes}
                  onMonthChange={setMes}
                  modifiers={{ sessao: todas.map((s) => new Date(s.data_sessao)) }}
                  modifiersClassNames={{ sessao: "rounded-md bg-gold font-bold text-gold-foreground" }}
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold first-letter:uppercase">
                  {mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">Os dias com sessão aparecem em dourado no calendário.</p>
                {doMes.length === 0 ? (
                  <EstadoVazio icone={CalendarX} titulo="Nenhuma sessão neste mês" texto="Use as setas do calendário para ver outros meses." />
                ) : (
                  <ul className="grid gap-3">
                    {doMes.map((s) => {
                      const d = new Date(s.data_sessao);
                      return (
                        <li key={s.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                          <BlocoData data={d} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-primary">{s.tipo || "Sessão"}</p>
                            <p className="font-display font-semibold leading-snug">{s.titulo}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" aria-hidden /> {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {s.local || "Plenário"}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <ContinueNavegando itens={[
        { to: "/a-camara/roteiro-das-sessoes", titulo: "Roteiro das Sessões", texto: "Como uma sessão acontece", icone: ClipboardList },
        { to: "/projetos", titulo: "Projetos de Lei", texto: "Matérias em tramitação", icone: FileText },
        { to: "/vereadores", titulo: "Vereadores", texto: "Conheça os parlamentares", icone: Users2 },
      ]} />
    </>
  );
}
