#!/usr/bin/env python3
"""PRONTO → NEAR demo dönüştürücü.

Kullanım:
  python3 tools/pronto-demo/build.py teklif <PRONTO-teklif-repo-klasörü>

Gerçek uygulamanın index.html'i kopyalanır ve:
  - Supabase adresi/anahtarı demo değerleriyle değiştirilir (CSP'de sunucu bağlantısı kapatılır)
  - OFISCHI ikonları yerine NEAR ikonları kullanılır
  - boot() çağrısından hemen önce demo katmanı (teklif-demo.js) yüklenir
Kaynak repo hiç değiştirilmez. Çıktı: pronto/<uygulama>/
"""
import re, shutil, sys
from pathlib import Path

KOK = Path(__file__).resolve().parents[2]
BURASI = Path(__file__).resolve().parent


def degistir(s, eski, yeni, adet=1):
    n = s.count(eski)
    if n != adet:
        sys.exit(f"Beklenen metin {adet} kez yerine {n} kez bulundu, kaynak değişmiş olabilir:\n  {eski[:120]!r}")
    return s.replace(eski, yeni)


def teklif(kaynak: Path):
    cikti = KOK / 'pronto' / 'teklif'
    if cikti.exists():
        shutil.rmtree(cikti)
    cikti.mkdir(parents=True)

    s = (kaynak / 'index.html').read_text(encoding='utf-8').replace('\r\n', '\n')

    # sunucuya bağlanamasın
    s = degistir(s, "connect-src 'self' https://*.supabase.co wss://*.supabase.co;", "connect-src 'self';")
    s = degistir(s, '<script src="config.js"></script>',
                 "<script>window.PRONTO_CONFIG={url:'https://demo.invalid',anonKey:'near-demo-anahtari',email:'demo@neardiji.com'};</script>")
    # NEAR ikonları ve başlık
    s = degistir(s, '<link rel="icon" type="image/png" sizes="64x64" href="ikon-64.png">',
                 '<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">')
    s = degistir(s, '<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">',
                 '<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">')
    s = degistir(s, '<title>PRONTO</title>',
                 '<title>PRONTO Teklif · Demo — NearDiji</title>\n<meta name="description" content="PRONTO teklif, proforma, müşteri ve ödeme takibi — örnek verilerle canlı demo.">\n<meta name="robots" content="noindex">')
    # demo katmanı: tanımlar bitti, açılıştan hemen önce
    s = degistir(s, '\nboot();\n</script>',
                 '\n</script>\n<script src="gorseller.js"></script>\n<script src="demo.js"></script>\n<script>boot();</script>')

    (cikti / 'index.html').write_text(s, encoding='utf-8')
    shutil.copy(BURASI / 'teklif-demo.js', cikti / 'demo.js')
    shutil.copy(BURASI / 'gorseller.js', cikti / 'gorseller.js')
    shutil.copytree(kaynak / 'adres', cikti / 'adres')
    (cikti / 'manifest.webmanifest').write_text('''{
  "name": "PRONTO Teklif · Demo",
  "short_name": "PRONTO Demo",
  "id": "./", "start_url": "./", "scope": "./",
  "display": "standalone", "lang": "tr",
  "background_color": "#F2F1EE", "theme_color": "#F2F1EE",
  "icons": [
    {"src": "/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "/assets/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
''', encoding='utf-8')
    print('Hazır:', cikti.relative_to(KOK))


if __name__ == '__main__':
    if len(sys.argv) != 3 or sys.argv[1] not in ('teklif',):
        sys.exit(__doc__)
    {'teklif': teklif}[sys.argv[1]](Path(sys.argv[2]).resolve())
