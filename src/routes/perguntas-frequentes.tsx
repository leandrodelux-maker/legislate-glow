import { ArrowRight, SearchX } from "lucide-react";
import { ChipsFiltro } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import { PaginaHero } from "@/components/pagina-hero";
import { HelpCircle as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Search, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

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

type Faq = { id: string; pergunta: string; resposta: string; categoria: string };

function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("faq")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      if (!error && data) setFaqs(data as Faq[]);
      setLoading(false);
    })();
  }, []);

  const cats = useMemo(() => ["Todas", ...Array.from(new Set(faqs.map((f) => f.categoria)))], [faqs]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        (cat === "Todas" || f.categoria === cat) &&
        (!s || f.pergunta.toLowerCase().includes(s) || f.resposta.toLowerCase().includes(s)),
    );
  }, [faqs, q, cat]);

  return (
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="Atendimento"
        title="Perguntas Frequentes"
        description={<>Respostas rápidas para as principais dúvidas sobre a Câmara Municipal, seus serviços e a transparência das informações públicas.</>}
      />

      {/* BUSCA */}
      <section className="container-page relative z-10 -mt-7">
        <div className="relative mx-auto max-w-3xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Digite sua dúvida. Ex.: sessões, e-SIC, vereadores"
            aria-label="Buscar nas perguntas"
            className="h-14 w-full rounded-2xl border border-border bg-card pl-13 pr-5 text-base shadow-xl shadow-primary-deep/15 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      {/* LISTA */}
      <section className="container-page grid gap-8 py-10 md:py-14 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">Assuntos</p>
          <ChipsFiltro opcoes={cats} ativa={cat} aoEscolher={setCat} rotulo="Filtrar por assunto" />
          <div className="acesso-destaque mt-6 hidden rounded-2xl p-5 text-white lg:block">
            <p className="font-display text-lg font-semibold leading-snug">Não encontrou o que procurava?</p>
            <p className="mt-1 text-sm text-white/85">Peça a informação diretamente à Câmara.</p>
            <Link to="/e-sic" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
              Fazer um pedido no e-SIC <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
            </div>
          ) : filtered.length === 0 ? (
            <EstadoVazio icone={SearchX} titulo="Nenhuma pergunta encontrada" texto="Tente outra palavra ou escolha outro assunto." />
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">{filtered.length} {filtered.length === 1 ? "pergunta" : "perguntas"}</p>
              <Accordion type="single" collapsible className="space-y-3">
                {filtered.map((f) => (
                  <AccordionItem key={f.id} value={f.id} className="rounded-2xl border border-border bg-card px-5 transition data-[state=open]:border-primary/40 data-[state=open]:shadow-elegant">
                    <AccordionTrigger className="gap-3 py-4 text-left hover:no-underline">
                      <span>
                        <span className="block text-xs font-bold text-primary">{f.categoria}</span>
                        <span className="mt-0.5 block font-display text-base font-semibold leading-snug text-foreground">{f.pergunta}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{f.resposta}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}

          <p className="mt-6 text-sm text-muted-foreground lg:hidden">
            Não encontrou o que procurava? <Link to="/e-sic" className="font-semibold text-primary underline">Faça um pedido no e-SIC</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
