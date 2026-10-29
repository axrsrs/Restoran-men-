/* neardiji.com — statik sitenin önündeki küçük Worker.
   Tek işi: neardiji.com/xfirma adreslerini (müşteri menüleri) 404 yerine 200 ile sunmak ve
   arama motorları / WhatsApp önizlemesi için sayfanın <head>'ine restoranın kendi başlığını,
   açıklamasını, görselini ve schema.org Restaurant + Menu verisini yazmak.
   Menü uygulaması (menu/index.html) aynı kalır; veriyi yine tarayıcıda kendisi yükler.
   Diğer her istek olduğu gibi statik dosyalara gider. */

const ORIGIN = "https://neardiji.com";
const SB_URL = "https://rfwgjzkewtjpdcvrhepg.supabase.co";
const SB_KEY = "sb_publishable_ohHiomyazD8qr_mQXX9G-Q_DCEeD8j2"; /* herkese açık anahtar (sitede de var) */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/* yonlendir.js ile aynı liste + kök dosyalar: bunlar menü adresi sayılmaz */
const RESERVED = new Set(["menu", "821", "ammar", "ayse", "assets", "site", "katalog", "tools", "pronto", "index", "404", "worker"]);
const DEMO_SLUG = "nearmenu-demo";
const CACHE_TTL = 300; /* sn — panelde yapılan değişiklik en geç 5 dk'da önizlemelere yansır */

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    if ((req.method === "GET" || req.method === "HEAD") && parts.length === 1) {
      let raw = parts[0];
      try { raw = decodeURIComponent(raw); } catch (e) { raw = ""; }
      const slug = raw.toLowerCase();
      if (SLUG.test(slug) && !RESERVED.has(slug)) {
        /* tek adres: küçük harf, sonda / yok */
        if (raw !== slug || url.pathname.endsWith("/"))
          return Response.redirect(ORIGIN + "/" + slug + url.search, 301);
        const res = await menuPage(slug, req, env, ctx).catch(() => null);
        if (res) return res;
      }
    }
    return env.ASSETS.fetch(req); /* eşleşen dosya yoksa 404.html (eski yönlendirme davranışı) */
  }
};

async function menuPage(slug, req, env, ctx) {
  const info = await menuInfo(slug, ctx);
  if (info === null) return null; /* böyle bir menü yok → 404 */
  const shell = await env.ASSETS.fetch(new Request(new URL("/menu/", req.url), { headers: req.headers }));
  if (!shell.ok) return null;
  const headers = new Headers(shell.headers);
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  headers.delete("ETag");
  if (info && !info.active) headers.set("X-Robots-Tag", "noindex");
  if (req.method === "HEAD") return new Response(null, { status: 200, headers });
  const out = new Response(shell.body, { status: 200, headers });
  /* veritabanına ulaşılamadıysa menüyü yine aç, yalnız başlıklar varsayılan kalır */
  return info ? rewrite(out, info, slug) : out;
}

/* Supabase'ten menüyü al; kenar önbelleğinde 5 dk tut (her ziyaret veritabanına gitmez).
   Dönüş: bilgi nesnesi | null (menü yok) | undefined (veritabanına ulaşılamadı, önbelleğe yazılmaz) */
