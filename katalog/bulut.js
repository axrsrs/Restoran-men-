/* sh21 bulut katmanı — neardiji.com/katalog/<firma>
   Katalog verisi Supabase'te (catalogs.data) firma başına tek kayıttır.
   Görseller kaydederken catalog-media klasörüne yüklenir, veride link olarak durur.
   Yönetim girişi e-posta + şifre (Supabase Auth); yetki get_catalog_access ile sunucuda denetlenir. */
(function () {
  "use strict";
  var SB_URL = window.ND_SB_URL;   /* assets/sb-config.js */
  var SB_KEY = window.ND_SB_KEY;
  var SESSION_KEY = "sh21Session"; /* katalog paneli kendi oturumunu tutar; süper panel (/821) ayrı giriş ister */
  var BUCKET = "catalog-media";
  var SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  var params = new URLSearchParams(location.search);
  var slug = String(params.get("f") || "sh21-demo").toLowerCase().slice(0, 60);
  if (!SLUG_RE.test(slug)) slug = "sh21-demo";

  var session = null, catalog = null, access = null, lastSavedJSON = null, saveChain = Promise.resolve();
  var uploaded = new Map();

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { } }
  lsDel("nearMenuSession"); /* eski ortak oturum kaydı */
  try { session = JSON.parse(lsGet(SESSION_KEY) || "null"); } catch (e) { session = null; }
  function storeSession(s) { session = s; if (s) lsSet(SESSION_KEY, JSON.stringify(s)); else lsDel(SESSION_KEY); }
  function toSession(j) {
    return { access_token: j.access_token, refresh_token: j.refresh_token,
      expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600), user: j.user || (session && session.user) || null };
  }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]; }); }

  async function authReq(path, body, method, withToken) {
    var h = { apikey: SB_KEY, "Content-Type": "application/json" };
    if (withToken && session) h.Authorization = "Bearer " + session.access_token;
    var r = await fetch(SB_URL + "/auth/v1/" + path, { method: method || "POST", headers: h, body: JSON.stringify(body || {}) });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) { var e = new Error(j.msg || j.error_description || j.message || ("Hata " + r.status)); e.status = r.status; e.code = j.error_code || j.code; throw e; }
    return j;
  }
  async function ensureFresh() {
    /* başka sayfa (menü / süper panel) oturumu yenilediyse en güncelini al */
    try { var cur = JSON.parse(lsGet(SESSION_KEY) || "null"); if (cur && (!session || (cur.expires_at || 0) > (session.expires_at || 0))) session = cur; } catch (e) { }
    if (!session) return;
    if ((session.expires_at || 0) - Math.floor(Date.now() / 1000) > 90) return;
    try { storeSession(toSession(await authReq("token?grant_type=refresh_token", { refresh_token: session.refresh_token }))); }
    catch (e) { storeSession(null); }
  }
  async function sb(path, opts) {
    opts = opts || {};
    await ensureFresh();
    var h = Object.assign({ apikey: SB_KEY }, opts.headers || {});
    if (session && !opts.anon) h.Authorization = "Bearer " + session.access_token;
    var body = opts.body;
    if (body !== undefined && !(body instanceof Blob)) { h["Content-Type"] = "application/json"; body = JSON.stringify(body); }
    var r = await fetch(SB_URL + path, { method: opts.method || "GET", headers: h, body: body });
    if (r.status === 401 && session && !opts.retried) {
      storeSession(null);
      return sb(path, Object.assign({}, opts, { retried: true }));
    }
    var txt = await r.text();
    var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = txt; }
    if (!r.ok) { var e2 = new Error((j && (j.message || j.msg || j.error)) || ("Hata " + r.status)); e2.status = r.status; throw e2; }
    return j;
  }

  /* ---------- tam sayfa durum ekranı (bulunamadı / kapalı) ---------- */
  function fatal(title, text) {
    document.title = title;
    var root = document.getElementById("root") || document.body;
    root.innerHTML = '<div class="sh21-state"><div class="sh21-state-box"><div class="sh21-state-icon">i</div><h1>' + esc(title) +
      '</h1><p>' + esc(text) + '</p><a href="https://neardiji.com">neardiji.com</a></div></div>';
  }

  /* ---------- yükleme ---------- */
  var ready = (async function () {
    var rec = null;
    try { rec = await sb("/rest/v1/rpc/get_catalog", { method: "POST", body: { p_slug: slug } }); }
    catch (e) {
      if (session) { storeSession(null); try { rec = await sb("/rest/v1/rpc/get_catalog", { method: "POST", body: { p_slug: slug } }); } catch (e2) { rec = null; } }
    }
    if (!rec || !rec.id) {
      var ts = null;
      try { ts = await sb("/rest/v1/rpc/tenant_state", { method: "POST", body: { p_kind: "catalog", p_slug: slug }, anon: true }); } catch (e) { }
      if (ts && (ts.state === "expired" || ts.state === "passive")) {
        fatal("Katalog geçici olarak hizmet dışı", (ts.name || "Bu firma") + " kataloğu şu an yayında değil. Lütfen firmayla iletişime geçin.");
        throw new Error("katalog askıda");
      }
      fatal("Katalog bulunamadı", "Bu adreste yayında bir katalog yok ya da katalog şu an kapalı. Lütfen firmayla iletişime geçin.");
      throw new Error("katalog yok");
    }
    catalog = rec;
    lastSavedJSON = JSON.stringify(rec.data || {});
    try {
      var k = "sh21v:" + slug + ":" + new Date().toISOString().slice(0, 10);
      if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, "1"); sb("/rest/v1/rpc/track_catalog_visit", { method: "POST", body: { p_slug: slug }, anon: true }).catch(function () { }); }
    } catch (e) { }
    return rec;
  })();

  async function loadRecord() {
    var rec = await ready;
    var d = rec.data || {};
    return d && typeof d === "object" && Object.keys(d).length ? { savedAt: Date.parse(rec.updated_at) || Date.now(), data: d } : null;
  }

  /* ---------- görselleri storage'a taşı ---------- */
  function dataUrlToBlob(u) {
    var m = /^data:([^;,]+)(;base64)?,(.*)$/i.exec(u);
    if (!m) return null;
    var raw = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    var a = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) a[i] = raw.charCodeAt(i);
    return new Blob([a], { type: m[1].toLowerCase() });
  }
  async function sha(blob) {
    var buf = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("").slice(0, 32);
  }
  var EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  async function uploadDataUrl(u) {
    if (uploaded.has(u)) return uploaded.get(u);
    var blob = dataUrlToBlob(u);
    if (!blob || !EXT[blob.type]) return u; /* SVG vb. veride kalır */
    var name = catalog.id + "/" + (await sha(blob)) + "." + EXT[blob.type];
    await ensureFresh();
    if (!session) throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın.");
    var url = await NDMedia.put(BUCKET, name, blob, session.access_token);
    uploaded.set(u, url);
    return url;
  }
  async function moveImages(node) {
    if (typeof node === "string") return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(node) ? uploadDataUrl(node) : node;
    if (Array.isArray(node)) { var out = []; for (var i = 0; i < node.length; i++) out.push(await moveImages(node[i])); return out; }
    if (node && typeof node === "object") { var o = {}; for (var k in node) o[k] = await moveImages(node[k]); return o; }
    return node;
  }

  /* Kayıttan sonra artık kullanılmayan görseller R2'den silinir (sadece bu kataloğun klasörü) */
  function mediaUrls(json) {
    var out = new Set(), re = /https:\/\/media\.neardiji\.com\/catalog-media\/[^"\\\s]+/g, m;
    while ((m = re.exec(json || ""))) out.add(m[0]);
    return out;
  }
  function removeUnusedImages(beforeJSON, afterJSON) {
    if (!beforeJSON || !session) return;
    var now = mediaUrls(afterJSON), own = "https://media.neardiji.com/catalog-media/" + catalog.id + "/";
    mediaUrls(beforeJSON).forEach(function (u) {
      if (now.has(u) || u.indexOf(own) !== 0) return;
      uploaded.forEach(function (v, k) { if (v === u) uploaded.delete(k); });
      NDMedia.del(u, session.access_token).catch(function () { });
    });
  }

  /* ---------- kayıt (sırayla, değişmediyse atla) ---------- */
  function canEdit() { return !!(session && access && access.role); }
  async function doSave(clean) {
    await ready;
    if (!canEdit()) return { savedAt: Date.now(), data: clean, storage: "none" };
    var moved = await moveImages(clean);
    var json = JSON.stringify(moved);
    if (json === lastSavedJSON) return { savedAt: Date.now(), data: moved, storage: "cloud" };
    if (json.length > 2900000) throw new Error("Katalog verisi çok büyük. Lütfen bazı görselleri küçültün.");
    var rows = await sb("/rest/v1/catalogs?id=eq." + encodeURIComponent(catalog.id) + "&select=id", { method: "PATCH", body: { data: moved },
      headers: { Prefer: "return=representation" } });
    if (!Array.isArray(rows) || !rows.length) throw new Error("Kaydetme yetkiniz yok veya oturum süresi doldu. Lütfen tekrar giriş yapın.");
    var before = lastSavedJSON;
    lastSavedJSON = json;
    removeUnusedImages(before, json);
    return { savedAt: Date.now(), data: moved, storage: "cloud" };
  }
  function save(clean) {
    var p = saveChain.then(function () { return doSave(clean); });
    saveChain = p.catch(function () { });
    return p;
  }

  /* ---------- yetkisiz / bulunamadı ekranı ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".sh21-state{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0b0b0c;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;text-align:center}",
    ".sh21-state-box{max-width:380px}.sh21-state-icon{width:52px;height:52px;margin:0 auto 16px;border-radius:50%;border:1px solid #3f3f46;display:grid;place-items:center;font:600 22px Georgia,serif;color:#a1a1aa}",
    ".sh21-state h1{font-size:22px;margin:0 0 8px}.sh21-state p{color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 18px}.sh21-state a{color:#f4f4f5;font-size:13px}"
  ].join("\n");
  document.head.appendChild(css);

  /* Giriş ve şifre pencereleri: ortak NEAR giriş kartı (assets/giris.js) */
  function girisModal(html) {
    var w = document.createElement("div");
    w.innerHTML = NDGiris.sayfa(html, { form: true });
    var ov = w.firstElementChild;
    document.body.appendChild(ov);
    NDGiris.bagla(ov);
    return ov;
  }

  async function loadAccess() {
    access = await sb("/rest/v1/rpc/get_catalog_access", { method: "POST", body: { p_slug: slug } });
    if (!access || !access.role) access = null;
    return access;
  }

  function askNewPassword(force) {
    return new Promise(function (resolve) {
      var G = NDGiris;
      var ov = girisModal(G.baslik(force ? "Yeni Şifre" : "Şifreyi Değiştir",
          force ? "İlk girişte geçici şifrenizi kendi şifrenizle değiştirmeniz gerekiyor (en az 8 karakter)." : "En az 8 karakterli yeni bir şifre girin.") +
        G.alan({ id: "sh21p1", tur: "password", yer: "Yeni şifre", oto: "new-password", enCok: 72 }) +
        G.alan({ id: "sh21p2", tur: "password", yer: "Yeni şifre (tekrar)", oto: "new-password", enCok: 72 }) +
        G.hata("sh21e") +
        (force ? G.buton("sh21s", "Kaydet", { tur: "submit" }) :
          '<div class="ndg-row">' + G.buton("sh21c", "Vazgeç", { ikincil: true }) + G.buton("sh21s", "Kaydet", { tur: "submit" }) + '</div>'));
      var f = ov.querySelector("form"), err = ov.querySelector("#sh21e");
      setTimeout(function () { ov.querySelector("#sh21p1").focus(); }, 30);
      var c = ov.querySelector("#sh21c"); if (c) c.onclick = function () { ov.remove(); resolve(false); };
      f.onsubmit = async function (e) {
        e.preventDefault();
        var a = ov.querySelector("#sh21p1").value, b = ov.querySelector("#sh21p2").value;
        if (a.length < 8) { err.textContent = "Şifre en az 8 karakter olmalı."; return; }
        if (a !== b) { err.textContent = "Şifreler aynı değil."; return; }
        var btn = ov.querySelector("#sh21s"); btn.disabled = true;
        try {
          await ensureFresh();
          var u = await authReq("user", { password: a, data: { must_change_password: false } }, "PUT", true);
          session.user = u; storeSession(session); ov.remove(); resolve(true);
        } catch (er) { btn.disabled = false; err.textContent = "Şifre kaydedilemedi: " + er.message; }
      };
    });
  }

  function login() {
    return new Promise(function (resolve) {
      var G = NDGiris;
      var ov = girisModal(G.baslik("Hoş Geldiniz", ((catalog && catalog.name) || "Katalog") + " kataloğunu düzenlemek için giriş yapın.") +
        G.alan({ id: "sh21em", tur: "email", yer: "E-posta", deger: lsGet("sh21LastEmail") || "", enCok: 120 }) +
        G.alan({ id: "sh21pw", tur: "password", yer: "Şifre", enCok: 72 }) +
        G.hata("sh21e") +
        '<div class="ndg-row">' + G.buton("sh21c", "Vazgeç", { ikincil: true }) + G.buton("sh21s", "Giriş Yap", { tur: "submit" }) + '</div>' +
        '<p class="ndg-foot"><button type="button" class="ndg-link" id="sh21f">Şifremi unuttum</button></p>');
      var f = ov.querySelector("form"), err = ov.querySelector("#sh21e");
      setTimeout(function () { (lsGet("sh21LastEmail") ? ov.querySelector("#sh21pw") : ov.querySelector("#sh21em")).focus(); }, 30);
      ov.querySelector("#sh21c").onclick = function () { ov.remove(); resolve(false); };
      ov.querySelector("#sh21f").onclick = function () {
        err.textContent = "Şifrenizi sıfırlamak için NearDiji ile iletişime geçin; yeni geçici şifre hemen verilir.";
      };
      f.onsubmit = async function (e) {
        e.preventDefault();
        var em = (ov.querySelector("#sh21em").value || "").trim().toLowerCase(), pw = ov.querySelector("#sh21pw").value || "";
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em) || !pw) { err.textContent = "E-posta ve şifrenizi girin."; return; }
        var btn = ov.querySelector("#sh21s"); btn.disabled = true; err.textContent = "";
        try {
          storeSession(toSession(await authReq("token?grant_type=password", { email: em, password: pw })));
          lsSet("sh21LastEmail", em);
          if (!(await loadAccess())) {
            storeSession(null); btn.disabled = false;
            err.textContent = "Bu hesabın bu kataloğu düzenleme yetkisi yok."; return;
          }
          ov.remove(); resolve(true);
        } catch (er) {
          btn.disabled = false;
          err.textContent = er.status === 400 ? "E-posta veya şifre hatalı." : er.status === 429 ? "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin." : "Giriş yapılamadı: " + er.message;
        }
      };
    });
  }

  async function requireAdmin() {
    await ready;
    if (session) { try { await ensureFresh(); if (session && (await loadAccess())) { } else storeSession(null); } catch (e) { storeSession(null); } }
    if (!session || !access) { if (!(await login())) return false; }
    if (session.user && session.user.user_metadata && session.user.user_metadata.must_change_password) {
      if (!(await askNewPassword(true))) return false;
    }
    return true;
  }

  async function logout() {
    try { if (session) await fetch(SB_URL + "/auth/v1/logout", { method: "POST", headers: { apikey: SB_KEY, Authorization: "Bearer " + session.access_token } }); } catch (e) { }
    storeSession(null); access = null;
    location.reload();
  }

  /* Panel çevirisi: Cloudflare yapay zekâ çevirisi (medya sunucusu). Giriş yoksa ya da hata olursa null. */
  async function translate(text, target) {
    text = String(text || "").trim();
    if (!text || text.length > 600 || !session) return null;
    try {
      await ensureFresh();
      if (!session) return null;
      var r = await fetch(NDMedia.base + "/translate", { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ text: text, target: target === "ar" ? "ar" : "en" }) });
      if (!r.ok) return null;
      var j = await r.json();
      return j && j.text ? String(j.text) : null;
    } catch (e) { return null; }
  }

  window.SH21 = {
    slug: slug, ready: ready, loadRecord: loadRecord, save: save, requireAdmin: requireAdmin, translate: translate,
    changePassword: function () { return askNewPassword(false); }, logout: logout,
    email: function () { return (session && session.user && session.user.email) || ""; },
    isSuper: function () { return !!(access && access.super); },
    subscription: function () { return (access && access.subscription) || null; },
    support: function () { return (access && access.support) || null; },
    url: function () { return location.origin + "/katalog" + (slug === "sh21-demo" ? "" : "/" + slug); }
  };
})();
