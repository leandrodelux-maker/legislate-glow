import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CrudPage } from "@/components/admin/crud-page";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/vereadores/galeria")({
  component: AdminGaleria,
});

type Item = {
  id: string;
  vereador_id: string;
  url: string;
  legenda: string | null;
  ordem: number | null;
};

function AdminGaleria() {
  const [vereadores, setVereadores] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    supabase
      .from("vereadores")
      .select("id, nome")
      .order("nome")
      .then(({ data }) => {
        setVereadores((data || []).map((v) => ({ label: v.nome, value: v.id })));
      });
  }, []);

  return (
    <CrudPage<Item>
      title="Galeria de Imagens"
      description="Banco de imagens vinculadas a cada vereador."
      table="vereadores_galeria"
      orderBy={{ column: "created_at", ascending: false }}
      defaultValues={{ ordem: 0 }}
      columns={[
        {
          key: "url",
          label: "Imagem",
          render: (r) => (
            <img
              src={r.url}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-slate-200"
              onError={(e) => {
                console.error("[galeria] falha ao carregar", r.url);
                (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
              }}
            />
          ),
        },
        {
          key: "vereador_id",
          label: "Vereador",
          render: (r) => vereadores.find((v) => v.value === r.vereador_id)?.label ?? "—",
        },
        { key: "legenda", label: "Legenda" },
        { key: "ordem", label: "Ordem" },
      ]}
      fields={[
        {
          name: "vereador_id",
          label: "Vereador",
          type: "select",
          required: true,
          options: vereadores,
        },
        { name: "url", label: "Imagem", type: "file", required: true },
        { name: "legenda", label: "Legenda" },
        { name: "ordem", label: "Ordem", type: "number" },
      ]}
    />
  );
}
