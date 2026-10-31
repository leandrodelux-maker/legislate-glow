import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, FileText, Gavel, Import, Loader2, Scale, Users, Vote } from "lucide-react";
import { toast } from "sonner";
import { CrudPage, slugify, type FieldDef, type Repositorio } from "@/components/admin/painel/CrudModulo";
import { Selo } from "@/components/admin/painel/PaginaModulo";
import { supabase as bancoSite } from "@/integrations/supabase/client";
import { supabase as bancoAnalitico } from "@/integrations/transparencia/client";
import { autorizarEnvio, excluirPublicacao, importarDoPortal, listarPublicacoes, salvarPublicacao } from "@/lib/publicacoes.functions";

export const Route = createFileRoute("/admin/publicacoes")({
  component: AdminPublicacoes,
});

type Publicacao = {
  id: string;
  categoria: string;
  tipo: string | null;
  numero: string | null;
  ano: number | null;
  titulo: string;
  descricao: string | null;
  situacao: string | null;
  data_publicacao: string | null;
  arquivo_url: string | null;
  publicado: boolean;
};

const CATEGORIAS = [
  { label: "Legislação Municipal", value: "legislacao-municipal" },
  { label: "Outras Publicações", value: "outras-publicacoes" },
  { label: "Atividades Legislativas dos Parlamentares", value: "atividades-legislativas" },
  { label: "Pauta das Comissões", value: "pauta-comissoes" },
  { label: "Leis e Atos Infralegais", value: "leis-atos-infralegais" },
];
const opcoes = (l: string[]) => l.map((v) => ({ label: v, value: v }));
const TIPOS = opcoes(["Lei", "Lei Complementar", "Decreto", "Decreto Legislativo", "Resolução", "Portaria", "Pauta", "Relatório", "Outro"]);
const SITUACOES = opcoes(["Vigente", "Revogada", "Alterada"]);
const nomeCategoria = (v: string) => CATEGORIAS.find((c) => c.value === v)?.label ?? v;
const dataBr = (d: string | null) => (d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : "");

const repositorio: Repositorio = {
  listar: () => listarPublicacoes() as Promise<any[]>,
  salvar: async (id, dados) => { await salvarPublicacao({ data: { id, dados } }); },
  excluir: async (id) => { await excluirPublicacao({ data: { id } }); },
  enviarPdf: async (file) => {
    const nome = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 80) || "documento";
    const envio = await autorizarEnvio({ data: { nome } });
    const { error } = await bancoAnalitico.storage.from("site").uploadToSignedUrl(envio.caminho, envio.token, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    return envio.url;
  },
};

const fields: FieldDef[] = [
  { name: "categoria", label: "Onde será publicado", type: "select", required: true, options: CATEGORIAS, largo: true },
  { name: "titulo", label: "Título", required: true, largo: true, placeholder: "Ex.: Lei de criação do programa de leitura" },
  { name: "tipo", label: "Tipo", type: "select", options: TIPOS, placeholder: "Sem tipo" },
  { name: "situacao", label: "Situação", type: "select", options: SITUACOES, placeholder: "Sem situação" },
  { name: "numero", label: "Número", placeholder: "Ex.: 012" },
  { name: "ano", label: "Ano", type: "number" },
  { name: "data_publicacao", label: "Data de publicação", type: "date", largo: true },
  { name: "descricao", label: "Descrição ou ementa", type: "textarea" },
  { name: "arquivo_url", label: "Arquivo", type: "file", arquivo: "pdf" },
  { name: "publicado", label: "Publicação", type: "checkbox", placeholder: "Mostrar no Portal da Transparência", largo: true },
];

type Integrado = { rotulo: string; aparece: string; href: string; to: string; icone: typeof FileText; n: number | null };

