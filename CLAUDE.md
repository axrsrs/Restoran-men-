# NearDiji (neardiji.com) — proje haritası

Bu repo yalnız **NEAR / NearDiji** projesidir. OFISCHI, ASODA ve diğer müşterilerin dosyaları veya kuralları buraya karışmaz.
PRONTO yalnız demo olarak burada durur (aşağıya bak). Arayüz metinleri **sadece Türkçe** (katalogda EN alanları hariç).

## Yayın
- Cloudflare Workers statik varlıklar: `wrangler.jsonc` (Worker `neardiji`). **`main`'e push = canlıya çıkış.**
- `.assetsignore`: `tools/`, `cloudflare/`, `docs/`, `*.md`, `.github` yayına gitmez.
- Güvenlik ve önbellek başlıkları: `_headers`. `/821` ve `/ayse` noindex ve no-store.
- Her sayfanın kendi `<meta http-equiv="Content-Security-Policy">` başlığı var. Yeni bir dış adres eklenecekse önce o sayfanın CSP'sine eklenir.

## Sayfalar → dosyalar
| Yol | Ne | Kendi dosyası | Ortak (assets/) |
|---|---|---|---|
| `/` | Tanıtım sitesi | `index.html` | site.js, site-data.js, liquid-hero.js, cerez.js, eski-link.js, sb-config.js |
| `/xfirma` (404) | Kısa link → menü/katalog | `404.html` | yonlendir.js |
| `/menu/?r=slug` | NearMenu: QR menü + işletme paneli | `menu/app.js` (~8.8k satır), `menu/index.html` | sb-config, giris, media, qr, abonelik, uygulama, cerez |
| `/katalog/?f=slug` | Mobilya kataloğu (sh21, React) | `katalog/app.js` (~7.3k), `katalog/bulut.js` | + vendor/react 18.3.1 |
| `/ayse` | Ana site içerik paneli (süper yönetici) | `ayse/app.js` | sb-config, giris, media, site-data |
| `/821` | Süper yönetici paneli | `821/app.js` | sb-config, giris, qr |
| `/pronto/teklif`, `/pronto/siparis` | PRONTO demoları (ağa çıkmaz) | **üretilir**, elle düzenleme | — |

Büyük dosyalarda bölüm başlıklarını bulmak için: `grep -nE "^   [A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ /&-]{3,}$" menu/app.js`
(menu: STORAGE, OTOMATİK ÇEVİRİ, GÜNCEL KUR, TEMA, PRODUCT MODAL, ADMIN GENERAL/CATEGORY/PRODUCT, RENDER, PANEL EK OLAYLARI, BAŞLAT;
821: AYARLAR, YARDIMCILAR, DURUM, GÖRÜNÜM, OLAYLAR, BAŞLAT).

## Ortak modüller (assets/)
- `sb-config.js`: Supabase URL ve publishable anahtarın **tek kaynağı** (`window.ND_SB_URL`, `ND_SB_KEY`). Sunucu tarafındaki ikinci kopya `cloudflare/media-worker/wrangler.toml` içinde.
- `giris.js` + `giris.css`: ortak giriş ekranı (`NDGiris`).
- `media.js`: tüm yükleme ve silmeler buradan geçer, `https://media.neardiji.com/<kova-öneki>/<yol>` adresini kullanır.
- `qr.js`: QR penceresi (`NDQR.open`). `abonelik.js`: panel abonelik kartı (`NDAbonelik`). `uygulama.js`: ana ekrana ekleme için manifest (`NDUygulama`).
- `cerez.js`: çerez onayı. Cloudflare Web Analytics yalnız izin verilirse yüklenir.

