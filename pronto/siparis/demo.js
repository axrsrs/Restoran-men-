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
})();
