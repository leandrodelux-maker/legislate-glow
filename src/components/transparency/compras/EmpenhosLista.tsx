import { useState } from "react";
import { ChevronDown, ExternalLink, Loader2, Receipt } from "lucide-react";
import { fetchTransparenciaRegistro } from "@/hooks/useTransparenciaDataset";
import { brl, data, formatar, numero, type Registro } from "./formato";

// Cada tela do portal nomeia os campos do empenho de um jeito; aqui vira um formato só.
const primeiro = (r: Registro, campos: string[]) => campos.map((c) => r[c]).find((v) => v != null && v !== "");
const valor = (r: Registro, campos: string[]) => { const n = numero(primeiro(r, campos)); return Number.isFinite(n) ? n : null; };

function normalizarEmpenho(r: Registro) {
  const anulado = valor(r, ["valorDaAnulacaoDoEmpenho"]) ?? 0;
  const anuladoLiq = valor(r, ["valorDaAnulacaoDaLiquidacao"]) ?? 0;
  const empenhado = valor(r, ["valorEmpenhado", "valorDoEmpenho", "valor"]);
  const liquidado = valor(r, ["valorLiquidado", "valorDaLiquidacao"]);
  return {
    codigo: primeiro(r, ["codigoDoEmpenho", "codigo"]),
    numero: primeiro(r, ["numeroDoEmpenho", "numero"]),
    data: primeiro(r, ["data"]),
    quem: primeiro(r, ["fornecedor", "nomeDoFornecedor"]),
    descricao: primeiro(r, ["descricao", "historico"]),
    dotacao: primeiro(r, ["dotacaoOrcamentaria", "classificacaoOrcamentaria"]),
    empenhado: empenhado == null ? null : empenhado - anulado,
    liquidado: liquidado == null ? null : liquidado - anuladoLiq,
    pago: valor(r, ["valorPago"]),
    saldo: valor(r, ["saldo"]),
    anulado,
  };
}
type Empenho = ReturnType<typeof normalizarEmpenho>;

