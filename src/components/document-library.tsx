import { PaginaHero } from "@/components/pagina-hero";
import { ScrollText } from "lucide-react";
import { useState } from "react";
import { Download, Eye, FileText, X, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type LegalDocument = {
  title: string;
  date?: string;
  description?: string;
  /** URL direta de download do arquivo (PDF). */
  downloadUrl: string;
  /** URL usada no visualizador embutido. Padrão: Google Docs Viewer. */
  viewerUrl?: string;
};

export function buildViewerUrl(fileUrl: string) {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}

export function DocumentLibrary({
  documents,
  emptyLabel = "Nenhum documento disponível no momento.",
}: {
  documents: LegalDocument[];
  emptyLabel?: string;
}) {
  const [active, setActive] = useState<LegalDocument | null>(null);
  const [busca, setBusca] = useState("");

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const termo = busca.trim().toLowerCase();
  const visiveis = documents.filter((d) => !termo || `${d.title} ${d.description ?? ""} ${d.date ?? ""}`.toLowerCase().includes(termo));

  return (
    <>
      {documents.length > 5 && (
        <div className="relative mb-4 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" aria-hidden />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nestes documentos"
            aria-label="Buscar nestes documentos"
            className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {visiveis.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">Nenhum documento encontrado para “{busca}”.</p>
      ) : (
        <ul className="grid gap-3">
          {visiveis.map((doc) => (
            <li key={doc.title} className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-elegant md:flex-row md:items-center md:p-5">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="relative grid h-14 w-12 shrink-0 place-items-center rounded-lg bg-primary-deep text-white" aria-hidden>
                  <FileText className="h-5 w-5" />
                  <span className="absolute -bottom-1.5 rounded bg-gold px-1 text-[10px] font-bold leading-4 text-gold-foreground">PDF</span>
                </span>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold leading-snug text-foreground">{doc.title}</h3>
                  {doc.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{doc.description}</p>}
                  {doc.date && <p className="mt-1 text-xs font-semibold text-primary">Publicado em {doc.date}</p>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" className="h-11 flex-1 md:flex-none" onClick={() => setActive(doc)}>
                  <Eye className="mr-2 h-4 w-4" aria-hidden /> Visualizar
                </Button>
                <Button className="h-11 flex-1 md:flex-none" asChild>
                  <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" aria-hidden /> Baixar
                  </a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-5xl gap-0 p-0 [&>button]:hidden">
          <DialogHeader className="flex-row items-center justify-between gap-4 border-b border-border px-6 py-4">
            <DialogTitle className="font-display text-lg">
              {active?.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {active && (
                <Button variant="outline" size="sm" className="h-9" asChild>
                  <a href={active.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Baixar
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Fechar visualizador"
                onClick={() => setActive(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {active && (
            <>
              <iframe
                key={active.title}
                title={`Visualização: ${active.title}`}
                src={active.viewerUrl ?? buildViewerUrl(active.downloadUrl)}
                className="h-[70vh] w-full bg-muted"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-3 text-xs text-muted-foreground">
                <span>Documento oficial em formato PDF.</span>
                <a
                  href={active.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  Abrir em nova aba <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DocumentPageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return <PaginaHero icone={ScrollText} eyebrow={eyebrow} title={title} description={description} />;
}
