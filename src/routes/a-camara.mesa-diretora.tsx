import { Users, ListOrdered } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import { PaginaHero } from "@/components/pagina-hero";
import { Crown as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, ArrowRight, Loader2, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { SectionHeading } from "@/components/section-heading";
import { ROUTES } from "@/lib/site-links";

export const Route = createFileRoute("/a-camara/mesa-diretora")({
  head: () => ({
    meta: [
      { title: "Mesa Diretora — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Composição da Mesa Diretora da Câmara Municipal: presidente, vice-presidente e secretários eleitos para o biênio em exercício.",
      },
      { property: "og:title", content: "Mesa Diretora — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Conheça os parlamentares que compõem a Mesa Diretora do Legislativo municipal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MesaDiretoraPage,
});

type Membro = {
  id: string;
  cargo: string | null;
  ordem: number | null;
  vereadores: {
    id: string;
    slug: string | null;
    nome: string;
    partido: string | null;
    foto_url: string | null;
    cargo: string | null;
  } | null;
};

const ATRIBUICOES = [
  {
    cargo: "Presidente",
    text: "Representa a Câmara, dirige os trabalhos do plenário, promulga resoluções e decretos legislativos e zela pelo cumprimento do Regimento Interno.",
  },
  {
    cargo: "Vice-Presidente",
    text: "Substitui o Presidente em suas ausências e impedimentos, assumindo a direção das sessões e dos atos administrativos da Casa.",
  },
  {
    cargo: "1ª Secretaria",
    text: "Faz a leitura das proposituras e da correspondência oficial, lavra as atas e responde pela guarda dos documentos legislativos.",
  },
  {
    cargo: "2ª Secretaria",
    text: "Auxilia e substitui a 1ª Secretaria, verifica a presença dos vereadores e apoia a apuração das votações.",
  },
];

function MesaDiretoraPage() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("mesa_diretora")
      .select("id, cargo, ordem, vereadores(id, slug, nome, partido, foto_url, cargo)")
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        setMembros((data as unknown as Membro[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="A Câmara"
        title="Mesa Diretora"
        description={<>A Mesa Diretora é o órgão de direção da Câmara Municipal, eleita entre os vereadores para conduzir os trabalhos legislativos e a administração da Casa.</>}
      />

      <section className="container-page py-12 md:py-16">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Carregando" />
          </div>
        ) : membros.length === 0 ? (
          <EstadoVazio icone={Crown} titulo="Composição em atualização" texto="A composição da Mesa Diretora será divulgada em breve." />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {membros.map((m, i) =>
              m.vereadores ? (
                <Link
                  key={m.id}
                  to="/vereadores/$slug"
                  params={{ slug: m.vereadores.slug || m.vereadores.id }}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl animate-[fade-up_0.5s_ease-out_both]"
                >
                  <div className="relative">
                    <FotoEstudio nome={m.vereadores.nome} foto={m.vereadores.foto_url} partido={m.vereadores.partido} className="aspect-[4/5]" />
                    {m.vereadores.partido && <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-primary-deep shadow-sm">{m.vereadores.partido}</span>}
                  </div>
                  <span className="h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-bold text-[oklch(0.5_0.11_70)]">{m.cargo || m.vereadores.cargo || "Membro"}</p>
                    <h2 className="mt-1 font-display text-base font-semibold leading-snug group-hover:text-primary">{m.vereadores.nome}</h2>
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-primary">
                      Ver perfil <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              ) : null,
            )}
          </div>
        )}
      </section>

      {/* ATRIBUIÇÕES */}
      <section className="border-y border-border/60 bg-secondary/40 py-12 md:py-16">
        <div className="container-page">
          <TituloSecao eyebrow="Regimento Interno" titulo="O que faz cada cargo" descricao="Competências definidas pelo Regimento Interno para cada integrante da Mesa Diretora." />
          <ol className="grid gap-4 md:grid-cols-2">
            {ATRIBUICOES.map((a, i) => (
              <li key={a.cargo} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="font-display text-4xl font-bold leading-none text-gold" aria-hidden>{i + 1}</span>
                <span>
                  <span className="block font-display text-lg font-semibold text-foreground">{a.cargo}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{a.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContinueNavegando itens={[
        { to: ROUTES.vereadores, titulo: "Vereadores", texto: "Todos os parlamentares", icone: Users },
        { to: ROUTES.comissoes, titulo: "Comissões", texto: "Comissões permanentes", icone: Landmark },
        { to: ROUTES.roteiroSessoes, titulo: "Roteiro das Sessões", texto: "Como uma sessão acontece", icone: ListOrdered },
      ]} />
    </div>
  );
}
