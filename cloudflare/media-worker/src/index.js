/* NearDiji medya Worker'ı — media.neardiji.com
   GET/HEAD  /<bucket>/<yol>  → R2'den dosya (CDN önbellekli, video için Range desteği)
   PUT       /<bucket>/<yol>  → yükleme   (Authorization: Bearer <Supabase oturum anahtarı>)
   DELETE    /<bucket>/<yol>  → silme      (aynı yetki)
   Yetki Supabase'te public.media_can_write(bucket, yol) ile kullanıcının kendi oturumuyla denetlenir;
   Worker'da gizli anahtar yoktur. */

const IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKETS = {
  "menu-media": { max: 50 * 1024 * 1024, types: [...IMAGES, "video/mp4", "video/webm", "video/quicktime"] },
  "site-media": { max: 8 * 1024 * 1024, types: IMAGES },
  "catalog-media": { max: 10 * 1024 * 1024, types: IMAGES },
};
const PATH_RE = /^[A-Za-z0-9][A-Za-z0-9._\-\/]{0,299}$/;
const ALLOWED_ORIGINS = ["https://neardiji.com", "https://www.neardiji.com"];

function cors(req) {
  const o = req.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.includes(o) || /^https:\/\/[a-z0-9-]+\.neardiji\.pages\.dev$/.test(o) ? o : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Range",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, ETag",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
function json(req, status, body) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

async function canWrite(env, auth, bucket, path) {
  if (!/^Bearer [A-Za-z0-9._-]{20,}$/.test(auth || "")) return false;
  const r = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/media_can_write", {
    method: "POST",
    headers: { apikey: env.SUPABASE_KEY, Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ p_bucket: bucket, p_path: path }),
  });
  if (!r.ok) return false;
  return (await r.json().catch(() => false)) === true;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });

    const parts = url.pathname.replace(/^\/+/, "").split("/");
    const bucket = parts.shift();
    let path = "";
    try { path = parts.map(decodeURIComponent).join("/"); } catch (e) { return json(req, 400, { error: "Geçersiz yol" }); }
    const rule = BUCKETS[bucket];
    if (!rule || !PATH_RE.test(path) || path.includes("..")) return json(req, 404, { error: "Bulunamadı" });
    const key = bucket + "/" + path;

    if (req.method === "GET" || req.method === "HEAD") {
      const obj = await env.MEDIA.get(key, { range: req.headers, onlyIf: req.headers });
      if (!obj) return json(req, 404, { error: "Bulunamadı" });
      const h = new Headers(cors(req));
      obj.writeHttpMetadata(h);
      h.set("ETag", obj.httpEtag);
      h.set("Cache-Control", "public, max-age=31536000, immutable");
      h.set("Accept-Ranges", "bytes");
      h.set("X-Content-Type-Options", "nosniff");
      if (!("body" in obj)) return new Response(null, { status: 304, headers: h }); /* onlyIf eşleşti */
      let status = 200;
      if (obj.range && req.headers.has("Range")) {
        const off = obj.range.offset || 0, len = obj.range.length ?? (obj.size - off);
        h.set("Content-Range", `bytes ${off}-${off + len - 1}/${obj.size}`);
        h.set("Content-Length", String(len));
        status = 206;
      } else h.set("Content-Length", String(obj.size));
      return new Response(req.method === "HEAD" ? null : obj.body, { status, headers: h });
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const auth = req.headers.get("Authorization");
      if (!(await canWrite(env, auth, bucket, path))) return json(req, 403, { error: "Bu dosyayı yüklemeye / silmeye yetkiniz yok." });
      if (req.method === "DELETE") { await env.MEDIA.delete(key); return json(req, 200, { ok: true }); }

      const type = (req.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
      if (!rule.types.includes(type)) return json(req, 415, { error: "Bu dosya türü desteklenmiyor: " + (type || "bilinmiyor") });
      const len = Number(req.headers.get("Content-Length") || 0);
      if (!len) return json(req, 411, { error: "Dosya boyutu bildirilmedi." });
      if (len > rule.max) return json(req, 413, { error: "Dosya çok büyük (en fazla " + Math.round(rule.max / 1048576) + " MB)." });
      await env.MEDIA.put(key, req.body, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
      return json(req, 200, { ok: true, url: "https://media.neardiji.com/" + key });
    }

    return json(req, 405, { error: "Yöntem desteklenmiyor" });
  },
};
