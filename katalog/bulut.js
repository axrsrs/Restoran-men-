/* sh21 bulut katmanı — neardiji.com/katalog/<firma>
   Katalog verisi Supabase'te (catalogs.data) firma başına tek kayıttır.
   Görseller kaydederken catalog-media klasörüne yüklenir, veride link olarak durur.
   Yönetim girişi e-posta + şifre (Supabase Auth); yetki get_catalog_access ile sunucuda denetlenir. */
(function () {
  "use strict";
  var SB_URL = "https://rfwgjzkewtjpdcvrhepg.supabase.co";
  var SB_KEY = "sb_publishable_ohHiomyazD8qr_mQXX9G-Q_DCEeD8j2";
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

  /* ---------- kayıt (sırayla, değişmediyse atla) ---------- */
  function canEdit() { return !!(session && access && access.role); }
  async function doSave(clean) {
    await ready;
    if (!canEdit()) return { savedAt: Date.now(), data: clean, storage: "none" };
    var moved = await moveImages(clean);
    var json = JSON.stringify(moved);
    if (json === lastSavedJSON) return { savedAt: Date.now(), data: moved, storage: "cloud" };
    if (json.length > 2900000) throw new Error("Katalog verisi çok büyük. Lütfen bazı görselleri küçültün.");
    var rows = await sb("/rest/v1/catalogs?id=eq." + encodeURIComponent(catalog.id), { method: "PATCH", body: { data: moved },
      headers: { Prefer: "return=representation" } });
    if (!Array.isArray(rows) || !rows.length) throw new Error("Kaydetme yetkiniz yok veya oturum süresi doldu. Lütfen tekrar giriş yapın.");
    lastSavedJSON = json;
    return { savedAt: Date.now(), data: moved, storage: "cloud" };
  }
  function save(clean) {
    var p = saveChain.then(function () { return doSave(clean); });
    saveChain = p.catch(function () { });
    return p;
  }

  /* ---------- giriş penceresi ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".sh21-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}",
    ".sh21-box{width:100%;max-width:360px;background:#0f0f10;border:1px solid #262628;border-radius:20px;padding:24px;color:#f4f4f5;box-shadow:0 30px 80px rgba(0,0,0,.6)}",
    ".sh21-box h2{margin:0 0 4px;font-size:19px}.sh21-box p{margin:0 0 16px;color:#a1a1aa;font-size:13px;line-height:1.5}",
    ".sh21-box label{display:block;font-size:12px;color:#a1a1aa;margin:10px 0 6px}",
    ".sh21-box input{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:12px;border:1px solid #2e2e31;background:#18181b;color:#fff;font-size:16px;outline:none}",
    ".sh21-box input:focus{border-color:#f4f4f5}",
    ".sh21-row{display:flex;gap:8px;margin-top:18px}.sh21-row button{flex:1;padding:12px;border-radius:12px;border:0;font-weight:700;font-size:14px;cursor:pointer}",
    ".sh21-ghost{background:#232326;color:#d4d4d8}.sh21-main{background:#f4f4f5;color:#0f0f10}.sh21-main:disabled{opacity:.5}",
    ".sh21-err{min-height:18px;margin-top:10px;color:#f87171;font-size:12.5px}",
    ".sh21-link{background:none;border:0;color:#a1a1aa;font-size:12.5px;margin-top:12px;cursor:pointer;text-decoration:underline;padding:0}",
    ".sh21-state{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0b0b0c;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;text-align:center}",
    ".sh21-state-box{max-width:380px}.sh21-state-icon{width:52px;height:52px;margin:0 auto 16px;border-radius:50%;border:1px solid #3f3f46;display:grid;place-items:center;font:600 22px Georgia,serif;color:#a1a1aa}",
    ".sh21-state h1{font-size:22px;margin:0 0 8px}.sh21-state p{color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 18px}.sh21-state a{color:#f4f4f5;font-size:13px}"
  ].join("\n");
  document.head.appendChild(css);

  function modal(html) {
    var ov = document.createElement("div");
    ov.className = "sh21-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = '<form class="sh21-box" novalidate>' + html + "</form>";
    document.body.appendChild(ov);
    return ov;
  }

  async function loadAccess() {
    access = await sb("/rest/v1/rpc/get_catalog_access", { method: "POST", body: { p_slug: slug } });
    if (!access || !access.role) access = null;
    return access;
  }

  function askNewPassword(force) {
    return new Promise(function (resolve) {
      var ov = modal('<h2>' + (force ? "Yeni şifre belirleyin" : "Şifreyi değiştir") + '</h2><p>' +
        (force ? "İlk girişte geçici şifrenizi kendi şifrenizle değiştirmeniz gerekiyor." : "En az 8 karakterli yeni bir şifre girin.") + '</p>' +
        '<label for="sh21p1">Yeni şifre</label><input id="sh21p1" type="password" autocomplete="new-password" minlength="8" maxlength="72">' +
        '<label for="sh21p2">Yeni şifre (tekrar)</label><input id="sh21p2" type="password" autocomplete="new-password" minlength="8" maxlength="72">' +
        '<div class="sh21-err" id="sh21e"></div><div class="sh21-row">' + (force ? "" : '<button type="button" class="sh21-ghost" id="sh21c">Vazgeç</button>') +
        '<button type="submit" class="sh21-main" id="sh21s">Kaydet</button></div>');
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
      var ov = modal('<h2>Yönetim girişi</h2><p>' + esc((catalog && catalog.name) || "Katalog") + ' kataloğunu düzenlemek için giriş yapın.</p>' +
        '<label for="sh21em">E-posta</label><input id="sh21em" type="email" autocomplete="username" inputmode="email" maxlength="120" value="' + esc(lsGet("sh21LastEmail") || "") + '">' +
        '<label for="sh21pw">Şifre</label><input id="sh21pw" type="password" autocomplete="current-password" maxlength="72">' +
        '<div class="sh21-err" id="sh21e"></div><div class="sh21-row"><button type="button" class="sh21-ghost" id="sh21c">Vazgeç</button>' +
        '<button type="submit" class="sh21-main" id="sh21s">Giriş yap</button></div>' +
        '<button type="button" class="sh21-link" id="sh21f">Şifremi unuttum</button>');
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

  window.SH21 = {
    slug: slug, ready: ready, loadRecord: loadRecord, save: save, requireAdmin: requireAdmin,
    changePassword: function () { return askNewPassword(false); }, logout: logout,
    email: function () { return (session && session.user && session.user.email) || ""; },
    isSuper: function () { return !!(access && access.super); }
  };
})();
