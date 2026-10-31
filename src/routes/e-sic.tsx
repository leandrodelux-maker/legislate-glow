import { ArrowRight } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { PaginaHero } from "@/components/pagina-hero";
import { ShieldCheck as IconeHero } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Info,
  Scale,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useContactInfo } from "@/hooks/use-contact-info";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/e-sic")({
  head: () => ({
    meta: [
      { title: "e-SIC — Serviço de Informação ao Cidadão" },
      {
        name: "description",
        content:
          "Solicite informações públicas à Câmara Municipal pelo e-SIC — Lei de Acesso à Informação (Lei nº 12.527/2011).",
      },
      { property: "og:title", content: "e-SIC — Serviço de Informação ao Cidadão" },
      {
        property: "og:description",
        content: "Registre pedidos de acesso à informação com base na LAI.",
      },
    ],
  }),
  component: ESicPage,
});

function ESicPage() {
  const contact = useContactInfo();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const [protocolo, setProtocolo] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const prot = `SIC-${Date.now().toString().slice(-8)}`;
    const prazo = new Date();
    prazo.setDate(prazo.getDate() + 20);
    const payload = {
      protocolo: prot,
      nome: String(fd.get("nome") || ""),
      cpf: String(fd.get("cpf") || ""),
      email: String(fd.get("email") || ""),
      telefone: String(fd.get("telefone") || ""),
      pedido: String(fd.get("pedido") || ""),
      prazo_resposta: prazo.toISOString().slice(0, 10),
      status: "pendente",
    };
    const { error } = await (supabase as any).from("esic_solicitacoes").insert(payload);
    if (error) {
      setStatus("err");
      return;
    }
    setProtocolo(prot);
    setStatus("ok");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div>
      {/* HERO */}
      <PaginaHero
        icone={IconeHero}
        eyebrow="LAI · Lei nº 12.527/2011"
        title="e-SIC: Serviço de Informação ao Cidadão"
        description={<>Registre um pedido de acesso à informação pública. O órgão possui até 20 dias, prorrogáveis por mais 10, para responder à sua solicitação.</>}
      />

      <FaixaDestaques itens={[
        { icone: FileText, titulo: "O que é?", texto: "Canal oficial para qualquer cidadão solicitar informações públicas ao Poder Legislativo." },
        { icone: Clock, titulo: "Prazos", texto: "Resposta em até 20 dias, prorrogáveis por mais 10 dias mediante justificativa." },
        { icone: Scale, titulo: "Base legal", texto: "Lei de Acesso à Informação: Lei nº 12.527/2011." },
      ]} />

      {/* COMO FUNCIONA */}
      <section className="container-page pt-12 md:pt-16">
        <TituloSecao eyebrow="Como funciona" titulo="Três passos até a sua resposta" />
        <ol className="grid gap-3 md:grid-cols-3">
          {[
            { t: "Faça o pedido", d: "Preencha o formulário. Você não precisa justificar o motivo." },
            { t: "Guarde o protocolo", d: "Um número é gerado na hora, para identificar o seu pedido." },
            { t: "Receba a resposta", d: "A Câmara responde dentro do prazo legal." },
          ].map((p, i) => (
            <li key={p.t} className="relative flex items-center gap-4 rounded-2xl bg-secondary/60 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-deep font-display text-lg font-bold text-gold">{i + 1}</span>
              <span>
                <span className="block font-display font-semibold">{p.t}</span>
                <span className="block text-sm leading-snug text-muted-foreground">{p.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* FORM */}
      <section className="container-page grid gap-5 py-10 md:py-12 lg:grid-cols-[1.6fr_1fr] lg:items-start [&>*]:min-w-0">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary-deep/5 md:p-8">
          <h2 className="flex items-center gap-2.5 font-display text-2xl font-bold">
            <Send className="h-5 w-5 text-primary" aria-hidden /> Novo pedido de informação
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Os campos com * são obrigatórios.</p>

          {status === "ok" ? (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <p className="mt-3 font-display text-xl font-bold">Pedido registrado com sucesso!</p>
              <p className="mt-3 text-sm text-muted-foreground">Guarde o número do seu protocolo:</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary-deep">{protocolo}</p>
              <Button className="mt-5" variant="outline" onClick={() => setStatus("idle")}>Fazer novo pedido</Button>
            </div>
          ) : (
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" name="nome" required autoComplete="name" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" name="cpf" placeholder="000.000.000-00" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" className="h-11" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="pedido">Descreva sua solicitação *</Label>
                <Textarea id="pedido" name="pedido" required rows={6} placeholder="Descreva de forma clara e objetiva a informação que deseja obter." />
              </div>
              {status === "err" && (
                <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive md:col-span-2">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> Não foi possível registrar o pedido. Tente novamente.
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Ao enviar, você concorda com o tratamento dos dados conforme a LGPD.
                </p>
                <Button type="submit" size="lg" className="shrink-0" disabled={status === "sending"}>
                  {status === "sending" ? "Enviando..." : "Enviar pedido"} <Send className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="acesso-destaque rounded-3xl p-6 text-white md:p-7 lg:sticky lg:top-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Outros canais</p>
          <h2 className="mt-1 font-display text-xl font-bold">Prefere outro canal?</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={`mailto:${contact.email}`} className="font-semibold [overflow-wrap:anywhere] hover:text-gold">{contact.email}</a></li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={contact.telefoneHref} className="font-semibold hover:text-gold">{contact.telefone}</a></li>
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /><span>{contact.endereco}</span></li>
            <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /><span>{contact.horario}</span></li>
          </ul>
          <div className="mt-6 space-y-2 border-t border-white/15 pt-5 text-sm">
            <Link to="/transparencia" className="flex items-center justify-between gap-2 font-semibold hover:text-gold">A informação pode já estar no Portal <ArrowRight className="h-4 w-4 shrink-0" aria-hidden /></Link>
            <Link to="/perguntas-frequentes" className="flex items-center justify-between gap-2 font-semibold hover:text-gold">Perguntas frequentes <ArrowRight className="h-4 w-4 shrink-0" aria-hidden /></Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
