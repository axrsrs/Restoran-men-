/* Çerez onay penceresi — neardiji.com herkese açık sayfaları.
   Zorunlu tarayıcı kayıtları her zaman açık. Ziyaret istatistiği (Cloudflare Web Analytics, çerezsiz)
   yalnızca ziyaretçi izin verirse yüklenir. Tercih 12 ay saklanır; [data-cerez-ayar] öğeleri pencereyi yeniden açar.
   NDCerez.ac() → pencereyi aç, NDCerez.tercih() → {analitik: bool} | null */
(function () {
  "use strict";

  var KEY = "nd-cerez";
  var SURUM = 1;
  var GECERLILIK = 365 * 24 * 60 * 60 * 1000;
  var CF_TOKEN = "96904ebcb6284131b17bf6722257b5a9";

  var METIN = {
    tr: {
      baslik: "Gizliliğinize önem veriyoruz",
      metin: "Sitemizin çalışması için yalnızca gerekli tarayıcı kayıtlarını kullanıyoruz. Ziyaret istatistikleri ise tercihinize bağlıdır.",
      kabul: "Tümünü kabul et", reddet: "Reddet", yonet: "Tercihleri yönet",
      tBaslik: "Çerez tercihleri",
      zorunlu: "Zorunlu", zorunluAcik: "Her zaman açık",
      zorunluMetin: "Tema tercihi, sayfanın hızlı açılması için içerik kopyası ve yönetim paneli oturumu. Site bunlar olmadan çalışmaz.",
      analitik: "Ziyaret istatistiği",
      analitikMetin: "Hangi sayfaların ne kadar ziyaret edildiğini görmemizi sağlar (Cloudflare Web Analytics). Çerez kullanmaz, sizi tanımlamaz.",
      kaydet: "Seçimi kaydet", geri: "Geri", kvkk: "KVKK ve Gizlilik"
    },
    en: {
      baslik: "We respect your privacy",
      metin: "We only use the browser storage this site needs to work. Visit statistics are up to you.",
      kabul: "Accept all", reddet: "Reject", yonet: "Manage preferences",
      tBaslik: "Cookie preferences",
      zorunlu: "Essential", zorunluAcik: "Always on",
      zorunluMetin: "Theme preference, a cached copy of the page for faster loading and the admin session. The site cannot work without these.",
      analitik: "Visit statistics",
      analitikMetin: "Shows us how often pages are visited (Cloudflare Web Analytics). Uses no cookies and does not identify you.",
      kaydet: "Save choice", geri: "Back", kvkk: "Privacy"
    },
    ar: {
      baslik: "نحن نحترم خصوصيتك",
      metin: "نستخدم فقط بيانات المتصفح اللازمة لعمل الموقع. إحصاءات الزيارة حسب اختيارك.",
      kabul: "قبول الكل", reddet: "رفض", yonet: "إدارة التفضيلات",
      tBaslik: "تفضيلات ملفات تعريف الارتباط",
      zorunlu: "ضرورية", zorunluAcik: "مفعّلة دائمًا",
      zorunluMetin: "تفضيل المظهر ونسخة من الصفحة لتحميل أسرع وجلسة لوحة الإدارة. لا يعمل الموقع بدونها.",
      analitik: "إحصاءات الزيارة",
      analitikMetin: "تُظهر لنا عدد زيارات الصفحات (Cloudflare Web Analytics). لا تستخدم ملفات تعريف الارتباط ولا تحدد هويتك.",
      kaydet: "حفظ الاختيار", geri: "رجوع", kvkk: "الخصوصية"
    }
  };

  var CSS =
    ".ndc{position:fixed;z-index:2147483000;left:0;right:0;bottom:0;display:flex;justify-content:flex-start;pointer-events:none;" +
    "padding:0 max(12px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px))}" +
    ".ndc-kart{pointer-events:auto;width:100%;max-width:440px;background:#242424;color:#f2f2f2;border:1px solid rgba(255,255,255,.08);border-radius:22px;" +
    "padding:22px 20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.45);font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;" +
    "-webkit-font-smoothing:antialiased;max-height:calc(100vh - 24px);overflow-y:auto;animation:ndcIn .28s ease-out}" +
    "@keyframes ndcIn{from{transform:translateY(14px);opacity:.4}to{transform:none;opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.ndc-kart{animation:none}}" +
    ".ndc h2{margin:0 0 8px;font-size:19px;line-height:1.25;font-weight:700;color:#fff;letter-spacing:-.01em}" +
    ".ndc p{margin:0 0 16px;font-size:15px;color:#e6e6e6}" +
    ".ndc-btn{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;" +
    "border-radius:999px;font-size:15px;font-weight:600;text-align:center;line-height:1.2}" +
    ".ndc-ana{width:100%;background:#f2f2f2;color:#111}.ndc-ana:hover{background:#fff}" +
    ".ndc-ikili{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}" +
    ".ndc-cizgi{border:1.5px solid rgba(255,255,255,.28);color:#cfcfcf;background:transparent}.ndc-cizgi:hover{border-color:rgba(255,255,255,.5);color:#fff}" +
    ".ndc-btn:focus-visible,.ndc a:focus-visible,.ndc-anahtar:focus-visible{outline:2px solid #fff;outline-offset:2px}" +
    ".ndc-alt{margin-top:14px;font-size:13px;color:#9a9a9a}.ndc-alt a{color:#bdbdbd;text-decoration:underline;text-underline-offset:3px}" +
    ".ndc-oge{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 14px;padding:12px 0;border-top:1px solid rgba(255,255,255,.09);align-items:center}" +
    ".ndc-oge b{font-size:15px;color:#fff}.ndc-oge small{grid-column:1/-1;font-size:13px;color:#a8a8a8;line-height:1.45}" +
    ".ndc-rozet{font-size:12px;color:#9a9a9a;white-space:nowrap}" +
    ".ndc-anahtar{all:unset;cursor:pointer;position:relative;width:46px;height:28px;border-radius:999px;background:#555;transition:background .2s}" +
    ".ndc-anahtar::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .2s}" +
    ".ndc-anahtar[aria-checked=true]{background:#f2f2f2}.ndc-anahtar[aria-checked=true]::after{transform:translateX(18px);background:#242424}" +
    "[dir=rtl] .ndc-anahtar[aria-checked=true]::after{transform:translateX(-18px)}[dir=rtl] .ndc-anahtar::after{left:auto;right:3px}" +
    "@media (max-width:380px){.ndc-ikili{grid-template-columns:1fr}}";

  function oku() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || v.v !== SURUM || !v.t || Date.now() - v.t > GECERLILIK) return null;
      return { analitik: !!v.analitik };
    } catch (e) { return null; }
  }
  function yaz(analitik) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: SURUM, analitik: !!analitik, t: Date.now() })); } catch (e) {}
  }

  var yuklendi = false;
  function analitikYukle() {
    if (yuklendi) return;
    yuklendi = true;
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(s);
  }

  function dil() {
    var l = (document.documentElement.lang || "tr").slice(0, 2).toLowerCase();
    return METIN[l] ? l : "tr";
  }
  function esc(v) {
    return String(v).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  var kok = null, oncekiOdak = null;
  function kapat() {
    if (!kok) return;
    kok.remove();
    kok = null;
    if (oncekiOdak && oncekiOdak.focus) try { oncekiOdak.focus(); } catch (e) {}
  }
  function karar(analitik) {
    yaz(analitik);
    if (analitik) analitikYukle();
    else if (yuklendi) { kapat(); location.reload(); return; } /* izin geri alındı: yüklenmiş betik sayfa yenilenince kalkar */
    kapat();
  }

  function ciz(gorunum) {
    var L = dil(), T = METIN[L];
    if (!document.getElementById("ndc-css")) {
      var st = document.createElement("style");
      st.id = "ndc-css";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    if (!kok) {
      kok = document.createElement("div");
      kok.className = "ndc";
      document.body.appendChild(kok);
    }
    var mevcut = oku();
    var kvkk = '<div class="ndc-alt"><a href="https://neardiji.com/#kvkk" target="_blank" rel="noopener">' + esc(T.kvkk) + "</a></div>";
    var html;
    if (gorunum === "tercih") {
      var acik = mevcut ? mevcut.analitik : false;
      html = '<div class="ndc-kart" role="dialog" aria-modal="false" aria-labelledby="ndc-b">' +
        '<h2 id="ndc-b">' + esc(T.tBaslik) + "</h2>" +
        '<div class="ndc-oge"><b>' + esc(T.zorunlu) + '</b><span class="ndc-rozet">' + esc(T.zorunluAcik) + "</span><small>" + esc(T.zorunluMetin) + "</small></div>" +
        '<div class="ndc-oge"><b id="ndc-al">' + esc(T.analitik) + '</b><button type="button" class="ndc-anahtar" role="switch" aria-labelledby="ndc-al" aria-checked="' + acik + '" data-ndc="anahtar"></button>' +
        "<small>" + esc(T.analitikMetin) + "</small></div>" +
        '<button type="button" class="ndc-btn ndc-ana" data-ndc="kaydet" style="margin-top:8px">' + esc(T.kaydet) + "</button>" +
        '<div class="ndc-ikili"><button type="button" class="ndc-btn ndc-cizgi" data-ndc="geri">' + esc(T.geri) + "</button>" +
        '<button type="button" class="ndc-btn ndc-cizgi" data-ndc="kabul">' + esc(T.kabul) + "</button></div>" + kvkk + "</div>";
    } else {
      html = '<div class="ndc-kart" role="dialog" aria-modal="false" aria-labelledby="ndc-b" aria-describedby="ndc-m">' +
        '<h2 id="ndc-b">' + esc(T.baslik) + '</h2><p id="ndc-m">' + esc(T.metin) + "</p>" +
        '<button type="button" class="ndc-btn ndc-ana" data-ndc="kabul">' + esc(T.kabul) + "</button>" +
        '<div class="ndc-ikili"><button type="button" class="ndc-btn ndc-cizgi" data-ndc="reddet">' + esc(T.reddet) + "</button>" +
        '<button type="button" class="ndc-btn ndc-cizgi" data-ndc="yonet">' + esc(T.yonet) + "</button></div>" + kvkk + "</div>";
    }
    kok.innerHTML = html;
    kok.firstChild.setAttribute("dir", L === "ar" ? "rtl" : "ltr");
    kok.firstChild.setAttribute("lang", L);
    var odak = kok.querySelector(".ndc-ana");
    if (odak && gorunum === "tercih") odak = kok.querySelector(".ndc-anahtar");
    if (odak && document.activeElement !== document.body) try { odak.focus({ preventScroll: true }); } catch (e) {}
  }

  function ac() {
    oncekiOdak = document.activeElement;
    ciz("ilk");
  }

  document.addEventListener("click", function (e) {
    var ayar = e.target.closest && e.target.closest("[data-cerez-ayar]");
    if (ayar) { e.preventDefault(); oncekiOdak = ayar; ciz("tercih"); return; }
    var b = e.target.closest && e.target.closest("[data-ndc]");
    if (!b || !kok || !kok.contains(b)) return;
    var k = b.getAttribute("data-ndc");
    if (k === "kabul") karar(true);
    else if (k === "reddet") karar(false);
    else if (k === "yonet") ciz("tercih");
    else if (k === "geri") ciz("ilk");
    else if (k === "anahtar") b.setAttribute("aria-checked", b.getAttribute("aria-checked") === "true" ? "false" : "true");
    else if (k === "kaydet") {
      var a = kok.querySelector(".ndc-anahtar");
      karar(!!a && a.getAttribute("aria-checked") === "true");
    }
  });
  document.addEventListener("keydown", function (e) {
    /* Esc seçim yapmadan kapatmaz; ziyaretçi tercihini belirtmeli. Sadece tercih görünümünden geri döner. */
    if (e.key === "Escape" && kok && kok.querySelector(".ndc-anahtar")) ciz("ilk");
  });

  function basla() {
    /* Panel içi önizleme (iframe) ve sunucu tarafı önizlemede pencere gösterilmez, istatistik yüklenmez */
    if (window.self !== window.top) return;
    var t = oku();
    if (t) { if (t.analitik) analitikYukle(); return; }
    ac();
  }

  window.NDCerez = { ac: function () { oncekiOdak = document.activeElement; ciz("tercih"); }, tercih: oku };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla);
  else basla();
})();
