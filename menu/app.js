const TRANSLATION_CACHE_KEY="nearMenuTranslations";

const DB_NAME="NearMenuMediaDB";
const DB_VERSION=1;
const MEDIA_STORE="media";

/* =========================================================
   YARDIMCI
========================================================= */

const TEXT={
 tr:{
  welcome:"HOŞ GELDİNİZ",best:"Çok Satanlar",
  events:"Etkinlikler",categories:"Kategoriler",
  swipe:"Sağa kaydır",back:"Geri",
  portion:"Porsiyon / Gramaj",calories:"Kalori",
  allergens:"Alerjenler",spicy:"Acılık",
  sold:"Tükendi",dish:"Günün Ürünü",
  reserve:"Rezervasyon Yap",call:"Ara",
  admin:"Yönetim Paneli",general:"Genel",
  products:"Menü",settings:"Tasarım",save:"Kaydet",
  search:"Ürün ara...",add:"Ekle",edit:"Düzenle",
  delete:"Sil",cancel:"İptal",
  saveProduct:"Ürünü Kaydet",
  saveCategory:"Kategoriyi Kaydet",
  addCategory:"+ Kategori Ekle",
  addProduct:"+ Ürün Ekle",
  basic:"Temel Bilgiler",advanced:"Ek Bilgiler",
  hideAdvanced:"Ek Bilgileri Gizle",
  productName:"Ürün adı",productPrice:"Fiyat (TL)",
  description:"Açıklama",photo:"Fotoğraf",
  categoryName:"Kategori adı",noProducts:"Henüz ürün yok.",
  noCategories:"Henüz kategori yok.",
  usd:"Dolar",eur:"Euro",try:"Türk Lirası",
  translationInfo:"Türkçe metinleri yazman yeterli.",
  image:"Fotoğraf Seç",video:"Video Seç",
  results:"ürün bulundu",noResults:"Ürün bulunamadı.",
  reserveWhatsApp:"WhatsApp ile Rezervasyon",
  reserveCall:"Arayarak Rezervasyon",
  reserveMsg:"Merhaba, {event} ({date}) için rezervasyon yapmak istiyorum.",
  date:"Tarih",time:"Saat",products_count:"ürün",
  hoursTitle:"Çalışma Saatleri",openNow:"Şu an açık",closedNow:"Şu an kapalı",
  closesAt:"Kapanış {t}",opensAt:"Açılış {t}",closedDay:"Kapalı",today:"Bugün",
  days:["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"],
  wifiNet:"Ağ",wifiPass:"Şifre",copy:"Kopyala",copied:"Kopyalandı",
  review:"Google'da yorum yapın",reviewSub:"Deneyiminizi paylaşın, bizim için çok değerli.",
  order:"Paket servis",follow:"Bizi takip edin",
  vat:"Fiyatlarımıza KDV dahildir.",madeWith:"ile hazırlandı",privacy:"KVKK ve Gizlilik",cookies:"Çerez ayarları"
 },
 en:{
  welcome:"WELCOME",best:"Best Sellers",events:"Events",
  categories:"Categories",swipe:"Swipe",back:"Back",
  portion:"Portion",calories:"Calories",
  allergens:"Allergens",spicy:"Spiciness",
  sold:"Sold Out",dish:"Dish of the Day",
  reserve:"Reserve",call:"Call",admin:"Admin Panel",
  general:"General",products:"Menu",settings:"Design",
  save:"Save",search:"Search products...",
  add:"Add",edit:"Edit",delete:"Delete",
  cancel:"Cancel",saveProduct:"Save Product",
  saveCategory:"Save Category",addCategory:"+ Add Category",
  addProduct:"+ Add Product",basic:"Basic Information",
  advanced:"Additional Information",
  hideAdvanced:"Hide Additional Information",
  productName:"Product name",productPrice:"Price",
  description:"Description",photo:"Photo",
  categoryName:"Category name",
  noProducts:"No products yet.",
  noCategories:"No categories yet.",
  usd:"US Dollar",eur:"Euro",try:"Turkish Lira",
  translationInfo:"Write Turkish text and translations will be generated.",
  image:"Choose Photo",video:"Choose Video",
  results:"products found",noResults:"No products found.",
  reserveWhatsApp:"Reserve via WhatsApp",
  reserveCall:"Call to Reserve",
  reserveMsg:"Hello, I would like to make a reservation for {event} ({date}).",
  date:"Date",time:"Time",products_count:"products",
  hoursTitle:"Opening Hours",openNow:"Open now",closedNow:"Closed now",
  closesAt:"Closes {t}",opensAt:"Opens {t}",closedDay:"Closed",today:"Today",
  days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
  wifiNet:"Network",wifiPass:"Password",copy:"Copy",copied:"Copied",
  review:"Review us on Google",reviewSub:"Share your experience, it means a lot to us.",
  order:"Order delivery",follow:"Follow us",
  vat:"All prices include VAT.",madeWith:"Made with",privacy:"Privacy",cookies:"Cookie settings"
 },
 ar:{
  welcome:"مرحباً بكم",best:"الأكثر مبيعاً",
  events:"الفعاليات",categories:"التصنيفات",
  swipe:"اسحب",back:"رجوع",portion:"الحصة",
  calories:"السعرات",allergens:"مسببات الحساسية",
  spicy:"الحار",sold:"نفد",dish:"طبق اليوم",
  reserve:"حجز",call:"اتصال",admin:"لوحة الإدارة",
  general:"عام",products:"القائمة",settings:"التصميم",
  save:"حفظ",search:"ابحث عن منتج...",
  add:"إضافة",edit:"تعديل",delete:"حذف",
  cancel:"إلغاء",saveProduct:"حفظ المنتج",
  saveCategory:"حفظ التصنيف",
  addCategory:"+ إضافة تصنيف",
  addProduct:"+ إضافة منتج",
  basic:"المعلومات الأساسية",
  advanced:"معلومات إضافية",
  hideAdvanced:"إخفاء المعلومات الإضافية",
  productName:"اسم المنتج",productPrice:"السعر",
  description:"الوصف",photo:"الصورة",
  categoryName:"اسم التصنيف",
  noProducts:"لا توجد منتجات.",
  noCategories:"لا توجد تصنيفات.",
  usd:"الدولار",eur:"اليورو",try:"الليرة التركية",
  translationInfo:"اكتب النص التركي وسيتم إنشاء الترجمات.",
  image:"اختر صورة",video:"اختر فيديو",
  results:"منتج",noResults:"لم يتم العثور على منتجات.",
  reserveWhatsApp:"احجز عبر واتساب",
  reserveCall:"احجز بالاتصال",
  reserveMsg:"مرحباً، أود الحجز لفعالية {event} ({date}).",
  date:"التاريخ",time:"الوقت",products_count:"منتج",
  hoursTitle:"ساعات العمل",openNow:"مفتوح الآن",closedNow:"مغلق الآن",
  closesAt:"يغلق {t}",opensAt:"يفتح {t}",closedDay:"مغلق",today:"اليوم",
  days:["الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"],
  wifiNet:"الشبكة",wifiPass:"كلمة المرور",copy:"نسخ",copied:"تم النسخ",
  review:"قيّمنا على Google",reviewSub:"شاركنا تجربتك، رأيك يهمنا.",
  order:"اطلب توصيل",follow:"تابعونا",
  vat:"جميع الأسعار تشمل ضريبة القيمة المضافة.",madeWith:"صُنع بواسطة",privacy:"الخصوصية",cookies:"إعدادات ملفات تعريف الارتباط"
 }
};

const DATA={
 name:"NEARMENU DEMO",
 subtitle:"Lezzetin en güzel hali burada.",
 subtitles:{
  tr:"Lezzetin en güzel hali burada.",
  en:"The finest flavours, all in one place.",
  ar:"ألذّ النكهات في مكان واحد."
 },
 phone:"+90 555 555 55 55",
 whatsapp:"905555555555",
 logo:"",
 rates:{USD:40,EUR:47,auto:true,updated:0},
 theme:{
  accent:"auto",accent2:"auto",
  text:"#F1EFEA",cardText:"#F1EFEA",
  price:"auto",overlay:.55,
  cardOpacity:.94,cardRadius:20,
  logoSize:112,titleSize:34,
  bodySize:13,fontFamily:"geist",
  titleFont:"Instrument Serif"
 },
 settings:{
  portion:true,calories:true,allergens:true,
  spicy:true,sold:true,hours:true,
  dish:true,featured:true,events:true,search:true,themeToggle:true
 },
 background:{
  type:"color",value:"#111110",
  image:"",video:""
 },
 hours:"09:00 - 23:00",
 info:defaultInfo(),
 categories:[],
 events:[]
};

/* Menü altı bilgi kartı: haftalık saatler, Wi-Fi, Google yorum, sosyal medya, paket servis */
function defaultInfo(){
 return {
  weekOn:false,
  week:Array.from({length:7},()=>({o:"09:00",c:"23:00",off:false})),
  wifiName:"",wifiPass:"",
  review:"",
  instagram:"",tiktok:"",facebook:"",x:"",
  yemeksepeti:"",getir:"",trendyol:"",migros:"",
  vat:true
 };
}

function normalizeInfo(v){
 const d=defaultInfo();
 const o=Object.assign(d,v&&typeof v==="object"?v:{});
 const okTime=x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(x||""));
 o.week=Array.from({length:7},(_,i)=>{
  const w=(Array.isArray(v?.week)&&v.week[i])||{};
  return {o:okTime(w.o)?w.o:"09:00",c:okTime(w.c)?w.c:"23:00",off:!!w.off};
 });
 ["wifiName","wifiPass","review","instagram","tiktok","facebook","x","yemeksepeti","getir","trendyol","migros"]
  .forEach(k=>{o[k]=String(o[k]??"").trim().slice(0,300)});
 o.weekOn=!!o.weekOn;
 o.vat=o.vat!==false;
 return o;
}

function isoDate(offsetDays){

 const d=new Date();
 d.setDate(d.getDate()+offsetDays);

 return d.getFullYear()+"-"+
  String(d.getMonth()+1).padStart(2,"0")+"-"+
  String(d.getDate()).padStart(2,"0");
}

/* =========================================================
   STORAGE
========================================================= */

function storageAvailable(){

 try{
  const x="__near_test__";
  localStorage.setItem(x,x);
  localStorage.removeItem(x);
  return true;
 }catch(e){return false}
}

function safeGet(key){

 if(!storageAvailable())return null;

 try{return localStorage.getItem(key)}
 catch(e){return null}
}

function safeSet(key,value){

 if(!storageAvailable())return false;

 try{
  localStorage.setItem(key,value);
  return true
 }catch(e){
  console.error(e);
  return false
 }
}

function mergeData(saved){

 if(!saved)return;

 Object.keys(saved).forEach(key=>{

  if(["theme","settings","background","rates"].includes(key)){

   DATA[key]=Object.assign(
    {},DATA[key]||{},saved[key]||{}
   );

  }else{

   DATA[key]=saved[key];

  }

 });

 DATA.theme=Object.assign({
  accent:"auto",accent2:"auto",
  text:"#F1EFEA",cardText:"#F1EFEA",
  price:"auto",overlay:.55,
  cardOpacity:.94,cardRadius:20,
  logoSize:112,titleSize:34,
  bodySize:13,fontFamily:"geist",
  titleFont:"Instrument Serif"
 },DATA.theme||{});

 DATA.settings=Object.assign({
  portion:true,calories:true,allergens:true,
  spicy:true,sold:true,hours:true,
  dish:true,featured:true,events:true,search:true,themeToggle:true
 },DATA.settings||{});

 DATA.background=Object.assign({
  type:"color",value:"#111110",
  image:"",video:""
 },DATA.background||{});

 DATA.rates=Object.assign({
  USD:40,EUR:47,auto:true,updated:0
 },DATA.rates||{});

 if(!DATA.subtitles||typeof DATA.subtitles!=="object")
  DATA.subtitles={tr:DATA.subtitle||""};

 if(!Array.isArray(DATA.categories))
  DATA.categories=[];

 if(!Array.isArray(DATA.events))
  DATA.events=[];

 DATA.info=normalizeInfo(DATA.info);

 DATA.events.forEach(ev=>{
  if(!ev.id)ev.id="event-"+Date.now()+Math.random();
  if(!ev.names)ev.names={};
  if(!ev.descriptions)ev.descriptions={};
  if(!ev.names.tr)ev.names.tr=ev.name||"";
  if(!ev.descriptions.tr)ev.descriptions.tr=ev.description||"";
 });

 DATA.categories.forEach(c=>{

  if(!c.id)c.id="cat-"+Date.now();

  if(!c.names)c.names={};
  if(!c.names.tr)c.names.tr=c.name||"";

  if(!Array.isArray(c.items))
   c.items=[];

  c.items.forEach(p=>{

   if(!p.id)
    p.id=newId()+Math.random();

   if(!p.names)p.names={};
   if(!p.descriptions)p.descriptions={};

   if(!p.names.tr)p.names.tr=p.name||"";
   if(!p.descriptions.tr)
    p.descriptions.tr=p.description||"";

   if(!Array.isArray(p.allergens))
    p.allergens=[];

   if(typeof p.sold==="undefined")p.sold=false;
   if(typeof p.featured==="undefined")p.featured=false;
   if(typeof p.dish==="undefined")p.dish=false;
   if(typeof p.spicy==="undefined")p.spicy=0;
   if(typeof p.video==="undefined")p.video="";
  });
 });
}

/* =========================================================
   BULUT (SUPABASE) BAĞLANTISI
   Menü sunucudan okunur; panel değişiklikleri sunucuya yazılır.
   Harici kütüphane yok: Supabase REST ve Auth API'leri fetch ile.
========================================================= */

const LOADER_HTML=`<div class="orbital-loader" role="img" aria-label="Yükleniyor"><div class="core-system"><div class="core-halo"></div><div class="core-outer-ring"></div><div class="core-secondary-ring"></div><div class="core-thin-ring"></div><div class="core-inner-glow"></div><div class="core-micro-center"></div></div><div class="pulse-system"><div class="pulse-ring pulse-ring-1"></div><div class="pulse-ring pulse-ring-2"></div><div class="pulse-ring pulse-ring-3"></div></div><div class="orbit-system orbit-1"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-circle"></div><div class="object-trail"></div></div></div><div class="orbit-system orbit-2"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-ring"></div></div></div><div class="orbit-system orbit-3"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-bright-point"></div></div></div><div class="orbit-system orbit-4"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-diamond"></div></div></div><div class="orbit-system orbit-5"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-line"></div></div></div><div class="orbit-system orbit-6"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-square"></div></div></div><div class="orbit-system orbit-7"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-fragment"></div></div></div><div class="particle-system"><div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div><div class="particle p6"></div><div class="particle p7"></div><div class="particle p8"></div><div class="particle p9"></div><div class="particle p10"></div><div class="particle p11"></div><div class="particle p12"></div><div class="particle p13"></div><div class="particle p14"></div><div class="particle p15"></div></div><div class="energy-fragments"><div class="energy-fragment ef1"></div><div class="energy-fragment ef2"></div><div class="energy-fragment ef3"></div></div></div>`;
const CLOUD=true;

/* Panel önizlemesi: menü, panelin içindeki çerçevede ?onizleme=1 ile açılır.
   Veriyi sunucudan değil panelden alır; hiçbir şey kaydetmez, ziyaret saymaz. */
const PREVIEW=(()=>{
 try{
  return window.parent!==window&&
   new URLSearchParams(location.search).has("onizleme")&&
   window.parent.location.origin===location.origin;
 }catch(e){return false}
})();
const SB_URL="https://rfwgjzkewtjpdcvrhepg.supabase.co";
const SB_KEY="sb_publishable_ohHiomyazD8qr_mQXX9G-Q_DCEeD8j2";
const MEDIA_BUCKET="menu-media";
const SESSION_KEY="ndMenuSession"; /* menü paneli kendi oturumunu tutar */
try{localStorage.removeItem("nearMenuSession")}catch(e){}

/* Kendi alan adımızda (neardiji.com) kısa adres kullanılır: neardiji.com/kebapci-ali */
/* Adresler: neardiji.com/menu = demo menü, neardiji.com/xfirma = müşterinin menüsü */
const PRETTY_URLS=!/github\.io$/i.test(location.hostname)&&!/^(localhost|127\.)/.test(location.hostname);

const RESTAURANT_SLUG=(()=>{
 let s="";
 try{s=new URLSearchParams(location.search).get("r")||""}catch(e){}
 if(!s){
  const parts=location.pathname.split("/").filter(Boolean);
  if(parts[0]==="menu")s=parts[1]||"";
  else if(parts[0]&&!/\.html?$/i.test(parts[0]))s=parts[0];
  if(/\.html?$/i.test(s))s="";
 }
 try{s=decodeURIComponent(s)}catch(e){}
 s=String(s).toLowerCase().replace(/[^a-z0-9-]/g,"");
 return s||"nearmenu-demo";
})();

/* ?r=xfirma ile gelindiyse adres çubuğunu kısa adrese çevir: neardiji.com/xfirma */
try{
 if(PRETTY_URLS&&new URLSearchParams(location.search).get("r"))
  history.replaceState(history.state,"","/"+RESTAURANT_SLUG+location.hash);
}catch(e){}

function publicMenuUrl(slug){
 return PRETTY_URLS
  ?location.origin+"/"+slug
  :new URL("./",location.href).href.split("?")[0]+"?r="+slug;
}

const cloud={
 ready:false,        /* menü en az bir kez yüklendi mi */
 state:"loading",    /* loading | ok | notfound | error */
 session:null,       /* {access_token, refresh_token, expires_at, user} */
 access:null,        /* {restaurant_id, role, super} */
 synced:null,        /* sunucudaki son hâlin özeti */
 lastJson:"",
 saving:false,
 pending:false,
 status:"saved",     /* saved | saving | error */
 timer:null,
 retryTimer:null,
 errorShown:false
};

function newId(){
 try{
  if(crypto&&crypto.randomUUID)return crypto.randomUUID();
 }catch(e){}
 const b=new Uint8Array(16);
 try{crypto.getRandomValues(b)}catch(e){for(let i=0;i<16;i++)b[i]=Math.random()*256|0}
 b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
 const h=[...b].map(x=>x.toString(16).padStart(2,"0")).join("");
 return h.slice(0,8)+"-"+h.slice(8,12)+"-"+h.slice(12,16)+"-"+h.slice(16,20)+"-"+h.slice(20);
}

function isUuid(v){
 return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v||""));
}

/* ---------- oturum ---------- */

function loadSession(){
 try{
  const raw=safeGet(SESSION_KEY);
  if(raw)cloud.session=JSON.parse(raw);
 }catch(e){cloud.session=null}
}

/* ---------- cihaz deposu (IndexedDB): oturum yedeği, menü önbelleği, cihazdaki görseller ---------- */

let dbPromise=null;

function openMediaDB(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  if(!("indexedDB" in window)){reject(new Error("IndexedDB yok."));return}
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=e=>{
   const db=e.target.result;
   if(!db.objectStoreNames.contains(MEDIA_STORE))db.createObjectStore(MEDIA_STORE);
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>{dbPromise=null;reject(req.error)};
 });
 return dbPromise;
}

async function mediaPut(key,value){
 const db=await openMediaDB();
 return new Promise((resolve,reject)=>{
  const req=db.transaction(MEDIA_STORE,"readwrite").objectStore(MEDIA_STORE).put(value,key);
  req.onsuccess=()=>resolve(true);
  req.onerror=()=>reject(req.error);
 });
}

async function mediaGet(key){
 try{
  const db=await openMediaDB();
  return await new Promise((resolve,reject)=>{
   const req=db.transaction(MEDIA_STORE,"readonly").objectStore(MEDIA_STORE).get(key);
   req.onsuccess=()=>resolve(req.result||null);
   req.onerror=()=>reject(req.error);
  });
 }catch(e){
  return null;
 }
}

function storeSession(s){
 cloud.session=s;
 if(s)safeSet(SESSION_KEY,JSON.stringify(s));
 else{try{localStorage.removeItem(SESSION_KEY)}catch(e){}}
 mediaPut("app:session",s||null).catch(()=>{});
}

async function loadSessionFromIdb(){
 if(cloud.session)return;
 try{
  const s=await mediaGet("app:session");
  if(s&&s.refresh_token)cloud.session=s;
 }catch(e){}
}

function sessionFromAuth(j){
 return {
  access_token:j.access_token,
  refresh_token:j.refresh_token,
  expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),
  user:j.user||cloud.session?.user||null
 };
}

async function authRequest(path,body,method){
 const r=await fetch(SB_URL+"/auth/v1/"+path,{
  method:method||"POST",
  headers:Object.assign(
   {"apikey":SB_KEY,"Content-Type":"application/json"},
   cloud.session&&method==="PUT"?{"Authorization":"Bearer "+cloud.session.access_token}:{}
  ),
  body:JSON.stringify(body||{})
 });
 let j={};
 try{j=await r.json()}catch(e){}
 if(!r.ok){
  const err=new Error(j.error_description||j.msg||j.message||("HTTP "+r.status));
  err.status=r.status;err.code=j.error_code||j.error||"";
  throw err;
 }
 return j;
}

async function signIn(email,password){
 const j=await authRequest("token?grant_type=password",{email,password});
 storeSession(sessionFromAuth(j));
 return cloud.session;
}

let refreshing=null;

async function refreshSession(){
 if(!cloud.session?.refresh_token)return null;
 if(refreshing)return refreshing;
 refreshing=(async()=>{
  try{
   const j=await authRequest("token?grant_type=refresh_token",{refresh_token:cloud.session.refresh_token});
   storeSession(sessionFromAuth(j));
   return cloud.session;
  }catch(e){
   if(e.status===400||e.status===401||e.status===403){
    storeSession(null);
    cloud.access=null;
   }
   throw e;
  }finally{
   refreshing=null;
  }
 })();
 return refreshing;
}

async function validSession(){
 if(!cloud.session)return null;
 const left=(cloud.session.expires_at||0)-Math.floor(Date.now()/1000);
 if(left<90){
  try{await refreshSession()}catch(e){return null}
 }
 return cloud.session;
}

async function updatePassword(password){
 await validSession();
 const j=await authRequest("user",{password,data:{must_change_password:false}},"PUT");
 if(cloud.session){
  cloud.session.user=j;
  storeSession(cloud.session);
 }
 return j;
}

async function signOut(){
 try{
  if(cloud.session)
   await fetch(SB_URL+"/auth/v1/logout",{method:"POST",headers:{"apikey":SB_KEY,"Authorization":"Bearer "+cloud.session.access_token}});
 }catch(e){}
 storeSession(null);
 cloud.access=null;
}

/* ---------- REST ---------- */

async function sb(path,opts={}){

 const doFetch=async()=>{
  const headers=Object.assign({"apikey":SB_KEY},opts.headers||{});
  if(opts.body!==undefined&&!(opts.body instanceof Blob))headers["Content-Type"]="application/json";
  if(opts.auth!==false&&cloud.session)headers["Authorization"]="Bearer "+cloud.session.access_token;
  return fetch(SB_URL+path,{
   method:opts.method||"GET",
   headers,
   body:opts.body===undefined?undefined:(opts.body instanceof Blob?opts.body:JSON.stringify(opts.body))
  });
 };

 if(opts.auth!==false&&cloud.session)await validSession();

 let r=await doFetch();

 if(r.status===401&&cloud.session&&opts.auth!==false){
  try{await refreshSession();r=await doFetch()}catch(e){}
 }

 if(!r.ok){
  let j={};
  try{j=await r.json()}catch(e){}
  const err=new Error(j.message||j.error||("HTTP "+r.status));
  err.status=r.status;
  throw err;
 }

 if(r.status===204)return null;
 const text=await r.text();
 return text?JSON.parse(text):null;
}

/* ---------- menüyü sunucudan oku ---------- */

async function fetchServerMenu(){
 return sb("/rest/v1/rpc/get_menu",{method:"POST",body:{p_slug:RESTAURANT_SLUG}});
}

function serverToData(m){

 const r=m.restaurant||{};
 const st=r.settings||{};

 return {
  restaurantId:r.id,
  name:r.name||"",
  subtitle:r.subtitle||"",
  subtitles:r.subtitles||{},
  phone:r.phone||"",
  whatsapp:r.whatsapp||"",
  hours:r.hours||"",
  logo:r.logo||"",
  info:st.info||{},
  theme:st.theme||{},
  settings:st.visibility||{},
  background:st.background||{},
  rates:st.rates||{},
  pdf:st.pdf||undefined,
  lastBulk:st.lastBulk||null,
  categories:(m.categories||[]).map(c=>({
   id:c.id,
   name:c.name||"",
   names:c.names||{},
   image:c.image||"",
   items:(c.items||[]).map(p=>({
    id:p.id,
    name:p.name||"",
    names:p.names||{},
    description:p.description||"",
    descriptions:p.descriptions||{},
    price:Number(p.price)||0,
    sold:!!p.sold,featured:!!p.featured,dish:!!p.dish,
    portion:p.portion||"",calories:p.calories||"",
    allergens:Array.isArray(p.allergens)?p.allergens:[],
    spicy:Number(p.spicy)||0,
    image:p.image||"",
    video:""
   }))
  })),
  events:(m.events||[]).map(e=>({
   id:e.id,
   name:e.name||"",
   names:e.names||{},
   description:e.description||"",
   descriptions:e.descriptions||{},
   date:e.event_date||"",
   time:e.event_time||"",
   image:e.image||""
  }))
 };
}

function applyServerMenu(m){

 const d=serverToData(m);

 if(d.pdf===undefined)delete d.pdf;

 DATA.categories=[];
 DATA.events=[];
 mergeData(d);

 cloud.synced=snapshotData();
}

async function cacheServerMenu(m){
 try{await mediaPut("cloud:"+RESTAURANT_SLUG,{m,t:Date.now()})}catch(e){}
}

async function loadCachedMenu(){
 try{
  const rec=await mediaGet("cloud:"+RESTAURANT_SLUG);
  return rec&&rec.m?rec.m:null;
 }catch(e){return null}
}

/* Sunucudan menüyü getirir; değiştiyse uygular. Dönüş: değişti mi */
async function refreshFromServer(force){

 const m=await fetchServerMenu();

 if(!m){
  cloud.state="notfound";
  cloud.ready=false;
  try{
   const t=await sb("/rest/v1/rpc/tenant_state",{method:"POST",body:{p_kind:"menu",p_slug:RESTAURANT_SLUG},auth:false});
   cloud.suspended=t&&(t.state==="expired"||t.state==="passive")?(t.name||""):null;
  }catch(e){cloud.suspended=null}
  return true;
 }

 const json=JSON.stringify(m);

 if(!force&&json===cloud.lastJson&&cloud.ready)return false;

 cloud.lastJson=json;
 applyServerMenu(m);
 cloud.ready=true;
 cloud.state="ok";
 cacheServerMenu(m);

 return true;
}

async function startCloud(){

 loadSession();
 await loadSessionFromIdb();

 const cached=await loadCachedMenu();

 if(cached&&!cloud.ready){
  cloud.lastJson=JSON.stringify(cached);
  applyServerMenu(cached);
  cloud.ready=true;
  cloud.state="ok";
  render({preserveWindowScroll:true});
 }

 try{
  const changed=await refreshFromServer(false);
  if(changed&&!adminOpen)render({preserveWindowScroll:true});
  trackVisitOnce();
  maybeUpdateRates();
  fetchMenuVersion().then(v=>{if(v)cloud.version=v});
 }catch(e){
  console.error(e);
  if(!cloud.ready){
   cloud.state="error";
   render();
  }
 }

 setInterval(pollServer,60000);

 document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible")pollServer();
 });

 window.addEventListener("online",()=>{
  if(cloud.status==="error"||cloud.pending)syncNow();
  pollServer();
 });

 window.addEventListener("beforeunload",e=>{
  if(cloud.saving||cloud.pending||cloud.status==="error"||hasUnsyncedChanges()){
   e.preventDefault();
   e.returnValue="";
  }
 });
}

/* Hafif değişiklik kontrolü (~40 bayt). Sadece değiştiyse menünün tamamı indirilir. */
async function fetchMenuVersion(){
 try{
  const v=await sb("/rest/v1/rpc/menu_version",{method:"POST",body:{p_slug:RESTAURANT_SLUG},auth:false});
  return v==null?"yok":String(v);
 }catch(e){return null}
}

async function pollServer(){

 if(document.visibilityState==="hidden")return;
 if(adminOpen||selectedProduct||selectedEvent||searchOpen)return;

 try{
  const v=await fetchMenuVersion();
  if(v&&cloud.version&&v===cloud.version)return;
  const changed=await refreshFromServer(false);
  if(v)cloud.version=v;
  if(changed)maybeUpdateRates();
  if(changed&&!adminOpen&&!selectedProduct&&!selectedEvent)render({preserveWindowScroll:true});
 }catch(e){}
}

function trackVisitOnce(){
 try{
  const key="nearMenuVisit:"+RESTAURANT_SLUG;
  if(sessionStorage.getItem(key))return;
  sessionStorage.setItem(key,"1");
 }catch(e){}
 sb("/rest/v1/rpc/track_visit",{method:"POST",body:{p_slug:RESTAURANT_SLUG},auth:false}).catch(()=>{});
}

function renderCloudState(){

 if(cloud.state==="notfound"){
  return `
  <div class="cloudState">
   <div class="cloudStateIcon">🍽</div>
   <h2>${cloud.suspended!==null&&cloud.suspended!==undefined?"Menü geçici olarak hizmet dışı":"Menü şu an yayında değil"}</h2>
   <p>${cloud.suspended!==null&&cloud.suspended!==undefined?esc(cloud.suspended||"Bu işletme")+" menüsü şu an yayında değil. Lütfen işletmeye danışın.":"Bu adreste açık bir menü bulunamadı. Lütfen işletmeye danışın."}</p>
  </div>`;
 }

 if(cloud.state==="error"){
  return `
  <div class="cloudState">
   <div class="cloudStateIcon">📶</div>
   <h2>Menü yüklenemedi</h2>
   <p>İnternet bağlantınızı kontrol edip tekrar deneyin.</p>
   <button class="adminButton gold" id="cloudRetry">Tekrar Dene</button>
  </div>`;
 }

 return `
 <div class="cloudState">
  ${LOADER_HTML}
  <p>Menü yükleniyor...</p>
 </div>`;
}

/* ---------- değişiklikleri sunucuya yaz ---------- */

function categoryRow(c,i,rid){
 return {
  id:c.id,restaurant_id:rid,
  name:c.name||"",
  names:Object.assign({},c.names||{},{tr:c.name||""}),
  image:cleanMediaRef(c.image),
  sort:i
 };
}

function productRow(p,i,cid,rid){
 return {
  id:p.id,restaurant_id:rid,category_id:cid,
  name:p.name||"",
  names:Object.assign({},p.names||{},{tr:p.name||""}),
  description:p.description||"",
  descriptions:Object.assign({},p.descriptions||{},{tr:p.description||""}),
  price:Math.max(0,Number(p.price)||0),
  sold:!!p.sold,featured:!!p.featured,dish:!!p.dish,
  portion:String(p.portion||""),calories:String(p.calories||""),
  allergens:Array.isArray(p.allergens)?p.allergens.map(String):[],
  spicy:Math.max(0,Math.min(5,Number(p.spicy)||0)),
  image:cleanMediaRef(p.image),
  sort:i
 };
}

