#!/usr/bin/env python3
"""NearDiji bağlantı haritası güncelleyicisi.

tools/graphify/graph.json elle hazırlanmış açıklamalar içerir; bu betik onları korur ve yalnızca:
  - artık bulunmayan dosyalara (ya da kodda adı geçmeyen fonksiyonlara) ait düğümleri çıkarır,
  - haritada olmayan sayfa betiklerini, PWA manifestlerini, SQL göçlerini ve araçları ekler,
  - sayfaların yüklediği betikleri (<script src>, <link rel="manifest">) ve betiklerin çağırdığı RPC'leri/tabloları bağlar.
Yeni düğümlerin açıklaması dosyanın başındaki yorumdan alınır. Ardından graph.html yeniden üretilir.

Kullanım (depo kökünde):  python3 tools/graphify/guncelle.py
"""
import json
import re
from pathlib import Path

KOK = Path(__file__).resolve().parents[2]
CIKTI = KOK / 'tools' / 'graphify'
ATLA = ('node_modules/', 'tools/graphify/', '.git/')

veri = json.loads((CIKTI / 'graph.json').read_text(encoding='utf-8'))
dugumler = {n['id']: n for n in veri['nodes']}
baglar = {(e['from'], e['to'], e['rel']) for e in veri['edges']}
eklenen, cikarilan = [], []


def sade(t: str, sinir=420) -> str:
    t = re.sub(r'[=─━_*#~-]{4,}', ' ', t)  # süs çizgileri
    t = re.sub(r'\s+', ' ', t).strip(' ·—-')
    return t if len(t) <= sinir else t[: sinir - 1].rstrip() + '…'


def bas_yorum(metin: str) -> str:
    s = metin.lstrip()
    if s.startswith('/*'):
        return sade(re.sub(r'^\s*\*\s?', '', s[2: s.find('*/')], flags=re.M))
    satirlar = []
    for satir in s.splitlines():
        t = satir.strip()
        if t.startswith(('//', '--', '#')) and not t.startswith('#!'):
            satirlar.append(t.lstrip('/-# ').strip())
        elif t.startswith('#!') or (not t and not satirlar):
            continue
        else:
            break
    return sade(' '.join(l for l in satirlar if not l.upper().startswith('UYGULAMA')))


def var_mi(yol: str) -> bool:
    return (KOK / yol.split('#')[0]).exists()


def dosya_dugumu(yol: str):
    for n in dugumler.values():
        if n.get('file', '').split('#')[0] == yol and n['type'] != 'fn':
            return n
    return None


def ekle(id_, label, tur, desc, file=None):
    if id_ in dugumler:
        return dugumler[id_]
    n = {'id': id_, 'label': label, 'type': tur, 'desc': desc}
    if file:
        n['file'] = file
    dugumler[id_] = n
    eklenen.append(f'{tur}: {label}')
    return n


def bag(a, b, rel):
    if a != b and a in dugumler and b in dugumler and not any(x == a and y == b for x, y, _ in baglar):
        baglar.add((a, b, rel))


def kimlik(yol: str) -> str:
    return 'f:' + re.sub(r'[^\w]+', '_', yol).strip('_')


# ───────── 1) eskiyenleri çıkar ─────────
icerik_onbellek: dict[str, str] = {}
for n in list(dugumler.values()):
    f = n.get('file')
    if not f:
        continue
    if not var_mi(f):
        cikarilan.append(f'{n["type"]}: {n["label"]} ({f} yok)')
        del dugumler[n['id']]
        continue
    if n['type'] == 'fn':
        yol = KOK / f.split('#')[0]
        if yol.is_file():
            icerik = icerik_onbellek.setdefault(str(yol), yol.read_text(encoding='utf-8', errors='ignore'))
            ad = re.sub(r'\(.*', '', n['label']).strip().split('.')[-1]
            if ad and not re.search(r'\b' + re.escape(ad) + r'\b', icerik):
                cikarilan.append(f'fn: {n["label"]} ({f} içinde artık yok)')
                del dugumler[n['id']]

