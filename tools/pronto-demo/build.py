#!/usr/bin/env python3
"""PRONTO → NEAR demo dönüştürücü.

Kullanım:
  python3 tools/pronto-demo/build.py teklif  <PRONTO-teklif-repo-klasörü>
  python3 tools/pronto-demo/build.py siparis <OF-SCH-PRONTO-repo-klasörü>

Gerçek uygulamanın index.html'i kopyalanır ve:
  - Supabase adresi/anahtarı demo değerleriyle değiştirilir (CSP'de sunucu bağlantısı kapatılır)
  - OFISCHI logoları/ikonları yerine NEAR kullanılır
  - Ortak demo deposu (pronto/ortak/) ve uygulamanın demo katmanı yüklenir:
    iki demo aynı tarayıcıda aynı veriyi paylaşır (Teklif → Sipariş Takibi → Teklif)
Kaynak repo hiç değiştirilmez. Çıktı: pronto/<uygulama>/ ve pronto/ortak/
Kaynakta beklenen bir metin bulunamazsa hiçbir şey yazılmadan durur.
"""
import json, re, shutil, subprocess, sys, tarfile, tempfile
from pathlib import Path

KOK = Path(__file__).resolve().parents[2]
BURASI = Path(__file__).resolve().parent
ORTAK = KOK / 'pronto' / 'ortak'

# Sipariş Takibi'nin PDF / Excel kütüphaneleri (gerçek uygulamanın yayın iş akışındaki sabit sürümler)
KUTUPHANELER = [
    ('html2canvas@1.4.1', 'dist/html2canvas.min.js', 'html2canvas.min.js'),
    ('jspdf@2.5.2', 'dist/jspdf.umd.min.js', 'jspdf.umd.min.js'),
    ('pdfmake@0.2.10', 'build/pdfmake.min.js', 'pdfmake.min.js'),
    ('pdfmake@0.2.10', 'build/vfs_fonts.js', 'vfs_fonts.js'),
    ('https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz', 'dist/xlsx.full.min.js', 'xlsx.full.min.js'),
]

MANIFEST = '''{
  "name": "%s",
  "short_name": "%s",
  "id": "./", "start_url": "./", "scope": "./",
  "display": "standalone", "lang": "tr",
  "background_color": "#F2F1EE", "theme_color": "#F2F1EE",
  "icons": [
    {"src": "/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "/assets/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
'''


def degistir(s, eski, yeni, adet=1):
    n = s.count(eski)
    if n != adet:
        sys.exit(f"Beklenen metin {adet} kez yerine {n} kez bulundu, kaynak değişmiş olabilir:\n  {eski[:120]!r}")
    return s.replace(eski, yeni)


def degistir_re(s, desen, yeni, adet=1):
    s2, n = re.subn(desen, yeni, s)
    if n != adet:
        sys.exit(f"Beklenen desen {adet} kez yerine {n} kez bulundu, kaynak değişmiş olabilir:\n  {desen[:120]!r}")
    return s2


def ortak():
    ORTAK.mkdir(parents=True, exist_ok=True)
    shutil.copy(BURASI / 'gorseller.js', ORTAK / 'gorseller.js')
    shutil.copy(BURASI / 'ortak.js', ORTAK / 'sunucu.js')
    shutil.copy(BURASI / 'rehber.js', ORTAK / 'rehber.js')


def ikonlar_ve_baslik(s, baslik, aciklama):
    s = degistir(s, '<link rel="icon" type="image/png" sizes="64x64" href="ikon-64.png">',
                 '<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">')
    s = degistir(s, '<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">',
                 '<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">')
    s = degistir_re(s, r'(?m)^<title>[^<$]*</title>$',
                    f'<title>{baslik}</title>\n<meta name="description" content="{aciklama}">\n<meta name="robots" content="noindex">')
    return s


