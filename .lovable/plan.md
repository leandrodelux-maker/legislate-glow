# Módulo de Gestão de Vereadores

Vou entregar em **3 fases** porque o escopo é grande. Confirma se aprovo tudo ou se prefere parar em alguma fase.

## Fase 1 — Cadastro completo + Imagens (essencial)

### Banco de dados
Adicionar à tabela `vereadores` colunas faltantes:
- `cargo`, `telefone`, `email`, `redes_sociais` (jsonb: instagram, facebook, twitter, youtube), `data_posse`, `mandato_atual` (texto, ex: "2025–2028")
- `foto_url` já existe — vamos padronizar URL pública

Nova tabela `vereadores_mandatos` (histórico):
- `vereador_id`, `mandato` (ex "2021–2024"), `cargo_mesa` (presidente/vice/1º sec/2º sec/null), `partido`, `data_inicio`, `data_fim`

### Upload de imagens
- Bucket `vereadores` já existe — torná-lo **público** e padronizar uso de `getPublicUrl()` em **todos os componentes** (lista pública, detalhe, admin, mesa diretora)
- Componente `<VereadorAvatar>` com fallback em cascata: foto → iniciais → ícone institucional, com `onError` que loga via `console.error`
- Upload com:
  - **Compressão automática** via `browser-image-compression` (max 1MB, 1024px)
  - **Crop quadrado** via `react-easy-crop` antes do upload
  - **Remoção de fundo opcional** via `@imgly/background-removal` (rodando no browser, WASM)

### Admin `/admin/vereadores`
Formulário completo com todos os campos acima, preview da foto, abas: "Dados", "Redes sociais", "Mandato".

### Mesa Diretora `/admin/mesa-diretora`
Já existe a tabela `mesa_diretora`. Refinar UI: selecionar vereador + cargo (Presidente, Vice, 1º Secretário, 2º Secretário), ordem.

## Fase 2 — Ranking automático

View SQL `vereadores_ranking` calculando por vereador:
- `total_projetos` (count em `projetos_legislativos` por autor)
- `total_indicacoes` (count filtrando `tipo = 'indicacao'`)
- `total_requerimentos` (count filtrando `tipo = 'requerimento'`)
- `presencas` (count em `sessoes_presencas` com `presente = true`)
- `total_sessoes` e `percentual_presenca`

Página pública `/vereadores/ranking` com tabela ordenável e admin equivalente.

**Pré-requisito:** `projetos_legislativos` precisa de coluna `autor_id` referenciando vereadores (verificar; se faltar, adicionar). Senão o ranking de projetos não funciona.

## Fase 3 — Galeria e histórico

- Galeria de imagens por vereador: nova tabela `vereadores_galeria` (vereador_id, url, legenda, ordem) + UI no admin
- Histórico de mandatos: CRUD em `vereadores_mandatos` na aba "Histórico" do admin

## Detalhes técnicos
- Páginas públicas `/vereadores` e `/vereadores/$id` reescritas para usar `getPublicUrl`, `<VereadorAvatar>`, e exibir todos os novos campos
- Bucket de imagens público; RLS de write apenas para `admin`
- Toda query de imagem usa `supabase.storage.from('vereadores').getPublicUrl(path)` — nunca URL crua
- `_authenticated` para admin; ranking público

## Fora de escopo
- Editor visual avançado (Photoshop-like) — apenas crop básico
- Importação em massa (CSV)
- Notificações de mudança de mandato

Confirma? Ou prefere começar só pela **Fase 1** e avaliar antes de seguir?
