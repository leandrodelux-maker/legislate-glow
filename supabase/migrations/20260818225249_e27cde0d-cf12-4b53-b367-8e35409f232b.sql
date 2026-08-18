ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ visível para todos" ON public.faq FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "FAQ editável por administradores" ON public.faq FOR ALL TO authenticated USING (true);

ALTER TABLE public.roteiro_sessoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roteiro visível para todos" ON public.roteiro_sessoes FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Roteiro editável por administradores" ON public.roteiro_sessoes FOR ALL TO authenticated USING (true);

ALTER TABLE public.acesso_rapido ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso rápido visível para todos" ON public.acesso_rapido FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Acesso rápido editável por administradores" ON public.acesso_rapido FOR ALL TO authenticated USING (true);