def yerel_fontlar(s):
    """Google Fonts yerine sitenin kendi yazı tipleri (/assets/fonts/fonts.css); ziyaretçiden Google'a istek gitmez."""
    s = re.sub(r'<link rel="preconnect" href="https://fonts\.(googleapis|gstatic)\.com"( crossorigin)?>\n', '', s)
    s = degistir_re(s, r'<link (?:rel="stylesheet" )?href="https://fonts\.googleapis\.com/css2\?[^"]+"(?: rel="stylesheet")?>',
                    '<link rel="stylesheet" href="/assets/fonts/fonts.css">')
    return s.replace(' https://fonts.googleapis.com', '').replace(' https://fonts.gstatic.com', '')


def temiz_klasor(ad):
    cikti = KOK / 'pronto' / ad
    lib = cikti / 'lib'
    sakla = None
    if lib.exists():   # kütüphaneler her seferinde yeniden indirilmesin
        sakla = Path(tempfile.mkdtemp()) / 'lib'
        shutil.copytree(lib, sakla)
    if cikti.exists():
        shutil.rmtree(cikti)
    cikti.mkdir(parents=True)
    if sakla:
        shutil.copytree(sakla, lib)
    return cikti


def teklif(kaynak: Path):
    s = (kaynak / 'index.html').read_text(encoding='utf-8').replace('\r\n', '\n')
    s = degistir(s, "connect-src 'self' https://*.supabase.co wss://*.supabase.co;", "connect-src 'self';")
    s = degistir(s, '<script src="config.js"></script>',
                 "<script>window.PRONTO_CONFIG={url:'https://demo.invalid',anonKey:'near-demo-anahtari',email:'demo@neardiji.com'};</script>")
    s = yerel_fontlar(s)
    s = ikonlar_ve_baslik(s, 'PRONTO Teklif · Demo — NearDiji', 'PRONTO teklif, proforma, müşteri ve ödeme takibi — örnek verilerle canlı demo.')
    # demo katmanı: tanımlar bitti, açılıştan hemen önce
    s = degistir(s, '\nboot();\n</script>',
                 '\n</script>\n<script src="../ortak/gorseller.js"></script>\n<script src="../ortak/sunucu.js"></script>\n'
                 '<script src="../ortak/rehber.js"></script>\n<script src="demo.js"></script>\n<script>boot();</script>')

    cikti = temiz_klasor('teklif')
    ortak()
    (cikti / 'index.html').write_text(s, encoding='utf-8')
    shutil.copy(BURASI / 'teklif-demo.js', cikti / 'demo.js')
    shutil.copytree(kaynak / 'adres', cikti / 'adres', ignore=lambda d, ad: [x for x in ad if not x.endswith('.json')])
    (cikti / 'manifest.webmanifest').write_text(MANIFEST % ('PRONTO Teklif · Demo', 'Teklif Demo'), encoding='utf-8')
    print('Hazır:', cikti.relative_to(KOK))


def kutuphaneler(lib: Path):
    lib.mkdir(exist_ok=True)
    surum = lib / '.surumler.json'
    istenen = [k[0] + ':' + k[1] for k in KUTUPHANELER]
    if surum.exists() and json.loads(surum.read_text()) == istenen and all((lib / k[2]).exists() for k in KUTUPHANELER):
        return
    with tempfile.TemporaryDirectory() as g:
        for paket, ic, ad in KUTUPHANELER:
            for x in Path(g).iterdir():
                shutil.rmtree(x) if x.is_dir() else x.unlink()
            subprocess.run(['npm', 'pack', paket, '--pack-destination', g, '--loglevel=warn'], check=True, stdout=subprocess.DEVNULL)
            tgz = next(Path(g).glob('*.tgz'))
            with tarfile.open(tgz) as t:
                t.extractall(g, filter='data')
            kaynak = Path(g) / 'package' / ic
            if not kaynak.exists():
                kaynak = kaynak.with_name(kaynak.name.replace('.min.js', '.js'))
            if not kaynak.exists():
                sys.exit(f'Kütüphane bulunamadı: {paket} içinde {ic}')
            shutil.copy(kaynak, lib / ad)
    surum.write_text(json.dumps(istenen))


