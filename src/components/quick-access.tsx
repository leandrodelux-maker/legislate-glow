import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import {
  useQuickAccess,
  CATEGORY_LABELS,
  type QuickAccessCategory,
  type QuickAccessItem,
} from "@/lib/quick-access-store";
import { QuickAccessIconRender } from "@/components/quick-access-icon";
import { Button } from "@/components/ui/button";

const CATEGORIES: QuickAccessCategory[] = ["cidadaos", "servidores", "empresas", "legislacao"];

function Card({ item }: { item: QuickAccessItem }) {
  const inner = (
    <div className="group relative h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-elegant">
      <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/5 text-primary ring-1 ring-primary/10">
        <QuickAccessIconRender name={item.icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-6 font-display text-base font-semibold text-foreground">{item.label}</h3>
      {item.tag && (
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
          {item.tag}
        </p>
      )}
    </div>
  );

  if (item.external) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <Link to={item.url}>{inner}</Link>;
}

export function QuickAccess() {
  const { items } = useQuickAccess();
  const [active, setActive] = useState<QuickAccessCategory>("cidadaos");
  const filtered = items.filter((i) => i.category === active);

  return (
    <section className="bg-secondary/30 border-y border-border/60">
      <div className="container-page py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Acesso Rápido
            </h2>
            <p className="mt-2 text-muted-foreground">
              Encontre rapidamente os serviços e informações que você precisa.
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-auto">
            <LayoutGrid className="mr-2 h-4 w-4" /> Todos os serviços
          </Button>
        </div>

        {/* Tabs */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 rounded-xl bg-card border border-border overflow-hidden">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-4 text-sm font-semibold transition-colors ${
                active === c
                  ? "bg-primary-deep text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground py-12 text-center">
              Nenhum serviço cadastrado nesta categoria.
            </p>
          ) : (
            filtered.map((item) => <Card key={item.id} item={item} />)
          )}
        </div>
      </div>
    </section>
  );
}
