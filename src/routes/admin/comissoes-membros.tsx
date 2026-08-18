import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage, type ColumnDef, type FieldDef } from "@/components/admin/crud-page";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/comissoes-membros")({
  component: AdminComissoesMembros,
});

type MembroRow = {
  id: string;
  comissao_id: string;
  vereador_id: string | null;
  nome: string;
  funcao: string;
  ordem: number;
};

function AdminComissoesMembros() {
  const [comissoes, setComissoes] = useState<{ id: string; sigla: string; nome: string }[]>([]);
  const [vereadores, setVereadores] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, v] = await Promise.all([
        (supabase as any).from("comissoes").select("id, sigla, nome").order("ordem"),
        supabase.from("vereadores").select("id, nome").eq("ativo", true).order("nome"),
      ]);
      setComissoes(c.data || []);
      setVereadores(v.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fields: FieldDef[] = [
    {
      name: "comissao_id",
      label: "Comissão",
      type: "select",
      required: true,
      options: comissoes.map((c) => ({ label: `${c.sigla} — ${c.nome}`, value: c.id })),
    },
    {
      name: "vereador_id",
      label: "Vereador (vincula foto e perfil)",
      type: "select",
      options: vereadores.map((v) => ({ label: v.nome, value: v.id })),
    },
    { name: "nome", label: "Nome exibido", required: true },
    { name: "funcao", label: "Função", required: true, placeholder: "Presidente, Vice-Presidente, Relator" },
    { name: "ordem", label: "Ordem", type: "number" },
  ];

  const columns: ColumnDef<MembroRow>[] = [
    {
      key: "comissao_id",
      label: "Comissão",
      render: (r) => comissoes.find((c) => c.id === r.comissao_id)?.sigla ?? "—",
    },
    { key: "nome", label: "Nome" },
    { key: "funcao", label: "Função" },
    { key: "ordem", label: "Ordem" },
  ];

  return (
    <CrudPage<MembroRow>
      title="Membros das Comissões"
      description="Composição de cada comissão permanente exibida no site."
      table="comissoes_membros"
      columns={columns}
      fields={fields}
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ ordem: 1 } as Partial<MembroRow>}
    />
  );
}
