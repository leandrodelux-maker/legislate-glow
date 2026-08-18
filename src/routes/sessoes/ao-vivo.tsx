import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  PlayCircle, 
  Calendar, 
  AlertCircle,
  Clock,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/sessoes/ao-vivo")({
  component: TransmissaoAoVivo,
});

function TransmissaoAoVivo() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="container-page py-12 animate-[fade-up_0.5s_ease-out]">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-red-600 font-bold uppercase tracking-widest text-sm mb-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Ao Vivo
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900">Sessão Ordinária — 16 de Junho</h1>
        <p className="text-slate-500 mt-2">Transmissão oficial em tempo real da Câmara Municipal.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
             <iframe 
               className="w-full h-full"
               src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
               title="Transmissão ao vivo" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
             />
          </div>
          
          <div className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <Button variant="outline" className="flex-1 gap-2"><PlayCircle className="w-4 h-4" /> Facebook Live</Button>
            <Button variant="outline" className="flex-1 gap-2"><PlayCircle className="w-4 h-4" /> Youtube</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm h-full flex flex-col">
            <CardContent className="p-0 flex flex-col h-[500px]">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-900">
                Chat Público
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 text-sm">
                <p className="text-slate-500 italic text-center">Inicie a conversa mantendo o respeito.</p>
                <p><span className="font-bold text-blue-600">João Silva:</span> Qual o horário previsto para votação do projeto de lei?</p>
              </div>
              <div className="p-4 border-t border-slate-100">
                <input className="w-full p-2 border rounded-lg" placeholder="Digite sua mensagem..." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
