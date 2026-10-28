/* =====================================================================
   PRONTO DEMO · ORTAK DEPO (Teklif ↔ Sipariş Takibi)
   İki demo aynı sitede çalışır; bu dosya ikisinin ortak "sunucusu"dur.
   - Veriler bu tarayıcının IndexedDB'sinde (near_pronto_demo) tutulur
   - Bir sekmede yapılan değişiklik BroadcastChannel ile diğer sekmelere anında gider
   - Örnek senaryo (müşteriler, katalog, teklifler, siparişler) burada tanımlıdır;
     iki uygulama da aynı senaryodan beslenir, numaralar ve durumlar birbirini tutar.
   ===================================================================== */
(function () {
  'use strict';
  const SURUM = 1;                                   /* senaryo değişince artır: ortak depo yeniden kurulur */
  const DB_ADI = 'near_pronto_demo';
  const KANAL = 'near-pronto-demo';
  const IMG = window.NEAR_DEMO_IMG || {};

  /* ---------- yardımcılar ---------- */
  const r2 = n => Math.round((+n || 0) * 100) / 100;
  const pad = (n, l = 5) => String(n).padStart(l, '0');
  const gun = n => { const d = new Date(); d.setHours(10, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
  const iso = d => { d = new Date(d); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const tarih = n => iso(gun(n));
  const zamanIso = n => gun(n).toISOString();
  const kucuk = s => String(s ?? '').toLocaleLowerCase('tr-TR');
  const anahtar = s => String(s ?? '').replace(/\s+/g, ' ').trim().replace(/[İIı]/g, 'i').toLocaleLowerCase('tr-TR');
  const urunAdi = k => [k.kategori, k.model, k.modul].filter(Boolean).join(' ');
  const kalemAciklama = k => [k.olcu, k.yon && !/^(yok|—|-)$/i.test(k.yon) ? 'YÖN: ' + k.yon : '', k.aciklama].filter(Boolean).join(' · ');

  /* =====================================================================
     SENARYO
     ===================================================================== */
  const PERSONEL = ['AYŞE YILMAZ', 'MEHMET KAYA', 'ELİF DEMİR'];
  const CARILER = [
    { id: 'c1', tur: 'Kurumsal', unvan: 'MAVİ OTEL İŞLETMELERİ A.Ş.', gsm: '0555 010 20 31', eposta: 'satinalma@ornek-otel.com', sehir: 'Antalya', ilce: 'MURATPAŞA', mahalle: 'LARA', sokak: 'SAHİL CAD.', binaNo: '12', yetkili: 'BURAK ŞEN' },
    { id: 'c2', tur: 'Kurumsal', unvan: 'ARDA YAPI İNŞAAT LTD. ŞTİ.', gsm: '0555 010 20 32', eposta: 'info@ornek-yapi.com', sehir: 'Bursa', ilce: 'NİLÜFER', mahalle: 'ÖZLÜCE', sokak: 'GÜL SK.', binaNo: '4', yetkili: 'SELİN ARDA' },
    { id: 'c3', tur: 'Bireysel', unvan: 'ZEYNEP ÖZTÜRK', gsm: '0555 010 20 33', eposta: 'zeynep@ornek.com', sehir: 'İstanbul', ilce: 'KADIKÖY', mahalle: 'MODA', sokak: 'BAHARİYE CAD.', binaNo: '27', yetkili: '' },
    { id: 'c4', tur: 'Bayi', unvan: 'KUZEY EV DEKORASYON', gsm: '0555 010 20 34', eposta: 'siparis@ornek-kuzey.com', sehir: 'Ankara', ilce: 'ÇANKAYA', mahalle: 'KIZILAY', sokak: 'ATATÜRK BLV.', binaNo: '88', yetkili: 'ONUR KUZEY' },
    { id: 'c5', tur: 'Bireysel', unvan: 'CAN AKSOY', gsm: '0555 010 20 35', eposta: 'can@ornek.com', sehir: 'İzmir', ilce: 'KARŞIYAKA', mahalle: 'BOSTANLI', sokak: 'CEMAL GÜRSEL CAD.', binaNo: '15', yetkili: '' },
    { id: 'c6', tur: 'Kurumsal', unvan: 'NOVA YAZILIM TEKNOLOJİ A.Ş.', gsm: '0555 010 20 36', eposta: 'ofis@ornek-nova.com', sehir: 'İstanbul', ilce: 'ATAŞEHİR', mahalle: 'BARBAROS', sokak: 'BEGONYA SK.', binaNo: '3', yetkili: 'DENİZ ER' }
  ].map(c => ({ ...c, adres: [c.mahalle, c.sokak, c.binaNo && 'No:' + c.binaNo].filter(Boolean).join(' ') }));
  const URUNLER = [
    ['u1', 'KANEPE', 'LUNA', "3'LÜ", '220 CM', 'YEŞİL KADİFE', '', 38500, 'kanepe_luna'],
    ['u2', 'KANEPE', 'LUNA', "2'Lİ", '170 CM', 'YEŞİL KADİFE', '', 31900, 'kanepe_luna'],
    ['u3', 'KANEPE', 'MİLANO', "3'LÜ", '230 CM', 'GRİ', '', 42750, 'kanepe_milano'],
    ['u4', 'KANEPE', 'MİLANO', 'KÖŞE', '280X200 CM', 'GRİ', 'SAĞ', 58900, 'kanepe_milano'],
    ['u5', 'BERJER', 'SOHO', 'TEKLİ', '80 CM', 'HARDAL', '', 14250, 'berjer'],
    ['u6', 'BERJER', 'SOHO', 'TEKLİ', '80 CM', 'ANTRASİT', '', 14250, 'berjer'],
    ['u7', 'SANDALYE', 'NORA', '', '46X52 CM', 'BEYAZ', '', 3450, 'sandalye'],
    ['u8', 'SANDALYE', 'NORA', '', '46X52 CM', 'SİYAH', '', 3450, 'sandalye'],
    ['u9', 'TABURE', 'OSLO', '', '75 CM', 'DOĞAL MEŞE', '', 2150, 'tabure'],
    ['u10', 'ÇALIŞMA MASASI', 'ATLAS', '', '120X60 CM', 'BEYAZ', '', 9800, 'masa'],
    ['u11', 'ÇALIŞMA MASASI', 'ATLAS', '', '140X70 CM', 'BEYAZ', '', 11400, 'masa'],
    ['u12', 'ÇALIŞMA MASASI', 'ATLAS', 'L', '160X140 CM', 'BEYAZ', 'SOL', 16900, 'masa'],
    ['u13', 'AYDINLATMA', 'ARC', 'LAMBADER', '170 CM', 'ANTRASİT', '', 4650, 'lambader']
  ].map(([id, kategori, model, modul, olcu, renk, yon, fiyat, foto], i) => ({ id, kod: 'UR-' + pad(i + 1), kategori, model, modul, olcu, renk, yon, fiyat, doviz: 'TRY', foto }));
  const TEDARIKCI = { 'KANEPE': 'MERT DÖŞEME', 'BERJER': 'MERT DÖŞEME', 'SANDALYE': 'ÇELİK METAL', 'TABURE': 'AHŞAP SANAT', 'ÇALIŞMA MASASI': 'AHŞAP SANAT', 'AYDINLATMA': 'IŞIK AYDINLATMA' };
  const U = Object.fromEntries(URUNLER.map(u => [u.id, u]));

  /* teklifler: kalem = [ürün, adet, fiyat(boşsa liste)]; siparis = durum | durum listesi | 'bekliyor' | null */
  const TEKLIFLER = [
    { id: 't1', cari: 'c1', gun: 78, per: 0, iskonto: 15000, kalemler: [['u7', 40], ['u10', 12], ['u13', 12]], siparis: 'Teslim Edildi', odeme: [[0.4, 0, 1], [0.6, 40, 1]], genelNot: 'TESLİMAT OTEL YÜK ASANSÖRÜNDEN YAPILACAKTIR.' },
    { id: 't2', cari: 'c2', gun: 62, per: 1, kalemler: [['u4', 2], ['u6', 4]], siparis: 'Teslim Edildi', odeme: [[0.5, 0, 1], [0.3, 30, 2]] },
    { id: 't3', cari: 'c3', gun: 44, per: 2, kalemler: [['u1', 1], ['u5', 2], ['u9', 4]], siparis: ['Sevkiyata Hazır', 'Sevkiyata Hazır', 'Teslim Edildi'], odeme: [[0.3, 0, 2]] },
    { id: 't4', cari: 'c6', gun: 31, per: 0, iskonto: 20000, kalemler: [['u12', 8], ['u11', 10], ['u8', 18]], siparis: ['Üretimde', 'Üretimde', 'Sevkiyata Hazır'], odeme: [[0.5, 0, 1]] },
    { id: 't5', cari: 'c4', gun: 19, per: 1, iskonto: 12000, kalemler: [['u2', 3, 28900], ['u1', 3, 34900], ['u3', 2, 38500]], siparis: 'Beklemede', odeme: [[0.25, 0, 3]] },
    { id: 't6', cari: 'c5', gun: 9, per: 2, montaj: 'haric', kalemler: [['u4', 1], ['u13', 1]], siparis: 'bekliyor' },
    { id: 't7', cari: 'c2', gun: 4, per: 1, kalemler: [['u10', 6], ['u7', 6]] },
    { id: 't8', cari: 'c1', gun: 2, per: 0, doviz: 'EUR', kalemler: [['u5', 20, 295], ['u9', 20, 45]] },
    { id: 't9', cari: 'c6', gun: 6, per: 0, proforma: true, kalemler: [['u11', 20, 10900]] }
  ].map((t, i) => ({
    ...t, doviz: t.doviz || 'TRY', kdv: 10, montaj: t.montaj || 'dahil', nakliye: 'dahil', teslimYeri: 'adres',
    no: t.proforma ? 'P-0001' : pad(i + 1), tarih: tarih(t.gun), teslim: tarih(t.gun - 30), personel: PERSONEL[t.per],
    kalemler: t.kalemler.map(([u, adet, fiyat], j) => ({ uid: t.id + 'k' + (j + 1), urunId: u, kod: U[u].kod, kategori: U[u].kategori, model: U[u].model, modul: U[u].modul, olcu: U[u].olcu, renk: U[u].renk, yon: U[u].yon, fiyat: fiyat ?? U[u].fiyat, adet, aciklama: '' }))
  }));
  /* elle açılmış (teklifsiz) siparişler */
  const ELLE = [
    { musteri: 'YILDIZ KAFE', urun: 'U7', adet: 24, gun: 50, durum: 'Teslim Edildi' },
    { musteri: 'YILDIZ KAFE', urun: 'U9', adet: 12, gun: 50, durum: 'Teslim Edildi' },
    { musteri: 'ATLAS DANIŞMANLIK', urun: 'U11', adet: 6, gun: 15, durum: 'Üretimde' },
    { musteri: 'ATLAS DANIŞMANLIK', urun: 'U13', adet: 6, gun: 15, durum: 'Beklemede' }
  ];

  function hesap(t, odemeler) {
    const ana = r2(t.kalemler.reduce((a, k) => a + k.fiyat * k.adet, 0));
    const ara = r2(Math.max(0, ana - (t.iskonto || 0))), genel = r2(ara + ara * t.kdv / 100);
    const alinan = r2((odemeler || []).reduce((a, o) => a + o.tutar, 0));
    return { ana, ara, genel, alinan, kalan: r2(genel - alinan) };
  }
  const odemeleri = t => (t.odeme || []).map(([oran, gunSonra, yi], i) => {
    const genel = hesap(t, []).genel;
    return { id: t.id + 'o' + i, teklifId: t.id, tarih: tarih(Math.max(0, t.gun - gunSonra)), tutar: r2(genel * oran), yontem: yi, gun: Math.max(0, t.gun - gunSonra) };
  });
  const cariBul = id => CARILER.find(c => c.id === id);
  function gelenVeri(t, tur) {
    const c = cariBul(t.cari);
    return { cari: { unvan: c.unvan, gsm: c.gsm, eposta: c.eposta, adres: c.adres, ilce: c.ilce, sehir: c.sehir, yetkili: c.yetkili },
      kalemler: t.kalemler.map(k => ({ uid: k.uid, kategori: k.kategori, model: k.model, modul: k.modul, urun: urunAdi(k), olcu: k.olcu, renk: k.renk, yon: k.yon, adet: k.adet, aciklama: k.aciklama, foto: kucuk(k.kategori) + '|' + kucuk(k.model) })),
      tarih: t.tarih, teslim: t.teslim, personel: t.personel, montaj: t.montaj, nakliye: t.nakliye, teslimYeri: t.teslimYeri,
      genel_not: t.genelNot || '', ic_not: '', tur };
  }

  function kur() {
    const T = {};
    const tablo = (ad, satirlar) => { T[ad] = { satirlar, sira: satirlar.reduce((m, r) => (typeof r.id === 'number' && r.id > m ? r.id : m), 0) }; };
    const ekZaman = (n) => ({ created_at: zamanIso(n), updated_at: zamanIso(n) });

    tablo('pronto_kisi', [...PERSONEL, 'BURAK ŞAHİN'].map((ad, i) => ({ id: i + 1, ad })));
    const tedAdlari = [...new Set(Object.values(TEDARIKCI))];
    tablo('suppliers', tedAdlari.map((name, i) => ({ id: i + 1, name, phone: '0224 000 00 ' + pad(10 + i, 2), email: '', address: 'İnegöl / Bursa', notes: '', ...ekZaman(120) })));
    tablo('customers', [...CARILER.map(c => ({ name: c.unvan, phone: c.gsm, email: c.eposta, tax_no: '', address: [c.adres, c.ilce, c.sehir].join(', '), notes: '' })),
      { name: 'YILDIZ KAFE', phone: '0555 010 20 41', email: '', tax_no: '', address: 'Bursa', notes: '' },
      { name: 'ATLAS DANIŞMANLIK', phone: '0555 010 20 42', email: '', tax_no: '', address: 'İstanbul', notes: '' }].map((c, i) => ({ id: i + 1, ...c, ...ekZaman(110) })));
    const urunListe = []; const urunGor = new Set();
    for (const u of URUNLER) { const ad = urunAdi(u); if (urunGor.has(ad)) continue; urunGor.add(ad); urunListe.push({ id: urunListe.length + 1, name: ad, category: u.kategori, unit: 'Adet', price: u.fiyat, stock: [4, 2, 3, 1, 6, 0, 30, 0, 18, 5, 0, 2, 9][urunListe.length] || 0, description: '', ...ekZaman(115) }); }
    tablo('products', urunListe);
    tablo('stock_movements', urunListe.filter(p => p.stock > 0).map((p, i) => ({ id: i + 1, product_id: p.id, product_name: p.name, delta: p.stock, resulting_stock: p.stock, type: 'stock-in', note: 'Açılış stoğu', supplier: TEDARIKCI[p.category] || '', date: tarih(100), ...ekZaman(100) })));

    /* siparişler ve Teklif'ten gelenler */
    const siparisler = [], gelen = [], ozet = [];
    let sid = 0, gid = 0;
    for (const t of TEKLIFLER) {
      const od = odemeleri(t), h = hesap(t, od);
      ozet.push({ id: t.id, no: t.no, doviz: t.doviz, genel: h.genel, alinan: h.alinan, kalan: h.kalan, genel_not: t.genelNot || '', ic_not: '', silindi: false });
      if (!t.siparis) continue;
      const c = cariBul(t.cari);
      gelen.push({ id: ++gid, teklif_id: t.id, teklif_no: t.no, tur: 'yeni', durum: t.siparis === 'bekliyor' ? 'bekliyor' : 'onaylandi', veri: gelenVeri(t, 'yeni'), fotolar: {}, gonderen: t.personel, ...ekZaman(t.gun - 1) });
      if (t.siparis === 'bekliyor') continue;
      t.kalemler.forEach((k, j) => {
        siparisler.push({ id: ++sid, customer: c.unvan, supplier: TEDARIKCI[k.kategori] || '', product: urunAdi(k), quantity: k.adet, order_date: tarih(t.gun - 1), delivery_date: t.teslim,
          color_code: k.renk, fabric_code: '', description: kalemAciklama(k), status: Array.isArray(t.siparis) ? t.siparis[j] : t.siparis, stock_deducted: false, stock_deducted_qty: 0,
          teklif_id: t.id, teklif_kalem: k.uid, montaj: t.montaj, nakliye: t.nakliye, teslim_yeri: t.teslimYeri, ssh: null, ssh_ana_id: null, ...ekZaman(t.gun - 1), _foto: U[k.urunId].foto });
      });
    }
    for (const e of ELLE) {
      const u = U[e.urun.toLowerCase()];
      siparisler.push({ id: ++sid, customer: e.musteri, supplier: TEDARIKCI[u.kategori] || '', product: urunAdi(u), quantity: e.adet, order_date: tarih(e.gun), delivery_date: tarih(e.gun - 25),
        color_code: u.renk, fabric_code: '', description: kalemAciklama(u), status: e.durum, stock_deducted: false, stock_deducted_qty: 0,
        teklif_id: null, teklif_kalem: null, montaj: null, nakliye: null, teslim_yeri: null, ssh: null, ssh_ana_id: null, ...ekZaman(e.gun), _foto: u.foto });
    }
    /* sipariş fotoğrafları: görselin kendisi değil adı saklanır (depo küçük kalır) */
    const dosyalar = siparisler.filter(o => o._foto).map(o => ({ id: `orders/${o.id}/photo.jpg`, gorsel: o._foto }));
    siparisler.forEach(o => delete o._foto);
    tablo('orders', siparisler);
    tablo('pronto_gelen', gelen);
    tablo('teklif_ozet', ozet);
    tablo('dosyalar', dosyalar);
    tablo('gecmis', []);
    tablo('pronto_urun_tedarikci', Object.entries(TEDARIKCI).map(([kategori, tedarikci], i) => ({ id: i + 1, kategori, model: '', kat_anahtar: anahtar(kategori), model_anahtar: '', tedarikci, sira: 0 })));
    tablo('katalog', URUNLER.map(u => ({ id: u.id, kod: u.kod, kategori: u.kategori, model: u.model, modul: u.modul, olcu: u.olcu, renk: u.renk, yon: u.yon, fiyat: u.fiyat, doviz: u.doviz, updated_at: zamanIso(115) })));
    const kf = {}; for (const u of URUNLER) kf[kucuk(u.kategori) + '|' + kucuk(u.model)] = u.foto;
    tablo('katalog_foto', Object.entries(kf).map(([id, gorsel]) => ({ id, gorsel, at: gun(115).getTime() })));
    return T;
  }

  /* =====================================================================
     DEPO
     ===================================================================== */
  let db = null;
  const T = {};                    /* bellek: tablo adı → { satirlar, sira } */
  const dinleyiciler = new Set();
  const kanal = 'BroadcastChannel' in window ? new BroadcastChannel(KANAL) : null;

  const ac = () => db ? Promise.resolve(db) : new Promise((ok, no) => {
    const q = indexedDB.open(DB_ADI, 1);
    q.onupgradeneeded = () => q.result.createObjectStore('tablo');
    q.onsuccess = () => { db = q.result; db.onversionchange = () => db.close(); ok(db); };
    q.onerror = () => no(q.error);
  });
  const tx = (mod, fn) => ac().then(d => new Promise((ok, no) => { const t = d.transaction('tablo', mod); const r = fn(t.objectStore('tablo')); t.oncomplete = () => ok(r && r.result); t.onerror = () => no(t.error); }));
  async function hepsiniOku() {
    const d = await ac();
    return new Promise((ok, no) => {
      const out = {}, s = d.transaction('tablo').objectStore('tablo'), q = s.openCursor();
      q.onsuccess = () => { const c = q.result; if (!c) return ok(out); out[c.key] = c.value; c.continue(); };
      q.onerror = () => no(q.error);
    });
  }
  async function tumunuYaz(veri) { await tx('readwrite', s => { s.clear(); for (const [k, v] of Object.entries(veri)) s.put(v, k); }); }

  let hazirP = null;
  function hazir() {
    return hazirP || (hazirP = (async () => {
      let veri = await hepsiniOku();
      if (!veri.__surum || veri.__surum.v !== SURUM) { veri = { ...kur(), __surum: { v: SURUM } }; await tumunuYaz(veri); }
      for (const [k, v] of Object.entries(veri)) if (k !== '__surum') T[k] = v;
    })());
  }
  const tablo = ad => (T[ad] || (T[ad] = { satirlar: [], sira: 0 })).satirlar;

  /* değişiklik: tabloyu yaz, diğer sekmelere haber ver, bu sekmedeki dinleyicilere bildir */
  const bekleyen = new Set(); let yazT = null;
  function degisti(ad, olaylar) {
    bekleyen.add(ad);
    clearTimeout(yazT);
    yazT = setTimeout(async () => {
      const adlar = [...bekleyen]; bekleyen.clear();
      try { await tx('readwrite', s => { for (const a of adlar) s.put(T[a], a); }); } catch (e) { console.warn('Demo deposu yazılamadı', e); }
      kanal && kanal.postMessage({ tip: 'degisti', tablolar: adlar });
    }, 30);
    for (const f of dinleyiciler) { try { f({ tablo: ad, olaylar: olaylar || [], uzak: false }); } catch (e) { console.warn(e); } }
  }
  function ekle(ad, satir) {
    const t = T[ad] || (T[ad] = { satirlar: [], sira: 0 });
    const s = { ...satir };
    if (s.id == null) s.id = ++t.sira; else if (typeof s.id === 'number' && s.id > t.sira) t.sira = s.id;
    const simdi = new Date().toISOString();
    if (!('created_at' in s)) s.created_at = simdi;
    s.updated_at = simdi;
    t.satirlar.push(s);
    degisti(ad, [{ tur: 'INSERT', yeni: s }]);
    return s;
  }
  function guncelle(ad, id, yama) {
    const t = tablo(ad), i = t.findIndex(r => r.id === id); if (i < 0) return null;
    const eski = t[i], yeni = { ...eski, ...yama, updated_at: new Date().toISOString() };
    t[i] = yeni;
    degisti(ad, [{ tur: 'UPDATE', eski, yeni }]);
    return yeni;
  }
  function sil(ad, id) {
    const t = tablo(ad), i = t.findIndex(r => r.id === id); if (i < 0) return null;
    const [eski] = t.splice(i, 1);
    degisti(ad, [{ tur: 'DELETE', eski }]);
    return eski;
  }
  const bul = (ad, id) => tablo(ad).find(r => r.id === id) || null;

  /* başka sekmeden gelen değişiklik: tabloyu yeniden oku, satır farklarını çıkar */
  kanal && kanal.addEventListener('message', async e => {
    const m = e.data || {};
    if (m.tip === 'sifirla') { await uygulamaOnbelleginiTemizle(); location.reload(); return; }
    if (m.tip !== 'degisti' || !hazirP) return;
    await hazirP;
    const veri = await hepsiniOku();
    for (const ad of m.tablolar || []) {
      const eskiL = T[ad] ? T[ad].satirlar : [], yeniT = veri[ad] || { satirlar: [], sira: 0 };
      const eskiM = new Map(eskiL.map(r => [r.id, r])), olaylar = [];
      for (const r of yeniT.satirlar) { const o = eskiM.get(r.id); if (!o) olaylar.push({ tur: 'INSERT', yeni: r }); else { if (JSON.stringify(o) !== JSON.stringify(r)) olaylar.push({ tur: 'UPDATE', eski: o, yeni: r }); eskiM.delete(r.id); } }
      for (const o of eskiM.values()) olaylar.push({ tur: 'DELETE', eski: o });
      T[ad] = yeniT;
      if (olaylar.length) for (const f of dinleyiciler) { try { f({ tablo: ad, olaylar, uzak: true }); } catch (er) { console.warn(er); } }
    }
  });

  /* ---------- sıfırla ---------- */
  const temizlenecekAnahtar = k => /^(pl_|pronto|v99foto|near_pronto)/.test(k) && k !== 'prontoTheme';
  async function idbTemizle(ad, depolar) {
    await new Promise(ok => {
      const q = indexedDB.open(ad);
      q.onsuccess = () => { const d = q.result; const var_ = depolar.filter(s => d.objectStoreNames.contains(s)); if (!var_.length) { d.close(); return ok(); }
        const t = d.transaction(var_, 'readwrite'); var_.forEach(s => t.objectStore(s).clear()); t.oncomplete = () => { d.close(); ok(); }; t.onerror = () => { d.close(); ok(); }; };
      q.onerror = () => ok(); q.onblocked = () => ok();
    });
  }
  async function uygulamaOnbelleginiTemizle() {
    try { Object.keys(localStorage).filter(temizlenecekAnahtar).forEach(k => localStorage.removeItem(k)); } catch (_) {}
    await idbTemizle('pronto_cache_v2', ['rows', 'outbox']);
    await idbTemizle('pronto_siparis_cache_v1', ['stores']);
  }
  async function sifirla() {
    await tx('readwrite', s => s.clear());
    await uygulamaOnbelleginiTemizle();
    kanal && kanal.postMessage({ tip: 'sifirla' });
    location.reload();
  }

  /* ---------- Teklif → Sipariş Takibi köprüsü ---------- */
  /* Teklif'teki "siparis" satırı (Sipariş Takibi'nin durumu) ortak depodaki siparişlerden hesaplanır */
  function teklifSiparisDurumu(teklifId) {
    const sip = tablo('orders').filter(o => o.teklif_id === teklifId);
    const gl = tablo('pronto_gelen').filter(g => g.teklif_id === teklifId).sort((a, b) => a.id - b.id);
    const son = gl[gl.length - 1];
    if (sip.length) {
      const kalemler = {};
      for (const o of sip.sort((a, b) => a.id - b.id)) if (o.teklif_kalem) kalemler[o.teklif_kalem] = { no: o.id, durum: /\[\[SIPARISCOP:\d+\]\]/i.test(o.description || '') ? 'Silindi' : o.status };
      const d = { bag: 'onay', kalemler };
      if (son && son.durum === 'bekliyor') d.bekleyen = son.tur === 'silme' ? 'silme' : 'guncelleme';
      if (son && son.durum === 'reddedildi' && son.ret_notu) d.ret_notu = son.ret_notu;
      return d;
    }
    if (!son || son.tur === 'silme') return null;
    if (son.durum === 'bekliyor') return { bag: 'bekliyor', kalemler: {} };
    if (son.durum === 'reddedildi') return { bag: 'reddedildi', kalemler: {}, ret_notu: son.ret_notu || '' };
    return null;
  }

  window.ProntoDemo = {
    SURUM, IMG, PERSONEL, CARILER, URUNLER, TEKLIFLER, TEDARIKCI,
    odemeleri, hesap, urunAdi, kalemAciklama, kucuk, anahtar, gelenVeri,
    hazir, tablo, bul, ekle, guncelle, sil, degisti,
    dinle: f => { dinleyiciler.add(f); return () => dinleyiciler.delete(f); },
    sifirla, teklifSiparisDurumu,
    gorsel: ad => IMG[ad] || ''
  };
})();
