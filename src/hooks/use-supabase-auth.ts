import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Fora do evento, para evitar travamento do cliente. `loading` só termina com o papel conhecido,
      // senão quem é administrador vê "Acesso restrito" por um instante.
      setTimeout(async () => {
        const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
        if (!ativo) return;
        // Falha temporária ao renovar a sessão não derruba quem já estava no painel.
        if (!error) setIsAdmin((data ?? []).some((r) => r.role === "admin" || r.role === "editor"));
        setLoading(false);
      }, 0);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
}
