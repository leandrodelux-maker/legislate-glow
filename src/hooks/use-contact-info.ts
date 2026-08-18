import { useSiteSettings } from "@/hooks/use-site-settings";

export const CONTACT_FALLBACK = {
  nome: "Câmara Municipal de Cachoeira de Goiás",
  endereco: "Avenida Anicuns, 140, Setor Central, Cachoeira de Goiás-GO",
  telefone: "(64) 99233-6171",
  email: "contato@camaracachoeiradegoias.go.gov.br",
  horario: "Segunda a Sexta 08h às 11h e 13h às 17h",
  whatsapp: "(64) 99233-6171",
};

export type ContactInfo = typeof CONTACT_FALLBACK & { telefoneHref: string; whatsappHref: string };

export function toTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+55${digits}`;
}

export function toWhatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/55${digits}`;
}

/** Fonte única dos dados de contato do site (banco + fallback oficial). */
export function useContactInfo(): ContactInfo {
  const { settings } = useSiteSettings();

  const telefone = settings?.["contact_phone"] || CONTACT_FALLBACK.telefone;
  const whatsapp = settings?.["whatsapp"] || telefone;

  return {
    nome: settings?.["nome_camara"] || CONTACT_FALLBACK.nome,
    endereco: settings?.["endereco"] || CONTACT_FALLBACK.endereco,
    telefone,
    email: settings?.["contact_email"] || CONTACT_FALLBACK.email,
    horario: settings?.["contact_hours"] || CONTACT_FALLBACK.horario,
    whatsapp,
    telefoneHref: toTelHref(telefone),
    whatsappHref: toWhatsappHref(whatsapp),
  };
}
