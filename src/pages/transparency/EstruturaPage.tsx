import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { sanitizeHtml } from "@/lib/sanitize";
import { Building2, Phone, Mail, MapPin, Clock, ChevronDown, ArrowRight, Users, Briefcase, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/transparencia/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/lib/roteador-transparencia";
import { secretariaMonogram, personInitials as initials } from "@/lib/secretaria";

type Dirigente = { id: string; nome: string; cargo: string; foto_url: string | null; ordem: number | null };
type Secretaria = {
  id: string; nome: string; sigla: string | null; slug: string;
  telefone: string | null; email: string | null; endereco: string | null;
  horario: string | null; descricao: string | null;
  secretario: string | null; foto_secretario: string | null;
  competencias: string[] | null; servicos: string[] | null;
};
type Departamento = { id: string; nome: string; telefone?: string | null; email?: string | null; endereco: string | null; responsavel: string | null; secretaria_id: string | null };
type Membro = { id: string; nome: string; cargo: string; foto_url: string | null; email?: string | null; telefone?: string | null; secretaria_id: string | null; departamento_id: string | null };

const MembroCard = ({ m }: { m: Membro }) => (
  <li className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/25">
    <Avatar className="h-12 w-12 shrink-0 rounded-[1rem_0.25rem_1rem_0.25rem]">
      <AvatarImage src={m.foto_url || undefined} alt="" className="object-cover" />
      <AvatarFallback className="rounded-[1rem_0.25rem_1rem_0.25rem] bg-primary/[0.08] font-display text-sm font-bold text-primary">{initials(m.nome)}</AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-foreground">{m.nome}</p>
      <p className="truncate text-xs text-muted-foreground">{m.cargo}</p>
      {m.email && <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-primary"><Mail className="h-3 w-3 shrink-0" aria-hidden="true" />{m.email}</p>}
      {m.telefone && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3 shrink-0" aria-hidden="true" />{m.telefone}</p>}
    </div>
  </li>
);

const TeamToggle = ({ count, expanded, onToggle, controls }: { count: number; expanded: boolean; onToggle: () => void; controls: string }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={expanded}
    aria-controls={controls}
    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary/[0.06] px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/[0.12]"
  >
    <Users className="h-3.5 w-3.5" aria-hidden="true" />
    {expanded ? "Ocultar equipe" : "Ver equipe"} ({count})
    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
  </button>
);

const TeamPanel = ({ id, membros }: { id: string; membros: Membro[] }) => (
  <div id={id} className="border-t border-border/70 bg-background/60 px-5 py-5 md:px-6 animate-fade-in">
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {membros.map((m) => <MembroCard key={m.id} m={m} />)}
    </ul>
  </div>
);

// Long institutional texts collapse to 4 lines so the grid stays balanced; nothing is hidden for good
const Descricao = ({ html, id }: { html: string; id: string }) => {
  const [open, setOpen] = useState(false);
  const isLong = html.replace(/<[^>]+>/g, "").length > 280;
  return (
    <div>
      <div
        id={id}
        className={`prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground ${isLong && !open ? "line-clamp-4" : ""}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
      {isLong && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          {open ? "Mostrar menos" : "Ler mais"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

const SecretariaCard = ({ sec, membros, expanded, onToggle }: {
  sec: Secretaria; membros: Membro[]; expanded: boolean; onToggle: () => void;
}) => (
  <article className="flex flex-col overflow-hidden rounded-leaf border border-border/70 bg-card shadow-soft">
    <div className="flex items-start gap-4 border-b border-border/70 p-5 md:p-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem_0.25rem_1rem_0.25rem] bg-primary font-display text-[0.8125rem] font-bold text-primary-foreground" aria-hidden="true">
        {secretariaMonogram(sec)}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.01em] text-foreground">{sec.nome}</h3>
        {sec.sigla && <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{sec.sigla}</p>}
      </div>
    </div>

    <div className="flex-1 space-y-4 p-5 md:p-6">
      {sec.secretario && (
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 rounded-[1rem_0.25rem_1rem_0.25rem]">
            <AvatarImage src={sec.foto_secretario || undefined} alt="" className="object-cover" />
            <AvatarFallback className="rounded-[1rem_0.25rem_1rem_0.25rem] bg-primary/[0.08] font-display font-bold text-primary">{initials(sec.secretario)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-primary">Secretário(a)</p>
            <p className="font-semibold text-foreground">{sec.secretario}</p>
            {sec.email && (
              <a href={`mailto:${sec.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline">
                <Mail className="h-3 w-3 shrink-0" aria-hidden="true" /><span className="break-all">{sec.email}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {sec.descricao && <Descricao html={sec.descricao} id={`desc-sec-${sec.id}`} />}

      {sec.servicos && sec.servicos.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Serviços">
          {sec.servicos.slice(0, 4).map((s, i) => (
            <li key={i} className="rounded-full border border-primary/15 bg-primary/[0.05] px-2.5 py-0.5 text-xs font-medium text-primary">{s}</li>
          ))}
          {sec.servicos.length > 4 && <li className="self-center px-1 text-xs text-muted-foreground">+{sec.servicos.length - 4}</li>}
        </ul>
      )}

      <ul className="space-y-1.5 text-[0.8125rem] text-muted-foreground">
        {sec.telefone && (
          <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <a href={`tel:${sec.telefone.replace(/\D/g, "")}`} className="tabular hover:text-primary hover:underline">{sec.telefone}</a>
          </li>
        )}
        {sec.endereco && <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />{sec.endereco}</li>}
        {sec.horario && <li className="flex items-start gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />{sec.horario}</li>}
      </ul>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-3.5 md:px-6">
      {membros.length > 0 ? (
        <TeamToggle count={membros.length} expanded={expanded} onToggle={onToggle} controls={`equipe-sec-${sec.id}`} />
      ) : <span />}
    </div>

    {expanded && membros.length > 0 && <TeamPanel id={`equipe-sec-${sec.id}`} membros={membros} />}
  </article>
);

const DepartamentoItem = ({ dep, membros, expanded, onToggle }: {
  dep: Departamento; membros: Membro[]; expanded: boolean; onToggle: () => void;
}) => (
  <li className="relative">
    {/* Node on the tree line */}
    <span className="absolute -left-[1.4rem] top-6 h-2.5 w-2.5 rounded-full border-2 border-card bg-sun ring-1 ring-primary/30" aria-hidden="true" />
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex items-start gap-4 p-4 md:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem_0.25rem_1rem_0.25rem] bg-primary/[0.07]">
          <Briefcase className="h-4 w-4 text-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-foreground">{dep.nome}</h4>
          {dep.responsavel && (
            <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-foreground/80">
              <UserRound className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-muted-foreground">Responsável:</span> {dep.responsavel}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            {dep.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-primary" aria-hidden="true" />{dep.telefone}</span>}
            {dep.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-primary" aria-hidden="true" />{dep.email}</span>}
            {dep.endereco && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" aria-hidden="true" />{dep.endereco}</span>}
          </div>
          {membros.length > 0 && (
            <div className="mt-3">
              <TeamToggle count={membros.length} expanded={expanded} onToggle={onToggle} controls={`equipe-dep-${dep.id}`} />
            </div>
          )}
        </div>
      </div>
      {expanded && membros.length > 0 && <TeamPanel id={`equipe-dep-${dep.id}`} membros={membros} />}
    </div>
  </li>
);

const EstruturaPage = () => {
  const [dirigentes, setDirigentes] = useState<Dirigente[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [expandedSec, setExpandedSec] = useState<Record<string, boolean>>({});
  const [expandedDep, setExpandedDep] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [d, s, dep, m] = await Promise.all([
        supabase.from("dirigentes").select("*").eq("ativo", true).order("ordem"),
        supabase.from("secretarias").select("id, nome, sigla, slug, telefone, email, endereco, horario, descricao, secretario, foto_secretario, competencias, servicos").eq("ativo", true).order("nome"),
        supabase.from("departamentos").select("id, nome, tipo, secretaria_id, endereco, responsavel, ordem, ativo").eq("ativo", true).order("ordem"),
        supabase.from("membros_equipe").select("id, nome, cargo, foto_url, secretaria_id, departamento_id, ordem, ativo").eq("ativo", true).order("ordem"),
      ]);
      setDirigentes(d.data || []);
      setSecretarias((s.data as Secretaria[]) || []);
      setDepartamentos(dep.data || []);
      setMembros(m.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const membrosPorSecretaria = (secId: string) => membros.filter(m => m.secretaria_id === secId && !m.departamento_id);
  const membrosPorDepartamento = (depId: string) => membros.filter(m => m.departamento_id === depId);
  const toggleDep = (id: string) => setExpandedDep(prev => ({ ...prev, [id]: !prev[id] }));

  const layoutProps = {
    title: "Estrutura Organizacional",
    description: "Organograma e equipe do município.",
    breadcrumbs: [{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: "Estrutura" }],
  };

  if (loading) {
    return (
      <TransparencyLayout {...layoutProps}>
        <div className="space-y-6" aria-busy="true">
          <div className="skeleton h-28 max-w-xl" />
          <div className="grid gap-5 md:grid-cols-2">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-72 rounded-leaf" />)}</div>
        </div>
      </TransparencyLayout>
    );
  }

  const outrosDeps = departamentos.filter(d => !d.secretaria_id);
  const stats = [
    { value: secretarias.length, label: secretarias.length === 1 ? "secretaria" : "secretarias" },
    { value: departamentos.length, label: departamentos.length === 1 ? "departamento" : "departamentos" },
    { value: membros.length, label: membros.length === 1 ? "integrante de equipe" : "integrantes de equipe" },
  ];

  return (
    <TransparencyLayout {...layoutProps}>
      {/* Intro */}
      <header className="mb-10 grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <nav aria-label="Você está em" className="mb-3 text-[0.8125rem] text-muted-foreground">
            <Link to="/" className="hover:text-primary hover:underline">Início</Link>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <Link to="/transparencia" className="hover:text-primary hover:underline">Transparência</Link>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <span className="font-medium text-foreground" aria-current="page">Estrutura</span>
          </nav>
          <p className="eyebrow">Organograma municipal</p>
          <h1 className="mt-2 font-display text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[2.75rem]">
            Estrutura Organizacional
          </h1>
          <p className="section-lead">Conheça os departamentos e a equipe que trabalha pela nossa cidade</p>
        </div>
        <dl className="flex gap-6 md:gap-10">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-bold leading-none tracking-tight text-primary tabular md:text-4xl">{s.value}</span>
                <span className="mt-1.5 block text-xs font-medium text-muted-foreground" aria-hidden="true">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* Top of the org chart */}
      {dirigentes.length > 0 && (
        <section aria-labelledby="dirigentes-titulo" className="mb-12">
          <h2 id="dirigentes-titulo" className="sr-only">Gestão municipal</h2>
          <ul className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {dirigentes.map((d) => (
              <li key={d.id} className="surface-deep rounded-leaf relative flex items-center gap-5 overflow-hidden p-5 text-white shadow-elevated">
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sun/10 blur-2xl" aria-hidden="true" />
                <Avatar className="h-20 w-20 shrink-0 rounded-[1rem_0.25rem_1rem_0.25rem] ring-2 ring-sun/70 ring-offset-2 ring-offset-[var(--primary-deep)]">
                  <AvatarImage src={d.foto_url || undefined} alt="" className="object-cover" />
                  <AvatarFallback className="rounded-[1rem_0.25rem_1rem_0.25rem] bg-white/10 font-display text-xl font-bold text-white">{initials(d.nome)}</AvatarFallback>
                </Avatar>
                <div className="relative min-w-0">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-sun">{d.cargo}</p>
                  <p className="mt-1 font-display text-xl font-bold leading-tight">{d.nome}</p>
                </div>
              </li>
            ))}
          </ul>
          {/* Connector down to the secretarias */}
          <div className="mx-auto mt-0 h-10 w-px bg-gradient-to-b from-primary/40 to-transparent" aria-hidden="true" />
        </section>
      )}

      <Tabs defaultValue="secretarias" className="w-full">
        <div className="mb-8 flex justify-center">
          <TabsList className="grid h-auto w-full max-w-lg grid-cols-3 gap-1 rounded-xl bg-muted/70 p-1">
            {[
              { v: "secretarias", icon: Building2, label: "Secretarias" },
              { v: "departamentos", icon: Briefcase, label: "Departamentos" },
              { v: "equipe", icon: Users, label: "Equipe" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="h-10 gap-1.5 rounded-lg px-2 text-[0.8125rem] font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-soft"
              >
                <t.icon className="hidden h-4 w-4 sm:block" aria-hidden="true" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="secretarias">
          {secretarias.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">Nenhuma secretaria cadastrada.</p>
          ) : (
            <div className="grid items-start gap-5 md:grid-cols-2">
              {secretarias.map((sec) => (
                <SecretariaCard
                  key={sec.id} sec={sec}
                  membros={membrosPorSecretaria(sec.id)}
                  expanded={expandedSec[sec.id] || false}
                  onToggle={() => setExpandedSec(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="departamentos">
          <div className="space-y-12">
            {secretarias.map((sec) => {
              const secDeps = departamentos.filter(d => d.secretaria_id === sec.id);
              if (secDeps.length === 0) return null;
              return (
                <section key={sec.id} aria-labelledby={`dep-grupo-${sec.id}`}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem_0.25rem_1rem_0.25rem] bg-primary font-display text-xs font-bold text-primary-foreground" aria-hidden="true">
                      {secretariaMonogram(sec)}
                    </span>
                    <div className="min-w-0">
                      <h3 id={`dep-grupo-${sec.id}`} className="font-display text-lg font-bold leading-snug text-foreground">{sec.nome}</h3>
                      <p className="text-xs text-muted-foreground">{secDeps.length} {secDeps.length === 1 ? "departamento" : "departamentos"}</p>
                    </div>
                  </div>
                  <ul className="ml-[1.3rem] space-y-3 border-l-2 border-primary/15 pl-6">
                    {secDeps.map((dep) => (
                      <DepartamentoItem key={dep.id} dep={dep} membros={membrosPorDepartamento(dep.id)} expanded={expandedDep[dep.id] || false} onToggle={() => toggleDep(dep.id)} />
                    ))}
                  </ul>
                </section>
              );
            })}
            {outrosDeps.length > 0 && (
              <section aria-labelledby="dep-outros">
                <h3 id="dep-outros" className="mb-5 font-display text-lg font-bold text-foreground">Outros Departamentos</h3>
                <ul className="ml-[1.3rem] space-y-3 border-l-2 border-primary/15 pl-6">
                  {outrosDeps.map((dep) => (
                    <DepartamentoItem key={dep.id} dep={dep} membros={membrosPorDepartamento(dep.id)} expanded={expandedDep[dep.id] || false} onToggle={() => toggleDep(dep.id)} />
                  ))}
                </ul>
              </section>
            )}
            {departamentos.length === 0 && <p className="py-10 text-center text-muted-foreground">Nenhum departamento cadastrado.</p>}
          </div>
        </TabsContent>

        <TabsContent value="equipe">
          {membros.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">Nenhum membro cadastrado.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {membros.map(m => <MembroCard key={m.id} m={m} />)}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </TransparencyLayout>
  );
};

export default EstruturaPage;
