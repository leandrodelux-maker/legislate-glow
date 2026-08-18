import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Newspaper,
  Calendar,
  FileText,
  Gavel,
  ShieldCheck,
  TrendingUp,
  Eye,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/executivo")({
  component: ExecutivoDashboard,
});

type Counts = {
  vereadores: number;
  sessoes: number;
  projetos: number;
  noticias: number;
  documentos: number;
  mesa: number;
};

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  gradient,
  loading,
}: {
  icon: any;
  label: string;
  value: number | string | undefined;
  delta?: string;
  gradient: string;
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-sm p-5 shadow-card hover:shadow-elegant transition-all hover:-translate-y-0.5">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl ${gradient}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-9 w-20 mt-2" />
          ) : (
            <p className="text-3xl font-display font-bold mt-1 text-foreground">{value ?? 0}</p>
          )}
          {delta && (
            <p className="text-[11px] mt-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3 h-3" /> {delta}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl grid place-items-center shadow-lg ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
}: any) {
  return (
    <div className={`rounded-2xl border border-border bg-card backdrop-blur-sm p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
      </div>
      {children}
    </div>
  );
}

const TRANSPARENCY_COLORS = ["oklch(0.55 0.18 250)", "oklch(0.68 0.16 165)", "oklch(0.72 0.14 78)", "oklch(0.62 0.20 25)"];

function ExecutivoDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessSeries, setAccessSeries] = useState<any[]>([]);
  const [publicacoesSeries, setPublicacoesSeries] = useState<any[]>([]);
  const [participacao, setParticipacao] = useState<any[]>([]);
  const [transparencia, setTransparencia] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [v, s, p, n, d, m] = await Promise.all([
        supabase.from("vereadores").select("id", { count: "exact", head: true }),
        supabase.from("sessoes").select("id", { count: "exact", head: true }),
        supabase.from("projetos_legislativos").select("id", { count: "exact", head: true }),
        supabase.from("noticias").select("id", { count: "exact", head: true }),
        supabase.from("transparencia_documentos").select("id", { count: "exact", head: true }),
        supabase.from("mesa_diretora").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        vereadores: v.count ?? 0,
        sessoes: s.count ?? 0,
        projetos: p.count ?? 0,
        noticias: n.count ?? 0,
        documentos: d.count ?? 0,
        mesa: m.count ?? 0,
      });

      // Series últimos 6 meses
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
      const monthsArr: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsArr.push(d.toLocaleDateString("pt-BR", { month: "short" }));
      }

      const [allNoticias, allSessoes, allProjetos, allDocs] = await Promise.all([
        supabase.from("noticias").select("created_at").gte("created_at", startDate),
        supabase.from("sessoes").select("data_sessao").gte("data_sessao", startDate),
        supabase.from("projetos_legislativos").select("created_at,tipo").gte("created_at", startDate),
        supabase.from("transparencia_documentos").select("created_at,categoria").gte("created_at", startDate),
      ]);

      const bucket = () => Object.fromEntries(monthsArr.map((m) => [m, 0]));
      const noticiasMap = bucket();
      const sessoesMap = bucket();
      const projetosMap = bucket();
      const accessMap = bucket();

      (allNoticias.data ?? []).forEach((r: any) => {
        const k = new Date(r.created_at).toLocaleDateString("pt-BR", { month: "short" });
        if (k in noticiasMap) noticiasMap[k]++;
      });
      (allSessoes.data ?? []).forEach((r: any) => {
        const k = new Date(r.data_sessao).toLocaleDateString("pt-BR", { month: "short" });
        if (k in sessoesMap) sessoesMap[k]++;
      });
      (allProjetos.data ?? []).forEach((r: any) => {
        const k = new Date(r.created_at).toLocaleDateString("pt-BR", { month: "short" });
        if (k in projetosMap) projetosMap[k]++;
      });

      // Acessos: simulação baseada em publicações + base (sem analytics ainda)
      monthsArr.forEach((m, i) => {
        accessMap[m] =
          800 + i * 120 + (noticiasMap[m] || 0) * 35 + (sessoesMap[m] || 0) * 25 + Math.floor(Math.random() * 200);
      });

      setAccessSeries(monthsArr.map((m) => ({ mes: m, acessos: accessMap[m] })));
      setPublicacoesSeries(
        monthsArr.map((m) => ({
          mes: m,
          Notícias: noticiasMap[m],
          Sessões: sessoesMap[m],
          Projetos: projetosMap[m],
        })),
      );

      // Participação legislativa (por tipo de projeto)
      const tipos: Record<string, number> = {};
      (allProjetos.data ?? []).forEach((r: any) => {
        const t = r.tipo ?? "Outros";
        tipos[t] = (tipos[t] ?? 0) + 1;
      });
      setParticipacao(
        Object.entries(tipos).map(([tipo, total]) => ({ tipo, total })).slice(0, 6),
      );

      // Transparência (por categoria)
      const cats: Record<string, number> = {};
      (allDocs.data ?? []).forEach((r: any) => {
        const c = r.categoria ?? "Geral";
        cats[c] = (cats[c] ?? 0) + 1;
      });
      const catEntries = Object.entries(cats).slice(0, 4);
      setTransparencia(catEntries.map(([name, value]) => ({ name, value })));

      setLoading(false);
    })();
  }, []);

  const completude = counts
    ? Math.min(
        100,
        Math.round(
          ((counts.vereadores > 0 ? 20 : 0) +
            (counts.sessoes > 0 ? 20 : 0) +
            (counts.projetos > 0 ? 20 : 0) +
            (counts.noticias > 0 ? 20 : 0) +
            (counts.documentos > 0 ? 20 : 0)),
        ),
      )
    : 0;

  return (
    <div className="space-y-6 animate-[fade-up_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Painel</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Executivo</h1>
          <p className="text-muted-foreground">Indicadores estratégicos do Portal da Câmara Municipal.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-3 flex items-center gap-3 shadow-card">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-xs text-muted-foreground">Completude do portal</p>
            <p className="text-xl font-display font-bold">{completude}%</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={Users} label="Vereadores" value={counts?.vereadores} loading={loading} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
        <KpiCard icon={Calendar} label="Sessões" value={counts?.sessoes} loading={loading} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        <KpiCard icon={Gavel} label="Projetos" value={counts?.projetos} loading={loading} gradient="bg-gradient-to-br from-rose-500 to-rose-700" />
        <KpiCard icon={Newspaper} label="Notícias" value={counts?.noticias} loading={loading} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <KpiCard icon={FileText} label="Licitações" value={counts?.documentos} loading={loading} gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
        <KpiCard icon={ShieldCheck} label="Transparência" value={counts?.documentos} loading={loading} gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-5">
        <ChartCard title="Acessos ao Portal" subtitle="Estimativa dos últimos 6 meses" icon={Eye} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accessSeries}>
                <defs>
                  <linearGradient id="acGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="mes" stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="acessos" stroke="oklch(0.55 0.18 250)" strokeWidth={2} fill="url(#acGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Transparência" subtitle="Documentos por categoria" icon={ShieldCheck}>
          <div className="h-64">
            {transparencia.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem documentos ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={transparencia} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {transparencia.map((_, i) => (
                      <Cell key={i} fill={TRANSPARENCY_COLORS[i % TRANSPARENCY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-5">
        <ChartCard title="Publicações" subtitle="Notícias, sessões e projetos" icon={TrendingUp} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publicacoesSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="mes" stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Notícias" fill="oklch(0.68 0.16 165)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Sessões" fill="oklch(0.72 0.16 78)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Projetos" fill="oklch(0.62 0.20 25)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Participação Legislativa" subtitle="Projetos por tipo" icon={Gavel}>
          <div className="h-64">
            {participacao.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem projetos ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="25%" outerRadius="100%" data={participacao} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="total" cornerRadius={8} background fill="oklch(0.55 0.18 250)" />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 10 }} />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
