import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Radar, X } from "lucide-react";
import { toast } from "sonner";
import { CrudPage, type FieldDef, type Repositorio } from "@/components/admin/painel/CrudModulo";
import { Selo } from "@/components/admin/painel/PaginaModulo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase as bancoAnalitico } from "@/integrations/transparencia/client";
import { excluirCriterio, listarMatriz, salvarConfigMatriz, salvarCriterio } from "@/lib/atricon.functions";
import { TODOS_ITENS, itemHref } from "@/data/transparenciaCatalogo";

export const Route = createFileRoute("/admin/matriz-atricon")({
  component: AdminMatriz,
});

type LinkItem = { rotulo?: string | null; url: string };
type Criterio = {
  id: string;
  grupo: string;
  grupo_ordem: number;
  numero: string;
  pergunta: string;
  base_legal: string | null;
  classificacao: string;
  links: LinkItem[];
  ordem: number;
  ativo: boolean;
};

const COR_CLASSIFICACAO: Record<string, string> = { Essencial: "#B42318", Obrigatório: "#1F5FBF", Recomendado: "#0B7A4B" };

const DIMENSOES = [
  "Informações Prioritárias", "Informações Institucionais", "Receitas", "Despesas", "Convênios e Transferências", "Recursos Humanos", "Diárias", "Licitações", "Contratos", "Obras",
  "Planejamento e Prestação de Contas", "SIC – Serviço de Informação ao Cidadão", "Acessibilidade", "Ouvidoria", "LGPD e Governo Digital",
].map((g, i) => ({ grupo: g, ordem: i + 1 })).concat({ grupo: "Atividades Finalísticas", ordem: 20 });

const temLink = (c: Criterio) => (c.links ?? []).some((l) => l.url);

const repositorio: Repositorio = {
  listar: async () => JSON.parse(await listarMatriz()),
  salvar: async (id, dados) => {
    const grupo_ordem = DIMENSOES.find((d) => d.grupo === dados.grupo)?.ordem ?? 99;
    const partes = String(dados.numero ?? "").split(".");
    const links = ((dados.links as LinkItem[] | null) ?? []).filter((l) => l.url?.trim());
    await salvarCriterio({ data: { id, dados: { ...dados, grupo_ordem, links, ordem: Number(partes[1] ?? 0) } } });
  },
  excluir: async (id) => { await excluirCriterio({ data: { id } }); },
};

// Páginas do próprio site, oferecidas como sugestão ao digitar o link.
const SUGESTOES = [
  ...TODOS_ITENS.map((i) => ({ url: itemHref(i), rotulo: i.label })),
  { url: "/", rotulo: "Capa do site" },
  { url: "/transparencia", rotulo: "Portal da Transparência" },
  { url: "/vereadores", rotulo: "Vereadores" },
  { url: "/sessoes", rotulo: "Sessões" },
  { url: "/a-camara/mesa-diretora", rotulo: "Mesa Diretora" },
  { url: "/a-camara/comissoes", rotulo: "Comissões" },
  { url: "/mapa-do-site", rotulo: "Mapa do site" },
];

function EditorLinks({ links, onChange }: { links: LinkItem[]; onChange: (l: LinkItem[]) => void }) {
  const mudar = (i: number, campo: keyof LinkItem, v: string) => onChange(links.map((l, n) => (n === i ? { ...l, [campo]: v } : l)));
  return (
    <div className="space-y-2">
      <datalist id="paginas-do-site">{SUGESTOES.map((s) => <option key={s.url} value={s.url}>{s.rotulo}</option>)}</datalist>
      {links.map((l, i) => (
        <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <Input aria-label={`Nome do link ${i + 1}`} placeholder="Nome (ex.: Receitas)" className="h-10 sm:w-48" value={l.rotulo ?? ""} onChange={(e) => mudar(i, "rotulo", e.target.value)} />
          <Input aria-label={`Endereço do link ${i + 1}`} list="paginas-do-site" placeholder="/transparencia/receitas ou https://..." className="h-10 flex-1 min-w-0" value={l.url} onChange={(e) => mudar(i, "url", e.target.value)} />
          <Button type="button" variant="ghost" size="icon" aria-label={`Remover o link ${i + 1}`} onClick={() => onChange(links.filter((_, n) => n !== i))}><X className="w-4 h-4" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...links, { rotulo: "", url: "" }])}><Plus className="w-4 h-4 mr-1" aria-hidden /> Adicionar link</Button>
      <p className="text-xs text-muted-foreground">Digite para ver as páginas do site, ou cole um link externo. Alguns critérios pedem mais de um link.</p>
    </div>
  );
}

