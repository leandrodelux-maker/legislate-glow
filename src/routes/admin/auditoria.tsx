import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin/auditoria")({
  component: AuditoriaPage,
});

type Entry = {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  created_at: string;
};

function AuditoriaPage() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data as any[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      r.action.toLowerCase().includes(s) ||
      r.entity_type.toLowerCase().includes(s) ||
      (r.user_email ?? "").toLowerCase().includes(s) ||
      JSON.stringify(r.metadata ?? {}).toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-[fade-up_0.4s_ease-out]">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-primary" /> Auditoria
          </h1>
          <p className="text-muted-foreground">Histórico completo de alterações no sistema.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar ação, entidade ou usuário..."
            className="pl-9 w-80"
          />
        </div>
      </div>

      <Card className="overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Usuário</th>
                <th className="px-4 py-3 text-left font-semibold">Ação</th>
                <th className="px-4 py-3 text-left font-semibold">Entidade</th>
                <th className="px-4 py-3 text-left font-semibold">Campos modificados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                      {format(new Date(r.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3">{r.user_email ?? <span className="text-muted-foreground">Sistema</span>}</td>
                    <td className="px-4 py-3 font-medium">{r.action}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{r.entity_type}</Badge></td>
                    <td className="px-4 py-3">
                      <ChangedFields metadata={r.metadata} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  contact_phone: "Telefone",
  contact_email: "E-mail",
  contact_hours: "Horário de atendimento",
  whatsapp: "WhatsApp",
  endereco: "Endereço",
  nome_camara: "Nome da Câmara",
  redes_sociais: "Redes sociais",
  cookies_enabled: "Aviso de cookies (ativo)",
  cookies_text: "Texto de cookies",
  privacy_policy: "Política de Privacidade",
  terms_of_use: "Termos de Uso",
};

function short(v: unknown) {
  if (v === null || v === undefined) return "—";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}

function ChangedFields({ metadata }: { metadata: any }) {
  const alteracoes = Array.isArray(metadata?.alteracoes) ? metadata.alteracoes : null;
  if (!alteracoes || alteracoes.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  return (
    <ul className="space-y-1.5 min-w-[18rem]">
      {alteracoes.map((c: any, i: number) => (
        <li key={i} className="text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">{FIELD_LABELS[c.campo] ?? c.campo}</span>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {c.grupo === "lgpd" ? "LGPD" : "Contato"}
            </Badge>
          </div>
          <div className="text-muted-foreground">
            <span className="line-through">{short(c.de)}</span>
            {" → "}
            <span className="text-foreground">{short(c.para)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

