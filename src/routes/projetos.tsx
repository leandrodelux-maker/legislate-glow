import { ChipsFiltro, ContinueNavegando, FaixaDestaques, FotoEstudio, TituloSecao } from "@/components/pagina-ui";
import { EstadoVazio } from "@/components/pagina-hero";
import { SearchX } from "lucide-react";
import { PaginaHero } from "@/components/pagina-hero";
import { Gavel as IconeHero } from "lucide-react";
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
      { title: "Atos Legislativos — Câmara Municipal de Cachoeira de Goiás" },
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

const ROTULO_STATUS: Record<string, string> = {
  protocolado: "Protocolado",
  comissao: "Em comissão",
  plenario: "Em plenário",
  aprovado: "Aprovado",
  sancionado: "Sancionado",
  arquivado: "Arquivado",
};

/** Barra de progresso da tramitação. A fase também aparece em texto, para não depender só da cor. */
function Tramitacao({ fase }: { fase: number }) {
  return (
    <div>
      <ol className="flex items-center" aria-hidden>
        {fases.map((f, i) => {
          const passo = i + 1;
          const feito = passo <= fase;
          return (
            <li key={f.label} className={`flex items-center ${i === 0 ? "" : "flex-1"}`}>
              {i > 0 && <span className={`h-0.5 w-full ${feito ? "bg-primary" : "bg-border"}`} />}
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${passo === fase ? "bg-gold text-gold-foreground" : feito ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <f.icon className="h-4 w-4" />
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs font-semibold text-primary">Etapa {fase} de {fases.length}: {fases[fase - 1]?.label}</p>
    </div>
  );
}

const ETAPAS_LEI = [
  "O projeto é apresentado e recebe um número.",
  "As comissões analisam e emitem parecer.",
  "Os vereadores debatem e votam em sessão.",
  "A matéria aprovada segue para a sanção.",
  "A lei é sancionada e passa a valer.",
];

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

  const termo = searchTerm.trim().toLowerCase();
  const filteredProjetos = projetos.filter((p) => {
    const matchesSearch = !termo || `${p.ementa} ${p.numero} ${p.ano}`.toLowerCase().includes(termo);
    const matchesType = selectedType === "Todos" || p.tipo === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <PaginaHero
        icone={IconeHero}
        eyebrow="Atos Legislativos"
        title="Acompanhe os"
        destaque="Atos Legislativos"
        description={<>Entenda como as leis são criadas e pesquise por matérias específicas.</>}
      />

      {/* BUSCA */}
      <section className="container-page relative z-10 -mt-7">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl shadow-primary-deep/15 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" aria-hidden />
            <Input
              type="search"
              placeholder="Buscar por número, ano ou palavra-chave"
              aria-label="Buscar matérias"
              className="h-12 border-0 pl-12 text-base shadow-none focus-visible:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative sm:w-64">
            <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" aria-hidden />
            <select
              aria-label="Filtrar por tipo de matéria"
              className="h-12 w-full appearance-none rounded-xl bg-secondary/70 pl-10 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option>Todos</option>
              {tiposMateria.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="container-page py-10 md:py-14">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
          </div>
        ) : filteredProjetos.length === 0 ? (
          <EstadoVazio icone={SearchX} titulo="Nenhuma matéria encontrada" texto={projetos.length ? "Tente outro número ou palavra-chave, ou remova o filtro." : "As matérias aparecem aqui assim que forem publicadas pela Câmara."} />
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">{filteredProjetos.length} {filteredProjetos.length === 1 ? "matéria" : "matérias"}</p>
            <ul className="grid gap-3">
              {filteredProjetos.map((p) => (
                <li key={p.id} className="grid gap-5 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-elegant lg:grid-cols-[1fr_300px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-primary-deep px-2.5 py-1 text-xs font-bold text-white">{p.tipo} {p.numero}/{p.ano}</span>
                      <Badge variant="outline" className="text-xs">{ROTULO_STATUS[p.status] ?? p.status}</Badge>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">{p.ementa}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Users2 className="h-3.5 w-3.5 text-primary" aria-hidden /> {p.vereadores?.nome || p.autor || "Autor não informado"}</span>
                      {p.documento_url && (
                        <a href={p.documento_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                          <FileText className="h-3.5 w-3.5" aria-hidden /> Abrir documento
                        </a>
                      )}
                    </div>
                  </div>
                  <Tramitacao fase={statusMap[p.status] || 1} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* COMO UMA LEI NASCE */}
      <section className="relative overflow-hidden bg-primary-deep py-12 text-white md:py-16">
        <div className="textura-pontos absolute inset-0" aria-hidden />
        <div className="container-page relative">
          <TituloSecao claro eyebrow="Processo legislativo" titulo="Como uma lei nasce" descricao="O caminho de uma matéria, da apresentação até a sanção." />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {fases.map((f, i) => (
              <li key={f.label} className="rounded-2xl border border-white/15 bg-white/[0.07] p-4">
                <span className="flex items-center justify-between">
                  <f.icon className="h-5 w-5 text-gold" aria-hidden />
                  <span className="font-display text-2xl font-bold text-white/40" aria-hidden>{i + 1}</span>
                </span>
                <span className="mt-3 block font-display font-semibold">{f.label}</span>
                <span className="mt-1 block text-sm leading-snug text-white/85">{ETAPAS_LEI[i]}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
