# Spec: Katalog — TL Vade (Vadeli / Vadesiz Fiyat)

Durum: **Uygulandı** — kararlar: tek oran, vade iskontodan sonra, peşin etiketi "Peşin"
Kapsam: `katalog/index.html` (tüm firmalar için ortak motor; ayar her firmanın kendi verisinde)

## Amaç
Yönetim panelinden isteğe bağlı bir **vade oranı** (örn. %10, %40, %60 — ne girilirse) tanımlanır.
Açıkken, **yalnızca TL** görünümünde:
- **Ana site:** ürün kartı + ürün detayında **Peşin (vadesiz)** ve **Vadeli** fiyat birlikte görünür.
- **Fiyat listesi PDF (TL):** her satırda ve takım fiyatında peşin + vadeli fiyat basılır.

USD/EUR görünümü, katalog PDF'i (fiyatsız) ve yönetim paneli içindeki fiyat önizlemeleri **değişmez**.

## Veri modeli (yeni şema/tablo YOK)
Katalog verisi zaten tek JSON olarak buluta kaydediliyor (`bulut.js → save`). Mevcut `discount` bloğunun yanına:

```js
data.vade = {
  enabled: false,      // isteğe bağlı aç/kapa
  rate: null,          // % — 0 < rate ≤ 100 (ondalık kabul: 12.5)
  label: ""            // opsiyonel, örn. "3 Ay Vadeli" — boşsa "Vadeli"
}
```
- `normalizeData` + `sanitizeForSave` içinde doğrulanır: sayı değilse / aralık dışıysa `rate=null`, `label` → `safeText(…, 40)`.
- Eski kayıtlar: `vade` yoksa `enabled:false` → mevcut davranış birebir korunur.
- Yedek indir/yükle (JSON) otomatik taşır.

## Hesap kuralı (kilitlenecek)
```
peşin  = kur dönüşümü → iskonto (mevcut akış, aynen)
vadeli = peşin × (1 + rate/100)
```
- Vade, **iskontodan sonra** uygulanır (iskonto girildiyse vadeli de iskontolu fiyat üzerinden).
- Yuvarlama mevcut kuralla aynı: kuruş atılır (`Math.floor`).
- Takım fiyatı: parçaların vadeli toplamı değil, **takım peşin fiyatı × (1+rate)** (manuel takım toplamı da desteklenir, tutarlı olur).
- Sadece `currency.selected === "TRY"` iken. Diğer para birimlerinde vadeli satır hiç render edilmez.

## Kod mimarisi
| Katman | Değişiklik |
|---|---|
| Sabit/normalize | `normalizeData`, varsayılan veri (`discount` yanına `vade`), kayıt temizleme |
| Hesap | Yeni saf fonksiyonlar: `vadeActive(source)`, `vadeAmountByData(source, amount)`, `formatVadeByData(source, amount)` — `formatAmountByData`'nın üzerine kurulur, onu değiştirmez |
| Görünüm verisi | `viewCurrencyData()` panel kapalıyken `__vade` (oran) taşır — iskontodaki `__discount` deseniyle aynı; veriye yazılmaz |
| Ana site | Kart: fiyat altında 2. satır "Vadeli: 26.400 ₺" (küçük, `whitespace-nowrap`, mobilde taşma yok). Detay: parça satırlarında ve "Toplam"da peşin + vadeli |
| PDF fiyat listesi | Satır tablosunda birim fiyat sütunu ikiye bölünür: **PEŞİN / VADELİ** başlıklı; takım paneli iki satır. Kapakta not: "Vadeli fiyatlara %X vade farkı uygulanmıştır". Vade kapalıysa düzen birebir eski |
| Yönetim paneli | "Ana sayfada iskonto kutusu" kartının altına yeni kart: **"TL vadeli fiyat"** anahtarı + oran kutusu (%) + opsiyonel etiket + canlı örnek ("10.000 ₺ → 11.000 ₺"). Tamamen Türkçe |
| EN dil | "Cash" / "Installment" karşılıkları `t()` sözlüğüne eklenir |

## Sınırlar
- **Her zaman:** girdi doğrulama (0 < oran ≤ 100), eski veriyle geriye uyum, mobilde yatay kaydırma yok, CSP script hash'i güncellenir.
- **Önce sor:** vade bilgisini katalog PDF'ine (fiyatsız) taşımak, çoklu vade kademesi.
- **Asla:** veri tabanına fiyat yazmak (vadeli fiyat her zaman hesaplanır, saklanmaz), USD/EUR fiyatlarına dokunmak.

## Başarı kriterleri
1. Vade kapalı → site ve PDF çıktısı bugünküyle aynı.
2. Vade %10, ürün 10.000 ₺ → kartta "10.000 ₺" + "Vadeli 11.000 ₺"; detayda ve TL PDF'te aynı.
3. İskonto %5 + vade %10 → peşin 9.500 ₺, vadeli 10.450 ₺.
4. USD/EUR seçili → hiçbir yerde vadeli fiyat yok.
5. Kaydet ve yayınla → yenileme / farklı cihazda ayar korunur.
6. 360 px genişlikte kartlarda taşma/çakışma yok; PDF satırlarında fiyatlar sütuna sığıyor.

## Test
Proje build/test aracı yok (tek HTML). Doğrulama: Playwright ile yerel sunucu → panelde aç/kapa, kart/detay ekran görüntüsü (360 px + masaüstü), TL fiyat listesi PDF'i üretip sayfaları görsel kontrol; hesap fonksiyonları için Node ile küçük birim kontrolü.

## Kilitli kararlar
1. Tek oran (+ isteğe bağlı etiket).
2. Vadeli = iskontolu peşin × (1 + oran/100).
3. Peşin fiyat etiketi: "Peşin" (EN: "Cash"); vadeli varsayılan "Vadeli" (EN: "Installment").
