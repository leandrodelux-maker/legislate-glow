import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/transparencia-portal")({
  beforeLoad: () => {
    throw redirect({ to: "/transparencia", replace: true });
  },
});
