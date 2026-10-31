-- Painel administrativo (/admin). Rodar depois de 001_transparencia.sql, uma vez, no SQL Editor.
-- Quem entra no painel é um usuário do Supabase Auth (e-mail e senha) listado em admin_usuarios.
-- Só esses usuários gravam em configuracoes, leem e respondem e-SIC e Ouvidoria e enviam imagens ao bucket "site".

create table if not exists public.admin_usuarios (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  nome       text,
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);
alter table public.admin_usuarios enable row level security;

-- security definer para consultar admin_usuarios sem abrir a tabela; (select auth.uid()) é avaliado uma vez por consulta.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_usuarios
    where user_id = (select auth.uid()) and ativo
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Cada admin vê a própria linha; a lista completa fica para uma próxima etapa (gestão de usuários).
drop policy if exists "admin ve a si" on public.admin_usuarios;
create policy "admin ve a si" on public.admin_usuarios for select to authenticated using (user_id = (select auth.uid()));
grant select on public.admin_usuarios to authenticated;

-- updated_at automático nas tabelas que o painel edita.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;
do $$
declare t text;
begin
  foreach t in array array['configuracoes', 'sic_pedidos', 'ouvidoria'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- Configurações do site: leitura pública já existe (001); escrita só para admin.
grant insert, update, delete on public.configuracoes to authenticated;
drop policy if exists "admin escreve" on public.configuracoes;
create policy "admin escreve" on public.configuracoes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- e-SIC e Ouvidoria: o cidadão continua só com as funções de 001; o admin lê tudo e responde.
grant select, update on public.sic_pedidos, public.ouvidoria to authenticated;
do $$
declare t text;
begin
  foreach t in array array['sic_pedidos', 'ouvidoria'] loop
    execute format('drop policy if exists "admin le" on public.%I', t);
    execute format('create policy "admin le" on public.%I for select to authenticated using ((select public.is_admin()))', t);
    execute format('drop policy if exists "admin responde" on public.%I', t);
    execute format('create policy "admin responde" on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create index if not exists %I_status_idx on public.%I (status, created_at desc)', t, t);
  end loop;
end $$;

-- O protocolo é gravado com letras minúsculas e o site consulta em maiúsculas: a busca ignora a caixa.
create or replace function public.consultar_protocolo(p_origem text, p_protocolo text)
returns jsonb language sql stable security definer set search_path = public as $$
  select case p_origem
    when 'sic' then (
      select to_jsonb(r) from (
        select protocolo, assunto, status, created_at, resposta, respondido_em, prazo_resposta
        from public.sic_pedidos where upper(protocolo) = upper(p_protocolo) limit 1
      ) r)
    when 'ouvidoria' then (
      select to_jsonb(r) from (
        select protocolo, tipo, status, created_at, resposta, respondido_em
        from public.ouvidoria where upper(protocolo) = upper(p_protocolo) limit 1
      ) r)
  end;
$$;

-- Bucket público "site" para o logotipo e outras imagens do painel. Pulado se o Storage não estiver instalado.
do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'Storage ausente: o logotipo só poderá ser informado por link.';
    return;
  end if;
  insert into storage.buckets (id, name, public) values ('site', 'site', true) on conflict (id) do nothing;
  execute 'drop policy if exists "site leitura publica" on storage.objects';
  execute 'create policy "site leitura publica" on storage.objects for select to anon, authenticated using (bucket_id = ''site'')';
  execute 'drop policy if exists "site admin envia" on storage.objects';
  execute 'create policy "site admin envia" on storage.objects for insert to authenticated with check (bucket_id = ''site'' and (select public.is_admin()))';
  execute 'drop policy if exists "site admin atualiza" on storage.objects';
  execute 'create policy "site admin atualiza" on storage.objects for update to authenticated using (bucket_id = ''site'' and (select public.is_admin()))';
  execute 'drop policy if exists "site admin apaga" on storage.objects';
  execute 'create policy "site admin apaga" on storage.objects for delete to authenticated using (bucket_id = ''site'' and (select public.is_admin()))';
end $$;

-- Primeiro administrador: crie o usuário em Authentication → Users (e-mail e senha) e rode, com o e-mail dele:
--   insert into public.admin_usuarios (user_id, email, nome)
--   select id, email, 'Nome' from auth.users where email = 'admin@municipio.gov.br'
--   on conflict (user_id) do update set ativo = true;
-- Em Authentication → Providers → Email, desative "Allow new users to sign up": o cadastro é só pelo painel do Supabase.
