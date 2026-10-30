# Veri ihlali müdahale planı — NearDiji (neardiji.com)

Kişisel veri sızıntısı ya da yetkisiz erişim fark edildiğinde bu adımlar sırayla uygulanır.
Kurula bildirim süresi: fark edilme anından itibaren **72 saat**.

## Roller

| Rol | Kişi | Görev |
|---|---|---|
| Sorumlu | Ammar | Karar verir, KVKK bildirimini yapar |
| Teknik müdahale | Ammar (yedek: ____) | Erişimi keser, kanıtı korur |
| Müşteri iletişimi | ____ | Etkilenen işletmelere ve kişilere haber verir |

## Sistemler

| Sistem | Ne tutuyor | Nereden yönetilir |
|---|---|---|
| Supabase `menu21` (`rfwgjzkewtjpdcvrhepg`, Frankfurt) | Restoran ve katalog verisi, işletme hesapları (e-posta, şifre özeti), ziyaret sayıları, `audit_log` | supabase.com → menu21 |
| Cloudflare R2: `neardiji-menu`, `neardiji-katalog`, `neardiji-site`, `neardiji-media` (eski) | Logo, ürün görseli ve videolar | Cloudflare → R2 |
| Cloudflare Worker `neardiji-media` (media.neardiji.com) | Yükleme/silme, çeviri, kur | Cloudflare → Workers → Logs |
| Cloudflare Worker `neardiji` (neardiji.com) | Statik site | Cloudflare → Workers → Logs |
| GitHub `axrsrs/restoran-men-` | Site kodu; main'e push otomatik yayınlanır | github.com |

Ziyaretçilerden form ile kişisel veri toplanmaz. Ziyaret sayımı IP adresini saklamaz (günlük, tuzlu özet; 1 gün sonra silinir).

## Zaman çizelgesi (T = fark edilme anı)

| Süre | Adım |
|---|---|
| T + 1 saat | **Erişimi kes.** Şüpheli hesabı Authentication → Users'tan devre dışı bırak, `members` / `catalog_members` / `super_admins` kaydını sil. Açık bir politika varsa kapat. Anahtar sızdıysa Supabase publishable anahtarını döndür (`assets/site-data.js`, `katalog/bulut.js`, `cloudflare/media-worker/wrangler.toml`). Cloudflare veya GitHub token'ı sızdıysa iptal et. |
| T + 4 saat | **Kanıtı al.** Supabase → Logs (API, Auth, Postgres) dışa aktar; Free planda kayıtlar yaklaşık 1 gün tutulur, bu yüzden ilk iş budur. `select * from audit_log order by at desc` sonucunu kaydet. Cloudflare Worker loglarını ve git geçmişini sakla. |
| T + 24 saat | **Kapsamı yaz.** Hangi tablo veya depo, kaç kayıt, hangi kişiler (işletme sahibi, ziyaretçi), hangi tarih aralığı. |
| T + 48 saat | **Bildirimi hazırla.** Kurul bildirim formunu doldur; etkilenen işletmelerin listesini çıkar (`admin_list_restaurants`, `catalog_admin_list`). |
| T + 72 saat | **Bildir.** Kişisel Verileri Koruma Kurumu'na bildirimi gönder; etkilenen kişilere bilgi ver. |
| Sonra | Kök nedeni düzelt, aşağıdaki olay kaydına işle, bu planı güncelle. |

## Olay kaydı

| Tarih | Ne oldu | Etkilenen | Bildirim tarihi | Yapılan düzeltme |
|---|---|---|---|---|
| | | | | |