function Integrados() {
  const [n, setN] = useState<Record<string, number>>({});
  useEffect(() => {
    const conta = (q: any) => q.then((r: any) => (r.count as number | null) ?? 0);
    const base = (t: string) => (bancoSite as any).from(t).select("id", { count: "exact", head: true });
    Promise.all([
      conta(base("sessoes").eq("ata_publicada", true).not("ata_url", "is", null)),
      conta(base("sessoes").not("pauta", "is", null)),
      (bancoSite as any).from("sessoes_votacoes").select("sessao_id").then((r: any) => new Set((r.data ?? []).map((v: any) => v.sessao_id)).size),
      conta(base("projetos_legislativos")),
      conta(base("vereadores").eq("ativo", true)),
    ]).then(([atas, pautas, votos, projetos, vereadores]) => setN({ atas, pautas, votos, projetos, vereadores }));
  }, []);
  const itens = useMemo<(Integrado & { unidade: string })[]>(() => [
    { rotulo: "Atas das Sessões", aparece: "atas publicadas", href: "/transparencia/documentos/atas-sessoes", to: "/admin/sessoes", icone: FileText, n: n.atas ?? null, unidade: "Sessões" },
    { rotulo: "Pauta das Sessões do Plenário", aparece: "pautas", href: "/transparencia/documentos/pauta-plenario", to: "/admin/sessoes", icone: CalendarDays, n: n.pautas ?? null, unidade: "Sessões" },
    { rotulo: "Lista das Votações Nominais", aparece: n.votos === 1 ? "sessão com votos" : "sessões com votos", href: "/transparencia/documentos/votacoes-nominais", to: "/admin/sessoes", icone: Vote, n: n.votos ?? null, unidade: "Sessões" },
    { rotulo: "Projetos de Leis e Atos", aparece: "projetos", href: "/transparencia/documentos/projetos-leis", to: "/admin/projetos", icone: Gavel, n: n.projetos ?? null, unidade: "Projetos" },
    { rotulo: "Composição da Casa", aparece: "vereadores ativos", href: "/transparencia/documentos/composicao-casa", to: "/admin/vereadores", icone: Users, n: n.vereadores ?? null, unidade: "Vereadores" },
  ], [n]);

  return (
    <section aria-labelledby="titulo-integrados" className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0" style={{ backgroundColor: "#0B7A4B" }}><CheckCircle2 className="w-5 h-5" aria-hidden /></span>
        <div>
          <h2 id="titulo-integrados" className="font-display font-bold text-lg text-foreground">Publicados automaticamente</h2>
          <p className="text-sm text-muted-foreground">Estes itens já aparecem na Transparência a partir do que é cadastrado no painel. Não precisa publicar de novo aqui.</p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 mt-4">
        {itens.map((i) => (
          <li key={i.href} className="rounded-xl border border-border p-3.5 flex flex-col">
            <i.icone className="w-5 h-5 text-muted-foreground" aria-hidden />
            <p className="font-semibold text-sm text-foreground mt-2 leading-snug flex-1">{i.rotulo}</p>
            <p className="text-sm text-muted-foreground mt-1"><span className="font-display font-bold text-xl text-foreground tabular-nums">{i.n ?? "–"}</span> {i.aparece}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs font-semibold">
              <Link to={i.to} className="inline-flex items-center gap-1 underline underline-offset-2 text-foreground">Cadastrar em {i.unidade} <ArrowRight className="w-3 h-3" aria-hidden /></Link>
              <a href={i.href} target="_blank" rel="noreferrer" className="underline underline-offset-2 text-muted-foreground">Ver no site</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BotaoImportar() {
  const [rodando, setRodando] = useState(false);
  const importar = async () => {
    setRodando(true);
    try {
      const r = await importarDoPortal();
      toast.success(r.publicacoes ? `${r.publicacoes} ${r.publicacoes === 1 ? "publicação importada" : "publicações importadas"}, com ${r.arquivos} ${r.arquivos === 1 ? "arquivo" : "arquivos"}.` : "Nada novo: o que está no portal já foi importado.", { duration: 8000 });
      if (r.publicacoes) window.setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível importar.", { duration: 10000 });
    }
    setRodando(false);
  };
  return (
    <button type="button" onClick={importar} disabled={rodando} className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 text-white transition disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
      {rodando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Import className="w-4 h-4" aria-hidden />} Importar do portal
    </button>
  );
}

const situacaoPublicacao = (r: Publicacao) => <Selo cor={r.publicado ? "#0B7A4B" : "#A8540F"}>{r.publicado ? "Publicado" : "Rascunho"}</Selo>;

function AdminPublicacoes() {
  return (
    <CrudPage<Publicacao>
      title="Publicações"
      table="legislativo_publicacoes"
      repositorio={repositorio}
      singular="publicação"
      feminino
      vazio="Nenhuma publicação cadastrada"
      antes={<Integrados />}
      acoesPagina={<BotaoImportar />}
      fields={fields}
      defaultValues={{ publicado: true, ano: new Date().getFullYear(), categoria: "legislacao-municipal", situacao: "Vigente" }}
      buscaEm={["titulo", "descricao", "numero", "tipo"]}
      indicadores={(ls) => [
        { rotulo: "Publicações", valor: ls.length },
        { rotulo: "Publicadas", valor: ls.filter((l) => l.publicado).length, cor: "#0B7A4B" },
        { rotulo: "Rascunhos", valor: ls.filter((l) => !l.publicado).length, cor: "#A8540F" },
        { rotulo: "Sem arquivo", valor: ls.filter((l) => !l.arquivo_url).length, cor: "#B42318", detalhe: "Sem PDF para baixar" },
      ]}
      filtros={[
        { campo: "categoria", rotulo: "Onde", opcoes: CATEGORIAS },
        { campo: "tipo", rotulo: "Tipo" },
        { campo: "ano", rotulo: "Ano", valor: (r) => (r.ano ? String(r.ano) : null) },
      ]}
      secoes={[
        { titulo: "Publicação", descricao: "Em qual item do Portal da Transparência este documento aparece.", campos: ["categoria", "titulo", "descricao"] },
        { titulo: "Dados do documento", campos: ["tipo", "situacao", "numero", "ano", "data_publicacao"] },
        { titulo: "Arquivo e publicação", campos: ["arquivo_url", "publicado"] },
      ]}
      cartao={{
        imagem: () => <span className="w-12 h-12 rounded-xl grid place-items-center text-white" style={{ backgroundColor: "var(--tema)" }}><Scale className="w-6 h-6" aria-hidden /></span>,
        titulo: (r) => r.titulo,
        subtitulo: (r) => [r.tipo, r.numero && `nº ${r.numero}`, r.ano].filter(Boolean).join(" ") || nomeCategoria(r.categoria),
        selo: situacaoPublicacao,
        texto: (r) => r.descricao,
        rodape: (r) => [nomeCategoria(r.categoria), r.arquivo_url ? "PDF anexado" : "Sem PDF"].join(" · "),
      }}
      previa={(f) => (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {f.tipo && <span className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: "var(--tema)" }}>{f.tipo}</span>}
            {f.numero && <span className="text-xs font-bold text-foreground">nº {f.numero}{f.ano ? `/${f.ano}` : ""}</span>}
          </div>
          <p className="font-display font-bold text-foreground leading-snug mt-2">{f.titulo || "Título da publicação"}</p>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-5">{f.descricao || "A descrição aparece aqui."}</p>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{nomeCategoria(String(f.categoria ?? ""))}{f.data_publicacao ? ` · ${dataBr(String(f.data_publicacao))}` : ""}</p>
          <p className="text-xs font-semibold mt-2" style={{ color: "var(--tema)" }}>{f.arquivo_url ? "Ver e baixar o documento →" : "Sem arquivo anexado"}</p>
          {!f.publicado && <p className="text-xs font-semibold mt-2 text-destructive">Rascunho: não aparece no site.</p>}
        </div>
      )}
      columns={[
        { key: "titulo", label: "Título" },
        { key: "categoria", label: "Onde", render: (r) => nomeCategoria(r.categoria) },
        { key: "numero", label: "Número", render: (r) => [r.numero, r.ano].filter(Boolean).join("/") || "—" },
        { key: "data_publicacao", label: "Publicação", render: (r) => dataBr(r.data_publicacao) || "—" },
        { key: "publicado", label: "Situação", render: situacaoPublicacao },
      ]}
    />
  );
}
