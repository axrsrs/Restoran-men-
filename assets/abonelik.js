/* İşletme panelleri (NearMenu, katalog) için abonelik kartı.
   Veri: get_my_access / get_catalog_access → subscription + support (sadece üye ya da süper yöneticiye döner).
   NDAbonelik.html(sub, support) → güvenli (kaçışlı) HTML metni. */
(function () {
  "use strict";

  var CSS = ".nda{margin:0 0 16px;padding:16px;border-radius:16px;border:1px solid rgba(128,128,128,.28);background:rgba(128,128,128,.07);color:inherit;font-size:13px;line-height:1.5}" +
    ".nda h3{margin:0 0 10px;font-size:14px;font-weight:800;display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
    ".nda .pill{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:rgba(128,128,128,.18)}" +
    ".nda .pill.ok{background:rgba(52,168,83,.18);color:#34a853}.nda .pill.warn{background:rgba(230,150,30,.2);color:#d9891a}.nda .pill.bad{background:rgba(220,60,60,.18);color:#e05252}" +
    ".nda dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 14px;margin:0 0 12px}" +
    ".nda dt{opacity:.62}.nda dd{margin:0;font-weight:700;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}" +
    ".nda p{margin:0 0 10px;opacity:.78}" +
    ".nda .acts{display:flex;flex-wrap:wrap;gap:8px}" +
    ".nda .acts a{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:12px;border:1px solid rgba(128,128,128,.35);color:inherit;text-decoration:none;font-weight:700;font-size:12.5px}" +
    ".nda .acts a:hover{background:rgba(128,128,128,.12)}";

  function css() {
    if (document.getElementById("nda-css")) return;
    var st = document.createElement("style");
    st.id = "nda-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function gun(iso) {
    if (!iso) return null;
    var d = new Date(iso + "T23:59:59");
    if (isNaN(d)) return null;
    return Math.ceil((d - Date.now()) / 86400000) - 1;
  }

  function tarih(iso) {
    var d = new Date(iso + "T12:00:00");
    return isNaN(d) ? "" : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  }

  function ucret(s) {
    if (s.price_amount == null || s.price_amount === "") return "";
    var sym = s.price_currency === "USD" ? "$" : s.price_currency === "EUR" ? "€" : "₺";
    return sym + Number(s.price_amount).toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + (s.price_period === "yil" ? " / yıl" : " / ay");
  }

  function html(sub, support) {
    if (!sub) return "";
    css();
    var plan = sub.plan === "premium" ? "Premium" : "Temel";
    var durum, sinif, bitisEtiket = "", bitis = "", kalan = null;

    if (sub.status === "passive") { durum = "Pasif"; sinif = "bad"; }
    else if (sub.status === "trial") {
      kalan = gun(sub.trial_ends);
      durum = kalan !== null && kalan < 0 ? "Deneme bitti" : "Deneme";
      sinif = kalan !== null && kalan < 0 ? "bad" : kalan !== null && kalan <= 3 ? "warn" : "ok";
      bitisEtiket = "Deneme bitişi"; bitis = sub.trial_ends;
    } else {
      kalan = gun(sub.paid_until);
      durum = kalan !== null && kalan < 0 ? "Süresi doldu" : "Aktif";
      sinif = kalan !== null && kalan < 0 ? "bad" : kalan !== null && kalan <= 7 ? "warn" : "ok";
      bitisEtiket = "Yenileme tarihi"; bitis = sub.paid_until;
    }

    var satir = "<dt>Paket</dt><dd>" + esc(plan) + "</dd>";
    satir += "<dt>Ücret</dt><dd>" + (ucret(sub) ? esc(ucret(sub)) : "Henüz belirlenmedi") + "</dd>";
    if (bitisEtiket) {
      satir += "<dt>" + esc(bitisEtiket) + "</dt><dd>" + (bitis
        ? esc(tarih(bitis)) + (kalan !== null && kalan >= 0 ? " · " + (kalan === 0 ? "bugün son gün" : kalan + " gün kaldı") : "")
        : (sub.status === "active" ? "Süresiz" : "—")) + "</dd>";
    }

    var sp = support || {}, acts = "";
    var wa = String(sp.whatsapp || "").replace(/\D/g, "");
    var tel = String(sp.phone || "").replace(/[^\d+]/g, "");
    var mail = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(sp.email || "") ? sp.email : "";
    if (wa) acts += '<a href="https://wa.me/' + esc(wa) + '?text=' + encodeURIComponent("Merhaba, aboneliğim hakkında yazıyorum.") + '" target="_blank" rel="noopener">WhatsApp</a>';
    if (tel) acts += '<a href="tel:' + esc(tel) + '">' + esc(sp.phone) + "</a>";
    if (mail) acts += '<a href="mailto:' + esc(mail) + '">' + esc(mail) + "</a>";

    return '<section class="nda" aria-label="Abonelik">' +
      '<h3>Abonelik <span class="pill ' + sinif + '">' + esc(durum) + "</span></h3>" +
      "<dl>" + satir + "</dl>" +
      "<p>Yenileme otomatik yapılmaz; ödeme alınmadan bitiş tarihi geçerse sayfanız ziyaretçilere kapanır. " +
      "Aboneliği iptal etmek, paketi değiştirmek veya yenilemek için NearDiji'ye yazın" + (acts ? ":" : ".") + "</p>" +
      (acts ? '<div class="acts">' + acts + "</div>" : "") +
      "</section>";
  }

  window.NDAbonelik = { html: html };
})();
