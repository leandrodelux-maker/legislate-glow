import { useMemo, useState } from "react";
import { Link } from "@/lib/roteador-transparencia";
import { ArrowRight, ChevronDown, Landmark, Lock, MessageSquareText, Search, Send } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { findItem } from "@/data/transparenciaCatalogo";

// Perguntas frequentes sobre acesso à informação, Ouvidoria, o Portal da Transparência e dados pessoais,
// com busca e um atalho para a página que resolve cada dúvida.
interface Pergunta { p: string; r: string; link?: { rotulo: string; href: string } }
const GRUPOS: { id: string; nome: string; icone: typeof Send; perguntas: Pergunta[] }[] = [
  {
    id: "esic", nome: "Pedido de informação (e-SIC)", icone: Send, perguntas: [
      { p: "O que é o SIC?", r: "É o Serviço de Informação ao Cidadão, criado pelo art. 9º da Lei de Acesso à Informação. Ele atende e orienta quem quer uma informação pública, informa a tramitação dos pedidos e recebe e responde as solicitações. Na Câmara, funciona pela internet (e-SIC) e presencialmente.", link: { rotulo: "SIC presencial", href: "/transparencia/sic-presencial" } },
      { p: "Quem pode pedir uma informação?", r: "Qualquer pessoa, física ou jurídica, sem precisar explicar o motivo do pedido (LAI, art. 10, § 3º). Basta se identificar e dizer com clareza qual informação deseja.", link: { rotulo: "Fazer um pedido", href: "/e-sic" } },
      { p: "Qual é o prazo para a resposta?", r: "Se a informação estiver disponível, o acesso deve ser imediato. Não sendo possível, a Câmara tem até 20 dias para responder, prorrogáveis por mais 10 com justificativa (LAI, art. 11)." },
      { p: "Como os prazos são contados?", r: "A contagem começa no dia seguinte ao registro do pedido. Pedidos feitos fora do horário de expediente contam como feitos no dia útil seguinte; e quando o prazo termina em fim de semana ou feriado, passa para o próximo dia útil. Por isso, o prazo pode não ser exatamente de 20 dias corridos." },
      { p: "O pedido tem algum custo?", r: "Não. O serviço de busca e fornecimento da informação é gratuito. Só pode ser cobrado o custo de reprodução, como cópias em papel ou mídia, quando você pedir (LAI, art. 12)." },
      { p: "E se o pedido for negado?", r: "A negativa precisa ser justificada. Você pode recorrer em até 10 dias a contar da ciência da decisão, e o recurso é analisado por autoridade superior à que negou, em até 5 dias (LAI, art. 15)." },
      { p: "O que é transparência ativa e passiva?", r: "Transparência ativa é o que a Câmara publica por conta própria, sem ninguém pedir, como neste Portal da Transparência. Passiva é a resposta a um pedido específico feito por uma pessoa pelo e-SIC ou no SIC presencial." },
    ],
  },
  {
    id: "ouvidoria", nome: "Ouvidoria", icone: MessageSquareText, perguntas: [
      { p: "Qual a diferença entre a Ouvidoria e o e-SIC?", r: "O e-SIC é para pedir uma informação pública (um documento, um dado, um contrato). A Ouvidoria é para registrar uma denúncia, reclamação, sugestão ou elogio sobre os serviços da Câmara.", link: { rotulo: "Ir para a Ouvidoria", href: "/contato" } },
      { p: "Posso fazer uma denúncia anônima?", r: "Sim. Basta marcar a opção de manifestação anônima. Nesse caso, a Ouvidoria não consegue pedir mais detalhes, e o protocolo é a única forma de acompanhar a resposta. Se você se identificar, seus dados ficam protegidos (Lei nº 13.460/2017, art. 10, § 7º)." },
      { p: "Em quanto tempo a Ouvidoria responde?", r: "Em até 30 dias, prorrogáveis uma única vez por igual período, com justificativa (Lei nº 13.460/2017, art. 16)." },
      { p: "Como acompanho minha manifestação ou pedido?", r: "Com o número do protocolo mostrado ao final do registro. Ele começa com SIC- (pedido de informação) ou OUV- (Ouvidoria).", link: { rotulo: "Acompanhar solicitação", href: "/contato" } },
    ],
  },
  {
    id: "portal", nome: "Portal da Transparência", icone: Landmark, perguntas: [
      { p: "O que é o Portal da Transparência?", r: "É onde a Câmara publica, em tempo real, as receitas, despesas, licitações, contratos, servidores e os relatórios fiscais, como exigem a Lei Complementar nº 131/2009 e a Lei nº 12.527/2011. Os dados deste site são copiados todos os dias do portal oficial.", link: { rotulo: "Abrir a Transparência", href: "/transparencia" } },
      { p: "O que é empenho, liquidação e pagamento?", r: "São as três etapas da despesa pública. Empenho é a reserva do dinheiro para um gasto; liquidação é a conferência de que o serviço foi prestado ou o produto entregue; pagamento é a saída efetiva do dinheiro para o fornecedor." },
      { p: "O que são o RREO e o RGF?", r: "São relatórios exigidos pela Lei de Responsabilidade Fiscal. O RREO (Relatório Resumido da Execução Orçamentária) é publicado a cada dois meses; o RGF (Relatório de Gestão Fiscal), a cada quatro meses, e mostra limites como os gastos com pessoal.", link: { rotulo: "Responsabilidade Fiscal", href: "/transparencia/tema/responsabilidade-fiscal" } },
      { p: "Como acompanho as licitações e contratos?", r: "Em Licitações e Obras você vê os editais, a situação de cada processo, os vencedores, os contratos com seus aditivos e empenhos, e baixa os documentos direto no site.", link: { rotulo: "Licitações e Obras", href: "/transparencia/tema/licitacoes-e-contratos" } },
      { p: "Posso baixar os dados para analisar?", r: "Sim. Em Dados Abertos você baixa cada conjunto de dados em CSV (planilha) ou JSON, livres para reutilização.", link: { rotulo: "Dados Abertos", href: "/transparencia/dados-abertos" } },
    ],
  },
  {
    id: "dados", nome: "Dados pessoais e sigilo", icone: Lock, perguntas: [
      { p: "Existe informação que a Câmara pode negar?", r: "Sim, apenas nos casos previstos em lei: informações classificadas como sigilosas (ultrassecreta, secreta ou reservada) por colocarem em risco a segurança da sociedade, e informações pessoais ligadas à intimidade e à vida privada (LAI, arts. 23 e 31).", link: { rotulo: "Rol de informações classificadas", href: "/transparencia/documentos/rol-informacoes" } },
      { p: "Como a Câmara protege os meus dados?", r: "Os dados informados nos formulários servem só para o atendimento, ficam com acesso restrito aos servidores responsáveis e não são repassados a terceiros, conforme a LGPD (Lei nº 13.709/2018).", link: { rotulo: "Política de privacidade", href: "/lgpd" } },
    ],
  },
];

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const PerguntasPage = () => {
  const item = findItem("perguntas-frequentes")!;
  const cor = item.tema.color;
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState<string | null>(null);
  const [aberta, setAberta] = useState<string | null>(GRUPOS[0].perguntas[0].p);

  const grupos = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    return GRUPOS.filter((g) => !grupo || g.id === grupo)
      .map((g) => ({ ...g, perguntas: g.perguntas.filter((q) => termos.every((t) => normalizar(`${q.p} ${q.r}`).includes(t))) }))
      .filter((g) => g.perguntas.length);
  }, [busca, grupo]);

  return (
    <TransparencyLayout title={item.label} description="Respostas rápidas sobre pedidos de informação, Ouvidoria, o Portal da Transparência e os seus dados."
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: item.tema.label, href: `/transparencia/tema/${item.tema.id}` }, { label: item.label }]}>
      <div className="max-w-4xl mx-auto">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="assunto" className="text-sm font-semibold text-foreground">Assunto</label>
              <select id="assunto" value={grupo ?? ""} onChange={(e) => setGrupo(e.target.value || null)} className="h-11 w-full sm:w-auto sm:max-w-[16rem] min-w-0 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/15">
                <option value="">Todos ({GRUPOS.reduce((s, g) => s + g.perguntas.length, 0)})</option>
                {GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.nome} ({g.perguntas.length})</option>)}
              </select>
            </div>
            <div className="relative flex-1 min-w-full sm:min-w-[16rem]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar: prazo, recurso, anônima, empenho…" aria-label="Buscar nas perguntas"
                className="w-full h-11 rounded-xl border border-border/60 bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15" />
            </div>
          </div>

          {grupos.map((g) => (
            <section key={g.id} className="mb-8" aria-labelledby={`g-${g.id}`}>
              <h2 id={`g-${g.id}`} className="flex items-center gap-2.5 font-display text-lg font-bold text-foreground mb-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: cor }}><g.icone className="h-4 w-4" aria-hidden /></span> {g.nome}
              </h2>
              <ul className="space-y-2.5">
                {g.perguntas.map((q) => {
                  const aberto = aberta === q.p || !!busca;
                  return (
                    <li key={q.p} className={`rounded-2xl border bg-card transition ${aberto ? "border-transparent shadow-md" : "border-border/60"}`} style={aberto ? { boxShadow: `inset 3px 0 0 ${cor}` } : undefined}>
                      <button type="button" onClick={() => setAberta(aberta === q.p ? null : q.p)} aria-expanded={aberto}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left">
                        <span className="flex-1 font-semibold text-foreground">{q.p}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`} aria-hidden />
                      </button>
                      {aberto && (
                        <div className="px-5 pb-5 -mt-1">
                          <p className="text-sm text-muted-foreground leading-relaxed">{q.r}</p>
                          {q.link && <Link to={q.link.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline underline-offset-2" style={{ color: cor }}>{q.link.rotulo} <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {!grupos.length && <p className="text-center text-muted-foreground py-12">Nenhuma pergunta encontrada para “{busca}”. <Link to="/e-sic" className="font-semibold underline">Faça a sua pergunta pelo e-SIC</Link>.</p>}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 rounded-3xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${cor}, color-mix(in srgb, ${cor} 55%, #04180f))` }}>
            <p className="flex-1 font-display text-lg font-bold">Não encontrou o que procurava?</p>
            <Link to="/e-sic" className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold hover:bg-white/90" style={{ color: cor }}><Send className="h-4 w-4" aria-hidden /> Pergunte pelo e-SIC</Link>
          </div>
        </div>
      </div>
    </TransparencyLayout>
  );
};

export default PerguntasPage;
