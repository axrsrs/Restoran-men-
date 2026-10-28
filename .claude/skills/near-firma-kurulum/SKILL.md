---
name: near-firma-kurulum
description: NEAR katalog sistemine (neardiji.com/katalog/<slug>) yeni mobilya firması kurar veya mevcut firmayı günceller. Ammar katalog PDF'i, fiyat listesi, logo, Instagram ve web sitesi gönderdiğinde ya da "yeni firma kur", "firmayı kur", "kataloğu kur" dediğinde kullan. Kategoriler, ürünler, fiyatlar, ölçü/m³/kg/paket, PDF katalog + fiyat listesi şablonu, kapaklar, iletişim bilgileri dahil.
---

# NEAR — Yeni Firma Kurulumu (B yöntemi: biz kuruyoruz)

Repo: `axrsrs/Restoran-men-` · Katalog uygulaması: `katalog/index.html` · Veri: Supabase `menu21` (`rfwgjzkewtjpdcvrhepg`), tablo `public.catalogs`, firma başına bir satır, içerik `data` (JSONB).
Yanıtlar ve tüm arayüz metni Türkçe. Başka projeyle (OFISCHI vb.) asla karıştırma.

## 0. Girdiler (Ammar gönderir)

| # | Girdi | Ne çıkarılır |
|---|-------|--------------|
| 1 | Katalog PDF | Kategoriler, modeller, ürün görselleri, açıklamalar, ölçüler, m³/kg/paket, sayfa düzeni (şablon referansı) |
| 2 | Fiyat listesi (PDF/Excel/foto) | Modül fiyatları (TL/USD/EUR), notlar, fiyat tarihi |
| 3 | Logo | Aynen kullanılır, yeniden çizilmez/renk değiştirilmez |
| 4 | Instagram | `pdf.instagram` |
| 5 | Web sitesi | `pdf.website` + adres, telefon, e-posta, fabrika/mağaza bilgisi (siteden okunur) |

Eksik girdi varsa başlamadan önce **tek mesajda** listele; varsayılan uydurma. Slug, giriş e-postası, para birimi/kur, tema rengi belli değilse sor.

## 1. Hazırlık

1. `git checkout <atanmış branch>`; dosyaları scratchpad'te ayrı klasöre koy.
2. PDF'leri `pdftotext -layout` ve `pdfimages`/`pdftoppm` ile aç; sayfaları görsel olarak da incele (Read ile PNG).
3. Firma satırı var mı kontrol et:
   `select slug, status, trial_ends, jsonb_object_keys(data) from public.catalogs where slug='<slug>';`
   Yoksa mevcut bir firmayı (ör. `asoda`) şablon alarak satır oluştur; alan adlarını **aynen** koru.

## 2. Yapılacaklar (sırayla)

### 2.1 Kategoriler
`data.categories[]` → `{ id, name, name_en, items: [] }`. `id` küçük harf, Türkçe karaktersiz (`yatak`, `yemek`, `tv`, `koltuk`, `genc`…). Katalogdaki oda/ürün grubu sırasını izle.

### 2.2 Ürünler
Her model+oda bir ürün: `{ id: "<model>-<oda>", name, name_en, name_src, collection: "<Model>", desc, desc_en, desc_src, dims, dims_en, image, images: [], price: {...} }`.
- `collection` = model adı (MOON, BİEN…) → PDF model-model gruplanır (`pdf.groupBy: "model"`).
- Açıklama katalogdan; yoksa kısa, doğal Türkçe yaz + İngilizcesi.
- **Görseller:** katalog PDF'inden çıkar → `.webp` (≈1600px, kalite 82) → `katalog/urunler/<model>/<oda>.webp`. Bağlantı **mutlak yol**: `/katalog/urunler/<model>/<oda>.webp`. Fotoğrafı olmayan ürünleri listele, uydurma görsel koyma.

### 2.3 Fiyatlar
`price.parts[]` (modül modül): `{ id: "<ürün-id>-1-<n>", name, name_en, name_src, dims, dims_en, amount: <TL>, prices: { USD, EUR }, contactOnly: false }`.
- `price.amount: null`, `totals: {}`, `autoCollect: false`, `manualTotal: null`.
- TL → `amount`; döviz listesi varsa `prices.USD/EUR` listeden birebir; yoksa boş bırak ve sor (kurla uydurma).
- Takım/kombin satırlarını da part olarak gir (parantez içinde içerik).
- Kur: `data.currency = { enabled, usdRate, eurRate, editCur: "TRY", selected: "TRY" }`. `data.priceDate` = listedeki tarih.
- Fiyat listesi notları: `pdf.notes` (TL), `pdf.notes_usd`, `pdf.notes_eur` + `_en` sürümleri.
- İskonto: `data.discount = { enabled, currencies: { TRY, USD, EUR } }` (oran panelde girilmez).
- Bitince **sayım kontrolü**: kaynak listedeki satır sayısı = girilen part sayısı; 5 rastgele fiyatı kaynakla karşılaştır.

