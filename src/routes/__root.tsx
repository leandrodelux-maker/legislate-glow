import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LgpdBanner } from "@/components/lgpd-banner";
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider";
import { AccessibilityWidget } from "@/components/accessibility/accessibility-widget";
import { SkipLinks } from "@/components/accessibility/skip-links";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-7xl font-semibold text-gradient-primary">404</div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O conteúdo procurado pode ter sido movido ou não está mais disponível.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:shadow-elegant"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Não foi possível carregar a página</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Câmara Municipal — Portal Oficial do Legislativo" },
      {
        name: "description",
        content:
          "Portal oficial da Câmara Municipal. Acompanhe sessões, vereadores, projetos de lei e o Portal da Transparência.",
      },
      { name: "author", content: "Câmara Municipal" },
      { name: "theme-color", content: "#1e3a8a" },
      { property: "og:site_name", content: "Câmara Municipal" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },

      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Open+Sans:wght@400;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GovernmentOrganization",
          name: "Câmara Municipal",
          description: "Portal oficial do Poder Legislativo Municipal",
          areaServed: "Município",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AccessibilityProvider>
          <SkipLinks />
          <Toaster richColors position="top-center" />
          <div className="flex min-h-dvh flex-col bg-background">
            {!isAdminPath && <SiteHeader />}
            <main id="conteudo" tabIndex={-1} className={isAdminPath ? "flex-1" : "flex-1"}>
              <Outlet />
            </main>
            {!isAdminPath && <SiteBreadcrumb />}
            {!isAdminPath && <SiteFooter />}
            {!isAdminPath && <LgpdBanner />}
            {!isAdminPath && <AccessibilityWidget />}
          </div>
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
