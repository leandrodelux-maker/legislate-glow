import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ALL_SITE_LINKS } from "@/lib/site-links";

const BASE_URL = "";

const PRIORITY: Record<string, string> = {
  "/": "1.0",
  "/noticias": "0.9",
  "/vereadores": "0.9",
  "/sessoes": "0.9",
  "/transparencia": "0.9",
};

const CHANGEFREQ: Record<string, "daily" | "weekly" | "monthly"> = {
  "/": "weekly",
  "/noticias": "daily",
  "/sessoes": "weekly",
  "/sessoes/ao-vivo": "daily",
  "/transparencia": "weekly",
};

function buildSitemapXml() {
  // Achata todas as páginas do registro do site
  const entries = ALL_SITE_LINKS.filter((l) => !l.external).map((l) => ({
    path: l.to,
    priority: PRIORITY[l.to] ?? "0.6",
    changefreq: CHANGEFREQ[l.to] ?? ("monthly" as const),
  }));

  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

// O tipo `server` vem de uma augmentation que está desalinhada entre as versões
// instaladas do router/start; em runtime o handler funciona normalmente.
const routeOptions = {
  server: {
    handlers: {
      GET: async () =>
        new Response(buildSitemapXml(), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
} as never;

export const Route = createFileRoute("/sitemap.xml")(routeOptions);