function eventRow(e,i,rid){
 return {
  id:e.id,restaurant_id:rid,
  name:e.name||"",
  names:Object.assign({},e.names||{},{tr:e.name||""}),
  description:e.description||"",
  descriptions:Object.assign({},e.descriptions||{},{tr:e.description||""}),
  event_date:/^\d{4}-\d{2}-\d{2}$/.test(e.date||"")?e.date:null,
  event_time:e.time||"",
  image:cleanMediaRef(e.image),
  sort:i
 };
}

/* Bu cihaza özel (IndexedDB) referanslar sunucuya yazılmaz */
function cleanMediaRef(v){
 v=String(v||"");
 return v.startsWith("indexeddb:")?"":v;
}

function restaurantRow(){
 return {
  name:DATA.name||"",
  subtitle:DATA.subtitle||"",
  subtitles:DATA.subtitles||{},
  phone:DATA.phone||"",
  whatsapp:DATA.whatsapp||"",
  hours:DATA.hours||"",
  logo:cleanMediaRef(DATA.logo),
  settings:{
   theme:DATA.theme,
   visibility:DATA.settings,
   background:Object.assign({},DATA.background,{
    image:cleanMediaRef(DATA.background?.image),
    video:cleanMediaRef(DATA.background?.video)
   }),
   rates:{USD:DATA.rates.USD,EUR:DATA.rates.EUR,auto:!!DATA.rates.auto,updated:DATA.rates.updated||0},
   pdf:DATA.pdf||null,
   lastBulk:DATA.lastBulk||null,
   info:normalizeInfo(DATA.info)
  }
 };
}

/* Yeni öğelere sunucunun kabul edeceği kimlik ver */
function ensureIds(){

 const fix=(obj,kind)=>{
  if(isUuid(obj.id))return;
  const old=obj.id;
  obj.id=newId();
  if(kind==="c"&&adminCategoryView===old)adminCategoryView=obj.id;
  if(kind==="p"&&adminProductView===old)adminProductView=obj.id;
  if(kind==="e"&&adminEventView===old)adminEventView=obj.id;
 };

 DATA.categories.forEach(c=>{
  fix(c,"c");
  (c.items||[]).forEach(p=>fix(p,"p"));
 });

 DATA.events.forEach(e=>fix(e,"e"));
}

function snapshotData(){

 ensureIds();

 const rid=DATA.restaurantId;
 const snap={restaurant:JSON.stringify(restaurantRow()),categories:{},products:{},events:{}};

 DATA.categories.forEach((c,i)=>{
  snap.categories[c.id]=JSON.stringify(categoryRow(c,i,rid));
  (c.items||[]).forEach((p,j)=>{
   snap.products[p.id]=JSON.stringify(productRow(p,j,c.id,rid));
  });
 });

 DATA.events.forEach((e,i)=>{
  snap.events[e.id]=JSON.stringify(eventRow(e,i,rid));
 });

 return snap;
}

function diffSnap(prev,cur){

 const d={restaurant:null,upsert:{categories:[],products:[],events:[]},remove:{categories:[],products:[],events:[]}};

 if(!prev||prev.restaurant!==cur.restaurant)d.restaurant=JSON.parse(cur.restaurant);

 ["categories","products","events"].forEach(t=>{
  Object.keys(cur[t]).forEach(id=>{
   if(!prev||prev[t][id]!==cur[t][id])d.upsert[t].push(JSON.parse(cur[t][id]));
  });
  if(prev){
   Object.keys(prev[t]).forEach(id=>{
    if(!(id in cur[t]))d.remove[t].push(id);
   });
  }
 });

 return d;
}

function hasUnsyncedChanges(){
 if(!canWrite()||!cloud.synced)return false;
 const d=diffSnap(cloud.synced,snapshotData());
 return !!(d.restaurant||Object.values(d.upsert).some(a=>a.length)||Object.values(d.remove).some(a=>a.length));
}

function canWrite(){
 return !!(cloud.session&&cloud.access&&cloud.access.role&&DATA.restaurantId&&cloud.access.restaurant_id===DATA.restaurantId);
}

function scheduleSync(delay){
 clearTimeout(cloud.timer);
 cloud.timer=setTimeout(syncNow,delay??500);
}

function setSyncStatus(s){
 cloud.status=s;
 const el=$("syncStatus");
 if(el){
  el.className="syncStatus "+s;
  el.textContent=s==="saving"?"Kaydediliyor...":s==="error"?"Kaydedilemedi • tekrar denenecek":"✓ Kaydedildi";
 }
}

async function syncNow(){

 if(!canWrite())return;

 if(cloud.saving){
  cloud.pending=true;
  return;
 }

 clearTimeout(cloud.timer);
 clearTimeout(cloud.retryTimer);

 const cur=snapshotData();
 const d=diffSnap(cloud.synced,cur);
 const rid=DATA.restaurantId;

 const nothing=!d.restaurant&&!Object.values(d.upsert).some(a=>a.length)&&!Object.values(d.remove).some(a=>a.length);

 if(nothing){
  setSyncStatus("saved");
  flushMediaDeletes();
  return;
 }

 cloud.saving=true;
 cloud.pending=false;
 setSyncStatus("saving");

 const upsert=(table,rows)=>rows.length?sb("/rest/v1/"+table+"?on_conflict=id",{
  method:"POST",
  headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},
  body:rows
 }):null;

 const remove=(table,ids)=>ids.length?sb("/rest/v1/"+table+"?id=in.("+ids.join(",")+")",{
  method:"DELETE",
  headers:{"Prefer":"return=minimal"}
 }):null;

 try{

  if(d.restaurant){
   await sb("/rest/v1/restaurants?id=eq."+rid,{
    method:"PATCH",
    headers:{"Prefer":"return=minimal"},
    body:d.restaurant
   });
  }

  await upsert("categories",d.upsert.categories);
  await upsert("products",d.upsert.products);
  await upsert("events",d.upsert.events);

  await remove("products",d.remove.products);
  await remove("events",d.remove.events);
  await remove("categories",d.remove.categories);

  cloud.synced=cur;
  cloud.errorShown=false;
  setSyncStatus("saved");
  flushMediaDeletes();

 }catch(e){

  console.error("Senkron hatası:",e);
  setSyncStatus("error");

  if(!cloud.errorShown){
   cloud.errorShown=true;
   showToast(
    e.status===401||e.status===403
    ?"⚠️ Oturum süresi doldu veya yetki yok. Lütfen tekrar giriş yapın."
    :"⚠️ Değişiklikler sunucuya kaydedilemedi. İnternet gelince tekrar denenecek."
   );
  }

  cloud.retryTimer=setTimeout(syncNow,8000);

 }finally{

  cloud.saving=false;

  if(cloud.pending){
   cloud.pending=false;
   scheduleSync(200);
  }
 }
}

/* ---------- fotoğraf yükleme ---------- */

function mediaPublicUrl(path){
 return NDMedia.url(MEDIA_BUCKET,path);
}

async function uploadMedia(type,id,blob){

 const rid=DATA.restaurantId;
 const mime=blob.type||"image/jpeg";
 const ext=mime.includes("png")?"png":mime.includes("webp")?"webp":mime.includes("gif")?"gif":
           mime.includes("mp4")?"mp4":mime.includes("webm")?"webm":mime.includes("quicktime")?"mov":"jpg";
 const path=rid+"/"+type+"/"+String(id).replace(/[^a-zA-Z0-9-]/g,"")+"-"+Date.now()+"."+ext;

 await validSession();
 if(!cloud.session)throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın.");
 return await NDMedia.put(MEDIA_BUCKET,path,blob.type?blob:new Blob([blob],{type:mime}),cloud.session.access_token);
}

async function deleteServerMedia(url){
 const x=NDMedia.parse(url);
 if(!x||x.bucket!==MEDIA_BUCKET||!canWrite()||!x.path.startsWith(DATA.restaurantId+"/"))return;
 try{
  await validSession();
  if(cloud.session)await NDMedia.del(url,cloud.session.access_token);
 }catch(e){}
}

/* ---------- yetki ---------- */

async function loadAccess(){
 const a=await sb("/rest/v1/rpc/get_my_access",{method:"POST",body:{p_slug:RESTAURANT_SLUG}});
 cloud.access=a&&a.role?a:null;
 return cloud.access;
}

/* Logoya 3 sn basınca: oturum geçerliyse doğrudan panel, değilse giriş ekranı */
async function openAdminFlow(){

 if(PREVIEW)return;

 adminOpen=true;
 adminAuthenticated=false;
 adminTab="general";
 adminCategoryView=null;
 adminProductView=null;
 adminEventView=null;
 advancedProduct=false;
 savedAdminScroll=0;
 loginStep="checking";

 pushLayer();
 render();

 if(await validSession()){
  try{
   if(await loadAccess()){
    await enterAdmin();
    return;
   }
  }catch(e){}
 }

 loginStep="login";
 render();
 setTimeout(()=>$("loginEmail")?.focus(),60);
}

async function enterAdmin(){

 if(cloud.session?.user?.user_metadata?.must_change_password){
  loginStep="newPassword";
  render();
  setTimeout(()=>$("newPassword1")?.focus(),60);
  return;
 }

 /* Düzenlemeden önce en güncel menüyü al */
 try{await refreshFromServer(true)}catch(e){}

 adminAuthenticated=true;
 loginStep="login";
 render();
 setSyncStatus("saved");
 maybeWelcome();
}

let loginStep="login";

/* Giriş ekranındaki tema seçimi yönetim panelinin modudur (nmPanelMode) */
NDGiris.temaAyar({
 oku:()=>panelMode(),
 yaz:t=>{safeSet("nmPanelMode",t);applyTheme()}
});

function renderCloudLogin(){

 if(!adminOpen||adminAuthenticated)return "";

 const G=NDGiris;
 const lastEmail=safeGet("nearMenuLastEmail")||"";

 let body="";

 if(loginStep==="checking"){

  body=G.baslik("NearMenu")+G.yukleniyor("Oturum kontrol ediliyor...");

 }else if(loginStep==="newPassword"){

  body=
   G.baslik("Yeni Şifre","İlk girişiniz. Geçici şifre yerine kendi şifrenizi belirleyin (en az 8 karakter).")+
   G.alan({id:"newPassword1",tur:"password",yer:"Yeni şifre",oto:"new-password"})+
   G.alan({id:"newPassword2",tur:"password",yer:"Yeni şifre (tekrar)",oto:"new-password"})+
   G.buton("setPasswordButton","Şifreyi Kaydet")+
   G.hata("loginError","loginError");

 }else{

  body=
   G.baslik("Hoş Geldiniz",`${DATA.name||"Restoran"} menüsünü düzenlemek için giriş yapın.`)+
   G.alan({id:"loginEmail",tur:"email",yer:"E-posta",deger:lastEmail})+
   G.alan({id:"loginPassword",tur:"password",yer:"Şifre"})+
   G.buton("cloudLoginButton","Giriş Yap")+
   G.hata("loginError","loginError")+
   `<p class="ndg-foot">Hesabınız yok mu? Hesaplar işletmenize özel olarak açılır.<br><button class="ndg-link" id="forgotPassword" type="button">Şifremi unuttum</button></p>`;
 }

 return `<div class="adminLoginOverlay">${G.sayfa(body,{kapat:"loginClose"})}</div>`;
}

function showLoginError(msg){
 const el=$("loginError");
 if(el){el.textContent=msg;el.style.display="block"}
}

function bindCloudLogin(){

 $("loginClose")?.addEventListener("click",()=>{
  adminOpen=false;
  render({preserveWindowScroll:true});
 });

 const doLogin=async()=>{

  const email=($("loginEmail")?.value||"").trim().toLowerCase();
  const password=$("loginPassword")?.value||"";
  const btn=$("cloudLoginButton");

  if(!email||!password){showLoginError("E-posta ve şifreyi girin.");return}

  btn.disabled=true;btn.textContent="Giriş yapılıyor...";

  try{

   await signIn(email,password);
   safeSet("nearMenuLastEmail",email);

   if(!await loadAccess()){
    await signOut();
    btn.disabled=false;btn.textContent="Giriş Yap";
    showLoginError("Bu hesap bu restoranın yöneticisi değil.");
    return;
   }

   await enterAdmin();

  }catch(e){

   btn.disabled=false;btn.textContent="Giriş Yap";

   /* yalnız gerçek bağlantı hatasında "internet" denir; diğer hatalar ayrı gösterilir */
   const baglanti=e instanceof TypeError&&/fetch|network|load failed/i.test(e.message||"");
   if(!baglanti&&!e.status)console.error("Giriş hatası:",e);
   showLoginError(
    e.status===400||e.code==="invalid_credentials"
    ?"E-posta veya şifre yanlış."
    :e.status===429
    ?"Çok fazla deneme yapıldı. Biraz bekleyip tekrar deneyin."
    :baglanti
    ?"Giriş yapılamadı. İnternet bağlantısını kontrol edin."
    :e.status
    ?"Sunucu şu an yanıt vermiyor ("+e.status+"). Biraz sonra tekrar deneyin."
    :"Giriş sırasında beklenmeyen bir hata oluştu. Sayfayı yenileyip tekrar deneyin."
   );
  }
 };

 $("cloudLoginButton")?.addEventListener("click",doLogin);
 $("loginPassword")?.addEventListener("keydown",e=>{if(e.key==="Enter")doLogin()});
 $("loginEmail")?.addEventListener("keydown",e=>{if(e.key==="Enter")$("loginPassword")?.focus()});

 $("forgotPassword")?.addEventListener("click",async()=>{

  const email=($("loginEmail")?.value||"").trim().toLowerCase();

  if(!email){showLoginError("Önce e-posta adresinizi yazın.");return}

  try{
   await authRequest("recover",{email});
   showLoginError("Şifre sıfırlama bağlantısı gönderildi (geldiyse). Gelmezse yöneticinizle iletişime geçin.");
  }catch(e){
   showLoginError("Şifre sıfırlama e-postası gönderilemedi. Yöneticinizle iletişime geçin.");
  }
 });

 const setPw=async()=>{

  const a=$("newPassword1")?.value||"";
  const b=$("newPassword2")?.value||"";
  const btn=$("setPasswordButton");

  if(a.length<8){showLoginError("Şifre en az 8 karakter olmalı.");return}
  if(a!==b){showLoginError("Şifreler aynı değil.");return}

  btn.disabled=true;btn.textContent="Kaydediliyor...";

  try{
   await updatePassword(a);
   showToast("✓ Şifreniz kaydedildi");
   await enterAdmin();
  }catch(e){
   btn.disabled=false;btn.textContent="Şifreyi Kaydet ve Devam Et";
   showLoginError(
    String(e.message||"").toLowerCase().includes("different")
    ?"Yeni şifre eskisinden farklı olmalı."
    :"Şifre kaydedilemedi: "+(e.message||"bilinmeyen hata")
   );
  }
 };

 $("setPasswordButton")?.addEventListener("click",setPw);
 $("newPassword2")?.addEventListener("keydown",e=>{if(e.key==="Enter")setPw()});

 $("cloudRetry")?.addEventListener("click",async()=>{
  cloud.state="loading";
  render();
  try{
   await refreshFromServer(true);
  }catch(e){
   cloud.state="error";
  }
  render();
 });
}

/* ---------- JSON yedek ---------- */

function backupCard(){
 return `
 <div class="adminCard">
  <div class="adminCardTitle">💾 Yedek</div>
  <div class="adminCardDescription">
   Menünün tamamını (kategoriler, ürünler, etkinlikler, ayarlar) tek bir JSON dosyası olarak indirin ya da eski bir yedeği geri yükleyin.
   Görseller dosyada bağlantı olarak durur. Geri yükleme mevcut menünün yerine geçer.
  </div>
  <button class="adminButton gold full" id="backupDown">⬇ JSON Yedek İndir</button>
  <button class="adminButton full" id="backupUp" style="margin-top:8px">⬆ JSON Yedek Yükle</button>
  <input type="file" id="backupFile" accept="application/json,.json" hidden>
 </div>`;
}

function backupExport(){
 collectAdmin();
 ensureIds();
 const rid=DATA.restaurantId;
 const o={
  format:"nearmenu-yedek",surum:1,tarih:new Date().toISOString(),adres:RESTAURANT_SLUG,
  menu:{
   restaurant:restaurantRow(),
   categories:DATA.categories.map((c,i)=>Object.assign(categoryRow(c,i,rid),{items:(c.items||[]).map((p,j)=>productRow(p,j,c.id,rid))})),
   events:DATA.events.map((e,i)=>eventRow(e,i,rid))
  }
 };
 const a=document.createElement("a");
 const u=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:"application/json"}));
 a.href=u;a.download=RESTAURANT_SLUG+"-menu-yedek-"+new Date().toISOString().slice(0,10)+".json";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),4000);
 showToast("✓ Yedek indirildi.");
}

function backupImport(file){
 if(!file)return;
 if(file.size>8*1024*1024){alert("Dosya çok büyük (en fazla 8 MB).");return}
 const rd=new FileReader();
 rd.onerror=()=>alert("Dosya okunamadı.");
 rd.onload=async()=>{
  let o;
  try{o=JSON.parse(String(rd.result))}catch(e){alert("Bu dosya geçerli bir JSON değil.");return}
  const m=o&&o.format==="nearmenu-yedek"?o.menu:null;
  if(!m||!m.restaurant||!Array.isArray(m.categories)||!Array.isArray(m.events||[])){alert("Bu dosya bir NearMenu yedeği değil.");return}
  const nProd=m.categories.reduce((a,c)=>a+(Array.isArray(c.items)?c.items.length:0),0);
  if(m.categories.length>200||nProd>3000||(m.events||[]).length>300){alert("Yedek çok büyük.");return}
  if(!canWrite()){alert("Bu menüyü düzenleme yetkiniz yok.");return}
  if(!confirm("Mevcut menü silinip bu yedekle ("+m.categories.length+" kategori, "+nProd+" ürün) değiştirilsin mi? Bu işlem geri alınamaz.")){return}
  /* kimlikler yeniden üretilir: başka bir restorana ait yedek de güvenle yüklenir */
  const cats=m.categories.map(c=>{
   const id=newId();
   return Object.assign({},c,{id,items:(Array.isArray(c.items)?c.items:[]).map(p=>Object.assign({},p,{id:newId(),category_id:id}))});
  });
  const evs=(m.events||[]).map(e=>Object.assign({},e,{id:newId()}));
  const d=serverToData({restaurant:Object.assign({},m.restaurant,{id:DATA.restaurantId}),categories:cats,events:evs});
  if(d.pdf===undefined)delete d.pdf;
  const rid=DATA.restaurantId;
  DATA.categories=[];
  DATA.events=[];
  mergeData(d);
  DATA.restaurantId=rid;
  adminCategoryView=null;adminProductView=null;adminEventView=null;
  try{
   await syncNow();
   showToast(cloud.status==="error"?"⚠ Yedek yüklendi ama kaydedilemedi, tekrar denenecek.":"✓ Yedek yüklendi.");
  }catch(e){showToast("⚠ Yedek kaydedilemedi.")}
  render();
 };
 rd.readAsText(file);
}

function renderAccountCard(){

 const email=cloud.session?.user?.email||"";
 const role=cloud.access?.super?"Süper yönetici":cloud.access?.role==="staff"?"Personel":"Restoran sahibi";

 return `
 <div class="adminCard">

  <div class="adminCardTitle">🔐 Hesap</div>

  <div class="adminCardDescription">
   ${esc(email)} • ${role}<br>
   Menü adresi: <b>${esc(publicMenuUrl(RESTAURANT_SLUG).replace(/^https?:\/\//,""))}</b>
  </div>

  <div class="field">
   <label>Yeni şifre (en az 8 karakter)</label>
   <input id="accountPw1" type="password" autocomplete="new-password">
  </div>

  <div class="field">
   <label>Yeni şifre tekrar</label>
   <input id="accountPw2" type="password" autocomplete="new-password">
  </div>

  <button class="adminButton gold full" id="accountQr" style="margin-bottom:8px">▦ Menü QR Kodu (indir)</button>

  <button class="adminButton gold full" id="accountChangePw">🔐 Şifreyi Değiştir</button>

  <button class="adminButton full" id="accountLogout" style="margin-top:8px">Çıkış Yap</button>

  ${cloud.access?.super?`<a class="adminButton gold full" href="/821/?k=menu" target="_blank" rel="noopener" style="margin-top:8px">🛠 Süper Yönetici Paneli (menüler ve kataloglar)</a>`:""}

 </div>`;
}

function bindAccountCard(){

 $("backupDown")?.addEventListener("click",backupExport);
 $("backupUp")?.addEventListener("click",()=>$("backupFile")?.click());
 $("backupFile")?.addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];e.target.value="";backupImport(f)});

 $("accountQr")?.addEventListener("click",()=>NDQR.open({url:publicMenuUrl(RESTAURANT_SLUG),title:(DATA&&DATA.name)||"Menü QR Kodu",file:RESTAURANT_SLUG}));

 $("accountChangePw")?.addEventListener("click",async()=>{

  const a=$("accountPw1")?.value||"";
  const b=$("accountPw2")?.value||"";

  if(a.length<8){alert("Şifre en az 8 karakter olmalı.");return}
  if(a!==b){alert("Şifreler aynı değil.");return}

  try{
   await updatePassword(a);
   $("accountPw1").value="";$("accountPw2").value="";
   showToast("✓ Şifre değiştirildi");
  }catch(e){
   alert("Şifre değiştirilemedi: "+(e.message||""));
  }
 });

 $("accountLogout")?.addEventListener("click",async()=>{

  collectAdmin();
  await syncNow();

  await signOut();

  adminOpen=false;
  adminAuthenticated=false;
  adminCategoryView=null;
  adminProductView=null;
  adminEventView=null;

  render({preserveWindowScroll:true});
  showToast("Çıkış yapıldı");
 });
}

/* Menü sunucudan gelecek; o gelene kadar boş başla */
 DATA.categories=[];
 DATA.events=[];
 DATA.name="";
 DATA.subtitle="";
 DATA.subtitles={};
 DATA.phone="";
 DATA.whatsapp="";
 DATA.hours="";
 DATA.info=defaultInfo();

function saveData(){

 if(PREVIEW)return true;

 postPreview();

 if(CLOUD){
  if(canWrite())scheduleSync();
  return true;
 }

 return false;
}
function mediaKey(type,id){
 return "nearMedia:"+type+":"+id;
}

const mediaUrlCache=new Map();

function mediaAttr(value){
 const u=cachedMediaUrl(value);
 return `data-media-ref="${esc(value)}"`+(u?` src="${esc(u)}"`:"");
}

function cachedMediaUrl(value){

 if(!value)return "";

 if(!String(value).startsWith("indexeddb:"))
  return value;

 return mediaUrlCache.get(String(value).replace("indexeddb:",""))||"";
}

function forgetMediaUrl(value){

 if(!value||!String(value).startsWith("indexeddb:"))return;

 const key=String(value).replace("indexeddb:","");
 const url=mediaUrlCache.get(key);

 if(url){
  URL.revokeObjectURL(url);
  mediaUrlCache.delete(key);
 }
}

async function loadMediaReference(value){

 if(!value)return "";

 if(!String(value).startsWith("indexeddb:"))
  return value;

 const key=String(value).replace("indexeddb:","");

 if(mediaUrlCache.has(key))
  return mediaUrlCache.get(key);

 const blob=await mediaGet(key);

 if(!blob)return "";

 const url=URL.createObjectURL(blob);
 mediaUrlCache.set(key,url);

 return url;
}

/* =========================================================
   FOTOĞRAF KÜÇÜLTME
========================================================= */

/* =========================================================
   LOGO: arka planı kaldır, boşluğu kırp, şeffaf PNG yap
   Düz zeminli logolar için kenarlardan renk doldurma. Logonun
   içindeki zemin rengi korunur, sadece dışarıdan ulaşılan zemin silinir.
========================================================= */

function logoIsFree(){
 return !!(DATA.theme&&DATA.theme.logoStyle==="free");
}

function prepareLogo(file){

 return new Promise(resolve=>{

  if(!file||!/^image\/(png|jpe?g|webp)$/i.test(file.type)){
   resolve(null);
   return;
  }

  const url=URL.createObjectURL(file);
  const img=new Image();

  img.onload=()=>{

   URL.revokeObjectURL(url);

   try{

    const scale=Math.min(1,700/Math.max(img.naturalWidth,img.naturalHeight));
    const w=Math.max(1,Math.round(img.naturalWidth*scale));
    const h=Math.max(1,Math.round(img.naturalHeight*scale));

    const c=document.createElement("canvas");
    c.width=w;c.height=h;
    const ctx=c.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(img,0,0,w,h);

    const data=ctx.getImageData(0,0,w,h);
    removeLogoBackground(data,w,h);
    ctx.putImageData(data,0,0);

    const box=logoBounds(data.data,w,h);
    if(!box){resolve(null);return}

    const out=document.createElement("canvas");
    out.width=box.w;out.height=box.h;
    out.getContext("2d").drawImage(c,box.x,box.y,box.w,box.h,0,0,box.w,box.h);

    out.toBlob(blob=>resolve(blob||null),"image/png");

   }catch(e){
    resolve(null);
   }
  };

  img.onerror=()=>{
   URL.revokeObjectURL(url);
   resolve(null);
  };

  img.src=url;
 });
}

function removeLogoBackground(img,w,h){

 const d=img.data,N=w*h;
 const border=[];

 for(let x=0;x<w;x++)border.push(x,(h-1)*w+x);
 for(let y=1;y<h-1;y++)border.push(y*w,y*w+w-1);

 /* Kenarlar zaten şeffafsa (hazır PNG) dokunma */
 let clear=0;
 border.forEach(p=>{if(d[p*4+3]<16)clear++});
 if(clear/border.length>.6)return;

 /* Zemin rengi: kenar piksellerinin medyanı */
 const bg=[0,1,2].map(k=>{
  const a=border.map(p=>d[p*4+k]).sort((m,n)=>m-n);
  return a[a.length>>1];
 });

 const dist=p=>{
  const r=d[p*4]-bg[0],g=d[p*4+1]-bg[1],b=d[p*4+2]-bg[2];
  return Math.sqrt(r*r+g*g+b*b);
 };

 const lo=19,hi=63;
 const seen=new Uint8Array(N);
 const stack=[];

 border.forEach(p=>{if(!seen[p]&&dist(p)<hi){seen[p]=1;stack.push(p)}});

 while(stack.length){
  const p=stack.pop(),px=p%w;
  if(px>0&&!seen[p-1]&&dist(p-1)<hi){seen[p-1]=1;stack.push(p-1)}
  if(px<w-1&&!seen[p+1]&&dist(p+1)<hi){seen[p+1]=1;stack.push(p+1)}
  if(p>=w&&!seen[p-w]&&dist(p-w)<hi){seen[p-w]=1;stack.push(p-w)}
  if(p+w<N&&!seen[p+w]&&dist(p+w)<hi){seen[p+w]=1;stack.push(p+w)}
 }

 for(let p=0;p<N;p++){

  if(!seen[p])continue;

  let a=(dist(p)-lo)/(hi-lo);
  a=a<=0?0:a>=1?1:a*a*(3-2*a);

  if(a===0){d[p*4+3]=0;continue}

  /* Kenara karışan zemin rengini temizle */
  for(let k=0;k<3;k++){
   const v=(d[p*4+k]-bg[k]*(1-a))/a;
   d[p*4+k]=v<0?0:v>255?255:v;
  }

  d[p*4+3]=Math.round(d[p*4+3]*a);
 }
}

function logoBounds(d,w,h){

 let x0=w,y0=h,x1=-1,y1=-1;

 for(let y=0;y<h;y++){
  for(let x=0;x<w;x++){
   if(d[(y*w+x)*4+3]>10){
    if(x<x0)x0=x;
    if(x>x1)x1=x;
    if(y<y0)y0=y;
    if(y>y1)y1=y;
   }
  }
 }

 if(x1<0)return null;

 const pad=Math.round(Math.max(x1-x0,y1-y0)*.04);
 x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);
 x1=Math.min(w-1,x1+pad);y1=Math.min(h-1,y1+pad);

 return {x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};
}

function compressImage(file,maxSize,keepAlpha){

 return new Promise(resolve=>{

  if(!file||!file.type.startsWith("image/")||file.type==="image/gif"||file.type==="image/svg+xml"){
   resolve(file);
   return;
  }

  const url=URL.createObjectURL(file);
  const img=new Image();

  img.onload=()=>{

   URL.revokeObjectURL(url);

   const scale=Math.min(1,maxSize/Math.max(img.naturalWidth,img.naturalHeight));
   const w=Math.max(1,Math.round(img.naturalWidth*scale));
   const h=Math.max(1,Math.round(img.naturalHeight*scale));

   const canvas=document.createElement("canvas");
   canvas.width=w;canvas.height=h;

   const ctx=canvas.getContext("2d");
   const png=keepAlpha&&file.type==="image/png";

   if(!png){
    ctx.fillStyle="#111";
    ctx.fillRect(0,0,w,h);
   }

   ctx.drawImage(img,0,0,w,h);

   canvas.toBlob(blob=>{
    resolve(blob&&blob.size<file.size?blob:file);
   },png?"image/png":"image/jpeg",.82);
  };

  img.onerror=()=>{
   URL.revokeObjectURL(url);
   resolve(file);
  };

  img.src=url;
 });
}

/* =========================================================
   OTOMATİK ÇEVİRİ
========================================================= */

async function translateText(text,target){

 text=String(text||"").trim();

 if(!text)return "";

 try{

  /* Panel kullanıcısı için Cloudflare yapay zekâ çevirisi (medya sunucusu üzerinden) */
  if(cloud.session&&text.length<=600){
   await validSession();
   const r=await fetch(NDMedia.base+"/translate",{
    method:"POST",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+cloud.session.access_token},
    body:JSON.stringify({text,target})
   });
   if(r.ok){
    const j=await r.json();
    if(j&&j.text)return j.text;
   }
  }

 }catch(e){}

 try{

  const r=await fetch(
   "https://api.mymemory.translated.net/get?langpair=tr|"+
   target+"&q="+encodeURIComponent(text)
  );

  if(r.ok){
   const j=await r.json();
   const out=j?.responseData?.translatedText;
   if(out&&j.responseStatus===200)return out;
  }

 }catch(e){}

 return "";
}

/* Bir öğenin boş EN/AR alanlarını doldurur.
   Dönüş: doldurulan alan sayısı, -1 = bağlantı hatası */
async function fillTranslations(item,hasDescription){

 if(!item)return 0;

 if(!item.names)item.names={};
 if(hasDescription&&!item.descriptions)item.descriptions={};

 item.names.tr=item.name||"";
 if(hasDescription)item.descriptions.tr=item.description||"";

 let filled=0,failed=false;

 for(const lang of ["en","ar"]){

  if(item.name&&!item.names[lang]){
   const out=await translateText(item.name,lang);
   if(out){item.names[lang]=out;filled++}else failed=true;
  }

  if(hasDescription&&item.description&&!item.descriptions[lang]){
   const out=await translateText(item.description,lang);
   if(out){item.descriptions[lang]=out;filled++}else failed=true;
  }
 }

 return failed&&!filled?-1:filled;
}

