import { Megaphone, ArrowRight } from "lucide-react";
import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { Link } from "@tanstack/react-router";
import { PaginaHero } from "@/components/pagina-hero";
import { MessageSquare as IconeHero } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Clock, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Send, 
  ShieldCheck, 
  Search, 
  FileText, 
  Info,
  AlertCircle,
  ThumbsUp,
  HelpCircle,
  Upload,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useContactInfo } from "@/hooks/use-contact-info";


export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Participação Cidadã — Câmara Municipal" },
      {
        name: "description",
        content: "Ouvidoria, SIC (Lei de Acesso à Informação) e canais de contato oficial.",
      },
    ],
  }),
  component: ContatoPage,
});

const tiposOuvidoria = [
  { id: "denuncia", label: "Denúncia", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "elogio", label: "Elogio", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "solicitacao", label: "Solicitação", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "reclamacao", label: "Reclamação", icon: Info, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "sugestao", label: "Sugestão", icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
];

function ContatoPage() {
  const contact = useContactInfo();
  const [protocol, setProtocol] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockProtocol = "2026." + Math.floor(Math.random() * 90000 + 10000);
    setProtocolNumber(mockProtocol);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <section className="container-page flex min-h-[60vh] items-center justify-center py-20">
        <div className="w-full max-w-md space-y-6 text-center animate-[fade-up_0.5s_ease-out]">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-10 w-10" aria-hidden />
          </div>
          <h2 className="font-display text-3xl font-bold">Protocolo Gerado!</h2>
          <p className="text-muted-foreground">Sua solicitação foi recebida com sucesso. Você receberá atualizações no e-mail informado.</p>
          <div className="rounded-2xl border border-border bg-secondary/60 p-6">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Número do protocolo</span>
            <div className="mt-2 font-mono text-3xl font-bold text-primary">{protocolNumber}</div>
          </div>
          <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">Voltar</Button>
        </div>
      </section>
    );
  }

  const classeAba = "min-h-11 gap-2 rounded-xl px-4 data-[state=active]:bg-primary-deep data-[state=active]:text-white";

  return (
    <>
      <PaginaHero
        icone={IconeHero}
        eyebrow="Transparência e Diálogo"
        title="Participação"
        destaque="Cidadã"
        description={<>A Ouvidoria e o e-SIC são os seus canais diretos com o Poder Legislativo. Sua participação é fundamental para uma gestão transparente.</>}
      />

      <FaixaDestaques itens={[
        { icone: Phone, titulo: contact.telefone, texto: "Telefone de atendimento" },
        { icone: Clock, titulo: "Horário de atendimento", texto: contact.horario },
        { icone: MapPin, titulo: "Nosso endereço", texto: contact.endereco },
      ]} />

      <section className="container-page py-10 md:py-14">
        <Tabs defaultValue="ouvidoria" className="space-y-8">
          <TabsList className="h-auto max-w-full flex-wrap justify-start gap-1 rounded-2xl border border-border bg-secondary/60 p-1.5">
            <TabsTrigger value="ouvidoria" className={classeAba}><Megaphone className="h-4 w-4" aria-hidden /> Ouvidoria</TabsTrigger>
            <TabsTrigger value="sic" className={classeAba}><FileText className="h-4 w-4" aria-hidden /> e-SIC</TabsTrigger>
            <TabsTrigger value="protocolo" className={classeAba}><Search className="h-4 w-4" aria-hidden /> Acompanhar protocolo</TabsTrigger>
          </TabsList>

          <TabsContent value="ouvidoria" className="animate-[fade-up_0.4s_ease-out]">
            <div className="grid gap-5 lg:grid-cols-[1fr_1.7fr] lg:items-start [&>*]:min-w-0">
              <aside className="acesso-destaque rounded-3xl p-6 text-white md:p-7 lg:sticky lg:top-20">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Como funciona</p>
                <h2 className="mt-1 font-display text-2xl font-bold">Sua voz chega ao setor certo</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/90">A Ouvidoria recebe suas manifestações e as encaminha aos setores responsáveis, acompanhando todo o processo até a resposta final.</p>
                <a href={`mailto:${contact.email}`} className="mt-6 flex items-start gap-3 border-t border-white/15 pt-5 text-sm font-semibold [overflow-wrap:anywhere] hover:text-gold">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /> {contact.email}
                </a>
              </aside>

              <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary-deep/5 md:p-8">
                <div>
                  <h2 className="font-display text-2xl font-bold">Nova manifestação</h2>
                  <p className="text-sm text-muted-foreground">Escolha o tipo e conte o que aconteceu.</p>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium">Tipo de manifestação</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {tiposOuvidoria.map((t, i) => (
                      <label key={t.id} className="relative cursor-pointer">
                        <input type="radio" name="tipo" value={t.id} defaultChecked={i === 0} className="peer sr-only" />
                        <span className="flex h-full flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-center text-sm font-semibold transition peer-checked:border-primary-deep peer-checked:bg-primary-deep peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                          <t.icon className="h-5 w-5" aria-hidden /> {t.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="assunto">Assunto principal *</Label>
                    <Input id="assunto" required className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input id="nome" autoComplete="name" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail para resposta *</Label>
                    <Input id="email" type="email" required autoComplete="email" className="h-11" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mensagem">Relato detalhado *</Label>
                  <Textarea id="mensagem" rows={6} placeholder="Descreva sua manifestação com o máximo de detalhes possível." required />
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-5 sm:flex-row">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden /> Seus dados estão protegidos pela LGPD.
                  </p>
                  <Button type="submit" size="lg" className="w-full shrink-0 sm:w-auto">
                    Enviar manifestação <Send className="ml-2 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="sic" className="animate-[fade-up_0.4s_ease-out]">
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/transparencia" className="group rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
                <FileText className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold">Veja se já está publicado</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Muitos dados já estão disponíveis no Portal da Transparência.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Abrir o portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
              </Link>
              <Link to="/e-sic" className="group acesso-destaque rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                <Send className="h-6 w-6 text-gold" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold">Faça o seu pedido</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/90">Qualquer pessoa, física ou jurídica, pode pedir informações públicas, sem justificar.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold">Ir para o e-SIC <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
              </Link>
              <div className="rounded-3xl border border-border bg-card p-6">
                <Clock className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold">Prazo de resposta</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Até 20 dias, prorrogáveis por mais 10 dias mediante justificativa (Lei nº 12.527/2011).</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="protocolo" className="animate-[fade-up_0.4s_ease-out]">
            <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary-deep/5 md:p-8">
              <h2 className="font-display text-2xl font-bold">Acompanhe seu pedido</h2>
              <p className="mt-1 text-sm text-muted-foreground">Informe o número do protocolo e o documento cadastrado.</p>
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="track-protocol">Número do protocolo</Label>
                  <Input id="track-protocol" placeholder="Ex.: SIC-12345678" value={protocol} onChange={(e) => setProtocol(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="track-doc">Documento (CPF/CNPJ)</Label>
                  <Input id="track-doc" placeholder="000.000.000-00" className="h-11" />
                </div>
                <Button size="lg" className="w-full">Consultar status</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
