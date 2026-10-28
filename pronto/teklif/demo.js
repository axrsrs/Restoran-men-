/* =====================================================================
   PRONTO Teklif · NEAR DEMO KATMANI
   Uygulamanın tanımlarından SONRA, boot()'tan ÖNCE yüklenir.
   Gerçek sunucuya hiçbir istek gitmez: oturum, senkron ve sunucu
   fonksiyonları tarayıcı içinde taklit edilir. Veriler yalnız bu
   tarayıcının önbelleğinde (IndexedDB) kalır; "Sıfırla" ilk hâline döndürür.
   ===================================================================== */
(function () {
  'use strict';
  const DEMO_V = 1;                       /* örnek veri değişince artır: eski demo verisi silinip yeniden kurulur */
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
  Sync.last = 'demo'; Local.set('last_sync', 'demo');
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

  /* Sipariş Takibi'nin yazdığı satırları taklit et (yalnız bu cihaz) */
  function uzakYaz(tbl, id, data) {
    mem(tbl).set(id, data);
    idbTx('rows', s => s.put({ k: kOf(tbl, id), tbl, id, data })).catch(() => {});
    tableRegistry.get(tbl)?.invalidate();
  }

  /* ---------- sayaçlar ---------- */
  function sira(ad) { const s = Local.get('demo_seq', {}); s[ad] = (s[ad] || 0) + 1; Local.set('demo_seq', s); return s[ad]; }

  /* ---------- sunucu fonksiyonları ---------- */
  api = async function (path, { body } = {}) {
    await bekle(150);
    const fn = String(path).startsWith('rpc/') ? path.slice(4) : '';
    if (fn === 'next_seq') return sira(body?.p_name || 'genel');
    if (fn === 'pronto_teklif_gonder') return siparisGonder(body?.p_teklif_id);
    if (fn === 'pronto_teklif_sil_iste') return { sonuc: 'serbest' };
    if (fn === 'pronto_cari_onizle') throw Object.assign(new Error('demo'), { code: 'P0002', status: 404 });
    throw Object.assign(new Error(KAPALI), { status: 403 });
  };

  /* Teklif Sipariş Takibi'ne gider; 3 sn sonra "onaylandı" olur ve kalemler sipariş numarası alır */
  function siparisGonder(id) {
    const t = DB.teklif.find(id); if (!t) throw new Error('Sipariş bulunamadı');
    const eski = mem('siparis').get(id);
    if (eski && eski.bag !== 'reddedildi') {
      const k = { ...(eski.kalemler || {}) }; let yeni = 0;
      for (const it of t.items || []) if (!k[it.uid]) { k[it.uid] = { no: sira('siparis_kalem'), durum: 'Beklemede' }; yeni++; }
      uzakYaz('siparis', id, { ...eski, kalemler: k }); remoteChanged();
      return { sonuc: yeni ? 'guncelleme_gonderildi' : 'degisiklik_yok' };
    }
    uzakYaz('siparis', id, { bag: 'bekliyor', kalemler: {} }); remoteChanged();
    setTimeout(() => {
      const g = DB.teklif.find(id); if (!g || mem('siparis').get(id)?.bag !== 'bekliyor') return;
      const k = {}; for (const it of g.items || []) k[it.uid] = { no: sira('siparis_kalem'), durum: 'Beklemede' };
      uzakYaz('siparis', id, { bag: 'onay', kalemler: k }); remoteChanged();
      toast(`Demo: Sipariş Takibi ${g.no} numaralı siparişi onayladı.`, 'ok', 5000);
    }, 3000);
    return { sonuc: 'gonderildi' };
  }

  /* ---------- örnek veriler ---------- */
  const gun = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
  const tarih = n => isoOf(gun(n));
  const zaman = n => gun(n).getTime();

  function ornekVeri() {
    const rows = [];
    const ekle = (tbl, id, data) => { rows.push({ tbl, id, data }); return data; };

    const banka = { id: 'bk1', banka: 'DEMO BANK', unvan: 'NEAR DEMO MOBİLYA', iban: 'TR480009900000000012345678', doviz: 'TRY', tur: 'resmi',
      sube: 'MERKEZ', hesapNo: '12345678', not: '', varsayilan: true, aktif: true, created: zaman(120), updated: zaman(120) };
    ekle('meta', 'settings', { ...deep(DEF), firma: { ad: 'NEAR DEMO MOBİLYA', tel: '0 (224) 000 00 00', adres: 'İnegöl / Bursa', eposta: 'demo@neardiji.com' }, logoSize: 40, bankalar: [banka] });
    if (IMG.logo) ekle('photo', 'logo', { v: IMG.logo });

    const per = ['AYŞE YILMAZ', 'MEHMET KAYA', 'ELİF DEMİR'].map((ad, i) => ekle('personeller', 'pr' + (i + 1), { id: 'pr' + (i + 1), ad, created: zaman(120) }));
    const yon = ['Nakit', 'Havale', 'Kart', 'Çek'].map((ad, i) => ekle('odeme_yontemleri', 'oy' + (i + 1), { id: 'oy' + (i + 1), ad, aciklama: '', sira: i }));

    const cari = (id, tur, unvan, gsm, eposta, sehir, ilce, mahalle, sokak, binaNo, yetkili) => {
      const d = { id, tur, unvan, gsm, sabit: '', eposta, ulke: 'Türkiye', sehir, ilce, mahalle, sokak, binaNo, daireNo: '', pk: '', adresEk: '', vkn: '', vd: '', yetkili, created: zaman(110) };
      d.adres = typeof trAdresMetni === 'function' ? trAdresMetni(d).slice(0, 250) : `${mahalle} MAH. ${sokak} NO:${binaNo} ${ilce}/${sehir}`;
      return ekle('cariler', id, d);
    };
    const C = {
      otel: cari('c1', 'Kurumsal', 'MAVİ OTEL İŞLETMELERİ A.Ş.', '0555 010 20 31', 'satinalma@ornek-otel.com', 'Antalya', 'MURATPAŞA', 'LARA', 'SAHİL CAD.', '12', 'BURAK ŞEN'),
      yapi: cari('c2', 'Kurumsal', 'ARDA YAPI İNŞAAT LTD. ŞTİ.', '0555 010 20 32', 'info@ornek-yapi.com', 'Bursa', 'NİLÜFER', 'ÖZLÜCE', 'GÜL SK.', '4', 'SELİN ARDA'),
      zeynep: cari('c3', 'Bireysel', 'ZEYNEP ÖZTÜRK', '0555 010 20 33', 'zeynep@ornek.com', 'İstanbul', 'KADIKÖY', 'MODA', 'BAHARİYE CAD.', '27', ''),
      kuzey: cari('c4', 'Bayi', 'KUZEY EV DEKORASYON', '0555 010 20 34', 'siparis@ornek-kuzey.com', 'Ankara', 'ÇANKAYA', 'KIZILAY', 'ATATÜRK BLV.', '88', 'ONUR KUZEY'),
      can: cari('c5', 'Bireysel', 'CAN AKSOY', '0555 010 20 35', 'can@ornek.com', 'İzmir', 'KARŞIYAKA', 'BOSTANLI', 'CEMAL GÜRSEL CAD.', '15', ''),
      nova: cari('c6', 'Kurumsal', 'NOVA YAZILIM TEKNOLOJİ A.Ş.', '0555 010 20 36', 'ofis@ornek-nova.com', 'İstanbul', 'ATAŞEHİR', 'BARBAROS', 'BEGONYA SK.', '3', 'DENİZ ER')
    };

    let un = 0;
    const urun = (kategori, model, modul, olcu, renk, yon_, fiyat, foto) => {
      un++; const id = 'u' + un;
      return ekle('urunler', id, { id, kod: 'UR-' + pad(un), kategori, model, modul, olcu, renk, yon: yon_, fiyat, doviz: 'TRY', created: zaman(115), _foto: foto });
    };
    const U = {
      luna3: urun('KANEPE', 'LUNA', "3'LÜ", '220 CM', 'YEŞİL KADİFE', '', 38500, 'kanepe_luna'),
      luna2: urun('KANEPE', 'LUNA', "2'Lİ", '170 CM', 'YEŞİL KADİFE', '', 31900, 'kanepe_luna'),
      milano3: urun('KANEPE', 'MİLANO', "3'LÜ", '230 CM', 'GRİ', '', 42750, 'kanepe_milano'),
      milanoK: urun('KANEPE', 'MİLANO', 'KÖŞE', '280X200 CM', 'GRİ', 'SAĞ', 58900, 'kanepe_milano'),
      sohoH: urun('BERJER', 'SOHO', 'TEKLİ', '80 CM', 'HARDAL', '', 14250, 'berjer'),
      sohoA: urun('BERJER', 'SOHO', 'TEKLİ', '80 CM', 'ANTRASİT', '', 14250, 'berjer'),
      noraB: urun('SANDALYE', 'NORA', '', '46X52 CM', 'BEYAZ', '', 3450, 'sandalye'),
      noraS: urun('SANDALYE', 'NORA', '', '46X52 CM', 'SİYAH', '', 3450, 'sandalye'),
      oslo: urun('TABURE', 'OSLO', '', '75 CM', 'DOĞAL MEŞE', '', 2150, 'tabure'),
      atlas120: urun('ÇALIŞMA MASASI', 'ATLAS', '', '120X60 CM', 'BEYAZ', '', 9800, 'masa'),
      atlas140: urun('ÇALIŞMA MASASI', 'ATLAS', '', '140X70 CM', 'BEYAZ', '', 11400, 'masa'),
      atlasL: urun('ÇALIŞMA MASASI', 'ATLAS', 'L', '160X140 CM', 'BEYAZ', 'SOL', 16900, 'masa'),
      arc: urun('AYDINLATMA', 'ARC', 'LAMBADER', '170 CM', 'ANTRASİT', '', 4650, 'lambader')
    };
    /* model fotoğrafları (kategori|model anahtarı, uygulamanın kendi biçimi) */
    const fotoYazildi = new Set();
    for (const r of rows) if (r.tbl === 'urunler') {
      const u = r.data, k = trLower(u.kategori) + '|' + trLower(u.model);
      if (u._foto && IMG[u._foto] && !fotoYazildi.has(k)) { fotoYazildi.add(k); ekle('photo', k, { v: IMG[u._foto] }); }
      delete u._foto;
    }

    let tn = 0, kalemNo = 0;
    const kalem = (u, adet, fiyat, aciklama = '') => ({ uid: uid(), urunId: u.id, kod: u.kod, kategori: u.kategori, model: u.model, modul: u.modul, olcu: u.olcu, renk: u.renk, yon: u.yon, fiyat: fiyat ?? u.fiyat, adet, aciklama });
    const teklif = (o) => {
      const c = o.cari, p = per[o.per || 0];
      const t = {
        tarih: tarih(o.gun), teslim: tarih(o.gun - (o.teslimGun || 30)), doviz: o.doviz || 'TRY', cariId: c.id, personelId: p.id, personelAd: p.ad,
        items: o.items, iskontoTip: 'tutar', iskontoDeger: 0, iskontoTutar: o.iskonto || 0, pesinat: 0, pesinatTarih: '', kdv: 10,
        bankalar: (o.doviz || 'TRY') === 'TRY' ? [bkKopya(banka)] : [], montaj: o.montaj || 'dahil', nakliye: o.nakliye || 'dahil', teslimYeri: 'adres', durum: 'Beklemede',
        id: 't' + (++tn), no: o.proforma ? 'P-' + pad(1, 4) : pad(tn), created: zaman(o.gun), updated: zaman(o.gun),
        cariSnap: { unvan: c.unvan, gsm: c.gsm, sabit: c.sabit, eposta: c.eposta, adres: c.adres, ilce: c.ilce, sehir: c.sehir, ulke: c.ulke, vkn: c.vkn, vd: c.vd, yetkili: c.yetkili },
        olusturan: p.ad, olusturanAt: zaman(o.gun), duzenleyen: p.ad, duzenleyenAt: zaman(o.gun)
      };
      if (o.proforma) Object.assign(t, { tur: 'proforma', pfDurum: 'acik', gecerlilik: isoOf(new Date(zaman(o.gun) + 15 * 864e5)) });
      if (o.genelNot) t.genelNot = o.genelNot;
      ekle('teklifler', t.id, t);
      if (o.sip) {
        if (o.sip === 'bekliyor') ekle('siparis', t.id, { bag: 'bekliyor', kalemler: {} });
        else { const k = {}; t.items.forEach((it, i) => { k[it.uid] = { no: ++kalemNo, durum: Array.isArray(o.sip) ? o.sip[i] : o.sip }; }); ekle('siparis', t.id, { bag: 'onay', kalemler: k }); }
      }
      const toplam = calc(t, []).genel;
      (o.odeme || []).forEach(([oran, gunSonra, yi], i) => {
        const tu = r2(toplam * oran);
        ekle('odemeler', t.id + 'o' + i, { id: t.id + 'o' + i, teklifId: t.id, tarih: tarih(Math.max(0, o.gun - gunSonra)), tutar: tu, doviz: t.doviz, kur: 1, cevrilmis: tu, yontemId: yon[yi].id, aciklama: '', created: zaman(Math.max(0, o.gun - gunSonra)) });
      });
      return t;
    };

    teklif({ cari: C.otel, gun: 78, per: 0, iskonto: 15000, items: [kalem(U.noraB, 40), kalem(U.atlas120, 12), kalem(U.arc, 12)], sip: 'Teslim Edildi', odeme: [[0.4, 0, 1], [0.6, 40, 1]], genelNot: 'TESLİMAT OTEL YÜK ASANSÖRÜNDEN YAPILACAKTIR.' });
    teklif({ cari: C.yapi, gun: 62, per: 1, items: [kalem(U.milanoK, 2), kalem(U.sohoA, 4)], sip: ['Teslim Edildi', 'Teslim Edildi'], odeme: [[0.5, 0, 1], [0.3, 30, 2]] });
    teklif({ cari: C.zeynep, gun: 44, per: 2, items: [kalem(U.luna3, 1), kalem(U.sohoH, 2), kalem(U.oslo, 4)], sip: ['Sevkiyata Hazır', 'Sevkiyata Hazır', 'Teslim Edildi'], odeme: [[0.3, 0, 2]] });
    teklif({ cari: C.nova, gun: 31, per: 0, iskonto: 20000, items: [kalem(U.atlasL, 8), kalem(U.atlas140, 10), kalem(U.noraS, 18)], sip: ['Üretimde', 'Üretimde', 'Sevkiyata Hazır'], odeme: [[0.5, 0, 1]] });
    teklif({ cari: C.kuzey, gun: 19, per: 1, iskonto: 12000, items: [kalem(U.luna2, 3, 28900), kalem(U.luna3, 3, 34900), kalem(U.milano3, 2, 38500)], sip: 'Beklemede', odeme: [[0.25, 0, 3]] });
    teklif({ cari: C.can, gun: 9, per: 2, montaj: 'haric', items: [kalem(U.milanoK, 1), kalem(U.arc, 1)], sip: 'bekliyor' });
    teklif({ cari: C.yapi, gun: 4, per: 1, items: [kalem(U.atlas120, 6), kalem(U.noraB, 6)] });
    teklif({ cari: C.otel, gun: 2, per: 0, doviz: 'EUR', items: [kalem(U.sohoH, 20, 295), kalem(U.oslo, 20, 45)] });
    teklif({ cari: C.nova, gun: 6, per: 0, proforma: true, items: [kalem(U.atlas140, 20, 10900)] });

    Local.set('demo_seq', { teklif: 8, proforma: 1, urun: un, siparis_kalem: kalemNo });
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
    Local.set('demo_v', DEMO_V);
  }

  const ilkInit = Sync.init;
  Sync.init = async function () {
    await ilkInit.call(this);
    if (Local.get('demo_v', 0) !== DEMO_V || !mem('teklifler').size) await kur();
  };

  /* ---------- sıfırla ---------- */
  async function sifirla() {
    if (!await confirmBox({ title: 'Demoyu sıfırla', ok: 'Sıfırla', danger: true, body: html`<p style="margin-top:0">Bu tarayıcıda yaptığınız tüm değişiklikler silinir ve demo ilk hâline döner.</p>` })) return;
    await kur();
    location.reload();
  }

  /* ---------- demo şeridi ---------- */
  const st = document.createElement('style');
  st.textContent = `
.near-demo{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9000;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 32px);
 padding:6px 6px 6px 14px;border-radius:999px;background:rgba(17,17,16,.92);color:#F1EFEA;font:600 12.5px/1.2 Manrope,system-ui,sans-serif;
 box-shadow:0 14px 34px rgba(0,0,0,.28);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.near-demo svg{width:16px;height:16px;flex:none}
.near-demo span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.near-demo span em{display:none;font-style:normal;opacity:.6;font-weight:500;margin-left:6px}
.near-demo button,.near-demo a{flex:none;display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border-radius:999px;border:0;cursor:pointer;
 background:rgba(255,255,255,.12);color:inherit;font:inherit;text-decoration:none}
.near-demo button:hover,.near-demo a:hover{background:rgba(255,255,255,.22)}
@media(min-width:1500px){.near-demo span em{display:inline}}
@media(max-width:900px){
 .near-demo{position:relative;left:auto;top:auto;transform:none;max-width:none;width:100%;box-sizing:border-box;border-radius:0;box-shadow:none;
  height:calc(40px + env(safe-area-inset-top));padding:env(safe-area-inset-top) 6px 0 14px;font-size:12px;gap:6px;background:#111110}
 .near-demo span{flex:1}
 .near-demo button,.near-demo a{min-height:30px;padding:0 11px}
 .app{height:calc(100% - 40px - env(safe-area-inset-top))!important}}
@media print{.near-demo{display:none!important}}
.brand img,.pin-card .pin-logo{filter:invert(1)}
[data-theme=dark] .cb-logo img{filter:invert(1)}`;
  document.head.appendChild(st);
  const bar = document.createElement('div'); bar.className = 'near-demo'; bar.setAttribute('role', 'note');
  mount(bar, html`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.5 20.5H3.5v-17h17v17L8.6 8.6" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
    <span>Demo<em>Örnek verilerle çalışır, değişiklikler bu tarayıcıda kalır.</em></span>
    <button type="button" data-near-ayar>Ayarlar</button><button type="button" data-near-sifirla>Sıfırla</button><a href="/#iletisim">İletişim</a>`);
  bar.querySelector('[data-near-sifirla]').addEventListener('click', sifirla);
  bar.querySelector('[data-near-ayar]').addEventListener('click', () => { if (!$('#main')) return; if (state.view === 'ayarlar') go('teklifler'); else openSettings(); });
  document.body.prepend(bar);
})();
