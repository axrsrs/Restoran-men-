/* NearDiji — ortak giriş ekranı.
   Kullanım: html = NDGiris.sayfa(icerik, { form, formId, kapat })
             icerik: NDGiris.baslik(...) + NDGiris.alan(...) + NDGiris.buton(...) + NDGiris.hata(id) ...
             ekrana koyduktan sonra NDGiris.bagla(kok) — arka plan, 3D eğilme, şifre göster/gizle.
   Arka plan: kenarlardan merkeze akan noktalı eğriler ve üzerlerinde ilerleyen parçacıklar;
   tıklanan yerden dalga yayılır. Tek canvas sayfa boyunca yaşar; ekran yeniden çizilince taşınır.
   Tema: açık / koyu. Her panel kendi tema ayarını NDGiris.temaAyar({ oku, yaz }) ile bağlar; giriş ekranında
   yapılan seçim panelin kendisine de geçer. Geçiş menüdeki gibi: düğmeden kare açılarak. */
(function () {
  "use strict";
  var esc = function (v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); };
  var AZ = matchMedia("(prefers-reduced-motion: reduce)");
  var INCE = matchMedia("(pointer: fine)");

  var IKON = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    eye: '<svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' +
      '<svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 10s3.5 5 10 5 10-5 10-5"/><path d="m4 13-1.5 2M20 13l1.5 2M9 15l-.8 2.4M15 15l.8 2.4"/></svg>',
    gunes: '<svg class="gunes" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.2" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    ay: '<svg class="ay" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.6 10.1A5.9 5.9 0 0 1 5.9 2.4a5.9 5.9 0 1 0 7.7 7.7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ---------- tema ---------- */
  var ayar = {
    oku: function () {
      var h = document.documentElement, t = h.dataset.theme || h.dataset.mode;
      if (t === "light" || t === "dark") return t;
      try { t = localStorage.getItem("ndg-tema"); } catch (e) { t = null; }
      if (t === "light" || t === "dark") return t;
      return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    },
    yaz: function (t) { try { localStorage.setItem("ndg-tema", t); } catch (e) { } }
  };
  function temaAyar(o) { if (o && o.oku) ayar.oku = o.oku; if (o && o.yaz) ayar.yaz = o.yaz; }
  var temaSimdi = function () { return ayar.oku() === "light" ? "light" : "dark"; };
  function temaEtiket(t) { return t === "light" ? "Koyu moda geç" : "Açık moda geç"; }
  function temaUygula(t) {
    document.querySelectorAll("[data-ndg]").forEach(function (k) {
      k.setAttribute("data-ndg-tema", t);
      var b = k.querySelector(".ndg-tema"); if (b) { b.setAttribute("aria-label", temaEtiket(t)); b.title = temaEtiket(t); }
    });
    if (tuval && tuval.isConnected) ciz(false);   /* yeni renkler geçişin ilk karesinde görünsün */
  }
  function temaDegistir(btn) {
    var next = temaSimdi() === "light" ? "dark" : "light";
    var uygula = function () { ayar.yaz(next); temaUygula(next); };
    if (!document.startViewTransition || AZ.matches || !btn) { uygula(); return; }
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var max = Math.max(x, innerWidth - x, y, innerHeight - y) * 1.05;
    var gecis = document.startViewTransition(uygula);
    gecis.ready.then(function () {
      var kare = function (d) { return "polygon(" + (x - d) + "px " + (y - d) + "px, " + (x + d) + "px " + (y - d) + "px, " + (x + d) + "px " + (y + d) + "px, " + (x - d) + "px " + (y + d) + "px)"; };
      document.documentElement.animate({ clipPath: [kare(0), kare(max)] }, { duration: 400, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" });
    }).catch(function () { });
  }

  /* ---------- kart parçaları ---------- */
  function baslik(metin, alt) {
    return '<div class="ndg-head"><img class="ndg-logo" src="/assets/near-logo.png" alt="NEAR">' +
      '<h1 class="ndg-title" data-ndg-title>' + esc(metin) + '</h1>' + (alt ? '<p class="ndg-sub">' + esc(alt) + '</p>' : "") + '</div>';
  }
  /* o: { id, tur: "email"|"password", yer, oto, deger, etiket, enCok } */
  function alan(o) {
    var pw = o.tur === "password";
    return '<div class="ndg-field' + (pw ? " pw" : "") + '">' + (pw ? IKON.lock : IKON.mail) +
      '<input class="ndg-input" id="' + esc(o.id) + '" type="' + (pw ? "password" : "email") + '"' +
      (pw ? "" : ' inputmode="email" autocapitalize="off" spellcheck="false"') +
      ' autocomplete="' + esc(o.oto || (pw ? "current-password" : "username")) + '" placeholder="' + esc(o.yer || "") + '"' +
      ' aria-label="' + esc(o.etiket || o.yer || "") + '"' + (o.enCok ? ' maxlength="' + o.enCok + '"' : "") +
      (o.deger ? ' value="' + esc(o.deger) + '"' : "") + '>' +
      (pw ? '<button type="button" class="ndg-eye" data-ndg-eye aria-label="Şifreyi göster" aria-pressed="false">' + IKON.eye + '</button>' : "") + '</div>';
  }
  function buton(id, metin, o) {
    o = o || {};
    return '<button class="ndg-btn' + (o.ikincil ? " ghost" : "") + '" id="' + esc(id) + '" type="' + (o.tur || "button") + '"><span>' + esc(metin) + '</span>' + (o.ikincil ? "" : IKON.ok) + '</button>';
  }
  function hata(id, ekSinif) { return '<div class="ndg-err' + (ekSinif ? " " + ekSinif : "") + '" id="' + esc(id) + '" role="alert" aria-live="polite"></div>'; }
  function yukleniyor(metin) { return '<div class="ndg-loader"><i></i></div>' + (metin ? '<p class="ndg-sub" style="text-align:center">' + esc(metin) + '</p>' : ""); }

  /* o: { form: true (içerik <form> içinde), formId, kapat: "kapatmaDugmesiId" } */
  function sayfa(icerik, o) {
    o = o || {};
    var kap = o.form ? 'form class="ndg-glass ndg-form-wrap"' + (o.formId ? ' id="' + esc(o.formId) + '"' : "") + ' novalidate autocomplete="on"' : 'div class="ndg-glass"';
    var kapEnd = o.form ? "form" : "div";
    var t = temaSimdi();
    return '<div class="ndg" data-ndg data-ndg-tema="' + t + '" role="dialog" aria-modal="true" aria-label="Giriş">' +
      '<button type="button" class="ndg-tema" data-ndg-tema-btn aria-label="' + temaEtiket(t) + '" title="' + temaEtiket(t) + '">' + IKON.gunes + IKON.ay + '</button>' +
      '<div class="ndg-glow" aria-hidden="true"></div><div class="ndg-dither" aria-hidden="true"></div>' +
      '<div class="ndg-wrap"><div class="ndg-card"><div class="ndg-beams" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b><b></b><b></b><b></b></div>' +
      '<' + kap + '>' + (o.kapat ? '<button type="button" class="ndg-close" id="' + esc(o.kapat) + '" aria-label="Kapat">×</button>' : "") +
      '<div class="ndg-form">' + icerik + '</div></' + kapEnd + '></div></div></div>';
  }

  /* ---------- arka plan: akış çizgileri ---------- */
  var tuval = null, cx = null, yollar = [], patlamalar = [], G = 0, Y = 0, dpr = 1, dongu = 0, kurulu = false;
  function boyutla() {
    if (!tuval) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    G = window.innerWidth; Y = window.innerHeight;
    tuval.width = Math.round(G * dpr); tuval.height = Math.round(Y * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    yollariKur();
    if (AZ.matches) ciz(false);
  }
  function yollariKur() {
    var n = G < 640 ? 40 : 80;
    yollar = [];
    for (var i = 0; i < n; i++) yollar.push({ sol: i % 2 === 0, y0: (i / n) * Y * 1.4 - Y * 0.2, t: Math.random(), hiz: 0.0015 + Math.random() * 0.002 });
  }
  function bez(t, a, b, c, d) {
    var u = 1 - t;
    return { x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y };
  }
  function ciz(ilerle) {
    cx.clearRect(0, 0, G, Y);
    var mx = G / 2, my = Y / 2;
    if (ilerle) { patlamalar.forEach(function (p) { p.r += 15; p.can -= 0.015; }); patlamalar = patlamalar.filter(function (p) { return p.can > 0; }); }
    var acik = tuval.parentNode && tuval.parentNode.getAttribute && tuval.parentNode.getAttribute("data-ndg-tema") === "light";
    cx.lineWidth = 1.2; cx.strokeStyle = acik ? "rgba(21,21,20,0.28)" : "rgba(255,255,255,0.3)"; cx.setLineDash([1, 4]);
    var noktalar = [];
    for (var i = 0; i < yollar.length; i++) {
      var y = yollar[i];
      var p0 = { x: y.sol ? 0 : G, y: y.y0 }, p1 = { x: y.sol ? mx * 0.5 : G - mx * 0.5, y: y.y0 }, p2 = { x: y.sol ? mx * 0.8 : G - mx * 0.8, y: my }, p3 = { x: mx, y: my };
      cx.beginPath(); cx.moveTo(p0.x, p0.y); cx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y); cx.stroke();
      if (ilerle) { y.t += y.hiz; if (y.t > 1) { y.t = 0; y.y0 += (Math.random() - 0.5) * 10; } }
      var q = bez(y.t, p0, p1, p2, p3), dx = 0, dy = 0;
      for (var k = 0; k < patlamalar.length; k++) {
        var e = patlamalar[k], ax = q.x - e.x, ay = q.y - e.y, m = Math.hypot(ax, ay);
        if (m && m < e.r + 120 && m > e.r - 120) { var f = (1 - Math.abs(m - e.r) / 120) * e.can; dx += ax / m * f * 80; dy += ay / m * f * 80; }
      }
      noktalar.push(q.x + dx, q.y + dy);
    }
    cx.setLineDash([]);
    cx.fillStyle = acik ? "rgba(21,21,20,0.7)" : "rgba(255,255,255,0.7)";
    for (var j = 0; j < noktalar.length; j += 2) cx.fillRect(noktalar[j] - 1.5, noktalar[j + 1] - 1.5, 3, 3);
  }
  function kare() {
    dongu = 0;
    if (!tuval || !tuval.isConnected) return;          /* giriş ekranı kapandı: dur */
    if (!document.hidden) ciz(true);
    dongu = requestAnimationFrame(kare);
  }
  function baslat() { if (!dongu && !AZ.matches) dongu = requestAnimationFrame(kare); else if (AZ.matches) ciz(false); }
  function arkaPlan(kok) {
    if (!tuval) {
      tuval = document.createElement("canvas"); tuval.className = "ndg-bg"; tuval.setAttribute("aria-hidden", "true");
      cx = tuval.getContext("2d");
    }
    if (tuval.parentNode !== kok) kok.insertBefore(tuval, kok.firstChild);
    if (!kurulu) {
      kurulu = true;
      window.addEventListener("resize", function () { if (tuval && tuval.isConnected) boyutla(); });
      document.addEventListener("visibilitychange", function () { if (!document.hidden && tuval && tuval.isConnected) baslat(); });
      document.addEventListener("pointerdown", function (e) {
        if (!tuval || !tuval.isConnected || AZ.matches) return;
        if (e.target.closest && e.target.closest(".ndg-card,.ndg-tema")) return;   /* kartın içindeki tıklamalar dalga yapmaz */
        patlamalar.push({ x: e.clientX, y: e.clientY, r: 0, can: 1 });
      }, { passive: true });
      boyutla();
    } else if (G !== window.innerWidth || Y !== window.innerHeight) boyutla();
    baslat();
  }

  /* ---------- 3D eğilme (yalnız fare ile) ---------- */
  function egilme(kart) {
    if (!kart || kart.__ndg || !INCE.matches || AZ.matches) return;
    kart.__ndg = true;
    kart.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = kart.getBoundingClientRect();
      var x = Math.max(-300, Math.min(300, e.clientX - r.left - r.width / 2)), y = Math.max(-300, Math.min(300, e.clientY - r.top - r.height / 2));
      kart.style.transform = "rotateX(" + (-y / 30).toFixed(2) + "deg) rotateY(" + (x / 30).toFixed(2) + "deg) translateZ(10px)";
    });
    kart.addEventListener("pointerleave", function () { kart.style.transform = ""; });
  }

  /* başlıktaki kelimeler sırayla aşağıdan yükselir */
  function baslikAnim(h) {
    if (!h || h.__ndg) return; h.__ndg = true;
    var kel = h.textContent.trim().split(/\s+/);
    h.innerHTML = kel.map(function (w, i) { return '<span class="w"><span style="animation-delay:' + (0.15 + i * 0.15).toFixed(2) + 's">' + esc(w) + '</span></span>'; }).join(" ");
  }

  function bagla(kok) {
    kok = kok && kok.matches && kok.matches("[data-ndg]") ? kok : (kok || document).querySelector("[data-ndg]");
    if (!kok) return;
    arkaPlan(kok);
    egilme(kok.querySelector(".ndg-card"));
    baslikAnim(kok.querySelector("[data-ndg-title]"));
    kok.setAttribute("data-ndg-tema", temaSimdi());
    var tb = kok.querySelector("[data-ndg-tema-btn]");
    if (tb && !tb.__ndg) { tb.__ndg = true; tb.addEventListener("click", function () { temaDegistir(tb); }); }
    kok.querySelectorAll("[data-ndg-eye]").forEach(function (b) {
      if (b.__ndg) return; b.__ndg = true;
      b.addEventListener("click", function () {
        var i = b.parentNode.querySelector("input"), ac = i.type === "password";
        i.type = ac ? "text" : "password";
        b.setAttribute("aria-pressed", ac ? "true" : "false");
        b.setAttribute("aria-label", ac ? "Şifreyi gizle" : "Şifreyi göster");
      });
    });
  }

  window.NDGiris = { temaAyar: temaAyar, sayfa: sayfa, baslik: baslik, alan: alan, buton: buton, hata: hata, yukleniyor: yukleniyor, bagla: bagla, esc: esc };
})();
