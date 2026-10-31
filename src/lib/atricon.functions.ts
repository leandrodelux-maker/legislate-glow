import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bancoAnalitico, exigirEquipe } from "@/lib/publicacoes.functions";

// Matriz Atricon: fica no banco analítico e é editada no painel, pela mesma regra das Publicações.

const TABELA = "atricon_itens";
const CHAVE_CONFIG = "atricon_matriz";

const urlValida = z.string().trim().max(2000).regex(/^(https?:\/\/|\/)/, "O link deve começar com / ou http");

const esquemaItem = z.object({
  grupo: z.string().trim().min(2).max(120),
  grupo_ordem: z.number().int().min(0).max(999),
  numero: z.string().trim().regex(/^\d{1,3}(\.\d{1,3})?$/),
  pergunta: z.string().trim().min(5).max(1000),
  base_legal: z.string().trim().max(500).nullish(),
  classificacao: z.enum(["Essencial", "Obrigatório", "Recomendado"]),
  links: z.array(z.object({ rotulo: z.string().trim().max(80).nullish(), url: urlValida })).max(8).nullish(),
  ordem: z.number().int().min(0).max(999).nullish(),
  ativo: z.boolean().optional(),
});

const traduzir = (error: { code?: string; message?: string }) =>
  error.code === "42703" || /classificacao|links/.test(error.message ?? "")
    ? "A matriz ainda não foi preparada: rode banco-transparencia/migrations/007_matriz_atricon.sql no banco analítico."
    : error.code === "23505"
      ? "Já existe um critério com esse número."
      : (error.message ?? "Falha no banco analítico.");

export const listarMatriz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const { data, error } = await banco.from(TABELA).select("id,grupo,grupo_ordem,numero,pergunta,base_legal,classificacao,links,ordem,ativo").order("grupo_ordem").order("ordem");
    if (error) throw new Error(traduzir(error));
    return JSON.stringify(data ?? []);
  });

export const salvarCriterio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; dados: unknown }) => ({
    id: d.id ? z.string().uuid().parse(d.id) : null,
    dados: JSON.stringify(esquemaItem.parse(d.dados)),
  }))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const registro = JSON.parse(data.dados);
    const { error } = data.id ? await banco.from(TABELA).update(registro).eq("id", data.id) : await banco.from(TABELA).insert(registro);
    if (error) throw new Error(traduzir(error));
    return { ok: true };
  });

export const excluirCriterio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const { error } = await banco.from(TABELA).delete().eq("id", data.id);
    if (error) throw new Error(traduzir(error));
    return { ok: true };
  });

export const salvarConfigMatriz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { avaliacao: string; radar_url: string }) => ({
    avaliacao: z.string().trim().regex(/^\d{4}$/, "Informe o ano com 4 dígitos.").parse(d.avaliacao),
    radar_url: z.string().trim().url("Informe um link válido.").regex(/^https?:\/\//).parse(d.radar_url),
  }))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const banco = await bancoAnalitico();
    const { error } = await banco.from("configuracoes").upsert({ chave: CHAVE_CONFIG, valor: data }, { onConflict: "chave" });
    if (error) throw new Error(traduzir(error));
    return { ok: true };
  });
