import type { FieldDef, SecaoForm } from "./CrudModulo";

// Instruções dos formulários do painel, por tabela. Ficam juntas para o texto seguir um só tom.
export type Guia = {
  singular?: string;
  feminino?: boolean;
  /** O que este cadastro faz no site. */
  intro?: string;
  /** Passo a passo curto, mostrado no topo do formulário. */
  passos?: string[];
  secoes?: SecaoForm[];
  /** Ajustes de cada campo: instrução, rótulo mais claro, tipo. */
  campos?: Record<string, Partial<FieldDef>>;
  filtros?: { campo: string; rotulo: string }[];
  buscaEm?: string[];
  nomeDe?: string;
  vazio?: string;
  /** Pedidos de cidadãos: não se criam nem se apagam pelo painel. */
  somenteAtender?: boolean;
};

const ICONES_ROTEIRO = ["Gavel", "FileText", "ListOrdered", "CheckCircle2", "Mic", "MessageSquare", "List"].map((v) => ({ label: v, value: v }));
const ORDEM = { label: "Posição na lista", ajuda: "Números menores aparecem primeiro." };
const ATIVO_SITE = { placeholder: "Mostrar no site", ajuda: "Desligue para esconder do site sem apagar o cadastro." };
const PDF_LINK = { ajuda: "Cole o endereço completo do PDF, começando com https://." };
const VISUALIZADOR = { ajuda: "Pode deixar vazio: o site monta a visualização sozinho.", placeholder: "" };

