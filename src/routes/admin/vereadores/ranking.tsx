import { PaginaModulo } from "@/components/admin/painel/PaginaModulo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, FileText, CheckCircle2, MessageSquare, Hand, Loader2, ArrowLeft } from "lucide-react";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/vereadores/ranking")({
  component: AdminRankingPage,
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

function AdminRankingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("vereadores_ranking" as any)
        .select("*");
      if (error) console.error("[admin ranking] erro:", error);
      setRows(((data as unknown) as Row[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <PaginaModulo titulo="Ranking" descricao="Calculado automaticamente a partir dos projetos e da presença nas sessões. Não há o que preencher aqui.">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="overflow-hidden rounded-2xl shadow-none">
          <CardContent className="p-0">
            <Tabs defaultValue="pontuacao_total">
              <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 p-2 gap-1 overflow-x-auto">
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
                    <ul className="divide-y divide-border">
                      {sorted.map((v, i) => (
                        <li
                          key={v.id}
                          className="flex items-center gap-4 p-4 hover:bg-muted/40 transition"
                        >
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              i === 0
                                ? "bg-gold text-primary-deep"
                                : i < 3
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <VereadorAvatar nome={v.nome} foto={v.foto_url} partido={v.partido} size={48} />
                          <div className="flex-1 min-w-0">
                            <Link
                              to="/vereadores/$slug"
                              params={{ slug: v.slug || v.id }}
                              className="font-semibold hover:text-primary block truncate"
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
                                <span className="text-xs text-muted-foreground">{v.cargo}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-2xl font-bold text-primary">
                              {Number(v[k.key])}
                              {k.suffix || ""}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              {k.label}
                            </div>
                          </div>
                        </li>
                      ))}
                      {sorted.length === 0 && (
                        <li className="p-12 text-center text-muted-foreground">
                          Nenhum vereador ativo encontrado.
                        </li>
                      )}
                    </ul>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </PaginaModulo>
  );
}