async function fillSubtitleTranslations(){

 if(!DATA.subtitles||DATA.subtitles.tr!==DATA.subtitle)
  DATA.subtitles={tr:DATA.subtitle||""};

 let filled=0,failed=false;

 for(const lang of ["en","ar"]){
  if(DATA.subtitle&&!DATA.subtitles[lang]){
   const out=await translateText(DATA.subtitle,lang);
   if(out){DATA.subtitles[lang]=out;filled++}else failed=true;
  }
 }

 return failed&&!filled?-1:filled;
}

/* =========================================================
   GÜNCEL KUR
========================================================= */

/* Kur NearDiji Worker'ından gelir; ziyaretçinin tarayıcısı dış kur servislerine bağlanmaz */
async function fetchRates(){

 try{

  const r=await fetch("https://media.neardiji.com/kur");

  if(r.ok){

   const j=await r.json();
   const usd=Number(j?.USD),eur=Number(j?.EUR);

   if(usd>0&&eur>0)return {USD:usd,EUR:eur};
  }

 }catch(e){}

 return null;
}

/* Kur her ziyaretçide değil: önce cihazdaki 12 saatlik kopya, sonra servis.
   Sadece "otomatik kur" açıksa ve menü verisi geldikten sonra çalışır. */
const RATES_CACHE_KEY="nmRates";
const RATES_TTL=12*60*60*1000;

function maybeUpdateRates(){
 if(PREVIEW||!DATA.rates||!DATA.rates.auto)return;
 if(Date.now()-(DATA.rates.updated||0)<=RATES_TTL)return;
 updateRates(false).then(ok=>{
  if(ok&&currency!=="TRY"&&!adminOpen)
   render({preserveWindowScroll:true});
 });
}

async function updateRates(manual){

 if(!manual&&!DATA.rates.auto)return false;

 let rates=null;

 if(!manual){
  try{
   const c=JSON.parse(safeGet(RATES_CACHE_KEY)||"null");
   if(c&&c.USD>0&&c.EUR>0&&Date.now()-c.t<RATES_TTL)rates={USD:c.USD,EUR:c.EUR,t:c.t};
  }catch(e){}
 }

 if(!rates){
  rates=await fetchRates();
  if(rates){
   rates.t=Date.now();
   safeSet(RATES_CACHE_KEY,JSON.stringify(rates));
  }
 }

 /* Bu arada işletme otomatik kuru kapattıysa elle girilen kur ezilmez */
 if(!manual&&!DATA.rates.auto)return false;

 if(!rates){
  if(manual)alert("Kur alınamadı. İnternet bağlantısını kontrol edip tekrar deneyin.");
  return false;
 }

 DATA.rates.USD=rates.USD;
 DATA.rates.EUR=rates.EUR;
 DATA.rates.updated=rates.t||Date.now();

 /* Panel açıksa sunucuya yazılır; böylece diğer ziyaretçiler güncel kuru menüyle alır */
 if(canWrite())saveData();

 return true;
}

/* =========================================================
   BİLDİRİM (TOAST)
========================================================= */

function showToast(message){

 let el=document.getElementById("nearToast");

 if(!el){
  el=document.createElement("div");
  el.id="nearToast";
  document.body.appendChild(el);
 }

 el.textContent=message;
 el.classList.add("show");

 clearTimeout(el._timer);
 el._timer=setTimeout(()=>el.classList.remove("show"),2200);
}

/* =========================================================
   STATE/* =========================================================
   STATE
========================================================= */

let language=
 safeGet("nearMenuLanguage")||"tr";

let currency=
 safeGet("nearMenuCurrency")||"TRY";

if(!["tr","en","ar"].includes(language))language="tr";
if(!["TRY","USD","EUR"].includes(currency))currency="TRY";

let selectedCategory=null;
let selectedProduct=null;
let selectedEvent=null;

let adminOpen=false;
let adminAuthenticated=false;

let adminTab="general";
let adminCategoryView=null;
let adminProductView=null;
let adminEventView=null;
let adminSearch="";
let bulkOpen=false;

let searchOpen=false;
let searchText="";

let currencyMenu=false;
let languageMenu=false;
let advancedProduct=false;

let savedWindowScroll=0;
let savedAdminScroll=0;

/* =========================================================
   HELPERS
========================================================= */

function $(id){return document.getElementById(id)}

function esc(value){

 return String(value??"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");
}

function t(key){
 return TEXT[language]?.[key]||TEXT.tr[key]||key;
}

function localizedName(item){
 return item?.names?.[language]||item?.name||"";
}

function localizedDescription(item){
 return item?.descriptions?.[language]||item?.description||"";
}

function localizedCategoryName(item){
 return item?.names?.[language]||item?.name||"";
}

function localizedEventName(item){
 return item?.names?.[language]||item?.name||"";
}

function localizedEventDescription(item){
 return item?.descriptions?.[language]||item?.description||"";
}

function localizedSubtitle(){

 if(language!=="tr"&&
    DATA.subtitles&&
    DATA.subtitles.tr===DATA.subtitle&&
    DATA.subtitles[language])
  return DATA.subtitles[language];

 return DATA.subtitle||"";
}

function formatEventDate(value){

 if(!value)return "";

 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return value;

 const [y,m,d]=value.split("-").map(Number);
 const date=new Date(y,m-1,d);

 try{
  return date.toLocaleDateString(
   language==="ar"?"ar":language==="en"?"en-GB":"tr-TR",
   {day:"numeric",month:"long",weekday:"long"}
  );
 }catch(e){return value}
}

function visibleEvents(){

 const today=isoDate(0);

 return DATA.events.filter(ev=>
  !/^\d{4}-\d{2}-\d{2}$/.test(ev.date||"")||ev.date>=today
 );
}

function findCategory(id){
 return DATA.categories.find(c=>c.id===id)||null;
}

function findProduct(id){

 for(const c of DATA.categories){

  const p=(c.items||[]).find(x=>x.id===id);

  if(p)return p;
 }

 return null;
}

function findEvent(id){
 return DATA.events.find(e=>e.id===id)||null;
}

function allProducts(){

 const result=[];

 DATA.categories.forEach(c=>{

  (c.items||[]).forEach(p=>{

   result.push(
    Object.assign({},p,{
     categoryId:c.id,
     categoryName:c.name
    })
   );

  });

 });

 return result;
}

function money(price){

 const value=Number(price)||0;

 if(currency==="USD")
  return "$"+(value/(Number(DATA.rates.USD)||40)).toFixed(2);

 if(currency==="EUR")
  return "€"+(value/(Number(DATA.rates.EUR)||47)).toFixed(2);

 return Math.round(value).toLocaleString("tr-TR")+" ₺";
}

function markProductTranslationDirty(p){

 if(!p.names)p.names={};
 if(!p.descriptions)p.descriptions={};

 p.names.tr=p.name||"";
 p.descriptions.tr=p.description||"";
 p.names.en="";
 p.names.ar="";
 p.descriptions.en="";
 p.descriptions.ar="";
}

function markCategoryTranslationDirty(c){

 if(!c.names)c.names={};

 c.names.tr=c.name||"";
 c.names.en="";
 c.names.ar="";
}

/* =========================================================
   TEMA
========================================================= */

function resolveFont(font){

 if(!font||font==="geist")
  return '"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif';
 if(font==="system")
  return '-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif';
 if(font==="Instrument Serif")
  return '"Instrument Serif",Georgia,serif';

 return '"'+String(font).replace(/["\\;{}<>]/g,"")+'",sans-serif';
}

/* ---------- açık / koyu mod ---------- */

function isLightColor(hex){
 const m=String(hex||"").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
 if(!m)return true;
 let h=m[1];if(h.length===3)h=h.split("").map(c=>c+c).join("");
 const n=parseInt(h,16),r=n>>16&255,g=n>>8&255,b=n&255;
 return (0.2126*r+0.7152*g+0.0722*b)/255>0.55;
}

function shadeColor(hex,amount){
 const m=String(hex||"").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
 if(!m)return hex;
 let h=m[1];
 if(h.length===3)h=h.split("").map(c=>c+c).join("");
 const n=parseInt(h,16);
 const f=v=>Math.max(0,Math.min(255,Math.round(amount<0?v*(1+amount):v+(255-v)*amount)));
 return "#"+[f(n>>16&255),f(n>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,"0")).join("");
}

function currentMode(){
 let saved=null;
 if(DATA.settings?.themeToggle!==false)saved=safeGet("nearMenuMode");
 const pref=saved||DATA.theme?.defaultMode||"dark";
 if(pref==="system"){
  try{return matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}catch(e){return "dark"}
 }
 return pref==="light"?"light":"dark";
}

const THEME_ICONS=`<svg class="icoMoon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg><svg class="icoSun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;

/* Magic UI "AnimatedThemeToggler" (variant: square) davranışı:
   yeni tema, düğmenin ortasından büyüyen bir kare ile açılır. */
/* Yönetim paneli kendi açık/koyu modunu tutar; müşterinin gördüğü menü etkilenmez */
function panelMode(){
 const saved=safeGet("nmPanelMode");
 return saved==="light"||saved==="dark"?saved:currentMode();
}

function activeMode(){
 return !PREVIEW&&adminOpen&&adminAuthenticated?panelMode():currentMode();
}

function toggleColorMode(btn,panel){

 const next=(panel?panelMode():currentMode())==="light"?"dark":"light";

 const apply=()=>{
  safeSet(panel?"nmPanelMode":"nearMenuMode",next);
  applyTheme();
  const label=next==="light"?"Koyu moda geç":"Açık moda geç";
  document.querySelectorAll(panel?"#panelModeBtn":".themeToggle:not(#panelModeBtn)").forEach(b=>{b.setAttribute("aria-label",label);b.title=label});
 };

 const reduce=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}})();

 if(!document.startViewTransition||reduce||!btn){
  apply();
  return;
 }

 const r=btn.getBoundingClientRect();
 const x=r.left+r.width/2;
 const y=r.top+r.height/2;
 const max=Math.max(x,innerWidth-x,y,innerHeight-y)*1.05;

 const t=document.startViewTransition(apply);

 t.ready.then(()=>{
  const sq=d=>`polygon(${x-d}px ${y-d}px, ${x+d}px ${y-d}px, ${x+d}px ${y+d}px, ${x-d}px ${y+d}px)`;
  document.documentElement.animate(
   {clipPath:[sq(0),sq(max)]},
   {duration:400,easing:"ease-in-out",pseudoElement:"::view-transition-new(root)"}
  );
 }).catch(()=>{});
}

try{
 matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{
  if(currentMode&&(safeGet("nearMenuMode")||DATA.theme?.defaultMode)==="system")applyTheme();
 });
}catch(e){}

function applyTheme(){

 const th=DATA.theme;
 const root=document.documentElement;

 const light=activeMode()==="light";

 root.dataset.mode=light?"light":"dark";

 const fg=light?"#151514":"#F1EFEA";
 const isAuto=v=>!v||v==="auto";
 const acc=isAuto(th.accent)?fg:th.accent;
 const acc2=isAuto(th.accent2)?(isAuto(th.accent)?fg:th.accent):th.accent2;
 root.style.setProperty("--accent",acc);
 root.style.setProperty("--accent2",acc2);
 root.style.setProperty("--accentInk",isAuto(th.accent)?fg:(light?shadeColor(acc,-.38):acc));
 root.style.setProperty("--onAccent",isLightColor(acc)?"#111110":"#F7F5F1");
 root.style.setProperty("--text",light?"#151514":(th.text||"#fff"));
 root.style.setProperty("--cardText",light?"#151514":(th.cardText||"#fff"));
 root.style.setProperty("--muted",light?"#6E6C67":"#8D8B86");
 const pr=isAuto(th.price)?(isAuto(th.accent)?fg:acc):th.price;
 root.style.setProperty("--price",isAuto(th.price)&&isAuto(th.accent)?fg:(light?shadeColor(pr,-.42):pr));
 root.style.setProperty("--overPrice",isAuto(th.price)&&isAuto(th.accent)?"#F7F5F1":pr);

 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.setAttribute("content",light?"#EBE9E5":((DATA.background&&DATA.background.type==="color"&&DATA.background.value)||"#111110"));
 root.style.setProperty("--overlay",th.overlay??.55);
 root.style.setProperty("--cardOpacity",th.cardOpacity??.94);
 root.style.setProperty("--cardRadius",(th.cardRadius||20)+"px");
 root.style.setProperty("--titleSize",(th.titleSize||34)+"px");
 root.style.setProperty("--bodySize",(th.bodySize||13)+"px");
 root.style.setProperty("--logoSize",(th.logoSize||112)+"px");
 root.style.setProperty("--fontFamily",resolveFont(th.fontFamily));
 root.style.setProperty("--titleFont",resolveFont(th.titleFont||"Instrument Serif"));
}

/* =========================================================
   BACKGROUND
========================================================= */

/* Veri tasarrufu açık ya da yavaş bağlantıda video indirilmez */
function liteNetwork(){
 try{
  const c=navigator.connection;
  return !!(c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||"")));
 }catch(e){return false}
}

function renderBackground(){

 const bg=DATA.background||{};

 if(bg.type==="video"&&bg.video&&!liteNetwork()){

  return `
   <div class="background" id="siteBackground" data-sig="v|${esc(bg.video)}">
    <video autoplay muted loop playsinline
     ${mediaAttr(bg.video)}></video>
    <div class="backgroundOverlay"></div>
   </div>
  `;
 }

 if(bg.type==="image"&&bg.image){

  return `
   <div class="background" id="siteBackground" data-sig="i|${esc(bg.image)}">
    <img loading="lazy" decoding="async" ${mediaAttr(bg.image)} alt="">
    <div class="backgroundOverlay"></div>
   </div>
  `;
 }

 return `
  <div class="background"
   id="siteBackground" data-sig="c|${esc(bg.value||"#111110")}"
   style="background-color:${esc(bg.value||"#111110")}">
  </div>
 `;
}

/* =========================================================
   HERO
========================================================= */

function renderHero(){

 const compact=!!(searchText||selectedCategory||(CLOUD&&!cloud.ready));

 return `
 <section class="hero${compact?" heroHidden":""}" id="heroWrap">

  <div class="logo${DATA.logo&&logoIsFree()?" free":""}" id="heroLogo">
   ${
    DATA.logo
    ?
    `<img loading="lazy" decoding="async" ${mediaAttr(DATA.logo)} alt="Logo">`
    :
    "N"
   }
  </div>

  <div class="welcome">${t("welcome")}</div>

  <h1>${esc(DATA.name)}</h1>

  <p>${esc(localizedSubtitle())}</p>

  ${
   DATA.whatsapp||DATA.phone
   ?
   `<div class="heroContact">
    ${DATA.whatsapp?`<a class="heroContactBtn" target="_blank" rel="noopener" href="https://wa.me/${esc(String(DATA.whatsapp).replace(/\D/g,""))}">WhatsApp</a>`:""}
    ${DATA.phone?`<a class="heroContactBtn" href="tel:${esc(String(DATA.phone).replace(/\s/g,""))}">${t("call")}</a>`:""}
   </div>`
   :""
  }

  ${
   DATA.settings.hours&&DATA.info?.weekOn
   ?
   (()=>{const st=openState();return `<div class="heroStatus ${st.open?"on":"off"}"><i></i>${esc(st.label)}${st.sub?` · ${esc(st.sub)}`:""}</div>`})()
   :
   DATA.settings.hours&&DATA.hours
   ?
   `<div style="margin-top:9px;color:#666;font-size:10px">
    ${esc(DATA.hours)}
   </div>`
   :""
  }

 </section>
 `;
}

/* =========================================================
   MEDIA
========================================================= */

async function resolveMediaElements(root){

 const elements=[...(root||document).querySelectorAll("[data-media-ref]")];
 const pending=[];

 for(const el of elements){

  const ref=el.dataset.mediaRef;

  if(!ref)continue;

  const url=cachedMediaUrl(ref);

  if(url){
   if(el.getAttribute("src")!==url)el.src=url;
  }else{
   pending.push(el);
  }
 }

 for(const el of pending){

  const url=await loadMediaReference(el.dataset.mediaRef);

  if(url)el.src=url;
 }
}

/* =========================================================
   FEATURED
========================================================= */

function renderFeatured(){

 if(!DATA.settings.featured)return "";

 const products=allProducts()
  .filter(p=>p.featured&&!p.sold);

 if(!products.length)return "";

 return `
 <section class="section">

  <div class="sectionHead">
   <h2>🔥 ${t("best")}</h2>
   <span class="hint">${t("swipe")}</span>
  </div>

  <div class="horizontal">

   ${
    products.map(item=>`

     <button class="feature"
      data-product="${esc(item.id)}">

      ${
       item.image
       ?
       `<img loading="lazy" decoding="async" ${mediaAttr(item.image)} alt="">`
       :""
      }

      <div class="featureShade"></div>

      <div class="featureText">
       <strong>${esc(localizedName(item))}</strong>
       <span>${money(item.price)}</span>
      </div>

     </button>

    `).join("")
   }

  </div>
 </section>
 `;
}

/* =========================================================
   EVENTS
========================================================= */

function renderEvents(){

 const events=visibleEvents();

 if(!DATA.settings.events||!events.length)
  return "";

 return `
 <section class="section">

  <div class="sectionHead">
   <h2>✨ ${t("events")}</h2>
   <span class="hint">${t("swipe")}</span>
  </div>

  <div class="horizontal">

   ${
    events.map(event=>`

     <button class="event"
      data-event="${esc(event.id)}">

      ${
       event.image
       ?
       `<img loading="lazy" decoding="async" ${mediaAttr(event.image)} alt="">`
       :""
      }

      <div class="eventShade"></div>

      <div class="eventDate">
       ${esc(formatEventDate(event.date))}${event.time?" • "+esc(event.time):""}
      </div>

      <div class="eventText">
       <strong>${esc(localizedEventName(event))}</strong>
       <span>${t("reserve")}</span>
      </div>

     </button>

    `).join("")
   }

  </div>
 </section>
 `;
}

/* =========================================================
   CATEGORIES
========================================================= */

function renderCategories(){

 return `
 <section class="section">

  <div class="sectionHead">
   <h2>${t("categories")}</h2>
  </div>

  ${
   DATA.categories.length
   ?
   `<div class="categories">

    ${
     DATA.categories.map(c=>`

      <button class="category"
       data-category="${esc(c.id)}">

       ${
        c.image
        ?
        `<img loading="lazy" decoding="async" ${mediaAttr(c.image)} alt="">`
        :
        `<div style="width:100%;height:100%;background:#222"></div>`
       }

       <div class="categoryShade"></div>

       <div class="categoryText">
        <strong>${esc(localizedCategoryName(c))}</strong>

        <span>
         ${(c.items||[]).length}
         ${t("products_count")}
        </span>
       </div>

      </button>

     `).join("")
    }

   </div>`
   :
   `<div class="empty">${t("noCategories")}</div>`
  }

 </section>
 `;
}

/* =========================================================
   TAGS
========================================================= */

function renderTags(item){

 return `
 <div class="tags">

  ${
   DATA.settings.portion&&item.portion
   ?
   `<span class="tag">${esc(item.portion)}</span>`
   :""
  }

  ${
   DATA.settings.calories&&item.calories
   ?
   `<span class="tag">${esc(item.calories)} kcal</span>`
   :""
  }

  ${
   DATA.settings.spicy&&Number(item.spicy)>0
   ?
   `<span class="tag">${"🌶️".repeat(Math.min(5,Number(item.spicy)||0))}</span>`
   :""
  }

  ${
   DATA.settings.allergens&&item.allergens?.length
   ?
   `<span class="tag">${esc(item.allergens.join(", "))}</span>`
   :""
  }

  ${
   DATA.settings.sold&&item.sold
   ?
   `<span class="tag sold">${t("sold")}</span>`
   :""
  }

 </div>
 `;
}

/* =========================================================
   PRODUCT
========================================================= */

function renderProductCard(item){

 return `
 <article class="product"
  data-product="${esc(item.id)}">

  <div class="productImage">

   ${
    item.image
    ?
    `<img loading="lazy" decoding="async" ${mediaAttr(item.image)}
     alt="${esc(localizedName(item))}">`
    :
    `<div style="
     width:100%;height:100%;
     display:flex;align-items:center;
     justify-content:center;
     color:#555;font-size:28px">N</div>`
   }

  </div>

  <div class="productInfo">

   <h3>${esc(localizedName(item))}</h3>

   <p>${esc(localizedDescription(item))}</p>

   ${renderTags(item)}

   <div class="price">
    ${
     DATA.settings.sold&&item.sold
     ?t("sold")
     :money(item.price)
    }
   </div>

  </div>

 </article>
 `;
}

/* =========================================================
   CATEGORY PAGE
========================================================= */

function renderCategoryPage(){

 const category=findCategory(selectedCategory);

 if(!category)return renderHome();

 return `
 <section class="section pageContent">

  <div class="categoryTitle">

   <button class="backBtn" id="backHome">
    ← ${t("back")}
   </button>

   <h2>${esc(localizedCategoryName(category))}</h2>

  </div>

  <div class="products">

   ${
    category.items?.length
    ?
    category.items.map(renderProductCard).join("")
    :
    `<div class="empty">${t("noProducts")}</div>`
   }

  </div>

 </section>
 `;
}

/* =========================================================
   SEARCH
========================================================= */

function renderSearch(){

 const query=searchText.toLocaleLowerCase("tr-TR");

 const products=allProducts().filter(item=>{

  const category=findCategory(item.categoryId);

  const text=[
   item.name,
   localizedName(item),
   item.description,
   localizedDescription(item),
   item.categoryName,
   localizedCategoryName(category)
  ].join(" ");

  return text.toLocaleLowerCase("tr-TR")
   .includes(query);
 });

 return `
 <section class="section pageContent">

  <div class="sectionHead">
   <h2>${products.length} ${t("results")}</h2>
  </div>

  <div class="products">

   ${
    products.length
    ?
    products.map(renderProductCard).join("")
    :
    `<div class="empty">${t("noResults")}</div>`
   }

  </div>

 </section>
 `;
}

/* =========================================================
   MENÜ ALTI BİLGİ KARTI
========================================================= */

function safeLink(v){
 v=String(v||"").trim();
 if(!v)return "";
 if(/^https:\/\//i.test(v))return v;
 if(/^http:\/\//i.test(v))return "https://"+v.slice(7);
 if(/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(v))return "https://"+v;
 return "";
}

function socialHref(v,base){
 v=String(v||"").trim();
 if(!v)return "";
 if(/^https?:\/\//i.test(v)||/^(www\.)?[a-z0-9-]+\.[a-z]{2,}\//i.test(v))return safeLink(v);
 return base+encodeURIComponent(v.replace(/^@/,""));
}

const toMin=x=>{const [h,m]=String(x).split(":").map(Number);return h*60+m};

/* İşletmenin saatleri Türkiye saatine göre; turistin telefonu başka saat diliminde olabilir */
function istanbulNow(){
 try{
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Istanbul",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
  const g=k=>parts.find(p=>p.type===k)?.value;
  const day=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(g("weekday"));
  return {day:day<0?0:day,min:(+g("hour")%24)*60+(+g("minute"))};
 }catch(e){
  const d=new Date();
  return {day:(d.getDay()+6)%7,min:d.getHours()*60+d.getMinutes()};
 }
}

/* aynı saat = 24 saat açık; kapanış açılıştan önceyse gece yarısından sonra kapanır */
function slotSpan(w){
 const o=toMin(w.o);let c=toMin(w.c);
 if(c<=o)c+=1440;
 return [o,c];
}

function openState(){
 const week=DATA.info?.week||[];
 const {day,min}=istanbulNow();
 const today=week[day], prev=week[(day+6)%7];

 if(prev&&!prev.off){
  const [o,c]=slotSpan(prev);
  if(c>1440&&min<c-1440)return {open:true,label:t("openNow"),sub:t("closesAt").replace("{t}",prev.c)};
 }
 if(today&&!today.off){
  const [o,c]=slotSpan(today);
  if(min>=o&&min<c)return {open:true,label:t("openNow"),sub:c-o>=1440?"":t("closesAt").replace("{t}",today.c)};
  if(min<o)return {open:false,label:t("closedNow"),sub:t("opensAt").replace("{t}",today.o)};
 }
 for(let k=1;k<=7;k++){
  const i=(day+k)%7, w=week[i];
  if(w&&!w.off)return {open:false,label:t("closedNow"),sub:t("opensAt").replace("{t}",t("days")[i]+" "+w.o)};
 }
 return {open:false,label:t("closedNow"),sub:""};
}

const INFO_ICONS={
 clock:`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
 wifi:`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/></svg>`,
 copy:`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.6"/></svg>`,
 chev:`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 google:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>`,
 star:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/></svg>`,
 instagram:`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.3" stroke="currentColor" stroke-width="1.8"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor"/></svg>`,
 tiktok:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
 facebook:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.03 24 18.06 24 12.07z"/></svg>`,
 x:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z"/></svg>`
};

const DELIVERY=[
 ["yemeksepeti","Yemeksepeti","#FA0050"],
 ["getir","Getir","#5D3EBC"],
 ["trendyol","Trendyol Yemek","#F27A1A"],
 ["migros","Migros Yemek","#FF7A00"]
];

const SOCIALS=[
 ["instagram","Instagram","https://instagram.com/"],
 ["tiktok","TikTok","https://tiktok.com/@"],
 ["facebook","Facebook","https://facebook.com/"],
 ["x","X","https://x.com/"]
];

function renderInfo(){

 const I=DATA.info||defaultInfo();
 const parts=[];

 if(DATA.settings.hours&&I.weekOn){
  const st=openState(), today=istanbulNow().day, days=t("days");
  parts.push(`
  <details class="infoCard hoursCard">
   <summary>
    <span class="infoIcon">${INFO_ICONS.clock}</span>
    <span class="infoMain">
     <small>${t("hoursTitle")}</small>
     <b class="openBadge ${st.open?"on":"off"}"><i></i>${esc(st.label)}</b>
     ${st.sub?`<span class="infoSub">${esc(st.sub)}</span>`:""}
    </span>
    <span class="infoChev">${INFO_ICONS.chev}</span>
   </summary>
   <ul class="weekList">
    ${I.week.map((w,i)=>`<li class="${i===today?"today":""}"><span>${esc(days[i])}${i===today?` <em>${t("today")}</em>`:""}</span><span dir="ltr">${w.off?esc(t("closedDay")):esc(w.o)+" – "+esc(w.c)}</span></li>`).join("")}
   </ul>
  </details>`);
 }

 if(I.wifiName||I.wifiPass){
  parts.push(`
  <div class="infoCard wifiCard">
   <span class="infoIcon">${INFO_ICONS.wifi}</span>
   <div class="infoMain">
    <small>Wi-Fi</small>
    ${I.wifiName?`<div class="wifiRow"><span>${t("wifiNet")}</span><b dir="ltr">${esc(I.wifiName)}</b></div>`:""}
    ${I.wifiPass?`<div class="wifiRow"><span>${t("wifiPass")}</span><b dir="ltr">${esc(I.wifiPass)}</b></div>`:""}
   </div>
   ${I.wifiPass?`<button type="button" class="copyBtn" data-copy="${esc(I.wifiPass)}" aria-label="${esc(t("copy"))}">${INFO_ICONS.copy}<span>${t("copy")}</span></button>`:""}
  </div>`);
 }

 const review=safeLink(I.review);
 if(review){
  parts.push(`
  <a class="infoCard reviewCard" href="${esc(review)}" target="_blank" rel="noopener">
   <span class="infoIcon g">${INFO_ICONS.google}</span>
   <span class="infoMain">
    <b>${t("review")}</b>
    <span class="infoSub">${t("reviewSub")}</span>
   </span>
   <span class="stars" aria-hidden="true">${INFO_ICONS.star.repeat(5)}</span>
  </a>`);
 }

 const del=DELIVERY.map(([k,n,c])=>{const h=safeLink(I[k]);return h?`<a class="deliveryBtn" href="${esc(h)}" target="_blank" rel="noopener" style="--dc:${c}"><i></i>${n}</a>`:""}).join("");
 if(del){
  parts.push(`
  <div class="infoBlock">
   <div class="infoLabel">${t("order")}</div>
   <div class="deliveryList">${del}</div>
  </div>`);
 }

 const soc=SOCIALS.map(([k,n,b])=>{const h=socialHref(I[k],b);return h?`<a class="socialBtn" href="${esc(h)}" target="_blank" rel="noopener" aria-label="${n}" title="${n}">${INFO_ICONS[k]}</a>`:""}).join("");
 if(soc){
  parts.push(`
  <div class="infoBlock center">
   <div class="infoLabel">${t("follow")}</div>
   <div class="socialList">${soc}</div>
  </div>`);
 }

 if(I.vat)parts.push(`<p class="vatNote">${t("vat")}</p>`);

 return parts.length?`<section class="menuInfo">${parts.join("")}</section>`:"";
}

/* Her menüde NearDiji imzası; kapatılamaz */
function renderSignature(){
 const href="https://neardiji.com/?utm_source=nearmenu&utm_medium=imza&utm_campaign="+encodeURIComponent(RESTAURANT_SLUG);
 const mark=`<span class="sigBrand"><svg class="sigMark" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.5 20.5H3.5v-17h17v17L8.6 8.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="square"/></svg><b>NearMenu</b></span>`;
 return `
 <div class="footer">
  <a class="signature" href="${href}" target="_blank" rel="noopener" aria-label="NearMenu — neardiji.com">
   ${language==="tr"?mark+`<span>${t("madeWith")}</span>`:`<span>${t("madeWith")}</span>`+mark}
  </a>
  <div class="footLinks"><a class="privacyLink" href="https://neardiji.com/#kvkk" target="_blank" rel="noopener">${t("privacy")}</a><button type="button" class="privacyLink" data-cerez-ayar>${t("cookies")}</button></div>
 </div>`;
}

function copyText(text){
 if(navigator.clipboard&&window.isSecureContext)
  return navigator.clipboard.writeText(text);
 return new Promise((res,rej)=>{
  const ta=document.createElement("textarea");
  ta.value=text;ta.setAttribute("readonly","");
  ta.style.cssText="position:fixed;opacity:0;top:0;left:0";
  document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy")?res():rej()}catch(e){rej(e)}
  ta.remove();
 });
}

function renderHome(){
 return renderFeatured()+
        renderEvents()+
        renderCategories();
}

/* =========================================================
   POPUP
========================================================= */

function renderCurrencyPopup(){

 if(!currencyMenu)return "";

 return `
 <div class="quickPopup">

  <button class="${currency==="TRY"?"active":""}"
   data-currency="TRY">
   <span>🇹🇷 ${t("try")}</span><span>₺</span>
  </button>

  <button class="${currency==="USD"?"active":""}"
   data-currency="USD">
   <span>🇺🇸 ${t("usd")}</span><span>$</span>
  </button>

  <button class="${currency==="EUR"?"active":""}"
   data-currency="EUR">
   <span>🇪🇺 ${t("eur")}</span><span>€</span>
  </button>

 </div>
 `;
}

function renderLanguagePopup(){

 if(!languageMenu)return "";

 return `
 <div class="quickPopup" style="width:170px">

  <button class="${language==="tr"?"active":""}"
   data-language="tr">
   <span>🇹🇷 Türkçe</span><span>TR</span>
  </button>

  <button class="${language==="en"?"active":""}"
   data-language="en">
   <span>🇬🇧 English</span><span>EN</span>
  </button>

  <button class="${language==="ar"?"active":""}"
   data-language="ar">
   <span>🇸🇦 العربية</span><span>AR</span>
  </button>

 </div>
 `;
}

/* =========================================================
   DRAWER
========================================================= */

/* =========================================================
   PRODUCT MODAL
========================================================= */

function renderProductModal(){

 if(!selectedProduct)return "";

 const item=selectedProduct;

 return `
 <div class="modalOverlay" id="productOverlay">

  <div class="modal">

   <div class="modalImage">

    ${
     item.image
     ?
     `<img loading="lazy" decoding="async" ${mediaAttr(item.image)}
      alt="${esc(localizedName(item))}">`
     :""
    }

    <button class="closeBtn" id="closeProduct">×</button>

   </div>

   <div class="modalBody">

    <h2>${esc(localizedName(item))}</h2>

    ${
     DATA.settings.dish&&item.dish
     ?
     `<div style="margin-top:10px">
      <span class="tag"
       style="background:var(--accent);color:#111">
       ⭐ ${t("dish")}
      </span>
     </div>`
     :""
    }

    <p>${esc(localizedDescription(item))}</p>

    ${
     DATA.settings.portion&&item.portion
     ?
     `<div class="infoRow">
      <span>${t("portion")}</span>
      <span>${esc(item.portion)}</span>
     </div>`
     :""
    }

    ${
     DATA.settings.calories&&item.calories
     ?
     `<div class="infoRow">
      <span>${t("calories")}</span>
      <span>${esc(item.calories)} kcal</span>
     </div>`
     :""
    }

    ${
     DATA.settings.allergens&&item.allergens?.length
     ?
     `<div class="infoRow">
      <span>${t("allergens")}</span>
      <span>${esc(item.allergens.join(", "))}</span>
     </div>`
     :""
    }

    <div class="modalPrice">
     ${
      DATA.settings.sold&&item.sold
      ?t("sold")
      :money(item.price)
     }
    </div>

   </div>
  </div>
 </div>
 `;
}

/* =========================================================
   EVENT MODAL
========================================================= */

function renderEventModal(){

 if(!selectedEvent)return "";

 const ev=findEvent(selectedEvent);

 if(!ev)return "";

 const dateText=formatEventDate(ev.date)+(ev.time?" • "+ev.time:"");

 const msg=t("reserveMsg")
  .replace("{event}",localizedEventName(ev))
  .replace("{date}",dateText);

 const wa=String(DATA.whatsapp||"").replace(/\D/g,"");

 return `
 <div class="modalOverlay" id="eventOverlay">

  <div class="modal">

   <div class="modalImage">

    ${
     ev.image
     ?
     `<img loading="lazy" decoding="async" ${mediaAttr(ev.image)} alt="">`
     :""
    }

    <button class="closeBtn" id="closeEvent">×</button>

   </div>

   <div class="modalBody">

    <h2>${esc(localizedEventName(ev))}</h2>

    <p>${esc(localizedEventDescription(ev))}</p>

    ${
     ev.date
     ?
     `<div class="infoRow">
      <span>${t("date")}</span>
      <span>${esc(formatEventDate(ev.date))}</span>
     </div>`
     :""
    }

    ${
     ev.time
     ?
     `<div class="infoRow">
      <span>${t("time")}</span>
      <span>${esc(ev.time)}</span>
     </div>`
     :""
    }

    <div class="eventActions">

     ${
      wa
      ?
      `<a class="adminButton gold full eventReserve"
       target="_blank" rel="noopener"
       href="https://wa.me/${esc(wa)}?text=${encodeURIComponent(msg)}">
       ${t("reserveWhatsApp")}
      </a>`
      :""
     }

     ${
      DATA.phone
      ?
      `<a class="adminButton full eventReserve"
       href="tel:${esc(String(DATA.phone).replace(/\s/g,""))}">
       ${t("reserveCall")}
      </a>`
      :""
     }

    </div>

   </div>
  </div>
 </div>
 `;
}

/* =========================================================
   ADMIN INPUT
========================================================= */

function input(key,label,value,type="text"){

 return `
 <div class="field">

  <label>${label}</label>

  <input
   type="${type}"
   data-admin="${esc(key)}"
   value="${esc(value??"")}">

 </div>
 `;
}

function textarea(key,label,value){

 return `
 <div class="field">

  <label>${label}</label>

  <textarea data-admin="${esc(key)}">${esc(value??"")}</textarea>

 </div>
 `;
}

function trInput(key,label,value,multiline){

 return `
 <div class="field">

  <label>${label}</label>

  ${
   multiline
   ?
   `<textarea data-admin-tr="${esc(key)}" data-orig="${esc(value??"")}">${esc(value??"")}</textarea>`
   :
   `<input type="text" data-admin-tr="${esc(key)}" data-orig="${esc(value??"")}" value="${esc(value??"")}">`
  }

 </div>
 `;
}

function translationCard(prefix,item,hasDescription,buttonId){

 return `
 <div class="adminCard">

  <div class="adminCardTitle">🌐 Çeviriler</div>

  <div class="adminCardDescription">
   Boş bırakılan alanlar müşteriye Türkçe görünür.
   "Otomatik Çevir" boş alanları internetten doldurur, sonra istersen düzeltebilirsin.
   Türkçe metni değiştirirsen eski çeviriler silinir.
  </div>

  ${trInput(prefix+"|en|name","🇬🇧 İngilizce ad",item.names?.en||"")}
  ${hasDescription?trInput(prefix+"|en|desc","🇬🇧 İngilizce açıklama",item.descriptions?.en||"",true):""}
  ${trInput(prefix+"|ar|name","🇸🇦 Arapça ad",item.names?.ar||"")}
  ${hasDescription?trInput(prefix+"|ar|desc","🇸🇦 Arapça açıklama",item.descriptions?.ar||"",true):""}

  <button class="adminButton full" id="${buttonId}" style="margin-top:12px">
   🌐 Boş Alanları Otomatik Çevir
  </button>

 </div>
 `;
}

function fileField(type,id,label,value,accept){

 return `
 <div class="field">

  <label>${label}</label>

  <div class="fileBox">

   <label class="fileBtn">

    📁 ${type.includes("Video")?t("video")||"Video":t("image")}

    <input
     hidden
     type="file"
     accept="${accept}"
     data-file-type="${type}"
     data-file-id="${esc(id)}">

   </label>

   ${
    value
    ?
    `<button type="button"
     class="fileBtn"
     data-clear-file="${type}|${esc(id)}">
     Temizle
    </button>`
    :""
   }

  </div>

  ${
   value
   ?
   `<img class="preview"
    ${mediaAttr(value)} alt="">`
   :
   `<div class="help">Henüz dosya seçilmedi.</div>`
  }

 </div>
 `;
}

/* =========================================================
   ADMIN GENERAL
========================================================= */

function renderAdminGeneral(){

 const products=allProducts();

 return `

 <div class="adminSectionHeader">
  <h2>Kontrol Merkezi</h2>
  <p>NearMenu işletme panelini buradan yönetebilirsin.</p>
 </div>

 ${window.NDAbonelik&&cloud.access?NDAbonelik.html(cloud.access.subscription,cloud.access.support):""}

 ${renderSetupCard()}


 <div class="statsGrid">

  <div class="statCard">
   <div class="statIcon">🍽</div>
   <div class="statLabel">Toplam Ürün</div>
   <div class="statValue">${products.length}</div>
   <div class="statSub">Menündeki ürünler</div>
  </div>

  <div class="statCard">
   <div class="statIcon">▦</div>
   <div class="statLabel">Kategori</div>
   <div class="statValue">${DATA.categories.length}</div>
   <div class="statSub">Aktif kategoriler</div>
  </div>

  <div class="statCard">
   <div class="statIcon">🔥</div>
   <div class="statLabel">Çok Satan</div>
   <div class="statValue">
    ${products.filter(p=>p.featured).length}
   </div>
   <div class="statSub">Öne çıkarılan ürün</div>
  </div>

  <div class="statCard">
   <div class="statIcon">⚠</div>
   <div class="statLabel">Tükenen</div>
   <div class="statValue">
    ${products.filter(p=>p.sold).length}
   </div>
   <div class="statSub">Satış dışı ürün</div>
  </div>

 </div>

 <div class="quickActions">

  <button class="quickAction"
   data-admin-tab-direct="products">

   <div class="quickActionIcon">🍽</div>

   <div>
    <strong>Menüyü Yönet</strong>
    <span>Ürün ve kategoriler</span>
   </div>

  </button>

  <button class="quickAction"
   data-admin-tab-direct="settings">

   <div class="quickActionIcon">🎨</div>

   <div>
    <strong>Tasarımı Düzenle</strong>
    <span>Renk ve görünüm</span>
   </div>

  </button>

  <button class="quickAction" data-open-pdf="1">

   <div class="quickActionIcon">📄</div>

   <div>
    <strong>PDF Menü</strong>
    <span>A5 / A4 / A3 • 4 şablon</span>
   </div>

  </button>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">İşletme Bilgileri</div>

  ${input("businessName","İşletme adı",DATA.name)}
  ${input("subtitle","Alt başlık",DATA.subtitle)}
  ${input("phone","Telefon",DATA.phone)}
  ${input("whatsapp","WhatsApp numarası",DATA.whatsapp)}
  ${input("hours","Çalışma saatleri",DATA.hours)}

  ${trInput("subtitle|en","🇬🇧 Alt başlık (İngilizce)",DATA.subtitles?.tr===DATA.subtitle?(DATA.subtitles?.en||""):"")}
  ${trInput("subtitle|ar","🇸🇦 Alt başlık (Arapça)",DATA.subtitles?.tr===DATA.subtitle?(DATA.subtitles?.ar||""):"")}

  <button class="adminButton full" id="translateSubtitle" style="margin-top:10px">
   🌐 Alt Başlığı Otomatik Çevir
  </button>

  ${fileField(
   "logo","logo","Logo",
   DATA.logo,"image/*"
  )}

 </div>

 ${renderInfoAdmin()}

 ${backupCard()+renderAccountCard()}

 <div class="adminCard">

  <div class="adminCardTitle">💱 Para Birimi</div>

  <div class="adminCardDescription">
   ${
    DATA.rates.updated
    ?
    "Son güncelleme: "+new Date(DATA.rates.updated).toLocaleString("tr-TR",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})
    :
    "Kur henüz internetten alınmadı."
   }
  </div>

  ${input("rateUSD","1 USD = TL",DATA.rates.USD,"number")}
  ${input("rateEUR","1 EUR = TL",DATA.rates.EUR,"number")}

  <button class="adminButton gold full" id="fetchRates" style="margin-top:12px">
   🔄 Güncel Kuru Getir
  </button>

  <label class="toggle">
   Kuru her gün otomatik güncelle
   <input type="checkbox" id="autoRates" ${DATA.rates.auto?"checked":""}>
  </label>

 </div>
 `;
}

function renderInfoAdmin(){

 const I=DATA.info||defaultInfo();
 const days=TEXT.tr.days;
 const chk=(flag,label,on)=>`<label class="toggle">${label}<input type="checkbox" data-info-flag="${flag}" ${on?"checked":""}></label>`;

 return `
 <div class="adminCard">

  <div class="adminCardTitle">🕘 Haftalık Çalışma Saatleri</div>
  <div class="adminCardDescription">Menünün altında gün gün saatler ve Türkiye saatine göre canlı “Şu an açık / kapalı” bilgisi görünür. Gece yarısından sonra kapanıyorsanız kapanışı olduğu gibi yazın (ör. 10:00 – 02:00).</div>

  ${chk("weekOn","Haftalık saatleri menüde göster",I.weekOn)}

  <div class="weekEdit">
   ${I.week.map((w,i)=>`
   <div class="weekEditRow">
    <span>${days[i]}</span>
    <input type="time" data-admin="info.week.${i}.o" value="${esc(w.o)}" aria-label="${days[i]} açılış">
    <input type="time" data-admin="info.week.${i}.c" value="${esc(w.c)}" aria-label="${days[i]} kapanış">
    <label class="weekOff"><input type="checkbox" data-info-flag="off.${i}" ${w.off?"checked":""}>Kapalı</label>
   </div>`).join("")}
  </div>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">📶 Wi-Fi</div>
  <div class="adminCardDescription">Müşteri şifreyi tek dokunuşla kopyalar. Boş bırakılırsa gösterilmez.</div>

  ${input("info.wifiName","Ağ adı",I.wifiName)}
  ${input("info.wifiPass","Şifre",I.wifiPass)}

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">⭐ Google Yorum</div>
  <div class="adminCardDescription">Google İşletme Profili → “Yorum iste” bölümündeki bağlantıyı yapıştırın (ör. g.page/r/…/review).</div>

  ${input("info.review","Google yorum bağlantısı",I.review,"url")}

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">🛵 Paket Servis</div>
  <div class="adminCardDescription">İşletmenizin platformdaki sayfa bağlantısı. Sadece doldurulanlar menüde görünür.</div>

  ${input("info.yemeksepeti","Yemeksepeti",I.yemeksepeti,"url")}
  ${input("info.getir","Getir",I.getir,"url")}
  ${input("info.trendyol","Trendyol Yemek",I.trendyol,"url")}
  ${input("info.migros","Migros Yemek",I.migros,"url")}

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">📱 Sosyal Medya</div>
  <div class="adminCardDescription">Kullanıcı adı (@isletme) ya da tam bağlantı yazabilirsiniz.</div>

  ${input("info.instagram","Instagram",I.instagram)}
  ${input("info.tiktok","TikTok",I.tiktok)}
  ${input("info.facebook","Facebook",I.facebook)}
  ${input("info.x","X",I.x)}

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">🧾 Bilgilendirme</div>

  ${chk("vat","“Fiyatlarımıza KDV dahildir.” notunu göster",I.vat)}

 </div>
 `;
}

/* =========================================================
   ADMIN CATEGORY LIST
========================================================= */

function adminProductRow(item,category,draggable){

 return `
 <div class="adminRow" data-row-id="${esc(item.id)}">

  ${draggable?`<div class="dragHandle" aria-label="Sürükle">⋮⋮</div>`:""}

  <button class="soldDot${item.sold?" off":""}"
   data-quick-sold="${esc(item.id)}"
   aria-pressed="${!!item.sold}"
   aria-label="${item.sold?"Tükendi. Satışa açmak için dokun.":"Satışta. Tükendi yapmak için dokun."}"
   title="${item.sold?"Tükendi. Satışa açmak için dokun.":"Satışta. Tükendi yapmak için dokun."}"></button>

  <button class="adminProductItem"
   data-admin-product="${esc(item.id)}">

   <div class="adminProductThumb">
    ${
     item.image
     ?
     `<img loading="lazy" decoding="async" ${mediaAttr(item.image)} alt="">`
     :
     `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#555">N</div>`
    }
   </div>

   <div class="adminProductInfo">
    <strong>${esc(item.name)}</strong>
    <span>${draggable?"":esc(category.name)+" • "}${item.sold?"Tükendi":"Düzenle ›"}</span>
   </div>

  </button>

  <label class="quickPrice">
   <input type="number" inputmode="decimal" min="0" step="any"
    data-quick-price="${esc(item.id)}"
    value="${esc(item.price)}">
   <span>₺</span>
  </label>

 </div>
 `;
}

function adminSearchResults(){

 const q=adminSearch.trim().toLocaleLowerCase("tr-TR");

 const list=[];

 DATA.categories.forEach(c=>(c.items||[]).forEach(p=>{
  if((p.name+" "+(p.description||"")).toLocaleLowerCase("tr-TR").includes(q))
   list.push([p,c]);
 }));

 return `
 <div class="adminCardDescription" style="margin:0 0 10px">
  ${list.length} ürün bulundu. Fiyatı kutudan direkt değiştirebilirsin, kendiliğinden kaydedilir.
 </div>

 <div class="adminProductList">
  ${
   list.length
   ?
   list.map(([p,c])=>adminProductRow(p,c,false)).join("")
   :
   `<div class="empty">Ürün bulunamadı.</div>`
  }
 </div>
 `;
}

function renderBulkPrice(){

 return `
 <div class="adminCard">

  <button class="advancedButton" id="toggleBulk">
   💸 Toplu Fiyat Güncelle (zam / indirim) ${bulkOpen?"▴":"▾"}
  </button>

  ${
   bulkOpen
   ?
   `<div style="margin-top:12px">

    <div class="field">
     <label>Hangi ürünler?</label>
     <select id="bulkTarget">
      <option value="all">Tüm menü (${allProducts().length} ürün)</option>
      ${adminSearch.trim()?`<option value="search">Arama sonuçları ("${esc(adminSearch.trim())}")</option>`:""}
      ${DATA.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} (${(c.items||[]).length} ürün)</option>`).join("")}
     </select>
    </div>

    <div class="bulkGrid">

     <div class="field">
      <label>Değişim türü</label>
      <select id="bulkType">
       <option value="percent">Yüzde (%)</option>
       <option value="amount">Tutar (₺)</option>
      </select>
     </div>

     <div class="field">
      <label>Miktar (indirim için eksi yaz)</label>
      <input id="bulkValue" type="number" inputmode="decimal" step="any" placeholder="örn. 10">
     </div>

    </div>

    <div class="field">
     <label>Yuvarlama</label>
     <select id="bulkRound">
      <option value="1">En yakın 1 ₺</option>
      <option value="5" selected>En yakın 5 ₺</option>
      <option value="10">En yakın 10 ₺</option>
      <option value="0">Yuvarlama yok (kuruşlu)</option>
     </select>
    </div>

    <div class="bulkPreview" id="bulkPreview">Miktar gir, önizleme burada görünür.</div>

    <button class="adminButton gold full" id="bulkApply" style="margin-top:10px">
     ✓ Fiyatları Güncelle
    </button>

    ${
     DATA.lastBulk&&Object.keys(DATA.lastBulk.prices||{}).length
     ?
     `<button class="adminButton full" id="bulkUndo" style="margin-top:8px">
      ↶ Son toplu değişikliği geri al (${Object.keys(DATA.lastBulk.prices).length} ürün)
     </button>`
     :""
    }

   </div>`
   :""
  }

 </div>
 `;
}

