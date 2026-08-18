import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, FieldDef } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/mesa-diretora")({
  component: AdminMesaDiretora,
});

type MesaMember = {
  id: string;
  vereador_id: string;
  cargo: string;
  ativo: boolean;
  ordem: number;
};

type Vereador = { id: string; nome: string };

function AdminMesaDiretora() {
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("vereadores").select("id, nome").eq("ativo", true).order("nome");
      setVereadores(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fields: FieldDef[] = [
    {
      name: "vereador_id",
      label: "Vereador",
      type: "select",
      required: true,
      options: vereadores.map((v) => ({ label: v.nome, value: v.id })),
    },
    { name: "cargo", label: "Cargo na Mesa", required: true, placeholder: "Ex: Presidente, 1º Secretário..." },
    { name: "ordem", label: "Ordem de exibição", type: "number" },
    { name: "ativo", label: "Ativo", type: "checkbox" },
  ];

  return (
    <CrudPage<MesaMember>
      title="Mesa Diretora"
      description="Gerencie os membros da Mesa Diretora exibidos na página inicial."
      table="mesa_diretora"
      orderBy={{ column: "ordem", ascending: true }}
      defaultValues={{ ativo: true, ordem: 0 }}
      columns={[
        { key: "vereador_id", label: "Vereador", render: (r) => vereadores.find((v) => v.id === r.vereador_id)?.nome || "—" },
        { key: "cargo", label: "Cargo" },
        { key: "ordem", label: "Ordem" },
        { key: "ativo", label: "Status", render: (r) => <Badge variant={r.ativo ? "default" : "secondary"}>{r.ativo ? "Ativo" : "Inativo"}</Badge> },
      ]}
      fields={fields}
    />
  );
}
