import { supabase as bancoSite } from "@/integrations/supabase/client";
import { supabase as bancoAnalitico } from "@/integrations/transparencia/client";

// Itens da Transparência que não vêm mais do Megasoft. As páginas continuam iguais: recebem as mesmas colunas
// de sempre, mas os dados vêm do que a equipe publica no painel do site.
//   Banco do site (uma só fonte, sem cópia): atas, pautas, votos, projetos e composição da Casa.
//   Banco analítico (tela Publicações do painel): legislação, outras publicações, atividades, pauta das comissões e atos.

type Linha = Record<string, string> & { _chave: string };
type Detalhe = { listas: Record<string, Record<string, unknown>[]>; texto?: string; link?: { rotulo: string; href: string } };
type Fonte = { linhas: () => Promise<Linha[]>; detalhe: (chave: string) => Promise<Detalhe> };

const dataBr = (d: string | null | undefined) => (d ? new Date(d.length === 10 ? `${d}T12:00:00` : d).toLocaleDateString("pt-BR") : "");
const ETAPAS: Record<string, string> = { protocolado: "Protocolado", comissao: "Em comissão", plenario: "Em plenário", aprovado: "Aprovado", sancionado: "Sancionado", arquivado: "Arquivado", rejeitado: "Rejeitado" };
const VOTOS: Record<string, string> = { sim: "Sim", nao: "Não", abstencao: "Abstenção" };

const arquivoDe = (nome: string, url: string | null | undefined, codigo: string) => (url ? [{ codigo, nome: `${nome}.pdf`, extensao: "pdf", url }] : []);

const consultar = async <T,>(q: PromiseLike<{ data: unknown; error: { message: string } | null }>) => {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
};

// ---------- Publicações do painel (banco analítico) ----------
type Publicacao = { id: string; tipo: string | null; numero: string | null; ano: number | null; titulo: string; descricao: string | null; situacao: string | null; data_publicacao: string | null; arquivo_url: string | null };

const publicacoes = (categoria: string): Fonte => ({
  linhas: async () => {
    // Enquanto a tabela não existe no banco analítico, a página abre vazia em vez de falhar.
    const ls = await consultar<Publicacao>(
      (bancoAnalitico as any).from("legislativo_publicacoes").select("*").eq("categoria", categoria).order("ano", { ascending: false, nullsFirst: false }).order("data_publicacao", { ascending: false, nullsFirst: false }),
    ).catch(() => [] as Publicacao[]);
    return ls.map((p) => ({
      _chave: p.id,
      Tipo: p.tipo ?? "",
      Número: p.numero ?? "",
      Ano: p.ano ? String(p.ano) : "",
      Documento: p.titulo,
      Descrição: p.descricao ?? "",
      Publicação: dataBr(p.data_publicacao),
      Situação: p.situacao ?? "",
    }));
  },
  detalhe: async (chave) => {
    const [p] = await consultar<Publicacao>((bancoAnalitico as any).from("legislativo_publicacoes").select("*").eq("id", chave));
    return { listas: { arquivos: arquivoDe(p?.titulo ?? "Documento", p?.arquivo_url, chave) } };
  },
});

// ---------- Sessões (banco do site) ----------
type Sessao = { id: string; titulo: string; tipo: string | null; data_sessao: string; local: string | null; pauta: string | null; ata_url: string | null };
const CAMPOS_SESSAO = "id,titulo,tipo,data_sessao,local,pauta,ata_url";

const linhaDaSessao = (s: Sessao, descricao?: string): Linha => ({
  _chave: s.id,
  Número: "",
  Ano: String(new Date(s.data_sessao).getFullYear()),
  Documento: s.titulo,
  Descrição: descricao ?? [s.tipo, dataBr(s.data_sessao), s.local].filter(Boolean).join(" · "),
  Publicação: dataBr(s.data_sessao),
  Tipo: s.tipo ?? "",
  Situação: "",
});

const nomesVereadores = async () => new Map((await consultar<{ id: string; nome: string }>(bancoSite.from("vereadores").select("id,nome"))).map((v) => [v.id, v.nome]));

const atas: Fonte = {
  linhas: async () => (await consultar<Sessao>(bancoSite.from("sessoes").select(CAMPOS_SESSAO).eq("ata_publicada", true).not("ata_url", "is", null).order("data_sessao", { ascending: false }))).map((s) => linhaDaSessao(s)),
  detalhe: async (chave) => {
    const [[s], presencas, vereadores] = await Promise.all([
      consultar<Sessao>(bancoSite.from("sessoes").select(CAMPOS_SESSAO).eq("id", chave)),
      consultar<{ vereador_id: string; presente: boolean }>(bancoSite.from("sessoes_presencas").select("vereador_id,presente").eq("sessao_id", chave)),
      consultar<{ id: string; nome: string; mandato_inicio: string | null }>(bancoSite.from("vereadores").select("id,nome,mandato_inicio")),
    ]);
    return {
      listas: {
        arquivos: arquivoDe(`Ata - ${s?.titulo ?? "sessão"}`, s?.ata_url, chave),
        // Antes do início do mandato a pessoa não era vereadora: isso não é ausência.
        presencas: presencas
          .map((p) => ({ v: vereadores.find((x) => x.id === p.vereador_id), presente: p.presente }))
          .filter(({ v }) => v && (!v.mandato_inicio || !s || s.data_sessao.slice(0, 10) >= v.mandato_inicio))
          .map(({ v, presente }) => ({ nome: v!.nome, presente }))
          .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
      },
    };
  },
};

