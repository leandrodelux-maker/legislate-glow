import { Link } from "@/lib/roteador-transparencia";
import { ArrowRight, MessageSquareText, Send } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import CartaoLocal from "@/components/transparency/atendimento/LocalAtendimento";
import type { Local } from "@/components/transparency/atendimento/locais";
import { findItem } from "@/data/transparenciaCatalogo";
import { useContactInfo } from "@/hooks/use-contact-info";

// Onde ser atendido pessoalmente: o SIC físico (pedidos de informação) ou a Ouvidoria (manifestações).
// Os dados vêm do painel, em Configurações → Geral: são os mesmos do cabeçalho, do rodapé e da página de contato.
const TEXTOS = {
  sic: {
    slug: "sic-fisico", titulo: "Serviço de Informação ao Cidadão (SIC)",
    oQue: "O SIC atende e orienta quem quer uma informação pública: lá você registra o pedido pessoalmente, acompanha o andamento e recebe a resposta (Lei nº 12.527/2011, art. 9º).",
    online: { rotulo: "Prefere pela internet? Faça o pedido no e-SIC", href: "/e-sic", icone: Send },
  },
  ouvidoria: {
    slug: "informacoes-ouvidoria", titulo: "Ouvidoria Municipal",
    oQue: "A Ouvidoria recebe denúncias, reclamações, sugestões e elogios, encaminha ao setor responsável e acompanha até a resposta (Lei nº 13.460/2017).",
    online: { rotulo: "Prefere pela internet? Registre na Ouvidoria on-line", href: "/contato", icone: MessageSquareText },
  },
};

const AtendimentoPresencialPage = ({ tipo }: { tipo: keyof typeof TEXTOS }) => {
  const t = TEXTOS[tipo];
  const item = findItem(t.slug)!;
  const cor = item.tema.color;
  const contato = useContactInfo();
  const local: Local = {
    endereco: contato.endereco,
    telefones: [...new Set([contato.telefone, contato.whatsapp].filter(Boolean))],
    email: contato.email,
    horarios: contato.horario ? [contato.horario] : [],
  };

  return (
    <TransparencyLayout title={item.label} description={item.desc}
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: item.tema.label, href: `/transparencia/tema/${item.tema.id}` }, { label: item.label }]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="space-y-6">
          <CartaoLocal local={local} cor={cor} titulo={t.titulo} />
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">O que é</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.oQue}</p>
          </div>
          <Link to={t.online.href} className="group flex items-center gap-3 rounded-3xl p-5 text-white hover:opacity-95" style={{ backgroundColor: cor }}>
            <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><t.online.icone className="h-5 w-5" aria-hidden /></span>
            <span className="flex-1 text-sm font-semibold leading-snug">{t.online.rotulo}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition" aria-hidden />
          </Link>
          <Link to="/contato" className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/50">
            Já tem um protocolo? Acompanhe aqui <ArrowRight className="h-4 w-4 ml-auto" aria-hidden />
          </Link>
        </aside>
      </div>
    </TransparencyLayout>
  );
};

export default AtendimentoPresencialPage;
