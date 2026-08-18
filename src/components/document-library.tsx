import { useState } from "react";
import { Download, Eye, FileText, X, ExternalLink } from "lucide-react";
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

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-border bg-muted/40 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground md:grid">
          <span>Documento</span>
          <span className="w-28">Data</span>
          <span className="w-56 text-right">Ações</span>
        </div>

        <ul className="divide-y divide-border">
          {documents.map((doc) => (
            <li
              key={doc.title}
              className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-muted/30 md:grid md:grid-cols-[1fr_auto_auto] md:items-center md:gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold text-foreground">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="w-28 text-sm text-muted-foreground">
                {doc.date ?? "—"}
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 md:w-56 md:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={() => setActive(doc)}
                >
                  <Eye className="mr-2 h-4 w-4" /> Visualizar
                </Button>
                <Button size="sm" className="h-10" asChild>
                  <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Baixar
                  </a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

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
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep to-primary text-primary-foreground">
      <div className="absolute right-0 top-0 h-full w-1/3 translate-x-1/2 skew-x-12 bg-gold/5" />
      <div className="container-page relative z-10 py-8 md:py-11">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gold">
          <span className="gold-divider" /> {eyebrow}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-primary-foreground/85 md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
