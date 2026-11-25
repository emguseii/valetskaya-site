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
    // высота героя — по содержимому, а не «весь экран»: при мелком масштабе браузера (67 %, 50 %) масштаб героя упирается
    // в предел 1,4, и раньше под ним оставалась пустая дыра до кейсов (её правка 23.11)
    root.style.setProperty('--hh', (BAR + 2 * PAD + BOX.h * s).toFixed(0) + 'px');
    root.style.setProperty('--sb', (Math.min(w, H / 900, 1.25) * .92).toFixed(4)); }; // масштаб A (её выбор на тесте 24.11): кейсы и «Обо мне» — по ширине и высоте окна
  fit(); addEventListener('resize', fit);

  /* Примерочная героя (23.11): ?hero=now|fix|old. Без параметра — «Исправлено» (fix): её выбор 23.11 ~03:41, основной вид сайта.
     «Прежний» (now) и «Старая версия» (old) — только по ссылке, для сравнения. */
  const QS = new URLSearchParams(location.search);
  const HERO = ['now', 'old'].includes(QS.get('hero')) ? QS.get('hero') : 'fix', FLOAT = HERO !== 'now'; // fix/old: конструкция верёвка+узел парит, тянуть нельзя
  document.body.classList.add('h-' + HERO); if (FLOAT) document.body.classList.add('ropes-float');
  if (QS.has('hero') || QS.has('ropes')) {
    const pick = document.createElement('nav'); pick.className = 'heropick'; pick.setAttribute('aria-label', 'Варианты героя');
    const link = (label, h) => { const u = new URL(location); u.searchParams.set('hero', h); u.searchParams.delete('ropes'); u.hash = '';
      const a = document.createElement('a'); a.href = u; a.textContent = label; a.setAttribute('aria-current', String(HERO === h)); return a; };
    const lab = t => { const s = document.createElement('span'); s.textContent = t; return s; };
    pick.append(lab('Герой:'), link('Основной', 'fix'), link('Прежний', 'now'), link('Старая версия', 'old'));
    document.body.appendChild(pick);
  }
  const NEWEYES = HERO !== 'now';
  const eyes = Eyes($('#eyes'), 'cursor', NEWEYES ? { armOnHover: true, idle: 3000, blinkEvery: 3000 } : {});
  if (NEWEYES && !reduce) eyes.sleep(true);
  const paths = $$('.lines path'), lineFor = id => paths.find(p => p.dataset.to === id);

  /* ── Загрузка. Ориентир Apple HIG: интерфейсное движение 200–500 мс, короткий шаг каскада,
     всё появление ≈ 1,3 с вместо прежних 3. Линии выходят из окна, узлы встают на концах пружиной. */
  const T = { name: 0, win: 120, tip: 320, lines: 360, step: 70, line: 640 };
  const show = (el, t) => el && setTimeout(() => { el.classList.add('in');
    el.addEventListener('animationend', () => { el.classList.remove('in'); el.classList.add('shown'); }, { once: true }); }, t);
  const intro = () => {
    if (reduce) { $$('.name,.tip,.win,.node').forEach(n => n.classList.add('shown')); eyes.sleep(false); return; }
    show($('.name'), T.name); show($('.win'), T.win); show($('.tip'), T.tip);
    const V2 = root.dataset.v === '2';
    if (V2) { // 25.11 (её порядок и схема 326:7309): лого → закрытые глаза → все линии разом из глаз с одной скоростью на экране → папки и бирки разом
      const v = window.ROPE_V = .8, k = S(); let end = 0; // v — px экрана в мс; длину считаем в px экрана, поэтому длинная и короткая верёвки растут одинаково
      ['t2', 'f2', 'f1', 't3', 'f3', 't1'].forEach(id => { const p = lineFor(id), dur = p.getTotalLength() * k / v; end = Math.max(end, dur);
        p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay: T.lines, easing: 'linear', fill: 'forwards' }); });
      ['t2', 'f2', 'f1', 't3', 'f3', 't1'].forEach(id => show($('#' + id), T.lines + end - 80));
      setTimeout(() => paths.forEach(p => { p.getAnimations().forEach(a => { a.commitStyles?.(); a.cancel(); }); p.style.strokeDasharray = 'none'; }), T.lines + end + 60);
      if (NEWEYES) setTimeout(() => eyes.sleep(false), T.lines + end);
      return; }
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
  // Кривая через точки — сплайн Катмулла-Рома → кубические Безье: линия гладкая, без «ломаной» (её замечание 23.11)
  const curve = q => { let d = 'M' + q[0].x.toFixed(2) + ' ' + q[0].y.toFixed(2);
    for (let i = 0; i < q.length - 1; i++) { const a = q[i - 1] || q[i], b = q[i], c = q[i + 1], e = q[i + 2] || c;
      d += 'C' + (b.x + (c.x - a.x) / 6).toFixed(2) + ' ' + (b.y + (c.y - a.y) / 6).toFixed(2) + ' ' + (c.x - (e.x - b.x) / 6).toFixed(2) + ' ' + (c.y - (e.y - b.y) / 6).toFixed(2) + ' ' + c.x.toFixed(2) + ' ' + c.y.toFixed(2); }
    return d; };
  // dx, dy — сдвиг узла (конец верёвки); bow — лёгкий изгиб середины поперёк верёвки; начало у окна неподвижно
  const stretch = (p, r, dx, dy, bow = 0) => { const n = r.pts.length - 1, a = r.pts[0], z = r.pts[n];
    const L = Math.hypot(z.x - a.x, z.y - a.y) || 1, nx = -(z.y - a.y) / L, ny = (z.x - a.x) / L;
    p.removeAttribute('transform');
    p.setAttribute('d', curve(r.pts.map((q, i) => { const u = i / n, w = smooth(u), b = Math.sin(Math.PI * u) * bow;
      return { x: q.x + dx * w + nx * b, y: q.y + dy * w + ny * b }; }))); };
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
    if (now) go(); else offT = setTimeout(() => { if (!(cur && (window.folderHover ? window.folderHover(cur) : cur.matches(':hover')))) go(); }, 160); };
  window.closeFolder = () => closeF(); // 25.11: v2.js закрывает папку сам, когда курсор вышел из «зоны» папки (см. folderHover) // 24.11: гистерезис — папка «плывёт» под курсором, без него наведение мигало
  $$('.folder').forEach(n => {
    n.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; clearTimeout(intentT); intentT = setTimeout(() => open(n), 200); /* 25.11: 200 мс — не раскрывается сразу и не мигает */ });
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


  /* fix/old — «парение» (её уточнения 23.11): вся конструкция верёвка + папка/бирка медленно и чуть-чуть плывёт
     сама по себе, без реакции на наведение. Узел смещается по плавной кривой (±3 px, период 7–11 с), середина верёвки
     слегка изгибается (±4 px, свой период), начало под глазами не двигается. Верёвка к бирке цепляется ровно за дырочку.
     Геометрия верёвок готовится ДО появления (без скачка при старте), парение разгоняется с нуля за 2,5 с. */
  if (FLOAT) {
    const items = $$('.node').map((n, i) => ({ n, glass: n.classList.contains('folder') && !root.classList.contains('smooth-float'), /* smooth-float — без округления (тест плавности 23.11) */ p: lineFor(n.id), r: null, ph: i * 1.9, px: 7 + (i % 3) * 1.6, py: 9 + (i % 2) * 2, pb: 6 + (i % 4) * 1.3 }));
    /* Ширина первого экрана = ширина сетки кейсов (её правка 23.11 ~13:57). Масштаб героя ограничен высотой экрана,
       поэтому на широких и невысоких экранах папки и бирки стоят тесно, а кейсы ниже — шире. Не увеличивая высоту,
       раздвигаем узлы по горизонтали от центра так, чтобы крайние встали вровень с краями сетки кейсов
       (k от 0,8 до 1,8). Имя, окно с глазами и «Product Designer» остаются на местах; верёвки тянутся за узлами. */
    const spread = () => { const cs = $$('.v7 .case'), k0 = S(); if (!cs.length) return;
      const sl = stage.getBoundingClientRect().left, rs = cs.map(c => c.getBoundingClientRect()),
        TL = (Math.min(...rs.map(r => r.left)) - sl) / k0, TR = (Math.max(...rs.map(r => r.right)) - sl) / k0, C = 720;
      // левая и правая половины раздвигаются каждая своим коэффициентом — крайние узлы встают ровно по краям сетки
      // предел раздвижки — из CSS (--spread-max, по умолчанию 1,8): при уменьшенном герое большие сдвиги заворачивают верёвки в петли
      const KM = parseFloat(getComputedStyle(root).getPropertyValue('--spread-max')) || 1.8, K = { l: KM, r: KM };
      items.forEach(it => { const w = it.n.offsetWidth, xc = it.n.offsetLeft + w / 2, d = xc - C; if (Math.abs(d) < 60) return;
        if (d < 0) K.l = Math.min(K.l, (TL + w / 2 - C) / d); else K.r = Math.min(K.r, (TR - w / 2 - C) / d); });
      K.l = Math.max(.86, K.l); K.r = Math.max(.86, K.r); // и сжимаем немного, если герой шире сетки
      items.forEach(it => { const w = it.n.offsetWidth, d = it.n.offsetLeft + w / 2 - C; it.ox = d * ((d < 0 ? K.l : K.r) - 1); });
      // когда узлы сдвигаются к центру, окно с глазами тоже чуть уменьшается (не меньше 86 %, от нижнего края),
      // чтобы верёвки не прилипали к его бокам (её правка 23.11)
      const win = $('.win'); if (win) { const ws = Math.min(1, K.l, K.r); win.style.transformOrigin = '50% 100%'; win.style.scale = ws < .999 ? ws.toFixed(3) : ''; } };
    let running = false;
    const still = () => items.forEach(it => { it.n.style.translate = `${it.ox.toFixed(2)}px 0px`; if (it.r) stretch(it.p, it.r, it.ox, 0); });
    const prep = () => { spread(); items.forEach(it => { it.n.style.translate = `${it.ox.toFixed(2)}px 0px`; });
    const k = S(), sb = svg.getBoundingClientRect();
    items.forEach(it => { if (!it.p) return; it.r = sample(it.p);
      const hole = $('.tag__j', it.n); // точка, где верёвка расходится в петлю над биркой (уже с учётом раздвижки)
      if (hole) { const h = hole.getBoundingClientRect(), c = { x: (h.left + h.width / 2 - sb.left) / k - it.ox, y: (h.top + h.height / 2 - sb.top) / k };
        const pts = it.r.pts, n = pts.length - 1, z = pts[n], ex = c.x - z.x, ey = c.y - z.y;
        it.r.pts = pts.map((q, i) => { const w = Math.pow(i / n, 3); return new DOMPoint(q.x + ex * w, q.y + ey * w); }); } });
    still(); };
    items.forEach(it => { it.ox = 0; });
    // на load: шрифты и масштаб уже на месте, узлы ещё не начали появляться
    if (document.readyState === 'complete') prep(); else addEventListener('load', prep);
    addEventListener('resize', () => { clearTimeout(spread.t); spread.t = setTimeout(() => { spread(); if (!running) still(); }, 120); });
    const go = () => { if (reduce || root.dataset.style === 'new') return; running = true; /* style=new (тест 24.11): первый экран без парения */ const t0 = performance.now();
      (function loop(now) { const t = now / 1000, ramp = smooth(Math.min(1, (now - t0) / 2500));
        const px = S() * (devicePixelRatio || 1), snap = v => Math.round(v * px) / px;
        items.forEach(it => { const w = 2 * Math.PI, dx = Math.sin(t * w / it.px + it.ph) * 3 * ramp, dy = Math.sin(t * w / it.py + it.ph * .7) * 3 * ramp,
            bow = Math.sin(t * w / it.pb + it.ph * 1.3) * 4 * ramp, x = it.ox + dx;
          // 8.3 (23.11): папки сдвигаются только на целые пиксели экрана — иначе размытие передней стенки пересчитывается
          // на дробных сдвигах и граница «фото / стенка» дрожит. Бирки (без размытия) плывут плавно, как раньше.
          const fx = it.glass ? snap(x) : x, fy = it.glass ? snap(dy) : dy;
          it.n.style.translate = `${fx.toFixed(3)}px ${fy.toFixed(3)}px`; if (it.r) stretch(it.p, it.r, fx, fy, bow); });
        requestAnimationFrame(loop); })(t0); };
    setTimeout(go, T.lines + 6 * T.step + T.line + 300);
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
  // плотность облаков на первом экране; на тесте её задаёт html[data-sky-top] (24.11, примерка «меньше облаков»)
  const skyTop = root.dataset.skyTop !== undefined ? +root.dataset.skyTop : .6;
  Sky([{ sel: '#top', d: skyTop, pal: DAY }, { sel: '.cases__grid', d: .6, pal: DAY }, { sel: '#about', d: .3, pal: DUSK }, { sel: '#contacts', d: .5, low: 1, pal: DAY }, { sel: '.foot', d: .3, pal: DAY }]);

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
  // window.PILE_LAYOUT ([left, top, наклон] на каждую карточку) — раскладку можно задать снаружи; на тесте 24.11 — по Figma 165:2635
  const PL = window.PILE_LAYOUT;
  const CLUSTER = PL ? PL.map(([l, t]) => [l, t]) : [[188, 130], [540, 72], [881, 210], [965, 142], [561, 388], [903, 395], [242, 366]] /* по Figma 165:2635 (24.11) */;
  const stackAt = (el, i) => ({ l: CLUSTER[i][0], t: CLUSTER[i][1] });
  const rot = PL ? PL.map(p => p[2]) : [-6, 2, 7, -6, -6, 6, 4];
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

  /* 4–5 · Контакты «Полёт» (её выбор 23.11 из contacts-lab.html). Экран статичный, летят только картинки: поле карточек
     в перспективе, коридор по центру свободен, дальние тонут в «тумане». Пока блок въезжает — уже летим.
     Её правило: когда контакты встали на весь экран (это конец страницы), скролл ВНИЗ страницу не двигает — летим вперёд;
     скролл вверх — как обычно. Колесо/трекпад, свайп, стрелка вниз / PageDown / пробел.
     Картинки — пока заглушки из assets/ (заменить на её 8–12: плёнка, глина, концепты, плакаты, фотик). */
  const CX_ITEMS = [
    ['contacts-photo', 0], ['web-obj-camera', 0], ['deck-photo', 1], ['in-stat', 0], ['web-obj-flower', 0],
    ['subs-card', 1], ['in-path', 0], ['hero-photo', 0], ['in-car', 0], ['case1-card', 0]
  ].map(([src, photo]) => ({ url: `assets/${src}.webp`, photo }));
  const cx = $('#contacts'), cxFx = $('.cx__fx');
  if (cx && cxFx) {
    const N = 16, D = 3200;
    const cards = Array.from({ length: N }, (_, i) => { const it = CX_ITEMS[i % CX_ITEMS.length], n = document.createElement('div');
      n.className = 'cx__it' + (it.photo ? ' is-photo' : ''); const im = new Image(); im.src = it.url; im.alt = ''; im.decoding = 'async'; im.loading = 'lazy'; n.appendChild(im); cxFx.appendChild(n);
      const ang = i * 2.39996 + .4, rad = 600 + ((i * .618034) % 1) * 420; // золотой угол: соседние по глубине — в разных сторонах, без кучек
      return { n, w: it.photo ? 210 : 230, x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * .6, z0: -(i / N) * D }; });
    // центр блока подстраивается под высоту окна: при невысоком окне заголовок и кнопки меньше, картинки тоже
    let ck = 1; const cxFit = () => { const h = cx.offsetHeight; ck = Math.max(.6, Math.min(1.1, (h + 96) / 900));
      root.style.setProperty('--ck', ck.toFixed(3)); cxFx.style.perspectiveOrigin = `50% ${h * .5}px`; cxFx.style.setProperty('--cy', h * .5 + 'px');
      cards.forEach(o => { o.n.style.width = Math.round(o.w * ck) + 'px'; }); };
    cxFit(); addEventListener('resize', cxFit);
    // скролл вниз в конце страницы → вперёд
    const atEnd = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let pend = 0, ty = null;
    addEventListener('wheel', e => { if (e.deltaY > 0 && atEnd()) { e.preventDefault(); pend += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY; } }, { passive: false });
    addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchmove', e => { if (ty === null) return; const y = e.touches[0].clientY, d = ty - y; ty = y; if (d > 0 && atEnd()) { e.preventDefault(); pend += d * 2; } }, { passive: false });
    addEventListener('keydown', e => { if (!atEnd() || e.target.closest('input,textarea') || !$('#modal').hidden) return;
      const k = { ArrowDown: 120, PageDown: 600, ' ': 600 }[e.key]; if (k && !e.shiftKey) { e.preventDefault(); pend += k; } });
    // кадр — только пока блок виден
    let drift = 0, extra = 0, last = 0, raf = 0;
    const frame = now => { const dt = Math.min(50, now - (last || now)); last = now; if (!reduce) drift += dt * .06;
      const u = pend * Math.min(1, .012 * dt); pend -= u; extra += u * 1.6;
      const r = cx.getBoundingClientRect(), enter = Math.max(0, Math.min(1, (innerHeight - r.top) / innerHeight)), cam = enter * 900 + drift + extra;
      cards.forEach(o => { const z = (((o.z0 + cam) % D) + D) % D - D + 560,                 // от −2640 до +560: подлетают вплотную и растут
          fog = Math.min(1, Math.max(0, (z + 1450) / 750)), near = z > 420 ? Math.max(0, 1 - (z - 420) / 140) : 1;
        o.n.style.transform = `translate3d(${(o.x * ck).toFixed(1)}px,${(o.y * ck).toFixed(1)}px,${z.toFixed(1)}px)`; o.n.style.opacity = (fog * near).toFixed(3); });
      raf = requestAnimationFrame(frame); };
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; } }), { rootMargin: '200px' }).observe(cx);
  }

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

