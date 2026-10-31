import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadoVazio, PaginaHero } from "@/components/pagina-hero";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sessoes/ao-vivo")({
  head: () => ({
    meta: [
      { title: "Transmissão ao vivo — Câmara Municipal de Cachoeira de Goiás" },
      { name: "description", content: "Acompanhe a transmissão oficial das sessões da Câmara Municipal." },
    ],
  }),
  component: TransmissaoAoVivo,
});

/** Endereço para incorporar o vídeo. Link de canal (como /@canal/live) não pode ser incorporado e abre em nova aba. */
function enderecoIncorporado(url: string): string | null {
  const codigo = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/))([\w-]{6,})/)?.[1];
  return codigo ? `https://www.youtube.com/embed/${codigo}` : null;
}

function TransmissaoAoVivo() {
  const [url, setUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("live_broadcast_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setUrl(data?.live_broadcast_url || null);
        setCarregando(false);
      });
  }, []);

  const incorporado = url ? enderecoIncorporado(url) : null;

  return (
    <>
      <PaginaHero
        icone={Radio}
        eyebrow="Plenário"
        title="Transmissão ao vivo"
        description="Acompanhe as sessões da Câmara Municipal pelo canal oficial de transmissão."
        ultimo="Ao vivo"
      />

      <section className="container-page py-12 md:py-16">
        {carregando ? (
          <div className="aspect-video animate-pulse rounded-3xl bg-muted" />
        ) : incorporado ? (
          <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
            <iframe
              className="aspect-video w-full"
              src={incorporado}
              title="Transmissão da sessão da Câmara Municipal"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : url ? (
          <EstadoVazio icone={Video} titulo="A transmissão abre no canal oficial" texto="Clique para assistir em uma nova aba.">
            <Button asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Assistir à transmissão <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
              </a>
            </Button>
          </EstadoVazio>
        ) : (
          <EstadoVazio icone={Video} titulo="Nenhuma transmissão no momento" texto="Quando houver sessão ao vivo, o vídeo aparece aqui. Enquanto isso, consulte a agenda do plenário.">
            <Button asChild>
              <Link to="/sessoes">
                Ver sessões <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </EstadoVazio>
        )}
      </section>
    </>
  );
}