function renderAdminCategories(){

 const total=allProducts().length;

 return `

 <div class="adminSectionHeader menuHead">
  <div>
   <h2>Menü</h2>
   <p>${DATA.categories.length} kategori • ${total} ürün</p>
  </div>
  <button class="adminButton gold" id="qaOpen">+ Ürün ekle</button>
 </div>

 <div class="menuToolbar">

  <div class="adminSearch">
   <span>⌕</span>
   <input id="adminSearchInput" type="text" enterkeyhint="search"
    placeholder="Ürün ara (ad veya açıklama)..."
    value="${esc(adminSearch)}"
    autocomplete="off">
   ${adminSearch?`<button id="adminSearchClear" aria-label="Temizle">×</button>`:""}
  </div>

  <div class="toolsWrap">
   <button class="toolsBtn" id="menuToolsBtn" aria-haspopup="true" aria-expanded="${menuToolsOpen}" aria-label="Araçlar" title="Araçlar">⋯</button>
   ${
    menuToolsOpen
    ?
    `<div class="toolsMenu" id="toolsMenu" role="menu">
     <button role="menuitem" id="toolBulk">💸 Toplu fiyat güncelle</button>
     <button role="menuitem" id="translateAll">🌐 Eksik çevirileri tamamla</button>
     <button role="menuitem" data-open-pdf="1">📄 PDF menü oluştur</button>
    </div>`
    :""
   }
  </div>

 </div>

 ${bulkOpen?renderBulkPrice():""}

 <div id="adminMenuBody">
  ${adminSearch.trim()?adminSearchResults():renderAdminCategoryList()}
 </div>
 `;
}

function renderAdminCategoryList(){

 const cats=DATA.categories;

 return `

 ${
  cats.length
  ?""
  :`<div class="adminCard">
    <div class="adminCardTitle">Henüz kategori yok</div>
    <div class="adminCardDescription">İlk kategorinin adını aşağıya yaz ve Enter'a bas. Örn. Kahvaltı, Izgaralar, İçecekler.</div>
   </div>`
 }

 <div class="adminCategoryList catAccordion" data-sortable="categories">

 ${
  cats.map(category=>{

   const items=category.items||[];
   const open=adminOpenCats.has(category.id);
   const sold=items.filter(p=>p.sold).length;

   return `

   <div class="adminRow catRow${open?" open":""}" data-row-id="${esc(category.id)}">

    <div class="catBlock">

     <div class="catHead">

      <div class="dragHandle" aria-label="Sürükle">⋮⋮</div>

      <button class="catToggle"
       data-cat-toggle="${esc(category.id)}"
       aria-expanded="${open}">

       <div class="adminCategoryThumb">
        ${
         category.image
         ?
         `<img loading="lazy" decoding="async" ${mediaAttr(category.image)} alt="">`
         :
         `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#555">N</div>`
        }
       </div>

       <div class="adminCategoryInfo">
        <strong>${esc(localizedCategoryName(category))}</strong>
        <span>${items.length} ürün${sold?" • "+sold+" tükendi":""}</span>
       </div>

       <span class="catChevron" aria-hidden="true">⌄</span>

      </button>

      <button class="catEdit"
       data-admin-category="${esc(category.id)}"
       aria-label="${esc(category.name)} kategorisini düzenle"
       title="Kategori adı, fotoğrafı, çevirileri">✎</button>

     </div>

     ${
      open
      ?
      `<div class="catItems">

       <div class="adminProductList" data-sortable="${esc(category.id)}">
        ${items.map(item=>adminProductRow(item,category,true)).join("")}
       </div>

       ${items.length?"":`<div class="catEmpty">Bu kategoride ürün yok. İlk ürünü aşağıdan ekle.</div>`}

       <div class="quickAdd" data-qa-row="${esc(category.id)}">
        <input data-qa-name maxlength="80" autocomplete="off" enterkeyhint="next"
         placeholder="Ürün adı" aria-label="${esc(category.name)} için yeni ürün adı">
        <input class="qaPriceIn" data-qa-price inputmode="decimal" autocomplete="off" enterkeyhint="done"
         placeholder="Fiyat ₺" aria-label="Fiyat">
        <button class="adminButton gold" data-qa-add>Ekle</button>
       </div>

      </div>`
      :""
     }

    </div>

   </div>`;

  }).join("")
 }

 </div>

 <div class="quickAdd catAdd">
  <input id="qaCatName" maxlength="60" autocomplete="off" enterkeyhint="done"
   placeholder="Yeni kategori adı" aria-label="Yeni kategori adı">
  <button class="adminButton" id="qaCatAdd">+ Kategori</button>
 </div>
 `;
}

/* =========================================================
   ADMIN CATEGORY
========================================================= */

function renderAdminCategory(){

 const category=findCategory(adminCategoryView);

 if(!category)return renderAdminCategories();

 return `

 <div class="adminBreadcrumb">

  <button id="adminProductsBack">‹ Menü</button>

  <span>›</span>

  <strong>${esc(category.name)}</strong>

 </div>

 <div class="adminSectionHeader">

  <h2>${esc(category.name)}</h2>

  <p>Kategori bilgilerini ve ürünlerini yönet.</p>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">Kategori Ayarları</div>

  ${input(
   "categoryName-"+category.id,
   t("categoryName"),
   category.name
  )}

  ${fileField(
   "categoryImage",
   category.id,
   "Kategori fotoğrafı",
   category.image,
   "image/*"
  )}

  <button class="adminButton gold full"
   id="saveCategoryNow">
   ✓ ${t("saveCategory")}
  </button>

  <button
   class="adminButton danger full"
   data-delete-category="${esc(category.id)}"
   style="margin-top:8px">
   Kategoriyi Sil
  </button>

 </div>

 <details class="adminDetails">
  <summary>🌐 Çeviriler (İngilizce, Arapça)</summary>
  ${translationCard("category|"+category.id,category,false,"translateCategory")}
 </details>

 <div class="adminCard">

  <div style="
   display:flex;
   align-items:center;
   justify-content:space-between;
   gap:10px">

   <div>
    <div class="adminCardTitle">Ürünler</div>
    <div class="adminCardDescription">
     ${(category.items||[]).length} ürün • ⋮⋮ ile sürükleyerek sırala, fiyatı kutudan değiştir
    </div>
   </div>

   <button
    class="adminButton gold"
    data-add-product="${esc(category.id)}">
    + Ürün
   </button>

  </div>

 </div>

 <div class="adminProductList" data-sortable="${esc(category.id)}">
  ${category.items.map(item=>adminProductRow(item,category,true)).join("")}
 </div>
 `;
}

/* =========================================================
   ADMIN PRODUCT
========================================================= */

function renderAdminProduct(){

 const item=findProduct(adminProductView);

 let category=null;

 if(item){

  category=DATA.categories.find(
   c=>(c.items||[]).some(p=>p.id===item.id)
  );
 }

 if(!item||!category){

  adminProductView=null;
  return renderAdminCategory();
 }

 return `

 <div class="adminBreadcrumb">

  <button id="adminProductBack">
   ‹ ${esc(category.name)}
  </button>

  <span>›</span>

  <strong>Ürün</strong>

 </div>

 <div class="simpleProductHero">

  <strong>
   ${item.name==="Yeni Ürün"
    ?"Yeni Ürün Oluştur"
    :"Ürün Düzenle"}
  </strong>

  <span>
   Ürün bilgilerini buradan değiştirebilirsin.
  </span>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">${t("basic")}</div>

  ${input(
   "productName-"+item.id,
   t("productName"),
   item.name
  )}

  ${input(
   "productPrice-"+item.id,
   t("productPrice"),
   item.price,
   "number"
  )}

  <div class="field">
   <label>Kategori</label>
   <select data-admin="productCategory-${esc(item.id)}">
    ${
     DATA.categories.map(c=>`
      <option value="${esc(c.id)}" ${c.id===category.id?"selected":""}>
       ${esc(c.name)}
      </option>
     `).join("")
    }
   </select>
  </div>

  ${textarea(
   "productDescription-"+item.id,
   t("description"),
   item.description
  )}

  ${fileField(
   "productImage",
   item.id,
   t("photo"),
   item.image,
   "image/*"
  )}

  <div class="field">
   <label>Durum</label>
   <div class="chipRow">
    <label class="chipToggle"><input type="checkbox" data-sold="${esc(item.id)}" ${item.sold?"checked":""}><span>Tükendi</span></label>
    <label class="chipToggle"><input type="checkbox" data-featured="${esc(item.id)}" ${item.featured?"checked":""}><span>Çok Satan</span></label>
    <label class="chipToggle"><input type="checkbox" data-dish="${esc(item.id)}" ${item.dish?"checked":""}><span>Günün Ürünü</span></label>
   </div>
  </div>

 </div>

 <div class="adminCard">

  <button class="advancedButton"
   data-toggle-advanced="product">

   ⚙
   ${advancedProduct?t("hideAdvanced"):t("advanced")}

  </button>

  ${
   advancedProduct
   ?
   `<div style="margin-top:15px">

    ${input(
     "productPortion-"+item.id,
     t("portion"),
     item.portion||""
    )}

    ${input(
     "productCalories-"+item.id,
     t("calories"),
     item.calories||""
    )}

    ${input(
     "productAllergens-"+item.id,
     t("allergens")+" (virgülle ayır)",
     (item.allergens||[]).join(", ")
    )}

    ${input(
     "productSpicy-"+item.id,
     t("spicy")+" (0-5)",
     item.spicy||0,
     "number"
    )}

   </div>`
   :""
  }

 </div>

 <details class="adminDetails">
  <summary>🌐 Çeviriler (İngilizce, Arapça)</summary>
  ${translationCard("product|"+item.id,item,true,"translateProduct")}
 </details>

 <div class="adminCard">

  <button
   class="adminButton gold full"
   id="saveProductNow">
   ✓ ${t("saveProduct")}
  </button>

  <button
   class="adminButton danger full"
   data-delete-product="${esc(category.id)}|${esc(item.id)}"
   style="margin-top:8px">
   Ürünü Sil
  </button>

 </div>
 `;
}

/* =========================================================
   ADMIN DESIGN
========================================================= */

