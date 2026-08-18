import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "lgpd-consent-v1";

export function LgpdBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setShow(true), 600);
        return () => clearTimeout(t);
      }
    } catch (e) { if (typeof console !== "undefined") console.warn("[storage]", e); }
  }, []);

  const accept = (value: "all" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) { if (typeof console !== "undefined") console.warn("[storage]", e); }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de privacidade — LGPD"
      className="fixed inset-x-3 bottom-3 z-[60] md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md animate-[fade-up_0.5s_ease-out]"
    >
      <div className="glass-strong rounded-xl p-5 shadow-elegant border border-border/80">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-sm font-semibold text-foreground">
              Privacidade e Cookies
            </h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para o funcionamento do portal e, com seu consentimento,
              cookies de análise para melhorar a experiência. Em conformidade com a LGPD (Lei
              13.709/18).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => accept("all")} className="h-8">
                Aceitar todos
              </Button>
              <Button size="sm" variant="outline" onClick={() => accept("essential")} className="h-8">
                Apenas essenciais
              </Button>
            </div>
          </div>
          <button
            onClick={() => accept("essential")}
            aria-label="Fechar aviso"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
