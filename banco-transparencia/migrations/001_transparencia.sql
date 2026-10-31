-- Banco de um município do Portal da Transparência. Rodar uma vez no SQL Editor.
-- Leitura pública pela chave anon; escrita só com a service_role (sincronização e cadastros),
-- exceto e-SIC e Ouvidoria, que o cidadão registra e consulta pelas funções no fim deste arquivo.

-- Cópia do portal Megasoft: uma linha por item de cada conjunto (despesas, receitas...).
create table if not exists public.transparencia_registros (
  dataset          text        not null,
  ano              integer     not null,
  chave            text        not null,
  ordem            integer     not null,
  dados            jsonb       not null,
  sincronizado_em  timestamptz not null default now(),
  primary key (dataset, ano, chave)
);
create index if not exists transparencia_registros_ordem_idx on public.transparencia_registros (dataset, ano, ordem);

create table if not exists public.transparencia_sincronizacoes (
  id              bigint generated always as identity primary key,
  dataset         text        not null,
  ano             integer     not null,
  status          text        not null check (status in ('executando', 'concluida', 'erro')),
  total_portal    integer,
  total_gravado   integer,
  erro            text,
  iniciado_em     timestamptz not null default now(),
  concluido_em    timestamptz
);
create index if not exists transparencia_sincronizacoes_ultima_idx on public.transparencia_sincronizacoes (dataset, ano, concluido_em desc);

-- Personalização opcional: site_logo, cores_site, rodape, dados_institucionais, transparencia_urls.
create table if not exists public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  chave text not null unique,
  valor jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Estrutura organizacional
create table if not exists public.secretarias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  sigla text,
  secretario text,
  foto_secretario text,
  telefone text,
  email text,
  endereco text,
  horario text,
  descricao text,
  competencias text[] default '{}',
  servicos text[] default '{}',
  imagem_url text,
  ativo boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.dirigentes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text not null,
  foto_url text,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.departamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null default 'departamento',
  secretaria_id uuid references public.secretarias(id) on delete set null,
  telefone text,
  email text,
  endereco text,
  responsavel text,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.membros_equipe (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text not null,
  foto_url text,
  email text,
  telefone text,
  secretaria_id uuid references public.secretarias(id) on delete set null,
  departamento_id uuid references public.departamentos(id) on delete set null,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Documentos publicados fora do portal
create table if not exists public.diario_oficial (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  titulo text not null,
  descricao text,
  arquivo_url text,
  tipo text not null default 'ordinario',
  data_publicacao date not null default current_date,
  anexos text[] default '{}',
  conteudo text,
  orgao text default 'Poder Executivo',
  responsavel text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.saude_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text not null default 'Geral',
  link_url text,
  arquivo_url text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.planejamento_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  arquivo_url text,
  arquivos_urls text[] not null default '{}',
  arquivos_nomes text[] not null default '{}',
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.relatorios_fiscais_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null default 'RREO',
  periodo text,
  exercicio integer not null default extract(year from now())::integer,
  arquivo_url text,
  arquivos_urls text[] default '{}',
  arquivos_nomes text[] not null default '{}',
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.atricon_itens (
  id uuid primary key default gen_random_uuid(),
  grupo text not null,
  grupo_ordem integer not null default 0,
  numero text not null,
  pergunta text not null,
  base_legal text,
  link text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atendimento ao cidadão: dados pessoais, sem nenhuma leitura pública direta.
create table if not exists public.ouvidoria (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'reclamacao',
  nome text,
  contato text,
  email text,
  categoria text,
  descricao text not null,
  secretaria text,
  status text not null default 'pendente',
  resposta text,
  respondido_por uuid,
  respondido_em timestamptz,
  protocolo text not null default 'OUV-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ouvidoria_protocolo on public.ouvidoria (protocolo);

create table if not exists public.sic_pedidos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text,
  assunto text not null,
  descricao text not null,
  status text not null default 'pendente',
  resposta text,
  anexos text[] default '{}',
  prazo_resposta timestamptz default (now() + interval '20 days'),
  respondido_por uuid,
  respondido_em timestamptz,
  protocolo text not null default 'SIC-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sic_protocolo on public.sic_pedidos (protocolo);

-- RLS: todas as tabelas fechadas; as públicas ganham só leitura.
do $$
declare t text;
begin
  foreach t in array array['transparencia_registros', 'transparencia_sincronizacoes', 'configuracoes', 'planejamento_documentos', 'relatorios_fiscais_documentos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "leitura publica" on public.%I', t);
    execute format('create policy "leitura publica" on public.%I for select to anon, authenticated using (true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
  foreach t in array array['secretarias', 'dirigentes', 'departamentos', 'membros_equipe', 'diario_oficial', 'saude_documentos', 'atricon_itens'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "leitura publica" on public.%I', t);
    execute format('create policy "leitura publica" on public.%I for select to anon, authenticated using (ativo = true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- Contatos pessoais de equipe e departamentos não ficam abertos.
revoke select on public.membros_equipe from anon;
grant select (id, nome, cargo, foto_url, secretaria_id, departamento_id, ordem, ativo, created_at, updated_at) on public.membros_equipe to anon;
revoke select on public.departamentos from anon;
grant select (id, nome, tipo, secretaria_id, endereco, responsavel, ordem, ativo, created_at, updated_at) on public.departamentos to anon;

alter table public.ouvidoria enable row level security;
alter table public.sic_pedidos enable row level security;
revoke all on public.ouvidoria, public.sic_pedidos from anon, authenticated;

create or replace function public.registrar_ouvidoria(p_tipo text, p_nome text, p_email text, p_contato text, p_secretaria text, p_descricao text)
returns text language sql security definer set search_path = public as $$
  insert into public.ouvidoria (tipo, nome, email, contato, secretaria, descricao)
  values (p_tipo, p_nome, p_email, p_contato, p_secretaria, p_descricao)
  returning protocolo;
$$;

create or replace function public.registrar_sic(p_nome text, p_email text, p_telefone text, p_assunto text, p_descricao text)
returns text language sql security definer set search_path = public as $$
  insert into public.sic_pedidos (nome, email, telefone, assunto, descricao)
  values (p_nome, p_email, p_telefone, p_assunto, p_descricao)
  returning protocolo;
$$;

-- Devolve só o andamento: nunca nome, e-mail, telefone ou o texto do pedido.
create or replace function public.consultar_protocolo(p_origem text, p_protocolo text)
returns jsonb language sql stable security definer set search_path = public as $$
  select case p_origem
    when 'sic' then (
      select to_jsonb(r) from (
        select protocolo, assunto, status, created_at, resposta, respondido_em, prazo_resposta
        from public.sic_pedidos where protocolo = p_protocolo limit 1
      ) r)
    when 'ouvidoria' then (
      select to_jsonb(r) from (
        select protocolo, tipo, status, created_at, resposta, respondido_em
        from public.ouvidoria where protocolo = p_protocolo limit 1
      ) r)
  end;
$$;

revoke execute on function public.registrar_ouvidoria(text, text, text, text, text, text), public.registrar_sic(text, text, text, text, text), public.consultar_protocolo(text, text) from public;
grant execute on function public.registrar_ouvidoria(text, text, text, text, text, text), public.registrar_sic(text, text, text, text, text), public.consultar_protocolo(text, text) to anon, authenticated;
