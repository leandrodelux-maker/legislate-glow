import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/transparencia-dados")({
  beforeLoad: () => {
    throw redirect({ to: "/transparencia-portal", replace: true });
  },
});
