import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  Gavel,
  Landmark,
  Loader2,
  MessageCircle,
  PieChart,
  Scale,
  Search,
  ShieldCheck,
  TrendingDown,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getTransparencyIcon } from "@/lib/transparency-icons";
import { getTransparencyUrl } from "@/lib/transparency-url";
import { OfficialDatasets } from "@/components/transparencia/official-datasets";

export const Route = createFileRoute("/transparencia-portal")({
  head: () => ({
    meta: [
      { title: "Portal da Transparência — Câmara Municipal" },
      {
        name: "description",
        content:
          "Portal da Transparência da Câmara Municipal: receitas, despesas, contratos, licitações, folha, licitações e muito mais.",
      },
    ],
  }),
  component: TransparenciaPortalPage,
});

type TransparencySettings = {
  id: string;
  portal_url: string | null;
  portal_base_url?: string | null;
  portal_name: string | null;
  entity_name?: string | null;
  is_active: boolean | null;
  updated_at?: string | null;
};

type TransparencyLink = {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  external_url: string | null;
  category?: string | null;
  sort_order: number;
  is_active: boolean;
};

type Category = {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string; // tailwind bg
  /** Categorias exatas do Portal Megasoft que pertencem a este grupo. */
  cats: string[];
  /** Fallback por texto, para links cadastrados sem categoria. */
  pattern: RegExp;
  match: (link: TransparencyLink) => boolean;
};

function makeCategory(
  c: Omit<Category, "match">,
): Category {
  return {
    ...c,
    match: (l) => {
      const cat = (l.category ?? "").trim();
      if (cat) return c.cats.includes(cat);
      return c.pattern.test(`${l.title} ${l.description}`);
    },
  };
}

const CATEGORIES: Category[] = [
  makeCategory({
    key: "receitas",
    label: "Receitas e Despesas",
    icon: TrendingDown,
    color: "bg-rose-400",
    cats: ["Receita e Despesa"],
    pattern: /receit|despes|empenh|pagament|liquid|financ/i,
  }),
  makeCategory({
    key: "contratos",
    label: "Contratos, Convênios e Licitações",
    icon: Gavel,
    color: "bg-orange-500",
    cats: ["Licitações e Contratos", "Convênios e Transferências"],
    pattern: /licita|contrat|conven|compra|edital/i,
  }),
  makeCategory({
    key: "orgaos",
    label: "Órgãos e Servidores",
    icon: Users,
    color: "bg-amber-400",
    cats: ["Recursos Humanos e Diárias"],
    pattern: /servidor|folha|di[aá]ria|patrim|estrutur|org[aã]|pessoal/i,
  }),
  makeCategory({
    key: "planejamento",
    label: "Planejamento e Obras",
    icon: PieChart,
    color: "bg-primary-deep",
    cats: ["Obras"],
    pattern: /planejament|ppa|ldo|loa|program|pol[ií]tic|obras|projet/i,
  }),
  makeCategory({
    key: "fiscal",
    label: "Responsabilidade Fiscal",
    icon: Scale,
    color: "bg-emerald-500",
    cats: ["Planejamento e Prestação de Contas"],
    pattern: /fiscal|rreo|rgf|lrf|prestaç[aã]o|contas|relat[oó]rio/i,
  }),
  makeCategory({
    key: "legislacao",
    label: "Legislação e Institucional",
    icon: BookOpen,
    color: "bg-teal-600",
    cats: ["Atividades Finalísticas", "Informações Institucionais"],
    pattern: /lei|legisla|di[aá]rio|dados|publicaç/i,
  }),
  makeCategory({
    key: "ouvidoria",
    label: "Ouvidoria e e-SIC",
    icon: MessageCircle,
    color: "bg-emerald-600",
    cats: ["SIC e Ouvidoria", "LGPD e Governo Digital"],
    pattern: /ouvidor|e-?sic|lai|acesso ?à ?informaç|denunc|privacidade|lgpd/i,
  }),
];

const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Finanças Públicas", keys: ["receitas", "fiscal"] },
  { title: "Licitações e Contratos", keys: ["contratos"] },
  { title: "Pessoal e Patrimônio", keys: ["orgaos"] },
  { title: "Institucional e Planejamento", keys: ["planejamento", "legislacao"] },
  { title: "Apoio ao Cidadão", keys: ["ouvidoria"] },
];

function isValidUrl(v?: string | null) {
  if (!v) return false;
  try {
    const u = new URL(v.trim());
    return u.protocol.startsWith("http");
  } catch {
    return false;
  }
}

