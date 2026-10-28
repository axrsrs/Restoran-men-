/* =====================================================================
   PRONTO Sipariş Takibi · NEAR DEMO — tarayıcı içi "Supabase"
   Gerçek supabase-js yerine yüklenir; uygulamanın kullandığı kadarını
   (sorgu zinciri, sunucu fonksiyonları, fotoğraf deposu, oturum, canlı kanal)
   ortak demo deposu (ProntoDemo) üzerinde taklit eder. Ağa hiç çıkmaz.
   ===================================================================== */
(function () {
  'use strict';
  const P = window.ProntoDemo;
  const KAPALI = 'Bu işlem demo sürümünde kapalı.';
  const hata = (message, code) => ({ message, code: code || 'DEMO', details: '', hint: '' });
  const kopya = o => (o == null ? o : JSON.parse(JSON.stringify(o)));
  const bekle = ms => new Promise(r => setTimeout(r, ms));
  /* yalnız bu tablolar okunabilir; pronto_deletions yok sayılır (uygulama tam okuma yöntemine geçer) */
  const TABLOLAR = new Set(['orders', 'products', 'customers', 'suppliers', 'stock_movements', 'pronto_gelen', 'pronto_kisi', 'pronto_urun_tedarikci',
    'pronto_tedarikci_hafiza', 'pronto_cari_bag', 'pronto_satin_alma', 'pronto_stok', 'pronto_stok_hareket', 'pronto_stok_eski']);
  const ANA = new Set(['orders', 'products', 'customers', 'suppliers', 'stock_movements']);
  const kisi = () => String(window.__prontoKisi || '').trim();
  /* demoda çalışan adı hazır gelir (Ayarlar'dan değiştirilebilir) */
  try { if (!localStorage.getItem('pronto_kisi')) localStorage.setItem('pronto_kisi', JSON.stringify('BURAK ŞAHİN')); } catch (_) {}

  /* ---------- sütun seçimi: "a,b,takma:veri->x->>y", "*" ---------- */
  function secimCoz(s) {
    if (!s || s.trim() === '*') return null;
    return s.split(',').map(x => x.trim()).filter(Boolean).map(x => {
      let ad = x, yol = x;
      const i = x.indexOf(':'); if (i > 0 && !x.includes('::')) { ad = x.slice(0, i).trim(); yol = x.slice(i + 1).trim(); }
      const p = yol.split(/->>?/).map(z => z.trim());
      if (ad === yol) ad = p[p.length - 1];
      return { ad, p };
    });
  }
  const yansit = (r, sec) => {
    if (!sec) return kopya(r);
    const o = {};
    for (const { ad, p } of sec) { let v = r; for (const k of p) v = v == null ? undefined : v[k]; o[ad] = v === undefined ? null : kopya(v); }
    return o;
  };

  /* ---------- sorgu zinciri ---------- */
  class Sorgu {
    constructor(tablo) { this.t = tablo; this.f = []; this.sira = []; this.lim = null; this.ar = null; this.tek = 0; this.islem = 'select'; this.sec = null; this.don = false; }
    select(s) { if (this.islem === 'select') this.sec = secimCoz(s); else { this.don = true; this.sec = secimCoz(s); } return this; }
    insert(v) { this.islem = 'insert'; this.veri = v; return this; }
    update(v) { this.islem = 'update'; this.veri = v; return this; }
    upsert(v) { this.islem = 'upsert'; this.veri = v; return this; }
    delete() { this.islem = 'delete'; return this; }
    eq(k, v) { this.f.push(r => r[k] == v || String(r[k]) === String(v)); return this; }
    neq(k, v) { this.f.push(r => !(r[k] == v)); return this; }
    in(k, l) { const s = new Set((l || []).map(String)); this.f.push(r => s.has(String(r[k]))); return this; }
    gt(k, v) { this.f.push(r => r[k] != null && r[k] > v); return this; }
    gte(k, v) { this.f.push(r => r[k] != null && r[k] >= v); return this; }
    lt(k, v) { this.f.push(r => r[k] != null && r[k] < v); return this; }
    lte(k, v) { this.f.push(r => r[k] != null && r[k] <= v); return this; }
    is(k, v) { this.f.push(r => (v === null ? r[k] == null : r[k] === v)); return this; }
    match(o) { for (const [k, v] of Object.entries(o || {})) this.eq(k, v); return this; }
    order(k, o) { this.sira.push([k, !(o && o.ascending === false)]); return this; }
    limit(n) { this.lim = n; return this; }
    range(a, b) { this.ar = [a, b]; return this; }
    single() { this.tek = 1; return this; }
    maybeSingle() { this.tek = 2; return this; }
    abortSignal() { return this; }
    then(ok, no) { return this.calis().then(ok, no); }
    catch(no) { return this.calis().catch(no); }

    async calis() {
      await P.hazir(); await bekle(40);
      if (this.t === 'pronto_deletions') return { data: null, error: hata('relation "pronto_deletions" does not exist', '42P01') };
      if (!TABLOLAR.has(this.t)) return { data: null, error: hata('relation "' + this.t + '" does not exist', '42P01') };
      const tum = P.tablo(this.t);
      const uyan = r => this.f.every(f => f(r));
      let sonuc;
      if (this.islem === 'select') sonuc = tum.filter(uyan);
      else if (this.islem === 'insert') sonuc = [].concat(this.veri).map(v => P.ekle(this.t, temizle(this.t, v)));
      else if (this.islem === 'update') { sonuc = tum.filter(uyan).map(r => guncelle(this.t, r, this.veri)); }
      else if (this.islem === 'upsert') sonuc = [].concat(this.veri).map(v => { const r = v.id != null && P.bul(this.t, v.id); return r ? guncelle(this.t, r, v) : P.ekle(this.t, temizle(this.t, v)); });
      else if (this.islem === 'delete') { sonuc = tum.filter(uyan).map(r => P.sil(this.t, r.id)); }
      if (this.islem !== 'select' && !this.don) return { data: null, error: null, count: null };
      for (const [k, art] of this.sira.slice().reverse()) sonuc = sonuc.slice().sort((a, b) => { const x = a[k], y = b[k]; return (x == null ? -1 : y == null ? 1 : x < y ? -1 : x > y ? 1 : 0) * (art ? 1 : -1); });
      if (this.ar) sonuc = sonuc.slice(this.ar[0], this.ar[1] + 1);
      if (this.lim != null) sonuc = sonuc.slice(0, this.lim);
      const data = sonuc.map(r => yansit(r, this.sec));
      if (this.tek === 1) return data.length === 1 ? { data: data[0], error: null } : { data: null, error: hata('JSON object requested, multiple (or no) rows returned', 'PGRST116') };
      if (this.tek === 2) return { data: data[0] || null, error: null };
      return { data, error: null };
    }
  }
  const temizle = (t, v) => { const o = { ...v }; if (t !== 'pronto_urun_tedarikci') delete o.id; if (t === 'orders') { o.ssh = o.ssh ?? null; o.ssh_ana_id = o.ssh_ana_id ?? null; } return o; };
  /* sipariş değişince işlem geçmişi tutulur (sipariş detayında görünür) */
  const GECMIS_ALAN = { status: 'Durum', quantity: 'Adet', delivery_date: 'Teslim tarihi', supplier: 'Tedarikçi', customer: 'Müşteri', product: 'Ürün', color_code: 'Renk', order_date: 'Sipariş tarihi' };
  function guncelle(t, r, yama) {
    const y = { ...yama }; delete y.id;
    const yeni = P.guncelle(t, r.id, y);
    if (t === 'orders' && yeni) for (const [k, ad] of Object.entries(GECMIS_ALAN)) if (k in y && String(r[k] ?? '') !== String(y[k] ?? ''))
      P.ekle('gecmis', { order_id: r.id, zaman: new Date().toISOString(), kisi: kisi(), alan: ad, eski: r[k] == null || r[k] === '' ? null : String(r[k]), yeni: String(y[k] ?? '') });
    return yeni;
  }

  /* ---------- sunucu fonksiyonları ---------- */
  const bugun = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const RPC = {
    pronto_kisi_liste: () => [...new Set([...P.tablo('pronto_kisi').map(k => k.ad), ...P.PERSONEL])].sort((a, b) => a.localeCompare(b, 'tr')),
    pronto_kisi_ekle: ({ p_ad }) => { const ad = String(p_ad || '').replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR').trim().slice(0, 40); if (ad && !P.tablo('pronto_kisi').some(k => k.ad === ad)) P.ekle('pronto_kisi', { ad }); return { ad }; },
    pronto_gecmis_getir: ({ p_order_id }) => P.tablo('gecmis').filter(g => g.order_id === Number(p_order_id)).sort((a, b) => (a.zaman < b.zaman ? 1 : -1)).map(g => ({ zaman: g.zaman, kisi: g.kisi, alan: g.alan, eski: g.eski, yeni: g.yeni })),
    pronto_teklif_kalan: ({ p_teklif_id }) => { const o = P.bul('teklif_ozet', String(p_teklif_id)); return o ? { var: true, no: o.no, genel: o.genel, alinan: o.alinan, kalan: o.kalan, doviz: o.doviz, genel_not: o.genel_not, ic_not: o.ic_not } : { var: false }; },
    pronto_onay_onceki: ({ p_teklif_id }) => {
      const g = P.tablo('pronto_gelen').filter(x => x.teklif_id === String(p_teklif_id) && x.durum === 'onaylandi' && x.tur !== 'silme').pop();
      return g ? { var: true, ...kopya(g.veri) } : { var: false };
    },
    pronto_gelen_foto: ({ p_id }) => { const g = P.bul('pronto_gelen', Number(p_id)); return (g && g.fotolar) || {}; },
    pronto_eslesme_getir: ({ p_kalemler }) => {
      const L = P.tablo('pronto_urun_tedarikci'), o = {};
      for (const k of p_kalemler || []) {
        const ka = P.anahtar(k.kategori), mo = P.anahtar(k.model);
        const m = L.filter(x => x.kat_anahtar === ka && x.model_anahtar === mo).sort((a, b) => a.sira - b.sira);
        const c = L.filter(x => x.kat_anahtar === ka && !x.model_anahtar).sort((a, b) => a.sira - b.sira);
        const s = m[0] || c[0];
        o[k.uid] = { tedarikci: s ? s.tedarikci : '', kaynak: m[0] ? 'model' : c[0] ? 'kategori' : '', yedekler: (m.length ? m : c).slice(1).map(x => x.tedarikci) };
      }
      return o;
    },
    pronto_gelen_onayla: gelenOnayla,
    pronto_gelen_reddet: ({ p_id, p_not }) => {
      const g = P.bul('pronto_gelen', Number(p_id)); if (!g || g.durum !== 'bekliyor') throw hata('Bu kayıt artık onay beklemiyor.');
      P.guncelle('pronto_gelen', g.id, { durum: 'reddedildi', ret_notu: String(p_not || '').slice(0, 500), karar_veren: kisi() }); return { ok: true };
    },
    pronto_silme_onayla: ({ p_id }) => {
      const g = P.bul('pronto_gelen', Number(p_id)); if (!g || g.durum !== 'bekliyor') throw hata('Bu kayıt artık onay beklemiyor.');
      const orders = P.tablo('orders').filter(o => o.teklif_id === g.teklif_id && !['Teslim Edildi', 'İptal', 'SSH'].includes(o.status)).map(o => guncelle('orders', o, { status: 'İptal' }));
      P.guncelle('pronto_gelen', g.id, { durum: 'onaylandi', karar_veren: kisi() });
      const oz = P.bul('teklif_ozet', g.teklif_id); if (oz) P.guncelle('teklif_ozet', oz.id, { silindi: true });
      return { orders: kopya(orders) };
    },
    pronto_katalog_getir: () => ({
      urunler: P.tablo('katalog').map(u => ({ id: u.id, kategori: u.kategori, model: u.model, modul: u.modul, olcu: u.olcu, renk: u.renk, yon: u.yon, fiyat: u.fiyat, doviz: u.doviz, kod: u.kod })),
      fotolar: Object.fromEntries(P.tablo('katalog_foto').map(f => [f.id, f.at || 1])), silinen: [], silinen_foto: [], gizli: [], son: new Date().toISOString()
    }),
    pronto_katalog_foto: ({ p_keys }) => {
      const o = {}; for (const k of p_keys || []) { const f = P.bul('katalog_foto', k); const v = f && (f.v || P.gorsel(f.gorsel)); if (v) o[k] = { at: f.at || 1, v }; } return o;
    },
    pronto_iptal_stok_liste: () => [],
    pronto_eslesme_oneri: () => [],
    pronto_eslesme_kaydet: ({ p_kategori, p_model, p_tedarikciler }) => {
      const ka = P.anahtar(p_kategori), mo = P.anahtar(p_model || '');
      P.tablo('pronto_urun_tedarikci').filter(x => x.kat_anahtar === ka && x.model_anahtar === mo).forEach(x => P.sil('pronto_urun_tedarikci', x.id));
      (p_tedarikciler || []).forEach((t, i) => P.ekle('pronto_urun_tedarikci', { kategori: p_kategori, model: p_model || '', kat_anahtar: ka, model_anahtar: mo, tedarikci: t, sira: i }));
      return { ok: true };
    },
    pronto_eslesme_kaldir: ({ p_kategori, p_model }) => {
      const ka = P.anahtar(p_kategori), mo = P.anahtar(p_model || '');
      P.tablo('pronto_urun_tedarikci').filter(x => x.kat_anahtar === ka && x.model_anahtar === mo).forEach(x => P.sil('pronto_urun_tedarikci', x.id)); return { ok: true };
    }
  };

  /* Teklif'ten geleni onayla: yeni siparişler açılır / güncellemede değişenler yazılır, çıkanlar İptal olur */
  function gelenOnayla({ p_id, p_tedarikci, p_musteri_id, p_teslim, p_varsayilan }) {
    const g = P.bul('pronto_gelen', Number(p_id)); if (!g || g.durum !== 'bekliyor') throw hata('Bu kayıt artık onay beklemiyor.');
    const v = g.veri || {}, c = v.cari || {}, ted = p_tedarikci || {};
    const out = { orders: [] };
    /* müşteri */
    let mus = p_musteri_id ? P.bul('customers', Number(p_musteri_id)) : P.tablo('customers').find(x => P.anahtar(x.name) === P.anahtar(c.unvan));
    if (!mus) { mus = P.ekle('customers', { name: c.unvan || 'MÜŞTERİ', phone: c.gsm || '', email: c.eposta || '', tax_no: '', address: [c.adres, c.ilce, c.sehir].filter(Boolean).join(', '), notes: '' }); out.customer = kopya(mus); }
    /* tedarikçiler */
    const yeniTed = [];
    for (const ad of new Set(Object.values(ted).map(x => String(x).trim()).filter(Boolean)))
      if (!P.tablo('suppliers').some(s => P.anahtar(s.name) === P.anahtar(ad))) yeniTed.push(P.ekle('suppliers', { name: ad, phone: '', email: '', address: '', notes: '' }));
    if (yeniTed.length) out.suppliers = kopya(yeniTed);
    /* "bundan sonra varsayılan olsun" */
    for (const uid of Object.keys(p_varsayilan || {})) {
      const k = (v.kalemler || []).find(x => x.uid === uid); if (!k || !ted[uid]) continue;
      RPC.pronto_eslesme_kaydet({ p_kategori: k.kategori, p_model: k.model, p_tedarikciler: [ted[uid]] });
    }
    const eski = new Map(P.tablo('orders').filter(o => o.teklif_id === g.teklif_id && o.teklif_kalem).map(o => [o.teklif_kalem, o]));
    const uidler = new Set();
    for (const k of v.kalemler || []) {
      uidler.add(k.uid);
      const alan = { customer: mus.name, product: k.urun, quantity: Number(k.adet) || 0, delivery_date: p_teslim || v.teslim || null, color_code: k.renk || '',
        description: P.kalemAciklama(k), montaj: v.montaj || null, nakliye: v.nakliye || null, teslim_yeri: v.teslimYeri || null };
      const o = eski.get(k.uid);
      if (o) {
        const yama = {}; for (const [a, d] of Object.entries(alan)) if (String(o[a] ?? '') !== String(d ?? '')) yama[a] = d;
        if (ted[k.uid] && ted[k.uid] !== o.supplier) yama.supplier = ted[k.uid];
        const y = Object.keys(yama).length ? guncelle('orders', o, yama) : o;
        out.orders.push({ ...kopya(y), teklif_kalem: k.uid });
      } else {
        const y = P.ekle('orders', { ...alan, supplier: ted[k.uid] || '', order_date: bugun(), fabric_code: '', status: 'Beklemede', stock_deducted: false, stock_deducted_qty: 0,
          teklif_id: g.teklif_id, teklif_kalem: k.uid, ssh: null, ssh_ana_id: null });
        if (k.foto) { const f = (g.fotolar || {})[k.foto]; const kf = P.bul('katalog_foto', k.foto); const gorsel = kf && kf.gorsel; if (f || gorsel) P.ekle('dosyalar', { id: `orders/${y.id}/photo.jpg`, v: f || '', gorsel: f ? '' : gorsel }); }
        out.orders.push({ ...kopya(y), teklif_kalem: k.uid, _yeni: true });
      }
    }
    if (g.tur === 'guncelleme') for (const [uid, o] of eski) if (!uidler.has(uid) && !['Teslim Edildi', 'İptal', 'SSH'].includes(o.status))
      out.orders.push({ ...kopya(guncelle('orders', o, { status: 'İptal' })), teklif_kalem: uid, _iptal: true });
    P.guncelle('pronto_gelen', g.id, { durum: 'onaylandi', karar_veren: kisi() });
    return out;
  }

  /* ---------- fotoğraf deposu (sipariş fotoğrafları) ---------- */
  const dosyaOku = blob => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(r.error); r.readAsDataURL(blob); });
  const depo = {
    from() {
      return {
        async list(klasor, o) { await P.hazir(); const ad = (o && o.search) || ''; return { data: P.tablo('dosyalar').filter(d => d.id.startsWith(klasor + '/') && (!ad || d.id.endsWith('/' + ad))).map(d => ({ name: d.id.split('/').pop() })), error: null }; },
        async createSignedUrl(yol) { await P.hazir(); const d = P.bul('dosyalar', yol); const u = d && (d.v || P.gorsel(d.gorsel)); return u ? { data: { signedUrl: u }, error: null } : { data: null, error: hata('Object not found') }; },
        async upload(yol, blob) { await P.hazir(); const v = await dosyaOku(blob); P.bul('dosyalar', yol) ? P.guncelle('dosyalar', yol, { v, gorsel: '' }) : P.ekle('dosyalar', { id: yol, v, gorsel: '' }); return { data: { path: yol }, error: null }; },
        async remove(yollar) { await P.hazir(); for (const y of yollar || []) P.sil('dosyalar', y); return { data: [], error: null }; }
      };
    }
  };

  /* ---------- canlı kanal: başka sekmedeki değişiklikler ---------- */
  const kanallar = new Set();
  P.dinle(e => {
    if (!e.uzak) return;
    if (ANA.has(e.tablo)) for (const k of kanallar) for (const ol of e.olaylar) k.yay({ table: e.tablo, schema: 'public', eventType: ol.tur, new: ol.yeni ? kopya(ol.yeni) : {}, old: ol.eski ? kopya(ol.eski) : {} });
    if (e.tablo === 'pronto_gelen') {
      for (const ol of e.olaylar) if (ol.tur === 'INSERT' && ol.yeni && ol.yeni.durum === 'bekliyor') try { v98Duyur({ id: ol.yeni.id, teklif_no: ol.yeni.teklif_no, tur: ol.yeni.tur, musteri: (ol.yeni.veri && ol.yeni.veri.cari && ol.yeni.veri.cari.unvan) || '' }); } catch (_) {}
      try { v98Yukle(); } catch (_) {}
    }
    if (e.tablo === 'katalog' || e.tablo === 'katalog_foto') try { v25Geldi(); } catch (_) {}
  });
  function kanal() {
    const dinle = [];
    const k = {
      on(tur, filtre, cb) { if (tur === 'postgres_changes') dinle.push(cb); return k; },
      subscribe(cb) { kanallar.add(k); setTimeout(() => cb && cb('SUBSCRIBED'), 0); return k; },
      send() { return Promise.resolve('ok'); },
      unsubscribe() { kanallar.delete(k); return Promise.resolve('ok'); },
      yay(p) { dinle.forEach(f => { try { f(p); } catch (er) { console.warn(er); } }); }
    };
    return k;
  }

  /* ---------- oturum: her zaman açık ---------- */
  const OTURUM = { access_token: 'demo', refresh_token: 'demo', expires_at: Math.floor(Date.now() / 1000) + 10 * 365 * 86400, user: { id: 'demo', email: 'demo@neardiji.com' } };
  const auth = {
    getSession: async () => ({ data: { session: OTURUM }, error: null }),
    refreshSession: async () => ({ data: { session: OTURUM }, error: null }),
    signInWithPassword: async () => ({ data: { session: OTURUM }, error: null }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({ data: null, error: hata(KAPALI) }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
  };

  window.supabase = {
    createClient() {
      return {
        from: t => new Sorgu(t),
        rpc(ad, arg) {
          const p = (async () => {
            await P.hazir(); await bekle(80);
            const f = RPC[ad];
            if (!f) return { data: null, error: hata(KAPALI) };
            try { return { data: kopya(await f(arg || {})), error: null }; }
            catch (e) { return { data: null, error: e && e.message ? e : hata(String(e)) }; }
          })();
          return p;
        },
        storage: depo,
        auth,
        channel: () => kanal(),
        removeChannel: async k => { k && kanallar.delete(k); return 'ok'; },
        realtime: { setAuth: async () => {} }
      };
    }
  };
})();
