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
  // --s  — герой: по ширине, высота ограничивает мягче (800 вместо 900), чтобы на ноутбуке первый экран не мельчил
  // --sb — блоки ниже: по ширине, на 8 % компактнее героя (правка 22.11)
  // v8: герой крупнее, но все папки и бирки целиком в первом экране. Масштаб считается не по кадру 1440×900,
  // а по рамке содержимого сцены (имя, окно, папки, бирки): x 70…1390, y 56…846. Сверху меню-бар 30 px.
  const BOX = { x: 70, y: 56, w: 1320, h: 790 }, BAR = 30, PAD = 24;
  const fit = () => { const W = innerWidth, H = innerHeight, w = W / 1440;
    const s = Math.min((W - 2 * PAD) / BOX.w, (H - BAR - 2 * PAD) / BOX.h, 1.4);
    root.style.setProperty('--s', s.toFixed(4));
    root.style.setProperty('--st', (BAR + PAD - BOX.y * s).toFixed(1) + 'px');
    root.style.setProperty('--hh', Math.max(H, BAR + 2 * PAD + BOX.h * s).toFixed(0) + 'px');
    root.style.setProperty('--sb', (Math.min(w, 1.25) * .92).toFixed(4)); };
  fit(); addEventListener('resize', fit);

  /* Примерочная героя (23.11): ?hero=now|fix|old и &ropes=float. Без параметра — как сейчас (now). */
  const QS = new URLSearchParams(location.search);
  const HERO = ['fix', 'old'].includes(QS.get('hero')) ? QS.get('hero') : 'now', FLOAT = QS.get('ropes') === 'float';
  document.body.classList.add('h-' + HERO); if (FLOAT) document.body.classList.add('ropes-float');
  if (QS.has('hero') || QS.has('ropes')) {
    const pick = document.createElement('nav'); pick.className = 'heropick'; pick.setAttribute('aria-label', 'Варианты героя');
    const link = (label, h, r) => { const u = new URL(location); u.searchParams.set('hero', h); r ? u.searchParams.set('ropes', 'float') : u.searchParams.delete('ropes'); u.hash = '';
      const a = document.createElement('a'); a.href = u; a.textContent = label; a.setAttribute('aria-current', String(HERO === h && FLOAT === !!r)); return a; };
    const lab = t => { const s = document.createElement('span'); s.textContent = t; return s; };
    pick.append(lab('Папки:'), link('Сейчас', 'now'), link('Исправлено', 'fix'), link('Старая версия', 'old'),
      document.createElement('i'), lab('Верёвки парят:'), link('fix', 'fix', 1), link('old', 'old', 1));
    document.body.appendChild(pick);
  }
  const NEWEYES = HERO !== 'now';
  const eyes = Eyes($('#eyes'), 'cursor', NEWEYES ? { hoverOnly: true, idle: 3000, blinkEvery: 3000 } : {});
  if (NEWEYES && !reduce) eyes.sleep(true);
  const paths = $$('.lines path'), lineFor = id => paths.find(p => p.dataset.to === id);

  /* ── Загрузка. Ориентир Apple HIG: интерфейсное движение 200–500 мс, короткий шаг каскада,
     всё появление ≈ 1,3 с вместо прежних 3. Линии выходят из окна, узлы встают на концах пружиной. */
  const T = { name: 0, win: 120, tip: 320, lines: 360, step: 70, line: 640 };
  const show = (el, t) => setTimeout(() => { el.classList.add('in');
    el.addEventListener('animationend', () => { el.classList.remove('in'); el.classList.add('shown'); }, { once: true }); }, t);
  const intro = () => {
    if (reduce) { $$('.name,.tip,.win,.node').forEach(n => n.classList.add('shown')); eyes.sleep(false); return; }
    show($('.name'), T.name); show($('.win'), T.win); show($('.tip'), T.tip);
    ['t2', 'f2', 'f1', 't3', 'f3', 't1'].forEach((id, i) => {
      const p = lineFor(id), delay = T.lines + i * T.step, dur = T.line + Math.min(220, p.getTotalLength() * .25);
      p.animate([{ strokeDashoffset: p.classList.contains('rev') ? -1 : 1 }, { strokeDashoffset: 0 }], { duration: dur, delay, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
      show($('#' + id), delay + dur * .7);
    });
    setTimeout(() => paths.forEach(p => { p.getAnimations().forEach(a => { a.commitStyles?.(); a.cancel(); }); p.style.strokeDasharray = 'none'; }), T.lines + 6 * T.step + T.line + 400);
    // fix/old: пока линии не вышли — глаза закрыты (её аннотация к кадру «Загрузка ≈360 мс»)
    if (NEWEYES) setTimeout(() => eyes.sleep(false), T.lines + 6 * T.step + T.line);
  };
  if (document.readyState === 'complete') intro(); else addEventListener('load', intro);

  /* ── Верёвки: берём ТВОЮ кривую как точки и при перетаскивании сдвигаем только конец у узла,
     плавно затухая к окну. Форма не ломается, верёвка просто тянется. */
  const S = () => parseFloat(getComputedStyle(root).getPropertyValue('--s')) || 1;
  const SB = () => parseFloat(getComputedStyle(root).getPropertyValue('--sb')) || 1;
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
    n.addEventListener('pointerdown', e => { if (FLOAT || e.button > 0 || !n.classList.contains('shown')) return;
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


  /* ropes=float (её коммент к 73:1174): тянуть нельзя; папки и бирки чуть парят (±2,5 px), верёвка тянется следом
     от узла к окну; при наведении — короткое затухающее вздрагивание. Пружины нет. */
  if (FLOAT && !reduce) {
    const items = $$('.node').map((n, i) => ({ n, p: lineFor(n.id), r: null, ph: i * 1.7, sh: 0, t0: 0 }));
    items.forEach(it => it.n.addEventListener('pointerenter', () => { it.sh = 1; it.t0 = performance.now(); }));
    const start = () => { items.forEach(it => { if (it.p) it.r = sample(it.p); });
      (function loop(now) {
        items.forEach(it => { if (dragging) return; const t = now / 1000;
          let dx = Math.sin(t * .9 + it.ph) * 2.5, dy = Math.cos(t * .7 + it.ph * 1.3) * 2.5;
          if (it.sh) { const k = (now - it.t0) / 600; if (k >= 1) it.sh = 0; else { const a = 3 * (1 - k); dx += Math.sin(k * 40) * a; dy += Math.cos(k * 33) * a * .6; } }
          it.n.style.translate = `${dx.toFixed(2)}px ${dy.toFixed(2)}px`; if (it.r) stretch(it.p, it.r, dx, dy); });
        requestAnimationFrame(loop); })(performance.now()); };
    setTimeout(start, T.lines + 6 * T.step + T.line + 500);
  }

  // Карточки кейсов: ховер — подъём карточки и обложки (CSS). Лаймового чипа за курсором больше нет (решение 22.11).

  // Небо: одна палитра «мягкий день» на всю страницу
  // Палитры неба. Основная — deepx2 «Ещё глубже» (выбрана 22.11). Примерочная остаётся по её просьбе:
  // ?sky=<ключ> показывает переключатель всех палитр. «Сейчас» (day) — прежнее «мягкий день».
  const PALS = {
    day:     { name: 'Сейчас',          sky: ['#2b4690', '#4d70b4', '#9bb5d8'], L: '#fffaf1', H: '#cfc5bd' },
    vintage: { name: 'Винтаж',          sky: ['#2f4a7c', '#5f7fa8', '#b9c3c8'], L: '#fff4e2', H: '#c9b9a6' },
    soft:    { name: 'Мягкий голубой',  sky: ['#4f78c2', '#86a9dc', '#cfe0f2'], L: '#ffffff', H: '#d4dcea' },
    rich:    { name: 'Насыщенный',      sky: ['#0c3cc4', '#2f66de', '#79a6f0'], L: '#fffaf1', H: '#c9cfe6' },
    deep:    { name: 'Глубокий',        sky: ['#0b2a8a', '#1d4bb0', '#4f7fd0'], L: '#f6f2ea', H: '#9fb0d6' },
    dark:    { name: 'Тёмный',          sky: ['#060f3a', '#0e2470', '#2c4e9e'], L: '#dfe6ff', H: '#5f6fa8' },
    deepv:   { name: 'Глубокий + винтаж 30%', sky: ['#163486', '#315bae', '#6f93ce'], L: '#fbf3e6', H: '#b0b4c3' },
    deepv2:  { name: 'Глубокий + винтаж 50%', sky: ['#1d3a83', '#3e65ac', '#84a1cc'], L: '#fbf3e6', H: '#b4b4be' },
    deepx:   { name: 'Глубже, винтаж в облаках', sky: ['#0a2786', '#1c48ae', '#5c88cf'], L: '#fbf1e2', H: '#a7aec8' },
    deepx2:  { name: 'Ещё глубже',             sky: ['#071f72', '#163d9c', '#4c79c2'], L: '#f8efe0', H: '#9aa3c2' },
    deepplus:  { name: 'Глубокий+ (насыщ. +15%, темнее 10%)', sky: ['#012185', '#1040a8', '#2d6cd5'], L: '#f6f2ea', H: '#97a6cf' },
    deepplus2: { name: 'Глубокий++ (насыщ. +30%, темнее 18%)', sky: ['#001e7a', '#0637a2', '#1d5fce'], L: '#f3efe8', H: '#8c9bc6' },
  };
  // Основная палитра с 22.11 — «Ещё глубже» (её выбор в примерочной). На «Обо мне» небо темнеет («Тёмный»).
  const skyQ = new URLSearchParams(location.search).get('sky'), DAY = PALS[skyQ] || PALS.deepx2, DUSK = PALS.dark;
  if (skyQ) { const sw = document.createElement('div'); sw.className = 'skypick'; sw.setAttribute('aria-label', 'Палитра неба');
    Object.entries(PALS).forEach(([k, o]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o.name;
      b.style.setProperty('--c1', o.sky[0]); b.style.setProperty('--c2', o.sky[2]); b.setAttribute('aria-pressed', DAY === o);
      b.onclick = () => { const u = new URL(location); u.searchParams.set('sky', k); location = u; }; sw.appendChild(b); });
    document.body.appendChild(sw); }
  Sky([{ sel: '#top', d: .6, pal: DAY }, { sel: '.cases__grid', d: .6, pal: DAY }, { sel: '#about', d: .3, pal: DUSK }, { sel: '#contacts', d: .5, low: 1, pal: DAY }, { sel: '.foot', d: .3, pal: DAY }]);

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
  // v8: группа поверх «ОБО МНЕ» — лёгкий наклон, карточки наезжают только краями, каждая читается.
  // Порядок как в разметке: ВКонтакте, что делала, игрушка, после работы, курсы, сильная сторона, образование.
  const CLUSTER = [[130, 64], [418, 84], [930, 70], [1066, 118], [448, 402], [756, 390], [148, 384]];
  const stackAt = (el, i) => ({ l: CLUSTER[i][0], t: CLUSTER[i][1] });
  const rot = [-4, 2.5, -7, 4, -2, 3, 2.5];
  const setPos = (el, p) => { el.style.left = p.l + 'px'; el.style.top = p.t + 'px'; };
  const stack = (animate) => { items.forEach((el, i) => { el.classList.toggle('settle', !!animate); el.style.transitionDelay = animate ? (items.length - i) * 40 + 'ms' : '0ms';
    setPos(el, stackAt(el, i)); el.style.setProperty('--r', rot[i] + 'deg'); el.dataset.spread = ''; el.style.zIndex = 10 + i; });
    setTimeout(() => items.forEach(el => { el.classList.remove('settle'); el.style.transitionDelay = ''; }), 900); reveal(); tidy.hidden = true; };
  let z = 30;
  const reveal = () => {}; // v8: «ОБО МНЕ» видно всегда, под карточками
  items.forEach((el, i) => {
    let sx, sy, ox, oy;
    el.addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); el.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; el.style.zIndex = ++z; el.classList.add('grab'); });
    el.addEventListener('pointermove', e => { if (!el.hasPointerCapture(e.pointerId)) return;
      const k = (parseFloat(getComputedStyle(pile).zoom) || 1) * SB(); el.style.left = ox + (e.clientX - sx) / k + 'px'; el.style.top = oy + (e.clientY - sy) / k + 'px';
      el.style.setProperty('--tilt', Math.max(-8, Math.min(8, e.movementX * .6)) + 'deg'); });
    const up = e => { if (!el.hasPointerCapture(e.pointerId)) return; el.releasePointerCapture(e.pointerId); el.classList.remove('grab'); el.style.setProperty('--tilt', '0deg');
      const st = stackAt(el, i); if (Math.hypot(el.offsetLeft - st.l, el.offsetTop - st.t) > 120) el.dataset.spread = '1';
      pile.dataset.touched = 1; tidy.hidden = false; reveal(); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
  tidy.addEventListener('click', () => stack(true));
  stack(false);

  // Язычки (v8): лист изначально целый. Клик — кусок отрывается по зигзагу и падает, на листе остаётся зубчатый край;
  // через 4 с кусок проявляется обратно (фейд). Дыра — маска на картинке бумаги, считается в координатах листа 620×447.
  const sheet = $('.sheet'), paper = $('.sheet__paper'), torn = new Set();
  const zig = (x, y, w, h, n = 25) => { let d = `M${x} ${y + 6}`; for (let i = 1; i <= n; i++) d += ` L${(x + w * i / n).toFixed(1)} ${i % 2 ? y : y + 6}`; return d + ` L${x + w} ${y + h} L${x} ${y + h} Z`; };
  const mask = () => { const W = 620, H = 447; const holes = [...torn].map(t => zig(t.offsetLeft + $('.tabs').offsetLeft, $('.tabs').offsetTop, t.offsetWidth, H)).join(' ');
    const svgM = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'><path fill-rule='evenodd' fill='white' d='M0 0H${W}V${H}H0Z ${holes}'/></svg>`;
    const url = torn.size ? `url("data:image/svg+xml,${encodeURIComponent(svgM)}")` : 'none';
    paper.style.maskImage = paper.style.webkitMaskImage = url; paper.style.maskSize = paper.style.webkitMaskSize = '100% 100%'; };
  $$('.tab').forEach(t => t.addEventListener('click', async () => {
    if (t.classList.contains('torn')) return;
    const tabs = $('.tabs'), x = tabs.offsetLeft + t.offsetLeft, y = tabs.offsetTop;
    if (!reduce) { const pc = document.createElement('div'); pc.className = 'piece'; pc.innerHTML = t.innerHTML;
      Object.assign(pc.style, { left: x + 'px', top: y + 'px', width: t.offsetWidth + 'px', height: (447 - y) + 'px', backgroundPosition: `${-x}px ${-y}px` });
      sheet.appendChild(pc); setTimeout(() => pc.remove(), 1400); }
    torn.add(t); t.classList.add('torn'); mask();
    setTimeout(() => { torn.delete(t); const ghost = document.createElement('div'); ghost.className = 'regrow';
      Object.assign(ghost.style, { left: x + 'px', top: y + 'px', width: t.offsetWidth + 'px', height: (447 - y) + 'px', backgroundPosition: `${-x}px ${-y}px` });
      sheet.insertBefore(ghost, $('.tabs')); requestAnimationFrame(() => ghost.classList.add('on'));
      setTimeout(() => { mask(); ghost.remove(); t.classList.remove('torn'); }, reduce ? 0 : 650); }, 4000);
    if (t.dataset.copy) { try { await navigator.clipboard.writeText(t.dataset.copy); toast('Почта скопирована: ' + t.dataset.copy); } catch { toast(t.dataset.copy); } }
    if (t.dataset.href) { const a = document.createElement('a'); a.href = t.dataset.href; a.target = '_blank'; a.rel = 'noopener'; setTimeout(() => a.click(), reduce ? 0 : 400); }
  }));
  $$('[data-copy-btn]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copyBtn); toast('Почта скопирована: ' + b.dataset.copyBtn); } catch { toast(b.dataset.copyBtn); } }));

  // Кейс — на весь экран со своим адресом; «назад» и × закрывают
  const modal = $('#modal'), body = $('#modal-body');
  const route = () => { const id = location.hash.slice(1);
    if (CASES[id]) openCaseModal(modal, body, id);
    else if (!modal.hidden) { modal.hidden = true; root.style.overflow = ''; } };
  // Открыт ли кейс переходом внутри сайта. Если пришли по прямой ссылке (#case-…), «назад» увёл бы с сайта —
  // тогда × просто убирает адрес кейса и закрывает модалку (правка 22.11)
  let inside = false;
  addEventListener('hashchange', () => { inside = true; route(); }); route();
  const close = () => { if (inside && CASES[location.hash.slice(1)]) history.back(); else { history.replaceState(null, '', location.pathname + location.search); route(); } };
  $('.case-modal__x').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
}
