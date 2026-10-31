# Portal da Transparência da Câmara de Cachoeira de Goiás

O painel em `/transparencia` segue o mesmo modelo do site da Câmara de Adelândia. A Câmara continua publicando no [portal Megasoft](https://camaracachoeiradegoias.megasofttransparencia.com.br). O GitHub Actions copia os dados para um banco analítico próprio, e o site lê desse banco.

**O banco analítico não é o banco do site (Lovable).** Os arquivos dele ficam em `banco-transparencia/`, fora da pasta `supabase/`.

## Colocar no ar

Enquanto estes passos não forem feitos, as páginas abrem, mas as listas ficam vazias.

1. **Crie um banco analítico só de Cachoeira.** Não reaproveite o de outro órgão: a sincronização apaga e regrava os registros.
2. **Rode no SQL Editor**, nesta ordem, os arquivos de `banco-transparencia/migrations/`, de `001` a `007`.
3. **Publique a função de documentos.** Sem ela, RREO, RGF, PPA, LDO, LOA e anexos não abrem:
   ```sh
   supabase functions deploy portal-documento --no-verify-jwt --project-ref <id-do-banco>
   supabase secrets set PORTAL_BASE_URL=https://camaracachoeiradegoias.megasofttransparencia.com.br --project-ref <id-do-banco>
   ```
   Em banco auto-hospedado, publique `banco-transparencia/functions/portal-documento` no servidor, com o mesmo secret e a verificação de JWT desligada.
4. **Configure o site**, no `.env` e na hospedagem:
   ```env
   VITE_TRANSPARENCIA_SUPABASE_URL=https://endereco-do-banco
   VITE_TRANSPARENCIA_SUPABASE_ANON_KEY=chave-publica-do-banco
   ```
5. **Configure o servidor do site** com o secret `TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY`. No computador, use o `.env.local`. Sem ele, Publicações e Matriz Atricon não funcionam no painel. Nunca coloque essa chave no `.env`.
6. **Configure o GitHub**, em Settings → Secrets and variables → Actions:

   | Tipo | Nome | Valor |
   |---|---|---|
   | Variable | `SUPABASE_URL` | Endereço do banco analítico |
   | Secret | `TRANSPARENCIA_SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` do banco analítico |
   | Secret | `FIRECRAWL_API_KEY` | Chave do Firecrawl |

7. **Envie o código ao GitHub** e faça a primeira carga:
   ```sh
   gh workflow run sync-transparencia.yml -f dataset=todos
   gh run watch
   ```
8. **Carregue os 3 anos anteriores**, um de cada vez, esperando cada um terminar:
   ```sh
   gh workflow run sync-transparencia.yml -f dataset=todos -f ano=2025
   ```
   O erro `totais de 2025 não encontrados` em `resumo` é esperado em anos anteriores.
9. **Abra Publicações no painel** e clique em Importar do portal.

## O que fica onde

| Conteúdo | Onde |
|---|---|
| Receitas, despesas, licitações, contratos, servidores e demais consultas | Banco analítico, copiado do Megasoft |
| Legislação Municipal, Outras Publicações, Atividades Legislativas, Pauta das Comissões, Leis e Atos Infralegais | Banco analítico, em Painel → Transparência → Publicações |
| Critérios da avaliação | Banco analítico, em Painel → Transparência → Matriz Atricon |
| Atas, pautas e votações | Banco do site, em Painel → Sessões |
| Projetos e Composição da Casa | Banco do site, em Painel → Projetos e Vereadores |
| Pedidos de e-SIC e Ouvidoria | Banco do site, em `/e-sic` e `/contato` |
| Identificação da Câmara usada no painel | `src/config/municipio.json` |

## Diferenças para o site de Adelândia

- **Formulário do painel:** as duas telas novas usam `src/components/admin/painel/CrudModulo.tsx`. O `crud-page.tsx` deste site é outro e continua atendendo às demais telas.
- **Permissão:** este banco não tem a coluna `profiles.aprovado`, então Publicações e Matriz Atricon exigem só o papel `admin` ou `editor`.
- **Horários:** a sincronização roda às 06:40 UTC e o resumo no minuto 10 de cada hora, para não coincidir com Adelândia.

Rotas antigas, como `/transparencia-portal`, redirecionam para `/transparencia`.