async function menuInfo(slug, ctx) {
  const cache = caches.default;
  const key = new Request(ORIGIN + "/__menu-meta/" + slug);
  const hit = await cache.match(key);
  if (hit) return hit.json();

  const call = (fn, body) => fetch(SB_URL + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: { apikey: SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(r => (r.ok ? r.json() : undefined), () => undefined);

  const [state, menu] = await Promise.all([
    call("tenant_state", { p_kind: "menu", p_slug: slug }),
    call("get_menu", { p_slug: slug })
  ]);
  if (state === undefined) return undefined;
  const info = state && state.name ? summarize(menu, state, slug) : null;
  ctx.waitUntil(cache.put(key, new Response(JSON.stringify(info), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=" + (info ? CACHE_TTL : 60) }
  })));
  return info;
}

function summarize(menu, state, slug) {
  const r = (menu && menu.restaurant) || {};
  const name = clean(r.name || state.name, 80);
  const active = state.state === "active";
  const cats = (Array.isArray(menu && menu.categories) ? menu.categories : []).filter(c => c && c.name);
  const sections = cats.map(c => ({
    name: clean(c.name, 80),
    items: (Array.isArray(c.items) ? c.items : []).filter(p => p && p.name && !p.sold).slice(0, 60).map(p => ({
      name: clean(p.name, 100),
      desc: clean(p.description, 200),
      price: typeof p.price === "number" && p.price > 0 ? p.price : null,
      image: httpsUrl(p.image)
    }))
  })).filter(s => s.items.length);

  const sub = clean(r.subtitle, 140);
  const catNames = sections.slice(0, 6).map(s => s.name).join(", ");
  let desc = name + " dijital menüsü" + (catNames ? ": " + catNames + "." : ".");
  if (sub) desc = sub.replace(/[.!…]*$/, ".") + " " + desc;
  desc += " Güncel ürünler ve fiyatlar.";

  const info0 = (r.settings && r.settings.info) || {};
  return {
    active,
    name,
    title: name + " • Dijital Menü",
    desc: clean(desc, 300),
    image: httpsUrl(r.logo),
    phone: clean(r.phone, 30),
    address: clean(info0.address || r.address, 200),
    week: Array.isArray(info0.week) && info0.weekOn ? info0.week : null,
    instagram: clean(info0.instagram, 80),
    currency: (r.settings && r.settings.pdf && /^[A-Z]{3}$/.test(r.settings.pdf.currency || "") ? r.settings.pdf.currency : "TRY"),
    sections
  };
}

function rewrite(res, info, slug) {
  const url = slug === DEMO_SLUG ? ORIGIN + "/menu/" : ORIGIN + "/" + slug;
  const image = info.image || ORIGIN + "/assets/og.jpg";
  const set = (sel, attr, val) => [sel, { element(e) { e.setAttribute(attr, val); } }];
  let rw = new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(info.title); } })
    .on(...set('meta[name="description"]', "content", info.desc))
    .on(...set('meta[property="og:title"]', "content", info.title))
    .on(...set('meta[property="og:description"]', "content", info.desc))
    .on(...set('meta[property="og:url"]', "content", url))
    .on(...set('meta[property="og:image"]', "content", image))
    .on(...set('meta[name="twitter:title"]', "content", info.title))
    .on(...set('meta[name="twitter:description"]', "content", info.desc))
    .on(...set('meta[name="twitter:image"]', "content", image))
    .on(...set('link[rel="canonical"]', "href", url))
    .on("head", {
      element(e) {
        e.append('<script type="application/ld+json">' + jsonLd(info, url) + "</script>", { html: true });
        if (!info.active) e.append('<meta name="robots" content="noindex">', { html: true });
      }
    });
  /* logo kareye yakın değilse büyük kart yerine küçük önizleme daha iyi görünür */
  if (info.image) rw = rw.on(...set('meta[name="twitter:card"]', "content", "summary"));
  return rw.transform(res);
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function jsonLd(info, url) {
  const d = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": url + "#restaurant",
    name: info.name,
    url,
    description: info.desc,
    hasMenu: {
      "@type": "Menu",
      name: info.name + " Menü",
      url,
      inLanguage: "tr",
      hasMenuSection: info.sections.map(s => ({
        "@type": "MenuSection",
        name: s.name,
        hasMenuItem: s.items.map(p => {
          const it = { "@type": "MenuItem", name: p.name };
          if (p.desc) it.description = p.desc;
          if (p.image) it.image = p.image;
          if (p.price != null) it.offers = { "@type": "Offer", price: p.price.toFixed(2), priceCurrency: info.currency };
          return it;
        })
      }))
    }
  };
  if (info.image) { d.image = info.image; d.logo = info.image; }
  if (info.phone) d.telephone = info.phone;
  if (info.address) d.address = info.address;
  if (info.instagram) {
    const ig = /^https?:/i.test(info.instagram) ? info.instagram : "https://www.instagram.com/" + info.instagram.replace(/^@/, "");
    if (/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._\/-]+$/.test(ig)) d.sameAs = [ig];
  }
  if (info.week && info.week.length === 7) {
    const hrs = info.week.map((w, i) => w && !w.off && /^\d\d:\d\d$/.test(w.o) && /^\d\d:\d\d$/.test(w.c)
      ? { "@type": "OpeningHoursSpecification", dayOfWeek: DAYS[i], opens: w.o, closes: w.c } : null).filter(Boolean);
    if (hrs.length) d.openingHoursSpecification = hrs;
  }
  /* </script> kaçışı: içerik müşteriden geldiği için şart */
  return JSON.stringify(d).replace(/</g, "\\u003c");
}

function clean(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
function httpsUrl(v) {
  v = String(v || "").trim();
  return /^https:\/\/[^\s"'<>]+$/i.test(v) ? v : "";
}
