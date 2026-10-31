// Short visual mark for a secretaria: its sigla, or initials of the meaningful words of its name
export const secretariaMonogram = (sec: { nome: string; sigla?: string | null }) => {
  if (sec.sigla) return sec.sigla.slice(0, 4);
  const words = sec.nome
    .replace(/^Secretaria( Municipal)?( de| da| do)?\s*/i, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
};

export const personInitials = (nome: string) =>
  nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