## Backend
**Supabase** (proje `rfwgjzkewtjpdcvrhepg`, RLS açık). Tarayıcıda supabase-js yok, düz `fetch` ile `rest/v1` ve `auth/v1` kullanılır.
- Tablolar: `restaurants` (+ `categories`, `products`, `events`), `catalogs` (firma başına tek satır, `data` JSON), `site_content` (`key='main'`), `audit_log`; `private.visit_seen`, `private.app_salt`.
- Menü RPC'leri: `get_menu`, `get_my_access`, `menu_version`, `tenant_state`, `track_visit`
- Katalog RPC'leri: `get_catalog`, `get_catalog_access`, `tenant_state`, `track_catalog_visit`
- Yönetim RPC'leri: `admin_reset_password`, `admin_list_restaurants`, `catalog_admin_list`, `tetra_baslangic`, `tetra_admin_ayarla`, `am_i_super`
- Worker RPC'si: `media_can_write`
- Göçler: `tools/sql/*.sql` (elle uygulanır). ⚠ `tetra_*`, `am_i_super` ve `media_can_write` **repoda tanımlı değil**, yalnız veritabanında var.

**Worker `neardiji-media`** (`cloudflare/media-worker/src/index.js`, alan adı `media.neardiji.com`):
- GET/HEAD/PUT/DELETE `/<kova>/<yol>`. Yazma ve silmede Supabase oturum anahtarı `auth/v1/user` ile doğrulanır, yetki `media_can_write` ile sorulur.
- R2 kovaları: önek `menu-media/` → `neardiji-menu`, `catalog-media/` → `neardiji-katalog`, `site-media/` → `neardiji-site`. `LEGACY` = `neardiji-media`, salt okunur yedek ve kaldırılması bekleniyor (`cloudflare/GECIS.md`).
- `POST /translate`: Workers AI (llama-3.3-70b), yalnız giriş yapmış panel kullanıcıları. `GET /kur`: Frankfurter kuru, önbellekli. Ziyaretçi tarayıcısı dış kur servisine bağlanmaz.
- Worker ayrı deploy edilir (`wrangler deploy`, `cloudflare/media-worker/` içinden). `main`'e push Worker'ı güncellemez.

## Çeviri
- Menü: Worker `/translate` ve ayrıca `api.mymemory.translated.net` (CSP'de izinli).
- Katalog (bulut): Worker `/translate`. `katalog/app.js` içindeki doğrudan Anthropic yolu kapalı, CSP de engelliyor. Ölü kod, yeniden açılmaz.
- Kural: yalnız düzenlenen alanlar çevrilir, tüm site değil.

## Üretilen dosyalar (elle düzenleme)
- `pronto/**`: `tools/pronto-demo/build.py`, kaynak `ofischi/PRONTO` (teklif) ve `ofischi/OF-SCH-PRONTO` (sipariş). GitHub Action `pronto-demo.yml` her gün 06:17'de üretip main'e yazar.
  Demo katmanı `tools/pronto-demo/*.js` dosyalarında: `ortak.js` → `pronto/ortak/sunucu.js`, `supabase-demo.js` sahte Supabase istemcisi, veriler IndexedDB'de (`near_pronto_demo`).
- `katalog/`: sh21 şablonundan türetildi. Yamalar `tools/sh21-bulut.py` içinde (bulut katmanı, CSP özeti, fontlar). Şablon güncellenince betik yeniden çalıştırılır. Betik yama bulamazsa durur.

## Kurallar
- Yeni sayfa veya ortak dosya eklerken `sb-config.js`'i kullan, anahtarı kopyalama.
- Medya her zaman `media.js` üzerinden yüklenir. R2'ye veya Supabase Storage'a doğrudan istek atılmaz.
- Yeni SQL fonksiyonu eklenince `tools/sql/` altına tarihli dosya olarak da eklenir.
- KVKK ve veri ihlali süreci: `docs/veri-ihlali.md`. Yeni bir üçüncü taraf servis eklenirse buraya da yazılır.
- Bu dosya mimari değişince güncellenir (yeni sayfa, tablo, RPC, servis).
