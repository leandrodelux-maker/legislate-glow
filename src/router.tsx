import { QueryCache, QueryClient, MutationCache } from "@tanstack/react-query";
import { createRouter, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { routeTree } from "./routeTree.gen";
import { reportLovableError } from "./lib/lovable-error-reporting";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Erro desconhecido";
  }
}

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  // eslint-disable-next-line no-console
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getErrorMessage(error) || "Ocorreu um erro inesperado."}
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

function DefaultNotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-6xl font-semibold text-gradient-primary">404</div>
        <h1 className="mt-4 font-display text-xl font-semibold">Conteúdo não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O que você procura pode ter sido movido ou removido.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-elegant"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: unknown) => {
          // Don't retry auth/permission/not-found errors
          const status = (error as { status?: number; statusCode?: number })?.status
            ?? (error as { status?: number; statusCode?: number })?.statusCode;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 2;
        },
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // eslint-disable-next-line no-console
        console.error("[query]", query.queryKey, error);
        reportLovableError(error, { boundary: "react_query_cache", queryKey: query.queryKey });
        // Only show toast for background refetches; initial loads surface via UI
        if (query.state.data !== undefined) {
          toast.error(`Falha ao atualizar dados: ${getErrorMessage(error)}`);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        // eslint-disable-next-line no-console
        console.error("[mutation]", mutation.options.mutationKey, error);
        reportLovableError(error, { boundary: "react_query_mutation" });
        // Don't double-toast if the mutation already handles errors
        if (!mutation.options.onError) {
          toast.error(getErrorMessage(error) || "Falha ao salvar alterações");
        }
      },
    }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
    defaultNotFoundComponent: DefaultNotFoundComponent,
  });

  return router;
};
