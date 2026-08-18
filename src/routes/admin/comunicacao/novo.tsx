import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Globe, 
  Clock, 
  Calendar,
  Share2,
  FileText,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/cms/RichTextEditor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin/comunicacao/novo")({
  component: NovoPostPage,
});

function NovoPostPage() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [slug, setSlug] = useState("");
  const [categoria, setCategoria] = useState("Notícias");
  const [status, setStatus] = useState("Rascunho");
  const [agendado, setAgendado] = useState(false);
  const [dataAgendamento, setDataAgendamento] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  
  const [seoTitulo, setSeoTitulo] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitulo(val);
    // Auto-slug
    setSlug(val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    if (!seoTitulo) setSeoTitulo(val);
  };

  const handleSalvar = (publicar = false) => {
    toast.success(publicar ? "Publicação realizada com sucesso!" : "Rascunho salvo!");
    if (publicar) {
      toast.info("Compartilhando automaticamente nas redes sociais vinculadas...");
    }
    navigate({ to: "/admin/comunicacao" });
  };

  return (
    <div className="space-y-8 animate-[fade-up_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/comunicacao" })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">Nova Publicação</h2>
            <p className="text-slate-500">Crie conteúdo rico para o portal institucional.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSalvar()}>
            <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
          </Button>
          <Button className="bg-primary-deep text-white hover:bg-primary-deep/90" onClick={() => handleSalvar(true)}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Publicar Agora
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="font-bold text-slate-700">Título da Publicação</Label>
              <Input 
                id="titulo" 
                placeholder="Ex: Câmara aprova novo Plano Diretor Municipal" 
                className="text-lg font-bold h-12"
                value={titulo}
                onChange={handleTituloChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Conteúdo Rico</Label>
              <RichTextEditor content={conteudo} onChange={setConteudo} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Configurações de SEO
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-bold uppercase text-slate-400">URL Amigável (Slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">camara.gov.br/noticias/</span>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-titulo" className="font-bold text-slate-700 text-sm">Título SEO</Label>
                <Input id="seo-titulo" value={seoTitulo} onChange={(e) => setSeoTitulo(e.target.value)} />
                <p className="text-[10px] text-slate-400">Recomendado: até 60 caracteres.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-desc" className="font-bold text-slate-700 text-sm">Meta Descrição</Label>
                <textarea 
                  id="seo-desc" 
                  className="w-full rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Resumo que aparecerá nos resultados de busca..."
                />
                <p className="text-[10px] text-slate-400">Recomendado: até 160 caracteres.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Publicação</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Notícias">Notícias</SelectItem>
                    <SelectItem value="Avisos">Avisos</SelectItem>
                    <SelectItem value="Eventos">Eventos</SelectItem>
                    <SelectItem value="Audiências">Audiências Públicas</SelectItem>
                    <SelectItem value="Projetos">Projetos em Destaque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label htmlFor="agendar" className="text-sm font-bold">Agendar Publicação</Label>
                  <Switch id="agendar" checked={agendado} onCheckedChange={setAgendado} />
                </div>
                {agendado && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                    <Input 
                      type="datetime-local" 
                      value={dataAgendamento} 
                      onChange={(e) => setDataAgendamento(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <Label className="text-sm font-bold block mb-2">Redes Sociais (Auto-Post)</Label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">Facebook</Badge>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-100">Instagram</Badge>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">WhatsApp</Badge>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Mídia e Anexos</h3>
            <div className="grid gap-3">
              <Button variant="outline" className="w-full justify-start h-12" onClick={() => toast.info("Upload de Imagem de Destaque")}>
                <ImageIcon className="w-4 h-4 mr-2 text-primary" /> Imagem de Destaque
              </Button>
              <Button variant="outline" className="w-full justify-start h-12" onClick={() => toast.info("Anexar Documentos PDF")}>
                <Paperclip className="w-4 h-4 mr-2 text-primary" /> Anexar PDF / Documentos
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center italic">Arraste arquivos ou clique para selecionar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}