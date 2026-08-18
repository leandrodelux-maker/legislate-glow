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
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div className="container-page py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
              <ShieldCheck className="h-3 w-3" /> LAI · Lei nº 12.527/2011
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
            e-SIC — Serviço de Informação ao Cidadão
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85 md:text-base">
            Registre um pedido de acesso à informação pública. O órgão possui até 20 dias, prorrogáveis por
            mais 10, para responder à sua solicitação.
          </p>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="container-page py-10 md:py-14 grid gap-5 md:grid-cols-3">
        {[
          { icon: FileText, title: "O que é?", text: "Canal oficial para qualquer cidadão solicitar informações públicas ao Poder Legislativo Municipal." },
          { icon: Clock, title: "Prazos", text: "Resposta em até 20 dias corridos, com possibilidade de prorrogação por mais 10 dias mediante justificativa." },
          { icon: Scale, title: "Base Legal", text: "Lei de Acesso à Informação — Lei nº 12.527/2011 e Decreto nº 7.724/2012." },
        ].map((it) => (
          <div key={it.title} className="rounded-xl border border-border bg-card p-6">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-6">{it.text}</p>
          </div>
        ))}
      </section>

      {/* FORM */}
      <section className="container-page pb-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Send className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Novo pedido de informação</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados abaixo. Um número de protocolo será gerado para acompanhamento.
          </p>

          {status === "ok" ? (
            <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-5 text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5" /> Pedido registrado com sucesso!
              </div>
              <p className="mt-2 text-sm">
                Protocolo: <span className="font-mono font-bold">{protocolo}</span>. Guarde este número
                para acompanhamento.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => setStatus("idle")}>
                Fazer novo pedido
              </Button>
            </div>
          ) : (
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="md:col-span-1">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" name="nome" required />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" name="cpf" placeholder="000.000.000-00" />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="pedido">Descreva sua solicitação *</Label>
                <Textarea id="pedido" name="pedido" required rows={6} placeholder="Descreva de forma clara e objetiva a informação que deseja obter." />
              </div>
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Ao enviar, você concorda com o tratamento dos dados conforme a LGPD.
                </p>
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Enviando..." : "Enviar pedido"} <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {status === "err" && (
                <div className="md:col-span-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" /> Não foi possível registrar o pedido. Tente novamente.
                </div>
              )}
            </form>
          )}
        </div>

        {/* CONTATOS ALTERNATIVOS */}
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-primary"><Mail className="h-4 w-4" /> <span className="font-semibold">E-mail</span></div>
            <a href={`mailto:${contact.email}`} className="mt-1 block break-all text-sm text-muted-foreground hover:text-primary">{contact.email}</a>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-primary"><Phone className="h-4 w-4" /> <span className="font-semibold">Telefone</span></div>
            <a href={contact.telefoneHref} className="mt-1 block text-sm text-muted-foreground hover:text-primary">{contact.telefone}</a>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-primary"><MapPin className="h-4 w-4" /> <span className="font-semibold">Endereço</span></div>
            <p className="mt-1 text-sm text-muted-foreground">{contact.endereco}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-primary"><Clock className="h-4 w-4" /> <span className="font-semibold">Horário</span></div>
            <p className="mt-1 text-sm text-muted-foreground">{contact.horario}</p>
          </div>
        </div>


        <div className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">
          Veja também as <Link to="/perguntas-frequentes" className="text-primary hover:underline">Perguntas Frequentes</Link> ou consulte o <Link to="/transparencia-portal" className="text-primary hover:underline">Portal da Transparência</Link>.
        </div>
      </section>
    </main>
  );
}
