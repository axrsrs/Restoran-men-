/* =========================================================
   AYARLAR
========================================================= */
const LOADER_HTML=`<div class="orbital-loader" role="img" aria-label="Yükleniyor"><div class="core-system"><div class="core-halo"></div><div class="core-outer-ring"></div><div class="core-secondary-ring"></div><div class="core-thin-ring"></div><div class="core-inner-glow"></div><div class="core-micro-center"></div></div><div class="pulse-system"><div class="pulse-ring pulse-ring-1"></div><div class="pulse-ring pulse-ring-2"></div><div class="pulse-ring pulse-ring-3"></div></div><div class="orbit-system orbit-1"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-circle"></div><div class="object-trail"></div></div></div><div class="orbit-system orbit-2"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-ring"></div></div></div><div class="orbit-system orbit-3"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-bright-point"></div></div></div><div class="orbit-system orbit-4"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-diamond"></div></div></div><div class="orbit-system orbit-5"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-line"></div></div></div><div class="orbit-system orbit-6"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-square"></div></div></div><div class="orbit-system orbit-7"><div class="orbit-path"></div><div class="orbit-object-wrapper"><div class="orbit-object obj-fragment"></div></div></div><div class="particle-system"><div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div><div class="particle p6"></div><div class="particle p7"></div><div class="particle p8"></div><div class="particle p9"></div><div class="particle p10"></div><div class="particle p11"></div><div class="particle p12"></div><div class="particle p13"></div><div class="particle p14"></div><div class="particle p15"></div></div><div class="energy-fragments"><div class="energy-fragment ef1"></div><div class="energy-fragment ef2"></div><div class="energy-fragment ef3"></div></div></div>`;
const SB_URL="https://rfwgjzkewtjpdcvrhepg.supabase.co";
const SB_KEY="sb_publishable_ohHiomyazD8qr_mQXX9G-Q_DCEeD8j2";
const SESSION_KEY="nd821Session"; /* süper panel oturumu sadece bu sekmede (sessionStorage) tutulur */
const MAIN_DEMO="nearmenu-demo";
const RESERVED=["821","katalog","demo","menu","ammar","admin","yonetim","api","www","assets","static","index","404","ayse","site"];
const CATALOG_DEMO="sh21-demo";
const MENU_BASE=new URL("./",location.href).href;

/* =========================================================
   YARDIMCILAR
========================================================= */
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

function toast(msg){
 const t=$("toast");
 t.textContent=msg;
 t.classList.add("show");
 clearTimeout(t._t);
 t._t=setTimeout(()=>t.classList.remove("show"),2400);
}

function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function safeDel(k){try{localStorage.removeItem(k)}catch(e){}}

function slugify(text){
 const map={"ç":"c","ğ":"g","ı":"i","İ":"i","ö":"o","ş":"s","ü":"u","â":"a","î":"i","û":"u"};
 return String(text||"").toLocaleLowerCase("tr-TR")
  .replace(/[çğıİöşüâîû]/g,ch=>map[ch]||ch)
  .normalize("NFD").replace(/[̀-ͯ]/g,"")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);
}

const PRETTY_URLS=!/github\.io$/i.test(location.hostname)&&!/^(localhost|127\.)/.test(location.hostname);

function menuUrl(slug){
 return PRETTY_URLS
  ?location.origin+"/"+encodeURIComponent(slug)
  :new URL("../menu/",location.href).href+"?r="+encodeURIComponent(slug);
}

function katalogUrl(slug){
 if(slug===CATALOG_DEMO)return PRETTY_URLS?location.origin+"/katalog":new URL("../katalog/",location.href).href;
 return PRETTY_URLS
  ?location.origin+"/katalog/"+encodeURIComponent(slug)
  :new URL("../katalog/",location.href).href+"?f="+encodeURIComponent(slug);
}

/* İki ürün aynı panelden yönetilir: NearMenu (restoranlar) ve sh21 (kataloglar) */
const KINDS={
 katalog:{tab:"Katalog",title:"sh21 Katalog",noun:"katalog",Noun:"Katalog",thing:"katalog",Thing:"Katalog",acc:"Kataloğu",
  list:"catalog_admin_list",create:"catalog_admin_create",addOwner:"catalog_admin_add_owner",ownerParam:"p_catalog",
  table:"catalogs",demo:CATALOG_DEMO,url:s=>katalogUrl(s),open:"Kataloğu aç",nameLabel:"Firma adı",namePh:"örn. Asoda Mobilya",slugPh:"asoda-mobilya",
  copyLabel:"Demo kataloğu kopyala (sh21-demo içeriği)",visits:"Bugün katalog açılışı",open30:"açılış / 30 gün",
  shareDemo:"için hazırladığım ürün kataloğu demosu:",shareReady:"ürün kataloğunuz hazır:",
  edit:"Kataloğu kendiniz düzenlemek için katalogda logoya 2 saniye basılı tutun ve giriş yapın:",
  demoEmail:"demo.sh21.app",mainNote:"Bu ana demo katalogdur; yeni kataloglar buradan kopyalanır, silinemez.",delLabel:"Kataloğu ve tüm içeriğini kalıcı olarak sil",
  closed:"Katalog ziyaretçilere kapalı.",passiveOpt:"Pasif (katalog kapalı)"},
 menu:{tab:"Menü",title:"NearMenu",noun:"restoran",Noun:"Restoran",thing:"menü",Thing:"Menü",acc:"Menüyü",
  list:"admin_list_restaurants",create:"admin_create_restaurant",addOwner:"admin_add_owner",ownerParam:"p_restaurant",
  table:"restaurants",demo:MAIN_DEMO,url:s=>menuUrl(s),open:"Menüyü aç",nameLabel:"İşletme adı",namePh:"örn. Kebapçı Ali",slugPh:"kebapci-ali",
  copyLabel:"Demo menüyü kopyala (75 ürün, çevirileriyle)",visits:"Bugün menü açılışı",open30:"açılış / 30 gün",
  shareDemo:"için hazırladığım dijital menü demosu:",shareReady:"dijital menünüz hazır:",
  edit:"Menüyü kendiniz düzenlemek için menüde logoya 3 saniye basılı tutun ve giriş yapın:",
  demoEmail:"demo.nearmenu.app",mainNote:"Bu ana demo menüdür; diğer demolar buradan kopyalanır, silinemez.",delLabel:"Restoranı ve menüsünü kalıcı olarak sil",
  closed:"Menü müşterilere kapalı.",passiveOpt:"Pasif (menü kapalı)"}
};
let kind=(()=>{const q=new URLSearchParams(location.search).get("k");const k=q||safeGet("superKind");return k==="menu"?"menu":"katalog"})();
const K=()=>KINDS[kind];

