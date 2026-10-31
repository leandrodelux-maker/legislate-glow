import { useEffect } from "react";
import { useLocation } from "@/lib/roteador-transparencia";
import { definirTituloDaPagina } from "@/lib/seo";

interface SEOProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  canonical?: string;
}

const usePageSEO = ({ title, description, ogTitle, ogDescription, ogType = "website", canonical }: SEOProps) => {
  const location = useLocation();

  useEffect(() => {
    definirTituloDaPagina(title);

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    if (ogTitle) setMeta("og:title", ogTitle, true);
    setMeta("og:description", ogDescription || description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:url", window.location.href, true);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical || window.location.origin + location.pathname;
    return () => definirTituloDaPagina(null);
  }, [title, description, ogTitle, ogDescription, ogType, canonical, location.pathname]);
};

export default usePageSEO;
