-- Abonelik bitiş tarihi (aktif müşteriler için) + askıdaki firma sayfası için durum sorgusu
alter table public.restaurants add column if not exists paid_until date;
alter table public.catalogs add column if not exists paid_until date;

create or replace function private.is_public_restaurant(rid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.restaurants r where r.id = rid and (
    (r.status = 'active' and (r.paid_until is null or r.paid_until >= current_date))
    or (r.status = 'trial' and (r.trial_ends is null or r.trial_ends >= current_date))));
$$;

create or replace function private.is_public_catalog(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.catalogs c where c.id = cid and (
    (c.status = 'active' and (c.paid_until is null or c.paid_until >= current_date))
    or (c.status = 'trial' and (c.trial_ends is null or c.trial_ends >= current_date))));
$$;

create or replace function public.protect_restaurant_admin_fields() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('postgres','service_role','supabase_admin') or private.is_super_admin() then return new; end if;
  if new.slug is distinct from old.slug or new.status is distinct from old.status or new.plan is distinct from old.plan
     or new.trial_ends is distinct from old.trial_ends or new.paid_until is distinct from old.paid_until
     or new.custom_domain is distinct from old.custom_domain then
    raise exception 'Bu alanları sadece süper yönetici değiştirebilir (adres, durum, paket, deneme, abonelik, alan adı).' using errcode = '42501';
  end if;
  return new;
end $$;

create or replace function public.protect_catalog_admin_fields() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('postgres','service_role','supabase_admin') or private.is_super_admin() then return new; end if;
  if new.slug is distinct from old.slug or new.status is distinct from old.status or new.plan is distinct from old.plan
     or new.trial_ends is distinct from old.trial_ends or new.paid_until is distinct from old.paid_until then
    raise exception 'Bu alanları sadece süper yönetici değiştirebilir (adres, durum, paket, deneme, abonelik).' using errcode = '42501';
  end if;
  return new;
end $$;

-- süper panel listeleri paid_until döndürür
create or replace function public.admin_list_restaurants() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_super();
  return coalesce((
    select jsonb_agg(x order by x->>'created_at' desc) from (
      select jsonb_build_object(
        'id', r.id, 'slug', r.slug, 'name', r.name, 'status', r.status, 'plan', r.plan,
        'trial_ends', r.trial_ends, 'paid_until', r.paid_until, 'created_at', r.created_at, 'updated_at', r.updated_at,
        'logo', r.logo,
        'categories', (select count(*) from public.categories c where c.restaurant_id = r.id),
        'products', (select count(*) from public.products p where p.restaurant_id = r.id),
        'visits_30d', coalesce((select sum(v.count) from public.daily_visits v where v.restaurant_id = r.id and v.day > current_date - 30), 0),
        'visits_today', coalesce((select v.count from public.daily_visits v where v.restaurant_id = r.id and v.day = current_date), 0),
        'members', coalesce((select jsonb_agg(jsonb_build_object('email', u.email, 'role', m.role,
                                  'last_sign_in', u.last_sign_in_at,
                                  'must_change', coalesce((u.raw_user_meta_data->>'must_change_password')::boolean,false)))
                             from public.members m join auth.users u on u.id = m.user_id where m.restaurant_id = r.id), '[]'::jsonb)
      ) as x from public.restaurants r) s), '[]'::jsonb);
end $$;

create or replace function public.catalog_admin_list() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_super();
  return coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
    select jsonb_build_object('id', c.id, 'slug', c.slug, 'name', c.name, 'status', c.status, 'plan', c.plan,
      'trial_ends', c.trial_ends, 'paid_until', c.paid_until, 'created_at', c.created_at, 'updated_at', c.updated_at,
      'logo', coalesce(c.data#>>'{logo,src}', ''),
      'categories', coalesce(jsonb_array_length(case when jsonb_typeof(c.data->'categories')='array' then c.data->'categories' end), 0),
      'products', coalesce((select sum(case when jsonb_typeof(cat->'items')='array' then jsonb_array_length(cat->'items') else 0 end)
                            from jsonb_array_elements(case when jsonb_typeof(c.data->'categories')='array' then c.data->'categories' else '[]'::jsonb end) cat), 0),
      'visits_30d', coalesce((select sum(v.count) from public.catalog_daily_visits v where v.catalog_id = c.id and v.day > current_date - 30), 0),
      'visits_today', coalesce((select v.count from public.catalog_daily_visits v where v.catalog_id = c.id and v.day = current_date), 0),
      'members', coalesce((select jsonb_agg(jsonb_build_object('email', u.email, 'role', m.role, 'last_sign_in', u.last_sign_in_at,
                   'must_change', coalesce((u.raw_user_meta_data->>'must_change_password')::boolean, false)))
                 from public.catalog_members m join auth.users u on u.id = m.user_id where m.catalog_id = c.id), '[]'::jsonb)
    ) x from public.catalogs c) s), '[]'::jsonb);
end $$;

-- Ziyaretçiye "hizmet dışı" sayfasını göstermek için: yalnızca ad ve durum döner
create or replace function public.tenant_state(p_kind text, p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select case when p_kind = 'catalog' then
    (select jsonb_build_object('name', c.name, 'state',
       case when c.status = 'passive' then 'passive'
            when (c.status = 'trial' and c.trial_ends < current_date) or (c.status = 'active' and c.paid_until < current_date) then 'expired'
            else 'active' end)
     from public.catalogs c where c.slug = lower(p_slug))
  else
    (select jsonb_build_object('name', r.name, 'state',
       case when r.status = 'passive' then 'passive'
            when (r.status = 'trial' and r.trial_ends < current_date) or (r.status = 'active' and r.paid_until < current_date) then 'expired'
            else 'active' end)
     from public.restaurants r where r.slug = lower(p_slug))
  end;
$$;
revoke all on function public.tenant_state(text, text) from public;
grant execute on function public.tenant_state(text, text) to anon, authenticated;