function fmtDate(d){
 if(!d)return "";
 const [y,m,day]=String(d).slice(0,10).split("-").map(Number);
 return new Date(y,m-1,day).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
}

function daysLeft(d){
 if(!d)return null;
 const [y,m,day]=String(d).slice(0,10).split("-").map(Number);
 const end=new Date(y,m-1,day);
 const today=new Date();today.setHours(0,0,0,0);
 return Math.round((end-today)/86400000);
}

function isoPlus(days){
 const d=new Date();d.setDate(d.getDate()+days);
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

async function copyText(text){
 try{
  await navigator.clipboard.writeText(text);
  toast("✓ Kopyalandı");
 }catch(e){
  const ta=document.createElement("textarea");
  ta.value=text;document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy");toast("✓ Kopyalandı")}catch(_){toast("Kopyalanamadı, elle seçip kopyalayın")}
  ta.remove();
 }
}

/* =========================================================
   SUPABASE (fetch ile)
========================================================= */
let session=null;
try{localStorage.removeItem("nearMenuSession")}catch(e){} /* eski ortak oturum kaydı */
try{session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null")}catch(e){}

function storeSession(s){
 session=s;
 try{if(s)sessionStorage.setItem(SESSION_KEY,JSON.stringify(s));else sessionStorage.removeItem(SESSION_KEY)}catch(e){}
}

async function authReq(path,body,method,withToken){
 const r=await fetch(SB_URL+"/auth/v1/"+path,{
  method:method||"POST",
  headers:Object.assign({"apikey":SB_KEY,"Content-Type":"application/json"},
   withToken&&session?{"Authorization":"Bearer "+session.access_token}:{}),
  body:JSON.stringify(body||{})
 });
 let j={};try{j=await r.json()}catch(e){}
 if(!r.ok){const e=new Error(j.error_description||j.msg||j.message||("HTTP "+r.status));e.status=r.status;e.code=j.error_code||"";throw e}
 return j;
}

function toSession(j){
 return {access_token:j.access_token,refresh_token:j.refresh_token,
  expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:j.user||session?.user||null};
}

async function ensureFresh(){
 if(!session)return;
 if((session.expires_at||0)-Math.floor(Date.now()/1000)>90)return;
 try{
  storeSession(toSession(await authReq("token?grant_type=refresh_token",{refresh_token:session.refresh_token})));
 }catch(e){
  if(e.status>=400&&e.status<500)storeSession(null);
 }
}

async function sb(path,opts={}){
 await ensureFresh();
 const headers=Object.assign({"apikey":SB_KEY},opts.headers||{});
 if(opts.body!==undefined)headers["Content-Type"]="application/json";
 if(session)headers["Authorization"]="Bearer "+session.access_token;
 const r=await fetch(SB_URL+path,{method:opts.method||"GET",headers,body:opts.body===undefined?undefined:JSON.stringify(opts.body)});
 if(!r.ok){
  let j={};try{j=await r.json()}catch(e){}
  const e=new Error(j.message||("HTTP "+r.status));e.status=r.status;e.code=j.code||"";throw e;
 }
 if(r.status===204)return null;
 const t=await r.text();return t?JSON.parse(t):null;
}

const rpc=(name,args)=>sb("/rest/v1/rpc/"+name,{method:"POST",body:args||{}});

/* =========================================================
   DURUM
========================================================= */
let view="checking";       /* checking | login | newPassword | app */
let restaurants=[];
let loading=false;
let filter="all";
let query="";
let modal=null;            /* {type:'create'|'result'|'edit'|'share', ...} */

function statusOf(r){
 if(r.status==="passive")return "passive";
 if(r.status==="trial"){
  const d=daysLeft(r.trial_ends);
  return d!==null&&d<0?"expired":"trial";
 }
 const p=daysLeft(r.paid_until);
 return p!==null&&p<0?"expired":"active";
}
function fmtPrice(r){
 if(r.price_amount==null)return "";
 const cur=r.price_currency==="USD"?"$":r.price_currency==="EUR"?"€":"₺";
 return cur+Number(r.price_amount).toLocaleString("tr-TR",{maximumFractionDigits:2})+(r.price_period==="yil"?" / yıl":" / ay");
}
/* Biten tarih: denemede deneme sonu, aktifte abonelik sonu */
function endOf(r){return r.status==="trial"?r.trial_ends:r.status==="active"?r.paid_until:null}
function endingSoon(r){
 const s=statusOf(r),d=daysLeft(endOf(r));
 return d!==null&&((s==="trial"&&d<=3)||(s==="active"&&d<=7));
}

const STATUS_LABEL={active:"Aktif",trial:"Deneme",expired:"Süresi doldu",passive:"Pasif"};

/* =========================================================
   GÖRÜNÜM
========================================================= */
function render(){

 const app=$("app");

 if(view==="checking"){
  app.innerHTML=`<div class="loading">${LOADER_HTML}<span>Kontrol ediliyor...</span></div>`;
  return;
 }

 if(view==="login"||view==="newPassword"){
  app.innerHTML=renderLogin();
  NDGiris.bagla(app);
  bindLogin();
  return;
 }

 app.innerHTML=renderApp()+(modal?renderModal():"");
 bindApp();
 if(modal)bindModal();
}

/* Giriş ekranındaki tema seçimi panelin kendi temasıdır */
NDGiris.temaAyar({
 oku:()=>document.documentElement.dataset.theme==="light"?"light":"dark",
 yaz:t=>{
  document.documentElement.dataset.theme=t;
  safeSet("nd821Theme",t);
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="light"?"#EBE9E5":"#111110";
 }
});

function renderLogin(){

 const G=NDGiris;

 if(view==="newPassword"){
  return G.sayfa(
   G.baslik("Yeni Şifre","İlk girişiniz. Geçici şifre yerine kendi şifrenizi belirleyin (en az 8 karakter).")+
   G.alan({id:"np1",tur:"password",yer:"Yeni şifre",oto:"new-password"})+
   G.alan({id:"np2",tur:"password",yer:"Yeni şifre (tekrar)",oto:"new-password"})+
   G.buton("npSave","Şifreyi Kaydet")+
   G.hata("err"));
 }

 return G.sayfa(
  G.baslik("Hoş Geldiniz","Süper yönetici paneli: tüm restoranlar, kataloglar ve demolar.")+
  G.alan({id:"em",tur:"email",yer:"E-posta",deger:safeGet("nearMenuLastEmail")||""})+
  G.alan({id:"pw",tur:"password",yer:"Şifre"})+
  G.buton("loginBtn","Giriş Yap")+
  G.hata("err")+
  `<p class="ndg-foot">Bu panel sadece süper yönetici hesabıyla açılır. Restoran ve firma sahipleri kendi menü ve kataloglarından (logoya basılı tutarak) giriş yapar.</p>`);
}

const ICON_SUN='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.2" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
const ICON_MOON='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.6 10.1A5.9 5.9 0 0 1 5.9 2.4a5.9 5.9 0 1 0 7.7 7.7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
function themeBtn(cls){
 const dark=document.documentElement.dataset.theme!=="light";
 return `<button type="button" class="theme-btn ${cls}" data-theme-toggle aria-label="${dark?"Açık temaya geç":"Koyu temaya geç"}" title="${dark?"Açık tema":"Koyu tema"}">${dark?ICON_SUN:ICON_MOON}</button>`;
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-theme-toggle]");if(!b)return;
 const next=document.documentElement.dataset.theme==="light"?"dark":"light";
 document.documentElement.dataset.theme=next;
 safeSet("nd821Theme",next);
 const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=next==="light"?"#EBE9E5":"#111110";
 document.querySelectorAll("[data-theme-toggle]").forEach(x=>{x.outerHTML=themeBtn(x.classList.contains("login-theme")?"login-theme":"")});
});

