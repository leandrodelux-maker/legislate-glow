import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Acessar Painel — Câmara Municipal" }] }),
});

/** Mensagens do serviço de login em português, com o que fazer em seguida. */
function mensagemDeErro(mensagem: string) {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  if (m.includes("email not confirmed")) return "Este e-mail ainda não foi confirmado. Abra o link enviado para a sua caixa de entrada.";
  if (m.includes("already registered")) return "Este e-mail já tem conta. Use a aba Entrar.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (m.includes("fetch") || m.includes("network")) return "Não foi possível conectar. Verifique a internet e tente novamente.";
  return mensagem;
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setAviso("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErro(mensagemDeErro(error.message));
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/admin/dashboard" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setAviso("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return setErro(mensagemDeErro(error.message));
    setAviso("Conta criada. Confirme o e-mail pelo link enviado. Depois, um administrador precisa liberar o seu acesso.");
  };

  return (
    <div className="pagina-hero relative isolate min-h-[80vh] grid place-items-center overflow-hidden p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-deep grid place-items-center">
            <ShieldCheck className="text-gold w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">PAINEL ADMINISTRATIVO</h1>
            <p className="text-xs text-slate-500">Câmara Municipal</p>
          </div>
        </div>

        {erro && <p role="alert" className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>}
        {aviso && <p role="status" className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">{aviso}</p>}

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-4">
              <div>
                <Label htmlFor="entrar-email">E-mail</Label>
                <Input id="entrar-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="entrar-senha">Senha</Label>
                <Input id="entrar-senha" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary-deep">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-4">
              <div>
                <Label>Nome completo</Label>
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Senha</Label>
                <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary-deep">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar conta
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Após criar a conta, um administrador precisa conceder permissão de acesso ao painel.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
