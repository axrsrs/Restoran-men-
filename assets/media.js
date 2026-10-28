/* NearDiji — yüklenen dosyalar (görsel / video) için tek ortak katman.
   Dosyalar Cloudflare R2'de, https://media.neardiji.com üzerinden (cloudflare/media-worker).
   Menü, site paneli, katalog ve süper panel bu dosyayı kullanır. */
(function () {
  "use strict";
  var BASE = "https://media.neardiji.com";

  function enc(p) { return String(p).split("/").map(encodeURIComponent).join("/"); }
  function url(bucket, path) { return BASE + "/" + bucket + "/" + enc(path); }

  /* Bizim depoya ait linki {bucket, path} olarak çözer; değilse null. */
  function parse(u) {
    u = String(u || "");
    if (u.indexOf(BASE + "/") !== 0) return null;
    var rest = u.slice(BASE.length + 1).split("?")[0].split("/");
    var bucket = rest.shift();
    var path = rest.map(function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } }).join("/");
    return bucket && path ? { bucket: bucket, path: path } : null;
  }

  async function fail(r) {
    var t = await r.text().catch(function () { return ""; });
    var j = null; try { j = JSON.parse(t); } catch (e) { }
    var e = new Error((j && (j.message || j.error || j.msg)) || ("Yükleme başarısız (" + r.status + ")"));
    e.status = r.status;
    throw e;
  }

  async function put(bucket, path, blob, token) {
    var r = await fetch(BASE + "/" + bucket + "/" + enc(path), { method: "PUT",
      headers: { Authorization: "Bearer " + token, "Content-Type": blob.type || "application/octet-stream" }, body: blob });
    if (!r.ok) await fail(r);
    return url(bucket, path);
  }

  async function del(u, token) {
    var x = parse(u);
    if (!x) return;
    var r = await fetch(BASE + "/" + x.bucket + "/" + enc(x.path), { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    if (!r.ok && r.status !== 404) await fail(r);
  }

  /* Firma silinince klasörünün tamamı (bucket/<uuid>/) */
  async function delFolder(bucket, id, token) {
    if (!/^[0-9a-f-]{36}$/.test(String(id))) return;
    var r = await fetch(BASE + "/" + bucket + "/" + id + "/", { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    if (!r.ok && r.status !== 404) await fail(r);
  }

  window.NDMedia = { base: BASE, url: url, parse: parse, put: put, del: del, delFolder: delFolder };
})();