def siparis(kaynak: Path):
    s = (kaynak / 'index.html').read_text(encoding='utf-8').replace('\r\n', '\n')
    g = json.loads((BURASI / 'gorseller.js').read_text(encoding='utf-8').split('=', 1)[1].strip().rstrip(';'))

    # sunucu bağlantısı kapalı, gerçek adres/anahtar yok
    s = degistir(s, "img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
                 "img-src 'self' data: blob:; connect-src 'self';")
    s = degistir_re(s, r'url: "https://[a-z0-9]+\.supabase\.co",', 'url: "https://demo.invalid",')
    s = degistir_re(s, r'anonKey: "sb_publishable_[A-Za-z0-9_-]+",', 'anonKey: "near-demo-anahtari-0000000000",')
    s = degistir_re(s, r'sharedEmail: "[^"]+"', 'sharedEmail: "demo@neardiji.com"')
    # Supabase kütüphanesi yerine ortak demo deposu + tarayıcı içi istemci
    s = degistir(s, '<script src="lib/supabase.min.js"></script>',
                 '<script src="../ortak/gorseller.js"></script><script src="../ortak/sunucu.js"></script><script src="supabase-demo.js"></script>')
    s = degistir(s, '</body>', '<script src="../ortak/rehber.js"></script>\n<script src="demo.js"></script>\n</body>')

    # marka: NEAR logosu, OFISCHI adları genel ifadeler
    s = degistir_re(s, r'src="data:image/png;base64,[A-Za-z0-9+/=]+" alt="Ofischi Premium" class="lock-logo"',
                    f'src="{g["rozet"]}" alt="NEAR" class="lock-logo"')
    s = degistir_re(s, r'src="data:image/webp;base64,[A-Za-z0-9+/=]+" alt="Ofischi Premium" class="mobile-logo"',
                    f'src="{g["rozet"]}" alt="NEAR" class="mobile-logo"')
    s = degistir(s, 'alt="Ofischi Premium" class="sidebar-logo"', 'alt="NEAR" class="sidebar-logo"')
    s = s.replace('Ofischi Sevkiyat', 'Firma Sevkiyatı').replace('alt="Ofischi Logo"', 'alt="Logo"').replace('OFISCHI PREMIUM MAĞAZA', 'ÖRNEK MAĞAZA')
    s = s.replace('OFİSCHİ BÜRO MOBİLYALARI', 'NEAR DEMO MOBİLYA').replace('OFİSCHİ', 'NEAR DEMO')
    kalan = sorted(set(m.group(0) for m in re.finditer(r'.{0,25}ofischi.{0,25}', s, re.I) if 'SEVKIYAT' not in m.group(0).upper()))
    if kalan:
        print('Uyarı: kaynakta hâlâ "ofischi" geçen yerler var:', *kalan[:8], sep='\n  ')

    s = yerel_fontlar(s)
    s = ikonlar_ve_baslik(s, 'PRONTO Sipariş Takibi · Demo — NearDiji', 'PRONTO sipariş, tedarikçi, sevkiyat ve stok takibi — örnek verilerle canlı demo.')

    cikti = temiz_klasor('siparis')
    ortak()
    kutuphaneler(cikti / 'lib')
    (cikti / 'index.html').write_text(s, encoding='utf-8')
    shutil.copy(BURASI / 'supabase-demo.js', cikti / 'supabase-demo.js')
    shutil.copy(BURASI / 'siparis-demo.js', cikti / 'demo.js')
    (cikti / 'manifest.webmanifest').write_text(MANIFEST % ('PRONTO Sipariş Takibi · Demo', 'Sipariş Demo'), encoding='utf-8')
    print('Hazır:', cikti.relative_to(KOK))


if __name__ == '__main__':
    islem = {'teklif': teklif, 'siparis': siparis}
    if len(sys.argv) != 3 or sys.argv[1] not in islem:
        sys.exit(__doc__)
    islem[sys.argv[1]](Path(sys.argv[2]).resolve())
