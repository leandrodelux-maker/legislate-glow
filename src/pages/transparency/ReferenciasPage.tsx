import { useState } from "react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import { BookOpen, FileText, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Norma {
  sigla: string;
  nome: string;
  lei: string;
  desc: string;
  conteudo: string;
}

const normas: Norma[] = [
  {
    sigla: "LAI", nome: "Lei de Acesso à Informação", lei: "Lei nº 12.527/2011",
    desc: "Regula o acesso a informações previsto no art. 5º, XXXIII, da CF.",
    conteudo: `LEI Nº 12.527, DE 18 DE NOVEMBRO DE 2011

Regula o acesso a informações previsto no inciso XXXIII do art. 5º, no inciso II do § 3º do art. 37 e no § 2º do art. 216 da Constituição Federal.

CAPÍTULO I - DISPOSIÇÕES GERAIS

Art. 1º Esta Lei dispõe sobre os procedimentos a serem observados pela União, Estados, Distrito Federal e Municípios, com o fim de garantir o acesso a informações previsto no inciso XXXIII do art. 5º, no inciso II do § 3º do art. 37 e no § 2º do art. 216 da Constituição Federal.

Parágrafo único. Subordinam-se ao regime desta Lei:
I - os órgãos públicos integrantes da administração direta dos Poderes Executivo, Legislativo, incluindo as Cortes de Contas, e Judiciário e do Ministério Público;
II - as autarquias, as fundações públicas, as empresas públicas, as sociedades de economia mista e demais entidades controladas direta ou indiretamente pela União, Estados, Distrito Federal e Municípios.

Art. 2º Aplicam-se as disposições desta Lei, no que couber, às entidades privadas sem fins lucrativos que recebam, para realização de ações de interesse público, recursos públicos diretamente do orçamento ou mediante subvenções sociais, contrato de gestão, termo de parceria, convênios, acordo, ajustes ou outros instrumentos congêneres.

Art. 3º Os procedimentos previstos nesta Lei destinam-se a assegurar o direito fundamental de acesso à informação e devem ser executados em conformidade com os princípios básicos da administração pública e com as seguintes diretrizes:
I - observância da publicidade como preceito geral e do sigilo como exceção;
II - divulgação de informações de interesse público, independentemente de solicitações;
III - utilização de meios de comunicação viabilizados pela tecnologia da informação;
IV - fomento ao desenvolvimento da cultura de transparência na administração pública;
V - desenvolvimento do controle social da administração pública.

Art. 5º É dever do Estado garantir o direito de acesso à informação, que será franqueada, mediante procedimentos objetivos e ágeis, de forma transparente, clara e em linguagem de fácil compreensão.

CAPÍTULO II - DO ACESSO A INFORMAÇÕES E DA SUA DIVULGAÇÃO

Art. 6º Cabe aos órgãos e entidades do poder público, observadas as normas e procedimentos específicos aplicáveis, assegurar a:
I - gestão transparente da informação, propiciando amplo acesso a ela e sua divulgação;
II - proteção da informação, garantindo-se sua disponibilidade, autenticidade e integridade; e
III - proteção da informação sigilosa e da informação pessoal.

Art. 7º O acesso à informação de que trata esta Lei compreende, entre outros, os direitos de obter:
I - orientação sobre os procedimentos para a consecução de acesso;
II - informação contida em registros ou documentos, produzidos ou acumulados por seus órgãos ou entidades;
III - informação produzida ou custodiada por pessoa física ou entidade privada decorrente de qualquer vínculo com seus órgãos ou entidades;
IV - informação primária, íntegra, autêntica e atualizada;
V - informação sobre atividades exercidas pelos órgãos e entidades;
VI - informação pertinente à administração do patrimônio público, utilização de recursos públicos, licitação, contratos administrativos; e
VII - informação relativa à implementação, acompanhamento e resultados dos programas, projetos e ações dos órgãos e entidades públicas.

Art. 8º É dever dos órgãos e entidades públicas promover, independentemente de requerimentos, a divulgação em local de fácil acesso, no âmbito de suas competências, de informações de interesse coletivo ou geral por eles produzidas ou custodiadas.

§ 1º Na divulgação das informações a que se refere o caput, deverão constar, no mínimo:
I - registro das competências e estrutura organizacional;
II - registros de quaisquer repasses ou transferências de recursos financeiros;
III - registros das despesas;
IV - informações concernentes a procedimentos licitatórios;
V - dados gerais para o acompanhamento de programas, ações, projetos e obras; e
VI - respostas a perguntas mais frequentes da sociedade.

§ 2º Os órgãos e entidades públicas deverão utilizar todos os meios e instrumentos legítimos de que dispuserem, sendo obrigatória a divulgação em sítios oficiais da rede mundial de computadores (internet).`,
  },
  {
    sigla: "LRF", nome: "Lei de Responsabilidade Fiscal", lei: "LC nº 101/2000",
    desc: "Estabelece normas de finanças públicas voltadas para a responsabilidade na gestão fiscal.",
    conteudo: `LEI COMPLEMENTAR Nº 101, DE 4 DE MAIO DE 2000

Estabelece normas de finanças públicas voltadas para a responsabilidade na gestão fiscal e dá outras providências.

CAPÍTULO I - DISPOSIÇÕES PRELIMINARES

Art. 1º Esta Lei Complementar estabelece normas de finanças públicas voltadas para a responsabilidade na gestão fiscal, com amparo no Capítulo II do Título VI da Constituição.

§ 1º A responsabilidade na gestão fiscal pressupõe a ação planejada e transparente, em que se previnem riscos e corrigem desvios capazes de afetar o equilíbrio das contas públicas, mediante o cumprimento de metas de resultados entre receitas e despesas e a obediência a limites e condições no que tange a renúncia de receita, geração de despesas com pessoal, da seguridade social e outras, dívidas consolidada e mobiliária, operações de crédito, inclusive por antecipação de receita, concessão de garantia e inscrição em Restos a Pagar.

§ 2º As disposições desta Lei Complementar obrigam a União, os Estados, o Distrito Federal e os Municípios.

Art. 2º Para os efeitos desta Lei Complementar, entende-se como:
I - ente da Federação: a União, cada Estado, o Distrito Federal e cada Município;
II - empresa controlada: sociedade cuja maioria do capital social com direito a voto pertença, direta ou indiretamente, a ente da Federação;
III - empresa estatal dependente: empresa controlada que receba do ente controlador recursos financeiros para pagamento de despesas com pessoal ou de custeio em geral ou de capital.

CAPÍTULO II - DO PLANEJAMENTO

Art. 4º A lei de diretrizes orçamentárias atenderá o disposto no § 2º do art. 165 da Constituição e:
I - disporá também sobre:
a) equilíbrio entre receitas e despesas;
b) critérios e forma de limitação de empenho;
e) normas relativas ao controle de custos e à avaliação dos resultados dos programas financiados com recursos dos orçamentos;

§ 1º Integrará o projeto de lei de diretrizes orçamentárias Anexo de Metas Fiscais, em que serão estabelecidas metas anuais, em valores correntes e constantes, relativas a receitas, despesas, resultados nominal e primário e montante da dívida pública.

CAPÍTULO IX - DA TRANSPARÊNCIA, CONTROLE E FISCALIZAÇÃO

Art. 48. São instrumentos de transparência da gestão fiscal, aos quais será dada ampla divulgação, inclusive em meios eletrônicos de acesso público: os planos, orçamentos e leis de diretrizes orçamentárias; as prestações de contas e o respectivo parecer prévio; o Relatório Resumido da Execução Orçamentária e o Relatório de Gestão Fiscal.

§ 1º A transparência será assegurada também mediante:
I – incentivo à participação popular e realização de audiências públicas;
II – liberação ao pleno conhecimento e acompanhamento da sociedade, em tempo real, de informações pormenorizadas sobre a execução orçamentária e financeira;
III – adoção de sistema integrado de administração financeira e controle.

Art. 49. As contas apresentadas pelo Chefe do Poder Executivo ficarão disponíveis, durante todo o exercício, no respectivo Poder Legislativo e no órgão técnico responsável pela sua elaboração, para consulta e apreciação pelos cidadãos e instituições da sociedade.`,
  },
  {
    sigla: "LT", nome: "Lei da Transparência", lei: "LC nº 131/2009",
    desc: "Acrescenta dispositivos à LRF para transparência em tempo real.",
    conteudo: `LEI COMPLEMENTAR Nº 131, DE 27 DE MAIO DE 2009

Acrescenta dispositivos à Lei Complementar nº 101, de 4 de maio de 2000, a fim de determinar a disponibilização, em tempo real, de informações pormenorizadas sobre a execução orçamentária e financeira da União, dos Estados, do Distrito Federal e dos Municípios.

Art. 1º O art. 48 da Lei Complementar nº 101, de 4 de maio de 2000, passa a vigorar com a seguinte redação:

"Art. 48. ........................................................
Parágrafo único. A transparência será assegurada também mediante:
I – incentivo à participação popular e realização de audiências públicas, durante os processos de elaboração e discussão dos planos, lei de diretrizes orçamentárias e orçamentos;
II – liberação ao pleno conhecimento e acompanhamento da sociedade, em tempo real, de informações pormenorizadas sobre a execução orçamentária e financeira, em meios eletrônicos de acesso público;
III – adoção de sistema integrado de administração financeira e controle, que atenda a padrão mínimo de qualidade estabelecido pelo Poder Executivo da União." (NR)

Art. 2º A Lei Complementar nº 101, de 4 de maio de 2000, passa a vigorar acrescida dos seguintes artigos:

"Art. 48-A. Para os fins a que se refere o inciso II do parágrafo único do art. 48, os entes da Federação disponibilizarão a qualquer pessoa física ou jurídica o acesso a informações referentes a:
I – quanto à despesa: todos os atos praticados pelas unidades gestoras no decorrer da execução da despesa, no momento de sua realização, com a disponibilização mínima dos dados referentes ao número do correspondente processo, ao bem fornecido ou ao serviço prestado, à pessoa física ou jurídica beneficiária do pagamento e, quando for o caso, ao procedimento licitatório realizado;
II – quanto à receita: o lançamento e o recebimento de toda a receita das unidades gestoras, inclusive referente a recursos extraordinários."

"Art. 73-A. Qualquer cidadão, partido político, associação ou sindicato é parte legítima para denunciar ao respectivo Tribunal de Contas e ao órgão competente do Ministério Público o descumprimento das prescrições estabelecidas nesta Lei Complementar."

"Art. 73-B. Ficam estabelecidos os seguintes prazos para o cumprimento:
I – 1 (um) ano para a União, os Estados, o Distrito Federal e os Municípios com mais de 100.000 habitantes;
II – 2 (dois) anos para os Municípios que tenham entre 50.000 e 100.000 habitantes;
III – 4 (quatro) anos para os Municípios que tenham até 50.000 habitantes."

"Art. 73-C. O não atendimento, até o encerramento dos prazos previstos no art. 73-B, sujeita o ente à sanção prevista no inciso I do § 3º do art. 23."

Art. 3º Esta Lei Complementar entra em vigor na data de sua publicação.`,
  },
  {
    sigla: "LOS", nome: "Lei de Ouvidorias / Serviços ao Usuário", lei: "Lei nº 13.460/2017",
    desc: "Dispõe sobre participação, proteção e defesa dos direitos do usuário dos serviços públicos.",
    conteudo: `LEI Nº 13.460, DE 26 DE JUNHO DE 2017

Dispõe sobre participação, proteção e defesa dos direitos do usuário dos serviços públicos da administração pública.

CAPÍTULO I - DISPOSIÇÕES PRELIMINARES

Art. 1º Esta Lei estabelece normas básicas para participação, proteção e defesa dos direitos do usuário dos serviços públicos prestados direta ou indiretamente pela administração pública.

§ 1º O disposto nesta Lei aplica-se à administração pública direta e indireta da União, dos Estados, do Distrito Federal e dos Municípios.

Art. 2º Para os fins desta Lei, consideram-se:
I - usuário - pessoa física ou jurídica que se beneficia ou utiliza, efetiva ou potencialmente, de serviço público;
II - serviço público - atividade administrativa ou de prestação direta ou indireta de bens ou serviços à população;
III - administração pública - órgão ou entidade integrante da administração pública de qualquer dos Poderes;
IV - agente público - quem exerce cargo, emprego ou função pública;
V - manifestações - reclamações, denúncias, sugestões, elogios e demais pronunciamentos de usuários.

CAPÍTULO II - DOS DIREITOS BÁSICOS E DEVERES DOS USUÁRIOS

Art. 5º O usuário de serviço público tem direito à adequada prestação dos serviços, devendo os agentes públicos observar as seguintes diretrizes:
I - urbanidade, respeito, acessibilidade e cortesia no atendimento;
II - presunção de boa-fé do usuário;
III - atendimento por ordem de chegada, ressalvados casos de urgência;
IV - igualdade no tratamento aos usuários;
V - cumprimento de prazos e normas procedimentais;
VI - definição, manutenção e atualização das Cartas de Serviços ao Usuário.

Art. 6º São direitos básicos do usuário:
I - participação no acompanhamento da prestação e na avaliação dos serviços;
II - obtenção e utilização dos serviços com liberdade de escolha;
III - acesso e obtenção de informações relativas à sua pessoa;
IV - proteção de suas informações pessoais;
V - atuação integrada e sistêmica na expedição de atestados e certidões;
VI - obtenção de informações precisas e de fácil acesso.

CAPÍTULO IV - DAS OUVIDORIAS

Art. 13. As ouvidorias terão como atribuições precípuas:
I - promover a participação do usuário na administração pública;
II - acompanhar a prestação dos serviços;
III - propor aperfeiçoamentos na prestação dos serviços;
IV - auxiliar na prevenção e correção dos atos incompatíveis com os princípios desta Lei;
V - propor a adoção de medidas para a defesa dos direitos do usuário;
VI - receber, analisar e encaminhar às autoridades competentes as manifestações;
VII - promover a adoção de mediação e conciliação entre o usuário e o órgão ou entidade pública.`,
  },
  {
    sigla: "LGPD", nome: "Lei Geral de Proteção de Dados", lei: "Lei nº 13.709/2018",
    desc: "Dispõe sobre o tratamento de dados pessoais por pessoa natural ou jurídica.",
    conteudo: `LEI Nº 13.709, DE 14 DE AGOSTO DE 2018

Lei Geral de Proteção de Dados Pessoais (LGPD).

CAPÍTULO I - DISPOSIÇÕES PRELIMINARES

Art. 1º Esta Lei dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou por pessoa jurídica de direito público ou privado, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa natural.

Art. 2º A disciplina da proteção de dados pessoais tem como fundamentos:
I - o respeito à privacidade;
II - a autodeterminação informativa;
III - a liberdade de expressão, de informação, de comunicação e de opinião;
IV - a inviolabilidade da intimidade, da honra e da imagem;
V - o desenvolvimento econômico e tecnológico e a inovação;
VI - a livre iniciativa, a livre concorrência e a defesa do consumidor;
VII - os direitos humanos, o livre desenvolvimento da personalidade, a dignidade e o exercício da cidadania.

Art. 5º Para os fins desta Lei, considera-se:
I - dado pessoal: informação relacionada a pessoa natural identificada ou identificável;
II - dado pessoal sensível: dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato, dado referente à saúde ou à vida sexual, dado genético ou biométrico;
III - dado anonimizado: dado relativo a titular que não possa ser identificado;
IV - banco de dados: conjunto estruturado de dados pessoais;
V - titular: pessoa natural a quem se referem os dados pessoais;
VI - controlador: pessoa natural ou jurídica a quem competem as decisões referentes ao tratamento;
VII - operador: pessoa natural ou jurídica que realiza o tratamento em nome do controlador;
VIII - encarregado: pessoa indicada pelo controlador para atuar como canal de comunicação com a ANPD.

CAPÍTULO II - DO TRATAMENTO DE DADOS PESSOAIS

Art. 7º O tratamento de dados pessoais somente poderá ser realizado nas seguintes hipóteses:
I - mediante o fornecimento de consentimento pelo titular;
II - para o cumprimento de obrigação legal ou regulatória pelo controlador;
III - pela administração pública, para o tratamento e uso compartilhado de dados necessários à execução de políticas públicas;
IV - para a realização de estudos por órgão de pesquisa;
V - quando necessário para a execução de contrato;
VI - para o exercício regular de direitos em processo judicial, administrativo ou arbitral;
VII - para a proteção da vida ou da incolumidade física do titular ou de terceiro;
VIII - para a tutela da saúde;
IX - quando necessário para atender aos interesses legítimos do controlador;
X - para a proteção do crédito.

CAPÍTULO III - DOS DIREITOS DO TITULAR

Art. 17. Toda pessoa natural tem assegurada a titularidade de seus dados pessoais e garantidos os direitos fundamentais de liberdade, de intimidade e de privacidade.

Art. 18. O titular dos dados pessoais tem direito a obter do controlador, a qualquer momento e mediante requisição:
I - confirmação da existência de tratamento;
II - acesso aos dados;
III - correção de dados incompletos, inexatos ou desatualizados;
IV - anonimização, bloqueio ou eliminação de dados desnecessários;
V - portabilidade dos dados a outro fornecedor;
VI - eliminação dos dados pessoais tratados com o consentimento;
VII - informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado;
VIII - informação sobre a possibilidade de não fornecer consentimento;
IX - revogação do consentimento.`,
  },
  {
    sigla: "DA", nome: "Dados Abertos", lei: "Decreto nº 8.777/2016",
    desc: "Institui a Política de Dados Abertos do Poder Executivo Federal.",
    conteudo: `DECRETO Nº 8.777, DE 11 DE MAIO DE 2016

Institui a Política de Dados Abertos do Poder Executivo federal.

Art. 1º Fica instituída a Política de Dados Abertos do Poder Executivo federal, com os seguintes objetivos:
I - promover a publicação de dados contidos em bases de dados de órgãos e entidades da administração pública federal sob a forma de dados abertos;
II - aprimorar a cultura de transparência pública;
III - franquear aos cidadãos o acesso, de forma aberta, aos dados produzidos ou acumulados pelo Poder Executivo federal;
IV - facilitar o intercâmbio de dados entre órgãos e entidades da administração pública federal;
V - fomentar o controle social e o desenvolvimento de novas tecnologias;
VI - fomentar a pesquisa científica de base empírica sobre a gestão pública;
VII - promover o desenvolvimento tecnológico e a inovação;
VIII - promover o compartilhamento de recursos de tecnologia da informação.

Art. 2º Para os fins deste Decreto, considera-se:
I - dados - sequência de símbolos ou valores, representados em algum meio, produzidos como resultado de um processo natural ou artificial;
II - dados abertos - dados acessíveis ao público, representados em meio digital, estruturados em formato aberto, processáveis por máquina, referenciados na internet e disponibilizados sob licença aberta;
III - formato aberto - formato de arquivo não proprietário, cuja especificação esteja documentada publicamente e seja de livre conhecimento e implementação.

Art. 3º A Política de Dados Abertos será regida pelos seguintes princípios e diretrizes:
I - observância da publicidade das bases de dados como preceito geral e do sigilo como exceção;
II - garantia de acesso irrestrito às bases de dados, legíveis por máquina e em formato aberto;
III - descrição das bases de dados, com informação suficiente sobre a estrutura e semântica;
IV - permissão irrestrita de reuso das bases de dados publicadas;
V - completude e interoperabilidade das bases de dados;
VI - atualização periódica;
VII - designação clara de responsável pela publicação, atualização e manutenção de cada base.`,
  },
  {
    sigla: "LL", nome: "Lei de Licitações", lei: "Lei nº 14.133/2021",
    desc: "Nova lei de licitações e contratos administrativos.",
    conteudo: `LEI Nº 14.133, DE 1º DE ABRIL DE 2021

Lei de Licitações e Contratos Administrativos.

TÍTULO I - DISPOSIÇÕES PRELIMINARES

Art. 1º Esta Lei estabelece normas gerais de licitação e contratação para as Administrações Públicas diretas, autárquicas e fundacionais da União, dos Estados, do Distrito Federal e dos Municípios.

Art. 2º Esta Lei aplica-se a:
I - alienação e concessão de direito real de uso de bens;
II - compra, inclusive por encomenda;
III - locação;
IV - concessão e permissão de uso de bens públicos;
V - prestação de serviços, inclusive os técnicos profissionais especializados;
VI - obras e serviços de arquitetura e engenharia;
VII - contratações de tecnologia da informação e de comunicação.

CAPÍTULO II - DOS PRINCÍPIOS

Art. 5º Na aplicação desta Lei, serão observados os princípios da legalidade, da impessoalidade, da moralidade, da publicidade, da eficiência, do interesse público, da probidade administrativa, da igualdade, do planejamento, da transparência, da eficácia, da segregação de funções, da motivação, da vinculação ao edital, do julgamento objetivo, da segurança jurídica, da razoabilidade, da competitividade, da proporcionalidade, da celeridade, da economicidade e do desenvolvimento nacional sustentável.

Art. 6º Para os fins desta Lei, consideram-se:
XXXVIII - licitação: processo pelo qual a Administração Pública seleciona a proposta mais vantajosa;
XXXIX - contratação direta: hipótese que compreende os casos de inexigibilidade e de dispensa de licitação;
XLI - modalidade de licitação: forma de condução do processo licitatório.

Art. 28. São modalidades de licitação:
I - pregão;
II - concorrência;
III - concurso;
IV - leilão;
V - diálogo competitivo.

CAPÍTULO XII - DO PORTAL NACIONAL DE CONTRATAÇÕES PÚBLICAS (PNCP)

Art. 174. É criado o Portal Nacional de Contratações Públicas (PNCP), sítio eletrônico oficial destinado à:
I - divulgação centralizada e obrigatória dos atos exigidos por esta Lei;
II - realização facultativa das contratações pelos órgãos e entidades de todos os entes federativos.

Art. 175. No PNCP serão divulgados:
I - planos de contratação anuais;
II - catálogos eletrônicos de padronização;
III - editais de credenciamento;
IV - avisos de contratação direta;
V - editais de licitação;
VI - atas de registro de preços;
VII - contratos e termos aditivos;
VIII - notas fiscais eletrônicas.`,
  },
  {
    sigla: "PNCP", nome: "Portal Nacional de Contratações Públicas", lei: "Art. 174 da Lei 14.133/2021",
    desc: "Plataforma centralizada de divulgação de contratações públicas.",
    conteudo: `PORTAL NACIONAL DE CONTRATAÇÕES PÚBLICAS (PNCP)

Conforme estabelecido nos artigos 174 a 176 da Lei nº 14.133/2021:

Art. 174. É criado o Portal Nacional de Contratações Públicas (PNCP), sítio eletrônico oficial destinado à:
I - divulgação centralizada e obrigatória dos atos exigidos por esta Lei;
II - realização facultativa das contratações pelos órgãos e entidades dos Poderes Executivo, Legislativo e Judiciário de todos os entes federativos.

§ 1º Cada ente federativo poderá estabelecer o seu sistema eletrônico próprio de contratações, desde que garanta a integração automática dos dados ao PNCP.

§ 2º Os entes federativos poderão utilizar o PNCP para a realização de seus processos licitatórios e de contratações.

Art. 175. No PNCP serão divulgados, sem prejuízo dos demais atos previstos nesta Lei:
I - planos de contratação anuais, devidamente aprovados;
II - catálogos eletrônicos de padronização de compras, serviços e obras;
III - editais de credenciamento;
IV - avisos de contratação direta;
V - editais de licitação, inclusive os de pré-qualificação;
VI - atas de registro de preços;
VII - contratos, atas e termos aditivos;
VIII - notas fiscais eletrônicas, quando for o caso.

§ 1º A divulgação dos atos no PNCP é condição de eficácia desses atos e corresponde à publicidade exigida nesta Lei.

§ 2º O PNCP garantirá o acesso gratuito às informações nele constantes.

Art. 176. Os Municípios com até 20.000 habitantes terão o prazo de 6 anos, contado da data de publicação desta Lei, para cumprimento das obrigações referidas no art. 175.

O PNCP tem como objetivos:
• Centralizar a publicidade de todos os atos de licitações e contratações públicas;
• Promover a transparência e o controle social das contratações;
• Facilitar o acesso dos fornecedores a oportunidades de contratação;
• Padronizar a divulgação de informações;
• Garantir o cumprimento dos princípios constitucionais da publicidade e da transparência.

O portal pode ser acessado em: https://www.gov.br/pncp`,
  },
];

