import { createFileRoute } from "@tanstack/react-router";
import { 
  Settings, 
  Lock, 
  Users, 
  Shield, 
  Database, 
  Globe, 
  Bell, 
  Mail,
  Palette,
  Layout,
  Save,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/admin/config/")({
  component: AdminConfig,
});

function AdminConfig() {
  return (
    <div className="space-y-8 animate-[fade-up_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Configurações</h2>
          <p className="text-slate-500">Ajustes do sistema, segurança e identidade visual.</p>
        </div>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Save className="w-4 h-4 mr-2" /> Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-12 border border-slate-200">
          <TabsTrigger value="geral" className="px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Geral</TabsTrigger>
          <TabsTrigger value="seguranca" className="px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Segurança</TabsTrigger>
          <TabsTrigger value="identidade" className="px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Identidade</TabsTrigger>
          <TabsTrigger value="integracoes" className="px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" /> Informações do Site
                </CardTitle>
                <CardDescription>Dados institucionais básicos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Instituição</Label>
                  <Input defaultValue="Câmara Municipal de Exemplo" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input defaultValue="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail Oficial</Label>
                  <Input defaultValue="contato@camara.gov.br" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" /> Notificações
                </CardTitle>
                <CardDescription>Alertas automáticos do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Novos Protocolos</Label>
                    <p className="text-xs text-slate-500">Notificar por e-mail novas demandas da Ouvidoria.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Acessos Suspeitos</Label>
                    <p className="text-xs text-slate-500">Alertar login de novos dispositivos ou IPs.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Diário</Label>
                    <p className="text-xs text-slate-500">Enviar relatório de integridade do banco de dados.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" /> Controle de Acesso e Permissões
              </CardTitle>
              <CardDescription>Gerencie quem pode acessar cada módulo do painel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { role: "Administrador Geral", desc: "Acesso total a todas as funções e configurações.", users: 2 },
                  { role: "Secretaria Legislativa", desc: "Gestão de Projetos, Sessões e Documentos.", users: 5 },
                  { role: "Comunicação", desc: "Gestão de Notícias, Banners e Galeria.", users: 3 },
                  { role: "Controle Interno", desc: "Acesso a Logs e Transparência (Visualização).", users: 2 },
                ].map((role, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div>
                      <h4 className="font-bold text-slate-900">{role.role}</h4>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400">{role.users} Usuários</span>
                      <Button variant="outline" size="sm">Editar Permissões</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
