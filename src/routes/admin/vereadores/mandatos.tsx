import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CrudPage } from "@/components/admin/crud-page";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/vereadores/mandatos")({
  component: AdminMandatos,
});

type Mandato = {
  id: string;
  vereador_id: string;
  mandato: string;
  cargo_mesa: string | null;
  partido: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  observacoes: string | null;
};

function AdminMandatos() {
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
    <CrudPage<Mandato>
      title="Histórico de Mandatos"
      description="Registre todos os mandatos passados e atuais de cada vereador."
      table="vereadores_mandatos"
      orderBy={{ column: "data_inicio", ascending: false }}
      columns={[
        {
          key: "vereador_id",
          label: "Vereador",
          render: (r) => vereadores.find((v) => v.value === r.vereador_id)?.label ?? "—",
        },
        { key: "mandato", label: "Mandato" },
        { key: "cargo_mesa", label: "Cargo Mesa" },
        { key: "partido", label: "Partido" },
        { key: "data_inicio", label: "Início" },
        { key: "data_fim", label: "Fim" },
      ]}
      fields={[
        {
          name: "vereador_id",
          label: "Vereador",
          type: "select",
          required: true,
          options: vereadores,
        },
        { name: "mandato", label: "Mandato (ex: 2021–2024)", required: true },
        {
          name: "cargo_mesa",
          label: "Cargo na Mesa",
          type: "select",
          options: [
            { label: "—", value: "" },
            { label: "Presidente", value: "presidente" },
            { label: "Vice-presidente", value: "vice_presidente" },
            { label: "1º Secretário", value: "primeiro_secretario" },
            { label: "2º Secretário", value: "segundo_secretario" },
            { label: "Vereador", value: "vereador" },
          ],
        },
        { name: "partido", label: "Partido" },
        { name: "data_inicio", label: "Data de início", type: "date" },
        { name: "data_fim", label: "Data de fim", type: "date" },
        { name: "observacoes", label: "Observações", type: "textarea" },
      ]}
    />
  );
}
