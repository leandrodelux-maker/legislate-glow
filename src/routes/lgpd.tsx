import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, UserCheck, FileText, Mail, Scale, Database, Eye } from "lucide-react";

export const Route = createFileRoute("/lgpd")({
  head: () => ({
    meta: [
      { title: "LGPD — Proteção de Dados Pessoais" },
      {
        name: "description",
        content:
          "Política de proteção de dados pessoais da Câmara Municipal em conformidade com a Lei nº 13.709/2018 (LGPD).",
      },
      { property: "og:title", content: "LGPD — Proteção de Dados Pessoais" },
      { property: "og:description", content: "Direitos do titular, encarregado (DPO) e canais de atendimento." },
    ],
  }),
  component: LgpdPage,
});

const PRINCIPIOS = [
  { icon: Eye, title: "Transparência", text: "Informações claras sobre o tratamento de dados pessoais." },
  { icon: Lock, title: "Segurança", text: "Medidas técnicas e administrativas para proteger os dados." },
  { icon: UserCheck, title: "Finalidade", text: "Uso dos dados apenas para propósitos legítimos e informados." },
  { icon: Database, title: "Minimização", text: "Coleta limitada ao necessário para a prestação do serviço." },
];

const DIREITOS = [
  "Confirmação da existência de tratamento",
  "Acesso aos dados pessoais",
  "Correção de dados incompletos, inexatos ou desatualizados",
  "Anonimização, bloqueio ou eliminação de dados desnecessários",
  "Portabilidade dos dados a outro fornecedor",
  "Eliminação dos dados tratados com consentimento",
  "Informação sobre entidades públicas e privadas com as quais houve compartilhamento",
  "Informação sobre a possibilidade de não fornecer consentimento e suas consequências",
  "Revogação do consentimento",
];

function LgpdPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div className="container-page py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            <Scale className="h-3 w-3" /> Lei nº 13.709/2018
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
            LGPD — Lei Geral de Proteção de Dados
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            A Câmara Municipal trata dados pessoais em conformidade com a LGPD, garantindo transparência,
            segurança e respeito aos direitos dos titulares.
          </p>
        </div>
      </section>

      {/* PRINCÍPIOS */}
      <section className="container-page py-10 md:py-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-primary" />
          <h2 className="font-display text-2xl font-bold">Princípios que seguimos</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPIOS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-6">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIREITOS DO TITULAR */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-10 md:py-14 grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-primary" />
              <h2 className="font-display text-2xl font-bold">Direitos do Titular</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-7">
              Como titular de dados pessoais, você pode exercer, a qualquer momento e mediante requisição,
              os direitos previstos no <strong>art. 18</strong> da LGPD:
            </p>
          </div>
          <ul className="grid gap-2 rounded-xl border border-border bg-card p-6 text-sm">
            {DIREITOS.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ENCARREGADO / DPO */}
      <section className="container-page py-10 md:py-14 grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold">Encarregado de Dados (DPO)</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-7">
            O Encarregado pelo Tratamento de Dados Pessoais é o canal de comunicação entre a Câmara
            Municipal, os titulares e a Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Nome</div>
              <div className="mt-0.5 font-semibold">A definir por portaria</div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</div>
              <a href="mailto:contato@camaracachoeiradegoias.go.gov.br" className="mt-0.5 block font-semibold text-primary hover:underline">
                contato@camaracachoeiradegoias.go.gov.br
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">Canais</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/e-sic" className="text-primary hover:underline">e-SIC</Link> — pedido formal de informação
            </li>
            <li>
              <Link to="/contato" className="text-primary hover:underline">Ouvidoria</Link> — dúvidas e reclamações
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <a href="mailto:contato@camaracachoeiradegoias.go.gov.br" className="text-primary hover:underline">contato@camaracachoeiradegoias.go.gov.br</a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