function showErr(msg){
 const e=$("err");
 if(e){e.textContent=msg;e.hidden=false;e.style.display="block"}
}

function renderApp(){

 const all=restaurants;
 const counts={
  all:all.length,
  active:all.filter(r=>statusOf(r)==="active").length,
  trial:all.filter(r=>statusOf(r)==="trial").length,
  ending:all.filter(endingSoon).length,
  expired:all.filter(r=>statusOf(r)==="expired").length,
  passive:all.filter(r=>statusOf(r)==="passive").length
 };
 const visitsToday=all.reduce((a,r)=>a+(Number(r.visits_today)||0),0);

 const q=query.trim().toLocaleLowerCase("tr-TR");

 const list=all.filter(r=>{
  const s=statusOf(r);
  if(filter==="active"&&s!=="active")return false;
  if(filter==="trial"&&s!=="trial")return false;
  if(filter==="ending"&&!endingSoon(r))return false;
  if(filter==="expired"&&s!=="expired")return false;
  if(filter==="passive"&&s!=="passive")return false;
  if(q){
   const hay=(r.name+" "+r.slug+" "+(r.members||[]).map(m=>m.email).join(" ")).toLocaleLowerCase("tr-TR");
   if(!hay.includes(q))return false;
  }
  return true;
 });

 const chip=(id,label,n)=>`<button class="chip ${filter===id?"on":""}" data-filter="${id}">${label} (${n})</button>`;

 return `
 <div class="top">
  <div class="brand">
   <div class="logo"><img src="/assets/icons/icon-192.png" alt=""></div>
   <div><b>NearDiji Süper Yönetici</b><span>${esc(session?.user?.email||"")}</span></div>
  </div>
  <div class="top-right">${themeBtn("")}<button class="btn small" id="logout">Çıkış</button></div>
 </div>

 <div class="kinds" role="tablist" aria-label="Ürün">
  ${Object.keys(KINDS).map(k=>`<button role="tab" aria-selected="${k===kind}" class="${k===kind?"on":""}" data-kind="${k}">${KINDS[k].tab}<small>${KINDS[k].title}</small></button>`).join("")}
 </div>

 <div class="stats">
  <div class="stat"><small>Toplam ${K().noun}</small><b>${counts.all}</b></div>
  <div class="stat"><small>Aktif (ödeyen)</small><b>${counts.active}</b></div>
  <div class="stat"><small>Denemede</small><b>${counts.trial}</b></div>
  <div class="stat ${counts.ending+counts.expired?"warn":""}"><small>Bitiyor / bitti</small><b>${counts.ending} / ${counts.expired}</b></div>
  <div class="stat"><small>${K().visits}</small><b>${visitsToday}</b></div>
 </div>

 <div class="actions">
  <button class="btn gold" id="newDemo">🎁 Demo Oluştur</button>
  <button class="btn" id="newCustomer">+ Gerçek Müşteri Ekle</button>
 </div>

 <div class="toolbar">
  <label class="search"><span aria-hidden="true">⌕</span><input id="q" type="text" placeholder="${K().Noun}, adres veya e-posta ara" value="${esc(query)}" aria-label="Ara"></label>
  <button class="btn small" id="reload" aria-label="Yenile">↻ Yenile</button>
 </div>

 <div class="toolbar chips">
  ${chip("all","Tümü",counts.all)}
  ${chip("active","Aktif",counts.active)}
  ${chip("trial","Deneme",counts.trial)}
  ${chip("ending","3 gün içinde bitiyor",counts.ending)}
  ${chip("expired","Süresi doldu",counts.expired)}
  ${chip("passive","Pasif",counts.passive)}
 </div>

 ${
  loading&&!all.length
  ?`<div class="loading">${LOADER_HTML}<span>${K().Noun==="Katalog"?"Kataloglar":"Restoranlar"} yükleniyor...</span></div>`
  :list.length
  ?`<div class="list">${list.map(renderCard).join("")}</div>`
  :`<div class="empty">${all.length?"Bu filtreye uyan "+K().noun+" yok.":"Henüz "+K().noun+" yok. \"Demo Oluştur\" ile başlayın."}</div>`
 }`;
}

