const { useState, useEffect, useRef, useDeferredValue } = React;
/*
  PREMIUM ÜRÜN KATALOĞU — BOŞ ŞABLON
  - Katalog verisi bu cihazda tutulur (localStorage + IndexedDB)
  - Görseller katalog verisinin içinde saklanır
  - Yönetim PIN'i katalog verisinde DEĞİL; ayrı bir anahtarda PBKDF2 hash olarak tutulur
  - İngilizce alanlar Türkçe alanlardan ayrı tutulur
*/
const DB_KEY = "katalog_sablon_catalog_v6";
/* Eski sürüm kayıt anahtarları: yalnızca kur ayarlarını taşımak için okunur (ürün/kategori/görsel taşınmaz). */
const LEGACY_DB_KEYS = ["katalog_sablon_catalog_v5", "katalog_sablon_catalog_backup_v5"];
const LEGACY_IDB_NAME = "katalog_sablon_storage_v3";
/* Tarayıcı depolaması engelliyse (çevrimiçi HTML ön izleme siteleri, bazı gizli modlar, kapalı çerezler)
   site çökmez ve yönetim paneli çalışır: veriler bu sekmenin belleğinde tutulur, sayfa kapanınca silinir. */
const MEM_STORE = new Map();
const TOUR_DONE_KEY = "katalog_admin_tour_done_v1";
function tourDone() { try { return localStorage.getItem(TOUR_DONE_KEY) === "1"; } catch (_) { return false; } }
function markTourDone() { try { localStorage.setItem(TOUR_DONE_KEY, "1"); } catch (_) { } }
const STORAGE_OK = (() => { try {
    const k = "__katalog_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
}
catch (_) {
    return false;
} })();
function lsGet(k) {
    if (STORAGE_OK)
        try {
            return window.localStorage.getItem(k);
        }
        catch (_) { }
    return MEM_STORE.has(k) ? MEM_STORE.get(k) : null;
}
function lsSet(k, v) {
    if (STORAGE_OK)
        try {
            window.localStorage.setItem(k, v);
            return true;
        }
        catch (_) {
            return false; /* depolama dolu */
        }
    MEM_STORE.set(k, String(v));
    return true;
}
function lsRemove(k) {
    if (STORAGE_OK)
        try {
            window.localStorage.removeItem(k);
        }
        catch (_) { }
    MEM_STORE.delete(k);
}
const STORAGE_WARNING = "Bu sayfa kalıcı kayda izin vermeyen bir ortamda açılmış (ör. çevrimiçi HTML ön izleme sitesi). Panel çalışır ama değişiklikler sayfa kapanınca silinir. Kalıcı kullanım için dosyayı kendi sitenize yükleyin veya JSON yedeği alın.";
/* -------------------- SECURITY: INPUT DEFENSE / THROTTLING -------------------- */
const SECURITY_LIMITS = Object.freeze({
    text: 4000, shortText: 500, search: 120, id: 160, jsonFileBytes: 200 * 1024 * 1024,
    imageBytes: 15 * 1024 * 1024, imageCount: 20, apiWindowMs: 60 * 1000,
    apiCallsPerWindow: 30, pinAttempts: 3, assetUrl: 2048
});
function safeText(value, max = SECURITY_LIMITS.text) {
    return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[\u2028\u2029]/g, " ").slice(0, max);
}
function safeShortText(value, max = SECURITY_LIMITS.shortText) { return safeText(value, max).trim(); }
function safeSearchText(value) { return safeText(value, SECURITY_LIMITS.search).trim(); }
function safeId(value) {
    const s = safeShortText(value, SECURITY_LIMITS.id);
    return /^[A-Za-z0-9._~-]+$/.test(s) ? s : "";
}
function safeAssetSource(value) {
    const s = String(value ?? "").trim();
    if (!s)
        return ""; /* boş değer sayfanın kendi adresine çözülmesin */
    if (/^data:image\/(?:png|jpe?g|webp|gif|svg\+xml);/i.test(s))
        return s;
    if (/^blob:/i.test(s))
        return s;
    if (s.length > SECURITY_LIMITS.assetUrl && !/^data:/i.test(s))
        return "";
    /* Site klasöründeki göreli görsel yolu (ör. "x.webp") olduğu gibi saklanır; alan adı değişse de çalışır. */
    if (/^(?:\.\/)?[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_.-]+)*\.(?:webp|png|jpe?g|gif|svg)$/i.test(s) && !s.includes(".."))
        return s;
    try {
        const u = new URL(s, document.baseURI);
        if (u.username || u.password)
            return "";
        if (u.protocol === "https:")
            return u.href;
        /* Aynı kaynaktan (site klasöründen) gelen dosyalar her protokolde kabul edilir. */
        if (u.origin === window.location.origin && u.origin !== "null")
            return u.href;
        return "";
    }
    catch (_) {
        return "";
    }
}
/* Tam sayfa PDF kapak görselleri için daha sıkı kaynak kontrolü: yalnızca data:image (png/jpeg/webp), blob veya aynı site. */
function safePdfPageImageSource(value) {
    const s = String(value ?? "").trim();
    if (!s)
        return "";
    if (/^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(s))
        return s;
    if (/^blob:/i.test(s))
        return s.length <= SECURITY_LIMITS.assetUrl ? s : "";
    if (s.length > SECURITY_LIMITS.assetUrl || /^data:/i.test(s))
        return "";
    if (/^(?:\.\/)?[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_.-]+)*\.(?:webp|png|jpe?g)$/i.test(s) && !s.includes(".."))
        return s;
    try {
        const u = new URL(s, document.baseURI);
        if (!u.username && !u.password && u.origin === window.location.origin && u.origin !== "null" && /^https?:$/.test(u.protocol))
            return u.href;
    }
    catch (_) { }
    return "";
}
/* İletişim alanları: kontrol karakterleri ve <>"'` temizlenir, uzunluk sınırlanır. */
function safeContactInput(value, max = 200) { return safeText(value, max).replace(/[\r\n\t]/g, " ").replace(/[<>"'`]/g, ""); }
function safeContactText(value, max = 200) { return safeContactInput(value, max).replace(/\s+/g, " ").trim(); }
/* Instagram: "kullanici", "@kullanici", "instagram.com/kullanici", "https://www.instagram.com/kullanici/?hl=tr" → "@kullanici".
   Türkçe harf, nokta, tire ve alt çizgi korunur. Boş / geçersiz / 40 karakterden uzun ise "" döner (gösterilmez). */
function instagramHandle(value) {
    let s = safeContactText(value, 200);
    if (!s)
        return "";
    s = s.replace(/^https?:\/\//i, "").replace(/^(?:www\.|m\.)/i, "");
    const m = /^(?:instagram\.com|instagr\.am)(?:\/+(.*))?$/i.exec(s);
    if (m)
        s = m[1] || "";
    s = s.split(/[/?#]/)[0].replace(/^@+/, "").trim();
    if (!s || s.length > 40 || !/^[\p{L}\p{N}._-]+$/u.test(s))
        return "";
    return "@" + s;
}
/* E-posta: basit biçim kontrolü, en fazla 120 karakter; geçmezse "" (gösterilmez). */
function contactEmail(value) {
    const s = safeContactText(value, 200);
    if (!s || s.length > 120 || /\s/.test(s))
        return "";
    return /^[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)*\.[^@\s.]{2,}$/u.test(s) ? s : "";
}
/* CSS url() içine güvenli yerleştirme: tırnak/parantez/ters bölü kaçışlanır. */
function cssUrl(value) {
    const src = safeAssetSource(value);
    if (!src)
        return "";
    return 'url("' + src.replace(/["\\\n\r\f]/g, ch => "\\" + ch.charCodeAt(0).toString(16) + " ") + '")';
}
function safeHexColor(value, fallback) {
    const v = String(value ?? "").trim();
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : fallback;
}
/* Vurgu rengi üzerindeki yazı için okunaklı renk (açık altın üzerinde beyaz yazı yetersiz kontrast veriyordu). */
function inkOn(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
    if (!m)
        return "#fff";
    const ch = [0, 2, 4].map(i => { let v = parseInt(m[1].slice(i, i + 2), 16) / 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    const L = .2126 * ch[0] + .7152 * ch[1] + .0722 * ch[2];
    return (1.05 / (L + .05)) >= ((L + .05) / (0.0081 + .05)) ? "#fff" : "#141416";
}
function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
function validateUploadFile(file, { maxBytes = SECURITY_LIMITS.imageBytes, types = ["image/jpeg", "image/png", "image/webp", "image/gif"] } = {}) {
    if (!file || typeof file !== "object")
        throw new Error("Geçersiz dosya.");
    const mime = String(file.type || "").toLowerCase();
    if (!types.includes(mime))
        throw new Error("Desteklenmeyen dosya türü.");
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > maxBytes)
        throw new Error("Dosya boyutu izin verilen sınırın dışında.");
    const name = safeShortText(file.name || "", 180);
    if (!name || /[\/\\\u0000-\u001F]/.test(name))
        throw new Error("Geçersiz dosya adı.");
    return true;
}
const rateState = new Map();
function consumeClientRateLimit(bucket, limit = SECURITY_LIMITS.apiCallsPerWindow, windowMs = SECURITY_LIMITS.apiWindowMs) {
    const key = safeShortText(bucket, 120) || "default", now = Date.now(), state = rateState.get(key);
    if (!state || now - state.startedAt >= windowMs) {
        rateState.set(key, { startedAt: now, count: 1 });
        return true;
    }
    if (state.count >= limit)
        return false;
    state.count++;
    return true;
}
async function enforceClientRateLimit(bucket, limit, windowMs) {
    if (!consumeClientRateLimit(bucket, limit, windowMs))
        throw new Error("Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin.");
}
function sanitizeCatalogData(data) {
    const clean = normalizeData(data);
    for (const k of ["siteName", "siteName_en", "subtitle", "subtitle_en", "eyebrow", "eyebrow_en"])
        clean[k] = safeText(clean[k]);
    clean.phone = safeText(clean.phone, 80);
    delete clean.pin;
    const base = defaultData();
    clean.logo = {
        src: safeAssetSource(clean.logo?.src) || null,
        size: clampNumber(clean.logo?.size, 20, 600, 110),
        width: clampNumber(clean.logo?.width, 20, 600, 110),
        height: clampNumber(clean.logo?.height, 20, 600, 110),
        position: ["left", "center", "right"].includes(clean.logo?.position) ? clean.logo.position : "center"
    };
    const th = clean.theme || {}, bt = base.theme;
    clean.theme = {
        id: safeId(th.id) || bt.id, name: safeShortText(th.name, 60) || bt.name, ui: UI_STYLES.includes(th.ui) ? th.ui : "apple",
        bg: safeHexColor(th.bg, bt.bg), card: safeHexColor(th.card, bt.card), accent: safeHexColor(th.accent, bt.accent), text: safeHexColor(th.text, bt.text),
        bgImage: safeAssetSource(th.bgImage) || null
    };
    clean.cardImgSize = clampNumber(clean.cardImgSize, 80, 600, 180);
    /* Kur değerleri boş bırakılabilir; varsayılan sayı yazılmaz. */
    const rateOf = v => { if (v === null || v === undefined || v === "") return null; const n = Number(v); return Number.isFinite(n) && n > 0 && n < 1000000 ? n : null; };
    clean.currency = {
        enabled: !!clean.currency?.enabled,
        editCur: CUR_IDS.includes(clean.currency?.editCur) ? clean.currency.editCur : "TRY",
        selected: CUR_IDS.includes(clean.currency?.selected) ? clean.currency.selected : "TRY",
        usdRate: rateOf(clean.currency?.usdRate),
        eurRate: rateOf(clean.currency?.eurRate)
    };
    clean.discount = {
        enabled: !!clean.discount?.enabled,
        currencies: {
            TRY: clean.discount?.currencies?.TRY !== false,
            USD: clean.discount?.currencies?.USD !== false,
            EUR: clean.discount?.currencies?.EUR !== false
        }
    };
    clean.vade = {
        enabled: !!clean.vade?.enabled,
        rate: vadeRateValue(clean.vade?.rate),
        label: safeText(clean.vade?.label, 40)
    };
    if (clean.pdf) {
        for (const k of ["title", "footer", "website", "catalogTitle"])
            clean.pdf[k] = safeText(clean.pdf[k], 200);
        clean.pdf.catalogTemplate = ["akilli", "klasik", "vitrin", "izgara", "dergi"].includes(clean.pdf.catalogTemplate) ? clean.pdf.catalogTemplate : "akilli";
        const lay = {}, srcLay = (clean.pdf.categoryLayouts && typeof clean.pdf.categoryLayouts === "object") ? clean.pdf.categoryLayouts : {};
        const vit = {}, srcVit = (clean.pdf.vitrinModes && typeof clean.pdf.vitrinModes === "object") ? clean.pdf.vitrinModes : {};
        for (const fc of (clean.categories || [])) {
            const v = srcLay[fc.id];
            if (["auto", "table", "sizes", "models"].includes(v))
                lay[fc.id] = v;
            if (["auto", "full", "duo", "flow"].includes(srcVit[fc.id]))
                vit[fc.id] = srcVit[fc.id];
        }
        clean.pdf.categoryLayouts = lay;
        clean.pdf.vitrinModes = vit;
        clean.pdf.showPageNumbers = !!clean.pdf.showPageNumbers;
        /* Kapanış sayfası iletişim alanları + tam sayfa giriş/kapanış kapak görselleri */
        clean.pdf.instagram = safeContactText(clean.pdf.instagram, 200);
        clean.pdf.email = safeContactText(clean.pdf.email, 120);
        clean.pdf.closingNote = safeContactText(clean.pdf.closingNote, 120);
        clean.pdf.coverImage = safePdfPageImageSource(clean.pdf.coverImage);
        clean.pdf.closingImage = safePdfPageImageSource(clean.pdf.closingImage);
        clean.pdf.useCategoryCovers = !!clean.pdf.useCategoryCovers;
    }
    if (clean.pdf?.coverLogo)
        clean.pdf.coverLogo.src = safeAssetSource(clean.pdf.coverLogo.src) || DEFAULT_PDF_COVER_LOGO;
    for (const c of clean.categories || []) {
        c.name = safeText(c.name, 120);
        c.name_en = safeText(c.name_en, 120);
        c.coverImage = safeAssetSource(c.coverImage) || null;
        for (const item of c.items || []) {
            item.id = safeId(item.id) || uid();
            for (const k of ["name", "name_en", "desc", "desc_en", "name_src", "desc_src"])
                item[k] = safeText(item[k]);
            item.dims = safeText(item.dims, 500);
            item.dims_en = safeText(item.dims_en, 500);
            item.m3 = logiNumber(item.m3, 3);
            item.pkg = logiNumber(item.pkg, 0);
            item.kg = logiNumber(item.kg, 2);
            item.image = safeAssetSource(item.image) || null;
            item.images = (Array.isArray(item.images) ? item.images : []).map(safeAssetSource).filter(Boolean).slice(0, SECURITY_LIMITS.imageCount);
            if (item.price) {
                const pr = normalizePrice(item.price);
                item.price = { ...pr,
                    amount: priceNumber(pr.amount), manualTotal: priceNumber(pr.manualTotal), totals: cleanCurMap(pr.totals),
                    contactOnly: !!pr.contactOnly, autoCollect: pr.autoCollect !== false,
                    parts: pr.parts.slice(0, 100).map(part => ({
                        id: safeId(part.id) || uid(),
                        name: safeText(part.name, 300), name_en: safeText(part.name_en, 300), name_src: safeText(part.name_src, 300),
                        dims: safeText(part.dims, 200), dims_en: safeText(part.dims_en, 200),
                        amount: priceNumber(part.amount), contactOnly: !!part.contactOnly,
                        prices: cleanCurMap(part.prices),
                        image: safeAssetSource(part.image) || null,
                        pkg: logiNumber(part.pkg, 0), m3: logiNumber(part.m3, 3), kg: logiNumber(part.kg, 2)
                    })) };
            }
        }
    }
    return clean;
}
const BACKUP_KEY = "katalog_sablon_catalog_backup_v6";
const LANG_KEY = "katalog_premium_lang_v1";
const VIEW_CURRENCY_KEY = "katalog_view_currency_v1";
/* İskonto oranı cihaza özeldir ve SEKME KAPANINCA SIFIRLANIR (sessionStorage). Veritabanına yazılmaz. */
const DISCOUNT_KEY = "katalog_discount_v1";
function discountLoad() {
    try {
        const v = JSON.parse(window.sessionStorage.getItem(DISCOUNT_KEY) || "{}");
        return v && typeof v === "object" ? v : {};
    }
    catch (_) {
        return {};
    }
}
function discountSave(obj) {
    try {
        window.sessionStorage.setItem(DISCOUNT_KEY, JSON.stringify(obj || {}));
    }
    catch (_) { }
}
/* SABİT KATEGORİLER — sitede, yönetim panelinde, fiyat listesinde ve katalogda tek kaynak.
   Ad, sıra ve İngilizce karşılık buradan gelir; panelden eklenemez, silinemez, yeniden adlandırılamaz.
   "aliases": eski sürümlerdeki kategori adları → ürünler doğru kategoriye otomatik taşınır. */
const FIXED_CATEGORIES = Object.freeze([]); /* Kategoriler artık yönetim panelinden eklenir/silinir. */
/* Eşleşmeyen eski kategorilerin ürünleri kaybolmasın diye buraya taşınır. */
const FALLBACK_CATEGORY_ID = null;
function categoryKey(v) { return String(v ?? "").toLocaleUpperCase("tr-TR").replace(/[^A-ZÇĞİÖŞÜ0-9]/g, ""); }
const FIXED_CATEGORY_LOOKUP = (() => { const m = new Map(); for (const fc of FIXED_CATEGORIES) {
    m.set(fc.id, fc.id);
    for (const n of [fc.name, fc.name_en, ...fc.aliases])
        m.set(categoryKey(n), fc.id);
} return m; })();
/* FİYAT LİSTESİ DÜZENİ (kategori bazında)
   table  = Takım tablosu (modül + ölçü + birim fiyat + takım fiyatı)
   sizes  = Ölçü kartları (her ölçü ayrı fiyat; toplanmaz)
   models = Model sırası (Müdür · Şef · Personel · Misafir; her modelin kendi fotoğrafı ve fiyatı; toplanmaz) */
const PDF_CATEGORY_LAYOUTS = Object.freeze([
    { id: "auto", name: "Akıllı (otomatik)", desc: "Ürünlere bakarak en uygun düzeni kendisi seçer." },
    { id: "table", name: "Takım Tablosu", desc: "Modüller toplanır, takım fiyatı çıkar." },
    { id: "sizes", name: "Ölçü Kartları", desc: "Her ölçünün ayrı fiyatı; 3'lü kartlar." },
    { id: "models", name: "Model Sırası", desc: "Müdür, şef, misafir… her modelin resmi ve fiyatı." }
]);
const DEFAULT_CATEGORY_LAYOUTS = Object.freeze({});
/* AKILLI DÜZEN: kategorideki ürünlerin fiyat kalemlerine bakar.
   - Kalemlerin çoğunun kendi fotoğrafı varsa veya kalem adları Müdür/Şef/Misafir gibi modelse → Model Sırası
   - Kalemler aynı ürünün farklı ölçüleriyse (160 cm, 180 cm …) veya tek kalemse → Ölçü Kartları
   - Kalemler farklı modüllerse (Masa, Etajer, Dolap …) → Takım Tablosu (toplam takım fiyatı) */
const AUTO_MODEL_WORDS = /\b(müdür|mudur|şef|sef|personel|misafir|yönetici|yonetici|genel müdür|bekleme|toplantı|toplanti|çalışma|calisma|manager|chief|staff|guest|executive|visitor)\b/i;
function autoLayoutFor(category) {
    const items = (category?.items || []).filter(Boolean);
    let models = 0, table = 0, sizes = 0;
    for (const it of items) {
        const p = normalizePrice(it.price), parts = p.parts;
        if (parts.length < 2) {
            sizes++;
            continue;
        }
        const withImg = parts.filter(x => x.image).length;
        const roleNames = parts.filter(x => AUTO_MODEL_WORDS.test(String(x.name || ""))).length;
        if (withImg >= Math.ceil(parts.length / 2) || roleNames >= Math.ceil(parts.length / 2)) {
            models++;
            continue;
        }
        const stem = x => categoryKey(String(x.name || "").replace(/[0-9]+([.,][0-9]+)?/g, " ").replace(/\b(cm|mm|m|x|×)\b/gi, " "));
        const stems = new Set(parts.map(stem));
        const dimLike = parts.filter(x => !String(x.name || "").trim() || /^[\s\d.,x×*/-]+(cm|mm)?\s*$/i.test(String(x.name))).length;
        if (stems.size === 1 || dimLike >= parts.length / 2) {
            sizes++;
            continue;
        }
        table++;
    }
    if (models > 0 && models >= table && models >= sizes)
        return "models";
    if (table > sizes)
        return "table";
    return "sizes";
}
function categoryLayoutOf(data, categoryId) {
    const v = data?.pdf?.categoryLayouts?.[categoryId];
    if (v && v !== "auto" && PDF_CATEGORY_LAYOUTS.some(l => l.id === v))
        return v;
    const cat = (data?.categories || []).find(c => c.id === categoryId);
    return cat ? autoLayoutFor(cat) : "sizes";
}
function isVariantLayout(layout) { return layout === "sizes" || layout === "models"; }
/* Ölçü/model fiyatları alternatiftir: toplam yerine en düşük fiyat ("…'den başlayan") kullanılır. */
function variantMinPrice(price) {
    const p = normalizePrice(price);
    const vals = p.parts.filter(x => !x.contactOnly).map(x => priceNumber(x.amount)).filter(v => v !== null && v > 0);
    if (vals.length)
        return Math.min(...vals);
    return p.manualTotal !== null && p.manualTotal !== undefined ? priceNumber(p.manualTotal) : null;
}
function fixedCategoryIdFor(c) {
    if (!c || typeof c !== "object")
        return null;
    if (FIXED_CATEGORY_LOOKUP.has(String(c.id || "")))
        return FIXED_CATEGORY_LOOKUP.get(String(c.id));
    const name = typeof c.name === "string" ? c.name : (c.name?.tr || "");
    return FIXED_CATEGORY_LOOKUP.get(categoryKey(name)) || FIXED_CATEGORY_LOOKUP.get(categoryKey(c.name_en)) || null;
}
const THEMES = [
    { id: "apple", name: "Apple", ui: "apple", desc: "Hap butonlar, yuvarlak kartlar, buzlu cam.", bg: "#F5F5F7", card: "#FFFFFF", accent: "#0071E3", text: "#1D1D1F" },
    { id: "minimal", name: "Minimal", ui: "sharp", desc: "Keskin köşeler, ince çizgiler, büyük harf butonlar.", bg: "#FFFFFF", card: "#F4F4F4", accent: "#111111", text: "#111111" },
    { id: "yumusak", name: "Yumuşak", ui: "soft", desc: "Çok yuvarlak kutular, yumuşak gölgeler, sakin yeşil.", bg: "#EDF1EE", card: "#FFFFFF", accent: "#2F6F5E", text: "#1F2A26" },
    { id: "luks", name: "Lüks Gece", ui: "luxe", desc: "Koyu zemin, altın vurgu, klasik yazı, çerçeveli butonlar.", bg: "#0E0E10", card: "#18181B", accent: "#C9A227", text: "#F2EFE8" }
];
const UI_STYLES = ["apple", "sharp", "soft", "luxe"];
const CURRENCIES = [
    { id: "TRY", symbol: "₺", name: "TL" }, { id: "USD", symbol: "$", name: "USD" }, { id: "EUR", symbol: "€", name: "EUR" }
];
/* Glass diyalog: confirm/prompt/alert yerine. Promise döndürür (onay: true/false, giriş: metin veya null). */
function uiDialog(opts) {
    opts = opts || {};
    return new Promise(resolve => {
        const prevFocus = document.activeElement;
        const shell = document.querySelector(".adm-shell");
        let accent = "#0071E3";
        try { const v = shell && getComputedStyle(shell).getPropertyValue("--adm-accent").trim(); if (/^#[0-9a-f]{3,8}$/i.test(v)) accent = v; } catch (_) { }
        const hex = accent.replace("#", ""), full = hex.length === 3 ? hex.split("").map(c => c + c).join("") : hex.slice(0, 6);
        const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
        const ink = (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#141416" : "#FFFFFF";
        const wrap = document.createElement("div");
        wrap.className = "ui-dlg-wrap";
        wrap.style.setProperty("--ui-dlg-accent", accent);
        wrap.style.setProperty("--ui-dlg-accent-soft", `rgba(${r},${g},${b},.16)`);
        wrap.style.setProperty("--ui-dlg-accent-line", `rgba(${r},${g},${b},.38)`);
        wrap.style.setProperty("--ui-dlg-ink", ink);
        const box = document.createElement("div");
        box.className = "ui-dlg" + (opts.danger ? " is-danger" : "");
        box.setAttribute("role", opts.input ? "dialog" : "alertdialog");
        box.setAttribute("aria-modal", "true");
        const icons = {
            plus: '<path d="M12 5v14M5 12h14"/>',
            trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
            alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
            info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
            edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'
        };
        const icon = document.createElement("div");
        icon.className = "ui-dlg-icon";
        icon.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[opts.icon] || (opts.danger ? icons.trash : opts.input ? icons.edit : icons.info)) + "</svg>";
        const title = document.createElement("h2");
        title.className = "ui-dlg-title";
        title.id = "ui-dlg-t-" + Date.now();
        title.textContent = opts.title || (opts.input ? "Bilgi girin" : "Emin misiniz?");
        box.setAttribute("aria-labelledby", title.id);
        box.append(icon, title);
        if (opts.message) {
            const msg = document.createElement("p");
            msg.className = "ui-dlg-msg";
            msg.textContent = opts.message;
            box.append(msg);
        }
        let input = null, err = null;
        if (opts.input) {
            input = document.createElement("input");
            input.className = "ui-dlg-input";
            input.type = "text";
            input.value = opts.defaultValue || "";
            input.placeholder = opts.placeholder || "";
            input.maxLength = opts.maxLength || 120;
            input.autocomplete = "off";
            input.setAttribute("aria-label", opts.title || "Değer");
            err = document.createElement("div");
            err.className = "ui-dlg-err";
            err.setAttribute("aria-live", "polite");
            box.append(input, err);
        }
        const actions = document.createElement("div");
        actions.className = "ui-dlg-actions";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "ui-dlg-btn";
        cancel.textContent = opts.cancelText || "Vazgeç";
        const ok = document.createElement("button");
        ok.type = "button";
        ok.className = "ui-dlg-btn is-primary";
        ok.textContent = opts.okText || (opts.danger ? "Sil" : "Tamam");
        if (!opts.alert)
            actions.append(cancel);
        actions.append(ok);
        box.append(actions);
        wrap.append(box);
        let done = false;
        const finish = val => {
            if (done)
                return;
            done = true;
            document.removeEventListener("keydown", onKey, true);
            wrap.classList.add("is-out");
            setTimeout(() => { wrap.remove(); try { prevFocus && prevFocus.focus && prevFocus.focus(); } catch (_) { } }, 150);
            resolve(val);
        };
        const submit = () => {
            if (!input)
                return finish(true);
            const v = input.value.replace(/\s+/g, " ").trim();
            if (opts.required !== false && !v) {
                err.textContent = opts.requiredText || "Bu alan boş bırakılamaz.";
                input.focus();
                return;
            }
            finish(v);
        };
        const fail = () => finish(input ? null : (opts.alert ? true : false));
        const onKey = e => {
            if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); fail(); }
            else if (e.key === "Enter" && (input ? document.activeElement === input : true)) { e.preventDefault(); e.stopPropagation(); submit(); }
            else if (e.key === "Tab") {
                const f = [input, opts.alert ? null : cancel, ok].filter(Boolean), i = f.indexOf(document.activeElement);
                e.preventDefault();
                f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
            }
            else
                e.stopPropagation();
        };
        ok.addEventListener("click", submit);
        cancel.addEventListener("click", fail);
        wrap.addEventListener("pointerdown", e => { if (e.target === wrap) fail(); });
        input && input.addEventListener("input", () => { err.textContent = ""; });
        document.addEventListener("keydown", onKey, true);
        document.body.append(wrap);
        setTimeout(() => { (input || (opts.danger ? cancel : ok)).focus(); if (input) input.select(); }, 30);
    });
}
function uiConfirm(message, opts) { return uiDialog({ ...(opts || {}), message }); }
function uiPrompt(title, opts) { return uiDialog({ ...(opts || {}), title, input: true }); }
function fileSlug(name) { const t = String(name || "").toLocaleUpperCase("tr-TR").replace(/Ç/g,"C").replace(/Ğ/g,"G").replace(/İ/g,"I").replace(/Ö/g,"O").replace(/Ş/g,"S").replace(/Ü/g,"U").replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,""); return (!t || t === "FIRMA-ADI") ? "" : t + "-"; }
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
const PRELOADED_ITEMS = /*PRELOAD*/ {};
/* Hazır kategori kapak görselleri (isteğe bağlı) — örn. {"ofis-koltuklari": "urunler/kapak/ofis-koltuklari.webp"} */
const PRELOADED_COVERS = {};
const DEFAULT_PHONE = "";
/* Hazır katalog sürümü: yükseltmede, bu cihazda kayıtlı eski katalogdaki GÖRSELİ OLMAYAN ürünlere yeni görseller,
   boş kategori kapaklarına kapak görselleri eklenir. Yöneticinin yüklediği fotoğraflar ve yazdığı metinler asla değiştirilmez. */
const PRELOAD_VERSION = 4;
function applyPreloadUpgrade(data) {
    if (!data || typeof data !== "object" || Number(data.preloadVersion) >= PRELOAD_VERSION)
        return data;
    const key = s => String(s || "").toLocaleUpperCase("tr-TR").replace(/[^A-ZÇĞİÖŞÜ0-9]/g, "");
    /* v4: görseller "urunler/<kategori>/" klasörlerinde. Ara sürümde (v3) kaydedilen klasörsüz dosya adları tam yola çevrilir. */
    const pathOf = new Map();
    for (const cid in PRELOADED_ITEMS)
        for (const p of PRELOADED_ITEMS[cid]) {
            for (const src of (p.images || []))
                pathOf.set(src.split("/").pop(), src);
            for (const part of ((p.price && p.price.parts) || []))
                if (part.image)
                    pathOf.set(part.image.split("/").pop(), part.image);
        }
    for (const cid in PRELOADED_COVERS)
        pathOf.set("kapak-" + PRELOADED_COVERS[cid].split("/").pop(), PRELOADED_COVERS[cid]);
    const fix = v => (typeof v === "string" && !v.includes("/") && pathOf.has(v)) ? pathOf.get(v) : v;
    for (const c of (data.categories || [])) {
        c.coverImage = fix(c.coverImage);
        for (const it of (c.items || [])) {
            it.image = fix(it.image);
            if (Array.isArray(it.images))
                it.images = it.images.map(fix);
            for (const part of ((it.price && it.price.parts) || []))
                part.image = fix(part.image);
        }
    }
    for (const c of (data.categories || [])) {
        const pre = PRELOADED_ITEMS[c.id] || [];
        if (!c.coverImage && PRELOADED_COVERS[c.id])
            c.coverImage = PRELOADED_COVERS[c.id];
        const byId = new Map(pre.map(p => [p.id, p])), byName = new Map();
        pre.forEach(p => { const k = key(p.name); if (!byName.has(k)) byName.set(k, p); });
        for (const it of (c.items || [])) {
            const p = byId.get(it.id) || byName.get(key(it.name));
            if (!p)
                continue;
            const hasImg = (Array.isArray(it.images) && it.images.filter(Boolean).length) || it.image;
            if (!hasImg && Array.isArray(p.images) && p.images.length) {
                it.images = p.images.slice();
                it.image = p.images[0];
            }
            if (p.priceRev && it.priceRev !== p.priceRev) {
                it.price = JSON.parse(JSON.stringify(p.price));
                it.priceRev = p.priceRev;
            }
            const pp = (p.price && p.price.parts) || [];
            for (const part of ((it.price && it.price.parts) || [])) {
                const mt = pp.find(x => x.id === part.id) || pp.find(x => key(x.name) === key(part.name));
                if (mt && mt.image && !part.image)
                    part.image = mt.image;
            }
        }
    }
    if (!data.phone || data.phone === "+90 500 000 00 00")
        data.phone = DEFAULT_PHONE;
    data.preloadVersion = PRELOAD_VERSION;
    return data;
}
function createDefaultCategories() { return FIXED_CATEGORIES.map(fc => ({ id: fc.id, name: fc.name, name_en: fc.name_en, items: [], coverImage: null })); }
const DEFAULT_PDF_COVER_LOGO = null;
function defaultData() {
    return {
        siteName: "Firma Adı", siteName_en: "Company Name",
        subtitle: "Ofis Mobilyaları", subtitle_en: "Office Furniture",
        eyebrow: "", eyebrow_en: "",
        phone: DEFAULT_PHONE, preloadVersion: PRELOAD_VERSION,
        logo: { src: null, size: 110, width: 110, height: 110, position: "center" },
        theme: { ...THEMES[0], bgImage: null }, themeRev: 2, cardImgSize: 180,
        currency: { enabled: false, editCur: "TRY", selected: "TRY", usdRate: null, eurRate: null },
        discount: { enabled: false, currencies: { TRY: true, USD: true, EUR: true } },
        vade: { enabled: false, rate: null, label: "" },
        categories: createDefaultCategories().map(c => ({ ...c, coverImage: PRELOADED_COVERS[c.id] || null, items: JSON.parse(JSON.stringify(PRELOADED_ITEMS[c.id] || [])) })), language: "TR",
        pdf: { title: "FİYAT LİSTESİ", footer: "", showPageNumbers: true, website: "", useCategoryCovers: true, catalogTitle: "ÜRÜN KATALOĞU", catalogTemplate: "akilli", coverLogo: { src: DEFAULT_PDF_COVER_LOGO }, instagram: "", email: "", closingNote: "", coverImage: "", closingImage: "" }
    };
}
function priceNumber(value) {
    const n = priceNumberRaw(value);
    return n === null ? null : Math.max(0, n); /* negatif fiyat kabul edilmez */
}
function priceNumberRaw(value) {
    if (value === null || value === undefined || value === "")
        return null;
    if (typeof value === "number")
        return Number.isFinite(value) ? value : null;
    let s = String(value).trim();
    if (!s)
        return null;
    s = s.replace(/[^0-9,.-]/g, "");
    if (!s)
        return null;
    const lastComma = s.lastIndexOf(","), lastDot = s.lastIndexOf(".");
    if (lastComma > -1 && lastDot > -1) {
        if (lastComma > lastDot)
            s = s.replace(/\./g, "").replace(",", ".");
        else
            s = s.replace(/,/g, "");
    }
    else if (lastComma > -1) {
        s = (s.length - lastComma - 1 === 3) ? s.replace(/,/g, "") : s.replace(",", ".");
    }
    else if (lastDot > -1) {
        s = (s.length - lastDot - 1 === 3) ? s.replace(/\./g, "") : s;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}
function normalizePrice(price) {
    if (!price)
        return { contactOnly: true, amount: null, manualTotal: null, autoCollect: true, parts: [] };
    let parts = Array.isArray(price.parts) ? price.parts.map(p => ({
        id: p.id || uid(), name: typeof p.name === "string" ? p.name : "Yeni Parça",
        name_en: typeof p.name_en === "string" ? p.name_en : "",
        name_src: typeof p.name_src === "string" ? p.name_src : "",
        dims: typeof p.dims === "string" ? p.dims : "",
        dims_en: typeof p.dims_en === "string" ? p.dims_en : "",
        amount: priceNumber(p.amount),
        contactOnly: !!p.contactOnly,
        prices: p.prices && typeof p.prices === "object" ? p.prices : {},
        image: typeof p.image === "string" && p.image ? p.image : null,
        pkg: p.pkg ?? null, m3: p.m3 ?? null, kg: p.kg ?? null
    })) : [];
    const legacyAmount = priceNumber(price.amount);
    const manualTotal = priceNumber(price.manualTotal !== undefined ? price.manualTotal : price.amount);
    const autoCollect = price.autoCollect === undefined ? true : !!price.autoCollect;
    if (parts.length === 0 && legacyAmount !== null)
        parts.push({ id: uid(), name: "Ürün", name_en: "Product", dims: "", dims_en: "", amount: legacyAmount, contactOnly: !!price.contactOnly });
    return { contactOnly: !!price.contactOnly && parts.length === 0, amount: legacyAmount, manualTotal, autoCollect, parts, totals: price.totals && typeof price.totals === "object" ? price.totals : {} };
}
function priceTotal(price) {
    const p = normalizePrice(price);
    if (!p.autoCollect)
        return p.manualTotal !== null ? p.manualTotal : null;
    if (!p.parts.length)
        return null;
    const values = p.parts.filter(a => !a.contactOnly).map(a => priceNumber(a.amount)).filter(a => a !== null);
    return values.length ? values.reduce((sum, n) => sum + n, 0) : null;
}
function normalizeItem(item) {
    item = item || {};
    return { ...item, id: item.id || uid(),
        name: typeof item.name === "string" ? item.name : "Yeni Ürün",
        name_en: typeof item.name_en === "string" ? item.name_en : "",
        desc: typeof item.desc === "string" ? item.desc : "",
        desc_en: typeof item.desc_en === "string" ? item.desc_en : "",
        dims: typeof item.dims === "string" ? item.dims : "",
        dims_en: typeof item.dims_en === "string" ? item.dims_en : "",
        image: item.image || null, images: Array.isArray(item.images) ? item.images.filter(Boolean) : (item.image ? [item.image] : []), ...normalizeItemLogi(item) };
}
/* Paket/m³/kg parça (modül/ölçü/model) bazında girilir. Fiyat kalemi olmayan üründe ürünün kendisinde durur.
   Tek parçalı üründe ürün düzeyinde kalmış eski değerler o parçaya taşınır. */
function normalizeItemLogi(item) {
    const price = normalizePrice(item.price);
    let m3 = logiNumber(item.m3, 3), pkg = logiNumber(item.pkg, 0), kg = logiNumber(item.kg, 2);
    if ((m3 || pkg || kg) && price.parts.length === 1 && !logiHas(price.parts[0])) {
        price.parts[0] = { ...price.parts[0], m3, pkg, kg };
        m3 = pkg = kg = null;
    }
    return { price, m3, pkg, kg };
}
/* Lojistik bilgisi (isteğe bağlı): hacim m³, paket sayısı, ağırlık kg. Boşsa null; PDF'lerde yalnızca doluysa basılır. */
function logiNumber(v, digits) {
    if (v === null || v === undefined || v === "")
        return null;
    const n = Number(String(v).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0 || n > 1000000)
        return null;
    const f = Math.pow(10, digits);
    return Math.round(n * f) / f || null;
}
function logiOf(o) { return { pkg: logiNumber(o?.pkg, 0), m3: logiNumber(o?.m3, 3), kg: logiNumber(o?.kg, 2) }; }
function logiHas(o) { const l = logiOf(o); return !!(l.pkg || l.m3 || l.kg); }
/* Takım (toplanan modüller) için toplam; en az iki parçada bilgi varsa anlamlıdır. */
function logiSum(list) {
    const t = { pkg: 0, m3: 0, kg: 0 };
    for (const o of list) { const l = logiOf(o); t.pkg += l.pkg || 0; t.m3 += l.m3 || 0; t.kg += l.kg || 0; }
    return { pkg: t.pkg || null, m3: t.m3 ? Math.round(t.m3 * 1000) / 1000 : null, kg: t.kg ? Math.round(t.kg * 100) / 100 : null };
}
function logiText(item, lang) {
    const loc = lang === "EN" ? "en-US" : "tr-TR", num = (v, d) => Number(v).toLocaleString(loc, { maximumFractionDigits: d });
    const out = [];
    item = logiOf(item);
    if (item?.pkg)
        out.push(lang === "EN" ? `${num(item.pkg, 0)} ${item.pkg === 1 ? "package" : "packages"}` : `${num(item.pkg, 0)} paket`);
    if (item?.m3)
        out.push(`${num(item.m3, 3)} m³`);
    if (item?.kg)
        out.push(`${num(item.kg, 2)} kg`);
    return out.join(" · ");
}
function normalizeCategories(categories) {
    /* Kategoriler yönetim panelinden eklenir, silinir, yeniden adlandırılır ve sıralanır; verideki sıra korunur. */
    const out = [], ids = new Set(), seen = new Set();
    for (const c of (Array.isArray(categories) ? categories : [])) {
        if (!c || typeof c !== "object")
            continue;
        let id = safeId(c.id) || uid();
        while (ids.has(id))
            id = uid();
        ids.add(id);
        const name = typeof c.name === "string" ? c.name : (c.name?.tr || "");
        const target = { id, name, name_en: typeof c.name_en === "string" ? c.name_en : "", items: [], coverImage: c.coverImage || null };
        for (const raw of (Array.isArray(c.items) ? c.items : [])) {
            const it = normalizeItem(raw);
            if (seen.has(it.id))
                it.id = uid();
            seen.add(it.id);
            target.items.push(it);
        }
        out.push(target);
    }
    return out;
}
function categorySlug(name) {
    const t = String(name || "").toLocaleLowerCase("tr-TR").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
    return t || "kategori";
}
function normalizeData(input) {
    const base = defaultData();
    if (!input || typeof input !== "object")
        return base;
    const r = { ...base, ...input };
    r.preloadVersion = Number(input.preloadVersion) || 0; /* eski kayıtlar sürüm yükseltmesinden geçsin */
    r.themeRev = Number(input.themeRev) || 0; /* eski kayıtlar Apple temasına bir kez geçirilsin */
    delete r.pin;
    /* Varsayılanlar yalnızca alan hiç yoksa uygulanır. Boş değerler kullanıcı tarafından silinebilir/değiştirilebilir. */
    if (typeof r.siteName !== "string")
        r.siteName = base.siteName;
    if (typeof r.siteName_en !== "string")
        r.siteName_en = base.siteName_en;
    if (typeof r.subtitle !== "string")
        r.subtitle = base.subtitle;
    if (typeof r.subtitle_en !== "string")
        r.subtitle_en = base.subtitle_en;
    if (typeof r.eyebrow !== "string")
        r.eyebrow = base.eyebrow;
    if (typeof r.eyebrow_en !== "string")
        r.eyebrow_en = base.eyebrow_en;
    r.logo = { ...base.logo, ...(input.logo || {}) };
    r.logo.size = Number(r.logo.size) || 110;
    r.logo.width = Number(r.logo.width) || r.logo.size;
    r.logo.height = Number(r.logo.height) || r.logo.size;
    r.theme = { ...base.theme, ...(input.theme || {}) };
    r.currency = { ...base.currency, ...(input.currency || {}) };
    /* Eski kayıtlar: "kur açık" bilgisi yoksa, kur değeri girilmişse açık kabul edilir. */
    if (input.currency && typeof input.currency === "object" && input.currency.enabled === undefined)
        r.currency.enabled = Number(input.currency.usdRate) > 0 || Number(input.currency.eurRate) > 0;
    /* İskonto ayarı (yöneticiye özel): oran burada tutulmaz, sadece hangi birimlerde girilebileceği ve açık/kapalı bilgisi. */
    r.discount = { ...base.discount, ...(input.discount || {}) };
    r.discount.enabled = !!r.discount.enabled;
    r.discount.currencies = {
        TRY: r.discount.currencies?.TRY !== false,
        USD: r.discount.currencies?.USD !== false,
        EUR: r.discount.currencies?.EUR !== false
    };
    /* TL vade: yalnızca oran ve etiket saklanır; vadeli fiyat hiçbir zaman veriye yazılmaz, her seferinde hesaplanır. */
    r.vade = { ...base.vade, ...(input.vade && typeof input.vade === "object" ? input.vade : {}) };
    r.vade.enabled = !!r.vade.enabled;
    r.vade.rate = vadeRateValue(r.vade.rate);
    r.vade.label = typeof r.vade.label === "string" ? r.vade.label : "";
    r.pdf = { ...base.pdf, ...(input.pdf || {}) };
    if (!r.pdf.coverLogo || !r.pdf.coverLogo.src)
        r.pdf.coverLogo = { src: DEFAULT_PDF_COVER_LOGO };
    r.categories = normalizeCategories(input.categories);
    r.language = input.language === "EN" ? "EN" : "TR";
    return r;
}
/* -------------------- STORAGE -------------------- */
/*
  KALICI KAYIT SİSTEMİ (yerel)
  - localStorage + yedek anahtar + IndexedDB: üç katmanlı yerel kayıt
  - Uzak sunucu bağlantısı yok. Cihazlar arası taşıma için JSON Dışa/İçe Aktar kullanılır.
*/
/* Safe image loader: keep the real URL immediately visible. Browser HTTP cache + lazy loading handle repeat downloads. */
function getCachedImageObjectUrl(src) {
    return Promise.resolve(src);
}
function CachedImage({ src, ...props }) {
    const raw = safeAssetSource(src);
    /* Beyaz zeminli ürün fotoğrafları ("...w.webp") kırpılmaz; ürün tamamen görünür. */
    const white = typeof raw === "string" && /w\.webp$/i.test(raw);
    return React.createElement("img", { ...props, className: (props.className || "") + (white ? " img-white" : ""), src: raw || undefined, referrerPolicy: "no-referrer" });
}
function isDataImageSource(src) {
    return typeof src === 'string' && /^data:image\//i.test(src);
}
const IDB_NAME = "katalog_sablon_storage_v6";
const IDB_STORE = "catalog";
const IDB_KEY = "catalog";
function openCatalogDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error("IndexedDB desteklenmiyor"));
            return;
        }
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(IDB_STORE))
                db.createObjectStore(IDB_STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error("IndexedDB açılamadı"));
    });
}
function makeStorageRecord(data) {
    return { savedAt: Date.now(), data: normalizeData(data) };
}
function parseStorageRecord(value) {
    if (!value || typeof value !== "object")
        return null;
    /* Yeni format */
    if (value.data && typeof value.data === "object")
        return { savedAt: Number(value.savedAt) || 0, data: sanitizeCatalogData(value.data), rawPin: value.data.pin };
    /* Eski v4 formatıyla geriye dönük uyumluluk */
    return { savedAt: 1, data: sanitizeCatalogData(value), rawPin: value.pin };
}
function readLocalRecord(key) {
    if (window.SH21)
        return null;
    try {
        const raw = lsGet(key);
        if (!raw)
            return null;
        return parseStorageRecord(JSON.parse(raw));
    }
    catch (e) {
        console.warn("localStorage okunamadı:", e);
        return null;
    }
}
async function idbGetRecord() {
    const db = await openCatalogDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
        req.onsuccess = () => resolve(parseStorageRecord(req.result));
        req.onerror = () => reject(req.error || new Error("IndexedDB okuma hatası"));
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error || new Error("IndexedDB işlem hatası"));
    });
}
async function idbSetRecord(record) {
    const db = await openCatalogDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(record, IDB_KEY);
        tx.oncomplete = () => { db.close(); resolve(true); };
        tx.onerror = () => { db.close(); reject(tx.error || new Error("IndexedDB yazma hatası")); };
        tx.onabort = () => { db.close(); reject(tx.error || new Error("IndexedDB yazma iptal edildi")); };
    });
}
/* Boş şablon başlangıcı: eski kayıttan SADECE para birimi ve kur değerleri alınır. */
async function readLegacyCurrency() {
    for (const k of LEGACY_DB_KEYS) {
        try {
            const raw = JSON.parse(lsGet(k) || "null");
            const cur = (raw && (raw.data || raw).currency) || null;
            if (cur && typeof cur === "object")
                return cur;
        }
        catch (_) { }
    }
    try {
        if (!window.indexedDB)
            return null;
        return await trTimeout(new Promise(resolve => {
            const req = indexedDB.open(LEGACY_IDB_NAME, 1);
            req.onupgradeneeded = () => { try { req.transaction.abort(); } catch (_) { } resolve(null); };
            req.onerror = () => resolve(null);
            req.onsuccess = () => {
                const db = req.result;
                try {
                    if (!db.objectStoreNames.contains("catalog")) { db.close(); resolve(null); return; }
                    const g = db.transaction("catalog", "readonly").objectStore("catalog").get("catalog");
                    g.onsuccess = () => { const v = g.result; db.close(); resolve((v && (v.data || v).currency) || null); };
                    g.onerror = () => { db.close(); resolve(null); };
                }
                catch (_) { try { db.close(); } catch (__) { } resolve(null); }
            };
        }), 3000);
    }
    catch (_) {
        return null;
    }
}
function blankTemplateData(currency) {
    const d = defaultData();
    if (currency && typeof currency === "object") {
        const c = { ...d.currency, ...currency };
        d.currency = sanitizeCatalogData({ ...d, currency: c }).currency;
    }
    return d;
}
async function loadLocal() {
    if (window.SH21)
        return await SH21.loadRecord();
    const local = readLocalRecord(DB_KEY);
    const backup = readLocalRecord(BACKUP_KEY);
    let idb = null;
    try {
        idb = await idbGetRecord();
    }
    catch (e) {
        console.warn("IndexedDB okunamadı:", e);
    }
    const candidates = [local, backup, idb].filter(Boolean);
    if (!candidates.length)
        return null;
    candidates.sort((a, b) => (Number(b.savedAt) || 0) - (Number(a.savedAt) || 0));
    const newest = candidates[0];
    /* En güncel kopyayı diğer katmanlara da senkronla (PIN olmadan). */
    const syncRecord = { savedAt: newest.savedAt, data: newest.data };
    {
        const json = JSON.stringify(syncRecord);
        if (lsSet(DB_KEY, json)) {
            if (json.length < 2 * 1024 * 1024)
                lsSet(BACKUP_KEY, json);
            else
                lsRemove(BACKUP_KEY);
        }
        else {
            lsRemove(DB_KEY);
            lsRemove(BACKUP_KEY);
        }
    }
    try {
        await idbSetRecord(syncRecord);
    }
    catch (e) { }
    return { savedAt: Number(newest.savedAt) || 0, data: normalizeData(applyPreloadUpgrade(newest.data)), rawPin: newest.rawPin };
}
async function saveLocal(data) {
    if (window.SH21)
        return await SH21.save(sanitizeCatalogData(data));
    const clean = sanitizeCatalogData(data);
    const record = { savedAt: Date.now(), data: clean };
    /* Ana kayıt IndexedDB (büyük kataloglar ve fotoğraflar için yeterli alan). Kayıt bitmeden "Kaydedildi" denmez. */
    let idbOk = false;
    try {
        await idbSetRecord(record);
        idbOk = true;
    }
    catch (e) {
        console.warn("IndexedDB yazılamadı:", e);
    }
    /* localStorage hızlı açılış kopyasıdır (~5 MB sınırı). Sığmazsa eski kopya silinir; böylece eski veri geri gelmez. */
    const json = JSON.stringify(record);
    let lsOk = lsSet(DB_KEY, json);
    if (lsOk && json.length < 2 * 1024 * 1024)
        lsSet(BACKUP_KEY, json);
    else
        lsRemove(BACKUP_KEY);
    if (!lsOk) {
        lsRemove(DB_KEY);
        lsRemove(BACKUP_KEY);
    }
    if (!idbOk && !lsOk)
        throw new Error("Tarayıcı depolama alanına yazılamadı. Depolama dolu veya kapalı olabilir; lütfen JSON yedeği alın.");
    return { savedAt: record.savedAt, data: clean, storage: idbOk ? "idb" : "local" };
}
async function requestPersistentStorage() {
    try {
        if (navigator.storage && navigator.storage.persist) {
            const already = await navigator.storage.persisted();
            if (!already)
                await navigator.storage.persist();
        }
    }
    catch (e) { }
}
function downloadJSON(data) {
    const blob = new Blob([JSON.stringify(normalizeData(data), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "katalog-yedek.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        try {
            const okType = file && (file.type === "application/json" || ((file.type === "" || file.type === "text/plain") && /\.json$/i.test(file.name || "")));
            if (!okType)
                throw new Error("Yalnızca JSON dosyası kabul edilir.");
            if (!Number.isFinite(file.size) || file.size <= 0 || file.size > SECURITY_LIMITS.jsonFileBytes)
                throw new Error("JSON dosyası boyutu izin verilen sınırın dışında.");
            const r = new FileReader();
            r.onload = () => {
                try {
                    const raw = String(r.result || "");
                    if (raw.length > SECURITY_LIMITS.jsonFileBytes)
                        throw new Error("JSON içeriği çok büyük.");
                    const parsed = JSON.parse(raw);
                    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
                        throw new Error("Geçersiz katalog yapısı.");
                    resolve(sanitizeCatalogData(parsed));
                }
                catch (e) {
                    reject(e);
                }
            };
            r.onerror = () => reject(r.error || new Error("Dosya okunamadı."));
            r.readAsText(file);
        }
        catch (e) {
            reject(e);
        }
    });
}
/* -------------------- TRANSLATION -------------------- */
const UI = {
    tr: {
        currency: "Para Birimi", search: "Ürün ara...", clearSearch: "Aramayı temizle",
        products: "ürün", clear: "Aramayı temizle", found: "ürün bulundu",
        notFound: "Aradığınız ürün bulunamadı.", empty: "Henüz ürün eklenmedi.",
        detailedPrices: "Detaylı fiyatlar", dimensions: "Ölçüler", prices: "Fiyatlar",
        contactPrice: "Fiyat için iletişime geçin", cashPrice: "Peşin", call: "Fiyat / Bilgi İçin Ara",
        premium: "Premium", admin: "Yönetim Girişi", wrongPin: "Hatalı PIN.", cancel: "Vazgeç",
        login: "Giriş Yap", adminPanel: "Yönetim Paneli", general: "Genel", catalog: "Ürün Kataloğu",
        siteName: "Site Adı", eyebrow: "Üst Etiket", phone: "Telefon", save: "Kaydet ve Kapat",
        saved: "Kaydedildi!", saving: "Kaydediliyor...", newCategory: "Yeni Kategori",
        productsBtn: "Ürünler", addProduct: "Ürün Ekle", deleteConfirm: "Bu ürün silinsin mi?",
        catDelete: "Bu kategori ve içindeki ürünler silinsin mi?", newProduct: "Yeni Ürün",
        description: "Ürün özellikleri", dimsPlaceholder: "Ölçüler: 200x90x75 cm",
        addPrice: "Fiyat Ekle", parts: "Ayrı Fiyatlar", partHint: "Ürünün parçalarını ayrı ayrı fiyatlandır.",
        newPart: "Yeni Parça", contactOnly: "Fiyat için iletişime geçin", total: "Toplam",
    },
    en: {
        currency: "Currency", search: "Search products...", clearSearch: "Clear search",
        products: "products", clear: "Clear search", found: "products found",
        notFound: "No products found.", empty: "No products have been added yet.",
        detailedPrices: "Detailed pricing", dimensions: "Dimensions", prices: "Prices",
        contactPrice: "Contact us for price", cashPrice: "Cash", call: "Call for Price / Information",
        premium: "Premium", admin: "Admin Login", wrongPin: "Incorrect PIN.", cancel: "Cancel",
        login: "Log In", adminPanel: "Admin Panel", general: "General", catalog: "Product Catalog",
        siteName: "Site Name", eyebrow: "Top Label", phone: "Phone", save: "Save & Close",
        saved: "Saved!", saving: "Saving...", newCategory: "New Category",
        productsBtn: "Products", addProduct: "Add Product", deleteConfirm: "Delete this product?",
        catDelete: "Delete this category and all products in it?", newProduct: "New Product",
        description: "Product features", dimsPlaceholder: "Dimensions: 200x90x75 cm",
        addPrice: "Add Price", parts: "Separate Prices", partHint: "Price the product components separately.",
        newPart: "New Part", contactOnly: "Contact us for price", total: "Total",
    }
};
function t(lang, key) { return UI[lang === "EN" ? "en" : "tr"][key] || UI.tr[key] || key; }
/* Sözlük çevirisinde kaynağın büyük/küçük harf biçimini koru: "Masa"→"Desk", "MASA"→"DESK". */
function pdfMatchCase(src, rep) {
    const s = String(src || ""), r = String(rep || "");
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length > 1 && words.every(w => { const f = w.charAt(0); return f === f.toLocaleUpperCase("tr-TR") && f !== f.toLocaleLowerCase("tr-TR"); }) && s !== s.toLocaleUpperCase("tr-TR"))
        return r.replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
    if (s && s === s.toLocaleUpperCase("tr-TR") && s !== s.toLocaleLowerCase("tr-TR"))
        return r.toUpperCase();
    const f = s.charAt(0);
    if (f && f === f.toLocaleUpperCase("tr-TR") && f !== f.toLocaleLowerCase("tr-TR"))
        return r.charAt(0).toUpperCase() + r.slice(1);
    return r;
}
function translateFallbackSync(text) {
    if (!text || !String(text).trim())
        return "";
    const source = String(text).trim();
    const exact = {
        "VIP Makam Takımları": "VIP Executive Office Sets", "ETAJERLİ MASA": "DESK WITH RETURN", "DOLAP": "CABINET", "SEHPA": "COFFEE TABLE", "ÜNİTE": "UNIT", "MASA": "DESK", "ETAJER": "RETURN", "ÇALIŞMA MASASI": "OFFICE DESK",
        "Makam Takımları": "Executive Office Sets", "Personel Takımları": "Staff Office Sets", "Toplantı Masaları": "Meeting Tables", "Workstation": "Workstations", "Loby Koltukları": "Lobby Seating", "Ofis Koltukları": "Office Chairs", "Fileli Koltukları": "Mesh Office Chairs", "Aksesuarlar": "Accessories",
        "Ofis Mobilyaları": "Office Furniture", "Ofis Mobilyası": "Office Furniture", "Yönetici Masası": "Executive Desk", "Yönetici Çalışma Masası": "Executive Office Desk", "Toplantı Masası": "Meeting Table", "Ofis Koltuğu": "Office Chair", "Misafir Koltuğu": "Guest Chair", "Lobi Koltuğu": "Lobby Seating", "Fileli Koltuk": "Mesh Office Chair", "Çalışma Masası": "Office Desk", "Personel Masası": "Staff Desk", "Makam Masası": "Executive Desk", "Dolap": "Cabinet", "Sehpa": "Coffee Table", "Ünite": "Unit",  "Yeni Ürün": "New Product", "Yeni Kategori": "New Category", "Yeni Parça": "New Part", "Fiyat için iletişime geçin": "Contact us for price"
    };
    if (exact[source])
        return exact[source];
    let s = source;
    const phrases = [
        ["yönetici çalışma masası", "executive office desk"], ["yönetici masası", "executive desk"], ["makam masası", "executive desk"], ["personel masası", "staff desk"], ["çalışma masası", "office desk"], ["toplantı masası", "meeting table"], ["toplantı masaları", "meeting tables"], ["ofis koltuğu", "office chair"], ["ofis koltukları", "office chairs"], ["fileli koltuğu", "mesh office chair"], ["fileli koltuk", "mesh office chair"], ["fileli koltuklar", "mesh office chairs"], ["misafir koltuğu", "guest chair"], ["lobi koltuğu", "lobby seating"], ["loby koltukları", "lobby seating"], ["vip makam takımları", "VIP executive office sets"], ["makam takımları", "executive office sets"], ["personel takımları", "staff office sets"], ["ofis mobilyaları", "office furniture"], ["özel tasarım", "special design"], ["çekmeceli", "with drawers"], ["çekmece", "drawer"], ["kapaklı", "with doors"], ["kapak", "door/panel"], ["ölçüler", "dimensions"], ["ahşap", "wood"], ["ceviz", "walnut"], ["antrasit", "anthracite"], ["siyah", "black"], ["beyaz", "white"], ["krem", "cream"], ["kahverengi", "brown"], ["deri", "leather"], ["kumaş", "fabric"], ["metal", "metal"], ["cam", "glass"], ["modern", "modern"], ["klasik", "classic"], ["premium", "premium"], ["özel", "special"], ["tasarım", "design"], ["yeni ürün", "new product"], ["yeni kategori", "new category"], ["yeni parça", "new part"], ["fiyat için iletişime geçin", "contact us for price"], ["iletişime geçin", "contact us"], ["üretim", "production"], ["ofis", "office"], ["masalar", "desks"], ["masa", "desk"], ["dolaplar", "cabinets"], ["dolap", "cabinet"], ["sehpalar", "coffee tables"], ["sehpa", "coffee table"], ["üniteler", "units"], ["ünite", "unit"], ["etajerli masa", "desk with return"], ["etajerlı masa", "desk with return"], ["etajer", "return"], ["adet", "pieces"], ["ve", "and"], ["ile", "with"]
    ];
    phrases.forEach(([a, b]) => { const esc = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); let re; try {
        re = new RegExp("(^|[^\\p{L}\\p{N}])(" + esc + ")(?=$|[^\\p{L}\\p{N}])", "giu");
    }
    catch (_) {
        re = new RegExp("(^|[\\s.,;:!?()\\-/])(" + esc + ")(?=$|[\\s.,;:!?()\\-/])", "gi");
    } s = s.replace(re, (m, pre, word) => pre + pdfMatchCase(word, b)); });
    s = s.replace(/\b(\d+)\s*çekmeceli\b/gi, "$1-drawer");
    s = s.replace(/(\d+)\s*kişilik/gi, "$1 seats");
    s = s.replace(/\b(\d+)\s*adet\b/gi, "$1 pieces");
    return s;
}
function getText(lang, tr, en, fallback) {
    if (lang !== "EN")
        return tr || "";
    const source = String(fallback || tr || "").trim();
    const translated = String(en || "").trim();
    // Never allow generic placeholders to mask a real product/category/part name.
    const placeholderPairs = {
        "Yeni Ürün": "New Product",
        "Yeni Parça": "New Part",
        "Yeni Kategori": "New Category",
        "New Product": "New Product",
        "New Part": "New Part",
        "New Category": "New Category"
    };
    const genericEnglishPlaceholders = new Set(["new product", "new part", "new category"]);
    const isGenericPlaceholder = genericEnglishPlaceholders.has(translated.toLocaleLowerCase("en-US")) &&
        !genericEnglishPlaceholders.has(source.toLocaleLowerCase("en-US"));
    if (translated && translated !== source && !isGenericPlaceholder)
        return translated;
    // If the Turkish source itself is only the system placeholder, its normal EN label is correct.
    if (source && placeholderPairs[source] && translated === placeholderPairs[source])
        return translated;
    /* Kayıtlı İngilizce yoksa sözlükle anında çevir; sonuç yarı Türkçe kalıyorsa karışık metin yerine orijinali göster. */
    const quick = translateFallbackSync(source);
    return /[çğıöşüİÇĞÖŞÜ]/.test(quick) ? source : quick;
}
function preserveTechnicalTokens(source, target) {
    if (!source || !target)
        return target;
    const tokens = source.match(/\b(?:\d+(?:[.,]\d+)?\s*(?:mm|cm|m|kg|g|°|%|TL|USD|EUR)?|\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?(?:\s*(?:cm|mm|m))?)\b/gi) || [];
    let out = target;
    tokens.forEach(tok => {
        if (!out.toLowerCase().includes(tok.toLowerCase())) {
            /* Do not inject aggressively; source technical data remains separately stored. */
        }
    });
    return out;
}
/*
  Frontend-first AI:
  1) Browser Prompt API if available.
  2) Built-in professional dictionary for furniture/catalog phrases.
  3) Safe fallback to Turkish.
  No secret API key is embedded.
*/
/* Çeviri yardımcıları: hiçbir adım sonsuza kadar takılı kalmaz. */
function trTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("timeout")), ms);
        Promise.resolve(promise).then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
    });
}
/* Bozuk çeviri: kaynak metinden anormal uzun, markdown (**, ##) içeren veya satır sayısı uyuşmayan çıktı
   (ör. tek kelimelik ürün adı için model "makale" yazmış). Bunlar kabul edilmez, kayıtlıysa yeniden çevrilir. */
function trBadEn(tr, en) {
    tr = String(tr ?? "").trim();
    en = String(en ?? "").trim();
    if (!tr || !en)
        return false;
    if (en.length > tr.length * 3 + 40)
        return true;
    if (/\*\*|^#{1,6}\s|^\s*[*-]\s+\S/m.test(en) && !/\*\*|^#{1,6}\s/m.test(tr))
        return true;
    if (!/\n/.test(tr) && /\n/.test(en))
        return true;
    return false;
}
/* Cihaz içi dil modeli bazen yorum ekler ("Elbette, işte çeviri:" gibi); makul uzunlukta tek parça çıktıyı kabul et. */
function trSaneOutput(source, out) {
    const o = String(out || "").trim();
    return !!o && o.length <= source.length * 3 + 40 && (/\n/.test(source) || !/\n/.test(o));
}
/* Çeviri servisi dakikada 60 istekle sınırlı: bütçe dolmaya yakınsa pencere yenilenene kadar bekler (hata vermez). */
async function trWaitBudget() {
    for (let i = 0; i < 70; i++) {
        const st = rateState.get("translation");
        if (!st || Date.now() - st.startedAt >= 60000 || st.count < 52)
            return;
        await new Promise(r => setTimeout(r, 1000));
    }
}
/* -------------------- MOBİLYA SÖZLÜĞÜ + AI ÇEVİRİ -------------------- */
/* Sektör terimleri: tam eşleşmede sözlük kullanılır (en doğru sonuç); AI'ye de aynı terimler öğretilir. */
const FURNITURE_GLOSSARY = {
    "MAKAM TAKIMI": "Executive Office Set", "MAKAM TAKIMLARI": "Executive Office Sets", "VIP MAKAM TAKIMI": "VIP Executive Office Set", "VIP MAKAM TAKIMLARI": "VIP Executive Office Sets",
    "MAKAM MASASI": "Executive Desk", "YÖNETİCİ MASASI": "Executive Desk", "YÖNETİCİ ÇALIŞMA MASASI": "Executive Office Desk", "PERSONEL MASASI": "Staff Desk", "PERSONEL TAKIMI": "Staff Office Set", "PERSONEL TAKIMLARI": "Staff Office Sets",
    "ÇALIŞMA MASASI": "Office Desk", "ÇALIŞMA MASALARI": "Office Desks", "TOPLANTI MASASI": "Meeting Table", "TOPLANTI MASALARI": "Meeting Tables", "ETAJER": "Return", "ETAJERLİ MASA": "Desk with Return", "KESON": "Mobile Pedestal", "SABİT KESON": "Fixed Pedestal",
    "DOSYA DOLABI": "Filing Cabinet", "KİTAPLIK": "Bookcase", "DOLAP": "Cabinet", "ALT DOLAP": "Low Cabinet", "ÜST DOLAP": "Wall Cabinet", "ARŞİV DOLABI": "Archive Cabinet", "SEHPA": "Coffee Table", "ORTA SEHPA": "Coffee Table", "YAN SEHPA": "Side Table",
    "BANKO": "Reception Desk", "KARŞILAMA BANKOSU": "Reception Desk", "WORKSTATION": "Workstations", "OPERASYONEL MASA": "Workstation Desk",
    "OFİS KOLTUĞU": "Office Chair", "OFİS KOLTUKLARI": "Office Chairs", "YÖNETİCİ KOLTUĞU": "Executive Chair", "MAKAM KOLTUĞU": "Executive Chair", "ÇALIŞMA KOLTUĞU": "Task Chair", "PERSONEL KOLTUĞU": "Staff Chair",
    "MİSAFİR KOLTUĞU": "Guest Chair", "BEKLEME KOLTUĞU": "Waiting Chair", "BEKLEME KOLTUKLARI": "Waiting Chairs", "TOPLANTI SANDALYESİ": "Conference Chair", "FİLELİ KOLTUK": "Mesh Office Chair", "FİLELİ KOLTUKLAR": "Mesh Office Chairs",
    "LOBİ KOLTUĞU": "Lobby Seating", "LOBY KOLTUKLARI": "Lobby Seating", "LOBİ KOLTUKLARI": "Lobby Seating", "KANEPE": "Sofa", "İKİLİ KANEPE": "Two-Seater Sofa", "ÜÇLÜ KANEPE": "Three-Seater Sofa", "TEKLİ KOLTUK": "Armchair", "BERJER": "Armchair", "PUF": "Pouf",
    "KOLTUK TAKIMI": "Sofa Set", "KÖŞE TAKIMI": "Corner Sofa", "YATAK ODASI TAKIMI": "Bedroom Set", "YEMEK ODASI TAKIMI": "Dining Room Set", "GENÇ ODASI": "Teen Bedroom", "BEBEK ODASI": "Nursery Set",
    "GARDIROP": "Wardrobe", "KOMODİN": "Nightstand", "ŞİFONYER": "Dresser", "KONSOL": "Console", "VESTİYER": "Hallway Unit", "TV ÜNİTESİ": "TV Unit", "YEMEK MASASI": "Dining Table", "SANDALYE": "Chair", "BAZA": "Bed Base", "KARYOLA": "Bed Frame", "YATAK": "Mattress",
    "AKSESUARLAR": "Accessories", "AKSESUAR": "Accessory", "MASA": "Desk", "ÜNİTE": "Unit", "MÜDÜR": "Manager", "ŞEF": "Supervisor", "MİSAFİR": "Guest", "PERSONEL": "Staff", "YÖNETİCİ": "Executive"
};
function glossaryKey(s) { return String(s || "").toLocaleUpperCase("tr-TR").replace(/\s+/g, " ").trim(); }
function glossaryExact(source) {
    const en = FURNITURE_GLOSSARY[glossaryKey(source)];
    if (!en)
        return "";
    const src = String(source).trim();
    return src === src.toLocaleLowerCase("tr-TR") ? en.toLowerCase() : pdfMatchCase(src, en);
}
/* Çeviri motorlarının sık yaptığı mobilya hatalarını düzeltir, büyük harf biçimini kaynağa uydurur,
   kaynaktaki sayılar (ölçü, adet, model kodu) çeviride yoksa sonucu reddeder. */
const TR_POST_FIXES = [[/\bwhatnot\b|\bétag[eè]re\b|\betagere\b/gi, "return"], [/\bauthority (desk|table)s?\b/gi, "executive desk"], [/\bposition (desk|table)\b/gi, "executive desk"], [/\b(office|executive|staff|personnel) team(s)?\b/gi, (m, a, p) => a.replace(/personnel/i, "staff") + " set" + (p ? "s" : "")], [/\bstaff office team\b/gi, "staff office set"], [/\bpersonnel\b(?= (desk|chair|set))/gi, "staff"], [/\bcaisson\b/gi, "pedestal"], [/\bmeeting chair\b/gi, "conference chair"], [/\bbench(?= desk)/gi, "reception"]];
function trNumbers(s) { return (String(s || "").match(/\d+(?:[.,]\d+)?/g) || []).map(x => x.replace(",", ".")); }
function trPolish(source, out) {
    let o = String(out || "").trim().replace(/^["'“”«»]+|["'“”«»]+$/g, "").trim();
    if (!o)
        return "";
    for (const [re, rp] of TR_POST_FIXES)
        o = o.replace(re, (...m) => { const w = m[0], r = typeof rp === "function" ? rp(...m) : rp; const words = w.split(/\s+/); if (words.length > 1 && words.every(x => /^[A-Z]/.test(x))) return r.replace(/\b[a-z]/g, c => c.toUpperCase()); return /^[A-Z]/.test(w) ? r.charAt(0).toUpperCase() + r.slice(1) : r; });
    const src = String(source || "").trim();
    const letters = src.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "");
    if (letters.length > 1 && src === src.toLocaleUpperCase("tr-TR"))
        o = o.toUpperCase();
    const outNums = trNumbers(o);
    for (const n of trNumbers(src))
        if (!outNums.includes(n))
            return "";
    return o;
}
/* AI çeviri ayarı yalnızca bu cihazda saklanır; katalog verisine ve JSON yedeğine asla girmez. */
const AI_CFG_KEY = "katalog_ai_cfg_v1";
const AI_MODELS = [["claude-haiku-5-5", "Claude Haiku (hızlı, ekonomik)"], ["claude-sonnet-5-5", "Claude Sonnet (en iyi kalite)"]];
/* Anahtar varsayılan olarak sadece bu tarayıcı oturumunda (sessionStorage) tutulur;
   "bu cihazda hatırla" seçilirse kalıcı saklanır. */
const AI_KEY_SESSION = "katalog_ai_key_session";
function ssGet(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } }
function ssSet(k, v) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch (_) { } }
function aiCfgLoad() {
    /* neardiji.com (bulut): çeviri sunucudan yapılır; tarayıcıda API anahtarı tutulmaz, eski kayıt silinir */
    if (window.SH21) {
        lsRemove(AI_CFG_KEY);
        ssSet(AI_KEY_SESSION, "");
        return { provider: "off", key: "", remember: false, model: AI_MODELS[0][0] };
    }
    try {
        const c = JSON.parse(lsGet(AI_CFG_KEY) || "null") || {};
        const remember = c.remember === true;
        /* Eski sürüm anahtarı kalıcı saklıyordu: bu oturuma taşı, kalıcı kopyayı sil */
        if (!remember && typeof c.key === "string" && c.key) {
            if (!ssGet(AI_KEY_SESSION))
                ssSet(AI_KEY_SESSION, c.key.slice(0, 300));
            lsSet(AI_CFG_KEY, JSON.stringify({ provider: c.provider, model: c.model }));
        }
        const key = remember ? (typeof c.key === "string" ? c.key : "") : (ssGet(AI_KEY_SESSION) || "");
        return { provider: c.provider === "claude" ? "claude" : "off", key: key.slice(0, 300), remember, model: AI_MODELS.some(m => m[0] === c.model) ? c.model : AI_MODELS[0][0] };
    }
    catch (_) {
        return { provider: "off", key: "", remember: false, model: AI_MODELS[0][0] };
    }
}
function aiCfgSave(c) {
    const key = String(c.key || "").trim();
    const remember = c.remember === true;
    lsSet(AI_CFG_KEY, JSON.stringify(remember ? { provider: c.provider, key, model: c.model, remember: true } : { provider: c.provider, model: c.model }));
    ssSet(AI_KEY_SESSION, remember ? "" : key);
}
function aiActive() { const c = aiCfgLoad(); return c.provider === "claude" && c.key.length > 20; }
const AI_TYPE_HINT = { product_name: "a product name", product_description: "a product description", price_part: "a price list line item (module or size name)", category: "a product category name" };
async function claudeTranslate(source, type, opts = {}) {
    const c = opts.cfg || aiCfgLoad();
    if (c.provider !== "claude" || c.key.length < 20)
        return null;
    await trWaitBudget();
    await enforceClientRateLimit("translation-ai", 50, 60 * 1000);
    const glossary = Object.entries(FURNITURE_GLOSSARY).map(([k, v]) => k + " = " + v).join("; ");
    const system = "You translate Turkish furniture catalog text (office and home furniture) into natural, professional catalog English. Reply with ONLY the English text: no quotes, no notes, no explanations, no markdown. Keep every number, dimension (e.g. 160x80x75 cm), model code and brand name exactly as written. Keep the same line breaks. Match the source capitalization style: ALL CAPS stays ALL CAPS, Title Case stays Title Case. Prefer these industry terms: " + glossary + ".";
    const ctl = typeof AbortController === "function" ? new AbortController() : null, timer = setTimeout(() => ctl && ctl.abort(), 20000);
    try {
        const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl ? ctl.signal : undefined, headers: { "content-type": "application/json", "x-api-key": c.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
            body: JSON.stringify({ model: c.model, max_tokens: Math.min(1500, 80 + source.length * 3), system, messages: [{ role: "user", content: "Translate " + (AI_TYPE_HINT[type] || "this text") + ":\n" + source }] }) });
        if (!res.ok) {
            if (opts.throwErrors) {
                let msg = "HTTP " + res.status;
                try { msg = (await res.json())?.error?.message || msg; } catch (_) { }
                throw new Error(res.status === 401 ? "API anahtarı geçersiz." : res.status === 429 ? "Çok fazla istek; biraz bekleyin." : msg);
            }
            return null;
        }
        const json = await res.json();
        const out = (Array.isArray(json?.content) ? json.content.filter(x => x && x.type === "text").map(x => x.text).join("") : "").trim();
        const polished = trPolish(source, out);
        return polished && trSaneOutput(source, polished) ? polished : null;
    }
    catch (e) {
        if (opts.throwErrors)
            throw e;
        console.warn("AI çeviri yapılamadı:", e);
        return null;
    }
    finally {
        clearTimeout(timer);
    }
}
async function aiTranslateResult(text, type = "general") {
    if (!text || !text.trim())
        return { text: "", good: false };
    const source = text.trim();
    /* 1) Sektör sözlüğü (tam eşleşme) — en doğru sonuç */
    const g = glossaryExact(source);
    if (g)
        return { text: g, good: true };
    /* 2) Gerçek AI çeviri (yönetimde Claude API anahtarı girildiyse) */
    const ai = await claudeTranslate(source, type);
    if (ai)
        return { text: ai, good: true };
    /* 3) Chrome'un cihaz içi Translator API'si: ağ trafiği yok, anında. Model yüklüyse kullanılır. */
    try {
        if (window.Translator && typeof window.Translator.create === "function" && typeof window.Translator.availability === "function") {
            const av = await trTimeout(window.Translator.availability({ sourceLanguage: "tr", targetLanguage: "en" }), 3000);
            if (av === "available") {
                window.__ofTranslator = window.__ofTranslator || await trTimeout(window.Translator.create({ sourceLanguage: "tr", targetLanguage: "en" }), 6000);
                const out = trPolish(source, await trTimeout(window.__ofTranslator.translate(source), 8000));
                if (out)
                    return { text: out, good: true };
            }
        }
    }
    catch (e) {
        console.warn("On-device Translator unavailable:", e);
    }
    /* deterministic professional catalog fallback */
    const exact = {
        "VIP Makam Takımları": "VIP Executive Office Sets",
        "ETAJERLİ MASA": "DESK WITH RETURN",
        "DOLAP": "CABINET",
        "SEHPA": "COFFEE TABLE",
        "ÜNİTE": "UNIT",
        "MASA": "DESK",
        "ETAJER": "RETURN",
        "ÇALIŞMA MASASI": "OFFICE DESK",
        "Makam Takımları": "Executive Office Sets",
        "Personel Takımları": "Staff Office Sets",
        "Toplantı Masaları": "Meeting Tables",
        "Workstation": "Workstations",
        "Loby Koltukları": "Lobby Seating",
        "Ofis Koltukları": "Office Chairs",
        "Fileli Koltuklar": "Mesh Office Chairs",
        "Aksesuarlar": "Accessories",
        "Ofis Mobilyaları": "Office Furniture",
        "Ofis Mobilyası": "Office Furniture",
        "Yönetici Masası": "Executive Desk",
        "Yönetici Çalışma Masası": "Executive Office Desk",
        "Toplantı Masası": "Meeting Table",
        "Ofis Koltuğu": "Office Chair",
        "Misafir Koltuğu": "Guest Chair",
        "Lobi Koltuğu": "Lobby Seating",
        "Fileli Koltuk": "Mesh Office Chair",
        "Çalışma Masası": "Office Desk",
        "Personel Masası": "Staff Desk",
        "Makam Masası": "Executive Desk",
        "Dolap": "Cabinet",
        "Sehpa": "Coffee Table",
        "Ünite": "Unit",
        
        "Yeni Ürün": "New Product",
        "Yeni Kategori": "New Category",
        "Yeni Parça": "New Part",
        "Fiyat için iletişime geçin": "Contact us for price"
    };
    if (exact[source])
        return { text: exact[source], good: true };
    /* Network translation: Cloudflare AI translation through the media worker (signed-in panel users).
       If the service is unavailable, the deterministic professional catalog dictionary below is used. */
    try {
        const translationSource = safeText(source, SECURITY_LIMITS.text);
        await enforceClientRateLimit("translation", 60, 60 * 1000);
        const translated = window.SH21 && window.SH21.translate ? await window.SH21.translate(translationSource, "en") : null;
        const polished = translated ? trPolish(source, translated) : "";
        if (polished)
            return { text: preserveTechnicalTokens(source, polished), good: true };
    }
    catch (e) {
        console.warn("Online translation unavailable:", e);
    }
    /*
      Phrase-level fallback. It intentionally leaves unknown text in Turkish
      rather than inventing a bad translation. Browser AI is used first when supported.
    */
    let s = source;
    const phrases = [
        ["yönetici çalışma masası", "executive office desk"],
        ["yönetici masası", "executive desk"],
        ["makam masası", "executive desk"],
        ["personel masası", "staff desk"],
        ["çalışma masası", "office desk"],
        ["toplantı masası", "meeting table"],
        ["toplantı masaları", "meeting tables"],
        ["ofis koltuğu", "office chair"],
        ["ofis koltukları", "office chairs"],
        ["fileli koltuk", "mesh office chair"],
        ["fileli koltuklar", "mesh office chairs"],
        ["misafir koltuğu", "guest chair"],
        ["lobi koltuğu", "lobby seating"],
        ["loby koltukları", "lobby seating"],
        ["vip makam takımları", "VIP executive office sets"],
        ["makam takımları", "executive office sets"],
        ["personel takımları", "staff office sets"],
        ["ofis mobilyaları", "office furniture"],
        ["özel tasarım", "special design"],
        ["çekmeceli", "with drawers"],
        ["çekmece", "drawer"],
        ["kapaklı", "with doors"],
        ["kapak", "door/panel"],
        ["ölçüler", "dimensions"],
        ["ahşap", "wood"],
        ["ceviz", "walnut"],
        ["antrasit", "anthracite"],
        ["siyah", "black"],
        ["beyaz", "white"],
        ["krem", "cream"],
        ["kahverengi", "brown"],
        ["deri", "leather"],
        ["kumaş", "fabric"],
        ["metal", "metal"],
        ["cam", "glass"],
        ["modern", "modern"],
        ["klasik", "classic"],
        ["premium", "premium"],
        ["özel", "special"],
        ["tasarım", "design"],
        ["yeni ürün", "new product"],
        ["yeni kategori", "new category"],
        ["yeni parça", "new part"],
        ["fiyat için iletişime geçin", "contact us for price"],
        ["iletişime geçin", "contact us"],
        ["üretim", "production"],
        ["ofis", "office"],
        ["masa", "desk"],
        ["masalar", "desks"],
        ["dolap", "cabinet"],
        ["dolaplar", "cabinets"],
        ["sehpa", "coffee table"],
        ["sehpalar", "coffee tables"],
        ["ünite", "unit"],
        ["üniteler", "units"],
        ["etajerli masa", "desk with return"],
        ["etajerlı masa", "desk with return"],
        ["etajer", "return"],
        ["adet", "pieces"],
        ["ve", "and"],
        ["ile", "with"]
    ];
    phrases.forEach(([a, b]) => { const esc = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); let re; try {
        re = new RegExp("(^|[^\\p{L}\\p{N}])(" + esc + ")(?=$|[^\\p{L}\\p{N}])", "giu");
    }
    catch (_) {
        re = new RegExp("(^|[\\s.,;:!?()\\-/])(" + esc + ")(?=$|[\\s.,;:!?()\\-/])", "gi");
    } s = s.replace(re, (m, pre, word) => pre + pdfMatchCase(word, b)); });
    s = s.replace(/\b(\d+)\s*çekmeceli\b/gi, "$1-drawer");
    s = s.replace(/(\d+)\s*kişilik/gi, "$1 seats");
    s = s.replace(/\b(\d+)\s*adet\b/gi, "$1 pieces");
    return { text: s === source ? source : preserveTechnicalTokens(source, s), good: false };
}
/* Bekleyen çeviriler: yalnızca düzenlenen / eklenen alanların anahtarı tutulur. Çeviri başarısız olursa (çevrimdışı vb.)
   anahtar kuyrukta kalır ve bağlantı gelince SADECE bunlar yeniden denenir; tüm site asla taranmaz. */
const TR_PENDING_KEY = "katalog_tr_pending_v1";
function trPendingLoad() { try {
    const a = JSON.parse(lsGet(TR_PENDING_KEY) || "[]");
    return new Set(Array.isArray(a) ? a.filter(x => typeof x === "string").slice(0, 3000) : []);
}
catch (_) {
    return new Set();
} }
function trPendingSave(set) { try {
    if (set.size)
        lsSet(TR_PENDING_KEY, JSON.stringify([...set].slice(0, 3000)));
    else
        lsRemove(TR_PENDING_KEY);
}
catch (_) { } }
function trPendingAdd(k) { const p = trPendingLoad(); if (!p.has(k)) {
    p.add(k);
    trPendingSave(p);
} }
function trPendingRemove(keys) { const p = trPendingLoad(); let ch = false; for (const k of keys)
    if (p.delete(k))
        ch = true; if (ch)
    trPendingSave(p); }
/* Çevirisi EKSİK alanları bulur (yalnızca bunlar çevrilir; çevrilmiş olanlara dokunulmaz, ağa istek gitmez).
   Dönen anahtarlar bekleyen-çeviri kuyruğu biçimindedir. */
function trDecide(tr, en, src, isName) {
    tr = String(tr ?? "").trim();
    en = String(en ?? "").trim();
    if (!tr)
        return "none";
    if (trBadEn(tr, en))
        return "translate";
    if (src === tr)
        return "none";
    if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(tr) || (isName && /^[^\s]+$/.test(tr) && tr === tr.toLocaleUpperCase("tr-TR")))
        return "none";
    const hasEn = !!en && en !== tr && en !== translateFallbackSync(tr) && !/^(new product|new part|new category)$/i.test(en);
    return hasEn ? "none" : "translate";
}
/* Çevirisi kaynakla aynı çıkan (marka adı gibi) genel/kategori metinleri tekrar "eksik" sayılmasın. */
const TR_SAME_KEY = "katalog_tr_same_v1";
function trSameSet() { try {
    const a = JSON.parse(lsGet(TR_SAME_KEY) || "[]");
    return new Set(Array.isArray(a) ? a.filter(x => typeof x === "string") : []);
}
catch (_) {
    return new Set();
} }
function trSameAdd(k) { try {
    const set = trSameSet();
    set.add(k);
    lsSet(TR_SAME_KEY, JSON.stringify([...set].slice(-1000)));
}
catch (_) { } }
function trMissingKeys(data, onlyBad = false) {
    const same = trSameSet(), single = tr => !/\s/.test(tr) && tr === tr.toLocaleUpperCase("tr-TR");
    const keys = [];
    if (!data)
        return keys;
    for (const f of ["siteName", "subtitle", "eyebrow"]) {
        const tr = String(data[f] ?? "").trim(), en = String(data[f + "_en"] ?? "").trim();
        if (trBadEn(tr, en)) {
            keys.push("general|" + f);
            continue;
        }
        if (!onlyBad && tr && /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(tr) && (!en || (en === tr && !same.has("general|" + f + "|" + tr))) && !(single(tr) && en === tr))
            keys.push("general|" + f);
    }
    for (const c of (data.categories || [])) {
        const tr = String(c.name ?? "").trim(), en = String(c.name_en ?? "").trim();
        if (trBadEn(tr, en))
            keys.push("cat|" + c.id);
        else if (!onlyBad && tr && /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(tr) && (!en || /^new category$/i.test(en) || (en === tr && !same.has("cat|" + c.id + "|" + tr))) && !(single(tr) && en === tr))
            keys.push("cat|" + c.id);
        for (const it of (c.items || [])) {
            const want = (tr, en, src, isName) => onlyBad ? trBadEn(tr, en) : trDecide(tr, en, src, isName) === "translate";
            if (want(it.name, it.name_en, it.name_src, true))
                keys.push("item|" + c.id + "|" + it.id + "|name");
            if (want(it.desc, it.desc_en, it.desc_src, false))
                keys.push("item|" + c.id + "|" + it.id + "|desc");
            for (const part of normalizePrice(it.price).parts)
                if (want(part.name, part.name_en, part.name_src, false))
                    keys.push("part|" + c.id + "|" + it.id + "|" + part.id);
        }
    }
    return keys;
}
async function aiTranslateText(text, type = "general") { return (await aiTranslateResult(text, type)).text; }
/* Çakışmasız önbellek anahtarı: metnin tamamının 2 x 32-bit karması + uzunluk (önceki btoa kısaltması uzun metinlerde çakışabiliyordu). */
function cacheKey(text, type = "general") {
    const str = type + "::" + text;
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return "katalog_tr_en_v4_" + type + "_" + str.length.toString(36) + "_" + (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}
async function translateCachedResult(text, type) {
    if (!text || !text.trim())
        return { text: "", good: false };
    const source = String(text).trim();
    const key = cacheKey(source, aiActive() ? type + "|ai" : type);
    const genericPlaceholders = new Set(["new product", "new part", "new category"]);
    const isBadPlaceholder = (value) => {
        const v = String(value || "").trim().toLocaleLowerCase("en-US");
        const tr = source.toLocaleLowerCase("tr-TR");
        return genericPlaceholders.has(v) && !genericPlaceholders.has(tr) && !["yeni ürün", "yeni parça", "yeni kategori"].includes(tr);
    };
    try {
        const cached = lsGet(key);
        if (cached && cached.trim() !== source && !isBadPlaceholder(cached) && !trBadEn(source, cached))
            return { text: cached.trim(), good: true };
    }
    catch (e) { }
    const ai = await aiTranslateResult(source, type), result = ai.text;
    const resultBad = trBadEn(source, result);
    const good = ai.good && !!result && !isBadPlaceholder(result) && !resultBad;
    const finalResult = (result && result.trim() !== source && !isBadPlaceholder(result) && !resultBad) ? result.trim() : translateFallbackSync(source);
    /* Yalnızca gerçek çeviriler önbelleğe alınır; kaba sözlük yedeği kalıcı hale gelmez. */
    if (good && finalResult && finalResult.trim() !== source && !isBadPlaceholder(finalResult)) {
        lsSet(key, finalResult);
    }
    return { text: finalResult || source, good };
}
async function translateCached(text, type) { return (await translateCachedResult(text, type)).text; }
async function translateProduct(item, setStatus) {
    const copy = { ...item };
    copy.name_en = await translateCached(item.name, "product_name", setStatus);
    copy.desc_en = await translateCached(item.desc, "product_description", setStatus);
    copy.dims_en = item.dims; // dimensions must never be altered
    copy.price = normalizePrice(item.price);
    for (const part of copy.price.parts) {
        part.name_en = await translateCached(part.name, "price_part", setStatus);
        part.dims_en = part.dims || "";
    }
    return copy;
}
/* -------------------- ICON -------------------- */
/* Sayı kutusu: yazarken metin olduğu gibi kalır (silinebilir, virgül/nokta yazılabilir);
   geçerli her değer anında kaydedilir, kutudan çıkınca kayıtlı değere göre yeniden gösterilir. */
function NumField(props) {
    const { value, onValue, allowEmpty = true, min = null, max = null, parse = priceNumber, format = null, keepDraft = false, ...rest } = props;
    const fmt = v => (v === null || v === undefined || v === "") ? "" : (format ? format(v) : String(v));
    const [draft, setDraft] = useState(null);
    const kept = useRef(null);
    const keptOk = keepDraft && kept.current !== null && (kept.current.trim() ? parse(kept.current) === value : (value === null || value === undefined || value === ""));
    const shown = draft !== null ? draft : (keptOk ? kept.current : fmt(value));
    return React.createElement("input", { ...rest, type: "text", autoComplete: "off", value: shown,
        onFocus: e => { setDraft(fmt(value)); if (rest.onFocus) rest.onFocus(e); },
        onChange: e => {
            const v = String(e.target.value).replace(/[^0-9.,\s-]/g, "").slice(0, 20);
            setDraft(v);
            if (!v.trim()) { if (allowEmpty) onValue(null); return; }
            const n = parse(v);
            if (n === null || !Number.isFinite(n)) return;
            if ((min !== null && n < min) || (max !== null && n > max)) return;
            onValue(n);
        },
        onBlur: e => { if (keepDraft) kept.current = draft; setDraft(null); if (rest.onBlur) rest.onBlur(e); },
        onKeyDown: e => { if (e.key === "Enter") e.currentTarget.blur(); if (rest.onKeyDown) rest.onKeyDown(e); } });
}
function Icon({ type, size = 18, className }) {
    const props = { width: size, height: size, className, "aria-hidden": true, focusable: "false", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
    let c = null;
    if (type === "settings")
        c = React.createElement(React.Fragment, null,
            React.createElement("circle", { cx: "12", cy: "12", r: "3" }),
            React.createElement("path", { d: "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1.1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1.1H6v-2.4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.7l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 12 5.5v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1.1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1z" }));
    else if (type === "x")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M6 6l12 12" }),
            React.createElement("path", { d: "M18 6L6 18" }));
    else if (type === "plus")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 5v14" }),
            React.createElement("path", { d: "M5 12h14" }));
    else if (type === "trash")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M3 6h18" }),
            React.createElement("path", { d: "M8 6V4h8v2" }),
            React.createElement("path", { d: "M19 6l-1 14H6L5 6" }),
            React.createElement("path", { d: "M10 11v5" }),
            React.createElement("path", { d: "M14 11v5" }));
    else if (type === "upload")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 16V4" }),
            React.createElement("path", { d: "M7 9l5-5 5 5" }),
            React.createElement("path", { d: "M5 20h14" }));
    else if (type === "download")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 4v12" }),
            React.createElement("path", { d: "m7 11 5 5 5-5" }),
            React.createElement("path", { d: "M5 20h14" }));
    else if (type === "up")
        c = React.createElement("path", { d: "m18 15-6-6-6 6" });
    else if (type === "down")
        c = React.createElement("path", { d: "m6 9 6 6 6-6" });
    else if (type === "save")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" }),
            React.createElement("path", { d: "M17 21v-8H7v8" }),
            React.createElement("path", { d: "M7 3v5h8" }));
    else if (type === "image")
        c = React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
            React.createElement("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
            React.createElement("path", { d: "m21 15-5-5L5 21" }));
    else if (type === "lock")
        c = React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "4", y: "10", width: "16", height: "10", rx: "2" }),
            React.createElement("path", { d: "M8 10V7a4 4 0 0 1 8 0v3" }));
    else if (type === "check")
        c = React.createElement("path", { d: "m5 12 4 4L19 6" });
    else if (type === "phone")
        c = React.createElement("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.07 5.18 2 2 0 0 1 5.05 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" });
    else if (type === "search")
        c = React.createElement(React.Fragment, null,
            React.createElement("circle", { cx: "11", cy: "11", r: "7" }),
            React.createElement("path", { d: "m20 20-4-4" }));
    else if (type === "arrow")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M5 12h14" }),
            React.createElement("path", { d: "m13 6 6 6-6 6" }));
    else if (type === "globe")
        c = React.createElement(React.Fragment, null,
            React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
            React.createElement("path", { d: "M3 12h18" }),
            React.createElement("path", { d: "M12 3a14 14 0 0 1 0 18" }),
            React.createElement("path", { d: "M12 3a14 14 0 0 0 0 18" }));
    else if (type === "spark")
        c = React.createElement(React.Fragment, null,
            React.createElement("path", { d: "m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5Z" }),
            React.createElement("path", { d: "m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7Z" }));
    return React.createElement("svg", { ...props }, c);
}
function AdminLabel({ children }) { return React.createElement("div", { style: { color: "#737373", fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "6px" } }, children); }
function ColorInput({ label, value, onChange }) { return React.createElement("label", { className: "flex items-center justify-between mb-3" },
    React.createElement("span", { className: "text-xs text-neutral-400" }, label),
    React.createElement("input", { type: "color", value: value || "#000000", onChange: e => onChange(e.target.value), className: "w-9 h-9 rounded-lg border border-neutral-700 bg-transparent cursor-pointer" })); }
/* -------------------- SHARED PRICE ENGINE FOR PDF + WEB -------------------- */
/* KUR SİSTEMİ
   Kur AÇIK  : fiyatlar TL girilir, USD/EUR girilen kurla otomatik hesaplanır.
   Kur KAPALI: her para biriminin fiyatı ayrı girilir. Fiyat alanı (amount) her zaman yönetimde seçili
               "fiyat girilen para birimi"nin (editCur) değerini taşır; diğer para birimleri part.prices içinde durur. */
const CUR_IDS = ["TRY", "USD", "EUR"];
function cleanCurMap(m) {
    const o = {};
    if (m && typeof m === "object")
        for (const k of CUR_IDS) {
            const n = priceNumber(m[k]);
            if (n !== null)
                o[k] = n;
        }
    return o;
}
function curEnabled(d) { return !!d?.currency?.enabled; }
function curEditId(d) { const v = d?.currency?.editCur; return CUR_IDS.includes(v) ? v : "TRY"; }
function curRate(d, id) { if (id === "TRY") return 1; const n = Number(id === "USD" ? d?.currency?.usdRate : d?.currency?.eurRate); return Number.isFinite(n) && n > 0 ? n : null; }
function hasPricesIn(d, cur) {
    const edit = curEditId(d);
    for (const c of (d?.categories || []))
        for (const it of (c.items || [])) {
            const p = it.price;
            if (!p)
                continue;
            for (const pt of (Array.isArray(p.parts) ? p.parts : []))
                if (cur === edit ? priceNumber(pt.amount) !== null : (pt.prices && priceNumber(pt.prices[cur]) !== null))
                    return true;
            if (cur === edit ? priceNumber(p.manualTotal) !== null : (p.totals && priceNumber(p.totals[cur]) !== null))
                return true;
        }
    return false;
}
/* Sitede seçilebilecek para birimleri */
function availableCurrencies(d) {
    if (curEnabled(d))
        return CUR_IDS.filter(id => curRate(d, id) !== null);
    const list = CUR_IDS.filter(id => hasPricesIn(d, id));
    return list.length ? list : [curEditId(d)];
}
/* Kur kapalıyken veriyi istenen para biriminin elle girilmiş fiyatlarına çevirir (görüntüleme + PDF). */
function projectCurrency(d, cur) {
    if (!d || curEnabled(d) || cur === curEditId(d))
        return d;
    return { ...d, currency: { ...d.currency, selected: cur }, categories: (d.categories || []).map(c => ({ ...c, items: (c.items || []).map(it => {
            if (!it.price)
                return it;
            const p = normalizePrice(it.price), tot = p.totals || {};
            return { ...it, price: { ...p, manualTotal: priceNumber(tot[cur]), parts: p.parts.map(pt => ({ ...pt, amount: priceNumber((pt.prices || {})[cur]) })) } };
        }) })) };
}
/* Kur kapalıyken "fiyat girilen para birimi" değişince değerler yer değiştirir (veri kaybolmaz). */
function switchEditCurrency(d, next) {
    const prev = curEditId(d);
    if (!CUR_IDS.includes(next) || prev === next)
        return d;
    const swap = (cur, map) => { const m = { ...(map || {}) }; if (priceNumber(cur) !== null) m[prev] = priceNumber(cur); else delete m[prev]; const v = m[next] !== undefined ? priceNumber(m[next]) : null; delete m[next]; return [v, m]; };
    return { ...d, currency: { ...d.currency, editCur: next }, categories: (d.categories || []).map(c => ({ ...c, items: (c.items || []).map(it => {
            if (!it.price)
                return it;
            const p = normalizePrice(it.price);
            const [mt, totals] = swap(p.manualTotal, p.totals);
            return { ...it, price: { ...p, manualTotal: mt, totals, parts: p.parts.map(pt => { const [a, prices] = swap(pt.amount, pt.prices); return { ...pt, amount: a, prices }; }) } };
        }) })) };
}
/* Kur kapalıyken TL, USD veya EUR fiyatı eksik ürünleri listeler (uyarı içindir, kaydı engellemez). */
function missingCurrencyPrices(d) {
    const out = [];
    if (!d || curEnabled(d))
        return out;
    const has = v => priceNumber(v) !== null;
    for (const c of (d.categories || []))
        for (const it of (c.items || [])) {
            const p = normalizePrice(it.price), miss = new Set();
            for (const pt of p.parts) {
                if (pt.contactOnly)
                    continue;
                if (!has(pt.amount)) miss.add("TL");
                if (!has((pt.prices || {}).USD)) miss.add("USD");
                if (!has((pt.prices || {}).EUR)) miss.add("EUR");
            }
            if (p.autoCollect === false && p.parts.length > 1) {
                if (!has(p.manualTotal)) miss.add("TL");
                if (!has((p.totals || {}).USD)) miss.add("USD");
                if (!has((p.totals || {}).EUR)) miss.add("EUR");
            }
            if (miss.size)
                out.push({ cid: c.id, id: it.id, name: it.name || "Adsız ürün", missing: ["TL", "USD", "EUR"].filter(x => miss.has(x)) });
        }
    return out;
}
function getCurrencyByData(source) {
    const id = source?.currency?.selected || "TRY";
    return CURRENCIES.find(x => x.id === id) || CURRENCIES[0];
}
/* Cihaza özel, para birimine özel iskonto: kur dönüşümünden SONRA uygulanır.
   Oran source.__discount içinde taşınır (viewCurrencyData tarafından); veriye yazılmaz. */
function applyDiscountToValue(source, v) {
    if (v === null || v === undefined)
        return v;
    const d = Math.min(100, Math.max(0, Number(source?.__discount) || 0));
    return d > 0 ? v * (1 - d / 100) : v;
}
function convertPriceByData(source, amount) {
    if (amount === null || amount === undefined || amount === "")
        return null;
    const n = Number(amount), c = source?.currency?.selected || "TRY";
    if (!Number.isFinite(n))
        return null;
    let base;
    /* Kur kapalı: fiyat zaten seçili para biriminde girilmiştir, çevrilmez. */
    if (!curEnabled(source))
        base = n;
    else if (c === "USD") {
        const r = Number(source?.currency?.usdRate);
        base = r > 0 ? n / r : null;
    }
    else if (c === "EUR") {
        const r = Number(source?.currency?.eurRate);
        base = r > 0 ? n / r : null;
    }
    else
        base = n;
    return applyDiscountToValue(source, base);
}
/* TL vade oranı: 0 < oran ≤ 100 (ondalık kabul, "12,5" → 12.5). Geçersizse null. */
function vadeRateValue(v) {
    if (v === null || v === undefined || v === "")
        return null;
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) && n > 0 && n <= 100 ? Math.round(n * 100) / 100 : null;
}
/* Görünümde etkin vade oranı: source.__vade (viewCurrencyData tarafından yalnızca TL'de konur). */
function vadeRateOf(source) {
    return (source?.currency?.selected || "TRY") === "TRY" ? (vadeRateValue(source?.__vade) || 0) : 0;
}
function vadeLabelOf(source, lang) {
    const custom = String(source?.vade?.label || "").trim();
    return lang === "EN" ? "Installment" : (custom || "Vadeli");
}
function vadePctText(rate) { return "%" + String(rate).replace(".", ","); }
/* Vadeli fiyat = peşin (kur + iskonto sonrası) × (1 + oran/100). Vade yoksa null. */
function formatVadeByData(source, amount) {
    const r = vadeRateOf(source);
    if (!r)
        return null;
    const v = convertPriceByData(source, amount);
    return v === null ? null : formatValueByData(source, v * (1 + r / 100));
}
function formatAmountByData(source, amount) {
    const v = convertPriceByData(source, amount);
    return v === null ? null : formatValueByData(source, v);
}
function formatValueByData(source, v) {
    const c = getCurrencyByData(source);
    /* Kuruş / cent yazılmaz: ondalık kısım yuvarlanmadan doğrudan atılır (21.560,63 → 21.560). */
    const locale = c.id === "TRY" ? "tr-TR" : "en-US";
    const s = Math.floor(Math.abs(v) + 1e-9).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return c.id === "USD" ? "$" + s : c.id === "EUR" ? "€" + s : s + " ₺";
}
/* -------------------- PDF PRICE LIST -------------------- */
/*
   PDF LAYOUT — ORIGINAL GRID
   A4 portrait, fixed x coordinates, one identical product template.
   The original reference uses compact stacked product blocks on page 2;
   this implementation keeps that logic while removing KG / M³ as requested.
*/
function pdfText(lang, tr, en, fallback) { return getText(lang, tr, en, fallback || tr); }
function pdfCurrencyInfo(data) {
    const id = data?.currency?.selected || "TRY";
    const rate = id === "USD" ? Number(data?.currency?.usdRate) : id === "EUR" ? Number(data?.currency?.eurRate) : 1;
    return { id, rate: rate > 0 ? rate : 1 };
}
function pdfMoney(data, amount) {
    if (amount === null || amount === undefined || amount === "" || !Number.isFinite(Number(amount)))
        return "—";
    return formatAmountByData(data, amount) || "—";
}
function pdfTotal(data, item, lang) {
    const total = priceTotal(item?.price);
    if (total !== null)
        return pdfMoney(data, total);
    const p = normalizePrice(item?.price);
    return p.parts.some(x => x.contactOnly) ? (lang === "EN" ? "Contact us" : "İletişime geçin") : "—";
}
function pdfCleanDims(value) { return String(value || "—").replace(/\b(kg|m³|m3)\b/gi, "").replace(/\s{2,}/g, " ").trim() || "—"; }
function pdfDimsParts(value) {
    const s = pdfCleanDims(value), nums = s.match(/[-+]?\d+(?:[.,]\d+)?/g) || [];
    return [nums[0] || "—", nums[1] || "—", nums[2] || "—"];
}
function pdfRowsForItem(item) {
    const p = normalizePrice(item?.price);
    if (p.parts.length)
        return p.parts;
    return [{ name: item?.name || "", name_en: item?.name_en || "", dims: item?.dims || "", dims_en: item?.dims_en || "", amount: p.amount, contactOnly: p.contactOnly, ...logiOf(item) }];
}
/* -------------------- STRICT PDF DATA / IMAGE BOUNDARIES -------------------- */
function pdfImageSource(value) {
    if (typeof value === "string")
        return value.trim();
    if (value && typeof value === "object")
        return String(value.src || value.data || value.url || "").trim();
    return "";
}
function pdfValidProductId(item) {
    const id = item?.id;
    /* Kısa/eski kimlikli gerçek ürünler de PDF'e girer (önceden 4 karakterden kısa kimlikler sessizce atlanıyordu). */
    return (typeof id === "string" && id.trim().length > 0) || (typeof id === "number" && Number.isFinite(id));
}
function pdfHasRealProductData(item) {
    if (!item || typeof item !== "object")
        return false;
    const price = item.price;
    const hasPrice = !!price && ((Array.isArray(price.parts) && price.parts.some(p => p && ((p.amount !== null && p.amount !== undefined && p.amount !== "") || String(p.name ?? "").trim()))) ||
        (price.amount !== null && price.amount !== undefined && price.amount !== ""));
    return !!pdfImageSource(item.image) || (Array.isArray(item.images) && item.images.some(Boolean)) || !!String(item.dims ?? "").trim() || !!String(item.desc ?? "").trim() || hasPrice;
}
function pdfIsDemoProduct(item) {
    if (!item || typeof item !== "object")
        return true;
    if (!pdfValidProductId(item))
        return true;
    if (item.isDemo === true || item.placeholder === true || item.temporary === true)
        return true;
    const name = String(item.name ?? "").trim();
    if (!name)
        return true;
    /* Only an empty legacy placeholder named Yeni Ürün/New Product is removed. */
    if (/^(yeni\s*ürün|new\s*product)$/i.test(name) && !pdfHasRealProductData(item))
        return true;
    return false;
}
function pdfProductImageSource(item, data) {
    const src = pdfImageSource(item?.image) || pdfImageSource(Array.isArray(item?.images) ? item.images.find(Boolean) : "");
    if (!src)
        return "";
    /* Product image can ONLY come from this exact item's image field. */
    const logo = pdfImageSource(data?.logo?.src);
    if (logo && src === logo)
        return "";
    for (const category of (data?.categories || [])) {
        const cover = pdfImageSource(category?.coverImage);
        if (cover && src === cover)
            return "";
    }
    return src;
}
function pdfRealCategories(rawData) {
    const source = rawData && typeof rawData === "object" ? rawData : {};
    const categories = Array.isArray(source.categories) ? source.categories : [];
    return categories.map(category => {
        if (!category || typeof category !== "object")
            return null;
        const rawItems = Array.isArray(category.items) ? category.items : [];
        const items = rawItems.filter(item => !pdfIsDemoProduct(item)).map(item => {
            const normalized = normalizeItem(item);
            /* One PDF product = one source item. No fields are borrowed from another item. */
            return {
                ...normalized,
                id: item.id,
                categoryId: category.id,
                categoryName: category.name,
                categoryName_en: category.name_en,
                image: pdfProductImageSource(item, source) || null
            };
        });
        return { ...category, items };
    }).filter(Boolean).filter(category => category.items.length > 0);
}
async function pdfPrepareImages(data) {
    const prepared = pdfRealCategories(data), images = new Map();
    for (const category of prepared) {
        for (const item of category.items) {
            const src = pdfProductImageSource(item, data);
            if (src && !images.has(src))
                images.set(src, null);
            /* Model sırası düzeni: her modelin (Müdür, Şef…) kendi fotoğrafı */
            for (const part of normalizePrice(item.price).parts) {
                const ps = pdfImageSource(part.image);
                if (ps && !images.has(ps))
                    images.set(ps, null);
            }
            for (const g of (Array.isArray(item.images) ? item.images : []).slice(0, 10)) {
                const gs = pdfImageSource(g);
                if (gs && !images.has(gs))
                    images.set(gs, null);
            }
        }
    }
    await Promise.all([...images.keys()].map(async (src) => images.set(src, await pdfImageAsset(src))));
    return { data: { ...data, categories: prepared }, images };
}
/* Embedded DejaVu Sans: real Unicode text in the PDF, including Ç Ş Ğ İ Ö Ü ı. */
const PDF_FONT_CMAP = { "32": 1, "33": 2, "34": 3, "35": 4, "36": 5, "37": 6, "38": 7, "39": 8, "40": 9, "41": 10, "42": 11, "43": 12, "44": 13, "45": 14, "46": 15, "47": 16, "48": 17, "49": 18, "50": 19, "51": 20, "52": 21, "53": 22, "54": 23, "55": 24, "56": 25, "57": 26, "58": 27, "59": 28, "60": 29, "61": 30, "62": 31, "63": 32, "64": 33, "65": 34, "66": 35, "67": 36, "68": 37, "69": 38, "70": 39, "71": 40, "72": 41, "73": 42, "74": 43, "75": 44, "76": 45, "77": 46, "78": 47, "79": 48, "80": 49, "81": 50, "82": 51, "83": 52, "84": 53, "85": 54, "86": 55, "87": 56, "88": 57, "89": 58, "90": 59, "91": 60, "92": 61, "93": 62, "94": 63, "95": 64, "96": 65, "97": 66, "98": 67, "99": 68, "100": 69, "101": 70, "102": 71, "103": 72, "104": 73, "105": 74, "106": 75, "107": 76, "108": 77, "109": 78, "110": 79, "111": 80, "112": 81, "113": 82, "114": 83, "115": 84, "116": 85, "117": 86, "118": 87, "119": 88, "120": 89, "121": 90, "122": 91, "123": 92, "124": 93, "125": 94, "126": 95, "160": 96, "161": 97, "162": 98, "163": 99, "164": 100, "165": 101, "166": 102, "167": 103, "168": 104, "169": 105, "170": 106, "171": 107, "172": 108, "173": 109, "174": 110, "175": 111, "176": 112, "177": 113, "178": 114, "179": 115, "180": 116, "181": 117, "182": 118, "183": 119, "184": 120, "185": 121, "186": 122, "187": 123, "188": 124, "189": 125, "190": 126, "191": 127, "192": 128, "193": 129, "194": 130, "195": 131, "196": 132, "197": 133, "198": 134, "199": 135, "200": 136, "201": 137, "202": 138, "203": 139, "204": 140, "205": 141, "206": 142, "207": 143, "208": 144, "209": 145, "210": 146, "211": 147, "212": 148, "213": 149, "214": 150, "215": 151, "216": 152, "217": 153, "218": 154, "219": 155, "220": 156, "221": 157, "222": 158, "223": 159, "224": 160, "225": 161, "226": 162, "227": 163, "228": 164, "229": 165, "230": 166, "231": 167, "232": 168, "233": 169, "234": 170, "235": 171, "236": 172, "237": 173, "238": 174, "239": 175, "240": 176, "241": 177, "242": 178, "243": 179, "244": 180, "245": 181, "246": 182, "247": 183, "248": 184, "249": 185, "250": 186, "251": 187, "252": 188, "253": 189, "254": 190, "255": 191, "286": 192, "287": 193, "304": 194, "305": 195, "350": 196, "351": 197, "8211": 203, "8212": 204, "8230": 205, "8364": 213, "8378": 214 };
const PDF_FONT_WIDTHS = [1229, 651, 821, 942, 1716, 1303, 1946, 1597, 563, 799, 799, 1024, 1716, 651, 739, 651, 690, 1303, 1303, 1303, 1303, 1303, 1303, 1303, 1303, 1303, 1303, 690, 690, 1716, 1716, 1716, 1087, 2048, 1401, 1405, 1430, 1577, 1294, 1178, 1587, 1540, 604, 604, 1343, 1141, 1767, 1532, 1612, 1235, 1612, 1423, 1300, 1251, 1499, 1401, 2025, 1403, 1251, 1403, 799, 690, 799, 1716, 1024, 1024, 1255, 1300, 1126, 1300, 1260, 721, 1300, 1298, 569, 569, 1186, 569, 1995, 1298, 1253, 1300, 1300, 842, 1067, 803, 1298, 1212, 1675, 1212, 1212, 1075, 1303, 690, 1303, 1716, 651, 821, 1303, 1303, 1303, 1303, 690, 1024, 1024, 2048, 965, 1253, 1716, 739, 2048, 1024, 1024, 1716, 821, 821, 1024, 1303, 1303, 651, 1024, 821, 965, 1253, 1985, 1985, 1985, 1087, 1401, 1401, 1401, 1401, 1401, 1401, 1995, 1430, 1294, 1294, 1294, 1294, 604, 604, 604, 604, 1587, 1532, 1612, 1612, 1612, 1612, 1612, 1716, 1612, 1499, 1499, 1499, 1499, 1251, 1239, 1290, 1255, 1255, 1255, 1255, 1255, 1255, 2011, 1126, 1260, 1260, 1260, 1260, 569, 569, 569, 569, 1253, 1298, 1253, 1253, 1253, 1253, 1253, 1716, 1253, 1298, 1298, 1298, 1298, 1212, 1300, 1212, 1587, 1300, 604, 569, 1300, 1067, 1300, 1024, 1024, 1024, 1024, 1024, 2048, 2048, 994, 342, 1888, 1501, 1501, 821, 2199, 1303, 1303, 2086, 2086, 2185, 2088, 2200, 2445, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1536, 1536, 1536, 1536, 1536, 1536, 1536, 1411, 1290, 1290, 1980, 1980, 1763, 0, 0, 0, 0, 0, 0, 0, 1048, 569, 908, 1298, 821, 1087];
const PDF_FONT_METRICS = { "unitsPerEm": 2048, "ascent": 1901, "descent": -483, "bbox": [-842, -534, 2380, 1938], "capHeight": 1901 };
function pdfB64Bytes(b64) { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++)
    out[i] = bin.charCodeAt(i); return out; }
function pdfHex(bytes) { let s = ""; for (let i = 0; i < bytes.length; i++)
    s += bytes[i].toString(16).padStart(2, "0"); return s.toUpperCase(); }
function pdfGlyphId(cp) {
    return PDF_FONT_CMAP[cp] ?? PDF_FONT_CMAP[63] ?? 0;
}
/* Gömülü fontta olmayan karakterleri en yakın karşılığına çevir (yoksa "?" basılıyordu). */
const PDF_CHAR_MAP = { "\u2018": "'", "\u2019": "'", "\u201A": ",", "\u201B": "'", "\u201C": '"', "\u201D": '"', "\u201E": '"', "\u2032": "'", "\u2033": '"', "\u2022": "·", "\u2023": "·", "\u25CF": "·", "\u2212": "-", "\u2010": "-", "\u2011": "-", "\u2012": "-", "\u2015": "—", "\u00A0": " ", "\u2007": " ", "\u2009": " ", "\u202F": " ", "\u200B": "", "\u200C": "", "\u200D": "", "\uFEFF": "", "\u2122": "TM", "\u2192": "->", "\u2190": "<-", "\u2264": "<=", "\u2265": ">=", "\u2248": "~", "\u2300": "Ø", "\u2715": "×", "\u2716": "×" };
function pdfNormalizeText(text) {
    let out = "";
    for (const ch of String(text ?? "")) {
        const cp = ch.codePointAt(0);
        if (PDF_FONT_CMAP[cp] !== undefined) {
            out += ch;
            continue;
        }
        if (PDF_CHAR_MAP[ch] !== undefined) {
            out += PDF_CHAR_MAP[ch];
            continue;
        }
        if (cp < 32) {
            out += " ";
            continue;
        }
        /* Aksanlı harf ise aksanını atıp dene (ș → s, ā → a); olmazsa atla. */
        const base = ch.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
        out += [...base].every(c => PDF_FONT_CMAP[c.codePointAt(0)] !== undefined) ? base : "";
    }
    return out;
}
function pdfUnicodeHex(text) {
    let out = "";
    for (const ch of pdfNormalizeText(text)) {
        const cp = ch.codePointAt(0);
        if (cp <= 0xFFFF) {
            out += pdfGlyphId(cp).toString(16).padStart(4, "0");
        }
        else {
            const v = cp - 0x10000;
            const hi = 0xD800 + (v >> 10), lo = 0xDC00 + (v & 1023);
            out += pdfGlyphId(hi).toString(16).padStart(4, "0");
            out += pdfGlyphId(lo).toString(16).padStart(4, "0");
        }
    }
    return out.toUpperCase();
}
function pdfFontWidth(text, size) {
    let total = 0;
    for (const ch of pdfNormalizeText(text)) {
        const cp = ch.codePointAt(0);
        total += (PDF_FONT_WIDTHS[pdfGlyphId(cp)] || 0);
    }
    return total / PDF_FONT_METRICS.unitsPerEm * size;
}
function pdfWrapText(text, maxWidth, size, maxLines = 3) {
    const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
    if (!words.length)
        return [""];
    const lines = [];
    let line = "";
    for (const word of words) {
        const test = line ? line + " " + word : word;
        if (!line || pdfFontWidth(test, size) <= maxWidth)
            line = test;
        else {
            lines.push(line);
            line = word;
        }
    }
    if (line)
        lines.push(line);
    if (lines.length <= maxLines)
        return lines;
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    const rest = lines.slice(maxLines - 1).join(" ");
    while (last.length && pdfFontWidth(last + "…", size) > maxWidth)
        last = last.slice(0, -1);
    kept[maxLines - 1] = last ? last + "…" : "…";
    return kept;
}
function pdfTextOp(text, x, y, size, opts = {}) {
    const align = opts.align || "left", bold = !!opts.bold, maxWidth = opts.maxWidth ?? null, maxLines = opts.maxLines || 1, leading = opts.leading || size * 1.12;
    const lines = pdfWrapText(text, maxWidth ?? 1e9, size, maxLines);
    let out = "";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let xx = x;
        if (align === "center")
            xx = x - pdfFontWidth(line, size) / 2;
        else if (align === "right")
            xx = x - pdfFontWidth(line, size);
        const hex = pdfUnicodeHex(line), color = Array.isArray(opts.color) ? opts.color : [0, 0, 0];
        /* Kalın yazı "doldur+kontur" ile çizilir; kontur rengi de yazı rengine eşitlenir
           (önceden son çizilen çizginin rengini alıyor, kalın yazılar soluk/gri görünüyordu). */
        const rgb = `${color[0]} ${color[1]} ${color[2]} rg ${color[0]} ${color[1]} ${color[2]} RG`;
        /* Use PDF text rendering mode for bold instead of drawing the same glyph
           twice. Double-drawing caused visible ghosting/overlap in Acrobat. */
        const boldOp = bold ? `${Math.max(0.18, Math.min(0.42, size * 0.035)).toFixed(2)} w 2 Tr\n` : '';
        const resetOp = bold ? '0 Tr\n' : '';
        out += `${rgb}\nBT ${boldOp}/F1 ${size.toFixed(2)} Tf 1 0 0 1 ${xx.toFixed(2)} ${(y - i * leading).toFixed(2)} Tm <${hex}> Tj ${resetOp}ET\n`;
    }
    return out;
}
function pdfRect(x, y, w, h, fill = null, stroke = null, lw = 0.5) {
    let s = "";
    if (fill)
        s += `${fill[0]} ${fill[1]} ${fill[2]} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f\n`;
    if (stroke)
        s += `${stroke[0]} ${stroke[1]} ${stroke[2]} RG ${lw.toFixed(2)} w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S\n`;
    return s;
}
function pdfLine(x1, y1, x2, y2, color = [0.25, 0.25, 0.25], lw = 0.5) { return `${color[0]} ${color[1]} ${color[2]} RG ${lw.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S\n`; }
function pdfFitRect(iw, ih, x, y, w, h) { const r = Math.min(w / iw, h / ih); const dw = iw * r, dh = ih * r; return { x: x + (w - dw) / 2, y: y + (h - dh) / 2, w: dw, h: dh }; }
function pdfDrawImage(name, asset, x, y, w, h, contain = true) {
    if (!asset)
        return "";
    const box = contain ? pdfFitRect(asset.width, asset.height, x, y, w, h) : { x, y, w, h };
    return `q\n${box.w.toFixed(2)} 0 0 ${box.h.toFixed(2)} ${box.x.toFixed(2)} ${box.y.toFixed(2)} cm\n/${name} Do\nQ\n`;
}
const PDF_IMAGE_TIMEOUT_MS = 15000;
function pdfWithTimeout(promise, ms, fallback = null) {
    let timer;
    return Promise.race([promise, new Promise(res => { timer = setTimeout(() => res(fallback), ms); })]).finally(() => clearTimeout(timer));
}
async function pdfLoadImageSafe(key) {
    if (!key)
        return null;
    /* Yanıt vermeyen bir görsel sunucusu PDF'i sonsuza kadar bekletmesin. */
    return pdfWithTimeout(pdfLoadImageInner(key), PDF_IMAGE_TIMEOUT_MS, null);
}
async function pdfLoadImageInner(key) {
    // Uzak görselleri önce Blob olarak al. Böylece canvas
    // cross-origin kaynak yüzünden "Tainted canvases may not be exported" vermez.
    if (/^https?:\/\//i.test(key)) {
        try {
            const r = await fetch(key, { mode: "cors", cache: "force-cache" });
            if (r.ok) {
                const blob = await r.blob();
                const objectUrl = URL.createObjectURL(blob);
                const result = await new Promise(resolve => {
                    const im = new Image();
                    let done = false;
                    const finish = v => { if (done)
                        return; done = true; resolve(v); };
                    im.onload = () => finish({ im, width: im.naturalWidth || im.width, height: im.naturalHeight || im.height, objectUrl });
                    im.onerror = () => finish(null);
                    im.src = objectUrl;
                });
                if (result)
                    return result;
                try {
                    URL.revokeObjectURL(objectUrl);
                }
                catch { }
            }
        }
        catch (err) {
            console.warn("PDF görseli Blob olarak alınamadı, CORS ile deneniyor:", err);
        }
    }
    return await new Promise(resolve => {
        const im = new Image();
        let done = false;
        const finish = v => { if (done)
            return; done = true; resolve(v); };
        if (/^https?:\/\//i.test(key))
            im.crossOrigin = "anonymous";
        im.onload = () => finish({ im, width: im.naturalWidth || im.width, height: im.naturalHeight || im.height, objectUrl: null });
        im.onerror = () => finish(null);
        im.src = key;
    });
}
/* Görsel çözünürlüğü kullanım yerine göre: ürün kutusu ~186x82pt → 300 dpi için ~1000 px yeterli.
   Tam sayfa kategori kapağı için 2000 px. (Eskiden her görsel 2400 px/%96 kaliteydi → çok büyük PDF.) */
async function pdfImageAsset(src, { max = 1000, quality = .86 } = {}) {
    const key = pdfImageSource(src);
    if (!key)
        return null;
    const cacheKey = key + "|" + max + "|" + quality;
    pdfImageAsset.cache = pdfImageAsset.cache || new Map();
    if (pdfImageAsset.cache.has(cacheKey))
        return pdfImageAsset.cache.get(cacheKey);
    const asset = await pdfLoadImageSafe(key);
    if (!asset) {
        pdfImageAsset.cache.set(cacheKey, null);
        return null;
    }
    try {
        /* Boyutu tanımsız SVG'ler için makul varsayılan. */
        const iw = asset.width || 800, ih = asset.height || 600;
        /* Acrobat-safe: normalize every image to RGB JPEG because the PDF XObject declares DeviceRGB. */
        const c = document.createElement('canvas');
        const scale = Math.min(1, max / Math.max(iw, ih));
        c.width = Math.max(1, Math.round(iw * scale));
        c.height = Math.max(1, Math.round(ih * scale));
        const cctx = c.getContext('2d', { alpha: false });
        cctx.fillStyle = '#ffffff';
        cctx.fillRect(0, 0, c.width, c.height);
        cctx.drawImage(asset.im, 0, 0, c.width, c.height);
        const data = c.toDataURL('image/jpeg', quality);
        const result = { data, width: c.width, height: c.height, source: key };
        pdfImageAsset.cache.set(cacheKey, result);
        return result;
    }
    catch (err) {
        console.warn("PDF görseli işlenemedi:", err);
        pdfImageAsset.cache.set(cacheKey, null);
        return null;
    }
    finally {
        if (asset.objectUrl) {
            try {
                URL.revokeObjectURL(asset.objectUrl);
            }
            catch (_) { }
        }
    }
}
async function pdfLogoImageAsset(src) {
    const key = pdfImageSource(src);
    if (!key)
        return null;
    pdfLogoImageAsset.cache = pdfLogoImageAsset.cache || new Map();
    if (pdfLogoImageAsset.cache.has(key))
        return pdfLogoImageAsset.cache.get(key);
    const asset = await pdfLoadImageSafe(key);
    if (!asset) {
        pdfLogoImageAsset.cache.set(key, null);
        return null;
    }
    if (asset.objectUrl)
        setTimeout(() => { try {
            URL.revokeObjectURL(asset.objectUrl);
        }
        catch (_) { } }, 0);
    const iw = asset.width || 1200, ih = asset.height || 600;
    const max = 1800, scale = Math.min(1, max / Math.max(iw, ih));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(iw * scale));
    c.height = Math.max(1, Math.round(ih * scale));
    const ctx = c.getContext("2d", { alpha: false });
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(asset.im, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", .98);
    const result = { data, width: c.width, height: c.height, source: key };
    pdfLogoImageAsset.cache.set(key, result);
    return result;
}
function pdfDataUriToBytes(dataUri) { const b64 = String(dataUri || "").split(",")[1] || ""; return pdfB64Bytes(b64); }
function pdfConcatBytes(chunks) { let total = 0; for (const c of chunks)
    total += c.length; const out = new Uint8Array(total); let o = 0; for (const c of chunks) {
    out.set(c, o);
    o += c.length;
} return out; }
function pdfObjBytes(value) { return value instanceof Uint8Array ? value : new TextEncoder().encode(value); }
function pdfCodepointToGid(cp) {
    return PDF_FONT_CMAP[cp] ?? PDF_FONT_CMAP[63] ?? 0;
}
function pdfCollectUsedGlyphs(texts) {
    const map = new Map();
    const add = (cp) => {
        const gid = pdfGlyphId(cp);
        if (!map.has(gid))
            map.set(gid, cp);
    };
    add(32);
    add(63);
    for (const text of texts) {
        for (const ch of String(text ?? "")) {
            const cp = ch.codePointAt(0);
            if (cp <= 0xFFFF)
                add(cp);
            else {
                const v = cp - 0x10000;
                add(0xD800 + (v >> 10));
                add(0xDC00 + (v & 1023));
            }
        }
    }
    return map;
}
function pdfToUnicodeObject(glyphToUnicode) {
    const arr = [...glyphToUnicode.entries()].sort((a, b) => a[0] - b[0]);
    let body = "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000><FFFF>\nendcodespacerange\n";
    for (let i = 0; i < arr.length; i += 100) {
        const chunk = arr.slice(i, i + 100);
        body += chunk.length + " beginbfchar\n";
        for (const [gid, cp] of chunk) {
            body += `<${gid.toString(16).padStart(4, "0")}><${cp.toString(16).padStart(4, "0")}>\n`;
        }
        body += "endbfchar\n";
    }
    body += "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend";
    return body;
}
async function pdfFontBytes() {
    if (pdfFontBytes.cache)
        return pdfFontBytes.cache;
    pdfFontBytes.cache = (async () => {
        const raw = pdfB64Bytes(await pdfLoadFontData());
        if (typeof DecompressionStream !== "function")
            throw new Error("Bu tarayıcı sıkıştırılmış PDF fontunu açamıyor.");
        const ds = new DecompressionStream("gzip");
        const ab = await new Response(new Blob([raw]).stream().pipeThrough(ds)).arrayBuffer();
        return new Uint8Array(ab);
    })();
    pdfFontBytes.cache.catch(() => { pdfFontBytes.cache = null; });
    return pdfFontBytes.cache;
}
/* PDF fontu (~40 KB) her ziyaretçiye değil, sadece PDF oluşturulurken indirilir */
function pdfLoadFontData() {
    if (window.PDF_FONT_GZIP_B64)
        return Promise.resolve(window.PDF_FONT_GZIP_B64);
    return new Promise((resolve, reject) => {
        const sc = document.createElement("script");
        sc.src = "/katalog/pdf-font.js";
        sc.onload = () => window.PDF_FONT_GZIP_B64 ? resolve(window.PDF_FONT_GZIP_B64) : reject(new Error("PDF fontu yüklenemedi."));
        sc.onerror = () => reject(new Error("PDF fontu yüklenemedi. İnternet bağlantınızı kontrol edin."));
        document.head.appendChild(sc);
    });
}
async function pdfMakeFontAndToUnicode(objs, glyphToUnicode) {
    const add = b => { objs.push(b); return objs.length; };
    const fontBytes = await pdfFontBytes();
    const fontFile = add(pdfConcatBytes([pdfObjBytes(`<< /Length ${fontBytes.length} /Length1 ${fontBytes.length} >>\nstream\n`), fontBytes, pdfObjBytes("\nendstream")]));
    const m = PDF_FONT_METRICS, scale = 1000 / m.unitsPerEm, bb = m.bbox.map(v => Math.round(v * scale));
    const desc = add(pdfObjBytes(`<< /Type /FontDescriptor /FontName /DejaVuSans /Flags 32 /FontBBox [${bb.join(" ")}] /ItalicAngle 0 /Ascent ${Math.round(m.ascent * scale)} /Descent ${Math.round(m.descent * scale)} /CapHeight ${Math.round(m.capHeight * scale)} /StemV 80 /FontFile2 ${fontFile} 0 R >>`));
    /* IMPORTANT: /W must contain the real advance width for EVERY glyph CID that
       the PDF can emit. The previous version only listed glyphs discovered by
       scanning the already-generated PDF content stream (which contains hex
       digits, not the original Unicode characters). That made most letters fall
       back to /DW 500 and caused Acrobat to squeeze/overlap text. */
    const widths = [];
    for (let gid = 0; gid < PDF_FONT_WIDTHS.length; gid++) {
        widths.push(`${gid} [${Math.round((PDF_FONT_WIDTHS[gid] || 0) * scale)}]`);
    }
    /* Build ToUnicode from the actual Unicode->GID table, not from PDF operators.
       This keeps copy/search/extraction correct for Turkish characters too. */
    const fullMap = new Map();
    for (const [cp, gid] of Object.entries(PDF_FONT_CMAP)) {
        const ncp = Number(cp), ngid = Number(gid);
        if (!fullMap.has(ngid))
            fullMap.set(ngid, ncp);
    }
    if (glyphToUnicode instanceof Map) {
        for (const [gid, cp] of glyphToUnicode.entries())
            fullMap.set(Number(gid), Number(cp));
    }
    const cmapText = pdfToUnicodeObject(fullMap);
    const cmapBytes = pdfObjBytes(cmapText);
    const cmap = add(pdfConcatBytes([pdfObjBytes(`<< /Length ${cmapBytes.length} >>\nstream\n`), cmapBytes, pdfObjBytes("\nendstream")]));
    const cid = add(pdfObjBytes(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /DejaVuSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${desc} 0 R /DW 500 /W [${widths.join(" ")}] /CIDToGIDMap /Identity >>`));
    const type0 = add(pdfObjBytes(`<< /Type /Font /Subtype /Type0 /BaseFont /DejaVuSans /Encoding /Identity-H /DescendantFonts [${cid} 0 R] /ToUnicode ${cmap} 0 R >>`));
    return type0;
}
function pdfPageMetrics() { return { width: 595.28, height: 841.89 }; }
/* Fixed A4 geometry. All product blocks use these exact x/width values. */
const PDF_LAYOUT = {
    W: 595.28, H: 841.89,
    rail: 18, left: 27, right: 8, top: 18, bottom: 25,
    gap: 5,
    cardW: 560.28,
    imageW: 190,
    imageH: 82,
    cardH: 105,
    titleH: 17,
    headerH: 16,
    rowH: 14.5,
    categoryH: 18
};
PDF_LAYOUT.cardW = PDF_LAYOUT.W - PDF_LAYOUT.left - PDF_LAYOUT.right;
PDF_LAYOUT.tableX = PDF_LAYOUT.left + PDF_LAYOUT.imageW;
PDF_LAYOUT.tableW = PDF_LAYOUT.cardW - PDF_LAYOUT.imageW;
PDF_LAYOUT.moduleW = 116;
PDF_LAYOUT.dimW = 78;
PDF_LAYOUT.unitW = 82;
PDF_LAYOUT.setW = PDF_LAYOUT.tableW - PDF_LAYOUT.moduleW - PDF_LAYOUT.dimW - PDF_LAYOUT.unitW;
PDF_LAYOUT.c1 = PDF_LAYOUT.tableX + PDF_LAYOUT.moduleW;
PDF_LAYOUT.c2 = PDF_LAYOUT.c1 + PDF_LAYOUT.dimW;
PDF_LAYOUT.c3 = PDF_LAYOUT.c2 + PDF_LAYOUT.unitW;
/* 5 satıra kadar tüm ürün kartları aynı yükseklikte (sayfa başına 7 ürün düzeni korunur).
   Daha fazla fiyat kalemi olan ürünlerde kart uzar; satırlar okunaklı kalır, üst üste binmez. */
const PDF_ROW_MIN_H = 12.4;
/* Takım tablosu kartı (A1 tasarım diliyle): görsel paneli, ad + altın çizgi, satır alanı başlangıcı */
const PDF_TBL = { imgW: 178, headTop: 35, pad: 6, setW: 104 };
/* Satırlarda paket/m³/kg varsa modül adının altına ikinci satır gelir; satır uzar (yalnızca fiyat listesi). */
function pdfRowMinH(item) { return (!pdfNoPrice && pdfRowsForItem(item).some(logiHas)) ? 19 : PDF_ROW_MIN_H; }
function pdfMaxRowsPerCard(item) {
    const L = PDF_LAYOUT;
    return Math.floor((L.H - L.top - L.bottom - L.categoryH - L.gap - PDF_TBL.headTop - PDF_TBL.pad) / (item ? pdfRowMinH(item) : PDF_ROW_MIN_H));
}
function pdfVisibleRows(item, lang) {
    const rows = pdfRowsForItem(item), max = pdfMaxRowsPerCard(item);
    if (rows.length <= max)
        return rows;
    const hidden = rows.length - (max - 1);
    return [...rows.slice(0, max - 1), { name: lang === "EN" ? `+${hidden} more items — call us` : `+${hidden} kalem daha — bizi arayın`, dims: "", amount: null, contactOnly: false, __more: true }];
}
function pdfCardHeight(item) {
    const L = PDF_LAYOUT, rows = pdfVisibleRows(item, "TR").length;
    const need = PDF_TBL.headTop + rows * pdfRowMinH(item) + PDF_TBL.pad;
    return Math.max(L.cardH, Math.ceil(need));
}
function pdfCategoryHeight() { return PDF_LAYOUT.categoryH; }
function pdfPageChrome(data, pageNo) {
    const L = PDF_LAYOUT, W = L.W, H = L.H;
    let c = pdfRect(0, 0, L.rail, H, [0.05, 0.05, 0.05]);
    const site = data.pdf?.website || data.pdf?.footer || data.siteName || "";
    const hex = pdfUnicodeHex(site);
    c += `q\n1 0 0 1 ${(L.rail / 2).toFixed(2)} ${(H / 2).toFixed(2)} cm\n0 1 -1 0 0 0 cm\nBT /F1 8.5 Tf 1 0 0 1 0 0 Tm <${hex}> Tj ET\nQ\n`;
    if (data.pdf?.showPageNumbers !== false)
        c += pdfTextOp(String(pageNo), L.rail / 2, 13, 8.5, { align: "center", bold: true, color: [1, 1, 1] });
    return c;
}
/* ORTAK KATEGORİ BAŞLIĞI: fiyat listesi ve tüm katalog şablonları aynı koyu bant + vurgu çizgisini kullanır. */
let pdfAccentCurrent = [0.79, 0.64, 0.15];
function pdfCategoryBar(name, x, y, w, h, fs = 11.8) {
    let c = pdfRect(x, y, w, h, [0.05, 0.05, 0.05]);
    c += pdfRect(x, y, w, 1.6, pdfAccentCurrent);
    c += pdfTextOp(name, x + w / 2, y + (h - fs) / 2 + 1.1, fs, { align: "center", bold: true, maxWidth: w - 10, maxLines: 1, color: [1, 1, 1] });
    return c;
}
function pdfCategoryBlock(category, lang, x, y, w) {
    const h = PDF_LAYOUT.categoryH;
    let c = pdfRect(x, y, w, h, [0.05, 0.05, 0.05]);
    c += pdfRect(x, y, w, 1.6, pdfAccentCurrent);
    c += pdfTextOp(pdfText(lang, category.name, category.name_en, category.name), x + w / 2, y + 5.1, 11.8, { align: "center", bold: true, maxWidth: w - 10, maxLines: 1, color: [1, 1, 1] });
    return c;
}
/* ORTAK KART İSKELETİ (takım tablosu + klasik katalog): yumuşak gölgeli kart, bej görsel paneli, ad + altın çizgi */
function pdfTblFrame(item, lang, x, y, w, h, asset, id, acc, nameRight, imgW = PDF_TBL.imgW) {
    const top = y + h, title = pdfText(lang, item.name, item.name_en, item.name) || "—";
    let c = pdfSoftCard(x, y, w, h, 7);
    c += pdfRoundRect(x + 5, y + 5, imgW - 10, h - 10, 5, PDF_IMG_BG);
    if (asset)
        c += pdfDrawImage("Im" + id, asset, x + 10, y + 9, imgW - 20, h - 18, true);
    else
        c += pdfTextOp(lang === "EN" ? "NO PRODUCT IMAGE" : "ÜRÜN GÖRSELİ YOK", x + imgW / 2, y + h / 2 - 3, 7.4, { align: "center", bold: true, color: [0.62, 0.62, 0.62], maxWidth: imgW - 20 });
    const tx = x + imgW + 8, nameMax = nameRight - tx;
    c += pdfTextOp(title, tx, top - 16, 11.6, { bold: true, maxWidth: nameMax, maxLines: 1, color: [0.06, 0.06, 0.06] });
    c += pdfRect(tx, top - 22.5, 20, 1.5, acc);
    c += pdfLine(tx + 24, top - 21.75, nameRight, top - 21.75, [0.89, 0.885, 0.875], .4);
    return { c, tx, top };
}
function pdfTblCaption(text, x, y, align) { return pdfTextOp(text, x, y, 6.3, { align, bold: true, color: [0.55, 0.55, 0.55], maxLines: 1 }); }
function pdfProductBlock(data, category, item, lang, x, y, w, h, asset, id) {
    const T = PDF_TBL, acc = pdfCatalogAccent(data), rows = pdfVisibleRows(item, lang);
    const setX = x + w - 8 - T.setW, right = setX - 10;
    /* TL vade açıksa: görsel paneli biraz daralır, fiyat sütunu PEŞİN + VADELİ olarak ikiye ayrılır. */
    const V = !!pdfVade, imgW = V ? 150 : T.imgW;
    /* Takımda birden çok modülde paket/m³/kg varsa toplamı ürün adının sağında; ad için yer daralır. */
    const withLogi = rows.filter(r => !r.__more && logiHas(r)), sumTxt = withLogi.length > 1 ? logiText(logiSum(pdfRowsForItem(item)), lang) : "";
    const rowLogi = withLogi.length > 0;
    let { c, tx, top } = pdfTblFrame(item, lang, x, y, w, h, asset, id, acc, right, imgW);
    /* Sütunlar: Modül · G/D/Y · Birim fiyat (sağa yaslı) [· Vadeli] */
    const vadeW = V ? 60 : 0, unitW = V ? 60 : 74, dimW = V ? 66 : 78, third = dimW / 3, vx = right, ux = right - vadeW, dx = ux - unitW - dimW, modW = dx - tx - 6;
    const capY = top - 31;
    c += pdfTblCaption(lang === "EN" ? "MODULE" : "MODÜL", tx, capY, "left");
    ["G/W", "D/D", "Y/H"].forEach((t, j) => { c += pdfTblCaption(t, dx + third * (j + .5), capY, "center"); });
    c += pdfTblCaption(V ? (lang === "EN" ? "CASH" : "PEŞİN") : (lang === "EN" ? "UNIT PRICE" : "BİRİM FİYAT"), ux, capY, "right");
    if (V)
        c += pdfTblCaption(pdfVade.label.toLocaleUpperCase(lang === "EN" ? "en-US" : "tr-TR"), vx, capY, "right");
    const rowsTop = top - T.headTop, rowH = Math.min(rowLogi ? 21 : 15.5, (rowsTop - (y + T.pad)) / Math.max(rows.length, 1));
    for (let i = 0; i < rows.length; i++) {
        const rt = rowsTop - i * rowH, rb = rt - rowH, part = rows[i] || {};
        if (i % 2 === 0)
            c += pdfRoundRect(tx - 4, rb + .8, right - tx + 8, rowH - 1.6, 3, [0.972, 0.969, 0.962]);
        const fs = Math.min(8.8, Math.max(7, (rowLogi ? 14.5 : rowH) * 0.6)), cy = rb + rowH / 2 - fs * 0.34;
        const mod = pdfText(lang, part.name, part.name_en, part.name) || "—";
        if (part.__more) {
            c += pdfTextOp(mod, tx, cy, fs, { bold: true, maxWidth: right - tx, maxLines: 1, color: [0.45, 0.45, 0.45] });
            continue;
        }
        const pl = logiText(part, lang);
        c += pdfTextOp(mod, tx, pl ? cy + 3.6 : cy, fs, { bold: true, maxWidth: modW, maxLines: 1, color: [0.1, 0.1, 0.1] });
        if (pl)
            c += pdfTextOp(pl, tx, cy - 4.6, 6.4, { maxWidth: modW, maxLines: 1, color: [0.45, 0.45, 0.45] });
        pdfDimsParts(part.dims).forEach((v, j) => { c += pdfTextOp(v, dx + third * (j + .5), cy, fs - .3, { align: "center", maxWidth: third - 2, maxLines: 1, color: [0.3, 0.3, 0.3] }); });
        const muted = part.contactOnly || part.amount === null || part.amount === undefined;
        const price = muted ? (lang === "EN" ? "Contact us" : "İletişime geçin") : pdfMoney(data, part.amount);
        c += pdfTextOp(price, ux, cy, muted ? fs - 1 : (V ? fs : fs + .2), { align: "right", bold: !muted, maxWidth: unitW - 2, maxLines: 1, color: muted ? [0.5, 0.5, 0.5] : [0.06, 0.06, 0.06] });
        const vp = muted ? "" : pdfVadeMoney(data, part.amount);
        if (vp)
            c += pdfTextOp(vp, vx, cy, fs - .4, { align: "right", maxWidth: vadeW - 2, maxLines: 1, color: [0.42, 0.35, 0.15] });
    }
    /* Takım fiyatı: sağda ayrı, altın vurgulu panel */
    const ph = h - 12, py = y + 6, mid = py + ph / 2;
    c += pdfRoundRect(setX, py, T.setW, ph, 6, [0.99, 0.982, 0.958], [acc[0] * .6 + .4, acc[1] * .6 + .4, acc[2] * .6 + .4], .6);
    const total = pdfTotal(data, item, lang), isMoney = /\d/.test(total);
    const vTotal = (V && isMoney) ? pdfVadeMoney(data, priceTotal(item?.price)) : "", sh = vTotal ? 10 : 0;
    c += pdfTextOp(lang === "EN" ? "SET PRICE" : "TAKIM FİYATI", setX + T.setW / 2, mid + 9 + sh, 6.5, { align: "center", bold: true, color: [0.5, 0.47, 0.4], maxWidth: T.setW - 8, maxLines: 1 });
    c += pdfRect(setX + T.setW / 2 - 8, mid + 4.5 + sh, 16, 1.1, acc);
    c += pdfTextOp(total, setX + T.setW / 2, mid - 9 + sh, isMoney ? 12.4 : 8.6, { align: "center", bold: true, maxWidth: T.setW - 8, maxLines: 1, color: isMoney ? [acc[0] * .72, acc[1] * .72, acc[2] * .72] : [0.45, 0.45, 0.45] });
    if (vTotal) {
        c += pdfTextOp(pdfVade.label.toLocaleUpperCase(lang === "EN" ? "en-US" : "tr-TR"), setX + T.setW / 2, mid - 15, 5.8, { align: "center", bold: true, color: [0.6, 0.57, 0.5], maxWidth: T.setW - 8, maxLines: 1 });
        c += pdfTextOp(vTotal, setX + T.setW / 2, mid - 25, 9.4, { align: "center", bold: true, maxWidth: T.setW - 8, maxLines: 1, color: [0.42, 0.35, 0.15] });
    }
    /* Modüllerde paket/m³/kg varsa takımın toplamı panelin altında. */
    if (sumTxt)
        c += pdfTextOp(sumTxt, setX + T.setW / 2, py + 6, 5.8, { align: "center", maxWidth: T.setW - 8, maxLines: 1, color: [0.45, 0.43, 0.38] });
    return c;
}
async function renderPdfCoverPage(data, lang, titleOverride) {
    /* Panelden tam sayfa giriş kapağı yüklendiyse sayfa yalnızca o görselden oluşur (logo / başlık eklenmez). */
    const fullCover = await renderPdfFullImagePage(data.pdf?.coverImage);
    if (fullCover)
        return fullCover;
    const L = PDF_LAYOUT, W = L.W, H = L.H;
    let content = pdfRect(0, 0, W, H, [0.02, 0.02, 0.02]);
    content += pdfRect(7, 7, W - 14, H - 14, null, [0.55, 0.55, 0.55], .55);
    content += pdfRect(11, 11, W - 22, H - 22, null, [0.22, 0.22, 0.22], .55);
    const images = new Map(), logoSrc = pdfImageSource(data.pdf?.coverLogo?.src);
    const loaded = await pdfLogoImageAsset(logoSrc);
    if (loaded) {
        const logo = { ...loaded, id: 1 };
        images.set("__coverLogo__", logo);
        content += pdfDrawImage("Im1", logo, 55, 365, 485, 205, true);
    }
    else {
        /* Logo yoksa firma adı kapağın ortasında büyük harflerle yazılır. */
        const name = pdfCompanyName(data, lang);
        if (name) {
            const lines = pdfWrapText(name, 470, 30, 2).length || 1;
            content += pdfTextOp(name, W / 2, 467.5 + (lines - 1) * 17 - 10, 30, { align: "center", bold: true, maxWidth: 470, maxLines: 2, leading: 34, color: [1, 1, 1] });
        }
    }
    const cur = data.currency?.selected === "USD" ? "USD" : data.currency?.selected === "EUR" ? "EUR" : "TL";
    const autoTitle = lang === "EN" ? `${cur} PRICE LIST` : `${cur} FİYAT LİSTESİ`;
    /* Yönetimde yazılan başlık Türkçedir; İngilizce PDF'te otomatik İngilizce başlık kullanılır (ayrı "title_en" varsa o). */
    const defTitle = /^(\d{4}(-\d+)?\s*)?(TL|USD|EUR)?\s*F[İI]YAT L[İI]STES[İI]$/i.test(String(data.pdf?.title || "").trim());
    const title = titleOverride || (lang === "EN" ? (data.pdf?.title_en || autoTitle) : ((data.pdf?.title && !defTitle) ? data.pdf.title : autoTitle));
    content += pdfTextOp(title, W - 42, 55, 17.5, { align: "right", bold: true, maxWidth: 455, maxLines: 2, color: [1, 1, 1] });
    /* Ekranda girili iskonto oranı varsa kapakta şeffafça belirtilir (fiyatlar zaten indirimli basılır). */
    const discPct = Math.round(Number(data.__discount) || 0);
    if (discPct > 0) {
        const dnote = lang === "EN" ? `${discPct}% discount applied` : `Fiyatlara %${discPct} iskonto uygulanmıştır`;
        content += pdfTextOp(dnote, W - 42, 76, 9.5, { align: "right", maxWidth: 455, maxLines: 1, color: [0.85, 0.72, 0.30] });
    }
    /* TL vade açıksa oran kapakta açıkça yazılır. */
    if (pdfVade && !titleOverride) {
        const vnote = lang === "EN" ? `Installment prices include a ${pdfVade.rate}% term difference` : `${pdfVade.label} fiyatlara ${vadePctText(pdfVade.rate)} vade farkı uygulanmıştır`;
        content += pdfTextOp(vnote, W - 42, discPct > 0 ? 91 : 76, 9.5, { align: "right", maxWidth: 455, maxLines: 1, color: [0.85, 0.72, 0.30] });
    }
    return { content, images, pageNo: null };
}
/* ==================== KAPANIŞ SAYFASI + TAM SAYFA KAPAK GÖRSELLERİ ==================== */
/* Firma adı (logo yoksa kapak / kapanışta yazı olarak). Koda firma adı gömülmez; panel verisinden gelir. */
function pdfCompanyName(data, lang) {
    const raw = lang === "EN" ? (data?.siteName_en || data?.siteName) : (data?.siteName || data?.siteName_en);
    const s = safeContactText(raw, 120);
    return lang === "EN" ? s.toUpperCase() : s.toLocaleUpperCase("tr-TR");
}
/* Kapanış sayfasındaki iletişim satırları: boş / geçersiz olanlar hiç gösterilmez. */
function pdfClosingContacts(data) {
    const rows = [];
    const phone = safeContactText(data?.phone, 80);
    if (phone)
        rows.push({ type: "phone", text: phone });
    const web = safeContactText(data?.pdf?.website, 200).replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (web)
        rows.push({ type: "web", text: web });
    const ig = instagramHandle(data?.pdf?.instagram);
    if (ig)
        rows.push({ type: "instagram", text: ig });
    const mail = contactEmail(data?.pdf?.email);
    if (mail)
        rows.push({ type: "email", text: mail });
    return rows.slice(0, 4);
}
function pdfColorOps(c, stroke) { return `${c[0]} ${c[1]} ${c[2]} ${stroke ? "RG" : "rg"}`; }
function pdfEllipsePath(cx, cy, rx, ry) {
    const kx = .5523 * rx, ky = .5523 * ry, f = v => v.toFixed(2);
    return `${f(cx + rx)} ${f(cy)} m ${f(cx + rx)} ${f(cy + ky)} ${f(cx + kx)} ${f(cy + ry)} ${f(cx)} ${f(cy + ry)} c ${f(cx - kx)} ${f(cy + ry)} ${f(cx - rx)} ${f(cy + ky)} ${f(cx - rx)} ${f(cy)} c ${f(cx - rx)} ${f(cy - ky)} ${f(cx - kx)} ${f(cy - ry)} ${f(cx)} ${f(cy - ry)} c ${f(cx + kx)} ${f(cy - ry)} ${f(cx + rx)} ${f(cy - ky)} ${f(cx + rx)} ${f(cy)} c h`;
}
function pdfRoundRectPath(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    const k = .5523 * r, f = v => v.toFixed(2);
    return `${f(x + r)} ${f(y)} m ${f(x + w - r)} ${f(y)} l ${f(x + w - r + k)} ${f(y)} ${f(x + w)} ${f(y + r - k)} ${f(x + w)} ${f(y + r)} c ${f(x + w)} ${f(y + h - r)} l ${f(x + w)} ${f(y + h - r + k)} ${f(x + w - r + k)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} c ${f(x + r)} ${f(y + h)} l ${f(x + r - k)} ${f(y + h)} ${f(x)} ${f(y + h - r + k)} ${f(x)} ${f(y + h - r)} c ${f(x)} ${f(y + r)} l ${f(x)} ${f(y + r - k)} ${f(x + r - k)} ${f(y)} ${f(x + r)} ${f(y)} c h`;
}
/* İletişim ikonu: vurgu renginde dolu daire + içinde PDF çizim komutlarıyla vektör ikon (görsel dosyası yok). */
function pdfContactIcon(type, cx, cy, acc, ink) {
    const f = v => v.toFixed(2), lw = 1.15;
    const st = path => `${pdfColorOps(ink, true)} ${lw.toFixed(2)} w ${path} S\n`;
    let c = `q 1 j 1 J\n${pdfColorOps(acc)} ${pdfEllipsePath(cx, cy, 11, 11)} f\n`;
    if (type === "phone") {
        c += st(pdfRoundRectPath(cx - 3.7, cy - 6.2, 7.4, 12.4, 1.8));
        c += st(`${f(cx - 1.2)} ${f(cy - 4.1)} m ${f(cx + 1.2)} ${f(cy - 4.1)} l`);
    }
    else if (type === "web") {
        const r = 5.8, d = 2.2, hw = Math.sqrt(r * r - d * d);
        c += st(pdfEllipsePath(cx, cy, r, r));
        c += st(pdfEllipsePath(cx, cy, 2.4, r));
        c += st(`${f(cx - hw)} ${f(cy + d)} m ${f(cx + hw)} ${f(cy + d)} l`);
        c += st(`${f(cx - hw)} ${f(cy - d)} m ${f(cx + hw)} ${f(cy - d)} l`);
    }
    else if (type === "instagram") {
        c += st(pdfRoundRectPath(cx - 5.6, cy - 5.6, 11.2, 11.2, 3.3));
        c += st(pdfEllipsePath(cx, cy, 2.6, 2.6));
        c += `${pdfColorOps(ink)} ${pdfEllipsePath(cx + 3.1, cy + 3.1, .8, .8)} f\n`;
    }
    else if (type === "email") {
        c += st(pdfRoundRectPath(cx - 6.2, cy - 4.4, 12.4, 8.8, .9));
        c += st(`${f(cx - 6.2)} ${f(cy + 4.1)} m ${f(cx)} ${f(cy - .6)} l ${f(cx + 6.2)} ${f(cy + 4.1)} l`);
    }
    return c + "Q\n";
}
/* Tam sayfa görsel (giriş / kapanış kapağı): orantı korunur, sayfayı kaplar, taşan kısım kırpılır. */
async function renderPdfFullImagePage(value) {
    const src = safePdfPageImageSource(value);
    if (!src)
        return null;
    const loaded = await pdfImageAsset(src, { max: 2400, quality: .9 });
    if (!loaded)
        return null;
    const W = PDF_LAYOUT.W, H = PDF_LAYOUT.H, asset = { ...loaded, id: 1 }, images = new Map();
    images.set("__fullPage__", asset);
    const content = pdfRect(0, 0, W, H, [0.02, 0.02, 0.02]) + pdfDrawImageCover("Im1", asset, 0, 0, W, H, .5);
    return { content, images, pageNo: null };
}
/* KAPANIŞ SAYFASI (katalog + fiyat listesi): kapakla aynı siyah zemin ve çerçeveler, ortada logo (yoksa firma adı),
   vurgu çizgisi, teşekkür yazısı, ikonlu iletişim satırları ve en altta isteğe bağlı alt not. */
async function renderPdfClosingPage(data, lang) {
    const fullPage = await renderPdfFullImagePage(data.pdf?.closingImage);
    if (fullPage)
        return fullPage;
    const L = PDF_LAYOUT, W = L.W, H = L.H, acc = pdfCatalogAccent(data), ink = pdfHexToRgb(inkOn(safeHexColor(data?.theme?.accent, "")), [1, 1, 1]);
    let c = pdfRect(0, 0, W, H, [0.02, 0.02, 0.02]);
    c += pdfRect(7, 7, W - 14, H - 14, null, [0.55, 0.55, 0.55], .55);
    c += pdfRect(11, 11, W - 22, H - 22, null, [0.22, 0.22, 0.22], .55);
    const images = new Map();
    const loaded = await pdfLogoImageAsset(pdfImageSource(data.pdf?.coverLogo?.src));
    const rows = pdfClosingContacts(data);
    const name = loaded ? "" : pdfCompanyName(data, lang);
    const nameSize = 28, nameLead = 32, nameLines = name ? (pdfWrapText(name, 440, nameSize, 2).length || 1) : 0;
    const logoBox = loaded ? pdfFitRect(loaded.width || 1, loaded.height || 1, 0, 0, 360, 150) : null;
    const topH = logoBox ? logoBox.h : (nameLines ? nameLines * nameLead : 0);
    const ROW = 34, rowsH = rows.length ? 52 + (rows.length - 1) * ROW + 11 : 4;
    const total = topH + (topH ? 26 : 0) + 2 + 24 + rowsH;
    const top = H / 2 + total / 2 + 12;
    let bottom = top;
    if (logoBox) {
        const logo = { ...loaded, id: 1 };
        images.set("__coverLogo__", logo);
        c += pdfDrawImage("Im1", logo, W / 2 - logoBox.w / 2, top - logoBox.h, logoBox.w, logoBox.h, false);
        bottom = top - logoBox.h;
    }
    else if (name) {
        c += pdfTextOp(name, W / 2, top - nameSize * .78, nameSize, { align: "center", bold: true, maxWidth: 440, maxLines: 2, leading: nameLead, color: [1, 1, 1] });
        bottom = top - topH;
    }
    const lineY = bottom - (topH ? 26 : 0);
    c += pdfRect(W / 2 - 24, lineY, 48, 2, acc);
    const thanksY = lineY - 24;
    c += pdfTextOp(lang === "EN" ? "THANK YOU FOR CHOOSING US" : "BİZİ TERCİH ETTİĞİNİZ İÇİN TEŞEKKÜR EDERİZ", W / 2, thanksY, 9, { align: "center", bold: true, maxWidth: W - 90, maxLines: 1, color: [0.62, 0.62, 0.62] });
    if (rows.length) {
        const TS = 13, maxText = 380;
        const textW = Math.min(maxText, Math.max(...rows.map(r => pdfFontWidth(pdfNormalizeText(r.text), TS))));
        const blockW = 22 + 14 + textW, x0 = W / 2 - blockW / 2;
        rows.forEach((r, i) => {
            const cy = thanksY - 52 - i * ROW;
            c += pdfContactIcon(r.type, x0 + 11, cy, acc, ink);
            c += pdfTextOp(r.text, x0 + 36, cy - TS * .35, TS, { maxWidth: maxText, maxLines: 1, color: [1, 1, 1] });
        });
    }
    const note = safeContactText(data.pdf?.closingNote, 120);
    if (note)
        c += pdfTextOp(note, W / 2, 34, 8, { align: "center", bold: true, maxWidth: W - 90, maxLines: 1, color: [0.5, 0.5, 0.5] });
    return { content: c, images, pageNo: null };
}
/* Görseli kutuyu tamamen dolduracak şekilde orantılı büyütür ve taşan kısmı kırpar (object-fit: cover).
   Önceki sürüm görseli sayfaya zorla geriyordu → yatay fotoğraflar dikey sayfada bozuk görünüyordu. */
function pdfDrawImageCover(name, asset, x, y, w, h, focusY = .5) {
    if (!asset)
        return "";
    const iw = asset.width || 1, ih = asset.height || 1, sc = Math.max(w / iw, h / ih), dw = iw * sc, dh = ih * sc;
    const dx = x + (w - dw) / 2, dy = y + (h - dh) * (1 - focusY);
    return `q\n${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re W n\n${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${dx.toFixed(2)} ${dy.toFixed(2)} cm\n/${name} Do\nQ\n`;
}
/* KATEGORİ KAPAĞI
   Üstte tam genişlik fotoğraf (kırpılarak, asla gerilmeden), altta koyu panelde kategori adı ve ürün sayısı.
   Kapak görseli olmayan kategorilerde fotoğraf alanında marka logosu yer alır (katalog tutarlı kalır). */
const PDF_COVER_INK = [5 / 255, 5 / 255, 5 / 255]; /* logo JPEG arka planıyla birebir aynı ton: logo kutusu görünmez */
async function renderPdfCategoryCoverPage(data, lang, category, pageNo) {
    const L = PDF_LAYOUT, W = L.W, H = L.H, acc = pdfCatalogAccent(data), M = 44;
    const images = new Map();
    let c = pdfRect(0, 0, W, H, PDF_COVER_INK);
    const photoH = Math.round(H * 0.63), photoY = H - photoH;
    const src = pdfImageSource(category?.coverImage);
    const asset = src ? await pdfImageAsset(src, { max: 2000, quality: .88 }) : null;
    const logo = await pdfLogoImageAsset(pdfImageSource(data.pdf?.coverLogo?.src));
    if (asset) {
        const a = { ...asset, id: 1 };
        images.set("__categoryCover__", a);
        c += pdfDrawImageCover("Im1", a, 0, photoY, W, photoH, .5);
    }
    else if (logo) {
        /* Fotoğrafsız kapak: üst alanda ortalanmış marka logosu (zemin logo zeminiyle aynı ton) */
        const lg = { ...logo, id: 3 };
        images.set("__categoryHeroLogo__", lg);
        c += pdfDrawImage("Im3", lg, W * 0.2, photoY + photoH * 0.32, W * 0.6, photoH * 0.36, true);
    }
    c += pdfRect(0, photoY - 3, W, 3, acc);
    /* Panel: kategori adı + ürün sayısı, panelin ortasında dikey hizalı */
    const name = pdfText(lang, category?.name, category?.name_en, category?.name || "") || "";
    const fs = 32, lead = 37, nameW = W - 2 * M, nl = pdfWrapText(name, nameW, fs, 2).length;
    const blockH = nl * lead + 34, panelTop = photoY - 3, panelBottom = 80;
    let y = panelTop - ((panelTop - panelBottom) - blockH) / 2 - fs * 0.8;
    c += pdfTextOp(name, M, y, fs, { bold: true, maxWidth: nameW, maxLines: 2, leading: lead, color: [1, 1, 1] });
    y -= (nl - 1) * lead + 26;
    const count = (category?.items || []).filter(Boolean).length;
    c += pdfRect(M, y + 8, 32, 1.8, acc);
    c += pdfTextOp(lang === "EN" ? `${count} ${count === 1 ? "PRODUCT" : "PRODUCTS"}` : `${count} ÜRÜN`, M + 42, y + 4.5, 9.5, { bold: true, color: [0.72, 0.72, 0.72] });
    /* Alt şerit: logo, web sitesi, sayfa numarası */
    c += pdfLine(M, 74, W - M, 74, [0.16, 0.16, 0.16], .5);
    if (logo) {
        const lg = { ...logo, id: 2 };
        images.set("__categoryLogo__", lg);
        c += pdfDrawImage("Im2", lg, M - 4, 26, 130, 40, true);
    }
    else
        c += pdfTextOp(String(data.siteName || "").toUpperCase(), M, 40, 10, { bold: true, color: [1, 1, 1] });
    const site = data.pdf?.website || data.pdf?.footer || "";
    if (site)
        c += pdfTextOp(site, W - M, 40, 8, { align: "right", maxWidth: 220, maxLines: 1, color: [0.6, 0.6, 0.6] });
    if (data.pdf?.showPageNumbers !== false)
        c += pdfTextOp(String(pageNo), W - M, 26, 8, { align: "right", bold: true, color: [0.45, 0.45, 0.45] });
    return { content: c, images, pageNo };
}
async function renderPdfCatalogPage(data, lang, blocks, pageNo, preparedImages, opts = {}) {
    const L = PDF_LAYOUT, W = L.W, H = L.H;
    let content = pdfPageChrome(data, pageNo), images = new Map(), yTop = L.top, imageId = 1;
    const imageMap = preparedImages || new Map();
    for (const block of blocks) {
        if (block.type === "category") {
            const h = L.categoryH;
            content += pdfCategoryBlock(block.category, lang, L.left, H - yTop - h, L.cardW);
            yTop += h + L.gap;
            continue;
        }
        if (block.type === "sizeRow" || block.type === "modelRow") {
            const acc = pdfHexToRgb(data?.theme?.accent), useImg = src => { if (!src)
                return null; const prep = imageMap.get(src); if (!prep)
                return null; let a = images.get(src); if (!a) {
                a = { ...prep, id: imageId++ };
                images.set(src, a);
            } return a; };
            const h = block.h, y = H - yTop - h;
            if (block.type === "sizeRow") {
                const w = pdfSizeColW();
                block.items.forEach((it, i) => { content += pdfSizeCard(data, it, lang, L.left + i * (w + PDF_SIZE.gap), y, w, h, useImg(pdfProductImageSource(it, data)), acc); });
            }
            else
                content += pdfModelRow(data, block.item, lang, L.left, y, L.cardW, h, useImg, acc);
            yTop += h + L.gap;
            continue;
        }
        const item = block.item, h = (opts.cardHeight || pdfCardHeight)(item);
        if (yTop + h > H - L.bottom)
            console.warn("PDF: ürün sayfa sınırını aşıyor, yine de basılıyor:", item?.id);
        const src = pdfProductImageSource(item, data), preparedAsset = src ? imageMap.get(src) : null;
        /* Aynı görseli kullanan ürünler aynı XObject'i paylaşır (önceden ikinci ürün ilkinin görsel referansını bozuyordu). */
        let asset = null;
        if (preparedAsset) {
            asset = images.get(src) || { ...preparedAsset, id: imageId++ };
            images.set(src, asset);
        }
        const y = H - yTop - h;
        content += (opts.catalog ? pdfCatalogListBlock : pdfProductBlock)(data, block.category, item, lang, L.left, y, L.cardW, h, asset, asset?.id || imageId++);
        yTop += h + L.gap;
    }
    content += pdfTextOp(data.pdf?.footer || data.pdf?.website || "", L.left, 14, 7.5, { maxWidth: 260, maxLines: 1 });
    return { content, images, pageNo };
}
/* ==================== FİYAT LİSTESİ: ÖLÇÜ KARTLARI (A1) & MODEL SIRASI (B1) ==================== */
const PDF_SIZE = { cols: 3, gap: 8, imgH: 120, rowH: 15.5, headH: 12 };
const PDF_MODEL = { maxCols: 5, minCols: 4, headH: 36, imgH: 88, cellH: 144 };
function pdfVariantRows(item, lang) {
    const p = normalizePrice(item?.price);
    if (p.parts.length)
        return p.parts.map(part => ({ name: pdfText(lang, part.name, part.name_en, part.name) || "", dims: part.dims || "", amount: part.amount, contactOnly: !!part.contactOnly || part.amount === null, image: part.image || null, ...logiOf(part) }));
    const amt = p.manualTotal !== null && p.manualTotal !== undefined ? p.manualTotal : priceTotal(p);
    return [{ name: "", dims: item?.dims || "", amount: amt, contactOnly: amt === null, image: null, ...logiOf(item) }];
}
/* Fiyatsız katalogda ölçü kartları / model sıraları fiyat göstermez. */
let pdfNoPrice = false;
/* TL vade (yalnızca fiyat listesi): { rate, label } ya da null. buildPriceListPDF kurar, bitince sıfırlar. */
let pdfVade = null;
function pdfVadeMoney(data, amount) {
    if (!pdfVade || amount === null || amount === undefined || amount === "" || !Number.isFinite(Number(amount)))
        return "";
    return formatVadeByData(data, amount) || "";
}
/* Fiyatsız katalogda açıklamadaki fiyatla ilgili cümleler ("… dahil fiyatlar", "130.200 TL" vb.) gösterilmez. */
const PDF_PRICE_TEXT = /fiyat|price|₺|\bTL\b|\bUSD\b|\bEUR\b|[$€]|\d{1,3}(?:\.\d{3})+(?:,\d+)?/i;
function pdfDescText(lang, item) {
    let t = pdfText(lang, item?.desc, item?.desc_en, item?.desc) || "";
    if (pdfNoPrice && t)
        t = t.split(/\n+/).map(line => line.split(/(?<=[.!?;])\s+(?=\S)/).filter(seg => !PDF_PRICE_TEXT.test(seg)).join(" ")).filter(x => x.trim()).join("\n").trim();
    return t;
}
function pdfVariantPrice(data, r, lang) {
    if (pdfNoPrice)
        return { text: "", muted: true, none: true };
    if (r.contactOnly || r.amount === null || r.amount === undefined)
        return { text: lang === "EN" ? "Ask for price" : "Fiyat sorunuz", muted: true };
    return { text: pdfMoney(data, r.amount), muted: false };
}
function pdfSizeRowH(item, lang) { return PDF_SIZE.rowH + ((pdfVade || (!pdfNoPrice && pdfVariantRows(item, lang).some(logiHas))) ? 9 : 0); }
function pdfSizeColW() { const L = PDF_LAYOUT; return (L.cardW - PDF_SIZE.gap * (PDF_SIZE.cols - 1)) / PDF_SIZE.cols; }
function pdfSizeCardHeight(item, lang) {
    const w = pdfSizeColW(), name = pdfText(lang, item.name, item.name_en, item.name) || "—";
    const nl = pdfWrapText(name, w - 18, 10.2, 2).length, rows = pdfVariantRows(item, lang).length;
    return Math.ceil(PDF_SIZE.imgH + 15 + (nl - 1) * 12.4 + 13 + PDF_SIZE.headH + rows * pdfSizeRowH(item, lang) + 8);
}
function pdfSizeRowBlocks(items, lang) {
    const out = [];
    for (let i = 0; i < items.length; i += PDF_SIZE.cols) {
        const chunk = items.slice(i, i + PDF_SIZE.cols);
        out.push({ type: "sizeRow", items: chunk, h: Math.max(...chunk.map(it => pdfSizeCardHeight(it, lang))) });
    }
    return out;
}
/* Yuvarlak köşeli dikdörtgen (Bezier) — kartlara daha zarif bir görünüm verir. */
function pdfRoundRect(x, y, w, h, r, fill = null, stroke = null, lw = .5) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    const k = .5523 * r, f = v => v.toFixed(2);
    const path = `${f(x + r)} ${f(y)} m ${f(x + w - r)} ${f(y)} l ${f(x + w - r + k)} ${f(y)} ${f(x + w)} ${f(y + r - k)} ${f(x + w)} ${f(y + r)} c ${f(x + w)} ${f(y + h - r)} l ${f(x + w)} ${f(y + h - r + k)} ${f(x + w - r + k)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} c ${f(x + r)} ${f(y + h)} l ${f(x + r - k)} ${f(y + h)} ${f(x)} ${f(y + h - r + k)} ${f(x)} ${f(y + h - r)} c ${f(x)} ${f(y + r)} l ${f(x)} ${f(y + r - k)} ${f(x + r - k)} ${f(y)} ${f(x + r)} ${f(y)} c h`;
    let c = "";
    if (fill)
        c += `${fill[0]} ${fill[1]} ${fill[2]} rg ${path} f\n`;
    if (stroke)
        c += `${stroke[0]} ${stroke[1]} ${stroke[2]} RG ${lw.toFixed(2)} w ${path} S\n`;
    return c;
}
/* Hafif gölgeli kart zemini */
function pdfSoftCard(x, y, w, h, r = 7) {
    return pdfRoundRect(x + 1.2, y - 1.6, w, h, r, [0.9, 0.895, 0.885]) + pdfRoundRect(x, y, w, h, r, [1, 1, 1], [0.84, 0.83, 0.82], .5);
}
const PDF_IMG_BG = [0.957, 0.953, 0.944];
/* A1 — ÖLÇÜ KARTI: üstte görsel, altında ad, ince altın çizgi ve ölçü → fiyat satırları */
function pdfSizeCard(data, item, lang, x, y, w, h, asset, acc) {
    const top = y + h, ih = PDF_SIZE.imgH, pad = 10;
    let c = pdfSoftCard(x, y, w, h, 7);
    c += pdfRoundRect(x + 5, top - 5 - ih + 4, w - 10, ih - 4, 5, PDF_IMG_BG);
    if (asset)
        c += pdfDrawImage("Im" + asset.id, asset, x + 11, top - ih + 6, w - 22, ih - 16, true);
    else
        c += pdfTextOp(lang === "EN" ? "NO PRODUCT IMAGE" : "ÜRÜN GÖRSELİ YOK", x + w / 2, top - ih / 2 - 3, 7.4, { align: "center", bold: true, color: [0.62, 0.62, 0.62], maxWidth: w - 14 });
    let ty = top - ih - 16;
    const name = pdfText(lang, item.name, item.name_en, item.name) || "—", nl = pdfWrapText(name, w - 2 * pad, 10.2, 2).length;
    c += pdfTextOp(name, x + pad, ty, 10.2, { bold: true, maxWidth: w - 2 * pad, maxLines: 2, leading: 12.4, color: [0.06, 0.06, 0.06] });
    ty -= (nl - 1) * 12.4 + 8;
    c += pdfRect(x + pad, ty, 18, 1.5, acc);
    ty -= 5;
    c += pdfTextOp(lang === "EN" ? "SIZE (cm)" : "ÖLÇÜ (cm)", x + pad, ty - 8, 6.4, { bold: true, color: [0.55, 0.55, 0.55] });
    if (!pdfNoPrice)
        c += pdfTextOp(pdfVade ? (lang === "EN" ? "CASH / " : "PEŞİN / ") + pdfVade.label.toLocaleUpperCase(lang === "EN" ? "en-US" : "tr-TR") : (lang === "EN" ? "PRICE" : "FİYAT"), x + w - pad, ty - 8, 6.4, { align: "right", bold: true, color: [0.55, 0.55, 0.55], maxWidth: w * .6, maxLines: 1 });
    ty -= PDF_SIZE.headH;
    const rowH = pdfSizeRowH(item, lang), tall = rowH > PDF_SIZE.rowH;
    pdfVariantRows(item, lang).forEach((r, i) => {
        /* Uzun satır (vade veya paket bilgisi): peşin üstte, vadeli altında; paket bilgisi ölçünün altında. */
        const rl = pdfNoPrice ? "" : logiText(r, lang);
        const rowTop = ty - i * rowH, cy = rl ? rowTop - 10.5 : tall ? rowTop - rowH / 2 - 3 : rowTop - rowH + 5;
        if (i % 2 === 0)
            c += pdfRoundRect(x + pad - 4, rowTop - rowH + 1, w - 2 * pad + 8, rowH - 2, 3, [0.972, 0.969, 0.962]);
        const pr = pdfVariantPrice(data, r, lang), prSize = pr.muted ? 7.2 : 9.2, prW = pr.none ? 0 : pdfFontWidth(pr.text, prSize) + 4;
        const dl = String(r.dims || "").trim() ? pdfDimsLabel(r.dims) : "", main = dl || r.name || "—", sub = dl ? r.name : "";
        const mainMax = Math.max(30, w - 2 * pad - prW - 6), mainW = Math.min(pdfFontWidth(main, 8.8) + 3, mainMax);
        c += pdfTextOp(main, x + pad, cy, 8.8, { bold: true, maxWidth: mainMax, maxLines: 1, color: [0.1, 0.1, 0.1] });
        if (sub) {
            const subMax = w - 2 * pad - prW - 6 - mainW - 4;
            if (subMax > 18)
                c += pdfTextOp(sub, x + pad + mainW + 3, cy, 7.2, { maxWidth: subMax, maxLines: 1, color: [0.48, 0.48, 0.48] });
        }
        const vp = (pr.none || pr.muted) ? "" : pdfVadeMoney(data, r.amount);
        if (rl)
            c += pdfTextOp(rl, x + pad, rowTop - 19.5, 6.6, { maxWidth: Math.max(30, w - 2 * pad - prW - 6), maxLines: 1, color: [0.45, 0.45, 0.45] });
        if (!pr.none)
            c += pdfTextOp(pr.text, x + w - pad, (vp || rl) ? rowTop - 10.5 : cy, prSize, { align: "right", bold: !pr.muted, maxWidth: prW + 2, maxLines: 1, color: pr.muted ? [0.5, 0.5, 0.5] : [0.06, 0.06, 0.06] });
        if (vp)
            c += pdfTextOp(vp, x + w - pad, rowTop - 19.5, 7.6, { align: "right", maxWidth: prW + 2, maxLines: 1, color: [0.42, 0.35, 0.15] });
    });
    return c;
}
function pdfModelCellH(item, lang) { return PDF_MODEL.cellH - (pdfNoPrice ? 14 : 0) + (pdfVade ? 11 : 0) + ((!pdfNoPrice && item && pdfVariantRows(item, lang).some(logiHas)) ? 10 : 0); }
function pdfModelCols(n) { return Math.min(PDF_MODEL.maxCols, Math.max(PDF_MODEL.minCols, n)); }
function pdfModelRowHeight(item, lang) {
    const n = Math.max(1, pdfVariantRows(item, lang).length), cols = pdfModelCols(n);
    return Math.ceil(PDF_MODEL.headH + Math.ceil(n / cols) * pdfModelCellH(item, lang) + 6);
}
/* B1 — MODEL SIRASI: seri adı + açıklama, altında her model ayrı panelde (resim · model · ölçü · fiyat).
   Model fotoğrafı: önce modelin kendi fotoğrafı, yoksa ürün fotoğrafları sırayla (1. foto → 1. model…), o da yoksa ana fotoğraf. */
function pdfModelRow(data, item, lang, x, y, w, h, useImg, acc) {
    const top = y + h;
    let c = pdfSoftCard(x, y, w, h, 8);
    const name = pdfText(lang, item.name, item.name_en, item.name) || "—", desc = pdfDescText(lang, item) || "";
    const nameW = Math.min(pdfFontWidth(name, 12.5) + 6, w * 0.55);
    c += pdfTextOp(name, x + 14, top - 20, 12.5, { bold: true, maxWidth: w * 0.55, maxLines: 1, color: [0.06, 0.06, 0.06] });
    if (desc)
        c += pdfTextOp(desc, x + w - 14, top - 19.5, 7.8, { align: "right", maxWidth: w - 28 - nameW - 12, maxLines: 1, color: [0.45, 0.45, 0.45] });
    c += pdfRect(x + 14, top - 28, 22, 1.6, acc);
    c += pdfLine(x + 40, top - 27.2, x + w - 14, top - 27.2, [0.88, 0.88, 0.88], .4);
    const rows = pdfVariantRows(item, lang), n = rows.length, cols = pdfModelCols(n), gap = 8, inner = w - 20, cellW = (inner - gap * (cols - 1)) / cols;
    const mainSrc = pdfProductImageSource(item, data), gallery = (Array.isArray(item.images) ? item.images : []).map(pdfImageSource).filter(Boolean);
    rows.forEach((r, i) => {
        const col = i % cols, row = Math.floor(i / cols), cx = x + 10 + col * (cellW + gap), cTop = top - PDF_MODEL.headH - row * pdfModelCellH(item, lang);
        const panelH = pdfModelCellH(item, lang) - 8;
        c += pdfRoundRect(cx, cTop - panelH, cellW, panelH, 6, [0.975, 0.972, 0.966]);
        const ih = PDF_MODEL.imgH, boxY = cTop - 4 - ih;
        const a = useImg(pdfImageSource(r.image)) || useImg(gallery[i]) || useImg(mainSrc);
        if (a)
            c += pdfDrawImage("Im" + a.id, a, cx + 8, boxY + 3, cellW - 16, ih - 6, true);
        let ly = boxY - 11;
        const label = String(r.name || "").toLocaleUpperCase(lang === "EN" ? "en-US" : "tr-TR") || "—";
        c += pdfTextOp(label, cx + cellW / 2, ly, 7.6, { align: "center", bold: true, maxWidth: cellW - 10, maxLines: 1, color: [0.25, 0.25, 0.25] });
        c += pdfRect(cx + cellW / 2 - 7, ly - 4.5, 14, 1, acc);
        ly -= 13;
        if (String(r.dims || "").trim())
            c += pdfTextOp(pdfDimsLabel(r.dims) + " cm", cx + cellW / 2, ly, 6.6, { align: "center", maxWidth: cellW - 10, maxLines: 1, color: [0.5, 0.5, 0.5] });
        const rl = pdfNoPrice ? "" : logiText(r, lang);
        if (rl)
            c += pdfTextOp(rl, cx + cellW / 2, ly - 10, 6.4, { align: "center", maxWidth: cellW - 10, maxLines: 1, color: [0.45, 0.45, 0.45] });
        ly -= 13.5 + (rows.some(logiHas) ? 10 : 0);
        const pr = pdfVariantPrice(data, r, lang);
        if (!pr.none)
            c += pdfTextOp(pr.text, cx + cellW / 2, ly, pr.muted ? 7.4 : 10.8, { align: "center", bold: !pr.muted, maxWidth: cellW - 10, maxLines: 1, color: pr.muted ? [0.5, 0.5, 0.5] : [0.06, 0.06, 0.06] });
        const vp = (pr.none || pr.muted) ? "" : pdfVadeMoney(data, r.amount);
        if (vp)
            c += pdfTextOp(pdfVade.label + " " + vp, cx + cellW / 2, ly - 11.5, 7.6, { align: "center", maxWidth: cellW - 10, maxLines: 1, color: [0.42, 0.35, 0.15] });
    });
    return c;
}
/* Akış düzeni: kategori şeridi + ürün kartları, sayfa başına en fazla 7 ürün.
   Fiyat listesi ve "Klasik" katalog aynı sayfalama kurallarını kullanır. */
async function pdfFlowPages(data, lang, preparedImages, pages, opts = {}) {
    const L = PDF_LAYOUT, H = L.H, TOP = L.top, BOTTOM = L.bottom, GAP = L.gap, MAX_PRODUCTS = 7;
    const cardH = opts.cardHeight || pdfCardHeight;
    let current = [], used = TOP, productCount = 0;
    const flush = async () => {
        if (!current.length)
            return;
        pages.push(await renderPdfCatalogPage(data, lang, current, pages.length + 1, preparedImages, opts));
        current = [];
        used = TOP;
        productCount = 0;
    };
    const fits = h => used + h <= H - BOTTOM;
    for (const category of (data.categories || [])) {
        const items = Array.isArray(category.items) ? category.items : [];
        if (!items.length)
            continue;
        if (data.pdf?.useCategoryCovers) {
            /* Önceki kategorinin bekleyen ürünleri kapaktan ÖNCE basılır. */
            await flush();
            pages.push(await renderPdfCategoryCoverPage(data, lang, category, pages.length + 1));
        }
        const layout = opts.forceTable ? "table" : categoryLayoutOf(data, category.id);
        if (layout !== "table") {
            /* Ölçü kartları / model sırası: yükseklik bazlı sayfalama */
            const blocks = layout === "sizes" ? pdfSizeRowBlocks(items, lang) : items.map(it => ({ type: "modelRow", item: it, h: pdfModelRowHeight(it, lang) }));
            if (current.length && !fits(L.categoryH + GAP + blocks[0].h))
                await flush();
            current.push({ type: "category", category });
            used += L.categoryH + GAP;
            for (const blk of blocks) {
                if (!fits(blk.h)) {
                    await flush();
                    current.push({ type: "category", category });
                    used += L.categoryH + GAP;
                }
                current.push({ ...blk, category });
                used += blk.h + GAP;
            }
            continue;
        }
        if (current.length && (!fits(L.categoryH + GAP + cardH(items[0])) || productCount >= MAX_PRODUCTS))
            await flush();
        current.push({ type: "category", category });
        used += L.categoryH + GAP;
        for (const item of items) {
            const h = cardH(item);
            if (productCount >= MAX_PRODUCTS || !fits(h)) {
                await flush();
                current.push({ type: "category", category });
                used += L.categoryH + GAP;
            }
            current.push({ type: "product", category, item });
            used += h + GAP;
            productCount++;
        }
    }
    await flush();
}
async function buildPriceListPDF(rawData, lang) {
    const norm = normalizeData(rawData), source = projectCurrency(norm, norm.currency?.selected || "TRY") || norm, currency = source.currency?.selected || "TRY";
    /* PDF dili artık para biriminden değil, sitenin seçili dilinden gelir. */
    const pdfLang = lang === "EN" ? "EN" : lang === "TR" ? "TR" : (currency === "TRY" ? "TR" : "EN");
    pdfAccentCurrent = pdfCatalogAccent(source);
    pdfNoPrice = false;
    const vr = vadeRateOf(source);
    pdfVade = vr ? { rate: vr, label: vadeLabelOf(source, pdfLang) } : null;
    try {
        const prepared = await pdfPrepareImages(source), data = prepared.data;
        const pages = [await renderPdfCoverPage(data, pdfLang)];
        await pdfFlowPages(data, pdfLang, prepared.images, pages);
        pages.push(await renderPdfClosingPage(data, pdfLang));
        return await pdfCreateVectorDocument(pages);
    }
    finally {
        pdfVade = null;
    }
}
/* ==================== KATALOG PDF (FİYATSIZ) ==================== */
function pdfHexToRgb(hex, fallback = [0.79, 0.64, 0.15]) {
    const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(String(hex || "").trim());
    if (!m)
        return fallback;
    let h = m[1];
    if (h.length === 3)
        h = h.split("").map(c => c + c).join("");
    return [0, 2, 4].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) / 255 * 1000) / 1000);
}
function pdfCatalogAccent(data) { return pdfHexToRgb(data?.theme?.accent); }
function pdfItemImages(item) {
    const list = [], add = v => { const s = pdfImageSource(v); if (s && !list.includes(s))
        list.push(s); };
    add(item?.image);
    (Array.isArray(item?.images) ? item.images : []).forEach(add);
    return list;
}
function pdfCatalogRows(item, lang) {
    const p = normalizePrice(item?.price);
    if (p.parts.length)
        return p.parts.map(part => ({ name: pdfText(lang, part.name, part.name_en, part.name) || "—", dims: part.dims || "", logi: logiText(part, lang) }));
    const d = String(item?.dims || "").trim(), logi = logiText(item, lang);
    return (d || logi) ? [{ name: pdfText(lang, item.name, item.name_en, item.name) || "—", dims: d, logi }] : [];
}
function pdfDimsLabel(v) {
    const s = pdfCleanDims(v);
    if (s === "—")
        return "—";
    const n = s.match(/\d+(?:[.,]\d+)?/g) || [];
    if ((n.length === 3 || n.length === 2) && /^[\d\s.,x×X*\/cmCM\-]+$/.test(s))
        return n.join(" × ");
    return s;
}
function pdfPageImages() {
    const map = new Map();
    let next = 1;
    return { map, use(key, asset) { if (!key || !asset)
            return null; if (map.has(key))
            return map.get(key); const a = { ...asset, id: next++ }; map.set(key, a); return a; } };
}
function pdfImageBox(asset, x, y, w, h, lang, bg = [0.955, 0.953, 0.945]) {
    let c = pdfRect(x, y, w, h, bg);
    if (asset)
        c += pdfDrawImage("Im" + asset.id, asset, x + 5, y + 5, w - 10, h - 10, true);
    else
        c += pdfTextOp(lang === "EN" ? "NO PRODUCT IMAGE" : "ÜRÜN GÖRSELİ YOK", x + w / 2, y + h / 2 - 3, 8, { align: "center", bold: true, color: [0.6, 0.6, 0.6], maxWidth: w - 10 });
    return c;
}
/* Modern şablonların ortak sayfa çerçevesi: üstte marka + kategori, altta web sitesi + sayfa no. */
function pdfCatalogChrome(data, pageNo, lang, label) {
    const L = PDF_LAYOUT, W = L.W, H = L.H, acc = pdfCatalogAccent(data);
    /* Fiyat listesiyle aynı yan şerit (koyu zemin, dikey site adı, sayfa numarası) + üstte marka ve vurgu çizgisi. */
    let c = pdfRect(0, 0, W, H, [1, 1, 1]) + pdfPageChrome(data, pageNo);
    c += pdfRect(36, H - 33, 26, 2.4, acc);
    c += pdfTextOp(String(data.siteName || "").toUpperCase(), 68, H - 35, 7.5, { bold: true, maxWidth: 230, maxLines: 1, color: [0.3, 0.3, 0.3] });
    if (label)
        c += pdfTextOp(label, W - 36, H - 35, 7.5, { align: "right", maxWidth: 250, maxLines: 1, color: [0.45, 0.45, 0.45] });
    return c;
}
/* Modül / ölçü tablosu (fiyatsız). Sığmayan kalemler "+n kalem daha" satırıyla özetlenir. */
function pdfDimsTable(rows, lang, x, yTop, w, maxH, acc, { rowH = 15, fs = 8.6, nameRatio = .6 } = {}) {
    const headH = 16;
    if (!rows.length || maxH < headH + rowH)
        return { content: "", height: 0 };
    const maxRows = Math.max(1, Math.floor((maxH - headH) / rowH));
    let list = rows;
    if (rows.length > maxRows) {
        const hidden = rows.length - (maxRows - 1);
        list = [...rows.slice(0, maxRows - 1), { name: lang === "EN" ? `+${hidden} more items` : `+${hidden} kalem daha`, more: true }];
    }
    /* Paket/m³/kg girilmiş satır varsa ad ile ölçü arasına "SEVKİYAT" sütunu eklenir. */
    const hasLogi = list.some(r => !r.more && r.logi), logiW = hasLogi ? w * .3 : 0;
    const nameW = w * nameRatio - logiW;
    let c = "";
    const top = yTop - headH;
    c += pdfRect(x, top, w, headH, [0.08, 0.08, 0.08]);
    c += pdfTextOp(lang === "EN" ? "MODULE" : "MODÜL", x + 6, top + 5.2, 7.4, { bold: true, color: [1, 1, 1], maxWidth: nameW - 8, maxLines: 1 });
    if (hasLogi)
        c += pdfTextOp(lang === "EN" ? "SHIPPING" : "SEVKİYAT", x + nameW, top + 5.2, 7.4, { bold: true, color: [1, 1, 1], maxWidth: logiW - 6, maxLines: 1 });
    c += pdfTextOp(lang === "EN" ? "W × D × H (cm)" : "G × D × Y (cm)", x + w - 6, top + 5.2, 7.4, { align: "right", bold: true, color: [1, 1, 1], maxWidth: w - nameW - 8, maxLines: 1 });
    list.forEach((r, i) => {
        const ry = top - (i + 1) * rowH;
        if (i % 2 === 1)
            c += pdfRect(x, ry, w, rowH, [0.965, 0.963, 0.958]);
        const cy = ry + rowH / 2 - fs * 0.34;
        c += pdfTextOp(r.name, x + 6, cy, fs, { bold: !r.more, maxWidth: r.more ? w - 12 : nameW - 10, maxLines: 1, color: r.more ? [0.42, 0.42, 0.42] : [0.1, 0.1, 0.1] });
        if (!r.more && r.logi)
            c += pdfTextOp(r.logi, x + nameW, cy, fs - .8, { maxWidth: logiW - 6, maxLines: 1, color: [0.38, 0.38, 0.38] });
        if (!r.more && String(r.dims || "").trim())
            c += pdfTextOp(pdfDimsLabel(r.dims), x + w - 6, cy, fs, { align: "right", maxWidth: w - nameW - logiW - 8, maxLines: 1, color: [0.18, 0.18, 0.18] });
    });
    const h = headH + list.length * rowH;
    c += pdfLine(x, yTop - h, x + w, yTop - h, acc, .9);
    return { content: c, height: h };
}
/* --- Şablon 1: KLASİK LİSTE (fiyat listesi düzeni, fiyat sütunları yerine ölçüler + açıklama) --- */
function pdfCatalogCardHeight(item) {
    const L = PDF_LAYOUT, rows = Math.max(1, pdfVisibleRows(item, "TR").length), hasDesc = !!pdfDescText("TR", item);
    const need = Math.ceil(PDF_TBL.headTop + rows * PDF_ROW_MIN_H + (hasDesc ? 24 : 0) + PDF_TBL.pad);
    return Math.min(L.H - L.top - L.bottom - L.categoryH - L.gap, Math.max(L.cardH, need));
}
function pdfCatalogListBlock(data, category, item, lang, x, y, w, h, asset, id) {
    const T = PDF_TBL, acc = pdfCatalogAccent(data), right = x + w - 12;
    let { c, tx, top } = pdfTblFrame(item, lang, x, y, w, h, asset, id, acc, right);
    const rows = pdfVisibleRows(item, lang), hasLogi = rows.some(r => !r.__more && logiHas(r)), logiW = hasLogi ? 120 : 0;
    const dimW = 132, third = dimW / 3, dx = right - dimW, lx = dx - logiW, modW = lx - tx - 6, capY = top - 31;
    c += pdfTblCaption(lang === "EN" ? "MODULE" : "MODÜL", tx, capY, "left");
    if (hasLogi)
        c += pdfTblCaption(lang === "EN" ? "SHIPPING" : "SEVKİYAT", lx, capY, "left");
    ["G/W", "D/D", "Y/H"].forEach((t, j) => { c += pdfTblCaption(t, dx + third * (j + .5), capY, "center"); });
    const desc = pdfDescText(lang, item), descH = desc ? 24 : 0;
    const rowsTop = top - T.headTop, rowH = Math.min(15.5, (rowsTop - (y + T.pad + descH)) / Math.max(rows.length, 1));
    for (let i = 0; i < rows.length; i++) {
        const rt = rowsTop - i * rowH, rb = rt - rowH, part = rows[i] || {};
        if (i % 2 === 0)
            c += pdfRoundRect(tx - 4, rb + .8, right - tx + 8, rowH - 1.6, 3, [0.972, 0.969, 0.962]);
        const fs = Math.min(8.8, Math.max(7, rowH * 0.6)), cy = rb + rowH / 2 - fs * 0.34;
        const mod = pdfText(lang, part.name, part.name_en, part.name) || "—";
        if (part.__more) {
            c += pdfTextOp(mod, tx, cy, fs, { bold: true, maxWidth: right - tx, maxLines: 1, color: [0.45, 0.45, 0.45] });
            continue;
        }
        c += pdfTextOp(mod, tx, cy, fs, { bold: true, maxWidth: modW, maxLines: 1, color: [0.1, 0.1, 0.1] });
        if (hasLogi && logiHas(part))
            c += pdfTextOp(logiText(part, lang), lx, cy, fs - .8, { maxWidth: logiW - 6, maxLines: 1, color: [0.38, 0.38, 0.38] });
        pdfDimsParts(part.dims).forEach((v, j) => { c += pdfTextOp(v, dx + third * (j + .5), cy, fs, { align: "center", bold: true, maxWidth: third - 2, maxLines: 1, color: [0.2, 0.2, 0.2] }); });
    }
    if (desc)
        c += pdfTextOp(desc, tx, y + T.pad + descH - 10, 7.6, { maxWidth: right - tx, maxLines: 2, leading: 9.4, color: [0.4, 0.4, 0.4] });
    return c;
}
/* --- Şablon 2: VİTRİN (her ürün tek sayfa) --- */
function pdfDimsTableHeight(rows, maxRowsH, rowH = 15) { return rows.length ? 16 + Math.min(rows.length, Math.max(1, Math.floor(maxRowsH / rowH))) * rowH : 0; }
function pdfRenderVitrinPage(data, lang, category, item, pageNo, assets) {
    const L = PDF_LAYOUT, W = L.W, H = L.H, acc = pdfCatalogAccent(data), X = 36, CW = W - 72, reg = pdfPageImages();
    const catName = pdfText(lang, category.name, category.name_en, category.name) || "";
    let c = pdfCatalogChrome(data, pageNo, lang, catName), y = H - 66;
    c += pdfTextOp(catName.toLocaleUpperCase(lang === "EN" ? "en-US" : "tr-TR"), X, y, 8.5, { bold: true, color: acc, maxWidth: CW, maxLines: 1 });
    y -= 27;
    const name = pdfText(lang, item.name, item.name_en, item.name) || "—", nl = pdfWrapText(name, CW, 21, 2).length;
    c += pdfTextOp(name, X, y, 21, { bold: true, maxWidth: CW, maxLines: 2, leading: 24, color: [0.07, 0.07, 0.07] });
    y -= (nl - 1) * 24 + 16;
    const imgs = pdfItemImages(item), extra = imgs.slice(1).filter(src => assets.get(src)).slice(0, 4);
    const descTxt = pdfDescText(lang, item), descH = descTxt ? pdfWrapText(descTxt, CW, 9.5, 4).length * 13.5 + 14 : 0;
    const rowsList = pdfCatalogRows(item, lang), tableH = pdfDimsTableHeight(rowsList, 10 * 15);
    /* Ana görsel, açıklama ve ölçü tablosundan kalan alanı doldurur (boş sayfa altı kalmaz). */
    const free = (y - 48) - (extra.length ? 64 + 16 : 8) - 8 - descH - tableH - 6;
    const imgH = Math.max(260, Math.min(500, free));
    c += pdfImageBox(reg.use(imgs[0], assets.get(imgs[0])), X, y - imgH, CW, imgH, lang);
    y -= imgH + 8;
    if (extra.length) {
        const n = 4, tw = (CW - 8 * (n - 1)) / n;
        extra.forEach((src, i) => { c += pdfImageBox(reg.use(src, assets.get(src)), X + i * (tw + 8), y - 64, tw, 64, lang); });
        y -= 64 + 16;
    }
    else
        y -= 8;
    const desc = pdfDescText(lang, item);
    if (desc) {
        const lines = pdfWrapText(desc, CW, 9.5, 4).length;
        c += pdfTextOp(desc, X, y - 9.5, 9.5, { maxWidth: CW, maxLines: 4, leading: 13.5, color: [0.25, 0.25, 0.25] });
        y -= lines * 13.5 + 14;
    }
    const t = pdfDimsTable(pdfCatalogRows(item, lang), lang, X, y, CW, y - 48, acc);
    c += t.content;
    return { content: c, images: reg.map, pageNo };
}
/* VİTRİN İKİLİ: sayfa başına 2 model (oturma grupları) — her yarıda ad, büyük görsel, açıklama ve ölçü tablosu */
function pdfRenderVitrinDuoPage(data, lang, category, items, pageNo, assets) {
    const L = PDF_LAYOUT, W = L.W, H = L.H, acc = pdfCatalogAccent(data), X = 36, CW = W - 72, reg = pdfPageImages();
    const catName = pdfText(lang, category.name, category.name_en, category.name) || "";
    let c = pdfCatalogChrome(data, pageNo, lang, catName);
    c += pdfTextOp(catName.toLocaleUpperCase(lang === "EN" ? "en-US" : "tr-TR"), X, H - 66, 8.5, { bold: true, color: acc, maxWidth: CW, maxLines: 1 });
    const areaTop = H - 80, areaBottom = 48, gap = 26, slotH = (areaTop - areaBottom - gap) / 2;
    items.forEach((item, i) => {
        const top = areaTop - i * (slotH + gap), bottom = top - slotH;
        const name = pdfText(lang, item.name, item.name_en, item.name) || "—";
        c += pdfTextOp(name, X, top - 18, 17, { bold: true, maxWidth: CW, maxLines: 1, color: [0.07, 0.07, 0.07] });
        c += pdfRect(X, top - 27, 24, 1.8, acc);
        const desc = pdfDescText(lang, item), dl = desc ? pdfWrapText(desc, CW, 9, 2).length : 0, descH = dl ? dl * 12.5 + 6 : 0;
        const rows = pdfCatalogRows(item, lang), tableH = pdfDimsTableHeight(rows, 4 * 14, 14);
        const imgTop = top - 36, imgBottom = bottom + tableH + descH + 10;
        const src = pdfItemImages(item)[0];
        c += pdfImageBox(reg.use(src, assets.get(src)), X, imgBottom, CW, imgTop - imgBottom, lang);
        let y = imgBottom - 8;
        if (desc) {
            c += pdfTextOp(desc, X, y - 9, 9, { maxWidth: CW, maxLines: 2, leading: 12.5, color: [0.28, 0.28, 0.28] });
            y -= descH;
        }
        c += pdfDimsTable(rows, lang, X, y, CW, y - bottom, acc, { rowH: 14, fs: 8.4, nameRatio: .55 }).content;
        if (i === 0 && items.length > 1)
            c += pdfLine(X, bottom - gap / 2, X + CW, bottom - gap / 2, [0.86, 0.86, 0.86], .5);
    });
    return { content: c, images: reg.map, pageNo };
}
/* Izgara ve Dergi sayfalarının kategori başlığı */
function pdfCatalogSectionHeader(data, lang, category, cont, X, CW) {
    const L = PDF_LAYOUT, H = L.H, acc = pdfCatalogAccent(data);
    const name = pdfText(lang, category.name, category.name_en, category.name) || "";
    return pdfCategoryBar((name + (cont ? (lang === "EN" ? "  (continued)" : "  (devam)") : "")).toUpperCase(), X, H - 84, CW, 22, 12.5);
}
/* --- Şablon 3: IZGARA (sayfa başına 6 kart) --- */
function pdfRenderIzgaraPage(data, lang, category, items, pageNo, assets, cont) {
    const L = PDF_LAYOUT, W = L.W, H = L.H, acc = pdfCatalogAccent(data), X = 36, CW = W - 72, reg = pdfPageImages();
    const catName = pdfText(lang, category.name, category.name_en, category.name) || "";
    let c = pdfCatalogChrome(data, pageNo, lang, catName) + pdfCatalogSectionHeader(data, lang, category, cont, X, CW);
    const gap = 14, cols = 2, rowsN = 3, areaTop = H - 94, areaBottom = 46, cardW = (CW - gap) / cols, cardH = (areaTop - areaBottom - gap * (rowsN - 1)) / rowsN;
    items.forEach((item, i) => {
        const col = i % cols, row = Math.floor(i / cols), x = X + col * (cardW + gap), top = areaTop - row * (cardH + gap), y = top - cardH;
        c += pdfRect(x, y, cardW, cardH, [1, 1, 1], [0.86, 0.86, 0.86], .6);
        const imgH = cardH * 0.56, src = pdfItemImages(item)[0];
        c += pdfImageBox(reg.use(src, assets.get(src)), x + 1, top - 1 - imgH, cardW - 2, imgH, lang);
        c += pdfRect(x + 10, top - imgH - 8, 18, 1.8, acc);
        let ty = top - imgH - 22;
        const name = pdfText(lang, item.name, item.name_en, item.name) || "—", nl = pdfWrapText(name, cardW - 20, 10.5, 2).length;
        c += pdfTextOp(name, x + 10, ty, 10.5, { bold: true, maxWidth: cardW - 20, maxLines: 2, leading: 12.5, color: [0.07, 0.07, 0.07] });
        ty -= (nl - 1) * 12.5 + 14;
        const rows = pdfCatalogRows(item, lang);
        let info = "";
        if (rows.length === 1) {
            const dl = pdfDimsLabel(rows[0].dims);
            info = (lang === "EN" ? "Size: " : "Ölçü: ") + dl + (/cm|mm|\bm\b|—/i.test(dl) ? "" : " cm");
        }
        else if (rows.length > 1)
            info = (lang === "EN" ? `${rows.length} modules · ` : `${rows.length} modül · `) + rows.map(r => r.name).join(", ");
        if (info) {
            c += pdfTextOp(info, x + 10, ty, 8.2, { bold: true, maxWidth: cardW - 20, maxLines: 1, color: [0.25, 0.25, 0.25] });
            ty -= 13;
        }
        /* Paket/m³/kg: tek satırda kendisi; takımda (modüller toplanır) toplamı. Ölçü/model seçeneklerinde toplam anlamsız, gösterilmez. */
        const lr = rows.filter(r => r.logi);
        const logiLine = lr.length === 1 && rows.length === 1 ? lr[0].logi : (lr.length && !isVariantLayout(categoryLayoutOf(data, category.id)) ? (lang === "EN" ? "Total: " : "Toplam: ") + logiText(logiSum(pdfRowsForItem(item)), lang) : "");
        if (logiLine) {
            c += pdfTextOp(logiLine, x + 10, ty, 7.8, { maxWidth: cardW - 20, maxLines: 1, color: [0.38, 0.38, 0.38] });
            ty -= 12;
        }
        const desc = pdfDescText(lang, item);
        const room = Math.floor((ty - (y + 8)) / 10.5) + 1;
        if (desc && room > 0)
            c += pdfTextOp(desc, x + 10, ty, 8, { maxWidth: cardW - 20, maxLines: Math.min(3, room), leading: 10.5, color: [0.4, 0.4, 0.4] });
    });
    return { content: c, images: reg.map, pageNo };
}
/* --- Şablon 4: DERGİ (sayfa başına 2 ürün, görseller sırayla sol/sağ) --- */
function pdfRenderDergiPage(data, lang, category, items, startIndex, pageNo, assets, cont) {
    const L = PDF_LAYOUT, W = L.W, H = L.H, acc = pdfCatalogAccent(data), X = 36, CW = W - 72, reg = pdfPageImages();
    const catName = pdfText(lang, category.name, category.name_en, category.name) || "";
    let c = pdfCatalogChrome(data, pageNo, lang, catName) + pdfCatalogSectionHeader(data, lang, category, cont, X, CW);
    const gap = 22, areaTop = H - 96, areaBottom = 46, slotH = (areaTop - areaBottom - gap) / 2, imgW = Math.round(CW * 0.56), textW = CW - imgW - 20;
    items.forEach((item, i) => {
        const idx = startIndex + i, top = areaTop - i * (slotH + gap), y = top - slotH, imageLeft = idx % 2 === 0;
        const ix = imageLeft ? X : X + textW + 20, tx = imageLeft ? X + imgW + 20 : X, src = pdfItemImages(item)[0];
        c += pdfImageBox(reg.use(src, assets.get(src)), ix, y, imgW, slotH, lang);
        let ty = top - 24;
        ty -= 4;
        const name = pdfText(lang, item.name, item.name_en, item.name) || "—", nl = pdfWrapText(name, textW, 14.5, 3).length;
        c += pdfTextOp(name, tx, ty, 14.5, { bold: true, maxWidth: textW, maxLines: 3, leading: 17.5, color: [0.07, 0.07, 0.07] });
        ty -= (nl - 1) * 17.5 + 12;
        c += pdfRect(tx, ty, 24, 1.8, acc);
        ty -= 16;
        const desc = pdfDescText(lang, item);
        if (desc) {
            const lines = pdfWrapText(desc, textW, 9, 7).length;
            c += pdfTextOp(desc, tx, ty, 9, { maxWidth: textW, maxLines: 7, leading: 12.5, color: [0.28, 0.28, 0.28] });
            ty -= (lines - 1) * 12.5 + 20;
        }
        const t = pdfDimsTable(pdfCatalogRows(item, lang), lang, tx, ty + 6, textW, ty + 6 - (y + 2), acc, { rowH: 14, fs: 8, nameRatio: .55 });
        c += t.content;
        if (i === 0 && items.length > 1)
            c += pdfLine(X, y - gap / 2, X + CW, y - gap / 2, [0.86, 0.86, 0.86], .5);
    });
    return { content: c, images: reg.map, pageNo };
}
const PDF_CATALOG_TEMPLATES = [
    { id: "akilli", name: "Akıllı (otomatik)", desc: "Ürünlere göre kendini ayarlar: takımlar tek sayfa, kalabalık kategoriler sayfada 2, ölçü/model ürünleri sıkışık akış düzeninde." },
    { id: "klasik", name: "Klasik Liste", desc: "Fiyat listesiyle aynı düzen; fiyat yerine ölçüler ve açıklama. Sayfa başına 7 ürün." },
    { id: "vitrin", name: "Vitrin", desc: "Her kategori için ayrı seçilir: her model tek sayfada, sayfa başına 2 model veya akıllı akış düzeni." },
    { id: "izgara", name: "Izgara", desc: "Sayfa başına 6 ürün kartı. Geniş ürün yelpazesine hızlı göz atma." },
    { id: "dergi", name: "Dergi", desc: "Sayfa başına 2 ürün, görseller sırayla solda ve sağda. Sunum havası." }
];
function pdfCatalogTemplateId(v) { return PDF_CATALOG_TEMPLATES.some(t => t.id === v) ? v : "akilli"; }
/* Vitrin şablonunda her kategorinin sayfa düzeni: full = her model tek sayfa, duo = sayfa başına 2 model, flow = akıllı akış */
const PDF_VITRIN_MODES = Object.freeze([
    { id: "auto", name: "Otomatik" }, { id: "full", name: "Tek sayfa" }, { id: "duo", name: "Sayfada 2" }, { id: "flow", name: "Akış" }
]);
function vitrinModeOf(data, categoryId) {
    const v = data?.pdf?.vitrinModes?.[categoryId];
    if (v && v !== "auto" && PDF_VITRIN_MODES.some(m => m.id === v))
        return v;
    /* Otomatik: takım ürünleri büyük sunulur; kategori kalabalıksa sayfaya 2 ürün; ölçü/model ürünleri akış düzeninde. */
    if (categoryLayoutOf(data, categoryId) !== "table")
        return "flow";
    const cat = (data?.categories || []).find(c => c.id === categoryId), n = (cat?.items || []).length;
    return n > 8 ? "duo" : "full";
}
async function pdfPrepareCatalogAssets(data, tpl) {
    const maxFor = { klasik: 1000, vitrin: 1600, izgara: 900, dergi: 1300 }[tpl] || 1000;
    const want = [], size = new Map(), add = (s, m) => { if (!s)
        return; if (!size.has(s))
        want.push(s); size.set(s, Math.max(size.get(s) || 0, m)); };
    for (const c of data.categories || [])
        for (const it of c.items || []) {
            const imgs = pdfItemImages(it);
            if (tpl === "vitrin" && vitrinModeOf(data, c.id) === "full")
                imgs.slice(0, 5).forEach(s => add(s, maxFor));
            else if (tpl === "vitrin" && vitrinModeOf(data, c.id) === "duo")
                imgs.slice(0, 1).forEach(s => add(s, 1300));
            else if (tpl === "vitrin") {
                /* Akış düzenindeki kategoriler: ana görsel + model fotoğrafları, daha küçük çözünürlük */
                add(pdfProductImageSource(it, data), 1000);
                imgs.slice(0, 6).forEach(s => add(s, 1000));
                normalizePrice(it.price).parts.forEach(p => add(pdfImageSource(p.image), 1000));
            }
            else
                imgs.slice(0, 1).forEach(s => add(s, maxFor));
        }
    const map = new Map();
    let i = 0;
    /* Aynı anda en fazla 4 görsel işlenir (büyük kataloglarda bellek taşmasın). */
    const worker = async () => { while (i < want.length) {
        const src = want[i++];
        map.set(src, await pdfImageAsset(src, { max: size.get(src), quality: .86 }));
    } };
    await Promise.all(Array.from({ length: Math.min(4, want.length) }, worker));
    return map;
}
async function buildCatalogPDF(rawData, lang, templateId) {
    pdfNoPrice = true;
    try {
        return await pdfBuildCatalogInner(rawData, lang, templateId);
    }
    finally {
        pdfNoPrice = false;
    }
}
async function pdfBuildCatalogInner(rawData, lang, templateId) {
    pdfAccentCurrent = pdfCatalogAccent(normalizeData(rawData));
    const source = normalizeData(rawData), L = lang === "EN" ? "EN" : "TR";
    const tplRaw = pdfCatalogTemplateId(templateId || source.pdf?.catalogTemplate);
    /* Akıllı şablon = Vitrin + her kategori için otomatik sayfa düzeni (elle seçilen vitrin ayarları yok sayılır). */
    const tpl = tplRaw === "akilli" ? "vitrin" : tplRaw;
    const data = { ...source, categories: pdfRealCategories(source), pdf: tplRaw === "akilli" ? { ...(source.pdf || {}), vitrinModes: {} } : source.pdf };
    const assets = await pdfPrepareCatalogAssets(data, tpl);
    const title = L === "EN" ? "PRODUCT CATALOG" : (String(source.pdf?.catalogTitle || "").trim() || "ÜRÜN KATALOĞU");
    const pages = [await renderPdfCoverPage(data, L, title)];
    if (tpl === "klasik") {
        await pdfFlowPages(data, L, assets, pages, { catalog: true, forceTable: true, cardHeight: pdfCatalogCardHeight });
    }
    else if (tpl === "vitrin") {
        /* VİTRİN: takım kategorileri (VIP → Personel) her model tek sayfa; diğer kategoriler
           fiyat listesindeki akıllı düzenle (ölçü kartları / model sırası / liste), fiyatsız ve sıkışık. */
        let group = [];
        const flushGroup = async () => {
            if (!group.length)
                return;
            await pdfFlowPages({ ...data, categories: group }, L, assets, pages, { catalog: true, cardHeight: pdfCatalogCardHeight });
            group = [];
        };
        for (const category of data.categories) {
            const items = category.items || [];
            if (!items.length)
                continue;
            const vMode = vitrinModeOf(data, category.id), duo = vMode === "duo";
            if (vMode === "flow") {
                group.push(category);
                continue;
            }
            await flushGroup();
            if (data.pdf?.useCategoryCovers)
                pages.push(await renderPdfCategoryCoverPage(data, L, category, pages.length + 1));
            if (duo) {
                for (let i = 0; i < items.length; i += 2)
                    pages.push(pdfRenderVitrinDuoPage(data, L, category, items.slice(i, i + 2), pages.length + 1, assets));
                continue;
            }
            for (const item of items)
                pages.push(pdfRenderVitrinPage(data, L, category, item, pages.length + 1, assets));
        }
        await flushGroup();
    }
    else {
        for (const category of data.categories) {
            const items = category.items || [];
            if (!items.length)
                continue;
            if (data.pdf?.useCategoryCovers)
                pages.push(await renderPdfCategoryCoverPage(data, L, category, pages.length + 1));
            if (tpl === "vitrin") {
                for (const item of items)
                    pages.push(pdfRenderVitrinPage(data, L, category, item, pages.length + 1, assets));
                continue;
            }
            const per = tpl === "izgara" ? 6 : 2;
            for (let i = 0; i < items.length; i += per) {
                const chunk = items.slice(i, i + per);
                pages.push(tpl === "izgara" ? pdfRenderIzgaraPage(data, L, category, chunk, pages.length + 1, assets, i > 0) : pdfRenderDergiPage(data, L, category, chunk, i, pages.length + 1, assets, i > 0));
            }
        }
    }
    pages.push(await renderPdfClosingPage(data, L));
    return await pdfCreateVectorDocument(pages);
}
function pdfValidateBlobBytes(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 32)
        throw new Error("PDF doğrulaması başarısız: dosya boş veya eksik.");
    const ascii = new TextDecoder("latin1").decode(bytes);
    if (!ascii.slice(0, 8).startsWith("%PDF-"))
        throw new Error("PDF doğrulaması başarısız: geçersiz PDF başlığı.");
    if (!ascii.includes("%%EOF"))
        throw new Error("PDF doğrulaması başarısız: PDF düzgün finalize edilmemiş.");
    const pages = ascii.match(/\/Type\s*\/Page(?:\s|\/|>>)/g) || [];
    if (pages.length < 1)
        throw new Error("PDF doğrulaması başarısız: sayfa bulunamadı.");
    const startMatch = ascii.match(/startxref\s+(\d+)\s+%%EOF\s*$/);
    if (!startMatch)
        throw new Error("PDF doğrulaması başarısız: xref/final kayıt bulunamadı.");
    const xrefPos = Number(startMatch[1]);
    if (!Number.isSafeInteger(xrefPos) || xrefPos < 0 || xrefPos >= bytes.length || ascii.slice(xrefPos, xrefPos + 4) !== "xref")
        throw new Error("PDF doğrulaması başarısız: xref tablosu geçersiz.");
    const trailer = ascii.match(/trailer\s*<<[\s\S]*?\/Size\s+(\d+)[\s\S]*?\/Root\s+(\d+)\s+0\s+R[\s\S]*?>>/);
    if (!trailer)
        throw new Error("PDF doğrulaması başarısız: trailer eksik.");
    const size = Number(trailer[1]);
    if (!Number.isSafeInteger(size) || size < 2)
        throw new Error("PDF doğrulaması başarısız: object sayısı geçersiz.");
    return { size, pages: pages.length, bytes: bytes.length, mime: "application/pdf" };
}
let pdfLastPages = null; /* Ön izleme penceresi için son üretilen sayfa içerikleri */
async function pdfCreateVectorDocument(pages) {
    if (!Array.isArray(pages) || pages.length === 0)
        throw new Error("PDF oluşturulamadı: sayfa bulunamadı.");
    pdfLastPages = pages;
    const objs = [];
    const add = b => { objs.push(b); return objs.length; };
    const usedTexts = [];
    for (const p of pages)
        usedTexts.push(p.content);
    const usedGlyphs = pdfCollectUsedGlyphs(usedTexts);
    const fontObj = await pdfMakeFontAndToUnicode(objs, usedGlyphs);
    const pageRefs = [];
    /* Aynı görsel (ör. her kapaktaki logo, tekrar eden ürün fotoğrafı) PDF'e bir kez gömülür, sayfalar onu paylaşır. */
    const sharedImages = new Map();
    for (const page of pages) {
        const imageRefs = [];
        for (const asset of page.images.values()) {
            if (!asset || !asset.data)
                continue;
            let io = sharedImages.get(asset.data);
            if (!io) {
                const bytes = pdfDataUriToBytes(asset.data);
                if (!bytes.length)
                    throw new Error("PDF oluşturulamadı: görsel verisi boş.");
                io = add(pdfConcatBytes([pdfObjBytes(`<< /Type /XObject /Subtype /Image /Width ${asset.width} /Height ${asset.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`), bytes, pdfObjBytes("\nendstream")]));
                sharedImages.set(asset.data, io);
            }
            imageRefs.push({ id: asset.id, obj: io });
        }
        let res = `/ProcSet [/PDF /Text /ImageC] /Font << /F1 ${fontObj} 0 R >>`;
        if (imageRefs.length)
            res += ` /XObject << ${imageRefs.map(r => `/Im${r.id} ${r.obj} 0 R`).join(" ")} >>`;
        const contentBytes = pdfObjBytes(page.content);
        if (!contentBytes.length)
            throw new Error("PDF oluşturulamadı: boş sayfa içeriği.");
        const co = add(pdfConcatBytes([pdfObjBytes(`<< /Length ${contentBytes.length} >>\nstream\n`), contentBytes, pdfObjBytes("\nendstream")]));
        pageRefs.push(add(pdfObjBytes(`<< /Type /Page /Parent PAGESREF /MediaBox [0 0 595.28 841.89] /Resources << ${res} >> /Contents ${co} 0 R >>`)));
    }
    const pagesObj = add(pdfObjBytes(`<< /Type /Pages /Kids [${pageRefs.map(n => n + " 0 R").join(" ")}] /Count ${pageRefs.length} >>`));
    const titleHex = "FEFF" + [..."Fiyat Listesi"].map(ch => ch.charCodeAt(0).toString(16).padStart(4, "0")).join("").toUpperCase();
    const info = add(pdfObjBytes(`<< /Producer (Premium Katalog PDF) /Title <${titleHex}> >>`));
    const catalog = add(pdfObjBytes(`<< /Type /Catalog /Pages ${pagesObj} 0 R /PageMode /UseNone /ViewerPreferences << /DisplayDocTitle false >> >>`));
    for (const n of pageRefs)
        objs[n - 1] = pdfObjBytes(new TextDecoder().decode(objs[n - 1]).replace("PAGESREF", `${pagesObj} 0 R`));
    const header = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xff, 0xff, 0xff, 0xff, 0x0a]);
    const parts = [header], offsets = [0];
    let pos = header.length;
    for (let i = 0; i < objs.length; i++) {
        const head = pdfObjBytes(`${i + 1} 0 obj\n`), tail = pdfObjBytes("\nendobj\n");
        offsets[i + 1] = pos;
        parts.push(head, objs[i], tail);
        pos += head.length + objs[i].length + tail.length;
    }
    const xrefPos = pos;
    let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objs.length; i++)
        xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    xref += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
    parts.push(pdfObjBytes(xref));
    const bytes = pdfConcatBytes(parts);
    pdfValidateBlobBytes(bytes);
    return new Blob([bytes], { type: "application/pdf" });
}
/* -------------------- PDF ÖN İZLEME -------------------- */
/* PDF dosyası verilmeden önce sayfalar, PDF'i oluşturan aynı çizim komutlarından canvas'a çizilir.
   Dış kütüphane / iframe gerekmez (CSP kapalı kalır); sayfalar kaydırıldıkça çizilir. */
const PDF_GID_TO_CP = (() => { const m = {}; for (const k in PDF_FONT_CMAP) {
    const g = PDF_FONT_CMAP[k];
    if (!(g in m))
        m[g] = Number(k);
} return m; })();
const pdfPreviewImageCache = new Map();
function pdfPreviewLoadImage(dataUri) {
    if (pdfPreviewImageCache.has(dataUri))
        return pdfPreviewImageCache.get(dataUri);
    const p = new Promise(resolve => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => resolve(null); im.src = dataUri; });
    pdfPreviewImageCache.set(dataUri, p);
    return p;
}
async function pdfRenderPageToCanvas(page, canvas, scale) {
    const { width: PW, height: PH } = pdfPageMetrics();
    canvas.width = Math.round(PW * scale);
    canvas.height = Math.round(PH * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    const imgs = new Map();
    for (const asset of page.images.values()) {
        if (asset && asset.data)
            imgs.set("Im" + asset.id, await pdfPreviewLoadImage(asset.data));
    }
    ctx.setTransform(scale, 0, 0, -scale, 0, PH * scale);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, PW, PH);
    const toks = String(page.content).match(/\/[A-Za-z0-9]+|<[0-9A-Fa-f]*>|-?\d*\.?\d+|[A-Za-z*]+/g) || [];
    let st = [], fill = "rgb(0,0,0)", stroke = "rgb(0,0,0)", size = 10, tm = [1, 0, 0, 1, 0, 0], bold = false;
    const col = (r, g, b) => `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
    ctx.lineJoin = "round";
    for (const t of toks) {
        if (/^(-?\d*\.?\d+|\/.+|<.*>)$/.test(t)) {
            st.push(t);
            continue;
        }
        const n = (i) => Number(st[st.length - i]);
        switch (t) {
            case "rg":
                fill = col(n(3), n(2), n(1));
                break;
            case "RG":
                stroke = col(n(3), n(2), n(1));
                break;
            case "w":
                ctx.lineWidth = n(1);
                break;
            case "q":
                ctx.save();
                break;
            case "Q":
                ctx.restore();
                break;
            case "cm":
                ctx.transform(n(6), n(5), n(4), n(3), n(2), n(1));
                break;
            case "m":
                ctx.beginPath();
                ctx.moveTo(n(2), n(1));
                break;
            case "l":
                ctx.lineTo(n(2), n(1));
                break;
            case "c":
                ctx.bezierCurveTo(n(6), n(5), n(4), n(3), n(2), n(1));
                break;
            case "h":
                ctx.closePath();
                break;
            case "re":
                ctx.beginPath();
                ctx.rect(n(4), n(3), n(2), n(1));
                break;
            case "f":
                ctx.fillStyle = fill;
                ctx.fill();
                break;
            case "S":
                ctx.strokeStyle = stroke;
                ctx.stroke();
                break;
            case "W":
                ctx.clip();
                break;
            case "n":
                ctx.beginPath();
                break;
            case "Do": {
                const im = imgs.get(String(st[st.length - 1]).slice(1));
                if (im) {
                    ctx.save();
                    ctx.transform(1, 0, 0, -1, 0, 1);
                    ctx.drawImage(im, 0, 0, 1, 1);
                    ctx.restore();
                }
                break;
            }
            case "BT":
                tm = [1, 0, 0, 1, 0, 0];
                break;
            case "Tr":
                bold = n(1) === 2;
                break;
            case "Tf":
                size = n(1);
                break;
            case "Tm":
                tm = [n(6), n(5), n(4), n(3), n(2), n(1)];
                break;
            case "Tj": {
                const hex = String(st[st.length - 1]).slice(1, -1);
                let text = "", wUnits = 0;
                for (let i = 0; i + 3 < hex.length + 1; i += 4) {
                    const gid = parseInt(hex.substr(i, 4), 16);
                    if (Number.isNaN(gid))
                        continue;
                    text += String.fromCodePoint(PDF_GID_TO_CP[gid] || 63);
                    wUnits += PDF_FONT_WIDTHS[gid] || 0;
                }
                const target = wUnits / PDF_FONT_METRICS.unitsPerEm * size;
                ctx.save();
                ctx.transform(tm[0], tm[1], tm[2], tm[3], tm[4], tm[5]);
                ctx.scale(1, -1);
                ctx.font = `${bold ? "700 " : "400 "}${size}px Inter, "Segoe UI", Roboto, Arial, sans-serif`;
                ctx.fillStyle = fill;
                const m = ctx.measureText(text).width;
                if (m > 0 && target > 0)
                    ctx.scale(target / m, 1);
                ctx.fillText(text, 0, 0);
                ctx.restore();
                break;
            }
            case "Tf_":
                break;
            default: break;
        }
        st = [];
    }
}
function PdfPreviewModal({ preview, language, onClose, onDownload }) {
    const EN = language === "EN";
    const hostRef = useRef(null), [zoom, setZoom] = useState(false);
    useEffect(() => {
        const onKey = e => { if (e.key === "Escape")
            onClose(); };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
    }, []);
    useEffect(() => {
        const host = hostRef.current;
        if (!host)
            return;
        const scale = Math.min(2, Math.max(1.4, (window.devicePixelRatio || 1) * 1.1));
        const done = new Set();
        const draw = async (cv) => {
            if (done.has(cv))
                return;
            done.add(cv);
            const idx = Number(cv.dataset.page);
            try {
                await pdfRenderPageToCanvas(preview.pages[idx], cv, scale);
                cv.dataset.ready = "1";
            }
            catch (e) {
                console.warn("Ön izleme sayfası çizilemedi:", e);
            }
        };
        const canvases = Array.from(host.querySelectorAll("canvas"));
        if (typeof IntersectionObserver === "undefined") {
            canvases.slice(0, 6).forEach(draw);
            return;
        }
        /* Görünür alana yaklaşan sayfa çizilir; çok uzaklaşan sayfanın belleği boşaltılır (600+ sayfalık katalogda telefon donmasın). */
        const io = new IntersectionObserver(entries => { entries.forEach(en => { const cv = en.target; if (en.isIntersecting)
            draw(cv);
        else if (done.has(cv) && cv.dataset.ready === "1") {
            done.delete(cv);
            cv.dataset.ready = "";
            cv.width = 0;
            cv.height = 0;
        } }); }, { root: host, rootMargin: "1600px 0px" });
        canvases.forEach(cv => io.observe(cv));
        return () => io.disconnect();
    }, [preview]);
    const count = preview.pages.length;
    return React.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": EN ? "PDF preview" : "PDF ön izleme", className: "fixed inset-0 flex flex-col", style: { zIndex: 400, background: "#0b0b0d" } },
        React.createElement("div", { className: "flex items-center gap-2 px-3 py-3 text-white", style: { paddingTop: "max(12px, env(safe-area-inset-top))", borderBottom: "1px solid rgba(255,255,255,.1)" } },
            React.createElement("div", { className: "min-w-0 flex-1" },
                React.createElement("div", { className: "text-sm font-bold truncate" }, preview.title),
                React.createElement("div", { className: "text-[11px] opacity-70" }, EN ? `${count} pages · tap a page to zoom` : `${count} sayfa · yakınlaştırmak için sayfaya dokunun`)),
            React.createElement("button", { type: "button", onClick: onDownload, className: "min-h-[44px] px-4 rounded-xl text-sm font-bold flex items-center gap-2", style: { background: preview.accent || "#C9A227", color: "#111" } },
                React.createElement(Icon, { type: "download", size: 16 }),
                EN ? "Download PDF" : "PDF'i İndir"),
            React.createElement("button", { type: "button", "aria-label": EN ? "Close preview" : "Ön izlemeyi kapat", onClick: onClose, className: "w-11 h-11 flex items-center justify-center rounded-full hover:text-white", style: { color: "rgba(255,255,255,.8)" } },
                React.createElement(Icon, { type: "x", size: 21 }))),
        React.createElement("div", { ref: hostRef, className: "flex-1 overscroll-contain px-3", style: { overflow: "auto", minHeight: 0, paddingTop: 16, paddingBottom: 24, WebkitOverflowScrolling: "touch" }, "data-pdf-preview": "1" },
            React.createElement("div", { className: "mx-auto flex flex-col", style: zoom ? { width: "max(200%, 1100px)", maxWidth: "none", gap: 16 } : { maxWidth: 760, gap: 16 } }, preview.pages.map((p, i) => React.createElement("div", { key: i, className: "relative", onClick: e => { const el = e.currentTarget; setZoom(z => !z); requestAnimationFrame(() => requestAnimationFrame(() => { try {
                    el.scrollIntoView({ block: "start", inline: "start" });
                }
                catch (_) { } })); }, style: { cursor: zoom ? "zoom-out" : "zoom-in" } },
                React.createElement("canvas", { "data-page": i, "aria-label": (EN ? "Page " : "Sayfa ") + (i + 1), style: { width: "100%", aspectRatio: "595.28 / 841.89", background: "#fff", borderRadius: 6, display: "block", boxShadow: "0 6px 30px rgba(0,0,0,.45)" } }),
                React.createElement("div", { className: "absolute text-[10px] font-bold px-2 rounded-full", style: { right: 12, bottom: 8, paddingTop: 2, paddingBottom: 2, background: "rgba(0,0,0,.55)", color: "#fff" } }, i + 1 + " / " + count))))));
}

/* -------------------- APP -------------------- */
/* Yönetim panelindeki şablon seçicisi için küçük şematik önizleme. */
function CatalogTemplateThumb({ id, accent }) {
    const a = accent || "#C9A227", img = "#3a3a3a", ln = "#5a5a5a", bg = "#f4f2ee";
    const page = c => React.createElement("svg", { viewBox: "0 0 60 80", className: "w-full h-auto rounded-md", "aria-hidden": "true", style: { background: bg, maxHeight: 96 } }, c);
    if (id === "klasik")
        return page(React.createElement(React.Fragment, null, [0, 1, 2, 3].map(i => React.createElement("g", { key: i },
            React.createElement("rect", { x: "5", y: 6 + i * 18, width: "50", height: "16", fill: "#fff", stroke: "#999", strokeWidth: ".5" }),
            React.createElement("rect", { x: "5", y: 6 + i * 18, width: "50", height: "3", fill: "#111" }),
            React.createElement("rect", { x: "7", y: 11 + i * 18, width: "14", height: "9", fill: img }),
            React.createElement("rect", { x: "24", y: 12 + i * 18, width: "28", height: "1.6", fill: ln }),
            React.createElement("rect", { x: "24", y: 15 + i * 18, width: "22", height: "1.6", fill: ln }),
            React.createElement("rect", { x: "24", y: 18 + i * 18, width: "25", height: "1.6", fill: ln })))));
    if (id === "vitrin")
        return page(React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "6", y: "6", width: "10", height: "1.5", fill: a }),
            React.createElement("rect", { x: "6", y: "10", width: "34", height: "3.5", fill: "#222" }),
            React.createElement("rect", { x: "6", y: "17", width: "48", height: "32", fill: img }),
            [0, 1, 2].map(i => React.createElement("rect", { key: i, x: 6 + i * 13, y: "52", width: "11", height: "7", fill: "#777" })),
            React.createElement("rect", { x: "6", y: "62", width: "44", height: "1.4", fill: ln }),
            React.createElement("rect", { x: "6", y: "66", width: "48", height: "3", fill: "#111" }),
            React.createElement("rect", { x: "6", y: "70", width: "48", height: "1.4", fill: ln }),
            React.createElement("rect", { x: "6", y: "73", width: "48", height: "1.4", fill: ln })));
    if (id === "izgara")
        return page(React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "6", y: "6", width: "26", height: "3", fill: "#222" }),
            React.createElement("rect", { x: "6", y: "11", width: "48", height: ".8", fill: a }),
            [0, 1, 2, 3, 4, 5].map(i => { const x = 6 + (i % 2) * 25, y = 15 + Math.floor(i / 2) * 21; return React.createElement("g", { key: i },
                React.createElement("rect", { x: x, y: y, width: "23", height: "19", fill: "#fff", stroke: "#bbb", strokeWidth: ".5" }),
                React.createElement("rect", { x: x + 1, y: y + 1, width: "21", height: "10", fill: img }),
                React.createElement("rect", { x: x + 2, y: y + 13, width: "14", height: "1.6", fill: "#222" }),
                React.createElement("rect", { x: x + 2, y: y + 16, width: "18", height: "1.2", fill: ln })); })));
    return page(React.createElement(React.Fragment, null,
        React.createElement("rect", { x: "6", y: "6", width: "26", height: "3", fill: "#222" }),
        React.createElement("rect", { x: "6", y: "11", width: "48", height: ".8", fill: a }),
        React.createElement("rect", { x: "6", y: "15", width: "27", height: "28", fill: img }),
        React.createElement("rect", { x: "36", y: "17", width: "8", height: "3", fill: a }),
        React.createElement("rect", { x: "36", y: "23", width: "17", height: "2.4", fill: "#222" }),
        React.createElement("rect", { x: "36", y: "28", width: "16", height: "1.3", fill: ln }),
        React.createElement("rect", { x: "36", y: "31", width: "14", height: "1.3", fill: ln }),
        React.createElement("rect", { x: "27", y: "47", width: "27", height: "28", fill: img }),
        React.createElement("rect", { x: "6", y: "49", width: "8", height: "3", fill: a }),
        React.createElement("rect", { x: "6", y: "55", width: "17", height: "2.4", fill: "#222" }),
        React.createElement("rect", { x: "6", y: "60", width: "16", height: "1.3", fill: ln }),
        React.createElement("rect", { x: "6", y: "63", width: "14", height: "1.3", fill: ln })));
}
function ProductImageLightbox({ fullScreenImage, setFullScreenImage, onClose }) {
    const [zoom, setZoom] = useState(1), [pan, setPan] = useState({ x: 0, y: 0 });
    const pointersRef = useRef(new Map()), gestureRef = useRef(null), dragRef = useRef(null), swipeRef = useRef(null);
    const imgs = fullScreenImage?.images || [];
    const index = Math.max(0, Math.min(fullScreenImage?.index || 0, Math.max(imgs.length - 1, 0)));
    const clampZoom = z => Math.min(4, Math.max(1, z));
    const clampPan = p => { const limit = Math.max(0, Math.min(window.innerWidth, window.innerHeight) * 0.72 * (zoom - 1)); return { x: Math.max(-limit, Math.min(limit, p.x)), y: Math.max(-limit, Math.min(limit, p.y)) }; };
    const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
    useEffect(() => { resetView(); }, [fullScreenImage?.index]);
    useEffect(() => {
        const onKey = e => {
            if (e.key === "Escape")
                onClose();
            else if (e.key === "ArrowRight" && imgs.length > 1) {
                setFullScreenImage(v => ({ ...v, index: (v.index + 1) % imgs.length }));
            }
            else if (e.key === "ArrowLeft" && imgs.length > 1) {
                setFullScreenImage(v => ({ ...v, index: (v.index - 1 + imgs.length) % imgs.length }));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [imgs.length, onClose, setFullScreenImage]);
    const distance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const onPointerDown = e => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        const map = pointersRef.current;
        map.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
        if (map.size === 1) {
            dragRef.current = zoom > 1 ? { x: e.clientX, y: e.clientY, pan: { ...pan } } : null;
            swipeRef.current = { x: e.clientX, y: e.clientY };
        }
        if (map.size === 2) {
            const pts = [...map.values()];
            gestureRef.current = { dist: distance(pts[0], pts[1]), zoom, pan: { ...pan } };
            dragRef.current = null;
        }
    };
    const onPointerMove = e => {
        const map = pointersRef.current;
        if (!map.has(e.pointerId))
            return;
        e.preventDefault();
        e.stopPropagation();
        map.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
        if (map.size === 2 && gestureRef.current) {
            const pts = [...map.values()];
            const ratio = distance(pts[0], pts[1]) / Math.max(gestureRef.current.dist, 1);
            const nz = clampZoom(gestureRef.current.zoom * ratio);
            setZoom(nz);
            setPan(p => nz === 1 ? { x: 0, y: 0 } : clampPan(p));
            return;
        }
        if (dragRef.current && zoom > 1) {
            setPan(clampPan({ x: dragRef.current.pan.x + (e.clientX - dragRef.current.x), y: dragRef.current.pan.y + (e.clientY - dragRef.current.y) }));
        }
    };
    const onPointerUp = e => {
        e.preventDefault();
        e.stopPropagation();
        const map = pointersRef.current, start = swipeRef.current;
        if (start && map.size === 1 && !gestureRef.current) {
            const dx = e.clientX - start.x, dy = e.clientY - start.y;
            if (zoom === 1 && imgs.length > 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
                setFullScreenImage(v => ({ ...v, index: (v.index + (dx < 0 ? 1 : -1) + imgs.length) % imgs.length }));
            }
        }
        map.delete(e.pointerId);
        if (map.size < 2)
            gestureRef.current = null;
        if (map.size === 0) {
            dragRef.current = null;
            swipeRef.current = null;
        }
    };
    const onWheel = e => { e.preventDefault(); e.stopPropagation(); const next = clampZoom(zoom * (e.deltaY < 0 ? 1.12 : .89)); setZoom(next); if (next === 1)
        setPan({ x: 0, y: 0 });
    else
        setPan(clampPan(pan)); };
    const onDoubleClick = e => { e.preventDefault(); e.stopPropagation(); const next = zoom > 1 ? 1 : 2; setZoom(next); if (next === 1)
        setPan({ x: 0, y: 0 }); };
    const prev = e => { e.preventDefault(); e.stopPropagation(); if (imgs.length > 1)
        setFullScreenImage(v => ({ ...v, index: (v.index - 1 + imgs.length) % imgs.length })); };
    const next = e => { e.preventDefault(); e.stopPropagation(); if (imgs.length > 1)
        setFullScreenImage(v => ({ ...v, index: (v.index + 1) % imgs.length })); };
    if (!fullScreenImage)
        return null;
    return React.createElement("div", { className: "fixed inset-0 z-[300] image-lightbox flex items-center justify-center", onClick: onClose },
        React.createElement("div", { className: "image-lightbox-card", onClick: e => e.stopPropagation(), onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: onPointerUp, onPointerCancel: onPointerUp, onWheel: onWheel, onDoubleClick: onDoubleClick, style: { cursor: zoom > 1 ? "grab" : "default" } },
            React.createElement(CachedImage, { loading: "eager", src: imgs[index] || imgs[0], alt: "\u00DCr\u00FCn foto\u011Fraf\u0131", draggable: "false", style: { transform: `translate3d(${pan.x}px,${pan.y}px,0) scale(${zoom})`, transition: (dragRef.current || gestureRef.current) ? "none" : "transform .32s cubic-bezier(.22,1,.36,1)" } })),
        imgs.length > 1 && React.createElement(React.Fragment, null,
            React.createElement("button", { type: "button", className: "image-lightbox-nav left", onClick: prev, "aria-label": "\u00D6nceki foto\u011Fraf" },
                React.createElement("span", { style: { display: "flex", transform: "rotate(180deg)" } },
                    React.createElement(Icon, { type: "arrow", size: 22 }))),
            React.createElement("button", { type: "button", className: "image-lightbox-nav right", onClick: next, "aria-label": "Sonraki foto\u011Fraf" },
                React.createElement(Icon, { type: "arrow", size: 22 }))),
        imgs.length > 1 && React.createElement("div", { className: "lightbox-count", onClick: e => e.stopPropagation() },
            index + 1,
            " / ",
            imgs.length),
        React.createElement("button", { type: "button", className: "image-lightbox-close", onClick: e => { e.stopPropagation(); onClose(); }, "aria-label": "Kapat" },
            React.createElement(Icon, { type: "x", size: 22 })));
}
/* -------------------- ADMIN PIN (hash) --------------------
   PIN düz metin olarak hiçbir yerde saklanmaz ve JSON yedeğine girmez.
   PBKDF2-SHA256 (150.000 tur) + rastgele salt ile ayrı bir anahtarda tutulur. */
const PIN_HASH_KEY = "katalog_admin_pin_hash_v1";
const PIN_ITERATIONS = 150000;
function pinBytesToB64(bytes) { let s = ""; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s); }
function pinB64ToBytes(b64) { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++)
    out[i] = bin.charCodeAt(i); return out; }
async function derivePinHash(pin, salt, iterations = PIN_ITERATIONS) {
    if (!window.crypto?.subtle)
        throw new Error("Bu tarayıcı güvenli PIN doğrulamasını desteklemiyor (HTTPS gerekli).");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(pin)), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
    return new Uint8Array(bits);
}
function readPinRecord() {
    try {
        const r = JSON.parse(lsGet(PIN_HASH_KEY) || "null");
        return (r && r.salt && r.hash) ? r : null;
    }
    catch (_) {
        return null;
    }
}
function hasAdminPin() { return !!readPinRecord(); }
function isValidPin(pin) { return /^\d{4,8}$/.test(String(pin || "")); }
async function setAdminPin(pin) {
    if (!isValidPin(pin))
        throw new Error("PIN 4-8 haneli rakamlardan oluşmalıdır.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await derivePinHash(pin, salt);
    if (!lsSet(PIN_HASH_KEY, JSON.stringify({ v: 1, iter: PIN_ITERATIONS, salt: pinBytesToB64(salt), hash: pinBytesToB64(hash) })))
        throw new Error("PIN bu tarayıcıda kaydedilemedi (tarayıcı depolaması kapalı olabilir).");
}
async function verifyAdminPin(pin) {
    const rec = readPinRecord();
    if (!rec || !isValidPin(pin))
        return false;
    const calc = await derivePinHash(pin, pinB64ToBytes(rec.salt), Number(rec.iter) || PIN_ITERATIONS);
    const stored = pinB64ToBytes(rec.hash);
    if (calc.length !== stored.length)
        return false;
    let diff = 0;
    for (let i = 0; i < calc.length; i++)
        diff |= calc[i] ^ stored[i];
    return diff === 0;
}
/* Eski sürümde veri içinde tutulan PIN'i (1234 hariç) hash'e taşır. */
async function migrateLegacyPin(rawPin) {
    if (hasAdminPin())
        return;
    const p = String(rawPin ?? "").replace(/\D/g, "");
    if (isValidPin(p) && p !== "1234")
        await setAdminPin(p);
}
const PIN_LOCK_STORAGE_KEY = "katalog_pin_lock_v1";
/* Deneme sayacı modül düzeyinde tutulur (React yeniden çizimlerinde sıfırlanmaz)
   ve sayfa yenilemesine karşı localStorage'a yazılır. */
let pinFailureCount = 0, pinBlockedUntil = 0, pinCheckBusy = false;
try {
    const stored = JSON.parse(lsGet(PIN_LOCK_STORAGE_KEY) || "null");
    if (stored && Number.isFinite(stored.blockedUntil) && stored.blockedUntil > Date.now()) {
        pinBlockedUntil = stored.blockedUntil;
        pinFailureCount = SECURITY_LIMITS.pinAttempts;
    }
    else if (stored && Number.isFinite(stored.failures) && stored.failures > 0 && Date.now() - Number(stored.failedAt || 0) < 60 * 60 * 1000) {
        pinFailureCount = Math.min(stored.failures, SECURITY_LIMITS.pinAttempts - 1);
    }
    else if (stored) {
        lsRemove(PIN_LOCK_STORAGE_KEY);
    }
}
catch (_) { }
function persistPinLock() {
    try {
        lsSet(PIN_LOCK_STORAGE_KEY, JSON.stringify({ blockedUntil: pinBlockedUntil, failures: pinFailureCount, failedAt: Date.now() }));
    }
    catch (_) { }
}
function clearPinLock() {
    pinFailureCount = 0;
    pinBlockedUntil = 0;
    try {
        lsRemove(PIN_LOCK_STORAGE_KEY);
    }
    catch (_) { }
}
"use strict";
/* YENİ YÖNETİM PANELİ — çizgi ikonlar */
function AdmIcon({ name, size = 18 }) {
    const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" };
    switch (name) {
        case "grid": return React.createElement("svg", { ...p },
            React.createElement("rect", { x: "3", y: "3", width: "7", height: "9", rx: "1.5" }),
            React.createElement("rect", { x: "14", y: "3", width: "7", height: "5", rx: "1.5" }),
            React.createElement("rect", { x: "14", y: "12", width: "7", height: "9", rx: "1.5" }),
            React.createElement("rect", { x: "3", y: "16", width: "7", height: "5", rx: "1.5" }));
        case "box": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M20 7 12 3 4 7v10l8 4 8-4z" }),
            React.createElement("path", { d: "M4 7l8 4 8-4M12 11v10" }));
        case "tag": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M3 12V4h8l10 10-8 8z" }),
            React.createElement("circle", { cx: "7.5", cy: "7.5", r: "1.5" }));
        case "list": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M4 6h16M4 12h16M4 18h10" }));
        case "file": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
            React.createElement("path", { d: "M14 3v6h6M8 13h8M8 17h5" }));
        case "book": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" }),
            React.createElement("path", { d: "M9 7h6" }));
        case "palette": return React.createElement("svg", { ...p },
            React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
            React.createElement("circle", { cx: "8", cy: "10", r: "1" }),
            React.createElement("circle", { cx: "12", cy: "7.5", r: "1" }),
            React.createElement("circle", { cx: "16", cy: "10", r: "1" }),
            React.createElement("path", { d: "M12 21c-1.5 0-2-1-2-2s1-1.5 1-2.5-1-1.5-2-1.5" }));
        case "table": return React.createElement("svg", { ...p },
            React.createElement("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }),
            React.createElement("path", { d: "M3 10h18M9 4v16" }));
        case "cards": return React.createElement("svg", { ...p },
            React.createElement("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1.5" }),
            React.createElement("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1.5" }),
            React.createElement("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1.5" }),
            React.createElement("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1.5" }));
        case "plus": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M12 5v14M5 12h14" }));
        case "percent": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M19 5 5 19" }),
            React.createElement("circle", { cx: "7", cy: "7", r: "2.5" }),
            React.createElement("circle", { cx: "17", cy: "17", r: "2.5" }));
        case "search": return React.createElement("svg", { ...p },
            React.createElement("circle", { cx: "11", cy: "11", r: "7" }),
            React.createElement("path", { d: "m20 20-3.5-3.5" }));
        case "x": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M6 6l12 12M18 6 6 18" }));
        case "alert": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M12 9v4M12 17h.01" }),
            React.createElement("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" }));
        case "check": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "m5 12 5 5 9-10" }));
        case "image": return React.createElement("svg", { ...p },
            React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
            React.createElement("circle", { cx: "9", cy: "10", r: "2" }),
            React.createElement("path", { d: "m21 16-5-5-8 8" }));
        case "upload": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" }),
            React.createElement("path", { d: "M12 4v12M7 9l5-5 5 5" }));
        case "trash": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" }));
        case "eye": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" }),
            React.createElement("circle", { cx: "12", cy: "12", r: "3" }));
        case "up": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "m6 15 6-6 6 6" }));
        case "down": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "m6 9 6 6 6-6" }));
        case "star": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" }));
        case "clock": return React.createElement("svg", { ...p },
            React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
            React.createElement("path", { d: "M12 7v5l3 2" }));
        case "save": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
            React.createElement("path", { d: "M17 21v-8H7v8M7 3v5h8" }));
        case "grip": return React.createElement("svg", { ...p },
            React.createElement("circle", { cx: "9", cy: "6", r: "1.3" }),
            React.createElement("circle", { cx: "15", cy: "6", r: "1.3" }),
            React.createElement("circle", { cx: "9", cy: "12", r: "1.3" }),
            React.createElement("circle", { cx: "15", cy: "12", r: "1.3" }),
            React.createElement("circle", { cx: "9", cy: "18", r: "1.3" }),
            React.createElement("circle", { cx: "15", cy: "18", r: "1.3" }));
        case "logout": return React.createElement("svg", { ...p },
            React.createElement("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" }));
        default: return React.createElement("svg", { ...p },
            React.createElement("circle", { cx: "12", cy: "12", r: "9" }));
    }
}

function App() {
    const [data, setData] = useState(null), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [saved, setSaved] = useState(false), [toast, setToast] = useState(""), [activeCat, setActiveCat] = useState(null), [openCategories, setOpenCategories] = useState({}), [currencyMenuOpen, setCurrencyMenuOpen] = useState(false), [language, setLanguage] = useState(() => lsGet(LANG_KEY) === "EN" ? "EN" : "TR"), [adminSection, setAdminSection] = useState("panel"), [search, setSearch] = useState(""), [searchOpen, setSearchOpen] = useState(false), [viewCurrency, setViewCurrency] = useState(() => { try {
        const v = lsGet(VIEW_CURRENCY_KEY);
        return ["TRY", "USD", "EUR"].includes(v) ? v : null;
    }
    catch (_) {
        return null;
    } }), [adminSearch, setAdminSearch] = useState(""), [selectedProduct, setSelectedProduct] = useState(null), [detailGalleryIndex, setDetailGalleryIndex] = useState(0), [fullScreenImage, setFullScreenImage] = useState(null), [lightboxZoom, setLightboxZoom] = useState(1), [galleryIndex, setGalleryIndex] = useState({}), [panelOpen, setPanelOpen] = useState(false), [unlocked, setUnlocked] = useState(false), [tourStep, setTourStep] = useState(null), [tourRect, setTourRect] = useState(null), [pinModal, setPinModal] = useState(false), [pinInput, setPinInput] = useState(""), [pinError, setPinError] = useState(false), [logoFailed, setLogoFailed] = useState(false), [newPinInput, setNewPinInput] = useState(""), [busy, setBusy] = useState(false), [pdfBusy, setPdfBusy] = useState(false), [pdfPreview, setPdfPreview] = useState(null), [pdfPreviewUrl, setPdfPreviewUrl] = useState(null), [importRef, setImportRef] = useState(null);
    /* Yeni yönetim paneli durumu */
    const [admView, setAdmView] = useState("table"), [admSel, setAdmSel] = useState(() => new Set()), [admEdit, setAdmEdit] = useState(null), [admTab, setAdmTab] = useState("bilgi"), [admCat, setAdmCat] = useState(""), [admQuery, setAdmQuery] = useState(""), [admIssues, setAdmIssues] = useState(false), [admBulk, setAdmBulk] = useState({ mode: "pct", value: "" }), [admLimit, setAdmLimit] = useState(80), [admAddPick, setAdmAddPick] = useState(false), [admDrag, setAdmDrag] = useState(null);
    const admBaseRef = useRef(null);
    /* İskonto oranları: { TRY: 10, USD: 25, ... } — cihaza özel, sekme kapanınca sıfırlanır. */
    const [discountRates, setDiscountRates] = useState(() => discountLoad()), [discountOpen, setDiscountOpen] = useState(false);
    function setDiscountRate(cur, raw) {
        const digits = String(raw == null ? "" : raw).replace(/[^\d]/g, "").slice(0, 3);
        const val = digits === "" ? "" : Math.min(100, parseInt(digits, 10));
        setDiscountRates(prev => {
            const next = { ...prev, [cur]: val };
            discountSave(next);
            return next;
        });
    }
    const [aiCfg, setAiCfg] = useState(() => aiCfgLoad()), [aiTest, setAiTest] = useState("");
    useEffect(() => { document.documentElement.lang = language.toLowerCase(); }, [language]);
    useEffect(() => {
        /* Kart galerileri hepsi aynı anda değil, sırayla ve sakin bir tempoda döner.
           "Hareketi azalt" tercihi olan kullanıcılar ve arka plandaki sekmeler için durur. */
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (reduce)
            return;
        const multi = [];
        (data?.categories || []).forEach(c => (c.items || []).forEach(i => {
            const g = Array.isArray(i.images) && i.images.length ? i.images : (i.image ? [i.image] : []);
            if (g.length > 1)
                multi.push([i.id, g.length]);
        }));
        if (!multi.length)
            return;
        let cursor = 0;
        const timer = setInterval(() => {
            if (document.hidden || selectedProductRef.current)
                return;
            const [id, len] = multi[cursor % multi.length];
            cursor++;
            setGalleryIndex(prev => ({ ...prev, [id]: ((prev[id] || 0) + 1) % len }));
        }, Math.max(1800, Math.round(9000 / Math.min(multi.length, 5))));
        return () => clearInterval(timer);
    }, [data?.categories]);
    /* Büyük kataloglarda yazarken takılma olmasın: sonuç listesi bir adım geriden güncellenir. */
    const deferredSearch = useDeferredValue(search);
    const selectedProductRef = useRef(null);
    /* Yönetim oturumu: 15 dakika işlem yapılmazsa PIN tekrar sorulur. */
    const ADMIN_IDLE_MS = 15 * 60 * 1000, adminActivityRef = useRef(0);
    useEffect(() => {
        if (!panelOpen)
            return;
        const mark = () => { adminActivityRef.current = Date.now(); };
        mark();
        window.addEventListener("pointerdown", mark, true);
        window.addEventListener("keydown", mark, true);
        /* Açık paneldeki kaydedilmemiş işler kaybolmasın diye panel açıkken kilitlenmez; süre bir sonraki açılışta kontrol edilir. */
        return () => { window.removeEventListener("pointerdown", mark, true); window.removeEventListener("keydown", mark, true); mark(); };
    }, [panelOpen]);
    useEffect(() => { setLogoFailed(false); }, [data?.logo?.src]);
    const categoryBarRef = useRef(null), productsTopRef = useRef(null);
    /* Kategori değişince: seçilen çip yatayda ortalanır, sayfa yeni listenin BAŞINA kaydırılır
       (önceden kullanıcı eski kategorideki kaydırma konumunda kalıyor, yeni listenin ortasını görüyordu). */
    function goToCategory(id, btn) {
        setActiveCat(id);
        setOpenCategories({});
        requestAnimationFrame(() => { try {
            const sc = btn?.parentElement;
            if (sc && btn) {
                const r = btn.getBoundingClientRect(), sr = sc.getBoundingClientRect();
                sc.scrollTo({ left: Math.max(0, sc.scrollLeft + (r.left - sr.left) - (sc.clientWidth - r.width) / 2), behavior: "smooth" });
            }
            const anchor = productsTopRef.current, bar = categoryBarRef.current;
            if (!anchor || !bar)
                return;
            const target = window.scrollY + anchor.getBoundingClientRect().top - bar.getBoundingClientRect().bottom - 4;
            if (window.scrollY > target + 2)
                window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        }
        catch (_) { } });
    }
    const [pageScrolled, setPageScrolled] = useState(false), [barStuck, setBarStuck] = useState(false);
    useEffect(() => {
        /* Üst şerit ve kategori çubuğu arka planı yalnızca kaydırınca görünür; açılışta sayfanın degrade arka planı bozulmaz. */
        const onScroll = () => {
            setPageScrolled(window.scrollY > 12);
            const el = categoryBarRef.current;
            if (el) {
                const top = parseFloat(getComputedStyle(el).top) || 0;
                setBarStuck(el.getBoundingClientRect().top <= top + 1 && window.scrollY > 0);
            }
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
    }, [loading]);
    useEffect(() => { selectedProductRef.current = selectedProduct; }, [selectedProduct]);
    /* Açık pencere varken arka plan kaymasın; Esc ile en üstteki pencere kapansın. */
    useEffect(() => {
        const locked = !!(selectedProduct || fullScreenImage || pinModal || (panelOpen && unlocked));
        const html = document.documentElement, prevHtml = html.style.overflow, prevBody = document.body.style.overflow;
        if (locked) {
            html.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        }
        return () => { html.style.overflow = prevHtml; document.body.style.overflow = prevBody; };
    }, [selectedProduct, fullScreenImage, pinModal, panelOpen, unlocked]);
    useEffect(() => {
        const onKey = e => {
            if (e.key !== "Escape")
                return;
            if (fullScreenImage)
                return; /* lightbox kendi Esc davranışını yönetir */
            if (currencyMenuOpen) {
                setCurrencyMenuOpen(false);
                return;
            }
            if (selectedProduct) {
                setSelectedProduct(null);
                return;
            }
            if (pinModal) {
                setPinModal(false);
                return;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [fullScreenImage, currencyMenuOpen, selectedProduct, pinModal]);
    const panelOpenRef = useRef(false), languageRef = useRef(language), dataRef = useRef(data);
    /* TELEFONUN GERİ TUŞU: açık pencere (ürün detayı, büyük görsel, PDF ön izleme, PIN, yönetim paneli) varsa
       geri tuşu siteden çıkmak yerine en üstteki pencereyi kapatır. */
    const overlayDepth = (panelOpen ? 1 : 0) + (pinModal ? 1 : 0) + (selectedProduct ? 1 : 0) + (fullScreenImage ? 1 : 0) + (pdfPreview ? 1 : 0);
    const histDepthRef = useRef(0), popClosingRef = useRef(false), ignorePopRef = useRef(0);
    useEffect(() => {
        const h = histDepthRef.current;
        try {
            if (overlayDepth > h) {
                for (let i = h; i < overlayDepth; i++)
                    history.pushState({ ofOverlay: i + 1 }, "");
                histDepthRef.current = overlayDepth;
            }
            else if (overlayDepth < h) {
                histDepthRef.current = overlayDepth;
                if (popClosingRef.current)
                    popClosingRef.current = false;
                else {
                    ignorePopRef.current += 1;
                    history.go(-(h - overlayDepth));
                }
            }
        }
        catch (_) { }
    }, [overlayDepth]);
    useEffect(() => {
        const onPop = () => {
            if (ignorePopRef.current > 0) {
                ignorePopRef.current -= 1;
                return;
            }
            if (histDepthRef.current <= 0)
                return;
            popClosingRef.current = true;
            if (pdfPreview)
                closePdfPreview();
            else if (fullScreenImage)
                setFullScreenImage(null);
            else if (selectedProduct)
                setSelectedProduct(null);
            else if (pinModal)
                setPinModal(false);
            else if (panelOpen) {
                requestCloseAdminPanel().then(ok => {
                    if (ok)
                        return;
                    popClosingRef.current = false;
                    try {
                        history.pushState({ ofOverlay: histDepthRef.current }, "");
                    }
                    catch (_) { }
                });
            }
            else
                popClosingRef.current = false;
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    });
    useEffect(() => { panelOpenRef.current = panelOpen; }, [panelOpen]);
    useEffect(() => { languageRef.current = language; }, [language]);
    useEffect(() => { dataRef.current = data; }, [data]);
    useEffect(() => {
        if (!data || !selectedProduct)
            return;
        let fresh = null;
        for (const category of (data.categories || [])) {
            fresh = (category.items || []).find(item => item.id === selectedProduct.id);
            if (fresh)
                break;
        }
        if (!fresh) {
            setSelectedProduct(null);
            return;
        }
        setSelectedProduct(fresh);
    }, [data]);
    function cloneData(value) { return value ? JSON.parse(JSON.stringify(value)) : null; }
    const productTranslationTimers = useRef({});
    const productTranslationSeq = useRef({});
    const generalTranslationTimers = useRef({});
    const generalTranslationSeq = useRef({});
    const toastTimerRef = useRef(null);
    const categoryTranslationTimers = useRef({});
    const categoryTranslationSeq = useRef({});
    const pricePartTranslationTimers = useRef({});
    const pricePartTranslationSeq = useRef({});
    const panelSnapshot = useRef(null);
    /* EN METİNLERİ
       Ziyaretçinin tarayıcısında internet üzerinden çeviri YAPILMAZ (hız + sınır sorunları).
       Kayıtlı *_en alanları gösterilir; boşsa katalog sözlüğüyle anında çeviri yapılır (getText).
       Kalıcı ve kaliteli çeviri, yönetim panelindeki "İngilizce Çevirileri Tamamla" ile bir kez yapılır. */
    useEffect(() => {
        let cancelled = false;
        async function init() {
            try {
                /* Hızlı ilk ekran: localStorage */
                const fastLocal = readLocalRecord(DB_KEY) || readLocalRecord(BACKUP_KEY);
                setData(fastLocal?.data || defaultData());
                /* En güncel yerel kopya (localStorage / yedek / IndexedDB) */
                const best = await loadLocal();
                if (cancelled)
                    return;
                let initial = best?.data || fastLocal?.data || null;
                const freshStart = !initial;
                if (freshStart)
                    initial = window.SH21 ? defaultData() : blankTemplateData(await readLegacyCurrency());
                /* Kur kapalıyken ana fiyat alanı artık hep TL; eski kayıtta başka para birimi seçiliyse TL'ye çevrilir (veri kaybolmaz). */
                if (initial.currency && curEditId(initial) !== "TRY")
                    initial = switchEditCurrency(initial, "TRY");
                /* Apple görünümüne geçiş: eski kayıttaki tema bir kez Apple temasına çevrilir (arka plan görseli korunur). */
                let themeMigrated = false;
                if (Number(initial.themeRev) < 2) {
                    initial = { ...initial, theme: { ...THEMES[0], bgImage: initial.theme?.bgImage || null }, themeRev: 2 };
                    themeMigrated = true;
                }
                /* Eski sürümlerden kalan düz metin PIN'i güvenli hash'e taşı ve veriden sil. */
                try {
                    await migrateLegacyPin(best?.rawPin ?? fastLocal?.rawPin);
                }
                catch (e) {
                    console.warn("PIN taşınamadı:", e);
                }
                initial = sanitizeCatalogData(initial);
                if (!window.SH21 && (best || fastLocal || freshStart || themeMigrated))
                    await saveLocal(initial).catch(() => { });
                setData(initial);
                requestPersistentStorage().catch(() => { });
                setLanguage(lsGet(LANG_KEY) === "EN" ? "EN" : "TR");
                setActiveCat((initial?.categories || []).find(c => (c.items || []).length)?.id || initial?.categories?.[0]?.id || null);
            }
            catch (e) {
                console.error(e);
                setData(defaultData());
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        }
        init();
        return () => { cancelled = true; };
    }, []);
    /* Sayfa kapanırken katalog verisi otomatik kaydedilmez. Yalnızca kaydedilmemiş
       admin değişikliği varsa tarayıcı ayrılma uyarısı gösterebilir. */
    useEffect(() => {
        const warn = (event) => {
            if (!panelOpenRef.current || !panelSnapshot.current || !data)
                return;
            const dirty = JSON.stringify(normalizeData(data)) !== JSON.stringify(normalizeData(panelSnapshot.current));
            if (!dirty)
                return;
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [data]);
    /* OTOMATİK İNGİLİZCE ÇEVİRİ (arka planda, arayüzsüz)
       Kaydet'ten sonra çevrilmemiş tüm metinler AI ile sessizce çevrilir ve yerel kayda yazılır.
       Sıra: tarayıcının yerleşik AI modeli (varsa) → çevrimiçi çeviri servisi.
       Kaba sözlük sonucu kalıcı yazılmaz; bir sonraki kayıtta yeniden denenir. */
    const autoTranslateRunning = useRef(false);
    /* Açılışta ve internet geri geldiğinde yalnızca kuyrukta kalan (başarısız) çeviriler tekrar denenir. */
    useEffect(() => {
        if (!data)
            return;
        const run = () => {
            if (dataRef.current && navigator.onLine !== false) {
                /* Daha önce kaydedilmiş bozuk İngilizce metinler (makale gibi uzun çıktılar) bulunup yeniden çevrilir. */
                const bad = trMissingKeys(dataRef.current, true);
                if (bad.length) {
                    const set = trPendingLoad();
                    bad.forEach(k => set.add(k));
                    trPendingSave(set);
                }
            }
            if (trPendingLoad().size && navigator.onLine !== false && dataRef.current)
                autoTranslateMissing(dataRef.current).catch(() => { });
        };
        const tm = setTimeout(run, 2500);
        window.addEventListener("online", run);
        return () => { clearTimeout(tm); window.removeEventListener("online", run); };
    }, [!!data]);
    /* İngilizce çeviri çalıştırıcısı. Kaydet'ten hemen sonra başlar; çalışırken yeni kayıt gelirse (veya iş kaldıysa)
       kuyruk bitene kadar tekrar döner. Aynı anda 4 istek; dakikada 60 sınırını bekleyerek aşmaz. */
    const autoTranslateAgain = useRef(false), autoTranslateRetries = useRef(0), [trBusy, setTrBusy] = useState(0);
    async function autoTranslateMissing(snapshot, fresh = true) {
        if (!snapshot)
            return;
        if (fresh)
            autoTranslateRetries.current = 0;
        if (autoTranslateRunning.current) {
            autoTranslateAgain.current = true;
            return;
        }
        autoTranslateRunning.current = true;
        let rounds = 0;
        try {
            do {
                autoTranslateAgain.current = false;
                await autoTranslateRound(snapshot);
                rounds++;
            } while (autoTranslateAgain.current && rounds < 6);
        }
        finally {
            autoTranslateRunning.current = false;
            setTrBusy(0);
        }
        /* Başarısız kalanlar (çevrimdışı / servis meşgul) 15 sn arayla en fazla 3 kez daha denenir. */
        if (trPendingLoad().size && navigator.onLine !== false && autoTranslateRetries.current < 3) {
            autoTranslateRetries.current++;
            setTimeout(() => { if (dataRef.current)
                autoTranslateMissing(dataRef.current, false).catch(() => { }); }, 15000);
        }
    }
    /* "Eksik çevirileri tamamla": yalnızca İngilizcesi olmayan alanları kuyruğa alır ve çevirir; çevrilmişlere dokunmaz. */
    function translateMissingNow() {
        const d = dataRef.current;
        if (!d)
            return 0;
        if (navigator.onLine === false) {
            showToast("İnternet bağlantısı yok; bağlantı gelince tekrar deneyin.");
            return 0;
        }
        const keys = trMissingKeys(d);
        if (!keys.length) {
            showToast("Eksik çeviri yok, hepsi çevrilmiş.");
            return 0;
        }
        const set = trPendingLoad();
        keys.forEach(k => set.add(k));
        trPendingSave(set);
        showToast(keys.length + " alan çevriliyor…");
        autoTranslateMissing(d).catch(() => { });
        return keys.length;
    }
    async function autoTranslateRound(snapshot) {
        const snap = dataRef.current || snapshot;
        {
            /* Çeviri sadece YENİ veya DEĞİŞEN Türkçe metinler için yapılır. Her alanın çevrildiği Türkçe kaynak metin
               (name_src/desc_src/part.name_src) saklanır; kaynak değişmediyse alan bir daha çevrilmez, ağa hiç istek gitmez. */
            const isModelText = (tr) => /^[^\s]+$/.test(tr) && tr === tr.toLocaleUpperCase("tr-TR");
            const plain = (tr) => !/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(tr);
            const decide = (tr, en, src, isName) => {
                tr = String(tr ?? "").trim();
                en = String(en ?? "").trim();
                if (!tr)
                    return "none";
                if (src === tr && !trBadEn(tr, en))
                    return "none"; /* bu kaynak zaten işlendi */
                if (plain(tr) || (isName && isModelText(tr)))
                    return "mark"; /* sayı/kod ve tek kelimelik model adı çevrilmez */
                const hasEn = !!en && en !== tr && en !== translateFallbackSync(tr) && !/^(new product|new part|new category)$/i.test(en) && !trBadEn(tr, en);
                if (hasEn && !src)
                    return "mark"; /* eski kayıt: İngilizcesi var, sadece kaynağı işaretle */
                return "translate";
            };
            /* Tam site taraması YOK: yalnızca kuyruktaki (düzenlenen / eklenen, çevirisi henüz tamamlanmamış) alanlar işlenir. */
            const jobs = [];
            for (const pk of trPendingLoad()) {
                const [kind, a1, b1, c1] = pk.split("|");
                if (kind === "general") {
                    const tr = String(snap[a1] ?? "").trim();
                    if (tr)
                        jobs.push({ kind: "general", key: a1, tr, type: "general_" + a1, mode: "translate", pk });
                    else
                        trPendingRemove([pk]);
                    continue;
                }
                if (kind === "cat") {
                    const cc = (snap.categories || []).find(x => x.id === a1), tr = String(cc?.name ?? "").trim(), en = String(cc?.name_en ?? "").trim();
                    if (!cc || !tr || (en && en !== tr && !/^new category$/i.test(en) && !trBadEn(tr, en)))
                        trPendingRemove([pk]);
                    else
                        jobs.push({ kind: "cat", cid: a1, tr, type: "category", mode: "translate", pk });
                    continue;
                }
                const cat = (snap.categories || []).find(x => x.id === a1), it = cat && (cat.items || []).find(x => x.id === b1);
                if (!it) {
                    trPendingRemove([pk]);
                    continue;
                }
                if (kind === "item" && (c1 === "name" || c1 === "desc")) {
                    const mode = decide(it[c1], it[c1 + "_en"], it[c1 + "_src"], c1 === "name");
                    if (mode === "none")
                        trPendingRemove([pk]);
                    else
                        jobs.push({ kind: "item", cid: a1, iid: b1, key: c1, tr: String(it[c1] ?? "").trim(), type: c1, mode, pk, en: (mode === "mark" && trBadEn(it[c1], it[c1 + "_en"])) ? String(it[c1] ?? "").trim() : undefined });
                }
                else if (kind === "part") {
                    const part = normalizePrice(it.price).parts.find(x => x.id === c1);
                    if (!part) {
                        trPendingRemove([pk]);
                        continue;
                    }
                    const mode = decide(part.name, part.name_en, part.name_src, false);
                    if (mode === "none")
                        trPendingRemove([pk]);
                    else
                        jobs.push({ kind: "part", cid: a1, iid: b1, pid: c1, tr: String(part.name ?? "").trim(), type: "price_part", mode, pk, en: (mode === "mark" && trBadEn(part.name, part.name_en)) ? String(part.name ?? "").trim() : undefined });
                }
                else
                    trPendingRemove([pk]);
            }
            if (!jobs.length)
                return;
            /* Sonuçları EN GÜNCEL veriye yazar (kullanıcı arada başka şey düzenlese de parti atlanmaz); sadece Türkçe kaynağı
               hâlâ aynı olan alanlara yazılır. Çeviriler panel açıkken de HEMEN kalıcı kaydedilir:
               kullanıcının kaydedilmemiş başka düzenlemeleri varsa onlar kaydedilmez, yalnız çeviriler geri-dönüş noktasına işlenir. */
            const applyJobs = (obj, done) => {
                for (const j of done) {
                    if (j.kind === "cat") {
                        const cc = (obj.categories || []).find(x => x.id === j.cid);
                        if (cc && String(cc.name ?? "").trim() === j.tr && j.en) {
                            cc.name_en = j.en;
                            if (j.en === j.tr)
                                trSameAdd("cat|" + j.cid + "|" + j.tr);
                        }
                        continue;
                    }
                    if (j.kind === "general") {
                        if (String(obj[j.key] ?? "").trim() === j.tr && j.en) {
                            obj[j.key + "_en"] = j.en;
                            if (j.en === j.tr)
                                trSameAdd("general|" + j.key + "|" + j.tr);
                        }
                        continue;
                    }
                    const c = (obj.categories || []).find(x => x.id === j.cid);
                    if (!c)
                        continue;
                    const it = (c.items || []).find(x => x.id === j.iid);
                    if (!it)
                        continue;
                    if (j.kind === "item") {
                        if (String(it[j.key] ?? "").trim() === j.tr) {
                            if (j.en)
                                it[j.key + "_en"] = j.en;
                            it[j.key + "_src"] = j.tr;
                        }
                        continue;
                    }
                    const pr = normalizePrice(it.price);
                    const part = pr.parts.find(x => x.id === j.pid);
                    if (part && String(part.name ?? "").trim() === j.tr) {
                        if (j.en)
                            part.name_en = j.en;
                        part.name_src = j.tr;
                        it.price = pr;
                    }
                }
            };
            const applyBatch = async (done) => {
                const prev = dataRef.current;
                if (!prev || !done.length)
                    return;
                const baseRef = (typeof admBaseRef !== "undefined") ? admBaseRef : null;
                const wasClean = !panelOpenRef.current || !panelSnapshot.current || (baseRef && prev === baseRef.current) || JSON.stringify(prev) === JSON.stringify(panelSnapshot.current);
                const next = JSON.parse(JSON.stringify(prev));
                applyJobs(next, done);
                dataRef.current = next;
                setData(next);
                let toSave = next;
                if (panelOpenRef.current && panelSnapshot.current) {
                    if (wasClean) {
                        panelSnapshot.current = JSON.parse(JSON.stringify(next));
                        if (baseRef)
                            baseRef.current = next;
                    }
                    else {
                        const snapCopy = JSON.parse(JSON.stringify(panelSnapshot.current));
                        applyJobs(snapCopy, done);
                        panelSnapshot.current = snapCopy;
                        toSave = snapCopy;
                    }
                }
                try {
                    await saveLocal(toSave);
                    trPendingRemove(done.map(j => j.pk).filter(Boolean));
                }
                catch (_) { /* kayıt başarısızsa anahtarlar kuyrukta kalır, tekrar denenir */ }
            };
            /* Ağ isteği gerektirmeyen "işaretle" kayıtları tek seferde yazılır. */
            await applyBatch(jobs.filter(j => j.mode === "mark"));
            const queue = jobs.filter(j => j.mode === "translate");
            if (!queue.length)
                return;
            setTrBusy(queue.length);
            let batch = [], fails = 0, idx = 0, doneN = 0, lastApply = Date.now(), stop = false;
            const flushBatch = async (force) => {
                if (batch.length && (force || batch.length >= 20 || Date.now() - lastApply > 1200)) {
                    const b = batch;
                    batch = [];
                    lastApply = Date.now();
                    await applyBatch(b);
                }
            };
            const worker = async () => {
                while (!stop && idx < queue.length) {
                    const job = queue[idx++];
                    let cached = false;
                    try {
                        cached = !!lsGet(cacheKey(job.tr, job.type));
                    }
                    catch (_) { }
                    if (!cached)
                        await trWaitBudget();
                    try {
                        const r = await translateCachedResult(job.tr, job.type);
                        if (r.good && r.text && r.text.trim()) {
                            batch.push({ ...job, en: r.text.trim() });
                            fails = 0;
                        }
                        else if (++fails >= 6)
                            stop = true;
                    }
                    catch (_) {
                        if (++fails >= 6)
                            stop = true;
                    }
                    doneN++;
                    setTrBusy(Math.max(0, queue.length - doneN));
                    await flushBatch(false);
                    if (!cached)
                        await new Promise(r => setTimeout(r, 120));
                }
            };
            await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
            await flushBatch(true);
        }
    }
    function showToast(message) { setToast(message); if (toastTimerRef.current)
        clearTimeout(toastTimerRef.current); toastTimerRef.current = setTimeout(() => setToast(""), 3500); }
    /* Kalıcı kayıt yalnızca admin açıkça Kaydet ve Kapat'a bastığında yapılır. */
    function updateDataQuiet(callback) {
        setData(p => {
            if (!p)
                return p;
            const copy = JSON.parse(JSON.stringify(p));
            callback(copy);
            const next = sanitizeCatalogData(copy);
            const wasClean = !admBaseRef.current || p === admBaseRef.current;
            if (wasClean && panelSnapshot.current) {
                admBaseRef.current = next;
                panelSnapshot.current = JSON.parse(JSON.stringify(next));
                saveLocal(next).catch(() => { });
            }
            dataRef.current = next;
            return next;
        });
    }
    function updateData(callback) {
        setData(p => {
            if (!p)
                return p;
            /* Her değişiklikte normalizeData çalıştırmıyoruz; aksi halde kullanıcı alanı boşalttığında
               normalizeData tekrar varsayılan değeri yazar ve input sabitmiş gibi görünür. */
            const copy = JSON.parse(JSON.stringify(p));
            callback(copy);
            const protectedCopy = sanitizeCatalogData(copy);
            setSaved(false);
            /* Kalıcı kayıt yalnızca explicit Save ile yapılır. */
            return protectedCopy;
        });
    }
    function updateAiCfg(patch) {
        setAiCfg(prev => { const next = { ...prev, ...patch }; aiCfgSave(next); return next; });
        setAiTest("");
    }
    async function testAiTranslation() {
        setAiTest("Deneniyor…");
        try {
            const out = await claudeTranslate("Yönetici masası, 2 çekmeceli keson ile 180x90x75 cm", "product_description", { cfg: { ...aiCfg, provider: "claude" }, throwErrors: true });
            setAiTest(out ? "Çalışıyor: \u201C" + out + "\u201D" : "Yanıt alınamadı. Anahtarı kontrol edin.");
        }
        catch (e) {
            setAiTest("Hata: " + (e?.message || "bağlantı kurulamadı"));
        }
    }
    async function retranslateAll() {
        const cur = dataRef.current || data;
        if (!cur)
            return;
        if (navigator.onLine === false) {
            showToast("İnternet bağlantısı yok; bağlantı gelince tekrar deneyin.");
            return;
        }
        if (!(await uiConfirm("Kategori, ürün, açıklama ve fiyat kalemlerinin İngilizceleri silinip baştan çevrilir. Elle yazdığınız İngilizce metinler de yenilenir.", { title: "Tüm İngilizce metinler yeniden çevrilsin mi?", icon: "alert", okText: "Yeniden çevir" })))
            return;
        const next = JSON.parse(JSON.stringify(cur));
        for (const f of ["subtitle", "eyebrow"])
            next[f + "_en"] = "";
        for (const c of (next.categories || [])) {
            c.name_en = "";
            for (const it of (c.items || [])) {
                it.name_en = "";
                it.desc_en = "";
                delete it.name_src;
                delete it.desc_src;
                for (const pt of ((it.price && Array.isArray(it.price.parts)) ? it.price.parts : [])) {
                    pt.name_en = "";
                    delete pt.name_src;
                }
            }
        }
        const clean = sanitizeCatalogData(next);
        dataRef.current = clean;
        setData(clean);
        setSaved(false);
        const set = trPendingLoad();
        trMissingKeys(clean).forEach(k => set.add(k));
        trPendingSave(set);
        showToast(set.size + " alan yeniden çevriliyor…");
        autoTranslateMissing(clean).catch(() => { });
    }
    function setEditCurrency(next) {
        updateData(x => { const y = switchEditCurrency(x, next); Object.assign(x, y); });
        showToast(next === "TRY" ? "Fiyatları TL olarak giriyorsunuz." : `Fiyatları ${next} olarak giriyorsunuz.`);
    }
    function setCurrencyEnabled(on) {
        updateData(x => {
            const y = on ? switchEditCurrency(x, "TRY") : x;
            Object.assign(x, y);
            x.currency = { ...x.currency, enabled: !!on };
        });
        showToast(on ? "Kur açık: fiyatları TL girin, USD/EUR kurla hesaplanır." : "Kur kapalı: her para biriminin fiyatını ayrı girin.");
    }
    function admCurSwitch() {
        if (curEnabled(data))
            return null;
        return React.createElement("div", { className: "adm-seg", role: "group", "aria-label": "Fiyat girilen para birimi", title: "Fiyatları hangi para biriminde giriyorsunuz?" }, CURRENCIES.map(c => React.createElement("button", { key: c.id, type: "button", "aria-pressed": curEditId(data) === c.id, onClick: () => setEditCurrency(c.id) }, c.symbol + " " + c.name)));
    }
    /* TL vade oranı kutusu: yazılırken "12," gibi ara değerler kaybolmasın diye metin ayrı tutulur. */
    const [vadeRateText, setVadeRateText] = useState("");
    useEffect(() => {
        const r = data?.vade?.rate ?? null;
        setVadeRateText(prev => vadeRateValue(prev) === r ? prev : (r === null ? "" : String(r).replace(".", ",")));
    }, [data?.vade?.rate]);
    function changeVadeRate(raw) {
        const txt = String(raw ?? "").replace(/[^\d.,]/g, "").replace(/([.,].*)[.,]/g, "$1").slice(0, 6);
        setVadeRateText(txt);
        setPath(["vade", "rate"], vadeRateValue(txt));
    }
    /* Paket/m³/kg kutuları: hem ürün (parçasız) hem parça satırında aynı biçim. */
    function admLogiInputs(obj, onSet, keyPrefix) {
        return React.createElement("div", { className: "adm-logi" }, [["pkg", "Paket", "Örn. 2", "numeric"], ["m3", "Hacim m³", "Örn. 0,85", "decimal"], ["kg", "Ağırlık kg", "Örn. 45", "decimal"]].map(([k, label, ph, mode]) => React.createElement("label", { key: keyPrefix + k },
            React.createElement("small", null, label),
            /* NumField yazılan metni (örn. "0," → "0,85") korur; yalnızca geçerli sayıyı kaydeder. */
            React.createElement(NumField, { className: "adm-input", inputMode: mode, maxLength: 10, "aria-label": label, value: logiNumber(obj?.[k], k === "pkg" ? 0 : k === "m3" ? 3 : 2), placeholder: ph, parse: v => k === "pkg" ? (/^\s*\d+\s*$/.test(v) ? logiNumber(v, 0) : null) : logiNumber(v, k === "m3" ? 3 : 2), format: v => String(v).replace(".", ","), onValue: v => onSet(k, v) }))));
    }
    function setPath(path, value) { updateData(copy => { let target = copy; for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        target[key] = { ...(target[key] || {}) };
        target = target[key];
    } target[path[path.length - 1]] = value; }); }
    /* Genel TR alanları EN alanlarını otomatik takip eder.
       Kullanıcı Türkçe metni yazmayı bıraktığında kısa bir gecikmeyle çeviri yapılır;
       Türkçe alan tamamen silinirse EN alanı da anında temizlenir. */
    function editGeneralTurkishField(field, value) {
        const enField = field + "_en";
        if (generalTranslationTimers.current[field])
            clearTimeout(generalTranslationTimers.current[field]);
        generalTranslationSeq.current[field] = (generalTranslationSeq.current[field] || 0) + 1;
        const seq = generalTranslationSeq.current[field];
        updateData(copy => { copy[field] = value; if (!value.trim())
            copy[enField] = ""; });
        if (!value.trim())
            return;
        trPendingAdd("general|" + field);
        generalTranslationTimers.current[field] = setTimeout(async () => {
            try {
                const tr_1 = await translateCachedResult(value, "general_" + field);
                const en = tr_1.good ? tr_1.text : "";
                if (generalTranslationSeq.current[field] !== seq)
                    return;
                if (en)
                    trPendingRemove(["general|" + field]);
                updateDataQuiet(copy => {
                    if (copy[field] === value)
                        copy[enField] = en || "";
                });
            }
            catch (e) {
                console.warn("Otomatik genel alan çevirisi başarısız:", e);
            }
        }, 350);
    }
    function toggleCategory(id) { setOpenCategories(p => ({ ...p, [id]: !p[id] })); }
    function openCategory(id) { setOpenCategories(p => ({ ...p, [id]: true })); }
    function viewCurrencyData() {
        /* Ziyaretçinin para birimi seçimi kataloğun varsayılanını DEĞİŞTİRMEZ; ayrı saklanır. */
        if (!data)
            return data;
        const avail = availableCurrencies(data);
        let cur = (!panelOpen && viewCurrency) ? viewCurrency : data.currency?.selected;
        if (!avail.includes(cur))
            cur = avail.includes(data.currency?.selected) ? data.currency.selected : avail[0];
        /* İskonto yalnızca site görünümünde (panel kapalıyken), özellik açıkken ve bu para birimi izinliyken uygulanır. */
        const disc = (!panelOpen && data.discount?.enabled && data.discount?.currencies?.[cur] !== false)
            ? (Number(discountRates[cur]) || 0) : 0;
        /* TL vade yalnızca site görünümünde ve TL seçiliyken uygulanır (USD/EUR ve panel önizlemesi etkilenmez). */
        const vade = (!panelOpen && cur === "TRY" && data.vade?.enabled) ? (vadeRateValue(data.vade?.rate) || 0) : 0;
        return { ...data, currency: { ...(data.currency || {}), selected: cur }, __discount: disc, __vade: vade };
    }
    function getCurrency() { return getCurrencyByData(viewCurrencyData()); }
    function convertPrice(amount) { return convertPriceByData(viewCurrencyData(), amount); }
    function formatAmount(amount) { return formatAmountByData(viewCurrencyData(), amount); }
    function formatVade(amount) { return formatVadeByData(viewCurrencyData(), amount); }
    function vadeLabel() { return vadeLabelOf(data, language); }
    function vadeOn() { return vadeRateOf(viewCurrencyData()) > 0; }
    function chooseViewCurrency(id) {
        setViewCurrency(id);
        lsSet(VIEW_CURRENCY_KEY, id);
    }
    function priceText(part) {
        if (!part || part.contactOnly || part.amount === null || part.amount === undefined || part.amount === "")
            return t(language, "contactPrice");
        return formatAmount(part.amount) || t(language, "contactPrice");
    }
    function productMainPrice(item) {
        const total = priceTotal(item?.price);
        return total !== null ? (formatAmount(total) || t(language, "contactPrice")) : null;
    }
    function switchLanguage(next) {
        /* TR ve EN kesin olarak aynı ana sayfa JSX'ini kullanır; yalnızca metin dili değişir. */
        document.documentElement.lang = next.toLowerCase();
        setLanguage(next);
        lsSet(LANG_KEY, next);
        setSearch("");
        setSelectedProduct(null);
        setFullScreenImage(null);
        setCurrencyMenuOpen(false);
        setOpenCategories({});
        setActiveCat(prev => {
            if (prev)
                return prev;
            return data?.categories?.[0]?.id || null;
        });
    }
    function addCategory(name) {
        const nm = safeText(String(name ?? "").replace(/\s+/g, " ").trim(), 120);
        if (!nm)
            return null;
        const id = categorySlug(nm) + "-" + uid().slice(0, 5);
        updateData(x => { x.categories = [...(x.categories || []), { id, name: nm, name_en: "", items: [], coverImage: null }]; });
        renameCategory(id, nm);
        return id;
    }
    async function promptAddCategory() {
        const nm = await uiPrompt("Yeni kategori", { message: "Kategori adını yazın. Sitede, fiyat listesinde ve katalogda bu adla görünür.", placeholder: "Örn. OFİS KOLTUKLARI", okText: "Kategori Ekle", icon: "plus", requiredText: "Kategori adı boş olamaz." });
        if (nm === null)
            return null;
        const id = addCategory(nm);
        if (!id)
            showToast("Kategori adı boş olamaz.");
        else
            showToast("Kategori eklendi. Kalıcı olması için \u201CKaydet ve yayınla\u201D.");
        return id;
    }
    async function deleteCategory(id) {
        const cat = (data?.categories || []).find(c => c.id === id);
        if (!cat)
            return;
        const n = (cat.items || []).length;
        if (!(await uiConfirm(n ? "İçindeki " + n + " ürün de silinecek. Bu işlem \u201CKaydet ve yayınla\u201D sonrası geri alınamaz." : "Bu kategori kalıcı olarak kaldırılacak.", { title: "\u201C" + (cat.name || "Kategori") + "\u201D silinsin mi?", danger: true, okText: "Kategoriyi Sil" })))
            return;
        try {
            updateData(x => { x.categories = (x.categories || []).filter(c => c.id !== id); });
            setOpenCategories(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
            setActiveCat(prev => prev === id ? null : prev);
            setAdmCat(prev => prev === id ? "" : prev);
            showToast(language === "EN" ? "Category deleted." : "Kategori silindi.");
        }
        catch (e) {
            console.error(e);
            showToast(language === "EN" ? "Delete failed." : "Silme işlemi başarısız.");
        }
    }
    function renameCategoryEn(id, value) {
        updateData(x => { x.categories = x.categories.map(c => c.id === id ? { ...c, name_en: value } : c); });
    }
    function renameCategory(id, value) {
        const key = String(id);
        if (categoryTranslationTimers.current[key])
            clearTimeout(categoryTranslationTimers.current[key]);
        categoryTranslationSeq.current[key] = (categoryTranslationSeq.current[key] || 0) + 1;
        const seq = categoryTranslationSeq.current[key];
        updateData(x => { x.categories = x.categories.map(c => c.id === id ? { ...c, name: value, ...(!value.trim() ? { name_en: "" } : {}) } : c); });
        if (!value.trim())
            return;
        categoryTranslationTimers.current[key] = setTimeout(async () => {
            try {
                const tr_2 = await translateCachedResult(value, "category");
                const en = tr_2.good ? tr_2.text : "";
                if (categoryTranslationSeq.current[key] !== seq)
                    return;
                updateDataQuiet(x => { x.categories = x.categories.map(c => c.id === id && c.name === value ? { ...c, name_en: en || "" } : c); });
            }
            catch (e) {
                console.warn("Kategori otomatik çevirisi başarısız:", e);
            }
        }, 350);
    }
    async function moveCategory(id, direction) {
        updateData(x => { const l = [...x.categories], i = l.findIndex(a => a.id === id), j = i + direction; if (i < 0 || j < 0 || j >= l.length)
            return; [l[i], l[j]] = [l[j], l[i]]; x.categories = l; });
    }
    function addItem(categoryId) {
        const item = { id: uid(), isDemo: true, name: "Yeni Ürün", name_en: "New Product", desc: "", desc_en: "", dims: "", dims_en: "", image: null, price: { contactOnly: true, amount: null, manualTotal: null, autoCollect: true, parts: [] } };
        updateData(x => { x.categories = x.categories.map(c => c.id === categoryId ? { ...c, items: [...c.items, item] } : c); });
        openCategory(categoryId);
        if (adminSearch)
            setAdminSearch("");
        /* Yeni ürün listenin sonuna eklenir: oraya kaydır ve ad alanını seçili halde odakla. */
        setTimeout(() => { try {
            const box = document.getElementById("product-image-" + categoryId + "-" + item.id)?.closest(".bg-neutral-800.rounded-xl");
            if (!box)
                return;
            box.scrollIntoView({ behavior: "smooth", block: "center" });
            const inp = box.querySelector('input[aria-label="Ürün adı"]');
            if (inp) {
                inp.focus({ preventScroll: true });
                inp.select();
            }
        }
        catch (_) { } }, 120);
        return item.id;
    }
    function updateItem(categoryId, itemId, field, value) {
        updateData(x => {
            x.categories = x.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => {
                    if (i.id !== itemId)
                        return i;
                    const next = { ...i, [field]: value };
                    if (["name", "desc", "dims", "image", "price"].includes(field)) {
                        const meaningful = field === "image" ? !!value : field === "price" ? pdfHasRealProductData({ ...i, price: value }) : String(value ?? "").trim().length > 0;
                        if (meaningful)
                            next.isDemo = false;
                    }
                    return next;
                }) });
        });
    }
    function editTurkishField(categoryId, item, field, value) {
        const key = categoryId + "::" + item.id + "::" + field;
        if (productTranslationTimers.current[key])
            clearTimeout(productTranslationTimers.current[key]);
        productTranslationSeq.current[key] = (productTranslationSeq.current[key] || 0) + 1;
        const seq = productTranslationSeq.current[key];
        updateItem(categoryId, item.id, field, value);
        if (!value.trim()) {
            updateItem(categoryId, item.id, field + "_en", "");
            return;
        }
        /* Put an immediate deterministic EN value on new/edited Turkish text.
           The async translator then replaces it with a better translation when available. */
        const instantEn = translateFallbackSync(value);
        if (instantEn && instantEn !== value)
            updateItem(categoryId, item.id, field + "_en", instantEn);
        trPendingAdd("item|" + categoryId + "|" + item.id + "|" + field);
        productTranslationTimers.current[key] = setTimeout(async () => {
            try {
                const tr_3 = await translateCachedResult(value, field);
                const en = tr_3.good ? tr_3.text : "";
                if (productTranslationSeq.current[key] !== seq)
                    return;
                if (en)
                    trPendingRemove(["item|" + categoryId + "|" + item.id + "|" + field]);
                updateDataQuiet(x => { x.categories = x.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => i.id === item.id && i[field] === value ? { ...i, [field + "_en"]: en || "", ...(en ? { [field + "_src"]: value } : {}) } : i) }); });
            }
            catch (e) {
                console.warn("Ürün otomatik çevirisi başarısız:", e);
            }
        }, 350);
    }
    function finishTurkishField(categoryId, item, field, value) { return; }
    async function deleteItem(categoryId, itemId) {
        if (!(await uiConfirm("Ürün, fotoğrafları ve fiyatlarıyla birlikte kaldırılacak.", { title: "Ürün silinsin mi?", danger: true })))
            return;
        const next = normalizeData(data);
        next.categories = next.categories.map(c => c.id === categoryId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c);
        setData(next);
        setSelectedProduct(prev => prev?.id === itemId ? null : prev);
        showToast(language === "EN" ? "Product deleted." : "Ürün silindi.");
    }
    function moveItem(categoryId, itemId, direction) {
        updateData(x => { x.categories = x.categories.map(c => { if (c.id !== categoryId)
            return c; const l = [...c.items], i = l.findIndex(a => a.id === itemId), j = i + direction; if (i < 0 || j < 0 || j >= l.length)
            return c; [l[i], l[j]] = [l[j], l[i]]; return { ...c, items: l }; }); });
    }
    function addPricePart(categoryId, itemId) {
        const part = { id: uid(), name: "Yeni Parça", name_en: "New Part", dims: "", dims_en: "", amount: null, contactOnly: false };
        updateData(x => { x.categories = x.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => { if (i.id !== itemId)
                return i; const p = normalizePrice(i.price); return { ...i, price: { ...p, contactOnly: false, parts: [...p.parts, part] } }; }) }); });
    }
    function setPriceAutoCollect(categoryId, itemId, enabled) {
        updateData(x => {
            x.categories = x.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => {
                    if (i.id !== itemId)
                        return i;
                    const p = normalizePrice(i.price);
                    if (enabled)
                        return { ...i, price: { ...p, autoCollect: true } };
                    const current = priceTotal({ ...p, autoCollect: true });
                    const manual = p.manualTotal !== null ? p.manualTotal : current;
                    return { ...i, price: { ...p, autoCollect: false, manualTotal: manual } };
                }) });
        });
    }
    function updatePricePart(categoryId, itemId, partId, field, value) {
        if (field !== "name") {
            updateData(x => { x.categories = x.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => { if (i.id !== itemId)
                    return i; const p = normalizePrice(i.price); return { ...i, price: { ...p, parts: p.parts.map(part => part.id === partId ? { ...part, [field]: value } : part) } }; }) }); });
            return;
        }
        const key = categoryId + "::" + itemId + "::" + partId;
        if (pricePartTranslationTimers.current[key])
            clearTimeout(pricePartTranslationTimers.current[key]);
        pricePartTranslationSeq.current[key] = (pricePartTranslationSeq.current[key] || 0) + 1;
        const seq = pricePartTranslationSeq.current[key];
        updateData(x => { x.categories = x.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => { if (i.id !== itemId)
                return i; const p = normalizePrice(i.price); return { ...i, price: { ...p, parts: p.parts.map(part => part.id === partId ? { ...part, name: value, ...(!value.trim() ? { name_en: "" } : { name_en: translateFallbackSync(value) }) } : part) } }; }) }); });
        if (!value.trim())
            return;
        trPendingAdd("part|" + categoryId + "|" + itemId + "|" + partId);
        pricePartTranslationTimers.current[key] = setTimeout(async () => {
            try {
                const tr_4 = await translateCachedResult(value, "price_part");
                const en = tr_4.good ? tr_4.text : "";
                if (pricePartTranslationSeq.current[key] !== seq)
                    return;
                if (en)
                    trPendingRemove(["part|" + categoryId + "|" + itemId + "|" + partId]);
                updateDataQuiet(x => { x.categories = x.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => { if (i.id !== itemId)
                        return i; const p = normalizePrice(i.price); return { ...i, price: { ...p, parts: p.parts.map(part => part.id === partId && part.name === value ? { ...part, name_en: en || "", ...(en ? { name_src: value } : {}) } : part) } }; }) }); });
            }
            catch (e) {
                console.warn("Fiyat parçası otomatik çevirisi başarısız:", e);
            }
        }, 350);
    }
    async function deletePricePart(categoryId, itemId, partId) {
        const next = normalizeData(data);
        next.categories = next.categories.map(c => c.id !== categoryId ? c : { ...c, items: c.items.map(i => {
                if (i.id !== itemId)
                    return i;
                const p = normalizePrice(i.price);
                return { ...i, price: { ...p, parts: p.parts.filter(part => part.id !== partId) } };
            }) });
        setData(next);
    }
    async function save(keepOpen = false) {
        if (!data || saving)
            return;
        const clean = sanitizeCatalogData(data);
        setSaving(true);
        try {
            /* Yerel kayıt: localStorage + IndexedDB (bu cihaz). */
            const result = await saveLocal(clean);
            dataRef.current = result.data;
            setData(result.data);
            /* Kaydın ardından eksik İngilizce metinler arka planda otomatik çevrilir. */
            setTimeout(() => { autoTranslateMissing(result.data).catch(() => { }); }, 0);
            if (keepOpen === true) {
                /* Yeni panel: kaydettikten sonra panel açık kalır; geri dönüş noktası güncellenir. */
                panelSnapshot.current = JSON.parse(JSON.stringify(result.data));
                admBaseRef.current = result.data;
            }
            else {
                panelSnapshot.current = null;
                setPanelOpen(false);
            }
            setSaved(true);
            showToast(window.SH21 ? (language === "EN" ? "Saved — your catalog is live." : "Kaydedildi — katalog yayında.") : STORAGE_OK ? t(language, 'saved') : "Kaydedildi (yalnızca bu oturumda). Kalıcı kayıt için dosyayı kendi sitenize yükleyin.");
            setTimeout(() => setSaved(false), 1200);
        }
        catch (e) {
            console.error("KAYIT HATASI:", e);
            showToast((language === "EN" ? "Save failed: " : "Kaydetme başarısız: ") + (e?.message || "") + "");
        }
        finally {
            setSaving(false);
        }
    }
    const logoPressTimer = useRef(null);
    function startLogoLongPress(e) {
        if (e?.button !== undefined && e.button !== 0)
            return;
        if (logoPressTimer.current)
            clearTimeout(logoPressTimer.current);
        logoPressTimer.current = setTimeout(() => {
            logoPressTimer.current = null;
            openAdmin();
        }, 2000);
    }
    function cancelLogoLongPress() {
        if (logoPressTimer.current) {
            clearTimeout(logoPressTimer.current);
            logoPressTimer.current = null;
        }
    }
    function openAdmin() { if (window.SH21) {
        SH21.requireAdmin().then(ok => { if (!ok)
            return; adminActivityRef.current = Date.now(); setUnlocked(true); panelSnapshot.current = JSON.parse(JSON.stringify(dataRef.current || data)); admBaseRef.current = dataRef.current || data; setPanelOpen(true); });
        return;
    } if (unlocked && Date.now() - adminActivityRef.current > ADMIN_IDLE_MS) {
        setUnlocked(false);
        setPinInput("");
        setPinError(false);
        setPinModal(true);
        return;
    } if (unlocked) {
        adminActivityRef.current = Date.now();
        panelSnapshot.current = JSON.parse(JSON.stringify(data));
        admBaseRef.current = data;
        setPanelOpen(true);
        return;
    } setPinInput(""); setPinError(false); setPinModal(true); }
    function hasUnsavedPanelChanges() {
        try {
            return !!panelSnapshot.current && JSON.stringify(panelSnapshot.current) !== JSON.stringify(data);
        }
        catch (_) {
            return true;
        }
    }
    /* Kaydedilmemiş değişiklik varken panel dışına / X'e dokunulursa önce sorulur (önceden sessizce siliniyordu). */
    async function requestCloseAdminPanel() {
        if (hasUnsavedPanelChanges() && !(await uiConfirm("Kaydetmeden kapatırsanız yaptığınız değişiklikler kaybolur. Kaydetmek için Vazgeç'e, sonra \u201CKaydet ve yayınla\u201Dya basın.", { title: "Kaydedilmemiş değişiklikler var", icon: "alert", okText: "Kaydetmeden Kapat", danger: true })))
            return false;
        closeAdminPanel(true);
        return true;
    }
    function closeAdminPanel(discard = true) {
        if (discard && panelSnapshot.current) {
            setData(panelSnapshot.current);
        }
        panelSnapshot.current = null;
        setSaved(false);
        setPanelOpen(false);
    }
    function uploadLogoLocal(e) { const file = e.target.files?.[0]; if (!file)
        return; try {
        validateUploadFile(file, { maxBytes: 8 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] });
        if (!consumeClientRateLimit("admin:logo-upload", 10, 60 * 1000))
            throw new Error("Çok fazla yükleme. Biraz bekleyin.");
    }
    catch (err) {
        showToast(err.message || "Geçersiz dosya.");
        e.target.value = "";
        return;
    } const reader = new FileReader(); reader.onload = () => { const src = safeAssetSource(reader.result); if (!src) {
        showToast("Geçersiz görsel.");
        return;
    } updateData(x => { x.logo = { ...x.logo, src }; }); showToast("Logo yüklendi. Kaydet'e basın."); }; reader.onerror = () => showToast("Logo yüklenemedi."); reader.readAsDataURL(file); e.target.value = ""; }
    async function uploadPdfCoverLogo(e) { const file = e.target.files?.[0]; if (!file)
        return; try {
        const src = await pdfLogoToTransparentDataURL(file);
        updateData(x => { x.pdf = { ...x.pdf, coverLogo: { src } }; });
        showToast("PDF kapak logosu yüklendi. Kaydet'e basın.");
    }
    catch (err) {
        showToast("PDF kapak logosu yüklenemedi.");
    }
    finally {
        e.target.value = "";
    } }
    async function pdfLogoToTransparentDataURL(file) {
        validateUploadFile(file, { maxBytes: 8 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] });
        if (file.type.includes("svg")) {
            return await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(r.error); r.readAsDataURL(file); });
        }
        const raw = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(r.error); r.readAsDataURL(file); });
        const img = await new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => reject(new Error("Logo açılamadı")); im.src = raw; });
        const max = 1800, scale = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
        c.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const d = ctx.getImageData(0, 0, c.width, c.height), px = d.data;
        for (let i = 0; i < px.length; i += 4) {
            const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3];
            const min = Math.min(r, g, b), maxc = Math.max(r, g, b);
            if (a > 0 && min > 238 && maxc - min < 18)
                px[i + 3] = 0;
            else if (a > 0 && min > 220 && maxc - min < 22)
                px[i + 3] = Math.round(a * ((255 - min) / 35));
        }
        ctx.putImageData(d, 0, 0);
        return c.toDataURL("image/png");
    }
    /* Tam sayfa giriş / kapanış kapağı: JPG/PNG/WEBP, uzun kenar ≤ 2400 px, ~900 KB'a sıkıştırılır. */
    const PDF_PAGE_IMAGE_FIELDS = { coverImage: "Giriş kapağı", closingImage: "Kapanış kapağı" };
    async function uploadPdfPageImage(field, e) {
        const file = e.target.files?.[0];
        if (!file || !PDF_PAGE_IMAGE_FIELDS[field]) {
            if (e.target)
                e.target.value = "";
            return;
        }
        try {
            validateUploadFile(file, { types: ["image/jpeg", "image/png", "image/webp"] });
            await enforceClientRateLimit("admin:pdf-page-image", 10, 60 * 1000);
            const src = safePdfPageImageSource(await fileToOptimizedDataURL(file, 2400, 900));
            if (!src)
                throw new Error("Geçersiz görsel.");
            updateData(x => { x.pdf = { ...x.pdf, [field]: src }; });
            showToast(PDF_PAGE_IMAGE_FIELDS[field] + " görseli yüklendi. Kaydet'e basın.");
        }
        catch (err) {
            showToast(PDF_PAGE_IMAGE_FIELDS[field] + " yüklenemedi: " + (err?.message || "geçersiz dosya."));
        }
        finally {
            e.target.value = "";
        }
    }
    async function resetPdfPageImage(field) {
        if (!PDF_PAGE_IMAGE_FIELDS[field])
            return;
        const isCover = field === "coverImage";
        if (!(await uiConfirm(isCover ? "Yüklenen görsel kaldırılır; PDF'lerde varsayılan siyah logolu kapak kullanılır." : "Yüklenen görsel kaldırılır; PDF'lerde varsayılan ikonlu kapanış sayfası kullanılır.", { title: PDF_PAGE_IMAGE_FIELDS[field] + " varsayılana dönsün mü?", danger: true, okText: "Varsayılana Dön" })))
            return;
        setPath(["pdf", field], "");
    }
    async function removePdfCoverLogo() { if (!(await uiConfirm("PDF kapağında logo görünmeyecek.", { title: "PDF kapak logosu kaldırılsın mı?", danger: true, okText: "Kaldır" })))
        return; setPath(["pdf", "coverLogo"], null); }
    /* Fotoğraf sıkıştırma: WebP, uzun kenar en fazla maxSize px; kalite 0,92’den 0,76’ya kadar düşürülerek hedef boyuta (KB) inilir.
       Hedefe ulaşılamazsa görsel %10 küçültülür ama uzun kenar 1280 px altına inmez. WebP desteklenmiyorsa JPEG'e düşer. */
    async function fileToOptimizedDataURL(file, maxSize = 1200, targetKB = 80) {
        validateUploadFile(file);
        const readAsDataURL = () => new Promise((resolve, reject) => { const r = new FileReader(); r.onerror = () => reject(r.error || new Error("Dosya okunamadı")); r.onload = () => resolve(r.result); r.readAsDataURL(file); });
        const loadImage = src => new Promise((resolve, reject) => { const img = new Image(); img.onerror = () => reject(new Error("Görsel açılamadı")); img.onload = () => resolve(img); img.src = src; });
        const img = await loadImage(await readAsDataURL());
        const target = Math.max(20, targetKB) * 1024 * 1.37; /* base64 ≈ ikili boyutun 1,37 katı */
        let scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        let best = "";
        for (let round = 0; round < 4; round++) {
            const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, w, h);
            let mime = "image/webp";
            if (!canvas.toDataURL("image/webp", .8).startsWith("data:image/webp"))
                mime = "image/jpeg";
            for (const q of [.92, .88, .84, .8, .76]) {
                const out = canvas.toDataURL(mime, q);
                best = out;
                if (out.length <= target)
                    return out;
            }
            if (Math.max(w, h) * .9 < Math.min(1280, maxSize))
                break; /* netlik için uzun kenar 1280 px altına inmez */
            scale *= .9;
        }
        return best;
    }
    async function uploadProductImage(categoryId, itemId, e) {
        const files = Array.from(e.target.files || []);
        if (!files.length)
            return;
        try {
            if (files.length > SECURITY_LIMITS.imageCount)
                throw new Error(`En fazla ${SECURITY_LIMITS.imageCount} görsel seçebilirsiniz.`);
            const valid = files.filter(f => { try {
                validateUploadFile(f);
                return true;
            }
            catch (_) {
                return false;
            } });
            if (!valid.length)
                throw new Error("Lütfen görsel dosyaları seçin.");
            const srcs = await Promise.all(valid.map(f => fileToOptimizedDataURL(f, 1600, 250)));
            const item = (data.categories.find(c => c.id === categoryId)?.items || []).find(i => i.id === itemId);
            const current = Array.isArray(item?.images) ? item.images.filter(Boolean) : (item?.image ? [item.image] : []);
            const images = [...current, ...srcs];
            updateItem(categoryId, itemId, "images", images);
            updateItem(categoryId, itemId, "image", images[0] || null);
            showToast(srcs.length > 1 ? `${srcs.length} fotoğraf eklendi. Kaydet'e basın.` : "Fotoğraf eklendi. Kaydet'e basın.");
        }
        catch (err) {
            console.error(err);
            showToast("Fotoğraf yüklenemedi: " + (err.message || "Dosya hatası"));
        }
        finally {
            e.target.value = "";
        }
    }
    async function removeProductImage(categoryId, itemId, index = 0) {
        const item = (data.categories.find(c => c.id === categoryId)?.items || []).find(i => i.id === itemId);
        const current = Array.isArray(item?.images) ? item.images.filter(Boolean) : (item?.image ? [item.image] : []);
        if (!current.length)
            return;
        if (!(await uiConfirm("Fotoğraf bu üründen kaldırılacak.", { title: "Fotoğraf kaldırılsın mı?", danger: true, okText: "Kaldır" })))
            return;
        const images = current.filter((_, i) => i !== index);
        updateItem(categoryId, itemId, "images", images);
        updateItem(categoryId, itemId, "image", images[0] || null);
        showToast("Fotoğraf kaldırıldı. Kaydet'e basın.");
    }
    async function uploadPartImage(categoryId, itemId, partId, e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            validateUploadFile(file);
            await enforceClientRateLimit("admin:part-image-upload", 20, 60 * 1000);
            const src = await fileToOptimizedDataURL(file, 1280, 150);
            updatePricePart(categoryId, itemId, partId, "image", src);
            updateItem(categoryId, itemId, "isDemo", false);
            showToast("Model fotoğrafı eklendi. Kaydet'e basın.");
        }
        catch (err) {
            showToast("Fotoğraf yüklenemedi: " + (err?.message || ""));
        }
        finally {
            e.target.value = "";
        }
    }
    function makeCoverImage(categoryId, itemId, index) {
        const item = (data.categories.find(c => c.id === categoryId)?.items || []).find(i => i.id === itemId);
        const current = Array.isArray(item?.images) ? item.images.filter(Boolean) : (item?.image ? [item.image] : []);
        if (index <= 0 || index >= current.length)
            return;
        const images = [current[index], ...current.filter((_, i) => i !== index)];
        updateItem(categoryId, itemId, "images", images);
        updateItem(categoryId, itemId, "image", images[0]);
        showToast("Kapak fotoğrafı değişti. Kaydet'e basın.");
    }
    async function removeLogo() { if (!(await uiConfirm("Sitede logo yerine firma adının baş harfi görünecek.", { title: "Logo kaldırılsın mı?", danger: true, okText: "Kaldır" })))
        return; setPath(["logo", "src"], null); }
    async function changePin() {
        const p = String(newPinInput || "").replace(/\D/g, "");
        if (!isValidPin(p)) {
            showToast("PIN 4-8 haneli olmalıdır.");
            return;
        }
        if (p === "1234") {
            showToast("Güvenlik için 1234 kullanılamaz.");
            return;
        }
        try {
            await setAdminPin(p);
            setNewPinInput("");
            showToast("Yönetim PIN'i güncellendi.");
        }
        catch (e) {
            showToast(e.message || "PIN güncellenemedi.");
        }
    }
    async function tryUnlock() {
        const now = Date.now();
        if (now < pinBlockedUntil) {
            setPinError(true);
            const remaining = Math.max(1, Math.ceil((pinBlockedUntil - now) / 60000));
            showToast(`Çok fazla hatalı PIN denemesi. Yönetim girişi ${remaining} dakika boyunca kilitli.`);
            return;
        }
        if (pinBlockedUntil) {
            clearPinLock();
        }
        if (pinCheckBusy)
            return;
        const candidate = String(pinInput || "").replace(/\D/g, "").slice(0, 8);
        if (!isValidPin(candidate)) {
            setPinError(true);
            return;
        }
        /* Kademeli bekleme: her hatalı denemeden sonra doğrulama süresi uzar (brute-force'u yavaşlatır). */
        pinCheckBusy = true;
        try {
            await new Promise(r => setTimeout(r, Math.min(8000, 400 * Math.pow(2, pinFailureCount))));
        }
        finally {
            pinCheckBusy = false;
        }
        let firstSetup = false;
        if (!hasAdminPin()) {
            firstSetup = true;
            /* İlk kurulum: bu cihaz için yönetim PIN'i belirlenir. */
            if (candidate === "1234") {
                showToast("Güvenlik için 1234 kullanılamaz. Farklı bir PIN seçin.");
                setPinError(true);
                return;
            }
            try {
                await setAdminPin(candidate);
            }
            catch (e) {
                showToast(e.message || "PIN kaydedilemedi.");
                return;
            }
            showToast("Yönetim PIN'i oluşturuldu.");
        }
        else {
            let ok = false;
            try {
                ok = await verifyAdminPin(candidate);
            }
            catch (e) {
                showToast(e.message || "PIN doğrulanamadı.");
                return;
            }
            if (!ok) {
                pinFailureCount++;
                persistPinLock();
                if (pinFailureCount >= SECURITY_LIMITS.pinAttempts) {
                    pinBlockedUntil = now + 60 * 60 * 1000;
                    persistPinLock();
                    showToast("3 hatalı PIN denemesi. Yönetim girişi 1 saat boyunca kilitlendi.");
                }
                else {
                    showToast(`Hatalı PIN. Kalan deneme: ${SECURITY_LIMITS.pinAttempts - pinFailureCount}`);
                }
                setPinError(true);
                return;
            }
        }
        clearPinLock();
        adminActivityRef.current = Date.now();
        setUnlocked(true);
        setPinModal(false);
        panelSnapshot.current = JSON.parse(JSON.stringify(data));
        admBaseRef.current = data;
        setPanelOpen(true);
        setPinInput("");
        if (firstSetup && !tourDone())
            setTourStep("welcome");
    }
    function closePdfPreview() {
        setPdfPreview(prev => { if (prev?.url)
            try {
                URL.revokeObjectURL(prev.url);
            }
            catch (_) { } return null; });
    }
    function downloadPreviewPdf() {
        const p = pdfPreview;
        if (!p)
            return;
        const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        if (isIOS) {
            window.open(p.url, "_blank");
        }
        else {
            const a = document.createElement("a");
            a.href = p.url;
            a.download = p.fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
        showToast(language === "EN" ? "PDF downloaded." : "PDF indirildi.");
    }
    /* PDF her zaman sitenin ŞU ANKİ dilinde üretilir; indirmeden önce ön izleme penceresi açılır. */
    async function createPDF(openPreview = false, kind = "price") {
        if (pdfBusy || !data)
            return;
        kind = kind === "catalog" ? "catalog" : "price";
        if (!consumeClientRateLimit("pdf:create", 6, 60 * 1000)) {
            showToast(language === "EN" ? "Too many PDF requests. Please wait a minute." : "Çok fazla PDF isteği. Lütfen bir dakika bekleyin.");
            return;
        }
        setPdfBusy(kind);
        const siteLang = language === "EN" ? "EN" : "TR";
        try {
            let blob, fileName, title;
            if (kind === "catalog") {
                blob = await buildCatalogPDF(data, siteLang, data.pdf?.catalogTemplate);
                fileName = siteLang === "EN" ? `${fileSlug(data.siteName)}PRODUCT-CATALOG.pdf` : `${fileSlug(data.siteName)}URUN-KATALOGU.pdf`;
                title = siteLang === "EN" ? "Product Catalog" : "Ürün Kataloğu";
            }
            else {
                const pdfData = viewCurrencyData();
                const cur = pdfData.currency?.selected || "TRY";
                blob = await buildPriceListPDF(pdfData, siteLang);
                const curTag = cur === "TRY" ? "TL" : cur;
                fileName = siteLang === "EN" ? `${fileSlug(data.siteName)}${curTag}-PRICE-LIST.pdf` : `${fileSlug(data.siteName)}${curTag}-FIYAT-LISTESI.pdf`;
                title = siteLang === "EN" ? `Price List (${curTag})` : `Fiyat Listesi (${curTag})`;
            }
            const pages = pdfLastPages;
            if (!blob || blob.size <= 0)
                throw new Error("PDF doğrulaması başarısız: dosya boyutu 0.");
            if (blob.type !== "application/pdf")
                throw new Error("PDF doğrulaması başarısız: MIME type application/pdf değil.");
            pdfValidateBlobBytes(new Uint8Array(await blob.arrayBuffer()));
            const url = URL.createObjectURL(blob);
            if (openPreview) {
                /* Yönetim panelindeki "yeni sekmede aç" düğmesi */
                const win = window.open(url, "_blank");
                if (!win)
                    window.location.href = url;
                setTimeout(() => URL.revokeObjectURL(url), 180000);
                return;
            }
            setPdfPreview(prev => { if (prev?.url)
                try {
                    URL.revokeObjectURL(prev.url);
                }
                catch (_) { } return { url, fileName, title, pages: pages || [], accent: data?.theme?.accent }; });
        }
        catch (e) {
            console.error(e);
            showToast((siteLang === "EN" ? "PDF could not be created: " : "PDF oluşturulamadı: ") + (e?.message || "PDF oluşturma hatası"));
        }
        finally {
            setPdfBusy(false);
        }
    }
    async function uploadCategoryCover(categoryId, e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            validateUploadFile(file);
            await enforceClientRateLimit("admin:category-cover-upload", 10, 60 * 1000);
            const src = await fileToOptimizedDataURL(file, 1800, 300);
            updateData(x => { x.categories = x.categories.map(c => c.id === categoryId ? { ...c, coverImage: src } : c); });
            showToast("Kategori kapak görseli yüklendi. Kaydet'e basın.");
        }
        catch (err) {
            showToast("Kapak görseli yüklenemedi.");
        }
        finally {
            e.target.value = "";
        }
    }
    async function removeCategoryCover(categoryId) { if (!(await uiConfirm("Kategorinin kapak görseli kaldırılacak.", { title: "Kapak görseli silinsin mi?", danger: true })))
        return; updateData(x => { x.categories = x.categories.map(c => c.id === categoryId ? { ...c, coverImage: null } : c); }); showToast("Kapak kaldırıldı. Kaydet'e basın."); }
    async function resetDefault() {
        if (!(await uiConfirm("Site adı, renkler ve görünüm ayarları sıfırlanır. Ürünler ve kategoriler korunur.", { title: "Varsayılan ayarlara dönülsün mü?", icon: "alert", okText: "Sıfırla" })))
            return;
        const base = defaultData();
        const next = normalizeData(data);
        next.siteName = base.siteName;
        next.siteName_en = base.siteName_en;
        next.subtitle = base.subtitle;
        next.subtitle_en = base.subtitle_en;
        next.eyebrow = base.eyebrow;
        next.eyebrow_en = base.eyebrow_en;
        next.phone = base.phone;
        next.logo = { ...base.logo };
        next.theme = { ...base.theme };
        next.cardImgSize = base.cardImgSize;
        next.currency = { ...base.currency };
        setData(next);
        showToast("Genel ayarlar varsayılana döndürüldü. Kaydet'e basın.");
    }
    async function resetAllContent() {
        if (!(await uiConfirm("Tüm kategoriler, ürünler, fotoğraflar, logolar, kategori kapakları, PDF giriş/kapanış kapakları, site adı, telefon ve kapanış sayfası iletişim bilgileri silinir. Para birimi, kurlar, otomatik çeviri, tema ve PDF ayarları korunur. Kaydet'e basana kadar hiçbir şey kalıcı olarak silinmez.", { title: "Tüm içerik sıfırlansın mı?", danger: true, okText: "Sıfırla" })))
            return;
        const base = defaultData();
        const next = normalizeData(data);
        next.categories = [];
        next.siteName = base.siteName;
        next.siteName_en = base.siteName_en;
        next.subtitle = base.subtitle;
        next.subtitle_en = base.subtitle_en;
        next.eyebrow = base.eyebrow;
        next.eyebrow_en = base.eyebrow_en;
        next.phone = base.phone;
        next.logo = { ...base.logo };
        next.theme = { ...next.theme, bgImage: null };
        next.pdf = { ...next.pdf, coverLogo: { src: DEFAULT_PDF_COVER_LOGO }, footer: "", website: "", instagram: "", email: "", closingNote: "", coverImage: "", closingImage: "", categoryLayouts: {}, vitrinModes: {} };
        setData(next);
        setActiveCat(null);
        trPendingSave(new Set());
        showToast("Tüm içerik temizlendi. Kalıcı olması için Kaydet'e basın.");
    }
    async function handleImport(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            await enforceClientRateLimit("admin:json-import", 5, 60 * 1000);
            const imported = await readJSONFile(file);
            if (!(await uiConfirm("İçe aktarılan katalog mevcut katalogun yerine geçecek. Mevcut verinizin yedeği önce alınacak.", { title: "Yedekten yüklensin mi?", icon: "alert", okText: "Yükle" })))
                return;
            if (data)
                downloadJSON(data);
            setData(imported);
            setActiveCat((imported.categories || []).find(c => (c.items || []).length)?.id || imported.categories?.[0]?.id || null);
            setSaved(false);
            showToast("Katalog içe aktarıldı. Kaydet'e basın.");
        }
        catch (err) {
            console.error(err);
            showToast("Yedek yüklenemedi: " + (err?.message || "JSON dosyası okunamadı."));
        }
        finally {
            e.target.value = "";
        }
    }
    /* PIN oluşturulduktan sonra açılan buton tanıtım turu */
    const TOUR_STEPS = [
        { sel: "panel", icon: "grid", title: "Genel Bakış", text: "Kataloğunun özeti: kaç ürün, kaç kategori olduğunu ve eksikleri burada görürsün. Nereden başlayacağını buradan anla." },
        { sel: "urunler", icon: "box", title: "Ürünler", text: "Yeni ürün ekle, fotoğraf yükle, ölçü ve açıklama yaz. Ürünleri sürükleyerek sırala veya sil. Üstteki arama kutusu ürün bulmanı sağlar." },
        { sel: "fiyat", icon: "tag", title: "Fiyatlar & Kurlar", text: "TL, USD veya EUR fiyat gir. Kur yazınca fiyatlar otomatik çevrilir. Toplu yüzde zam / indirim de buradan yapılır." },
        { sel: "katalog", icon: "list", title: "Kategoriler & Kapaklar", text: "Kategori oluştur, İngilizce adını yaz, kapak görseli ekle ve kategorilerin sırasını değiştir." },
        { sel: "pdf", icon: "file", title: "PDF & Katalog", text: "Fiyat listesi ve katalog PDF'ini hazırla. Şablonu, kapak logosunu ve sayfa düzenini seç; önizleyip indir." },
        { sel: "genel", icon: "palette", title: "Görünüm & Ayarlar", text: "Site adı, logo, renkler ve tema şablonu. AI İngilizce çeviri, PIN değiştirme ve yedek indir / yedekten yükle de burada." },
        { sel: "save", icon: "save", title: "Kaydet ve yayınla", text: "Yaptığın her değişikliği bu cihaza kalıcı kaydeder. Kaydetmeden çıkmaya çalışırsan uyarı alırsın." },
        { sel: "help", icon: "?", title: "Yardım turu (?)", text: "Bu turu istediğin zaman tekrar açmak için bu butona bas." }
    ];
    const TOUR_NAV = ["panel", "urunler", "fiyat", "katalog", "pdf", "genel"];
    function tourFinish() {
        markTourDone();
        setTourStep(null);
        setTourRect(null);
    }
    function tourGo(i) {
        const st = TOUR_STEPS[i];
        if (!st) { tourFinish(); return; }
        if (TOUR_NAV.includes(st.sel))
            admGo(st.sel);
        setTourStep(i);
    }
    function tourTarget(sel) {
        const all = Array.from(document.querySelectorAll('[data-tour="' + sel + '"]'));
        return all.find(n => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) || null;
    }
    useEffect(() => {
        if (typeof tourStep !== "number") { setTourRect(null); return; }
        const st = TOUR_STEPS[tourStep];
        if (!st) return;
        let raf = 0;
        const measure = () => {
            const el = tourTarget(st.sel);
            if (!el) { setTourRect(null); return; }
            const r = el.getBoundingClientRect();
            setTourRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
        };
        const el = tourTarget(st.sel);
        try { if (el) el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); } catch (_) { }
        measure();
        const t1 = setTimeout(measure, 350), t2 = setTimeout(measure, 750);
        const onR = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
        window.addEventListener("resize", onR);
        window.addEventListener("scroll", onR, true);
        return () => { clearTimeout(t1); clearTimeout(t2); cancelAnimationFrame(raf); window.removeEventListener("resize", onR); window.removeEventListener("scroll", onR, true); };
    }, [tourStep]);
    useEffect(() => {
        if (tourStep === null) return;
        const onKey = e => {
            if (e.key === "Escape") { e.stopPropagation(); tourFinish(); }
            else if (typeof tourStep === "number" && e.key === "ArrowRight") tourGo(tourStep + 1);
            else if (typeof tourStep === "number" && e.key === "ArrowLeft" && tourStep > 0) tourGo(tourStep - 1);
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [tourStep]);
    useEffect(() => { if (!panelOpen) { setTourStep(null); setTourRect(null); } }, [panelOpen]);
    if (loading)
        return React.createElement("div", { style: { minHeight: "100vh", background: "#F5F5F7", color: "#6E6E73", fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Inter,system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center" } }, language === "EN" ? "Loading data…" : "Veriler yükleniyor…");
    if (!data)
        return React.createElement("div", { style: { minHeight: "100vh", background: "#F5F5F7", color: "#D70015", display: "flex", alignItems: "center", justifyContent: "center" } }, language === "EN" ? "Site data could not be loaded." : "Site verileri yüklenemedi.");
    const categories = data.categories || [];
    /* Ziyaretçi, seçtiği para biriminin fiyatlarını görür (kur kapalıyken elle girilen fiyatlar). */
    const viewCurrencyId = viewCurrencyData()?.currency?.selected || "TRY";
    const siteCategories = (projectCurrency(data, viewCurrencyId) || data).categories || [];
    const siteCurrencies = CURRENCIES.filter(c => availableCurrencies(data).includes(c.id));
    /* Ziyaretçi yalnızca ürünü olan kategorileri görür (yönetim paneli hepsini gösterir). */
    const publicCategories = siteCategories.filter(c => (c.items || []).length > 0);
    const activeCategory = publicCategories.find(c => c.id === activeCat) || publicCategories[0] || null;
    const allProducts = siteCategories.flatMap(c => (c.items || []).map(i => ({ ...i, categoryName: c.name, categoryName_en: c.name_en })));
    const q = safeSearchText(deferredSearch).replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
    const qWords = q ? q.split(" ").filter(Boolean) : [];
    const visibleProducts = q ? allProducts.filter(i => {
        const text = [i.name, i.name_en, i.desc, i.desc_en, i.dims, i.dims_en, i.categoryName, i.categoryName_en, ...(normalizePrice(i.price).parts || []).flatMap(p => [p.name, p.name_en])].filter(Boolean).join(" ");
        const tr = text.toLocaleLowerCase("tr-TR"), en = text.toLocaleLowerCase("en-US");
        return qWords.every(w => tr.includes(w) || en.includes(w));
    }) : (activeCategory?.items || []).map(i => ({ ...i, categoryName: activeCategory.name, categoryName_en: activeCategory.name_en }));
    /* Marka adı çevrilmez: EN alanı yalnızca yöneticinin elle girdiği farklı bir değer varsa ve otomatik bozulma değilse kullanılır. */
    const theme = data.theme, ink = inkOn(data.theme?.accent), currency = getCurrency(), siteName = data.siteName || data.siteName_en || "";
    const subtitle = getText(language, data.subtitle, data.subtitle_en, data.subtitle);
    const eyebrow = getText(language, data.eyebrow, data.eyebrow_en, data.eyebrow);
    const categoryDisplay = c => getText(language, c.name, c.name_en, c.name);
    const productDisplay = i => getText(language, i.name, i.name_en, i.name);
    const productDesc = i => getText(language, i.desc, i.desc_en, i.desc);
    /* Parça satırı olan ürünlerde ölçüler parça satırlarında gösterilir; parça yoksa ürün ölçüsü gösterilir. */
    const productDims = i => normalizePrice(i?.price).parts.length ? "" : String(getText(language, i?.dims, i?.dims_en, i?.dims) || "").trim();
    const hasContactParts = i => normalizePrice(i?.price).parts.some(p => p.contactOnly || p.amount === null);
    const itemCategoryId = new Map();
    categories.forEach(c => (c.items || []).forEach(i => itemCategoryId.set(i.id, c.id)));
    const layoutOfItem = i => categoryLayoutOf(data, itemCategoryId.get(i?.id));
    /* Ölçü/model düzenindeki ürünlerde fiyatlar alternatiftir: toplam değil "…'den başlayan" gösterilir. */
    const cardPrice = i => isVariantLayout(layoutOfItem(i)) ? variantMinPrice(i.price) : priceTotal(i.price);
    const cardPriceLabel = i => isVariantLayout(layoutOfItem(i)) ? (language === "EN" ? "From" : "Başlayan fiyat") : t(language, "total");
    const cardPriceSub = i => { const lay = layoutOfItem(i), n = normalizePrice(i.price).parts.length; if (lay === "sizes" && n)
        return language === "EN" ? `${n} sizes` : `${n} ölçü seçeneği`; if (lay === "models" && n)
        return language === "EN" ? `${n} models` : `${n} model`; return hasContactParts(i) ? (language === "EN" ? "Some items: ask for price" : "Bazı kalemler: fiyat sorunuz") : t(language, "detailedPrices"); };
    const productCategoryName = i => { const c = categories.find(c => (c.items || []).some(x => x.id === i?.id)); return c ? categoryDisplay(c) : ""; };
    const partDimensionDisplay = p => getText(language, p?.dims, p?.dims_en, p?.dims) || "";
    const partDisplay = p => {
        if (language !== "EN")
            return p.name || "";
        const source = String(p?.name || "").trim();
        const stored = String(p?.name_en || "").trim();
        // A default English placeholder must not mask a newly entered Turkish part name.
        if (stored && stored !== source && !(source !== "Yeni Parça" && stored === "New Part"))
            return stored;
        /* Price components must never remain Turkish in EN mode. Use the same
           deterministic catalog translator as the admin translation tools. */
        const exactPart = {
            "ETAJERLİ MASA": "DESK WITH RETURN",
            "DOLAP": "CABINET",
            "SEHPA": "COFFEE TABLE",
            "ÜNİTE": "UNIT",
            "MASA": "DESK",
            "ETAJER": "RETURN"
        };
        const key = source.toLocaleUpperCase("tr-TR");
        return exactPart[key] || translateFallbackSync(source) || source || "";
    };

    /* ==================== YENİ YÖNETİM PANELİ (Komuta Merkezi + Akıllı Tablo + Yan Düzenleyici) ==================== */
    const admCurId = curEnabled(data) ? "TRY" : curEditId(data);
    const admSym = (CURRENCIES.find(c => c.id === admCurId) || CURRENCIES[0]).symbol;
    const admFmt = n => (n === null || n === undefined || !Number.isFinite(Number(n))) ? "—" : (admCurId === "TRY" ? Math.floor(Number(n)).toLocaleString("tr-TR") + " ₺" : admSym + Math.floor(Number(n)).toLocaleString("en-US"));
    const admKey = (cid, id) => cid + "/" + id;
    const admImgs = it => (Array.isArray(it.images) && it.images.filter(Boolean).length ? it.images.filter(Boolean) : (it.image ? [it.image] : []));
    const admAll = categories.flatMap(c => (c.items || []).map(it => ({ c, it })));
    const admLayout = c => categoryLayoutOf(data, c.id);
    const admPriceInfo = (c, it) => {
        const p = normalizePrice(it.price), lay = admLayout(c);
        if (isVariantLayout(lay))
            return { label: "Başlayan", value: variantMinPrice(it.price), total: null, variant: true, p };
        return { label: "Takım", value: priceTotal(it.price), total: priceTotal(it.price), variant: false, p };
    };
    const admIssuesOf = (c, it) => {
        const out = [], p = normalizePrice(it.price);
        if (!admImgs(it).length)
            out.push("Fotoğraf yok");
        if (!String(it.name || "").trim() || it.name === "Yeni Ürün")
            out.push("Ürün adı yok");
        const priced = p.parts.some(x => x.amount !== null && !x.contactOnly);
        if (!p.parts.length || (!priced && !p.parts.some(x => x.contactOnly)))
            out.push("Fiyat yok");
        else if (!isVariantLayout(admLayout(c)) && p.parts.length > 1 && priceTotal(it.price) === null)
            out.push("Takım fiyatı yok");
        if (!curEnabled(data)) {
            const m = missingCurrencyPrices({ ...data, categories: [{ id: c.id, items: [it] }] });
            if (m.length)
                out.push(m[0].missing.join("/") + " fiyatı eksik");
        }
        return out;
    };
    const RECENT_KEY = "katalog_admin_recent_v1";
    const admRecentList = () => {
        try {
            const a = JSON.parse(lsGet(RECENT_KEY) || "[]");
            return Array.isArray(a) ? a.filter(x => typeof x === "string").slice(0, 8) : [];
        }
        catch (_) {
            return [];
        }
    };
    function admNoteRecent(cid, id) { const k = admKey(cid, id); const a = [k, ...admRecentList().filter(x => x !== k)].slice(0, 8); lsSet(RECENT_KEY, JSON.stringify(a)); }
    function admOpenEditor(cid, id, tab) { admNoteRecent(cid, id); setAdmEdit({ cid, id }); setAdmTab(tab || "bilgi"); }
    function admGo(section) {
        var _a;
        setAdminSection(section);
        setAdmEdit(null);
        try {
            (_a = document.querySelector(".adm-content")) === null || _a === void 0 ? void 0 : _a.scrollTo({ top: 0 });
        }
        catch (_) { }
    }
    function admAddProduct(cid) {
        if (!cid)
            return;
        const id = addItem(cid);
        setAdmAddPick(false);
        setAdmCat(cid);
        setAdminSection("urunler");
        if (id)
            setTimeout(() => admOpenEditor(cid, id, "bilgi"), 30);
    }
    function admToggleSel(k) {
        setAdmSel(prev => {
            const n = new Set(prev);
            if (n.has(k))
                n.delete(k);
            else
                n.add(k);
            return n;
        });
    }
    async function admApplyBulk(keys) {
        const v = Number(String(admBulk.value).replace(",", "."));
        if (!keys.length || !Number.isFinite(v) || v === 0) {
            showToast("Önce bir değer yazın (ör. 8 veya -5).");
            return;
        }
        if (Math.abs(v) > (admBulk.mode === "pct" ? 90 : 10000000)) {
            showToast("Değer çok büyük.");
            return;
        }
        const desc = admBulk.mode === "pct" ? `%${v > 0 ? "+" : ""}${v}` : `${v > 0 ? "+" : ""}${Math.floor(v).toLocaleString("tr-TR")} ${admSym}`;
        if (!(await uiConfirm(`${keys.length} ürünün tüm fiyatlarına ${desc} uygulanacak. \u201CKaydet ve yayınla\u201Dya basana kadar paneli kaydetmeden kapatarak geri alabilirsiniz.`, { title: "Toplu fiyat güncellensin mi?", icon: "alert", okText: "Uygula" })))
            return;
        const ks = new Set(keys);
        const f = a => {
            if (a === null || a === undefined)
                return a;
            const n = admBulk.mode === "pct" ? Math.round(Number(a) * (1 + v / 100)) : Math.round(Number(a) + v);
            return Math.max(0, n);
        };
        updateData(x => {
            x.categories = x.categories.map(c => ({ ...c, items: c.items.map(it => {
                    if (!ks.has(admKey(c.id, it.id)))
                        return it;
                    const p = normalizePrice(it.price);
                    const fm = m => admBulk.mode === "pct" ? Object.fromEntries(Object.entries(m || {}).map(([k, v]) => [k, f(v)])) : (m || {});
                    return { ...it, price: { ...p, manualTotal: f(p.manualTotal), totals: fm(p.totals), parts: p.parts.map(pt => ({ ...pt, amount: f(pt.amount), prices: fm(pt.prices) })) } };
                }) }));
        });
        setAdmSel(new Set());
        setAdmBulk(b => ({ ...b, value: "" }));
        showToast(`${keys.length} ürünün fiyatı güncellendi. Yayınlamak için "Kaydet ve yayınla".`);
    }
    async function admBulkDelete(keys) {
        if (!keys.length)
            return;
        const ks = new Set(keys);
        const names = admAll.filter(({ c, it }) => ks.has(admKey(c.id, it.id))).map(({ it }) => it.name || "Adsız ürün");
        const list = names.slice(0, 8).join(", ") + (names.length > 8 ? ` ve ${names.length - 8} ürün daha` : "");
        if (!(await uiConfirm(`${list}\n\n\u201CKaydet ve yayınla\u201Dya basmadan paneli kaydetmeden kapatırsanız silme geri alınır.`, { title: `${keys.length} ürün silinsin mi?`, danger: true })))
            return;
        updateData(x => { x.categories = x.categories.map(c => ({ ...c, items: c.items.filter(it => !ks.has(admKey(c.id, it.id))) })); });
        if (admEdit && ks.has(admKey(admEdit.cid, admEdit.id)))
            setAdmEdit(null);
        setAdmSel(new Set());
        showToast(`${keys.length} ürün silindi. Kalıcı olması için "Kaydet ve yayınla".`);
    }
    /* --- Sürükle-bırak ile sıralama (fare ve dokunmatik; tutamaçtan tutulur) --- */
    function admMoveTo(cid, fromId, toId) {
        if (fromId === toId)
            return;
        updateData(x => {
            x.categories = x.categories.map(c => {
                if (c.id !== cid)
                    return c;
                const l = [...c.items], i = l.findIndex(a => a.id === fromId), j = l.findIndex(a => a.id === toId);
                if (i < 0 || j < 0)
                    return c;
                const [m] = l.splice(i, 1);
                l.splice(j, 0, m);
                return { ...c, items: l };
            });
        });
    }
    function admDragStart(e, c, it) {
        if (e.button !== undefined && e.button !== 0)
            return;
        e.preventDefault();
        e.stopPropagation();
        const from = { cid: c.id, id: it.id, key: admKey(c.id, it.id) };
        let over = null, lastY = e.clientY, raf = 0;
        setAdmDrag({ from: from.key, over: null, bad: false });
        const scroller = document.querySelector(".adm-content");
        const tick = () => {
            if (!scroller)
                return;
            const r = scroller.getBoundingClientRect();
            const edge = 80;
            if (lastY < r.top + edge)
                scroller.scrollTop -= Math.ceil((r.top + edge - lastY) / 6);
            else if (lastY > r.bottom - edge)
                scroller.scrollTop += Math.ceil((lastY - (r.bottom - edge)) / 6);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        const move = ev => {
            lastY = ev.clientY;
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const t = el && el.closest ? el.closest("[data-adm-key]") : null;
            const key = t ? t.getAttribute("data-adm-key") : null;
            const bad = !!key && key.split("/")[0] !== from.cid;
            if (key !== (over && over.key) || bad !== (over && over.bad)) {
                over = key ? { key, bad } : null;
                setAdmDrag({ from: from.key, over: key, bad });
            }
            ev.preventDefault();
        };
        const end = () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", end);
            window.removeEventListener("pointercancel", end);
            setAdmDrag(null);
            if (!over || over.key === from.key)
                return;
            if (over.bad) {
                showToast("Ürün sadece kendi kategorisi içinde taşınabilir.");
                return;
            }
            admMoveTo(from.cid, from.id, over.key.slice(from.cid.length + 1));
            showToast("Sıra değişti. Kalıcı olması için \u201CKaydet ve yayınla\u201D.");
        };
        window.addEventListener("pointermove", move, { passive: false });
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
    }
    const admDragCls = k => !admDrag ? "" : (admDrag.from === k ? " is-dragging" : admDrag.over === k ? (admDrag.bad ? " is-dropbad" : " is-drop") : "");
    const admGrip = (c, it) => React.createElement("button", { type: "button", className: "adm-grip", "aria-label": (it.name || "Ürün") + " sırasını sürükleyerek değiştir", title: "S\u00FCr\u00FCkleyerek s\u0131rala", onPointerDown: e => admDragStart(e, c, it), onKeyDown: e => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                moveItem(c.id, it.id, e.key === "ArrowUp" ? -1 : 1);
            }
        } },
        React.createElement(AdmIcon, { name: "grip", size: 16 }));
    async function admSaveNow() {
        await save(true);
    }
    /* --- Filtrelenmiş ürün listesi --- */
    const admQ = safeSearchText(admQuery).toLocaleLowerCase("tr-TR");
    const admRows = admAll.filter(({ c, it }) => {
        if (admCat && c.id !== admCat)
            return false;
        if (admIssues && !admIssuesOf(c, it).length)
            return false;
        if (!admQ)
            return true;
        const hay = [it.name, it.desc, c.name, ...normalizePrice(it.price).parts.map(p => p.name)].join(" ").toLocaleLowerCase("tr-TR");
        return admQ.split(/\s+/).every(w => hay.includes(w));
    });
    const admEditing = admEdit ? (() => { const c = categories.find(x => x.id === admEdit.cid); const it = c && c.items.find(x => x.id === admEdit.id); return c && it ? { c, it } : null; })() : null;
    const admDirty = !!admBaseRef.current && data !== admBaseRef.current;
    /* --- Ortak parçalar --- */
    const admThumb = (it, size = 48) => {
        const src = admImgs(it)[0];
        return src
            ? React.createElement(CachedImage, { src: src, alt: "", className: "adm-thumb", style: { width: size, height: Math.round(size * .75) } })
            : React.createElement("span", { className: "adm-thumb adm-thumb-empty", style: { width: size, height: Math.round(size * .75) } },
                React.createElement(AdmIcon, { name: "image", size: 16 }));
    };
    function admRenderDashboard() {
        const photos = admAll.reduce((n, { it }) => n + admImgs(it).length, 0);
        const issues = admAll.map(r => ({ ...r, list: admIssuesOf(r.c, r.it) })).filter(r => r.list.length);
        const byType = {};
        issues.forEach(r => r.list.forEach(t => { (byType[t] = byType[t] || []).push(r); }));
        const pending = trPendingLoad().size;
        const trMissing = trMissingKeys(data).length;
        const usedCats = categories.filter(c => (c.items || []).length).length;
        const recent = admRecentList().map(k => { const [cid, id] = k.split("/"); const c = categories.find(x => x.id === cid); const it = c && c.items.find(x => x.id === id); return c && it ? { c, it } : null; }).filter(Boolean).slice(0, 6);
        const now = new Date();
        const dayStr = now.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" }).toLocaleUpperCase("tr-TR");
        return React.createElement("div", { className: "adm-page" },
            React.createElement("div", { className: "adm-eyebrow" }, dayStr),
            window.SH21 && window.NDAbonelik && SH21.subscription() && React.createElement("div", { dangerouslySetInnerHTML: { __html: NDAbonelik.html(SH21.subscription(), SH21.support()) } }),
            React.createElement("h1", { className: "adm-h1" }, "Ho\u015F geldiniz, katalog haz\u0131r."),
            React.createElement("div", { className: "adm-grid4" },
                React.createElement("div", { className: "adm-card adm-stat" },
                    React.createElement("div", { className: "adm-stat-l" }, "\u00DCr\u00FCn"),
                    React.createElement("div", { className: "adm-stat-v" }, admAll.length.toLocaleString("tr-TR")),
                    React.createElement("div", { className: "adm-stat-s" },
                        usedCats,
                        " kategoride")),
                React.createElement("div", { className: "adm-card adm-stat" },
                    React.createElement("div", { className: "adm-stat-l" }, "Foto\u011Fraf"),
                    React.createElement("div", { className: "adm-stat-v" }, photos.toLocaleString("tr-TR")),
                    React.createElement("div", { className: "adm-stat-s " + ((byType["Fotoğraf yok"] || []).length ? "adm-warn" : "adm-ok") }, (byType["Fotoğraf yok"] || []).length ? `${byType["Fotoğraf yok"].length} ürün fotoğrafsız` : "Fotoğrafsız ürün yok")),
                React.createElement("div", { className: "adm-card adm-stat" },
                    React.createElement("div", { className: "adm-stat-l" }, "\u0130ngilizce \u00E7eviri"),
                    React.createElement("div", { className: "adm-stat-v" }, trMissing ? trMissing : React.createElement(AdmIcon, { name: "check", size: 28 })),
                    React.createElement("div", { className: "adm-stat-s " + (trMissing ? "adm-warn" : "adm-ok") }, trMissing ? "alanın çevirisi eksik" : "Hepsi çevrildi"),
                    React.createElement("button", { type: "button", className: "adm-linkbtn", disabled: trBusy > 0, onClick: translateMissingNow }, trBusy > 0 ? "Çevriliyor… (" + trBusy + ")" : "Eksik çevirileri tamamla")),
                React.createElement("div", { className: "adm-card adm-stat" },
                    React.createElement("div", { className: "adm-stat-l" }, curEnabled(data) ? "Kur (USD / EUR)" : "Para birimleri"),
                    React.createElement("div", { className: "adm-stat-v" }, curEnabled(data)
                        ? [String(data.currency.usdRate ?? "—").replace(".", ","), " / ", String(data.currency.eurRate ?? "—").replace(".", ",")].join("")
                        : availableCurrencies(data).join(" · ")),
                    React.createElement("div", { className: "adm-stat-s" }, curEnabled(data) ? "Kur açık · otomatik çeviri" : "Kur kapalı · fiyatlar ayrı ayrı"),
                    React.createElement("button", { type: "button", className: "adm-linkbtn", onClick: () => admGo("fiyat") }, "Kur ayarlar\u0131"))),
            React.createElement("div", { className: "adm-grid4" },
                React.createElement("button", { type: "button", className: "adm-action adm-action-gold", onClick: () => setAdmAddPick(true) },
                    React.createElement(AdmIcon, { name: "plus", size: 22 }),
                    React.createElement("span", { className: "adm-action-t" }, "Yeni \u00FCr\u00FCn ekle"),
                    React.createElement("span", { className: "adm-action-s" }, "Foto\u011Fraf, \u00F6l\u00E7\u00FC ve fiyat tek ekranda")),
                React.createElement("button", { type: "button", className: "adm-action", onClick: () => { admGo("urunler"); setAdmView("table"); showToast("Ürünleri seçin, alttaki çubuktan % ya da ₺ uygulayın."); } },
                    React.createElement(AdmIcon, { name: "percent", size: 22 }),
                    React.createElement("span", { className: "adm-action-t" }, "Toplu fiyat g\u00FCncelle"),
                    React.createElement("span", { className: "adm-action-s" }, "Se\u00E7ili \u00FCr\u00FCnlere % zam / indirim")),
                React.createElement("button", { type: "button", className: "adm-action", onClick: () => createPDF(false, "price"), disabled: !!pdfBusy },
                    React.createElement(AdmIcon, { name: "file", size: 22 }),
                    React.createElement("span", { className: "adm-action-t" }, pdfBusy === "price" ? "Hazırlanıyor…" : "Fiyat listesi PDF"),
                    React.createElement("span", { className: "adm-action-s" }, "\u00D6n izleme ve indirme")),
                React.createElement("button", { type: "button", className: "adm-action", onClick: () => createPDF(false, "catalog"), disabled: !!pdfBusy },
                    React.createElement(AdmIcon, { name: "book", size: 22 }),
                    React.createElement("span", { className: "adm-action-t" }, pdfBusy === "catalog" ? "Hazırlanıyor…" : "Katalog PDF"),
                    React.createElement("span", { className: "adm-action-s" }, "Fiyats\u0131z, se\u00E7ili \u015Fablonla"))),
            React.createElement("div", { className: "adm-grid-2-1" },
                React.createElement("section", { className: "adm-card" },
                    React.createElement("div", { className: "adm-card-h" },
                        React.createElement("h2", null, "Son d\u00FCzenlenenler"),
                        React.createElement("button", { type: "button", className: "adm-linkbtn", onClick: () => admGo("urunler") }, "T\u00FCm \u00FCr\u00FCnler")),
                    recent.length === 0 && React.createElement("div", { className: "adm-empty" }, "Hen\u00FCz d\u00FCzenleme yok. Bir \u00FCr\u00FCne t\u0131klad\u0131\u011F\u0131n\u0131zda burada g\u00F6r\u00FCn\u00FCr."),
                    recent.map(({ c, it }) => {
                        const pi = admPriceInfo(c, it);
                        return React.createElement("button", { type: "button", key: admKey(c.id, it.id), className: "adm-recent", onClick: () => admOpenEditor(c.id, it.id) },
                            admThumb(it, 56),
                            React.createElement("span", { className: "adm-recent-t" },
                                React.createElement("b", null, it.name || "Adsız ürün"),
                                React.createElement("span", null, c.name)),
                            React.createElement("span", { className: "adm-gold" }, pi.value === null ? "—" : admFmt(pi.value) + (pi.variant ? "'den" : "")));
                    })),
                React.createElement("section", { className: "adm-card" },
                    React.createElement("div", { className: "adm-card-h" },
                        React.createElement("h2", null, "Dikkat edilecekler")),
                    Object.keys(byType).length === 0 && React.createElement("div", { className: "adm-note adm-note-ok" },
                        React.createElement(AdmIcon, { name: "check", size: 16 }),
                        "T\u00FCm \u00FCr\u00FCnlerde foto\u011Fraf ve fiyat var."),
                    Object.entries(byType).map(([type, rows]) => React.createElement("button", { type: "button", key: type, className: "adm-note adm-note-warn", onClick: () => {
                            if (rows.length === 1)
                                admOpenEditor(rows[0].c.id, rows[0].it.id, type === "Fotoğraf yok" ? "foto" : type === "Ürün adı yok" ? "bilgi" : "fiyat");
                            else {
                                setAdmIssues(true);
                                setAdmCat("");
                                admGo("urunler");
                            }
                        } },
                        React.createElement(AdmIcon, { name: "alert", size: 16 }),
                        React.createElement("span", null,
                            React.createElement("b", null, type),
                            " \u00B7 ",
                            rows.length,
                            " \u00FCr\u00FCn: ",
                            rows.slice(0, 3).map(r => r.it.name || "Adsız").join(", "),
                            rows.length > 3 ? "…" : ""))),
                    pending > 0 && React.createElement("div", { className: "adm-note" },
                        React.createElement(AdmIcon, { name: "clock", size: 16 }),
                        pending,
                        " metnin \u0130ngilizcesi internet gelince otomatik \u00E7evrilecek."))));
    }
    function admRenderProducts() {
        const shown = admRows.slice(0, admLimit);
        const selKeys = [...admSel];
        const allShownSelected = shown.length > 0 && shown.every(({ c, it }) => admSel.has(admKey(c.id, it.id)));
        return React.createElement("div", { className: "adm-page adm-page-wide" },
            React.createElement("div", { className: "adm-headrow" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "adm-h1" }, "\u00DCr\u00FCnler & Fiyatlar"),
                    React.createElement("p", { className: "adm-sub" }, admView === "table" ? "Fiyata tıklayıp yazın; satıra tıklayınca ürün sağda açılır. Sırayı değiştirmek için ⋮⋮ tutamacından sürükleyin." : "Karta tıklayınca ürün sağda açılır. Sırayı değiştirmek için sağ üstteki ⋮⋮ tutamacından sürükleyin.")),
                React.createElement("div", { className: "adm-row-gap" },
                    React.createElement("div", { className: "adm-seg", role: "group", "aria-label": "G\u00F6r\u00FCn\u00FCm" },
                        React.createElement("button", { type: "button", "aria-pressed": admView === "table", onClick: () => setAdmView("table") },
                            React.createElement(AdmIcon, { name: "table", size: 16 }),
                            "Tablo"),
                        React.createElement("button", { type: "button", "aria-pressed": admView === "cards", onClick: () => setAdmView("cards") },
                            React.createElement(AdmIcon, { name: "cards", size: 16 }),
                            "Kartlar")),
                    React.createElement("button", { type: "button", className: "adm-btn adm-btn-gold", onClick: () => admCat ? admAddProduct(admCat) : setAdmAddPick(true) },
                        React.createElement(AdmIcon, { name: "plus", size: 16 }),
                        "\u00DCr\u00FCn ekle"))),
            React.createElement("div", { className: "adm-filters" },
                React.createElement("label", { className: "adm-search" },
                    React.createElement(AdmIcon, { name: "search", size: 16 }),
                    React.createElement("input", { type: "search", "aria-label": "\u00DCr\u00FCnlerde ara", placeholder: "\u00DCr\u00FCn, mod\u00FCl veya kategori ara\u2026", value: admQuery, onChange: e => { setAdmQuery(safeText(e.target.value, SECURITY_LIMITS.search)); setAdmLimit(80); } })),
                React.createElement("select", { className: "adm-select", "aria-label": "Kategori filtresi", value: admCat, onChange: e => { setAdmCat(e.target.value); setAdmLimit(80); } },
                    React.createElement("option", { value: "" },
                        "T\u00FCm kategoriler \u00B7 ",
                        admAll.length),
                    categories.map(c => React.createElement("option", { key: c.id, value: c.id },
                        c.name,
                        " \u00B7 ",
                        c.items.length))),
                React.createElement("button", { type: "button", className: "adm-chip" + (admIssues ? " is-on" : ""), "aria-pressed": admIssues, onClick: () => setAdmIssues(v => !v) },
                    React.createElement(AdmIcon, { name: "alert", size: 14 }),
                    "Sadece eksikler"),
                React.createElement("span", { className: "adm-count" },
                    admRows.length,
                    " \u00FCr\u00FCn")),
            admView === "table" ? React.createElement("div", { className: "adm-tablewrap" },
                React.createElement("table", { className: "adm-table" },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { style: { width: 36 }, "aria-label": "S\u0131rala" }),
                            React.createElement("th", { style: { width: 40 } },
                                React.createElement("input", { type: "checkbox", "aria-label": "G\u00F6r\u00FCnenlerin hepsini se\u00E7", checked: allShownSelected, onChange: e => setAdmSel(prev => { const n = new Set(prev); shown.forEach(({ c, it }) => e.target.checked ? n.add(admKey(c.id, it.id)) : n.delete(admKey(c.id, it.id))); return n; }) })),
                            React.createElement("th", { style: { width: 64 } }, "Foto"),
                            React.createElement("th", null, "\u00DCr\u00FCn"),
                            React.createElement("th", null, "Kategori"),
                            React.createElement("th", null, "Kalemler"),
                            React.createElement("th", { style: { width: 170 } }, "Fiyat"),
                            React.createElement("th", { style: { width: 160 } }, "Tak\u0131m / ba\u015Flayan"),
                            React.createElement("th", { style: { width: 120 } }, "Durum"))),
                    React.createElement("tbody", null, shown.map(({ c, it }) => {
                        var _a, _b;
                        const k = admKey(c.id, it.id), pi = admPriceInfo(c, it), parts = pi.p.parts, iss = admIssuesOf(c, it), sel = admSel.has(k), single = parts.length === 1 && curEnabled(data) ? parts[0] : null;
                        return React.createElement("tr", { key: k, "data-adm-key": k, className: (sel ? "is-sel " : "") + (admEdit && admEdit.id === it.id && admEdit.cid === c.id ? "is-open" : "") + admDragCls(k) },
                            React.createElement("td", null, admGrip(c, it)),
                            React.createElement("td", null,
                                React.createElement("input", { type: "checkbox", "aria-label": (it.name || "Ürün") + " seç", checked: sel, onChange: () => admToggleSel(k) })),
                            React.createElement("td", null,
                                React.createElement("button", { type: "button", className: "adm-cellbtn", "aria-label": (it.name || "Ürün") + " düzenle", onClick: () => admOpenEditor(c.id, it.id, "foto") }, admThumb(it, 48))),
                            React.createElement("td", null,
                                React.createElement("button", { type: "button", className: "adm-namebtn", onClick: () => admOpenEditor(c.id, it.id) }, it.name || "Adsız ürün")),
                            React.createElement("td", { className: "adm-muted" }, c.name),
                            React.createElement("td", { className: "adm-muted adm-ellipsis" }, parts.length ? parts.slice(0, 3).map(p => p.name).join(" · ") + (parts.length > 3 ? ` +${parts.length - 3}` : "") : "—"),
                            React.createElement("td", null, single ? React.createElement("span", { className: "adm-priceedit" },
                                React.createElement(NumField, { inputMode: "decimal", min: 0, "aria-label": (it.name || "Ürün") + " fiyatı", value: (_a = single.amount) !== null && _a !== void 0 ? _a : "", placeholder: "\u2014", disabled: single.contactOnly, onValue: v => updatePricePart(c.id, it.id, single.id, "amount", v) }),
                                React.createElement("span", null, admSym))
                                : React.createElement("button", { type: "button", className: "adm-linkbtn", onClick: () => admOpenEditor(c.id, it.id, "fiyat") },
                                    parts.length,
                                    " kalem d\u00FCzenle")),
                            React.createElement("td", null, !pi.variant && pi.p.autoCollect === false && parts.length > 1
                                ? React.createElement("span", { className: "adm-priceedit is-total" },
                                    React.createElement(NumField, { inputMode: "decimal", min: 0, "aria-label": (it.name || "Ürün") + " takım fiyatı", value: (_b = pi.p.manualTotal) !== null && _b !== void 0 ? _b : "", placeholder: "Tak\u0131m fiyat\u0131 gir", onValue: v => updateItem(c.id, it.id, "price", { ...pi.p, manualTotal: v }) }),
                                    React.createElement("span", null, admSym))
                                : React.createElement("span", { className: "adm-gold" }, pi.value === null ? "—" : admFmt(pi.value) + (pi.variant ? "'den" : ""))),
                            React.createElement("td", null, iss.length ? React.createElement("span", { className: "adm-badge adm-badge-warn", title: iss.join(", ") }, iss[0]) : React.createElement("span", { className: "adm-badge adm-badge-ok" }, "Tamam")));
                    }))),
                shown.length === 0 && React.createElement("div", { className: "adm-empty adm-pad" }, "Bu filtreyle \u00FCr\u00FCn bulunamad\u0131."))
                : React.createElement("div", { className: "adm-cards" },
                    shown.map(({ c, it }) => {
                        const k = admKey(c.id, it.id), pi = admPriceInfo(c, it), iss = admIssuesOf(c, it), src = admImgs(it)[0];
                        return React.createElement("div", { key: k, "data-adm-key": k, className: "adm-pcard" + (admEdit && admEdit.id === it.id && admEdit.cid === c.id ? " is-open" : "") + (admSel.has(k) ? " is-sel" : "") + admDragCls(k) },
                            React.createElement("span", { className: "adm-pcard-grip" }, admGrip(c, it)),
                            React.createElement("label", { className: "adm-pcard-check" },
                                React.createElement("input", { type: "checkbox", "aria-label": (it.name || "Ürün") + " seç", checked: admSel.has(k), onChange: () => admToggleSel(k) })),
                            React.createElement("button", { type: "button", className: "adm-pcard-btn", onClick: () => admOpenEditor(c.id, it.id) },
                                React.createElement("span", { className: "adm-pcard-img" }, src ? React.createElement(CachedImage, { src: src, alt: "" }) : React.createElement(AdmIcon, { name: "image", size: 28 })),
                                React.createElement("span", { className: "adm-pcard-body" },
                                    React.createElement("b", null, it.name || "Adsız ürün"),
                                    React.createElement("span", { className: "adm-muted" }, c.name),
                                    React.createElement("span", { className: "adm-pcard-price" }, pi.value === null ? "Fiyat yok" : admFmt(pi.value) + (pi.variant ? "'den" : "")),
                                    iss.length > 0 && React.createElement("span", { className: "adm-badge adm-badge-warn" }, iss[0]))));
                    }),
                    shown.length === 0 && React.createElement("div", { className: "adm-empty adm-pad" }, "Bu filtreyle \u00FCr\u00FCn bulunamad\u0131.")),
            admRows.length > shown.length && React.createElement("div", { className: "adm-more" },
                React.createElement("button", { type: "button", className: "adm-btn", onClick: () => setAdmLimit(n => n + 120) },
                    "Daha fazla g\u00F6ster (",
                    admRows.length - shown.length,
                    " \u00FCr\u00FCn daha)")),
            selKeys.length > 0 && React.createElement("div", { className: "adm-bulk", role: "region", "aria-label": "Toplu i\u015Flem" },
                React.createElement("b", null,
                    selKeys.length,
                    " \u00FCr\u00FCn se\u00E7ildi"),
                React.createElement("span", { className: "adm-sep" }),
                React.createElement("span", { className: "adm-muted-l" }, "Fiyatlar\u0131"),
                React.createElement("div", { className: "adm-seg adm-seg-dark", role: "group", "aria-label": "De\u011Fi\u015Fim t\u00FCr\u00FC" },
                    React.createElement("button", { type: "button", "aria-pressed": admBulk.mode === "pct", onClick: () => setAdmBulk(b => ({ ...b, mode: "pct" })) }, "%"),
                    React.createElement("button", { type: "button", "aria-pressed": admBulk.mode === "amt", onClick: () => setAdmBulk(b => ({ ...b, mode: "amt" })) }, "\u20BA")),
                React.createElement("input", { className: "adm-bulk-in", type: "text", inputMode: "decimal", "aria-label": "De\u011Fi\u015Fim miktar\u0131", placeholder: admBulk.mode === "pct" ? "ör. 8 veya -5" : "ör. 1000", value: admBulk.value, onChange: e => setAdmBulk(b => ({ ...b, value: e.target.value.replace(/[^0-9.,-]/g, "").slice(0, 12) })), onKeyDown: e => {
                        if (e.key === "Enter")
                            admApplyBulk(selKeys);
                    } }),
                React.createElement("button", { type: "button", className: "adm-btn adm-btn-gold", onClick: () => admApplyBulk(selKeys) }, "Uygula"),
                React.createElement("button", { type: "button", className: "adm-btn adm-danger-btn", onClick: () => admBulkDelete(selKeys) },
                    React.createElement(AdmIcon, { name: "trash", size: 16 }),
                    "Se\u00E7ilenleri sil"),
                React.createElement("button", { type: "button", className: "adm-btn adm-btn-ghost", onClick: () => setAdmSel(new Set()) }, "Se\u00E7imi kald\u0131r")));
    }
    function admRenderEditor() {
        var _a;
        if (!admEditing)
            return null;
        const { c, it } = admEditing, lay = admLayout(c), p = normalizePrice(it.price), imgs = admImgs(it), idx = c.items.findIndex(x => x.id === it.id);
        const close = () => setAdmEdit(null);
        return React.createElement("div", { className: "adm-drawer-wrap" },
            React.createElement("div", { className: "adm-drawer-bg", onClick: close }),
            React.createElement("aside", { className: "adm-drawer", role: "dialog", "aria-modal": "true", "aria-label": (it.name || "Ürün") + " düzenleniyor", onKeyDown: e => {
                    if (e.key === "Escape") {
                        e.stopPropagation();
                        close();
                    }
                } },
                React.createElement("div", { className: "adm-drawer-h" },
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("div", { className: "adm-eyebrow" }, c.name),
                        React.createElement("h2", { className: "adm-h2" }, it.name || "Adsız ürün")),
                    React.createElement("button", { type: "button", className: "adm-iconbtn", "aria-label": "Kapat", onClick: close },
                        React.createElement(AdmIcon, { name: "x", size: 18 }))),
                React.createElement("div", { className: "adm-tabs", role: "tablist", "aria-label": "D\u00FCzenleme b\u00F6l\u00FCmleri" }, [["bilgi", "Bilgiler"], ["foto", `Fotoğraflar · ${imgs.length}`], ["fiyat", lay === "models" ? "Modeller & Fiyatlar" : lay === "sizes" ? "Ölçüler & Fiyatlar" : "Modüller & Fiyatlar"]].map(([id, label]) => React.createElement("button", { key: id, type: "button", role: "tab", "aria-selected": admTab === id, className: admTab === id ? "is-on" : "", onClick: () => setAdmTab(id) }, label))),
                React.createElement("div", { className: "adm-drawer-body" },
                    admTab === "bilgi" && React.createElement("div", { className: "adm-form" },
                        React.createElement("label", { className: "adm-field" },
                            React.createElement("span", null, "\u00DCr\u00FCn ad\u0131"),
                            React.createElement("input", { className: "adm-input adm-input-lg", value: it.name, onChange: e => editTurkishField(c.id, it, "name", e.target.value), placeholder: "\u00DCr\u00FCn ad\u0131" })),
                        React.createElement("label", { className: "adm-field" },
                            React.createElement("span", null, "A\u00E7\u0131klama"),
                            React.createElement("textarea", { className: "adm-input", rows: "4", value: it.desc, onChange: e => editTurkishField(c.id, it, "desc", e.target.value), placeholder: "K\u0131sa a\u00E7\u0131klama (\u00F6r. 3+1+1 tak\u0131m)" })),
                        p.parts.length === 0 && React.createElement("label", { className: "adm-field" },
                            React.createElement("span", null, "\u00D6l\u00E7\u00FCler"),
                            React.createElement("input", { className: "adm-input", value: it.dims, onChange: e => { const v = e.target.value; updateItem(c.id, it.id, "dims", v); updateItem(c.id, it.id, "dims_en", v); }, placeholder: "\u00D6r. 200\u00D790\u00D775 cm" })),
                        (p.parts.length === 0 || logiHas(it)) && React.createElement("div", { className: "adm-field" },
                            React.createElement("span", null, "Paket ve sevkiyat bilgisi (isteğe bağlı)"),
                            admLogiInputs(it, (k, v) => updateItem(c.id, it.id, k, v), "it-"),
                            React.createElement("div", { className: "adm-muted", style: { fontSize: 12 } }, p.parts.length ? "Bu değerler ürün geneline girilmiş. Fiyat kalemlerinde parça parça girmeniz önerilir; buradakileri silebilirsiniz." : "Doldurulanlar PDF'lerde görünür (örn. \u201C2 paket · 0,85 m³ · 45 kg\u201D). Boş bırakılanlar hiçbir yerde çıkmaz.")),
                        React.createElement("div", { className: "adm-info" }, "\u0130ngilizce kar\u015F\u0131l\u0131klar yazmay\u0131 b\u0131rakt\u0131\u011F\u0131n\u0131zda otomatik \u00E7evrilir; ayr\u0131ca bir \u015Fey yapman\u0131z gerekmez."),
                        React.createElement("div", { className: "adm-field" },
                            React.createElement("span", null, "S\u0131radaki yeri"),
                            React.createElement("div", { className: "adm-row-gap" },
                                React.createElement("button", { type: "button", className: "adm-btn", disabled: idx <= 0, onClick: () => moveItem(c.id, it.id, -1) },
                                    React.createElement(AdmIcon, { name: "up", size: 16 }),
                                    "Yukar\u0131"),
                                React.createElement("button", { type: "button", className: "adm-btn", disabled: idx >= c.items.length - 1, onClick: () => moveItem(c.id, it.id, 1) },
                                    React.createElement(AdmIcon, { name: "down", size: 16 }),
                                    "A\u015Fa\u011F\u0131"),
                                React.createElement("span", { className: "adm-muted" },
                                    idx + 1,
                                    ". s\u0131rada / ",
                                    c.items.length)))),
                    admTab === "foto" && React.createElement("div", { className: "adm-form" },
                        React.createElement("button", { type: "button", className: "adm-drop", onClick: () => { var _a; return (_a = document.getElementById("adm-photo-input")) === null || _a === void 0 ? void 0 : _a.click(); } },
                            React.createElement(AdmIcon, { name: "upload", size: 30 }),
                            React.createElement("b", null, "Foto\u011Fraf ekle"),
                            React.createElement("span", null, "Birden fazla se\u00E7ebilirsiniz \u00B7 otomatik net WebP'ye \u00E7evrilir \u00B7 ilk foto\u011Fraf kapak olur")),
                        React.createElement("input", { id: "adm-photo-input", type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: e => uploadProductImage(c.id, it.id, e) }),
                        React.createElement("div", { className: "adm-photos" }, imgs.map((src, i) => React.createElement("div", { key: i + "-" + String(src).length, className: "adm-photo" + (i === 0 ? " is-cover" : "") },
                            React.createElement(CachedImage, { src: src, alt: `${i + 1}. fotoğraf` }),
                            i === 0 ? React.createElement("span", { className: "adm-photo-tag" }, "KAPAK") : React.createElement("button", { type: "button", className: "adm-photo-cover", onClick: () => makeCoverImage(c.id, it.id, i) }, "Kapak yap"),
                            React.createElement("button", { type: "button", className: "adm-photo-del", "aria-label": `${i + 1}. fotoğrafı sil`, onClick: () => removeProductImage(c.id, it.id, i) },
                                React.createElement(AdmIcon, { name: "x", size: 14 }))))),
                        imgs.length === 0 && React.createElement("div", { className: "adm-empty" }, "Bu \u00FCr\u00FCnde hen\u00FCz foto\u011Fraf yok.")),
                    admTab === "fiyat" && React.createElement("div", { className: "adm-form" },
                        React.createElement("div", { className: "adm-info" },
                            lay === "models" ? "Her satır bir model (Müdür, Şef, Misafir…) ve kendi fotoğrafı. Sitede en düşük fiyat “başlayan fiyat” olarak görünür." : lay === "sizes" ? "Her satır bir ölçü seçeneği. Fiyatlar toplanmaz; sitede en düşük fiyat “başlayan fiyat” olarak görünür." : "Her satır bir modül. Takım fiyatı otomatik toplanabilir ya da elle girilebilir.",
                            curEnabled(data) ? " Fiyatlar TL, KDV hari\u00E7." : " Fiyatlar\u0131 TL, USD ve EUR olarak ayr\u0131 girin (KDV hari\u00E7).",
                            " Paket / m³ / kg isteğe bağlıdır; doldurulanlar PDF'lerde o satırda görünür."),
                        p.parts.map((part, pi) => {
                            var _a;
                            return React.createElement("div", { key: part.id, className: "adm-part" },
                                lay === "models" && React.createElement("button", { type: "button", className: "adm-part-img", "aria-label": part.image ? "Model fotoğrafını değiştir" : "Model fotoğrafı ekle", onClick: () => { var _a; return (_a = document.getElementById("adm-part-img-" + part.id)) === null || _a === void 0 ? void 0 : _a.click(); } }, part.image ? React.createElement(CachedImage, { src: part.image, alt: "" }) : React.createElement(AdmIcon, { name: "image", size: 18 })),
                                lay === "models" && React.createElement("input", { id: "adm-part-img-" + part.id, type: "file", accept: "image/jpeg,image/png,image/webp", className: "hidden", onChange: e => uploadPartImage(c.id, it.id, part.id, e) }),
                                React.createElement("label", { className: "adm-field adm-grow" },
                                    React.createElement("span", null, lay === "models" ? "Model" : lay === "sizes" ? "Seçenek" : "Modül"),
                                    React.createElement("input", { className: "adm-input", value: part.name, onChange: e => updatePricePart(c.id, it.id, part.id, "name", e.target.value) })),
                                React.createElement("label", { className: "adm-field adm-w140" },
                                    React.createElement("span", null, "\u00D6l\u00E7\u00FC (cm)"),
                                    React.createElement("input", { className: "adm-input", value: part.dims || "", placeholder: "200x90x75", onChange: e => { const v = e.target.value; updatePricePart(c.id, it.id, part.id, "dims", v); updatePricePart(c.id, it.id, part.id, "dims_en", v); } })),
                                curEnabled(data) ? React.createElement("label", { className: "adm-field adm-w130" },
                                    React.createElement("span", null, "Fiyat (\u20BA)"),
                                    React.createElement(NumField, { className: "adm-input adm-num", inputMode: "decimal", min: 0, value: (_a = part.amount) !== null && _a !== void 0 ? _a : "", disabled: part.contactOnly, placeholder: part.contactOnly ? "Sorunuz" : "—", onValue: v => updatePricePart(c.id, it.id, part.id, "amount", v) })) : React.createElement("div", { className: "adm-curgrid", role: "group", "aria-label": "Fiyatlar (TL, USD, EUR)" }, [["TRY", "\u20BA TL"], ["USD", "$ USD"], ["EUR", "\u20AC EUR"]].map(([cur, label]) => { const val = cur === "TRY" ? part.amount : (part.prices || {})[cur]; const miss = !part.contactOnly && priceNumber(val) === null; return React.createElement("label", { key: cur, className: "adm-field adm-curfield" + (miss ? " is-missing" : "") },
                                    React.createElement("span", null, label, ""),
                                    React.createElement(NumField, { className: "adm-input adm-num", inputMode: "decimal", min: 0, "aria-label": (part.name || "Kalem") + " " + label + " fiyatı", "aria-invalid": miss, value: val ?? "", disabled: part.contactOnly, placeholder: part.contactOnly ? "Sorunuz" : "\u2014", onValue: v => cur === "TRY" ? updatePricePart(c.id, it.id, part.id, "amount", v) : updatePricePart(c.id, it.id, part.id, "prices", { ...(part.prices || {}), [cur]: v }) })); })),
                                admLogiInputs(part, (k, v) => updatePricePart(c.id, it.id, part.id, k, v), part.id + "-"),
                                React.createElement("div", { className: "adm-part-tools" },
                                    React.createElement("label", { className: "adm-mini" },
                                        React.createElement("input", { type: "checkbox", checked: !!part.contactOnly, onChange: e => updatePricePart(c.id, it.id, part.id, "contactOnly", e.target.checked) }),
                                        "Fiyat sorunuz"),
                                    React.createElement("button", { type: "button", className: "adm-iconbtn adm-danger", "aria-label": (part.name || "Kalem") + " sil", onClick: () => deletePricePart(c.id, it.id, part.id) },
                                        React.createElement(AdmIcon, { name: "trash", size: 15 }))));
                        }),
                        React.createElement("button", { type: "button", className: "adm-btn adm-btn-dashed", onClick: () => addPricePart(c.id, it.id) },
                            React.createElement(AdmIcon, { name: "plus", size: 16 }),
                            lay === "models" ? "Model ekle" : lay === "sizes" ? "Ölçü ekle" : "Modül ekle"),
                        !isVariantLayout(lay) && React.createElement("div", { className: "adm-total" },
                            React.createElement("div", { style: { flex: 1 } },
                                React.createElement("b", null, "Tak\u0131m fiyat\u0131"),
                                React.createElement("label", { className: "adm-mini" },
                                    React.createElement("input", { type: "checkbox", checked: p.autoCollect !== false, onChange: e => setPriceAutoCollect(c.id, it.id, e.target.checked) }),
                                    "Mod\u00FClleri otomatik topla")),
                            p.autoCollect === false
                                ? (curEnabled(data) ? React.createElement(NumField, { className: "adm-input adm-num adm-w160", inputMode: "decimal", min: 0, "aria-label": "Tak\u0131m fiyat\u0131", value: (_a = p.manualTotal) !== null && _a !== void 0 ? _a : "", placeholder: "Tak\u0131m fiyat\u0131", onValue: v => updateItem(c.id, it.id, "price", { ...p, manualTotal: v }) }) : React.createElement("div", { className: "adm-curgrid" }, [["TRY", "\u20BA"], ["USD", "$"], ["EUR", "\u20AC"]].map(([cur, sym]) => { const val = cur === "TRY" ? p.manualTotal : (p.totals || {})[cur]; const miss = priceNumber(val) === null; return React.createElement("label", { key: cur, className: "adm-field adm-curfield" + (miss ? " is-missing" : "") },
                                    React.createElement("span", null, "Tak\u0131m " + sym + ""),
                                    React.createElement(NumField, { className: "adm-input adm-num", inputMode: "decimal", min: 0, "aria-label": "Tak\u0131m fiyat\u0131 " + cur, value: val ?? "", placeholder: "\u2014", onValue: v => updateItem(c.id, it.id, "price", cur === "TRY" ? { ...p, manualTotal: v } : { ...p, totals: { ...(p.totals || {}), [cur]: v } }) })); })))
                                : React.createElement("span", { className: "adm-gold adm-big" }, admFmt(priceTotal(it.price)))))),
                React.createElement("div", { className: "adm-drawer-f" },
                    React.createElement("button", { type: "button", className: "adm-btn adm-danger-btn", onClick: () => { deleteItem(c.id, it.id); setAdmEdit(null); } },
                        React.createElement(AdmIcon, { name: "trash", size: 15 }),
                        "\u00DCr\u00FCn\u00FC sil"),
                    React.createElement("span", { style: { flex: 1 } }),
                    React.createElement("button", { type: "button", className: "adm-btn", onClick: close }, "Kapat"),
                    React.createElement("button", { type: "button", "data-tour": "save", className: "adm-btn adm-btn-gold", disabled: saving, onClick: admSaveNow },
                        React.createElement(AdmIcon, { name: "save", size: 16 }),
                        saving ? "Kaydediliyor…" : "Kaydet ve yayınla"))));
    }
    function admRenderAddPicker() {
        if (!admAddPick)
            return null;
        return React.createElement("div", { className: "adm-modal-wrap", onClick: () => setAdmAddPick(false) },
            React.createElement("div", { className: "adm-modal", role: "dialog", "aria-modal": "true", "aria-label": "Kategori se\u00E7in", onClick: e => e.stopPropagation() },
                React.createElement("div", { className: "adm-card-h" },
                    React.createElement("h2", null, "Yeni \u00FCr\u00FCn hangi kategoriye?"),
                    React.createElement("button", { type: "button", className: "adm-iconbtn", "aria-label": "Kapat", onClick: () => setAdmAddPick(false) },
                        React.createElement(AdmIcon, { name: "x", size: 18 }))),
                categories.length === 0 && React.createElement("p", { style: { opacity: .7, fontSize: 13, margin: "0 0 12px" } }, "Hen\u00FCz kategori yok. \u00D6nce bir kategori olu\u015Fturun; \u00FCr\u00FCn o kategoriye eklenecek."),
                React.createElement("div", { className: "adm-catgrid" }, categories.map(c => React.createElement("button", { type: "button", key: c.id, className: "adm-catbtn", onClick: () => admAddProduct(c.id) },
                    React.createElement("b", null, c.name || "(ads\u0131z)"),
                    React.createElement("span", null,
                        c.items.length,
                        " \u00FCr\u00FCn"))),
                    React.createElement("button", { type: "button", key: "__new", className: "adm-catbtn", style: { borderStyle: "dashed" }, onClick: async () => { const id = await promptAddCategory(); if (id) setTimeout(() => admAddProduct(id), 0); } },
                        React.createElement("b", null, "+ Yeni kategori"),
                        React.createElement("span", null, "Olu\u015Ftur ve \u00FCr\u00FCn ekle")))));
    }
    function admRenderTour() {
        if (tourStep === null) return null;
        const h = React.createElement;
        if (tourStep === "welcome") {
            return h("div", { className: "adm-tour-layer", role: "dialog", "aria-modal": "true", "aria-label": "Hoş geldin rehberi" },
                h("div", { className: "adm-tour-dim" }),
                h("div", { className: "adm-tour-card is-center" },
                    h("div", { className: "adm-tour-head" },
                        h("span", { className: "adm-tour-ico" }, h(AdmIcon, { name: "check", size: 20 })),
                        h("div", { className: "adm-tour-title" }, "PIN oluşturuldu, hoş geldin!")),
                    h("p", { className: "adm-tour-text" }, "Yönetim panelini 1 dakikada tanıyalım. Her adımda ilgili buton parlayacak ve ne işe yaradığı yazacak."),
                    h("ul", { className: "adm-tour-list" },
                        h("li", null, "Ürün ve kategori ekleme"),
                        h("li", null, "Fiyat, kur ve PDF"),
                        h("li", null, "Görünüm, yedek ve kaydetme")),
                    h("div", { className: "adm-tour-btns" },
                        h("button", { type: "button", onClick: tourFinish }, "Atla"),
                        h("button", { type: "button", className: "pri", autoFocus: true, onClick: () => tourGo(0) }, "Turu başlat"))));
        }
        const st = TOUR_STEPS[tourStep];
        if (!st) return null;
        const last = tourStep === TOUR_STEPS.length - 1;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const pos = tourRect && tourRect.top + tourRect.height / 2 > vh * 0.55 ? "is-top" : "is-bottom";
        return h("div", { className: "adm-tour-layer", role: "dialog", "aria-modal": "true", "aria-label": "Panel tanıtım turu" },
            tourRect ? h("div", { className: "adm-tour-dim", style: { clipPath: "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, " + tourRect.left + "px " + tourRect.top + "px, " + (tourRect.left + tourRect.width) + "px " + tourRect.top + "px, " + (tourRect.left + tourRect.width) + "px " + (tourRect.top + tourRect.height) + "px, " + tourRect.left + "px " + (tourRect.top + tourRect.height) + "px, " + tourRect.left + "px " + tourRect.top + "px)" } }) : h("div", { className: "adm-tour-dim" }),
            tourRect && h("div", { className: "adm-tour-spot", style: { top: tourRect.top, left: tourRect.left, width: tourRect.width, height: tourRect.height } }),
            h("div", { className: "adm-tour-card " + pos, "aria-live": "polite" },
                h("div", { className: "adm-tour-head" },
                    h("span", { className: "adm-tour-ico" }, st.icon === "?" ? "?" : h(AdmIcon, { name: st.icon, size: 20 })),
                    h("div", { className: "adm-tour-title" }, st.title),
                    h("span", { className: "adm-tour-count" }, (tourStep + 1) + " / " + TOUR_STEPS.length)),
                h("p", { className: "adm-tour-text" }, st.text),
                h("div", { className: "adm-tour-dots", "aria-hidden": "true" }, TOUR_STEPS.map((_, i) => h("span", { key: i, className: i === tourStep ? "on" : "" }))),
                h("div", { className: "adm-tour-btns" },
                    h("button", { type: "button", onClick: tourFinish }, "Atla"),
                    h("button", { type: "button", disabled: tourStep === 0, onClick: () => tourGo(tourStep - 1) }, "Geri"),
                    h("button", { type: "button", className: "pri", onClick: () => last ? tourFinish() : tourGo(tourStep + 1) }, last ? "Bitir" : "İleri"))));
    }
    function admShell(legacy) {
        const NAV = [["panel", "Genel Bakış", "grid"], ["urunler", "Ürünler", "box"], ["fiyat", "Fiyatlar & Kurlar", "tag"], ["katalog", "Kategoriler & Kapaklar", "list"], ["pdf", "PDF & Katalog", "file"], ["genel", "Görünüm & Ayarlar", "palette"]];
        const isNew = adminSection === "panel" || adminSection === "urunler";
        return React.createElement("div", { className: "adm-shell", role: "dialog", "aria-modal": "true", "aria-label": "Y\u00F6netim Paneli", style: { accentColor: theme.accent, "--adm-accent": theme.accent, "--adm-ink": ink } },
            React.createElement("nav", { className: "adm-side", "aria-label": "Y\u00F6netim men\u00FCs\u00FC" },
                React.createElement("div", { className: "adm-brand" },
                    React.createElement("span", { className: "adm-logo" }, (String(data.siteName || "K").trim().charAt(0) || "K").toLocaleLowerCase("tr-TR")),
                    React.createElement("span", null,
                        React.createElement("b", null, data.siteName || "Katalog"),
                        React.createElement("small", null, "Y\u00F6netim"))),
                NAV.map(([id, label, icon]) => React.createElement("button", { key: id, "data-tour": id, type: "button", className: "adm-nav" + (adminSection === id ? " is-on" : ""), "aria-current": adminSection === id ? "page" : undefined, onClick: () => admGo(id) },
                    React.createElement(AdmIcon, { name: icon, size: 18 }),
                    React.createElement("span", null, label),
                    id === "urunler" && React.createElement("small", null, admAll.length))),
                React.createElement("div", { className: "adm-side-spacer" }),
                !STORAGE_OK && React.createElement("div", { role: "note", className: "storage-warn" }, STORAGE_WARNING),
                React.createElement("div", { className: "adm-status" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "adm-dot" + (admDirty ? " is-warn" : "") }),
                        admDirty ? "Kaydedilmemiş değişiklik var" : "Her şey kaydedildi",
                        trBusy > 0 ? " · İngilizce çeviri yapılıyor (" + trBusy + ")" : ""),
                    React.createElement("small", null, window.SH21 ? "De\u011Fi\u015Fiklikler \u201CKaydet ve yay\u0131nla\u201D ile hemen yay\u0131na al\u0131n\u0131r." : "De\u011Fi\u015Fiklikler \u201CKaydet ve yay\u0131nla\u201D ile bu cihaza kaydedilir."))),
            React.createElement("div", { className: "adm-main" },
                React.createElement("header", { className: "adm-top" },
                    React.createElement("label", { className: "adm-search adm-search-top" },
                        React.createElement(AdmIcon, { name: "search", size: 16 }),
                        React.createElement("input", { type: "search", "aria-label": "\u00DCr\u00FCn ara", placeholder: "\u00DCr\u00FCn ara\u2026", value: admQuery, onChange: e => {
                                setAdmQuery(safeText(e.target.value, SECURITY_LIMITS.search));
                                setAdmLimit(80);
                                if (adminSection !== "urunler")
                                    setAdminSection("urunler");
                            } })),
                    React.createElement("span", { className: "adm-top-spacer" }),
                    React.createElement("button", { type: "button", "data-tour": "help", className: "adm-iconbtn adm-help-btn", "aria-label": "Yardım turu", title: "Yardım turu", onClick: () => tourGo(0) }, "?"),
                    React.createElement("button", { type: "button", className: "adm-btn adm-hide-sm", onClick: () => requestCloseAdminPanel() },
                        React.createElement(AdmIcon, { name: "eye", size: 16 }),
                        "Siteye d\u00F6n"),
                    React.createElement("button", { type: "button", "data-tour": "save", className: "adm-btn adm-btn-gold", disabled: saving, onClick: admSaveNow },
                        React.createElement(AdmIcon, { name: "save", size: 16 }),
                        saving ? "Kaydediliyor…" : React.createElement("span", null,
                            "Kaydet",
                            React.createElement("span", { className: "adm-hide-sm" }, " ve yay\u0131nla"))),
                    React.createElement("button", { type: "button", className: "adm-iconbtn adm-show-sm", "aria-label": "Paneli kapat", onClick: () => requestCloseAdminPanel() },
                        React.createElement(AdmIcon, { name: "x", size: 18 }))),
                !STORAGE_OK && React.createElement("div", { role: "note", className: "storage-warn storage-warn-sm" }, STORAGE_WARNING),
                React.createElement("div", { className: "adm-content" },
                    adminSection === "panel" && admRenderDashboard(),
                    adminSection === "urunler" && admRenderProducts(),
                    React.createElement("div", { className: "adm-legacy" + (isNew ? " hidden" : "") }, legacy))),
            admRenderEditor(),
            admRenderAddPicker(),
            admRenderTour());
    }

    try {
        document.documentElement.style.setProperty("--page-bg", theme.bg);
        document.documentElement.dataset.ui = UI_STYLES.includes(theme.ui) ? theme.ui : "apple";
    }
    catch (_) { }
    return React.createElement("div", { className: "luxury-bg", style: { minHeight: "100vh", backgroundColor: theme.bg, backgroundImage: cssUrl(theme.bgImage) ? `linear-gradient(${theme.bg}cc,${theme.bg}f5),${cssUrl(theme.bgImage)}` : undefined, backgroundSize: "cover", backgroundPosition: "center", color: theme.text, fontFamily: "var(--apple-font)", "--th-bg": theme.bg, "--th-card": theme.card, "--th-text": theme.text, "--th-acc": theme.accent, "--th-ink": ink } },
        React.createElement("div", { "aria-hidden": "true", className: "fixed inset-x-0 top-0 z-30 pointer-events-none", style: { height: "calc(max(40px, env(safe-area-inset-top, 0px) + 32px) + 50px)", background: theme.bg, opacity: (pageScrolled || searchOpen) ? 1 : 0, transition: "opacity .2s ease" } }),
        React.createElement("div", { className: "fixed left-4 right-4 z-40", style: { top: "max(40px,calc(env(safe-area-inset-top, 0px) + 32px))" } },
            React.createElement("div", { className: "max-w-5xl mx-auto flex justify-end items-center gap-2" },
                React.createElement("button", { type: "button", "aria-label": language === "TR" ? "Switch to English" : "Türkçeye geç", onClick: () => switchLanguage(language === "TR" ? "EN" : "TR"), className: "h-11 px-3.5 rounded-full flex items-center justify-center gap-1.5 font-bold text-xs border", style: { background: theme.card, color: theme.text, borderColor: theme.text + "20" } },
                    React.createElement(Icon, { type: "globe", size: 14 }),
                    React.createElement("span", { style: { opacity: language === "TR" ? 1 : .72 } }, "TR"),
                    React.createElement("span", { "aria-hidden": "true", style: { opacity: .35 } }, "|"),
                    React.createElement("span", { style: { opacity: language === "EN" ? 1 : .72 } }, "EN")),
                siteCurrencies.length > 1 && React.createElement("div", { className: "relative" },
                    React.createElement("button", { type: "button", "aria-haspopup": "menu", "aria-expanded": currencyMenuOpen, "aria-label": (language === "EN" ? "Currency: " : "Para birimi: ") + currency.name, onClick: () => setCurrencyMenuOpen(p => !p), className: "h-11 min-w-[58px] px-3 rounded-full flex items-center justify-center gap-1.5 font-bold text-sm", style: { background: theme.accent, color: ink } },
                        currency.symbol,
                        React.createElement("span", { className: "hidden sm:inline" }, currency.name)),
                    currencyMenuOpen && React.createElement("div", { role: "menu", className: "absolute right-0 mt-2 w-36 rounded-2xl overflow-hidden shadow-2xl border", style: { background: theme.card, borderColor: theme.text + "18", zIndex: 1000 } },
                        React.createElement("div", { className: "px-3 py-2 text-[9px] uppercase tracking-widest font-bold opacity-40 border-b" }, t(language, "currency")),
                        siteCurrencies.map(c => React.createElement("button", { key: c.id, onClick: () => { chooseViewCurrency(c.id); setCurrencyMenuOpen(false); }, className: "w-full px-3 py-3 flex items-center justify-between text-sm font-semibold", style: { background: currency.id === c.id ? theme.accent + "18" : "transparent", color: theme.text } },
                            React.createElement("span", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-8 h-8 rounded-full flex items-center justify-center font-bold", style: { background: currency.id === c.id ? theme.accent : theme.accent + "18", color: currency.id === c.id ? ink : theme.accent } }, c.symbol),
                                React.createElement("span", null, c.name)),
                            currency.id === c.id && React.createElement(Icon, { type: "check", size: 15 }))))),
                React.createElement("button", { type: "button", "aria-label": searchOpen ? (language === "EN" ? "Close search" : "Aramayı kapat") : (language === "EN" ? "Search products" : "Ürün ara"), "aria-expanded": searchOpen, onClick: () => { if (searchOpen) {
                        setSearchOpen(false);
                        setSearch("");
                    }
                    else
                        setSearchOpen(true); }, className: "w-11 h-11 rounded-full flex items-center justify-center apple-glass-btn", style: { background: theme.card + "cc", border: "1px solid " + theme.text + "14", backdropFilter: "saturate(180%) blur(20px)", color: theme.text } },
                    React.createElement(Icon, { type: "search", size: 18 })))),
        searchOpen && React.createElement("div", { className: "fixed inset-x-0 z-40 px-4 pb-3 pt-1", style: { top: "calc(max(40px, env(safe-area-inset-top, 0px) + 32px) + 50px)", background: theme.bg, boxShadow: `0 14px 20px -12px ${theme.bg}` } },
            React.createElement("div", { className: "max-w-5xl mx-auto relative" },
                React.createElement(Icon, { type: "search", size: 16, className: "search-input-icon" }),
                React.createElement("input", { autoFocus: true, type: "search", "aria-label": t(language, "search"), value: search, onChange: e => setSearch(safeText(e.target.value, SECURITY_LIMITS.search)), onKeyDown: e => { if (e.key === "Escape") {
                        setSearchOpen(false);
                        setSearch("");
                    } }, placeholder: t(language, "search"), className: "search-input", style: { color: theme.text, background: theme.card + "f2" } }))),
        React.createElement("header", { className: "px-6 pt-28 pb-8 max-w-5xl mx-auto" },
            React.createElement("div", { onPointerDown: e => { if (e.pointerType === "mouse" && e.button !== 0)
                    return; e.preventDefault(); startLogoLongPress(e); }, onPointerUp: cancelLogoLongPress, onPointerCancel: cancelLogoLongPress, onPointerLeave: cancelLogoLongPress, onContextMenu: e => e.preventDefault(), title: "", style: { width: "100%", display: "flex", justifyContent: data.logo.position === "left" ? "flex-start" : data.logo.position === "right" ? "flex-end" : "center", marginBottom: 18, cursor: "pointer", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none", touchAction: "manipulation" } }, data.logo.src && !logoFailed ? React.createElement(CachedImage, { loading: "eager", decoding: "async", src: data.logo.src, onError: () => setLogoFailed(true), alt: siteName || "Logo", draggable: "false", style: { width: data.logo.width || data.logo.size || 110, height: data.logo.height || data.logo.size || 110, maxWidth: "70vw", objectFit: "contain", display: "block", pointerEvents: "none" } }) : React.createElement("div", { "aria-hidden": "true", style: { width: 64, height: 64, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: theme.accent, border: `1px solid ${theme.accent}55`, background: theme.accent + "14", pointerEvents: "none" } }, (siteName || "O").trim().charAt(0).toLocaleUpperCase("tr-TR"))),
            React.createElement("div", { className: "text-center" },
                React.createElement("div", { className: "text-[10px] font-bold tracking-[.28em] mb-2", style: { color: theme.accent } }, eyebrow),
                React.createElement("h1", { className: "text-3xl font-bold leading-tight" }, siteName),
                React.createElement("p", { className: "text-sm opacity-80 mt-2" }, subtitle),
                (data.discount?.enabled && data.discount?.currencies?.[viewCurrencyId] !== false) && React.createElement("div", { className: "mt-4 flex items-center justify-center" }, (() => {
                    /* İskonto rozeti: boşken kesikli "İskonto uygula" düğmesi; oran girilince/yazarken dolu vurgu renkli rozet. */
                    const rate = discountRates[viewCurrencyId], has = Number(rate) > 0, EN = language === "EN";
                    if (!has && !discountOpen)
                        return React.createElement("button", { type: "button", onClick: () => setDiscountOpen(true), className: "inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-semibold transition-colors", style: { color: theme.accent, border: "1px dashed " + theme.accent + "8c", background: "transparent" } },
                            React.createElement("svg", { viewBox: "0 0 24 24", width: 15, height: 15, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
                                React.createElement("path", { d: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" }),
                                React.createElement("circle", { cx: 7.5, cy: 7.5, r: 1.5 })),
                            EN ? "Apply discount" : "İskonto uygula");
                    return React.createElement("div", { className: "inline-flex items-center gap-1.5 h-10 pl-4 pr-1.5 rounded-full", style: { background: theme.accent, color: ink, boxShadow: "0 8px 22px " + theme.accent + "4d" } },
                        React.createElement("span", { className: "inline-flex items-baseline text-[15px] font-extrabold tabular-nums" },
                        React.createElement("span", { style: { marginRight: 2 } }, "%"),
                        React.createElement("input", { type: "text", inputMode: "numeric", autoFocus: !has, "aria-label": EN ? "Discount percent" : "İskonto yüzdesi", value: (rate === 0 || rate) ? String(rate) : "", placeholder: "0", onChange: e => setDiscountRate(viewCurrencyId, e.target.value), onBlur: () => { if (!(Number(discountRates[viewCurrencyId]) > 0)) setDiscountOpen(false); }, className: "discount-badge-input bg-transparent text-left text-[15px] font-extrabold tabular-nums outline-none border-0 p-0", style: { color: "inherit", fontFamily: "inherit", letterSpacing: 0, width: String((rate === 0 || rate) ? rate : "0").length + 0.7 + "ch" } })),
                        React.createElement("span", { className: "text-[12px] font-semibold whitespace-nowrap", style: { opacity: .92 } }, has ? (EN ? "discount applied" : "iskonto uygulandı") : (EN ? "discount" : "iskonto")),
                        React.createElement("button", { type: "button", "aria-label": EN ? "Reset discount" : "İskontoyu sıfırla", onMouseDown: e => e.preventDefault(), onClick: () => { setDiscountRate(viewCurrencyId, ""); setDiscountOpen(false); }, className: "ml-1 w-7 h-7 rounded-full inline-flex items-center justify-center text-[15px] leading-none", style: { background: "rgba(255,255,255,.22)", color: "inherit" } }, "×"));
                })()),
                React.createElement("div", { className: "mt-4 flex flex-wrap items-center justify-center gap-2" },
                    data.phone && React.createElement("a", { href: "tel:" + data.phone.replace(/\s/g, ""), className: "inline-flex items-center gap-2 px-5 min-h-[44px] rounded-full text-sm font-semibold", style: { background: theme.accent, color: ink } },
                        React.createElement(Icon, { type: "phone", size: 15 }),
                        data.phone),
                    [["catalog", language === "EN" ? "Catalog" : "Katalog", language === "EN" ? "Download the product catalog without prices (PDF)" : "Fiyatsız ürün kataloğunu indir (PDF)"], ["price", language === "EN" ? "Price List" : "Fiyat Listesi", language === "EN" ? "Download the price list (PDF)" : "Fiyat listesini indir (PDF)"]].map(([kind, label, aria]) => React.createElement("button", { key: kind, type: "button", "aria-label": aria, onClick: () => createPDF(false, kind), disabled: !!pdfBusy, className: "inline-flex items-center gap-2 px-5 min-h-[44px] rounded-full text-sm font-semibold border disabled:opacity-60 apple-pill", style: kind === "price" ? { borderColor: theme.accent, color: ink, background: theme.accent } : { borderColor: theme.accent, color: theme.accent, background: "transparent" } },
                        React.createElement(Icon, { type: "download", size: 15 }),
                        pdfBusy === kind ? (language === "EN" ? "Preparing…" : "Hazırlanıyor…") : label,
                        React.createElement("span", { className: "text-[10px] font-bold opacity-80" }, "PDF")))))),
        React.createElement("div", { className: "max-w-5xl mx-auto px-4 mb-2" },
            React.createElement("div", { className: "flex items-center justify-between gap-3" },
                React.createElement("div", { className: "min-w-0" },
                    React.createElement("h2", { className: "text-xl font-bold truncate" }, q ? (language === "EN" ? "Search results" : "Arama sonuçları") : (activeCategory ? categoryDisplay(activeCategory) : t(language, "premium"))),
                    React.createElement("div", { className: "text-xs opacity-80 mt-1", "aria-live": "polite" }, q ? (language === "EN" ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"} found for “${search.trim()}”` : `“${search.trim()}” için ${visibleProducts.length} ürün bulundu`) : `${visibleProducts.length} ${t(language, "products")}`)),
                q && React.createElement("button", { type: "button", onClick: () => setSearch(""), className: "text-xs opacity-70 underline underline-offset-4 min-h-[44px] px-2 shrink-0" }, t(language, "clearSearch")))),
        !q && React.createElement("div", { ref: categoryBarRef, className: "sticky z-20 px-4 pt-2 pb-2 category-bar" + (barStuck ? " is-stuck" : ""), style: { top: "calc(max(40px, env(safe-area-inset-top, 0px) + 32px) + 50px)", "--catbar-bg": theme.bg } },
            React.createElement("div", { className: "max-w-5xl mx-auto category-scroll", ref: el => {
                    /* Fare tekerleği şeridi yatay kaydırır. React'in tekerlek dinleyicisi "passive" olduğu için
                       preventDefault çalışmıyordu (konsol hatası + sayfa da kayıyordu); yerel, pasif olmayan dinleyici kullanılır. */
                    if (!el || el.__wheelBound)
                        return;
                    el.__wheelBound = true;
                    el.addEventListener("wheel", e => { if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        e.preventDefault();
                        el.scrollLeft += e.deltaY;
                    } }, { passive: false });
                }, onMouseDown: e => { const el = e.currentTarget; el.dataset.dragging = "1"; el.dataset.dragStartX = String(e.clientX); el.dataset.dragStartScroll = String(el.scrollLeft); }, onMouseMove: e => { const el = e.currentTarget; if (el.dataset.dragging === "1") {
                    el.scrollLeft = Number(el.dataset.dragStartScroll) - (e.clientX - Number(el.dataset.dragStartX));
                } }, onMouseUp: e => { e.currentTarget.dataset.dragging = "0"; }, onMouseLeave: e => { e.currentTarget.dataset.dragging = "0"; } }, publicCategories.map((category, index) => { const active = category.id === activeCat; return React.createElement("button", { type: "button", key: category.id, "aria-pressed": active, onClick: e => goToCategory(category.id, e.currentTarget), className: "category-chip " + (active ? "active" : ""), style: { background: active ? theme.text : theme.card, color: active ? theme.bg : theme.text, borderColor: active ? theme.text : theme.text + "14", opacity: 1, boxShadow: active ? "0 4px 14px rgba(0,0,0,.12)" : "none", animation: `categoryEnter .4s cubic-bezier(.22,1,.36,1) ${index * 45}ms both` } }, categoryDisplay(category)); }))),
        React.createElement("div", { ref: productsTopRef, "aria-hidden": "true", style: { height: 0 } }),
        React.createElement("main", { key: q ? `search-${q}` : activeCat, className: "product-grid px-4 pt-4 pb-28 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3" },
            visibleProducts.length === 0 && React.createElement("div", { className: "col-span-full text-center py-16 opacity-60" }, q ? t(language, "notFound") : t(language, "empty")),
            visibleProducts.map((item, index) => React.createElement("article", { key: item.id, role: "button", tabIndex: 0, "aria-label": productDisplay(item), onClick: () => { setSelectedProduct(item); setDetailGalleryIndex(0); }, onKeyDown: e => { if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedProduct(item);
                    setDetailGalleryIndex(0);
                } }, className: "product-card rounded-2xl overflow-hidden cursor-pointer", style: { background: theme.card, boxShadow: "0 5px 18px rgba(0,0,0,.14)", animationDelay: `${Math.min(index, 8) * 45}ms` } },
                React.createElement("div", { className: "product-image", style: { height: data.cardImgSize, backgroundColor: theme.accent + "12", display: "block", position: "relative" } }, (() => { const g = Array.isArray(item.images) && item.images.length ? item.images : (item.image ? [item.image] : []); const idx = (galleryIndex[item.id] || 0) % Math.max(g.length, 1); if (!g.length)
                    return React.createElement("div", { style: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } },
                        React.createElement(Icon, { type: "image", size: 28 })); return React.createElement("div", { className: "product-gallery-frame", onPointerDown: e => { if (g.length < 2)
                        return; e.currentTarget.setPointerCapture?.(e.pointerId); e.currentTarget.dataset.sx = String(e.clientX); e.currentTarget.dataset.sy = String(e.clientY); }, onPointerUp: e => { if (g.length < 2)
                        return; const el = e.currentTarget, sx = Number(el.dataset.sx || 0), sy = Number(el.dataset.sy || 0), dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
                        el.dataset.swiped = "1";
                        setGalleryIndex(p => ({ ...p, [item.id]: (idx + (dx < 0 ? 1 : -1) + g.length) % g.length }));
                    } }, onClick: e => { if (e.currentTarget.dataset.swiped === "1") {
                        e.stopPropagation();
                        delete e.currentTarget.dataset.swiped;
                    } }, style: { touchAction: "pan-y" } },
                    React.createElement(CachedImage, { key: `${item.id}-${idx}`, className: "product-gallery-img", src: g[idx], alt: productDisplay(item), loading: "lazy", decoding: "async", fetchpriority: "low", draggable: "false" }),
                    g.length > 1 && React.createElement("div", { className: "gallery-dots" }, g.slice(0, 7).map((_, i) => React.createElement("span", { key: i, className: 'gallery-dot ' + (i === idx ? 'active' : '') })))); })()),
                React.createElement("div", { className: "p-3 flex flex-col" },
                    q && React.createElement("div", { className: "text-[9px] uppercase tracking-wider font-bold mb-1 truncate", style: { color: theme.accent } }, getText(language, item.categoryName, item.categoryName_en, item.categoryName)),
                    React.createElement("div", { className: "font-semibold text-sm leading-tight line-clamp-3" }, productDisplay(item)),
                    productDims(item) && React.createElement("div", { className: "text-[11px] opacity-70 mt-1 tabular-nums" }, productDims(item)),
                    productDesc(item) && React.createElement("div", { className: "text-xs opacity-65 mt-1 leading-snug line-clamp-2" }, productDesc(item)),
                    cardPrice(item) !== null ? React.createElement("div", { className: "mt-3 pt-3 border-t", style: { borderColor: theme.text + "14" } },
                        React.createElement("div", { className: "flex items-center justify-between flex-wrap", style: { columnGap: 8, rowGap: 2 } },
                            React.createElement("span", { className: "text-[10px] uppercase tracking-wider font-bold opacity-75 whitespace-nowrap" }, (vadeOn() && !isVariantLayout(layoutOfItem(item))) ? t(language, "cashPrice") : cardPriceLabel(item)),
                            React.createElement("span", { className: "text-[13px] font-bold whitespace-nowrap tabular-nums", style: { color: theme.accent } }, formatAmount(cardPrice(item)))),
                        vadeOn() && formatVade(cardPrice(item)) && React.createElement("div", { className: "flex items-center justify-between flex-wrap mt-0.5", style: { columnGap: 8, rowGap: 0 } },
                            React.createElement("span", { className: "text-[10px] uppercase tracking-wider font-bold opacity-60 whitespace-nowrap" }, vadeLabel()),
                            React.createElement("span", { className: "text-[11.5px] font-semibold whitespace-nowrap tabular-nums opacity-80" }, formatVade(cardPrice(item)))),
                        React.createElement("div", { className: "mt-1 text-[11px] opacity-75 flex items-center gap-1" },
                            cardPriceSub(item),
                            React.createElement(Icon, { type: "arrow", size: 11 }))) : React.createElement("div", { className: "mt-3 pt-3 border-t text-[11px] font-semibold", style: { borderColor: theme.text + "14", color: theme.accent } }, t(language, "contactPrice")))))),
        selectedProduct && React.createElement("div", { className: "fixed inset-0 z-[100] modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-5", onClick: () => setSelectedProduct(null) },
            React.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": productDisplay(selectedProduct), className: "relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl", style: { background: theme.card, color: theme.text, animation: "pop .22s ease" }, onClick: e => e.stopPropagation() },
                React.createElement("div", { className: "sticky top-0 z-10 h-0 flex justify-end" },
                    React.createElement("button", { type: "button", autoFocus: true, "aria-label": language === "EN" ? "Close" : "Kapat", onClick: () => setSelectedProduct(null), className: "mt-4 mr-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg", style: { background: "rgba(0,0,0,.6)", color: "#fff", backdropFilter: "blur(8px)" } },
                        React.createElement(Icon, { type: "x", size: 20 }))),
                React.createElement("div", { className: "relative" },
                    React.createElement("div", { className: "detail-gallery", onPointerDown: e => { e.currentTarget.setPointerCapture?.(e.pointerId); e.currentTarget.dataset.sx = String(e.clientX); e.currentTarget.dataset.sy = String(e.clientY); e.currentTarget.dataset.moved = "0"; }, onPointerMove: e => { const sx = Number(e.currentTarget.dataset.sx || e.clientX), sy = Number(e.currentTarget.dataset.sy || e.clientY); if (Math.hypot(e.clientX - sx, e.clientY - sy) > 10)
                            e.currentTarget.dataset.moved = "1"; }, onPointerUp: e => { const sx = Number(e.currentTarget.dataset.sx || e.clientX), sy = Number(e.currentTarget.dataset.sy || e.clientY), dx = e.clientX - sx, dy = e.clientY - sy, g = Array.isArray(selectedProduct.images) && selectedProduct.images.length ? selectedProduct.images : (selectedProduct.image ? [selectedProduct.image] : []); if (g.length > 1 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
                            setDetailGalleryIndex(v => (v + (dx < 0 ? 1 : -1) + g.length) % g.length);
                        }
                        else if (e.currentTarget.dataset.moved !== "1" && g.length) {
                            setFullScreenImage({ images: g, index: (detailGalleryIndex || 0) % g.length });
                            setLightboxZoom(1);
                        } }, style: { backgroundColor: theme.accent + "12", touchAction: "pan-y" } }, (() => { const g = Array.isArray(selectedProduct.images) && selectedProduct.images.length ? selectedProduct.images : (selectedProduct.image ? [selectedProduct.image] : []); const idx = (detailGalleryIndex || 0) % Math.max(g.length, 1); return g.length ? React.createElement(CachedImage, { key: `detail-${selectedProduct.id}-${idx}`, loading: "lazy", src: g[idx], alt: productDisplay(selectedProduct), className: "detail-gallery-img", decoding: "async", draggable: "false" }) : React.createElement("div", { style: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } },
                        React.createElement(Icon, { type: "image", size: 40 })); })()),
                    (() => { const g = Array.isArray(selectedProduct.images) && selectedProduct.images.length ? selectedProduct.images : (selectedProduct.image ? [selectedProduct.image] : []); return g.length > 1 && React.createElement("div", { className: "detail-gallery-dots" }, g.map((_, i) => React.createElement("span", { key: i, className: 'detail-gallery-dot ' + (i === detailGalleryIndex ? 'active' : '') }))); })()),
                React.createElement("div", { className: "p-5" },
                    React.createElement("div", { className: "text-[11px] uppercase tracking-widest font-bold mb-2", style: { color: theme.accent } }, productCategoryName(selectedProduct) || t(language, "premium")),
                    React.createElement("h2", { className: "text-2xl font-bold" }, productDisplay(selectedProduct)),
                    productDims(selectedProduct) && React.createElement("div", { className: "text-sm mt-2" },
                        React.createElement("span", { className: "text-[11px] uppercase tracking-wide opacity-80" },
                            t(language, "dimensions"),
                            ":"),
                        " ",
                        React.createElement("span", { className: "font-medium tabular-nums" }, productDims(selectedProduct))),
                    productDesc(selectedProduct) && React.createElement("p", { className: "text-sm opacity-75 mt-2 leading-relaxed" }, productDesc(selectedProduct)),
                    React.createElement("div", { className: "mt-5" },
                        React.createElement("div", { className: "text-[11px] uppercase tracking-widest font-bold opacity-60 mb-3" }, t(language, "prices")),
                        normalizePrice(selectedProduct.price).parts.length > 0 ? React.createElement("div", { className: "space-y-2" }, normalizePrice(selectedProduct.price).parts.map(part => React.createElement("div", { key: part.id, className: "price-row rounded-xl p-3 flex items-center justify-between gap-3" },
                            layoutOfItem(selectedProduct) === "models" && part.image && React.createElement("button", { type: "button", "aria-label": (partDisplay(part) || "") + (language === "EN" ? " photo" : " fotoğrafı"), onClick: () => { setFullScreenImage({ images: [part.image], index: 0 }); setLightboxZoom(1); }, className: "shrink-0 w-14 h-14 rounded-lg overflow-hidden", style: { background: "#f4f2ee" } },
                                React.createElement(CachedImage, { src: part.image, alt: "", className: "w-full h-full object-contain", loading: "lazy", decoding: "async" })),
                            React.createElement("div", { className: "text-sm font-medium flex-1 min-w-0" },
                                React.createElement("div", null, partDisplay(part)),
                                partDimensionDisplay(part) && React.createElement("div", { className: "text-[11px] opacity-80 mt-1" },
                                    React.createElement("span", { className: "uppercase tracking-wide opacity-90" },
                                        t(language, "dimensions"),
                                        ":"),
                                    " ",
                                    partDimensionDisplay(part))),
                            React.createElement("div", { className: "text-right shrink-0" },
                                React.createElement("div", { className: "text-sm font-bold whitespace-nowrap tabular-nums", style: { color: theme.accent } }, priceText(part)),
                                vadeOn() && !part.contactOnly && formatVade(part.amount) && React.createElement("div", { className: "text-[11px] font-medium whitespace-nowrap tabular-nums opacity-75 mt-0.5" }, vadeLabel() + " " + formatVade(part.amount)))))) : React.createElement("div", { className: "rounded-xl p-4 text-center", style: { background: theme.accent + "12", color: theme.accent } }, t(language, "contactPrice")),
                        !isVariantLayout(layoutOfItem(selectedProduct)) && priceTotal(selectedProduct.price) !== null && React.createElement("div", { className: "mt-3 rounded-xl p-4 flex items-center justify-between", style: { background: theme.accent + "12", border: "1px solid " + theme.accent + "28" } },
                            React.createElement("span", { className: "text-[11px] uppercase tracking-widest font-bold opacity-65" }, t(language, "total") + (vadeOn() ? " · " + t(language, "cashPrice") : "")),
                            React.createElement("span", { className: "text-base font-bold tabular-nums", style: { color: theme.accent } }, productMainPrice(selectedProduct))),
                        vadeOn() && !isVariantLayout(layoutOfItem(selectedProduct)) && priceTotal(selectedProduct.price) !== null && formatVade(priceTotal(selectedProduct.price)) && React.createElement("div", { className: "mt-2 rounded-xl px-4 py-3 flex items-center justify-between gap-3", style: { background: theme.accent + "0a", border: "1px solid " + theme.accent + "1c" } },
                            React.createElement("span", { className: "text-[11px] uppercase tracking-widest font-bold opacity-65" }, t(language, "total") + " · " + vadeLabel() + " (" + vadePctText(vadeRateOf(viewCurrencyData())) + ")"),
                            React.createElement("span", { className: "text-sm font-bold tabular-nums whitespace-nowrap" }, formatVade(priceTotal(selectedProduct.price)))),
                        !isVariantLayout(layoutOfItem(selectedProduct)) && priceTotal(selectedProduct.price) !== null && hasContactParts(selectedProduct) && React.createElement("div", { className: "text-[11px] opacity-65 mt-2" }, language === "EN" ? "* Total excludes items marked “contact for price”." : "* Toplama, fiyatı sorulacak kalemler dahil değildir.")),
                    data.phone && React.createElement("a", { href: "tel:" + data.phone.replace(/\s/g, ""), className: "mt-5 w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm", style: { background: theme.accent, color: ink } },
                        React.createElement(Icon, { type: "phone", size: 16 }),
                        t(language, "call"))))),
        pdfPreview && React.createElement(PdfPreviewModal, { preview: pdfPreview, language: language, onClose: closePdfPreview, onDownload: downloadPreviewPdf }),
        toast && React.createElement("div", { role: "status", "aria-live": "polite", style: panelOpen ? { top: 80, bottom: "auto", zIndex: 260 } : { bottom: 24 }, className: "fixed left-1/2 -translate-x-1/2 max-w-[calc(100vw-32px)] z-[250] bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl apple-toast text-sm flex items-center gap-2" },
            React.createElement(Icon, { type: "check", size: 15 }),
            toast),
        React.createElement(ProductImageLightbox, { fullScreenImage: fullScreenImage, setFullScreenImage: setFullScreenImage, onClose: () => { setFullScreenImage(null); setLightboxZoom(1); } }),
        pinModal && React.createElement("div", { className: "fixed inset-0 z-[200] bg-black/75 flex items-center justify-center p-4 apple-backdrop" },
            React.createElement("div", { className: "w-full max-w-xs bg-neutral-950 border border-neutral-800 rounded-2xl p-6 apple-pin" },
                React.createElement("div", { className: "flex items-center gap-2 mb-4 text-white" },
                    React.createElement(Icon, { type: "lock", size: 18 }),
                    React.createElement("h2", { className: "font-bold" }, t("TR", "admin"))),
                React.createElement("input", { autoFocus: true, type: "password", inputMode: "numeric", maxLength: "8", value: pinInput, onChange: e => { setPinInput(e.target.value.replace(/\D/g, "")); setPinError(false); }, onKeyDown: e => e.key === "Enter" && tryUnlock(), placeholder: "PIN", className: "admin-input tracking-[.3em]" }),
                pinError && React.createElement("div", { className: "text-xs text-red-400 mt-2" }, t("TR", "wrongPin")),
                React.createElement("div", { className: "text-[11px] text-neutral-500 mt-2 mb-4" }, hasAdminPin() ? "Yönetim PIN'inizi girin." : "İlk kurulum: bu cihaz için 4-8 haneli yeni bir PIN belirleyin."),
                !STORAGE_OK && React.createElement("div", { role: "note", className: "storage-warn mb-4" }, STORAGE_WARNING),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: () => setPinModal(false), className: "flex-1 py-2.5 bg-neutral-800 rounded-lg text-sm text-neutral-300" }, t("TR", "cancel")),
                    React.createElement("button", { onClick: tryUnlock, className: "flex-1 py-2.5 rounded-lg text-sm font-bold", style: { background: theme.accent, color: ink } }, hasAdminPin() ? t("TR", "login") : "PIN Oluştur")))),
        panelOpen && unlocked && admShell(
                React.createElement("div", { className: "p-5" },
                    React.createElement("div", { className: adminSection === "genel" ? "" : "hidden" },
                        React.createElement("label", { className: "block mb-4" },
                            React.createElement(AdminLabel, null, "Site Ad\u0131"),
                            React.createElement("input", { className: "admin-input", value: data.siteName ?? "", onChange: e => editGeneralTurkishField("siteName", e.target.value) })),
                        React.createElement("label", { className: "block mb-4" },
                            React.createElement(AdminLabel, null, "Alt Ba\u015Fl\u0131k"),
                            React.createElement("input", { className: "admin-input", value: data.subtitle ?? "", onChange: e => editGeneralTurkishField("subtitle", e.target.value), placeholder: "Ofis Mobilyalar\u0131" })),
                        React.createElement("label", { className: "block mb-4" },
                            React.createElement(AdminLabel, null, "\u00DCst Etiket"),
                            React.createElement("input", { className: "admin-input", value: data.eyebrow ?? "", onChange: e => editGeneralTurkishField("eyebrow", e.target.value) })),
                        React.createElement("label", { className: "block mb-5" },
                            React.createElement(AdminLabel, null, t("TR", "phone")),
                            React.createElement("input", { className: "admin-input", value: data.phone || "", onChange: e => setPath(["phone"], e.target.value), placeholder: "+90 5xx xxx xx xx" })),
                        React.createElement("div", { className: "h-px bg-neutral-800 my-5" }),
                        React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3" }, "Premium Logo"),
                        React.createElement("div", { className: "bg-neutral-900 rounded-xl p-4 mb-5" },
                            React.createElement("div", { className: "rounded-xl bg-neutral-800 min-h-[120px] flex items-center justify-center mb-3 overflow-hidden" }, data.logo.src && !logoFailed ? React.createElement(CachedImage, { loading: "lazy", decoding: "async", src: data.logo.src, onError: () => setLogoFailed(true), alt: "Logo \u00F6nizleme", style: { width: Math.min(data.logo.width || 110, 260), height: Math.min(data.logo.height || 110, 140), maxWidth: "90%", objectFit: "contain" } }) : React.createElement("div", { className: "text-xs text-neutral-400 text-center px-4" }, data.logo.src ? "Logo dosyası bulunamadı. Yeni bir logo yükleyin." : "Logo eklenmedi")),
                            React.createElement("div", { className: "grid grid-cols-2 gap-2 mb-3" },
                                React.createElement("button", { onClick: () => document.getElementById("local-logo-input")?.click(), className: "py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-bold flex items-center justify-center gap-2" },
                                    React.createElement(Icon, { type: "upload", size: 14 }),
                                    "Logo Ekle / De\u011Fi\u015Ftir"),
                                React.createElement("button", { disabled: !data.logo.src, onClick: removeLogo, className: "py-2.5 rounded-lg bg-red-950 text-red-400 text-xs font-bold disabled:opacity-30" }, "Logo Sil")),
                            React.createElement("input", { id: "local-logo-input", type: "file", accept: "image/png,image/jpeg,image/webp,image/svg+xml", className: "hidden", onChange: uploadLogoLocal }),
                            React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                                React.createElement("label", null,
                                    React.createElement(AdminLabel, null,
                                        "Logo Geni\u015Fli\u011Fi \u2014 ",
                                        data.logo.width || 110,
                                        "px"),
                                    React.createElement("input", { type: "range", min: "40", max: "360", value: data.logo.width || 110, onChange: e => setPath(["logo", "width"], Number(e.target.value)), className: "w-full" })),
                                React.createElement("label", null,
                                    React.createElement(AdminLabel, null,
                                        "Logo Y\u00FCksekli\u011Fi \u2014 ",
                                        data.logo.height || 110,
                                        "px"),
                                    React.createElement("input", { type: "range", min: "40", max: "220", value: data.logo.height || 110, onChange: e => setPath(["logo", "height"], Number(e.target.value)), className: "w-full" }))),
                            React.createElement("div", { className: "mt-4" },
                                React.createElement(AdminLabel, null, "Logo Konumu"),
                                React.createElement("div", { className: "grid grid-cols-3 gap-2" }, [["left", "Sol"], ["center", "Orta"], ["right", "Sağ"]].map(([v, l]) => React.createElement("button", { key: v, onClick: () => setPath(["logo", "position"], v), className: "py-2 rounded-lg text-xs font-semibold", style: { background: data.logo.position === v ? theme.accent : "#F2F2F7", color: data.logo.position === v ? ink : "#1D1D1F" } }, l))))),
                        React.createElement("div", { className: "bg-neutral-900 rounded-xl p-4 mb-5" },
                            React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-3" }, "Katalog Yedekleme"),
                            React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                React.createElement("button", { type: "button", onClick: () => downloadJSON(data), className: "min-h-[44px] py-2.5 rounded-lg text-xs font-bold bg-neutral-800 flex items-center justify-center gap-2" },
                                    React.createElement(Icon, { type: "download", size: 14 }),
                                    "Yede\u011Fi \u0130ndir (JSON)"),
                                React.createElement("button", { type: "button", onClick: () => importRef?.click(), className: "min-h-[44px] py-2.5 rounded-lg text-xs font-bold bg-neutral-800 flex items-center justify-center gap-2" },
                                    React.createElement(Icon, { type: "upload", size: 14 }),
                                    "Yedekten Y\u00FCkle")),
                            React.createElement("input", { ref: setImportRef, type: "file", accept: "application/json,.json", className: "hidden", onChange: handleImport })),
                        React.createElement("div", { className: "h-px bg-neutral-800 my-5" }),
                        React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3" }, "Tema \u015Eablonlar\u0131"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-3 mb-5" }, THEMES.map(tt => { const on = theme.id === tt.id; return React.createElement("button", { key: tt.id, type: "button", onClick: () => updateData(x => { x.theme = { ...x.theme, id: tt.id, name: tt.name, ui: tt.ui, bg: tt.bg, card: tt.card, accent: tt.accent, text: tt.text }; }), "aria-pressed": on, "aria-label": "Tema şablonu: " + tt.name, className: "theme-tpl" + (on ? " is-on" : ""), "data-ui-preview": tt.ui, style: { "--pv-bg": tt.bg, "--pv-card": tt.card, "--pv-acc": tt.accent, "--pv-text": tt.text, "--pv-ink": inkOn(tt.accent) } },
                            React.createElement("span", { className: "theme-tpl-stage", "aria-hidden": "true" },
                                React.createElement("span", { className: "theme-tpl-card" },
                                    React.createElement("span", { className: "theme-tpl-img" }),
                                    React.createElement("span", { className: "theme-tpl-line" }),
                                    React.createElement("span", { className: "theme-tpl-line short" })),
                                React.createElement("span", { className: "theme-tpl-side" },
                                    React.createElement("span", { className: "theme-tpl-btn" }, "Fiyat Listesi"),
                                    React.createElement("span", { className: "theme-tpl-btn ghost" }, "Katalog"),
                                    React.createElement("span", { className: "theme-tpl-chip" }, "Kategori"))),
                            React.createElement("span", { className: "theme-tpl-meta" },
                                React.createElement("b", null, tt.name, on ? " \u2713" : ""),
                                React.createElement("small", null, tt.desc))); })),
                        React.createElement(ColorInput, { label: "Arka Plan Rengi", value: theme.bg, onChange: v => setPath(["theme", "bg"], v) }),
                        React.createElement(ColorInput, { label: "Kart Rengi", value: theme.card, onChange: v => setPath(["theme", "card"], v) }),
                        React.createElement(ColorInput, { label: "Vurgu Rengi", value: theme.accent, onChange: v => setPath(["theme", "accent"], v) }),
                        React.createElement(ColorInput, { label: "Yaz\u0131 Rengi", value: theme.text, onChange: v => setPath(["theme", "text"], v) }),
                        React.createElement(AdminLabel, null,
                            "\u00DCr\u00FCn G\u00F6rsel Y\u00FCksekli\u011Fi \u2014 ",
                            data.cardImgSize,
                            "px"),
                        React.createElement("input", { type: "range", min: "100", max: "320", value: data.cardImgSize, onChange: e => setPath(["cardImgSize"], Number(e.target.value)), className: "w-full mb-5" }),
                        !window.SH21 && React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3" }, "AI \u00C7eviri (\u0130ngilizce)"),
                        !window.SH21 && React.createElement("div", { className: "bg-neutral-900 rounded-xl p-4 mb-5" },
                            React.createElement("label", { className: "flex items-center justify-between gap-3 mb-3 cursor-pointer" },
                                React.createElement("span", null,
                                    React.createElement("span", { className: "block text-sm font-bold" }, "Claude ile AI \u00E7eviri"),
                                    React.createElement("span", { className: "block text-[11px] text-neutral-400 mt-1" }, aiCfg.provider === "claude" ? "A\u00E7\u0131k: \u00E7eviriler mobilya terimlerini bilen AI ile yap\u0131l\u0131r." : "Kapal\u0131: mobilya s\u00F6zl\u00FC\u011F\u00FC + taray\u0131c\u0131 \u00E7evirisi + \u00FCcretsiz \u00E7eviri servisi kullan\u0131l\u0131r.")),
                                React.createElement("button", { type: "button", role: "switch", "aria-checked": aiCfg.provider === "claude", "aria-label": "Claude ile AI \u00E7eviri", onClick: () => updateAiCfg({ provider: aiCfg.provider === "claude" ? "off" : "claude" }), className: "ui-switch" + (aiCfg.provider === "claude" ? " is-on" : "") },
                                    React.createElement("span", null))),
                            aiCfg.provider === "claude" && React.createElement("div", null,
                                React.createElement("label", { className: "block mb-3" },
                                    React.createElement(AdminLabel, null, "Anthropic API anahtar\u0131"),
                                    React.createElement("input", { className: "admin-input", type: "password", autoComplete: "off", spellCheck: "false", placeholder: "sk-ant-\u2026", value: aiCfg.key, onChange: e => updateAiCfg({ key: e.target.value.slice(0, 300) }) })),
                                React.createElement("label", { className: "flex items-center gap-2 mb-3 text-[12px] text-neutral-300 cursor-pointer" },
                                    React.createElement("input", { type: "checkbox", checked: !!aiCfg.remember, onChange: e => updateAiCfg({ remember: e.target.checked }) }),
                                    "Anahtarı bu cihazda hatırla (ortak bilgisayarda işaretlemeyin)"),
                                React.createElement("label", { className: "block mb-3" },
                                    React.createElement(AdminLabel, null, "Model"),
                                    React.createElement("select", { className: "admin-input", value: aiCfg.model, onChange: e => updateAiCfg({ model: e.target.value }) }, AI_MODELS.map(([id, label]) => React.createElement("option", { key: id, value: id }, label)))),
                                React.createElement("div", { className: "text-[11px] text-neutral-400 mb-3" }, "Anahtar varsay\u0131lan olarak sadece bu oturumda tutulur, taray\u0131c\u0131y\u0131 kapat\u0131nca silinir; sitede, kataloğun kayd\u0131nda ve JSON yede\u011Finde yer almaz. Ziyaret\u00E7iler AI kullanmaz; \u00E7eviri sadece siz kaydedince yap\u0131l\u0131r."),
                                React.createElement("button", { type: "button", onClick: testAiTranslation, disabled: aiCfg.key.trim().length < 20, className: "w-full py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-bold mb-2 disabled:opacity-40" }, "Ba\u011Flant\u0131y\u0131 test et"),
                                aiTest && React.createElement("div", { role: "status", className: "text-[11px] mb-2 " + (aiTest.startsWith("Hata") ? "text-red-400" : "text-neutral-300") }, aiTest)),
                            React.createElement("button", { type: "button", onClick: retranslateAll, disabled: trBusy > 0, className: "w-full py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-bold disabled:opacity-40" }, trBusy > 0 ? "\u00C7evriliyor\u2026 (" + trBusy + ")" : "T\u00FCm \u0130ngilizce metinleri yeniden \u00E7evir")),
                        window.SH21 && React.createElement(AdminLabel, null, "Hesap" + (SH21.email() ? " \u2014 " + SH21.email() : "")),
                        window.SH21 && React.createElement("div", { className: "flex gap-2 mb-5" },
                            React.createElement("button", { type: "button", onClick: () => SH21.changePassword().then(ok => ok && showToast("\u015Eifre g\u00FCncellendi.")), className: "flex-1 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-bold" }, "\u015Eifreyi De\u011Fi\u015Ftir"),
                            React.createElement("button", { type: "button", onClick: () => SH21.logout(), className: "flex-1 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-bold text-red-400" }, "\u00C7\u0131k\u0131\u015F Yap")),
                        window.SH21 && React.createElement("button", { type: "button", onClick: () => NDQR.open({ url: SH21.url(), title: (language === "EN" ? "Catalog QR code" : "Katalog QR Kodu"), file: SH21.slug }), className: "block w-full text-center py-3 mb-3 rounded-lg text-sm font-bold bg-neutral-800 border border-neutral-700" }, language === "EN" ? "Download QR code" : "QR Kodu İndir"),
                        window.SH21 && SH21.isSuper() && React.createElement("a", { href: "/821/?k=katalog", className: "block w-full text-center py-3 mb-5 rounded-lg text-sm font-bold", style: { background: theme.accent, color: ink } }, "\uD83D\uDEE0 S\u00FCper Y\u00F6netici Paneli (kataloglar ve men\u00FCler)"),
                        !window.SH21 && React.createElement(AdminLabel, null, "Y\u00F6netim PIN'ini De\u011Fi\u015Ftir"),
                        !window.SH21 && React.createElement("div", { className: "flex gap-2 mb-5" },
                            React.createElement("input", { className: "admin-input flex-1", type: "password", value: newPinInput, placeholder: "Yeni PIN (4-8 hane)", inputMode: "numeric", maxLength: "8", autoComplete: "new-password", onChange: e => setNewPinInput(e.target.value.replace(/\D/g, "")), style: { letterSpacing: ".3em" } }),
                            React.createElement("button", { type: "button", onClick: changePin, className: "px-4 rounded-lg text-sm font-bold shrink-0", style: { background: theme.accent, color: ink } }, "G\u00FCncelle")),
                        React.createElement("button", { onClick: resetDefault, className: "w-full py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-red-400" }, "Varsay\u0131lan Ayarlara D\u00F6n"),
                        React.createElement("button", { onClick: resetAllContent, className: "w-full mt-2 py-2.5 bg-red-950 border border-red-900 rounded-lg text-xs font-bold text-red-400" }, "T\u00FCm \u0130\u00E7eri\u011Fi S\u0131f\u0131rla (Bo\u015F \u015Eablon)")),
                    React.createElement("div", { className: adminSection === "fiyat" ? "" : "hidden" },
                        React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3" }, t("TR", "currency")),
                        React.createElement("div", { className: "bg-neutral-900 rounded-xl p-4 mb-5" },
                            React.createElement("label", { className: "flex items-center justify-between gap-3 mb-4 cursor-pointer" },
                                React.createElement("span", null,
                                    React.createElement("span", { className: "block text-sm font-bold" }, "Kur ile otomatik \u00E7evir"),
                                    React.createElement("span", { className: "block text-[11px] text-neutral-400 mt-1" }, curEnabled(data) ? "A\u00E7\u0131k: fiyatlar\u0131 TL girin, USD ve EUR a\u015Fa\u011F\u0131daki kurla hesaplan\u0131r." : "Kapal\u0131: her para biriminin fiyat\u0131n\u0131 \u00FCr\u00FCnlerde ayr\u0131 ayr\u0131 girin.")),
                                React.createElement("button", { type: "button", role: "switch", "aria-checked": curEnabled(data), "aria-label": "Kur ile otomatik \u00E7evir", onClick: () => setCurrencyEnabled(!curEnabled(data)), className: "ui-switch" + (curEnabled(data) ? " is-on" : "") },
                                    React.createElement("span", null))),
                            curEnabled(data) ? React.createElement("div", null,
                                React.createElement("label", { className: "block mb-3" },
                                    React.createElement(AdminLabel, null, "1 USD = Ka\u00E7 TL?"),
                                    React.createElement(NumField, { className: "admin-input", inputMode: "decimal", "aria-label": "1 USD = kaç TL", placeholder: "Kur girin (ör. 41,25)", parse: v => { const n = Number(String(v).replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) ? n : null; }, value: data.currency.usdRate, allowEmpty: true, keepDraft: true, min: 0.0001, max: 100000, onValue: n => setPath(["currency", "usdRate"], n) })),
                                React.createElement("label", { className: "block mb-2" },
                                    React.createElement(AdminLabel, null, "1 EUR = Ka\u00E7 TL?"),
                                    React.createElement(NumField, { className: "admin-input", inputMode: "decimal", "aria-label": "1 EUR = kaç TL", placeholder: "Kur girin (ör. 41,25)", parse: v => { const n = Number(String(v).replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) ? n : null; }, value: data.currency.eurRate, allowEmpty: true, keepDraft: true, min: 0.0001, max: 100000, onValue: n => setPath(["currency", "eurRate"], n) })),
                                React.createElement("div", { className: "text-[11px] text-neutral-400 mb-4" }, "Kur bo\u015F b\u0131rak\u0131l\u0131rsa o para birimi sitede g\u00F6sterilmez. Virg\u00FCl veya nokta ile yazabilirsiniz; yazd\u0131\u011F\u0131n\u0131z gibi kal\u0131r.")) : React.createElement("div", { className: "mb-4" },
                                React.createElement("div", { className: "text-[12px] text-neutral-300 leading-relaxed" }, "Kur kapal\u0131: \u00FCr\u00FCnlerde her fiyat kalemi i\u00E7in \u20BA TL, $ USD ve \u20AC EUR kutular\u0131 yan yana \u00E7\u0131kar. Bo\u015F b\u0131rak\u0131lan para biriminde sitede \u201CFiyat i\u00E7in ileti\u015Fime ge\u00E7in\u201D yazar. Fiyat\u0131 olmayan kalem i\u00E7in \u201CFiyat sorunuz\u201D i\u015Faretlenebilir.")),
                            React.createElement(AdminLabel, null, "Sitede ve PDF'te varsay\u0131lan para birimi"),
                            React.createElement("div", { className: "grid grid-cols-3 gap-2" }, CURRENCIES.map(c => { const ok = availableCurrencies(data).includes(c.id); const on = (data.currency?.selected || "TRY") === c.id; return React.createElement("button", { key: c.id, type: "button", disabled: !ok, title: ok ? "" : (curEnabled(data) ? "\u00D6nce kur girin" : "Bu para biriminde fiyat yok"), onClick: () => setPath(["currency", "selected"], c.id), className: "py-2.5 rounded-lg text-xs font-bold disabled:opacity-40", style: { background: on ? theme.accent : "#FFFFFF", color: on ? ink : "#424245", border: "1px solid " + (on ? theme.accent : "#D2D2D7") } }, c.symbol + " " + c.name); }))),
                        React.createElement("div", { className: "bg-neutral-900 rounded-xl p-4 mt-5" },
                            React.createElement("label", { className: "flex items-center justify-between gap-3 cursor-pointer" },
                                React.createElement("span", null,
                                    React.createElement("span", { className: "block text-sm font-bold" }, "Ana sayfada iskonto kutusu"),
                                    React.createElement("span", { className: "block text-[11px] text-neutral-400 mt-1" }, data.discount?.enabled ? "Açık: ana sayfada iskonto oranı kutusu görünür; oranı orada siz girersiniz." : "Kapalı: iskonto kutusu gizli, fiyatlar normal gösterilir.")),
                                React.createElement("button", { type: "button", role: "switch", "aria-checked": !!data.discount?.enabled, "aria-label": "İskonto kutusu", onClick: () => setPath(["discount", "enabled"], !data.discount?.enabled), className: "ui-switch" + (data.discount?.enabled ? " is-on" : "") },
                                    React.createElement("span", null))),
                            data.discount?.enabled && React.createElement("div", { className: "mt-4" },
                                React.createElement(AdminLabel, null, "Hangi para birimlerinde iskonto girilebilsin?"),
                                React.createElement("div", { className: "grid grid-cols-3 gap-2" }, CURRENCIES.map(c => { const on = data.discount?.currencies?.[c.id] !== false; return React.createElement("button", { key: c.id, type: "button", "aria-pressed": on, onClick: () => setPath(["discount", "currencies", c.id], !on), className: "py-2 rounded-lg text-sm font-bold", style: { background: on ? theme.accent : "#FFFFFF", color: on ? ink : "#424245", border: "1px solid " + (on ? theme.accent : "#D2D2D7") } }, c.symbol + " " + c.name); })),
                                React.createElement("div", { className: "text-[11px] text-neutral-400 mt-3 leading-relaxed" }, "Oranı ana sayfada siz girersiniz (ör. %10, %50) ve bütün fiyatlara anında uygulanır. İskonto o cihaza özeldir: kimse başkasının oranını görmez ve sekme kapanınca sıfırlanır. PDF fiyat listesi de ekranda girili oranla indirimli iner.")),
                        ),
                        React.createElement("div", { className: "bg-neutral-900 rounded-xl p-4 mt-5" },
                            React.createElement("label", { className: "flex items-center justify-between gap-3 cursor-pointer" },
                                React.createElement("span", null,
                                    React.createElement("span", { className: "block text-sm font-bold" }, "TL vadeli fiyat"),
                                    React.createElement("span", { className: "block text-[11px] text-neutral-400 mt-1" }, data.vade?.enabled ? "Açık: TL fiyatların yanında vadeli fiyat da gösterilir." : "Kapalı: yalnızca peşin fiyat gösterilir.")),
                                React.createElement("button", { type: "button", role: "switch", "aria-checked": !!data.vade?.enabled, "aria-label": "TL vadeli fiyat", onClick: () => setPath(["vade", "enabled"], !data.vade?.enabled), className: "ui-switch" + (data.vade?.enabled ? " is-on" : "") },
                                    React.createElement("span", null))),
                            data.vade?.enabled && React.createElement("div", { className: "mt-4" },
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                                    React.createElement("div", null,
                                        React.createElement(AdminLabel, null, "Vade farkı (%)"),
                                        React.createElement("div", { className: "flex items-center h-11 rounded-lg px-3", style: { background: "#FFFFFF", border: "1px solid " + (vadeRateValue(vadeRateText) ? "#D2D2D7" : "#FF3B30") } },
                                            React.createElement("input", { id: "vade-rate", type: "text", inputMode: "decimal", autoComplete: "off", "aria-label": "Vade farkı yüzdesi", value: vadeRateText, placeholder: "Örn. 10", onChange: e => changeVadeRate(e.target.value), className: "flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-base font-bold tabular-nums", style: { color: "#1D1D1F" } }),
                                            React.createElement("span", { className: "text-sm font-bold", style: { color: "#86868B" } }, "%"))),
                                    React.createElement("div", null,
                                        React.createElement(AdminLabel, null, "Etiket (isteğe bağlı)"),
                                        React.createElement("input", { id: "vade-label", type: "text", maxLength: 40, autoComplete: "off", "aria-label": "Vade etiketi", value: data.vade?.label || "", placeholder: "Vadeli", onChange: e => setPath(["vade", "label"], safeText(e.target.value, 40)), className: "w-full h-11 rounded-lg px-3 text-sm font-semibold outline-none", style: { background: "#FFFFFF", color: "#1D1D1F", border: "1px solid #D2D2D7" } }))),
                                vadeRateValue(vadeRateText)
                                    ? React.createElement("div", { className: "mt-3 rounded-lg px-3 py-2.5 text-[12px] flex flex-wrap items-center justify-between gap-x-4 gap-y-1", style: { background: "#FFFFFF14" } },
                                        React.createElement("span", null, "Örnek: Peşin ", React.createElement("b", { className: "tabular-nums" }, "10.000 ₺")),
                                        React.createElement("span", null, (String(data.vade?.label || "").trim() || "Vadeli") + " ", React.createElement("b", { className: "tabular-nums" }, Math.floor(10000 * (1 + vadeRateValue(vadeRateText) / 100) + 1e-9).toLocaleString("tr-TR") + " ₺")))
                                    : React.createElement("div", { className: "mt-3 text-[12px]", style: { color: "#FF6961" } }, "Geçerli bir oran girin (0'dan büyük, en fazla 100). Oran girilmezse vadeli fiyat gösterilmez."),
                                React.createElement("div", { className: "text-[11px] text-neutral-400 mt-3 leading-relaxed" }, "Yalnızca TL fiyatlarında, ana sitede ve fiyat listesi PDF'inde görünür. USD/EUR fiyatları ve fiyatsız katalog değişmez. İskonto girildiyse vade farkı iskontolu fiyatın üzerine eklenir.")),
                        ),
                    ),
                    React.createElement("div", { className: adminSection === "katalog" ? "" : "hidden" },
                        React.createElement("div", { id: "catalog-tab" },
                            React.createElement("div", { className: "mb-4 rounded-xl p-3", style: { background: theme.accent + "12", border: "1px solid " + theme.accent + "25" } },
                                React.createElement("div", { className: "text-[10px] uppercase tracking-widest opacity-50 mb-2" }, "\u00DCr\u00FCn Ara ve D\u00FCzenle"),
                                React.createElement("div", { className: "relative" },
                                    React.createElement("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex" },
                                        React.createElement(Icon, { type: "search", size: 15 })),
                                    React.createElement("input", { type: "search", "aria-label": "\u00DCr\u00FCn ara", value: adminSearch, onChange: e => { const v = safeText(e.target.value, SECURITY_LIMITS.search); setAdminSearch(v); if (v.trim()) {
                                            const next = { ...openCategories };
                                            categories.forEach(c => { if (c.items.some(i => (i.name || "").toLocaleLowerCase("tr-TR").includes(v.trim().toLocaleLowerCase("tr-TR"))))
                                                next[c.id] = true; });
                                            setOpenCategories(next);
                                        } }, placeholder: "\u00DCr\u00FCn ad\u0131n\u0131 yaz\u0131n...", className: "admin-input", style: { padding: "10px 10px 10px 34px", fontSize: "12px" } })),
                                adminSearch.trim() && React.createElement("div", { className: "text-[10px] opacity-50 mt-2" },
                                    categories.reduce((n, c) => n + c.items.filter(i => (i.name || "").toLocaleLowerCase("tr-TR").includes(adminSearch.trim().toLocaleLowerCase("tr-TR"))).length, 0),
                                    " \u00FCr\u00FCn bulundu")),
                            React.createElement("div", { className: "text-[11px] text-neutral-400 mb-3" }, "Kategorileri buradan ekleyin, yeniden adland\u0131r\u0131n, s\u0131ralay\u0131n veya silin. S\u0131ra ve adlar sitede, fiyat listesinde ve katalogda ayn\u0131 g\u00F6r\u00FCn\u00FCr. \u00DCr\u00FCn eklemek i\u00E7in kategorinin \"\u00DCr\u00FCnler\" d\u00FC\u011Fmesine dokunun."),
                            React.createElement("button", { type: "button", onClick: async () => { const id = await promptAddCategory(); if (id) openCategory(id); }, className: "w-full mb-3 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5", style: { background: theme.accent, color: ink } },
                                React.createElement(Icon, { type: "plus", size: 14 }),
                                "Kategori Ekle"),
                            categories.length === 0 && React.createElement("div", { className: "bg-neutral-900 border border-dashed border-neutral-700 rounded-xl p-6 mb-3 text-center text-xs text-neutral-400" }, "Hen\u00FCz kategori yok. \u00DCr\u00FCn eklemeden \u00F6nce \"Kategori Ekle\" ile ilk kategorinizi olu\u015Fturun."),
                            categories.map((category, categoryIndex) => React.createElement("div", { key: category.id, className: "bg-neutral-900 border border-neutral-800 rounded-xl mb-3 overflow-hidden" },
                                React.createElement("div", { className: "p-2 flex items-center gap-1.5" },
                                    React.createElement("div", { className: "flex-1 min-w-0 px-1 flex flex-col gap-1" },
                                        React.createElement("input", { className: "admin-input", "aria-label": "Kategori ad\u0131", placeholder: "Kategori ad\u0131", value: category.name || "", maxLength: 120, onChange: e => renameCategory(category.id, safeText(e.target.value, 120)), style: { padding: "7px 9px", fontSize: 13, fontWeight: 700 } }),
                                        React.createElement("div", { className: "flex items-center gap-1.5" },
                                            React.createElement("input", { className: "admin-input", "aria-label": "Kategori ad\u0131 (\u0130ngilizce)", placeholder: "EN (otomatik)", value: category.name_en || "", maxLength: 120, onChange: e => renameCategoryEn(category.id, safeText(e.target.value, 120)), style: { padding: "5px 9px", fontSize: 11 } }),
                                            React.createElement("span", { className: "text-[11px] text-neutral-500 whitespace-nowrap" },
                                                category.items.length,
                                                " \u00FCr\u00FCn"))),
                                    React.createElement("div", { className: "flex flex-col gap-1 shrink-0" },
                                        React.createElement("button", { type: "button", "aria-label": "Yukar\u0131 ta\u015F\u0131", title: "Yukar\u0131", disabled: categoryIndex === 0, onClick: () => moveCategory(category.id, -1), className: "w-8 h-[19px] rounded bg-neutral-800 flex items-center justify-center disabled:opacity-25" }, React.createElement(Icon, { type: "up", size: 12 })),
                                        React.createElement("button", { type: "button", "aria-label": "A\u015Fa\u011F\u0131 ta\u015F\u0131", title: "A\u015Fa\u011F\u0131", disabled: categoryIndex === categories.length - 1, onClick: () => moveCategory(category.id, 1), className: "w-8 h-[19px] rounded bg-neutral-800 flex items-center justify-center disabled:opacity-25" }, React.createElement(Icon, { type: "down", size: 12 }))),
                                    React.createElement("button", { type: "button", "aria-label": "Kategoriyi sil", title: "Kategoriyi sil", onClick: () => deleteCategory(category.id), className: "h-10 w-10 shrink-0 rounded-lg bg-red-950 text-red-400 flex items-center justify-center" }, React.createElement(Icon, { type: "trash", size: 15 })),
                                    React.createElement("button", { type: "button", "aria-expanded": !!openCategories[category.id], onClick: () => toggleCategory(category.id), className: "h-10 shrink-0 px-3 rounded-lg text-[11px] whitespace-nowrap flex items-center gap-1.5 font-semibold", style: { background: openCategories[category.id] ? theme.accent : "#F2F2F7", color: openCategories[category.id] ? ink : "#424245" } },
                                        t("TR", "productsBtn"),
                                        React.createElement(Icon, { type: openCategories[category.id] ? "up" : "down", size: 13 }))),
                                openCategories[category.id] && React.createElement("div", { className: "p-2 pt-0" },
                                    category.items.length > 3 && React.createElement("button", { type: "button", onClick: () => addItem(category.id), className: "w-full mb-2 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5", style: { background: theme.accent, color: ink } },
                                        React.createElement(Icon, { type: "plus", size: 14 }),
                                        "Ürün Ekle (listenin sonuna)"),
                                    category.items.length === 0 && React.createElement("div", { className: "bg-neutral-800 rounded-xl p-4 mb-2 text-center text-xs text-neutral-500" }, "Bu kategoride hen\u00FCz \u00FCr\u00FCn yok."),
                                    category.items.filter(item => !adminSearch.trim() || (item.name || "").toLocaleLowerCase("tr-TR").includes(adminSearch.trim().toLocaleLowerCase("tr-TR"))).map((item, itemIndex) => React.createElement("div", { key: item.id, className: "bg-neutral-800 rounded-xl p-3 mb-2" },
                                        React.createElement("div", { className: "flex flex-wrap sm:flex-nowrap gap-2 mb-2" },
                                            React.createElement("div", { className: "w-16 h-16 rounded-lg bg-neutral-700 flex-shrink-0 overflow-hidden flex items-center justify-center", style: { backgroundImage: cssUrl(item.image) || undefined, backgroundSize: "cover", backgroundPosition: "center" } }, !item.image && React.createElement(Icon, { type: "image", size: 18 })),
                                            React.createElement("div", { className: "flex flex-col gap-1 flex-shrink-0" },
                                                React.createElement("button", { type: "button", onClick: () => document.getElementById("product-image-" + category.id + "-" + item.id)?.click(), className: "min-h-[36px] px-2.5 py-1.5 rounded-lg bg-neutral-700 border border-neutral-600 text-[11px] font-bold flex items-center gap-1" },
                                                    React.createElement(Icon, { type: "upload", size: 12 }),
                                                    "Foto\u011Fraf"),
                                                React.createElement("input", { id: "product-image-" + category.id + "-" + item.id, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: e => uploadProductImage(category.id, item.id, e) })),
                                            React.createElement("div", { className: "flex-1 min-w-0 basis-full sm:basis-auto grid gap-2" },
                                                React.createElement("div", null,
                                                    React.createElement("input", { "aria-label": "\u00DCr\u00FCn ad\u0131", value: item.name, onChange: e => editTurkishField(category.id, item, "name", e.target.value), placeholder: "\u00DCr\u00FCn ad\u0131", className: "admin-input", style: { padding: "8px 9px", fontSize: "12px" } })),
                                                React.createElement("div", null,
                                                    React.createElement("input", { "aria-label": "\u00DCr\u00FCn \u00F6l\u00E7\u00FCleri", value: item.dims, onChange: e => { const v = e.target.value; updateItem(category.id, item.id, "dims", v); updateItem(category.id, item.id, "dims_en", v); }, placeholder: t("TR", "dimsPlaceholder"), className: "admin-input", style: { padding: "8px 9px", fontSize: "12px" } })))),
                                        (() => {
                                            const imgs = Array.isArray(item.images) && item.images.length ? item.images.filter(Boolean) : (item.image ? [item.image] : []);
                                            return imgs.length > 0 && React.createElement("div", { className: "mb-2" },
                                                React.createElement("div", { className: "text-[10px] text-neutral-400 mb-1.5" },
                                                    "Foto\u011Fraflar (",
                                                    imgs.length,
                                                    ") \u00B7 ilk foto\u011Fraf kapak olarak kullan\u0131l\u0131r"),
                                                React.createElement("div", { className: "flex flex-wrap gap-1.5" }, imgs.map((src, i) => React.createElement("div", { key: i + "-" + String(src).length, className: "relative w-16 h-16 rounded-md overflow-hidden border-2", style: { borderColor: i === 0 ? theme.accent : "#D2D2D7", backgroundImage: cssUrl(src) || undefined, backgroundSize: "cover", backgroundPosition: "center" } },
                                                    React.createElement("button", { type: "button", "aria-label": `${i + 1}. fotoğrafı sil`, onClick: () => removeProductImage(category.id, item.id, i), className: "thumb-btn absolute top-0 right-0 w-7 h-7 bg-black/75 text-white flex items-center justify-center rounded-bl-md" },
                                                        React.createElement(Icon, { type: "x", size: 13 })),
                                                    i === 0 ? React.createElement("span", { className: "absolute bottom-0 inset-x-0 text-[9px] font-bold text-center", style: { background: theme.accent, color: ink } }, "KAPAK") : React.createElement("button", { type: "button", "aria-label": `${i + 1}. fotoğrafı kapak yap`, onClick: () => makeCoverImage(category.id, item.id, i), className: "thumb-btn absolute bottom-0 inset-x-0 h-5 text-[9px] font-bold bg-black/70 text-white" }, "Kapak yap")))));
                                        })(),
                                        React.createElement("div", { className: "mb-2" },
                                            React.createElement("textarea", { "aria-label": "\u00DCr\u00FCn a\u00E7\u0131klamas\u0131", value: item.desc, onChange: e => editTurkishField(category.id, item, "desc", e.target.value), placeholder: t("TR", "description"), className: "admin-input" })),
                                        React.createElement("div", { className: "rounded-xl border border-neutral-700 bg-neutral-900 p-3 mb-2" },
                                            React.createElement("div", { className: "flex items-center justify-between mb-3" },
                                                React.createElement("div", null,
                                                    React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold", style: { color: theme.accent } }, t("TR", "parts")),
                                                    React.createElement("div", { className: "text-[10px] text-neutral-400 mt-1" }, ({ sizes: "Ölçü Kartları düzeni: her satır bir ölçü (ad: 6 kişilik · ölçü: 240x120 · fiyat). Fiyatlar toplanmaz.", models: "Model Sırası düzeni: her satır bir model (Müdür, Şef, Personel, Misafir…) ve kendi fotoğrafı. Fiyatlar toplanmaz." })[categoryLayoutOf(data, category.id)] || t("TR", "partHint"))),
                                                React.createElement("button", { onClick: () => addPricePart(category.id, item.id), className: "px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1", style: { background: theme.accent, color: ink } },
                                                    React.createElement(Icon, { type: "plus", size: 12 }),
                                                    t("TR", "addPrice"))),
                                            !isVariantLayout(categoryLayoutOf(data, category.id)) && React.createElement("div", { className: "rounded-lg bg-neutral-800 p-2.5 mb-3" },
                                                React.createElement("label", { className: "flex items-center justify-between gap-3 text-[11px] font-semibold text-neutral-200" },
                                                    React.createElement("span", null, "Otomatik Topla"),
                                                    React.createElement("input", { type: "checkbox", checked: normalizePrice(item.price).autoCollect !== false, onChange: e => setPriceAutoCollect(category.id, item.id, e.target.checked) })),
                                                normalizePrice(item.price).autoCollect === false ? React.createElement("label", { className: "block mt-2" },
                                                    React.createElement(AdminLabel, null, "Manuel Toplam Fiyat"),
                                                    React.createElement(NumField, { inputMode: "decimal", min: 0, value: normalizePrice(item.price).manualTotal ?? "", onValue: v => updateItem(category.id, item.id, "price", { ...normalizePrice(item.price), manualTotal: v }), placeholder: "\u00D6rn. 18.500", className: "admin-input", style: { padding: "8px", fontSize: "11px" } })) : React.createElement("div", { className: "mt-2 text-[10px] text-neutral-400" },
                                                    "G\u00FCncel toplam: ",
                                                    React.createElement("strong", { style: { color: theme.accent } }, priceTotal(item.price) !== null ? formatAmount(priceTotal(item.price)) : "—"))),
                                            normalizePrice(item.price).parts.length === 0 && React.createElement("div", { className: "text-[10px] text-neutral-500 py-2 text-center" }, "Hen\u00FCz fiyat kalemi eklenmedi."),
                                            normalizePrice(item.price).parts.map(part => React.createElement("div", { key: part.id, className: "bg-neutral-800 rounded-lg p-2 mb-2" },
                                                React.createElement("div", { className: "mb-2" },
                                                    React.createElement("input", { "aria-label": "Par\u00E7a ad\u0131", value: part.name, onChange: e => updatePricePart(category.id, item.id, part.id, "name", e.target.value), placeholder: "Par\u00E7a ad\u0131", className: "admin-input", style: { padding: "8px", fontSize: "11px" } })),
                                                React.createElement("div", { className: "grid grid-cols-[1fr_105px_auto] gap-2 items-center" },
                                                    React.createElement("input", { "aria-label": "Par\u00E7a \u00F6l\u00E7\u00FCs\u00FC", value: part.dims || "", onChange: e => { const v = e.target.value; updatePricePart(category.id, item.id, part.id, "dims", v); updatePricePart(category.id, item.id, part.id, "dims_en", v); }, placeholder: "\u00D6l\u00E7\u00FC", className: "admin-input", style: { padding: "8px", fontSize: "11px" } }),
                                                    React.createElement(NumField, { min: 0, inputMode: "decimal", "aria-label": "Par\u00E7a fiyat\u0131 (TL)", value: part.amount ?? "", disabled: part.contactOnly, onValue: v => updatePricePart(category.id, item.id, part.id, "amount", v), placeholder: "\u20BA", className: "admin-input", style: { padding: "8px", fontSize: "11px", opacity: part.contactOnly ? .4 : 1 } }),
                                                    React.createElement("button", { type: "button", "aria-label": "Fiyat kalemini sil", onClick: () => deletePricePart(category.id, item.id, part.id), className: "w-9 h-9 flex items-center justify-center bg-red-950 text-red-400 rounded-lg" },
                                                        React.createElement(Icon, { type: "trash", size: 13 }))),
                                                React.createElement("label", { className: "flex items-center gap-2 mt-2 text-[10px] text-neutral-400" },
                                                    React.createElement("input", { type: "checkbox", checked: !!part.contactOnly, onChange: e => updatePricePart(category.id, item.id, part.id, "contactOnly", e.target.checked) }),
                                                    t("TR", "contactOnly")),
                                                categoryLayoutOf(data, category.id) === "models" && React.createElement("div", { className: "flex items-center gap-2 mt-2" },
                                                    React.createElement("div", { className: "w-12 h-12 rounded-md shrink-0 border border-neutral-700", style: { backgroundColor: "#F2F2F7", backgroundImage: cssUrl(part.image) || undefined, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" } }),
                                                    React.createElement("button", { type: "button", onClick: () => document.getElementById("part-image-" + part.id)?.click(), className: "h-9 px-3 rounded-lg bg-neutral-700 border border-neutral-600 text-[11px] font-bold flex items-center gap-1.5" },
                                                        React.createElement(Icon, { type: "upload", size: 12 }),
                                                        part.image ? "Fotoğrafı Değiştir" : "Fotoğraf Ekle"),
                                                    part.image && React.createElement("button", { type: "button", "aria-label": "Model foto\u011Fraf\u0131n\u0131 kald\u0131r", onClick: () => updatePricePart(category.id, item.id, part.id, "image", null), className: "w-9 h-9 flex items-center justify-center bg-red-950 text-red-400 rounded-lg" },
                                                        React.createElement(Icon, { type: "x", size: 13 })),
                                                    React.createElement("input", { id: "part-image-" + part.id, type: "file", accept: "image/jpeg,image/png,image/webp", className: "hidden", onChange: e => uploadPartImage(category.id, item.id, part.id, e) }))))),
                                        React.createElement("div", { className: "flex justify-end gap-1" }, (() => {
                                            const fullIndex = category.items.findIndex(x => x.id === item.id);
                                            return React.createElement(React.Fragment, null,
                                                React.createElement("button", { type: "button", "aria-label": "\u00DCr\u00FCn\u00FC yukar\u0131 ta\u015F\u0131", onClick: () => moveItem(category.id, item.id, -1), disabled: fullIndex === 0, className: "w-9 h-9 flex items-center justify-center bg-neutral-700 rounded-lg disabled:opacity-20" },
                                                    React.createElement(Icon, { type: "up", size: 14 })),
                                                React.createElement("button", { type: "button", "aria-label": "\u00DCr\u00FCn\u00FC a\u015Fa\u011F\u0131 ta\u015F\u0131", onClick: () => moveItem(category.id, item.id, 1), disabled: fullIndex === category.items.length - 1, className: "w-9 h-9 flex items-center justify-center bg-neutral-700 rounded-lg disabled:opacity-20" },
                                                    React.createElement(Icon, { type: "down", size: 14 })),
                                                React.createElement("button", { type: "button", "aria-label": "\u00DCr\u00FCn\u00FC sil", onClick: () => deleteItem(category.id, item.id), className: "ml-3 h-9 px-3 flex items-center gap-1.5 bg-red-950 text-red-400 rounded-lg text-[11px] font-bold" },
                                                    React.createElement(Icon, { type: "trash", size: 14 }),
                                                    "\u00DCr\u00FCn\u00FC Sil"));
                                        })()))),
                                    React.createElement("button", { onClick: () => addItem(category.id), className: "w-full py-2.5 bg-neutral-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5" },
                                        React.createElement(Icon, { type: "plus", size: 14 }),
                                        t("TR", "addProduct"))))))),
                    React.createElement("div", { className: adminSection === "pdf" ? "" : "hidden" },
                        React.createElement("div", { className: "mt-2 mb-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4" },
                            React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-2" }, "Katalog (Fiyats\u0131z)"),
                            React.createElement("div", { className: "text-xs text-neutral-400 mb-3" }, "Fiyat i\u00E7ermez. \u00DCr\u00FCn g\u00F6rselleri, a\u00E7\u0131klamalar ve \u00F6l\u00E7\u00FCler kullan\u0131l\u0131r. Sitedeki \"Katalog\" d\u00FC\u011Fmesi bu \u015Fablonu kullan\u0131r."),
                            React.createElement("div", { role: "radiogroup", "aria-label": "Katalog \u015Fablonu", className: "grid grid-cols-2 gap-2 mb-4" }, PDF_CATALOG_TEMPLATES.map(tp => {
                                const active = (data.pdf?.catalogTemplate || "vitrin") === tp.id;
                                return React.createElement("button", { key: tp.id, type: "button", role: "radio", "aria-checked": active, onClick: () => setPath(["pdf", "catalogTemplate"], tp.id), className: "text-left rounded-xl p-2.5 border transition-colors", style: { borderColor: active ? theme.accent : "#D2D2D7", background: active ? theme.accent + "18" : "#FFFFFF" } },
                                    React.createElement(CatalogTemplateThumb, { id: tp.id, accent: theme.accent }),
                                    React.createElement("div", { className: "mt-2 text-xs font-bold flex items-center gap-1.5" },
                                        active && React.createElement(Icon, { type: "check", size: 13 }),
                                        tp.name),
                                    React.createElement("div", { className: "text-[11px] text-neutral-400 leading-snug mt-0.5" }, tp.desc));
                            })),
                            React.createElement("label", { className: "block mb-4" },
                                React.createElement(AdminLabel, null, "Katalog Kapak Ba\u015Fl\u0131\u011F\u0131"),
                                React.createElement("input", { className: "admin-input", value: data.pdf?.catalogTitle ?? "", onChange: e => setPath(["pdf", "catalogTitle"], e.target.value), placeholder: "\u00DCR\u00DCN KATALO\u011EU" })),
                            React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                React.createElement("button", { type: "button", onClick: () => createPDF(false, "catalog"), disabled: !!pdfBusy, className: "min-h-[44px] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50", style: { background: theme.accent, color: ink } },
                                    React.createElement(Icon, { type: "download", size: 14 }),
                                    pdfBusy === "catalog" ? "Oluşturuluyor…" : "Katalog Önizle ve İndir"),
                                React.createElement("button", { type: "button", onClick: () => createPDF(true, "catalog"), disabled: !!pdfBusy, className: "min-h-[44px] py-3 rounded-xl text-xs font-bold bg-neutral-800 border border-neutral-700 flex items-center justify-center gap-2 disabled:opacity-50" },
                                    React.createElement(Icon, { type: "image", size: 14 }),
                                    "Yeni sekmede a\u00E7"))),
                        React.createElement("div", { className: "rounded-2xl border border-neutral-800 bg-neutral-900 p-4" },
                            React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-2" }, "PDF Fiyat Listesi"),
                            React.createElement("div", { className: "rounded-xl bg-neutral-950 border border-neutral-800 p-3 mb-4" },
                                React.createElement("div", { className: "text-xs font-bold mb-1" }, "Kategori D\u00FCzenleri"),
                                React.createElement("div", { className: "text-[11px] text-neutral-400 mb-3" },
                                    "Her kategori fiyat listesinde se\u00E7ti\u011Finiz d\u00FCzende bas\u0131l\u0131r. ",
                                    React.createElement("b", null, "Tak\u0131m Tablosu"),
                                    ": mod\u00FCller toplan\u0131r. ",
                                    React.createElement("b", null, "\u00D6l\u00E7\u00FC Kartlar\u0131"),
                                    ": her \u00F6l\u00E7\u00FCn\u00FCn ayr\u0131 fiyat\u0131. ",
                                    React.createElement("b", null, "Model S\u0131ras\u0131"),
                                    ": M\u00FCd\u00FCr, \u015Eef, Misafir\u2026 her modelin kendi foto\u011Fraf\u0131 ve fiyat\u0131."),
                                categories.map(category => React.createElement("label", { key: category.id, className: "flex items-center justify-between gap-2 py-1.5 border-t border-neutral-800 first:border-t-0" },
                                    React.createElement("span", { className: "text-[12px] font-semibold truncate" },
                                        category.name,
                                        React.createElement("span", { className: "ml-1.5 text-[10px] font-normal text-neutral-500" },
                                            category.items.length,
                                            " \u00FCr\u00FCn")),
                                    React.createElement("span", { className: "flex gap-1.5 shrink-0" },
                                        React.createElement("select", { "aria-label": category.name + " fiyat listesi düzeni", value: data.pdf?.categoryLayouts?.[category.id] || "auto", onChange: e => setPath(["pdf", "categoryLayouts", category.id], e.target.value), className: "admin-input shrink-0", style: { width: 170, padding: "7px 8px", fontSize: 12 } }, PDF_CATEGORY_LAYOUTS.map(l => React.createElement("option", { key: l.id, value: l.id }, l.id === "auto" ? "Akıllı → " + (PDF_CATEGORY_LAYOUTS.find(x => x.id === autoLayoutFor(category)) || {}).name : l.name))),
                                        React.createElement("select", { "aria-label": category.name + " vitrin katalog düzeni", title: "Vitrin katalog şablonunda sayfa düzeni", value: data.pdf?.vitrinModes?.[category.id] || "auto", onChange: e => setPath(["pdf", "vitrinModes", category.id], e.target.value), className: "admin-input shrink-0", style: { width: 110, padding: "7px 8px", fontSize: 12 } }, PDF_VITRIN_MODES.map(m => React.createElement("option", { key: m.id, value: m.id }, "Vitrin: " + m.name))))))),
                            React.createElement("div", { className: "text-xs text-neutral-400 mb-4" }, "Web sitesindeki kategori, \u00FCr\u00FCn, g\u00F6rsel, \u00F6l\u00E7\u00FC, fiyat, dil ve para birimi s\u0131ras\u0131 aynen PDF'ye aktar\u0131l\u0131r. KG ve M\u00B3 kullan\u0131lmaz."),
                            React.createElement("div", { className: "grid grid-cols-2 gap-2 mb-4" },
                                React.createElement("button", { type: "button", onClick: () => createPDF(false, "price"), disabled: !!pdfBusy, className: "min-h-[44px] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50", style: { background: theme.accent, color: ink } },
                                    React.createElement(Icon, { type: "download", size: 14 }),
                                    pdfBusy === "price" ? "Oluşturuluyor…" : "Fiyat Listesi Önizle ve İndir"),
                                React.createElement("button", { type: "button", onClick: () => createPDF(true, "price"), disabled: !!pdfBusy, className: "min-h-[44px] py-3 rounded-xl text-xs font-bold bg-neutral-800 border border-neutral-700 flex items-center justify-center gap-2 disabled:opacity-50" },
                                    React.createElement(Icon, { type: "image", size: 14 }),
                                    "Yeni sekmede a\u00E7")),
                            React.createElement("div", { className: "grid grid-cols-2 gap-3 mb-4" },
                                React.createElement("label", null,
                                    React.createElement(AdminLabel, null, "PDF Ba\u015Fl\u0131\u011F\u0131"),
                                    React.createElement("input", { className: "admin-input", value: data.pdf?.title || "", onChange: e => setPath(["pdf", "title"], e.target.value) })),
                                React.createElement("label", null,
                                    React.createElement(AdminLabel, null, "Web Sitesi"),
                                    React.createElement("input", { className: "admin-input", value: data.pdf?.website || "", onChange: e => setPath(["pdf", "website"], e.target.value) }))),
                            React.createElement("label", { className: "block mb-4" },
                                React.createElement(AdminLabel, null, "PDF Alt Bilgisi"),
                                React.createElement("input", { className: "admin-input", value: data.pdf?.footer || "", onChange: e => setPath(["pdf", "footer"], e.target.value) })),
                            React.createElement("label", { className: "flex items-center gap-2 text-xs text-neutral-300 mb-5" },
                                React.createElement("input", { type: "checkbox", checked: data.pdf?.showPageNumbers !== false, onChange: e => setPath(["pdf", "showPageNumbers"], e.target.checked) }),
                                " Sayfa numaras\u0131 g\u00F6ster"),
                            React.createElement("label", { className: "flex items-center gap-2 text-xs text-neutral-300 mb-5" },
                                React.createElement("input", { type: "checkbox", checked: !!data.pdf?.useCategoryCovers, onChange: e => setPath(["pdf", "useCategoryCovers"], e.target.checked) }),
                                " Her kategorinin ba\u015F\u0131na kapak sayfas\u0131 ekle"),
                            React.createElement("div", { className: "border-t border-neutral-800 pt-4 mb-5" },
                                React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-2" }, "PDF Kapak Logosu"),
                                React.createElement("div", { className: "text-[10px] text-neutral-500 mb-3" }, "Bu logo PDF kapa\u011F\u0131nda ve t\u00FCm kategori kapaklar\u0131nda kullan\u0131l\u0131r. Web sitesindeki logo ve \u00FCr\u00FCn g\u00F6rsellerinden ba\u011F\u0131ms\u0131zd\u0131r."),
                                React.createElement("div", { className: "h-32 rounded-lg bg-black border border-neutral-800 overflow-hidden flex items-center justify-center mb-3" }, data.pdf?.coverLogo?.src ? React.createElement(CachedImage, { loading: "lazy", decoding: "async", src: data.pdf.coverLogo.src, alt: "PDF Kapak Logosu", className: "max-w-[90%] max-h-[90%] object-contain" }) : React.createElement("span", { className: "text-[10px] text-neutral-600" }, "PDF KAPAK LOGOSU EKLENMED\u0130")),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                    React.createElement("button", { onClick: () => document.getElementById("pdf-cover-logo-input")?.click(), className: "py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[10px] font-bold" }, data.pdf?.coverLogo?.src ? "Logoyu Değiştir" : "Logo Ekle"),
                                    React.createElement("button", { disabled: !data.pdf?.coverLogo?.src, onClick: removePdfCoverLogo, className: "py-2.5 rounded-lg bg-red-950 text-red-400 text-[10px] font-bold disabled:opacity-30" }, "Logoyu Sil")),
                                React.createElement("input", { id: "pdf-cover-logo-input", type: "file", accept: "image/png,image/jpeg,image/webp,image/svg+xml", className: "hidden", onChange: uploadPdfCoverLogo })),
                            [["coverImage", "Giriş Kapağı (tam sayfa görsel)", "Doluysa PDF'in ilk sayfası yalnızca bu görselden oluşur; logo ve başlık eklenmez. Boşsa varsayılan siyah logolu kapak kullanılır."], ["closingImage", "Kapanış Kapağı (tam sayfa görsel)", "Doluysa PDF'in son sayfası yalnızca bu görselden oluşur; logo ve iletişim bilgisi eklenmez. Boşsa varsayılan ikonlu kapanış sayfası kullanılır."]].map(([field, label, help]) => {
                                const src = safePdfPageImageSource(data.pdf?.[field]), inputId = "pdf-page-image-" + field;
                                return React.createElement("div", { key: field, className: "border-t border-neutral-800 pt-4 mb-5" },
                                    React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-2" }, label),
                                    React.createElement("div", { className: "text-[10px] text-neutral-500 mb-3" }, help, " Katalog ve fiyat listesi aynı görseli kullanır. Önerilen ölçü: 2480×3508 px (A4 dikey). JPG, PNG veya WEBP."),
                                    React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "stretch" } },
                                        React.createElement("div", { style: { width: 96, flexShrink: 0, aspectRatio: "210 / 297", borderRadius: 8, background: "#050505", border: "1px solid #262626", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" } }, src
                                            ? React.createElement("img", { src, alt: label, loading: "lazy", decoding: "async", referrerPolicy: "no-referrer", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } })
                                            : React.createElement("span", { style: { color: "#737373", fontSize: 9, fontWeight: 700, textAlign: "center", padding: 6, lineHeight: 1.3 } }, "VARSAYILAN")),
                                        React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 } },
                                            React.createElement("button", { type: "button", onClick: () => document.getElementById(inputId)?.click(), className: "py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[10px] font-bold", style: { minHeight: 44 } }, "Görsel Yükle / Değiştir"),
                                            React.createElement("button", { type: "button", disabled: !src, onClick: () => resetPdfPageImage(field), className: "py-2.5 rounded-lg bg-red-950 text-red-400 text-[10px] font-bold disabled:opacity-30", style: { minHeight: 44 } }, "Varsayılana Dön"))),
                                    React.createElement("input", { id: inputId, type: "file", accept: "image/jpeg,image/png,image/webp", className: "hidden", onChange: e => uploadPdfPageImage(field, e) }));
                            }),
                            React.createElement("div", { className: "border-t border-neutral-800 pt-4 mb-5" },
                                React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-2" }, "Kapanış Sayfası İletişim Bilgileri"),
                                React.createElement("div", { className: "text-[10px] text-neutral-500 mb-3" }, "Katalog ve fiyat listesinin son sayfasında ikonlarla gösterilir. Telefon Görünüm & Ayarlar'dan, web sitesi bu karttaki Web Sitesi alanından alınır. Boş veya geçersiz bilgiler gösterilmez."),
                                (() => {
                                    const igRaw = data.pdf?.instagram || "", ig = instagramHandle(igRaw);
                                    const mailRaw = data.pdf?.email || "", mail = contactEmail(mailRaw);
                                    const hint = (raw, ok, okText) => raw.trim() ? React.createElement("div", { style: { fontSize: 10, marginTop: 5, color: ok ? "#a3a3a3" : "#f87171" } }, ok ? "PDF'te: " + okText : "Geçersiz — PDF'te gösterilmez") : null;
                                    return React.createElement("div", { style: { display: "grid", gap: 12 } },
                                        React.createElement("label", null,
                                            React.createElement(AdminLabel, null, "Instagram"),
                                            React.createElement("input", { className: "admin-input", maxLength: 200, autoComplete: "off", spellCheck: false, value: igRaw, placeholder: "kullaniciadi, @kullaniciadi veya instagram.com/kullaniciadi", onChange: e => setPath(["pdf", "instagram"], safeContactInput(e.target.value, 200)) }),
                                            hint(igRaw, !!ig, ig)),
                                        React.createElement("label", null,
                                            React.createElement(AdminLabel, null, "E-posta"),
                                            React.createElement("input", { className: "admin-input", type: "email", inputMode: "email", maxLength: 120, autoComplete: "off", spellCheck: false, value: mailRaw, placeholder: "ornek@firma.com", onChange: e => setPath(["pdf", "email"], safeContactInput(e.target.value, 120)) }),
                                            hint(mailRaw, !!mail, mail)),
                                        React.createElement("label", null,
                                            React.createElement(AdminLabel, null, "Alt Not"),
                                            React.createElement("input", { className: "admin-input", maxLength: 120, value: data.pdf?.closingNote || "", placeholder: "Örn. Şehir · Ülke", onChange: e => setPath(["pdf", "closingNote"], safeContactInput(e.target.value, 120)) }),
                                            React.createElement("div", { style: { fontSize: 10, marginTop: 5, color: "#737373" } }, "Sayfanın en altında küçük gri tek satır. Boşsa gösterilmez.")));
                                })()),
                            React.createElement("div", { className: "border-t border-neutral-800 pt-4" },
                                React.createElement("div", { className: "text-[10px] uppercase tracking-widest font-bold text-amber-500 mb-3" }, "Kategori Kapaklar\u0131"),
                                React.createElement("div", { className: "text-[11px] text-neutral-400 mb-3" },
                                    "Kapak sayfas\u0131; \u00FCstte foto\u011Fraf, altta kategori ad\u0131 ve \u00FCr\u00FCn say\u0131s\u0131ndan olu\u015Fur. Foto\u011Fraf y\u00FCklenmeyen kategorilerde foto\u011Fraf alan\u0131nda PDF kapak logosu yer al\u0131r. En iyi sonu\u00E7 i\u00E7in ",
                                    React.createElement("b", null, "yatay"),
                                    " ve en az 1600 piksel geni\u015Fli\u011Finde foto\u011Fraf kullan\u0131n; foto\u011Fraf k\u0131rp\u0131l\u0131r, asla gerilmez. Fiyat listesi ve katalog i\u00E7in ge\u00E7erlidir."),
                                categories.map(category => React.createElement("div", { key: category.id, className: "rounded-xl bg-neutral-950 border border-neutral-800 p-3 mb-3" },
                                    React.createElement("div", { className: "flex items-center justify-between gap-3 mb-3" },
                                        React.createElement("div", { className: "font-semibold text-sm" }, category.name),
                                        React.createElement("div", { className: "text-[10px] text-neutral-500" },
                                            category.items?.length || 0,
                                            " \u00FCr\u00FCn")),
                                    React.createElement("div", { className: "rounded-lg bg-neutral-900 overflow-hidden flex items-center justify-center mb-3", style: { aspectRatio: "595 / 488" } }, category.coverImage ? React.createElement(CachedImage, { loading: "lazy", decoding: "async", src: category.coverImage, alt: "Kapak", className: "w-full h-full object-cover" }) : React.createElement("span", { className: "text-[10px] text-neutral-600" }, "Kapak g\u00F6rseli yok")),
                                    React.createElement("div", { className: "grid grid-cols-3 gap-2" },
                                        React.createElement("button", { type: "button", onClick: () => document.getElementById("cover-image-" + category.id)?.click(), className: "min-h-[36px] py-2 rounded-lg bg-neutral-800 text-[11px] font-bold" }, category.coverImage ? "Değiştir" : "Kapak Yükle"),
                                        React.createElement("button", { type: "button", disabled: !category.coverImage, onClick: () => { if (category.coverImage) {
                                                setFullScreenImage({ images: [category.coverImage], index: 0 });
                                                setLightboxZoom(1);
                                            } }, className: "min-h-[36px] py-2 rounded-lg bg-neutral-800 text-[11px] font-bold disabled:opacity-30" }, "\u00D6nizle"),
                                        React.createElement("button", { type: "button", disabled: !category.coverImage, onClick: () => removeCategoryCover(category.id), className: "min-h-[36px] py-2 rounded-lg bg-red-950 text-red-400 text-[11px] font-bold disabled:opacity-30" }, "Sil")),
                                    React.createElement("input", { id: "cover-image-" + category.id, type: "file", accept: "image/*", className: "hidden", onChange: e => uploadCategoryCover(category.id, e) })))))),
                    React.createElement("div", { className: "sticky bottom-0 bg-neutral-950 border-t border-neutral-800 p-4" },
                        React.createElement("button", { type: "button", onClick: save, disabled: saving || !data, className: "w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50", style: { background: saved ? "#12B76A" : theme.accent, animation: saved ? "pop .3s ease" : saving ? "none" : "pulse 2.2s infinite" } },
                            saved ? React.createElement(Icon, { type: "check", size: 17 }) : React.createElement(Icon, { type: "save", size: 17 }),
                            " ",
                            saved ? t("TR", "saved") : saving ? t("TR", "saving") : t("TR", "save"))))));
}
const root = document.getElementById("root");
if (root)
    ReactDOM.createRoot(root).render(React.createElement(App, null));
