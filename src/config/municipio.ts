import dados from "./municipio.json";

// Gerado por `npm run municipio -- <link do portal>`. Nada do município fica escrito no restante do código.
export const MUNICIPIO = {
  ...dados,
  nomeComUf: `${dados.cidade} - ${dados.uf}`,
  orgaos: dados.orgaos as Record<string, string>,
};
