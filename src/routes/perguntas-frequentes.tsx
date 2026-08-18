import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HelpCircle, Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/perguntas-frequentes")({
  head: () => ({
    meta: [
      { title: "Perguntas Frequentes — Câmara Municipal" },
      {
        name: "description",
        content:
          "Respostas para as dúvidas mais comuns sobre a Câmara Municipal, transparência, e-SIC, LGPD e serviços ao cidadão.",
      },
      { property: "og:title", content: "Perguntas Frequentes — Câmara Municipal" },
      { property: "og:description", content: "FAQ oficial do portal do legislativo municipal." },
    ],
  }),
  component: FaqPage,
});

type Faq = { q: string; a: string; cat: string };

const FAQS: Faq[] = [
  {
    cat: "Institucional",
    q: "O que faz a Câmara Municipal?",
    a: "A Câmara Municipal é o Poder Legislativo do município. Cabe a ela elaborar leis, fiscalizar os atos do Poder Executivo, votar o orçamento e representar a população.",
  },
  {
    cat: "Institucional",
    q: "Quantos vereadores compõem a Câmara?",
    a: "O número de vereadores é definido pela Constituição Federal com base na população do município. Consulte a página de Vereadores para a composição atual.",
  },
  {
    cat: "Sessões",
    q: "Como acompanhar as sessões da Câmara?",
    a: "As sessões são abertas ao público e transmitidas ao vivo pelo portal. Acesse a página de Sessões para consultar a pauta e o calendário.",
  },
  {
    cat: "Sessões",
    q: "Posso participar de uma sessão presencialmente?",
    a: "Sim. As sessões plenárias são públicas. Consulte a agenda e compareça ao plenário no dia e horário divulgados.",
  },
  {
    cat: "Transparência",
    q: "Onde encontro os dados de receitas, despesas e contratos?",
    a: "Todos os dados obrigatórios estão disponíveis no Portal da Transparência, com informações sobre orçamento, licitações, contratos, folha de pagamento e prestação de contas.",
  },
  {
    cat: "Transparência",
    q: "Com que frequência os dados são atualizados?",
    a: "Os dados financeiros são atualizados conforme a legislação vigente (LC nº 131/2009 e Lei nº 12.527/2011), normalmente em periodicidade diária ou mensal, dependendo da informação.",
  },
  {
    cat: "e-SIC / LAI",
    q: "Como faço um pedido de acesso à informação?",
    a: "Pelo e-SIC, disponível no portal, preenchendo o formulário com seus dados e a descrição do pedido. Um número de protocolo será gerado para acompanhamento.",
  },
  {
    cat: "e-SIC / LAI",
    q: "Qual o prazo para receber a resposta?",
    a: "O prazo legal é de até 20 dias corridos, prorrogáveis por mais 10 mediante justificativa, conforme a Lei nº 12.527/2011.",
  },
  {
    cat: "LGPD",
    q: "Como a Câmara trata meus dados pessoais?",
    a: "Todos os dados são tratados conforme a Lei nº 13.709/2018 (LGPD), com finalidade específica, transparência e medidas de segurança. Consulte a página de LGPD para detalhes.",
  },
  {
    cat: "LGPD",
    q: "Quem é o Encarregado de Dados (DPO)?",
    a: "O Encarregado de Dados é indicado por portaria e disponível pelo e-mail contato@camaracachoeiradegoias.go.gov.br para atender solicitações relacionadas à proteção de dados.",
  },
  {
    cat: "Ouvidoria",
    q: "Qual a diferença entre Ouvidoria e e-SIC?",
    a: "A Ouvidoria recebe reclamações, sugestões, elogios e denúncias sobre os serviços da Câmara. O e-SIC é destinado especificamente a pedidos de acesso à informação previstos na LAI.",
  },
];

const CATS = ["Todas", ...Array.from(new Set(FAQS.map((f) => f.cat)))];

function FaqPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return FAQS.filter(
      (f) =>
        (cat === "Todas" || f.cat === cat) &&
        (!s || f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s)),
    );
  }, [q, cat]);

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div className="container-page py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            <HelpCircle className="h-3 w-3" /> FAQ
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
            Perguntas Frequentes
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            Respostas rápidas para as principais dúvidas sobre a Câmara Municipal, seus serviços e a
            transparência das informações públicas.
          </p>
        </div>
      </section>

      {/* SEARCH + CATS */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-6 flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nas perguntas..."
              className="h-11 w-full rounded-full border border-border bg-white pl-11 pr-5 text-sm shadow-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  cat === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="container-page py-10 md:py-14">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Nenhuma pergunta encontrada.
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-4"
              >
                <AccordionTrigger className="text-left text-base font-semibold">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      {f.cat}
                    </span>
                    <span>{f.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-7">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="mt-10 text-center text-sm text-muted-foreground">
          Não encontrou o que procurava?{" "}
          <Link to="/e-sic" className="text-primary hover:underline">Faça um pedido pelo e-SIC</Link>{" "}
          ou{" "}
          <Link to="/contato" className="text-primary hover:underline">fale com a Ouvidoria</Link>.
        </div>
      </section>
    </main>
  );
}