function renderAdminDesign(){

 const th=DATA.theme;

 const fonts=[
  ["geist","Geist (NearDiji)"],
  ["Instrument Serif","Instrument Serif (NearDiji başlık)"],
  ["system","Modern / System"],
  ["Arial","Arial"],
  ["Trebuchet MS","Trebuchet MS"],
  ["Verdana","Verdana"],
  ["Georgia","Georgia"],
  ["Courier New","Courier New"]
 ];

 return `

 <div class="adminSectionHeader">
  <h2>Tasarım Merkezi</h2>
  <p>NearMenu görünümünü markana göre özelleştir.</p>
 </div>

 <div class="adminCard">

  <div class="adminCardTitle">🌗 Açık / Koyu Mod</div>

  <div class="field">
   <label>Müşteriye ilk açılan görünüm</label>
   <select data-admin="defaultMode">
    <option value="dark" ${(th.defaultMode||"dark")==="dark"?"selected":""}>Koyu</option>
    <option value="light" ${th.defaultMode==="light"?"selected":""}>Açık</option>
    <option value="system" ${th.defaultMode==="system"?"selected":""}>Telefonun ayarına göre</option>
   </select>
  </div>

  <div class="help">Müşteri menüdeki ☾/☀ düğmesiyle değiştirebilir; seçimi o telefonda hatırlanır. Düğmeyi Görünürlük bölümünden gizleyebilirsiniz.</div>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">🎨 Renk Sistemi</div>

  <div class="designGrid" style="margin-top:13px">

   <div class="designCard">
    <h4>Ana renk</h4>
    <input class="colorInput"
     type="color"
     data-color-setting="accent"
     value="${esc(th.accent&&th.accent!=="auto"?th.accent:(currentMode()==="light"?"#151514":"#F1EFEA"))}">
   </div>

   <div class="designCard">
    <h4>Vurgu</h4>
    <input class="colorInput"
     type="color"
     data-color-setting="accent2"
     value="${esc(th.accent2&&th.accent2!=="auto"?th.accent2:(currentMode()==="light"?"#151514":"#F1EFEA"))}">
   </div>

   <div class="designCard">
    <h4>Genel yazı</h4>
    <input class="colorInput"
     type="color"
     data-color-setting="text"
     value="${esc(th.text||"#ffffff")}">
   </div>

   <div class="designCard">
    <h4>Ürün yazısı</h4>
    <input class="colorInput"
     type="color"
     data-color-setting="cardText"
     value="${esc(th.cardText||"#ffffff")}">
   </div>

   <div class="designCard">
    <h4>Fiyat</h4>
    <input class="colorInput"
     type="color"
     data-color-setting="price"
     value="${esc(th.price&&th.price!=="auto"?th.price:(currentMode()==="light"?"#151514":"#F1EFEA"))}">
   </div>

   <div class="designCard">
    <h4>Arka plan</h4>
    <input class="colorInput"
     type="color"
     data-color-setting="background"
     value="${esc(DATA.background.value||"#111110")}">
   </div>

  </div>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">Hazır Renkler</div>

  <div class="presetRow" style="margin-top:12px">

   <button class="preset neardiji ${!th.accent||th.accent==="auto"?"active":""}" data-theme-color="auto" title="NearDiji — siyah / beyaz, temaya göre otomatik" aria-label="NearDiji otomatik renk"></button>

   ${
    [
     "#d6a83d","#c96b2c","#b83b5e",
     "#5b8def","#43a047","#9c6ade",
     "#00a99d","#f1f1f1","#e85d04",
     "#ef476f"
    ].map(c=>`

     <button
      class="preset ${th.accent===c?"active":""}"
      style="background:${c}"
      data-theme-color="${c}">
     </button>

    `).join("")
   }

  </div>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">🔤 Tipografi</div>

  <div class="field">

   <label>Genel font</label>

   <select data-admin="fontFamily">

    ${
     fonts.map(f=>`

      <option
       value="${esc(f[0])}"
       ${th.fontFamily===f[0]?"selected":""}>
       ${esc(f[1])}
      </option>

     `).join("")
    }

   </select>

  </div>

  <div class="field">

   <label>Başlık fontu</label>

   <select data-admin="titleFont">

    ${
     fonts.map(f=>`

      <option
       value="${esc(f[0])}"
       ${th.titleFont===f[0]?"selected":""}>
       ${esc(f[1])}
      </option>

     `).join("")
    }

   </select>

  </div>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">📐 Boyutlar</div>

  <div class="designGrid" style="margin-top:13px">

   ${designRange("logoSize","Logo",60,190,th.logoSize||112,"px")}
   ${designRange("titleSize","Başlık",22,52,th.titleSize||34,"px")}
   ${designRange("bodySize","Genel yazı",11,20,th.bodySize||13,"px")}
   ${designRange("cardRadius","Kart köşesi",8,34,th.cardRadius||20,"px")}

  </div>

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">🖼️ Arka Plan</div>

  <div style="
   display:grid;
   grid-template-columns:repeat(3,1fr);
   gap:7px;margin-top:13px">

   <button
    class="adminButton ${DATA.background.type==="color"?"gold":""}"
    data-background="color">
    Renk
   </button>

   <button
    class="adminButton ${DATA.background.type==="image"?"gold":""}"
    data-background="image">
    Fotoğraf
   </button>

   <button
    class="adminButton ${DATA.background.type==="video"?"gold":""}"
    data-background="video">
    Video
   </button>

  </div>

  ${
   DATA.background.type==="image"
   ?
   fileField(
    "backgroundImage",
    "background",
    "Arka plan fotoğrafı",
    DATA.background.image,
    "image/*"
   )
   :""
  }

  ${
   DATA.background.type==="video"
   ?
   fileField(
    "backgroundVideo",
    "background",
    "Arka plan videosu",
    DATA.background.video,
    "video/*"
   )
   :""
  }

 </div>

 <div class="adminCard">

  <div class="adminCardTitle">👁️ Görünürlük</div>

  ${
   [
    ["portion","Gramaj / Porsiyon"],
    ["calories","Kalori"],
    ["allergens","Alerjenler"],
    ["spicy","Acılık"],
    ["sold","Tükendi"],
    ["hours","Çalışma Saatleri"],
    ["dish","Günün Ürünü"],
    ["featured","Çok Satanlar"],
    ["events","Etkinlikler"],
    ["search","Ürün Arama"],
    ["themeToggle","Açık/Koyu Mod Düğmesi"]
   ].map(o=>`

    <label class="toggle">

     ${o[1]}

     <input
      type="checkbox"
      data-setting="${o[0]}"
      ${DATA.settings[o[0]]?"checked":""}>

    </label>

   `).join("")
  }

 </div>
 `;
}

function designRange(key,label,min,max,value,suffix){

 value=Math.min(max,Math.max(min,Number(value)||min));

 return `
 <div class="designCard">

  <h4>${label}</h4>

  <div class="rangeRow">

   <input
    type="range"
    min="${min}"
    max="${max}"
    value="${value}"
    data-suffix="${suffix}"
    data-design="${key}">

   <span
    class="rangeValue"
    id="${key}Value">
    ${value}${suffix}
   </span>

  </div>

 </div>
 `;
}

/* =========================================================
   ADMIN EVENTS
========================================================= */

function renderAdminEvents(){

 return `

 <div class="adminSectionHeader">
  <h2>Etkinlikler</h2>
  <p>Canlı müzik, özel menü, brunch gibi etkinlikleri ana sayfada göster. Tarihi geçen etkinlikler müşteriye otomatik gizlenir.</p>
 </div>

 ${
  !DATA.settings.events
  ?
  `<div class="adminWarning">
   Etkinlikler şu an müşteriye gizli. Tasarım › Görünürlük bölümünden açabilirsin.
  </div>`
  :""
 }

 <div class="adminCard">
  <button class="adminButton gold full" id="addEvent">+ Etkinlik Ekle</button>
 </div>

 <div class="adminProductList">

 ${
  DATA.events.length
  ?
  DATA.events.map(ev=>`

   <button class="adminProductItem"
    data-admin-event="${esc(ev.id)}">

    <div class="adminProductThumb">
     ${
      ev.image
      ?
      `<img loading="lazy" decoding="async" ${mediaAttr(ev.image)} alt="">`
      :
      `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#555">✨</div>`
     }
    </div>

    <div class="adminProductInfo">
     <strong>${esc(ev.name)}</strong>
     <span>${esc(formatEventDate(ev.date))}${ev.time?" • "+esc(ev.time):""}${
      /^\d{4}-\d{2}-\d{2}$/.test(ev.date||"")&&ev.date<isoDate(0)?" • Geçmiş":""
     }</span>
    </div>

    <div class="adminArrow">›</div>

   </button>

  `).join("")
  :
  `<div class="empty">Henüz etkinlik yok.</div>`
 }

 </div>
 `;
}

function renderAdminEvent(){

 const ev=findEvent(adminEventView);

 if(!ev){
  adminEventView=null;
  return renderAdminEvents();
 }

 return `

 <div class="adminBreadcrumb">
  <button id="adminEventBack">‹ Etkinlikler</button>
  <span>›</span>
  <strong>${esc(ev.name)}</strong>
 </div>

 <div class="adminCard">

  <div class="adminCardTitle">Etkinlik Bilgileri</div>

  ${input("eventName-"+ev.id,"Etkinlik adı",ev.name)}
  ${input("eventDate-"+ev.id,"Tarih",ev.date||"","date")}
  ${input("eventTime-"+ev.id,"Saat",ev.time||"","time")}
  ${textarea("eventDescription-"+ev.id,"Açıklama",ev.description||"")}

  ${fileField("eventImage",ev.id,"Etkinlik fotoğrafı",ev.image,"image/*")}

  <div class="help">
   Müşteri etkinliğe dokununca WhatsApp veya telefonla rezervasyon yapabilir
   (Genel › İşletme Bilgileri'ndeki numaralar kullanılır).
  </div>

 </div>

 ${translationCard("event|"+ev.id,ev,true,"translateEvent")}

 <div class="adminCard">

  <button class="adminButton gold full" id="saveEventNow">✓ Etkinliği Kaydet</button>

  <button class="adminButton danger full"
   data-delete-event="${esc(ev.id)}"
   style="margin-top:8px">
   Etkinliği Sil
  </button>

 </div>
 `;
}

/* =========================================================
   ADMIN ROOT
========================================================= */

function renderAdmin(){

 if(!adminOpen||!adminAuthenticated)
  return "";

 let body="";

 if(adminTab==="general")
  body=renderAdminGeneral();

 if(adminTab==="products")
  body=
   adminProductView
   ?
   renderAdminProduct()
   :
   adminCategoryView
   ?
   renderAdminCategory()
   :
   renderAdminCategories();

 if(adminTab==="settings")
  body=renderAdminDesign();

 if(adminTab==="events")
  body=adminEventView?renderAdminEvent():renderAdminEvents();

 if(adminTab==="pdf")
  body=renderAdminPdf();

 return `
 <div class="adminOverlay">

  <nav class="adminNav" aria-label="Panel bölümleri">
   <div class="adminNavBrand" aria-hidden="true">N</div>
   ${navBtn("general","Genel")}
   ${navBtn("products","Menü")}
   <button class="navAdd" id="navAdd" aria-label="Ürün ekle" title="Ürün ekle">+</button>
   ${navBtn("events","Etkinlik")}
   ${navBtn("settings","Tasarım")}
   <div class="navSpacer"></div>
   <button class="navHelp" id="tourBtn" aria-label="Rehberlik turu" title="Rehberlik turu">?</button>
  </nav>

  <aside class="admin">

   <div class="adminHeader">

    <div class="adminTop">

     <div class="adminTitle">

      <div class="adminTitleIcon">N</div>

      <div class="adminTitleText">
       <b>NearMenu</b>
       ${CLOUD?`<span class="syncStatus ${cloud.status}" id="syncStatus">${cloud.status==="saving"?"Kaydediliyor...":cloud.status==="error"?"Kaydedilemedi • tekrar denenecek":"✓ Kaydedildi"}</span>`:`<span>Premium Control Center</span>`}
      </div>

     </div>

     <div class="adminTopActions">
      ${adminTab!=="pdf"?`<button class="iconBtn" id="openPreview" aria-label="Menüyü önizle" title="Menüyü önizle">◱</button>`:""}
      <button class="iconBtn themeToggle" id="panelModeBtn" type="button"
       aria-label="${panelMode()==="light"?"Koyu moda geç":"Açık moda geç"}"
       title="${panelMode()==="light"?"Koyu moda geç":"Açık moda geç"}">${THEME_ICONS}</button>
      <button class="iconBtn" id="tourBtnTop" aria-label="Rehberlik turu" title="Rehberlik turu">?</button>
      <button class="iconBtn" id="closeAdmin" aria-label="Kaydet ve kapat" title="Kaydet ve kapat">×</button>
     </div>

    </div>

   </div>

   <div class="adminBody">${body}</div>

   <div class="saveBar">

    <button
     class="adminButton gold"
     id="saveAdmin">
     ✓ Kaydet ve Kapat
    </button>

   </div>

  </aside>

  ${renderQuickAdd()}

 </div>
 `;
}

/* =========================================================
   STÜDYO PANELİ
   Canlı önizleme, akordeon menü, hızlı ekleme, kurulum kartı
   ve rehberlik turu. Müşterinin gördüğü menüye dokunmaz.
========================================================= */

let adminOpenCats=new Set();
let menuToolsOpen=false;
let quickAdd=null;
let previewOpen=false;
let previewReady=false;
let previewTimer=null;
let tourState=null;

const PREVIEW_DOCK_MIN=1100;

const NAV_ICONS={
 general:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10l8-6 8 6v10z"/><path d="M10 20v-6h4v6"/></svg>',
 products:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
 events:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
 settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor"/></svg>'
};

function navBtn(tab,label){
 const on=adminTab===tab||(tab==="general"&&adminTab==="pdf");
 return `<button class="navBtn${on?" active":""}" data-admin-tab="${tab}" ${on?'aria-current="page"':""}>${NAV_ICONS[tab]}<span>${label}</span></button>`;
}

function parsePrice(v){
 const n=Number(String(v??"").replace(/\s/g,"").replace(",","."));
 return isFinite(n)&&n>0?Math.round(n*100)/100:0;
}

function newProduct(name,price){
 return {
  id:newId(),
  name,
  names:{tr:name},
  description:"",
  descriptions:{tr:""},
  portion:"",
  calories:"",
  allergens:[],
  spicy:0,
  price,
  image:"",
  video:"",
  featured:false,
  dish:false,
  sold:false
 };
}

/* ---------- canlı önizleme ---------- */

function previewUrl(){
 /* Kısa adres (neardiji.com/firma) 404 yönlendirmesinde parametre kaybolur; doğrudan uygulamayı aç */
 if(PRETTY_URLS)
  return location.origin+"/menu/?r="+encodeURIComponent(RESTAURANT_SLUG)+"&onizleme=1";
 const u=new URL(location.href);
 u.hash="";
 u.searchParams.set("onizleme","1");
 return u.href;
}

function syncPreviewDock(){

 const wide=window.innerWidth>=PREVIEW_DOCK_MIN;
 const active=adminOpen&&adminAuthenticated;
 const show=active&&adminTab!=="pdf"&&(wide||previewOpen);
 let dock=$("nmPreviewDock");

 if(!active){
  if(tourState)endTour(false);
  quickAdd=null;
  menuToolsOpen=false;
  previewOpen=false;
  previewReady=false;
  dock?.remove();
  document.documentElement.classList.remove("adminDocked");
  return;
 }

 if(!dock&&show){
  dock=document.createElement("div");
  dock.id="nmPreviewDock";
  dock.innerHTML=`
   <div class="pvBar">
    <div><b>Müşterinin gördüğü menü</b><small>Canlı • ürüne dokun, düzenle</small></div>
    <button class="pvClose" id="pvClose" aria-label="Önizlemeyi kapat">×</button>
   </div>
   <div class="pvPhone"><iframe title="Menü önizlemesi" src="${esc(previewUrl())}"></iframe></div>`;
  document.body.appendChild(dock);
  $("pvClose").onclick=()=>{previewOpen=false;syncPreviewDock()};
 }

 if(dock){
  dock.classList.toggle("show",show);
  dock.classList.toggle("full",show&&!wide);
 }

 document.documentElement.classList.toggle("adminDocked",show&&wide);

 if(show)postPreview();
}

function postPreview(){

 if(!previewReady)return;

 clearTimeout(previewTimer);

 previewTimer=setTimeout(()=>{
  const frame=document.querySelector("#nmPreviewDock iframe");
  if(!frame||!frame.contentWindow)return;
  try{
   frame.contentWindow.postMessage({type:"nmPreview",data:JSON.parse(JSON.stringify(DATA))},location.origin);
  }catch(e){}
 },120);
}

window.addEventListener("message",e=>{

 if(PREVIEW||e.origin!==location.origin||!e.data)return;

 const frame=document.querySelector("#nmPreviewDock iframe");
 if(!frame||e.source!==frame.contentWindow)return;

 if(e.data.type==="nmPreviewReady"){
  previewReady=true;
  postPreview();
 }

 if(e.data.type==="nmPreviewEdit"&&adminOpen&&adminAuthenticated){
  const item=findProduct(String(e.data.id||""));
  if(!item)return;
  const cat=DATA.categories.find(c=>(c.items||[]).some(p=>p.id===item.id));
  collectAdmin();
  closeQuickAdd(false);
  adminTab="products";
  adminCategoryView=cat?cat.id:null;
  adminProductView=item.id;
  adminEventView=null;
  advancedProduct=false;
  previewOpen=false;
  render();
  document.querySelector(".admin")?.scrollTo(0,0);
 }
});

let previewResizeTimer=null;
window.addEventListener("resize",()=>{
 if(PREVIEW)return;
 clearTimeout(previewResizeTimer);
 previewResizeTimer=setTimeout(()=>{
  syncPreviewDock();
  if(tourState&&!tourState.welcome)placeTour();
 },150);
});

/* ---------- hızlı ekleme ---------- */

function openQuickAdd(catId){

 collectAdmin();

 if(!DATA.categories.length){
  adminTab="products";
  adminCategoryView=null;
  adminProductView=null;
  render();
  showToast("Önce bir kategori ekle");
  setTimeout(()=>$("qaCatName")?.focus(),60);
  return;
 }

 const id=findCategory(catId)?catId:(findCategory(adminCategoryView)?adminCategoryView:DATA.categories[0].id);

 adminTab="products";
 adminProductView=null;
 adminEventView=null;
 menuToolsOpen=false;
 quickAdd={catId:id,name:"",price:"",flags:{},file:null,fileUrl:""};

 render({preserveAdminScroll:true});
 setTimeout(()=>$("qaName")?.focus(),80);
}

function captureQuickAdd(){
 if(!quickAdd)return;
 const n=$("qaName"),p=$("qaPrice");
 if(n)quickAdd.name=n.value;
 if(p)quickAdd.price=p.value;
}

function closeQuickAdd(rerender=true){
 if(!quickAdd)return;
 if(quickAdd.fileUrl)URL.revokeObjectURL(quickAdd.fileUrl);
 quickAdd=null;
 if(rerender)render({preserveAdminScroll:true});
}

function renderQuickAdd(){

 if(!quickAdd)return "";

 const q=quickAdd;
 const flag=(key,label)=>`<button type="button" class="chip${q.flags[key]?" on":""}" data-qa-flag="${key}" aria-pressed="${!!q.flags[key]}">${label}</button>`;

 return `
 <div class="qaLayer">
  <div class="qaBackdrop" id="qaBackdrop"></div>
  <section class="qaSheet" role="dialog" aria-modal="true" aria-labelledby="qaTitle">
   <div class="qaGrab"></div>
   <div class="qaHead">
    <b id="qaTitle">Yeni ürün</b>
    <button class="iconBtn" id="qaClose" aria-label="Kapat">×</button>
   </div>

   <div class="field">
    <label for="qaName">Ürün adı</label>
    <input id="qaName" maxlength="80" autocomplete="off" enterkeyhint="next" value="${esc(q.name)}" placeholder="Örn. Adana Kebap">
   </div>

   <div class="row">
    <div class="field">
     <label for="qaPrice">Fiyat (₺)</label>
     <input id="qaPrice" inputmode="decimal" autocomplete="off" enterkeyhint="done" value="${esc(q.price)}" placeholder="0">
    </div>
    <div class="field">
     <label for="qaFile">Fotoğraf</label>
     <label class="fileBtn qaPhoto">
      ${q.fileUrl?`<img src="${esc(q.fileUrl)}" alt="">`:"📷 Fotoğraf seç"}
      <input id="qaFile" hidden type="file" accept="image/*">
     </label>
    </div>
   </div>

   <div class="field">
    <label>Kategori</label>
    <div class="chipRow">
     ${DATA.categories.map(c=>`<button type="button" class="chip${c.id===q.catId?" on":""}" data-qa-cat="${esc(c.id)}" aria-pressed="${c.id===q.catId}">${esc(c.name)}</button>`).join("")}
    </div>
   </div>

   <div class="field">
    <label>Durum</label>
    <div class="chipRow">
     ${flag("sold","Tükendi")}
     ${flag("featured","Çok Satan")}
     ${flag("dish","Günün Ürünü")}
    </div>
   </div>

   <div class="qaActions">
    <button class="adminButton" id="qaSave">✓ Kaydet</button>
    <button class="adminButton gold" id="qaSaveNext">Kaydet ve yenisini ekle</button>
   </div>

   <button class="loginLink" id="qaDetail">Açıklama, porsiyon, alerjen için detaylı düzenle</button>
  </section>
 </div>`;
}

async function saveQuickAdd(mode){

 captureQuickAdd();

 const q=quickAdd;
 if(!q)return;

 const name=q.name.trim().slice(0,80);
 const cat=findCategory(q.catId);

 if(!name){
  $("qaName")?.focus();
  showToast("Ürün adını yaz");
  return;
 }

 if(!cat){
  showToast("Bir kategori seç");
  return;
 }

 const item=newProduct(name,parsePrice(q.price));
 item.sold=!!q.flags.sold;
 item.featured=!!q.flags.featured;
 item.dish=!!q.flags.dish;

 cat.items=cat.items||[];
 cat.items.push(item);
 adminOpenCats.add(cat.id);

 const file=q.file;
 if(q.fileUrl)URL.revokeObjectURL(q.fileUrl);

 quickAdd=mode==="next"
  ?{catId:cat.id,name:"",price:"",flags:{},file:null,fileUrl:""}
  :null;

 if(mode==="detail"){
  adminCategoryView=cat.id;
  adminProductView=item.id;
  advancedProduct=true;
 }

 if(!saveData())return;

 translateInBackground(item,true);
 showToast("✓ "+item.name+" eklendi");

 if(file)await handleFile("productImage",item.id,file);
 else render({preserveAdminScroll:mode!=="detail"});

 if(mode==="next")setTimeout(()=>$("qaName")?.focus(),60);
 if(mode==="detail")document.querySelector(".admin")?.scrollTo(0,0);
}

function quickAddInline(catId){

 const cat=findCategory(catId);
 const row=[...document.querySelectorAll("[data-qa-row]")].find(r=>r.dataset.qaRow===catId);

 if(!cat||!row)return;

 const nameEl=row.querySelector("[data-qa-name]");
 const priceEl=row.querySelector("[data-qa-price]");
 const name=nameEl.value.trim().slice(0,80);

 if(!name){
  nameEl.focus();
  showToast("Ürün adını yaz");
  return;
 }

 const item=newProduct(name,parsePrice(priceEl.value));

 cat.items=cat.items||[];
 cat.items.push(item);

 if(!saveData())return;

 translateInBackground(item,true);
 refreshAdminMenuBody();
 showToast("✓ "+name+" eklendi");

 const again=[...document.querySelectorAll("[data-qa-row]")].find(r=>r.dataset.qaRow===catId);
 again?.querySelector("[data-qa-name]")?.focus();
}

function quickAddCategory(){

 const input=$("qaCatName");
 if(!input)return;

 const name=input.value.trim().slice(0,60);

 if(!name){
  input.focus();
  showToast("Kategori adını yaz");
  return;
 }

 const cat={id:newId(),name,names:{tr:name},image:"",items:[]};

 DATA.categories.push(cat);
 adminOpenCats.add(cat.id);

 if(!saveData())return;

 translateInBackground(cat,false);
 refreshAdminMenuBody();
 showToast("✓ "+name+" kategorisi eklendi");

 const row=[...document.querySelectorAll("[data-qa-row]")].find(r=>r.dataset.qaRow===cat.id);
 row?.scrollIntoView({block:"center",behavior:"smooth"});
 row?.querySelector("[data-qa-name]")?.focus({preventScroll:true});
}

/* ---------- kurulum kartı ---------- */

function setupTasks(){

 const products=allProducts();
 const photos=products.filter(p=>p.image).length;

 return [
  {done:!!DATA.logo,label:"Logo yüklendi",todo:"Logonu yükle",go:"logo"},
  {done:DATA.categories.length>0,label:"İlk kategori",todo:"İlk kategoriyi ekle",go:"menu"},
  {done:products.length>=5,label:"En az 5 ürün",todo:"Ürün ekle ("+products.length+"/5)",go:"menu"},
  {done:products.length>0&&photos/products.length>=.5,label:"Ürün fotoğrafları",todo:"Fotoğraf ekle ("+photos+"/"+products.length+")",go:"menu"},
  {done:!!DATA.settings.tourDone,label:"Panel turu",todo:"Panel turunu izle",go:"tour"}
 ];
}

function renderSetupCard(){

 const tasks=setupTasks();
 const done=tasks.filter(x=>x.done).length;

 if(done===tasks.length)return "";

 return `
 <div class="setupCard">
  <div class="setupTop"><b>Menün yayına hazır mı?</b><span>${done} / ${tasks.length} tamam</span></div>
  <div class="setupMeter"><i style="width:${Math.round(done/tasks.length*100)}%"></i></div>
  <div class="setupTasks">
   ${tasks.map(x=>x.done
    ?`<span>✓ ${esc(x.label)}</span>`
    :`<button type="button" data-setup-go="${x.go}">${esc(x.todo)}</button>`).join("")}
  </div>
 </div>`;
}

/* ---------- olaylar ---------- */

function bindStudio(){

 $("navAdd")?.addEventListener("click",()=>openQuickAdd());
 $("panelModeBtn")?.addEventListener("click",e=>toggleColorMode(e.currentTarget,true));
 $("qaOpen")?.addEventListener("click",()=>openQuickAdd());

 $("openPreview")?.addEventListener("click",()=>{
  collectAdmin();
  previewOpen=true;
  syncPreviewDock();
 });

 $("tourBtn")?.addEventListener("click",()=>startTour());
 $("tourBtnTop")?.addEventListener("click",()=>startTour());

 document.querySelectorAll("[data-setup-go]").forEach(btn=>{
  btn.onclick=()=>{
   const go=btn.dataset.setupGo;
   if(go==="tour"){startTour();return}
   if(go==="logo"){
    const f=document.querySelector('[data-file-type="logo"]');
    f?.closest(".field")?.scrollIntoView({block:"center",behavior:"smooth"});
    return;
   }
   collectAdmin();
   adminTab="products";
   adminCategoryView=null;
   adminProductView=null;
   render();
   document.querySelector(".admin")?.scrollTo(0,0);
  };
 });

 /* araçlar menüsü */
 $("menuToolsBtn")?.addEventListener("click",e=>{
  e.stopPropagation();
  collectAdmin();
  menuToolsOpen=!menuToolsOpen;
  render({preserveAdminScroll:true});
 });

 $("toolBulk")?.addEventListener("click",()=>{
  collectAdmin();
  menuToolsOpen=false;
  bulkOpen=true;
  render({preserveAdminScroll:true});
 });

 /* hızlı ekleme penceresi */
 if(quickAdd){

  $("qaClose")?.addEventListener("click",()=>closeQuickAdd());
  $("qaBackdrop")?.addEventListener("click",()=>closeQuickAdd());
  $("qaSave")?.addEventListener("click",()=>saveQuickAdd("close"));
  $("qaSaveNext")?.addEventListener("click",()=>saveQuickAdd("next"));
  $("qaDetail")?.addEventListener("click",()=>saveQuickAdd("detail"));

  $("qaName")?.addEventListener("keydown",e=>{
   if(e.key==="Enter"){e.preventDefault();$("qaPrice")?.focus()}
  });

  $("qaPrice")?.addEventListener("keydown",e=>{
   if(e.key==="Enter"){e.preventDefault();saveQuickAdd("next")}
  });

  document.querySelectorAll("[data-qa-cat]").forEach(btn=>{
   btn.onclick=()=>{
    quickAdd.catId=btn.dataset.qaCat;
    document.querySelectorAll("[data-qa-cat]").forEach(b=>{
     b.classList.toggle("on",b===btn);
     b.setAttribute("aria-pressed",String(b===btn));
    });
   };
  });

  document.querySelectorAll("[data-qa-flag]").forEach(btn=>{
   btn.onclick=()=>{
    const k=btn.dataset.qaFlag;
    quickAdd.flags[k]=!quickAdd.flags[k];
    btn.classList.toggle("on",quickAdd.flags[k]);
    btn.setAttribute("aria-pressed",String(quickAdd.flags[k]));
   };
  });

  $("qaFile")?.addEventListener("change",e=>{
   const file=e.target.files&&e.target.files[0];
   if(!file)return;
   if(!file.type.startsWith("image/")){showToast("Sadece fotoğraf seçebilirsin");return}
   if(file.size>30*1024*1024){showToast("Fotoğraf en fazla 30 MB olabilir");return}
   if(quickAdd.fileUrl)URL.revokeObjectURL(quickAdd.fileUrl);
   quickAdd.file=file;
   quickAdd.fileUrl=URL.createObjectURL(file);
   const box=e.target.closest(".qaPhoto");
   if(box){
    let img=box.querySelector("img");
    if(!img){
     [...box.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});
     img=document.createElement("img");
     img.alt="";
     box.prepend(img);
    }
    img.src=quickAdd.fileUrl;
   }
  });
 }
}

function bindMenuAccordion(){

 document.querySelectorAll("[data-cat-toggle]").forEach(btn=>{
  btn.onclick=()=>{
   const id=btn.dataset.catToggle;
   if(adminOpenCats.has(id))adminOpenCats.delete(id);
   else adminOpenCats.add(id);
   refreshAdminMenuBody();
  };
 });

 document.querySelectorAll("[data-quick-sold]").forEach(btn=>{
  btn.onclick=()=>{
   const p=findProduct(btn.dataset.quickSold);
   if(!p)return;
   p.sold=!p.sold;
   saveData();
   btn.classList.toggle("off",p.sold);
   btn.setAttribute("aria-pressed",String(p.sold));
   const lbl=p.sold?"Tükendi. Satışa açmak için dokun.":"Satışta. Tükendi yapmak için dokun.";
   btn.title=lbl;
   btn.setAttribute("aria-label",lbl);
   const info=btn.closest(".adminRow")?.querySelector(".adminProductInfo span");
   if(info&&btn.closest(".catItems"))info.textContent=p.sold?"Tükendi":"Düzenle ›";
   showToast(p.sold?"⛔ "+p.name+" tükendi":"✓ "+p.name+" tekrar satışta");
  };
 });

 document.querySelectorAll("[data-qa-row]").forEach(row=>{
  const id=row.dataset.qaRow;
  const nameEl=row.querySelector("[data-qa-name]");
  const priceEl=row.querySelector("[data-qa-price]");
  nameEl.onkeydown=e=>{
   if(e.key!=="Enter")return;
   e.preventDefault();
   if(priceEl.value.trim())quickAddInline(id);
   else priceEl.focus();
  };
  priceEl.onkeydown=e=>{
   if(e.key!=="Enter")return;
   e.preventDefault();
   quickAddInline(id);
  };
  row.querySelector("[data-qa-add]").onclick=()=>quickAddInline(id);
 });

 const catName=$("qaCatName");
 if(catName){
  catName.onkeydown=e=>{
   if(e.key!=="Enter")return;
   e.preventDefault();
   quickAddCategory();
  };
 }
 $("qaCatAdd")&&($("qaCatAdd").onclick=quickAddCategory);
}

document.addEventListener("click",e=>{
 if(!menuToolsOpen)return;
 if(e.target.closest(".toolsWrap"))return;
 menuToolsOpen=false;
 const menu=$("toolsMenu");
 if(menu){
  menu.remove();
  $("menuToolsBtn")?.setAttribute("aria-expanded","false");
 }
});

document.addEventListener("keydown",e=>{
 if(e.key!=="Escape"||PREVIEW||tourState)return;
 if(quickAdd){
  e.preventDefault();
  e.stopImmediatePropagation();
  closeQuickAdd();
  return;
 }
 if(menuToolsOpen){
  e.preventDefault();
  e.stopImmediatePropagation();
  menuToolsOpen=false;
  render({preserveAdminScroll:true});
  return;
 }
 if(previewOpen&&window.innerWidth<PREVIEW_DOCK_MIN){
  e.preventDefault();
  e.stopImmediatePropagation();
  previewOpen=false;
  syncPreviewDock();
 }
},true);

/* ---------- rehberlik turu ---------- */

