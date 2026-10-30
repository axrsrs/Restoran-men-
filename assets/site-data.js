/* NearDiji — ana sitenin varsayılan içeriği.
   Gerçek içerik Supabase'teki site_content (key = "main") tablosundan gelir;
   /ayse paneli oraya yazar. Bu dosya ilk açılış ve bağlantı yoksa kullanılır. */
window.ND_SB_URL = "https://rfwgjzkewtjpdcvrhepg.supabase.co";
window.ND_SB_KEY = "sb_publishable_ohHiomyazD8qr_mQXX9G-Q_DCEeD8j2";

window.ND_DEFAULT = {
  brand: "NearDiji",
  logo: "",
  logoDark: "",                    /* eski kayıtlar için; panel artık tek logo kullanır */
  logoSize: 34,                    /* masaüstü logo yüksekliği (px) */
  logoMode: "auto",                /* auto: temaya göre tersine çevir | mono: yazı renginde | original */
  logoTone: "",                    /* yüklemede hesaplanır: dark | light */
  logoRatio: 0,                    /* genişlik / yükseklik */
  logoCutBg: true,                 /* yüklemede düz arka planı kaldır */
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
      link: "/pronto/teklif", linkLabel: "Demoyu aç", image: "", featured: false, hidden: false },
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
  clientsTitle: "Birlikte çalıştığımız firmalar",
  clientsIntro: "Dijital ürünlerini birlikte hayata geçirdiğimiz işletmeler.",
  clients: [],                     /* { id, name, logo, link } — /ayse panelinden logo yüklendikçe eklenir */
  clientsCutBg: true,
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
  contact: {
    whatsapp: "", waText: "Merhaba, neardiji.com üzerinden yazıyorum.",
    phone: "", email: "", address: "İnegöl, Bursa", mapUrl: "",
    instagram: "", linkedin: "", x: "", youtube: "", tiktok: "", facebook: ""
  },
  waFloat: "right",                /* right | left | off — numara boşsa hiç görünmez */
  footer: "NearDiji",              /* telif satırı: “© yıl NearDiji. Tüm hakları saklıdır.” */
  footerText: "İşletmeler için QR menü, katalog, teklif ve sipariş sistemleri.",
  footerCols: {
    corporate: { show: true, title: "Kurumsal" },
    services: { show: true, title: "Hizmetler" },
    demos: { show: true, title: "Demolar" }
  },
  demos: [
    { label: "NearMenu QR menü", href: "/menu" },
    { label: "Ürün kataloğu", href: "/katalog" },
    { label: "PRONTO teklif", href: "/pronto/teklif" },
    { label: "PRONTO sipariş takibi", href: "/pronto/siparis" }
  ],
  privacy: {
    title: "KVKK ve Gizlilik",
    text: "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (\"KVKK\") 10. maddesi uyarınca, neardiji.com ve NearDiji altyapısıyla yayınlanan menü ve katalog sayfalarını kullanan ziyaretçileri ve işletme kullanıcılarını kişisel verilerinin nasıl işlendiği konusunda bilgilendirmek amacıyla hazırlanmıştır.\n\nVeri sorumlusu\nNearDiji, Bursa\n\nZiyaretçilerin verileri\nMenü, katalog ve tanıtım sayfalarında üyelik, form veya yorum alanı yoktur; sizden ad, telefon ya da e-posta istenmez.\nSayfaların açılabilmesi için tarayıcınızın gönderdiği IP adresi ve tarayıcı bilgisi, sitenin barındırıldığı sunuculara teknik olarak iletilir.\nGünlük ziyaret sayısını hesaplamak için IP adresiniz kaydedilmez. IP adresinden geri çevrilemeyen bir özet üretilir, yalnızca aynı gün içindeki tekrar ziyaretleri ayırt etmek için kullanılır ve en geç ertesi gün silinir.\n\nİletişime geçtiğinizde\nWhatsApp, telefon veya e-posta ile bize ulaştığınızda paylaştığınız ad-soyad, telefon numarası, e-posta adresi ve mesaj içeriği işlenir.\n\nİşletme kullanıcılarının verileri\nYönetim paneli hesabı için e-posta adresiniz, şifrenizin geri çevrilemeyen özeti ve son giriş zamanınız saklanır.\nKayıt silme, hesap ekleme, şifre sıfırlama ve abonelik değişikliği gibi işlemlerin kim tarafından ve ne zaman yapıldığı güvenlik amacıyla işlem kaydına yazılır.\nMenüde veya katalogda yayınlanmak üzere girdiğiniz işletme adı, telefon ve WhatsApp numarası gibi bilgiler sayfanızda herkese açık olarak gösterilir.\n\nİşleme amaçları\n• Sitenin ve sayfaların yayınlanması, güvenliğinin sağlanması\n• Günlük ziyaret istatistiklerinin tutulması\n• İletişim taleplerinize yanıt verilmesi ve teklif hazırlanması\n• İşletme hesaplarının oluşturulması, yönetim paneline erişim ve aboneliklerin yönetilmesi\n• Yetkisiz erişimin tespit edilmesi ve önlenmesi\n• Yasal yükümlülüklerin yerine getirilmesi\n\nToplama yöntemi ve hukuki sebep\nKişisel verileriniz; siteyi ziyaret ettiğinizde tarayıcınız aracılığıyla otomatik yollarla, bizimle iletişime geçtiğinizde ve yönetim paneli hesabı oluşturulurken elektronik ortamda toplanır. Bu veriler KVKK'nın 5. maddesinin 2. fıkrasında yer alan bir sözleşmenin kurulması veya ifası (c), hukuki yükümlülüğün yerine getirilmesi (ç) ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaat (f) hukuki sebeplerine dayanılarak işlenir.\n\nAktarım ve yurt dışı\nKişisel verileriniz satılmaz ve pazarlama amacıyla üçüncü kişilerle paylaşılmaz.\nHizmetin sunulabilmesi için veriler şu hizmet sağlayıcıların sunucularında barındırılır: Cloudflare (site yayını ve görsel depolama, Avrupa) ve Supabase (veritabanı ve hesap yönetimi, Frankfurt, Almanya). Bu sunucular yurt dışında bulunduğundan veriler KVKK'nın 9. maddesi kapsamında yurt dışına aktarılır.\nYönetim panelindeki otomatik çeviri kullanıldığında yalnızca girilen ürün metinleri Cloudflare'ın, gerekirse MyMemory'nin çeviri hizmetine gönderilir.\nYasal zorunluluk hâlinde veriler yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir.\n\nSaklama süreleri\nZiyaret özeti en geç ertesi gün silinir. Günlük ziyaret sayıları kişisel veri içermez.\nİletişim yazışmaları talebiniz sonuçlanana kadar, hesap bilgileri ve işlem kayıtları hesabınız açık olduğu sürece ve sonrasında yasal saklama süreleri boyunca tutulur.\n\nÇerezler ve tarayıcı kayıtları\nBu site çerez (cookie) kullanmaz. Reklam, yeniden hedefleme veya sizi siteler arasında takip eden hiçbir araç yoktur.\nTarayıcınızın yerel depolama alanında yalnızca sitenin çalışması için gereken şu bilgiler tutulur:\n• Tema tercihiniz (açık / koyu)\n• Sayfanın hızlı açılması için içerik ve döviz kuru kopyası\n• Aynı gün içinde iki kez sayılmamanız için ziyaret işareti (tarayıcı kapanınca silinir)\n• Yönetim paneline giriş yaptıysanız oturum bilginiz\nBu bilgiler sunucularımıza gönderilmez; tarayıcı ayarlarınızdan istediğiniz zaman silebilirsiniz. Ziyaret istatistikleri, çerez kullanmayan ve sizi tanımlamayan Cloudflare Web Analytics ile tutulur.\n\nHaklarınız\nKVKK'nın 11. maddesi uyarınca;\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n• İşlenmişse buna ilişkin bilgi talep etme\n• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme\n• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme\n• Eksik veya yanlış işlenmişse düzeltilmesini isteme\n• Silinmesini veya yok edilmesini isteme\n• Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme\n• Otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme\n• Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme\nhaklarına sahipsiniz.\n\nBaşvuru\nHaklarınızı kullanmak için talebinizi sitenin İletişim bölümündeki kanallardan bize iletebilirsiniz. Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.\n\nSon güncelleme: 30 Ekim 2026"
  }
};
