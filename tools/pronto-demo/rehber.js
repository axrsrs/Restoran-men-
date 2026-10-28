/* =====================================================================
   PRONTO DEMO · REHBERLİK TURU (iki demo ortak)
   NearRehber.kur({ anahtar, ad, metin, hazir, adimlar })
   adimlar(): [{ sel, t, p, git }]  sel: virgüllü seçici, görünen ilk öğe hedeflenir
   git(): adımdan önce ekranı hazırlar (sayfa değiştirir, açık pencereyi kapatır)
   ===================================================================== */
(function () {
  'use strict';

  const css = `
#nearRehber{position:fixed;inset:0;z-index:9500;font-family:Manrope,Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.nr-spot{position:fixed;top:50%;left:50%;width:0;height:0;border-radius:14px;pointer-events:none;
 box-shadow:0 0 0 2px #E6B22A,0 0 0 9999px rgba(8,8,7,.72);
 transition:top .5s cubic-bezier(.65,0,.35,1),left .5s cubic-bezier(.65,0,.35,1),width .5s cubic-bezier(.65,0,.35,1),height .5s cubic-bezier(.65,0,.35,1)}
.nr-spot::after{content:"";position:absolute;inset:-2px;border-radius:inherit;border:2px solid #F3CF6A;animation:nrPulse 1.8s ease-out infinite}
@keyframes nrPulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}
.nr-tip{position:fixed;top:50%;left:50%;width:min(340px,calc(100vw - 24px));box-sizing:border-box;padding:18px;
 border:1px solid rgba(230,178,42,.45);border-radius:18px;background:#1b1a18;color:#f1ece2;box-shadow:0 22px 55px rgba(0,0,0,.55);
 transition:top .5s cubic-bezier(.65,0,.35,1),left .5s cubic-bezier(.65,0,.35,1);animation:nrIn .35s cubic-bezier(.2,.8,.2,1)}
@keyframes nrIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.nr-tip.nr-yeni .nr-govde{animation:nrMetin .35s ease}
@keyframes nrMetin{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
.nr-ust{display:flex;align-items:center;gap:8px;color:#F3CF6A;font-size:11px;font-weight:800;letter-spacing:.02em}
.nr-ust b{margin-left:auto;font-weight:700;color:#8f897d}
.nr-tip h3{margin:5px 0 6px;font-size:18px;line-height:1.25;font-weight:800;color:#fff}
.nr-tip p{margin:0;color:#cfc8ba;font-size:13.5px;line-height:1.55}
.nr-dots{display:flex;flex-wrap:wrap;gap:5px;margin:14px 0}
.nr-dots i{width:6px;height:6px;border-radius:9px;background:#3b3a37;transition:width .3s,background .3s}
.nr-dots i.on{width:20px;background:#E6B22A}
.nr-dots i.gecti{background:#7a6526}
.nr-nav{display:flex;align-items:center;gap:8px}
.nr-btn{min-height:44px;padding:0 16px;border-radius:12px;border:1px solid #34332f;background:#272624;color:#f1ece2;font:800 13px/1 inherit;font-family:inherit;cursor:pointer}
.nr-btn:hover{background:#312f2c}
.nr-btn.altin{background:#E6B22A;border-color:#E6B22A;color:#1b1407}
.nr-btn.altin:hover{background:#F3CF6A}
.nr-btn:focus-visible,.nr-gec:focus-visible{outline:2px solid #F3CF6A;outline-offset:2px}
.nr-gec{margin-right:auto;border:0;background:none;color:#9b9486;font:800 12px/1 inherit;font-family:inherit;padding:12px 2px;cursor:pointer}
.nr-gec:hover{color:#f1ece2}
.nr-hos{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(8,8,7,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.nr-kart{width:min(420px,100%);box-sizing:border-box;padding:30px 22px 20px;text-align:center;border-radius:24px;
 border:1px solid rgba(230,178,42,.4);background:#1b1a18;color:#f1ece2;display:grid;justify-items:center;gap:10px;
 animation:nrKart .5s cubic-bezier(.2,.9,.3,1.25)}
@keyframes nrKart{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
.nr-kart h3{margin:4px 0 0;font-size:25px;font-weight:800;color:#fff}
.nr-kart p{margin:0;color:#c9c1b2;font-size:14px;line-height:1.55}
.nr-kart ul{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:7px;width:100%;text-align:left}
.nr-kart li{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:#232220;color:#d9d2c4;font-size:13px;line-height:1.45;
 opacity:0;transform:translateY(6px);animation:nrSatir .4s ease forwards}
.nr-kart li:nth-child(1){animation-delay:.9s}.nr-kart li:nth-child(2){animation-delay:1.02s}.nr-kart li:nth-child(3){animation-delay:1.14s}
.nr-kart li i{flex:none;width:20px;height:20px;border-radius:50%;background:rgba(230,178,42,.16);color:#F3CF6A;display:grid;place-items:center;font:800 11px/1 inherit;font-style:normal}
@keyframes nrSatir{to{opacity:1;transform:none}}
.nr-kart .nr-btn{width:100%;min-height:50px;font-size:14px;margin-top:8px}
.nr-amblem{width:86px;height:86px}
.nr-amblem circle{fill:none;stroke:#E6B22A;stroke-width:2;stroke-dasharray:240;stroke-dashoffset:240;animation:nrCiz 1.1s .15s ease forwards}
.nr-amblem path{fill:none;stroke:#F3CF6A;stroke-width:3.2;stroke-linecap:square;stroke-dasharray:120;stroke-dashoffset:120;animation:nrCiz .9s .7s ease forwards}
@keyframes nrCiz{to{stroke-dashoffset:0}}
.near-demo [data-near-rehber]{gap:6px}
.near-demo [data-near-rehber] svg{width:14px;height:14px}
@media(max-width:760px){
 .nr-tip{padding:16px}
 .nr-tip h3{font-size:17px}
 .near-demo [data-near-rehber] span{display:none}
 .near-demo [data-near-rehber]{padding:0 9px!important}
}
@media(prefers-reduced-motion:reduce){
 .nr-spot,.nr-tip{transition:none}
 .nr-spot::after,.nr-tip,.nr-kart,.nr-tip.nr-yeni .nr-govde{animation:none}
 .nr-kart li{animation:none;opacity:1;transform:none}
 .nr-amblem circle,.nr-amblem path{animation:none;stroke-dashoffset:0}
}
@media print{#nearRehber{display:none!important}}`;

  let ayar = null, durum = null;
  const bekle = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const oku = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const yaz = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const anahtar = () => 'near_pronto_rehber_' + ayar.anahtar;

  function katman() {
    let k = document.getElementById('nearRehber');
    if (!k) { k = document.createElement('div'); k.id = 'nearRehber'; document.body.appendChild(k); }
    return k;
  }

  function hedef(adim) {
    if (!adim || !adim.sel) return null;
    return [...document.querySelectorAll(adim.sel)].find(e => {
      if (!e.getClientRects().length) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
    }) || null;
  }

  function hosgeldin() {
    if (durum) return;
    durum = { hos: true };
    const m = ayar.maddeler || [];
    katman().innerHTML = `
      <div class="nr-hos" role="dialog" aria-modal="true" aria-labelledby="nrMerhaba">
        <div class="nr-kart">
          <svg class="nr-amblem" viewBox="0 0 86 86" aria-hidden="true"><circle cx="43" cy="43" r="38"/><path d="M38 58H26V28h34v30L33 37"/></svg>
          <h3 id="nrMerhaba">${esc(ayar.ad)}</h3>
          <p>${esc(ayar.metin)}</p>
          ${m.length ? `<ul>${m.map((x, i) => `<li><i>${i + 1}</i><span>${esc(x)}</span></li>`).join('')}</ul>` : ''}
          <button type="button" class="nr-btn altin" data-nr="basla">Turu başlat</button>
          <button type="button" class="nr-gec" data-nr="sonra" style="margin:0">Sonra, kendim bakarım</button>
        </div>
      </div>`;
    const k = katman();
    k.querySelector('[data-nr=basla]').onclick = () => { if (ayar.temizle) { try { ayar.temizle(); } catch (e) {} } baslat(); };
    k.querySelector('[data-nr=sonra]').onclick = () => { yaz(anahtar(), 'sonra'); bitir(); };
    setTimeout(() => k.querySelector('[data-nr=basla]')?.focus(), 60);
  }

  function baslat() {
    const adimlar = ayar.adimlar();
    durum = { i: -1, adimlar, kosu: 0 };
    katman().innerHTML = `
      <div class="nr-spot" id="nrSpot"></div>
      <div class="nr-tip" id="nrTip" role="dialog" aria-modal="true" aria-labelledby="nrBaslik" aria-live="polite">
        <div class="nr-govde">
          <div class="nr-ust"><span id="nrBolum"></span><b id="nrNo"></b></div>
          <h3 id="nrBaslik"></h3>
          <p id="nrMetin"></p>
        </div>
        <div class="nr-dots">${adimlar.map(() => '<i></i>').join('')}</div>
        <div class="nr-nav">
          <button type="button" class="nr-gec" data-nr="bitir">Turu bitir</button>
          <button type="button" class="nr-btn" data-nr="geri">Geri</button>
          <button type="button" class="nr-btn altin" data-nr="ileri">İleri</button>
        </div>
      </div>`;
    const k = katman();
    k.querySelector('[data-nr=bitir]').onclick = () => bitir(true);
    k.querySelector('[data-nr=geri]').onclick = () => git(durum.i - 1, -1);
    k.querySelector('[data-nr=ileri]').onclick = () => {
      if (durum.i >= durum.adimlar.length - 1) bitir(true); else git(durum.i + 1, 1);
    };
    git(0, 1);
  }

  async function git(i, yon) {
    if (!durum || durum.hos) return;
    const kosu = ++durum.kosu;
    const ad = durum.adimlar;
    let el = null, yeniSayfa = false;
    while (i >= 0 && i < ad.length) {
      const a = ad[i];
      yeniSayfa = a.sayfa !== durum.sayfa;
      if (a.git) { try { await a.git(); } catch (e) { console.warn('rehber', e); } }
      durum.sayfa = a.sayfa;
      /* sayfa değiştiyse çizimi bekle; aynı sayfada olmayan öğe hemen atlanır */
      for (let n = 0, son = yeniSayfa ? 16 : 3; n < son && !(el = hedef(a)); n++) await bekle(100);
      if (kosu !== durum?.kosu) return;
      if (el) break;
      i += yon;
    }
    if (!durum) return;
    if (i < 0) { i = 0; el = hedef(ad[0]); }
    if (i >= ad.length) { bitir(true); return; }
    durum.i = i;
    const a = ad[i];
    if (yeniSayfa) await bekle(260);
    if (kosu !== durum?.kosu) return;
    el = hedef(a) || el;
    if (el) {
      /* büyük öğe üste hizalanır ki altta kart için yer kalsın */
      const buyuk = el.getBoundingClientRect().height > window.innerHeight * .4;
      const eski = el.style.scrollMarginTop;
      if (buyuk) el.style.scrollMarginTop = '56px';
      el.scrollIntoView({ block: buyuk ? 'start' : 'center', inline: 'nearest', behavior: 'auto' });
      el.style.scrollMarginTop = eski;
    }

    const k = katman(), tip = k.querySelector('#nrTip');
    tip.classList.remove('nr-yeni'); void tip.offsetWidth; tip.classList.add('nr-yeni');
    k.querySelector('#nrBolum').textContent = a.bolum || '';
    k.querySelector('#nrNo').textContent = (i + 1) + ' / ' + ad.length;
    k.querySelector('#nrBaslik').textContent = a.t;
    k.querySelector('#nrMetin').textContent = a.p;
    k.querySelector('[data-nr=geri]').style.visibility = i ? 'visible' : 'hidden';
    k.querySelector('[data-nr=ileri]').textContent = i === ad.length - 1 ? 'Bitir' : 'İleri';
    k.querySelectorAll('.nr-dots i').forEach((d, n) => { d.classList.toggle('on', n === i); d.classList.toggle('gecti', n < i); });
    requestAnimationFrame(yerlestir);
    setTimeout(yerlestir, 120);
    if (!k.contains(document.activeElement)) k.querySelector('[data-nr=ileri]')?.focus({ preventScroll: true });
  }

  function yerlestir() {
    if (!durum || durum.hos) return;
    const spot = document.getElementById('nrSpot'), tip = document.getElementById('nrTip');
    if (!spot || !tip) return;
    const el = hedef(durum.adimlar[durum.i]);
    const W = window.innerWidth, H = window.innerHeight;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    if (!el) {
      spot.style.cssText = `top:${H / 2}px;left:${W / 2}px;width:0;height:0`;
      tip.style.top = Math.max(12, (H - th) / 2) + 'px';
      tip.style.left = Math.max(12, (W - tw) / 2) + 'px';
      return;
    }
    const r = el.getBoundingClientRect(), pad = 6;
    const top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad);
    const width = Math.max(0, Math.min(W - 4, r.right + pad) - left);
    const height = Math.max(0, Math.min(H - 4, r.bottom + pad) - top);
    spot.style.top = top + 'px'; spot.style.left = left + 'px';
    spot.style.width = width + 'px'; spot.style.height = height + 'px';

    let tTop, tLeft;
    const alt = H - (top + height), ust = top;
    if (height > H * .5 && (left + width + 14 + tw <= W - 12 || left - tw - 14 >= 12)) {
      /* uzun öğe (yan menü): yanına koy */
      tTop = Math.max(12, Math.min(H - th - 12, top + 20));
      tLeft = left + width + 14 + tw <= W - 12 ? left + width + 14 : left - tw - 14;
    } else if (alt >= th + 24) {
      tTop = top + height + 12;
      tLeft = left + width / 2 - tw / 2;
    } else if (ust >= th + 24) {
      tTop = top - th - 12;
      tLeft = left + width / 2 - tw / 2;
    } else {
      /* sığmıyor: öğenin üstüne, ekranın alt köşesine */
      tTop = H - th - 16;
      tLeft = W - tw - 16;
    }
    tip.style.top = Math.max(12, tTop) + 'px';
    tip.style.left = Math.max(12, Math.min(W - tw - 12, tLeft)) + 'px';
  }

  function bitir(tamam) {
    const hos = durum?.hos;
    durum = null;
    document.getElementById('nearRehber')?.remove();
    if (tamam) yaz(anahtar(), 'bitti');
    if (!hos && ayar.son) { try { ayar.son(); } catch (e) {} }
  }

  document.addEventListener('keydown', e => {
    if (!durum) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); bitir(!durum.hos); return; }
    if (durum.hos) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); e.stopImmediatePropagation(); document.querySelector('#nearRehber [data-nr=ileri]')?.click(); }
    if (e.key === 'ArrowLeft' && durum.i > 0) { e.preventDefault(); e.stopImmediatePropagation(); document.querySelector('#nearRehber [data-nr=geri]')?.click(); }
  }, true);
  window.addEventListener('resize', () => requestAnimationFrame(yerlestir));
  window.addEventListener('scroll', () => { if (durum && !durum.hos) yerlestir(); }, true);

  function dugme() {
    const bar = document.querySelector('.near-demo');
    if (!bar || bar.querySelector('[data-near-rehber]')) return !!bar;
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('data-near-rehber', ''); b.setAttribute('aria-label', 'Rehberi başlat');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4M12 16.8v.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Rehber</span>';
    b.addEventListener('click', () => { if (durum) bitir(false); if (ayar.temizle) { try { ayar.temizle(); } catch (e) {} } baslat(); });
    const sifirla = bar.querySelector('[data-near-sifirla]');
    bar.insertBefore(b, sifirla || null);
    return true;
  }

  window.NearRehber = {
    kur(a) {
      ayar = a;
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      let n = 0;
      const dene = () => {
        const tamam = dugme() && (!a.hazir || a.hazir());
        if (!tamam) { if (++n < 100) setTimeout(dene, 150); return; }
        if (!oku(anahtar()) && !/[?&]rehber=yok\b/.test(location.search)) setTimeout(hosgeldin, 700);
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dene); else dene();
    },
    baslat: () => baslat(),
    acik: () => !!durum
  };
})();
