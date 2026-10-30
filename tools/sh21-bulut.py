#!/usr/bin/env python3
"""sh21 (Demo-katalog/index.html) → neardiji.com/katalog/index.html bulut sürümü.

Kullanım:  python3 tools/sh21-bulut.py ../demo-katalog/index.html katalog/index.html
sh21 şablonu güncellendiğinde bu betik yeniden çalıştırılır; yamalar bulunamazsa hata verir.
"""
import base64
import hashlib
import re
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"YAMA BULUNAMADI ({n}≠{count}): {old[:80]!r}")
    s = s.replace(old, new)


# 1) bulut katmanı uygulamadan önce yüklenir
rep('<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>',
    '<script src="/assets/media.js"></script>\n<script src="/assets/qr.js"></script>\n<script src="/assets/abonelik.js"></script>\n<script src="/katalog/bulut.js"></script>\n'
    '<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>')

# 2) yerel kayıt fonksiyonları bulutta Supabase'e gider
rep('function readLocalRecord(key) {', 'function readLocalRecord(key) {\n    if (window.SH21)\n        return null;')
rep('async function loadLocal() {', 'async function loadLocal() {\n    if (window.SH21)\n        return await SH21.loadRecord();')
rep('async function saveLocal(data) {', 'async function saveLocal(data) {\n    if (window.SH21)\n        return await SH21.save(sanitizeCatalogData(data));')

# 3) boş bulut kaydı: demo içerik gösterilir (yeni firma örnekle başlar)
rep('                if (freshStart)\n                    initial = blankTemplateData(await readLegacyCurrency());',
    '                if (freshStart)\n                    initial = window.SH21 ? defaultData() : blankTemplateData(await readLegacyCurrency());')
# ziyaretçi açılışında buluta yazma denemesi yapılmaz
rep('                if (best || fastLocal || freshStart || themeMigrated)\n                    await saveLocal(initial).catch(() => { });',
    '                if (!window.SH21 && (best || fastLocal || freshStart || themeMigrated))\n                    await saveLocal(initial).catch(() => { });')

# 4) PIN yerine e-posta/şifre girişi
rep('    function openAdmin() { if (unlocked && Date.now() - adminActivityRef.current > ADMIN_IDLE_MS) {',
    '    function openAdmin() { if (window.SH21) {\n'
    '        SH21.requireAdmin().then(ok => { if (!ok)\n'
    '            return; adminActivityRef.current = Date.now(); setUnlocked(true); panelSnapshot.current = JSON.parse(JSON.stringify(dataRef.current || data)); admBaseRef.current = dataRef.current || data; setPanelOpen(true); });\n'
    '        return;\n'
    '    } if (unlocked && Date.now() - adminActivityRef.current > ADMIN_IDLE_MS) {')

# 5) panelde PIN değiştirme yerine hesap: şifre değiştir / çıkış
rep('                        React.createElement(AdminLabel, null, "Y\\u00F6netim PIN\'ini De\\u011Fi\\u015Ftir"),\n'
    '                        React.createElement("div", { className: "flex gap-2 mb-5" },',
    '                        window.SH21 && React.createElement(AdminLabel, null, "Hesap" + (SH21.email() ? " \\u2014 " + SH21.email() : "")),\n'
    '                        window.SH21 && React.createElement("div", { className: "flex gap-2 mb-5" },\n'
    '                            React.createElement("button", { type: "button", onClick: () => SH21.changePassword().then(ok => ok && showToast("\\u015Eifre g\\u00FCncellendi.")), className: "flex-1 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-bold" }, "\\u015Eifreyi De\\u011Fi\\u015Ftir"),\n'
    '                            React.createElement("button", { type: "button", onClick: () => SH21.logout(), className: "flex-1 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-bold text-red-400" }, "\\u00C7\\u0131k\\u0131\\u015F Yap")),\n'
    '                        !window.SH21 && React.createElement(AdminLabel, null, "Y\\u00F6netim PIN\'ini De\\u011Fi\\u015Ftir"),\n'
    '                        !window.SH21 && React.createElement("div", { className: "flex gap-2 mb-5" },')