### 2.4 Ölçü, m³, kg, paket
- Ölçü → part `dims` (ör. `200×60×220 cm`) + `dims_en`.
- m³ / kg / paket adedi → part'a `m3`, `kg`, `pkg` alanları.
- **Kural:** PDF'te m³/kg/paket **yalnız USD/EUR'da gösterilir, TL'de gizlenir** (ihracat listesi).
- ⚠️ Uygulamada bu alanların gösterimi henüz yoksa önce `katalog/index.html` içinde panel alanı + PDF sütunu eklenmeli (bkz. §4 CSP).

### 2.5 Katalog ve fiyat listesi şablonu + kapaklar
`data.pdf`:
- `catalogTemplate`: `akilli | klasik | vitrin | izgara | dergi` — firmanın kendi katalog düzenine en yakın olanı seç.
- `title` / `title_en` (ör. `TOPTAN FİYAT LİSTESİ` / `WHOLESALE PRICE LIST`), `catalogTitle` (`ÜRÜN KATALOĞU`).
- `useCategoryCovers: true`, `showPageNumbers: true`, `groupBy: "model"`.
- **Giriş kapağı:** `coverLogo: { src }` (firma logosu), `coverImage` (katalogdan en güçlü ambiyans görseli, mutlak yol).
- **Kapanış kapağı:** `closingImage`, `closingNote`, `backText` (fabrika + mağaza adresi, telefon, e-posta, web — satır satır).
- `footer`: `Firma · İlçe / İl · Telefon`.

### 2.6 İletişim / kimlik
`data.siteName(_en)`, `subtitle(_en)`, `eyebrow(_en)`, `phone`, `logo` (`{ src, size, width, height, ... }` — logo dosyası `katalog/urunler/logo-<slug>.png`), `pdf.website`, `pdf.instagram`, `pdf.email`, `data.theme` (`{ id, name, ui, bg, card, text, accent }` — logo renklerinden; ör. ASODA siyah+gümüş `luxe`).
Satır alanları: `name`, `status`, `plan`, `trial_ends`.

## 3. Yazma ve yayın

1. JSON'u scratchpad'te bir dosyada hazırla, `jq` ile doğrula.
2. Supabase'e yaz: önce mevcut `data`yı yedekle (scratchpad'e `select data`), sonra `update public.catalogs set data = $json$...$json$::jsonb, updated_at = now() where slug='<slug>';` (yalnız ilgili firma satırı).
3. Görselleri/logoyu commit et → branch'e push. `main`'e merge olunca Cloudflare ~30 sn'de yayınlar.
4. Canlı kontrol: `neardiji.com/katalog/<slug>` → Playwright ile mobil (390px) + masaüstü ekran görüntüsü; PDF'i TL ve USD'de indirip kapak, model grupları, m³ sütunu (USD'de var / TL'de yok), kapanış kapağını kontrol et.
5. Ekran görüntülerini Ammar'a gönder → onay → yayın.

## 4. Teknik kurallar
- `katalog/index.html`'e her dokunuşta satır 5'teki **CSP sha256 hash'ini** inline script için yeniden hesapla (`openssl dgst -sha256 -binary | base64`), `node --check` ile script'i doğrula, canlıda beyaz ekran kontrolü yap.
- Görseller her zaman **mutlak yol** (`/katalog/...`).
- Sırlar koda yazılmaz; yalnız ilgili firmanın satırı güncellenir.
- Kurulum sonunda "NEAR Katalog Sistemi & ASODA — Durum Notu" formatında kısa bir **durum notu** üret: tamamlanan, bekleyen, görseli olmayan ürünler.

## 5. Teslim mesajı (kısa)
- Kaç kategori / ürün / fiyat satırı girildi, kaç ürüne görsel.
- Eksikler (görselsiz ürünler, belirsiz fiyatlar).
- Ammar'ın yapacağı: onay / merge / sert yenileme (Ctrl/Cmd+Shift+R).
