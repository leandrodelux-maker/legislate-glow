import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useQuickAccessStore, type QuickAccessItem } from "@/lib/quick-access-store";
import { QuickAccessIconRender } from "@/components/quick-access-icon";

function Card({ item }: { item: QuickAccessItem }) {
  const isExternal = item.url.startsWith("http");
  const inner = (
    <div className="group relative h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-elegant">
      <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/5 text-primary ring-1 ring-primary/10">
        <QuickAccessIconRender name={item.icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-6 font-display text-base font-semibold text-foreground">{item.label}</h3>
    </div>
  );

  if (isExternal) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <Link to={item.url as any}>{inner}</Link>;
}

export function QuickAccess() {
  const { items, isLoading, fetchItems } = useQuickAccessStore();

  useEffect(() => {
    fetchItems();
  }, []);

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
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground py-12 text-center">
              Nenhum serviço cadastrado.
            </p>
          ) : (
            items.map((item) => <Card key={item.id} item={item} />)
          )}
        </div>
      </div>
    </section>
  );
}
