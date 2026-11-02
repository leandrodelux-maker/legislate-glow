import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, Clock, FileText, Gavel, Inbox, Mail, MessageSquare, Newspaper, Plus, ScrollText, Users, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginaModulo } from "@/components/admin/painel/PaginaModulo";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

type Dados = {
  vereadores: number;
  noticias: number;
  sessoes: number;
  projetos: number;
  esicAbertos: number;
  esicVencidos: number;
  ouvidoriaAbertos: number;
  semAta: number;
  rascunhos: number;
  proximas: { id: string; titulo: string; data_sessao: string; local: string | null }[];
  ultimas: { id: string; titulo: string; publicado: boolean; created_at: string }[];
};

const ATALHOS: { rotulo: string; to: string; icone: LucideIcon }[] = [
  { rotulo: "Nova notícia", to: "/admin/noticias?novo=1", icone: Newspaper },
  { rotulo: "Nova sessão", to: "/admin/sessoes?novo=1", icone: Calendar },
  { rotulo: "Novo projeto", to: "/admin/projetos?novo=1", icone: Gavel },
  { rotulo: "Nova portaria", to: "/admin/portarias?novo=1", icone: ScrollText },
];

const conta = (r: { count: number | null }) => r.count ?? 0;

function Dashboard() {
  const { user } = useSupabaseAuth();
  const [d, setD] = useState<Dados | null>(null);

  useEffect(() => {
    (async () => {
      const base = (t: string) => (supabase as any).from(t).select("id", { count: "exact", head: true });
      const agora = new Date().toISOString();
      const hoje = agora.slice(0, 10);
      const [v, n, s, p, ea, ev, oa, sa, ra, pr, ul] = await Promise.all([
        base("vereadores").eq("ativo", true),
        base("noticias"),
        base("sessoes"),
        base("projetos_legislativos"),
        base("esic_solicitacoes").in("status", ["pendente", "analise", "prorrogado"]),
        base("esic_solicitacoes").in("status", ["pendente", "analise", "prorrogado"]).lt("prazo_resposta", hoje),
        base("ouvidoria_protocolos").in("status", ["aberto", "em_andamento"]),
        base("sessoes").eq("status", "realizada").eq("ata_publicada", false),
        base("noticias").eq("publicado", false),
        supabase.from("sessoes").select("id,titulo,data_sessao,local").gte("data_sessao", agora).order("data_sessao").limit(4),
        supabase.from("noticias").select("id,titulo,publicado,created_at").order("created_at", { ascending: false }).limit(4),
      ]);
      setD({
        vereadores: conta(v), noticias: conta(n), sessoes: conta(s), projetos: conta(p),
        esicAbertos: conta(ea), esicVencidos: conta(ev), ouvidoriaAbertos: conta(oa), semAta: conta(sa), rascunhos: conta(ra),
        proximas: (pr.data as Dados["proximas"]) ?? [],
        ultimas: (ul.data as Dados["ultimas"]) ?? [],
      });
    })();
  }, []);

  const nome = String(user?.user_metadata?.full_name || "").split(" ")[0];
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const pendencias = d
    ? [
        d.esicVencidos > 0 && { icone: AlertTriangle, urgente: true, titulo: `${d.esicVencidos} ${d.esicVencidos === 1 ? "pedido do e-SIC com prazo vencido" : "pedidos do e-SIC com prazo vencido"}`, texto: "Responda ou registre a prorrogação.", to: "/admin/cms/esic" },
        d.esicAbertos - d.esicVencidos > 0 && { icone: Mail, titulo: `${d.esicAbertos - d.esicVencidos} ${d.esicAbertos - d.esicVencidos === 1 ? "pedido do e-SIC aguardando" : "pedidos do e-SIC aguardando"}`, texto: "Dentro do prazo legal.", to: "/admin/cms/esic" },
        d.ouvidoriaAbertos > 0 && { icone: MessageSquare, titulo: `${d.ouvidoriaAbertos} ${d.ouvidoriaAbertos === 1 ? "manifestação na Ouvidoria" : "manifestações na Ouvidoria"}`, texto: "Aguardando resposta.", to: "/admin/cms/ouvidoria" },
        d.semAta > 0 && { icone: FileText, titulo: `${d.semAta} ${d.semAta === 1 ? "sessão realizada sem ata" : "sessões realizadas sem ata"}`, texto: "A Atricon avalia a publicação das atas.", to: "/admin/sessoes" },
        d.rascunhos > 0 && { icone: Newspaper, titulo: `${d.rascunhos} ${d.rascunhos === 1 ? "notícia em rascunho" : "notícias em rascunho"}`, texto: "Ainda não aparecem no site.", to: "/admin/noticias" },
      ].filter(Boolean) as { icone: LucideIcon; urgente?: boolean; titulo: string; texto: string; to: string }[]
    : [];

  return (
    <PaginaModulo titulo={`${saudacao}${nome ? `, ${nome}` : ""}`} descricao="O que precisa da sua atenção hoje e os atalhos para o dia a dia.">
      <div className="flex flex-wrap gap-2">
        {ATALHOS.map((a) => (
          <a key={a.to} href={a.to} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <Plus className="h-4 w-4 text-primary" aria-hidden /> {a.rotulo}
          </a>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section aria-labelledby="titulo-atencao" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="titulo-atencao" className="font-display text-lg font-bold">Precisa de atenção</h2>
          {!d ? (
            <div className="mt-4 space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : pendencias.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/5 p-5">
              <CheckCircle2 className="h-7 w-7 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-display font-semibold">Tudo em dia</p>
                <p className="text-sm text-muted-foreground">Nenhum pedido aguardando e nenhuma ata pendente.</p>
              </div>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {pendencias.map((p) => (
                <li key={p.titulo}>
                  <Link to={p.to as never} className={`group flex items-center gap-3 rounded-xl border p-3.5 transition hover:shadow-sm ${p.urgente ? "border-destructive/40 bg-destructive/5" : "border-border hover:border-primary/40"}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${p.urgente ? "bg-destructive text-white" : "bg-primary/10 text-primary"}`}><p.icone className="h-5 w-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug">{p.titulo}</span>
                      <span className="block text-sm text-muted-foreground">{p.texto}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titulo-agenda" className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 id="titulo-agenda" className="font-display text-lg font-bold">Próximas sessões</h2>
            <Link to="/admin/sessoes" className="text-sm font-semibold text-primary hover:underline">Ver todas</Link>
          </div>
          {!d ? (
            <Skeleton className="mt-4 h-24 w-full rounded-xl" />
          ) : d.proximas.length === 0 ? (
            <div className="mt-4 rounded-xl bg-secondary/60 p-5 text-center">
              <Inbox className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma sessão agendada.</p>
              <a href="/admin/sessoes?novo=1" className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">Agendar sessão</a>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {d.proximas.map((s) => {
                const dt = new Date(s.data_sessao);
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-deep text-center text-white">
                      <span><span className="block font-display font-bold leading-none">{dt.toLocaleDateString("pt-BR", { day: "2-digit" })}</span><span className="block text-[11px] font-bold uppercase text-gold">{dt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span></span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{s.titulo}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" aria-hidden /> {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}{s.local ? ` · ${s.local}` : ""}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { r: "Vereadores ativos", v: d?.vereadores, i: Users, to: "/admin/vereadores" },
          { r: "Sessões", v: d?.sessoes, i: Calendar, to: "/admin/sessoes" },
          { r: "Projetos", v: d?.projetos, i: Gavel, to: "/admin/projetos" },
          { r: "Notícias", v: d?.noticias, i: Newspaper, to: "/admin/noticias" },
        ].map((c) => (
          <Link key={c.r} to={c.to as never} className="group rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">{c.r}</dt>
              <c.i className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <dd className="mt-1 font-display text-3xl font-bold tabular-nums">{c.v ?? <Skeleton className="h-9 w-14" />}</dd>
          </Link>
        ))}
      </dl>

      {d && d.ultimas.length > 0 && (
        <section aria-labelledby="titulo-noticias" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="titulo-noticias" className="font-display text-lg font-bold">Últimas notícias</h2>
          <ul className="mt-3 divide-y divide-border/70">
            {d.ultimas.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate font-medium">{n.titulo}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${n.publicado ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{n.publicado ? "Publicada" : "Rascunho"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PaginaModulo>
  );
}
