import { createFileRoute, Link } from "@tanstack/react-router";
import { CrudPage, type CrudTab } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { VereadorPhotoUploader } from "@/components/admin/VereadorPhotoUploader";
import { History, Images } from "lucide-react";

const tabs: CrudTab[] = [
  { id: "dados", label: "Dados", fieldNames: ["nome", "slug", "partido", "cargo", "legislatura", "comissoes", "biografia"] },
  { id: "contato", label: "Contato", fieldNames: ["email", "telefone", "gabinete"] },
  { id: "perfil", label: "Perfil", fieldNames: ["data_nascimento", "naturalidade", "escolaridade", "profissao"] },
  { id: "mandato", label: "Mandato", fieldNames: ["data_posse", "mandato_atual", "mandato_inicio", "mandato_fim"] },
  { id: "redes", label: "Redes sociais", fieldNames: ["redes_sociais"] },
];

export const Route = createFileRoute("/admin/vereadores/")({
  component: AdminVereadores,
});

type Vereador = {
  id: string;
  nome: string;
  partido: string | null;
  foto_url: string | null;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  gabinete: string | null;
  biografia: string | null;
  ativo: boolean;
  ordem: number | null;
  data_nascimento: string | null;
  data_posse: string | null;
  mandato_atual: string | null;
  mandato_inicio: string | null;
  mandato_fim: string | null;
  naturalidade: string | null;
  escolaridade: string | null;
  profissao: string | null;
  redes_sociais: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
};

function AdminVereadores() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-end">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/vereadores/mandatos">
            <History className="w-3.5 h-3.5 mr-1" /> Histórico de mandatos
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/vereadores/galeria">
            <Images className="w-3.5 h-3.5 mr-1" /> Galeria
          </Link>
        </Button>
      </div>
      <CrudPage<Vereador>
        title="Vereadores"
        description="Cadastro completo: dados, contato, redes sociais e mandato."
        table="vereadores"
        orderBy={{ column: "ordem", ascending: true }}
        defaultValues={{
          ativo: true,
          ordem: 0,
          mandato_atual: "2025–2028",
          redes_sociais: { instagram: "", facebook: "", twitter: "", youtube: "" },
        }}
        columns={[
          {
            key: "foto_url",
            label: "Foto",
            render: (r) => <VereadorAvatar nome={r.nome} foto={r.foto_url} size={40} />,
          },
          { key: "nome", label: "Nome" },
          { key: "partido", label: "Partido" },
          { key: "cargo", label: "Cargo" },
          { key: "mandato_atual", label: "Mandato" },
          {
            key: "ativo",
            label: "Status",
            render: (r) => (
              <Badge variant={r.ativo ? "default" : "secondary"}>
                {r.ativo ? "Ativo" : "Inativo"}
              </Badge>
            ),
          },
        ]}
        fields={[
          {
            name: "foto_url",
            label: "Foto do Vereador (crop + compressão automática)",
            type: "custom",
            renderCustom: (_row, form, setForm) => (
              <VereadorPhotoUploader
                nome={String(form.nome || "")}
                value={form.foto_url ?? null}
                onChange={(url) => setForm({ ...form, foto_url: url })}
              />
            ),
          },
          { name: "nome", label: "Nome completo", required: true },
          { name: "slug", label: "Slug (URL amigável)", placeholder: "ex: elessandro-amaral" },
          { name: "legislatura", label: "Legislatura", placeholder: "2025–2028" },
          { name: "comissoes", label: "Comissões", placeholder: "Ex: Comissão de Finanças, Comissão de Educação" },
          { name: "partido", label: "Partido", placeholder: "Ex: PSDB, PT, MDB" },
          { name: "cargo", label: "Cargo", placeholder: "Vereador / Presidente / Líder" },
          { name: "biografia", label: "Biografia", type: "textarea" },
          { name: "email", label: "E-mail", type: "email" },
          { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
          { name: "gabinete", label: "Gabinete" },
          { name: "data_posse", label: "Data de posse", type: "date" },
          { name: "mandato_atual", label: "Mandato atual", placeholder: "2025–2028" },
          { name: "mandato_inicio", label: "Início do mandato", type: "date" },
          { name: "mandato_fim", label: "Fim do mandato", type: "date" },
          { name: "data_nascimento", label: "Data de nascimento", type: "date" },
          { name: "naturalidade", label: "Naturalidade" },
          { name: "escolaridade", label: "Escolaridade" },
          { name: "profissao", label: "Profissão" },
          {
            name: "redes_sociais",
            label: "Redes Sociais",
            type: "custom",
            renderCustom: (_row, form, setForm) => {
              const redes = (form.redes_sociais as Vereador["redes_sociais"]) || {};
              const update = (key: string, val: string) =>
                setForm({ ...form, redes_sociais: { ...redes, [key]: val } });
              const fields: [keyof typeof redes, string, string][] = [
                ["instagram", "Instagram", "@perfil"],
                ["facebook", "Facebook", "link"],
                ["twitter", "Twitter / X", "link"],
                ["youtube", "YouTube", "link"],
              ];
              return (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {fields.map(([k, lbl, ph]) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-[10px] uppercase">{lbl}</Label>
                      <Input
                        placeholder={ph}
                        value={redes[k] || ""}
                        onChange={(e) => update(k, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              );
            },
          },
          { name: "ordem", label: "Ordem de exibição", type: "number" },
          { name: "ativo", label: "Ativo", type: "checkbox", placeholder: "Mostrar no site" },
        ]}
        tabs={tabs}
      />
    </div>
  );
}