function renderCard(r){

 const s=statusOf(r);
 const d=daysLeft(r.trial_ends);
 let trial="";

 if(r.status==="trial"&&r.trial_ends){
  trial=d<0
   ?`<div class="trialline warn">Deneme ${fmtDate(r.trial_ends)} tarihinde bitti. ${K().closed}</div>`
   :`<div class="trialline ${d<=3?"warn":""}">Deneme ${fmtDate(r.trial_ends)} tarihine kadar · <b>${d===0?"bugün son gün":d+" gün kaldı"}</b></div>`;
 }
 if(r.status==="active"&&r.paid_until){
  const p=daysLeft(r.paid_until);
  trial=p<0
   ?`<div class="trialline warn">Abonelik ${fmtDate(r.paid_until)} tarihinde bitti. ${K().closed}</div>`
   :`<div class="trialline ${p<=7?"warn":""}">Abonelik ${fmtDate(r.paid_until)} tarihine kadar · <b>${p===0?"bugün son gün":p+" gün kaldı"}</b></div>`;
 }
 if(r.price_amount!=null)trial+=`<div class="trialline">Ücret: <b>${esc(fmtPrice(r))}</b></div>`;

 const members=(r.members||[]).map(m=>`
  <div class="member"><span>👤 ${esc(m.email)}</span>${m.must_change?`<span class="tag">ilk giriş bekleniyor</span>`:""}</div>`).join("");

 return `
 <div class="card">
  <div class="card-head">
   <div style="min-width:0">
    <h3>${esc(r.name)}</h3>
    <a href="${esc(K().url(r.slug))}" target="_blank" rel="noopener">${esc(K().url(r.slug).replace(/^https?:\/\//,""))}</a>
   </div>
   <span class="pill ${s}">${STATUS_LABEL[s]}</span>
  </div>
  <div class="meta">
   <span><b>${r.products}</b> ürün</span>
   <span><b>${r.categories}</b> kategori</span>
   <span><b>${r.visits_30d}</b> ${K().open30}</span>
   <span>${r.plan==="premium"?"Premium":"Temel"} paket</span>
  </div>
  ${trial}
  ${members?`<div class="members">${members}</div>`:`<div class="hint">Henüz panel hesabı yok.</div>`}
  <div class="card-actions">
   <a class="btn small" href="${esc(K().url(r.slug))}" target="_blank" rel="noopener">${K().open}</a>
   <button class="btn small" data-qr="${esc(r.id)}">QR</button>
   <button class="btn small" data-share="${esc(r.id)}">Paylaş</button>
   <button class="btn small gold" data-edit="${esc(r.id)}">Yönet</button>
  </div>
 </div>`;
}

/* ---------- modallar ---------- */

