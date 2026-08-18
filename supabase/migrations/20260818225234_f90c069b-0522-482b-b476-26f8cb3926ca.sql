-- FAQ Table
CREATE TABLE public.faq (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pergunta text NOT NULL,
    resposta text NOT NULL,
    categoria text NOT NULL DEFAULT 'Institucional',
    ordem integer NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq TO authenticated;
GRANT ALL ON public.faq TO service_role;
GRANT SELECT ON public.faq TO anon;

-- Roteiro das Sessões Table
CREATE TABLE public.roteiro_sessoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_etapa text NOT NULL,
    titulo text NOT NULL,
    descricao text NOT NULL,
    nota_quorum text,
    icone text DEFAULT 'FileText',
    ordem integer NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roteiro_sessoes TO authenticated;
GRANT ALL ON public.roteiro_sessoes TO service_role;
GRANT SELECT ON public.roteiro_sessoes TO anon;

-- Seed FAQ
INSERT INTO public.faq (pergunta, resposta, categoria, ordem) VALUES
('O que faz a Câmara Municipal?', 'A Câmara Municipal é o Poder Legislativo do município. Cabe a ela elaborar leis, fiscalizar os atos do Poder Executivo, votar o orçamento e representar a população.', 'Institucional', 10),
('Quantos vereadores compõem a Câmara?', 'O número de vereadores é definido pela Constituição Federal com base na população do município. Consulte a página de Vereadores para a composição atual.', 'Institucional', 20),
('Como acompanhar as sessões da Câmara?', 'As sessões são abertas ao público e transmitidas ao vivo pelo portal. Acesse a página de Sessões para consultar a pauta e o calendário.', 'Sessões', 30),
('Posso participar de uma sessão presencialmente?', 'Sim. As sessões plenárias são públicas. Consulte a agenda e compareça ao plenário no dia e horário divulgados.', 'Sessões', 40),
('Onde encontro os dados de receitas, despesas e contratos?', 'Todos os dados obrigatórios estão disponíveis no Portal da Transparência, com informações sobre orçamento, licitações, contratos, folha de pagamento e prestação de contas.', 'Transparência', 50),
('Com que frequência os dados são atualizados?', 'Os dados financeiros são atualizados conforme a legislação vigente (LC nº 131/2009 e Lei nº 12.527/2011), normalmente em periodicidade diária ou mensal, dependendo da informação.', 'Transparência', 60),
('Como faço um pedido de acesso à informação?', 'Pelo e-SIC, disponível no portal, preenchendo o formulário com seus dados e a descrição do pedido. Um número de protocolo será gerado para acompanhamento.', 'e-SIC / LAI', 70),
('Qual o prazo para receber a resposta?', 'O prazo legal é de até 20 dias corridos, prorrogáveis por mais 10 mediante justificativa, conforme a Lei nº 12.527/2011.', 'e-SIC / LAI', 80),
('Como a Câmara trata meus dados pessoais?', 'Todos os dados são tratados conforme a Lei nº 13.709/2018 (LGPD), com finalidade específica, transparência e medidas de segurança. Consulte a página de LGPD para detalhes.', 'LGPD', 90),
('Quem é o Encarregado de Dados (DPO)?', 'O Encarregado de Dados é indicado por portaria e disponível pelo e-mail contato@camaracachoeiradegoias.go.gov.br para atender solicitações relacionadas à proteção de dados.', 'LGPD', 100),
('Qual a diferença entre Ouvidoria e e-SIC?', 'A Ouvidoria recebe reclamações, sugestões, elogios e denúncias sobre os serviços da Câmara. O e-SIC é destinado especificamente a pedidos de acesso à informação previstos na LAI.', 'Ouvidoria', 110);

-- Seed Roteiro
INSERT INTO public.roteiro_sessoes (numero_etapa, titulo, descricao, nota_quorum, icone, ordem) VALUES
('1º', 'Abertura dos trabalhos', 'Constatado o quórum regimental, o Presidente pronuncia: “Em nome de Deus declaro aberto os trabalhos da presente sessão”.', 'A Câmara somente se reúne com a presença de, no mínimo, 1/3 dos vereadores. Para deliberar sobre qualquer matéria, é exigida a presença da maioria absoluta dos membros.', 'Gavel', 10),
('2º', 'Leitura e votação da ata', 'É feita a leitura da ata da sessão anterior, submetida em seguida à votação do plenário.', NULL, 'FileText', 20),
('3º', 'Apresentação das proposituras', 'O 1º Secretário faz a leitura das proposituras apresentadas no dia — projetos, indicações, requerimentos e moções.', NULL, 'ListOrdered', 30),
('4º', 'Ordem do Dia', 'O Presidente declara aberta a Ordem do Dia, período destinado à apreciação das matérias constantes da pauta. Esgotada a pauta, anuncia a Ordem do Dia da sessão seguinte e concede as inscrições para a Tribuna Livre.', NULL, 'CheckCircle2', 40),
('5º', 'Explicações pessoais', 'Com duração de 45 minutos, destinam-se ao pronunciamento dos vereadores inscritos até o final da Ordem do Dia — ou, alternativamente, por sorteio entre os presentes — por 7 minutos cada, facultado 1/3 a mais do tempo aos líderes.', NULL, 'Mic', 50),
('6º', 'Encerramento', 'Após as explicações pessoais, não havendo mais nada a tratar, o Presidente declara encerrados os trabalhos e convida os presentes para a próxima sessão ordinária.', NULL, 'MessageSquare', 60);

-- Acesso Rápido
DELETE FROM public.acesso_rapido;
INSERT INTO public.acesso_rapido (label, url, icon, ordem, ativo) VALUES
('Ouvidoria', '/contato', 'Phone', 10, true),
('e-SIC', '/e-sic', 'ShieldCheck', 20, true),
('Notícias', '/noticias', 'FileText', 30, true),
('Sessões Plenárias', '/sessoes', 'Calendar', 40, true),
('Vereadores', '/vereadores', 'Users', 50, true),
('LGPD', '/lgpd', 'ShieldCheck', 60, true),
('Folha de Pagamento', '/transparencia-portal', 'Users', 70, true),
('Licitações', '/transparencia-portal', 'Gavel', 80, true),
('Contratos', '/transparencia-portal', 'ClipboardList', 90, true),
('Projetos Legislativos', '/projetos', 'FileText', 100, true),
('Portal da Transparência', '/transparencia-portal', 'Globe', 110, true);
