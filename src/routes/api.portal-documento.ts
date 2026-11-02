import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { responderDocumento } from "@/lib/portal-documento";

// Entrega documentos e relatórios do portal Megasoft: RGF, PPA, LDO, LOA e anexos.
// Mesmo aviso do sitemap: o tipo `server` está desalinhado entre as versões instaladas do router e do start.
const routeOptions = {
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => responderDocumento(request),
    },
  },
} as never;

export const Route = createFileRoute("/api/portal-documento")(routeOptions);
