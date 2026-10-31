import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Gavel,
  Calendar,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  Trophy,
  Globe,
  BarChart3,
  Palette,
  Home as HomeIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Cookie,
  ChevronDown,
  Building2,
  ScrollText,
  Crown,
  Scale,
  Image as ImageIcon,
  FileEdit,
  FileBarChart,
  Wallet,
  Receipt,
  Megaphone,
  MessageSquare,
  Mail,
  BookOpen,
  Images,
  GalleryHorizontalEnd,
  Video,
  ListOrdered,
} from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth, signOut } from "@/hooks/use-supabase-auth";

type Item = { label: string; path: string; icon: any };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Visão Geral",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Painel Executivo", path: "/admin/executivo", icon: BarChart3 },
    ],
  },
  {
    label: "Legislativo",
    items: [
      { label: "Vereadores", path: "/admin/vereadores", icon: Users },
      { label: "Ranking", path: "/admin/vereadores/ranking", icon: Trophy },
      { label: "Mandatos", path: "/admin/vereadores/mandatos", icon: ScrollText },
      { label: "Galeria", path: "/admin/vereadores/galeria", icon: ImageIcon },
      { label: "Mesa Diretora", path: "/admin/mesa-diretora", icon: Crown },
      { label: "Comissões", path: "/admin/comissoes", icon: Scale },
      { label: "Membros das Comissões", path: "/admin/comissoes-membros", icon: Users },
      { label: "Documentos Oficiais", path: "/admin/documentos-oficiais", icon: BookOpen },
      { label: "Portarias", path: "/admin/portarias", icon: ScrollText },

      { label: "Projetos", path: "/admin/projetos", icon: Gavel },
      { label: "Sessões", path: "/admin/sessoes", icon: Calendar },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { label: "Notícias", path: "/admin/noticias", icon: Newspaper },
      { label: "FAQ", path: "/admin/cms/faq", icon: MessageSquare },
      { label: "Roteiro de Sessões", path: "/admin/cms/roteiro-sessoes", icon: ListOrdered },
      { label: "Categorias", path: "/admin/cms/categorias", icon: FileEdit },
      { label: "Páginas", path: "/admin/cms/paginas", icon: FileText },
      { label: "Banners", path: "/admin/cms/banners", icon: GalleryHorizontalEnd },
      { label: "Popups", path: "/admin/cms/popups", icon: Megaphone },
      { label: "Galeria", path: "/admin/cms/galeria", icon: Images },
      { label: "Diário Oficial", path: "/admin/cms/diario-oficial", icon: BookOpen },
    ],
  },
  {
    label: "Transparência",
    items: [
      { label: "Transparência Ativa", path: "/admin/transparencia-ativa", icon: Globe },
      { label: "Links da Transparência", path: "/admin/transparencia-links", icon: Globe },
      { label: "Documentos", path: "/admin/transparencia", icon: ShieldCheck },
      { label: "Publicações", path: "/admin/publicacoes", icon: BookOpen },
      { label: "Matriz Atricon", path: "/admin/matriz-atricon", icon: ShieldCheck },
      { label: "Licitações", path: "/admin/cms/licitacoes", icon: Gavel },
      { label: "Contratos", path: "/admin/cms/contratos", icon: FileBarChart },
      { label: "Folha de Pagamento", path: "/admin/cms/folha", icon: Wallet },
      { label: "Prestação de Contas", path: "/admin/cms/prestacao-contas", icon: Receipt },
    ],
  },
  {
    label: "Atendimento",
    items: [
      { label: "Ouvidoria", path: "/admin/cms/ouvidoria", icon: MessageSquare },
      { label: "e-SIC", path: "/admin/cms/esic", icon: Mail },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Auditoria", path: "/admin/auditoria", icon: ScrollText },
    ],
  },
];

const configSub: Item[] = [
  { label: "Geral", path: "/admin/configuracoes/geral", icon: Building2 },
  { label: "Identidade Visual", path: "/admin/configuracoes/identidade", icon: Palette },
  { label: "Home Page", path: "/admin/configuracoes/home", icon: HomeIcon },
  { label: "Menu do Site", path: "/admin/configuracoes/menu", icon: MenuIcon },
  { label: "SEO", path: "/admin/configuracoes/seo", icon: SearchIcon },
  { label: "LGPD", path: "/admin/configuracoes/lgpd", icon: Cookie },
  { label: "Hero & Mídia", path: "/admin/configuracoes-site", icon: FileText },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  const displayName = user?.user_metadata?.full_name || user?.email || "Administrador";
  const initials = displayName.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
  const configOpenDefault = configSub.some((i) => isActive(i.path));

  const logout = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 [&>div[data-sidebar=sidebar]]:bg-[oklch(0.16_0.03_255)] [&>div[data-sidebar=sidebar]]:text-slate-200"
    >
      <SidebarHeader className="border-b border-white/10 bg-gradient-to-br from-[oklch(0.20_0.06_255)] to-[oklch(0.14_0.04_255)]">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/30">
            <ShieldCheck className="text-[oklch(0.16_0.04_80)] w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-display font-bold text-sm leading-none text-white truncate">CÂMARA</h1>
              <span className="text-[9px] uppercase tracking-widest text-white/50">Painel Master</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-[oklch(0.16_0.03_255)]">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">
              {g.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={`text-slate-300 hover:bg-white/5 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/30 data-[active=true]:to-primary/10 data-[active=true]:text-white data-[active=true]:border-l-2 data-[active=true]:border-gold rounded-lg`}
                      >
                        <Link to={item.path}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">
            Configurações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={configOpenDefault} className="group/coll">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Configurações"
                      isActive={configOpenDefault}
                      className="text-slate-300 hover:bg-white/5 hover:text-white data-[active=true]:bg-white/5 data-[active=true]:text-white rounded-lg"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configurações</span>
                      <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/coll:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-white/10">
                      {configSub.map((sub) => (
                        <SidebarMenuSubItem key={sub.path}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive(sub.path)}
                            className="text-slate-400 hover:bg-white/5 hover:text-white data-[active=true]:bg-primary/20 data-[active=true]:text-white"
                          >
                            <Link to={sub.path}>
                              <sub.icon className="w-3.5 h-3.5" />
                              <span>{sub.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 bg-[oklch(0.14_0.03_255)]">
        <div className={`flex items-center gap-3 p-2 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="w-8 h-8 shrink-0 ring-2 ring-gold/40">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-deep text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/50">Administrador</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 shrink-0 text-white/70 hover:text-white hover:bg-white/10"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