const pautas: Fonte = {
  linhas: async () => (await consultar<Sessao>(bancoSite.from("sessoes").select(CAMPOS_SESSAO).not("pauta", "is", null).order("data_sessao", { ascending: false }))).map((s) => linhaDaSessao(s, s.pauta ?? "")),
  detalhe: async (chave) => {
    const [s] = await consultar<Sessao>(bancoSite.from("sessoes").select(CAMPOS_SESSAO).eq("id", chave));
    return { listas: {}, texto: s?.pauta ?? "" };
  },
};

type Voto = { sessao_id: string; vereador_id: string; voto: string; created_at: string };
/** Um voto por vereador em cada sessão: vale o mais recente. */
const votosValidos = (votos: Voto[]) => {
  const unicos = new Map<string, Voto>();
  for (const v of [...votos].sort((a, b) => a.created_at.localeCompare(b.created_at))) unicos.set(`${v.sessao_id}|${v.vereador_id}`, v);
  return [...unicos.values()];
};

const votacoes: Fonte = {
  linhas: async () => {
    const votos = votosValidos(await consultar<Voto>(bancoSite.from("sessoes_votacoes").select("sessao_id,vereador_id,voto,created_at")));
    const ids = [...new Set(votos.map((v) => v.sessao_id))];
    if (!ids.length) return [];
    const sessoes = await consultar<Sessao>(bancoSite.from("sessoes").select(CAMPOS_SESSAO).in("id", ids).order("data_sessao", { ascending: false }));
    return sessoes.map((s) => {
      const daSessao = votos.filter((v) => v.sessao_id === s.id);
      return linhaDaSessao(s, Object.entries(VOTOS).map(([k, r]) => `${r}: ${daSessao.filter((v) => v.voto === k).length}`).join(" · "));
    });
  },
  detalhe: async (chave) => {
    const [votos, nomes] = await Promise.all([consultar<Voto>(bancoSite.from("sessoes_votacoes").select("sessao_id,vereador_id,voto,created_at").eq("sessao_id", chave)), nomesVereadores()]);
    return { listas: { votos: votosValidos(votos).map((v) => ({ nome: nomes.get(v.vereador_id) ?? "Vereador", voto: v.voto, rotulo: VOTOS[v.voto] ?? v.voto })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) } };
  },
};

// ---------- Projetos e composição (banco do site) ----------
type Projeto = { id: string; tipo: string; numero: string; ano: number; ementa: string; status: string; data_apresentacao: string | null; documento_url: string | null; tramitacao: string | null };

const projetos: Fonte = {
  linhas: async () =>
    (await consultar<Projeto>(bancoSite.from("projetos_legislativos").select("id,tipo,numero,ano,ementa,status,data_apresentacao,documento_url,tramitacao").order("ano", { ascending: false }).order("numero", { ascending: false }))).map((p) => ({
      _chave: p.id,
      Número: p.numero,
      Ano: String(p.ano),
      Documento: p.tipo,
      Descrição: p.ementa,
      Publicação: dataBr(p.data_apresentacao),
      Tipo: p.tipo,
      Situação: ETAPAS[p.status] ?? p.status,
    })),
  detalhe: async (chave) => {
    const [p] = await consultar<Projeto>(bancoSite.from("projetos_legislativos").select("tipo,numero,ano,documento_url,tramitacao").eq("id", chave));
    return { listas: { arquivos: arquivoDe(`${p?.tipo ?? "Projeto"} ${p?.numero ?? ""}-${p?.ano ?? ""}`, p?.documento_url, chave) }, texto: p?.tramitacao ?? "" };
  },
};

type Vereador = { id: string; nome: string; partido: string | null; cargo: string | null; foto_url: string | null; slug: string | null; mandato_atual: string | null };

const composicao: Fonte = {
  linhas: async () =>
    (await consultar<Vereador>(bancoSite.from("vereadores").select("id,nome,partido,cargo,foto_url,slug,mandato_atual").eq("ativo", true).order("ordem"))).map((v) => ({
      _chave: v.id,
      _foto: v.foto_url ?? "",
      Número: "",
      Ano: "",
      Documento: v.nome,
      Descrição: [v.partido, v.mandato_atual ? `Mandato ${v.mandato_atual}` : ""].filter(Boolean).join(" · "),
      Tipo: v.cargo ?? "Vereador",
      Situação: "",
    })),
  detalhe: async (chave) => {
    const [v] = await consultar<Vereador>(bancoSite.from("vereadores").select("slug").eq("id", chave));
    return { listas: {}, link: v?.slug ? { rotulo: "Ver o perfil completo", href: `/vereadores/${v.slug}` } : undefined };
  },
};

const FONTES: Record<string, Fonte> = {
  "legislacao-municipal": publicacoes("legislacao-municipal"),
  "outras-publicacoes": publicacoes("outras-publicacoes"),
  "atividades-legislativas": publicacoes("atividades-legislativas"),
  "pauta-comissoes": publicacoes("pauta-comissoes"),
  "leis-atos-infralegais": publicacoes("leis-atos-infralegais"),
  "atas-sessoes": atas,
  "pauta-plenario": pautas,
  "votacoes-nominais": votacoes,
  "projetos-leis": projetos,
  "composicao-casa": composicao,
};

export const temFonteLocal = (conjunto: string) => conjunto in FONTES || conjunto.replace(/-detalhe$/, "") in FONTES;

export const lerConjuntoLocal = async (conjunto: string) => ({ data: await FONTES[conjunto].linhas(), atualizadoEm: null as string | null });

export async function lerRegistroLocal(conjunto: string, chave: string) {
  if (conjunto.endsWith("-detalhe")) return FONTES[conjunto.replace(/-detalhe$/, "")].detalhe(chave);
  return (await FONTES[conjunto].linhas()).find((l) => l._chave === chave) ?? null;
}
