import { Briefcase, CalendarDays } from "lucide-react";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import { SeloSituacao } from "@/components/transparency/compras/Blocos";
import { COR, F, SeloPagamento, abasServidor, iniciais } from "@/components/transparency/compras/Folha";
import { brl, numero, rotuloCompetencia } from "@/components/transparency/compras/formato";

// Relação nominal de servidores: lê a mesma cópia da folha ("folha"), mês a mês. O foco aqui é quem
// trabalha na Câmara (cargo, vínculo, lotação); o painel também mostra a remuneração no ano.
const vinculo = (l: Linha) => l[F.vinculo] || "Não informado";

const config: ConfigCompras = {
  slug: "servidores",
  conjunto: "folha",
  periodo: { campo: F.competencia, rotulo: "Mês de referência" },
  situacaoDe: vinculo,
  rotuloSituacao: "Vínculo",
  orgaoDe: (l) => l["Departamento"], rotuloOrgao: "Departamento",
  semOrdenacao: true,
  campoData: F.admissao,
  campoValor: F.liquido,
  placeholderBusca: "Buscar por nome, cargo, matrícula, departamento…",
  indicadores: (linhas) => {
    const cont = new Map<string, number>();
    for (const l of linhas) cont.set(vinculo(l), (cont.get(vinculo(l)) ?? 0) + 1);
    const principais = [...cont.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const departamentos = new Set(linhas.map((l) => l[F.departamento]).filter(Boolean)).size;
    return [
      { rotulo: "Servidores no mês", valor: linhas.length.toLocaleString("pt-BR"), detalhe: `em ${departamentos} departamento(s)` },
      ...principais.map(([v, n]) => ({ rotulo: v, valor: n.toLocaleString("pt-BR"), detalhe: `${Math.round((n / linhas.length) * 100)}% do quadro` })),
    ];
  },
  Cartao: ({ linha, cor }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display font-bold shrink-0" style={{ backgroundColor: cor }}>{iniciais(linha[F.nome])}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-bold text-foreground leading-snug">{linha[F.nome]}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Matrícula {linha[F.matricula]}</span>
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground mt-3 flex items-start gap-1.5"><Briefcase className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden /> {linha[F.cargo] || "—"}</p>
      <div className="flex-1"><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{linha[F.departamento]}</p></div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <SeloSituacao situacao={linha[F.vinculo]} />
        {linha[F.situacao] && <span className="text-xs text-muted-foreground">{linha[F.situacao]}</span>}
      </div>
      <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> desde {linha[F.admissao] || "—"}</span>
        <span className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Líquido no mês</span>
          <span className="block text-sm font-bold tabular-nums" style={{ color: COR.liquido }}>{brl(numero(linha[F.liquido]) || 0)}</span>
        </span>
      </div>
    </div>
  ),
  cabecalho: ({ linha }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <span className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl font-bold shrink-0 bg-white/15">{iniciais(linha[F.nome])}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white/85">Matrícula {linha[F.matricula]}</span>
          <SeloSituacao situacao={linha[F.vinculo]} claro />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-1">{linha[F.nome]}</h2>
        <p className="text-sm text-white/90 mt-1">{linha[F.cargo]}</p>
        <p className="text-xs text-white/80 mt-0.5">{[linha[F.departamento], linha[F.admissao] && `admissão em ${linha[F.admissao]}`].filter(Boolean).join(" · ")}</p>
      </div>
      <div className="rounded-2xl bg-white px-4 py-3 text-foreground shadow-lg dark:bg-card shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Líquido · {rotuloCompetencia(linha[F.competencia]).toLowerCase()}</p>
        <p className="font-display text-2xl font-bold tabular-nums" style={{ color: COR.liquido }}>{brl(numero(linha[F.liquido]) || 0)}</p>
        <div className="mt-1"><SeloPagamento situacao={linha[F.pagamento]} /></div>
      </div>
    </div>
  ),
  abas: ({ linha, detalhe, cor, linhas }) => abasServidor({ linha, detalhe, cor, linhas, foco: "servidor" }),
};

const ServidoresPage = () => <ComprasConsulta config={config} />;

export default ServidoresPage;
