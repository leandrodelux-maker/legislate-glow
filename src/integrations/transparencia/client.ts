import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Banco analítico da Transparência: separado do banco do site, recebe a cópia do Portal Megasoft pelo GitHub Actions.
// Só leitura pela chave pública. Sem as variáveis as páginas abrem, mas as listas ficam vazias.
const URL = import.meta.env.VITE_TRANSPARENCIA_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_TRANSPARENCIA_SUPABASE_ANON_KEY as string | undefined;

const opcoes = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "transparencia-auth" } };

export const bancoConfigurado = Boolean(URL && ANON_KEY);
export const supabase = createClient<Database>(URL || "http://localhost:54321", ANON_KEY || "sem-banco", opcoes);
export const transparenciaDb: SupabaseClient | null = bancoConfigurado ? (supabase as unknown as SupabaseClient) : null;
