// Título e descrição do site, definidos no painel (configuracoes.site_seo). O index.html fica neutro:
// o que o navegador mostra é escrito aqui, e a cópia local evita o título piscar ao abrir.
export interface SiteSeo { titulo: string; descricao: string; imagem_url: string }

export const SEO_VAZIO: SiteSeo = { titulo: "", descricao: "", imagem_url: "" };
export const SEO_CACHE_KEY = "cached_site_seo";

export const tituloPadrao = (cidade: string, uf: string) => `Portal da Transparência de ${cidade}${uf ? ` - ${uf}` : ""}`;
export const descricaoPadrao = (cidade: string) => `Receitas, despesas, licitações, contratos, servidores e demais informações públicas de ${cidade}.`;

export function seoFinal(cfg: Partial<SiteSeo> | null, cidade: string, uf: string): SiteSeo {
  return {
    titulo: cfg?.titulo?.trim() || tituloPadrao(cidade, uf),
    descricao: cfg?.descricao?.trim() || descricaoPadrao(cidade),
    imagem_url: cfg?.imagem_url?.trim() || "",
  };
}

export const tituloDaAba = (site: string, pagina: string | null) => (pagina ? `${pagina} | ${site}` : site);

let atual: SiteSeo | null = null;
let pagina: string | null = null;

const meta = (seletor: string, atributo: string, nome: string, valor: string) => {
  let el = document.querySelector(seletor);
  if (!valor) { el?.remove(); return; }
  if (!el) { el = document.createElement("meta"); el.setAttribute(atributo, nome); document.head.appendChild(el); }
  el.setAttribute("content", valor);
};

function escrever() {
  if (!atual) return;
  document.title = tituloDaAba(atual.titulo, pagina);
  meta('meta[name="description"]', "name", "description", atual.descricao);
  meta('meta[property="og:title"]', "property", "og:title", document.title);
  meta('meta[name="twitter:title"]', "name", "twitter:title", document.title);
  meta('meta[property="og:description"]', "property", "og:description", atual.descricao);
  meta('meta[name="twitter:description"]', "name", "twitter:description", atual.descricao);
  meta('meta[property="og:image"]', "property", "og:image", atual.imagem_url);
  meta('meta[name="twitter:image"]', "name", "twitter:image", atual.imagem_url);
}

export function aplicarSeo(seo: SiteSeo) {
  atual = seo;
  try { localStorage.setItem(SEO_CACHE_KEY, JSON.stringify(seo)); } catch { /* sem cópia local: só pisca ao abrir */ }
  escrever();
}

// Páginas com título próprio (usePageSEO) aparecem antes do nome do site.
export function definirTituloDaPagina(titulo: string | null) {
  pagina = titulo;
  escrever();
}
