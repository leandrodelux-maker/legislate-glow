import { ArrowRight } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { PaginaHero } from "@/components/pagina-hero";
import { Scale as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, UserCheck, FileText, Mail, Scale, Database, Eye } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

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
  const { settings } = useSiteSettings();
  const dpoName = settings?.dpo_name || "A definir por portaria";
  const contactEmail = settings?.email || "contato@camaracachoeiradegoias.go.gov.br";

  return (
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="Lei nº 13.709/2018"
        title="LGPD: Lei Geral de Proteção de Dados"
        description={<>A Câmara Municipal trata dados pessoais em conformidade com a LGPD, garantindo transparência, segurança e respeito aos direitos dos titulares.</>}
      />

      <FaixaDestaques itens={PRINCIPIOS.map((p) => ({ icone: p.icon, titulo: p.title, texto: p.text }))} />

      {/* DIREITOS DO TITULAR */}
      <section className="container-page py-12 md:py-16">
        <TituloSecao eyebrow="Art. 18 da LGPD" titulo="Os seus direitos como titular" descricao="Você pode exercer estes direitos a qualquer momento, mediante requisição." />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIREITOS.map((d, i) => (
            <li key={d} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">{i + 1}</span>
              <span className="text-sm font-medium leading-relaxed text-foreground">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ENCARREGADO */}
      <section className="container-page grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <div className="acesso-destaque relative overflow-hidden rounded-3xl p-6 text-white md:p-8">
          <UserCheck className="absolute -bottom-8 -right-6 h-40 w-40 opacity-10" aria-hidden />
          <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-gold">Encarregado de Dados (DPO)</p>
          <h2 className="relative mt-1 font-display text-2xl font-bold">Quem cuida dos seus dados</h2>
          <p className="relative mt-2 max-w-xl text-sm leading-relaxed text-white/90">
            O Encarregado é o canal de comunicação entre a Câmara Municipal, os titulares e a Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
          <dl className="relative mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-3.5">
              <dt className="text-xs text-white/80">Nome</dt>
              <dd className="mt-0.5 font-semibold">{dpoName}</dd>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5">
              <dt className="text-xs text-white/80">E-mail</dt>
              <dd className="mt-0.5 font-semibold [overflow-wrap:anywhere]"><a href={`mailto:${contactEmail}`} className="hover:text-gold">{contactEmail}</a></dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Como exercer seus direitos</h2>
          <ul className="mt-4 space-y-2">
            {[
              { to: "/e-sic", t: "e-SIC", d: "Pedido formal de informação", i: FileText },
              { to: "/contato", t: "Ouvidoria", d: "Dúvidas e reclamações", i: Mail },
            ].map((c) => (
              <li key={c.to}>
                <Link to={c.to as never} className="group flex items-center gap-3 rounded-xl border border-border/70 p-3 transition hover:border-primary/40">
                  <c.i className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold group-hover:text-primary">{c.t}</span>
                    <span className="block text-sm text-muted-foreground">{c.d}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
