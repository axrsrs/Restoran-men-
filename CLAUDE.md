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

## Sayfalar
- `/` ana sayfa (`index.html`, içerik `site_content` tablosundan, varsayılan `assets/site-data.js` içindeki `ND_DEFAULT`).
- `/821` süper yönetici: restoran ve katalog kayıtları, deneme/aktif/abonelik durumu (`paid_until`), müşteriye WhatsApp paylaşım metni.
- `/ayse` site paneli: ana sayfa içeriğini düzenler.
- `/katalog` ürün kataloğu (~7500 satır, React unpkg). Bulut katmanı `katalog/bulut.js`. `tools/sh21-bulut.py` bu sayfaya yama uygular (React sürüm sabitleme, CSP).
- `/menu/demo` demo ürün görselleri (.webp).
- Bağlantı haritası: `tools/graphify/graph.html` ve `graph.json`.

## Supabase ve medya
- Tek Supabase projesi (URL `assets/site-data.js` içinde). Tablolar: `restaurants`, `catalogs`, `site_content`. Yazma yetkisi RPC `media_can_write` ile denetlenir.
- Anahtar yalnızca publishable olabilir. `service_role` veya gizli anahtar dosyaya yazılmaz.
- Tüm yüklemeler `assets/media.js` (`NDMedia`) üzerinden. `BASE = https://media.neardiji.com` → Cloudflare R2 `neardiji-media`. Worker kodu `cloudflare/media-worker`.
- Geçiş notları ve kalan işler: `cloudflare/GECIS.md` (Supabase Storage kovaları bir hafta sonra silinecek, GitHub Pages kapatılabilir).
- Cloudflare API'ye `api.cloudflare.com` üzerinden Authorization başlığı YAZMADAN istek atılır; anahtarı proxy ekler.

## Kilitli kararlar
- Abonelik durumları: `trial` (bitiş `trial_ends`) ve `active` (bitiş `paid_until`). Adlar ve alanlar değiştirilmez.
- Yeni CSP/`connect-src` ihtiyacı çıkarsa tüm sayfalardaki listeler birlikte güncellenir.

## Çalışma kuralları
- Kullanıcının verdiği karar kilitlidir; gerçek bir sorun varsa önce kısaca söyle, sonra kararı uygula.
- Çeviri gerekiyorsa yalnızca düzenlenen alanlar çevrilir.
- Girdi doğrulama, parametreli sorgu, hız sınırlama ve gizli anahtar yazmama varsayılandır.
- Geliştirme dalı: `claude/graphify-gce9g5`. PR istenmedikçe açılmaz.
