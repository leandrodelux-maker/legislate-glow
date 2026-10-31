# Checklist do Painel Admin

Revisão de 31/10/2026. Critério: a tela só fica se o que ela grava aparece no site, ou se ela é necessária para operar o painel. As tabelas continuam no banco; só as telas saíram.

## Telas que ficaram (20 arquivos, 18 no menu)

| Grupo | Tela | Rota | Aparece em |
|---|---|---|---|
| Visão geral | Dashboard | `/admin/dashboard` | Só no painel |
| Legislativo | Vereadores | `/admin/vereadores` | Vereadores, Início |
| Legislativo | Mandatos | `/admin/vereadores/mandatos` | Perfil do vereador |
| Legislativo | Galeria dos Vereadores | `/admin/vereadores/galeria` | Perfil do vereador |
| Legislativo | Mesa Diretora | `/admin/mesa-diretora` | A Câmara, Início |
| Legislativo | Comissões e Membros | `/admin/comissoes`, `/admin/comissoes-membros` | A Câmara |
| Legislativo | Documentos Oficiais | `/admin/documentos-oficiais` | Lei Orgânica, Regimento, Carta de Serviços |
| Legislativo | Projetos | `/admin/projetos` | Projetos, Início, Perfil do vereador |
| Legislativo | Sessões | `/admin/sessoes` | Sessões, Início, Perfil do vereador |
| Comunicação | Notícias e Categorias | `/admin/noticias`, `/admin/cms/categorias` | Notícias |
| Comunicação | Acesso Rápido | `/admin/acesso-rapido` | Início (ver pendência 3) |
| Atendimento | e-SIC | `/admin/cms/esic` | Recebe os pedidos de `/e-sic` |
| Atendimento | Ouvidoria | `/admin/cms/ouvidoria` | Sem entrada de dados (ver pendência 1) |
| Sistema | Usuários e Permissões | `/admin/usuarios` | Acesso ao painel |
| Configurações | Geral | `/admin/configuracoes/geral` | Cabeçalho, rodapé, contato |
| Configurações | Página Inicial e Logotipos | `/admin/configuracoes-site` | Início, logotipos, transmissão |

## Telas removidas (24)

| Tela | Motivo |
|---|---|
| Painel Executivo | Duplicava o Dashboard e usava números aleatórios (`Math.random`) |
| Auditoria, Central de Atividades e Notificações | Nada no sistema grava nessas tabelas: sempre vazias |
| Config | Tela de demonstração, não gravava em lugar nenhum |
| Comunicação (2 telas) | Duplicava Notícias |
| Sessões Extras | Duplicava Sessões e não tinha link |
| Páginas (2 telas), Banners, Popups, Galeria, Diário Oficial | Nenhuma página do site lê esses dados |
| Identidade Visual, Menu do Site, SEO, LGPD, Home Page | O site não usa cores, fontes, menu, SEO nem textos gravados ali. O conteúdo útil de Home Page já está em Página Inicial e Logotipos |
| Transparência Ativa, Links, Documentos, Licitações, Contratos, Folha, Prestação de Contas | Substituídas pelo painel da Transparência, que lê o banco analítico |

## Ajustes nas telas que ficaram

- **Geral:** saíram o brasão e o texto do rodapé, que o site não usa.
- **Página Inicial e Logotipos:** saiu o bloco de contato, repetido em Geral.
- **Dashboard:** o cartão Documentos agora conta os Documentos Oficiais, e saiu o cartão Acessos, que nunca teve valor.
- **Busca do topo:** aponta só para telas que existem.

## Pendências

1. **Ouvidoria e SIC em `/contato`:** corrigidos em 31/10/2026; agora gravam no banco do site. Falta o teste com um envio real.
2. **Consultar protocolo:** o botão em `/contato` não tem ação.
3. **Acesso Rápido:** grava só no navegador de quem edita. Os visitantes continuam vendo a lista padrão.
4. **Indicadores da página inicial:** Licitações, Contratos, Documentos e Prestações de Contas contam tabelas vazias e sempre mostram 0. Precisam ler o banco analítico.
5. **Novas opções do painel:** a gravar no banco analítico.

## Novo modelo do painel (31/10/2026)

- **Base:** `src/components/admin/painel/modulos.ts` define grupos, cores e telas; `PaginaModulo.tsx` monta o cabeçalho e os indicadores; `crud-page.tsx` monta filtros, cartões, tabela e formulário.
- **Formulário:** painel lateral com seções, validação nos campos, rascunho automático e Ctrl+S. Para criar uma tela, informe `secoes`, `filtros`, `indicadores` e `cartao`.
- **Atendimento:** `CaixaAtendimento.tsx` atende Ouvidoria e e-SIC. Não há cadastro manual de pedidos nessas telas.
- **Testes:** falta conferir com login real o envio de PDF, as gravações e a tela de usuários.