/* 24.11 · перенесено из теста. В test/ это делает test/fit.js — там не дублируем */
if (!document.querySelector('link[href*="fit.css"]')) {
  /* Кейсы, сетка Т2 (Figma 222:3330): заголовок блока, подписи кейсов отдельными блоками, названия мелких кейсов */
  const grid = document.querySelector('.cases__grid');
  if (grid) {
    grid.insertAdjacentHTML('afterbegin', '<div class="cases-index"><b class="cases-index__h">Кейсы</b><span class="cases-index__m">(03) избранное<br>ВКонтакте<br>2024 — 2026</span></div>');
    grid.querySelectorAll('.case').forEach((c, i) => { const h = c.querySelector('.case__h'); if (!h) return;
      const d = document.createElement('div'); d.className = 'case-ob case-ob--' + (i + 1); d.setAttribute('aria-hidden', 'true'); d.innerHTML = h.innerHTML;
      d.addEventListener('click', () => c.click()); grid.appendChild(d); });
    const T = ['Управление подписчиками', '<em>Компонент</em> → рекламный баннер', '<em>Кое-что</em> для профиля'];
    document.querySelectorAll('.files .file').forEach((f, i) => { if (T[i]) f.insertAdjacentHTML('afterbegin', `<b class="file-ob" aria-hidden="true">${T[i]}</b>`); });
  }
  /* Верёвки не просвечивают сквозь пустые стеклянные папки: SVG-маска с «дырами» по рамкам папок, дыры едут вместе с папками */
  const svg = document.querySelector('.lines'), icons = [...document.querySelectorAll(document.documentElement.dataset.v === '2' ? '.win' : '.win, .h-fix .folder .ic')]; /* v2 (25.11): у папок верёвка заканчивается ровно на контуре — дыры не нужны */ /* раскрытую папку не вырезаем: верёвка доходит до неё целиком (её правка 24.11) */
  if (svg && icons.length) { const NS = 'http://www.w3.org/2000/svg', el = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };
    const mask = el('mask', { id: 'ropeHide', maskUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 6000, height: 6000 });
    mask.appendChild(el('rect', { x: -2000, y: -2000, width: 6000, height: 6000, fill: '#fff' }));
    const holes = icons.map(ic => ({ ic, r: mask.appendChild(el('rect', { fill: '#000', rx: ic.classList.contains('win') ? 28 : ic.classList.contains('big') ? 24 : 9 })) }));
    const defs = el('defs', {}); defs.appendChild(mask); svg.prepend(defs);
    svg.querySelectorAll('path').forEach(p => p.setAttribute('mask', 'url(#ropeHide)'));
    const tick = () => { const sb = svg.getBoundingClientRect(), k = sb.width / 1440 || 1;
      holes.forEach(({ ic, r }) => { const b = ic.getBoundingClientRect(), on = !ic.closest('.folder.on') && getComputedStyle(ic).opacity > .98; // раскрытая папка — дыру убираем сразу (иначе верёвки мигали)
        r.setAttribute('x', ((b.left - sb.left) / k + 1).toFixed(1)); r.setAttribute('y', ((b.top - sb.top) / k + 1).toFixed(1));
        r.setAttribute('width', on ? Math.max(0, b.width / k - 2).toFixed(1) : 0); r.setAttribute('height', Math.max(0, b.height / k - 2).toFixed(1)); });
      requestAnimationFrame(tick); };
    requestAnimationFrame(tick); }
}
