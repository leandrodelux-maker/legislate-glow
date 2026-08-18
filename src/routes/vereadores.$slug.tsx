import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  Phone,
  User,
  ChevronLeft,
  Camera as InstagramIcon,
  Share2 as TwitterIcon,
  MessageSquare as FacebookIcon,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Trophy,
  CheckCircle2,
  FileText,
  Loader2,
  Vote,
  Gavel,
  
  Award,
  ExternalLink,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { useContactInfo } from "@/hooks/use-contact-info";

export const Route = createFileRoute("/vereadores/$slug")({
  component: VereadorDetailPage,
});

type Vereador = any;
type Projeto = any;
type PresencaRow = { id: string; presente: boolean; sessao: { id: string; titulo: string; data_sessao: string; tipo: string | null; ata_url: string | null } | null };
type VotacaoRow = { id: string; voto: string; created_at: string; sessao: { id: string; titulo: string; data_sessao: string } | null };
type Mandato = any;
type GaleriaItem = any;

function statusVariant(s?: string | null) {
  const v = (s || "").toLowerCase();
  if (v.includes("aprov")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (v.includes("rejei") || v.includes("arqu")) return "bg-rose-100 text-rose-700 border-rose-200";
  if (v.includes("tramit") || v.includes("anális") || v.includes("analise")) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function VotoBadge({ voto }: { voto: string }) {
  const v = (voto || "").toLowerCase();
  if (v.includes("sim") || v.includes("favor")) {
    return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">A favor</Badge>;
  }
  if (v.includes("não") || v.includes("nao") || v.includes("contra")) {
    return <Badge className="bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-100">Contra</Badge>;
  }
  if (v.includes("absten")) {
    return <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">Abstenção</Badge>;
  }
  return <Badge variant="outline">{voto}</Badge>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function VereadorDetailPage() {
  const { slug } = Route.useParams();
const contato = useContactInfo();
  const [vereador, setVereador] = useState<Vereador | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [presencas, setPresencas] = useState<PresencaRow[]>([]);
  const [votacoes, setVotacoes] = useState<VotacaoRow[]>([]);
  const [mandatos, setMandatos] = useState<Mandato[]>([]);
  const [galeria, setGaleria] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<string>("Todos");
  const [presencaBusca, setPresencaBusca] = useState("");
  const [presencaFiltro, setPresencaFiltro] = useState<"todas" | "presentes" | "ausentes">("todas");
  const [presencaPagina, setPresencaPagina] = useState(1);
  const PRESENCAS_POR_PAGINA = 10;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const isUuid = UUID_RE.test(slug);
        const query = (supabase as any)
          .from("vereadores")
          .select("id, nome, partido, cargo, foto_url, biografia, gabinete, email, telefone, mandato_inicio, mandato_fim, ativo, ordem, created_at, updated_at, naturalidade, escolaridade, profissao, redes_sociais, stats, data_posse, mandato_atual, slug, legislatura, comissoes")
          .limit(1);
        const { data: vData, error: vErr } = isUuid
          ? await query.eq("id", slug).maybeSingle()
          : await query.eq("slug", slug).maybeSingle();
        if (vErr) throw vErr;
        if (!vData) { if (!cancelled) setVereador(null); return; }
        if (cancelled) return;
        setVereador(vData);
        const id = vData.id;

        const [pr, pres, vot, mand, gal] = await Promise.all([
          supabase.from("projetos_legislativos")
            .select("id, numero, ano, tipo, ementa, status, data_apresentacao, documento_url, autor, autor_id")
            .or(`autor_id.eq.${id},autor.ilike.%${(vData.nome || "").replace(/[%_]/g, "")}%`)
            .order("data_apresentacao", { ascending: false })
            .limit(100),
          supabase.from("sessoes_presencas")
            .select("id, presente, sessao:sessoes(id, titulo, data_sessao, tipo, ata_url)")
            .eq("vereador_id", id)
            .limit(500),
          supabase.from("sessoes_votacoes")
            .select("id, voto, created_at, sessao:sessoes(id, titulo, data_sessao)")
            .eq("vereador_id", id)
            .order("created_at", { ascending: false })
            .limit(100),
          supabase.from("vereadores_mandatos")
            .select("*").eq("vereador_id", id).order("data_inicio", { ascending: false }),
          supabase.from("vereadores_galeria")
            .select("*").eq("vereador_id", id).order("ordem", { ascending: true }).limit(24),
        ]);

        if (cancelled) return;
        setProjetos((pr.data as any[]) ?? []);
        setPresencas(
          (((pres.data as any[]) ?? []) as PresencaRow[]).slice().sort((a, b) => {
            const da = a.sessao?.data_sessao ? new Date(a.sessao.data_sessao).getTime() : 0;
            const db = b.sessao?.data_sessao ? new Date(b.sessao.data_sessao).getTime() : 0;
            return db - da;
          }),
        );
        setVotacoes((vot.data as any[]) ?? []);
        setMandatos((mand.data as any[]) ?? []);
        setGaleria((gal.data as any[]) ?? []);
      } catch (e) {
        console.error("Erro ao carregar perfil do vereador:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const computed = useMemo(() => {
    const totalSessoes = presencas.length;
    const totalPresentes = presencas.filter((p) => p.presente).length;
    const totalAusencias = totalSessoes - totalPresentes;
    const taxaPresenca = totalSessoes > 0 ? Math.round((totalPresentes / totalSessoes) * 100) : 0;
    const aprovados = projetos.filter((p) => (p.status || "").toLowerCase().includes("aprov")).length;
    return { totalSessoes, totalPresentes, totalAusencias, taxaPresenca, aprovados };
  }, [presencas, projetos]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  if (!vereador) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Vereador não encontrado</h1>
        <Button asChild>
          <Link to="/vereadores">Voltar para a lista</Link>
        </Button>
      </div>
    );
  }

  const redes = (vereador.redes_sociais as any) || {};
  const mandatoLabel =
    vereador.mandato_atual ||
    (vereador.mandato_inicio && vereador.mandato_fim
      ? `${new Date(vereador.mandato_inicio).getFullYear()}–${new Date(vereador.mandato_fim).getFullYear()}`
      : "Legislatura atual");

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary-deep to-primary text-primary-foreground pt-12 pb-32">
        <div className="container-page">
          <Button variant="ghost" asChild className="text-white hover:text-gold hover:bg-white/10 mb-8">
            <Link to="/vereadores">
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar para a lista
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <VereadorAvatar
              nome={vereador.nome}
              foto={vereador.foto_url}
              partido={vereador.partido}
              size={240}
              rounded="2xl"
              fit="contain"
              className="border-4 border-white/20 shadow-2xl bg-white"
            />

            <div className="text-center md:text-left flex-1">
              <Badge className="bg-gold text-primary-deep mb-4 px-4 py-1">
                Mandato {mandatoLabel}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">{vereador.nome}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-white/80">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">{vereador.partido}</Badge>
                <span className="w-1 h-1 bg-white/30 rounded-full hidden md:block" />
                <span className="font-medium text-gold uppercase tracking-widest text-sm">
                  {vereador.cargo || "Vereador"}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                {redes.instagram && (
                  <a href={`https://instagram.com/${String(redes.instagram).replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/20 text-white hover:bg-gold hover:text-primary-deep">
                      <InstagramIcon className="w-5 h-5" />
                    </Button>
                  </a>
                )}
                {redes.facebook && (
                  <a href={redes.facebook} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/20 text-white hover:bg-gold hover:text-primary-deep">
                      <FacebookIcon className="w-5 h-5" />
                    </Button>
                  </a>
                )}
                {redes.twitter && (
                  <a href={redes.twitter} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/20 text-white hover:bg-gold hover:text-primary-deep">
                      <TwitterIcon className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container-page -mt-20 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-6">
            {/* Desempenho */}
            <Card className="border-none shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" /> Desempenho
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Taxa de presença</p>
                      <span className="text-sm font-bold text-primary">{computed.taxaPresenca}%</span>
                    </div>
                    <Progress value={computed.taxaPresenca} className="h-2" />
                    <p className="mt-2 text-xs text-slate-500">
                      {computed.totalPresentes} presenças em {computed.totalSessoes} sessões
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <FileText className="w-5 h-5 text-primary/40 mb-2" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Projetos</p>
                      <p className="text-2xl font-display font-bold text-primary">{projetos.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <Award className="w-5 h-5 text-primary/40 mb-2" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Aprovados</p>
                      <p className="text-2xl font-display font-bold text-primary">{computed.aprovados}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-5 h-5 text-primary/40 mb-2" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Presenças</p>
                      <p className="text-2xl font-display font-bold text-primary">{computed.totalPresentes}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <Vote className="w-5 h-5 text-primary/40 mb-2" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Votações</p>
                      <p className="text-2xl font-display font-bold text-primary">{votacoes.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato institucional */}
            <Card className="border-none shadow-xl">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display font-bold text-xl mb-2">Contato</h3>
                <div className="space-y-4">
                  <ContactRow icon={<Mail className="w-5 h-5 text-primary" />} label="E-mail institucional" value={contato.email} />
                  <ContactRow icon={<Phone className="w-5 h-5 text-primary" />} label="Telefone institucional" value={contato.telefone} />
                  <ContactRow icon={<MapPin className="w-5 h-5 text-primary" />} label="Gabinete" value={vereador.gabinete || "Câmara Municipal"} />
                </div>
                <p className="text-[11px] text-slate-400">
                  O atendimento a vereadores é feito pelos canais oficiais da Câmara.
                </p>
              </CardContent>

            </Card>

            {/* Mandatos / cargos */}
            {mandatos.length > 0 && (
              <Card className="border-none shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gold" /> Mandatos e Cargos
                  </h3>
                  <ul className="space-y-3">
                    {mandatos.map((m) => (
                      <li key={m.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800">{m.mandato || "Mandato"}</p>
                          {m.partido && <Badge variant="outline">{m.partido}</Badge>}
                        </div>
                        {m.cargo_mesa && <p className="text-sm text-gold font-semibold mt-1">{m.cargo_mesa}</p>}
                        <p className="text-xs text-slate-500 mt-1">
                          {m.data_inicio ? new Date(m.data_inicio).toLocaleDateString("pt-BR") : "—"}
                          {" "}até{" "}
                          {m.data_fim ? new Date(m.data_fim).toLocaleDateString("pt-BR") : "atual"}
                        </p>
                        {m.observacoes && <p className="text-sm text-slate-600 mt-2">{m.observacoes}</p>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl min-h-[500px]">
              <Tabs defaultValue="biografia" className="w-full">
                <div className="px-2 md:px-6 border-b border-slate-100 overflow-x-auto">
                  <TabsList className="bg-transparent h-16 gap-2 md:gap-6">
                    {[
                      { v: "biografia", l: "Biografia" },
                      { v: "info", l: "Informações" },
                      { v: "projetos", l: `Projetos (${projetos.length})` },
                      { v: "presencas", l: `Sessões (${computed.totalSessoes})` },
                      { v: "votacoes", l: `Votações (${votacoes.length})` },
                      ...(galeria.length > 0 ? [{ v: "galeria", l: `Galeria` }] : []),
                    ].map((t) => (
                      <TabsTrigger
                        key={t.v}
                        value={t.v}
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gold data-[state=active]:text-primary rounded-none h-16 font-bold text-slate-500 whitespace-nowrap"
                      >
                        {t.l}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <CardContent className="p-6 md:p-8">
                  {/* BIOGRAFIA */}
                  <TabsContent value="biografia" className="mt-0">
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                        {vereador.biografia || "Nenhuma biografia disponível."}
                      </p>
                    </div>
                  </TabsContent>

                  {/* INFORMAÇÕES PESSOAIS */}
                  <TabsContent value="info" className="mt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      <InfoRow icon={<MapPin className="w-6 h-6 text-gold" />} label="Naturalidade" value={vereador.naturalidade} />
                      <InfoRow icon={<GraduationCap className="w-6 h-6 text-gold" />} label="Escolaridade" value={vereador.escolaridade} />
                      <InfoRow icon={<Briefcase className="w-6 h-6 text-gold" />} label="Profissão" value={vereador.profissao} />
                      <InfoRow icon={<Calendar className="w-6 h-6 text-gold" />} label="Data de posse"
                        value={vereador.data_posse ? new Date(vereador.data_posse).toLocaleDateString("pt-BR") : null} />
                      <InfoRow icon={<Award className="w-6 h-6 text-gold" />} label="Cargo" value={vereador.cargo || "Vereador"} />
                      <InfoRow icon={<Award className="w-6 h-6 text-gold" />} label="Legislatura" value={vereador.legislatura || vereador.mandato_atual} />
                      <InfoRow icon={<Trophy className="w-6 h-6 text-gold" />} label="Comissões" value={vereador.comissoes} />
                    </div>
                  </TabsContent>

                  {/* PROJETOS */}
                  <TabsContent value="projetos" className="mt-0">
                    {(() => {
                      const tipos = ["Todos", ...Array.from(new Set(projetos.map((p) => p.tipo).filter(Boolean)))];
                      const filtrados = tipoFiltro === "Todos" ? projetos : projetos.filter((p) => p.tipo === tipoFiltro);
                      return (
                        <>
                          {tipos.length > 1 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {tipos.map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setTipoFiltro(t)}
                                  className={
                                    "px-3 py-1.5 rounded-full text-xs font-bold border transition " +
                                    (tipoFiltro === t
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-white text-slate-600 border-slate-200 hover:border-primary/50")
                                  }
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          )}
                          {filtrados.length === 0 ? (
                            <EmptyState icon={<Gavel className="w-10 h-10 text-slate-300" />} text="Nenhum ato legislativo registrado." />
                          ) : (
                            <ul className="divide-y divide-slate-100">
                              {filtrados.map((p) => (
                          <li key={p.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {p.tipo || "Projeto"} {p.numero ? `${p.numero}/${p.ano ?? ""}` : ""}
                                  </Badge>
                                  <Badge className={statusVariant(p.status) + " border"}>
                                    {p.status || "Em análise"}
                                  </Badge>
                                </div>
                                <p className="text-slate-700 leading-snug">{p.ementa || "Sem ementa."}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {p.data_apresentacao ? new Date(p.data_apresentacao).toLocaleDateString("pt-BR") : "Data não informada"}
                                </p>
                              </div>
                              {p.documento_url && (
                                <a href={p.documento_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline" className="gap-1">
                                    <ExternalLink className="w-3.5 h-3.5" /> Documento
                                  </Button>
                                </a>
                              )}
                            </div>
                          </li>
                            ))}
                          </ul>
                          )}
                        </>
                      );
                    })()}
                  </TabsContent>

                  {/* PRESENÇAS */}
                  <TabsContent value="presencas" className="mt-0">
                    {presencas.length === 0 ? (
                      <EmptyState icon={<CheckCircle2 className="w-10 h-10 text-slate-300" />} text="Nenhum registro de presença encontrado." />
                    ) : (
                      (() => {
                        const termo = presencaBusca.trim().toLowerCase();
                        const filtradas = presencas.filter((p) => {
                          if (presencaFiltro === "presentes" && !p.presente) return false;
                          if (presencaFiltro === "ausentes" && p.presente) return false;
                          if (!termo) return true;
                          const data = p.sessao?.data_sessao
                            ? new Date(p.sessao.data_sessao).toLocaleDateString("pt-BR")
                            : "";
                          return `${p.sessao?.titulo ?? ""} ${p.sessao?.tipo ?? ""} ${data}`
                            .toLowerCase()
                            .includes(termo);
                        });
                        const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PRESENCAS_POR_PAGINA));
                        const pagina = Math.min(presencaPagina, totalPaginas);
                        const inicio = (pagina - 1) * PRESENCAS_POR_PAGINA;
                        const visiveis = filtradas.slice(inicio, inicio + PRESENCAS_POR_PAGINA);

                        return (
                          <div className="space-y-5">
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { l: "Sessões", v: computed.totalSessoes, c: "text-primary" },
                                { l: "Presenças", v: computed.totalPresentes, c: "text-emerald-600" },
                                { l: "Faltas", v: computed.totalAusencias, c: "text-rose-600" },
                              ].map((s) => (
                                <div key={s.l} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-center">
                                  <p className={`font-display text-2xl font-bold ${s.c}`}>{s.v}</p>
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.l}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex gap-2">
                                {([
                                  { v: "todas", l: "Todas" },
                                  { v: "presentes", l: "Presentes" },
                                  { v: "ausentes", l: "Faltas" },
                                ] as const).map((f) => (
                                  <button
                                    key={f.v}
                                    onClick={() => { setPresencaFiltro(f.v); setPresencaPagina(1); }}
                                    className={
                                      "rounded-full border px-3 py-1.5 text-xs font-bold transition " +
                                      (presencaFiltro === f.v
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-primary/50")
                                    }
                                  >
                                    {f.l}
                                  </button>
                                ))}
                              </div>
                              <input
                                type="search"
                                value={presencaBusca}
                                onChange={(e) => { setPresencaBusca(e.target.value); setPresencaPagina(1); }}
                                placeholder="Pesquisar sessão ou data..."
                                aria-label="Pesquisar sessão"
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 sm:w-64"
                              />
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100">
                              <div className="hidden grid-cols-[110px_1fr_120px_90px] gap-3 bg-primary px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-primary-foreground md:grid">
                                <span>Data</span>
                                <span>Pauta</span>
                                <span className="text-center">Participou</span>
                                <span className="text-center">Ata</span>
                              </div>
                              {visiveis.length === 0 ? (
                                <p className="px-4 py-8 text-center text-sm text-slate-500">
                                  Nenhuma sessão encontrada para este filtro.
                                </p>
                              ) : (
                                <ul className="divide-y divide-slate-100">
                                  {visiveis.map((p) => (
                                    <li
                                      key={p.id}
                                      className="flex flex-wrap items-center gap-3 px-4 py-3 odd:bg-slate-50/60 md:grid md:grid-cols-[110px_1fr_120px_90px]"
                                    >
                                      <span className="text-sm text-slate-500">
                                        {p.sessao?.data_sessao
                                          ? new Date(p.sessao.data_sessao).toLocaleDateString("pt-BR")
                                          : "—"}
                                      </span>
                                      <span className="min-w-0 flex-1 text-sm font-bold text-primary">
                                        {p.sessao?.titulo || "Sessão"}
                                        {p.sessao?.tipo && (
                                          <span className="ml-2 text-[11px] font-medium uppercase text-slate-400">
                                            {p.sessao.tipo}
                                          </span>
                                        )}
                                      </span>
                                      <span className="md:text-center">
                                        {p.presente ? (
                                          <Badge className="gap-1 border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> SIM
                                          </Badge>
                                        ) : (
                                          <Badge className="gap-1 border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100">
                                            <XCircle className="h-3.5 w-3.5" /> NÃO
                                          </Badge>
                                        )}
                                      </span>
                                      <span className="md:text-center">
                                        {p.sessao?.ata_url ? (
                                          <a href={p.sessao.ata_url} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                                              <ExternalLink className="h-3.5 w-3.5" /> Ata
                                            </Button>
                                          </a>
                                        ) : (
                                          <span className="text-xs text-slate-400">—</span>
                                        )}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {totalPaginas > 1 && (
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs text-slate-500">
                                  Mostrando {inicio + 1}–{Math.min(inicio + PRESENCAS_POR_PAGINA, filtradas.length)} de{" "}
                                  {filtradas.length} sessões
                                </p>
                                <div className="flex flex-wrap items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    disabled={pagina === 1}
                                    onClick={() => setPresencaPagina(pagina - 1)}
                                  >
                                    Anterior
                                  </Button>
                                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                                    <button
                                      key={n}
                                      onClick={() => setPresencaPagina(n)}
                                      aria-current={n === pagina ? "page" : undefined}
                                      className={
                                        "h-8 w-8 rounded-md border text-xs font-bold transition " +
                                        (n === pagina
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-slate-200 bg-white text-slate-600 hover:border-primary/50")
                                      }
                                    >
                                      {n}
                                    </button>
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    disabled={pagina === totalPaginas}
                                    onClick={() => setPresencaPagina(pagina + 1)}
                                  >
                                    Próxima
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </TabsContent>


                  {/* VOTAÇÕES */}
                  <TabsContent value="votacoes" className="mt-0">
                    {votacoes.length === 0 ? (
                      <EmptyState icon={<MinusCircle className="w-10 h-10 text-slate-300" />} text="Nenhuma votação registrada." />
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {votacoes.map((v) => (
                          <li key={v.id} className="py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-700 truncate">{v.sessao?.titulo || "Sessão"}</p>
                              <p className="text-xs text-slate-400">
                                {v.sessao?.data_sessao ? new Date(v.sessao.data_sessao).toLocaleDateString("pt-BR") : new Date(v.created_at).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <VotoBadge voto={v.voto} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>

                  {/* GALERIA */}
                  {galeria.length > 0 && (
                    <TabsContent value="galeria" className="mt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {galeria.map((g) => (
                          <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer"
                             className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                            <img src={g.url} alt={g.legenda || vereador.nome}
                                 className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                            {g.legenda && (
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2">
                                {g.legenda}
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value || "Não informado"}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">{label}</p>
        <p className="font-bold text-slate-700">{value || "Não informado"}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="py-16 flex flex-col items-center text-center gap-3 text-slate-500">
      {icon}
      <p>{text}</p>
    </div>
  );
}
