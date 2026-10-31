import { useMemo, useState } from "react";
import { FileSpreadsheet, Search } from "lucide-react";
import { baixarCsv, brl, ehMoeda, formatar, normalizar, numero, type Registro } from "./formato";

export interface ColunaLista { campo: string; rotulo: string }

interface Props {
  colunas: ColunaLista[];
  linhas: Registro[];
  /** Nome do CSV baixado. */
  arquivo: string;
  cor: string;
  /** Campo de valor usado na barra de participação de cada linha no total (ex.: valor estimado total). */
  barra?: string;
}

const LOTE = 40;
const TEXTO_LONGO = /produto|descri|objeto|nome|fornecedor|historico/i;
const pct = (p: number) => (p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// Peso da linha no total da lista (ex.: quanto um item representa do valor estimado da licitação).
const Peso = ({ peso, cor, largo = false }: { peso: number; cor: string; largo?: boolean }) => peso > 0 ? (
  <span className={`mt-1.5 flex items-center gap-1.5 ${largo ? "" : "justify-end"}`} title={`${pct(peso)}% do total`}>
    <span className={`h-1.5 rounded-full bg-muted overflow-hidden ${largo ? "flex-1" : "w-16"}`}>
      <span className="block h-full rounded-full" style={{ width: `${Math.max(peso * 100, 3)}%`, backgroundColor: cor }} />
    </span>
    <span className="text-[10px] text-muted-foreground tabular-nums">{pct(peso)}% do total</span>
  </span>
) : null;

// Tabela de uma lista do detalhe (itens, aditivos, contratadas...): busca, totais das colunas em reais,
// barra com o peso de cada linha no total e exportação em CSV. Colunas sem nenhum valor ficam de fora.
const TabelaLista = ({ colunas, linhas, arquivo, cor, barra }: Props) => {
  const [busca, setBusca] = useState("");
  const [limite, setLimite] = useState(LOTE);
  const visiveis = useMemo(() => colunas.filter((c) => linhas.some((l) => l[c.campo] != null && l[c.campo] !== "")), [colunas, linhas]);
  const filtradas = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    if (!termos.length) return linhas;
    return linhas.filter((l) => { const t = normalizar(visiveis.map((c) => String(l[c.campo] ?? "")).join(" ")); return termos.every((p) => t.includes(p)); });
  }, [linhas, busca, visiveis]);
  const totais = useMemo(() => Object.fromEntries(visiveis.filter((c) => ehMoeda(c.campo) && !/unit/i.test(c.campo))
    .map((c) => [c.campo, filtradas.reduce((s, l) => s + (numero(l[c.campo]) || 0), 0)])), [visiveis, filtradas]);
  const totalBarra = barra ? linhas.reduce((s, l) => s + (numero(l[barra]) || 0), 0) : 0;
  const pesoDe = (l: Registro) => (barra && totalBarra > 0 ? Math.max(0, (numero(l[barra]) || 0) / totalBarra) : 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        {linhas.length > 8 && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input type="search" value={busca} onChange={(e) => { setBusca(e.target.value); setLimite(LOTE); }}
              placeholder={`Procurar entre ${linhas.length} linhas…`} aria-label="Procurar na lista"
              className="w-full h-10 rounded-xl border border-border/60 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15" />
          </div>
        )}
        <button type="button" onClick={() => baixarCsv(arquivo, visiveis, filtradas)}
          className="h-10 inline-flex items-center justify-center gap-2 px-3.5 rounded-xl border border-border/60 bg-background text-sm font-semibold hover:bg-muted/60 transition sm:ml-auto">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" aria-hidden /> Baixar CSV
        </button>
      </div>

      {/* Celular: um cartão por linha */}
      <ul className="sm:hidden grid gap-2">
        {filtradas.slice(0, limite).map((l, i) => {
          const [primeira, segunda, ...resto] = visiveis;
          return (
            <li key={i} className="rounded-2xl border border-border/60 bg-background p-3.5">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {primeira && <span className="text-muted-foreground font-bold mr-1.5">{formatar(primeira.campo, l[primeira.campo])}</span>}
                {segunda && formatar(segunda.campo, l[segunda.campo])}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {resto.filter((c) => l[c.campo] != null && l[c.campo] !== "").map((c) => (
                  <div key={c.campo} className={c.campo === barra ? "col-span-2" : ""}>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.rotulo}</dt>
                    <dd className="text-sm text-foreground tabular-nums break-words">{formatar(c.campo, l[c.campo])}</dd>
                    {c.campo === barra && <Peso peso={pesoDe(l)} cor={cor} largo />}
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
        {filtradas.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Nada encontrado para “{busca}”.</li>}
        {Object.keys(totais).length > 0 && filtradas.length > 1 && (
          <li className="rounded-2xl bg-muted/60 p-3.5 text-sm">
            <p className="font-bold text-foreground">Total ({filtradas.length})</p>
            {visiveis.filter((c) => c.campo in totais).map((c) => (
              <p key={c.campo} className="flex justify-between gap-3 mt-1"><span className="text-muted-foreground">{c.rotulo}</span><strong className="tabular-nums">{brl(totais[c.campo])}</strong></p>
            ))}
          </li>
        )}
      </ul>

      <div className="hidden sm:block overflow-auto max-h-[60vh] rounded-2xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
            <tr>
              {visiveis.map((c) => (
                <th key={c.campo} scope="col" className={`px-3.5 py-2.5 font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap ${ehMoeda(c.campo) ? "text-right" : "text-left"}`}>{c.rotulo}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.slice(0, limite).map((l, i) => (
              <tr key={i} className="border-t border-border/40 even:bg-muted/20 hover:bg-muted/40 align-top">
                {visiveis.map((c) => (
                  <td key={c.campo} className={`px-3.5 py-2.5 text-foreground ${ehMoeda(c.campo) ? "text-right tabular-nums whitespace-nowrap" : TEXTO_LONGO.test(c.campo) ? "min-w-[14rem]" : "whitespace-nowrap"}`}>
                    {formatar(c.campo, l[c.campo])}
                    {c.campo === barra && <Peso peso={pesoDe(l)} cor={cor} />}
                  </td>
                ))}
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr><td colSpan={visiveis.length} className="px-4 py-8 text-center text-muted-foreground">Nada encontrado para “{busca}”.</td></tr>
            )}
          </tbody>
          {Object.keys(totais).length > 0 && filtradas.length > 1 && (
            <tfoot className="sticky bottom-0 bg-card border-t-2 border-border">
              <tr>
                {visiveis.map((c, i) => (
                  <td key={c.campo} className={`px-3.5 py-2.5 font-bold text-foreground ${ehMoeda(c.campo) ? "text-right tabular-nums whitespace-nowrap" : "whitespace-nowrap"}`}>
                    {c.campo in totais ? brl(totais[c.campo]) : i === 0 ? `Total (${filtradas.length})` : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {filtradas.length > limite && (
        <button type="button" onClick={() => setLimite((n) => n + LOTE * 2)}
          className="mt-3 w-full h-10 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
          Mostrar mais ({filtradas.length - limite} restantes)
        </button>
      )}
    </div>
  );
};

export default TabelaLista;
