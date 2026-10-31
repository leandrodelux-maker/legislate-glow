-- Conteúdo e usuários no painel (/admin). Rodar depois de 002_admin.sql, uma vez, no SQL Editor.

-- Tabelas de conteúdo: o admin vê também os itens ocultos e cadastra, edita e apaga. O visitante continua só lendo.
do $$
declare t text;
begin
  foreach t in array array['secretarias', 'dirigentes', 'departamentos', 'membros_equipe', 'diario_oficial', 'saude_documentos', 'planejamento_documentos', 'relatorios_fiscais_documentos', 'atricon_itens'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists "admin gerencia" on public.%I', t);
    execute format('create policy "admin gerencia" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- Telefone e e-mail de equipe e departamentos: quem só tem login não é admin e não pode ler essas colunas.
do $$
declare t text;
begin
  foreach t in array array['departamentos', 'membros_equipe'] loop
    execute format('drop policy if exists "leitura publica" on public.%I', t);
    execute format('create policy "leitura publica" on public.%I for select to anon using (ativo = true)', t);
  end loop;
end $$;

-- Usuários do painel: a lista é visível só para admins e muda só pelas funções abaixo.
revoke all on public.admin_usuarios from anon;
revoke insert, update, delete on public.admin_usuarios from authenticated;
drop policy if exists "admin ve todos" on public.admin_usuarios;
create policy "admin ve todos" on public.admin_usuarios for select to authenticated using ((select public.is_admin()));

-- Dá acesso ao painel a uma conta que já existe em Authentication → Users.
create or replace function public.adicionar_admin(p_email text, p_nome text)
returns void language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_email text;
begin
  if not public.is_admin() then raise exception 'Sem permissão' using errcode = '42501'; end if;
  select id, email into v_id, v_email from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then raise exception 'Não existe conta com este e-mail. Crie-a em Authentication, no Supabase.'; end if;
  insert into public.admin_usuarios (user_id, email, nome) values (v_id, v_email, nullif(trim(p_nome), ''))
  on conflict (user_id) do update set ativo = true, nome = coalesce(excluded.nome, public.admin_usuarios.nome);
end $$;

-- Ninguém desativa a si mesmo: o município nunca fica sem administrador por engano.
create or replace function public.definir_admin_ativo(p_user_id uuid, p_ativo boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Sem permissão' using errcode = '42501'; end if;
  if p_user_id = auth.uid() and not p_ativo then raise exception 'Você não pode desativar o próprio acesso.'; end if;
  update public.admin_usuarios set ativo = p_ativo where user_id = p_user_id;
end $$;

revoke execute on function public.adicionar_admin(text, text), public.definir_admin_ativo(uuid, boolean) from public, anon;
grant execute on function public.adicionar_admin(text, text), public.definir_admin_ativo(uuid, boolean) to authenticated;
