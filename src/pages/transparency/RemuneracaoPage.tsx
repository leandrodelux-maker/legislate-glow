import { Users } from "lucide-react";
import ComprasConsulta, { type ConfigCompras, type Linha } from "@/components/transparency/compras/ComprasConsulta";
import BotaoLei from "@/components/transparency/compras/BotaoLei";
import { Barra, Resumo, SeloSituacao, type CampoResumo } from "@/components/transparency/compras/Blocos";
import { brl, numero } from "@/components/transparency/compras/formato";

// Cargos previstos em lei, com vagas e salário (cópia "remuneracao", último mês fechado do portal).
const L = { cargo: "Cargo", nivel: "Nível", salario: "Salário", vagas: "Vagas", providas: "Vagas providas", livres: "Vagas não providas", situacao: "Situação", cbo: "CBO", codigo: "Código", lei: "Lei", dataLei: "Data da lei" };

const RESUMO: CampoResumo[] = [
  ["cargo", "Cargo", L.cargo],
  ["nivel", "Nível", L.nivel],
  ["salario", "Salário", L.salario],
  ["vagas", "Total de vagas", L.vagas],
  ["vagasProvidas", "Vagas providas (ocupadas)", L.providas],
  ["vagasNaoProvidas", "Vagas não providas (livres)", L.livres],
  ["situacao", "Situação", L.situacao],
  ["cbo", "CBO", L.cbo],
  ["codigo", "Código", L.codigo],
  ["lei", "Lei de criação", L.lei],
  ["dataDaLei", "Data da lei", L.dataLei],
];

const vagas = (l: Linha) => ({ total: numero(l[L.vagas]) || 0, ocupadas: numero(l[L.providas]) || 0 });
const salario = (l: Linha) => { const s = numero(l[L.salario]); return s > 0 ? brl(s) : "Não informado"; };
const situacaoDe = (l: Linha) => {
  const { total, ocupadas } = vagas(l);
  if (!total) return "Sem vagas";
  return ocupadas >= total ? "Vagas preenchidas" : ocupadas === 0 ? "Nenhuma vaga ocupada" : "Com vagas livres";
};

const lei = (cor: string) => (
  <BotaoLei rotulo="Lei de regulamentação" descricao="Lei que regulariza a criação dos cargos." origem={{ tela: "Estrutura de Remuneração" }} cor={cor} />
);

const Vagas = ({ linha, cor, claro = false }: { linha: Linha; cor: string; claro?: boolean }) => {
  const { total, ocupadas } = vagas(linha);
  if (!total) return null;
  return (
    <div>
      <Barra pct={(ocupadas / total) * 100} cor={cor} claro={claro} />
      <p className={`text-xs mt-1.5 flex justify-between gap-2 ${claro ? "text-white/85" : "text-muted-foreground"}`}>
        <span>{ocupadas} de {total} vaga(s) ocupada(s)</span>
        <span className="font-semibold">{total - ocupadas} livre(s)</span>
      </p>
    </div>
  );
};

const config: ConfigCompras = {
  slug: "remuneracao",
  acumulado: true,
  ordemInicial: "maior",
  situacaoDe,
  campoData: L.dataLei,
  campoValor: L.salario,
  placeholderBusca: "Buscar cargo, nível, CBO…",
  acoes: lei,
  indicadores: (linhas) => {
    const total = linhas.reduce((s, l) => s + vagas(l).total, 0);
    const ocupadas = linhas.reduce((s, l) => s + vagas(l).ocupadas, 0);
    const salarios = linhas.map((l) => numero(l[L.salario])).filter((n) => n > 0);
    return [
      { rotulo: "Cargos", valor: linhas.length.toLocaleString("pt-BR") },
      { rotulo: "Vagas criadas", valor: total.toLocaleString("pt-BR"), detalhe: `${ocupadas.toLocaleString("pt-BR")} ocupadas` },
      { rotulo: "Vagas livres", valor: (total - ocupadas).toLocaleString("pt-BR"), detalhe: total ? `${Math.round(((total - ocupadas) / total) * 100)}% do total` : undefined },
      { rotulo: "Faixa salarial", valor: salarios.length ? `${brl(Math.min(...salarios))} a ${brl(Math.max(...salarios))}` : "—" },
    ];
  },
  Cartao: ({ linha, cor }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{[linha[L.nivel], linha[L.cbo] && `CBO ${linha[L.cbo]}`].filter(Boolean).join(" · ")}</span>
        <SeloSituacao situacao={situacaoDe(linha)} />
      </div>
      <div className="flex-1"><p className="font-display text-lg font-bold text-foreground mt-2 leading-snug">{linha[L.cargo]}</p></div>
      <p className={`mt-3 font-display text-xl font-bold tabular-nums ${numero(linha[L.salario]) > 0 ? "text-foreground" : "text-muted-foreground text-base"}`}>{salario(linha)}</p>
      <div className="mt-3 pt-3 border-t border-border/50"><Vagas linha={linha} cor={cor} /></div>
    </div>
  ),
  cabecalho: ({ linha, cor }) => (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-white/85">{[linha[L.nivel], linha[L.cbo] && `CBO ${linha[L.cbo]}`].filter(Boolean).join(" · ")}</span>
        <SeloSituacao situacao={situacaoDe(linha)} claro />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-1">{linha[L.cargo]}</h2>
      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/75">Salário</p>
          <p className="font-display text-2xl font-bold tabular-nums">{salario(linha)}</p>
        </div>
        <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgb(255 255 255 / 0.12)" }}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/75 mb-2 inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden /> Vagas</p>
          <Vagas linha={linha} cor={cor} claro />
        </div>
      </div>
    </>
  ),
  abas: ({ linha, detalhe, cor }) => [
    { id: "resumo", rotulo: "Resumo", conteudo: <Resumo campos={RESUMO} detalhe={detalhe} linha={linha} /> },
    { id: "lei", rotulo: "Lei de regulamentação", conteudo: <div className="rounded-2xl border border-border/60 p-5"><p className="text-sm text-muted-foreground mb-4">Lei que regulariza a criação dos cargos.</p>{lei(cor)}</div> },
  ],
};

const RemuneracaoPage = () => <ComprasConsulta config={config} />;

export default RemuneracaoPage;
