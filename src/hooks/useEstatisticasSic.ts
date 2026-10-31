import { useEffect, useState } from "react";
import { supabase } from "@/integrations/transparencia/client";
import type { TotaisAno } from "@/lib/atendimento";

// Totais dos pedidos feitos neste site, por ano. null enquanto carrega; vazio se a função não responder.
export function useEstatisticasSic() {
  const [anos, setAnos] = useState<TotaisAno[] | null>(null);
  useEffect(() => {
    (supabase as any).rpc("estatisticas_sic").then(({ data }: { data: TotaisAno[] | null }) => setAnos(data ?? []));
  }, []);
  return anos;
}
