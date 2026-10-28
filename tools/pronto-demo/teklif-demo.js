/* =====================================================================
   PRONTO Teklif · NEAR DEMO KATMANI
   Uygulamanın tanımlarından SONRA, boot()'tan ÖNCE yüklenir.
   Gerçek sunucuya hiçbir istek gitmez: oturum, senkron ve sunucu
   fonksiyonları tarayıcı içinde taklit edilir. Veriler yalnız bu
   tarayıcının önbelleğinde (IndexedDB) kalır; "Sıfırla" ilk hâline döndürür.
   ===================================================================== */
(function () {
  'use strict';
  const DEMO_V = 2;                       /* örnek veri değişince artır: eski demo verisi silinip yeniden kurulur */
  const KAPALI = 'Bu işlem demo sürümünde kapalı.';
  const IMG = window.NEAR_DEMO_IMG || {};
  const bekle = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- oturum: her zaman açık ---------- */
  const OTURUM = { access_token: 'demo', refresh_token: 'demo', expires_at: Date.now() + 10 * 365 * 864e5 };
  Auth.s = OTURUM;
  Auth.save = function (s) { this.s = s || OTURUM; };
  Auth.token = async () => 'demo';
  Auth.refresh = async () => {};
  Auth.login = async () => {};
  Auth.changePassword = async () => { throw new Error(KAPALI); };
  Auth.logoutOthers = async () => { throw new Error(KAPALI); };
  Auth.logout = async () => {};
  checkPassword = async () => ({ ok: true });
  openSettings = function () { if (state.view === 'ayarlar') return; state.settingsOk = true; go('ayarlar', { sec: 'genel' }); };
  A.logout = async () => toast('Demo sürümünde çıkış yapılmaz. Verileri ilk hâline döndürmek için alttaki “Sıfırla”yı kullanın.', 'ok', 6000);

  /* ---------- canlı kanal ve senkron: ağ yok ---------- */
  RT.start = function () { this.want = true; this.joined = true; setSync(); };
  RT.stop = function () {};
  RT.connect = function () {};
  RT.broadcast = function () {};
  RT.setToken = function () {};
  Sync.last = new Date().toISOString(); Local.set('last_sync', Sync.last);
  Sync.online = true;
  Sync.flush = async function () {
    /* satırlar kuyruğa girerken cihaz önbelleğine zaten yazıldı; "gönderildi" say */
    for (const o of [...this.outbox.values()]) { this.outbox.delete(o.k); idbTx('outbox', s => s.delete(o.k)).catch(() => {}); }
    setSync();
  };
  Sync.delta = async () => false;
  setSync = function () {
    for (const el of [$('#sync'), $('#sync2')]) { if (!el) continue; el.className = 'sync on'; mount(el, html`<i></i><span>Demo</span>`); }
  };

  const P = window.ProntoDemo;
  const SIPARIS_URL = '/pronto/siparis/';

  /* Sipariş Takibi'nin yazdığı "siparis" satırları (yalnız bu cihazın önbelleği) */
  function uzakYaz(tbl, id, data) {
    if (data == null) { if (!mem(tbl).has(id)) return false; mem(tbl).delete(id); idbTx('rows', s => s.delete(kOf(tbl, id))).catch(() => {}); }
    else { if (JSON.stringify(mem(tbl).get(id)) === JSON.stringify(data)) return false; mem(tbl).set(id, data); idbTx('rows', s => s.put({ k: kOf(tbl, id), tbl, id, data })).catch(() => {}); }
    tableRegistry.get(tbl)?.invalidate();
    return true;
  }

  /* Ortak depodaki siparişlerden Teklif'teki durumları hesapla (Sipariş Takibi'nde yapılan her değişiklik buraya yansır) */
  let esitlemeIlk = true;
  function siparisleriEsitle() {
    let degisti = false;
    for (const t of DB.teklif.all()) {
      degisti = uzakYaz('siparis', t.id, P.teklifSiparisDurumu(t.id)) || degisti;
      /* silme talebi Sipariş Takibi'nde onaylandıysa teklif çöp kutusuna gider */
      const sil = P.tablo('pronto_gelen').filter(g => g.teklif_id === t.id && g.tur === 'silme' && g.durum === 'onaylandi').pop();
      if (sil && !t.deletedAt && !t._silOnay) { DB.teklif.upsert({ ...t, deletedAt: Date.now(), silen: 'SİPARİŞ TAKİBİ' }); degisti = true;
        if (!esitlemeIlk) toast(`Sipariş ${t.no} silme talebi Sipariş Takibi'nde onaylandı; Geri Dönüşüm Kutusu'na taşındı.`, 'ok', 6000); }
    }
    esitlemeIlk = false;
    if (degisti) remoteChanged();
  }

  /* Sipariş Takibi'nin okuduğu teklif özeti (ödeme / kalan, notlar) */
  function ozetYaz(t) {
    if (!t) return;
    const pays = DB.odeme.all().filter(o => o.teklifId === t.id), c = calc(t, pays);
    const row = { id: t.id, no: t.no, doviz: t.doviz, genel: c.genel, alinan: c.pes, kalan: c.kalan, genel_not: t.genelNot || '', ic_not: t.icNot || '', silindi: !!t.deletedAt };
    const eski = P.bul('teklif_ozet', t.id);
    if (!eski) P.ekle('teklif_ozet', row);
    else if (JSON.stringify({ ...eski, created_at: 0, updated_at: 0 }) !== JSON.stringify({ ...eski, ...row, created_at: 0, updated_at: 0 })) P.guncelle('teklif_ozet', t.id, row);
  }
  /* Teklif'teki katalog (ürünler + model fotoğrafları) Sipariş Takibi'nin kataloğudur */
  function katalogYaz(tbl, id, data) {
    if (tbl === 'urunler') {
      const row = data && { id, kod: data.kod, kategori: data.kategori, model: data.model, modul: data.modul || '', olcu: data.olcu || '', renk: data.renk || '', yon: data.yon || '', fiyat: data.fiyat, doviz: data.doviz };
      if (!row) P.sil('katalog', id); else if (P.bul('katalog', id)) P.guncelle('katalog', id, row); else P.ekle('katalog', row);
    } else if (tbl === 'photo' && id !== 'logo' && !String(id).startsWith('offer|')) {
      if (!data) P.sil('katalog_foto', id);
      else { const row = { id, v: data.v, gorsel: '', at: Date.now() }; P.bul('katalog_foto', id) ? P.guncelle('katalog_foto', id, row) : P.ekle('katalog_foto', row); }
    }
  }
  const ilkPut = Sync.put, ilkDel = Sync.del;
  Sync.put = function (tbl, id, data) {
    ilkPut.call(this, tbl, id, data);
    if (tbl === 'teklifler') ozetYaz(data);
    else if (tbl === 'odemeler') ozetYaz(DB.teklif.find(data.teklifId));
    else if (tbl === 'urunler' || tbl === 'photo') katalogYaz(tbl, id, data);
  };
  Sync.del = function (tbl, id) {
    const eski = mem(tbl).get(id);
    ilkDel.call(this, tbl, id);
    if (tbl === 'odemeler' && eski) ozetYaz(DB.teklif.find(eski.teklifId));
    else if (tbl === 'urunler' || tbl === 'photo') katalogYaz(tbl, id, null);
  };
  P.dinle(e => { if (e.tablo === 'orders' || e.tablo === 'pronto_gelen') siparisleriEsitle(); });

  /* ---------- sayaçlar ---------- */
  function sira(ad) { const s = Local.get('demo_seq', {}); s[ad] = (s[ad] || 0) + 1; Local.set('demo_seq', s); return s[ad]; }

  /* ---------- sunucu fonksiyonları ---------- */
  api = async function (path, { body } = {}) {
    await bekle(150);
    const fn = String(path).startsWith('rpc/') ? path.slice(4) : '';
    if (fn === 'next_seq') return sira(body?.p_name || 'genel');
    if (fn === 'pronto_teklif_gonder') return siparisGonder(body?.p_teklif_id, body?.p_foto || {});
    if (fn === 'pronto_teklif_sil_iste') return silmeIste(body?.p_teklif_id, body?.p_neden || '');
    if (fn === 'pronto_cari_onizle') throw Object.assign(new Error('demo'), { code: 'P0002', status: 404 });
    throw Object.assign(new Error(KAPALI), { status: 403 });
  };

  function gelenVeri(t, foto, tur) {
    const c = t.cariSnap || DB.cari.find(t.cariId) || {};
    return { cari: { unvan: c.unvan, gsm: c.gsm, eposta: c.eposta, adres: c.adres, ilce: c.ilce, sehir: c.sehir, yetkili: c.yetkili },
      kalemler: (t.items || []).map(k => ({ uid: k.uid, kategori: k.kategori, model: k.model, modul: k.modul || '', urun: P.urunAdi(k), olcu: k.olcu || '', renk: k.renk || '', yon: k.yon || '', adet: +k.adet || 0, aciklama: k.aciklama || '', foto: foto[k.uid] || '' })),
      tarih: t.tarih, teslim: t.teslim, personel: t.personelAd || '', montaj: t.montaj, nakliye: t.nakliye, teslimYeri: t.teslimYeri,
      genel_not: t.genelNot || '', ic_not: t.icNot || '', tur };
  }
  /* Teklif → Sipariş Takibi: onay kutusuna düşer (yeni sipariş ya da güncelleme) */
  function siparisGonder(id, foto) {
    const t = DB.teklif.find(id); if (!t) throw new Error('Sipariş bulunamadı');
    const bagli = P.tablo('orders').some(o => o.teklif_id === id);
    const tur = bagli ? 'guncelleme' : 'yeni';
    const fotolar = {}; for (const k of Object.values(foto)) { const v = photoGet(k); if (v) fotolar[k] = v; }
    const veri = gelenVeri(t, foto, tur);
    const bekleyen = P.tablo('pronto_gelen').find(g => g.teklif_id === id && g.durum === 'bekliyor' && g.tur !== 'silme');
    const kisi = Local.get('kisi', '') || t.personelAd || '';
    if (bekleyen) P.guncelle('pronto_gelen', bekleyen.id, { tur, veri, fotolar, gonderen: kisi });
    else P.ekle('pronto_gelen', { teklif_id: id, teklif_no: t.no, tur, durum: 'bekliyor', veri, fotolar, gonderen: kisi });
    siparisleriEsitle();
    setTimeout(() => duyuru(`Sipariş ${t.no} Sipariş Takibi'nde onay bekliyor.`), 600);
    return { sonuc: bagli ? 'guncelleme_gonderildi' : 'gonderildi' };
  }
  function silmeIste(id, neden) {
    const t = DB.teklif.find(id); if (!t) throw new Error('Sipariş bulunamadı');
    const sip = P.tablo('orders').filter(o => o.teklif_id === id);
    const bekleyen = P.tablo('pronto_gelen').filter(g => g.teklif_id === id && g.durum === 'bekliyor');
    if (!sip.length) { bekleyen.forEach(g => P.guncelle('pronto_gelen', g.id, { durum: 'geri_cekildi' })); siparisleriEsitle(); return { sonuc: bekleyen.length ? 'geri_cekildi' : 'serbest' }; }
    if (bekleyen.some(g => g.tur === 'silme')) return { sonuc: 'zaten' };
    const c = t.cariSnap || {};
    P.ekle('pronto_gelen', { teklif_id: id, teklif_no: t.no, tur: 'silme', durum: 'bekliyor', gonderen: Local.get('kisi', ''),
      veri: { cari: { unvan: c.unvan }, personel: t.personelAd || '', neden, siparisler: sip.map(o => ({ id: o.id, urun: o.product, adet: o.quantity, durum: o.status, tedarikci: o.supplier })), tur: 'silme' } });
    siparisleriEsitle();
    setTimeout(() => duyuru(`Sipariş ${t.no} için silme talebi Sipariş Takibi'nde onay bekliyor.`), 600);
    return { sonuc: 'gonderildi' };
  }
  /* Sipariş Takibi demosuna yönlendiren kısa bildirim */
  function duyuru(metin) {
    $('.near-duyuru')?.remove();
    const el = document.createElement('div'); el.className = 'near-duyuru'; el.setAttribute('role', 'status');
    mount(el, html`<span>${metin}</span><a href="${SIPARIS_URL}" target="near-pronto-siparis">Sipariş Takibi'ni aç</a><button type="button" aria-label="Kapat">${I('x')}</button>`);
    el.querySelector('button').onclick = () => el.remove();
    document.body.appendChild(el); setTimeout(() => el.remove(), 9000);
  }

  /* ---------- örnek veriler (ortak senaryodan) ---------- */
  const zaman = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.getTime(); };

  function ornekVeri() {
    const rows = [];
    const ekle = (tbl, id, data) => { rows.push({ tbl, id, data }); return data; };

    const banka = { id: 'bk1', banka: 'DEMO BANK', unvan: 'NEAR DEMO MOBİLYA', iban: 'TR480009900000000012345678', doviz: 'TRY', tur: 'resmi',
      sube: 'MERKEZ', hesapNo: '12345678', not: '', varsayilan: true, aktif: true, created: zaman(120), updated: zaman(120) };
    ekle('meta', 'settings', { ...deep(DEF), firma: { ad: 'NEAR DEMO MOBİLYA', tel: '0 (224) 000 00 00', adres: 'İnegöl / Bursa', eposta: 'demo@neardiji.com' }, logoSize: 40, bankalar: [banka] });
    if (IMG.logo) ekle('photo', 'logo', { v: IMG.logo });

    const per = P.PERSONEL.map((ad, i) => ekle('personeller', 'pr' + (i + 1), { id: 'pr' + (i + 1), ad, created: zaman(120) }));
    const yon = ['Nakit', 'Havale', 'Kart', 'Çek'].map((ad, i) => ekle('odeme_yontemleri', 'oy' + (i + 1), { id: 'oy' + (i + 1), ad, aciklama: '', sira: i }));

    const C = {};
    for (const c of P.CARILER) {
      const d = { id: c.id, tur: c.tur, unvan: c.unvan, gsm: c.gsm, sabit: '', eposta: c.eposta, ulke: 'Türkiye', sehir: c.sehir, ilce: c.ilce, mahalle: c.mahalle, sokak: c.sokak, binaNo: c.binaNo,
        daireNo: '', pk: '', adresEk: '', vkn: '', vd: '', yetkili: c.yetkili, created: zaman(110) };
      d.adres = typeof trAdresMetni === 'function' ? trAdresMetni(d).slice(0, 250) : c.adres;
      C[c.id] = ekle('cariler', c.id, d);
    }
    const fotoYazildi = new Set();
    for (const u of P.URUNLER) {
      const { foto, ...d } = u;
      ekle('urunler', u.id, { ...d, created: zaman(115) });
      const k = trLower(u.kategori) + '|' + trLower(u.model);
      if (foto && IMG[foto] && !fotoYazildi.has(k)) { fotoYazildi.add(k); ekle('photo', k, { v: IMG[foto] }); }
    }
    for (const s of P.TEKLIFLER) {
      const c = C[s.cari], p = per[s.per];
      const t = {
        tarih: s.tarih, teslim: s.teslim, doviz: s.doviz, cariId: c.id, personelId: p.id, personelAd: p.ad,
        items: s.kalemler.map(k => ({ ...k })), iskontoTip: 'tutar', iskontoDeger: 0, iskontoTutar: s.iskonto || 0, pesinat: 0, pesinatTarih: '', kdv: s.kdv,
        bankalar: s.doviz === 'TRY' ? [bkKopya(banka)] : [], montaj: s.montaj, nakliye: s.nakliye, teslimYeri: s.teslimYeri, durum: 'Beklemede',
        id: s.id, no: s.no, created: zaman(s.gun), updated: zaman(s.gun),
        cariSnap: { unvan: c.unvan, gsm: c.gsm, sabit: c.sabit, eposta: c.eposta, adres: c.adres, ilce: c.ilce, sehir: c.sehir, ulke: c.ulke, vkn: c.vkn, vd: c.vd, yetkili: c.yetkili },
        olusturan: p.ad, olusturanAt: zaman(s.gun), duzenleyen: p.ad, duzenleyenAt: zaman(s.gun)
      };
      if (s.proforma) Object.assign(t, { tur: 'proforma', pfDurum: 'acik', gecerlilik: isoOf(new Date(zaman(s.gun) + 15 * 864e5)) });
      if (s.genelNot) t.genelNot = s.genelNot;
      ekle('teklifler', t.id, t);
      for (const o of P.odemeleri(s)) ekle('odemeler', o.id, { id: o.id, teklifId: s.id, tarih: o.tarih, tutar: o.tutar, doviz: s.doviz, kur: 1, cevrilmis: o.tutar, yontemId: yon[o.yontem].id, aciklama: '', created: zaman(o.gun) });
    }
    Local.set('demo_seq', { teklif: 8, proforma: 1, urun: P.URUNLER.length });
    return rows;
  }

  async function kur() {
    const rows = ornekVeri();
    for (const t of Object.keys(MEM)) MEM[t].clear();
    await idbTx('rows', s => { s.clear(); for (const r of rows) s.put({ k: kOf(r.tbl, r.id), tbl: r.tbl, id: r.id, data: r.data }); });
    await idbTx('outbox', s => s.clear());
    Sync.outbox.clear();
    for (const r of rows) mem(r.tbl).set(r.id, r.data);
    for (const t of tableRegistry.values()) t.invalidate();
    Local.set('log', []);
    Local.set('kisi', 'AYŞE YILMAZ');
    Local.set('demo_v', DEMO_V + '.' + P.SURUM);
  }

  const ilkInit = Sync.init;
  Sync.init = async function () {
    await Promise.all([ilkInit.call(this), P.hazir()]);
    if (Local.get('demo_v', 0) !== DEMO_V + '.' + P.SURUM || !mem('teklifler').size) await kur();
    esitlemeIlk = true; siparisleriEsitle();
  };

  /* ---------- sıfırla (iki demo birlikte) ---------- */
  async function sifirla() {
    if (!await confirmBox({ title: 'Demoyu sıfırla', ok: 'Sıfırla', danger: true, body: html`<p style="margin-top:0">Bu tarayıcıda yaptığınız tüm değişiklikler silinir; PRONTO Teklif ve Sipariş Takibi demoları birlikte ilk hâline döner.</p>` })) return;
    await P.sifirla();
  }

  /* ---------- demo şeridi ---------- */
  const st = document.createElement('style');
  st.textContent = `
.near-demo{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;height:calc(40px + env(safe-area-inset-top));
 padding:env(safe-area-inset-top) max(10px,env(safe-area-inset-right)) 0 max(16px,env(safe-area-inset-left));background:#111110;color:#F1EFEA;
 font:700 12.5px/1.2 Manrope,Inter,system-ui,sans-serif;position:relative;z-index:9000}
.near-demo svg{width:16px;height:16px;flex:none}
.near-demo span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.near-demo span em{font-style:normal;opacity:.6;font-weight:500;margin-left:8px}
.near-demo button,.near-demo a{flex:none;display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;border:0;cursor:pointer;
 background:rgba(255,255,255,.12);color:inherit;font:inherit;text-decoration:none}
.near-demo button:hover,.near-demo a:hover{background:rgba(255,255,255,.22)}
@media(max-width:760px){.near-demo{gap:6px;font-size:12px}.near-demo span em{display:none}.near-demo button,.near-demo a{padding:0 10px}}
.app{height:calc(100% - 40px - env(safe-area-inset-top))!important}
@media print{.near-demo,.near-duyuru{display:none!important}}
.near-duyuru{position:fixed;right:16px;bottom:16px;z-index:9001;display:flex;align-items:center;gap:10px;max-width:min(460px,calc(100vw - 32px));padding:10px 8px 10px 16px;border-radius:16px;
 background:#111110;color:#F1EFEA;font:600 13px/1.35 Manrope,system-ui,sans-serif;box-shadow:0 18px 40px rgba(0,0,0,.3);animation:nearIn .35s ease}
.near-duyuru span{flex:1;min-width:0}.near-duyuru a{flex:none;display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:999px;background:#E6B22A;color:#1b1407;text-decoration:none;font-weight:800}
.near-duyuru button{flex:none;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:inherit;cursor:pointer;display:grid;place-items:center}
@keyframes nearIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media(max-width:900px){.near-duyuru{left:12px;right:12px;bottom:calc(96px + env(safe-area-inset-bottom));max-width:none}}
.brand img,.pin-card .pin-logo{filter:invert(1)}
[data-theme=dark] .cb-logo img{filter:invert(1)}`;
  document.head.appendChild(st);
  const bar = document.createElement('div'); bar.className = 'near-demo'; bar.setAttribute('role', 'note');
  mount(bar, html`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.5 20.5H3.5v-17h17v17L8.6 8.6" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
    <span>Demo<em>Örnek verilerle çalışır, değişiklikler bu tarayıcıda kalır.</em></span>
    <a href="/pronto/siparis/" target="near-pronto-siparis">Sipariş Takibi</a><button type="button" data-near-ayar>Ayarlar</button><button type="button" data-near-sifirla>Sıfırla</button>`);
  bar.querySelector('[data-near-sifirla]').addEventListener('click', sifirla);
  bar.querySelector('[data-near-ayar]').addEventListener('click', () => { if (!$('#main')) return; if (state.view === 'ayarlar') go('teklifler'); else openSettings(); });
  document.body.prepend(bar);

  /* ---------- rehberlik turu ---------- */
  let ornekId = null;
  const sayfa = v => ({ sayfa: v, git: () => { if (state.view !== v) go(v); } });
  const liste = sayfa('teklifler');
  const detay = { sayfa: 'teklifDetay', git: () => {
    if (state.view === 'teklifDetay') return;
    const r = document.querySelector('#tw .gonder-yok[data-id]') || document.querySelector('#tw [data-act=openTeklif][data-id]');
    ornekId = r ? r.dataset.id : ornekId;
    if (ornekId) go('teklifDetay', { id: ornekId });
  } };
  const dar = () => window.innerWidth <= 900;
  NearRehber.kur({
    anahtar: 'teklif',
    ad: 'PRONTO Teklif’e hoş geldiniz',
    metin: 'Teklif, proforma, müşteri ve tahsilat tek ekranda. 2 dakikalık turla her bölümü gösterelim.',
    maddeler: ['Proforma hazırla, müşteri onaylayınca tek tuşla siparişe çevir.', 'Ödemeleri, kalan tutarı ve IBAN mesajını buradan takip et.', 'Siparişi Sipariş Takibi’ne gönder, üretim durumu buraya geri gelsin.'],
    hazir: () => !!document.querySelector('#main #offerKpis, #main .page'),
    temizle: () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    son: () => { if (state.view !== 'teklifler') go('teklifler'); },
    adimlar: () => [
      { bolum: 'Genel', ...liste, sel: dar() ? '#cb' : '#nav', t: 'Bölümler', p: dar()
        ? 'Alttaki çubukla Siparişler, Müşteriler ve Ürünler arasında geçersiniz. Proformalar, Personeller ve Raporlar “Daha” menüsünde.'
        : 'Siparişler, Proformalar, Müşteriler, Personeller, Ürünler ve Raporlar burada. Sarı rozet cevap bekleyen proforma sayısıdır.' },
      { bolum: 'Siparişler', ...liste, sel: dar() ? '[data-act=cbYeni]' : '[data-act=newTeklif]', t: 'Yeni kayıt', p: 'Önce ne hazırladığınızı seçersiniz: müşteri henüz karar vermediyse Proforma, onayladıysa doğrudan Sipariş. Ürün, adet, iskonto, KDV ve döviz aynı formda.' },
      { bolum: 'Siparişler', ...liste, sel: '#pfBanner', t: 'Proformalar ayrı durur', p: 'Açık proformalar sipariş listesine ve toplamlara karışmaz. Bu şerit kaç proformanın cevap beklediğini gösterir; tek tuşla oraya geçersiniz.' },
      { bolum: 'Siparişler', ...liste, sel: '#offerKpis', t: 'Özet kartları', p: 'Toplam sipariş, bekleyen, üretimdeki ve toplam tutar. Kırmızı uyarı, Sipariş Takibi’ne henüz gönderilmemiş siparişleri sayar. Farklı dövizler ayrı ayrı toplanır.' },
      { bolum: 'Siparişler', ...liste, sel: '#q', t: 'Her alanda arama', p: 'Müşteri, sipariş no, ürün, personel veya tutar yazın; liste anında süzülür.' },
      { bolum: 'Siparişler', ...liste, sel: '#tahBtn', t: 'Tahsilat bekleyenler', p: 'Teslim tarihi geçmiş ya da teslim edilmiş ama ödemesi tamamlanmamış siparişleri tek dokunuşla listeler.' },
      { bolum: 'Siparişler', ...liste, sel: '[data-act=openFilter]', t: 'Filtre ve sıralama', p: 'Listeyi duruma ve diğer alanlara göre süzün; yanındaki düğmeyle sıralamayı değiştirin.' },
      { bolum: 'Siparişler', ...liste, sel: '#tw tr.gonder-yok, #tw .lcard.gonder-yok, #tw tbody tr, #tw .lcard', t: 'Sipariş satırı', p: 'Satıra dokununca detay açılır. Solda kırmızı çizgi olan siparişler henüz Sipariş Takibi’ne gönderilmemiştir. Sağdaki renkli etiket üretim durumudur.' },
      { bolum: 'Siparişler', ...liste, sel: '#tw [data-act=ibanWa]', t: 'WhatsApp ile ödeme hatırlatma', p: 'Kalan tutarı ve IBAN bilgisini hazır mesajla müşteriye WhatsApp’tan gönderir.' },
      { bolum: 'Siparişler', ...liste, sel: '#tw [data-act=rowMenu]', t: 'Hızlı işlemler', p: '⋯ menüsünden PDF, kopyalama, düzenleme, Sipariş Takibi’ne gönderme ve silme işlemlerine ulaşırsınız.' },
      { bolum: 'Sipariş detayı', ...detay, sel: '#main .card', t: 'Sipariş detayı', p: 'Müşteri bilgisi, sipariş ve teslim tarihleri, ödeme özeti tek sayfada. Ürünler ve Ödemeler sekmeleri aşağıda.' },
      { bolum: 'Sipariş detayı', ...detay, sel: '#main [data-act=addPay]', t: 'Ödeme ekle', p: 'Peşinat veya ara ödemeyi tutar, tarih ve yöntemle kaydedin. Kalan tutar ve tahsilat durumu kendiliğinden güncellenir.' },
      { bolum: 'Sipariş detayı', ...detay, sel: '#main [data-act=pdf]', t: 'PDF', p: 'Logolu, banka bilgili sipariş formunu PDF olarak indirir veya paylaşırsınız.' },
      { bolum: 'Sipariş detayı', ...detay, sel: '#main [data-act=sipGonder]', t: 'Sipariş Takibi’ne gönder', p: 'Sipariş, fotoğraflarıyla birlikte Sipariş Takibi’nin “Gelen Siparişler” kutusuna düşer. Orada onaylanınca durum buraya geri gelir: Onay Bekliyor → Beklemede → Üretimde → Teslim Edildi.' },
      { bolum: 'Proformalar', ...sayfa('proformalar'), sel: '#pfKpi', t: 'Proforma takibi', p: 'Açık, süresi dolan ve bu ay sonuçlanan proformalar ile olası tutar. Proformalar 15 gün geçerlidir; süresi yaklaşanlar öne çıkar.' },
      { bolum: 'Proformalar', ...sayfa('proformalar'), sel: '[data-act=pfKarar]', t: 'Müşteri cevabı', p: 'Müşteri onaylarsa tek tuşla siparişe dönüşür; vazgeçerse kaybedildi olarak işaretlenir. Hiçbir bilgiyi yeniden girmezsiniz.' },
      { bolum: 'Kayıtlar', ...sayfa('musteriler'), sel: '[data-act=newCari]', t: 'Müşteriler', p: 'Cari kartta ünvan, vergi bilgisi, telefon ve adres durur. Sipariş hazırlarken müşteriyi buradan seçersiniz, bilgileri yeniden yazmazsınız.' },
      { bolum: 'Kayıtlar', ...sayfa('personeller'), sel: '[data-act=newPers]', t: 'Personeller', p: 'Satış yapan personeli ekleyin; her siparişin kimden geldiği ve personel bazlı ciro raporlarda görünür.' },
      { bolum: 'Kayıtlar', ...sayfa('urunler'), sel: '[data-act=newUrun]', t: 'Ürünler', p: 'Kod, model, renk, fotoğraf ve fiyatla ürün kataloğu. Siparişe ürün eklerken buradan seçersiniz.' },
      { bolum: 'Kayıtlar', ...sayfa('urunler'), sel: '[data-act=katYonet]', t: 'Kategoriler', p: 'Ürünleri kategorilere ayırın; arama ve raporlar kategoriye göre de çalışır.' },
      { bolum: 'Raporlar', ...sayfa('raporlar'), sel: '#main .chip[data-act=repP]', t: 'Dönem seçimi', p: 'Bugün, bu hafta, bu ay, bu yıl ya da özel bir tarih aralığı seçin; tüm rapor buna göre hesaplanır.' },
      { bolum: 'Raporlar', ...sayfa('raporlar'), sel: '#main [data-act=repTab][data-k=genel]', t: 'Rapor sekmeleri', p: 'Sipariş, müşteri, personel, ürün, finansal özet ve tahsilat raporları. Excel ve PDF olarak dışa aktarılır.' },
      { bolum: 'Raporlar', ...sayfa('raporlar'), sel: '#main .card.graf', t: 'Ciro grafiği', p: 'Son 12 ayın sipariş ve tahsilat grafiği; en iyi ay ve geçen yılla karşılaştırma. TRY, USD ve EUR ayrı, resmi / gayri resmi ayrımıyla.' },
      { bolum: 'Ayarlar', ...liste, sel: '[data-near-ayar]', t: 'Firma ayarları', p: 'Firma bilgileri, logo, varsayılan döviz ve KDV, banka hesapları, ödeme yöntemleri ve PDF ayarları burada.' },
      { bolum: 'Bağlantı', ...liste, sel: '.near-demo a[href*="siparis"]', t: 'Sipariş Takibi', p: 'İki program birbirine bağlı. Sipariş Takibi’ni yeni sekmede açıp gönderdiğiniz siparişi orada onaylayın; durum değişikliği buraya anında yansır.' },
      { bolum: 'Bağlantı', ...liste, sel: '[data-near-rehber]', t: 'Rehber her zaman burada', p: 'Bu turu istediğiniz an buradan yeniden başlatırsınız. “Sıfırla” iki demoyu birlikte ilk hâline döndürür.' }
    ]
  });
})();
