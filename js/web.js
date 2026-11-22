/* v6 · Web: герой (линии из окна, раскрытие папки), небо, кейсы, растащи, язычки, модалка кейса */
document.documentElement.classList.add('js');
{
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement, stage = $('#stage');
  const clamp = v => Math.max(0, Math.min(1, v));
  // Одна версия сайта (v7). «Минимал», варианты неба и ачивка — в архиве prototype-v6.
  const toastEl = $('.toast'); let tt;
  const toast = m => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2400); };

  // Сцена героя целиком в экран. Тот же коэффициент --s масштабирует все блоки ниже (см. .flow в web.css),
  // чтобы пропорции героя и кейсов не расходились при любом размере окна и масштабе браузера
  const fit = () => root.style.setProperty('--s', Math.min(innerWidth / 1440, innerHeight / 900, 1.25).toFixed(4));
  fit(); addEventListener('resize', fit);

  const eyes = Eyes($('#eyes'), 'cursor');
  const paths = $$('.lines path'), lineFor = id => paths.find(p => p.dataset.to === id);

  /* ── Загрузка. Ориентир Apple HIG: интерфейсное движение 200–500 мс, короткий шаг каскада,
     всё появление ≈ 1,3 с вместо прежних 3. Линии выходят из окна, узлы встают на концах пружиной. */
  const T = { name: 0, win: 120, tip: 320, lines: 360, step: 70, line: 640 };
  const show = (el, t) => setTimeout(() => { el.classList.add('in');
    el.addEventListener('animationend', () => { el.classList.remove('in'); el.classList.add('shown'); }, { once: true }); }, t);
  const intro = () => {
    if (reduce) { $$('.name,.tip,.win,.node').forEach(n => n.classList.add('shown')); return; }
    show($('.name'), T.name); show($('.win'), T.win); show($('.tip'), T.tip);
    ['t2', 'f2', 'f1', 't3', 'f3', 't1'].forEach((id, i) => {
      const p = lineFor(id), delay = T.lines + i * T.step, dur = T.line + Math.min(220, p.getTotalLength() * .25);
      p.animate([{ strokeDashoffset: p.classList.contains('rev') ? -1 : 1 }, { strokeDashoffset: 0 }], { duration: dur, delay, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
      show($('#' + id), delay + dur * .7);
    });
    setTimeout(() => paths.forEach(p => { p.getAnimations().forEach(a => { a.commitStyles?.(); a.cancel(); }); p.style.strokeDasharray = 'none'; }), T.lines + 6 * T.step + T.line + 400);
  };
  if (document.readyState === 'complete') intro(); else addEventListener('load', intro);

  /* ── Верёвки: берём ТВОЮ кривую как точки и при перетаскивании сдвигаем только конец у узла,
     плавно затухая к окну. Форма не ломается, верёвка просто тянется. */
  const S = () => parseFloat(getComputedStyle(root).getPropertyValue('--s')) || 1;
  const svg = $('.lines');
  const rope = {};
  const sample = p => { const m = p.getCTM(), L = p.getTotalLength(), N = 48, pts = [];
    for (let i = 0; i <= N; i++) { const q = p.getPointAtLength(L * i / N); pts.push(new DOMPoint(q.x, q.y).matrixTransform(m)); }
    const node = $('#' + p.dataset.to), nb = node.getBoundingClientRect(), sb = svg.getBoundingClientRect(), k = S();
    const c = { x: (nb.left + nb.width / 2 - sb.left) / k, y: (nb.top + nb.height / 2 - sb.top) / k };
    const d0 = Math.hypot(pts[0].x - c.x, pts[0].y - c.y), d1 = Math.hypot(pts[N].x - c.x, pts[N].y - c.y);
    return { pts: d0 < d1 ? pts.slice().reverse() : pts, d: p.getAttribute('d'), tr: p.getAttribute('transform') }; };
  const smooth = t => t * t * (3 - 2 * t);
  const stretch = (p, r, dx, dy) => { const n = r.pts.length - 1;
    p.removeAttribute('transform');
    p.setAttribute('d', r.pts.map((q, i) => { const w = smooth(i / n); return (i ? 'L' : 'M') + (q.x + dx * w).toFixed(1) + ' ' + (q.y + dy * w).toFixed(1); }).join('')); };
  const restore = (p, r) => { p.setAttribute('d', r.d); r.tr && p.setAttribute('transform', r.tr); };
  // Пружина как в iOS: response 0.45 с, damping 0.72 — один мягкий перелёт и на место
  const spring = (from, onStep, done) => { if (reduce) { onStep(0, 0); done(); return; }
    let x = from.x, y = from.y, vx = 0, vy = 0, last = performance.now(); const w = 2 * Math.PI / .45, z = .72;
    (function f(now) { const dt = Math.min(.032, (now - last) / 1000); last = now;
      const ax = -w * w * x - 2 * z * w * vx, ay = -w * w * y - 2 * z * w * vy; vx += ax * dt; vy += ay * dt; x += vx * dt; y += vy * dt;
      onStep(x, y); if (Math.hypot(x, y) > .3 || Math.hypot(vx, vy) > 3) requestAnimationFrame(f); else { onStep(0, 0); done(); } })(last); };

  /* ── Наведение: только папки раскрываются и растворяют остальное. Бирки — без растворения.
     Небольшая задержка намерения (90 мс), чтобы не мигало при проходе курсора. */
  let cur = null, offT, intentT, dragging = false;
  const open = n => { clearTimeout(offT); if (dragging || cur === n) return;
    cur && cur.classList.remove('on'); paths.forEach(p => p.classList.remove('on'));
    cur = n; n.classList.add('on'); lineFor(n.id)?.classList.add('on'); stage.classList.add('focus'); eyes.lookAt(n); };
  const closeF = (now) => { clearTimeout(intentT); const go = () => { cur && cur.classList.remove('on'); paths.forEach(p => p.classList.remove('on')); cur = null; stage.classList.remove('focus'); eyes.free(); };
    if (now) go(); else offT = setTimeout(go, 80); };
  $$('.folder').forEach(n => {
    n.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; clearTimeout(intentT); intentT = setTimeout(() => open(n), 90); });
    n.addEventListener('pointerleave', () => closeF());
    n.addEventListener('focus', () => open(n)); n.addEventListener('blur', () => closeF());
  });
  $$('.tag').forEach(n => { n.addEventListener('pointerenter', () => !dragging && eyes.lookAt(n)); n.addEventListener('pointerleave', () => !dragging && eyes.free()); });

  /* ── Перетаскивание папок и бирок. Нажал и потянул → раскрытая папка сворачивается, тащим маленькую,
     без растворения соседей. Отпустил → пружина на место. Просто клик по папке → кейс. */
  let moved = false;
  $$('.node').forEach(n => {
    // папка — ссылка: отключаем родное перетаскивание ссылок/картинок, иначе браузер обрывает наше
    n.setAttribute('draggable', 'false'); $$('img', n).forEach(i => i.setAttribute('draggable', 'false'));
    n.addEventListener('dragstart', e => e.preventDefault());
    let sx, sy, p, r, dx = 0, dy = 0, lastX = 0;
    n.addEventListener('pointerdown', e => { if (e.button > 0 || !n.classList.contains('shown')) return;
      p = lineFor(n.id); sx = e.clientX; sy = e.clientY; dx = dy = 0; moved = false; lastX = e.clientX; n.setPointerCapture(e.pointerId); });
    n.addEventListener('pointermove', e => { if (!n.hasPointerCapture(e.pointerId)) return;
      dx = (e.clientX - sx) / S(); dy = (e.clientY - sy) / S();
      if (!moved && Math.hypot(dx, dy) > 6) { moved = dragging = true; closeF(true); n.classList.add('drag'); r = p && sample(p); stage.classList.add('dragging'); }
      if (!moved) return;
      const v = Math.max(-10, Math.min(10, (e.clientX - lastX) * .5)); lastX = e.clientX;
      n.style.translate = `${dx}px ${dy}px`; n.style.setProperty('--sway', v + 'deg'); if (p) stretch(p, r, dx, dy); });
    const up = e => { if (!n.hasPointerCapture(e.pointerId)) return; n.releasePointerCapture(e.pointerId);
      if (!moved) return; n.classList.remove('drag'); n.style.setProperty('--sway', '0deg');
      spring({ x: dx, y: dy }, (x, y) => { n.style.translate = `${x}px ${y}px`; if (p) stretch(p, r, x, y); },
        () => { n.style.translate = ''; if (p) restore(p, r); dragging = false; stage.classList.remove('dragging'); }); };
    n.addEventListener('pointerup', up); n.addEventListener('pointercancel', up);
    n.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; } }, true);
  });


  // Карточки кейсов: лаймовый чип едет за курсором, соседи не размываются
  $$('.case').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect();
    c.style.setProperty('--px', Math.min(r.width / S() - 170, (e.clientX - r.left) / S() + 14) + 'px'); c.style.setProperty('--py', Math.min(r.height / S() - 44, (e.clientY - r.top) / S() + 14) + 'px'); }));

  // Небо: одна палитра «мягкий день» на всю страницу
  const DAY = { sky: ['#2b4690', '#4d70b4', '#9bb5d8'], L: '#fffaf1', H: '#cfc5bd' };
  Sky([{ sel: '#top', d: .6, pal: DAY }, { sel: '.cases__grid', d: .6, pal: DAY }, { sel: '#about', d: .35, pal: DAY }, { sel: '#contacts', d: .5, low: 1, pal: DAY }, { sel: '.foot', d: .3, pal: DAY }]);

  // Кейс карусели: в одном положении начинает крутиться — её видео, если лежит в assets
  const car = $('.case--car'), vid = $('.case__video', car); let vidOk = null;
  car.addEventListener('mouseenter', () => {
    if (vidOk === false) return;
    if (!vid.src) { vid.src = vid.dataset.src; vid.addEventListener('error', () => vidOk = false, { once: true }); vid.addEventListener('canplay', () => vidOk = true, { once: true }); }
    vid.play().then(() => car.classList.add('playing')).catch(() => {});
  });
  car.addEventListener('mouseleave', () => { vid.pause(); car.classList.remove('playing'); });

  // Закрытые файлы: дёргаются, как неверный пароль, и показывают плашку
  $$('[data-locked]').forEach(f => f.addEventListener('click', () => {
    f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake', 'plate-on');
    clearTimeout(f._t); f._t = setTimeout(() => f.classList.remove('plate-on'), 2600);
  }));

  /* ── Обо мне: сначала стопкой над заголовком, буквы «ОБО МНЕ» еле видны.
     Чем больше карточек растащили, тем ярче буквы. Растащил всё → ачивка (пасхалка, вариант 1).
     «Навести порядок» — тихая текстовая кнопка, собирает обратно стопкой. */
  const pile = $('#pile'), items = $$('.card, .toy', pile), title = $('.pile__title', pile), tidy = $('.pile__tidy');
  const home = items.map(el => ({ l: parseFloat(el.style.left), t: parseFloat(el.style.top) }));
  // Сгруппировано, но читаемо: карточки цепляются только краями и закрывают заголовок, растащишь — проявится
  // Ровная сетка 3×2, игрушка (индекс 2) справа от заголовка
  const GRID7 = [[0, 180], [436, 180], [1070, 20], [872, 180], [0, 400], [436, 400], [872, 400]];
  const stackAt = (el, i) => ({ l: GRID7[i][0], t: GRID7[i][1] });
  const rot = [-3, 2, -6, 3, -2, 1.5, -1.5];
  const setPos = (el, p) => { el.style.left = p.l + 'px'; el.style.top = p.t + 'px'; };
  const stack = (animate) => { items.forEach((el, i) => { el.classList.toggle('settle', !!animate); el.style.transitionDelay = animate ? (items.length - i) * 40 + 'ms' : '0ms';
    setPos(el, stackAt(el, i)); el.style.setProperty('--r', rot[i] + 'deg'); el.dataset.spread = ''; el.style.zIndex = 10 + i; });
    setTimeout(() => items.forEach(el => { el.classList.remove('settle'); el.style.transitionDelay = ''; }), 900); reveal(); tidy.hidden = true; };
  let z = 30;
  const reveal = () => { const n = items.filter(el => el.dataset.spread).length; title.style.opacity = (.12 + .88 * n / items.length).toFixed(2); };
  items.forEach((el, i) => {
    let sx, sy, ox, oy;
    el.addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); el.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; el.style.zIndex = ++z; el.classList.add('grab'); });
    el.addEventListener('pointermove', e => { if (!el.hasPointerCapture(e.pointerId)) return;
      const k = (parseFloat(getComputedStyle(pile).zoom) || 1) * S(); el.style.left = ox + (e.clientX - sx) / k + 'px'; el.style.top = oy + (e.clientY - sy) / k + 'px';
      el.style.setProperty('--tilt', Math.max(-8, Math.min(8, e.movementX * .6)) + 'deg'); });
    const up = e => { if (!el.hasPointerCapture(e.pointerId)) return; el.releasePointerCapture(e.pointerId); el.classList.remove('grab'); el.style.setProperty('--tilt', '0deg');
      const st = stackAt(el, i); if (Math.hypot(el.offsetLeft - st.l, el.offsetTop - st.t) > 120) el.dataset.spread = '1';
      pile.dataset.touched = 1; tidy.hidden = false; reveal(); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
  tidy.addEventListener('click', () => stack(true));
  stack(false);

  // Язычки: отрываются кусочком, через 4 с вырастает новый. Все ↗, ровные
  $$('.tab').forEach(t => t.addEventListener('click', async () => {
    if (t.classList.contains('torn')) return;
    if (!reduce) { const r = t.getBoundingClientRect(), b = $('.board').getBoundingClientRect(), k = (parseFloat(getComputedStyle($('.board')).zoom) || 1) * S();
      const pc = document.createElement('div'); pc.className = 'piece'; pc.innerHTML = t.querySelector('b').outerHTML;
      Object.assign(pc.style, { left: (r.left - b.left) / k + 'px', top: (r.top - b.top) / k + 'px', width: r.width / k + 'px', height: r.height / k + 'px' });
      $('.board').appendChild(pc); setTimeout(() => pc.remove(), 1400); }
    t.classList.add('torn');
    setTimeout(() => { t.classList.remove('torn'); t.classList.add('back'); setTimeout(() => t.classList.remove('back'), 600); }, 4000);
    if (t.dataset.copy) { try { await navigator.clipboard.writeText(t.dataset.copy); toast('Почта скопирована: ' + t.dataset.copy); } catch { toast(t.dataset.copy); } }
    if (t.dataset.href) { const a = document.createElement('a'); a.href = t.dataset.href; a.target = '_blank'; a.rel = 'noopener'; setTimeout(() => a.click(), reduce ? 0 : 400); }
  }));
  $$('[data-copy-btn]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copyBtn); toast('Почта скопирована: ' + b.dataset.copyBtn); } catch { toast(b.dataset.copyBtn); } }));

  // Кейс — на весь экран со своим адресом; «назад» и × закрывают
  const modal = $('#modal'), body = $('#modal-body');
  const route = () => { const id = location.hash.slice(1);
    if (CASES[id]) openCaseModal(modal, body, id);
    else if (!modal.hidden) { modal.hidden = true; root.style.overflow = ''; } };
  addEventListener('hashchange', route); route();
  const close = () => { if (history.length > 1 && CASES[location.hash.slice(1)]) history.back(); else { location.hash = ''; } };
  $('.case-modal__x').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
}
