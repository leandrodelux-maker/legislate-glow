import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Landmark, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth, signOut } from "@/hooks/use-supabase-auth";
import { GRUPOS } from "@/components/admin/painel/modulos";

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  const displayName = user?.user_metadata?.full_name || user?.email || "Administrador";
  const initials = displayName.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  const todos = GRUPOS.flatMap((g) => g.itens.map((i) => i.path));
  const ativo = [...todos].sort((a, b) => b.length - a.length).find((p) => pathname === p || pathname.startsWith(`${p}/`));

  const logout = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 [&>div[data-sidebar=sidebar]]:bg-[var(--primary-deep)] [&>div[data-sidebar=sidebar]]:text-slate-200"
    >
      <SidebarHeader className="border-b border-white/10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)]">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/30">
            <Landmark className="text-[oklch(0.16_0.04_80)] w-5 h-5" aria-hidden />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display font-bold text-sm leading-tight text-white truncate">Câmara Municipal</p>
              <span className="text-xs text-white/70">Painel de gestão</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-[var(--primary-deep)]">
        {GRUPOS.map((g) => (
          <SidebarGroup key={g.id} className="py-1">
            <SidebarGroupLabel className="text-gold text-[11px] font-bold uppercase tracking-[0.14em]">{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.itens.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={ativo === item.path}
                      tooltip={item.label}
                      className="rounded-lg text-white/85 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-[inset_3px_0_0_var(--gold)]"
                    >
                      <Link to={item.path as never}>
                        <item.icone className="w-4 h-4" aria-hidden />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 bg-[var(--primary-deep)]">
        <div className={`flex items-center gap-3 p-2 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="w-8 h-8 shrink-0 ring-2 ring-gold/40">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-deep text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-white/75 hover:text-white">Ver o site <ExternalLink className="h-3 w-3" aria-hidden /></a>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 shrink-0 text-white/70 hover:text-white hover:bg-white/10"
              title="Sair" aria-label="Sair do painel"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