function renderModal(){

 if(modal.type==="create"){

  const demo=modal.mode==="demo";
  const f=modal.form;

  return `
  <div class="overlay" id="overlay">
   <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="modal-head"><h2 id="mTitle">${demo?"🎁 Demo oluştur":"Gerçek müşteri ekle"}</h2><button class="x" id="mClose" aria-label="Kapat">×</button></div>

    <div class="seg">
     <button class="${demo?"on":""}" data-mode="demo">Demo<small>süreli deneme</small></button>
     <button class="${demo?"":"on"}" data-mode="customer">Gerçek müşteri<small>aktif, süresiz</small></button>
    </div>

    <div class="field"><label for="fName">${K().nameLabel}</label><input id="fName" value="${esc(f.name)}" placeholder="${K().namePh}" maxlength="120"></div>
    <div class="field">
     <label for="fSlug">${K().Thing} adresi</label>
     <input id="fSlug" value="${esc(f.slug)}" placeholder="${K().slugPh}" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="60">
     <span class="hint">${K().Thing} linki: <code id="slugPreview">${esc(K().url(f.slug||"..."))}</code></span>
    </div>

    ${demo?`
    <div class="field">
     <label for="fDays">Deneme süresi</label>
     <select id="fDays">
      ${[7,14,30].map(n=>`<option value="${n}" ${Number(f.days)===n?"selected":""}>${n} gün</option>`).join("")}
     </select>
     <span class="hint">Süre bitince ${K().thing} kendiliğinden kapanır, veriler silinmez.</span>
    </div>`:`
    <div class="field">
     <label for="fPlan">Paket</label>
     <select id="fPlan">
      <option value="basic" ${f.plan==="basic"?"selected":""}>Temel</option>
      <option value="premium" ${f.plan==="premium"?"selected":""}>Premium</option>
     </select>
    </div>`}

    <label class="check"><input type="checkbox" id="fCopy" ${f.copy?"checked":""}> ${K().copyLabel}</label>

    <div class="section-title">Panel hesabı</div>
    <label class="check"><input type="checkbox" id="fAccount" ${f.account?"checked":""}> ${K().acc} düzenleyebilsin diye giriş hesabı oluştur</label>
    <div class="field" ${f.account?"":"hidden"} id="emailWrap">
     <label for="fEmail">E-posta</label>
     <input id="fEmail" type="email" value="${esc(f.email)}" placeholder="${demo?"otomatik: adres@"+K().demoEmail:"isletme@ornek.com"}" autocapitalize="off">
     <span class="hint">${demo
      ?"Boş bırakırsanız sahte bir demo e-postası oluşturulur; gerçek e-posta gerekmez."
      :"İşletme sahibinin e-postası. İlk girişte kendi şifresini belirleyecek."}</span>
    </div>

    <div class="error" id="err" hidden></div>

    <div class="modal-foot">
     <button class="btn" id="mCancel">Vazgeç</button>
     <button class="btn gold" id="mCreate">${demo?"Demoyu oluştur":"Müşteriyi ekle"}</button>
    </div>
   </div>
  </div>`;
 }

 if(modal.type==="result"||modal.type==="share"){

  const r=modal.restaurant;
  const text=shareText(r,modal.owner);

  return `
  <div class="overlay" id="overlay">
   <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="modal-head"><h2 id="mTitle">${modal.type==="result"?"Hazır":"Paylaş"}: ${esc(r.name)}</h2><button class="x" id="mClose" aria-label="Kapat">×</button></div>
    ${modal.type==="result"?`<div class="success">✓ ${r.status==="trial"?"Demo oluşturuldu":"Müşteri eklendi"}${modal.products?` · ${modal.products} ürün kopyalandı`:""}</div>`:""}
    ${modal.owner&&modal.owner.temp_password===null?`<p class="hint">${esc(modal.owner.email)} zaten kayıtlıydı; mevcut şifresiyle giriş yapar.</p>`:""}
    ${!modal.owner&&modal.type==="share"?`<p class="hint">Giriş bilgisi eklemek için "Yönet" ekranından şifre sıfırlayıp oradan paylaşın.</p>`:""}
    <div class="result" id="shareText">${esc(text)}</div>
    <div class="ext">
     <a class="btn gold" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">WhatsApp'ta gönder</a>
     <button class="btn" id="copyShare">Metni kopyala</button>
     <button class="btn" id="copyLink">Sadece linki kopyala</button>
     <button class="btn" id="qrBtn">QR kod</button>
     <a class="btn" href="${esc(K().url(r.slug))}" target="_blank" rel="noopener">${K().open}</a>
    </div>
    ${modal.owner&&modal.owner.temp_password?`<p class="hint" style="margin-top:12px">Geçici şifre sadece şimdi gösteriliyor. Kaybolursa "Yönet" ekranından yeni şifre oluşturabilirsiniz.</p>`:""}
   </div>
  </div>`;
 }

 if(modal.type==="edit"){

  const r=restaurants.find(x=>x.id===modal.id);
  if(!r){modal=null;return ""}
  const isMain=r.slug===K().demo;

  return `
  <div class="overlay" id="overlay">
   <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
    <div class="modal-head"><h2 id="mTitle">${esc(r.name)}</h2><button class="x" id="mClose" aria-label="Kapat">×</button></div>
    <p class="hint"><code>${esc(K().url(r.slug))}</code></p>

    <div class="field"><label for="eName">${K().nameLabel}</label><input id="eName" value="${esc(r.name)}" maxlength="120"></div>

    <div class="row2">
     <div class="field">
      <label for="eStatus">Durum</label>
      <select id="eStatus">
       <option value="active" ${r.status==="active"?"selected":""}>Aktif (süresiz)</option>
       <option value="trial" ${r.status==="trial"?"selected":""}>Deneme</option>
       <option value="passive" ${r.status==="passive"?"selected":""}>${K().passiveOpt}</option>
      </select>
     </div>
     <div class="field">
      <label for="ePlan">Paket</label>
      <select id="ePlan">
       <option value="basic" ${r.plan==="basic"?"selected":""}>Temel</option>
       <option value="premium" ${r.plan==="premium"?"selected":""}>Premium</option>
      </select>
     </div>
    </div>

    <div class="row2">
     <div class="field">
      <label for="ePrice">Ücret (müşteri panelinde görünür)</label>
      <input id="ePrice" type="number" inputmode="decimal" min="0" step="0.01" placeholder="örn. 750" value="${r.price_amount!=null?esc(String(r.price_amount)):""}">
     </div>
     <div class="field">
      <label for="ePeriod">Dönem ve para birimi</label>
      <div class="row2" style="gap:8px">
       <select id="ePeriod">
        <option value="ay" ${r.price_period!=="yil"?"selected":""}>Aylık</option>
        <option value="yil" ${r.price_period==="yil"?"selected":""}>Yıllık</option>
       </select>
       <select id="eCurrency">
        ${["TRY","USD","EUR"].map(c=>`<option value="${c}" ${(r.price_currency||"TRY")===c?"selected":""}>${c==="TRY"?"TL":c}</option>`).join("")}
       </select>
      </div>
     </div>
    </div>

    <div class="field">
     <label for="eTrial">Deneme bitiş tarihi</label>
     <input id="eTrial" type="date" value="${esc(r.trial_ends||"")}">
     <div class="ext">
      <button class="btn small" data-extend="7">+7 gün</button>
      <button class="btn small" data-extend="14">+14 gün</button>
      <button class="btn small" data-extend="30">+30 gün</button>
     </div>
    </div>

    <div class="field">
     <label for="ePaid">Abonelik bitiş tarihi (Aktif için, boş bırakılırsa süresiz)</label>
     <input id="ePaid" type="date" value="${esc(r.paid_until||"")}">
     <div class="ext">
      <button class="btn small" data-paid="1">+1 ay</button>
      <button class="btn small" data-paid="3">+3 ay</button>
      <button class="btn small" data-paid="12">+1 yıl</button>
     </div>
    </div>

    <div class="modal-foot"><button class="btn gold" id="eSave">Kaydet</button></div>

    <div class="section-title">Panel hesapları</div>
    ${(r.members||[]).length?(r.members||[]).map(m=>`
     <div class="memberrow"><span>👤 ${esc(m.email)}${m.must_change?" · ilk giriş bekleniyor":""}</span>
      <button class="btn small" data-reset="${esc(m.email)}">Yeni şifre</button></div>`).join(""):`<p class="hint">Henüz hesap yok.</p>`}
    <div class="row2" style="align-items:end">
     <div class="field"><label for="eOwner">Hesap ekle (e-posta)</label><input id="eOwner" type="email" placeholder="isletme@ornek.com" autocapitalize="off"></div>
     <div class="field"><button class="btn" id="eAddOwner">Ekle</button></div>
    </div>

    ${isMain?`<p class="hint" style="margin-top:20px">${K().mainNote}</p>`:`
    <div class="section-title">Tehlikeli bölge</div>
    <div class="field">
     <label for="eDel">Silmek için adresi yazın: <code>${esc(r.slug)}</code></label>
     <input id="eDel" autocapitalize="off" autocorrect="off" spellcheck="false">
    </div>
    <button class="btn danger" id="eDelete" style="margin-top:10px;width:100%">${K().delLabel}</button>`}

    <div class="error" id="err" hidden></div>
   </div>
  </div>`;
 }

 return "";
}

