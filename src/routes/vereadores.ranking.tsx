import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import { PaginaHero } from "@/components/pagina-hero";
import { Trophy as IconeHero } from "lucide-react";
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
    <div className="min-h-screen pb-8">
      <PaginaHero
        icone={IconeHero}
        eyebrow="Ranking parlamentar"
        title="Desempenho dos"
        destaque="Vereadores"
        description={<>Métricas calculadas automaticamente a partir dos projetos legislativos apresentados e da presença em sessões plenárias.</>}
      />

      <section className="container-page py-10 md:py-14">
        <Tabs defaultValue="pontuacao_total" className="space-y-6">
          <TabsList className="h-auto max-w-full flex-wrap justify-start gap-1 rounded-2xl border border-border bg-secondary/60 p-1.5">
            {KEYS.map((k) => (
              <TabsTrigger key={String(k.key)} value={String(k.key)} className="min-h-11 gap-2 rounded-xl px-4 data-[state=active]:bg-primary-deep data-[state=active]:text-white">
                <k.icon className="h-4 w-4" aria-hidden /> {k.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {KEYS.map((k) => {
            const sorted = [...rows].sort((a, b) => Number(b[k.key]) - Number(a[k.key]));
            const maior = Math.max(0, ...sorted.map((v) => Number(v[k.key])));
            // Sem atividade registrada não há classificação: o pódio com zeros sugeriria um resultado que não existe.
            const temDados = maior > 0;
            const podio = temDados ? sorted.slice(0, 3) : [];
            const resto = temDados ? sorted.slice(3) : sorted;
            return (
              <TabsContent key={String(k.key)} value={String(k.key)} className="m-0 animate-[fade-up_0.4s_ease-out]">
                {!temDados && rows.length > 0 && (
                  <p className="mb-4 flex items-start gap-2.5 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm">
                    <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.5_0.11_70)]" aria-hidden />
                    Ainda não há atividades registradas nesta categoria. A classificação aparece quando os dados forem publicados.
                  </p>
                )}

                {podio.length > 0 && (
                  <ol className="mb-4 grid gap-3 md:grid-cols-3 md:items-end">
                    {podio.map((v, i) => (
                      <li key={v.id} className={i === 0 ? "md:order-2" : i === 1 ? "md:order-1" : "md:order-3"}>
                        <Link to="/vereadores/$slug" params={{ slug: v.slug || v.id }} className="group block overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl">
                          <div className="relative">
                            <FotoEstudio ouro={i === 0} nome={v.nome} foto={v.foto_url} partido={v.partido} className={i === 0 ? "h-72" : "h-56"} />
                            <span className={`absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full font-display font-bold shadow-md ${i === 0 ? "bg-gold text-gold-foreground" : "bg-primary-deep text-white"}`}>{i + 1}º</span>
                          </div>
                          <div className={`p-4 ${i === 0 ? "acesso-destaque text-white" : ""}`}>
                            <p className={`font-display font-semibold leading-snug ${i === 0 ? "text-lg" : ""}`}>{v.nome}</p>
                            <p className={`mt-0.5 font-display text-2xl font-bold ${i === 0 ? "text-gold" : "text-primary"}`}>{Number(v[k.key])}{k.suffix || ""}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}

                {resto.length > 0 && (
                  <ol className="overflow-hidden rounded-3xl border border-border bg-card" start={podio.length + 1}>
                    {resto.map((v, i) => (
                      <li key={v.id} className="border-b border-border/70 last:border-0">
                        <Link to="/vereadores/$slug" params={{ slug: v.slug || v.id }} className="group flex items-center gap-3 p-3 transition-colors hover:bg-secondary/60 md:gap-4 md:p-4">
                          {temDados && <span className="w-7 shrink-0 text-center font-display font-bold text-muted-foreground">{i + podio.length + 1}º</span>}
                          <FotoEstudio nome={v.nome} foto={v.foto_url} partido={v.partido} className="h-14 w-12 shrink-0 rounded-xl" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold group-hover:text-primary">{v.nome}</span>
                            <span className="block truncate text-xs text-muted-foreground">{[v.cargo, v.partido].filter(Boolean).join(" · ")}</span>
                            {temDados && (
                              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-secondary" aria-hidden>
                                <span className="block h-full rounded-full bg-primary" style={{ width: `${(Number(v[k.key]) / maior) * 100}%` }} />
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-display text-xl font-bold text-primary-deep">{Number(v[k.key])}{k.suffix || ""}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}

                {rows.length === 0 && <EstadoVazio icone={Trophy} titulo="Sem dados ainda" texto="O ranking aparece quando houver atividades registradas." />}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
    </div>
  );
}
