import { ArrowRight, Check, Gavel } from "lucide-react";
import { Link } from "@/lib/roteador-transparencia";
import { data, formatar, tomSituacao, type Registro } from "./formato";

/** [campo do detalhe, rótulo, rótulo equivalente na lista (usado quando não há detalhe), ocupa a linha toda?] */
export type CampoResumo = [string, string, string?, boolean?];

export const SeloSituacao = ({ situacao, claro = false }: { situacao?: string; claro?: boolean }) => {
  if (!situacao) return null;
  const tom = tomSituacao(situacao);
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap shrink-0 ${claro ? "bg-white/15 text-white" : `${tom.fundo} ${tom.texto}`}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${claro ? "bg-white" : tom.ponto}`} aria-hidden /> {situacao}
    </span>
  );
};

// Ficha com os campos principais do registro: do detalhe quando existe, senão da linha da lista.
export const Resumo = ({ campos, detalhe, linha }: { campos: CampoResumo[]; detalhe: Registro; linha: Registro }) => {
  const itens = campos
    .map(([campo, rotulo, daLista, largo]) => {
      const v = detalhe[campo] ?? (daLista ? linha[daLista] : undefined);
      return { campo, rotulo, valor: v == null || v === "" ? null : formatar(campo, v), largo };
    })
    .filter((c) => c.valor && c.valor !== "—");
  return (
    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-0 rounded-2xl border border-border/60 overflow-hidden">
      {itens.map((c) => {
        const longo = c.largo || (c.valor?.length ?? 0) > 70;
        return (
          <div key={c.campo} className={`px-4 py-3 border-b border-border/40 ${longo ? "sm:col-span-2" : ""}`}>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{c.rotulo}</dt>
            <dd className={`text-sm text-foreground mt-0.5 break-words ${longo ? "leading-relaxed" : "font-semibold"}`}>
              {/^https?:\/\//.test(c.valor!) ? <a href={c.valor!} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all">{c.valor}</a> : c.valor}
            </dd>
          </div>
        );
      })}
    </dl>
  );
};

// Linha do tempo de um processo: etapa com data já passada aparece concluída; com data futura, agendada.
const passou = (v?: string | null) => { const d = data(v); return !!d && d.getTime() <= Date.now(); };
export const Etapas = ({ etapas, claro = false }: { etapas: { rotulo: string; data?: string | null }[]; claro?: boolean }) => (
  <ol className="flex items-start">
    {etapas.map((e, i) => {
      const feita = passou(e.data);
      const agendada = !!e.data && !feita;
      const proxFeita = passou(etapas[i + 1]?.data);
      return (
        <li key={e.rotulo} className="relative flex-1 flex flex-col items-center text-center min-w-0">
          {i < etapas.length - 1 && (
            <span className={`absolute top-3.5 left-1/2 w-full h-0.5 ${claro ? (proxFeita ? "bg-white" : "bg-white/25") : proxFeita ? "bg-foreground/60" : "bg-border"}`} aria-hidden />
          )}
          <span className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
            claro ? (feita ? "bg-white border-white text-foreground" : "bg-transparent border-white/40") : feita ? "bg-foreground border-foreground text-background" : "bg-background border-border"}`}>
            {feita && <Check className="h-3.5 w-3.5" aria-hidden />}
          </span>
          <span className={`mt-1.5 text-[11px] font-bold uppercase tracking-wide ${claro ? "text-white/85" : "text-muted-foreground"}`}>{e.rotulo}</span>
          <span className={`text-xs tabular-nums ${claro ? "text-white" : "text-foreground"} ${feita ? "font-semibold" : agendada ? "" : "opacity-60"}`}>{e.data ? formatar("data", e.data) : "—"}</span>
          {agendada && <span className={`text-[10px] font-semibold ${claro ? "text-white/75" : "text-muted-foreground"}`}>agendada</span>}
        </li>
      );
    })}
  </ol>
);

// Anel de progresso (percentual de execução da obra, de execução do contrato...).
export const Anel = ({ pct, cor, tamanho = 64, espessura = 7, claro = false, children }: { pct: number; cor: string; tamanho?: number; espessura?: number; claro?: boolean; children?: React.ReactNode }) => {
  const r = (tamanho - espessura) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, pct || 0));
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden>
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" strokeWidth={espessura} className={claro ? "stroke-white/20" : "stroke-muted"} />
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" strokeWidth={espessura} strokeLinecap="round"
          stroke={claro ? "white" : cor} strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </span>
  );
};

/** Barra fina com marcador (ex.: quanto da vigência do contrato já passou). */
export const Barra = ({ pct, cor, claro = false }: { pct: number; cor: string; claro?: boolean }) => (
  <span className={`block h-2 rounded-full overflow-hidden ${claro ? "bg-white/20" : "bg-muted"}`}>
    <span className="block h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: claro ? "white" : cor }} />
  </span>
);

// Atalho para o processo de origem (licitação ou dispensa) de um contrato ou ordem de fornecimento.
export const LinkOrigem = ({ para, titulo, numero, cor }: { para: string; titulo: string; numero: string; cor: string }) => (
  <Link to={para} className="mb-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 hover:shadow-md hover:bg-background transition">
    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cor }}><Gavel className="h-5 w-5" aria-hidden /></span>
    <span className="flex-1 min-w-0">
      <span className="block text-xs text-muted-foreground">{titulo}</span>
      <span className="block text-sm font-bold text-foreground">Nº {numero}</span>
    </span>
    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
  </Link>
);