function shareText(r,owner){

 const lines=[];
 const url=K().url(r.slug);

 if(r.status==="trial"){
  lines.push("Merhaba! "+r.name+" "+K().shareDemo);
 }else{
  lines.push("Merhaba! "+r.name+" "+K().shareReady);
 }
 lines.push(url);

 if(owner&&owner.temp_password){
  lines.push("");
  lines.push(K().edit);
  lines.push("E-posta: "+owner.email);
  lines.push("Şifre: "+owner.temp_password);
 }

 if(r.status==="trial"&&r.trial_ends){
  lines.push("");
  lines.push("Demo "+fmtDate(r.trial_ends)+" tarihine kadar açık.");
 }

 return lines.join("\n");
}

/* =========================================================
   OLAYLAR
========================================================= */
function bindLogin(){

 const doLogin=async()=>{
  const email=($("em").value||"").trim().toLowerCase();
  const pw=$("pw").value||"";
  const btn=$("loginBtn");
  if(!email||!pw){showErr("E-posta ve şifreyi girin.");return}
  btn.disabled=true;btn.textContent="Giriş yapılıyor...";
  try{
   storeSession(toSession(await authReq("token?grant_type=password",{email,password:pw})));
   safeSet("nearMenuLastEmail",email);
   await afterLogin();
  }catch(e){
   btn.disabled=false;btn.textContent="Giriş yap";
   showErr(e.status===400?"E-posta veya şifre yanlış.":e.status===429?"Çok fazla deneme. Biraz bekleyin.":"Giriş yapılamadı: "+e.message);
  }
 };

 $("loginBtn")?.addEventListener("click",doLogin);
 $("pw")?.addEventListener("keydown",e=>{if(e.key==="Enter")doLogin()});

 $("npSave")?.addEventListener("click",async()=>{
  const a=$("np1").value,b=$("np2").value,btn=$("npSave");
  if(a.length<8){showErr("Şifre en az 8 karakter olmalı.");return}
  if(a!==b){showErr("Şifreler aynı değil.");return}
  btn.disabled=true;
  try{
   await ensureFresh();
   const u=await authReq("user",{password:a,data:{must_change_password:false}},"PUT",true);
   session.user=u;storeSession(session);
   toast("✓ Şifre kaydedildi");
   await afterLogin();
  }catch(e){
   btn.disabled=false;
   showErr(String(e.message).toLowerCase().includes("different")?"Yeni şifre eskisinden farklı olmalı.":"Şifre kaydedilemedi: "+e.message);
  }
 });
}

