-- e-SIC completo: prorrogação, recurso, arquivos da resposta, estatísticas e protocolo mais seguro.
-- Rodar depois de 003_admin_conteudo.sql, uma vez, no SQL Editor.

alter table public.sic_pedidos
  add column if not exists prorrogado_em timestamptz,
  add column if not exists prorrogacao_justificativa text,
  add column if not exists recurso_texto text,
  add column if not exists recurso_em timestamptz,
  add column if not exists recurso_prazo timestamptz,
  add column if not exists recurso_status text check (recurso_status in ('pendente', 'deferido', 'indeferido')),
  add column if not exists recurso_resposta text,
  add column if not exists recurso_respondido_em timestamptz,
  add column if not exists recurso_respondido_por uuid;

alter table public.ouvidoria
  add column if not exists prazo_resposta timestamptz default (now() + interval '30 days'),
  add column if not exists prorrogado_em timestamptz,
  add column if not exists prorrogacao_justificativa text;
update public.ouvidoria set prazo_resposta = created_at + interval '30 days' where prazo_resposta is null;

-- Protocolo com 10 caracteres: difícil de adivinhar, pois quem tem o número vê a resposta. Os já emitidos continuam valendo.
alter table public.sic_pedidos alter column protocolo set default 'SIC-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
alter table public.ouvidoria alter column protocolo set default 'OUV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

-- As funções públicas conferem os dados: o site valida, mas qualquer um pode chamá-las direto.
create or replace function public.registrar_sic(p_nome text, p_email text, p_telefone text, p_assunto text, p_descricao text)
returns text language plpgsql security definer set search_path = public as $$
declare v_protocolo text;
begin
  if coalesce(trim(p_nome), '') = '' or coalesce(trim(p_assunto), '') = '' or coalesce(trim(p_descricao), '') = '' then
    raise exception 'Preencha nome, assunto e descrição.';
  end if;
  if coalesce(trim(p_email), '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Informe um e-mail válido.'; end if;
  if length(p_nome) > 200 or length(p_email) > 200 or length(p_telefone) > 40 or length(p_assunto) > 300 or length(p_descricao) > 10000 then
    raise exception 'Algum campo passou do tamanho permitido.';
  end if;
  insert into public.sic_pedidos (nome, email, telefone, assunto, descricao)
  values (trim(p_nome), trim(p_email), nullif(trim(p_telefone), ''), trim(p_assunto), trim(p_descricao))
  returning protocolo into v_protocolo;
  return v_protocolo;
end $$;

create or replace function public.registrar_ouvidoria(p_tipo text, p_nome text, p_email text, p_contato text, p_secretaria text, p_descricao text)
returns text language plpgsql security definer set search_path = public as $$
declare v_protocolo text;
begin
  if p_tipo is null or p_tipo not in ('denuncia', 'reclamacao', 'sugestao', 'elogio', 'informacao') then raise exception 'Escolha o tipo da manifestação.'; end if;
  if coalesce(trim(p_descricao), '') = '' then raise exception 'Descreva a manifestação.'; end if;
  if length(p_nome) > 200 or length(p_email) > 200 or length(p_contato) > 40 or length(p_secretaria) > 200 or length(p_descricao) > 10000 then
    raise exception 'Algum campo passou do tamanho permitido.';
  end if;
  insert into public.ouvidoria (tipo, nome, email, contato, secretaria, descricao)
  values (p_tipo, nullif(trim(p_nome), ''), nullif(trim(p_email), ''), nullif(trim(p_contato), ''), nullif(trim(p_secretaria), ''), trim(p_descricao))
  returning protocolo into v_protocolo;
  return v_protocolo;
end $$;

-- Devolve só o andamento: nunca nome, e-mail, telefone, o texto do pedido ou o texto do recurso.
create or replace function public.consultar_protocolo(p_origem text, p_protocolo text)
returns jsonb language sql stable security definer set search_path = public as $$
  select case p_origem
    when 'sic' then (
      select to_jsonb(r) from (
        select protocolo, assunto, status, created_at, resposta, respondido_em, prazo_resposta, anexos,
               prorrogado_em, prorrogacao_justificativa,
               recurso_em, recurso_prazo, recurso_status, recurso_resposta, recurso_respondido_em
        from public.sic_pedidos where upper(protocolo) = upper(trim(p_protocolo)) limit 1
      ) r)
    when 'ouvidoria' then (
      select to_jsonb(r) from (
        select protocolo, tipo, status, created_at, resposta, respondido_em, prazo_resposta, prorrogado_em, prorrogacao_justificativa
        from public.ouvidoria where upper(protocolo) = upper(trim(p_protocolo)) limit 1
      ) r)
  end;
$$;

-- Recurso (LAI, art. 15): até 10 dias depois da resposta ou da negativa, um por pedido, decidido em 5 dias.
create or replace function public.registrar_recurso(p_protocolo text, p_motivo text)
returns void language plpgsql security definer set search_path = public as $$
declare v public.sic_pedidos%rowtype;
begin
  if coalesce(trim(p_motivo), '') = '' then raise exception 'Explique o motivo do recurso.'; end if;
  if length(p_motivo) > 10000 then raise exception 'O texto passou do tamanho permitido.'; end if;
  select * into v from public.sic_pedidos where upper(protocolo) = upper(trim(p_protocolo)) for update;
  if not found then raise exception 'Protocolo não encontrado.'; end if;
  if v.recurso_em is not null then raise exception 'Este pedido já tem um recurso registrado.'; end if;
  if v.status not in ('respondido', 'indeferido') or v.respondido_em is null then raise exception 'O recurso só cabe depois da resposta ou da negativa.'; end if;
  if now() > v.respondido_em + interval '10 days' then raise exception 'O prazo de 10 dias para o recurso já terminou.'; end if;
  update public.sic_pedidos
  set recurso_texto = trim(p_motivo), recurso_em = now(), recurso_prazo = now() + interval '5 days', recurso_status = 'pendente'
  where id = v.id;
end $$;

-- Totais por ano dos pedidos feitos neste site. Só números: nenhum dado do pedido sai daqui.
create or replace function public.estatisticas_sic()
returns table (ano int, solicitados int, atendidos int, abertos int, indeferidos int)
language sql stable security definer set search_path = public as $$
  select extract(year from created_at)::int,
         count(*)::int,
         count(*) filter (where status = 'respondido')::int,
         count(*) filter (where status in ('pendente', 'em_andamento'))::int,
         count(*) filter (where status = 'indeferido')::int
  from public.sic_pedidos
  group by 1 order by 1;
$$;

revoke execute on function public.registrar_recurso(text, text), public.estatisticas_sic() from public;
grant execute on function public.registrar_recurso(text, text), public.estatisticas_sic() to anon, authenticated;
