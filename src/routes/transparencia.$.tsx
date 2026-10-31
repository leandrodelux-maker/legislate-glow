import { createFileRoute, notFound } from "@tanstack/react-router";
import PaginaTransparencia, { encontrarRota } from "@/pages/transparency/rotas";

export const Route = createFileRoute("/transparencia/$")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (!encontrarRota(location.pathname)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Portal da Transparência — Câmara Municipal de Cachoeira de Goiás" },
      { name: "description", content: "Receitas, despesas, licitações, contratos, servidores e demais informações públicas da Câmara Municipal de Cachoeira de Goiás." },
    ],
  }),
  component: PaginaTransparencia,
});
