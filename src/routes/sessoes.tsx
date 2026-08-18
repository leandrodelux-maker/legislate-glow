import { createFileRoute, Link } from "@tanstack/react-router";
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
  component: SessoesPage,
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

const projetos = [
  { id: "pl-124-2026", num: "124", ano: "2026", tipo: "Projeto de Lei", titulo: "Institui o programa municipal de incentivo à leitura", autor: "Ver. Mariana Souza", status: "Comissão", fase: 2 },
  { id: "pl-118-2026", num: "118", ano: "2026", tipo: "Projeto de Lei", titulo: "Cria a semana de prevenção à violência doméstica", autor: "Ver. Patrícia Ribeiro", status: "Plenário", fase: 3 },
  { id: "ind-045-2026", num: "045", ano: "2026", tipo: "Indicação", titulo: "Manutenção asfáltica na Rua das Palmeiras", autor: "Ver. Roberto Mendes", status: "Protocolado", fase: 1 },
  { id: "pl-097-2026", num: "097", ano: "2026", tipo: "Projeto de Lei", titulo: "Regulamenta horta comunitária em áreas municipais", autor: "Ver. Juliana Martins", status: "Sancionado", fase: 5 },
];

const fases = [
  { label: "Protocolado", icon: FileText },
  { label: "Comissão", icon: Users2 },
  { label: "Plenário", icon: Gavel },
  { label: "Aprovado", icon: CheckCircle2 },
  { label: "Sancionado", icon: Stamp },
];

