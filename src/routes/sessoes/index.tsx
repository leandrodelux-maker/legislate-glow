import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  PlayCircle, 
  Calendar, 
  History,
  FileText,
  Eye,
  Search,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/sessoes/")({
  component: SessoesList,
});

function SessoesList() {
  const sessions = [
    { id: 1, type: "Sessão Ordinária", date: "16 de Junho", time: "14:00", status: "Ao Vivo", color: "red" },
    { id: 2, type: "Audiência Pública", date: "18 de Junho", time: "19:00", status: "Agendada", color: "emerald" },
    { id: 3, type: "Sessão Ordinária", date: "09 de Junho", time: "14:00", status: "Arquivada", color: "slate" },
  ];

  return (
    <div className="container-page py-12 animate-[fade-up_0.5s_ease-out]">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900">Processo Legislativo</h1>
          <p className="text-slate-500 mt-2">Acompanhe sessões ao vivo e o histórico de transmissões.</p>
        </div>
        <div className="flex gap-3">
           <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold">
             <Link to="/sessoes/ao-vivo">
               <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-2" />
               Acessar Transmissão Ao Vivo
             </Link>
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Pesquisar por pauta, data ou tipo de sessão..." className="pl-10 h-12" />
          </div>

          <h2 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Próximas Atividades
          </h2>

          <div className="space-y-4">
            {sessions.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between hover:border-primary/30 transition-all group">
                <div className="flex gap-6 items-center">
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-display border
                    ${s.status === 'Ao Vivo' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    <span className="text-lg font-bold">{s.date.split(' ')[0]}</span>
                    <span className="text-[10px] uppercase font-bold">{s.date.split(' ')[2].substring(0,3)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant={s.status === 'Ao Vivo' ? 'destructive' : 'secondary'} className="uppercase text-[10px] font-bold tracking-widest">
                        {s.status}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{s.time}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-primary transition-colors">{s.type}</h3>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Pauta disponível</span>
                      {s.status === 'Arquivada' && (
                        <span className="text-xs text-slate-500 flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5" /> Vídeo arquivado</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" asChild>
                  <Link to={s.status === 'Ao Vivo' ? "/sessoes/ao-vivo" : "/sessoes"}>
                    Ver detalhes <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
           <div className="bg-primary-deep rounded-2xl p-6 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <History className="h-24 w-24" />
             </div>
             <h3 className="font-display font-bold text-xl mb-4 relative z-10">Histórico</h3>
             <p className="text-white/70 text-sm mb-6 relative z-10">Acesse o arquivo completo de vídeos e atas das sessões anteriores.</p>
             <Button className="w-full bg-white text-primary-deep hover:bg-white/90 font-bold relative z-10">
               Ver Arquivo Digital
             </Button>
           </div>
        </aside>
      </div>
    </div>
  );
}