const Ficha = ({ empenho, portal, cor }: { empenho: Empenho; portal?: string; cor: string }) => {
  const [estado, setEstado] = useState<{ carregando: boolean; dados: Record<string, string> | null } | null>(null);
  const [aberto, setAberto] = useState(false);

  const alternar = () => {
    setAberto((a) => !a);
    if (estado || empenho.codigo == null) return;
    const ano = data(empenho.data)?.getFullYear() ?? new Date().getFullYear();
    setEstado({ carregando: true, dados: null });
    fetchTransparenciaRegistro<Record<string, string>>("empenhos", ano, String(empenho.codigo))
      .then((d) => setEstado({ carregando: false, dados: d }))
      .catch(() => setEstado({ carregando: false, dados: null }));
  };

  const base = empenho.empenhado && empenho.empenhado > 0 ? empenho.empenhado : null;
  // Empenho de contrato traz só valor e saldo: a barra mostra o quanto já saiu do saldo.
  const usado = empenho.liquidado ?? (base && empenho.saldo != null ? base - empenho.saldo : null);
  const pct = (v: number | null) => (base && v != null ? Math.min(100, Math.max(0, (v / base) * 100)) : 0);

  return (
    <li className="rounded-2xl border border-border/60 bg-background overflow-hidden">
      <div className="p-4">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}>
            <Receipt className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">
              Empenho nº {String(empenho.numero ?? "—")}
              {empenho.data != null && <span className="font-normal text-muted-foreground"> · {formatar("data", empenho.data)}</span>}
            </p>
            {Boolean(empenho.quem || empenho.descricao) && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{String(empenho.quem ?? empenho.descricao)}</p>
            )}
          </div>
          <button type="button" onClick={alternar} aria-expanded={aberto}
            className="inline-flex items-center gap-1.5 h-9 rounded-xl px-3.5 text-sm font-semibold border border-border/60 hover:bg-muted/60 transition shrink-0">
            {aberto ? "Fechar" : "Abrir"} <ChevronDown className={`h-4 w-4 transition-transform ${aberto ? "rotate-180" : ""}`} aria-hidden />
          </button>
        </div>

        {/* O caminho do dinheiro: empenhado (reservado) → liquidado (entregue) → pago */}
        {base ? (
          <div className="mt-3.5">
            <div className="relative h-2.5 rounded-full bg-muted overflow-hidden" role="img"
              aria-label={`Empenhado ${brl(base)}, ${empenho.liquidado != null ? "liquidado" : "utilizado"} ${brl(usado ?? 0)}${empenho.pago != null ? `, pago ${brl(empenho.pago)}` : ""}`}>
              <span className="absolute inset-y-0 left-0 rounded-full opacity-35" style={{ width: `${pct(usado)}%`, backgroundColor: cor }} />
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct(empenho.pago)}%`, backgroundColor: cor }} />
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div><dt className="text-muted-foreground">Empenhado</dt><dd className="font-bold text-foreground tabular-nums">{brl(base)}</dd></div>
              {empenho.liquidado != null ? (
                <div><dt className="text-muted-foreground">Liquidado</dt><dd className="font-bold text-foreground tabular-nums">{brl(empenho.liquidado)}</dd></div>
              ) : empenho.saldo != null ? (
                <div><dt className="text-muted-foreground">Saldo</dt><dd className="font-bold text-foreground tabular-nums">{brl(empenho.saldo)}</dd></div>
              ) : <div />}
              {empenho.pago != null ? (
                <div className="text-right"><dt className="text-muted-foreground">Pago</dt>
                  <dd className={`font-bold tabular-nums ${empenho.pago > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-500/90"}`}>{brl(empenho.pago)}</dd></div>
              ) : <div />}
            </dl>
          </div>
        ) : null}
      </div>

      {aberto && (
        <div className="border-t border-border/50 bg-muted/30 p-4">
          {empenho.dotacao != null && (
            <p className="text-xs text-muted-foreground mb-3"><strong className="text-foreground">Dotação orçamentária:</strong> {String(empenho.dotacao)}</p>
          )}
          {empenho.descricao != null && empenho.quem != null && (
            <p className="text-xs text-muted-foreground mb-3"><strong className="text-foreground">Descrição:</strong> {String(empenho.descricao)}</p>
          )}
          {estado?.carregando ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Buscando a ficha do empenho…</p>
          ) : estado?.dados ? (
            <dl className="grid sm:grid-cols-2 gap-2">
              {Object.entries(estado.dados).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className={`rounded-xl bg-background border border-border/50 px-3 py-2 ${String(v).length > 50 ? "sm:col-span-2" : ""}`}>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="text-sm text-foreground mt-0.5 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              A ficha completa deste empenho ainda não está na cópia do site.
              {portal && <> <a href={portal} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 inline-flex items-center gap-1" style={{ color: cor }}>Consultar no portal <ExternalLink className="h-3 w-3" aria-hidden /></a></>}
            </p>
          )}
        </div>
      )}
    </li>
  );
};

const EmpenhosLista = ({ linhas, cor, portal }: { linhas: Registro[]; cor: string; portal?: string }) => {
  const empenhos = linhas.map(normalizarEmpenho);
  const soma = (k: "empenhado" | "liquidado" | "pago") => empenhos.some((e) => e[k] != null) ? empenhos.reduce((s, e) => s + (e[k] ?? 0), 0) : null;
  const resumo = [["Empenhado", soma("empenhado")], ["Liquidado", soma("liquidado")], ["Pago", soma("pago")]] as const;
  return (
    <div>
      {empenhos.length > 1 && (
        <dl className="grid grid-cols-3 gap-2 mb-4">
          {resumo.map(([rotulo, v]) => v != null && (
            <div key={rotulo} className="rounded-2xl bg-muted/50 px-3.5 py-3">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{rotulo}</dt>
              <dd className="text-sm sm:text-base font-bold text-foreground tabular-nums mt-0.5">{brl(v)}</dd>
            </div>
          ))}
        </dl>
      )}
      <ul className="grid gap-2.5">
        {empenhos.map((e, i) => <Ficha key={String(e.codigo ?? i)} empenho={e} cor={cor} portal={portal} />)}
      </ul>
    </div>
  );
};

export default EmpenhosLista;