const glossario = [
  { termo: "Empenho", def: "Ato emanado de autoridade competente que cria para o Estado obrigação de pagamento." },
  { termo: "Liquidação", def: "Verificação do direito adquirido pelo credor, com base em títulos e documentos comprobatórios." },
  { termo: "Pagamento", def: "Despacho exarado por autoridade competente, determinando que a despesa seja paga." },
  { termo: "RREO", def: "Relatório Resumido da Execução Orçamentária – publicado bimestralmente." },
  { termo: "RGF", def: "Relatório de Gestão Fiscal – publicado quadrimestralmente." },
  { termo: "PPA", def: "Plano Plurianual – instrumento de planejamento de médio prazo (4 anos)." },
  { termo: "LDO", def: "Lei de Diretrizes Orçamentárias – orienta a elaboração e execução do orçamento anual." },
  { termo: "LOA", def: "Lei Orçamentária Anual – estima as receitas e fixa as despesas do governo." },
  { termo: "Dotação Orçamentária", def: "Valor monetário autorizado na LOA para atender determinada despesa." },
  { termo: "Fonte de Recurso", def: "Classificação que identifica a origem dos recursos para financiar as despesas." },
  { termo: "Elemento de Despesa", def: "Identificação dos objetos de gasto (material, serviços, obras etc.)." },
  { termo: "Modalidade Licitatória", def: "Forma pela qual se conduz o procedimento licitatório." },
];

