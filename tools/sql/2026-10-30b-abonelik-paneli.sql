-- İşletme panelindeki abonelik kartı ve süper paneldeki ücret alanları için.
-- Önce 2026-10-30a-ucret-islem-kaydi.sql çalıştırılmış olmalı (price_* kolonları).

-- Restoran sahibi: kendi aboneliği + NearDiji iletişim bilgisi (sadece üye/süper yöneticiye döner)
create or replace function public.get_my_access(p_slug text)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'user_id', (select auth.uid()),
    'super', private.is_super_admin(),
    'restaurant_id', r.id,
    'role', acc.role,
    'subscription', case when acc.role is not null then jsonb_build_object(
        'status', r.status, 'plan', r.plan, 'trial_ends', r.trial_ends, 'paid_until', r.paid_until,
        'price_amount', r.price_amount, 'price_currency', r.price_currency, 'price_period', r.price_period) end,
    'support', case when acc.role is not null then
        (select jsonb_build_object('whatsapp', sc.data#>>'{contact,whatsapp}', 'phone', sc.data#>>'{contact,phone}', 'email', sc.data#>>'{contact,email}')
           from public.site_content sc where sc.key = 'main') end
  )
  from public.restaurants r
  cross join lateral (select coalesce(
      (select m.role from public.members m where m.restaurant_id = r.id and m.user_id = (select auth.uid())),
      case when private.is_super_admin() then 'super' end) as role) acc
  where r.slug = p_slug;
$$;

-- Katalog sahibi: aynı bilgiler
create or replace function public.get_catalog_access(p_slug text)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'catalog_id', c.id,
    'super', private.is_super_admin(),
    'role', acc.role,
    'subscription', case when acc.role is not null then jsonb_build_object(
        'status', c.status, 'plan', c.plan, 'trial_ends', c.trial_ends, 'paid_until', c.paid_until,
        'price_amount', c.price_amount, 'price_currency', c.price_currency, 'price_period', c.price_period) end,
    'support', case when acc.role is not null then
        (select jsonb_build_object('whatsapp', sc.data#>>'{contact,whatsapp}', 'phone', sc.data#>>'{contact,phone}', 'email', sc.data#>>'{contact,email}')
           from public.site_content sc where sc.key = 'main') end
  )
  from public.catalogs c
  cross join lateral (select coalesce(
      (select m.role from public.catalog_members m where m.catalog_id = c.id and m.user_id = (select auth.uid())),
      case when private.is_super_admin() then 'super' end) as role) acc
  where c.slug = lower(p_slug);
$$;

-- Süper panel listeleri ücret alanlarını da döndürsün
create or replace function public.admin_list_restaurants()
returns jsonb language plpgsql stable security definer set search_path = '' as $function$
begin
  perform private.require_super();
  return coalesce((
    select jsonb_agg(x order by x->>'created_at' desc) from (
      select jsonb_build_object(
        'id', r.id, 'slug', r.slug, 'name', r.name, 'status', r.status, 'plan', r.plan,
        'trial_ends', r.trial_ends, 'paid_until', r.paid_until, 'created_at', r.created_at, 'updated_at', r.updated_at,
        'price_amount', r.price_amount, 'price_currency', r.price_currency, 'price_period', r.price_period,
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
end $function$;

create or replace function public.catalog_admin_list()
returns jsonb language plpgsql stable security definer set search_path = '' as $function$
begin
  perform private.require_super();
  return coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
    select jsonb_build_object('id', c.id, 'slug', c.slug, 'name', c.name, 'status', c.status, 'plan', c.plan,
      'trial_ends', c.trial_ends, 'paid_until', c.paid_until, 'created_at', c.created_at, 'updated_at', c.updated_at,
      'price_amount', c.price_amount, 'price_currency', c.price_currency, 'price_period', c.price_period,
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
end $function$;

-- Demo menülerdeki Unsplash görselleri neardiji.com'dan sunulur (menu/demo/stok/<id>.webp);
-- ziyaretçinin tarayıcısı images.unsplash.com'a bağlanmaz.
update public.products
   set image = 'https://neardiji.com/menu/demo/stok/' || substring(image from 'photo-([0-9a-f-]+)') || '.webp'
 where image like 'https://images.unsplash.com/photo-%';
update public.categories
   set image = 'https://neardiji.com/menu/demo/stok/' || substring(image from 'photo-([0-9a-f-]+)') || '.webp'
 where image like 'https://images.unsplash.com/photo-%';
