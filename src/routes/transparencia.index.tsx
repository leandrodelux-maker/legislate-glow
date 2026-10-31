import { createFileRoute } from "@tanstack/react-router";
import PaginaTransparencia from "@/pages/transparency/rotas";

export const Route = createFileRoute("/transparencia/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Portal da Transparência — Câmara Municipal de Cachoeira de Goiás" },
      { name: "description", content: "Receitas, despesas, licitações, contratos, servidores e demais informações públicas da Câmara Municipal de Cachoeira de Goiás." },
    ],
  }),
  component: PaginaTransparencia,
});
