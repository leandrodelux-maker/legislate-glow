import { useEffect, useMemo, useState } from "react";
import { User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { getVereadorPublicUrl } from "@/lib/vereador-image";

const PLACEHOLDER = "/placeholder-vereador.webp";

function initials(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type Props = {
  nome: string;
  foto?: string | null;
  partido?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "lg" | "xl" | "2xl";
  /** Mostra rótulo com nome + partido sobre o avatar quando há erro */
  showLabelOnError?: boolean;
  /** Enquadramento da foto (object-position). Padrão: topo, para não cortar a cabeça */
  objectPosition?: string;
  /** "cover" recorta para preencher; "contain" mostra a foto inteira sem cortar */
  fit?: "cover" | "contain";
  /** Preenche o contêiner pai (ignora `size` nas dimensões) */
  fill?: boolean;
};

/**
 * Avatar institucional de vereador com fallback em cascata:
 * 1) foto remota
 * 2) placeholder institucional (/placeholder-vereador.webp)
 * 3) iniciais do nome
 * 4) ícone genérico
 *
 * - Loga toda falha de carregamento (console.error + window event "vereador-image-error")
 * - Exibe alerta visual de erro apenas para usuários admin
 * - Quando `showLabelOnError`, mostra nome + partido sobre o placeholder
 */
export function VereadorAvatar({
  nome,
  foto,
  partido,
  size = 64,
  className,
  rounded = "full",
  showLabelOnError = false,
  objectPosition = "center 18%",
  fit = "cover",
  fill = false,
}: Props) {
  const { isAdmin } = useSupabaseAuth();
  const publicUrl = useMemo(() => getVereadorPublicUrl(foto), [foto]);
  const [state, setState] = useState<"loading" | "ok" | "placeholder" | "initials">(
    publicUrl ? "loading" : "initials",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset quando a foto muda
  useEffect(() => {
    setState(publicUrl ? "loading" : "initials");
    setErrorMsg(null);
  }, [publicUrl]);

  const ini = initials(nome || "?");
  const radius = {
    full: "rounded-full",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  }[rounded];

  const reportError = (stage: string, url: string) => {
    const msg = `[VereadorAvatar] Falha ao carregar (${stage}) — ${nome}: ${url}`;
    console.error(msg);
    setErrorMsg(`Imagem indisponível (${stage})`);
    try {
      window.dispatchEvent(
        new CustomEvent("vereador-image-error", {
          detail: { nome, partido, url, stage, at: new Date().toISOString() },
        }),
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0",
        radius,
        className,
      )}
      style={fill ? undefined : { width: size, height: size }}
      aria-label={nome}
      title={nome}
    >
      {(state === "loading" || state === "ok") && publicUrl && (
        <img
          src={publicUrl}
          alt={nome}
          loading="lazy"
          className={cn("w-full h-full", fit === "contain" ? "object-contain" : "object-cover")}
          style={{ objectPosition: fit === "contain" ? "center top" : objectPosition }}
          onLoad={() => setState("ok")}
          onError={(e) => {
            reportError("remote", publicUrl);
            // troca para o placeholder local conforme solicitado
            e.currentTarget.onerror = () => {
              reportError("placeholder", PLACEHOLDER);
              setState("initials");
            };
            e.currentTarget.src = PLACEHOLDER;
            setState("placeholder");
          }}
        />
      )}

      {state === "initials" &&
        (ini ? (
          <span
            className="font-display font-bold text-primary"
            style={{ fontSize: Math.max(12, size * 0.36) }}
          >
            {ini}
          </span>
        ) : (
          <User
            className="text-primary/40"
            style={{ width: size * 0.5, height: size * 0.5 }}
          />
        ))}

      {/* Rótulo sobreposto quando há erro e o componente foi pedido para mostrá-lo */}
      {showLabelOnError && state !== "ok" && state !== "loading" && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-white text-center">
          <p className="text-[10px] font-semibold leading-tight line-clamp-1">{nome}</p>
          {partido && (
            <p className="text-[9px] uppercase tracking-widest opacity-80">{partido}</p>
          )}
        </div>
      )}

      {/* Indicador de erro APENAS para administradores */}
      {isAdmin && errorMsg && (
        <span
          className="absolute top-1 right-1 bg-red-500/95 text-white rounded-full p-1 shadow-md"
          title={errorMsg}
          aria-label={errorMsg}
        >
          <AlertCircle className="w-3 h-3" />
        </span>
      )}
    </div>
  );
}
