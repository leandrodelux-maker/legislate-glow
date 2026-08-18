import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/transparencia")({
  beforeLoad: () => {
    throw redirect({ to: "/transparencia-portal", replace: true });
  },
});
