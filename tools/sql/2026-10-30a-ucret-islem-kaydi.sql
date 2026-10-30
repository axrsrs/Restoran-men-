-- 30.10.2026 — Supabase SQL Editor'da çalıştırıldı (menu21).
-- A) Abonelik ücreti alanları  B) İşlem kaydı (audit_log)  C) KVKK metni (site_content; metin assets/site-data.js ile aynı)

-- ===== A) Abonelik ücreti alanları =====
alter table public.restaurants
  add column if not exists price_amount numeric(12,2),
  add column if not exists price_currency text not null default 'TRY',
  add column if not exists price_period text not null default 'ay';
alter table public.catalogs
  add column if not exists price_amount numeric(12,2),
  add column if not exists price_currency text not null default 'TRY',
  add column if not exists price_period text not null default 'ay';

do $$ begin
  alter table public.restaurants add constraint restaurants_price_chk check (price_amount is null or price_amount >= 0) not valid;
  alter table public.restaurants add constraint restaurants_period_chk check (price_period in ('ay','yil')) not valid;
  alter table public.restaurants add constraint restaurants_currency_chk check (price_currency in ('TRY','USD','EUR')) not valid;
  alter table public.catalogs add constraint catalogs_price_chk check (price_amount is null or price_amount >= 0) not valid;
  alter table public.catalogs add constraint catalogs_period_chk check (price_period in ('ay','yil')) not valid;
  alter table public.catalogs add constraint catalogs_currency_chk check (price_currency in ('TRY','USD','EUR')) not valid;
exception when duplicate_object then null; end $$;

create or replace function public.protect_restaurant_admin_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('postgres','service_role','supabase_admin') or private.is_super_admin() then return new; end if;
  if new.slug is distinct from old.slug or new.status is distinct from old.status or new.plan is distinct from old.plan
     or new.trial_ends is distinct from old.trial_ends or new.paid_until is distinct from old.paid_until
     or new.custom_domain is distinct from old.custom_domain
     or new.price_amount is distinct from old.price_amount or new.price_currency is distinct from old.price_currency
     or new.price_period is distinct from old.price_period then
    raise exception 'Bu alanları sadece süper yönetici değiştirebilir (adres, durum, paket, deneme, abonelik, ücret, alan adı).' using errcode = '42501';
  end if;
  return new;
end $$;

create or replace function public.protect_catalog_admin_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('postgres','service_role','supabase_admin') or private.is_super_admin() then return new; end if;
  if new.slug is distinct from old.slug or new.status is distinct from old.status or new.plan is distinct from old.plan
     or new.trial_ends is distinct from old.trial_ends or new.paid_until is distinct from old.paid_until
     or new.price_amount is distinct from old.price_amount or new.price_currency is distinct from old.price_currency
     or new.price_period is distinct from old.price_period then
    raise exception 'Bu alanları sadece süper yönetici değiştirebilir (adres, durum, paket, deneme, abonelik, ücret).' using errcode = '42501';
  end if;
  return new;
end $$;

-- ===== B) İşlem kaydı =====
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  actor_email text,
  action text not null,
  target_kind text not null,
  target_id text,
  target_name text,
  detail jsonb not null default '{}'::jsonb
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);
alter table public.audit_log enable row level security;
drop policy if exists "işlem kaydı: süper okur" on public.audit_log;
create policy "işlem kaydı: süper okur" on public.audit_log for select to authenticated using (private.is_super_admin());
revoke insert, update, delete on public.audit_log from anon, authenticated;

create or replace function private.audit_row()
returns trigger language plpgsql security definer set search_path = '' as $$
declare r jsonb; o jsonb; uid uuid := auth.uid(); em text;
begin
  -- Üst kayıt silinince zincirleme silinen alt kayıtları tek tek yazma
  if pg_trigger_depth() > 1 then return null; end if;
  r := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  o := case when tg_op = 'UPDATE' then to_jsonb(old) else null end;
  if tg_op = 'UPDATE' and tg_table_name in ('restaurants','catalogs') then
    -- Sadece yönetimsel alan değişikliklerini yaz (içerik düzenlemelerini değil)
    if (r->>'slug', r->>'status', r->>'plan', r->>'trial_ends', r->>'paid_until', r->>'price_amount', r->>'price_period', r->>'price_currency')
       is not distinct from
       (o->>'slug', o->>'status', o->>'plan', o->>'trial_ends', o->>'paid_until', o->>'price_amount', o->>'price_period', o->>'price_currency')
    then return null; end if;
  end if;
  select email into em from auth.users where id = uid;
  insert into public.audit_log (actor, actor_email, action, target_kind, target_id, target_name, detail)
  values (
    uid, em, lower(tg_op), tg_table_name,
    coalesce(r->>'id', r->>'restaurant_id', r->>'catalog_id', r->>'key'),
    coalesce(r->>'name', r->>'slug', r->>'key'),
    case
      when tg_op = 'UPDATE' then jsonb_build_object('önce', o - 'data' - 'settings' - 'subtitles', 'sonra', r - 'data' - 'settings' - 'subtitles')
      else r - 'data' - 'settings' - 'subtitles' - 'names' - 'descriptions'
    end
  );
  return null;
end $$;

do $$ declare t text; begin
  foreach t in array array['restaurants','catalogs'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.audit_row()', t || '_audit', t);
  end loop;
  foreach t in array array['members','catalog_members'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format('create trigger %I after insert or delete on public.%I for each row execute function private.audit_row()', t || '_audit', t);
  end loop;
  foreach t in array array['products','categories','events','site_content'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format('create trigger %I after delete on public.%I for each row execute function private.audit_row()', t || '_audit', t);
  end loop;
end $$;

-- Şifre sıfırlama da kayda geçer (şifrenin kendisi yazılmaz)
create or replace function public.admin_reset_password(p_email text)
returns jsonb language plpgsql security definer set search_path = '' as $function$
declare uid uuid; pw text; em text := lower(trim(p_email)); me uuid := auth.uid();
begin
  perform private.require_super();
  select id into uid from auth.users where lower(email) = em;
  if uid is null then
    raise exception 'Bu e-postayla kullanıcı yok: %', p_email using errcode = '22023';
  end if;
  if exists (select 1 from public.super_admins where user_id = uid) and uid <> me then
    raise exception 'Başka bir süper yöneticinin şifresi buradan sıfırlanamaz.' using errcode = '42501';
  end if;
  pw := private.temp_password();
  update auth.users
     set encrypted_password = extensions.crypt(pw, extensions.gen_salt('bf')),
         raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{"must_change_password":true}'::jsonb,
         updated_at = now()
   where id = uid;
  insert into public.audit_log (actor, actor_email, action, target_kind, target_id, target_name)
  values (me, (select email from auth.users where id = me), 'password_reset', 'user', uid::text, em);
  return jsonb_build_object('email', em, 'temp_password', pw);
end;
$function$;

-- ===== C) KVKK metni: site_content.main.privacy.text = assets/site-data.js içindeki ND_DEFAULT.privacy.text
