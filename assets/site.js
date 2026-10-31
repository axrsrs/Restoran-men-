(function(){
"use strict";
var D=window.ND_DEFAULT, SB_URL=window.ND_SB_URL, SB_KEY=window.ND_SB_KEY;
var $=function(id){return document.getElementById(id)};
var esc=function(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")};
function safeHref(h){
 h=String(h||"").trim();
 if(!h)return "";
 if(/^(https?:|mailto:|tel:|#|\/)/i.test(h))return h;
 if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(h))return "https://"+h;
 return "";
}
function isExternal(h){return /^https?:/i.test(h)&&h.indexOf(location.origin)!==0}
function merge(base,over){
 if(!over||typeof over!=="object")return base;
 if(Array.isArray(base))return Array.isArray(over)?over:base;
 var out=Object.assign({},base);
 for(var k in over){
  if(over[k]&&typeof over[k]==="object"&&!Array.isArray(over[k])&&base[k]&&typeof base[k]==="object")out[k]=merge(base[k],over[k]);
  else if(over[k]!==undefined&&over[k]!==null)out[k]=over[k];
 }
 return out;
}
var ARROW='<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var SUN='<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.2" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
var MOON='<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.6 10.1A5.9 5.9 0 0 1 5.9 2.4a5.9 5.9 0 1 0 7.7 7.7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

var C=D, cached=null;
try{cached=JSON.parse(localStorage.getItem("nd-site")||"null")}catch(e){}
if(cached)C=merge(D,cached);

/* ── tema ── */
function theme(){return document.documentElement.dataset.theme==="light"?"light":"dark"}
var BG={light:"#EBE9E5",dark:"#111110"};

/* ── hero ── */
var hero=null;
/* ── logo: tek görselden açık/koyu tema uyumu ── */
function logoSrc(dark){
 if((C.logoMode||"auto")==="original"&&dark&&C.logoDark)return C.logoDark;
 return C.logo||C.logoDark||"";
}
function logoInvert(dark){
 if((C.logoMode||"auto")!=="auto"||!C.logoTone)return false;
 return dark?C.logoTone==="dark":C.logoTone==="light";
}
/* heykel efekti CSS filtresi kullanamadığı için ters/tek renk logo canvas'ta üretilir */
var logoVar={};
function logoVariant(dark){
 var src=logoSrc(dark), mode=C.logoMode||"auto";
 if(!src)return "";
 var op=mode==="mono"?"mono-"+(dark?"l":"d"):logoInvert(dark)?"inv":"";
 if(!op)return src;
 var key=op+"|"+src;
 if(logoVar[key])return logoVar[key]==="…"?"":logoVar[key];
 logoVar[key]="…";
 var im=new Image();im.crossOrigin="anonymous";
 im.onload=function(){
  try{
   var c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;
   var x=c.getContext("2d");x.drawImage(im,0,0);
   if(op==="inv"){var d=x.getImageData(0,0,c.width,c.height),p=d.data;
    for(var i=0;i<p.length;i+=4){var r=p[i],g=p[i+1],b=p[i+2],s=Math.max(r,g,b)+Math.min(r,g,b);p[i]=s-r;p[i+1]=s-g;p[i+2]=s-b;
     p[i]=255-p[i];p[i+1]=255-p[i+1];p[i+2]=255-p[i+2];}
    x.putImageData(d,0,0);}
   else{x.globalCompositeOperation="source-in";x.fillStyle=dark?"#EBE9E5":"#111110";x.fillRect(0,0,c.width,c.height)}
   c.toBlob(function(b){logoVar[key]=b?URL.createObjectURL(b):src;if(hero)hero.setImage(heroSrc())},"image/png");
  }catch(e){logoVar[key]=src}
 };
 im.onerror=function(){logoVar[key]=src};
 im.src=src;
 return "";
}
/* Varsayılan heykel görselleri: assets/sc-light.webp, sc-dark.webp, sc-m-light.webp, sc-m-dark.webp (adlar aşağıda parça parça kurulur; silmeyin) */
function heroSrc(){
 var h=C.hero||{}, mob=window.innerWidth<640, dark=theme()==="dark";
 if(h.sculpture==="logo"&&logoSrc(dark)){var l=logoVariant(dark);if(l)return l;return "/assets/sc-"+(mob?"m-":"")+(dark?"dark":"light")+".webp"}
 if(h.sculpture==="custom"){var s=(dark&&h.imageDark)||h.image||h.imageDark;if(s)return s}
 return "/assets/sc-"+(mob?"m-":"")+(dark?"dark":"light")+".webp";
}
function initHero(){
 if(!window.NDLiquid)return;
 hero=new NDLiquid.LiquidHero({
  root:$("hero"),stage:$("stage"),img:$("fallback"),hint:$("hint"),nav:$("nav"),content:$("heroContent"),backdrop:$("backdrop"),
  options:{bg:NDLiquid.hexToRgb(BG[theme()],[.07,.07,.06]),strength:+C.hero.strength||1,liquid:+C.hero.liquid||1,density:+C.hero.density||1},
  onMobileChange:function(){hero&&hero.setImage(heroSrc())}
 });
 $("hint").textContent=hero.isTouch?(C.hero.hintTouch||""):(C.hero.hint||"");
 hero.setImage(heroSrc());
}
function setTheme(t,save){
 document.documentElement.dataset.theme=t;
 document.querySelector('meta[name="theme-color"]').content=BG[t];
 $("themeBtn").innerHTML=t==="dark"?SUN:MOON;
 $("themeBtn").setAttribute("aria-label",t==="dark"?"Açık temaya geç":"Koyu temaya geç");
 if(save)try{localStorage.setItem("nd-theme",t)}catch(e){}
 renderBrand();
 if(hero){hero.setOptions({bg:NDLiquid.hexToRgb(BG[t],[.07,.07,.06])});hero.setImage(heroSrc())}
}
$("themeBtn").addEventListener("click",function(){
 var next=theme()==="dark"?"light":"dark";
 if(document.startViewTransition&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
  document.startViewTransition(function(){setTheme(next,true)});
 }else setTheme(next,true);
});

/* ── içerik ── */
function headlineHTML(text,accent){
 return String(text||"").split("\n").map(function(line){
  var a=(accent||"").trim(), i=a?line.indexOf(a):-1, html;
  if(i>=0)html=esc(line.slice(0,i))+'<span class="acc">'+esc(a)+'</span>'+esc(line.slice(i+a.length));
  else html=esc(line);
  return '<span class="sh-line">'+html+'</span>';
 }).join("");
}
function linkAttrs(h){return isExternal(h)?' target="_blank" rel="noopener"':""}
function cta(c,cls){
 if(!c||!c.label)return "";
 var h=safeHref(c.href)||"#";
 return '<a class="'+cls+'" href="'+esc(h)+'"'+linkAttrs(h)+'>'+esc(c.label)+ARROW+'</a>';
}
function renderBrand(){fillLogo($("brand"));fillLogo($("ftLogo"))}
function fillLogo(b){
 if(!b)return;
 var dark=theme()==="dark", logo=logoSrc(dark);
 var sz=Math.min(90,Math.max(18,+C.logoSize||34));
 b.style.setProperty("--logo-h",sz+"px");
 if(!logo){b.textContent=C.brand||"NearDiji";return}
 if((C.logoMode||"auto")==="mono"){
  b.innerHTML='<span class="logo-mono" role="img" aria-label="'+esc(C.brand)+'" style="aspect-ratio:'+(Math.min(20,Math.max(.2,+C.logoRatio||3)))+'"></span>';
  b.firstChild.style.setProperty("--logo-url",'url("'+String(logo).replace(/["\\\n]/g,"")+'")');
  return;
 }
 b.innerHTML='<img src="'+esc(logo)+'" alt="'+esc(C.brand)+'"'+(logoInvert(dark)?' class="inv"':"")+'>';
}
function waLink(n,text){
 var d=String(n||"").replace(/\D/g,"");if(!d)return "";
 if(d.indexOf("0")===0)d="90"+d.slice(1);else if(d.length===10&&d.charAt(0)==="5")d="90"+d;
 var t=String(text||"").trim();
 return "https://wa.me/"+d+(t?"?text="+encodeURIComponent(t):"");
}
function igLink(v){v=String(v||"").trim();if(!v)return "";if(/^https?:/i.test(v))return v;return "https://instagram.com/"+v.replace(/^@/,"")}
/* sosyal medya: tam adres ya da kullanıcı adı kabul edilir */
var SOCIAL=[
 ["instagram","Instagram","https://instagram.com/",'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.3" stroke="currentColor" stroke-width="1.8"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor"/></svg>'],
 ["linkedin","LinkedIn","https://linkedin.com/in/",'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>'],
 ["x","X","https://x.com/",'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z"/></svg>'],
 ["youtube","YouTube","https://youtube.com/@",'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>'],
 ["tiktok","TikTok","https://tiktok.com/@",'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>'],
 ["facebook","Facebook","https://facebook.com/",'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.03 24 18.06 24 12.07z"/></svg>']
];
function socialLink(v,base){
 v=String(v||"").trim();if(!v)return "";
 if(/^https?:\/\//i.test(v))return safeHref(v);
 if(/^(www\.)?[\w-]+\.[a-z]{2,}\//i.test(v))return "https://"+v.replace(/^https?:\/\//i,"");
 return base+encodeURIComponent(v.replace(/^@/,""));
}
var IC={
 phone:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11.5 11.5 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.1A1.5 1.5 0 0 1 5 3.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z"/></svg>',
 mail:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.5" stroke="currentColor" stroke-width="1.5"/></svg>'
};

function render(){
 var h=C.hero||{};
 if(C.seo&&C.seo.title)document.title=C.seo.title;
 if(C.seo&&C.seo.description){document.querySelector('meta[name="description"]').content=C.seo.description}
 renderBrand();
 $("backdrop").textContent=h.backdrop||"";
 $("eyebrow").textContent=h.eyebrow||"";
 $("eyebrow").hidden=!h.eyebrow;
 $("headline").innerHTML=headlineHTML(h.headline,h.accent);
 $("heroBody").textContent=h.body||"";
 $("heroCtas").innerHTML=cta(h.primary,"btn")+cta(h.secondary,"txt");

 $("projTitle").innerHTML=headlineHTML(C.projectsTitle,"");
 $("projIntro").textContent=C.projectsIntro||"";
 var list=(C.projects||[]).filter(function(p){return p&&!p.hidden&&p.name});
 renderProjects(list);

 var refs=(C.clients||[]).filter(function(c){return c&&c.logo});
 $("referanslar").hidden=!refs.length;$("navRef").hidden=!refs.length;
 $("refTitle").innerHTML=headlineHTML(C.clientsTitle||"Referanslar","");
 $("refIntro").textContent=C.clientsIntro||"";
 renderClients(refs);

 $("svcTitle").innerHTML=headlineHTML(C.servicesTitle,"");
 $("services").innerHTML=(C.services||[]).filter(function(s){return s&&s.title}).map(function(s,i){
  return '<div class="svc"><b>'+String(i+1).padStart(2,"0")+'</b><h3>'+esc(s.title)+'</h3><p>'+esc(s.desc)+'</p></div>';
 }).join("");

 $("stepsTitle").innerHTML=headlineHTML(C.stepsTitle,"");
 $("steps").innerHTML=(C.steps||[]).filter(function(s){return s&&s.title}).map(function(s){
  return '<li class="step"><h3>'+esc(s.title)+'</h3><p>'+esc(s.desc)+'</p></li>';
 }).join("");

 $("aboutTitle").textContent=C.aboutTitle||"Hakkında";
 $("aboutText").textContent=C.about||"";
 $("langs").textContent=C.languages||"";
 $("hakkinda").hidden=!C.about;

 var ct=C.contact||{}, wa=waLink(ct.whatsapp,ct.waText);
 $("contactTitle").innerHTML=headlineHTML(C.contactTitle,"");
 $("contactText").textContent=C.contactText||"";
 var main="";
 if(wa)main+='<a class="btn" href="'+esc(wa)+'" target="_blank" rel="noopener">WhatsApp\'tan yaz'+ARROW+'</a>';
 if(ct.email)main+='<a class="'+(wa?"txt":"btn")+'" href="mailto:'+esc(ct.email)+'">E-posta gönder'+ARROW+'</a>';
 if(!main)main='<a class="btn" href="/menu">Demo menüyü incele'+ARROW+'</a>';
 $("contactCtas").innerHTML=main;
 var chips=[];
 if(ct.phone)chips.push('<a class="chip" href="tel:'+esc(String(ct.phone).replace(/[^\d+]/g,""))+'">'+esc(ct.phone)+'</a>');
 if(ct.email)chips.push('<a class="chip" href="mailto:'+esc(ct.email)+'">'+esc(ct.email)+'</a>');
 if(ct.instagram)chips.push('<a class="chip" href="'+esc(igLink(ct.instagram))+'" target="_blank" rel="noopener">Instagram · '+esc(String(ct.instagram).replace(/^https?:\/\/(www\.)?instagram\.com\//,"@").replace(/^(?!@)/,"@"))+'</a>');
 if(ct.address)chips.push('<span class="chip">'+esc(ct.address)+'</span>');
 $("chips").innerHTML=chips.join("");

 renderFooter(ct,wa,list,refs);
 observeReveal();
}

/* ── alt bilgi ── */
function mapLink(ct){
 var m=safeHref(ct.mapUrl);if(m&&/^https?:/i.test(m))return m;
 return ct.address?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(ct.address):"";
}
function ftCol(id,cfg,items){
 var el=$(id), show=cfg&&cfg.show!==false&&items.length;
 el.hidden=!show;if(!show)return;
 el.querySelector("h2").textContent=cfg.title||"";
 el.querySelector("ul").innerHTML=items.map(function(x){
  return '<li><a href="'+esc(x[1])+'"'+linkAttrs(x[1])+'>'+esc(x[0])+'</a></li>';
 }).join("");
}
function renderFooter(ct,wa,projects,refs){
 var cols=C.footerCols||{};
 $("ftText").textContent=C.footerText||"";$("ftText").hidden=!C.footerText;

 var li=[];
 if(ct.phone)li.push('<li><a href="tel:'+esc(String(ct.phone).replace(/[^\d+]/g,""))+'">'+IC.phone+'<span>'+esc(ct.phone)+'</span></a></li>');
 if(wa)li.push('<li><a href="'+esc(wa)+'" target="_blank" rel="noopener">'+IC.wa+'<span>'+esc(ct.whatsapp)+'<small>WhatsApp</small></span></a></li>');
 if(ct.email)li.push('<li><a href="mailto:'+esc(ct.email)+'">'+IC.mail+'<span>'+esc(ct.email)+'</span></a></li>');
 if(ct.address){var ml=mapLink(ct);
  li.push('<li><a href="'+esc(ml)+'" target="_blank" rel="noopener">'+IC.pin+'<span>'+esc(ct.address)+'<small>Haritada aç</small></span></a></li>')}
 $("ftContact").innerHTML=li.join("");$("ftContact").hidden=!li.length;

 $("ftSocial").innerHTML=SOCIAL.map(function(s){
  var h=socialLink(ct[s[0]],s[2]);
  return h?'<a href="'+esc(h)+'" target="_blank" rel="noopener" aria-label="'+s[1]+'" title="'+s[1]+'">'+s[3]+'</a>':"";
 }).join("");

 var corp=[];
 if(projects.length)corp.push(["Projeler","#projeler"]);
 if(refs.length)corp.push(["Referanslar","#referanslar"]);
 if((C.steps||[]).some(function(x){return x&&x.title}))corp.push(["Süreç","#surec"]);
 if(C.about)corp.push([C.aboutTitle||"Hakkında","#hakkinda"]);
 corp.push(["İletişim","#iletisim"]);
 ftCol("ftCorp",cols.corporate,corp);
 ftCol("ftSvc",cols.services,(C.services||[]).filter(function(x){return x&&x.title}).map(function(x){return [x.title,"#hizmetler"]}));
 ftCol("ftDemo",cols.demos,(C.demos||[]).map(function(x){return x&&x.label&&safeHref(x.href)?[x.label,safeHref(x.href)]:null}).filter(Boolean));

 var pv=C.privacy||{};
 $("ftPrivacy").textContent=pv.title||"KVKK ve Gizlilik";
 $("ftPrivacy").hidden=!String(pv.text||"").trim();
 var name=String(C.footer||C.brand||"NearDiji").replace(/^\s*©\s*/,"").replace(/\s*©?\s*\d{4}\s*$/,"").trim()||C.brand;
 $("ftCopy").textContent="© "+new Date().getFullYear()+" "+name+". Tüm hakları saklıdır.";

 var fl=$("waFloat"), side=C.waFloat||"right", on=!!wa&&side!=="off";
 fl.hidden=!on;document.body.classList.toggle("has-wa",on);document.body.classList.toggle("wa-left",on&&side==="left");
 if(on){fl.href=wa;fl.className="wa-float"+(side==="left"?" left":"");if(!fl.firstChild)fl.innerHTML=IC.wa}
}
function openPrivacy(){
 var pv=C.privacy||{}, d=$("legal");
 $("legalTitle").textContent=pv.title||"KVKK ve Gizlilik";
 /* boş satırla ayrılan her blok paragraf; kısa ilk satır başlık olur */
 $("legalBody").innerHTML=String(pv.text||"").split(/\n\s*\n/).map(function(b){
  b=b.trim();if(!b)return "";
  var ls=b.split("\n");
  if(ls.length>1&&ls[0].length<=70&&!/[.,:;!]$/.test(ls[0].trim()))return '<p><b>'+esc(ls[0].trim())+'</b>'+esc(ls.slice(1).join("\n"))+'</p>';
  return '<p>'+esc(b)+'</p>';
 }).join("");
 if(typeof d.showModal==="function"){d.showModal()}else d.setAttribute("open","");
 $("legalBody").scrollTop=0;
}
$("ftPrivacy").addEventListener("click",openPrivacy);
$("legalClose").addEventListener("click",function(){var d=$("legal");if(d.close)d.close();else d.removeAttribute("open")});
$("legal").addEventListener("click",function(e){if(e.target===this&&this.close)this.close()});
if(location.hash==="#kvkk")setTimeout(openPrivacy,300);

/* ── projeler: dairesel karusel ── */
var STOCK={
 menu:"1414235077428-338989a2e8c0", restoran:"1517248135467-4c7edcad34c4", siparis:"1556910103-1c02745aae4d",
 ofis:"1497366216548-37526070297c", mobilya:"1555041469-a586c61ea9bc", katalog:"1524758631624-e2822e304c36",
 fiyat:"1586023492125-27b2c045efd7", ticaret:"1472851294608-062f824d29cc", firin:"1509440159596-0249088772ff",
 yazilim:"1551288049-bebda4e38f71"
};
function stockFor(p){
 var t=((p.tag||"")+" "+(p.name||"")+" "+(p.desc||"")).toLocaleLowerCase("tr");
 var k=/ekmek|fırın|kafe/.test(t)?"firin":/qr|menü/.test(t)?"menu":/sipariş takip|restaurant|restoran/.test(t)?(/menü/.test(t)?"menu":"restoran")
  :/e-ticaret|ticaret|mağaza/.test(t)?"ticaret":/ofis/.test(t)?"ofis":/fiyat/.test(t)?"fiyat":/sipariş|teklif/.test(t)?"siparis"
  :/mobilya/.test(t)?"mobilya":/katalog|şablon/.test(t)?"katalog":"yazilim";
 /* Görseller sitenin kendi sunucusunda (Unsplash lisansı); ziyaretçi dış sunucuya bağlanmaz */
 return "/assets/stok/"+k+".webp";
}
var CC={i:0,timer:null,list:[],hover:false,focus:false,bound:false,vis:false};
var CHEV_L='<svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var CHEV_R='<svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function renderProjects(list){
 var box=$("projects");
 CC.list=list;
 if(CC.i>=list.length)CC.i=0;
 if(!list.length){box.innerHTML="";ccStop();return}
 var fi=list.findIndex(function(p){return p.featured});
 if(!CC.bound&&fi>0)CC.i=fi;
 box.className="cc rv"+(box.classList.contains("in")?" in":"");
 box.setAttribute("tabindex","0");box.setAttribute("role","region");
 box.setAttribute("aria-roledescription","karusel");box.setAttribute("aria-label","Projeler");
 box.innerHTML='<div class="cc-stage" id="ccStage">'
  +list.map(function(p,i){
   var href=safeHref(p.link);
   return '<button type="button" class="cc-card'+(href?" has-link":"")+'" data-cc="'+i+'" aria-label="'+esc(p.name)+'">'
    +'<img src="'+esc(p.image||stockFor(p))+'" alt="" loading="'+(i<5?"eager":"lazy")+'" decoding="async" draggable="false">'
    +(p.tag?'<span class="cc-tag">'+esc(p.tag)+'</span>':"")
    +(p.status==="live"||p.status==="dev"?'<span class="cc-dot'+(p.status==="dev"?" dev":"")+'" aria-hidden="true"></span>':"")
    +'<span class="cc-name">'+esc(p.name)+'</span></button>';
  }).join("")
  +'<div class="cc-count" aria-hidden="true"><b id="ccNum"></b><span id="ccTot"></span></div></div>'
  +'<div class="cc-ctrl"><button type="button" class="cc-btn" id="ccPrev" aria-label="Önceki proje">'+CHEV_L+'</button>'
  +'<div class="cc-dots" id="ccDots">'+list.map(function(p,i){return '<button type="button" data-cc="'+i+'" aria-label="'+(i+1)+'. proje: '+esc(p.name)+'"></button>'}).join("")+'</div>'
  +'<button type="button" class="cc-btn" id="ccNext" aria-label="Sonraki proje">'+CHEV_R+'</button></div>'
  +'<div class="cc-info" id="ccInfo" aria-live="polite"></div>';
 if(!CC.bound)ccBind();
 ccLayout();ccInfo(false);ccStart();
}
function ccGo(n,user){
 var t=CC.list.length;if(!t)return;
 CC.i=((n%t)+t)%t;ccLayout();ccInfo(true);
 if(user)ccStart();
}
function ccLayout(){
 var st=$("ccStage");if(!st)return;
 var W=st.clientWidth||innerWidth, mob=W<640;
 var cw=Math.round(Math.min(300,Math.max(150,W*(mob?.5:.27)))), ch=Math.round(cw*2/3);
 var RX=Math.min(W*.36,420), RY=Math.round(ch*.95), pad=mob?14:22, ay=pad+ch/2+RY;
 var box=$("projects");box.style.setProperty("--cw",cw+"px");box.style.setProperty("--ch",ch+"px");box.style.setProperty("--ay",Math.round(ay)+"px");
 st.style.height=Math.round(ay+Math.max(ch*.3,mob?52:66))+"px";
 var t=CC.list.length, VIS=5, half=2;
 st.querySelectorAll(".cc-card").forEach(function(el){
  var i=+el.dataset.cc, off=i-CC.i;
  if(off>t/2)off-=t; if(off<-t/2)off+=t;
  var d=Math.abs(off), hidden=d>half;
  var ang=(Math.max(-half-1,Math.min(half+1,off))/VIS)*Math.PI;
  var x=Math.sin(ang)*RX, y=-Math.cos(ang)*RY;
  var sc=hidden?.6:Math.max(0,1-(d/(half+1))*.32), op=hidden?0:Math.max(.35,1-(d/(half+1))*.7);
  el.style.transform="translate("+x.toFixed(1)+"px,"+y.toFixed(1)+"px) scale("+sc.toFixed(3)+")";
  el.style.opacity=op;el.style.zIndex=10-d;el.style.pointerEvents=hidden?"none":"";
  el.tabIndex=hidden?-1:0;el.setAttribute("aria-hidden",hidden?"true":"false");
  el.classList.toggle("on",off===0);
 });
 $("ccNum").textContent=String(CC.i+1).padStart(2,"0");
 $("ccTot").textContent=String(t).padStart(2,"0")+" proje";
 $("ccDots").querySelectorAll("button").forEach(function(b,i){b.classList.toggle("on",i===CC.i);b.setAttribute("aria-current",i===CC.i?"true":"false")});
}
function ccInfo(anim){
 var p=CC.list[CC.i],el=$("ccInfo");if(!p||!el)return;
 var href=safeHref(p.link);
 var st=p.status==="dev"?'<span class="st dev">Geliştiriliyor</span>':p.status==="live"?'<span class="st">Yayında</span>':"";
 el.innerHTML='<div class="cc-meta">'+(p.tag?'<span>'+esc(p.tag)+'</span>':"")+(p.year?'<span>'+esc(p.year)+'</span>':"")+st+'</div>'
  +'<h3>'+esc(p.name)+'</h3>'+(p.desc?'<p>'+esc(p.desc)+'</p>':"")
  +(href?'<a class="txt" href="'+esc(href)+'"'+linkAttrs(href)+'>'+esc(p.linkLabel||"İncele")+ARROW+'</a>':"");
 if(anim){el.classList.remove("swap");void el.offsetWidth;el.classList.add("swap")}
}
function ccStop(){if(CC.timer){clearInterval(CC.timer);CC.timer=null}}
function ccStart(){
 ccStop();
 if(CC.list.length<2||!CC.vis||CC.hover||CC.focus||document.hidden||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 CC.timer=setInterval(function(){ccGo(CC.i+1)},4500);
}
function ccBind(){
 CC.bound=true;
 var box=$("projects");
 box.addEventListener("click",function(e){
  var b=e.target.closest("[data-cc]");
  if(e.target.closest("#ccPrev")){ccGo(CC.i-1,true);return}
  if(e.target.closest("#ccNext")){ccGo(CC.i+1,true);return}
  if(!b||CC.dragged)return;
  var i=+b.dataset.cc;
  if(i!==CC.i){ccGo(i,true);return}
  if(b.classList.contains("cc-card")){var h=safeHref((CC.list[i]||{}).link);if(h){if(isExternal(h))window.open(h,"_blank","noopener");else location.href=h}}
 });
 box.addEventListener("keydown",function(e){
  if(e.key==="ArrowLeft"){e.preventDefault();ccGo(CC.i-1,true)}
  else if(e.key==="ArrowRight"){e.preventDefault();ccGo(CC.i+1,true)}
 });
 box.addEventListener("mouseenter",function(){CC.hover=true;ccStop()});
 box.addEventListener("mouseleave",function(){CC.hover=false;ccStart()});
 box.addEventListener("focusin",function(){CC.focus=true;ccStop()});
 box.addEventListener("focusout",function(e){if(!box.contains(e.relatedTarget)){CC.focus=false;ccStart()}});
 /* kaydırma (dokunmatik + fare) */
 var sx=null,sy=0;
 box.addEventListener("pointerdown",function(e){if(!e.target.closest("#ccStage"))return;sx=e.clientX;sy=e.clientY;CC.dragged=false});
 window.addEventListener("pointerup",function(e){
  if(sx===null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){CC.dragged=true;ccGo(CC.i+(dx<0?1:-1),true);setTimeout(function(){CC.dragged=false},60)}
 });
 window.addEventListener("pointercancel",function(){sx=null});
 document.addEventListener("visibilitychange",function(){document.hidden?ccStop():ccStart()});
 /* sadece bölüm ekrandayken otomatik dön */
 if("IntersectionObserver" in window)new IntersectionObserver(function(es){CC.vis=es[0].isIntersecting;CC.vis?ccStart():ccStop()},{threshold:.35}).observe(box);
 else CC.vis=true;
 var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(ccLayout,120)});
}

/* ── referanslar: 3D coverflow ── */
var CF={i:0,list:[],timer:null,hover:false,focus:false,vis:false,bound:false,step:0};
function renderClients(list){
 var box=$("clients");CF.list=list;if(CF.i>=list.length)CF.i=0;
 if(!list.length){box.innerHTML="";cfStop();return}
 box.innerHTML='<div class="cf-stage" id="cfStage"><div class="cf-track">'
  +list.map(function(c,i){
   return '<button type="button" class="cf-slide" data-cf="'+i+'" aria-label="'+esc(c.name||"Firma")+'">'
    +'<img src="'+esc(c.logo)+'" alt="'+esc(c.name||"")+'" loading="lazy" decoding="async" draggable="false">'
    +(c.name?'<span>'+esc(c.name)+'</span>':"")+'</button>';
  }).join("")+'</div></div>'
  +(list.length>1?'<div class="cf-dots" id="cfDots">'+list.map(function(c,i){return '<button type="button" data-cf="'+i+'" aria-label="'+(i+1)+'. firma: '+esc(c.name||"")+'"></button>'}).join("")+'</div>':"");
 if(!CF.bound)cfBind();
 cfLayout(0);cfStart();
}
function cfLayout(drag){
 var st=$("cfStage");if(!st)return;
 var W=st.clientWidth||innerWidth, mob=W<640;
 var sw=Math.round(Math.min(280,Math.max(150,W*(mob?.52:.24)))), sh=Math.round(sw*.64);
 var box=$("clients");box.style.setProperty("--sw",sw+"px");box.style.setProperty("--sh",sh+"px");
 var step=CF.step=sw*(mob?.62:.72), t=CF.list.length;
 st.querySelectorAll(".cf-slide").forEach(function(el){
  var i=+el.dataset.cf, off=i-CF.i;
  if(t>2){if(off>t/2)off-=t;if(off<-t/2)off+=t}
  var o=off+(drag||0)/step, a=Math.abs(o), far=a>3.2;
  var rot=Math.max(-40,Math.min(40,-o*40)), z=-Math.min(a,3.5)*100;
  el.style.transform="translateX("+(o*step).toFixed(1)+"px) translateZ("+z.toFixed(0)+"px) rotateY("+rot.toFixed(1)+"deg)";
  el.style.opacity=far?0:1;el.style.zIndex=100-Math.round(a*10);
  el.style.pointerEvents=far?"none":"";el.tabIndex=far?-1:0;
  var sh_=Math.min(.45,a*.18);el.style.setProperty("--shl",o>0?sh_:0);el.style.setProperty("--shr",o<0?sh_:0);
  el.style.transition=drag?"none":"";
 });
 var d=$("cfDots");if(d)d.querySelectorAll("button").forEach(function(b,i){b.classList.toggle("on",i===CF.i)});
}
function cfGo(n,user){var t=CF.list.length;if(!t)return;CF.i=((n%t)+t)%t;cfLayout(0);if(user)cfStart()}
function cfStop(){if(CF.timer){clearInterval(CF.timer);CF.timer=null}}
function cfStart(){
 cfStop();
 if(CF.list.length<2||!CF.vis||CF.hover||CF.focus||document.hidden||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 CF.timer=setInterval(function(){cfGo(CF.i+1)},2200);
}
function cfBind(){
 CF.bound=true;var box=$("clients"),sx=null,dx=0,moved=false;
 box.addEventListener("click",function(e){
  var b=e.target.closest("[data-cf]");if(!b||moved)return;
  var i=+b.dataset.cf;
  if(i!==CF.i){cfGo(i,true);return}
  if(b.classList.contains("cf-slide")){var h=safeHref((CF.list[i]||{}).link);if(h)window.open(h,"_blank","noopener")}
 });
 box.addEventListener("keydown",function(e){
  if(e.key==="ArrowLeft"){e.preventDefault();cfGo(CF.i-1,true)}else if(e.key==="ArrowRight"){e.preventDefault();cfGo(CF.i+1,true)}
 });
 box.addEventListener("mouseenter",function(){CF.hover=true;cfStop()});
 box.addEventListener("mouseleave",function(){CF.hover=false;cfStart()});
 box.addEventListener("focusin",function(){CF.focus=true;cfStop()});
 box.addEventListener("focusout",function(e){if(!box.contains(e.relatedTarget)){CF.focus=false;cfStart()}});
 /* sürükle (fare + dokunmatik), bırakınca en yakın logoya otur */
 box.addEventListener("pointerdown",function(e){var st=e.target.closest("#cfStage");if(!st||e.button>0)return;sx=e.clientX;dx=0;moved=false;cfStop()});
 window.addEventListener("pointermove",function(e){
  if(sx===null)return;dx=e.clientX-sx;
  if(Math.abs(dx)>6){moved=true;var st=$("cfStage");if(st)st.classList.add("drag");cfLayout(dx)}
 });
 function end(){
  if(sx===null)return;sx=null;var st=$("cfStage");if(st)st.classList.remove("drag");
  if(moved){var n=Math.round(-dx/(CF.step||200));cfGo(CF.i+n,true);setTimeout(function(){moved=false},50)}else cfStart();
 }
 window.addEventListener("pointerup",end);window.addEventListener("pointercancel",end);
 document.addEventListener("visibilitychange",function(){document.hidden?cfStop():cfStart()});
 if("IntersectionObserver" in window)new IntersectionObserver(function(es){CF.vis=es[0].isIntersecting;CF.vis?cfStart():cfStop()},{threshold:.3}).observe(box);
 else CF.vis=true;
 var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){cfLayout(0)},120)});
}

/* ── kaydırınca giriş efekti ── */
var revealIO=("IntersectionObserver" in window)?new IntersectionObserver(function(es){
 es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");revealIO.unobserve(e.target)}});
},{rootMargin:"0px 0px -8% 0px"}):null;
function observeReveal(){
 document.querySelectorAll(".rv:not(.in)").forEach(function(el){if(revealIO)revealIO.observe(el);else el.classList.add("in")});
}

/* ── sunucudan güncel içerik ── */
function fetchContent(){
 return fetch(SB_URL+"/rest/v1/site_content?key=eq.main&select=data,updated_at",{headers:{apikey:SB_KEY}})
  .then(function(r){return r.ok?r.json():null})
  .then(function(rows){
   if(!rows||!rows[0]||!rows[0].data)return;
   var data=rows[0].data, s=JSON.stringify(data);
   if(cached&&JSON.stringify(cached)===s)return;
   cached=data;
   try{localStorage.setItem("nd-site",s)}catch(e){}
   var prevSrc=heroSrc();
   C=merge(D,data);
   if(!userTheme&&(C.theme==="light"||C.theme==="dark")&&C.theme!==theme())setTheme(C.theme,false);
   render();
   if(hero){
    hero.setOptions({strength:+C.hero.strength||1,liquid:+C.hero.liquid||1,density:+C.hero.density||1});
    if(heroSrc()!==prevSrc)hero.setImage(heroSrc());
    $("hint").textContent=hero.isTouch?(C.hero.hintTouch||""):(C.hero.hint||"");
   }
  }).catch(function(){});
}

/* ilk tema: kullanıcı seçmediyse sitenin varsayılanı */
var userTheme=null;try{userTheme=localStorage.getItem("nd-theme")}catch(e){}
setTheme(userTheme||C.theme||"dark",false);
render();
initHero();
fetchContent();
})();
