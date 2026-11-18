/* NearDiji — ana sitenin varsayılan içeriği.
   Gerçek içerik Supabase'teki site_content (key = "main") tablosundan gelir;
   /ayse paneli oraya yazar. Bu dosya ilk açılış ve bağlantı yoksa kullanılır. */

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
    description: "QR menü, ürün kataloğu, teklif ve sipariş sistemleri. Restoranlar ve üreticiler için hızlı, sade, her gün kullanılan yazılımlar. İnegöl, Bursa."
  },
  hero: {
    eyebrow: "Dijital ürün stüdyosu. İnegöl, Bursa.",
    headline: "İşletmeni\ndijitale taşı.",
    accent: "dijitale taşı.",
    body: "QR menü. Katalog. Teklif ve sipariş. Restoranlar, mobilya üreticileri ve yerel işletmeler için. Hızlı, sade ve her gün kullanılmak için tasarlandı.",
    primary: { label: "Proje başlat", href: "#iletisim" },
    secondary: { label: "Projeleri gör", href: "#projeler" },
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
  projectsTitle: "Öne çıkan işler.",
  projectsIntro: "Gerçek işletmeler için tasarlandı. Her gün kullanımda. Yönetmek o kadar kolay ki kimseye ihtiyacın olmaz.",
  projects: [
    { id: "p1", name: "NearMenu", tag: "QR Menü · SaaS", year: "2026", status: "live",
      desc: "Her restorana kendi QR menüsü, kendi adresi, kendi paneli. Türkçe, İngilizce ve Arapça. Fiyatı değiştir, menü anında güncellensin. A3, A4 ve A5 PDF menü dahil.",
      link: "/menu", linkLabel: "Demoyu aç", image: "", featured: true, hidden: false },
    { id: "p2", name: "Tetra", tag: "Sipariş sistemi", year: "2026", status: "live",
      desc: "Kasa. Mutfak ekranı. Hazır siparişler için TV ekranı. Sipariş hazır olduğunda müşterinin telefonuna bildirim gider. Self servis ve gel-al işletmeleri için, NearMenu ile aynı menüyle.",
      link: "https://tetra.neardiji.com", linkLabel: "Nasıl çalışır", image: "", featured: false, hidden: false },
    { id: "p3", name: "OFISCHI", tag: "Katalog · Teklif", year: "2026", status: "live",
      desc: "Ofis mobilyası için premium katalog ve teklif platformu. Türkçe ve İngilizce. TL, USD ve EUR fiyat. Teklif sepeti, indirim, KDV seçenekleri ve tek dokunuşla PDF teklif.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p4", name: "ASODA Mobilya", tag: "Toptan katalog", year: "2026", status: "live",
      desc: "Kategori kategori toptan katalog. Model model fiyat listesi PDF'i. TL, USD ve EUR fiyatlar ayrı ayrı yönetilir.",
      link: "https://axrsrs.github.io/asoda/", linkLabel: "Siteyi aç", image: "", featured: false, hidden: false },
    { id: "p5", name: "PRONTO", tag: "Sipariş & Teklif", year: "2026", status: "live",
      desc: "Mobilya siparişini üretimden teslimata kadar izle. 10 kullanıcı, tek sistem. Ürünler, müşteriler, tedarikçiler, raporlar, teklif ve satış bir arada. Web'de ve masaüstünde.",
      link: "/pronto/teklif", linkLabel: "Demoyu aç", image: "", featured: false, hidden: false },
    { id: "p6", name: "Bizim Ekmekçi", tag: "QR Menü", year: "2026", status: "live",
      desc: "Fırın ve kafe için cam görünümlü QR menü. Kategori kartları ve otomatik çeviri. Logoya basılı tut, PIN korumalı panel açılsın.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p7", name: "Ev Mobilya Fiyat Listesi", tag: "Fiyat listesi", year: "2026", status: "live",
      desc: "Ev mobilyası için fiyat listesi sitesi. Fiyatlı liste PDF'i, fiyatsız katalog PDF'i. Tek dokunuşla, istediğin para biriminde.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p8", name: "SOUQ", tag: "E-ticaret", year: "2026", status: "dev",
      desc: "Irak pazarı için üç dilli e-ticaret uygulaması. Yerel ödeme ve teslimat alışkanlıklarına göre tasarlandı.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false },
    { id: "p9", name: "sh21", tag: "Katalog şablonu", year: "2026", status: "live",
      desc: "Her firmaya dakikalar içinde uyarlanır. Türkçe ve İngilizce. Kapak ve kapanış sayfalı PDF katalog tek dokunuşla.",
      link: "", linkLabel: "", image: "", featured: false, hidden: false }
  ],
  clientsTitle: "Referanslar.",
  clientsIntro: "Dijital ürünlerini NearDiji ile hayata geçiren işletmeler.",
  clients: [],                     /* { id, name, logo, link } — /ayse panelinden logo yüklendikçe eklenir */
  clientsCutBg: true,
  servicesTitle: "İhtiyacın olan her şey.",
  services: [
    { title: "QR Dijital Menü", desc: "Restoran ve kafeler için. Çok dilli, anında güncellenir. Masadan okutulur, panelden yönetilir." },
    { title: "Katalog & Fiyat Listesi", desc: "Üreticiler için katalog sitesi ve tek tıkla PDF fiyat listesi. İstediğin para biriminde." },
    { title: "Teklif & Sipariş Sistemleri", desc: "Teklifi hazırla, siparişi takip et. Müşteriler, tedarikçiler ve tüm ekip tek ekranda." },
    { title: "Özel Web Uygulaması", desc: "İşletmenin işleyişine göre sıfırdan yazılır. Telefonda, tablette ve bilgisayarda sorunsuz." }
  ],
  stepsTitle: "Dört adımda yayında.",
  steps: [
    { title: "Görüşme", desc: "İhtiyacın dinlenir. Gereksiz hiçbir şey eklenmeden kapsam netleşir." },
    { title: "Demo", desc: "Kısa sürede, kendi içeriğinle çalışan bir demo." },
    { title: "Yayın", desc: "Alan adın, QR kodların ve panelin hazır. Eğitim dahil." },
    { title: "Destek", desc: "Yayından sonra da yanında. Güncellemeler ve yeni ihtiyaçlar için." }
  ],
  aboutTitle: "Hakkında",
  about: "NearDiji, İnegöl'de işletmelerin günlük işini kolaylaştıran dijital ürünler geliştirir. Türkçe, İngilizce ve Arapça. Hedef hep aynı: sahibinin kimseye ihtiyaç duymadan kullanabileceği kadar sade, hızlı ve güvenilir yazılım.",
  languages: "Türkçe · English · العربية",
  contactTitle: "Aklında bir proje mi var?",
  contactText: "Kısa bir mesaj yeter. Dönüş hızlı olur.",
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
    text: "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (\"KVKK\") 10. maddesi uyarınca, neardiji.com ve NearDiji altyapısıyla yayınlanan menü ve katalog sayfalarını kullanan ziyaretçileri ve işletme kullanıcılarını kişisel verilerinin nasıl işlendiği konusunda bilgilendirmek amacıyla hazırlanmıştır.\n\nVeri sorumlusu\nNearDiji, Bursa\n\nZiyaretçilerin verileri\nMenü, katalog ve tanıtım sayfalarında üyelik, form veya yorum alanı yoktur; sizden ad, telefon ya da e-posta istenmez.\nSayfaların açılabilmesi için tarayıcınızın gönderdiği IP adresi ve tarayıcı bilgisi, sitenin barındırıldığı sunuculara teknik olarak iletilir.\nGünlük ziyaret sayısını hesaplamak için IP adresiniz kaydedilmez. IP adresinden geri çevrilemeyen bir özet üretilir, yalnızca aynı gün içindeki tekrar ziyaretleri ayırt etmek için kullanılır ve en geç ertesi gün silinir.\n\nİletişime geçtiğinizde\nWhatsApp, telefon veya e-posta ile bize ulaştığınızda paylaştığınız ad-soyad, telefon numarası, e-posta adresi ve mesaj içeriği işlenir.\n\nİşletme kullanıcılarının verileri\nYönetim paneli hesabı için e-posta adresiniz, şifrenizin geri çevrilemeyen özeti ve son giriş zamanınız saklanır.\nKayıt silme, hesap ekleme, şifre sıfırlama ve abonelik değişikliği gibi işlemlerin kim tarafından ve ne zaman yapıldığı güvenlik amacıyla işlem kaydına yazılır.\nMenüde veya katalogda yayınlanmak üzere girdiğiniz işletme adı, telefon ve WhatsApp numarası gibi bilgiler sayfanızda herkese açık olarak gösterilir.\n\nİşleme amaçları\n• Sitenin ve sayfaların yayınlanması, güvenliğinin sağlanması\n• Günlük ziyaret istatistiklerinin tutulması\n• İletişim taleplerinize yanıt verilmesi ve teklif hazırlanması\n• İşletme hesaplarının oluşturulması, yönetim paneline erişim ve aboneliklerin yönetilmesi\n• Yetkisiz erişimin tespit edilmesi ve önlenmesi\n• Yasal yükümlülüklerin yerine getirilmesi\n\nToplama yöntemi ve hukuki sebep\nKişisel verileriniz; siteyi ziyaret ettiğinizde tarayıcınız aracılığıyla otomatik yollarla, bizimle iletişime geçtiğinizde ve yönetim paneli hesabı oluşturulurken elektronik ortamda toplanır. Bu veriler KVKK'nın 5. maddesinin 2. fıkrasında yer alan bir sözleşmenin kurulması veya ifası (c), hukuki yükümlülüğün yerine getirilmesi (ç) ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaat (f) hukuki sebeplerine dayanılarak işlenir.\n\nAktarım ve yurt dışı\nKişisel verileriniz satılmaz ve pazarlama amacıyla üçüncü kişilerle paylaşılmaz.\nHizmetin sunulabilmesi için veriler şu hizmet sağlayıcıların sunucularında barındırılır: Cloudflare (site yayını ve görsel depolama, Avrupa) ve Supabase (veritabanı ve hesap yönetimi, Frankfurt, Almanya). Bu sunucular yurt dışında bulunduğundan veriler KVKK'nın 9. maddesi kapsamında yurt dışına aktarılır.\nYönetim panelindeki otomatik çeviri kullanıldığında yalnızca girilen ürün metinleri Cloudflare'ın, gerekirse MyMemory'nin çeviri hizmetine gönderilir.\nYasal zorunluluk hâlinde veriler yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir.\n\nSaklama süreleri\nZiyaret özeti en geç ertesi gün silinir. Günlük ziyaret sayıları kişisel veri içermez.\nİletişim yazışmaları talebiniz sonuçlanana kadar, hesap bilgileri ve işlem kayıtları hesabınız açık olduğu sürece ve sonrasında yasal saklama süreleri boyunca tutulur.\n\nÇerezler ve tarayıcı kayıtları\nBu site çerez (cookie) kullanmaz. Reklam, yeniden hedefleme veya sizi siteler arasında takip eden hiçbir araç yoktur.\nTarayıcınızın yerel depolama alanında yalnızca sitenin çalışması için gereken şu bilgiler tutulur:\n• Tema tercihiniz (açık / koyu)\n• Sayfanın hızlı açılması için içerik ve döviz kuru kopyası\n• Aynı gün içinde iki kez sayılmamanız için ziyaret işareti (tarayıcı kapanınca silinir)\n• Yönetim paneline giriş yaptıysanız oturum bilginiz\n• Çerez tercihiniz\nBu bilgiler sunucularımıza gönderilmez; tarayıcı ayarlarınızdan istediğiniz zaman silebilirsiniz.\nZiyaret istatistikleri yalnızca izin verirseniz, çerez kullanmayan ve sizi tanımlamayan Cloudflare Web Analytics ile tutulur. Tercihiniz tarayıcınızda 12 ay saklanır; sayfaların altındaki \"Çerez ayarları\" bağlantısından istediğiniz zaman değiştirebilirsiniz.\n\nHaklarınız\nKVKK'nın 11. maddesi uyarınca;\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n• İşlenmişse buna ilişkin bilgi talep etme\n• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme\n• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme\n• Eksik veya yanlış işlenmişse düzeltilmesini isteme\n• Silinmesini veya yok edilmesini isteme\n• Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme\n• Otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme\n• Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme\nhaklarına sahipsiniz.\n\nBaşvuru\nHaklarınızı kullanmak için talebinizi sitenin İletişim bölümündeki kanallardan bize iletebilirsiniz. Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.\n\nSon güncelleme: 30 Ekim 2026"
  }
};