function TransparenciaPortalPage() {
  const [settings, setSettings] = useState<TransparencySettings | null>(null);
  const [links, setLinks] = useState<TransparencyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s, l] = await Promise.all([
        (supabase as any)
          .from("transparency_settings")
          .select("id, portal_url, portal_base_url, portal_name, entity_name, is_active, updated_at")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from("transparency_links")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);
      if (!mounted) return;
      setSettings((s.data as TransparencySettings | null) || null);
      setLinks((l.data as TransparencyLink[]) || []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const portalUrl = useMemo(() => {
    const u = settings?.portal_url || settings?.portal_base_url || "";
    return isValidUrl(u) ? getTransparencyUrl(u) : "";
  }, [settings]);

  const portalName = settings?.portal_name || settings?.entity_name || "Portal da Transparência";
  const lastUpdate = settings?.updated_at
    ? new Date(settings.updated_at).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  const linksByCat = useMemo(() => {
    const map = new Map<string, TransparencyLink[]>();
    CATEGORIES.forEach((c) => map.set(c.key, []));
    const others: TransparencyLink[] = [];
    for (const link of links) {
      const cat = CATEGORIES.find((c) => c.match(link));
      if (cat) map.get(cat.key)!.push(link);
      else others.push(link);
    }
    if (others.length) map.set("outros", others);
    return map;
  }, [links]);

  const filteredLinks = useMemo(() => {
    let list = links;
    if (activeCat) {
      const cat = CATEGORIES.find((c) => c.key === activeCat);
      if (cat) list = list.filter(cat.match);
      else list = linksByCat.get("outros") ?? [];
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (l) => l.title.toLowerCase().includes(s) || l.description.toLowerCase().includes(s),
      );
    }
    return list;
  }, [links, activeCat, q, linksByCat]);

  const linkHref = (l: TransparencyLink) =>
    l.external_url?.trim() ? l.external_url.trim() : portalUrl ? getTransparencyUrl(portalUrl, l.path) : "#";

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="container-page py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando Portal da Transparência...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-primary-foreground">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
        <div className="container-page relative py-4 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  <ShieldCheck className="h-3 w-3" /> Oficial
                </span>
                <h1 className="font-display text-lg font-extrabold leading-tight md:text-xl">
                  Portal da Transparência
                </h1>
              </div>
              <p className="mt-1 text-xs text-primary-foreground/80">
                {portalName} · <CalendarDays className="inline h-3 w-3 text-gold" /> Atualizado em {lastUpdate}
              </p>
            </div>
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold px-3 py-1.5 text-xs font-semibold text-primary-deep transition-colors hover:bg-gold/90"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Portal oficial
              </a>
            )}
          </div>
        </div>
      </section>




      {/* DADOS OFICIAIS (Megasoft) */}
      <OfficialDatasets baseUrl={portalUrl || undefined} />

      {/* CONTENT */}
      <section className="container-page py-12 md:py-16">
        {!portalUrl && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              O link do Portal Megasoft ainda não foi configurado no painel administrativo. Os cards abaixo
              usarão os links externos configurados.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-14">

            {GROUPS.map((group) => {
              const groupLinks = group.keys.flatMap((k) => linksByCat.get(k) ?? []);
              if (!groupLinks.length) return null;
              return (
                <div key={group.title}>
                  <div className="mb-6 flex items-center gap-4">
                    <span className="h-8 w-1.5 rounded-full bg-primary" />
                    <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                      {group.title}
                    </h2>
                  </div>
                  <CardGrid links={groupLinks} hrefFor={linkHref} />
                </div>
              );
            })}

            {(linksByCat.get("outros")?.length ?? 0) > 0 && (
              <div>
                <div className="mb-6 flex items-center gap-4">
                  <span className="h-8 w-1.5 rounded-full bg-primary" />
                  <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                    Outros Serviços
                  </h2>
                </div>
                <CardGrid links={linksByCat.get("outros") ?? []} hrefFor={linkHref} />
              </div>
            )}
        </div>


        {/* Footer info block */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <InfoCard
            icon={FileText}
            title="Lei de Acesso à Informação"
            text="Lei nº 12.527/2011 — garante o acesso a informações públicas de forma transparente."
          />
          <InfoCard
            icon={Building2}
            title="Portal Oficial"
            text={`Todos os dados exibidos são provenientes do ${portalName}.`}
            action={
              portalUrl
                ? { label: "Abrir portal", href: portalUrl }
                : undefined
            }
          />
          <InfoCard
            icon={MessageCircle}
            title="Fale com a Ouvidoria"
            text="Registre solicitações, denúncias ou pedidos de informação pelo e-SIC."
            action={{ label: "Acessar e-SIC", href: "/ouvidoria" }}
          />
        </div>
      </section>
    </main>
  );
}

function CardGrid({
  links,
  hrefFor,
}: {
  links: TransparencyLink[];
  hrefFor: (l: TransparencyLink) => string;
}) {
  if (!links.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        Nenhum item encontrado.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((l) => {
        const Icon = getTransparencyIcon(l.icon);
        return (
          <a
            key={l.id}
            href={hrefFor(l)}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-semibold text-foreground">{l.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
            </div>
            <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
        );
      })}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
      {action && (
        <Button asChild variant="outline" size="sm" className="mt-4">
          <a href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
            {action.label} <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}
