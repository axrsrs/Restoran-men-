-- NearDiji güvenlik ve trafik düzenlemesi (28 Ekim 2026)
-- Supabase → SQL Editor'da BÖLÜM 1'i tek seferde çalıştır. BÖLÜM 2 isteğe bağlı.

begin;

-- 1) Menü: tek sorguda, sadece gereken alanlar. Yetki bir kez denetlenir (satır başına değil).
--    lastBulk (toplu fiyat geri alma) sadece işletme üyelerine gider.
create or replace function public.get_menu(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'restaurant', jsonb_build_object(
      'id', r.id, 'slug', r.slug, 'name', r.name,
      'subtitle', r.subtitle, 'subtitles', r.subtitles,
      'phone', r.phone, 'whatsapp', r.whatsapp, 'hours', r.hours, 'logo', r.logo,
      'settings', case when private.is_member(r.id) then r.settings
                       else coalesce(r.settings, '{}'::jsonb) - 'lastBulk' end,
      'updated_at', r.updated_at),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id, 'name', c.name, 'names', c.names, 'image', c.image,
        'items', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', p.id, 'name', p.name, 'names', p.names,
            'description', p.description, 'descriptions', p.descriptions,
            'price', p.price, 'sold', p.sold, 'featured', p.featured, 'dish', p.dish,
            'portion', p.portion, 'calories', p.calories, 'allergens', p.allergens,
            'spicy', p.spicy, 'image', p.image)
            order by p.sort, p.created_at)
          from public.products p
          where p.category_id = c.id and p.restaurant_id = r.id
        ), '[]'::jsonb))
        order by c.sort, c.created_at)
      from public.categories c where c.restaurant_id = r.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'name', e.name, 'names', e.names,
        'description', e.description, 'descriptions', e.descriptions,
        'event_date', e.event_date, 'event_time', e.event_time, 'image', e.image)
        order by e.event_date nulls last, e.sort)
      from public.events e where e.restaurant_id = r.id
    ), '[]'::jsonb))
  from public.restaurants r
  where r.slug = p_slug
    and (private.is_public_restaurant(r.id) or private.is_member(r.id));
$$;

revoke all on function public.get_menu(text) from public;
grant execute on function public.get_menu(text) to anon, authenticated;

-- 2) Hafif "menü değişti mi?" kontrolü (açık menü dakikada bir bunu sorar, ~40 bayt).
create or replace function public.menu_version(p_slug text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select concat_ws('|',
    extract(epoch from greatest(
      r.updated_at,
      (select max(c.updated_at) from public.categories c where c.restaurant_id = r.id),
      (select max(p.updated_at) from public.products p where p.restaurant_id = r.id),
      (select max(e.updated_at) from public.events e where e.restaurant_id = r.id)))::text,
    (select count(*) from public.categories c where c.restaurant_id = r.id),
    (select count(*) from public.products p where p.restaurant_id = r.id),
    (select count(*) from public.events e where e.restaurant_id = r.id))
  from public.restaurants r
  where r.slug = p_slug
    and (private.is_public_restaurant(r.id) or private.is_member(r.id));
$$;

revoke all on function public.menu_version(text) from public;
grant execute on function public.menu_version(text) to anon, authenticated;

-- 3) Katalog: tablo yerine fonksiyondan okunur (yetki aynı: açık katalog veya üye).
create or replace function public.get_catalog(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('id', c.id, 'slug', c.slug, 'name', c.name, 'data', c.data, 'updated_at', c.updated_at)
  from public.catalogs c
  where c.slug = lower(p_slug)
    and (private.is_public_catalog(c.id) or private.is_catalog_member(c.id));
$$;

revoke all on function public.get_catalog(text) from public;
grant execute on function public.get_catalog(text) to anon, authenticated;

-- 4) Tablolara doğrudan okuma: ziyaretçi (anon) hiçbir menü/katalog tablosunu okuyamaz.
--    Giriş yapmış kullanıcılar paket, durum, deneme/ödeme tarihi ve alan adı sütunlarını göremez
--    (bunlar süper yönetici paneline admin_list_* fonksiyonlarından gelir).
revoke select on public.restaurants, public.catalogs, public.categories, public.products, public.events from anon;

revoke select on public.restaurants, public.catalogs from authenticated;
grant select (id, slug, name, subtitle, subtitles, phone, whatsapp, hours, logo, settings, created_at, updated_at)
  on public.restaurants to authenticated;
grant select (id, slug, name, data, created_at, updated_at)
  on public.catalogs to authenticated;

-- 5) Ziyaret sayacı: aynı kişi aynı menüyü/kataloğu günde bir kez sayılır.
--    IP saklanmaz; tuzlu SHA-256 özeti 2 gün tutulup silinir.
create table if not exists private.visit_seen (
  h   text primary key,
  day date not null default current_date
);
create index if not exists visit_seen_day_idx on private.visit_seen (day);

create table if not exists private.app_salt (
  id   int primary key default 1 check (id = 1),
  salt text not null
);
insert into private.app_salt (salt)
values (encode(extensions.gen_random_bytes(24), 'hex'))
on conflict do nothing;

revoke all on private.visit_seen, private.app_salt from public, anon, authenticated;