function tourSteps(){

 const narrow=window.innerWidth<760;
 const docked=window.innerWidth>=PREVIEW_DOCK_MIN;

 return [
  {sel:".adminNav",t:"Bölümler",p:narrow
   ?"Alttaki çubukla Genel, Menü, Etkinlik ve Tasarım arasında geçersin. Ortadaki + ile her yerden ürün eklersin."
   :"Soldaki çubukla Genel, Menü, Etkinlik ve Tasarım arasında geçersin. + ile her yerden ürün eklersin."},
  {tab:"products",sel:".catRow.open .catHead",t:"Kategoriler",p:"Kategoriye dokununca ürünleri açılır. ⋮⋮ tutamacından sürükleyerek sırasını değiştirirsin. ✎ ile adını ve fotoğrafını düzenlersin."},
  {tab:"products",sel:".catRow.open .quickPrice",t:"Fiyatı yaz, bitti",p:"Kutuya yeni fiyatı yaz. Ayrıca kaydetmene gerek yok, kendiliğinden kaydedilir."},
  {tab:"products",sel:".catRow.open .soldDot",t:"Tek dokunuşla tükendi",p:"Yeşil nokta satışta, kırmızı tükendi demek. Dokununca değişir ve menüde hemen görünür."},
  {tab:"products",sel:".catRow.open .quickAdd",t:"Hızlı ürün ekleme",p:"Ürün adını ve fiyatını yaz, Enter'a bas. Ürün hemen bu kategoriye eklenir."},
  {tab:"products",sel:narrow?"#navAdd":"#qaOpen",t:"Fotoğraflı ürün",p:"Fotoğraf, kategori ve durumla birlikte eklemek için bunu kullan. Art arda ürün girebilirsin."},
  {tab:"products",sel:"#menuToolsBtn",t:"Araçlar",p:"Toplu fiyat güncelleme, eksik çeviriler ve PDF menü burada."},
  {tab:"products",sel:docked?"#nmPreviewDock .pvPhone":"#openPreview",t:"Müşterinin gördüğü menü",p:docked
   ?"Yaptığın her değişiklik burada anında görünür. Bir ürüne dokunursan düzenleme açılır."
   :"Buradan menünün müşteriye nasıl göründüğüne bakarsın. Bir ürüne dokunursan düzenleme açılır."},
  {tab:"settings",sel:'.adminNav [data-admin-tab="settings"]',t:"Tasarım",p:"Renkler, yazı tipi, logo boyutu ve arka plan burada."},
  {tab:"general",sel:narrow?"#tourBtnTop":"#tourBtn",t:"Yardım",p:"Bu turu istediğin zaman buradan tekrar başlatabilirsin."}
 ];
}

function tourLayer(){
 let layer=$("nmTour");
 if(!layer){
  layer=document.createElement("div");
  layer.id="nmTour";
  document.body.appendChild(layer);
 }
 return layer;
}

function maybeWelcome(){

 if(PREVIEW||tourState||DATA.settings.tourDone)return;

 try{if(sessionStorage.getItem("nmTourLater"))return}catch(e){}

 tourState={welcome:true};

 tourLayer().innerHTML=`
 <div class="tourWelcome" role="dialog" aria-modal="true" aria-labelledby="tourHello">
  <div class="tourCard">
   <svg class="tourEmblem" viewBox="0 0 86 86" aria-hidden="true">
    <circle cx="43" cy="43" r="39"/>
    <path d="M43 18c8 8 8 20 0 27c-8-7-8-19 0-27z"/>
    <path d="M24 35c11 0 19 8 19 10c-9 4-19-2-19-10z"/>
    <path d="M62 35c-11 0-19 8-19 10c9 4 19-2 19-10z"/>
   </svg>
   <h3 id="tourHello">Hoş geldin</h3>
   <p>Panelin nasıl çalıştığını 1 dakikada gösterelim. İstediğin an çıkabilirsin.</p>
   <button class="adminButton gold" id="tourGo">Turu başlat</button>
   <button class="tourLater" id="tourLater">Sonra</button>
  </div>
 </div>`;

 $("tourGo").onclick=()=>startTour();
 $("tourLater").onclick=()=>{
  try{sessionStorage.setItem("nmTourLater","1")}catch(e){}
  endTour(false);
 };
 setTimeout(()=>$("tourGo")?.focus(),60);
}

function startTour(){

 if(!adminOpen||!adminAuthenticated)return;

 collectAdmin();
 closeQuickAdd(false);
 menuToolsOpen=false;
 previewOpen=false;

 /* Ürün adımları için ürünü olan bir kategori açık olsun */
 const hasOpen=DATA.categories.some(c=>adminOpenCats.has(c.id)&&(c.items||[]).length);
 if(!hasOpen){
  const c=DATA.categories.find(c=>(c.items||[]).length);
  if(c)adminOpenCats.add(c.id);
 }

 tourState={i:0,steps:tourSteps()};

 tourLayer().innerHTML=`
  <div class="tourSpot" id="tourSpot"></div>
  <div class="tourTip" id="tourTip" role="dialog" aria-modal="true" aria-labelledby="tourTitle" aria-live="polite">
   <div class="tourStep" id="tourStepNo"></div>
   <h3 id="tourTitle"></h3>
   <p id="tourText"></p>
   <div class="tourDots">${tourState.steps.map(()=>"<i></i>").join("")}</div>
   <div class="tourNav">
    <button class="tourSkip" id="tourSkip">Turu bitir</button>
    <button class="adminButton" id="tourBack">Geri</button>
    <button class="adminButton gold" id="tourNext">İleri</button>
   </div>
  </div>`;

 $("tourSkip").onclick=()=>endTour(true);
 $("tourBack").onclick=()=>goTour(tourState.i-1,-1);
 $("tourNext").onclick=()=>{
  if(tourState.i>=tourState.steps.length-1)endTour(true);
  else goTour(tourState.i+1,1);
 };

 goTour(0,1);
 setTimeout(()=>$("tourNext")?.focus({preventScroll:true}),80);
}

function tourTarget(step){
 const el=[...document.querySelectorAll(step.sel)].find(x=>x.getClientRects().length);
 return el||null;
}

function goTour(i,dir){

 if(!tourState||tourState.welcome)return;

 const steps=tourState.steps;

 while(i>=0&&i<steps.length){

  const step=steps[i];

  if(step.tab&&adminTab!==step.tab){
   collectAdmin();
   adminTab=step.tab;
   adminCategoryView=null;
   adminProductView=null;
   adminEventView=null;
   render();
  }

  if(tourTarget(step))break;

  i+=dir;
 }

 if(i<0)i=0;

 if(i>=steps.length){
  endTour(true);
  return;
 }

 tourState.i=i;

 const el=tourTarget(steps[i]);

 if(el&&el.closest(".admin"))el.scrollIntoView({block:"center",behavior:"auto"});

 $("tourStepNo").textContent="Adım "+(i+1)+" / "+steps.length;
 $("tourTitle").textContent=steps[i].t;
 $("tourText").textContent=steps[i].p;
 $("tourBack").style.visibility=i?"visible":"hidden";
 $("tourNext").textContent=i===steps.length-1?"Bitir":"İleri";
 document.querySelectorAll(".tourDots i").forEach((d,k)=>d.classList.toggle("on",k===i));

 requestAnimationFrame(placeTour);
}

function placeTour(){

 if(!tourState||tourState.welcome)return;

 const spot=$("tourSpot"),tip=$("tourTip");
 const el=tourTarget(tourState.steps[tourState.i]);

 if(!spot||!tip)return;

 if(!el){
  spot.style.cssText="top:50%;left:50%;width:0;height:0";
  return;
 }

 const r=el.getBoundingClientRect();
 const W=window.innerWidth,H=window.innerHeight;
 const pad=6;
 const top=Math.max(4,r.top-pad),left=Math.max(4,r.left-pad);
 const width=Math.min(W-8,r.right+pad)-left;
 const height=Math.min(H-8,r.bottom+pad)-top;

 spot.style.top=top+"px";
 spot.style.left=left+"px";
 spot.style.width=width+"px";
 spot.style.height=height+"px";

 const tw=tip.offsetWidth,th=tip.offsetHeight;
 let tTop,tLeft;

 if(height>H*.55){
  /* uzun öğe (yan çubuk, önizleme): yanına koy */
  tTop=Math.max(12,Math.min(H-th-12,top+20));
  tLeft=left+width+14+tw<=W-12?left+width+14:left-tw-14;
  if(tLeft<12){tLeft=Math.max(12,(W-tw)/2);tTop=Math.max(12,(H-th)/2)}
 }else{
  tTop=top+height+12;
  if(tTop+th>H-12)tTop=top-th-12;
  if(tTop<12)tTop=Math.max(12,H-th-12);
  tLeft=Math.max(12,Math.min(W-tw-12,left+width/2-tw/2));
 }

 tip.style.top=tTop+"px";
 tip.style.left=tLeft+"px";
}

function endTour(markDone){

 tourState=null;
 $("nmTour")?.remove();

 if(markDone&&!DATA.settings.tourDone){
  DATA.settings.tourDone=true;
  saveData();
  if(adminOpen&&adminAuthenticated){
   render({preserveAdminScroll:true});
   showToast("✓ Tur tamamlandı");
  }
 }
}

document.addEventListener("keydown",e=>{
 if(!tourState)return;
 if(e.key==="Escape"){
  e.preventDefault();
  e.stopImmediatePropagation();
  endTour(!tourState.welcome);
  return;
 }
 if(tourState.welcome)return;
 if(e.key==="ArrowRight"){e.preventDefault();e.stopImmediatePropagation();$("tourNext")?.click()}
 if(e.key==="ArrowLeft"&&tourState.i>0){e.preventDefault();e.stopImmediatePropagation();$("tourBack")?.click()}
},true);

window.addEventListener("scroll",()=>{if(tourState&&!tourState.welcome)placeTour()},true);

/* =========================================================
   LOGIN
========================================================= */

function renderAdminLogin(){
 return renderCloudLogin();
}

/* =========================================================
   ADMIN COLLECT
========================================================= */

function collectAdmin(){

 document.querySelectorAll("[data-admin]")
 .forEach(el=>{

  const key=el.dataset.admin;
  const value=el.value;

  if(key==="businessName")
   DATA.name=value;

  else if(key==="subtitle"){
   if(DATA.subtitle!==value){
    DATA.subtitle=value;
    DATA.subtitles={tr:value};
   }
  }

  else if(key==="phone")
   DATA.phone=value;

  else if(key==="whatsapp")
   DATA.whatsapp=value;

  else if(key==="hours")
   DATA.hours=value;

  else if(key.startsWith("info.week.")){
   const [,,i,f]=key.split(".");
   const w=DATA.info?.week?.[+i];
   if(w&&(f==="o"||f==="c")&&/^\d{2}:\d{2}$/.test(value))w[f]=value;
  }

  else if(key.startsWith("info.")){
   const k=key.slice(5);
   if(DATA.info&&k in DATA.info&&typeof DATA.info[k]==="string")
    DATA.info[k]=String(value).trim().slice(0,300);
  }

  else if(key==="rateUSD")
   DATA.rates.USD=Number(value)||0;

  else if(key==="rateEUR")
   DATA.rates.EUR=Number(value)||0;

  else if(key==="fontFamily")
   DATA.theme.fontFamily=value;

  else if(key==="titleFont")
   DATA.theme.titleFont=value;

  else if(key==="defaultMode")
   DATA.theme.defaultMode=value;

  else if(key.startsWith("categoryName-")){

   const id=key.replace("categoryName-","");
   const c=findCategory(id);

   if(c&&c.name!==value){

    c.name=value;
    markCategoryTranslationDirty(c);
   }
  }

  else if(key.startsWith("productName-")){

   const id=key.replace("productName-","");
   const p=findProduct(id);

   if(p&&p.name!==value){

    p.name=value;
    markProductTranslationDirty(p);
   }
  }

  else if(key.startsWith("productDescription-")){

   const id=key.replace("productDescription-","");
   const p=findProduct(id);

   if(p&&p.description!==value){

    p.description=value;
    markProductTranslationDirty(p);
   }
  }

  else if(key.startsWith("productPrice-")){

   const id=key.replace("productPrice-","");
   const p=findProduct(id);

   if(p)p.price=Math.max(0,Number(value)||0);
  }

  else if(key.startsWith("productPortion-")){

   const id=key.replace("productPortion-","");
   const p=findProduct(id);

   if(p)p.portion=value;
  }

  else if(key.startsWith("productCalories-")){

   const id=key.replace("productCalories-","");
   const p=findProduct(id);

   if(p)p.calories=value;
  }

  else if(key.startsWith("productAllergens-")){

   const id=key.replace("productAllergens-","");
   const p=findProduct(id);

   if(p){

    p.allergens=value
     .split(",")
     .map(x=>x.trim())
     .filter(Boolean);
   }
  }

  else if(key.startsWith("productCategory-")){

   const id=key.replace("productCategory-","");
   const from=DATA.categories.find(c=>(c.items||[]).some(p=>p.id===id));
   const to=findCategory(value);

   if(from&&to&&from!==to){

    const p=from.items.find(x=>x.id===id);

    from.items=from.items.filter(x=>x.id!==id);
    to.items.push(p);

    if(adminCategoryView===from.id)
     adminCategoryView=to.id;
   }
  }

  else if(key.startsWith("eventName-")){

   const ev=findEvent(key.replace("eventName-",""));

   if(ev&&ev.name!==value){
    ev.name=value;
    ev.names={tr:value};
   }
  }

  else if(key.startsWith("eventDescription-")){

   const ev=findEvent(key.replace("eventDescription-",""));

   if(ev&&ev.description!==value){
    ev.description=value;
    ev.descriptions={tr:value};
   }
  }

  else if(key.startsWith("eventDate-")){

   const ev=findEvent(key.replace("eventDate-",""));
   if(ev)ev.date=value;
  }

  else if(key.startsWith("eventTime-")){

   const ev=findEvent(key.replace("eventTime-",""));
   if(ev)ev.time=value;
  }

  else if(key.startsWith("productSpicy-")){

   const id=key.replace("productSpicy-","");
   const p=findProduct(id);

   if(p){

    p.spicy=Math.max(
     0,
     Math.min(5,Number(value)||0)
    );
   }
  }

 });

 /* Elle girilen çeviriler (sadece değiştirilenler) */
 document.querySelectorAll("[data-admin-tr]")
 .forEach(el=>{

  if(el.value===el.dataset.orig)return;

  const parts=el.dataset.adminTr.split("|");
  const value=el.value.trim();

  if(parts[0]==="subtitle"){

   if(!DATA.subtitles||DATA.subtitles.tr!==DATA.subtitle)
    DATA.subtitles={tr:DATA.subtitle||""};

   DATA.subtitles[parts[1]]=value;
   return;
  }

  const [type,id,lang,field]=parts;

  const item=
   type==="category"?findCategory(id):
   type==="product"?findProduct(id):
   type==="event"?findEvent(id):null;

  if(!item)return;

  if(field==="name"){
   if(!item.names)item.names={};
   item.names.tr=item.name||"";
   item.names[lang]=value;
  }else{
   if(!item.descriptions)item.descriptions={};
   item.descriptions.tr=item.description||"";
   item.descriptions[lang]=value;
  }
 });

 document.querySelectorAll("[data-info-flag]").forEach(el=>{
  const f=el.dataset.infoFlag;
  if(!DATA.info)return;
  if(f==="weekOn"||f==="vat")DATA.info[f]=el.checked;
  else if(f.startsWith("off.")){const w=DATA.info.week[+f.slice(4)];if(w)w.off=el.checked}
 });
}

/* =========================================================
   FILE
========================================================= */

async function handleFile(type,id,file){

 if(!file)return;

 /* Fotoğraf seçilmeden önce yazılanlar kaybolmasın */
 collectAdmin();

 const maxImage=30*1024*1024;
 const maxVideo=20*1024*1024;
 const isVideo=file.type.startsWith("video/");

 if(isVideo&&file.size>maxVideo){
  alert("Video en fazla 20 MB olabilir. Videoyu kısaltın ya da telefonda daha düşük kalitede kaydedin (10-15 saniye yeterli).");
  return;
 }

 if(!isVideo&&file.size>maxImage){
  alert("Fotoğraf en fazla 30 MB olabilir.");
  return;
 }

 try{

  let freeLogo=false;

  if(type==="logo"&&!isVideo){
   const out=await prepareLogo(file);
   if(out){file=out;freeLogo=true}
   else file=await compressImage(file,700,true);
  }else if(!isVideo){
   file=await compressImage(file,1600,false);
  }

  if(!canWrite()){
   alert("Fotoğraf yüklemek için giriş yapmalısınız.");
   return;
  }

  showToast(isVideo?"Video yükleniyor...":"Fotoğraf yükleniyor...");

  const previous=currentMediaRef(type,id);
  const reference=await uploadMedia(type,id,file);

  if(type==="logo"){
   DATA.logo=reference;
   DATA.theme=DATA.theme||{};
   if(freeLogo)DATA.theme.logoStyle="free";
   else delete DATA.theme.logoStyle;
  }

  else if(type==="backgroundImage"){

   DATA.background.image=reference;
   DATA.background.type="image";

  }else if(type==="backgroundVideo"){

   DATA.background.video=reference;
   DATA.background.type="video";

  }else if(type==="categoryImage"){

   const c=findCategory(id);
   if(c)c.image=reference;

  }else if(type==="productImage"){

   const p=findProduct(id);
   if(p)p.image=reference;

  }else if(type==="eventImage"){

   const ev=findEvent(id);
   if(ev)ev.image=reference;

  }

  /* Eski dosya, yeni hâl sunucuya kaydedilince silinir */
  if(previous&&previous!==reference)removeMedia(previous);

  saveData();

  rememberAdminScroll();

  render({
   preserveAdminScroll:true
  });

 }catch(e){

  console.error(e);
  alert("Dosya kaydedilemedi.");
 }
}

/* Silinen / değiştirilen dosyalar sıraya alınır; menü sunucuya kaydedildikten sonra
   (artık hiçbir yerde kullanılmıyorsa) R2'den silinir. Sadece bu işletmenin klasörü. */
const pendingMediaDeletes=new Set();

function currentMediaRef(type,id){
 if(type==="logo")return DATA.logo||"";
 if(type==="backgroundImage")return DATA.background?.image||"";
 if(type==="backgroundVideo")return DATA.background?.video||"";
 if(type==="categoryImage")return findCategory(id)?.image||"";
 if(type==="productImage")return findProduct(id)?.image||"";
 if(type==="eventImage")return findEvent(id)?.image||"";
 return "";
}

async function removeMedia(value){
 const x=value&&NDMedia.parse(value);
 if(!x||x.bucket!==MEDIA_BUCKET||!DATA.restaurantId||!x.path.startsWith(DATA.restaurantId+"/"))return;
 pendingMediaDeletes.add(String(value));
}

function flushMediaDeletes(){
 if(!pendingMediaDeletes.size||!canWrite())return;
 const json=JSON.stringify(DATA);
 [...pendingMediaDeletes].forEach(url=>{
  pendingMediaDeletes.delete(url);
  if(!json.includes(url))deleteServerMedia(url);
 });
}

async function clearFile(type,id){

 collectAdmin();

 if(type==="logo"){

  await removeMedia(DATA.logo);
  DATA.logo="";
  if(DATA.theme)delete DATA.theme.logoStyle;

 }else if(type==="backgroundImage"){

  await removeMedia(DATA.background.image);
  DATA.background.image="";

 }else if(type==="backgroundVideo"){

  await removeMedia(DATA.background.video);
  DATA.background.video="";

 }else if(type==="categoryImage"){

  const c=findCategory(id);

  if(c){
   await removeMedia(c.image);
   c.image="";
  }

 }else if(type==="productImage"){

  const p=findProduct(id);

  if(p){
   await removeMedia(p.image);
   p.image="";
  }

 }else if(type==="eventImage"){

  const ev=findEvent(id);

  if(ev){
   await removeMedia(ev.image);
   ev.image="";
  }
 }

 saveData();

 rememberAdminScroll();

 render({
  preserveAdminScroll:true
 });
}

/* =========================================================
   SCROLL
========================================================= */

function rememberWindowScroll(){

 savedWindowScroll=
  window.scrollY||
  window.pageYOffset||
  0;
}

function rememberAdminScroll(){

 const admin=document.querySelector(".admin");

 if(admin)
  savedAdminScroll=admin.scrollTop||0;
}

function restoreWindowScroll(){

 const y=savedWindowScroll;

 requestAnimationFrame(()=>{
  window.scrollTo(0,y);
 });
}

function restoreAdminScroll(){

 const y=savedAdminScroll;

 requestAnimationFrame(()=>{

  requestAnimationFrame(()=>{

   const admin=document.querySelector(".admin");

   if(admin)
    admin.scrollTop=y;
  });

 });
}

/* =========================================================
   PANELİ KAPAT
========================================================= */

function closeAdminAfterSave(){

 adminOpen=false;
 adminAuthenticated=false;

 adminCategoryView=null;
 adminProductView=null;

 advancedProduct=false;
 savedAdminScroll=0;

 render({
  preserveWindowScroll:true
 });
}

/* =========================================================
   RENDER
========================================================= */

let lastPageKey="";

function render(options={}){

 if(quickAdd)captureQuickAdd();

 if(options.preserveAdminScroll)
  rememberAdminScroll();

 if(options.preserveWindowScroll)
  rememberWindowScroll();

 document.documentElement.dir=
  language==="ar"?"rtl":"ltr";

 document.documentElement.lang=language;

 document.title=(DATA.name||"Menü")+" • Dijital Menü";

 applyTheme();

 let content="";

 if(CLOUD&&!cloud.ready)
  content=renderCloudState();

 else if(searchText)
  content=renderSearch();

 else if(selectedCategory)
  content=renderCategoryPage();

 else
  content=renderHome();

 const app=document.getElementById("app");
 const pageKey=(CLOUD&&!cloud.ready?"yukleniyor":searchText?"arama":selectedCategory?"kat:"+selectedCategory:"ana")+"|"+language;
 const samePage=pageKey===lastPageKey;
 const modalWasOpen=!!(app.querySelector(".modalOverlay"));
 lastPageKey=pageKey;
 app.classList.toggle("noAnim",samePage);
 /* arka plan (video dahil) ve yatay kaydırma konumları korunur */
 const oldBg=$("siteBackground");
 const oldSig=oldBg&&oldBg.dataset.sig;
 const hScroll=samePage?[...app.querySelectorAll(".horizontal")].map(h=>h.scrollLeft):[];
 /* yüklenmiş görselleri sakla: yeni çizimde aynı görsel varsa eski (hazır) öğe taşınır, yeniden yüklenmez */
 const imgPool=new Map();
 app.querySelectorAll("img[src]").forEach(im=>{
  const k=im.getAttribute("src");
  if(!imgPool.has(k))imgPool.set(k,[]);
  imgPool.get(k).push(im);
 });
 const winY=window.scrollY;

 app.innerHTML=`

  ${renderBackground()}

  <div class="container">

   <div class="top">

    <div class="topRow">

     <div class="topRight">

      ${
       DATA.settings.themeToggle!==false
       ?
       `<button class="iconBtn themeToggle" id="themeToggle" type="button"
         aria-label="${currentMode()==="light"?"Koyu moda geç":"Açık moda geç"}"
         title="${currentMode()==="light"?"Koyu moda geç":"Açık moda geç"}">${THEME_ICONS}</button>`
       :""
      }

      ${
       DATA.settings.search
       ?
       `<button class="iconBtn" id="searchButton">⌕</button>`
       :""
      }

      <button class="currencyBtn" id="currencyButton">

       ${
        currency==="TRY"
        ?"₺"
        :
        currency==="USD"
        ?"$"
        :"€"
       }

      </button>

      ${renderCurrencyPopup()}

      <button
       class="iconBtn languageBtn"
       id="languageButton">

       ${
        language==="tr"
        ?"TR"
        :
        language==="en"
        ?"EN"
        :"AR"
       }

      </button>

      ${renderLanguagePopup()}

     </div>

    </div>

    ${
     searchOpen
     ?
     `<div class="searchBox">

      <input
       id="searchInput"
       value="${esc(searchText)}"
       placeholder="${t("search")}">

     </div>`
     :""
    }

   </div>

   ${renderHero()}

   <main class="pageContent">
    ${content}
   </main>

   ${CLOUD&&!cloud.ready||searchText?"":renderInfo()}

   ${renderSignature()}

  </div>

  ${renderProductModal()}
  ${renderEventModal()}
  ${renderAdmin()}
  ${renderAdminLogin()}
 `;

 app.querySelectorAll("img[src]").forEach(im=>{
  const list=imgPool.get(im.getAttribute("src"));
  if(!list||!list.length)return;
  const old=list.shift();
  /* yeni öğenin özniteliklerini eskisine aktar (sınıf, alt vb.) */
  [...old.attributes].forEach(a=>{if(!im.hasAttribute(a.name))old.removeAttribute(a.name)});
  [...im.attributes].forEach(a=>{if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value)});
  im.replaceWith(old);
 });
 if(samePage&&Math.abs(window.scrollY-winY)>2)window.scrollTo(0,winY);

 const newBg=$("siteBackground");
 if(oldBg&&newBg&&oldSig&&oldSig===newBg.dataset.sig)newBg.replaceWith(oldBg);
 if(hScroll.length)app.querySelectorAll(".horizontal").forEach((h,k)=>{if(hScroll[k])h.scrollLeft=hScroll[k]});
 app.classList.toggle("noModalAnim",modalWasOpen);

 bindEvents();

 resolveMediaElements();

 if(!PREVIEW)syncPreviewDock();

 if(options.preserveAdminScroll)
  restoreAdminScroll();

 if(options.preserveWindowScroll)
  restoreWindowScroll();

 if(options.resetScroll){

  requestAnimationFrame(()=>{
   window.scrollTo({
    top:0,
    behavior:"smooth"
   });
  });
 }
}

/* =========================================================
   EVENTS
========================================================= */

function bindEvents(){

 bindAdminExtras();

 document.querySelectorAll("[data-copy]").forEach(b=>{
  b.onclick=()=>{
   copyText(b.dataset.copy).then(()=>{
    b.classList.add("done");
    const sp=b.querySelector("span");if(sp)sp.textContent=t("copied");
    showToast("✓ "+t("copied"));
    setTimeout(()=>{b.classList.remove("done");if(sp)sp.textContent=t("copy")},1800);
   }).catch(()=>{});
  };
 });

 (()=>{

  const logo=$("heroLogo");
  if(!logo)return;

  let holdTimer=null;

  const cancelHold=()=>{
   clearTimeout(holdTimer);
   holdTimer=null;
   logo.classList.remove("holding");
  };

  logo.addEventListener("contextmenu",e=>e.preventDefault());
  logo.addEventListener("dragstart",e=>e.preventDefault());

  logo.addEventListener("pointerdown",e=>{

   if(e.button!==undefined&&e.button!==0)return;

   cancelHold();
   logo.classList.add("holding");

   holdTimer=setTimeout(()=>{

    cancelHold();

    try{navigator.vibrate&&navigator.vibrate(40)}catch(_){}

    openAdminFlow();

   },3000);
  });

  ["pointerup","pointerleave","pointercancel"].forEach(ev=>
   logo.addEventListener(ev,cancelHold)
  );

 })();

 $("currencyButton")?.addEventListener("click",e=>{

  e.stopPropagation();

  rememberWindowScroll();

  currencyMenu=!currencyMenu;
  languageMenu=false;

  render({
   preserveWindowScroll:true
  });
 });

 document.querySelectorAll("[data-currency]")
 .forEach(btn=>{

  btn.onclick=e=>{

   e.stopPropagation();

   currency=btn.dataset.currency;

   safeSet(
    "nearMenuCurrency",
    currency
   );

   currencyMenu=false;

   render({
    preserveWindowScroll:true
   });
  };
 });

 $("languageButton")?.addEventListener("click",e=>{

  e.stopPropagation();

  rememberWindowScroll();

  languageMenu=!languageMenu;
  currencyMenu=false;

  render({
   preserveWindowScroll:true
  });
 });

 document.querySelectorAll("[data-language]")
 .forEach(btn=>{

  btn.onclick=e=>{

   e.stopPropagation();

   language=btn.dataset.language;

   safeSet(
    "nearMenuLanguage",
    language
   );

   languageMenu=false;

   render({
    preserveWindowScroll:true
   });
  };
 });

 $("searchButton")?.addEventListener("click",()=>{

  rememberWindowScroll();

  searchOpen=!searchOpen;

  if(!searchOpen)
   searchText="";
  else
   pushLayer();

  render({
   preserveWindowScroll:true
  });

  setTimeout(()=>$("searchInput")?.focus(),30);
 });

 $("searchInput")?.addEventListener("input",e=>{

  searchText=e.target.value;

  /* Sadece içerik güncellenir: klavye kapanmaz, sonuçlar üstte görünür */
  updateContent();

  window.scrollTo(0,0);
 });

 bindContentEvents();

 /* --- içerik olayları bindContentEvents içinde --- */
 $("closeEvent")?.addEventListener("click",()=>{

  selectedEvent=null;

  render({
   preserveWindowScroll:true
  });
 });

 $("eventOverlay")?.addEventListener("click",e=>{

  if(e.target.id==="eventOverlay"){

   selectedEvent=null;

   render({
    preserveWindowScroll:true
   });
  }
 });

 $("closeProduct")?.addEventListener("click",()=>{

  rememberWindowScroll();

  selectedProduct=null;

  render({
   preserveWindowScroll:true
  });
 });

 $("productOverlay")?.addEventListener("click",e=>{

  if(e.target.id==="productOverlay"){

   rememberWindowScroll();

   selectedProduct=null;

   render({
    preserveWindowScroll:true
   });
  }
 });

 $("closeAdmin")?.addEventListener("click",()=>{

  collectAdmin();

  if(!saveData())return;

  adminOpen=false;
  adminAuthenticated=false;

  adminCategoryView=null;
  adminProductView=null;

  render({
   preserveWindowScroll:true
  });
 });

 /* ======================================================
    ANA KAYDET
    KAYDETTİKTEN SONRA PANEL KAPANIR
 ====================================================== */

 $("saveAdmin")?.addEventListener("click",()=>{

  collectAdmin();

  const saved=saveData();

  if(!saved)return;

  closeAdminAfterSave();
 });

 document.querySelectorAll("[data-admin-tab]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();
   rememberAdminScroll();

   adminTab=btn.dataset.adminTab;
   adminCategoryView=null;
   adminProductView=null;
   adminEventView=null;
   advancedProduct=false;

   saveData();

   render({
    preserveAdminScroll:true
   });
  };
 });

 document.querySelectorAll("[data-admin-tab-direct]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();

   adminTab=btn.dataset.adminTabDirect;
   adminCategoryView=null;
   adminProductView=null;
   adminEventView=null;

   render({
    preserveAdminScroll:true
   });
  };
 });

 document.querySelectorAll("[data-admin-category]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();
   rememberAdminScroll();

   adminCategoryView=
    btn.dataset.adminCategory;
   adminProductView=null;
   pushLayer();
   render({
    preserveAdminScroll:true
   });
  };
 });

 $("adminProductsBack")?.addEventListener("click",()=>{

  collectAdmin();
  rememberAdminScroll();

  adminCategoryView=null;
  adminProductView=null;

  render({
   preserveAdminScroll:true
  });
 });

 $("saveCategoryNow")?.addEventListener("click",()=>{

  collectAdmin();

  const c=findCategory(adminCategoryView);

  if(c&&!c.name.trim()){
   alert("Kategori adı boş bırakılamaz.");
   return;
  }

  if(!saveData())return;

  adminCategoryView=null;
  adminProductView=null;

  render();
  showToast("✓ Kategori kaydedildi");

  translateInBackground(c,false);
 });

 document.querySelectorAll("[data-admin-product]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();
   rememberAdminScroll();

   adminProductView=
    btn.dataset.adminProduct;
   advancedProduct=false;
   pushLayer();
   render({
    preserveAdminScroll:true
   });
  };
 });

 $("adminProductBack")?.addEventListener("click",()=>{

  collectAdmin();
  rememberAdminScroll();

  adminProductView=null;
  advancedProduct=false;

  render({
   preserveAdminScroll:true
  });
 });

 document.querySelectorAll("[data-toggle-advanced]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();
   rememberAdminScroll();

   advancedProduct=!advancedProduct;

   render({
    preserveAdminScroll:true
   });
  };
 });

 document.querySelectorAll("[data-setting]")
 .forEach(input=>{

  input.onchange=()=>{

   DATA.settings[input.dataset.setting]=
    input.checked;

   saveData();
  };
 });

 document.querySelectorAll("[data-sold]")
 .forEach(input=>{

  input.onchange=()=>{

   const p=findProduct(input.dataset.sold);

   if(p)p.sold=input.checked;

   saveData();
  };
 });

 document.querySelectorAll("[data-featured]")
 .forEach(input=>{

  input.onchange=()=>{

   const p=findProduct(input.dataset.featured);

   if(p)p.featured=input.checked;

   saveData();
  };
 });

 document.querySelectorAll("[data-dish]")
 .forEach(input=>{

  input.onchange=()=>{

   const p=findProduct(input.dataset.dish);

   if(p)p.dish=input.checked;

   saveData();
  };
 });

 document.querySelectorAll("[data-theme-color]")
 .forEach(btn=>{

  btn.onclick=()=>{

   const color=btn.dataset.themeColor;

   DATA.theme.accent=color;
   DATA.theme.accent2=color;
   DATA.theme.price=color;

   applyTheme();
   saveData();

   document.querySelectorAll(
    "[data-theme-color]"
   ).forEach(x=>{

    x.classList.toggle(
     "active",
     x.dataset.themeColor===DATA.theme.accent
    );
   });
  };
 });

 document.querySelectorAll("[data-color-setting]")
 .forEach(input=>{

  input.oninput=()=>{

   const key=input.dataset.colorSetting;

   if(key==="background"){

    DATA.background.type="color";
    DATA.background.value=input.value;

    const bg=$("siteBackground");

    if(bg)
     bg.style.backgroundColor=input.value;

   }else{

    DATA.theme[key]=input.value;
    applyTheme();
   }

   saveData();
  };
 });

 document.querySelectorAll("[data-design]")
 .forEach(input=>{

  input.oninput=()=>{

   const key=input.dataset.design;
   const value=Number(input.value);

   if(key==="cardOpacity")
    DATA.theme.cardOpacity=value/100;
   else
    DATA.theme[key]=value;

   const label=$(key+"Value");

   if(label)
    label.textContent=value+(input.dataset.suffix||"px");

   applyTheme();
   saveData();
  };
 });

 document.querySelectorAll("[data-background]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();
   rememberAdminScroll();

   DATA.background.type=
    btn.dataset.background;

   saveData();

   render({
    preserveAdminScroll:true
   });
  };
 });

 document.querySelectorAll("[data-file-type]")
 .forEach(input=>{

  input.onchange=e=>{

   handleFile(
    input.dataset.fileType,
    input.dataset.fileId,
    e.target.files?.[0]
   );
  };
 });

 document.querySelectorAll("[data-clear-file]")
 .forEach(btn=>{

  btn.onclick=async()=>{

   const parts=
    btn.dataset.clearFile.split("|");

   await clearFile(
    parts[0],
    parts[1]
   );
  };
 });

 document.querySelectorAll("[data-delete-category]")
 .forEach(btn=>{

  btn.onclick=()=>{

   if(!confirm(
    "Bu kategori ve içindeki tüm ürünler silinsin mi?"
   ))return;

   const removedCat=findCategory(btn.dataset.deleteCategory);

   if(removedCat){
    removeMedia(removedCat.image);
    (removedCat.items||[]).forEach(p=>removeMedia(p.image));
   }

   DATA.categories=
    DATA.categories.filter(
     c=>c.id!==btn.dataset.deleteCategory
    );

   adminCategoryView=null;
   adminProductView=null;

   if(!saveData())return;

   render({
    preserveAdminScroll:true
   });
  };
 });

 document.querySelectorAll("[data-delete-product]")
 .forEach(btn=>{

  btn.onclick=()=>{

   const parts=
    btn.dataset.deleteProduct.split("|");

   const category=findCategory(parts[0]);

   if(!category)return;

   if(!confirm("Bu ürün silinsin mi?"))
    return;

   const removed=category.items.find(p=>p.id===parts[1]);
   if(removed)removeMedia(removed.image);

   category.items=
    category.items.filter(
     p=>p.id!==parts[1]
    );

   adminProductView=null;

   if(!saveData())return;

   render({
    preserveAdminScroll:true
   });
  };
 });

 $("addCategory")?.addEventListener("click",()=>{

  collectAdmin();
  rememberAdminScroll();

  const id=
   newId();

  DATA.categories.push({

   id:id,

   name:"Yeni Kategori",

   names:{
    tr:"Yeni Kategori"
   },

   image:"",

   items:[]
  });

  adminCategoryView=id;
  adminProductView=null;

  pushLayer();
  saveData();

  render({
   preserveAdminScroll:true
  });
 });

 document.querySelectorAll("[data-add-product]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();
   rememberAdminScroll();

   const category=findCategory(
    btn.dataset.addProduct
   );

   if(!category)return;

   const id=
    newId();

   category.items.push({

    id:id,

    name:"Yeni Ürün",

    names:{
     tr:"Yeni Ürün"
    },

    description:"",

    descriptions:{
     tr:""
    },

    portion:"",
    calories:"",
    allergens:[],
    spicy:0,
    price:0,
    image:"",
    video:"",
    featured:false,
    dish:false,
    sold:false
   });

   adminProductView=id;
   advancedProduct=false;

   pushLayer();
   saveData();

   render({
    preserveAdminScroll:true
   });
  };
 });

 $("saveProductNow")?.addEventListener(
  "click",
  ()=>{

   collectAdmin();

   const item=findProduct(
    adminProductView
   );

   if(!item){

    alert("Ürün bulunamadı.");
    return;
   }

   if(!item.name.trim()){

    alert("Ürün adı boş bırakılamaz.");
    return;
   }

   if(!saveData())
    return;

   /* Panel açık kalır, kategorinin ürün listesine dönülür */
   const cat=DATA.categories.find(c=>(c.items||[]).some(p=>p.id===item.id));

   adminProductView=null;
   adminCategoryView=cat?cat.id:null;
   advancedProduct=false;

   render();
   showToast("✓ Ürün kaydedildi");

   translateInBackground(item,true);
  }
 );
}

