import { createFileRoute, redirect } from "@tanstack/react-router";

export { getTransparencyUrl } from "@/lib/transparency-url";

export const Route = createFileRoute("/transparencia-ativa")({
  beforeLoad: () => {
    throw redirect({ to: "/transparencia-portal", replace: true });
  },
});
