/* NearDiji medya Worker'ı — media.neardiji.com
   GET/HEAD  /<bucket>/<yol>  → R2'den dosya (CDN önbellekli; video parçaları da önbellekten)
   PUT       /<bucket>/<yol>  → yükleme   (Authorization: Bearer <Supabase oturum anahtarı>)
   DELETE    /<bucket>/<yol>  → silme      (aynı yetki)
   DELETE    /<bucket>/<id>/  → klasörü silme (firma silinince; aynı yetki)
   POST      /translate       → çeviri (Workers AI; sadece giriş yapmış panel kullanıcıları)
   Yetki Supabase'te public.media_can_write(bucket, yol) ile kullanıcının kendi oturumuyla denetlenir;
   Worker'da gizli anahtar yoktur.
   Her bölümün kendi R2 deposu var (adresler değişmedi, /<bucket>/ öneki depoyu seçer):
     menu-media    → neardiji-menu      (NearMenu: logo, ürün görseli, video arka plan)
     catalog-media → neardiji-katalog   (katalog / sh21)
     site-media    → neardiji-site      (neardiji.com ve demolar)
   Geçiş: yeni depoda bulunmayan dosya eski ortak depodan (LEGACY, "<bucket>/<yol>") okunur. */

const IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKETS = {
  "menu-media": { r2: "MENU", max: 20 * 1024 * 1024, types: [...IMAGES, "video/mp4", "video/webm", "video/quicktime"] },
  "site-media": { r2: "SITE", max: 8 * 1024 * 1024, types: IMAGES },
  "catalog-media": { r2: "KATALOG", max: 10 * 1024 * 1024, types: IMAGES },
};
/* Bölümün deposu ve o depodaki anahtar */
const store = (env, bucket) => env[BUCKETS[bucket].r2];
/* Okuma: önce bölümün deposu, yoksa geçiş dönemi için eski ortak depo */
async function r2get(env, bucket, path, opts) {
  const o = await store(env, bucket).get(path, opts);
  if (o || !env.LEGACY) return o;
  return env.LEGACY.get(bucket + "/" + path, opts);
}
async function r2head(env, bucket, path) {
  const o = await store(env, bucket).head(path);
  if (o || !env.LEGACY) return o;
  return env.LEGACY.head(bucket + "/" + path);
}
const PATH_RE = /^[A-Za-z0-9][A-Za-z0-9._\-\/]{0,299}$/;
const ALLOWED_ORIGINS = ["https://neardiji.com", "https://www.neardiji.com"];
/* Önbellekten parça (Range) verilecek en büyük dosya; video arka planları bu sınırın altında */
const RANGE_FROM_CACHE_MAX = 25 * 1024 * 1024;
const TR_LANGS = { en: "en", ar: "ar" };
const TR_MAX = 600;

