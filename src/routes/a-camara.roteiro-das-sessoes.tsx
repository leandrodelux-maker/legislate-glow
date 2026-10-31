import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import { PaginaHero } from "@/components/pagina-hero";
import { ListOrdered as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ListOrdered,
  Gavel,
  FileText,
  Mic,
  MessageSquare,
  CheckCircle2,
  Info,
  ArrowRight,
  CalendarDays,
  Loader2,
  List,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ROUTES } from "@/lib/site-links";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/a-camara/roteiro-das-sessoes")({
  head: () => ({
    meta: [
      { title: "Roteiro das Sessões — Câmara Municipal de Cachoeira de Goiás" },
      {
        name: "description",
        content:
          "Passo a passo das sessões da Câmara Municipal: abertura, leitura da ata, apresentação de proposituras, Ordem do Dia, Tribuna Livre e explicações pessoais.",
      },
      { property: "og:title", content: "Roteiro das Sessões — Câmara Municipal de Cachoeira de Goiás" },
      {
        property: "og:description",
        content: "Como funciona, etapa por etapa, uma sessão plenária do Legislativo municipal.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoteiroPage,
});

const TIPOS = [
  {
    title: "Sessões Ordinárias",
    text: "Realizadas periodicamente conforme o calendário legislativo, destinam-se à apreciação regular das matérias em pauta.",
  },
  {
    title: "Sessões Extraordinárias",
    text: "Convocadas fora do calendário ordinário para tratar de matéria urgente e relevante ao interesse público.",
  },
  {
    title: "Sessões Solenes",
    text: "Destinadas a homenagens, posses e comemorações cívicas, sem deliberação de matérias legislativas.",
  },
];

type RoteiroEtapa = {
  id: string;
  numero_etapa: string;
  titulo: string;
  descricao: string;
  nota_quorum: string | null;
  icone: string | null;
};

const ICON_MAP: Record<string, any> = {
  Gavel,
  FileText,
  ListOrdered,
  CheckCircle2,
  Mic,
  MessageSquare,
  List,
};

function RoteiroPage() {
  const [etapas, setEtapas] = useState<RoteiroEtapa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("roteiro_sessoes")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      if (!error && data) setEtapas(data as RoteiroEtapa[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="A Câmara"
        title="Roteiro das Sessões"
        description={<>As sessões da Câmara são ordinárias, extraordinárias ou solenes, com acesso assegurado ao público em geral. Veja abaixo como se desenvolve, etapa por etapa, uma sessão plenária.</>}
      />

      <FaixaDestaques itens={TIPOS.map((t) => ({ icone: CalendarDays, titulo: t.title, texto: t.text }))} />

      {/* ETAPAS */}
      <section className="container-page py-12 md:py-16">
        <TituloSecao eyebrow="Roteiro da sessão" titulo="Passo a passo dos trabalhos" descricao="Toda sessão é pública e pode ser acompanhada presencialmente no plenário ou pelas transmissões oficiais." />
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
          </div>
        ) : etapas.length === 0 ? (
          <EstadoVazio icone={ListOrdered} titulo="Roteiro em atualização" texto="As etapas da sessão serão publicadas em breve." />
        ) : (
          <ol className="relative mx-auto max-w-4xl">
            <span className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-border" aria-hidden />
            {etapas.map((e) => {
              const Icon = (e.icone && ICON_MAP[e.icone]) || List;
              return (
                <li key={e.id} className="relative flex gap-4 pb-4 last:pb-0 md:gap-5">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-deep font-display text-lg font-bold text-gold shadow-md">
                    {e.numero_etapa}
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-elegant">
                    <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden /> {e.titulo}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{e.descricao}</p>
                    {e.nota_quorum && (
                      <p className="mt-3 flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm leading-6 text-foreground">
                        <Info className="mt-1 h-4 w-4 shrink-0 text-[oklch(0.5_0.11_70)]" aria-hidden />
                        <span><strong className="font-semibold">Quórum: </strong>{e.nota_quorum}</span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <ContinueNavegando itens={[
        { to: ROUTES.sessoes, titulo: "Sessões e Pautas", texto: "Agenda, pautas e atas", icone: CalendarDays },
        { to: ROUTES.sessoesAoVivo, titulo: "Transmissão ao vivo", texto: "Acompanhe em tempo real", icone: Mic },
        { to: ROUTES.comissoes, titulo: "Comissões", texto: "Quem analisa as matérias", icone: Gavel },
      ]} />
    </div>
  );
}