/* =========================================================
   İÇERİK OLAYLARI (kategori, ürün, etkinlik kartları)
========================================================= */

function bindContentEvents(){

 document.querySelectorAll("[data-category]")
 .forEach(btn=>{

  btn.onclick=()=>{

   selectedCategory=btn.dataset.category;
   selectedProduct=null;
   selectedEvent=null;
   searchText="";
   searchOpen=false;

   pushLayer();

   render();
   window.scrollTo(0,0);
  };
 });

 const back=$("backHome");

 if(back){
  back.onclick=()=>{
   selectedCategory=null;
   render();
   window.scrollTo(0,0);
  };
 }

 document.querySelectorAll("[data-product]")
 .forEach(el=>{

  el.onclick=()=>{

   const product=findProduct(el.dataset.product);

   if(product){

    rememberWindowScroll();
    selectedProduct=product;

    pushLayer();

    render({
     preserveWindowScroll:true
    });
   }
  };
 });

 document.querySelectorAll("[data-event]")
 .forEach(el=>{

  el.onclick=()=>{

   rememberWindowScroll();
   selectedEvent=el.dataset.event;

   pushLayer();

   render({
    preserveWindowScroll:true
   });
  };
 });
}

function updateContent(){

 const main=document.querySelector("main.pageContent");

 if(!main){
  render();
  return;
 }

 main.innerHTML=
  searchText?renderSearch():
  selectedCategory?renderCategoryPage():
  renderHome();

 const hero=$("heroWrap");

 if(hero)
  hero.classList.toggle("heroHidden",!!(searchText||selectedCategory));

 bindContentEvents();
 resolveMediaElements(main);
}

/* =========================================================
   PANEL EK OLAYLARI
========================================================= */

function translateInBackground(item,hasDescription){

 if(!item)return;

 fillTranslations(item,hasDescription)
  .then(n=>{if(n>0)saveData()})
  .catch(()=>{});
}

async function runTranslate(btn,job){

 collectAdmin();

 const original=btn.textContent;

 btn.disabled=true;
 btn.textContent="🌐 Çevriliyor...";

 let n=0;

 try{n=await job()}catch(e){n=-1}

 saveData();

 rememberAdminScroll();
 render({preserveAdminScroll:true});

 showToast(
  n<0?"Çeviri yapılamadı. İnternet bağlantısını kontrol et.":
  n>0?"✓ "+n+" alan çevrildi":
  "Çevrilecek boş alan yok"
 );

 btn.textContent=original;
}

function bindAdminExtras(){

 $("themeToggle")?.addEventListener("click",e=>toggleColorMode(e.currentTarget));

 if(CLOUD){
  NDGiris.bagla(document.querySelector(".adminLoginOverlay"));
  bindCloudLogin();
  bindAccountCard();
 }

 bindAdminPdf();

 bindStudio();

 document.querySelectorAll("[data-open-pdf]").forEach(btn=>{
  btn.onclick=()=>{
   collectAdmin();
   menuToolsOpen=false;
   adminTab="pdf";
   adminCategoryView=null;
   adminProductView=null;
   adminEventView=null;
   pushLayer();
   render();
  };
 });

 $("translateProduct")?.addEventListener("click",e=>
  runTranslate(e.currentTarget,()=>fillTranslations(findProduct(adminProductView),true))
 );

 $("translateCategory")?.addEventListener("click",e=>
  runTranslate(e.currentTarget,()=>fillTranslations(findCategory(adminCategoryView),false))
 );

 $("translateEvent")?.addEventListener("click",e=>
  runTranslate(e.currentTarget,()=>fillTranslations(findEvent(adminEventView),true))
 );

 $("translateSubtitle")?.addEventListener("click",e=>
  runTranslate(e.currentTarget,()=>fillSubtitleTranslations())
 );

 $("translateAll")?.addEventListener("click",e=>{

  const btn=e.currentTarget;

  runTranslate(btn,async()=>{

   const jobs=[];

   DATA.categories.forEach(c=>{
    jobs.push([c,false]);
    (c.items||[]).forEach(p=>jobs.push([p,true]));
   });

   DATA.events.forEach(ev=>jobs.push([ev,true]));

   const todo=jobs.filter(([it,d])=>
    (it.name&&(!it.names?.en||!it.names?.ar))||
    (d&&it.description&&(!it.descriptions?.en||!it.descriptions?.ar))
   );

   let total=0,errors=0,done=0;

   for(const [it,d] of todo){

    done++;
    btn.textContent="🌐 Çevriliyor... "+done+"/"+todo.length;

    const n=await fillTranslations(it,d);

    if(n<0)errors++;else total+=n;

    if(errors>=3&&!total)return -1;
   }

   const s=await fillSubtitleTranslations();

   if(s>0)total+=s;

   return total;
  });
 });

 $("fetchRates")?.addEventListener("click",async e=>{

  const btn=e.currentTarget;

  collectAdmin();

  btn.disabled=true;
  btn.textContent="🔄 Kur alınıyor...";

  const ok=await updateRates(true);

  rememberAdminScroll();
  render({preserveAdminScroll:true});

  if(ok)showToast("✓ Kur güncellendi: 1 USD = "+DATA.rates.USD+" TL");
 });

 $("autoRates")?.addEventListener("change",e=>{
  DATA.rates.auto=e.target.checked;
  saveData();
 });

 bindMenuTools();

 /* Etkinlik yönetimi */

 $("addEvent")?.addEventListener("click",()=>{

  collectAdmin();

  const id=newId();

  DATA.events.push({
   id,
   name:"Yeni Etkinlik",
   names:{tr:"Yeni Etkinlik"},
   description:"",
   descriptions:{tr:""},
   date:isoDate(7),
   time:"20:00",
   image:""
  });

  adminEventView=id;

  pushLayer();
  saveData();
  render();
 });

 document.querySelectorAll("[data-admin-event]")
 .forEach(btn=>{

  btn.onclick=()=>{

   collectAdmin();
   rememberAdminScroll();

   adminEventView=btn.dataset.adminEvent;

   pushLayer();
   render();
  };
 });

 $("adminEventBack")?.addEventListener("click",()=>{

  collectAdmin();

  adminEventView=null;

  render({preserveAdminScroll:true});
 });

 $("saveEventNow")?.addEventListener("click",()=>{

  collectAdmin();

  const ev=findEvent(adminEventView);

  if(ev&&!ev.name.trim()){
   alert("Etkinlik adı boş bırakılamaz.");
   return;
  }

  if(!saveData())return;

  adminEventView=null;

  render();
  showToast("✓ Etkinlik kaydedildi");

  translateInBackground(ev,true);
 });

 document.querySelectorAll("[data-delete-event]")
 .forEach(btn=>{

  btn.onclick=()=>{

   if(!confirm("Bu etkinlik silinsin mi?"))return;

   const ev=findEvent(btn.dataset.deleteEvent);

   if(ev)removeMedia(ev.image);

   DATA.events=DATA.events.filter(x=>x.id!==btn.dataset.deleteEvent);

   adminEventView=null;

   saveData();
   render();
   showToast("Etkinlik silindi");
  };
 });
}

/* =========================================================
   PDF MENÜ (kütüphanesiz: canvas ile çizim + kendi PDF yazıcımız)
========================================================= */

const PDF_SIZES={
 A5:{w:148,h:210,pt:[419.53,595.28]},
 A4:{w:210,h:297,pt:[595.28,841.89]},
 A3:{w:297,h:420,pt:[841.89,1190.55]}
};

const PDF_TEMPLATES=[
 {id:"classic",name:"Klasik",desc:"Krem kâğıt, serif yazı, noktalı fiyat çizgisi",swatch:["#fbf6ec","#8a5a2b"]},
 {id:"dark",name:"Premium Koyu",desc:"Koyu zemin, marka renginde vurgular",swatch:["#121214","#d6a83d"]},
 {id:"grid",name:"Fotoğraflı Kartlar",desc:"Büyük fotoğraflı ürün kartları",swatch:["#f6f4f0","#e85d04"]},
 {id:"minimal",name:"Minimal",desc:"Beyaz, sade, çok sütunlu, fotoğrafsız",swatch:["#ffffff","#111111"]}
];

const PDF_TEXT={
 tr:{sold:"Tükendi",cont:"devam",page:"Sayfa"},
 en:{sold:"Sold out",cont:"cont.",page:"Page"},
 ar:{sold:"نفد",cont:"تابع",page:"صفحة"}
};

function pdfDefaults(){
 return {
  template:"classic",size:"A4",lang:"tr",currency:"TRY",
  photos:true,descriptions:true,hideSold:true,header:true,
  note:"Fiyatlarımıza KDV dahildir.",
  excluded:[]
 };
}

function pdfSettings(){
 /* Aynı nesne korunur (ayar ekranı bu nesneye bağlı) */
 if(!DATA.pdf||typeof DATA.pdf!=="object")DATA.pdf={};
 const d=pdfDefaults();
 Object.keys(d).forEach(key=>{if(DATA.pdf[key]===undefined)DATA.pdf[key]=d[key]});
 if(!PDF_SIZES[DATA.pdf.size])DATA.pdf.size="A4";
 if(!PDF_TEMPLATES.some(t=>t.id===DATA.pdf.template))DATA.pdf.template="classic";
 if(!Array.isArray(DATA.pdf.excluded))DATA.pdf.excluded=[];
 return DATA.pdf;
}

function pdfMoney(price,cur){
 const v=Number(price)||0;
 if(cur==="USD")return "$"+(v/(Number(DATA.rates.USD)||40)).toFixed(2);
 if(cur==="EUR")return "€"+(v/(Number(DATA.rates.EUR)||47)).toFixed(2);
 return (Math.round(v*100)/100).toLocaleString("tr-TR")+" ₺";
}

function pdfLoadImage(ref){
 return new Promise(async resolve=>{
  if(!ref){resolve(null);return}
  let url="";
  try{url=await loadMediaReference(ref)}catch(e){}
  if(!url){resolve(null);return}
  const img=new Image();
  if(/^https?:/i.test(url))img.crossOrigin="anonymous";
  const timer=setTimeout(()=>resolve(null),12000);
  img.onload=()=>{clearTimeout(timer);resolve(img.naturalWidth?img:null)};
  img.onerror=()=>{clearTimeout(timer);resolve(null)};
  img.src=url;
 });
}

/* ---------- çizim yardımcıları (birim: mm) ---------- */

function pdfFont(ctx,size,weight,family,style){
 ctx.font=(style||"")+" "+(weight||400)+" "+size+"px "+family;
}

function pdfWrap(ctx,text,maxW,maxLines){
 const words=String(text||"").split(/\s+/).filter(Boolean);
 const lines=[];
 let line="";
 for(const w of words){
  const test=line?line+" "+w:w;
  if(ctx.measureText(test).width<=maxW||!line){line=test}
  else{lines.push(line);line=w}
 }
 if(line)lines.push(line);
 if(maxLines&&lines.length>maxLines){
  const cut=lines.slice(0,maxLines);
  let last=cut[maxLines-1];
  while(last.length>1&&ctx.measureText(last+"…").width>maxW)last=last.slice(0,-1);
  cut[maxLines-1]=last.trim()+"…";
  return cut;
 }
 return lines;
}

function pdfRoundRect(ctx,x,y,w,h,r){
 r=Math.min(r,w/2,h/2);
 ctx.beginPath();
 ctx.moveTo(x+r,y);
 ctx.arcTo(x+w,y,x+w,y+h,r);
 ctx.arcTo(x+w,y+h,x,y+h,r);
 ctx.arcTo(x,y+h,x,y,r);
 ctx.arcTo(x,y,x+w,y,r);
 ctx.closePath();
}

let pdfFreeLogo=null;

function pdfCover(ctx,img,x,y,w,h,radius,circle){
 if(img&&img===pdfFreeLogo){
  const s=Math.min(w/img.naturalWidth,h/img.naturalHeight);
  const dw=img.naturalWidth*s,dh=img.naturalHeight*s;
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  return;
 }
 ctx.save();
 if(circle){ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.clip()}
 else if(radius){pdfRoundRect(ctx,x,y,w,h,radius);ctx.clip()}
 if(img){
  const s=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const sw=w/s,sh=h/s;
  ctx.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,x,y,w,h);
 }else{
  ctx.fillStyle="rgba(127,127,127,.18)";
  ctx.fillRect(x,y,w,h);
 }
 ctx.restore();
}

/* Yazı: x mantıksal başlangıçtan; rtl ise ayna */
function pdfText(L,text,x,y,align){
 const ctx=L.ctx;
 let X=x,A=align||"left";
 if(L.rtl){
  X=L.W-x;
  A=A==="left"?"right":A==="right"?"left":"center";
 }
 ctx.textAlign=A;
 ctx.direction=L.rtl?"rtl":"ltr";
 ctx.fillText(text,X,y);
}

/* Kutu: rtl ise yatayda ayna */
function pdfBoxX(L,x,w){return L.rtl?L.W-x-w:x}

/* ---------- şablonlar ---------- */

function pdfTheme(id){

 const accent=DATA.theme?.accent||"#d6a83d";

 const serif='Georgia,"Times New Roman",serif';
 const sans='-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';

 return {
  classic:{bg:"#fbf6ec",ink:"#2a1f16",muted:"#7a6a5a",accent:"#8a5a2b",line:"rgba(138,90,43,.35)",title:serif,body:serif,cols:{A5:1,A4:1,A3:2},photos:"circle"},
  dark:{bg:"#121214",ink:"#f3f3f3",muted:"#9a9a9a",accent,line:"rgba(255,255,255,.12)",title:sans,body:sans,cols:{A5:1,A4:2,A3:2},photos:"square"},
  grid:{bg:"#f6f4f0",ink:"#1d1d1f",muted:"#6e6e73",accent,line:"rgba(0,0,0,.08)",title:sans,body:sans,cols:{A5:1,A4:1,A3:1},grid:{A5:2,A4:3,A3:4},photos:"card"},
  minimal:{bg:"#ffffff",ink:"#111111",muted:"#777777",accent:"#111111",line:"rgba(0,0,0,.18)",title:'Helvetica,Arial,sans-serif',body:'Helvetica,Arial,sans-serif',cols:{A5:1,A4:2,A3:3},photos:"none"}
 }[id];
}

/* Bir bloğun yüksekliğini ölçer veya çizer (draw=false → sadece ölçüm) */
function pdfBlock(L,b,x,y,w,draw){

 const {ctx,T,k,S}=L;

 if(b.type==="cat"){

  const fs=(L.tpl==="minimal"?3.3:L.tpl==="grid"?5:4.6)*k;
  const h=fs*2.6;

  if(draw){
   pdfFont(ctx,fs,700,T.title);
   ctx.fillStyle=L.tpl==="minimal"?T.ink:T.accent;
   const label=(L.tpl==="minimal"||L.tpl==="dark")?b.text.toLocaleUpperCase(L.lang==="tr"?"tr-TR":undefined):b.text;
   const ty=y+fs*1.55;

   if(L.tpl==="classic"){
    pdfText(L,label,x+w/2,ty,"center");
    const tw=ctx.measureText(label).width;
    ctx.strokeStyle=T.line;ctx.lineWidth=.25;
    const cx=L.rtl?L.W-(x+w/2):x+w/2;
    ctx.beginPath();
    ctx.moveTo(cx-tw/2-4*k,ty-fs*.33);ctx.lineTo(Math.max(cx-tw/2-4*k-22*k,(L.rtl?L.W-x-w:x)),ty-fs*.33);
    ctx.moveTo(cx+tw/2+4*k,ty-fs*.33);ctx.lineTo(Math.min(cx+tw/2+4*k+22*k,(L.rtl?L.W-x:x+w)),ty-fs*.33);
    ctx.stroke();
   }else if(L.tpl==="grid"){
    pdfText(L,label,x,ty,"left");
    ctx.fillStyle=T.accent;
    ctx.fillRect(pdfBoxX(L,x,12*k),ty+1.6*k,12*k,.9*k);
   }else{
    pdfText(L,label,x,ty,"left");
    ctx.strokeStyle=L.tpl==="minimal"?T.ink:T.line;
    ctx.lineWidth=L.tpl==="minimal"?.35:.3;
    ctx.beginPath();
    const ly=L.tpl==="minimal"?y+.6*k:ty+1.8*k;
    const bx=pdfBoxX(L,x,w);
    ctx.moveTo(bx,ly);ctx.lineTo(bx+w,ly);ctx.stroke();
   }
  }
  return h;
 }

 if(b.type==="item"){

  const p=b.item;
  const photo=S.photos&&T.photos!=="none"&&L.images.get(p.image);
  const thumb=T.photos==="circle"?12*k:16*k;
  const gap=photo?thumb+3.5*k:0;
  const nameFs=(L.tpl==="minimal"?3.2:3.6)*k;
  const descFs=(L.tpl==="minimal"?2.5:2.7)*k;
  const lh=descFs*1.38;

  pdfFont(ctx,nameFs,L.tpl==="classic"?700:700,T.body);
  const priceText=b.price;
  const priceW=ctx.measureText(priceText).width;

  const textW=w-gap;
  const nameLines=pdfWrap(ctx,b.name,textW-priceW-6*k,2);

  pdfFont(ctx,descFs,400,T.body,L.tpl==="classic"?"italic":"");
  const descLines=S.descriptions&&b.desc?pdfWrap(ctx,b.desc,textW-(L.tpl==="classic"?0:priceW*.0),3):[];

  const textH=nameLines.length*nameFs*1.3+(descLines.length?descLines.length*lh+1*k:0);
  const h=Math.max(textH,photo?thumb:0)+(L.tpl==="minimal"?3*k:4.2*k);

  if(draw){

   if(photo){
    pdfCover(ctx,photo,pdfBoxX(L,x,thumb),y,thumb,thumb,T.photos==="square"?2*k:0,T.photos==="circle");
   }

   const tx=x+gap;
   let cy=y+nameFs*1.0;

   pdfFont(ctx,nameFs,700,T.body);
   ctx.fillStyle=T.ink;
   nameLines.forEach((ln,i)=>pdfText(L,ln,tx,cy+i*nameFs*1.3,"left"));

   const lastNameY=cy+(nameLines.length-1)*nameFs*1.3;

   ctx.fillStyle=b.sold?T.muted:(L.tpl==="minimal"?T.ink:T.accent);
   pdfFont(ctx,nameFs,700,T.body);
   pdfText(L,priceText,x+w,cy,"right");

   if(L.tpl==="classic"){
    pdfFont(ctx,nameFs,700,T.body);
    const nw=ctx.measureText(nameLines[0]).width;
    const startX=tx+nw+2*k, endX=x+w-priceW-2*k;
    if(endX>startX&&nameLines.length===1){
     ctx.fillStyle=T.line;
     for(let dx=startX;dx<endX;dx+=1.4*k){
      const X=L.rtl?L.W-dx:dx;
      ctx.beginPath();ctx.arc(X,lastNameY-.4*k,.18*k,0,Math.PI*2);ctx.fill();
     }
    }
   }

   if(descLines.length){
    pdfFont(ctx,descFs,400,T.body,L.tpl==="classic"?"italic":"");
    ctx.fillStyle=T.muted;
    let dy=lastNameY+nameFs*.35+lh;
    descLines.forEach(ln=>{pdfText(L,ln,tx,dy,"left");dy+=lh});
   }
  }
  return h;
 }

 if(b.type==="row"){

  const n=b.cols;
  const g=4*k;
  const cw=(w-g*(n-1))/n;
  const showPhoto=S.photos;
  const ph=showPhoto?cw*.66:0;
  const nameFs=3.4*k,descFs=2.5*k,lh=descFs*1.35;

  const cards=b.items.map(it=>{
   pdfFont(ctx,nameFs,700,T.body);
   const nl=pdfWrap(ctx,it.name,cw-6*k,2);
   pdfFont(ctx,descFs,400,T.body);
   const dl=S.descriptions&&it.desc?pdfWrap(ctx,it.desc,cw-6*k,2):[];
   return {it,nl,dl};
  });

  const textH=Math.max(...cards.map(c=>c.nl.length*nameFs*1.25+(c.dl.length?c.dl.length*lh+1.2*k:0)));
  const cardH=ph+3.2*k+textH+3*k+nameFs*1.9+3*k;
  const h=cardH+g;

  if(draw){
   cards.forEach((c,i)=>{
    const cx=pdfBoxX(L,x+i*(cw+g),cw);
    ctx.save();
    ctx.shadowColor="rgba(0,0,0,.08)";ctx.shadowBlur=2.5*k;ctx.shadowOffsetY=.6*k;
    ctx.fillStyle="#ffffff";
    pdfRoundRect(ctx,cx,y,cw,cardH,3*k);ctx.fill();
    ctx.restore();

    if(showPhoto){
     ctx.save();
     pdfRoundRect(ctx,cx,y,cw,cardH,3*k);ctx.clip();
     pdfCover(ctx,L.images.get(c.it.item.image),cx,y,cw,ph,0,false);
     ctx.restore();
    }

    const lx=x+i*(cw+g)+3*k;
    let ty=y+ph+3.2*k+nameFs;
    pdfFont(ctx,nameFs,700,T.body);
    ctx.fillStyle=T.ink;
    c.nl.forEach((ln,j)=>pdfText(L,ln,lx,ty+j*nameFs*1.25,"left"));
    ty+=(c.nl.length-1)*nameFs*1.25;

    if(c.dl.length){
     pdfFont(ctx,descFs,400,T.body);
     ctx.fillStyle=T.muted;
     let dy=ty+1.2*k+lh;
     c.dl.forEach(ln=>{pdfText(L,ln,lx,dy,"left");dy+=lh});
    }

    pdfFont(ctx,nameFs*.95,800,T.body);
    const pw=ctx.measureText(c.it.price).width+5*k;
    const py=y+cardH-3*k-nameFs*1.9;
    ctx.fillStyle=c.it.sold?"#bbbbbb":T.accent;
    pdfRoundRect(ctx,pdfBoxX(L,lx,pw),py,pw,nameFs*1.9,nameFs*.95);ctx.fill();
    ctx.fillStyle="#ffffff";
    pdfText(L,c.it.price,lx+pw/2,py+nameFs*1.3,"center");
   });
  }
  return h;
 }

 return 0;
}

function pdfHeaderHeight(L,draw){

 const {ctx,T,k,S}=L;

 if(!S.header)return 0;

 const logo=L.images.get(DATA.logo);
 pdfFreeLogo=logoIsFree()?logo:null;
 const name=DATA.name||"";
 const sub=L.subtitle;
 const x=L.m,w=L.W-L.m*2;
 let y=L.m;

 if(L.tpl==="dark"){
  const ls=logo?20*k:0;
  if(draw&&logo)pdfCover(ctx,logo,pdfBoxX(L,x,ls),y,ls,ls,4*k,false);
  const tx=x+(logo?ls+5*k:0);
  pdfFont(ctx,9*k,800,T.title);
  if(draw){ctx.fillStyle=T.ink;pdfText(L,name,tx,y+8.5*k,"left")}
  pdfFont(ctx,3.3*k,400,T.body);
  if(draw){
   ctx.fillStyle=T.muted;
   if(sub)pdfText(L,sub,tx,y+14*k,"left");
   if(DATA.hours&&DATA.settings.hours)pdfText(L,DATA.hours,tx,y+19*k,"left");
   ctx.fillStyle=T.accent;
   ctx.fillRect(x,y+Math.max(ls,20*k)+5*k,w,.5*k);
  }
  return Math.max(ls,20*k)+11*k;
 }

 if(L.tpl==="minimal"){
  pdfFont(ctx,7*k,800,T.title);
  if(draw){ctx.fillStyle=T.ink;pdfText(L,name.toLocaleUpperCase("tr-TR"),L.W/2,y+7*k,"center")}
  pdfFont(ctx,3*k,400,T.body);
  if(draw&&sub){ctx.fillStyle=T.muted;pdfText(L,sub,L.W/2,y+12.5*k,"center")}
  return 20*k;
 }

 /* classic + grid: ortalı */
 let hy=y;
 const ls=logo?(L.tpl==="classic"?22:20)*k:0;
 if(logo){
  if(draw)pdfCover(ctx,logo,L.W/2-ls/2,hy,ls,ls,L.tpl==="grid"?5*k:0,L.tpl==="classic");
  hy+=ls+4*k;
 }
 const nfs=(L.tpl==="classic"?9:8.5)*k;
 pdfFont(ctx,nfs,700,T.title);
 if(draw){ctx.fillStyle=T.ink;pdfText(L,L.tpl==="classic"?name.toLocaleUpperCase("tr-TR"):name,L.W/2,hy+nfs,"center")}
 hy+=nfs*1.5;
 if(sub){
  pdfFont(ctx,3.4*k,400,T.body,L.tpl==="classic"?"italic":"");
  if(draw){ctx.fillStyle=T.muted;pdfText(L,sub,L.W/2,hy+3*k,"center")}
  hy+=5.5*k;
 }
 if(L.tpl==="classic"&&draw){
  ctx.strokeStyle=T.line;ctx.lineWidth=.3;
  ctx.beginPath();ctx.moveTo(L.W/2-30*k,hy+2*k);ctx.lineTo(L.W/2+30*k,hy+2*k);ctx.stroke();
  ctx.fillStyle=T.accent;ctx.beginPath();ctx.arc(L.W/2,hy+2*k,.9*k,0,Math.PI*2);ctx.fill();
 }
 return hy-y+7*k;
}