function LegislativeTimeline({ currentFase }: { currentFase: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto py-8">
      {fases.map((fase, index) => {
        const step = index + 1;
        const isActive = step <= currentFase;
        const isCurrent = step === currentFase;
        const Icon = fase.icon;

        return (
          <div key={fase.label} className="flex flex-col items-center relative flex-1">
            {index !== 0 && (
              <div 
                className={`absolute right-1/2 top-5 w-full h-0.5 -translate-y-1/2 -z-10 ${
                  isActive ? "bg-primary" : "bg-muted"
                }`} 
              />
            )}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                isActive 
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                  : "bg-muted text-muted-foreground"
              } ${isCurrent ? "scale-110 shadow-lg shadow-primary/20" : ""}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className={`mt-3 text-[10px] font-bold uppercase tracking-tighter text-center max-w-[80px] ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}>
              {fase.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SessoesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [proximasSessoes, setProximasSessoes] = useState<DbSessao[]>([]);
  const [historicoSessoes, setHistoricoSessoes] = useState<DbSessao[]>([]);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(historicoSessoes.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const historicoPagina = historicoSessoes.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );


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

  return (
    <>
      <section className="bg-gradient-to-br from-primary-deep to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 skew-x-12 translate-x-1/2" />
        <div className="container-page py-11 md:py-16 relative z-10">
          <div className="text-xs uppercase tracking-[0.2em] text-gold flex items-center gap-3">
            <span className="gold-divider" /> Atividade Parlamentar
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold leading-tight">
            Sessões e <span className="text-gold">Processo</span>
          </h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/85 text-lg">
            Acompanhe as sessões ao vivo, consulte pautas, atas e toda a tramitação legislativa de forma transparente.
          </p>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <Tabs defaultValue="proximas" className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
            <TabsList className="bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="proximas" className="px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Próximas Sessões
              </TabsTrigger>
              <TabsTrigger value="historico" className="px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Histórico e Vídeos
              </TabsTrigger>
              <TabsTrigger value="calendario" className="px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Calendário Completo
              </TabsTrigger>
            </TabsList>
            
            {liveUrl && (
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white animate-pulse">
                <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                  <YoutubeIcon className="mr-2 h-4 w-4" /> Assista Ao Vivo
                </a>
              </Button>
            )}
          </div>

          <TabsContent value="proximas" className="animate-[fade-up_0.5s_ease-out]">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-gold" />
              </div>
            ) : proximasSessoes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {proximasSessoes.map((s, i) => {
                  const dateObj = new Date(s.data_sessao);
                  const dateStr = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
                  const hourStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
                  
                  return (
                    <article
                      key={s.id}
                      className="card-premium card-premium-hover p-6 flex flex-col group"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                          {s.tipo || "Sessão"}
                        </Badge>
                        {s.video_url && (
                          <Badge className="bg-red-100 text-red-600 border-red-200">
                            <Play className="h-3 w-3 mr-1 fill-current" /> LIVE
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-bold mb-4">{dateStr}</h3>
                      <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> {hourStr}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {s.local || "Plenário"}</div>
                        <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-gold" /> Pauta disponível</div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-border/50 space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-between group-hover:border-primary">
                          Ver Pauta <ChevronRight className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                          Baixar Editais
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground font-medium">
                Nenhuma sessão agendada para os próximos dias.
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="animate-[fade-up_0.5s_ease-out]">
            <div className="space-y-6">
              {historicoPagina.map((s, i) => {
                const dateObj = new Date(s.data_sessao);
                const dateStr = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
                const videoId = s.video_url?.includes("v=") ? s.video_url.split("v=")[1].split("&")[0] : null;

                return (
                  <div key={s.id} className="card-premium p-6 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    <div className="relative w-full lg:w-64 aspect-video rounded-lg overflow-hidden bg-black group cursor-pointer">
                      {videoId ? (
                        <>
                          <img 
                            src={`https://img.youtube.com/vi/${videoId}/0.jpg`} 
                            alt="Thumbnail"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-white fill-current" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <YoutubeIcon className="h-12 w-12 text-slate-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/5 text-primary">
                          {s.tipo}
                        </Badge>
                        <span className="text-sm font-bold text-muted-foreground">{dateStr}</span>
                      </div>
                      <h4 className="font-display text-2xl font-bold">{s.titulo || "Resumo dos Trabalhos"}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                          <div className="text-lg font-bold text-primary">{s.qtd_pautas}</div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground">Pautas</div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                          <div className="text-lg font-bold text-primary">{s.qtd_presencas}</div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground">Presenças</div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                          <div className="text-lg font-bold text-primary">{s.qtd_votacoes}</div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground">Votações</div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                          <div className={`text-lg font-bold ${s.ata_publicada ? "text-emerald-600" : "text-amber-500"}`}>
                            ATA
                          </div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground">
                            {s.ata_publicada ? "Publicada" : "Pendente"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col gap-2">
                      <Button variant="outline" className="w-full lg:w-40 justify-between" disabled={!s.ata_url} asChild={!!s.ata_url}>
                        {s.ata_url ? (
                          <a href={s.ata_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4" /> Ata em PDF
                          </a>
                        ) : (
                          <span>
                            <FileText className="h-4 w-4" /> Ata em PDF
                          </span>
                        )}
                      </Button>
                      <Button variant="outline" className="w-full lg:w-40 justify-between" disabled={!s.lista_presenca_url} asChild={!!s.lista_presenca_url}>
                        {s.lista_presenca_url ? (
                          <a href={s.lista_presenca_url} target="_blank" rel="noopener noreferrer">
                            <ClipboardList className="h-4 w-4" /> Lista Presença
                          </a>
                        ) : (
                          <span>
                            <ClipboardList className="h-4 w-4" /> Lista Presença
                          </span>
                        )}
                      </Button>
                      <Button variant="outline" className="w-full lg:w-40 justify-between" disabled={!s.resumo_votos_url} asChild={!!s.resumo_votos_url}>
                        {s.resumo_votos_url ? (
                          <a href={s.resumo_votos_url} target="_blank" rel="noopener noreferrer">
                            <Vote className="h-4 w-4" /> Resumo Votos
                          </a>
                        ) : (
                          <span>
                            <Vote className="h-4 w-4" /> Resumo Votos
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {historicoSessoes.length === 0 && !loading && (
                <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground font-medium">
                  Nenhuma sessão anterior registrada.
                </div>
              )}

              {historicoSessoes.length > PER_PAGE && (
                <nav
                  aria-label="Paginação do histórico de sessões"
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border"
                >
                  <p className="text-sm text-muted-foreground">
                    Mostrando{" "}
                    <strong className="text-foreground">
                      {(currentPage - 1) * PER_PAGE + 1}–
                      {Math.min(currentPage * PER_PAGE, historicoSessoes.length)}
                    </strong>{" "}
                    de {historicoSessoes.length} sessões
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - currentPage) <= 1,
                      )
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-1">
                          {idx > 0 && p - arr[idx - 1] > 1 && (
                            <span className="px-1 text-muted-foreground">…</span>
                          )}
                          <Button
                            variant={p === currentPage ? "default" : "outline"}
                            size="sm"
                            className="w-9"
                            aria-current={p === currentPage ? "page" : undefined}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        </span>
                      ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Próxima <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </nav>
              )}

            </div>
          </TabsContent>

          <TabsContent value="calendario" className="animate-[fade-up_0.5s_ease-out]">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <div className="card-premium p-6 inline-block w-full">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-display text-2xl font-bold flex items-center gap-3">
                  <Calendar className="text-gold" /> 
                  Eventos em {date?.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="space-y-4">
                  {[
                    { day: "16", title: "Sessão Ordinária", hour: "14h", type: "Legislativo" },
                    { day: "18", title: "Audiência Pública: Orçamento 2027", hour: "19h", type: "Participativo" },
                    { day: "23", title: "Sessão Extraordinária", hour: "10h", type: "Urgência" },
                  ].map((event, idx) => (
                    <div key={idx} className="flex gap-6 p-5 bg-card border border-border rounded-xl hover:border-primary/30 transition-all group">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary text-primary-foreground shrink-0">
                        <span className="text-2xl font-bold leading-none">{event.day}</span>
                        <span className="text-[10px] uppercase font-bold">JUN</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{event.type}</span>
                        </div>
                        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{event.title}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5" /> {event.hour} no Plenário Principal
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="self-center">
                        <ChevronRight />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}