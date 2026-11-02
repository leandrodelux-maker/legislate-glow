# Modelo de implantação: Transparência e painel

Guia para instalar o Portal da Transparência e o painel administrativo em outro site de Câmara, usando este projeto como modelo. Vale para órgãos que publicam no portal Megasoft.

Situação em 31/10/2026, na implantação de Adelândia. Os SQLs e o código não foram copiados para cá: este guia aponta para os arquivos reais, para não ficar desatualizado.

## Como funciona

```
Megasoft (portal do órgão)
   │  GitHub Actions + navegador do Firecrawl
   ▼
Banco analítico (Supabase) ◄── painel: Publicações e Matriz Atricon
   │  leitura com chave pública
   ▼
Site, em /transparencia ◄── banco do site: sessões, votos, projetos, vereadores
```

São **dois bancos diferentes**:

| Banco | Guarda | Arquivos |
|---|---|---|
| Do site | Login, equipe, vereadores, sessões, votações, projetos, notícias, pedidos de e-SIC | `supabase/migrations/` |
| Analítico | Cópia do Megasoft, publicações, Matriz Atricon, configurações da transparência | `banco-transparencia/` |

## O que você vai precisar

- [ ] Endereço do portal Megasoft do órgão, como `https://cidade.megasofttransparencia.com.br`
- [ ] Repositório próprio no GitHub, com o Actions ativo
- [ ] Projeto Lovable ou outra hospedagem com funções de servidor
- [ ] Supabase do site
- [ ] Supabase analítico, com Edge Functions e Storage
- [ ] Conta no Firecrawl com o recurso de navegador (`interact`)
- [ ] Node.js 20 e GitHub CLI (`gh`) no computador
- [ ] Logotipo, telefone, e-mail, endereço e horário de atendimento

## Passo a passo

### 1. Copie o projeto

Crie o repositório novo a partir deste e instale as dependências:

```sh
git clone <este-repositorio> camara-cidade
cd camara-cidade
git remote set-url origin <repositorio-novo>
npm install
```

### 2. Crie o banco do site

Rode **todos** os arquivos de `supabase/migrations/`, em ordem de nome. No Lovable, isso acontece ao conectar o projeto.

A primeira pessoa cadastrada vira administradora automaticamente, mas o painel também exige conta aprovada. Depois do cadastro, rode:

```sql
update public.profiles
set aprovado = true
where id = (select id from auth.users where email = 'email@orgao.gov.br');
```

### 3. Crie o banco analítico

No SQL Editor, rode uma vez cada arquivo, nesta ordem:

| Ordem | Arquivo em `banco-transparencia/migrations/` | Cria |
|---|---|---|
| 1 | `001_transparencia.sql` | Registros, histórico de sincronização, configurações, tabelas institucionais e regras de acesso |
| 2 | `002_admin.sql` | Tabela de administradores e bucket `site` |
| 3 | `003_admin_conteudo.sql` | Regras de edição dos cadastros |
| 4 | `004_esic_completo.sql` | Funções de e-SIC, incluindo `estatisticas_sic`, usada no site |
| 5 | `005_email_smtp.sql` | Configuração de SMTP e fila de e-mails |
| 6 | `006_publicacoes.sql` | Publicações do painel |
| 7 | `007_matriz_atricon.sql` | Os 83 critérios da Matriz Atricon |

**Antes de rodar o 007:** os links dos critérios são caminhos deste site, como `/transparencia/estrutura`, e servem para outro órgão se as rotas não mudarem. Confira se a avaliação de 2026 ainda é a vigente. Ajustes podem ser feitos depois na tela Matriz Atricon.

### 4. Função de documentos

Nada a publicar neste modelo: RREO, RGF, PPA, LDO, LOA e anexos passam pelo próprio site, em `/api/portal-documento` (`src/lib/portal-documento.ts`), usando o portal de `src/config/municipio.json`. A versão para o Supabase continua em `banco-transparencia/functions/portal-documento`, caso a hospedagem do site não aguente arquivos grandes.

### 5. Ajuste os dados do órgão

**`src/config/municipio.json`**

