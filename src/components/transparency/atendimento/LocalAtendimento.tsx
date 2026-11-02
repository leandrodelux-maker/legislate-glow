import { MUNICIPIO } from "@/config/municipio";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone, User } from "lucide-react";
import { formatarTelefone, type Local } from "./locais";

const celular = (t: string) => /^\d{2}9\d{8}$/.test(t.replace(/\D/g, ""));

// Cartão de um local de atendimento presencial: endereço, horário, responsável e os atalhos de contato.
const CartaoLocal = ({ local, cor, titulo }: { local: Local; cor: string; titulo: string }) => {
  const cidadeUf = MUNICIPIO.nomeComUf;
  const mapa = local.endereco ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${local.endereco}, ${cidadeUf}`)}` : null;
  const linhas = [
    local.endereco && { icone: MapPin, rotulo: "Endereço", valor: local.endereco },
    local.horarios.length && { icone: Clock, rotulo: "Horário de atendimento", valor: local.horarios.join(" · ") },
    local.responsavel && { icone: User, rotulo: "Responsável", valor: local.responsavel },
  ].filter(Boolean) as { icone: typeof MapPin; rotulo: string; valor: string }[];
  return (
    <article className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <div className="px-6 py-5 text-white" style={{ background: `linear-gradient(135deg, ${cor}, color-mix(in srgb, ${cor} 60%, #062016))` }}>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">Atendimento presencial</p>
        <h3 className="font-display text-xl font-bold mt-0.5">{titulo}</h3>
      </div>
      <dl className="px-6 py-5 space-y-4">
        {linhas.map((l) => (
          <div key={l.rotulo} className="flex gap-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${cor} 12%, transparent)`, color: cor }}><l.icone className="h-4 w-4" aria-hidden /></span>
            <div className="min-w-0"><dt className="text-xs font-semibold text-muted-foreground">{l.rotulo}</dt><dd className="text-sm text-foreground leading-relaxed">{l.valor}</dd></div>
          </div>
        ))}
      </dl>
      <div className="px-6 pb-6 flex flex-wrap gap-2">
        {local.telefones.map((t) => (
          <a key={t} href={`tel:+55${t.replace(/\D/g, "")}`} className="h-10 inline-flex items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: cor }}>
            <Phone className="h-4 w-4" aria-hidden /> {formatarTelefone(t)}
          </a>
        ))}
        {local.telefones.filter(celular).slice(0, 1).map((t) => (
          <a key={`wa-${t}`} href={`https://wa.me/55${t.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="h-10 inline-flex items-center gap-2 rounded-xl px-4 text-sm font-semibold border border-border/60 hover:bg-muted/60">
            <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden /> WhatsApp
          </a>
        ))}
        {local.email && (
          <a href={`mailto:${local.email}`} className="h-10 inline-flex items-center gap-2 rounded-xl px-4 text-sm font-semibold border border-border/60 hover:bg-muted/60 max-w-full">
            <Mail className="h-4 w-4 shrink-0" aria-hidden /> <span className="truncate">{local.email}</span>
          </a>
        )}
        {mapa && (
          <a href={mapa} target="_blank" rel="noopener noreferrer" className="h-10 inline-flex items-center gap-2 rounded-xl px-4 text-sm font-semibold border border-border/60 hover:bg-muted/60">
            <Navigation className="h-4 w-4" aria-hidden /> Como chegar
          </a>
        )}
      </div>
    </article>
  );
};

export default CartaoLocal;