export const GUIAS: Record<string, Guia> = {
  vereadores: {
    singular: "vereador",
    intro: "Este cadastro alimenta a página Vereadores, o perfil de cada parlamentar e a página inicial.",
    passos: ["Envie a foto e preencha o nome. O endereço da página é criado sozinho.", "Complete contato, perfil e mandato.", "Deixe \"Mostrar no site\" ligado e salve."],
    secoes: [
      { titulo: "Identificação", descricao: "O que o cidadão vê primeiro.", campos: ["foto_url", "nome", "slug", "partido", "cargo", "ordem", "ativo"] },
      { titulo: "Sobre o vereador", campos: ["biografia", "comissoes", "naturalidade", "escolaridade", "profissao", "data_nascimento"] },
      { titulo: "Contato", descricao: "Sem preencher, o perfil mostra os contatos oficiais da Câmara.", campos: ["email", "telefone", "gabinete"] },
      { titulo: "Mandato", campos: ["legislatura", "mandato_atual", "data_posse", "mandato_inicio", "mandato_fim"] },
      { titulo: "Redes sociais", campos: ["redes_sociais"] },
    ],
    campos: {
      foto_url: { label: "Foto oficial", ajuda: "Prefira foto de frente e com fundo claro. O enquadramento e a compressão são automáticos." },
      slug: { label: "Endereço da página", slugDe: "nome", ajuda: "Criado a partir do nome. Só mude se precisar corrigir." },
      cargo: { label: "Cargo", ajuda: "É o cargo mostrado nos cartões. Na Mesa Diretora, use o mesmo cargo de lá.", placeholder: "Vereador, Presidente, 1º Secretário..." },
      comissoes: { ajuda: "Separe os nomes com vírgula.", largo: true },
      biografia: { ajuda: "Um ou dois parágrafos sobre a trajetória do vereador." },
      ordem: ORDEM,
      ativo: { label: "Situação", ...ATIVO_SITE },
    },
    filtros: [{ campo: "partido", rotulo: "Partido" }, { campo: "cargo", rotulo: "Cargo" }],
    buscaEm: ["nome", "partido", "cargo"],
    nomeDe: "nome",
  },
  vereadores_mandatos: {
    singular: "mandato",
    intro: "Cada registro aparece no perfil do vereador, em \"Mandatos e Cargos\".",
    passos: ["Escolha o vereador e informe o período.", "Se ele fez parte da Mesa nesse período, escolha o cargo."],
    secoes: [
      { titulo: "Vereador e período", campos: ["vereador_id", "mandato", "data_inicio", "data_fim"] },
      { titulo: "Cargo e partido", campos: ["cargo_mesa", "partido", "observacoes"] },
    ],
    campos: {
      mandato: { label: "Mandato", placeholder: "2021–2024" },
      data_fim: { ajuda: "Deixe vazio se o mandato ainda está em curso." },
      cargo_mesa: { placeholder: "Sem cargo na Mesa" },
    },
    filtros: [{ campo: "vereador_id", rotulo: "Vereador" }],
    buscaEm: ["mandato", "partido", "observacoes"],
    nomeDe: "mandato",
  },
  vereadores_galeria: {
    singular: "foto",
    feminino: true,
    intro: "As fotos aparecem na aba Galeria do perfil do vereador.",
    passos: ["Escolha o vereador.", "Envie a imagem e escreva uma legenda curta."],
    campos: {
      url: { label: "Imagem", ajuda: "JPG, PNG ou WebP de até 2 MB." },
      legenda: { largo: true, ajuda: "Diga o que acontece na foto.", placeholder: "Ex.: Visita às obras da escola municipal" },
      ordem: ORDEM,
    },
    filtros: [{ campo: "vereador_id", rotulo: "Vereador" }],
    buscaEm: ["legenda"],
    nomeDe: "legenda",
  },
  mesa_diretora: {
    singular: "membro da Mesa",
    intro: "Aparece na página Mesa Diretora, em A Câmara.",
    passos: ["Escolha o vereador e o cargo.", "Use a posição para definir a ordem: Presidente primeiro."],
    campos: {
      vereador_id: { ajuda: "Só vereadores ativos aparecem na lista." },
      ordem: ORDEM,
      ativo: { label: "Situação", ...ATIVO_SITE },
    },
    nomeDe: "cargo",
  },
  comissoes: {
    singular: "comissão",
    feminino: true,
    intro: "Cada comissão vira um bloco na página Comissões. Depois de criar, adicione as pessoas em Membros das Comissões.",
    secoes: [
      { titulo: "Identificação", campos: ["nome", "sigla", "icone"] },
      { titulo: "O que a comissão faz", campos: ["competencia"] },
      { titulo: "Exibição", campos: ["ordem", "ativo"] },
    ],
    campos: {
      nome: { largo: true },
      sigla: { ajuda: "Aparece em destaque no site." },
      competencia: { label: "Competência", ajuda: "Explique em linguagem simples o que ela analisa." },
      ordem: ORDEM,
      ativo: { label: "Situação", ...ATIVO_SITE },
    },
    buscaEm: ["nome", "sigla"],
    nomeDe: "nome",
  },
  comissoes_membros: {
    singular: "membro",
    intro: "Define quem aparece em cada comissão. A foto e o link do perfil vêm do cadastro do vereador.",
    passos: ["Escolha a comissão e o vereador.", "Escreva o nome exatamente como no cadastro do vereador: é assim que a foto é encontrada.", "Informe a função."],
    campos: {
      vereador_id: { label: "Vereador" },
      nome: { label: "Nome exibido", ajuda: "Use o mesmo nome do cadastro do vereador." },
      funcao: { label: "Função", placeholder: "Presidente, Vice-Presidente, Relator..." },
      ordem: ORDEM,
    },
    filtros: [{ campo: "comissao_id", rotulo: "Comissão" }, { campo: "funcao", rotulo: "Função" }],
    buscaEm: ["nome", "funcao"],
    nomeDe: "nome",
  },
  sessoes: {
    singular: "sessão",
    feminino: true,
    intro: "Alimenta a página Sessões, a página inicial, o perfil dos vereadores e a Transparência (atas, pautas e votações).",
    passos: ["Antes da sessão: preencha título, data e pauta.", "Depois: marque como Realizada e anexe a ata.", "Registre presença e votos pelos botões da lista."],
    secoes: [
      { titulo: "Quando e onde", campos: ["titulo", "tipo", "status", "data_sessao", "local"] },
      { titulo: "Pauta", descricao: "Aparece para o cidadão em Sessões e na Transparência.", campos: ["pauta", "qtd_pautas"] },
      { titulo: "Depois da sessão", campos: ["ata_url", "ata_publicada", "video_url"] },
    ],
    campos: {
      titulo: { largo: true, placeholder: "Ex.: 12ª Sessão Ordinária de 2026" },
      tipo: { type: "select", options: ["Ordinária", "Extraordinária", "Solene", "Audiência Pública"].map((v) => ({ label: v, value: v })), placeholder: "Sem tipo" },
      status: { label: "Situação", type: "select", required: true, options: [{ label: "Agendada", value: "agendada" }, { label: "Realizada", value: "realizada" }, { label: "Cancelada", value: "cancelada" }], ajuda: "Só as agendadas aparecem em Próximas Sessões." },
      local: { placeholder: "Plenário da Câmara" },
      qtd_pautas: { label: "Quantidade de itens na pauta" },
      ata_url: { label: "Ata (PDF)", arquivo: "pdf" },
      ata_publicada: { label: "Publicação da ata", placeholder: "Ata publicada", ajuda: "Ligue depois de anexar o arquivo." },
      video_url: { label: "Vídeo da sessão", ajuda: "Cole o link do YouTube. A miniatura aparece no histórico.", largo: true },
    },
    filtros: [{ campo: "status", rotulo: "Situação" }, { campo: "tipo", rotulo: "Tipo" }],
    buscaEm: ["titulo", "tipo", "local"],
    nomeDe: "titulo",
  },
  projetos_legislativos: {
    singular: "projeto",
    intro: "Aparece na página Projetos, no perfil do autor e na Transparência. Mude a etapa conforme ele avança: a barra de progresso do site acompanha.",
    passos: ["Informe tipo, número e ano.", "Resuma o assunto na ementa.", "Atualize a etapa a cada movimentação."],
    secoes: [
      { titulo: "Identificação", campos: ["tipo", "numero", "ano", "data_apresentacao"] },
      { titulo: "Conteúdo", campos: ["ementa", "documento_url"] },
      { titulo: "Autoria", campos: ["autor_id", "autor"] },
      { titulo: "Andamento", campos: ["status", "tramitacao", "observacoes"] },
    ],
    campos: {
      numero: { placeholder: "012" },
      ementa: { label: "Ementa", ajuda: "Uma frase clara sobre o que o projeto propõe." },
      autor_id: { placeholder: "Sem vereador autor", ajuda: "Vincula o projeto ao perfil do vereador." },
      autor: { label: "Outro autor", ajuda: "Use quando o autor não é vereador, como a Mesa ou o Executivo." },
      status: { label: "Etapa atual" },
      documento_url: { label: "Arquivo do projeto (PDF)", arquivo: "pdf" },
      tramitacao: { label: "Histórico de tramitação" },
      observacoes: { label: "Observações internas", ajuda: "Anotações para a equipe." },
    },
    filtros: [{ campo: "status", rotulo: "Etapa" }, { campo: "tipo", rotulo: "Tipo" }, { campo: "ano", rotulo: "Ano" }],
    buscaEm: ["ementa", "numero", "tipo", "autor"],
    nomeDe: "ementa",
  },
  roteiro_sessoes: {
    singular: "etapa",
    feminino: true,
    intro: "Cada etapa vira um passo na página Roteiro das Sessões.",
    secoes: [
      { titulo: "A etapa", campos: ["numero_etapa", "icone", "titulo", "descricao"] },
      { titulo: "Quórum", descricao: "Opcional. Aparece em um aviso destacado.", campos: ["nota_quorum"] },
      { titulo: "Exibição", campos: ["ordem", "ativo"] },
    ],
    campos: {
      numero_etapa: { label: "Número exibido", placeholder: "1º" },
      icone: { type: "select", options: ICONES_ROTEIRO, placeholder: "Ícone padrão" },
      titulo: { largo: true },
      descricao: { label: "Descrição", ajuda: "Explique o que acontece nesta etapa." },
      nota_quorum: { label: "Nota de quórum" },
      ordem: ORDEM,
      ativo: { label: "Situação", ...ATIVO_SITE },
    },
    buscaEm: ["titulo", "descricao"],
    nomeDe: "titulo",
  },
  documentos_oficiais: {
    singular: "documento",
    intro: "Aparece em Atos Legislativos, na página escolhida. O cidadão pode visualizar e baixar o PDF.",
    passos: ["Escolha onde o documento será exibido.", "Dê um título e cole o link do PDF.", "Deixe publicado e salve."],
    secoes: [
      { titulo: "Documento", campos: ["categoria", "titulo", "descricao", "data_documento"] },
      { titulo: "Arquivo", campos: ["download_url", "viewer_url"] },
      { titulo: "Exibição", campos: ["ordem", "publicado"] },
    ],
    campos: {
      categoria: { largo: true },
      titulo: { largo: true },
      data_documento: { label: "Data", placeholder: "06/10/2023" },
      download_url: { largo: true, ...PDF_LINK },
      viewer_url: { largo: true, ...VISUALIZADOR },
      ordem: ORDEM,
      publicado: { label: "Situação", placeholder: "Publicado no site" },
    },
    filtros: [{ campo: "categoria", rotulo: "Página" }],
    buscaEm: ["titulo", "descricao"],
    nomeDe: "titulo",
  },
  "documentos_oficiais:portarias": {
    singular: "portaria",
    feminino: true,
    intro: "Aparece em Atos Legislativos, na página Portarias.",
    passos: ["Informe número e ano no título.", "Resuma o assunto e cole o link do PDF.", "Deixe publicada e salve."],
    secoes: [
      { titulo: "Portaria", campos: ["titulo", "data_documento", "descricao"] },
      { titulo: "Arquivo", campos: ["download_url", "viewer_url"] },
      { titulo: "Exibição", campos: ["ordem", "publicado"] },
    ],
    campos: {
      titulo: { label: "Título", placeholder: "Portaria nº 001/2026" },
      descricao: { label: "Ementa", ajuda: "Diga em uma frase o que a portaria determina." },
      data_documento: { label: "Data", placeholder: "02/01/2026" },
      download_url: { largo: true, ...PDF_LINK },
      viewer_url: { largo: true, ...VISUALIZADOR },
      ordem: ORDEM,
      publicado: { label: "Situação", placeholder: "Publicada no site" },
    },
    buscaEm: ["titulo", "descricao"],
    nomeDe: "titulo",
  },
  noticias_categorias: {
    singular: "categoria",
    feminino: true,
    intro: "As categorias viram os filtros da página Notícias.",
    campos: {
      slug: { label: "Endereço", slugDe: "nome", ajuda: "Criado a partir do nome." },
      cor: { type: "cor", ajuda: "Usada para identificar a categoria no painel." },
      ordem: ORDEM,
    },
    nomeDe: "nome",
  },
  faq: {
    singular: "pergunta",
    feminino: true,
    intro: "Aparece na página Perguntas Frequentes, separada por assunto.",
    passos: ["Escreva a pergunta como o cidadão perguntaria.", "Responda de forma direta.", "Escolha o assunto."],
    secoes: [
      { titulo: "Pergunta e resposta", campos: ["pergunta", "resposta"] },
      { titulo: "Organização", campos: ["categoria", "ordem", "ativo"] },
    ],
    campos: {
      pergunta: { largo: true, placeholder: "Ex.: Como acompanhar as sessões?" },
      categoria: { label: "Assunto", largo: true },
      ordem: ORDEM,
      ativo: { label: "Situação", ...ATIVO_SITE, largo: true },
    },
    filtros: [{ campo: "categoria", rotulo: "Assunto" }],
    buscaEm: ["pergunta", "resposta"],
    nomeDe: "pergunta",
  },
  esic_solicitacoes: {
    singular: "pedido",
    somenteAtender: true,
    intro: "Pedido feito pelo cidadão em /e-sic. O prazo legal é de 20 dias, prorrogáveis por mais 10 com justificativa.",
    passos: ["Leia o pedido e mude a situação para Em análise.", "Escreva a resposta.", "Mude para Respondido e salve."],
    secoes: [
      { titulo: "O que o cidadão pediu", campos: ["protocolo", "prazo_resposta", "nome", "email", "cpf", "telefone", "pedido"] },
      { titulo: "Atendimento", campos: ["status", "resposta"] },
    ],
    campos: {
      protocolo: { somenteLeitura: true },
      nome: { somenteLeitura: true },
      cpf: { somenteLeitura: true },
      email: { somenteLeitura: true },
      telefone: { somenteLeitura: true },
      pedido: { somenteLeitura: true, largo: true },
      prazo_resposta: { label: "Prazo", ajuda: "Ao prorrogar, ajuste a data e registre o motivo na resposta." },
      status: { label: "Situação", largo: true },
      resposta: { ajuda: "Escreva em linguagem simples e indique onde encontrar a informação." },
    },
    filtros: [{ campo: "status", rotulo: "Situação" }],
    buscaEm: ["protocolo", "nome", "pedido"],
    nomeDe: "protocolo",
    vazio: "Nenhum pedido recebido até agora",
  },
  ouvidoria_protocolos: {
    singular: "manifestação",
    feminino: true,
    somenteAtender: true,
    intro: "Manifestação recebida pela Ouvidoria. O prazo de resposta é de 30 dias (Lei nº 13.460/2017).",
    passos: ["Leia a manifestação e mude a situação para Em andamento.", "Encaminhe ao setor responsável e escreva a resposta.", "Mude para Respondido e salve."],
    secoes: [
      { titulo: "O que o cidadão enviou", campos: ["protocolo", "tipo", "nome", "email", "telefone", "assunto", "mensagem"] },
      { titulo: "Atendimento", campos: ["status", "resposta"] },
    ],
    campos: {
      protocolo: { somenteLeitura: true },
      tipo: { somenteLeitura: true },
      nome: { somenteLeitura: true },
      email: { somenteLeitura: true },
      telefone: { somenteLeitura: true },
      assunto: { somenteLeitura: true, largo: true },
      mensagem: { somenteLeitura: true, largo: true },
      status: { label: "Situação", largo: true },
    },
    filtros: [{ campo: "status", rotulo: "Situação" }, { campo: "tipo", rotulo: "Tipo" }],
    buscaEm: ["protocolo", "nome", "assunto", "mensagem"],
    nomeDe: "assunto",
    vazio: "Nenhuma manifestação recebida até agora",
  },
};