create or replace function private.first_visit_today(p_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare hdr json; ip text; n int;
begin
  begin
    hdr := current_setting('request.headers', true)::json;
  exception when others then
    hdr := null;
  end;
  ip := coalesce(hdr->>'cf-connecting-ip', hdr->>'x-real-ip',
                 nullif(trim(split_part(coalesce(hdr->>'x-forwarded-for', ''), ',', 1)), ''));
  if ip is null then return true; end if;

  insert into private.visit_seen (h)
  values (encode(extensions.digest(ip || '|' || p_key || '|' || current_date::text || '|' ||
                                   (select s.salt from private.app_salt s), 'sha256'), 'hex'))
  on conflict do nothing;
  get diagnostics n = row_count;

  if random() < 0.02 then
    delete from private.visit_seen where day < current_date - 1;
  end if;

  return n > 0;
end $$;

create or replace function public.track_visit(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare rid uuid;
begin
  if p_slug is null or char_length(p_slug) > 60 then return; end if;
  select id into rid from public.restaurants where slug = p_slug;
  if rid is null or not private.is_public_restaurant(rid) then return; end if;
  if not private.first_visit_today('m:' || rid::text) then return; end if;
  insert into public.daily_visits (restaurant_id, day, count)
  values (rid, current_date, 1)
  on conflict (restaurant_id, day) do update
    set count = public.daily_visits.count + 1
    where public.daily_visits.count < 100000;
end $$;

create or replace function public.track_catalog_visit(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare cid uuid;
begin
  if p_slug is null or char_length(p_slug) > 60 then return; end if;
  select id into cid from public.catalogs where slug = lower(p_slug);
  if cid is null or not private.is_public_catalog(cid) then return; end if;
  if not private.first_visit_today('c:' || cid::text) then return; end if;
  insert into public.catalog_daily_visits (catalog_id, day, count)
  values (cid, current_date, 1)
  on conflict (catalog_id, day) do update
    set count = public.catalog_daily_visits.count + 1
    where public.catalog_daily_visits.count < 100000;
end $$;

-- 6) Mükerrer uzunluk kuralları tek kurala indirildi (iki kuralın en sıkı değerleri).
alter table public.categories
  drop constraint if exists categories_len_chk,
  drop constraint if exists categories_limits,
  add constraint categories_limits check (
    char_length(coalesce(name, '')) <= 120
    and char_length(coalesce(image, '')) <= 2000
    and octet_length(coalesce(names, '{}'::jsonb)::text) <= 5000);

alter table public.products
  drop constraint if exists products_len_chk,
  drop constraint if exists products_limits,
  add constraint products_limits check (
    char_length(coalesce(name, '')) <= 200
    and char_length(coalesce(description, '')) <= 2000
    and char_length(coalesce(image, '')) <= 2000
    and char_length(coalesce(portion, '')) <= 60
    and char_length(coalesce(calories, '')) <= 50
    and coalesce(cardinality(allergens), 0) <= 30
    and octet_length(coalesce(names, '{}'::jsonb)::text) <= 5000
    and octet_length(coalesce(descriptions, '{}'::jsonb)::text) <= 20000
    and price <= 100000000);

alter table public.events
  drop constraint if exists events_len_chk,
  drop constraint if exists events_limits,
  add constraint events_limits check (
    char_length(coalesce(name, '')) <= 200
    and char_length(coalesce(description, '')) <= 3000
    and char_length(coalesce(image, '')) <= 2000
    and char_length(coalesce(event_time, '')) <= 20
    and octet_length(coalesce(names, '{}'::jsonb)::text) <= 5000
    and octet_length(coalesce(descriptions, '{}'::jsonb)::text) <= 20000);

alter table public.restaurants
  drop constraint if exists restaurants_len_chk,
  drop constraint if exists restaurants_text_limits,
  drop constraint if exists restaurants_json_limits,
  add constraint restaurants_limits check (
    char_length(coalesce(subtitle, '')) <= 300
    and char_length(coalesce(phone, '')) <= 40
    and char_length(coalesce(whatsapp, '')) <= 40
    and char_length(coalesce(hours, '')) <= 300
    and char_length(coalesce(logo, '')) <= 2000
    and char_length(coalesce(custom_domain, '')) <= 253
    and octet_length(coalesce(settings, '{}'::jsonb)::text) <= 200000
    and octet_length(coalesce(subtitles, '{}'::jsonb)::text) <= 10000);

alter table public.site_content
  drop constraint if exists site_content_len_chk,
  drop constraint if exists site_content_limits,
  add constraint site_content_limits check (
    char_length(key) <= 40
    and octet_length(data::text) <= 300000);

commit;

-- ===================================================================
-- BÖLÜM 2 (isteğe bağlı): eski Supabase Storage izinleri
-- Medya artık Cloudflare R2'de; bu kovalara hiçbir sayfa bağlantı vermiyor.
-- Önce panelden sil: Storage → menu-media / site-media / catalog-media → her biri için
-- "Empty bucket" sonra "Delete bucket". Ardından bu izinleri kaldır:
-- ===================================================================
drop policy if exists "menu-media: üye okur"      on storage.objects;
drop policy if exists "menu-media: üye yükler"    on storage.objects;
drop policy if exists "menu-media: üye günceller" on storage.objects;
drop policy if exists "menu-media: üye siler"     on storage.objects;
drop policy if exists "catalog-media: üye okur"      on storage.objects;
drop policy if exists "catalog-media: üye yükler"    on storage.objects;
drop policy if exists "catalog-media: üye günceller" on storage.objects;
drop policy if exists "catalog-media: üye siler"     on storage.objects;
drop policy if exists "site-media: süper okur"      on storage.objects;
drop policy if exists "site-media: süper yükler"    on storage.objects;
drop policy if exists "site-media: süper günceller" on storage.objects;
drop policy if exists "site-media: süper kaldırır"  on storage.objects;
