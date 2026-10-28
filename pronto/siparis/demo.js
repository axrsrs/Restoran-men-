/* =====================================================================
   PRONTO Sipariş Takibi · NEAR DEMO KATMANI (uygulamadan sonra yüklenir)
   Demo şeridi, iki demoyu birlikte sıfırlama ve demoya özel küçük ayarlar.
   ===================================================================== */
(function () {
  'use strict';
  const P = window.ProntoDemo;

  /* fotoğraf adresleri bu demoda veri adresi (data:) olduğu için tarayıcı belleğine yazılmaz */
  v99FotoGet = function () { return null; };
  v99FotoSet = function () {};

  /* çıkış yok: oturum demo boyunca açık */
  signOut = async function () { showToast('Demo sürümünde çıkış yapılmaz. Verileri ilk hâline döndürmek için “Sıfırla”yı kullanın.'); };

  async function sifirla() {
    if (!confirm('Bu tarayıcıda yaptığınız tüm değişiklikler silinir; PRONTO Teklif ve Sipariş Takibi demoları birlikte ilk hâline döner. Devam edilsin mi?')) return;
    await P.sifirla();
  }

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
.near-demo{position:fixed;top:0;left:0;right:0}
body{padding-top:calc(40px + env(safe-area-inset-top))}
.sidebar{top:calc(40px + env(safe-area-inset-top))!important}
@media screen and (max-width:1024px){.mobile-topbar{top:calc(40px + env(safe-area-inset-top))!important}}
@media print{.near-demo{display:none!important}}`;
  document.head.appendChild(st);

  function serit() {
    if (document.querySelector('.near-demo')) return;
    const bar = document.createElement('div'); bar.className = 'near-demo'; bar.setAttribute('role', 'note');
    bar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.5 20.5H3.5v-17h17v17L8.6 8.6" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
      <span>Demo<em>Örnek verilerle çalışır, değişiklikler bu tarayıcıda kalır.</em></span>
      <a href="/pronto/teklif/" target="near-pronto-teklif">PRONTO Teklif</a><button type="button" data-near-sifirla>Sıfırla</button>`;
    bar.querySelector('[data-near-sifirla]').addEventListener('click', sifirla);
    document.body.prepend(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', serit); else serit();

  /* ---------- rehberlik turu ---------- */
  const gor = v => ({ sayfa: v, git: () => { if (currentView !== v) switchView(v); } });
  const dar = () => window.innerWidth <= 1024;
  NearRehber.kur({
    anahtar: 'siparis',
    ad: 'Sipariş Takibi’ne hoş geldiniz',
    metin: 'Siparişten teslimata kadar her adım tek yerde. 2 dakikalık turla bölümleri gösterelim.',
    maddeler: ['PRONTO Teklif’ten gelen siparişi onayla, üretime al.', 'Tedarikçi, satın alma, stok ve sevkiyatı takip et.', 'Durumu değiştir; Teklif tarafı ve müşteri anında haberdar olsun.'],
    hazir: () => !!document.querySelector('#view-orders .summary-grid') && !document.querySelector('#appShell.hidden, .lock-screen:not(.hidden)'),
    temizle: () => { try { closeAllModals(); } catch (e) {} },
    son: () => { if (currentView !== 'orders') switchView('orders'); },
    adimlar: () => [
      { bolum: 'Genel', ...gor('orders'), sel: dar() ? '#v106Bar' : '.sidebar-nav', t: 'Bölümler', p: dar()
        ? 'Alttaki çubukla Siparişler, Gelen, Sevkiyat arasında geçersiniz; ortadaki + yeni sipariş açar. Diğer bölümler “Daha” menüsünde.'
        : 'Siparişler, gelen siparişler, ürünler, satın alma, takvim, stok, müşteriler, tedarikçiler, sevkiyat, teslim formu ve raporlar burada.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: '#v98Banner', t: 'PRONTO Teklif’ten gelenler', p: 'Teklif tarafında “Sipariş Takibi’ne Gönder” denen siparişler burada onay bekler. İncele’ye basıp kalemleri kontrol eder, onaylar ya da notla geri çevirirsiniz.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: dar() ? '[data-v106=yeni]' : '#newOrderBtn', t: 'Yeni sipariş', p: 'Teklif’ten gelmeyen siparişleri de buradan elle girersiniz: müşteri, ürün, adet, tedarikçi ve teslim tarihi.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: '#dailyBanner', t: 'Günlük uyarı', p: 'Teslim tarihi geçmiş siparişler her gün burada hatırlatılır. “Gecikenleri Gör” listeyi yalnız onlara süzer.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: '#view-orders .summary-grid', t: 'Özet', p: 'Toplam, bekleyen, teslim edilen ve geciken sipariş sayıları. Kırmızı rakam dikkat isteyen işi gösterir.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: '#filterPills', t: 'Durum filtreleri', p: 'Beklemede, Üretimde, Sevkiyata Hazır, Teslim Edildi, SSH, İptal ve Gecikti. Dokununca liste o duruma süzülür; sayılar anlık güncellenir.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: '#view-orders .toolbar', t: 'Arama ve tarih', p: 'Müşteri, ürün, tedarikçi ya da sipariş no ile arayın; tarih aralığıyla dönemi daraltın.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: '.order-card .status-badge-btn, #ordersTableBody .status-badge-btn', t: 'Durumu tek dokunuşla değiştir', p: 'Etikete dokununca siparişin kalemleri açılır; her kalemin durumunu oradan değiştirirsiniz. Değişiklik PRONTO Teklif’teki siparişe anında yansır.' },
      { bolum: 'Siparişler', ...gor('orders'), genis: true, sel: '#ordersTableBody .group-menu-trigger', t: 'Sipariş işlemleri', p: '⋯ menüsünden siparişin kalemlerini açar, grup PDF’i alır ya da sipariş kartına gidersiniz.' },
      { bolum: 'Siparişler', ...gor('orders'), sel: '#exportBtn', t: 'Excel’e aktar', p: 'Süzdüğünüz listeyi tek tuşla Excel dosyası olarak indirirsiniz.' },
      { bolum: 'Planlama', ...gor('takvim'), sel: '#v35Govde', t: 'Teslimat takvimi', p: 'Bekleyen siparişler teslim gününe göre haftalık takvimde. Montajlı ve yoğun günler renkle ayrılır; yükleme listesi PDF olarak çıkar.' },
      { bolum: 'Planlama', ...gor('purchase'), sel: '#v26Yeni', t: 'Satın alma', p: 'Stok için tedarikçiye verilen siparişler. Alış fiyatları yalnız burada görünür; mal gelince “Teslim Al” dediğinizde stoka girer.' },
      { bolum: 'Planlama', ...gor('stock'), sel: '#v27Tabs', t: 'Stok takibi', p: 'Depo stoğu ürün çeşidine göre tutulur; yoldaki ve eksiye düşen stok ayrı görünür. Sayım modu ile gerçek stokla eşitlersiniz.' },
      { bolum: 'Teslimat', ...gor('shipment'), sel: '#shipmentGroups', t: 'Sevkiyat', p: '“Sevkiyata Hazır” kalemler şehre göre gruplanır. Toplu seçip sevkiyat listesini PDF olarak alırsınız.' },
      { bolum: 'Teslimat', ...gor('delivery-form'), sel: '#view-delivery-form .settings-card', t: 'Teslim formu', p: 'Sevkiyattaki müşteriler burada kendiliğinden listelenir. Teslim şartlarıyla birlikte imzalatılacak formu PDF olarak alırsınız.' },
      { bolum: 'Kayıtlar', ...gor('suppliers'), sel: '#newSupplierBtn', t: 'Tedarikçiler', p: 'Tedarikçi bilgileri ve hangi ürünün hangi tedarikçiden geldiğini gösteren ürün eşleştirmeleri.' },
      { bolum: 'Kayıtlar', ...gor('customers'), sel: '#newCustomerBtn', t: 'Müşteriler', p: 'Müşteri kartları; aynı müşteri iki kez girildiyse “Birleştir” ile tek kayıtta toplarsınız.' },
      { bolum: 'Raporlar', ...gor('reports'), sel: '#reportGrid', t: 'Raporlar', p: 'Durum dağılımı, en çok sipariş veren müşteriler, en çok kullanılan tedarikçiler ve tedarikçilerin ortalama teslim süreleri.' },
      { bolum: 'Ayarlar', ...gor('orders'), genis: true, sel: '#v32Chip', t: 'Bu cihazda çalışan', p: 'Her cihaz bir çalışan adıyla çalışır; ✎ ile değiştirirsiniz. Müşteri mesajları ve kayıtlar bu adla oluşur.' },
      { bolum: 'Bağlantı', ...gor('orders'), sel: '.near-demo a[href*="teklif"]', t: 'PRONTO Teklif', p: 'İki program birbirine bağlı. Teklif’ten gönderilen sipariş buraya düşer; burada değişen durum oraya geri döner.' },
      { bolum: 'Bağlantı', ...gor('orders'), sel: '[data-near-rehber]', t: 'Rehber her zaman burada', p: 'Bu turu istediğiniz an buradan yeniden başlatırsınız. “Sıfırla” iki demoyu birlikte ilk hâline döndürür.' }
    ].filter(a => !a.genis || !dar())
  });
})();
