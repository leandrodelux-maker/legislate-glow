# Portal da Transparência da Câmara

O painel em `/transparencia` é o mesmo modelo do projeto base `D:\GITHUB\TRANSPARENCIA`, dentro do cabeçalho e do rodapé do site. A Câmara continua publicando no Megasoft. O GitHub Actions copia os dados para um banco analítico próprio, e o site lê desse banco.

**O banco analítico não é o banco do site (Lovable).** Por isso os arquivos dele ficam em `banco-transparencia/`, fora da pasta `supabase/`.

Para instalar em outro site, siga o [modelo de implantação](IMPLANTACAO-TRANSPARENCIA.md).

## Colocar no ar

1. **Crie o banco analítico** da Câmara e rode, nesta ordem, os arquivos de `banco-transparencia/migrations/`, de `001` a `005`, no SQL Editor.
2. **Publique a função de documentos** `banco-transparencia/functions/portal-documento` nesse banco, com o secret `PORTAL_BASE_URL=https://camaraadelandia.megasofttransparencia.com.br`. Sem ela, RREO, RGF, PPA, LDO, LOA e os anexos não abrem.
3. **Configure o site** com estas variáveis, no `.env` para rodar no computador e no ambiente de publicação do site:
   ```
   VITE_TRANSPARENCIA_SUPABASE_URL=https://endereco-do-banco
   VITE_TRANSPARENCIA_SUPABASE_ANON_KEY=chave-publica-do-banco
   ```
4. **Configure o GitHub**, em Settings → Secrets and variables → Actions:

   | Tipo | Nome | Valor |
   |---|---|---|
   | Variable | `SUPABASE_URL` | Endereço do banco analítico |
   | Secret | `TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` do banco analítico |
   | Secret | `FIRECRAWL_API_KEY` | Chave do Firecrawl |

5. **Faça a primeira carga:** `gh workflow run sync-transparencia.yml -f dataset=todos`.

Enquanto `SUPABASE_URL` não existir, a sincronização fica parada. As páginas abrem, mas as listas ficam vazias.

A chave `service_role` nunca vai para o `.env` nem para o código do site.

## O que fica onde

| Conteúdo | Onde |
|---|---|
| Receitas, despesas, licitações, contratos, servidores e demais consultas | Banco analítico, copiado do Megasoft |
| Pedidos de e-SIC | `/e-sic`, tabela `esic_solicitacoes` do banco do site, respondidos no painel do site |
| Ouvidoria e consulta de protocolo | `/contato`, banco do site |
| LGPD e identificação da Câmara | `/lgpd` e `src/config/municipio.json` |

O portal Megasoft da Câmara informa "Implantacao" como cidade. Por isso `src/config/municipio.json` foi preenchido à mão: **não rode o `npm run municipio` neste projeto.**

## Como as páginas foram trazidas

- As páginas ficam em `src/pages/transparency/` e `src/components/transparency/`, com os mesmos nomes da base.
- `src/lib/roteador-transparencia.tsx` faz as páginas da base funcionarem no roteador do site.
- `src/pages/transparency/rotas.tsx` lista as rotas. Os arquivos `src/routes/transparencia.index.tsx` e `transparencia.$.tsx` as abrem.
- O guia da sincronização está em `docs/SINCRONIZACAO.md` no projeto base.

## Legislação pelo painel

Estes itens não vêm mais do Megasoft e saíram da sincronização:

| Item | Onde cadastrar | Banco |
|---|---|---|
| Legislação Municipal, Outras Publicações, Atividades Legislativas, Pauta das Comissões, Leis e Atos Infralegais | Painel, Publicações | Analítico |
| Atas e Pauta do Plenário | Painel, Sessões | Site |
| Votações Nominais | Painel, Sessões (Votos) | Site |
| Projetos de Leis | Painel, Projetos | Site |
| Composição da Casa | Painel, Vereadores | Site |

O site lê os dados em `src/lib/fontes-legislativas.ts`. As gravações no banco analítico passam por `src/lib/publicacoes.functions.ts`.

Para ativar:

1. Rode `banco-transparencia/migrations/006_publicacoes.sql` no banco analítico.
2. Defina `TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY` nos secrets do servidor do site. No computador, use um arquivo `.env.local`, que fica fora do Git. Nunca coloque essa chave no `.env`.
3. Abra Publicações no painel e clique em Importar do portal para trazer o que já está no Megasoft.

## Diferenças para o painel de Prefeitura

O menu segue o portal Megasoft da Câmara. Saíram do catálogo, das rotas e da sincronização:

- **Receitas e Despesas:** Renúncias Fiscais, Dívida Ativa e Incentivos a Projetos Culturais. COVID-19 não entra no painel.
- **Licitações e Obras:** Atas de Adesão e Acordos sem Transferência de Recursos.
- **Planejamento:** ficam Ações e Projetos, Planos e Parecer Prévio.
- **Responsabilidade Fiscal:** fica só o RGF.
- **Legislação:** saiu Vídeos e entraram os 10 itens da atividade legislativa, como Atas das Sessões e Votações Nominais.

Ao trazer uma correção do projeto base, não recoloque esses itens.
