/* GitHub Pages bilinmeyen yolları bu sayfaya gönderir:
   neardiji.com/xfirma → xfirma'nın menüsü (menu/ uygulaması açılır, adres kısa kalır) */
(function(){
 var parts=location.pathname.split("/").filter(Boolean);
 if(/github\.io$/i.test(location.hostname))parts.shift();
 var a=(parts[0]||"").toLowerCase(), b=(parts[1]||"").toLowerCase();
 try{a=decodeURIComponent(a);b=decodeURIComponent(b)}catch(e){}
 var slug=/^[a-z0-9]+(-[a-z0-9]+)*$/;
 if(a==="katalog"&&slug.test(b)){location.replace("/katalog/?f="+encodeURIComponent(b)+location.hash);return}
 if(a==="menu"&&slug.test(b)){location.replace("/menu/?r="+encodeURIComponent(b)+location.hash);return}
 if(slug.test(a)&&["menu","821","ammar","ayse","assets","site","katalog","tools"].indexOf(a)<0){location.replace("/menu/?r="+encodeURIComponent(a)+location.hash);return}
 location.replace("/");
})();
