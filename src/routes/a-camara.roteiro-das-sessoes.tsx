import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ROUTES } from "@/lib/site-links";

export const Route = createFileRoute("/a-camara/roteiro-das-sessoes")({
  head: () => ({
    meta: [
      { title: "Roteiro das Sessões — Câmara Municipal de Adelândia" },
      {
        name: "description",
        content:
          "Passo a passo das sessões da Câmara Municipal: abertura, leitura da ata, apresentação de proposituras, Ordem do Dia, Tribuna Livre e explicações pessoais.",
      },
      { property: "og:title", content: "Roteiro das Sessões — Câmara Municipal de Adelândia" },
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

const ETAPAS = [
  {
    n: "1º",
    icon: Gavel,
    title: "Abertura dos trabalhos",
    text: "Constatado o quórum regimental, o Presidente pronuncia: “Em nome de Deus declaro aberto os trabalhos da presente sessão”.",
    note: "A Câmara somente se reúne com a presença de, no mínimo, 1/3 dos vereadores. Para deliberar sobre qualquer matéria, é exigida a presença da maioria absoluta dos membros.",
  },
  {
    n: "2º",
    icon: FileText,
    title: "Leitura e votação da ata",
    text: "É feita a leitura da ata da sessão anterior, submetida em seguida à votação do plenário.",
  },
  {
    n: "3º",
    icon: ListOrdered,
    title: "Apresentação das proposituras",
    text: "O 1º Secretário faz a leitura das proposituras apresentadas no dia — projetos, indicações, requerimentos e moções.",
  },
  {
    n: "4º",
    icon: CheckCircle2,
    title: "Ordem do Dia",
    text: "O Presidente declara aberta a Ordem do Dia, período destinado à apreciação das matérias constantes da pauta. Esgotada a pauta, anuncia a Ordem do Dia da sessão seguinte e concede as inscrições para a Tribuna Livre.",
  },
  {
    n: "5º",
    icon: Mic,
    title: "Explicações pessoais",
    text: "Com duração de 45 minutos, destinam-se ao pronunciamento dos vereadores inscritos até o final da Ordem do Dia — ou, alternativamente, por sorteio entre os presentes — por 7 minutos cada, facultado 1/3 a mais do tempo aos líderes.",
  },
  {
    n: "6º",
    icon: MessageSquare,
    title: "Encerramento",
    text: "Após as explicações pessoais, não havendo mais nada a tratar, o Presidente declara encerrados os trabalhos e convida os presentes para a próxima sessão ordinária.",
  },
];

function RoteiroPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_25%,white,transparent_45%),radial-gradient(circle_at_80%_0%,white,transparent_40%)]"
        />
        <div className="container-page relative py-8 md:py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            <ListOrdered className="h-3 w-3" /> A Câmara
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
            Roteiro das Sessões
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            As sessões da Câmara são ordinárias, extraordinárias ou solenes, com acesso assegurado ao
            público em geral. Veja abaixo como se desenvolve, etapa por etapa, uma sessão plenária.
          </p>
        </div>
      </section>

      {/* TIPOS */}
      <section className="container-page py-10 md:py-14">
        <SectionHeading
          eyebrow="Das sessões em geral"
          title="Tipos de sessão"
          description="Toda sessão é pública e pode ser acompanhada presencialmente no plenário ou pelas transmissões oficiais."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TIPOS.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">{t.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ETAPAS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-10 md:py-14">
          <SectionHeading
            eyebrow="Roteiro da sessão"
            title="Passo a passo dos trabalhos"
            description="Sequência prevista no Regimento Interno da Casa Legislativa."
          />
          <ol className="mt-8 space-y-4">
            {ETAPAS.map((e) => (
              <li
                key={e.n}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
                    {e.n}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <e.icon className="h-4 w-4 text-primary" />
                      <h3 className="font-display text-base font-bold text-foreground md:text-lg">
                        {e.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{e.text}</p>
                    {e.note && (
                      <p className="mt-3 flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs leading-6 text-foreground">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        <span>
                          <strong className="font-semibold">Quórum: </strong>
                          {e.note}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { to: ROUTES.sessoes, label: "Sessões e Pautas", desc: "Calendário, pautas e atas das sessões." },
            { to: ROUTES.sessoesAoVivo, label: "Sessões ao Vivo", desc: "Assista às transmissões em tempo real." },
            { to: ROUTES.comissoes, label: "Comissões", desc: "Quem analisa as matérias antes do plenário." },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <h3 className="font-display text-lg font-bold text-foreground">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Acessar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