# ───────── 2) dosyaları tara ─────────
tum = sorted(p for p in KOK.rglob('*') if p.is_file() and not any(p.relative_to(KOK).as_posix().startswith(a) for a in ATLA))
rel = lambda p: p.relative_to(KOK).as_posix()


def kutuphane_klasoru(yol: str):
    """lib/ altındaki hazır kütüphaneler tek tek değil, klasör düğümüyle gösterilir."""
    parca = yol.split('/')
    if 'lib' in parca[:-1]:
        klasor = '/'.join(parca[: parca.index('lib') + 1])
        return dosya_dugumu(klasor)
    return None


def betik_dugumu(yol: str):
    n = dosya_dugumu(yol)
    if n:
        return n
    k = kutuphane_klasoru(yol)
    if k:
        return k
    p = KOK / yol
    if not p.is_file():
        return None
    tur = 'tool' if yol.startswith('tools/') else 'js'
    return ekle(kimlik(yol), yol, tur, bas_yorum(p.read_text(encoding='utf-8', errors='ignore')) or 'Betik.', yol)


def manifest_dugumu(yol: str):
    n = dosya_dugumu(yol)
    if n:
        return n
    p = KOK / yol
    try:
        m = json.loads(p.read_text(encoding='utf-8'))
        ad = m.get('name') or m.get('short_name') or ''
    except Exception:
        ad = ''
    return ekle(kimlik(yol), yol, 'cfg', sade(f'Uygulama olarak yükleme (PWA) manifesti{": " + ad if ad else ""}. Ana ekrana eklenince bu ad ve simge kullanılır.'), yol)


# sayfalar → betikler ve manifestler
for p in tum:
    if p.suffix != '.html':
        continue
    yol = rel(p)
    sayfa = dosya_dugumu(yol)
    if not sayfa:
        continue
    html = p.read_text(encoding='utf-8', errors='ignore')
    for src in re.findall(r'<script[^>]+src="([^"]+)"', html):
        if src.startswith(('http:', 'https:', '//')):
            continue
        hedef = (KOK / src.lstrip('/')) if src.startswith('/') else (p.parent / src)
        try:
            h = rel(hedef.resolve())
        except ValueError:
            continue
        n = betik_dugumu(h.split('?')[0])
        if n:
            bag(sayfa['id'], n['id'], 'yükler')
    for href in re.findall(r'<link[^>]+rel="manifest"[^>]+href="([^"]+)"|<link[^>]+href="([^"]+)"[^>]+rel="manifest"', html):
        h = next((x for x in href if x), '')
        if not h or h.startswith(('http:', 'https:', 'blob:', 'data:')):
            continue
        hedef = (KOK / h.lstrip('/')) if h.startswith('/') else (p.parent / h)
        if hedef.is_file():
            bag(sayfa['id'], manifest_dugumu(rel(hedef.resolve()))['id'], 'manifest')

# tek başına duran manifestler (betikle bağlananlar): uygulama.js gibi dinamik bağlayıcılar
for p in tum:
    if p.name == 'manifest.webmanifest':
        n = manifest_dugumu(rel(p))
        klasor = rel(p.parent)
        sayfa = dosya_dugumu(klasor + '/index.html') if klasor != '.' else dosya_dugumu('index.html')
        if sayfa:
            bag(sayfa['id'], n['id'], 'manifest')

# betikler → RPC ve tablolar
rpc_id = {}
for n in dugumler.values():
    if n['type'] == 'rpc':
        rpc_id[re.sub(r'\(.*', '', n['label']).strip()] = n['id']
