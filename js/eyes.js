/* v6 · Глаза в окне «Валя.exe» (23.11): новая серия из 11 кадров, assets/eyes/*.webp, 1172×294, уже выровнены по внутренним
   уголкам глаз. Направления — относительно ЭКРАНА: центр + 8 секторов (4 стороны и 4 диагонали) + closed для моргания.
   Веб — следят за курсором, мобилка — за скроллом. lookAt(el) — посмотреть на элемент, free() — отпустить,
   sleep(true/false) — закрыть/открыть (пока линии не вышли), destroy() — снять обработчики и таймеры.
   Опции: armOnHover — следить только после первого наведения; idle — мс без движения до «прямо»;
   blinkEvery — ровный ритм моргания; center: кадр «прямо» (по умолчанию center-relaxed; ?eyes=open — старый center, ?eyes=debug — карта зон). */
window.Eyes = function (img, mode, opt = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Прямо — кадр center-relaxed: в center.webp взгляд на самом деле вверх (её поправка 23.11 ~03:36); center.webp не используется
  const QE = new URLSearchParams(location.search).get('eyes');
  const CENTER = opt.center || (QE === 'open' ? 'center' : 'center-relaxed');
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

  // 2–3. Зоны (23.11, вариант «сетка 3×3»): экран делится прямоугольниками по краям фото с глазами.
  // Столбцы: левее фото / над-под фото / правее фото; ряды: выше фото / на уровне фото / ниже фото.
  // Центр — только сам кадр с глазами. Гистерезис: граница текущей зоны отодвигается на 24 px, чтобы кадр не дрожал.
  const H = 24;
  const cell = (x, y, cur) => { const r = img.parentElement.getBoundingClientRect(); // рамка окна, а не увеличенное фото
    const col = x < r.left - (cur && /left/.test(cur) ? -H : 0) ? 'left' : x > r.right + (cur && /right/.test(cur) ? -H : 0) ? 'right' : '';
    const row = y < r.top - (cur && /up/.test(cur) ? -H : 0) ? 'up' : y > r.bottom + (cur && /down/.test(cur) ? -H : 0) ? 'down' : '';
    return row && col ? row + '-' + col : row || col || CENTER; };
  const dir = (x, y) => cell(x, y, look === CENTER ? '' : look);
  // ?eyes=debug — карта зон поверх страницы (для проверки), с подписями кадров
  if (QE === 'debug') addEventListener('load', () => { const c = document.createElement('canvas'), W = innerWidth, HH = innerHeight;
    c.width = W; c.height = HH; Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: 99, pointerEvents: 'none', opacity: '.35' });
    const g = c.getContext('2d'), r = img.parentElement.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, col = ['#f44', '#fa0', '#ff0', '#4c4', '#0cf', '#48f', '#a4f', '#f4c'];
    for (let y = 0; y < HH; y += 4) for (let x = 0; x < W; x += 4) { const dx = x - cx, dy = y - cy;
      const n = cell(x, y, ''); g.fillStyle = n === CENTER ? '#fff' : col[SECTORS.indexOf(n)]; g.fillRect(x, y, 4, 4); }
    g.globalAlpha = 1; g.fillStyle = '#000'; g.font = '600 18px sans-serif';
    SECTORS.forEach((n, i) => { const t = i * 45 * Math.PI / 180; g.fillText(n, cx + Math.cos(t) * W * .38 - 30, cy + Math.sin(t) * innerHeight * .3); });
    document.body.append(c); });
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
