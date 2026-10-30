-- Düzeltme: 2026-10-30b sonrası menü ve katalog girişi bozuldu ("permission denied for table catalogs" / 403).
-- Sebep: restaurants/catalogs tablolarında authenticated rolü sadece belirli sütunları okuyabiliyor;
-- get_my_access / get_catalog_access çağıranın yetkisiyle çalışıp status, plan, tarih ve ücret sütunlarını okuyordu.
-- Çözüm: iki fonksiyon tanımlayıcı yetkisiyle (security definer) çalışır; abonelik bilgisi yine sadece üyeye / süper yöneticiye döner.

create or replace function public.get_my_access(p_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
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

create or replace function public.get_catalog_access(p_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
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

-- 821 panelinden katalog düzenlerken bitiş tarihi ve ücret kaydedilebilsin.
-- Bu alanları sadece süper yönetici değiştirebilir (protect_catalog_admin_fields tetikleyicisi + RLS).
grant update (paid_until, price_amount, price_currency, price_period) on public.catalogs to authenticated;