```json
{
  "portal": "https://cidade.megasofttransparencia.com.br",
  "cidade": "Nome da Cidade",
  "uf": "GO",
  "logo": "",
  "tribunal": "TCM-GO",
  "orgaoPrincipal": 1,
  "orgaos": {
    "1": "CAMARA MUNICIPAL DE NOME DA CIDADE",
    "2": "PODER EXECUTIVO"
  },
  "telefone": "(00) 00000-0000",
  "email": "contato@orgao.gov.br",
  "horario": "Segunda a Sexta 08h às 11h e 13h às 17h"
}
```

Os códigos de `orgaos` e o `orgaoPrincipal` vêm do portal do órgão: confira se são os mesmos. O comando `npm run municipio` só existe no projeto base. Além disso, o portal de Adelândia informa "Implantacao" como cidade, então o resultado sempre precisa ser revisado.

**Textos e endereços fixos que também mudam**

| Arquivo | O que trocar |
|---|---|
| `src/lib/publicacoes.functions.ts:10` | Constante `PORTAL`: **sem isso, Importar do portal traz dados de Adelândia** |
| `src/routes/transparencia.index.tsx` e `src/routes/transparencia.$.tsx` | Título e descrição |
| `src/routes/e-sic.tsx` | Título e descrição |
| `src/components/site-header.tsx` e `src/components/site-footer.tsx` | Nome e logotipo (`src/assets/logo-adelandia.png`) |
| `src/hooks/use-contact-info.ts` | Nome, endereço, telefone e e-mail padrão |

Para encontrar o restante, incluindo história, comissões, Lei Orgânica e Regimento:

```sh
git grep -il "adelandia\|adelândia" -- src scripts banco-transparencia
```

### 6. Configure as variáveis

**Site, no `.env` e na hospedagem.** Só valores públicos:

```env
SUPABASE_PROJECT_ID=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=

VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=

VITE_TRANSPARENCIA_SUPABASE_URL=
VITE_TRANSPARENCIA_SUPABASE_ANON_KEY=
```

**Servidor do site, como secret da hospedagem.** No computador, use o `.env.local`:

```env
TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY=
```

**GitHub**, em Settings → Secrets and variables → Actions:

| Tipo | Nome | Valor |
|---|---|---|
| Variable | `SUPABASE_URL` | Endereço do banco **analítico** |
| Secret | `TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` do banco analítico |
| Secret | `FIRECRAWL_API_KEY` | Chave do Firecrawl |

> **Segurança:** o `.env` vai para o Git. Nunca coloque nele uma chave `service_role`, nem no código do site.

### 7. Ajuste o agendamento

Em `.github/workflows/sync-transparencia.yml`, escolha horários diferentes dos outros órgãos se a conta do Firecrawl for compartilhada:

```yaml
- cron: "20 6 * * *"   # todos os conjuntos, uma vez ao dia
- cron: "50 * * * *"   # só o resumo, de hora em hora
```

Se mudar o segundo horário, atualize também a condição do `DATASET` na mesma linha do workflow, ou a execução horária vai copiar todos os conjuntos.

### 8. Faça a primeira carga

```sh
gh workflow run sync-transparencia.yml -f dataset=todos
gh run watch
```

Em Adelândia, cada carga levou de 16 a 17 minutos. Um órgão com mais registros pode levar mais.

### 9. Carregue os anos anteriores

As telas oferecem o ano atual e os **3 anteriores**. Dispare **um ano de cada vez**, esperando terminar: o GitHub mantém só uma execução na fila e cancela as que estiverem aguardando.

```sh
gh workflow run sync-transparencia.yml -f dataset=todos -f ano=2025
gh run watch
```

O erro `totais de 2025 não encontrados` em `resumo` é esperado em anos anteriores. Por causa dele, a execução aparece como falha no GitHub, mas os demais conjuntos são gravados.

Para gastar menos créditos, rode nos anos anteriores só os conjuntos que mudam por ano (veja a próxima seção).

### 10. Faça a conferência final

Rode no banco analítico:

```sql
-- Última execução de cada conjunto. A coluna "erro" também guarda avisos.
select distinct on (dataset, ano) dataset, ano, status, total_portal, total_gravado, erro, concluido_em
from transparencia_sincronizacoes
order by dataset, ano, iniciado_em desc;

-- Quantidade de registros por conjunto e ano
select dataset, ano, count(*) as registros
from transparencia_registros
group by dataset, ano
order by dataset, ano;
```

