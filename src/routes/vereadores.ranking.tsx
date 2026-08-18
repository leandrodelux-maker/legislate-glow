import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, FileText, CheckCircle2, MessageSquare, Hand, Loader2 } from "lucide-react";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const Route = createFileRoute("/vereadores/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking de Vereadores — Câmara Municipal" },
      {
        name: "description",
        content:
          "Ranking automático de desempenho parlamentar: projetos, indicações, requerimentos e presença em sessões.",
      },
    ],
  }),
  component: RankingPage,
});

type Row = {
  id: string;
  slug?: string | null;
  nome: string;
  partido: string | null;
  foto_url: string | null;
  cargo: string | null;
  total_projetos: number;
  total_indicacoes: number;
  total_requerimentos: number;
  presencas: number;
  total_sessoes: number;
  percentual_presenca: number;
  pontuacao_total: number;
};

const KEYS: Array<{
  key: keyof Row;
  label: string;
  icon: any;
  suffix?: string;
}> = [
  { key: "pontuacao_total", label: "Geral", icon: Trophy },
  { key: "total_projetos", label: "Projetos", icon: FileText },
  { key: "total_indicacoes", label: "Indicações", icon: MessageSquare },
  { key: "total_requerimentos", label: "Requerimentos", icon: Hand },
  { key: "percentual_presenca", label: "Presença", icon: CheckCircle2, suffix: "%" },
];

function RankingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("vereadores_ranking" as any)
        .select("*");
      if (error) console.error("[ranking] erro:", error);
      setRows(((data as unknown) as Row[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <section className="bg-gradient-to-br from-primary-deep to-primary text-primary-foreground">
        <div className="container-page py-11">
          <div className="text-xs uppercase tracking-[0.2em] text-gold flex items-center gap-3">
            <Trophy className="w-4 h-4" /> Ranking parlamentar
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold">
            Desempenho dos <span className="text-gold">Vereadores</span>
          </h1>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl">
            Métricas calculadas automaticamente a partir dos projetos legislativos
            apresentados e da presença em sessões plenárias.
          </p>
        </div>
      </section>

      <section className="container-page -mt-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <Tabs defaultValue="pontuacao_total">
            <TabsList className="w-full justify-start rounded-none border-b bg-slate-50 p-2 gap-1 overflow-x-auto">
              {KEYS.map((k) => (
                <TabsTrigger key={String(k.key)} value={String(k.key)} className="gap-2">
                  <k.icon className="w-4 h-4" /> {k.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {KEYS.map((k) => {
              const sorted = [...rows].sort(
                (a, b) => Number(b[k.key]) - Number(a[k.key]),
              );
              return (
                <TabsContent key={String(k.key)} value={String(k.key)} className="m-0">
                  <ul className="divide-y divide-slate-100">
                    {sorted.map((v, i) => (
                      <li
                        key={v.id}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition"
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            i === 0
                              ? "bg-gold text-primary-deep"
                              : i < 3
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <VereadorAvatar nome={v.nome} foto={v.foto_url} partido={v.partido} size={48} />
                        <div className="flex-1 min-w-0">
                          <Link
                            to="/vereadores/$slug"
                            params={{ slug: v.slug || v.id }}
                            className="font-semibold text-slate-900 hover:text-primary block truncate"
                          >
                            {v.nome}
                          </Link>
                          <div className="flex gap-2 mt-1">
                            {v.partido && (
                              <Badge variant="secondary" className="text-[10px]">
                                {v.partido}
                              </Badge>
                            )}
                            {v.cargo && (
                              <span className="text-xs text-slate-500">{v.cargo}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl font-bold text-primary-deep">
                            {Number(v[k.key])}
                            {k.suffix || ""}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-slate-400">
                            {k.label}
                          </div>
                        </div>
                      </li>
                    ))}
                    {sorted.length === 0 && (
                      <li className="p-12 text-center text-slate-500">
                        Sem dados ainda.
                      </li>
                    )}
                  </ul>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>
    </div>
  );
}
