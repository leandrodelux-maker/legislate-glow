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
      <section className="container-page py-20 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 animate-[fade-up_0.5s_ease-out]">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-display text-3xl font-bold">Protocolo Gerado!</h2>
          <p className="text-muted-foreground">
            Sua solicitação foi recebida com sucesso. Você receberá atualizações no e-mail informado.
          </p>
          <div className="bg-secondary p-6 rounded-xl border border-border">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Número do Protocolo</span>
            <div className="text-3xl font-mono font-bold text-primary mt-2">{protocolNumber}</div>
          </div>
          <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">
            Voltar ao Início
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-br from-primary-deep to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
        <div className="container-page py-11 md:py-16 relative z-10">
          <div className="text-xs uppercase tracking-[0.2em] text-gold flex items-center gap-3">
            <span className="gold-divider" /> Transparência e Diálogo
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold leading-tight">
            Participação <span className="text-gold">Cidadã</span>
          </h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/85 text-lg">
            A Ouvidoria e o SIC são os seus canais diretos com o Poder Legislativo. 
            Sua participação é fundamental para uma gestão transparente.
          </p>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <Tabs defaultValue="ouvidoria" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <TabsList className="h-14 p-1 bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl">
              <TabsTrigger value="ouvidoria" className="px-8 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base font-medium">
                Ouvidoria
              </TabsTrigger>
              <TabsTrigger value="sic" className="px-8 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base font-medium">
                SIC (Acesso à Informação)
              </TabsTrigger>
              <TabsTrigger value="protocolo" className="px-8 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base font-medium">
                Acompanhar Protocolo
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ouvidoria" className="animate-[fade-up_0.5s_ease-out]">
            <div className="grid gap-12 lg:grid-cols-5">
              <div className="lg:col-span-2 space-y-6">
                <div className="card-premium p-8 bg-primary/5 border-primary/10">
                  <h3 className="font-display text-xl font-bold mb-4">Como funciona a Ouvidoria?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    A Ouvidoria recebe suas manifestações e as encaminha aos setores responsáveis, acompanhando todo o processo até a resposta final.
                  </p>
                  <div className="space-y-4">
                    {tiposOuvidoria.map((tipo) => (
                      <div key={tipo.id} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/40">
                        <div className={`w-8 h-8 rounded-full ${tipo.bg} ${tipo.color} flex items-center justify-center`}>
                          <tipo.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold">{tipo.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-display font-bold">Outros Canais</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <Phone className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone Atendimento</p>
                        <a href={contact.telefoneHref} className="font-bold hover:text-primary">{contact.telefone}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <Mail className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Envie um e-mail</p>
                        <a href={`mailto:${contact.email}`} className="font-bold text-sm break-all hover:text-primary">{contact.email}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <MapPin className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nosso endereço</p>
                        <p className="font-bold text-sm">{contact.endereco}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <Clock className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Horário Atendimento</p>
                        <p className="font-bold text-sm">{contact.horario}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <form onSubmit={handleSubmit} className="lg:col-span-3 card-premium p-8 md:p-10 space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Nova Manifestação</h2>
                    <p className="text-sm text-muted-foreground">Identifique-se ou envie de forma anônima.</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Manifestação</Label>
                    <select id="tipo" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary">
                      {tiposOuvidoria.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assunto">Assunto Principal</Label>
                    <Input id="assunto" placeholder="Ex: Iluminação, Prazos..." required />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail para resposta</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem">Relato Detalhado</Label>
                  <Textarea id="mensagem" rows={6} placeholder="Descreva sua manifestação com o máximo de detalhes possível..." required />
                </div>

                <div className="p-6 border-2 border-dashed border-border rounded-xl bg-secondary/30 text-center space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-semibold">Anexar Arquivos</p>
                  <p className="text-xs text-muted-foreground">Fotos, documentos ou vídeos (Máx 10MB)</p>
                  <input type="file" className="hidden" id="file-upload" />
                  <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                    Selecionar Arquivos
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Seus dados estão protegidos pela LGPD.
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto px-10">
                    Enviar Manifestação <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="sic" className="animate-[fade-up_0.5s_ease-out]">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge className="bg-gold/20 text-gold-foreground border-gold/30 hover:bg-gold/20">Lei 12.527/2011</Badge>
                <h2 className="font-display text-3xl font-bold">Solicitação de Informação (SIC)</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Qualquer pessoa, física ou jurídica, pode formular pedido de acesso à informação pública sobre o Poder Legislativo Municipal.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Transparência Ativa", desc: "Dados que já estão disponíveis no Portal da Transparência.", link: "/transparencia-portal" },
                  { title: "Transparência Passiva", desc: "Solicite dados específicos que ainda não foram publicados.", active: true },
                  { title: "Prazos de Resposta", desc: "Até 20 dias úteis, prorrogáveis por mais 10 dias.", icon: Clock },
                ].map((card, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${card.active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                    <h4 className="font-bold mb-2">{card.title}</h4>
                    <p className={`text-sm ${card.active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{card.desc}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="card-premium p-8 md:p-10 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sic-nome">Identificação do Solicitante</Label>
                    <Input id="sic-nome" placeholder="Nome completo ou Razão Social" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sic-doc">CPF ou CNPJ</Label>
                      <Input id="sic-doc" placeholder="000.000.000-00" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sic-email">E-mail para Notificações</Label>
                      <Input id="sic-email" type="email" placeholder="seu@email.com" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sic-info">Especificação da Informação</Label>
                  <Textarea id="sic-info" rows={5} placeholder="Descreva de forma clara e precisa a informação que deseja solicitar..." required />
                </div>

                <div className="space-y-2">
                  <Label>Formato de Recebimento</Label>
                  <div className="flex flex-wrap gap-4">
                    {["E-mail", "Arquivos Digitais", "Consulta Presencial", "Cópia Física"].map(f => (
                      <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="format" className="accent-primary" /> {f}
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Protocolar Pedido de Informação <FileText className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="protocolo" className="animate-[fade-up_0.5s_ease-out]">
            <div className="max-w-xl mx-auto text-center space-y-8 py-12">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold">Acompanhe seu Pedido</h2>
                <p className="text-muted-foreground">Insira o número do protocolo e o documento cadastrado para ver o status da sua demanda.</p>
              </div>

              <div className="card-premium p-8 space-y-6">
                <div className="space-y-2 text-left">
                  <Label htmlFor="track-protocol">Número do Protocolo</Label>
                  <Input 
                    id="track-protocol" 
                    placeholder="Ex: 2026.12345" 
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="track-doc">Documento (CPF/CNPJ)</Label>
                  <Input id="track-doc" placeholder="000.000.000-00" />
                </div>
                <Button className="w-full h-12 text-base font-bold">Consultar Status</Button>
              </div>

              <div className="bg-secondary/30 rounded-xl p-6 border border-border flex items-start gap-4 text-left">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O prazo médio de resposta da Ouvidoria é de 5 dias úteis. Para pedidos via SIC, o prazo legal é de 20 dias corridos.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
