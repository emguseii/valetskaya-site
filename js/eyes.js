/* v5 · Глаза в окне «Валя.exe». Веб — следят за курсором, мобилка — за скроллом.
   lookAt(el) — посмотреть на элемент, free() — отпустить. */
window.Eyes = function (img, mode) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const src = {};
  ['default', 'up', 'down', 'left', 'right', 'close'].forEach(n => { const i = new Image(); i.src = `assets/eyes-${n}.webp`; src[n] = i.src; });
  let look = 'default', lock = false, blink = false;
  const show = n => { if (img.dataset.n !== n) { img.dataset.n = n; img.src = src[n]; } };
  const set = n => { look = n; if (!blink) show(n); };
  const box = () => img.getBoundingClientRect();
  const dir = (x, y) => {
    const r = box(), dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    if (Math.abs(dx) < r.width * .3 && Math.abs(dy) < r.height * .9) return 'default';
    return Math.abs(dx) > Math.abs(dy) * 1.25 ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  };
  if (mode === 'cursor') {
    addEventListener('mousemove', e => { if (!lock) set(dir(e.clientX, e.clientY)); }, { passive: true });
  } else {
    // Мобилка: окно появляется снизу — смотрит вверх, в центре экрана — прямо, уходит наверх — смотрит вниз
    const onScroll = () => { if (lock) return; const r = box(), y = (r.top + r.height / 2) / innerHeight;
      set(y > .6 ? 'up' : y < .36 ? 'down' : 'default'); };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
  }
  if (!reduce) (function b() {
    setTimeout(() => { blink = true; show('close'); setTimeout(() => { blink = false; show(look); b(); }, 140); }, 2800 + Math.random() * 3600);
  })();
  return {
    lookAt(el) { const r = el.getBoundingClientRect(); lock = true; set(dir(r.left + r.width / 2, r.top + r.height / 2)); },
    free() { lock = false; if (mode === 'cursor') set('default'); else dispatchEvent(new Event('scroll')); }
  };
};