# 6) kayıt mesajı
rep('showToast(STORAGE_OK ? t(language, \'saved\') : "Kaydedildi (yalnızca bu oturumda). Kalıcı kayıt için dosyayı kendi sitenize yükleyin.");',
    'showToast(window.SH21 ? (language === "EN" ? "Saved — your catalog is live." : "Kaydedildi — katalog yayında.") : STORAGE_OK ? t(language, \'saved\') : "Kaydedildi (yalnızca bu oturumda). Kalıcı kayıt için dosyayı kendi sitenize yükleyin.");')

# 5b) süper yöneticiye panelden süper panele geçiş
rep('                            React.createElement("button", { type: "button", onClick: () => SH21.logout(), className: "flex-1 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-bold text-red-400" }, "\\u00C7\\u0131k\\u0131\\u015F Yap")),\n',
    '                            React.createElement("button", { type: "button", onClick: () => SH21.logout(), className: "flex-1 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-bold text-red-400" }, "\\u00C7\\u0131k\\u0131\\u015F Yap")),\n'
    '                        window.SH21 && React.createElement("button", { type: "button", onClick: () => NDQR.open({ url: SH21.url(), title: (language === "EN" ? "Catalog QR code" : "Katalog QR Kodu"), file: SH21.slug }), className: "block w-full text-center py-3 mb-3 rounded-lg text-sm font-bold bg-neutral-800 border border-neutral-700" }, language === "EN" ? "Download QR code" : "QR Kodu \u0130ndir"),\n'
    '                        window.SH21 && SH21.isSuper() && React.createElement("a", { href: "/821/?k=katalog", className: "block w-full text-center py-3 mb-5 rounded-lg text-sm font-bold", style: { background: theme.accent, color: ink } }, "\\uD83D\\uDEE0 S\\u00FCper Y\\u00F6netici Paneli (kataloglar ve men\\u00FCler)"),\n')

# 5c) NearDiji ikonları ve ana ekran (manifest)
rep('<meta name="apple-mobile-web-app-capable" content="yes">',
    '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">\n'
    '<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n'
    '<meta name="apple-mobile-web-app-capable" content="yes">')

# 6b) panel alt bilgisi: bulutta "bu cihaza" değil, yayına kaydedilir
rep('React.createElement("small", null, "De\\u011Fi\\u015Fiklikler \\u201CKaydet ve yay\\u0131nla\\u201D ile bu cihaza kaydedilir.")',
    'React.createElement("small", null, window.SH21 ? "De\\u011Fi\\u015Fiklikler \\u201CKaydet ve yay\\u0131nla\\u201D ile hemen yay\\u0131na al\\u0131n\\u0131r." : "De\\u011Fi\\u015Fiklikler \\u201CKaydet ve yay\\u0131nla\\u201D ile bu cihaza kaydedilir.")')

# 6b) Yazı tipleri sitenin kendi sunucusundan (/assets/fonts/fonts.css); Google Fonts'a istek gitmez
s = re.sub(r'<link rel="preconnect" href="https://fonts\.(googleapis|gstatic)\.com"( crossorigin)?>\n', "", s)
s, n = re.subn(r'<link (?:rel="stylesheet" )?href="https://fonts\.googleapis\.com/css2\?[^"]+"(?: rel="stylesheet")?>',
               '<link rel="stylesheet" href="/assets/fonts/fonts.css">', s)
if n != 1:
    sys.exit(f"YAMA BULUNAMADI ({n}≠1): Google Fonts bağlantısı")
s = s.replace(" https://fonts.googleapis.com", "").replace(" https://fonts.gstatic.com", "")
s = s.replace("font-src data:", "font-src 'self' data:")

# 7) CSP: bulut.js ('self') + yeni satır içi betik özeti + Supabase bağlantısı
m = re.search(r"<script>([\s\S]*?)</script>", s)
digest = base64.b64encode(hashlib.sha256(m.group(1).encode("utf-8")).digest()).decode()
s, n = re.subn(r"'sha256-[A-Za-z0-9+/=]+'", f"'sha256-{digest}'", s, count=1)
if n != 1:
    sys.exit("CSP özeti güncellenemedi")
# Cloudflare Web Analytics (çerezsiz ziyaretçi istatistiği)
s = s.replace(" https://unpkg.com;", " https://unpkg.com https://static.cloudflareinsights.com;", 1)

open(dst, "w", encoding="utf-8").write(s)
print("tamam:", dst, len(s), "bayt, betik özeti", digest[:12] + "…")