async function afterLogin(){

 if(session?.user?.user_metadata?.must_change_password){
  view="newPassword";
  render();
  return;
 }

 try{
  await loadRestaurants();
  view="app";
  render();
 }catch(e){
  if(e.status===403||e.code==="42501"||/süper yönetici/i.test(e.message)){
   storeSession(null);
   view="login";
   render();
   showErr("Bu hesap süper yönetici değil.");
  }else if(e.status===401){
   storeSession(null);
   view="login";
   render();
  }else{
   view="login";
   render();
   showErr("Bağlantı hatası: "+e.message);
  }
 }
}

async function loadRestaurants(){
 loading=true;
 const list=await rpc(K().list);
 restaurants=Array.isArray(list)?list:[];
 loading=false;
}

async function reload(){
 try{
  await loadRestaurants();
  render();
 }catch(e){
  toast("Liste yenilenemedi: "+e.message);
 }
}

function bindApp(){

 $("logout")?.addEventListener("click",async()=>{
  try{await fetch(SB_URL+"/auth/v1/logout",{method:"POST",headers:{"apikey":SB_KEY,"Authorization":"Bearer "+session.access_token}})}catch(e){}
  storeSession(null);
  view="login";
  render();
 });

 $("reload")?.addEventListener("click",reload);

 document.querySelectorAll("[data-kind]").forEach(b=>b.onclick=async()=>{
  if(b.dataset.kind===kind)return;
  kind=b.dataset.kind;safeSet("superKind",kind);
  restaurants=[];filter="all";query="";loading=true;render();
  await reload();
 });

 const q=$("q");
 if(q){
  q.oninput=()=>{
   query=q.value;
   const pos=q.selectionStart;
   render();
   const n=$("q");n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}
  };
 }

 document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});

 $("newDemo")?.addEventListener("click",()=>openCreate("demo"));
 $("newCustomer")?.addEventListener("click",()=>openCreate("customer"));

 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{modal={type:"edit",id:b.dataset.edit};render()});
 document.querySelectorAll("[data-qr]").forEach(b=>b.onclick=()=>{
  const r=restaurants.find(x=>x.id===b.dataset.qr);
  if(r)NDQR.open({url:K().url(r.slug),title:r.name,file:r.slug});
 });
 document.querySelectorAll("[data-share]").forEach(b=>b.onclick=()=>{
  const r=restaurants.find(x=>x.id===b.dataset.share);
  modal={type:"share",restaurant:r,owner:null};
  render();
 });
}

function openCreate(mode){
 modal={type:"create",mode,form:{name:"",slug:"",slugTouched:false,days:14,plan:"basic",copy:true,account:true,email:""}};
 render();
 setTimeout(()=>$("fName")?.focus(),40);
}

function readForm(){
 const f=modal.form;
 f.name=$("fName")?.value??f.name;
 f.slug=$("fSlug")?.value??f.slug;
 if($("fDays"))f.days=Number($("fDays").value);
 if($("fPlan"))f.plan=$("fPlan").value;
 f.copy=!!$("fCopy")?.checked;
 f.account=!!$("fAccount")?.checked;
 f.email=$("fEmail")?.value??f.email;
}

function closeModal(){
 const wasResult=modal&&modal.type==="result";
 modal=null;
 render();
 if(wasResult)reload();
}

