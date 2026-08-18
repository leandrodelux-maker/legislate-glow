INSERT INTO public.site_settings (nome_camara, endereco, contact_phone, whatsapp, contact_email, contact_hours)
SELECT 'Câmara Municipal de Cachoeira de Goiás',
       'R. Goiás, 40-84, Centro, Cachoeira de Goiás-GO, 76125-000',
       '(64) 99233-6171',
       '(64) 99233-6171',
       'contato@camaracachoeiradegoias.go.gov.br',
       'Segunda a Sexta, 08h às 11h e 13h às 17h'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

UPDATE public.site_settings SET
  nome_camara = 'Câmara Municipal de Cachoeira de Goiás',
  endereco = 'R. Goiás, 40-84, Centro, Cachoeira de Goiás-GO, 76125-000',
  contact_phone = '(64) 99233-6171',
  whatsapp = '(64) 99233-6171',
  contact_email = 'contato@camaracachoeiradegoias.go.gov.br',
  contact_hours = 'Segunda a Sexta, 08h às 11h e 13h às 17h',
  updated_at = now();

UPDATE public.transparency_settings SET is_active = false;

INSERT INTO public.transparency_settings (entity_name, portal_name, portal_url, portal_base_url, intro_text, is_active)
VALUES (
  'Câmara Municipal de Cachoeira de Goiás',
  'Portal da Transparência',
  'https://camaracachoeiradegoias.megasofttransparencia.com.br',
  'https://camaracachoeiradegoias.megasofttransparencia.com.br',
  'Consulte receitas, despesas, contratos, licitações, servidores, diárias e legislação da Câmara Municipal de Cachoeira de Goiás no Portal da Transparência oficial.',
  true
);

DELETE FROM public.transparency_links;

INSERT INTO public.transparency_links (title, description, icon, path, category, sort_order, is_active) VALUES
 ('Receitas e Despesas', 'Receitas, despesas, empenhos, pagamentos e execução orçamentária.', 'Receipt', 'receitas-e-despesas', 'Finanças', 1, true),
 ('Contratos, Convênios e Licitações', 'Contratos, procedimentos licitatórios, convênios, dispensas e obras.', 'ClipboardList', 'contratos-convenios-e-licitacoes', 'Contratações', 2, true),
 ('Órgãos e Servidores', 'Servidores, folha, diárias, estrutura organizacional e remuneração.', 'Users', 'orgaos-e-servidores', 'Pessoal', 3, true),
 ('Planejamento e Políticas Públicas', 'Planos, projetos, pareceres prévios e relatórios de gestão.', 'Landmark', 'planejamento-e-politicas-publicas', 'Planejamento', 4, true),
 ('Responsabilidade Fiscal', 'Relatórios de Gestão Fiscal (LRF).', 'Scale', 'responsabilidade-fiscal', 'Finanças', 5, true),
 ('Legislação e Publicações', 'Leis, resoluções, atas, pautas, votações e dados abertos.', 'BookOpen', 'legislacao-e-publicacoes', 'Legislação', 6, true),
 ('Ouvidoria e e-SIC', 'Solicitações de informação, denúncias, elogios e acompanhamento.', 'ShieldCheck', 'ouvidoria-e-e-sic', 'Cidadão', 7, true);