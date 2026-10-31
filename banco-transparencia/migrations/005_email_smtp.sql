-- Envio de e-mails: configuração SMTP no painel e fila preenchida por gatilhos.
-- Rodar depois de 004_esic_completo.sql, uma vez, no SQL Editor. O envio é feito pela função enviar-email.

-- Uma linha só. A senha nunca volta ao navegador: nem para o admin, que lê pela função obter_smtp.
create table if not exists public.smtp_config (
  id              boolean primary key default true check (id),
  ativo           boolean not null default false,
  host            text,
  porta           integer not null default 587 check (porta between 1 and 65535),
  seguranca       text not null default 'starttls' check (seguranca in ('starttls', 'ssl', 'nenhuma')),
  usuario         text,
  senha           text,
  remetente_email text,
  remetente_nome  text,
  notificar_email text,
  avisar_cidadao  boolean not null default true,
  site_url        text,
  atualizado_em   timestamptz not null default now()
);
alter table public.smtp_config enable row level security;
revoke all on public.smtp_config from public, anon, authenticated;
grant select on public.smtp_config to service_role;

create or replace function public.obter_smtp()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'Sem permissão' using errcode = '42501'; end if;
  select (to_jsonb(c) - 'senha') || jsonb_build_object('tem_senha', coalesce(c.senha, '') <> '') into v from public.smtp_config c;
  return v;
end $$;

