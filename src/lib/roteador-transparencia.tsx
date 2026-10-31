import { createContext, forwardRef, useContext, useEffect, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

// As páginas da Transparência vêm do projeto base, que usa React Router. Estas funções têm os mesmos nomes
// e usam o roteador do site, para as páginas continuarem iguais às da base.

type Opcoes = { replace?: boolean };

export const ParametrosRota = createContext<Record<string, string>>({});
export const useParams = <T extends Record<string, string | undefined> = Record<string, string>>() => useContext(ParametrosRota) as T;

export function useLocation() {
  const location = useRouterState({ select: (s) => s.location });
  return { pathname: location.pathname, search: location.searchStr, hash: location.hash ? `#${location.hash}` : "", state: location.state };
}

export function useNavigate() {
  const { history } = useRouter();
  return (destino: string | number, opcoes?: Opcoes) => {
    if (typeof destino === "number") return history.go(destino);
    return opcoes?.replace ? history.replace(destino) : history.push(destino);
  };
}

export function useSearchParams() {
  const { pathname, search } = useLocation();
  const navegar = useNavigate();
  const atuais = new URLSearchParams(search);
  const definir = (novos: URLSearchParams | ((p: URLSearchParams) => URLSearchParams), opcoes?: Opcoes) => {
    const texto = (typeof novos === "function" ? novos(atuais) : novos).toString();
    navegar(texto ? `${pathname}?${texto}` : pathname, opcoes);
  };
  return [atuais, definir] as const;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navegar = useNavigate();
  useEffect(() => { navegar(to, { replace }); }, [to, replace]);
  return null;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string; replace?: boolean };

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, replace, onClick, target, ...props }, ref) => {
  const navegar = useNavigate();
  const aoClicar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navegar(to, { replace });
  };
  return <a ref={ref} href={to} target={target} onClick={aoClicar} {...props} />;
});
Link.displayName = "Link";
