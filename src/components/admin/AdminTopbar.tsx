import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Activity,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  path: string;
  type: string;
};

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  read_by: string[];
  created_at: string;
};

type AuditEntry = {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  created_at: string;
};

const QUICK_LINKS: SearchResult[] = [
  { id: "q1", title: "Dashboard", subtitle: "Visão geral", path: "/admin/dashboard", type: "Página" },
  { id: "q2", title: "Painel Executivo", subtitle: "KPIs e gráficos", path: "/admin/executivo", type: "Página" },
  { id: "q3", title: "Vereadores", subtitle: "Gestão de vereadores", path: "/admin/vereadores", type: "Módulo" },
  { id: "q4", title: "Projetos Legislativos", path: "/admin/projetos", type: "Módulo" },
  { id: "q5", title: "Sessões", path: "/admin/sessoes", type: "Módulo" },
  { id: "q6", title: "Notícias", path: "/admin/comunicacao", type: "Módulo" },
  { id: "q7", title: "Transparência", path: "/admin/transparencia", type: "Módulo" },
  { id: "q8", title: "Auditoria", path: "/admin/auditoria", type: "Sistema" },
  { id: "q9", title: "Configurações Gerais", path: "/admin/configuracoes/geral", type: "Config" },
  { id: "q10", title: "Identidade Visual", path: "/admin/configuracoes/identidade", type: "Config" },
  { id: "q11", title: "Home Page", path: "/admin/configuracoes/home", type: "Config" },
  { id: "q12", title: "Menu do Site", path: "/admin/configuracoes/menu", type: "Config" },
  { id: "q13", title: "SEO", path: "/admin/configuracoes/seo", type: "Config" },
  { id: "q14", title: "LGPD", path: "/admin/configuracoes/lgpd", type: "Config" },
];

export function AdminTopbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dynamic, setDynamic] = useState<SearchResult[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  // Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Dynamic search (vereadores/noticias/projetos)
  useEffect(() => {
    if (!searchOpen || query.trim().length < 2) {
      setDynamic([]);
      return;
    }
    const q = `%${query}%`;
    let cancelled = false;
    (async () => {
      const [v, n, p] = await Promise.all([
        supabase.from("vereadores").select("id,nome,partido").ilike("nome", q).limit(5),
        supabase.from("noticias").select("id,titulo,categoria").ilike("titulo", q).limit(5),
        supabase.from("projetos_legislativos").select("id,titulo,tipo").ilike("titulo", q).limit(5),
      ]);
      if (cancelled) return;
      const items: SearchResult[] = [
        ...(v.data ?? []).map((r: any) => ({
          id: `v-${r.id}`, title: r.nome, subtitle: r.partido ?? "Vereador",
          path: `/admin/vereadores`, type: "Vereador",
        })),
        ...(n.data ?? []).map((r: any) => ({
          id: `n-${r.id}`, title: r.titulo, subtitle: r.categoria ?? "Notícia",
          path: `/admin/comunicacao`, type: "Notícia",
        })),
        ...(p.data ?? []).map((r: any) => ({
          id: `p-${r.id}`, title: r.titulo, subtitle: r.tipo ?? "Projeto",
          path: `/admin/projetos`, type: "Projeto",
        })),
      ];
      setDynamic(items);
    })();
    return () => { cancelled = true; };
  }, [query, searchOpen]);

  // Load notifications + audit
  const loadPanels = async () => {
    const [n, a] = await Promise.all([
      supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("admin_audit_log").select("id,user_email,action,entity_type,created_at").order("created_at", { ascending: false }).limit(15),
    ]);
    setNotifications((n.data as any[]) ?? []);
    setAudit((a.data as any[]) ?? []);
  };

  useEffect(() => {
    loadPanels();
    const t = setInterval(loadPanels, 60_000);
    return () => clearInterval(t);
  }, []);

  const unread = useMemo(
    () => (user ? notifications.filter((n) => !n.read_by?.includes(user.id)).length : 0),
    [notifications, user],
  );

  const markAllRead = async () => {
    if (!user) return;
    const toUpdate = notifications.filter((n) => !n.read_by?.includes(user.id));
    await Promise.all(
      toUpdate.map((n) =>
        supabase
          .from("admin_notifications")
          .update({ read_by: [...(n.read_by ?? []), user.id] })
          .eq("id", n.id),
      ),
    );
    loadPanels();
  };

  const filteredQuick = useMemo(() => {
    if (!query.trim()) return QUICK_LINKS;
    const q = query.toLowerCase();
    return QUICK_LINKS.filter((i) => i.title.toLowerCase().includes(q));
  }, [query]);

  const go = (path: string) => {
    setSearchOpen(false);
    setQuery("");
    navigate({ to: path });
  };

  return (
    <>
      <header className="h-16 sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border flex items-center gap-2 px-3 md:px-5">
        <SidebarTrigger />
        <div className="h-5 w-px bg-border" />

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="group flex-1 max-w-md flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 text-muted-foreground text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Pesquisar no painel...</span>
          <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background/70">
            ⌘K
          </kbd>
        </button>

        <div className="flex-1" />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Activity */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Central de atividades">
              <Activity className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Central de atividades</p>
                <p className="text-[11px] text-muted-foreground">Últimas alterações registradas</p>
              </div>
              <Link to="/admin/auditoria" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver tudo <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <ScrollArea className="max-h-80">
              {audit.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">Nenhuma atividade registrada.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {audit.map((a) => (
                    <li key={a.id} className="p-3 text-sm hover:bg-muted/40">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{a.action}</span>
                        <Badge variant="outline" className="text-[10px]">{a.entity_type}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {a.user_email ?? "Sistema"} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative" title="Notificações">
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold grid place-items-center">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Notificações</p>
                <p className="text-[11px] text-muted-foreground">{unread} não lidas</p>
              </div>
              <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> Marcar lidas
              </Button>
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">Sem notificações.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((n) => {
                    const read = user ? n.read_by?.includes(user.id) : true;
                    return (
                      <li key={n.id} className={`p-3 text-sm hover:bg-muted/40 ${read ? "opacity-70" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium leading-tight">{n.title}</p>
                          {!read && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
                        </div>
                        {n.message && <p className="text-[12px] text-muted-foreground mt-1">{n.message}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </header>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Pesquisa global</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar páginas, vereadores, notícias, projetos..."
              className="border-0 shadow-none focus-visible:ring-0 px-0 h-9 text-base"
            />
          </div>
          <ScrollArea className="max-h-[480px]">
            <div className="p-2">
              {dynamic.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">Resultados</p>
                  {dynamic.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => go(r.path)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        {r.subtitle && <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{r.type}</Badge>
                    </button>
                  ))}
                </>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">
                Navegação rápida
              </p>
              {filteredQuick.length === 0 ? (
                <p className="px-3 py-6 text-sm text-muted-foreground text-center">Nenhum resultado encontrado.</p>
              ) : (
                filteredQuick.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => go(i.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.title}</p>
                      {i.subtitle && <p className="text-xs text-muted-foreground truncate">{i.subtitle}</p>}
                    </div>
                    <Badge variant="outline" className="text-[10px]">{i.type}</Badge>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Atalho: <kbd className="font-mono px-1 rounded bg-background border border-border">⌘K</kbd></span>
            <span>Pressione Enter para navegar</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
