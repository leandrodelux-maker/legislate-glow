---
name: admin-sync-v1
description: Sincronização completa de dados estáticos para o banco de dados e criação de painéis administrativos ausentes.
type: feature
---

# Revisão e Sincronização Administrativa

Este plano visa garantir que todas as informações editáveis do site possuam uma interface no painel administrativo e que dados previamente estáticos sejam migrados para o banco de dados.

## 1. Migração de Dados Estáticos (SQL)
Sincronizar dados que atualmente estão "hardcoded" em arquivos `.tsx` ou `.ts` para tabelas do banco de dados:
- **FAQ**: Migrar dados de `src/routes/perguntas-frequentes.tsx` para uma nova tabela `faq`.
- **Roteiro das Sessões**: Migrar etapas de `src/routes/a-camara.roteiro-das-sessoes.tsx` para `roteiro_sessoes`.
- **Acesso Rápido**: Migrar itens de `src/lib/quick-access-store.ts` para a tabela `acesso_rapido` (atualmente no localStorage).

## 2. Novos Módulos Administrativos
Criar interfaces CRUD para as tabelas migradas:
- **Admin FAQ**: `/admin/cms/faq`
- **Admin Roteiro**: `/admin/cms/roteiro-sessoes`
- **Admin Acesso Rápido**: `/admin/acesso-rapido` (vinculado ao DB)
- **Admin Galeria Geral**: `/admin/cms/galeria` (para fotos da cidade/eventos)

## 3. Refatoração de Páginas Públicas
Atualizar as rotas para consumir dados do banco via Supabase/TanStack Query:
- `src/routes/perguntas-frequentes.tsx`
- `src/routes/a-camara.roteiro-das-sessoes.tsx`
- `src/components/home/quick-access.tsx`

## 4. Auditoria de Menus e Links
- Garantir que todos os links no `AdminSidebar` apontem para páginas funcionais.
- Adicionar sincronização para a página de LGPD (DPO e canais).

## Detalhes Técnicos
- Uso de `CrudPage` para acelerar o desenvolvimento das telas admin.
- Migrações SQL com `GRANT` explícito para `authenticated`.
- Implementação de hooks `useFAQ`, `useRoteiro`, etc.