function cors(req) {
  const o = req.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, DELETE, POST, OPTIONS",
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

/* Oturum anahtarının geçerli bir Supabase kullanıcısına ait olduğunu doğrular (isolate içinde 5 dk önbellek) */
const userCache = new Map();
async function sessionUser(env, auth) {
  if (!/^Bearer [A-Za-z0-9._-]{20,}$/.test(auth || "")) return null;
  const hit = userCache.get(auth);
  if (hit && hit.t > Date.now()) return hit.id;
  const r = await fetch(env.SUPABASE_URL + "/auth/v1/user", { headers: { apikey: env.SUPABASE_KEY, Authorization: auth } });
  if (!r.ok) return null;
  const u = await r.json().catch(() => null);
  if (!u || !u.id) return null;
  if (userCache.size > 500) userCache.clear();
  userCache.set(auth, { id: u.id, t: Date.now() + 5 * 60 * 1000 });
  return u.id;
}

/* Kullanıcı başına dakikada 120 çeviri (isolate içi, kaba sınır) */
const trHits = new Map();
function trAllowed(id) {
  const now = Date.now(), w = trHits.get(id);
  if (!w || w.t < now) { trHits.set(id, { n: 1, t: now + 60000 }); return true; }
  return ++w.n <= 120;
}

async function translate(req, env) {
  if (!env.AI) return json(req, 503, { error: "Çeviri servisi kapalı." });
  const uid = await sessionUser(env, req.headers.get("Authorization"));
  if (!uid) return json(req, 401, { error: "Giriş yapmalısınız." });
  if (!trAllowed(uid)) return json(req, 429, { error: "Çok fazla çeviri isteği. Biraz bekleyin." });
  const body = await req.json().catch(() => null);
  const text = String(body?.text || "").trim();
  const target = TR_LANGS[body?.target];
  if (!text || !target) return json(req, 400, { error: "Metin veya dil eksik." });
  if (text.length > TR_MAX) return json(req, 413, { error: "Metin çok uzun (en fazla " + TR_MAX + " karakter)." });
  const lang = target === "ar" ? "Arabic" : "English";
  const system =
    "You translate Turkish restaurant, cafe and furniture catalog text into " + lang + ". " +
    "Keep well-known Turkish dish names (gözleme, köfte, lahmacun, mantı, ayran, simit, künefe, baklava, döner, pide, kaymak) " +
    "as transliterated names. Use natural menu wording. Keep numbers, units and brand names unchanged. " +
    (target === "ar" ? "Write everything in Arabic script except brand names and units. " : "") +
    "Reply with ONLY the translation, no quotes, notes or extra lines.";
  try {
    const out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [{ role: "system", content: system }, { role: "user", content: text }],
      max_tokens: Math.min(400, text.length * 3 + 40), temperature: 0
    });
    const t = String(out?.response || "").trim().replace(/^["'“”«»]+|["'“”«»]+$/g, "").trim();
    /* Bozuk çıktıyı reddet: boş, çok uzun, kaynak tek satırken çok satır, Kiril harf,
       Arapçada çok fazla Latin harf. İstemci bu durumda yedek servise geçer. */
    const latin = (t.match(/[A-Za-zÇĞİÖŞÜçğıöşü]/g) || []).length;
    const bad = !t || t.length > text.length * 4 + 40 || (!/\n/.test(text) && /\n/.test(t)) || /[\u0400-\u04FF]/.test(t) ||
      (target === "ar" && latin > Math.max(6, t.length * 0.3));
    if (bad) return json(req, 502, { error: "Çeviri alınamadı." });
    return json(req, 200, { text: t });
  } catch (e) {
    return json(req, 502, { error: "Çeviri alınamadı." });
  }
}

/* Parça isteği: dosyanın tamamı önbellekten (yoksa R2'den bir kez alınıp önbelleğe yazılır) kesilir.
   Böylece video her oynatmada R2'ye gitmez. Büyük dosyada null döner, normal R2 parça okuması yapılır. */
async function rangeFromCache(req, env, ctx, bucket, path, cacheKey) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("Range") || "");
  if (!m || (m[1] === "" && m[2] === "")) return null;
  let hit = await caches.default.match(cacheKey);
  if (!hit) {
    const head = await r2head(env, bucket, path);
    if (!head || head.size > RANGE_FROM_CACHE_MAX) return null;
    const obj = await r2get(env, bucket, path);
    if (!obj) return null;
    const kayit = new Headers();
    obj.writeHttpMetadata(kayit);
    kayit.set("ETag", obj.httpEtag);
    kayit.set("Cache-Control", "public, max-age=31536000, immutable");
    kayit.set("Accept-Ranges", "bytes");
    kayit.set("X-Content-Type-Options", "nosniff");
    kayit.set("Content-Length", String(obj.size));
    const buf = await obj.arrayBuffer();
    ctx.waitUntil(caches.default.put(cacheKey, new Response(buf, { status: 200, headers: kayit })));
    hit = new Response(buf, { status: 200, headers: kayit });
  }
  const size = Number(hit.headers.get("Content-Length") || 0);
  if (!size || size > RANGE_FROM_CACHE_MAX) return null;
  let start, end;
  if (m[1] === "") { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1); }
  const h = new Headers(hit.headers);
  for (const [k, v] of Object.entries(cors(req))) h.set(k, v);
  h.set("X-Cache", "HIT");
  if (start >= size || start > end) {
    h.set("Content-Range", "bytes */" + size);
    h.delete("Content-Length");
    return new Response(null, { status: 416, headers: h });
  }
  const buf = await hit.arrayBuffer();
  h.set("Content-Range", `bytes ${start}-${end}/${size}`);
  h.set("Content-Length", String(end - start + 1));
  return new Response(req.method === "HEAD" ? null : buf.slice(start, end + 1), { status: 206, headers: h });
}