tablo_id = {n['label'].strip(): n['id'] for n in dugumler.values() if n['type'] == 'data'}
for p in tum:
    if p.suffix not in ('.js', '.mjs') or '.min.' in p.name or kutuphane_klasoru(rel(p)):
        continue
    yol = rel(p)
    metin = p.read_text(encoding='utf-8', errors='ignore')
    rpcler = set(re.findall(r"\.rpc\(\s*['\"](\w+)['\"]", metin)) | set(re.findall(r"/rpc/(\w+)", metin))
    tablolar = set(re.findall(r"\.from\(\s*['\"](\w+)['\"]\s*\)", metin))
    if not (rpcler or tablolar) and not dosya_dugumu(yol):
        if yol.startswith(('assets/', 'pronto/', 'tools/')):
            betik_dugumu(yol)
        continue
    kaynak = betik_dugumu(yol)
    if not kaynak:
        continue
    for r in sorted(rpcler):
        if r not in rpc_id:
            rpc_id[r] = ekle('r_' + r, r + '()', 'rpc', 'Supabase RPC (tanımı tools/sql altında ya da veritabanında).')['id']
        bag(kaynak['id'], rpc_id[r], 'RPC')
    for t in sorted(tablolar):
        if t not in tablo_id:
            tablo_id[t] = ekle('t_' + t, t, 'data', 'Supabase tablosu.')['id']
        bag(kaynak['id'], tablo_id[t], 'okur')

# SQL göçleri → tanımladığı RPC'ler ve tablolar
for p in tum:
    if p.suffix != '.sql':
        continue
    yol = rel(p)
    metin = p.read_text(encoding='utf-8', errors='ignore')
    n = dosya_dugumu(yol) or ekle(kimlik(yol), p.name, 'tool', bas_yorum(metin) or 'SQL göçü.', yol)
    for m in re.finditer(r'create\s+(?:or\s+replace\s+)?function\s+public\.(\w+)\s*\((.*?)\$\$', metin, re.I | re.S):
        ad, imza = m.group(1), m.group(2)
        if ad not in rpc_id:
            if re.search(r'returns\s+trigger', imza, re.I):
                rpc_id[ad] = ekle('fn_' + ad, ad + '()', 'fn', f'Tetikleyici işlev (tablo değişikliğinde kendiliğinden çalışır, API\'den çağrılmaz); tanım: {yol}.', yol)['id']
            else:
                rpc_id[ad] = ekle('r_' + ad, ad + '()', 'rpc', f'Supabase RPC; tanım: {yol}.')['id']
        bag(n['id'], rpc_id[ad], 'tanımlar')
    for t in sorted(set(re.findall(r'create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)', metin, re.I))):
        if t not in tablo_id:
            tablo_id[t] = ekle('t_' + t, t, 'data', f'Supabase tablosu; tanım: {yol}.')['id']
        bag(n['id'], tablo_id[t], 'tablo')

# PRONTO demo araçları: üretici betiğe bağlanır
uretici = dosya_dugumu('tools/pronto-demo/build.py')
if uretici:
    for n in list(dugumler.values()):
        if n.get('file', '').startswith('tools/pronto-demo/') and n['id'] != uretici['id']:
            bag(uretici['id'], n['id'], 'içerir')

# ───────── 3) yaz ─────────
kalan = set(dugumler)
veri['nodes'] = list(dugumler.values())
veri['edges'] = [{'from': a, 'to': b, 'rel': r} for a, b, r in sorted(baglar) if a in kalan and b in kalan]
(CIKTI / 'graph.json').write_text(json.dumps(veri, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
sablon = (CIKTI / 'sablon.html').read_text(encoding='utf-8')
(CIKTI / 'graph.html').write_text(sablon.replace('__BASLIK__', 'NearDiji (Restoran-men-)').replace('__VERI__', json.dumps(veri, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
print(f'graph.json + graph.html · {len(veri["nodes"])} düğüm · {len(veri["edges"])} bağlantı')
print(f'eklenen ({len(eklenen)}):', *eklenen, sep='\n  ')
print(f'çıkarılan ({len(cikarilan)}):', *cikarilan, sep='\n  ')
