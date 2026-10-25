# Cloudflare'a geçiş — yapılacaklar (sıradaki oturum için)

Durum (hazır olanlar):
- `assets/media.js`: tüm yüklemeler buradan geçer. `BASE = ""` → Supabase Storage. Geçişte `BASE = "https://media.neardiji.com"`.
- `cloudflare/media-worker`: R2 Worker'ı (GET/HEAD/PUT/DELETE, Range, CORS). Yerel testleri geçti.
- Supabase: `public.media_can_write(p_bucket, p_path)` hazır (authenticated). Worker yetkiyi bununla sorar.
- `_headers`, `_redirects`: Cloudflare Pages için hazır.

Ön koşullar (kullanıcı yapar):
1. Cloudflare panelinde R2'yi etkinleştir.
2. API anahtarı → ortam değişkeni `CLOUDFLARE_API_TOKEN` (izinler: Account: Workers Scripts Edit, Workers R2 Storage Edit,
   Cloudflare Pages Edit, Account Settings Read · Zone neardiji.com: DNS Edit, Workers Routes Edit, Zone Read).

ÖNEMLİ — anahtar nasıl verildi:
- Anahtar ortam değişkeni DEĞİL, "Network secret" olarak eklendi: `api.cloudflare.com`'a giden her isteğe proxy
  `Authorization: Bearer <anahtar>` başlığını kendisi ekler. Anahtar oturumda görünmez.
- Bu yüzden Cloudflare REST API'sini doğrudan `curl https://api.cloudflare.com/client/v4/...` ile (Authorization başlığı
  YAZMADAN) çağır. Önce doğrula: `curl -s https://api.cloudflare.com/client/v4/user/tokens/verify`.
- wrangler kullanılacaksa `CLOUDFLARE_API_TOKEN=yer-tutucu` ile çalıştırmayı dene; proxy başlığı değiştirmezse
  wrangler yerine REST API kullan (Worker yükleme: `PUT /accounts/{id}/workers/scripts/neardiji-media` multipart,
  R2: `POST /accounts/{id}/r2/buckets`, nesne: `PUT /accounts/{id}/r2/buckets/neardiji-media/objects/<anahtar>`,
  özel alan adı: `PUT /accounts/{id}/workers/domains`, Pages: `POST /accounts/{id}/pages/projects` + direct upload).

Adımlar:
1. Hesap kimliği: `curl -s https://api.cloudflare.com/client/v4/accounts`. R2 etkin (25 Ekim 2026). Bucket'ı **Avrupa konumuyla** aç:
   `curl -s -X POST https://api.cloudflare.com/client/v4/accounts/<id>/r2/buckets -H 'Content-Type: application/json' -d '{"name":"neardiji-media","locationHint":"eeur"}'`
   (kullanıcılar Türkiye'de; ENAM varsayılanı yavaş olur)
2. `cd cloudflare/media-worker && npx wrangler@3 deploy` → media.neardiji.com özel alan adı.
   Kontrol: `curl -I https://media.neardiji.com/menu-media/yok.png` → 404; yetkisiz PUT → 403.
3. Dosyaları taşı: Supabase'te `select bucket_id, name, metadata->>'mimetype' from storage.objects` →
   her biri için `https://rfwgjzkewtjpdcvrhepg.supabase.co/storage/v1/object/public/<bucket>/<name>` indir →
   `npx wrangler@3 r2 object put "neardiji-media/<bucket>/<name>" --file <dosya> --content-type <tür> --cache-control "public, max-age=31536000, immutable" --remote`
   (Ekim 2026 itibarıyla 10 dosya, ~7,5 MB.)
4. `assets/media.js` → `BASE = "https://media.neardiji.com"`; CSP `connect-src` listelerine `https://media.neardiji.com` ekle
   (index.html, 404.html, menu/index.html, 821/index.html, ayse/index.html; katalog zaten `https:` izinli).
5. Veritabanındaki linkleri çevir:
   ```sql
   do $$ declare o text:='https://rfwgjzkewtjpdcvrhepg.supabase.co/storage/v1/object/public/'; n text:='https://media.neardiji.com/'; begin
   update public.restaurants set logo=replace(logo,o,n), settings=replace(settings::text,o,n)::jsonb where logo like o||'%' or settings::text like '%'||o||'%';
   update public.products   set image=replace(image,o,n) where image like o||'%';
   update public.categories set image=replace(image,o,n) where image like o||'%';
   update public.events     set image=replace(image,o,n) where image like o||'%';
   update public.site_content set data=replace(data::text,o,n)::jsonb where data::text like '%'||o||'%';
   update public.catalogs   set data=replace(data::text,o,n)::jsonb where data::text like '%'||o||'%';
   end $$;
   ```
6. Site → Cloudflare Pages: `npx wrangler@3 pages project create neardiji --production-branch main`,
   `npx wrangler@3 pages deploy . --project-name neardiji --branch main` (repo kökünden; .git hariç).
   Özel alan adları: API `POST /accounts/{id}/pages/projects/neardiji/domains` → `neardiji.com`, `www.neardiji.com`.
   DNS: apex A kayıtları (GitHub) yerine `CNAME neardiji.com → neardiji.pages.dev` (proxied), `www` aynı.
   Kalıcı otomatik yayın için kullanıcı Pages projesini GitHub'a bağlayabilir (Settings → Builds → Connect).
7. Uçtan uca test: menü logosu / ürün görseli yükleme, site paneli logo, katalog görseli, video arka plan (Range), PDF görselleri (CORS).
8. Bir hafta sorunsuz çalışınca Supabase Storage kovalarını ve storage politikalarını kaldır; GitHub Pages'i kapat.
