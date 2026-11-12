/* NearDiji — giriş güvenlik doğrulaması (Cloudflare Turnstile).
   Kullanım: var kod = await NDDogrula.al();  → doğrulama kodu ya da null.
   Kod, Supabase giriş / şifre sıfırlama isteğine gotrue_meta_security.captcha_token olarak eklenir.
   ND_CAPTCHA_KEY (assets/sb-config.js) boşsa hiçbir şey yüklenmez ve null döner.
   Betik yalnızca giriş düğmesine basıldığında yüklenir; menüyü gezen ziyaretçiye ek istek çıkmaz.
   Kutu çoğu zaman görünmez; Cloudflare gerek görürse ekranın altında küçük bir onay kutusu açılır. */
(function () {
  "use strict";
  var KEY = window.ND_CAPTCHA_KEY || "";
  var yuk = null, kutu = null, wid = null;

  function yukle() {
    if (yuk) return yuk;
    yuk = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = function () { window.turnstile ? res() : rej(new Error("yok")); };
      s.onerror = function () { yuk = null; s.remove(); rej(new Error("yuklenemedi")); };
      document.head.appendChild(s);
    });
    return yuk;
  }

  function kutuAl() {
    if (kutu && kutu.isConnected) return kutu;
    kutu = document.createElement("div");
    kutu.setAttribute("data-nd-dogrula", "");
    kutu.style.cssText = "position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483000;max-width:calc(100vw - 16px)";
    document.body.appendChild(kutu);
    return kutu;
  }

  function al() {
    if (!KEY) return Promise.resolve(null);
    return yukle().then(function () {
      return new Promise(function (res) {
        var bitti = false;
        var son = function (kod) {
          if (bitti) return; bitti = true; clearTimeout(sure);
          res(typeof kod === "string" && kod ? kod : null);
        };
        var sure = setTimeout(function () { son(null); }, 90000);
        if (wid !== null) { try { window.turnstile.remove(wid); } catch (e) { } wid = null; }
        try {
          wid = window.turnstile.render(kutuAl(), {
            sitekey: KEY, appearance: "interaction-only", language: "tr", theme: "auto",
            callback: son,
            "error-callback": function () { son(null); return true; },
            "timeout-callback": function () { son(null); }
          });
        } catch (e) { son(null); }
      });
    }).catch(function () { return null; });
  }

  /* İsteğin gövdesine doğrulama kodunu ekler (yalnızca giriş ve şifre sıfırlama yollarında). */
  function ekle(yol, govde) {
    if (!KEY || !/^(token\?grant_type=password|recover|signup|otp)/.test(String(yol || ""))) return Promise.resolve(govde);
    return al().then(function (kod) {
      if (!kod) return govde;
      var g = {}; for (var k in (govde || {})) g[k] = govde[k];
      g.gotrue_meta_security = { captcha_token: kod };
      return g;
    });
  }

  var HATA = "Güvenlik doğrulaması tamamlanamadı. Sayfayı yenileyip yeniden deneyin.";
  function hataMi(e) { return !!e && (e.code === "captcha_failed" || /captcha/i.test(String(e.message || ""))); }

  window.NDDogrula = { al: al, ekle: ekle, hataMi: hataMi, HATA: HATA, acik: !!KEY };
})();