function pdfFooter(L,pageNo,total){
 const {ctx,T,k,S}=L;
 const fy=L.H-L.m*.55;
 pdfFont(ctx,2.4*k,400,T.body);
 ctx.fillStyle=T.muted;
 if(S.note)pdfText(L,S.note,L.W/2,fy,"center");
 if(total>1)pdfText(L,pageNo+" / "+total,L.W-L.m,fy,"right");
}

/* Sayfa planı: hangi blok hangi sayfada/sütunda/konumda */
function pdfPlan(L){

 const {k,S,T}=L;
 const lang=S.lang;
 const nm=it=>it?.names?.[lang]||it?.name||"";
 const ds=it=>it?.descriptions?.[lang]||it?.description||"";

 const cats=DATA.categories
  .filter(c=>!S.excluded.includes(c.id))
  .map(c=>({
   c,
   items:(c.items||[])
    .filter(p=>!(S.hideSold&&p.sold))
    .map(p=>({
     item:p,name:nm(p),desc:ds(p),sold:!!p.sold,
     price:p.sold?PDF_TEXT[lang].sold:pdfMoney(p.price,S.currency)
    }))
  }))
  .filter(x=>x.items.length);

 const ncols=T.cols[S.size];
 const colGap=8*k;
 const contentW=L.W-L.m*2;
 const colW=(contentW-colGap*(ncols-1))/ncols;
 const footerSpace=L.m*.9+3*k;

 const pages=[];
 let page,col,y,top,bottom;

 const newPage=()=>{
  page={blocks:[]};
  pages.push(page);
  const hh=pages.length===1?pdfHeaderHeight(L,false):0;
  top=L.m+hh;
  bottom=L.H-footerSpace;
  col=0;y=top;
 };

 const nextCol=()=>{
  col++;
  if(col>=ncols)newPage();
  else y=top;
 };

 const colX=()=>L.m+col*(colW+colGap);
 const place=(b,h)=>{page.blocks.push({b,x:colX(),y,w:colW});y+=h};

 newPage();

 cats.forEach(({c,items})=>{

  const catName=nm(c);
  let units;

  if(T.grid){
   const n=T.grid[S.size];
   units=[];
   for(let i=0;i<items.length;i+=n)units.push({type:"row",cols:n,items:items.slice(i,i+n)});
  }else{
   units=items.map(it=>Object.assign({type:"item"},it));
  }

  let catBlock={type:"cat",text:catName};
  let catH=pdfBlock(L,catBlock,0,0,colW,false);
  let first=true;

  units.forEach(u=>{

   const uh=pdfBlock(L,u,0,0,colW,false);
   const need=(first?catH:0)+uh;

   if(y+need>bottom&&y>top){
    nextCol();
    if(!first){
     catBlock={type:"cat",text:catName+" ("+PDF_TEXT[lang].cont+")"};
     catH=pdfBlock(L,catBlock,0,0,colW,false);
     place(catBlock,catH);
    }
   }

   if(first){
    place(catBlock,catH);
    first=false;
   }

   place(u,uh);
  });

  y+=3*k;
 });

 return pages;
}

async function pdfPrepare(){

 const S=pdfSettings();
 const T=pdfTheme(S.template);
 const size=PDF_SIZES[S.size];
 const k={A5:.82,A4:1,A3:1.32}[S.size];

 const refs=new Set();
 if(S.header&&DATA.logo)refs.add(DATA.logo);
 if(S.photos&&T.photos!=="none"){
  DATA.categories.forEach(c=>{
   if(S.excluded.includes(c.id))return;
   (c.items||[]).forEach(p=>{if(p.image&&!(S.hideSold&&p.sold))refs.add(p.image)});
  });
 }

 const images=new Map();
 await Promise.all([...refs].map(async r=>images.set(r,await pdfLoadImage(r))));

 const lang=S.lang;
 let subtitle=DATA.subtitle||"";
 if(lang!=="tr"&&DATA.subtitles?.tr===DATA.subtitle&&DATA.subtitles?.[lang])subtitle=DATA.subtitles[lang];

 const measure=document.createElement("canvas").getContext("2d");

 const L={
  ctx:measure,T,k,S,tpl:S.template,lang,rtl:lang==="ar",
  W:size.w,H:size.h,m:{A5:10,A4:14,A3:18}[S.size],
  images,subtitle
 };

 L.pages=pdfPlan(L);

 return L;
}

function pdfRenderPage(L,index,pxPerMm){

 const canvas=document.createElement("canvas");
 canvas.width=Math.round(L.W*pxPerMm);
 canvas.height=Math.round(L.H*pxPerMm);

 const ctx=canvas.getContext("2d");
 ctx.scale(pxPerMm,pxPerMm);
 ctx.textBaseline="alphabetic";

 const R=Object.assign({},L,{ctx});

 ctx.fillStyle=L.T.bg;
 ctx.fillRect(0,0,L.W,L.H);

 if(index===0)pdfHeaderHeight(R,true);

 L.pages[index].blocks.forEach(({b,x,y,w})=>pdfBlock(R,b,x,y,w,true));

 pdfFooter(R,index+1,L.pages.length);

 return canvas;
}

function pdfCanvasJpeg(canvas){
 return new Promise((resolve,reject)=>{
  canvas.toBlob(async blob=>{
   if(!blob){reject(new Error("JPEG oluşturulamadı"));return}
   resolve({bytes:new Uint8Array(await blob.arrayBuffer()),w:canvas.width,h:canvas.height});
  },"image/jpeg",.9);
 });
}

/* Basit PDF yazıcı: her sayfa tek bir JPEG görsel */
function pdfBuildFile(jpegs,ptW,ptH){

 const enc=new TextEncoder();
 const parts=[];
 const offsets=[];
 let length=0;

 const push=data=>{
  const bytes=typeof data==="string"?enc.encode(data):data;
  parts.push(bytes);
  length+=bytes.length;
 };

 const obj=(n,body)=>{
  offsets[n]=length;
  push(n+" 0 obj\n");
  body();
  push("\nendobj\n");
 };

 push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

 const n=jpegs.length;
 const pageIds=jpegs.map((_,i)=>3+i*3);

 obj(1,()=>push("<< /Type /Catalog /Pages 2 0 R >>"));
 obj(2,()=>push("<< /Type /Pages /Kids ["+pageIds.map(id=>id+" 0 R").join(" ")+"] /Count "+n+" >>"));

 jpegs.forEach((j,i)=>{
  const pid=3+i*3,cid=pid+1,iid=pid+2;
  const content="q "+ptW.toFixed(2)+" 0 0 "+ptH.toFixed(2)+" 0 0 cm /Im0 Do Q";
  obj(pid,()=>push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+ptW.toFixed(2)+" "+ptH.toFixed(2)+"] /Resources << /XObject << /Im0 "+iid+" 0 R >> >> /Contents "+cid+" 0 R >>"));
  obj(cid,()=>{push("<< /Length "+content.length+" >>\nstream\n");push(content);push("\nendstream")});
  obj(iid,()=>{
   push("<< /Type /XObject /Subtype /Image /Width "+j.w+" /Height "+j.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+j.bytes.length+" >>\nstream\n");
   push(j.bytes);
   push("\nendstream");
  });
 });

 const total=3+n*3;
 const xref=length;
 let x="xref\n0 "+total+"\n0000000000 65535 f \n";
 for(let i=1;i<total;i++)x+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
 push(x);
 push("trailer\n<< /Size "+total+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF");

 return new Blob(parts,{type:"application/pdf"});
}

async function pdfGenerate(onProgress){

 const L=await pdfPrepare();
 const dpi=200/25.4;
 const jpegs=[];

 for(let i=0;i<L.pages.length;i++){
  onProgress&&onProgress(i+1,L.pages.length);
  const canvas=pdfRenderPage(L,i,dpi);
  jpegs.push(await pdfCanvasJpeg(canvas));
  canvas.width=canvas.height=0;
  await new Promise(r=>setTimeout(r,0));
 }

 const [ptW,ptH]=PDF_SIZES[L.S.size].pt;

 return {blob:pdfBuildFile(jpegs,ptW,ptH),pages:L.pages.length};
}

function pdfFileName(){
 const S=pdfSettings();
 const base=(DATA.name||"menu").toLocaleLowerCase("tr-TR")
  .replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"menu";
 return base+"-menu-"+S.size+"-"+S.lang+".pdf";
}

let pdfPreviewTimer=null;
let pdfPreviewToken=0;

function schedulePdfPreview(){
 clearTimeout(pdfPreviewTimer);
 pdfPreviewTimer=setTimeout(renderPdfPreview,150);
}

async function renderPdfPreview(){

 const box=$("pdfPreview");
 if(!box)return;

 const token=++pdfPreviewToken;
 const info=$("pdfPreviewInfo");
 if(info)info.textContent="Önizleme hazırlanıyor...";

 const L=await pdfPrepare();
 if(token!==pdfPreviewToken||!$("pdfPreview"))return;

 const width=Math.min(box.clientWidth||330,520);
 const pxPerMm=Math.min(3,(width/L.W)*(window.devicePixelRatio||1));

 box.innerHTML="";
 L.pages.forEach((_,i)=>{
  const c=pdfRenderPage(L,i,pxPerMm);
  c.className="pdfPreviewPage";
  box.appendChild(c);
 });

 if(info)info.textContent=L.pages.length+" sayfa • "+L.S.size+" ("+L.W+"×"+L.H+" mm)";
}

function renderAdminPdf(){

 const S=pdfSettings();
 const seg=(name,opts,val)=>`
  <div class="segmented">
   ${opts.map(o=>`<button type="button" class="${o[0]===val?"active":""}" data-pdf-set="${name}" data-value="${o[0]}">${o[1]}</button>`).join("")}
  </div>`;

 const tog=(key,label,hint)=>`
  <label class="toggle">
   <span>${label}${hint?`<small style="display:block;color:#666;font-size:9px;margin-top:2px">${hint}</small>`:""}</span>
   <input type="checkbox" data-pdf-toggle="${key}" ${S[key]?"checked":""}>
  </label>`;

 return `

 <div class="adminBreadcrumb">
  <button id="pdfBack">‹ Geri</button>
  <span>›</span>
  <strong>PDF Menü</strong>
 </div>

 <div class="adminSectionHeader">
  <h2>PDF Menü</h2>
  <p>Basılı menü veya WhatsApp'tan gönderilecek PDF hazırla. Ayarlar kaydedilir, menü değiştikçe PDF de güncel çıkar.</p>
 </div>

 <div class="adminCard">
  <div class="adminCardTitle">Şablon</div>
  <div class="pdfTemplates">
   ${PDF_TEMPLATES.map(t=>`
    <button type="button" class="pdfTpl ${S.template===t.id?"active":""}" data-pdf-set="template" data-value="${t.id}">
     <span class="pdfTplSwatch" style="background:${t.swatch[0]};border-color:${t.swatch[1]}">
      <i style="background:${t.swatch[1]}"></i><i style="background:${t.swatch[1]};opacity:.5"></i><i style="background:${t.swatch[1]};opacity:.3"></i>
     </span>
     <strong>${t.name}</strong>
     <small>${t.desc}</small>
    </button>`).join("")}
  </div>
 </div>

 <div class="adminCard">
  <div class="adminCardTitle">Kâğıt ve Dil</div>
  <div class="field"><label>Kâğıt boyutu</label>${seg("size",[["A5","A5"],["A4","A4"],["A3","A3"]],S.size)}</div>
  <div class="field"><label>Dil</label>${seg("lang",[["tr","Türkçe"],["en","English"],["ar","العربية"]],S.lang)}</div>
  <div class="field"><label>Para birimi</label>${seg("currency",[["TRY","₺ TL"],["USD","$ USD"],["EUR","€ EUR"]],S.currency)}</div>
 </div>

 <div class="adminCard">
  <div class="adminCardTitle">İçerik</div>
  ${tog("header","Logo ve işletme adı")}
  ${tog("photos","Ürün fotoğrafları",S.template==="minimal"?"Minimal şablonda fotoğraf kullanılmaz":"")}
  ${tog("descriptions","Ürün açıklamaları")}
  ${tog("hideSold","Tükenen ürünleri gizle")}
  <div class="field">
   <label>Alt not (her sayfanın altında)</label>
   <input type="text" id="pdfNote" value="${esc(S.note)}" placeholder="örn. Fiyatlarımıza KDV dahildir.">
  </div>
 </div>

 <div class="adminCard">
  <div class="adminCardTitle">Kategoriler</div>
  <div class="adminCardDescription">PDF'te yer alacak kategorileri seç.</div>
  <div class="pdfCats">
   ${DATA.categories.map(c=>`
    <label class="pdfCat">
     <input type="checkbox" data-pdf-cat="${esc(c.id)}" ${S.excluded.includes(c.id)?"":"checked"}>
     <span>${esc(c.name)}</span>
    </label>`).join("")}
  </div>
 </div>

 <div class="adminCard">
  <button class="adminButton gold full" id="pdfDownload">📄 PDF'i İndir</button>
  ${navigator.canShare?`<button class="adminButton full" id="pdfShare" style="margin-top:8px">📤 PDF'i Paylaş (WhatsApp vb.)</button>`:""}
 </div>

 <div class="adminCard">
  <div class="adminCardTitle">Önizleme</div>
  <div class="adminCardDescription" id="pdfPreviewInfo">Önizleme hazırlanıyor...</div>
  <div class="pdfPreview" id="pdfPreview"></div>
 </div>
 `;
}

async function pdfMakeFile(btn){

 const original=btn.textContent;
 btn.disabled=true;

 try{
  const {blob,pages}=await pdfGenerate((i,n)=>{btn.textContent="📄 Hazırlanıyor... "+i+"/"+n});
  return {blob,pages};
 }catch(e){
  console.error(e);
  alert("PDF oluşturulamadı: "+(e.message||e));
  return null;
 }finally{
  btn.disabled=false;
  btn.textContent=original;
 }
}

function bindAdminPdf(){

 if(!$("pdfPreview"))return;

 schedulePdfPreview();

 const S=pdfSettings();

 const changed=rerender=>{
  saveData();
  if(rerender){
   rememberAdminScroll();
   render({preserveAdminScroll:true});
  }else{
   schedulePdfPreview();
  }
 };

 document.querySelectorAll("[data-pdf-set]").forEach(btn=>{
  btn.onclick=()=>{
   S[btn.dataset.pdfSet]=btn.dataset.value;
   changed(true);
  };
 });

 document.querySelectorAll("[data-pdf-toggle]").forEach(inp=>{
  inp.onchange=()=>{S[inp.dataset.pdfToggle]=inp.checked;changed(false)};
 });

 document.querySelectorAll("[data-pdf-cat]").forEach(inp=>{
  inp.onchange=()=>{
   const id=inp.dataset.pdfCat;
   S.excluded=S.excluded.filter(x=>x!==id);
   if(!inp.checked)S.excluded.push(id);
   changed(false);
  };
 });

 const note=$("pdfNote");
 if(note)note.oninput=()=>{S.note=note.value;changed(false)};

 $("pdfBack")?.addEventListener("click",()=>{
  adminTab="general";
  render();
 });

 $("pdfDownload")?.addEventListener("click",async e=>{
  const r=await pdfMakeFile(e.currentTarget);
  if(!r)return;
  const url=URL.createObjectURL(r.blob);
  const a=document.createElement("a");
  a.href=url;a.download=pdfFileName();
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  showToast("✓ PDF hazır ("+r.pages+" sayfa)");
 });

 $("pdfShare")?.addEventListener("click",async e=>{
  const r=await pdfMakeFile(e.currentTarget);
  if(!r)return;
  const file=new File([r.blob],pdfFileName(),{type:"application/pdf"});
  try{
   if(navigator.canShare({files:[file]}))
    await navigator.share({files:[file],title:DATA.name||"Menü"});
   else alert("Bu cihaz dosya paylaşmayı desteklemiyor. 'PDF'i İndir' butonunu kullan.");
  }catch(err){
   if(err&&err.name!=="AbortError")alert("Paylaşılamadı.");
  }
 });
}

/* =========================================================
   MENÜ ARAÇLARI: ARAMA, HIZLI FİYAT, TOPLU FİYAT, SÜRÜKLE
========================================================= */

function roundPrice(v,step){

 if(!step)return Math.round(v*100)/100;

 return Math.max(0,Math.round(v/step)*step);
}

function bulkTargets(){

 const target=$("bulkTarget")?.value||"all";

 if(target==="all")
  return DATA.categories.flatMap(c=>c.items||[]);

 if(target==="search"){
  const q=adminSearch.trim().toLocaleLowerCase("tr-TR");
  return DATA.categories.flatMap(c=>c.items||[])
   .filter(p=>(p.name+" "+(p.description||"")).toLocaleLowerCase("tr-TR").includes(q));
 }

 return findCategory(target)?.items||[];
}

function bulkNewPrice(price){

 const type=$("bulkType")?.value;
 const value=Number($("bulkValue")?.value);
 const step=Number($("bulkRound")?.value);
 const base=Number(price)||0;

 const raw=type==="amount"?base+value:base*(1+value/100);

 return roundPrice(Math.max(0,raw),step);
}

function updateBulkPreview(){

 const box=$("bulkPreview");

 if(!box)return;

 const value=Number($("bulkValue")?.value);
 const items=bulkTargets();

 if(!value||!items.length){
  box.innerHTML=items.length
   ?"Miktar gir, önizleme burada görünür."
   :"Seçilen grupta ürün yok.";
  return;
 }

 const sample=items.slice(0,3).map(p=>
  `${esc(p.name)}: ${money(p.price)} → <b>${Math.round(bulkNewPrice(p.price)*100)/100} ₺</b>`
 ).join("<br>");

 box.innerHTML=`<b>${items.length} ürün</b> güncellenecek.<br>${sample}${items.length>3?"<br>…":""}`;
}

function refreshAdminMenuBody(){

 const body=$("adminMenuBody");

 if(!body)return;

 body.innerHTML=adminSearch.trim()?adminSearchResults():renderAdminCategoryList();

 bindMenuTools(true);
 resolveMediaElements(body);
}

function bindMenuTools(bodyOnly){

 /* Satır olayları (her yenilemede) */

 document.querySelectorAll("#adminMenuBody [data-admin-product]")
 .forEach(btn=>{
  btn.onclick=()=>{
   collectAdmin();
   const cat=DATA.categories.find(c=>(c.items||[]).some(p=>p.id===btn.dataset.adminProduct));
   adminCategoryView=cat?cat.id:null;
   adminProductView=btn.dataset.adminProduct;
   advancedProduct=false;
   pushLayer();
   render();
  };
 });

 document.querySelectorAll("#adminMenuBody [data-admin-category]")
 .forEach(btn=>{
  btn.onclick=()=>{
   collectAdmin();
   adminCategoryView=btn.dataset.adminCategory;
   adminProductView=null;
   pushLayer();
   render();
  };
 });

 document.querySelectorAll("[data-quick-price]")
 .forEach(inp=>{

  const commit=()=>{

   const p=findProduct(inp.dataset.quickPrice);

   if(!p)return;

   const value=Math.max(0,Number(inp.value)||0);

   if(value===Number(p.price))return;

   p.price=value;
   inp.value=value;

   saveData();

   const box=inp.closest(".quickPrice");
   box?.classList.add("saved");
   setTimeout(()=>box?.classList.remove("saved"),900);

   showToast("✓ "+p.name+": "+money(value));
  };

  inp.onchange=commit;
  inp.onkeydown=e=>{if(e.key==="Enter")inp.blur()};
 });

 document.querySelectorAll("[data-sortable]")
 .forEach(enableDragSort);

 bindMenuAccordion();

 if(bodyOnly){
  /* Liste yenilenince kategori/çeviri butonları da yeniden bağlanır */
  bindAdminButtonsInBody();
  return;
 }

 /* Arama */

 const search=$("adminSearchInput");

 if(search){

  search.oninput=()=>{

   adminSearch=search.value;

   const clear=$("adminSearchClear");

   if(adminSearch&&!clear){
    const b=document.createElement("button");
    b.id="adminSearchClear";
    b.setAttribute("aria-label","Temizle");
    b.textContent="×";
    search.parentElement.appendChild(b);
    b.onclick=clearAdminSearch;
   }

   if(!adminSearch&&clear)clear.remove();

   refreshAdminMenuBody();

   /* Toplu fiyattaki "Arama sonuçları" seçeneği güncellensin */
   const target=$("bulkTarget");
   if(target){
    let opt=target.querySelector('option[value="search"]');
    if(adminSearch.trim()){
     if(!opt){
      opt=document.createElement("option");
      opt.value="search";
      target.insertBefore(opt,target.options[1]||null);
     }
     opt.textContent='Arama sonuçları ("'+adminSearch.trim()+'")';
    }else if(opt){
     if(target.value==="search")target.value="all";
     opt.remove();
    }
    updateBulkPreview();
   }
  };
 }

 $("adminSearchClear")?.addEventListener("click",clearAdminSearch);

 /* Toplu fiyat */

 $("toggleBulk")?.addEventListener("click",()=>{
  collectAdmin();
  bulkOpen=!bulkOpen;
  rememberAdminScroll();
  render({preserveAdminScroll:true});
 });

 ["bulkTarget","bulkType","bulkValue","bulkRound"].forEach(id=>{
  const el=$(id);
  if(el){
   el.addEventListener("input",updateBulkPreview);
   el.addEventListener("change",updateBulkPreview);
  }
 });

 $("bulkApply")?.addEventListener("click",()=>{

  const value=Number($("bulkValue")?.value);
  const items=bulkTargets();

  if(!value){
   alert("Önce bir miktar gir (örn. 10).");
   return;
  }

  if(!items.length){
   alert("Seçilen grupta ürün yok.");
   return;
  }

  const type=$("bulkType").value;
  const label=type==="amount"
   ?(value>0?"+":"")+value+" ₺"
   :(value>0?"+":"")+value+" %";

  if(!confirm(items.length+" ürünün fiyatı "+label+" değişecek. Onaylıyor musun?"))
   return;

  const prices={};

  items.forEach(p=>{
   prices[p.id]=p.price;
   p.price=bulkNewPrice(p.price);
  });

  DATA.lastBulk={time:Date.now(),prices};

  saveData();

  rememberAdminScroll();
  render({preserveAdminScroll:true});

  showToast("✓ "+items.length+" ürünün fiyatı güncellendi");
 });

 $("bulkUndo")?.addEventListener("click",()=>{

  const prices=DATA.lastBulk?.prices||{};
  const ids=Object.keys(prices);

  if(!ids.length)return;

  if(!confirm(ids.length+" ürünün fiyatı eski hâline dönsün mü?"))return;

  ids.forEach(id=>{
   const p=findProduct(id);
   if(p)p.price=prices[id];
  });

  DATA.lastBulk=null;

  saveData();

  rememberAdminScroll();
  render({preserveAdminScroll:true});

  showToast("↶ Fiyatlar geri alındı");
 });
}

function clearAdminSearch(){

 adminSearch="";

 const input=$("adminSearchInput");

 if(input)input.value="";

 $("adminSearchClear")?.remove();

 refreshAdminMenuBody();

 const target=$("bulkTarget");
 const opt=target?.querySelector('option[value="search"]');
 if(opt){
  if(target.value==="search")target.value="all";
  opt.remove();
 }
}

function bindAdminButtonsInBody(){

 /* Kategori listesi yeniden çizilince ekle/çevir butonları */
 const add=$("addCategory");

 if(add&&!add.dataset.bound){
  add.dataset.bound="1";
  add.onclick=()=>{
   collectAdmin();
   const id=newId();
   DATA.categories.push({id,name:"Yeni Kategori",names:{tr:"Yeni Kategori"},image:"",items:[]});
   adminCategoryView=id;
   adminProductView=null;
   pushLayer();
   saveData();
   render();
  };
 }

}

/* Tutamaçtan sürükleyerek sıralama (dokunmatik + fare) */
function enableDragSort(list){

 if(list.dataset.dragReady)return;

 list.dataset.dragReady="1";

 list.addEventListener("pointerdown",e=>{

  const handle=e.target.closest(".dragHandle");

  if(!handle||!list.contains(handle))return;

  const row=handle.closest(".adminRow");

  /* İç içe listelerde (kategori > ürün) sadece kendi satırları */
  if(!row||row.parentElement!==list)return;

  e.preventDefault();

  const scroller=document.querySelector(".admin");
  const startY=e.clientY;
  const startScroll=scroller?scroller.scrollTop:0;
  let offset=0;
  let autoScroll=0;
  let lastY=e.clientY;

  row.classList.add("dragging");
  document.body.classList.add("isDragging");


  const rows=()=>[...list.querySelectorAll(":scope > .adminRow")];

  const place=y=>{

   const scrollDelta=(scroller?scroller.scrollTop:0)-startScroll;

   row.style.transform="translateY("+(y-startY+scrollDelta-offset)+"px)";

   const others=rows().filter(r=>r!==row);

   for(const other of others){

    const rect=other.getBoundingClientRect();
    const mid=rect.top+rect.height/2;
    const rowRect=row.getBoundingClientRect();
    const rowMid=rowRect.top+rowRect.height/2;

    const before=row.compareDocumentPosition(other)&Node.DOCUMENT_POSITION_FOLLOWING;

    if(before&&rowMid>mid){
     const h=other.getBoundingClientRect().height+parseFloat(getComputedStyle(list).gap||0);
     other.after(row);
     offset+=h;
     row.style.transform="translateY("+(y-startY+scrollDelta-offset)+"px)";
     break;
    }

    if(!before&&rowMid<mid){
     const h=other.getBoundingClientRect().height+parseFloat(getComputedStyle(list).gap||0);
     other.before(row);
     offset-=h;
     row.style.transform="translateY("+(y-startY+scrollDelta-offset)+"px)";
     break;
    }
   }
  };

  const tick=()=>{
   if(!autoScroll||!scroller)return;
   scroller.scrollTop+=autoScroll;
   place(lastY);
   requestAnimationFrame(tick);
  };

  const move=ev=>{

   lastY=ev.clientY;

   place(ev.clientY);

   const h=window.innerHeight;
   const wasScrolling=autoScroll;

   autoScroll=ev.clientY<90?-8:ev.clientY>h-110?8:0;

   if(autoScroll&&!wasScrolling)requestAnimationFrame(tick);
  };

  const end=()=>{

   autoScroll=0;

   window.removeEventListener("pointermove",move);
   window.removeEventListener("pointerup",end);
   window.removeEventListener("pointercancel",end);

   row.classList.remove("dragging");
   row.style.transform="";
   document.body.classList.remove("isDragging");

   const order=rows().map(r=>r.dataset.rowId);
   const key=list.dataset.sortable;

   let arr=key==="categories"?DATA.categories:findCategory(key)?.items;

   if(!arr)return;

   const sorted=order.map(id=>arr.find(x=>x.id===id)).filter(Boolean);

   if(sorted.length!==arr.length)return;

   const changed=sorted.some((x,i)=>x!==arr[i]);

   if(!changed)return;

   if(key==="categories")DATA.categories=sorted;
   else findCategory(key).items=sorted;

   saveData();
   showToast("✓ Sıralama kaydedildi");
  };

  /* Satır DOM'da yer değiştirince pointer capture düşebildiği için
     olaylar pencereden dinlenir */
  window.addEventListener("pointermove",move);
  window.addEventListener("pointerup",end);
  window.addEventListener("pointercancel",end);
 });
}

/* =========================================================
   GERİ TUŞU, ESC, DIŞARI DOKUNMA
========================================================= */

function pushLayer(){
 try{history.pushState({near:Date.now()},"")}catch(e){}
}

function hasOpenLayer(){
 return adminOpen||selectedEvent||selectedProduct||searchOpen||selectedCategory;
}

/* En üstteki katmanı kapatır. Bir şey kapandıysa true döner. */
function closeTopLayer(){

 if(currencyMenu||languageMenu){
  currencyMenu=false;
  languageMenu=false;
  render({preserveWindowScroll:true});
  return true;
 }

 if(adminOpen){

  if(!adminAuthenticated){
   adminOpen=false;
   render({preserveWindowScroll:true});
   return true;
  }

  if(quickAdd){
   closeQuickAdd();
   return true;
  }

  collectAdmin();

  if(adminProductView){
   adminProductView=null;
   advancedProduct=false;
   render();
   return true;
  }

  if(adminEventView){
   adminEventView=null;
   render();
   return true;
  }

  if(adminCategoryView){
   adminCategoryView=null;
   render();
   return true;
  }

  if(adminTab==="pdf"){
   adminTab="general";
   render();
   return true;
  }

  saveData();
  adminOpen=false;
  adminAuthenticated=false;
  render({preserveWindowScroll:true});
  return true;
 }

 if(selectedEvent){
  selectedEvent=null;
  render({preserveWindowScroll:true});
  return true;
 }

 if(selectedProduct){
  selectedProduct=null;
  render({preserveWindowScroll:true});
  return true;
 }

 if(searchOpen){
  searchOpen=false;
  searchText="";
  render();
  return true;
 }

 if(selectedCategory){
  selectedCategory=null;
  render();
  window.scrollTo(0,0);
  return true;
 }

 return false;
}

window.addEventListener("popstate",()=>{

 /* Açık bir şey yoksa bu eski bir kayıttır: bir adım daha geri git */
 if(!closeTopLayer())
  history.back();
});

document.addEventListener("keydown",e=>{

 if(e.key!=="Escape")return;

 if(currencyMenu||languageMenu){
  closeTopLayer();
  return;
 }

 if(hasOpenLayer())
  history.back();
});

document.addEventListener("click",e=>{

 if(!(currencyMenu||languageMenu))return;

 if(e.target.closest(".quickPopup,#currencyButton,#languageButton"))return;

 currencyMenu=false;
 languageMenu=false;

 render({preserveWindowScroll:true});
});

/* Yüklenemeyen fotoğraflar kırık simge göstermesin */
document.addEventListener("error",e=>{
 if(e.target&&e.target.tagName==="IMG")
  e.target.classList.add("imgBroken");
},true);

/* =========================================================
   BAŞLAT
========================================================= */

/* Açılışta kayıt yapılmaz (hiçbir şey değişmedi); sadece daha yeni kayıt varsa yüklenir */
render({
 resetScroll:true
});

if(PREVIEW){

 /* Önizleme: veri panelden gelir. Ürüne dokunmak paneli o ürüne götürür. */
 window.addEventListener("message",e=>{
  if(e.origin!==location.origin||e.source!==window.parent||!e.data||e.data.type!=="nmPreview")return;
  const d=e.data.data;
  if(!d||!Array.isArray(d.categories))return;
  DATA.categories=[];
  DATA.events=[];
  Object.assign(DATA,d);
  cloud.ready=true;
  cloud.state="ok";
  if(selectedCategory&&!findCategory(selectedCategory))selectedCategory=null;
  render({preserveWindowScroll:true});
 });

 document.addEventListener("click",e=>{
  const card=e.target.closest("[data-product]");
  if(!card)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  window.parent.postMessage({type:"nmPreviewEdit",id:card.dataset.product},location.origin);
 },true);

 window.parent.postMessage({type:"nmPreviewReady"},location.origin);

}else{
 startCloud();
}
