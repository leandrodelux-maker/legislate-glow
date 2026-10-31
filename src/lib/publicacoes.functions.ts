import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MUNICIPIO } from "@/config/municipio";

// O painel entra pelo login do banco do site; a escrita acontece no banco analítico.
// Por isso passa por aqui: a chave service_role fica só no servidor, e cada chamada confere se a pessoa é da equipe.

const TABELA = "legislativo_publicacoes";
const BALDE = "site";
const PORTAL = MUNICIPIO.portal;
const TIPO_DOCUMENTOS = "DOCUMENTO_PORTAL_DA_TRANSPARENCIA";

export const CATEGORIAS = ["legislacao-municipal", "outras-publicacoes", "atividades-legislativas", "pauta-comissoes", "leis-atos-infralegais"] as const;

const esquemaPublicacao = z.object({
  categoria: z.enum(CATEGORIAS),
  tipo: z.string().trim().max(80).nullish(),
  numero: z.string().trim().max(40).nullish(),
  ano: z.number().int().min(1900).max(2100).nullish(),
  titulo: z.string().trim().min(2).max(300),
  descricao: z.string().trim().max(5000).nullish(),
  situacao: z.string().trim().max(60).nullish(),
  data_publicacao: z.string().regex(/^\d{4}-\d{2}-\d{2}/).nullish(),
  arquivo_url: z.string().url().max(2000).nullish(),
  publicado: z.boolean().optional(),
});

export async function bancoAnalitico() {
  const url = process.env.TRANSPARENCIA_SUPABASE_URL || process.env.VITE_TRANSPARENCIA_SUPABASE_URL || (import.meta.env.VITE_TRANSPARENCIA_SUPABASE_URL as string | undefined);
  const chave = process.env.TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Falta configurar no servidor a chave TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY do banco analítico.");
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false, storageKey: "transparencia-servidor" } });
}

/** Só administradores e editores gravam, a mesma regra do painel. */
export async function exigirEquipe(context: { supabase: any; userId: string }) {
  const { data: papeis } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  const temPapel = (papeis ?? []).some((p: { role: string }) => p.role === "admin" || p.role === "editor");
  if (!temPapel) throw new Error("Sua conta não tem permissão para esta ação.");
}

const traduzir = (error: { code?: string; message?: string }) =>
  error.code === "42P01" || error.code === "PGRST205" || /legislativo_publicacoes/.test(error.message ?? "")
    ? "A tabela de publicações ainda não existe: rode banco-transparencia/migrations/006_publicacoes.sql no banco analítico."
    : (error.message ?? "Falha no banco analítico.");

export const listarPublicacoes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const { data, error } = await banco.from(TABELA).select("*").order("ano", { ascending: false, nullsFirst: false }).order("data_publicacao", { ascending: false, nullsFirst: false });
    if (error) throw new Error(traduzir(error));
    return JSON.parse(JSON.stringify(data ?? [])) as Record<string, string | number | boolean | null>[];
  });

export const salvarPublicacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; dados: unknown }) => ({
    id: d.id ? z.string().uuid().parse(d.id) : null,
    dados: esquemaPublicacao.parse(d.dados),
  }))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const registro = { ...data.dados, atualizado_por: context.userId };
    const { error } = data.id ? await banco.from(TABELA).update(registro).eq("id", data.id) : await banco.from(TABELA).insert(registro);
    if (error) throw new Error(traduzir(error));
    return { ok: true };
  });

export const excluirPublicacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const { error } = await banco.from(TABELA).delete().eq("id", data.id);
    if (error) throw new Error(traduzir(error));
    return { ok: true };
  });

/** O PDF vai do navegador direto para o armazenamento, com uma autorização de uso único. */
export const autorizarEnvio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string }) => ({ nome: z.string().regex(/^[a-z0-9-]{1,80}$/).parse(d.nome) }))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const caminho = `publicacoes/${Date.now()}-${data.nome}.pdf`;
    const { data: envio, error } = await banco.storage.from(BALDE).createSignedUploadUrl(caminho);
    if (error || !envio) throw new Error(error?.message ?? "Não foi possível autorizar o envio.");
    return { caminho, token: envio.token, url: banco.storage.from(BALDE).getPublicUrl(caminho).data.publicUrl };
  });

/** Traz de uma vez o que já está publicado no Megasoft, com os PDFs, para o portal não depender mais dele. */
export const importarDoPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const cabecalho = { "cliente-integrado": "megasoft-portal-da-transparencia", Referer: `${PORTAL}/` };
    const json = async (caminho: string, token?: string) => {
      const r = await fetch(`${PORTAL}/api/${caminho}`, { headers: { ...cabecalho, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      if (!r.ok) throw new Error(`O portal respondeu ${r.status}.`);
      return r.json();
    };
    const { tokenPortal } = await json("configuracao/carregamento-inicial");
    const total = { publicacoes: 0, arquivos: 0, semArquivo: 0 };

    for (const categoria of ["legislacao-municipal", "outras-publicacoes"] as const) {
      const lista = await json(`legislacao-e-publicacoes/${categoria}/paginado?pagina=1&tamanhoDaPagina=500`, tokenPortal);
      for (const item of lista.registros ?? []) {
        const codigo = Number(item.codigoDoDocumento);
        // Já importado: não duplica nem sobrescreve o que a equipe tenha editado.
        const { data: existente, error: erroBusca } = await banco.from(TABELA).select("id").eq("categoria", categoria).eq("origem_portal", codigo).maybeSingle();
        if (erroBusca) throw new Error(traduzir(erroBusca));
        if (existente) continue;

        let arquivo_url: string | null = null;
        const anexos = await json(`gestao-eletronica-de-documentos/?tabela=${TIPO_DOCUMENTOS}&codigoDoRegistro=${codigo}&pagina=1&tamanhoDaPagina=20`, tokenPortal).catch(() => null);
        const anexo = (anexos?.registros ?? anexos?.lista ?? [])[0];
        if (anexo?.codigo) {
          const r = await fetch(`${PORTAL}/api/gestao-eletronica-de-documentos/baixar-documento/${anexo.codigo}`, { headers: { ...cabecalho, Authorization: `Bearer ${tokenPortal}` } });
          if (r.ok) {
            const caminho = `publicacoes/portal-${categoria}-${codigo}.pdf`;
            const { error: erroEnvio } = await banco.storage.from(BALDE).upload(caminho, await r.arrayBuffer(), { contentType: r.headers.get("content-type") ?? "application/pdf", upsert: true });
            if (!erroEnvio) {
              arquivo_url = banco.storage.from(BALDE).getPublicUrl(caminho).data.publicUrl;
              total.arquivos++;
            }
          }
        }
        if (!arquivo_url) total.semArquivo++;

        const [dia, mes, ano] = String(item.dataDaPublicacao ?? "").split("/");
        const { error } = await banco.from(TABELA).insert({
          categoria,
          origem_portal: codigo,
          tipo: item.tipoDoDocumento ?? null,
          numero: item.numeroDoDocumento ?? null,
          ano: item.ano ?? null,
          titulo: item.nomeDoDocumento || `${item.tipoDoDocumento ?? "Documento"} ${item.numeroDoDocumento ?? codigo}`,
          descricao: String(item.descricao ?? "").replace(/^[\s-]+/, "") || null,
          situacao: item.situacao ?? null,
          data_publicacao: ano ? `${ano}-${mes}-${dia}` : null,
          arquivo_url,
          publicado: true,
          atualizado_por: context.userId,
        });
        if (error) throw new Error(traduzir(error));
        total.publicacoes++;
      }
    }
    return total;
  });