No site e no painel:

- [ ] `/transparencia` abre com os totais do ano atual
- [ ] Despesas, contratos e folha mostram dados, com filtro de ano funcionando
- [ ] Um anexo e um relatório fiscal (RREO ou RGF) abrem
- [ ] O login no painel funciona
- [ ] Publicações grava um item, que aparece no site
- [ ] Importar do portal traz dados **deste** órgão
- [ ] Matriz Atricon abre com os links corretos
- [ ] Um envio de teste em `/e-sic` chega ao painel
- [ ] Uma execução agendada aparece em Actions no dia seguinte

## Como cada conjunto trata o ano

São 48 conjuntos, definidos em `scripts/sync-transparencia/datasets.mjs`.

| Filtro | Qtd. | Rodar em ano anterior? | Conjuntos |
|---|---:|---|---|
| `ano` | 12 | Sim | `despesas`, `receitas`, `repasses`, `extra-orcamentaria`, `despesas-fixadas`, `restos-a-pagar`, `informacoes-consolidadas`, `transferencias-recebidas`, `licitacoes`, `contratos`, `dispensas`, `fiscais` |
| `datas` | 5 | Sim | `pagamentos`, `empenhos`, `liquidacao`, `ordem-de-fornecimento`, `diarias` |
| `meses` | 1 | Sim | `folha` |
| `dezembro` | 1 | Sim | `acoes-projetos` |
| `acumulado` | 26 | Não | Cadastros sem ano, como `patrimonio`, `servidores-ferias`, `servidores-licenca`, `obras`, `convenios`, `concursos` |
| `ultimo-mes` | 1 | Não | `remuneracao` |
| `anos` | 1 | Não | `estatisticas-esic`, que já traz a série inteira |
| Página inicial | 1 | Não | `resumo` |

Rodar um conjunto `acumulado` em ano anterior não causa erro, mas grava a mesma cópia naquele ano. Por isso esses conjuntos aparecem idênticos entre os anos.

Para rodar um conjunto específico:

```sh
gh workflow run sync-transparencia.yml -f dataset=licitacoes -f ano=2024
```

Para simular sem gravar no banco:

```sh
FIRECRAWL_API_KEY=... node scripts/sync-transparencia/sync.mjs licitacoes 2026 --dry-run
```

## Mapa dos arquivos

| Parte | Arquivos |
|---|---|
| Rotas públicas | `src/routes/transparencia.index.tsx`, `src/routes/transparencia.$.tsx`, `src/pages/transparency/rotas.tsx` |
| Páginas e componentes | `src/pages/transparency/`, `src/components/transparency/` |
| Menu e busca | `src/data/transparenciaCatalogo.ts` |
| Roteamento das páginas | `src/lib/roteador-transparencia.tsx` |
| Leitura dos dados | `src/hooks/useTransparenciaDataset.ts`, `src/integrations/transparencia/client.ts` |
| Itens vindos do painel | `src/lib/fontes-legislativas.ts` |
| Gravação pelo painel | `src/lib/publicacoes.functions.ts`, `src/lib/atricon.functions.ts` |
| Telas do painel | `src/routes/admin/publicacoes.tsx`, `src/routes/admin/matriz-atricon.tsx` |
| Estrutura do painel | `src/components/admin/painel/modulos.ts`, `src/components/admin/painel/PaginaModulo.tsx` |
| Sincronização | `.github/workflows/sync-transparencia.yml`, `scripts/sync-transparencia/` |
| Documentos do portal | `src/lib/portal-documento.ts`, `src/routes/api.portal-documento.ts` |

