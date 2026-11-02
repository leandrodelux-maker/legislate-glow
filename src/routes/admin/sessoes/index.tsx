import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X as XIcon, UserCheck, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/sessoes/")({
  component: AdminSessoes,
});

type Sessao = {
  id: string;
  titulo: string;
  tipo: string | null;
  data_sessao: string;
  local: string | null;
  status: string;
  qtd_pautas: number;
  qtd_presencas: number;
  qtd_votacoes: number;
  ata_publicada: boolean;
};

function AdminSessoes() {
  const [vereadores, setVereadores] = useState<any[]>([]);

  useEffect(() => {
    const fetchVereadores = async () => {
      const { data } = await supabase.from("vereadores").select("id, nome").eq("ativo", true).order("nome");
      if (data) setVereadores(data);
    };
    fetchVereadores();
  }, []);

  const PresencaManager = ({ sessaoId }: { sessaoId: string }) => {
    const [presencas, setPresencas] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchPresencas = async () => {
        const { data } = await supabase.from("sessoes_presencas").select("*").eq("sessao_id", sessaoId);
        if (data) {
          const map: Record<string, boolean> = {};
          data.forEach((p: any) => map[p.vereador_id] = p.presente);
          setPresencas(map);
        }
        setLoading(false);
      };
      fetchPresencas();
    }, [sessaoId]);

    const togglePresenca = async (vereadorId: string, isPresent: boolean) => {
      const { error } = await supabase.from("sessoes_presencas").upsert({
        sessao_id: sessaoId,
        vereador_id: vereadorId,
        presente: isPresent
      }, { onConflict: 'sessao_id,vereador_id' });

      if (error) toast.error("Erro ao salvar presença");
      else {
        setPresencas(prev => ({ ...prev, [vereadorId]: isPresent }));
        toast.success("Presença atualizada");
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <UserCheck className="w-4 h-4" aria-hidden /> Presença
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Lista de presença</DialogTitle>
            <DialogDescription>Marque quem esteve presente. Cada clique já fica salvo e alimenta o perfil do vereador e o Ranking.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {vereadores.map(v => (
              <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-2.5 pl-3.5">
                <span className="min-w-0 font-medium">{v.nome}</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={presencas[v.id] === true ? "default" : "outline"}
                    className={`h-10 gap-1.5 ${presencas[v.id] === true ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    aria-pressed={presencas[v.id] === true}
                    onClick={() => togglePresenca(v.id, true)}
                  >
                    <Check className="w-4 h-4" aria-hidden /> Presente
                  </Button>
                  <Button 
                    size="sm" 
                    variant={presencas[v.id] === false ? "destructive" : "outline"}
                    className="h-10 gap-1.5"
                    aria-pressed={presencas[v.id] === false}
                    onClick={() => togglePresenca(v.id, false)}
                  >
                    <XIcon className="w-4 h-4" aria-hidden /> Faltou
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const VotacaoManager = ({ sessaoId }: { sessaoId: string }) => {
    const [votos, setVotos] = useState<Record<string, string>>({});

    useEffect(() => {
      const fetchVotos = async () => {
        const { data } = await supabase.from("sessoes_votacoes").select("*").eq("sessao_id", sessaoId);
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((v: any) => map[v.vereador_id] = v.voto);
          setVotos(map);
        }
      };
      fetchVotos();
    }, [sessaoId]);

    const handleVoto = async (vereadorId: string, voto: string) => {
      const { error } = await supabase.from("sessoes_votacoes").upsert({
        sessao_id: sessaoId,
        vereador_id: vereadorId,
        voto: voto
      }, { onConflict: 'sessao_id,vereador_id,materia_id' });

      if (error) toast.error("Erro ao salvar voto");
      else {
        setVotos(prev => ({ ...prev, [vereadorId]: voto }));
        toast.success("Voto registrado");
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Vote className="w-4 h-4" aria-hidden /> Votos
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Votos da sessão</DialogTitle>
            <DialogDescription>Escolha o voto de cada vereador. Cada escolha já fica salva e aparece nas Votações Nominais da Transparência.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {vereadores.map(v => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                <span className="font-medium">{v.nome}</span>
                <RadioGroup 
                  value={votos[v.id]} 
                  onValueChange={(val) => handleVoto(v.id, val)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id={`sim-${v.id}`} />
                    <Label htmlFor={`sim-${v.id}`} className="text-emerald-700 font-semibold text-sm">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id={`nao-${v.id}`} />
                    <Label htmlFor={`nao-${v.id}`} className="text-red-700 font-semibold text-sm">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="abstencao" id={`abst-${v.id}`} />
                    <Label htmlFor={`abst-${v.id}`} className="text-muted-foreground font-semibold text-sm">Abstenção</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <CrudPage<Sessao>
      title="Sessões"
      description="Agenda, pauta, ata, presença e votos de cada sessão plenária."
      table="sessoes"
      orderBy={{ column: "data_sessao", ascending: false }}
      defaultValues={{ status: "agendada" }}
      indicadores={(rows) => {
        const agora = Date.now();
        return [
          { rotulo: "Agendadas", valor: rows.filter((r) => r.status === "agendada" && new Date(r.data_sessao).getTime() >= agora).length },
          { rotulo: "Realizadas", valor: rows.filter((r) => r.status === "realizada").length },
          { rotulo: "Sem ata publicada", valor: rows.filter((r) => r.status === "realizada" && !r.ata_publicada).length },
          { rotulo: "Total", valor: rows.length },
        ];
      }}
      columns={[
        { key: "titulo", label: "Título" },
        { key: "tipo", label: "Tipo" },
        {
          key: "data_sessao",
          label: "Data",
          render: (r) => new Date(r.data_sessao).toLocaleString("pt-BR"),
        },
        {
          key: "status",
          label: "Situação",
          render: (r) => <Badge variant={r.status === "agendada" ? "default" : r.status === "cancelada" ? "destructive" : "secondary"} className="capitalize">{r.status}</Badge>,
        },
        {
          key: "acoes_extra",
          label: "Registrar",
          render: (r) => (
            <div className="flex gap-2">
              <PresencaManager sessaoId={r.id} />
              <VotacaoManager sessaoId={r.id} />
            </div>
          )
        },
      ]}
      fields={[
        { name: "titulo", label: "Título", required: true },
        { name: "tipo", label: "Tipo", placeholder: "Ordinária, Extraordinária, Solene, Audiência" },
        { name: "data_sessao", label: "Data e hora", type: "datetime-local", required: true },
        { name: "local", label: "Local" },
        { name: "status", label: "Status", placeholder: "agendada | realizada | cancelada" },
        { name: "qtd_pautas", label: "Qtd. Pautas", type: "number" },
        { name: "ata_publicada", label: "ATA Publicada?", type: "checkbox" },
        { name: "pauta", label: "Pauta (Texto)", type: "textarea" },
        { name: "ata_url", label: "Arquivo da ATA (PDF)", type: "file" },
        { name: "video_url", label: "URL do vídeo (YouTube)", type: "url" },
      ]}
    />
  );
}
