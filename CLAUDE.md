# NearDiji (repo: Restoran-men-)

Bağımsız proje. Ofischi, ASODA, NEAR, PRONTO ile dosya, repo, anahtar veya kural paylaşmaz. Başka projeden bir şey kopyalama.

## Dil ve çıktı
- Tüm arayüz metinleri Türkçe, doğal ve doğru. Yönetici panellerinde İngilizce metin olmaz.
- Üretim kalitesinde çalış: demo, yer tutucu yok. Kapsamdaki her sayfa tam çalışır.
- Mobilde yatay kaydırma, taşma, üst üste binen buton olmaz. Mobilde kart ve büyük dokunma alanı.
- Tasarım: premium, sade, altın/siyah vurgu serbest. Yayında canlı site `neardiji.com`; bozucu değişiklik yapma.

## Yayın
- Cloudflare Workers statik varlık (`wrangler.jsonc`, Worker adı `neardiji`). GitHub `main`'e push otomatik yayınlanır. Bu yüzden `main`'e doğrudan değişiklik gitmeden önce kullanıcıya sor.
- `.assetsignore` yayına girmeyecekleri belirler: `tools/`, `cloudflare/`, `*.md`, `wrangler.jsonc`, `CNAME`. Yeni araç/not dosyaları bu klasörlere konur.
- `_headers`: güvenlik başlıkları, önbellek; `/821/*` ve `/ayse/*` noindex ve no-store. Yeni yönetici sayfası eklenirse buraya eklenir.
- Alan adları: `neardiji.com`, `www.neardiji.com`. Medya: `media.neardiji.com`.

## Sayfalar ve betikler
Her sayfa ince HTML + ayrı `app.js` yapısındadır; mantık `app.js` içindedir.
- `/` ana sayfa: `index.html` → `assets/eski-link.js` (eski `?r=firma` linkleri), `assets/site-data.js` (`ND_DEFAULT`), `assets/liquid-hero.js`, `assets/site.js` (`site_content` okur).
- `404.html` → `assets/yonlendir.js`: `neardiji.com/firma` adresini firmanın menüsüne yönlendirir.
- `/821` süper yönetici: `821/tema.js`, `assets/qr.js`, `821/app.js`. RPC: `admin_list_restaurants`, `admin_create_restaurant`, `admin_add_owner`, `catalog_admin_list`, `catalog_admin_create`, `catalog_admin_add_owner`, `admin_reset_password`.
- `/ayse` site paneli: `ayse/tema.js`, `ayse/app.js`. Yetki `am_i_super`, içerik `site_content`.
- `/katalog`: `katalog/app.js` (React, yerel `assets/vendor/react-18.3.1`), `katalog/bulut.js` (`window.SH21`), `katalog/pdf-font.js`. RPC: `get_catalog`, `get_catalog_access`, `tenant_state`, `track_catalog_visit`.
- `/menu` NearMenu Premium: `menu/app.js`. RPC: `get_menu`, `menu_version`, `get_my_access`, `tenant_state`, `track_visit`; çeviri media-worker `/translate` ile.
- Görseller: `menu/demo/` (demo), `katalog/urunler/<seri>/` (aqua, atlantis, bien, eva, icon, lego, moon, part, royal).
- `katalog/SPEC-vade.md`: TL vade özelliği (uygulandı).
- Bağlantı haritası: `tools/graphify/graph.html` ve `graph.json`.

## Supabase ve medya
- Tek Supabase projesi (URL `assets/site-data.js` içinde). Tablolar: `restaurants`, `catalogs`, `site_content`, `products`, `categories`, `events`; `private.visit_seen`, `private.app_salt`.
- Güvenlik modeli (`tools/sql/2026-10-28-guvenlik.sql`): anon tablolardan doğrudan okuyamaz, herkese açık veri `get_menu` / `get_catalog` RPC ile gelir; authenticated için sütun bazlı okuma izni. Yeni sütun eklenirse bu izinler güncellenir.
- Anahtar yalnızca publishable olabilir. `service_role` veya gizli anahtar dosyaya yazılmaz.
- Tüm yüklemeler `assets/media.js` (`NDMedia`: url, parse, put, del, delFolder) üzerinden → `media.neardiji.com`.
- media-worker (`cloudflare/media-worker`): R2 `neardiji-media` okuma/yazma, klasör silme, yazma yetkisi `media_can_write`, `/translate` çevirisi Workers AI ile (oturum açmış kullanıcı).
- Geçiş notları: `cloudflare/GECIS.md`.
- Cloudflare API'ye `api.cloudflare.com` üzerinden Authorization başlığı YAZMADAN istek atılır; anahtarı proxy ekler.

## Kilitli kararlar
- Abonelik durumları: `trial` (bitiş `trial_ends`) ve `active` (bitiş `paid_until`). Adlar ve alanlar değiştirilmez.
- Katalog TL vade: tek oran, vade iskontodan sonra uygulanır, peşin etiketi "Peşin" (`katalog/SPEC-vade.md`).
- Yeni CSP/`connect-src` ihtiyacı çıkarsa tüm sayfalardaki listeler birlikte güncellenir.

## Çalışma kuralları
- Kullanıcının verdiği karar kilitlidir; gerçek bir sorun varsa önce kısaca söyle, sonra kararı uygula.
- Çeviri gerekiyorsa yalnızca düzenlenen alanlar çevrilir.
- Girdi doğrulama, parametreli sorgu, hız sınırlama ve gizli anahtar yazmama varsayılandır.
- Geliştirme dalı: `claude/graphify-gce9g5`. PR istenmedikçe açılmaz.
