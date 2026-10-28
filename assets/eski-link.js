/* Eski linkler: neardiji.com/?r=xfirma → neardiji.com/xfirma */
(function(){
 try{
  var r=new URLSearchParams(location.search).get("r");
  if(r&&/^[a-z0-9-]+$/i.test(r))location.replace("/"+r.toLowerCase()+location.hash);
 }catch(e){}
 /* tema: kullanıcının seçimi > sitenin varsayılanı */
 try{
  var t=localStorage.getItem("nd-theme");
  if(!t){var c=JSON.parse(localStorage.getItem("nd-site")||"null");t=c&&c.theme}
  if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;
 }catch(e){}
})();