const ReferenciasPage = () => {
  const [selectedNorma, setSelectedNorma] = useState<Norma | null>(null);

  return (
    <TransparencyLayout title="Glossário e Referências Normativas" description="Termos técnicos, legislação e base legal da transparência pública."
      breadcrumbs={[{ label: "Início", href: "/" }, { label: "Transparência", href: "/transparencia" }, { label: "Referências Normativas" }]}>
      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
            <h2 className="text-2xl font-bold text-foreground">Legislação Aplicável</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normas.map((n, i) => (
              <motion.div key={n.sigla} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl border shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedNorma(n)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1.5 rounded-lg">{n.sigla}</span>
                    <h3 className="font-bold text-foreground text-sm">{n.nome}</h3>
                  </div>
                  <button
                    className="p-2 rounded-xl bg-primary/5 hover:bg-primary/15 text-primary transition-all opacity-60 group-hover:opacity-100"
                    title="Visualizar lei completa"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-primary font-semibold mb-1.5">{n.lei}</p>
                <p className="text-sm text-muted-foreground">{n.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center"><BookOpen className="h-5 w-5 text-secondary" /></div>
            <h2 className="text-2xl font-bold text-foreground">Glossário de Termos Técnicos</h2>
          </div>
          <div className="bg-card rounded-2xl border shadow-sm divide-y divide-border/30">
            {glossario.map((g) => (
              <div key={g.termo} className="px-6 py-4 hover:bg-muted/20 transition-colors">
                <h3 className="font-bold text-foreground text-sm">{g.termo}</h3>
                <p className="text-sm text-muted-foreground mt-1">{g.def}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal de visualização da lei completa */}
      <Dialog open={!!selectedNorma} onOpenChange={() => setSelectedNorma(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-card">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary font-bold text-sm px-3 py-1.5 rounded-lg">{selectedNorma?.sigla}</span>
              <div>
                <DialogTitle className="text-lg">{selectedNorma?.nome}</DialogTitle>
                <p className="text-xs text-primary font-semibold mt-0.5">{selectedNorma?.lei}</p>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="h-[65vh]">
            <div className="px-6 py-5">
              <div className="bg-muted/20 rounded-xl border border-border/40 p-6">
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {selectedNorma?.conteudo}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center italic">
                Texto reproduzido para fins de consulta. Para o texto oficial e atualizado, consulte o portal da legislação federal (planalto.gov.br).
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </TransparencyLayout>
  );
};

export default ReferenciasPage;
