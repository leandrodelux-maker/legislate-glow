-- Política pública de leitura
DROP POLICY IF EXISTS "Public read vereadores" ON storage.objects;
CREATE POLICY "Public read vereadores"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'vereadores');

-- Política de escrita apenas para administradores/editores
DROP POLICY IF EXISTS "Admin/editor manage vereadores" ON storage.objects;
CREATE POLICY "Admin/editor manage vereadores"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'vereadores' AND EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
))
WITH CHECK (bucket_id = 'vereadores' AND EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
));