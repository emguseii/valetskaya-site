/* v5 · Глаза в окне «Валя.exe». Веб — следят за курсором, мобилка — за скроллом.
   lookAt(el) — посмотреть на элемент, free() — отпустить. */
window.Eyes = function (img, mode, opt = {}) {
  // opt.hoverOnly — не следить за курсором, смотреть только на lookAt(); opt.idle — мс бездействия до «прямо»;
  // opt.blinkEvery — ровный ритм моргания (мс). sleep(true/false) — закрыть/открыть глаза (пока линии не вышли).
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const src = {};
  ['default', 'up', 'down', 'left', 'right', 'close'].forEach(n => { const i = new Image(); i.src = `assets/eyes-${n}.webp`; src[n] = i.src; });
  let look = 'default', lock = false, blink = false, asleep = false, idleT, target = null, armed = !opt.armOnHover;
  // Мягкое моргание (23.11): поверх глаз — слой с закрытыми глазами, он плавно проявляется и гаснет (≈ 0,26 с), без резкой подмены кадра
  const lid = new Image(); lid.src = src.close; lid.alt = ''; lid.setAttribute('aria-hidden', 'true'); lid.className = 'eyes__lid';
  Object.assign(lid.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', opacity: '0', pointerEvents: 'none', transition: 'opacity 110ms ease-in-out' });
  img.parentElement.insertBefore(lid, img.nextSibling);
  const show = n => { if (asleep) n = 'close'; if (img.dataset.n !== n) { img.dataset.n = n; img.src = src[n]; } };
  const set = n => { look = n; if (!blink) show(n); };
  const box = () => img.getBoundingClientRect();
  const dir = (x, y) => {
    const r = box(), dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    if (Math.abs(dx) < r.width * .3 && Math.abs(dy) < r.height * .9) return 'default';
    return Math.abs(dx) > Math.abs(dy) * 1.25 ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  };
  const idleRearm = () => { if (!opt.idle) return; clearTimeout(idleT); idleT = setTimeout(() => set('default'), opt.idle); };
  if (mode === 'cursor') {
    // armOnHover: пока ни разу не навели на папку/бирку — смотрят прямо; после первого наведения следят за курсором.
    // idle: мышь замерла на N мс — глаза возвращаются прямо, с первым движением снова следят.
    addEventListener('mousemove', e => { if (!armed) return; if (!lock) set(dir(e.clientX, e.clientY)); idleRearm(); }, { passive: true });
  } else {
    // Мобилка: окно появляется снизу — смотрит вверх, в центре экрана — прямо, уходит наверх — смотрит вниз
    const onScroll = () => { if (lock) return; const r = box(), y = (r.top + r.height / 2) / innerHeight;
      set(y > .6 ? 'up' : y < .36 ? 'down' : 'default'); };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
  }
  if (!reduce) (function b() {
    setTimeout(() => { if (asleep) return b(); blink = true; lid.style.opacity = '1'; setTimeout(() => { lid.style.opacity = '0'; blink = false; b(); }, 150); }, opt.blinkEvery || 2800 + Math.random() * 3600);
  })();
  return {
    lookAt(el) { armed = true; const r = el.getBoundingClientRect(); lock = true; target = el; set(dir(r.left + r.width / 2, r.top + r.height / 2)); idleRearm(); },
    sleep(on) { asleep = on; show(look); },
    free() { lock = false; target = null; if (mode === 'cursor') { if (!armed) set('default'); } else dispatchEvent(new Event('scroll')); }
  };
};
