/* Bilinmeyen yollar 404.html'e düşer. Burada sadece gerçek kısa adresler yönlendirilir:
   neardiji.com/xfirma         → xfirma'nın menüsü (menu/ uygulaması açılır, adres kısa kalır)
   neardiji.com/menu/xfirma    → aynı menü
   neardiji.com/katalog/xfirma → xfirma'nın kataloğu
   Bunların dışındaki her adres 404 ekranını gösterir (assets/bulunamadi.js).
   Menü ya da katalog sunucuda yoksa ilgili uygulama da aynı 404 ekranını açar. */
(function(){
 var parts=location.pathname.split("/").filter(Boolean);
 if(/github\.io$/i.test(location.hostname))parts.shift();
 var a=(parts[0]||"").toLowerCase(), b=(parts[1]||"").toLowerCase();
 try{a=decodeURIComponent(a);b=decodeURIComponent(b)}catch(e){}
 var slug=/^[a-z0-9]+(-[a-z0-9]+)*$/;
 var ayrilmis=["menu","821","ammar","ayse","assets","site","katalog","tools","pronto","docs","cloudflare","404"];
 function git(u){window.NDYonlendiriliyor=true;location.replace(u)}
 if(parts.length===2&&a==="katalog"&&slug.test(b)){git("/katalog/?f="+encodeURIComponent(b)+location.hash);return}
 if(parts.length===2&&a==="menu"&&slug.test(b)){git("/menu/?r="+encodeURIComponent(b)+location.hash);return}
 if(parts.length===1&&slug.test(a)&&ayrilmis.indexOf(a)<0){git("/menu/?r="+encodeURIComponent(a)+location.hash);return}
})();
