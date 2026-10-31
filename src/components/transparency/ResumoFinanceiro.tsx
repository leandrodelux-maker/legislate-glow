import { useEffect, useState } from "react";
import { Link } from "@/lib/roteador-transparencia";
import { TrendingUp, TrendingDown, Clock, ArrowRight } from "lucide-react";
import { fetchTransparenciaDataset } from "@/hooks/useTransparenciaDataset";

interface Totais {
  receitas_recebidas: string;
  despesas_liquidadas: string;
}

const ANO = new Date().getFullYear();
const numero = (brl: string) => Number(brl.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Totais da página inicial do Portal da Transparência (Megasoft), copiados de hora em hora
// pelo GitHub Actions. Enquanto não houver sincronização, mostra os atalhos para as consultas.
const ResumoFinanceiro = ({ onAtualizado }: { onAtualizado?: (iso: string) => void }) => {
  const [totais, setTotais] = useState<Totais | null>(null);
  const [atualizado, setAtualizado] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    fetchTransparenciaDataset<Totais>("resumo", ANO)
      .then((r) => {
        if (!r?.data[0]) return;
        setTotais(r.data[0]);
        if (r.atualizadoEm) { setAtualizado(r.atualizadoEm); onAtualizado?.(r.atualizadoEm); }
      })
      .catch(() => {})
      .finally(() => setCarregado(true));
  }, [onAtualizado]);

  const receitas = totais ? numero(totais.receitas_recebidas) : 0;
  const despesas = totais ? numero(totais.despesas_liquidadas) : 0;
  const maior = Math.max(receitas, despesas, 1);
  const saldo = receitas - despesas;

  const linhas = [
    { label: "Receitas recebidas", valor: totais?.receitas_recebidas, n: receitas, icon: TrendingUp, cor: "#16a36a", href: "/transparencia/receitas" },
    { label: "Despesas liquidadas", valor: totais?.despesas_liquidadas, n: despesas, icon: TrendingDown, cor: "#E0574A", href: "/transparencia/despesas" },
  ];

  return (
    <section aria-label={`Resumo financeiro de ${ANO}`} className="bg-card text-foreground rounded-3xl shadow-2xl border border-white/10 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold">Execução financeira {ANO}</h2>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">acumulado no ano</span>
      </div>

      <div className="mt-4 space-y-4">
        {linhas.map(({ label, valor, n, icon: Icon, cor, href }) => (
          <Link key={label} to={href} className="group block">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="font-display text-xl md:text-2xl font-bold tabular-nums leading-tight">
                  {valor ?? (carregado ? "—" : <span className="inline-block h-6 w-40 rounded bg-muted animate-pulse align-middle" aria-label="carregando" />)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" aria-hidden />
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-700" style={{ width: totais ? `${(n / maior) * 100}%` : "0%", backgroundColor: cor }} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        {totais ? (
          <span className="text-muted-foreground">
            Diferença no período: <strong className={saldo >= 0 ? "text-emerald-600" : "text-red-600"}>{brl(saldo)}</strong>
          </span>
        ) : (
          <span className="text-muted-foreground">Valores em atualização com o portal oficial.</span>
        )}
        {atualizado && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {new Date(atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </span>
        )}
      </div>
    </section>
  );
};

export default ResumoFinanceiro;
