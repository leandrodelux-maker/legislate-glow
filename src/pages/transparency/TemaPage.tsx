import { Link, Navigate, useParams } from "@/lib/roteador-transparencia";
import { ArrowRight } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { TEMAS, findTema, itemHref } from "@/data/transparenciaCatalogo";

// Página de um tema da transparência: todos os itens do assunto, mais os outros temas.
const TemaPage = () => {
  const { tema: id = "" } = useParams();
  const tema = findTema(id);
  if (!tema) return <Navigate to="/transparencia" replace />;

  return (
    <TransparencyLayout
      title={tema.label}
      description={tema.desc}
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: tema.label }]}
    >
      <p className="text-sm text-muted-foreground mb-5">{tema.items.length} informações neste tema</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tema.items.map((item) => (
          <Link key={item.slug} to={itemHref(item)}
            className="group relative bg-card border border-border/50 rounded-2xl p-5 pl-6 hover:shadow-lg hover:-translate-y-0.5 transition overflow-hidden">
            <span className="absolute left-0 inset-y-0 w-1.5" style={{ backgroundColor: tema.color }} aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-foreground leading-snug">{item.label}</h2>
              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 transition group-hover:translate-x-0.5" style={{ color: tema.color }} aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold text-foreground mt-14 mb-4">Outros temas</h2>
      <div className="flex flex-wrap gap-2">
        {TEMAS.filter((t) => t.id !== tema.id).map((t) => (
          <Link key={t.id} to={`/transparencia/tema/${t.id}`}
            className="inline-flex items-center gap-2 bg-card border border-border/60 rounded-full pl-1.5 pr-4 py-1.5 text-sm font-semibold text-foreground hover:shadow-md transition">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: t.color }}>
              <t.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            {t.label}
          </Link>
        ))}
      </div>
    </TransparencyLayout>
  );
};

export default TemaPage;