Mais detalhes em [TRANSPARENCIA.md](TRANSPARENCIA.md) (origem dos dados e diferenças para Prefeitura) e [CHECKLIST-PAINEL.md](CHECKLIST-PAINEL.md) (telas do painel e pendências).

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Listas vazias em todas as páginas | Faltam as variáveis `VITE_TRANSPARENCIA_*` ou a primeira carga | Revise os passos 6 e 8 |
| Workflow aparece como ignorado | Falta a variável `SUPABASE_URL` no GitHub | Revise o passo 6 |
| `Unexpected token '<'` ou `não fez a consulta de dados (/paginado)` em muitos conjuntos | Portal indisponível ou bloqueando o acesso. Em Adelândia, passou sozinho | Teste o portal e rode de novo. O script não repete essa chamada sozinho |
| Relatórios e anexos não abrem | Portal indisponível, ou o portal recusa chamadas da hospedagem | Abra `/api/portal-documento?lrf-periodos=2` e leia a mensagem |
| `Falta configurar no servidor a chave...` no painel | Secret ausente no servidor do site | Revise o passo 6 |
| `Sua conta não tem permissão` | Conta sem papel ou sem aprovação | Revise o passo 2 |
| `N registro(s) não puderam ser lidos` | Erro na API do próprio portal | Não é falha da sincronização. Confira se o dado abre no portal |
| Execuções intermediárias canceladas | Vários anos disparados de uma vez | Dispare um por vez |

## Limitações conhecidas

- **`informacoes-consolidadas`:** em Adelândia, 2024 e 2025 vieram zerados, contra 304 registros em 2026. A causa ainda não foi identificada.
- **`restos-a-pagar`:** os 3 registros são idênticos entre os anos, mesmo com filtro por ano. Ainda não foi verificado se o portal respeita o filtro.
- **`patrimonio`:** 32 registros não são lidos por erro da API do portal de Adelândia.
- **Sem nova tentativa:** se o portal ficar fora do ar durante a execução, os conjuntos afetados só voltam na próxima.
- **Lista vazia apaga a cópia:** se o portal responder lista vazia sem erro, os registros daquele conjunto e ano são apagados até a próxima sincronização correta.
- **E-mails do banco analítico:** a função `enviar-email`, que processa a fila criada pelo 005, não está neste repositório. Ela existe no projeto base (`supabase/functions/enviar-email`). Sem ela, os e-mails dessa fila não saem.
- **`estatisticas-esic`:** o ano inicial, 2016, está fixo em `datasets.mjs`. Confira se vale para o novo órgão.
- **Conjuntos vazios:** um conjunto que o portal não oferece pode terminar com zero registros ou erro. Confira o resultado na primeira carga.
- **Câmara e Prefeitura:** este modelo segue o menu de Câmara. Para Prefeitura, use o projeto base.
- **Teste real:** este roteiro ainda não foi executado do zero em outro órgão. A parte de código foi aplicada em Cachoeira de Goiás, mas o banco e a carga ainda não. Trate o próximo uso como validação e corrija aqui o que faltar.

## Site que já existe

O passo 1 serve para um site novo. Em Cachoeira de Goiás, que já tinha site próprio, os arquivos foram levados para o projeto existente. Nesse caso, confira:

- **Dependências:** as páginas precisam de `framer-motion` e `dompurify`.
- **Estilos:** leve de `src/styles.css` as variáveis `--font-editorial`, `--color-sun*` e `--shadow-soft`/`--shadow-elevated`, além do bloco do Portal da Transparência e dos utilitários `bg-hero` e `bg-band`.
- **`crud-page.tsx`:** Publicações e Matriz Atricon usam esta versão. Se a do site for outra, copie-a com outro nome e aponte só essas duas telas para ela, para não quebrar as demais.
- **`exigirEquipe`:** em `publicacoes.functions.ts`, a função lê `profiles.aprovado`. Se o banco do site não tiver a coluna, retire essa leitura, ou toda gravação será recusada.
- **Rota `/transparencia`:** apague o arquivo `src/routes/transparencia.tsx` antigo, se existir, e aponte os links para a rota nova.
- **Permissões de leitura:** confirme com a chave pública que `sessoes`, `sessoes_presencas`, `sessoes_votacoes`, `projetos_legislativos` e `vereadores` respondem sem erro.
- **Portal:** o nome do órgão em `orgaos` deve ser igual ao do portal, pois os totais de repasses dependem dessa comparação.

## Depois de implantar

- **Execução diária:** atualiza só o ano corrente. Anos anteriores continuam gravados, mas só mudam se forem rodados de novo.
- **Virada do ano:** depois que dezembro fechar no portal, rode o ano encerrado uma última vez.
- **Custo:** cada execução consome créditos do Firecrawl e minutos do GitHub Actions. O `resumo` sozinho roda 24 vezes por dia.
- **Agendamentos parados:** em repositório público, o GitHub desativa agendamentos após 60 dias sem atividade. Para reativar, use a aba Actions.
