import { useLocation } from "@tanstack/react-router";

import { buildBreadcrumbs } from "@/lib/site-links";

/**
 * JSON-LD (BreadcrumbList) das páginas internas, para SEO.
 * A trilha visível fica no topo de cada página, em TrilhaNavegacao.
 */
export function SiteBreadcrumb() {
  const location = useLocation();
  const crumbs = buildBreadcrumbs(location.pathname);

  if (crumbs.length < 2) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: crumb.to,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
