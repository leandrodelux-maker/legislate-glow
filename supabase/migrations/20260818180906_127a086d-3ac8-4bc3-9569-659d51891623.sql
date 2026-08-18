-- Limpa dados de demonstração
DELETE FROM public.sessoes_votacoes;
DELETE FROM public.sessoes_presencas;
DELETE FROM public.comissoes_membros;
DELETE FROM public.mesa_diretora;
DELETE FROM public.vereadores_galeria;
DELETE FROM public.vereadores_mandatos;
UPDATE public.projetos_legislativos SET autor_id = NULL;
DELETE FROM public.vereadores;
DELETE FROM public.comissoes;

-- Vereadores oficiais (legislatura 2025-2028)
INSERT INTO public.vereadores
  (nome, slug, partido, cargo, foto_url, email, telefone, gabinete, mandato_inicio, mandato_fim, mandato_atual, legislatura, data_posse, ativo, ordem, comissoes, biografia)
VALUES
  ('Gabrielly Vieira Kochhann','gabrielly-vieira-kochhann','UNIÃO','Presidente','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/5528.webp','gabrielly@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,1,NULL,'Presidente da Câmara Municipal de Cachoeira de Goiás.'),
  ('Lucas Daniel Gonçalves da Silva','lucas-daniel-goncalves-da-silva','UNIÃO','Vice-Presidente','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/003x.webp','lucas@camaracachoeiradegoias.go.gov.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,2,'Comissão de Obras, Serviços Públicos e Atividades Privadas (Presidente); Comissão de Direitos Humanos (Relator)','Vice-Presidente da Câmara Municipal de Cachoeira de Goiás.'),
  ('Enirce Calixto da Silva','enirce-calixto-da-silva','SOLIDARIEDADE','1º Secretário','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/0057w.webp','enirce@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,3,'Comissão de Finanças e Orçamento (Relator); Comissão de Direitos Humanos (Secretário)','1º Secretário da Mesa Diretora.'),
  ('Josemar Francisco de Lima','josemar-francisco-de-lima','PDT','2º Secretário','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/002d.webp','josemar@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,4,'Comissão de Finanças e Orçamento (Presidente); Comissão de Constituição, Justiça e Redação (Secretário)','2º Secretário da Mesa Diretora.'),
  ('Diego André Nascimento','diego-andre-nascimento','SOLIDARIEDADE','Vereador','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/55da.webp','diego@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,5,'Comissão de Constituição, Justiça e Redação (Presidente); Comissão de Finanças e Orçamento (Relator)','Vereador da legislatura 2025–2028.'),
  ('Rodrigo Almeida da Silva','rodrigo-almeida-da-silva','PSB','Vereador','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/asfcopiar.webp','rodrigo@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,6,'Comissão de Educação, Saúde e Promoção Social (Presidente); Comissão de Obras (Secretário)','Vereador da legislatura 2025–2028.'),
  ('Vinicius Camilo de Souza','vinicius-camilo-de-souza','PSD','Vereador','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/safasf.webp','vinicius@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,7,'Comissão de Educação, Saúde e Promoção Social (Relator)','Vereador da legislatura 2025–2028.'),
  ('Willya José da Silva','willya-jose-da-silva','CIDADANIA','Vereador','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/sqsa.webp','willya@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,8,'Comissão de Direitos Humanos (Presidente); Comissão de Obras (Relator)','Vereador da legislatura 2025–2028.'),
  ('Hugo Josué de Jesus','hugo-josue-de-jesus','PSD','Vereador','https://camaracachoeiradegoias.go.gov.br/wp-content/uploads/2025/03/555se.webp','hugo@camaracachoeiradegoias.go.leg.br','(64) 98445-6667',NULL,'2025-01-01','2028-12-31','2025–2028','2025–2028','2025-01-01',true,9,NULL,'Vereador da legislatura 2025–2028.');

-- Mesa Diretora
INSERT INTO public.mesa_diretora (vereador_id, cargo, ordem, ativo)
SELECT v.id, x.cargo, x.ordem, true
FROM (VALUES
  ('gabrielly-vieira-kochhann','Presidente',1),
  ('lucas-daniel-goncalves-da-silva','Vice-Presidente',2),
  ('enirce-calixto-da-silva','1º Secretário',3),
  ('josemar-francisco-de-lima','2º Secretário',4)
) AS x(slug,cargo,ordem)
JOIN public.vereadores v ON v.slug = x.slug;

-- Comissões permanentes
INSERT INTO public.comissoes (nome, sigla, icone, competencia, ordem, ativo) VALUES
  ('Comissão de Constituição, Justiça e Redação','CCJR','scale','Analisa a constitucionalidade, legalidade, juridicidade e a redação final das proposições submetidas à Câmara.',1,true),
  ('Comissão de Finanças e Orçamento','CFO','coins','Examina matérias de natureza financeira e orçamentária, incluindo o orçamento anual, o plano plurianual e as contas do município.',2,true),
  ('Comissão de Educação, Saúde e Promoção Social','CESPS','graduation-cap','Aprecia proposições relacionadas à educação, à saúde pública e às políticas de promoção e assistência social.',3,true),
  ('Comissão de Obras, Serviços Públicos e Atividades Privadas','COSPAP','hard-hat','Trata de obras públicas, serviços públicos municipais, urbanismo e o exercício de atividades privadas no município.',4,true),
  ('Comissão de Direitos Humanos, Defesa do Consumidor, Meio Ambiente e Minorias','CDHDC','leaf','Atua na defesa dos direitos humanos, do consumidor, do meio ambiente e dos direitos das minorias.',5,true);

-- Composição das comissões
INSERT INTO public.comissoes_membros (comissao_id, vereador_id, nome, funcao, ordem)
SELECT c.id, v.id, v.nome, x.funcao, x.ordem
FROM (VALUES
  ('CCJR','diego-andre-nascimento','Presidente',1),
  ('CCJR','josemar-francisco-de-lima','Secretário',2),
  ('CFO','josemar-francisco-de-lima','Presidente',1),
  ('CFO','enirce-calixto-da-silva','Relator',2),
  ('CFO','diego-andre-nascimento','Secretário',3),
  ('CESPS','rodrigo-almeida-da-silva','Presidente',1),
  ('CESPS','vinicius-camilo-de-souza','Relator',2),
  ('COSPAP','lucas-daniel-goncalves-da-silva','Presidente',1),
  ('COSPAP','willya-jose-da-silva','Relator',2),
  ('COSPAP','rodrigo-almeida-da-silva','Secretário',3),
  ('CDHDC','willya-jose-da-silva','Presidente',1),
  ('CDHDC','lucas-daniel-goncalves-da-silva','Relator',2),
  ('CDHDC','enirce-calixto-da-silva','Secretário',3)
) AS x(sigla,slug,funcao,ordem)
JOIN public.comissoes c ON c.sigla = x.sigla
JOIN public.vereadores v ON v.slug = x.slug;