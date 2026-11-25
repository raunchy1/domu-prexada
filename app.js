(() => {
  // ---- menu telefono
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const closeMenu = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ---- prenotazione: date native -> formato del widget iReservation (GG/MM/AAAA)
  const form = document.getElementById('book-form');
  const inEl = document.getElementById('book-in');
  const outEl = document.getElementById('book-out');
  const irIn = document.getElementById('ir-in');
  const irOut = document.getElementById('ir-out');
  const iso = d => { const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; };
  const toIr = v => { const [y, m, d] = v.split('-'); return `${d}/${m}/${y}`; };
  const addDays = (v, n) => { const [y, m, d] = v.split('-').map(Number); return iso(new Date(y, m - 1, d + n)); };
  const today = iso(new Date());
  inEl.min = today;
  outEl.min = addDays(today, 1);
  inEl.addEventListener('change', () => {
    if (!inEl.value) return;
    const next = addDays(inEl.value, 1);
    outEl.min = next;
    if (!outEl.value || outEl.value <= inEl.value) outEl.value = next;
  });
  form.addEventListener('submit', e => {
    if (!inEl.value || !outEl.value) {
      e.preventDefault();
      (inEl.value ? outEl : inEl).focus();
      if (inEl.showPicker && !inEl.value) { try { inEl.showPicker(); } catch (_) {} }
      return;
    }
    irIn.value = toIr(inEl.value);
    irOut.value = toIr(outEl.value);
  });

  // ---- barra fissa su telefono: appare quando il modulo esce dallo schermo
  const stick = document.getElementById('stick');
  const card = document.querySelector('.book__card');
  const foot = document.querySelector('.foot');
  let cardGone = false, footIn = false;
  const upd = () => stick.classList.toggle('is-on', cardGone && !footIn);
  new IntersectionObserver(([e]) => { cardGone = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); }).observe(card);
  new IntersectionObserver(([e]) => { footIn = e.isIntersecting; upd(); }, { rootMargin: '0px 0px -40% 0px' }).observe(foot);

  // ---- galleria
  const range = (p, n) => Array.from({ length: n }, (_, i) => `img/${p}-${i}-800.webp`);
  const galleries = {
    c1: range('g-c1', 8), c2: range('g-c2', 6), c3: range('g-c3', 8), c4: range('g-c4', 8),
    casa: Array.from({ length: 10 }, (_, i) => `img/gal1-${i}-1200.webp`)
  };
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lb-img');
  const lbCount = document.getElementById('lb-count');
  let list = [], idx = 0, lastFocus = null;
  const show = () => { lbImg.src = list[idx]; lbImg.alt = `Foto ${idx + 1} di ${list.length}`; lbCount.textContent = `${idx + 1} / ${list.length}`; };
  const open = key => { list = galleries[key] || []; if (!list.length) return; idx = 0; lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; show(); document.getElementById('lb-close').focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; lbImg.removeAttribute('src'); if (lastFocus) lastFocus.focus(); };
  const step = d => { idx = (idx + d + list.length) % list.length; show(); };
  document.querySelectorAll('[data-gallery]').forEach(b => b.addEventListener('click', () => open(b.dataset.gallery)));
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => step(-1));
  document.getElementById('lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); x0 = null; });

  // ---- comparsa morbida delle sezioni
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('.section .wrap > *, .band__text, .final__in');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }
})();
