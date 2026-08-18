import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Newspaper, Calendar, FileText, Gavel, TrendingUp, Eye, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

type Stats = {
  vereadores: number;
  noticias: number;
  sessoes: number;
  documentos: number;
  projetos: number;
};

function StatCard({ icon: Icon, label, value, accent, loading }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg grid place-items-center ${accent}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
      )}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<Array<{ mes: string; noticias: number; sessoes: number }>>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [v, n, s, d, p, news] = await Promise.all([
        supabase.from("vereadores").select("id", { count: "exact", head: true }),
        supabase.from("noticias").select("id", { count: "exact", head: true }),
        supabase.from("sessoes").select("id", { count: "exact", head: true }),
        supabase.from("transparencia_documentos").select("id", { count: "exact", head: true }),
        supabase.from("projetos_legislativos").select("id", { count: "exact", head: true }),
        supabase.from("noticias").select("id,titulo,categoria,publicado_em,created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        vereadores: v.count ?? 0,
        noticias: n.count ?? 0,
        sessoes: s.count ?? 0,
        documentos: d.count ?? 0,
        projetos: p.count ?? 0,
      });
      setLatest((news.data as any[]) ?? []);

      // Gerar dados de gráfico dos últimos 6 meses
      const months: Record<string, { noticias: number; sessoes: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("pt-BR", { month: "short" });
        months[key] = { noticias: 0, sessoes: 0 };
      }

      const [allNoticias, allSessoes] = await Promise.all([
        supabase.from("noticias").select("created_at").gte("created_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()),
        supabase.from("sessoes").select("data_sessao").gte("data_sessao", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()),
      ]);

      (allNoticias.data ?? []).forEach((row: any) => {
        const key = new Date(row.created_at).toLocaleDateString("pt-BR", { month: "short" });
        if (months[key]) months[key].noticias++;
      });
      (allSessoes.data ?? []).forEach((row: any) => {
        const key = new Date(row.data_sessao).toLocaleDateString("pt-BR", { month: "short" });
        if (months[key]) months[key].sessoes++;
      });

      setChartData(Object.entries(months).map(([mes, v]) => ({ mes, ...v })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-8 animate-[fade-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Visão geral do portal da Câmara Municipal.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Vereadores" value={stats?.vereadores} accent="bg-blue-500" loading={loading} />
        <StatCard icon={Newspaper} label="Notícias" value={stats?.noticias} accent="bg-emerald-500" loading={loading} />
        <StatCard icon={Calendar} label="Sessões" value={stats?.sessoes} accent="bg-amber-500" loading={loading} />
        <StatCard icon={FileText} label="Documentos" value={stats?.documentos} accent="bg-violet-500" loading={loading} />
        <StatCard icon={Gavel} label="Projetos" value={stats?.projetos} accent="bg-rose-500" loading={loading} />
        <StatCard icon={Eye} label="Acessos" value="—" accent="bg-slate-500" loading={false} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Publicações</h3>
              <p className="text-xs text-slate-500">Últimos 6 meses</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="noticias" stroke="#10b981" strokeWidth={2} name="Notícias" />
                <Line type="monotone" dataKey="sessoes" stroke="#f59e0b" strokeWidth={2} name="Sessões" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Últimas Notícias</h3>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : latest.length === 0
              ? <p className="text-sm text-slate-400">Nenhuma notícia ainda.</p>
              : latest.map((n) => (
                <div key={n.id} className="border-l-2 border-primary pl-3 py-1">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">{n.titulo}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{n.categoria ?? "—"} · {new Date(n.publicado_em ?? n.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
