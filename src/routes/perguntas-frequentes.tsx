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
