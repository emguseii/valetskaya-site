/* v6 · Глаза в окне «Валя.exe» (23.11): новая серия из 11 кадров, assets/eyes/*.webp, 1172×294, уже выровнены по внутренним
   уголкам глаз. Направления — относительно ЭКРАНА: центр + 8 секторов (4 стороны и 4 диагонали) + closed для моргания.
   Веб — следят за курсором, мобилка — за скроллом. lookAt(el) — посмотреть на элемент, free() — отпустить,
   sleep(true/false) — закрыть/открыть (пока линии не вышли), destroy() — снять обработчики и таймеры.
   Опции: armOnHover — следить только после первого наведения; idle — мс без движения до «прямо»;
   blinkEvery — ровный ритм моргания; center: 'center' | 'center-relaxed' (вариант с прищуром, или ?eyes=relaxed). */
window.Eyes = function (img, mode, opt = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const CENTER = opt.center || (new URLSearchParams(location.search).get('eyes') === 'relaxed' ? 'center-relaxed' : 'center');
  const SECTORS = ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right']; // по 45°, 0° — вправо
  const NAMES = [CENTER, 'closed', ...SECTORS];
  const url = n => `assets/eyes/${n}.webp`;

  // 1. Предзагрузка и декодирование. До готовности кадра показываем центр; кадр с ошибкой → центр.
  const ready = {};
  NAMES.forEach(n => { const i = new Image(); i.src = url(n);
    (i.decode ? i.decode() : new Promise((ok, no) => { i.onload = ok; i.onerror = no; }))
      .then(() => { ready[n] = true; if (n === look) show(look); }, () => { ready[n] = false; }); });
  img.src = url(CENTER); img.dataset.n = CENTER;

  // Моргание — слой с закрытыми глазами поверх; короткое проявление (70 мс), держится ≈120 мс, без двойных зрачков
  const lid = new Image(); lid.src = url('closed'); lid.alt = ''; lid.setAttribute('aria-hidden', 'true'); lid.className = 'eyes__lid';
  Object.assign(lid.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', opacity: '0', pointerEvents: 'none', transition: 'opacity 70ms ease-in-out' });
  img.parentElement.insertBefore(lid, img.nextSibling);

  let look = CENTER, lock = false, asleep = false, armed = !opt.armOnHover, ptr = null, raf = 0, idleT, blinkT, holdT;
  const show = n => { if (!ready[n]) n = ready[CENTER] === false ? img.dataset.n : CENTER; // кадр не готов — центр
    if (img.dataset.n !== n) { img.dataset.n = n; img.src = url(n); } };
  const set = n => { look = n; show(n); };
  const lidOn = on => { lid.style.opacity = on ? '1' : '0'; };

  // 2–3. Направление от центра фото по актуальному DOMRect: небольшая центральная зона, 8 секторов, гистерезис на границах
  const dir = (x, y) => {
    const r = img.getBoundingClientRect(), dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    const k = look === CENTER ? 1.12 : .9; // из центра выходим чуть позже, возвращаемся чуть раньше
    if (Math.abs(dx) < r.width * .3 * k && Math.abs(dy) < r.height * .9 * k) return CENTER;
    const a = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360, cur = SECTORS.indexOf(look);
    if (cur >= 0) { const d = Math.abs(((a - cur * 45 + 540) % 360) - 180); if (d < 22.5 + 8) return look; } // держим сектор ещё 8° за границей
    return SECTORS[Math.round(a / 45) % 8];
  };
  const update = () => { raf = 0; if (!ptr || lock || !armed) return; set(dir(ptr.x, ptr.y)); };
  const queue = () => { if (!raf) raf = requestAnimationFrame(update); }; // кадр только по событию, без вечного цикла
  const idleRearm = () => { if (!opt.idle) return; clearTimeout(idleT); idleT = setTimeout(() => { if (!lock) set(CENTER); }, opt.idle); };

  const on = [];
  const listen = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); on.push([t, ev, fn, o]); };
  if (mode === 'cursor') {
    if (fine) {
      listen(window, 'mousemove', e => { ptr = { x: e.clientX, y: e.clientY }; if (armed && !lock) { queue(); idleRearm(); } }, { passive: true });
      listen(window, 'scroll', () => ptr && queue(), { passive: true });
      listen(window, 'resize', () => ptr && queue());
      // 6. Курсор ушёл со страницы — смотрим прямо
      listen(document, 'mouseout', e => { if (!e.relatedTarget) { ptr = null; if (!lock) set(CENTER); } });
    } // без точного указателя (тач) — не следим, взгляд прямо и предсказуем
  } else {
    // Мобилка: окно появляется снизу — смотрит вверх, в центре экрана — прямо, уходит наверх — смотрит вниз
    const onScroll = () => { if (lock) return; const r = img.getBoundingClientRect(), y = (r.top + r.height / 2) / innerHeight;
      set(y > .6 ? 'up' : y < .36 ? 'down' : CENTER); };
    listen(window, 'scroll', onScroll, { passive: true }); listen(window, 'resize', onScroll); onScroll();
  }

  // 5. Моргание: closed ≈120 мс, потом — последний актуальный взгляд (он обновляется и во время моргания). 7. Без reduce-motion.
  const blink = () => { clearTimeout(blinkT); if (reduce || document.hidden) return;
    blinkT = setTimeout(() => { if (!asleep) { lidOn(true); holdT = setTimeout(() => { if (!asleep) lidOn(false); blink(); }, 120); } else blink(); },
      opt.blinkEvery || 2800 + Math.random() * 3600); };
  blink();
  listen(document, 'visibilitychange', () => { if (document.hidden) { clearTimeout(blinkT); clearTimeout(holdT); clearTimeout(idleT); if (!asleep) lidOn(false); } else blink(); });

  return {
    lookAt(el) { armed = true; lock = true; const r = el.getBoundingClientRect(); set(dir(r.left + r.width / 2, r.top + r.height / 2)); idleRearm(); },
    free() { lock = false; if (mode === 'cursor') { if (armed && ptr) queue(); else set(CENTER); } else dispatchEvent(new Event('scroll')); },
    sleep(v) { asleep = v; lidOn(v); },
    destroy() { on.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o)); cancelAnimationFrame(raf);
      [idleT, blinkT, holdT].forEach(clearTimeout); lid.remove(); }
  };
};
