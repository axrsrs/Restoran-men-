/* NearDiji — ortak "bulunamadı" (404) ekranı: ana site, NearMenu ve katalog.
   Büyük, aşağı doğru silinen 404 + açıklama + iki buton; arka planda yavaşça akan çizgiler.
   Bağımlılık yok. Sayfanın üstüne tam ekran katman olarak açılır, alttaki uygulamaya dokunmaz.
   Kullanım: NDBulunamadi.goster("site" | "menu" | "katalog")
   <html data-nd404="site"> olan sayfada (404.html) yönlendirme yoksa kendiliğinden açılır. */
(function () {
  if (window.NDBulunamadi) return;

  /* Ana sitedeki logonun birebir kopyası (beyaz; açık temada ters çevrilir) */
  var LOGO = "/assets/logo-near.png";

  var METIN = {
    site: {
      baslik: "Sayfa bulunamadı — NearDiji",
      aciklama: "Aradığın sayfa taşınmış ya da<br>hiç var olmamış olabilir.",
      butonlar: [["home", "Ana sayfaya dön", "/"], ["compass", "Projeleri keşfet", "/#projeler"]]
    },
    menu: {
      baslik: "Menü bulunamadı — NearMenu",
      aciklama: "Bu adreste bir menü yok.<br>QR kodu yeniden okut ya da adresi kontrol et.",
      butonlar: [["rotate", "Yeniden dene", ""], ["home", "Ana sayfa", "/"]]
    },
    katalog: {
      baslik: "Katalog bulunamadı — NearDiji",
      aciklama: "Bu katalog bulunamadı. Bağlantı eskimiş olabilir.<br>Güncel bağlantıyı firmadan iste.",
      butonlar: [["rotate", "Yeniden dene", ""], ["home", "Ana sayfa", "/"]]
    }
  };

  /* lucide ikonları (ISC lisansı): house, compass, rotate-cw */
  var IKON = {
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
    rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>'
  };
  function ikon(k) {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IKON[k] + "</svg>";
  }

  /* Akan çizgiler: iki yönde 36'şar eğri, her biri kendi hızında (20–30 sn).
     Canvas'a çizilir (saniyede en fazla 30 kare, sekme gizliyken durur); yazılar her karede yeniden boyanmaz. */
  function cizgiVerisi() {
    var list = [], ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    document.body.appendChild(svg);
    [1, -1].forEach(function (pos) {
      for (var i = 0; i < 36; i++) {
        var k = i * 5 * pos, y = i * 6;
        var d = "M-" + (380 - k) + " -" + (189 + y) +
          "C-" + (380 - k) + " -" + (189 + y) + " -" + (312 - k) + " " + (216 - y) + " " + (152 - k) + " " + (343 - y) +
          "C" + (616 - k) + " " + (470 - y) + " " + (684 - k) + " " + (875 - y) + " " + (684 - k) + " " + (875 - y);
        var pe = document.createElementNS(ns, "path"); pe.setAttribute("d", d); svg.appendChild(pe);
        var L = 0; try { L = pe.getTotalLength(); } catch (e) { L = 1400; }
        list.push({ p: new Path2D(d), L: L || 1400, w: 0.5 + i * 0.03, a: Math.min(1, 0.1 + i * 0.03), sure: 20000 + Math.random() * 10000 });
      }
    });
    svg.remove();
    return list;
  }

  function akisBaslat(cv, renk, hareketsiz) {
    var ctx = cv.getContext("2d"); if (!ctx || typeof Path2D === "undefined") return;
    var list = cizgiVerisi(), W = 0, H = 0, dpr = 1, son = 0, raf = 0, t0 = performance.now();
    function boyut() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
    }
    function ciz(now) {
      var sc = Math.max(W / 696, H / 316), ox = (W - 696 * sc) / 2, oy = (H - 316 * sc) / 2;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(sc * dpr, 0, 0, sc * dpr, ox * dpr, oy * dpr);
      ctx.strokeStyle = renk; ctx.lineCap = "butt";
      for (var i = 0; i < list.length; i++) {
        var c = list[i], f, uz, kay, op;
        if (hareketsiz) { uz = 1; kay = 0; op = .35; }
        else {
          f = ((now - t0) % c.sure) / c.sure;      /* 0 → 1 */
          uz = .3 + .7 * f;                        /* çizgi boyu: %30 → %100 */
          kay = f < .5 ? f * 2 : (1 - f) * 2;      /* kayma: 0 → 1 → 0 */
          op = .3 + .3 * (1 - Math.abs(2 * f - 1)); /* saydamlık: .3 → .6 → .3 */
        }
        ctx.globalAlpha = c.a * op;
        ctx.lineWidth = c.w;
        ctx.setLineDash([uz * c.L, c.L]);
        ctx.lineDashOffset = -kay * c.L;
        ctx.stroke(c.p);
      }
    }
    function dongu(now) {
      raf = 0;
      if (document.hidden || !cv.isConnected) return;
      if (now - son >= 33) { son = now; ciz(now); }
      raf = requestAnimationFrame(dongu);
    }
    boyut(); ciz(performance.now());
    window.addEventListener("resize", function () { boyut(); ciz(performance.now()); }, { passive: true });
    if (hareketsiz) return;
    document.addEventListener("visibilitychange", function () { if (!document.hidden && !raf) raf = requestAnimationFrame(dongu); });
    raf = requestAnimationFrame(dongu);
  }

  function tema() {
    var t = null;
    try { t = localStorage.getItem("nd-theme"); } catch (e) { }
    return t === "dark" ? "dark" : "light";
  }

  var CSS =
    "@font-face{font-family:'ND404';font-weight:100 900;font-display:swap;src:url(/assets/fonts/geist-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+20A0-20C0,U+2C60-2C7F,U+A720-A7FF}" +
    "@font-face{font-family:'ND404';font-weight:100 900;font-display:swap;src:url(/assets/fonts/geist-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212}" +
    ".nd404{--bg:#EBE9E5;--fg:#151514;position:fixed;inset:0;z-index:2147483000;overflow:hidden auto;background:var(--bg);color:var(--fg);" +
    "font-family:'ND404',-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:96px 16px 64px;box-sizing:border-box}" +
    ".nd404[data-theme=dark]{--bg:#111110;--fg:#F1EFEA}" +
    ".nd404 *{box-sizing:border-box}" +
    ".nd404-fp{position:absolute;inset:0;pointer-events:none;opacity:.5;contain:strict;will-change:transform;transform:translateZ(0)}" +
    ".nd404[data-theme=dark] .nd404-fp{opacity:.42}" +
    ".nd404-fp canvas{position:absolute;inset:0;width:100%;height:100%;display:block}" +
    ".nd404-logo{position:absolute;top:28px;left:50%;transform:translateX(-50%);display:block;line-height:0;z-index:1;will-change:transform}" +
    ".nd404-logo img{height:34px;width:auto;display:block}" +
    ".nd404:not([data-theme=dark]) .nd404-logo img{filter:invert(1) hue-rotate(180deg)}" +
    ".nd404-empty{position:relative;z-index:1;will-change:transform;display:flex;flex-direction:column;align-items:center;gap:24px;text-align:center;max-width:100%}" +
    ".nd404-head{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:24rem}" +
    ".nd404-num{margin:0;font-size:128px;line-height:1;font-weight:800;letter-spacing:-.04em;" +
    "-webkit-mask-image:linear-gradient(to bottom,#000 20%,transparent 80%);mask-image:linear-gradient(to bottom,#000 20%,transparent 80%)}" +
    ".nd404-desc{margin:-32px 0 0;font-size:14px;line-height:1.625;color:color-mix(in srgb,var(--fg) 80%,transparent);text-wrap:balance}" +
    ".nd404-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}" +
    ".nd404-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:6px;font:500 14px/1 'ND404',-apple-system,sans-serif;" +
    "text-decoration:none;white-space:nowrap;cursor:pointer;border:1px solid transparent;transition:background-color .2s,color .2s,border-color .2s,transform .2s;-webkit-tap-highlight-color:transparent}" +
    ".nd404-btn:focus-visible{outline:2px solid var(--fg);outline-offset:2px}" +
    ".nd404-btn:active{transform:scale(.97)}" +
    ".nd404-pri{background:var(--fg);color:var(--bg)}" +
    ".nd404-pri:hover{background:color-mix(in srgb,var(--fg) 90%,transparent)}" +
    ".nd404-out{background:color-mix(in srgb,var(--bg) 70%,transparent);color:var(--fg);border-color:color-mix(in srgb,var(--fg) 18%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}" +
    ".nd404-out:hover{background:color-mix(in srgb,var(--fg) 8%,var(--bg))}" +
    ".nd404-num,.nd404-desc,.nd404-btns{animation:nd404-gir .9s cubic-bezier(.16,1,.3,1) both}" +
    ".nd404-desc{animation-delay:.12s}.nd404-btns{animation-delay:.24s}" +
    "@keyframes nd404-gir{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    "@media (max-width:420px){.nd404-num{font-size:112px}.nd404-logo{top:22px}.nd404-logo img{height:28px}}" +
    "@media (prefers-reduced-motion:reduce){.nd404-num,.nd404-desc,.nd404-btns{animation:none}}";

  var acik = false;

  function goster(tur) {
    if (acik) return;
    var m = METIN[tur] || METIN.site;
    acik = true;

    if (!document.getElementById("nd404-css")) {
      var st = document.createElement("style");
      st.id = "nd404-css";
      st.textContent = CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    document.title = m.baslik;
    try {
      if (!document.querySelector('meta[name="robots"]')) {
        var mr = document.createElement("meta"); mr.name = "robots"; mr.content = "noindex";
        document.head.appendChild(mr);
      }
    } catch (e) { }

    var t = tema();
    var bt = m.butonlar.map(function (b, i) {
      var cls = "nd404-btn " + (i === 0 ? "nd404-pri" : "nd404-out");
      if (!b[2]) return '<button type="button" class="' + cls + '" data-nd404-yenile>' + ikon(b[0]) + b[1] + "</button>";
      return '<a class="' + cls + '" href="' + b[2] + '">' + ikon(b[0]) + b[1] + "</a>";
    }).join("");

    var el = document.createElement("div");
    el.className = "nd404";
    el.setAttribute("data-theme", t);
    el.setAttribute("role", "main");
    el.innerHTML =
      '<div class="nd404-fp" aria-hidden="true"><canvas></canvas></div>' +
      '<a class="nd404-logo" href="/" aria-label="NearDiji ana sayfa"><img src="' + LOGO + '" alt="NearDiji" width="131" height="34"></a>' +
      '<div class="nd404-empty"><div class="nd404-head"><h1 class="nd404-num">404</h1><p class="nd404-desc">' + m.aciklama + "</p></div>" +
      '<div class="nd404-btns">' + bt + "</div></div>";

    var yenile = el.querySelector("[data-nd404-yenile]");
    if (yenile) yenile.addEventListener("click", function () { location.reload(); });

    document.documentElement.style.background = t === "dark" ? "#111110" : "#EBE9E5";
    (document.body || document.documentElement).appendChild(el);
    if (document.body) document.body.style.overflow = "hidden";
    try {
      akisBaslat(el.querySelector(".nd404-fp canvas"), t === "dark" ? "#F1EFEA" : "#151514",
        window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) { }
  }

  window.NDBulunamadi = { goster: goster };

  /* 404.html: yönlendirme yapılmadıysa kendiliğinden aç */
  var oto = document.documentElement.getAttribute("data-nd404");
  if (oto && !window.NDYonlendiriliyor) {
    if (document.body) goster(oto);
    else document.addEventListener("DOMContentLoaded", function () { goster(oto); });
  }
})();
