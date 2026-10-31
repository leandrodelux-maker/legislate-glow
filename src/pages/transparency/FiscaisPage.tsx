import { ArrowRight, Building2, UserCheck } from "lucide-react";
import { Link } from "@/lib/roteador-transparencia";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import { SeloSituacao } from "@/components/transparency/compras/Blocos";
import { brl, data, formatar, numero, type Registro } from "@/components/transparency/compras/formato";

// Fiscais de contratos do exercício (scripts/sync-transparencia/datasets.mjs → fiscais): o detalhe do
// portal traz os contratos que cada servidor fiscaliza.
const L = { fiscal: "Fiscal" };

const iniciais = (nome: string) => nome.split(/\s+/).filter((p) => p.length > 2).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

const contratoAno = (c: Registro) => c.exercicioAno ?? data(c.data)?.getFullYear();

const ContratosFiscalizados = ({ contratos, cor }: { contratos: Registro[]; cor: string }) => {
  const total = contratos.reduce((s, c) => s + (numero(c.valor) || 0), 0);
  const vigentes = contratos.filter((c) => /vigente|vencimento/i.test(String(c.situacao ?? ""))).length;
  return (
    <div>
      <dl className="grid grid-cols-3 gap-2 mb-4">
        {[["Contratos", contratos.length.toLocaleString("pt-BR")], ["Vigentes", vigentes.toLocaleString("pt-BR")], ["Valor somado", brl(total)]].map(([r, v]) => (
          <div key={r} className="rounded-2xl bg-muted/50 px-3.5 py-3">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{r}</dt>
            <dd className="text-sm sm:text-base font-bold text-foreground tabular-nums mt-0.5">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="grid gap-2.5">
        {contratos.map((c, i) => {
          const ano = contratoAno(c);
          return (
            <li key={String(c.codigo ?? i)}>
              <Link to={`/transparencia/contratos?registro=${c.codigo}${ano && Number(ano) !== new Date().getFullYear() ? `&ano=${ano}` : ""}`}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-4 hover:shadow-lg hover:border-transparent transition">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">Contrato nº {String(c.numeroDoContrato ?? "—")}{ano ? `/${ano}` : ""}</span>
                    <SeloSituacao situacao={c.situacao ? String(c.situacao) : undefined} />
                  </span>
                  <span className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-foreground">
                    <Building2 className="h-3.5 w-3.5 mt-px shrink-0 text-muted-foreground" aria-hidden /> {String(c.nomeDoFornecedor ?? "—")}
                  </span>
                  {c.objeto != null && <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">{String(c.objeto)}</span>}
                  <span className="block text-xs text-muted-foreground mt-1">{formatar("data", c.data)} → {formatar("vigencia", c.vigencia)}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className="block text-sm font-bold tabular-nums text-foreground">{c.valor != null ? formatar("valor", c.valor) : ""}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: cor }}>Abrir <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const config: ConfigCompras = {
  slug: "fiscais",
  // O portal lista um fiscal em branco (sem nome nem chave): fica de fora.
  filtrar: (l: Linha) => !!l[L.fiscal]?.trim(),
  situacaoDe: () => "",
  campoData: L.fiscal,
  campoValor: L.fiscal,
  placeholderBusca: "Buscar fiscal pelo nome…",
  indicadores: () => [],
  Cartao: ({ linha, cor }) => (
    <div className="flex items-center gap-4 h-full">
      <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display text-lg font-bold shrink-0" style={{ backgroundColor: cor }}>
        {iniciais(linha[L.fiscal]) || <UserCheck className="h-6 w-6" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-bold text-foreground leading-snug">{linha[L.fiscal]}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: cor }}>Ver contratos fiscalizados <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
      </span>
    </div>
  ),
  cabecalho: ({ linha, detalhe }) => {
    const contratos = detalhe?.listas?.contratosDoFiscal ?? [];
    return (
      <div className="flex items-center gap-4">
        <span className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl font-bold shrink-0 bg-white/15">{iniciais(linha[L.fiscal])}</span>
        <div>
          <p className="text-sm font-semibold text-white/85">Fiscal de contratos</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{linha[L.fiscal]}</h2>
          {detalhe && <p className="text-sm text-white/85 mt-1">{contratos.length} contrato(s) sob sua fiscalização</p>}
        </div>
      </div>
    );
  },
  abas: ({ detalhe, cor }) => {
    const contratos = detalhe.listas?.contratosDoFiscal ?? [];
    return [{ id: "contratos", rotulo: "Contratos fiscalizados", contagem: contratos.length || undefined, conteudo: contratos.length
      ? <ContratosFiscalizados contratos={contratos} cor={cor} />
      : <p className="text-sm text-muted-foreground">Nenhum contrato vinculado a este fiscal no exercício.</p> }];
  },
};

const FiscaisPage = () => <ComprasConsulta config={config} />;

export default FiscaisPage;
