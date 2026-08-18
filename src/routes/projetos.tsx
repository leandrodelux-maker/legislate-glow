import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  FileText, 
  Search, 
  Filter, 
  Gavel,
  Users2,
  CheckCircle2,
  Stamp,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Atos Legislativos — Câmara Municipal de Adelândia" },
      {
        name: "description",
        content: "Entenda como as leis são criadas e pesquise por matérias específicas.",
      },
    ],
  }),
  component: ProjetosPage,
});

const tiposMateria = [
  "Projeto de Lei",
  "Projeto de Lei Complementar",
  "Indicação",
  "Requerimento",
  "Moção",
  "Projeto de Decreto Legislativo",
  "Emenda",
];

type Projeto = {
  id: string;
  numero: string;
  ano: number;
  tipo: string;
  ementa: string;
  autor: string | null;
  status: string;
  documento_url: string | null;
  vereadores?: {
    nome: string;
  };
};

const statusMap: Record<string, number> = {
  "protocolado": 1,
  "comissao": 2,
  "plenario": 3,
  "aprovado": 4,
  "sancionado": 5,
};

const fases = [
  { label: "Protocolado", icon: FileText },
  { label: "Comissão", icon: Users2 },
  { label: "Plenário", icon: Gavel },
  { label: "Aprovado", icon: CheckCircle2 },
  { label: "Sancionado", icon: Stamp },
];

function LegislativeTimeline({ currentFase }: { currentFase: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto py-8">
      {fases.map((fase, index) => {
        const step = index + 1;
        const isActive = step <= currentFase;
        const isCurrent = step === currentFase;
        const Icon = fase.icon;

        return (
          <div key={fase.label} className="flex flex-col items-center relative flex-1">
            {index !== 0 && (
              <div 
                className={`absolute right-1/2 top-5 w-full h-0.5 -translate-y-1/2 -z-10 ${
                  isActive ? "bg-primary" : "bg-muted"
                }`} 
              />
            )}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                isActive 
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                  : "bg-muted text-muted-foreground"
              } ${isCurrent ? "scale-110 shadow-lg shadow-primary/20" : ""}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className={`mt-3 text-[10px] font-bold uppercase tracking-tighter text-center max-w-[80px] ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}>
              {fase.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProjetosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjetos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projetos_legislativos")
        .select("*, vereadores(nome)")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setProjetos(data as Projeto[]);
      }
      setLoading(false);
    };

    fetchProjetos();
  }, []);

  const filteredProjetos = projetos.filter(p => {
    const matchesSearch = p.ementa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.numero.includes(searchTerm);
    const matchesType = selectedType === "Todos" || p.tipo === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <section className="bg-gradient-to-br from-primary-deep to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 skew-x-12 translate-x-1/2" />
        <div className="container-page py-11 md:py-16 relative z-10">
          <div className="text-xs uppercase tracking-[0.2em] text-gold flex items-center gap-3">
            <span className="gold-divider" /> Atos Legislativos
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold leading-tight">
            Acompanhe os <span className="text-gold">Atos Legislativos</span>
          </h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/85 text-lg">
            Entenda como as leis são criadas e pesquise por matérias específicas.
          </p>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar projeto por número, ano ou palavra-chave..." 
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="relative w-full md:w-64">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select 
                  className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option>Todos</option>
                  {tiposMateria.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <Button className="h-12 px-6">Pesquisar</Button>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredProjetos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma matéria legislativa encontrada.
              </div>
            ) : (
              filteredProjetos.map((p, i) => (
                <div 
                  key={p.id}
                  className="group bg-background border border-border/60 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all animate-[fade-up_0.5s_ease-out_both]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                          {p.tipo.toUpperCase()} {p.numero}/{p.ano}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                          {p.status.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {p.ementa}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users2 className="h-3.5 w-3.5 text-gold" /> {p.vereadores?.nome || p.autor || "Não informado"}
                      </p>
                    </div>
                    
                    <div className="lg:w-[400px]">
                      <LegislativeTimeline currentFase={statusMap[p.status] || 1} />
                    </div>

                    <div className="flex items-center gap-3">
                      {p.documento_url && (
                        <Button variant="outline" size="sm" className="h-10" asChild>
                          <a href={p.documento_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" /> PDF
                          </a>
                        </Button>
                      )}
                      <Button size="sm" className="h-10">
                        Tramitação
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}