function bindModal(){

 $("mClose")?.addEventListener("click",closeModal);
 $("mCancel")?.addEventListener("click",closeModal);
 $("overlay")?.addEventListener("click",e=>{if(e.target.id==="overlay")closeModal()});

 /* create */
 document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{
  readForm();
  modal.mode=b.dataset.mode;
  if(modal.mode==="customer")modal.form.copy=false;
  else modal.form.copy=true;
  render();
 });

 const name=$("fName"),slug=$("fSlug");

 if(name&&slug){
  name.oninput=()=>{
   if(!modal.form.slugTouched){
    slug.value=slugify(name.value);
    $("slugPreview").textContent=K().url(slug.value||"...");
   }
  };
  slug.oninput=()=>{
   modal.form.slugTouched=true;
   const clean=slugify(slug.value);
   if(clean!==slug.value&&!slug.value.endsWith("-"))slug.value=clean;
   $("slugPreview").textContent=K().url(slugify(slug.value)||"...");
  };
 }

 $("fAccount")?.addEventListener("change",e=>{$("emailWrap").hidden=!e.target.checked});

 $("mCreate")?.addEventListener("click",async()=>{

  readForm();
  const f=modal.form;
  const demo=modal.mode==="demo";
  const slugV=slugify(f.slug);

  if(!f.name.trim()){showErr(K().nameLabel+"nı yazın.");return}
  if(slugV.length<3){showErr(K().Thing+" adresi en az 3 karakter olmalı.");return}
  if(RESERVED.includes(slugV)){showErr("\""+slugV+"\" adresi sistem tarafından kullanılıyor, başka bir adres seçin.");return}

  let email=(f.email||"").trim().toLowerCase();
  if(f.account&&!email){
   if(demo)email=slugV+"@"+K().demoEmail;
   else{showErr("Gerçek müşteri için işletme sahibinin e-postasını yazın.");return}
  }

  const btn=$("mCreate");
  btn.disabled=true;btn.textContent="Oluşturuluyor...";

  try{
   const res=await rpc(K().create,{
    p_name:f.name.trim(),
    p_slug:slugV,
    p_status:demo?"trial":"active",
    p_plan:demo?"basic":f.plan,
    p_trial_days:demo?f.days:14,
    p_copy_from:f.copy?K().demo:null,
    p_owner_email:f.account?email:null,
    p_force_change:!demo
   });

   const r={id:res.id,slug:res.slug,name:f.name.trim(),status:demo?"trial":"active",trial_ends:demo?isoPlus(f.days):null};
   modal={type:"result",restaurant:r,owner:res.owner,products:res.products};
   render();

  }catch(e){
   btn.disabled=false;btn.textContent=demo?"Demoyu oluştur":"Müşteriyi ekle";
   showErr(e.message||"Oluşturulamadı.");
  }
 });

 /* result / share */
 $("copyShare")?.addEventListener("click",()=>copyText($("shareText").textContent));
 $("copyLink")?.addEventListener("click",()=>copyText(K().url(modal.restaurant.slug)));
 $("qrBtn")?.addEventListener("click",()=>NDQR.open({url:K().url(modal.restaurant.slug),title:modal.restaurant.name,file:modal.restaurant.slug}));

 /* edit */
 const r=modal.type==="edit"?restaurants.find(x=>x.id===modal.id):null;

 document.querySelectorAll("[data-extend]").forEach(b=>b.onclick=()=>{
  const cur=$("eTrial").value;
  const base=cur&&daysLeft(cur)>=0?cur:isoPlus(0);
  const [y,m,d]=base.split("-").map(Number);
  const dt=new Date(y,m-1,d+Number(b.dataset.extend));
  $("eTrial").value=dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");
  $("eStatus").value="trial";
 });

 document.querySelectorAll("[data-paid]").forEach(b=>b.onclick=()=>{
  const cur=$("ePaid").value;
  const base=cur&&daysLeft(cur)>=0?cur:isoPlus(0);
  const [y,m,d]=base.split("-").map(Number);
  const dt=new Date(y,m-1+Number(b.dataset.paid),d);
  $("ePaid").value=dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");
  $("eStatus").value="active";
 });

 $("eSave")?.addEventListener("click",async()=>{
  const status=$("eStatus").value;
  const body={
   name:$("eName").value.trim()||r.name,
   status,
   plan:$("ePlan").value,
   trial_ends:status==="trial"?($("eTrial").value||isoPlus(14)):null,
   paid_until:status==="active"?($("ePaid").value||null):null,
   price_period:$("ePeriod").value==="yil"?"yil":"ay",
   price_currency:["TRY","USD","EUR"].includes($("eCurrency").value)?$("eCurrency").value:"TRY"
  };
  const priceRaw=($("ePrice").value||"").trim().replace(",",".");
  if(priceRaw===""){body.price_amount=null}
  else{
   const n=Number(priceRaw);
   if(!(n>=0&&n<10000000)){showErr("Ücret geçerli bir sayı olmalı.");return}
   body.price_amount=Math.round(n*100)/100;
  }
  try{
   await sb("/rest/v1/"+K().table+"?id=eq."+r.id,{method:"PATCH",headers:{"Prefer":"return=minimal"},body});
   Object.assign(r,body);
   toast("✓ Kaydedildi");
   modal=null;
   render();
   reload();
  }catch(e){showErr("Kaydedilemedi: "+e.message)}
 });

 document.querySelectorAll("[data-reset]").forEach(b=>b.onclick=async()=>{
  if(!confirm(b.dataset.reset+" için yeni geçici şifre oluşturulsun mu? Eski şifre çalışmaz."))return;
  try{
   const res=await rpc("admin_reset_password",{p_email:b.dataset.reset});
   modal={type:"share",restaurant:r,owner:{email:res.email,temp_password:res.temp_password}};
   render();
  }catch(e){showErr(e.message)}
 });

 $("eAddOwner")?.addEventListener("click",async()=>{
  const email=($("eOwner").value||"").trim().toLowerCase();
  if(!email){showErr("E-posta yazın.");return}
  try{
   const res=await rpc(K().addOwner,{[K().ownerParam]:r.id,p_email:email,p_force_change:r.status!=="trial"});
   await loadRestaurants();
   modal={type:"share",restaurant:restaurants.find(x=>x.id===r.id)||r,owner:res};
   render();
  }catch(e){showErr(e.message)}
 });

 $("eDelete")?.addEventListener("click",async()=>{
  if(($("eDel").value||"").trim()!==r.slug){showErr("Onay için adresi tam olarak yazın: "+r.slug);return}
  if(!confirm(r.name+" ve tüm içeriği kalıcı olarak silinecek. Emin misiniz?"))return;
  try{
   await sb("/rest/v1/"+K().table+"?id=eq."+r.id,{method:"DELETE",headers:{"Prefer":"return=minimal"}});
   /* Firmanın tüm fotoğraf / videolarını da sil (R2 klasörü) */
   const bucket=K().table==="catalogs"?"catalog-media":"menu-media";
   fetch("https://media.neardiji.com/"+bucket+"/"+r.id+"/",{method:"DELETE",headers:{"Authorization":"Bearer "+session.access_token}}).catch(()=>{});
   restaurants=restaurants.filter(x=>x.id!==r.id);
   modal=null;
   render();
   toast("Silindi");
  }catch(e){showErr("Silinemedi: "+e.message)}
 });
}

document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&modal)closeModal();
});

/* =========================================================
   BAŞLAT
========================================================= */
(async()=>{
 render();
 if(session){
  await ensureFresh();
 }
 if(session){
  await afterLogin();
 }else{
  view="login";
  render();
 }
})();
