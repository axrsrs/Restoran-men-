/* NearDiji — ana sitenin varsayılan içeriği.
   Gerçek içerik Supabase'teki site_content (key = "main") tablosundan gelir;
   /ayse paneli oraya yazar. Bu dosya ilk açılış ve bağlantı yoksa kullanılır. */
window.ND_SB_URL = "https://rfwgjzkewtjpdcvrhepg.supabase.co";
window.ND_SB_KEY = "sb_publishable_ohHiomyazD8qr_mQXX9G-Q_DCEeD8j2";

window.ND_DEFAULT = {
  brand: "NearDiji",
  logo: "",
  logoDark: "",
  theme: "dark",
  seo: {
    title: "NearDiji — İşletmeler için dijital ürünler",
    description: "QR menüler, ürün katalogları, teklif ve sipariş sistemleri. İnegöl'den işletmelere hızlı, sade ve gerçekten kullanılan yazılımlar."
  },
  hero: {
    eyebrow: "İnegöl, Bursa — Dijital ürün stüdyosu",
    headline: "İşletmeni\ndijitale taşı.",
    accent: "dijitale taşı.",
    body: "QR menüler, ürün katalogları, teklif ve sipariş sistemleri. Restoranlar, mobilya üreticileri ve yerel işletmeler için hızlı, sade ve gerçekten kullanılan yazılımlar.",
    primary: { label: "Proje başlat", href: "#iletisim" },
    secondary: { label: "Projeler", href: "#projeler" },
    backdrop: "neardiji",
    hint: "İmleci şeklin üzerinde gezdir",
    hintTouch: "Şekle dokun",
    sculpture: "default",          /* default | logo | custom */
    image: "",                     /* custom: açık tema görseli */
    imageDark: "",                 /* custom: koyu tema görseli */
    strength: 1,
    liquid: 1,
    density: 1
  },
  projectsTitle: "Seçili işler",
  projectsIntro: "Gerçek işletmeler için tasarlanıp yayına alınan ürünler. Her biri, sahibinin kendi başına yönetebileceği sadelikte.",
  projects: [
    { id: "p1", name: "NearMenu", tag: "QR Menü · SaaS", year: "2026", status: "live",
      desc: "Tek altyapıdan yüzlerce restorana QR dijital menü. Türkçe, İngilizce ve Arapça içerik; anlık fiyat güncelleme, A3/A4/A5 PDF menü, işletme başına ayrı adres ve yönetim paneli.",
      link: "/menu", linkLabel: "Demoyu aç", image: "", featured: true, hidden: false },
    { id: "p2", name: "NEAR Smart Restaurant", tag: "Sipariş takip", year: "2026", status: "dev",
      desc: "Self servis ve gel-al işletmeleri için sipariş takip sistemi: kasa ekranı, personel tableti, hazır siparişler TV ekranı ve müşteriye bildirim.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p3", name: "OFISCHI", tag: "Katalog · Teklif", year: "2026", status: "live",
      desc: "Ofis mobilyası markası için premium katalog ve teklif platformu. TR/EN içerik, TL/USD/EUR fiyat, teklif sepeti, indirim ve KDV seçenekleri, PDF teklif.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p4", name: "ASODA Mobilya", tag: "Toptan katalog", year: "2026", status: "live",
      desc: "Mobilya üreticisi için kategori bazlı toptan katalog sitesi ve model model fiyat listesi PDF'i. TL, USD ve EUR fiyatlar ayrı ayrı yönetilir.",
      link: "https://axrsrs.github.io/asoda/", linkLabel: "Siteyi aç", image: "", featured: false, hidden: false },
    { id: "p5", name: "PRONTO", tag: "Sipariş & Teklif", year: "2026", status: "live",
      desc: "Mobilya siparişlerini üretimden teslime kadar izleyen 10 kullanıcılı takip sistemi; web ve masaüstü. Ürünler, müşteriler, tedarikçiler, raporlar ve teklif/satış modülü.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p6", name: "Bizim Ekmekçi", tag: "QR Menü", year: "2026", status: "live",
      desc: "Fırın ve kafe için cam görünümlü QR menü. Kategori kartları, otomatik çeviri, logoya basılı tutarak açılan PIN korumalı yönetim paneli.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p7", name: "Ev Mobilya Fiyat Listesi", tag: "Fiyat listesi", year: "2026", status: "live",
      desc: "Ev mobilyası satışı için fiyat listesi sitesi: fiyatlı liste PDF'i ve fiyatsız katalog PDF'i tek dokunuşla, seçilen para biriminde.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p8", name: "SOUQ", tag: "E-ticaret", year: "2026", status: "dev",
      desc: "Irak pazarı için üç dilli e-ticaret uygulaması; yerel ödeme ve teslimat alışkanlıklarına göre tasarlandı.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p9", name: "sh21", tag: "Katalog şablonu", year: "2026", status: "live",
      desc: "Her firmaya dakikalar içinde uyarlanan hazır katalog altyapısı: PIN'li panel, TR/EN çeviri, kapak ve kapanış sayfalı PDF katalog.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false }
  ],
  servicesTitle: "Neler yapıyorum",
  services: [
    { title: "QR Dijital Menü", desc: "Restoran ve kafeler için çok dilli, anında güncellenen menü; masadan okutulur, panelden yönetilir." },
    { title: "Katalog & Fiyat Listesi", desc: "Üreticiler için ürün kataloğu sitesi ve tek tıkla PDF fiyat listesi; çoklu para birimi." },
    { title: "Teklif & Sipariş Sistemleri", desc: "Teklif hazırlama, sipariş takibi, müşteri ve tedarikçi kayıtları; ekip için ortak ekran." },
    { title: "Özel Web Uygulaması", desc: "İşletmenizin işleyişine göre sıfırdan yazılım; telefon, tablet ve masaüstünde sorunsuz." }
  ],
  stepsTitle: "Nasıl çalışıyoruz",
  steps: [
    { title: "Görüşme", desc: "İşletmenizi ve ihtiyacınızı dinliyorum; gereksiz hiçbir şey eklemeden kapsamı çıkarıyoruz." },
    { title: "Demo", desc: "Kısa sürede kendi içeriğinizle çalışan bir demo görüyorsunuz." },
    { title: "Yayın", desc: "Alan adınız, QR kodlarınız ve paneliniz hazır; eğitimi birlikte yapıyoruz." },
    { title: "Destek", desc: "Yayından sonra da yanınızdayım; güncelleme ve yeni ihtiyaçlar için." }
  ],
  aboutTitle: "Hakkında",
  about: "İnegöl'de, işletmelerin günlük işini kolaylaştıran dijital ürünler geliştiriyorum. Türkçe, İngilizce ve Arapça çalışıyorum; amacım her zaman aynı: sahibinin kimseye ihtiyaç duymadan kullanabileceği sadelikte, hızlı ve güvenilir yazılım.",
  languages: "Türkçe · English · العربية",
  contactTitle: "Bir proje mi düşünüyorsunuz?",
  contactText: "Kısa bir mesaj yeterli; en kısa sürede dönüş yapıyorum.",
  contact: { whatsapp: "", phone: "", email: "", instagram: "", address: "İnegöl, Bursa" },
  footer: "© NearDiji"
};