-- Senha vazia mantém a atual; p_limpar_senha apaga.
create or replace function public.salvar_smtp(p_ativo boolean, p_host text, p_porta integer, p_seguranca text, p_usuario text, p_senha text, p_limpar_senha boolean,
  p_remetente_email text, p_remetente_nome text, p_notificar_email text, p_avisar_cidadao boolean, p_site_url text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Sem permissão' using errcode = '42501'; end if;
  if p_ativo and (coalesce(trim(p_host), '') = '' or coalesce(trim(p_remetente_email), '') = '') then
    raise exception 'Para ativar, informe o servidor e o e-mail do remetente.';
  end if;
  if coalesce(trim(p_remetente_email), '') <> '' and trim(p_remetente_email) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail do remetente inválido.'; end if;
  if p_seguranca not in ('starttls', 'ssl', 'nenhuma') then raise exception 'Tipo de segurança inválido.'; end if;
  if p_porta is null or p_porta not between 1 and 65535 then raise exception 'Porta inválida.'; end if;
  insert into public.smtp_config (id, ativo, host, porta, seguranca, usuario, senha, remetente_email, remetente_nome, notificar_email, avisar_cidadao, site_url)
  values (true, p_ativo, nullif(trim(p_host), ''), p_porta, p_seguranca, nullif(trim(p_usuario), ''), nullif(p_senha, ''), nullif(trim(p_remetente_email), ''), nullif(trim(p_remetente_nome), ''), nullif(trim(p_notificar_email), ''), p_avisar_cidadao, nullif(trim(p_site_url), ''))
  on conflict (id) do update set
    ativo = excluded.ativo, host = excluded.host, porta = excluded.porta, seguranca = excluded.seguranca, usuario = excluded.usuario,
    senha = case when p_limpar_senha then null else coalesce(nullif(p_senha, ''), public.smtp_config.senha) end,
    remetente_email = excluded.remetente_email, remetente_nome = excluded.remetente_nome, notificar_email = excluded.notificar_email,
    avisar_cidadao = excluded.avisar_cidadao, site_url = excluded.site_url, atualizado_em = now();
end $$;

-- Fila e histórico. "para" vazio significa a equipe (notificar_email), resolvido no envio.
create table if not exists public.email_fila (
  id            bigint generated always as identity primary key,
  evento        text not null,
  origem        text not null check (origem in ('sic', 'ouvidoria')),
  pedido_id     uuid not null,
  para          text,
  status        text not null default 'pendente' check (status in ('pendente', 'enviando', 'enviado', 'erro')),
  tentativas    integer not null default 0,
  erro          text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  enviado_em    timestamptz
);
create index if not exists email_fila_status_idx on public.email_fila (status, criado_em);
create index if not exists email_fila_para_idx on public.email_fila (para, criado_em);
alter table public.email_fila enable row level security;
revoke all on public.email_fila from public, anon, authenticated;
grant select on public.email_fila to authenticated;
grant select, insert, update on public.email_fila to service_role;
drop policy if exists "admin le" on public.email_fila;
create policy "admin le" on public.email_fila for select to authenticated using ((select public.is_admin()));

-- Limites contra abuso do formulário público: até 3 confirmações por hora para o mesmo endereço e 30 avisos de novo pedido à equipe.
create or replace function public.enfileirar_email(p_evento text, p_origem text, p_pedido uuid, p_para text)
returns void language plpgsql security definer set search_path = public as $$
declare c public.smtp_config%rowtype; v_para text := nullif(trim(p_para), '');
begin
  select * into c from public.smtp_config;
  if not found or not c.ativo then return; end if;
  if p_evento in ('novo_pedido', 'recurso_novo') then
    if c.notificar_email is null then return; end if;
    if p_evento = 'novo_pedido' and (select count(*) from public.email_fila where evento = 'novo_pedido' and criado_em > now() - interval '1 hour') >= 30 then return; end if;
    v_para := null;
  else
    if not c.avisar_cidadao or v_para is null then return; end if;
    if p_evento = 'confirmacao' and (select count(*) from public.email_fila where evento = 'confirmacao' and lower(para) = lower(v_para) and criado_em > now() - interval '1 hour') >= 3 then return; end if;
  end if;
  insert into public.email_fila (evento, origem, pedido_id, para) values (p_evento, p_origem, p_pedido, v_para);
end $$;
revoke execute on function public.enfileirar_email(text, text, uuid, text) from public, anon, authenticated;

create or replace function public.gatilho_email_atendimento()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_origem text := case tg_table_name when 'sic_pedidos' then 'sic' else 'ouvidoria' end; n jsonb := to_jsonb(new); o jsonb;
begin
  if tg_op = 'INSERT' then
    perform public.enfileirar_email('confirmacao', v_origem, new.id, new.email);
    perform public.enfileirar_email('novo_pedido', v_origem, new.id, null);
    return new;
  end if;
  o := to_jsonb(old);
  if new.status in ('respondido', 'indeferido', 'arquivado') and (old.status is distinct from new.status or old.resposta is distinct from new.resposta) then
    perform public.enfileirar_email('resposta', v_origem, new.id, new.email);
  end if;
  if n->>'prorrogado_em' is not null and o->>'prorrogado_em' is null then
    perform public.enfileirar_email('prorrogacao', v_origem, new.id, new.email);
  end if;
  if n->>'recurso_em' is not null and o->>'recurso_em' is null then
    perform public.enfileirar_email('recurso_novo', v_origem, new.id, null);
  end if;
  if n->>'recurso_status' in ('deferido', 'indeferido') and o->>'recurso_status' is distinct from n->>'recurso_status' then
    perform public.enfileirar_email('recurso_decisao', v_origem, new.id, new.email);
  end if;
  return new;
end $$;
do $$
declare t text;
begin
  foreach t in array array['sic_pedidos', 'ouvidoria'] loop
    execute format('drop trigger if exists %I_email on public.%I', t, t);
    execute format('create trigger %I_email after insert or update on public.%I for each row execute function public.gatilho_email_atendimento()', t, t);
  end loop;
end $$;

-- Só a função de envio reserva itens. Erro volta depois de 5 minutos, até 5 tentativas; "enviando" preso volta depois de 10.
create or replace function public.reservar_emails(p_limite integer)
returns setof public.email_fila language sql security definer set search_path = public as $$
  update public.email_fila f set status = 'enviando', tentativas = f.tentativas + 1, atualizado_em = now()
  where f.id in (
    select id from public.email_fila
    where tentativas < 5 and (status = 'pendente'
      or (status = 'erro' and atualizado_em < now() - interval '5 minutes')
      or (status = 'enviando' and atualizado_em < now() - interval '10 minutes'))
    order by criado_em limit p_limite for update skip locked
  )
  returning f.*;
$$;
revoke execute on function public.reservar_emails(integer) from public, anon, authenticated;
grant execute on function public.reservar_emails(integer) to service_role;

create or replace function public.reenviar_email(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Sem permissão' using errcode = '42501'; end if;
  update public.email_fila set status = 'pendente', tentativas = 0, erro = null, atualizado_em = now() where id = p_id and status = 'erro';
end $$;

revoke execute on function public.obter_smtp(), public.salvar_smtp(boolean, text, integer, text, text, text, boolean, text, text, text, boolean, text), public.reenviar_email(bigint) from public, anon;
grant execute on function public.obter_smtp(), public.salvar_smtp(boolean, text, integer, text, text, text, boolean, text, text, text, boolean, text), public.reenviar_email(bigint) to authenticated;
