-- Publicações cadastradas no painel do site: substituem as consultas do Megasoft nestes itens.
-- Rodar uma vez no SQL Editor do banco analítico.
-- Leitura pública só do que está publicado; a escrita usa a service_role, em função do servidor que confere o login.

create table if not exists public.legislativo_publicacoes (
  id               uuid        primary key default gen_random_uuid(),
  categoria        text        not null check (categoria in ('legislacao-municipal', 'outras-publicacoes', 'atividades-legislativas', 'pauta-comissoes', 'leis-atos-infralegais')),
  tipo             text,
  numero           text,
  ano              integer     check (ano between 1900 and 2100),
  titulo           text        not null check (length(trim(titulo)) between 2 and 300),
  descricao        text,
  situacao         text,
  data_publicacao  date,
  arquivo_url      text,
  publicado        boolean     not null default true,
  origem_portal    integer,
  atualizado_por   text,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  unique (categoria, origem_portal)
);

create index if not exists legislativo_publicacoes_lista_idx
  on public.legislativo_publicacoes (categoria, ano desc, data_publicacao desc) where publicado;

alter table public.legislativo_publicacoes enable row level security;

drop policy if exists "publicacoes leitura publica" on public.legislativo_publicacoes;
create policy "publicacoes leitura publica" on public.legislativo_publicacoes
  for select to anon, authenticated using (publicado);

grant select on public.legislativo_publicacoes to anon, authenticated;
grant all on public.legislativo_publicacoes to service_role;

create or replace function public.publicacoes_marcar_atualizacao()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists publicacoes_atualizado on public.legislativo_publicacoes;
create trigger publicacoes_atualizado before update on public.legislativo_publicacoes
  for each row execute function public.publicacoes_marcar_atualizacao();