const fields: FieldDef[] = [
  { name: "numero", label: "Número", required: true, placeholder: "Ex.: 3.1" },
  { name: "classificacao", label: "Classificação", type: "select", required: true, options: Object.keys(COR_CLASSIFICACAO).map((c) => ({ label: c, value: c })) },
  { name: "grupo", label: "Dimensão", type: "select", required: true, largo: true, options: DIMENSOES.map((d) => ({ label: d.grupo, value: d.grupo })) },
  { name: "pergunta", label: "Critério", type: "textarea", required: true },
  { name: "base_legal", label: "Base legal", largo: true, placeholder: "Ex.: Art. 48, §1º, II, da LC nº 101/00" },
  {
    name: "links",
    label: "Links do critério",
    type: "custom",
    renderCustom: (_r, form, setForm) => <EditorLinks links={form.links ?? []} onChange={(links) => setForm({ ...form, links })} />,
  },
  { name: "ativo", label: "Exibição", type: "checkbox", placeholder: "Mostrar este critério na página pública", largo: true },
];

function ConfigMatriz() {
  const [avaliacao, setAvaliacao] = useState("");
  const [radar, setRadar] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (bancoAnalitico as any).from("configuracoes").select("valor").eq("chave", "atricon_matriz").maybeSingle().then(({ data }: any) => {
      setAvaliacao(data?.valor?.avaliacao ?? String(new Date().getFullYear()));
      setRadar(data?.valor?.radar_url ?? "https://radardatransparencia.atricon.org.br");
    });
  }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await salvarConfigMatriz({ data: { avaliacao, radar_url: radar } });
      toast.success("Configuração salva.");
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "Não foi possível salvar.", { duration: 8000 });
    }
    setSalvando(false);
  };

  return (
    <form onSubmit={salvar} className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-end gap-3">
      <span className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0" style={{ backgroundColor: "var(--tema)" }}><Radar className="w-5 h-5" aria-hidden /></span>
      <div className="w-32">
        <label htmlFor="avaliacao" className="block text-sm font-semibold text-foreground mb-1.5">Avaliação</label>
        <Input id="avaliacao" className="h-10" value={avaliacao} onChange={(e) => setAvaliacao(e.target.value)} />
      </div>
      <div className="flex-1 min-w-[260px]">
        <label htmlFor="radar" className="block text-sm font-semibold text-foreground mb-1.5">Link do Radar da Transparência</label>
        <Input id="radar" type="url" className="h-10" value={radar} onChange={(e) => setRadar(e.target.value)} />
      </div>
      <Button type="submit" variant="outline" className="h-10" disabled={salvando}>{salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar</Button>
    </form>
  );
}

function AdminMatriz() {
  const classificacoes = useMemo(() => Object.keys(COR_CLASSIFICACAO).map((c) => ({ label: c, value: c })), []);
  return (
    <CrudPage<Criterio>
      title="Matriz Atricon"
      table="atricon_itens"
      repositorio={repositorio}
      singular="critério"
      nomeDe={(r) => `critério ${r.numero}`}
      vazio="A matriz ainda não foi carregada"
      antes={<ConfigMatriz />}
      fields={fields}
      defaultValues={{ ativo: true, classificacao: "Obrigatório", links: [] } as Partial<Criterio>}
      buscaEm={["numero", "pergunta", "base_legal"]}
      indicadores={(ls) => {
        const com = ls.filter(temLink).length;
        const essenciais = ls.filter((l) => l.classificacao === "Essencial");
        return [
          { rotulo: "Critérios", valor: ls.length },
          { rotulo: "Com link", valor: com, detalhe: ls.length ? `${Math.round((com / ls.length) * 100)}% da matriz` : undefined, cor: "#0B7A4B" },
          { rotulo: "Sem link", valor: ls.length - com, cor: "#A8540F" },
          { rotulo: "Essenciais sem link", valor: essenciais.filter((l) => !temLink(l)).length, detalhe: `De ${essenciais.length} essenciais`, cor: "#B42318" },
        ];
      }}
      filtros={[
        { campo: "grupo", rotulo: "Dimensão" },
        { campo: "classificacao", rotulo: "Classificação", opcoes: classificacoes },
        { campo: "link", rotulo: "Link", valor: (r) => (temLink(r) ? "Com link" : "Sem link") },
      ]}
      secoes={[
        { titulo: "Critério", campos: ["numero", "classificacao", "grupo", "pergunta", "base_legal"] },
        { titulo: "Onde encontrar", descricao: "Com link cadastrado não significa critério atendido: o resultado oficial é o do Radar.", campos: ["links"] },
        { titulo: "Exibição", campos: ["ativo"] },
      ]}
      cartao={{
        titulo: (r) => `${r.numero} · ${r.grupo}`,
        selo: (r) => <Selo cor={COR_CLASSIFICACAO[r.classificacao]}>{r.classificacao}</Selo>,
        texto: (r) => r.pergunta,
        rodape: (r) => (temLink(r) ? `${r.links.length} ${r.links.length === 1 ? "link" : "links"}` : "Sem link"),
      }}
      columns={[
        { key: "numero", label: "Nº" },
        { key: "pergunta", label: "Critério", render: (r) => <span className="line-clamp-2 max-w-xl">{r.pergunta}</span> },
        { key: "grupo", label: "Dimensão" },
        { key: "classificacao", label: "Classificação", render: (r) => <Selo cor={COR_CLASSIFICACAO[r.classificacao]}>{r.classificacao}</Selo> },
        { key: "links", label: "Links", render: (r) => (temLink(r) ? r.links.length : "Sem link") },
      ]}
    />
  );
}
