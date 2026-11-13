/* NearDiji — "uygulama olarak yükle" ayarı.
   Her müşteri sayfası (menü, katalog) kendi adıyla ana ekrana eklenir: "Kahve Durağı", "NEAR Katalog" gibi.
   Kullanım: NDUygulama.ayarla({ ad, kisaAd, baslangic, tema, arka })
     ad        : uygulama adı (ana ekranda görünür)
     baslangic : açılış adresi, örn. "/menu/?r=xfirma"
   Sayfadaki <link rel="manifest"> bu bilgilerle üretilen bir manifest'e çevrilir (aynı kaynaktan blob adresi).
   iPhone manifest'teki adı okumaz; onun için apple-mobile-web-app-title da güncellenir.
   Aynı bilgilerle tekrar çağrılırsa hiçbir şey yapmaz. */
(function () {
  "use strict";
  var son = "", url = "";
  function meta(ad, deger) {
    var m = document.querySelector('meta[name="' + ad + '"]');
    if (!m) { m = document.createElement("meta"); m.name = ad; document.head.appendChild(m); }
    m.content = deger;
  }
  function ayarla(o) {
    if (!o || !o.ad || !o.baslangic) return;
    var ad = String(o.ad).trim().slice(0, 60);
    var kisa = String(o.kisaAd || ad).trim().slice(0, 30);
    var k = [ad, kisa, o.baslangic, o.tema, o.arka].join("|");
    if (k === son) return;
    son = k;
    var kok = location.origin;
    var bas = new URL(o.baslangic, kok).href;
    var m = {
      id: bas, name: ad, short_name: kisa, lang: "tr", dir: "auto",
      start_url: bas, scope: kok + "/", display: "standalone",
      background_color: o.arka || "#111110", theme_color: o.tema || "#111110",
      icons: [
        { src: kok + "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: kok + "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: kok + "/assets/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      ]
    };
    try {
      var yeni = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: "application/manifest+json" }));
      var l = document.querySelector('link[rel="manifest"]');
      if (!l) { l = document.createElement("link"); l.rel = "manifest"; document.head.appendChild(l); }
      l.href = yeni;
      if (url) { var eski = url; setTimeout(function () { URL.revokeObjectURL(eski); }, 30000); }
      url = yeni;
    } catch (e) { }
    meta("apple-mobile-web-app-title", kisa);
    meta("application-name", kisa);
  }
  window.NDUygulama = { ayarla: ayarla };
})();
