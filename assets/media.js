/* NearDiji — yüklenen dosyalar (görsel / video) için tek ortak katman.
   BASE boşsa Supabase Storage kullanılır; "https://media.neardiji.com" olunca
   Cloudflare R2 + Worker kullanılır (cloudflare/media-worker). Menü, site paneli
   ve katalog bu dosyadan okur; geçiş için sadece BASE değişir. */
(function () {
  "use strict";
  var SB = "https://rfwgjzkewtjpdcvrhepg.supabase.co";
  var KEY = "sb_publishable_ohHiomyazD8qr_mQXX9G-Q_DCEeD8j2";
  var BASE = ""; /* Cloudflare R2'ye geçişte: "https://media.neardiji.com" */
  var SB_PUBLIC = SB + "/storage/v1/object/public/";

  function enc(p) { return String(p).split("/").map(encodeURIComponent).join("/"); }
  function url(bucket, path) { return (BASE ? BASE + "/" : SB_PUBLIC) + bucket + "/" + enc(path); }

  /* Bizim depolardan birine ait linki {bucket, path, provider} olarak çözer; değilse null. */
  function parse(u) {
    u = String(u || "");
    var pre = [[SB_PUBLIC, "supabase"]];
    if (BASE) pre.push([BASE + "/", "r2"]);
    for (var i = 0; i < pre.length; i++) {
      if (u.indexOf(pre[i][0]) !== 0) continue;
      var rest = u.slice(pre[i][0].length).split("?")[0].split("/");
      var bucket = rest.shift();
      var path = rest.map(function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } }).join("/");
      if (bucket && path) return { bucket: bucket, path: path, provider: pre[i][1] };
    }
    return null;
  }

  async function fail(r) {
    var t = await r.text().catch(function () { return ""; });
    var j = null; try { j = JSON.parse(t); } catch (e) { }
    var e = new Error((j && (j.message || j.error || j.msg)) || ("Yükleme başarısız (" + r.status + ")"));
    e.status = r.status;
    throw e;
  }

  async function put(bucket, path, blob, token) {
    var type = blob.type || "application/octet-stream";
    var r = BASE
      ? await fetch(BASE + "/" + bucket + "/" + enc(path), { method: "PUT", headers: { Authorization: "Bearer " + token, "Content-Type": type }, body: blob })
      : await fetch(SB + "/storage/v1/object/" + bucket + "/" + enc(path), { method: "POST",
          headers: { apikey: KEY, Authorization: "Bearer " + token, "Content-Type": type, "x-upsert": "true", "cache-control": "31536000" }, body: blob });
    if (!r.ok) await fail(r);
    return url(bucket, path);
  }

  async function del(u, token) {
    var x = parse(u);
    if (!x) return;
    var r = x.provider === "r2"
      ? await fetch(BASE + "/" + x.bucket + "/" + enc(x.path), { method: "DELETE", headers: { Authorization: "Bearer " + token } })
      : await fetch(SB + "/storage/v1/object/" + x.bucket + "/" + enc(x.path), { method: "DELETE", headers: { apikey: KEY, Authorization: "Bearer " + token } });
    if (!r.ok && r.status !== 404) await fail(r);
  }

  window.NDMedia = { base: BASE, url: url, parse: parse, put: put, del: del };
})();