async function deleteFolder(env, bucket, folder) {
  let n = 0;
  for (const [r2, prefix] of [[store(env, bucket), folder + "/"], [env.LEGACY, bucket + "/" + folder + "/"]]) {
    if (!r2) continue;
    let cursor;
    do {
      const list = await r2.list({ prefix, cursor, limit: 1000 });
      const keys = list.objects.map(o => o.key);
      if (keys.length) { await r2.delete(keys); n += keys.length; }
      cursor = list.truncated ? list.cursor : undefined;
    } while (cursor);
  }
  return n;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    if (url.pathname === "/translate") {
      return req.method === "POST" ? translate(req, env) : json(req, 405, { error: "Yöntem desteklenmiyor" });
    }

    /* Klasör silme: /<bucket>/<uuid>/ (firma silinince tüm dosyaları) */
    const folder = /^\/([a-z-]+)\/([0-9a-f-]{36})\/$/.exec(url.pathname);
    if (folder && req.method === "DELETE" && BUCKETS[folder[1]]) {
      if (!(await canWrite(env, req.headers.get("Authorization"), folder[1], folder[2] + "/x"))) return json(req, 403, { error: "Bu klasörü silmeye yetkiniz yok." });
      return json(req, 200, { ok: true, deleted: await deleteFolder(env, folder[1], folder[2]) });
    }

    const parts = url.pathname.replace(/^\/+/, "").split("/");
    const bucket = parts.shift();
    let path = "";
    try { path = parts.map(decodeURIComponent).join("/"); } catch (e) { return json(req, 400, { error: "Geçersiz yol" }); }
    const rule = BUCKETS[bucket];
    if (!rule || !PATH_RE.test(path) || path.includes("..")) return json(req, 404, { error: "Bulunamadı" });
    const key = bucket + "/" + path;

    if (req.method === "GET" || req.method === "HEAD") {
      /* Kenar önbelleği: tam dosya istekleri en yakın Cloudflare noktasından döner (R2'ye gitmez) */
      const plain = req.method === "GET" && !req.headers.has("Range") && !req.headers.has("If-None-Match");
      const cacheKey = new Request(url.origin + url.pathname, { method: "GET" });
      if (req.headers.has("Range") && !req.headers.has("If-Range")) {
        const part = await rangeFromCache(req, env, ctx, bucket, path, cacheKey);
        if (part) return part;
      }
      if (plain) {
        const hit = await caches.default.match(cacheKey);
        if (hit) {
          const h = new Headers(hit.headers);
          for (const [k, v] of Object.entries(cors(req))) h.set(k, v);
          h.set("X-Cache", "HIT");
          return new Response(hit.body, { status: hit.status, headers: h });
        }
      }
      const obj = await r2get(env, bucket, path, { range: req.headers, onlyIf: req.headers });
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
      if (plain && status === 200) {
        const [a, b] = obj.body.tee();
        const kayit = new Headers(h);
        for (const k of Object.keys(cors(req))) kayit.delete(k);
        ctx.waitUntil(caches.default.put(cacheKey, new Response(b, { status: 200, headers: kayit })));
        h.set("X-Cache", "MISS");
        return new Response(a, { status, headers: h });
      }
      return new Response(req.method === "HEAD" ? null : obj.body, { status, headers: h });
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const auth = req.headers.get("Authorization");
      if (!(await canWrite(env, auth, bucket, path))) return json(req, 403, { error: "Bu dosyayı yüklemeye / silmeye yetkiniz yok." });
      const cacheKey = new Request(url.origin + url.pathname, { method: "GET" });
      if (req.method === "DELETE") {
        await store(env, bucket).delete(path);
        if (env.LEGACY) await env.LEGACY.delete(key);
        ctx.waitUntil(caches.default.delete(cacheKey)); return json(req, 200, { ok: true });
      }

      const type = (req.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
      if (!rule.types.includes(type)) return json(req, 415, { error: "Bu dosya türü desteklenmiyor: " + (type || "bilinmiyor") });
      const len = Number(req.headers.get("Content-Length") || 0);
      if (!len) return json(req, 411, { error: "Dosya boyutu bildirilmedi." });
      if (len > rule.max) return json(req, 413, { error: "Dosya çok büyük (en fazla " + Math.round(rule.max / 1048576) + " MB)." });
      await store(env, bucket).put(path, req.body, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
      ctx.waitUntil(caches.default.delete(cacheKey)); /* aynı ada yeniden yükleme (upsert) eski önbelleği bozmasın */
      return json(req, 200, { ok: true, url: "https://media.neardiji.com/" + key });
    }

    return json(req, 405, { error: "Yöntem desteklenmiyor" });
  },
};
