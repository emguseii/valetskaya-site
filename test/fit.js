/* ТЕСТОВАЯ КОПИЯ · переключатель масштаба блоков (23.11): ?fit=now|A|B|C. Грузится после web.js и перекрывает его --s / --sb.
   hero — доля от прежнего масштаба первого экрана (меньше — больше неба вокруг); kb — масштаб кейсов и «Обо мне»
   от min(ширина/1440, высота/900), как у контактов. */
(() => {
  const root = document.documentElement;
  const P = {
    now: { name: 'Сейчас', hero: .70, kc: .67, ka: .75, kx: 1.10, air: 32, desc: 'Её примерка 24.11 (масштаб браузера 100 %): от прежних размеров первый экран 70 %, кейсы 67 %, «Обо мне» 75 %, контакты 110 %. Подгонка — по ширине окна.' },
    A: { name: 'A · По высоте окна', hero: 1, kb: .92, air: 0, desc: 'Кейсы и «Обо мне» масштабируются как контакты — по ширине и высоте окна. Первый экран как был.' },
    B: { name: 'B · Воздух', hero: .86, kb: .84, air: 36, desc: 'A + воздух: первый экран на 14 % меньше и с небом вокруг, колонка кейсов уже, промежутки между экранами 160, между карточками 32.' },
    C: { name: 'C · Ритм контактов', hero: .76, kb: .74, air: 56, desc: 'B ещё компактнее: всё в масштабе последнего блока, между экранами 180.' }
  };
  const BOX = { y: 56, w: 1320, h: 790 }, BAR = 30, PAD = 24;
  const q = new URLSearchParams(location.search);
  let mode = P[q.get('fit')] ? q.get('fit') : 'now';
  // web.js считает --s/--sb в своём обработчике resize (он зарегистрирован раньше) — здесь перекрываем
  const over = () => { root.dataset.fit = mode; const p = P[mode];
    const W = innerWidth, H = innerHeight, s0 = Math.min((W - 2 * PAD) / BOX.w, (H - BAR - 2 * PAD) / BOX.h, 1.4), s = s0 * p.hero;
    ['--sbc', '--sba'].forEach(v => root.style.removeProperty(v));
    if (mode === 'now') { const sbw = Math.min(W / 1440, 1.25) * .92;                       // как на сайте — по ширине окна
      root.style.setProperty('--sbc', (sbw * p.kc).toFixed(4)); root.style.setProperty('--sba', (sbw * p.ka).toFixed(4));
      const ck = parseFloat(getComputedStyle(root).getPropertyValue('--ck')) || 1; root.style.setProperty('--ck', Math.min(1.25, (ck * p.kx)).toFixed(3)); }
    const hh = BAR + 2 * PAD + 2 * p.air + BOX.h * s;
    root.style.setProperty('--s', s.toFixed(4));
    root.style.setProperty('--st', (BAR + PAD + p.air - BOX.y * s).toFixed(1) + 'px');
    root.style.setProperty('--hh', hh.toFixed(0) + 'px');
    if (mode !== 'now') root.style.setProperty('--sb', (Math.min(W / 1440, H / 900, 1.25) * p.kb).toFixed(4)); };
  addEventListener('resize', over); over();

  const pick = document.createElement('nav'); pick.className = 'fitpick'; pick.setAttribute('aria-label', 'Варианты масштаба (тест)');
  const x = document.createElement('button'); x.type = 'button'; x.className = 'fitpick__x'; x.textContent = '‹'; x.setAttribute('aria-label', 'Свернуть панель');
  x.addEventListener('click', () => { const m = pick.classList.toggle('min'); x.setAttribute('aria-label', m ? 'Развернуть панель' : 'Свернуть панель'); });
  const lab = document.createElement('span'); lab.textContent = 'ТЕСТ · масштаб:'; const desc = document.createElement('p');
  pick.append(x, lab);
  const set = m => { mode = m; pick.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === m))); desc.textContent = P[m].desc;
    const u = new URL(location); u.searchParams.set('fit', m); history.replaceState(null, '', u);
    dispatchEvent(new Event('resize')); }; // web.js пересчитает своё, затем over() — своё; герой заново раздвинет узлы
  Object.keys(P).forEach(k => { const b = document.createElement('button'); b.type = 'button'; b.dataset.f = k; b.textContent = P[k].name; b.addEventListener('click', () => set(k)); pick.appendChild(b); });
  // вторая строка панели: «Обо мне» и футер
  const row = (label, key, opts, def) => { const l = document.createElement('span'); l.textContent = label; l.style.marginLeft = '8px'; pick.appendChild(l);
    let cur = q.get(key) || def; root.dataset[key] = cur;
    opts.forEach(([v, t]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.dataset[key] = v;
      const mark = () => pick.querySelectorAll(`[data-${key}]`).forEach(x => x.tagName === 'BUTTON' && x.setAttribute('aria-pressed', String(x.dataset[key] === cur)));
      b.addEventListener('click', () => { cur = v; root.dataset[key] = v; const u = new URL(location); u.searchParams.set(key, v); history.replaceState(null, '', u); mark(); });
      pick.appendChild(b); mark(); }); };
  const br = document.createElement('i'); br.style.cssText = 'flex-basis:100%;height:0'; pick.appendChild(br);
  row('«Обо мне» заголовок:', 'abouth', [['now', 'как сейчас'], ['contacts', 'как в контактах'], ['off', 'без']], 'now');
  row('Футер:', 'footnav', [['on', 'с меню'], ['off', 'без меню']], 'off');
  const br2 = document.createElement('i'); br2.style.cssText = 'flex-basis:100%;height:0'; pick.appendChild(br2);
  // 24.11 её решения: роль — в заголовке окна, папки — стекло (развилки убраны из панели)
  root.dataset.role = 'window'; root.dataset.folder = 'glass';
  row('Фон кейсов:', 'caseb', [['white', 'белый'], ['glass', 'стекло'], ['deep', 'тёмно-синий']], 'white');
  row('Воздух у «Обо мне»:', 'aboutair', [['now', 'как сейчас'], ['air', 'больше воздуха'], ['fade', 'воздух + картинки контактов позже']], 'fade');
  row('Кнопки контактов:', 'cxb', [['rect', 'прямоугольники'], ['icons', 'иконки-стекло']], 'icons');
  row('Кейсы:', 'cases', [['now', 'как сейчас'], ['s1', 'Ш1 · индекс слева'], ['s2', 'Ш2 · крупный + два']], 's1');
  pick.appendChild(desc); document.body.appendChild(pick); set(mode);

  // Кейсы, швейцарская сетка: подпись блока (черновик текста — отредактируем, если раскладка понравится)
  document.querySelector('.cases__grid').insertAdjacentHTML('afterbegin', '<div class="cases-index"><span class="cases-index__l">кейсы · 2024–2026 · ВКонтакте</span><b class="cases-index__h">Кейсы</b></div>');
  // Роль — в заголовке окна (её выбор 24.11)
  document.querySelector('.win__top span').textContent = 'Валя.app — Product Designer';

  // Кнопки контактов иконками из стекла (вариант 24.11): Telegram, LinkedIn, почта (копирует), CV
  const ico = {
    tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M20.6 4.2 2.9 11c-1 .4-1 1.2-.1 1.5l4.5 1.4 1.7 5.3c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.1c.3-1.2-.5-1.8-1.6-1.3ZM8.3 13.6l9.6-6c.5-.3.9-.1.5.2l-8.2 7.4-.3 3.4-1.6-5Z"/></svg>',
    li: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M4.5 9h3.2v10.5H4.5zM6.1 3.8a1.85 1.85 0 1 1 0 3.7 1.85 1.85 0 0 1 0-3.7ZM9.8 9h3.1v1.5c.5-.9 1.6-1.8 3.3-1.8 3.4 0 4 2.2 4 5.1v5.7h-3.2v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.1H9.8z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="s" x="3" y="5.5" width="18" height="13" rx="3"/><path class="s" d="m4 7.5 8 5.5 8-5.5"/></svg>' };
  const src = [...document.querySelectorAll('.cx__btn')], mailBtn = src.find(b => b.dataset.copyBtn);
  const href = t => (src.find(b => b.textContent.includes(t)) || {}).href || '#';
  document.querySelector('.cx__btns').insertAdjacentHTML('afterend', `<div class="cx__icons">
    <a class="cx__ic" href="${href('Telegram')}" target="_blank" rel="noopener" aria-label="Telegram" title="Telegram">${ico.tg}</a>
    <a class="cx__ic" href="${href('LinkedIn')}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">${ico.li}</a>
    <button class="cx__ic" type="button" data-copy-proxy aria-label="Скопировать почту" title="Скопировать почту">${ico.mail}</button>
    <a class="cx__ic cx__ic--cv" href="${href('Резюме')}" target="_blank" rel="noopener" aria-label="Резюме (CV)" title="Резюме">CV</a></div>`);
  document.querySelector('[data-copy-proxy]').addEventListener('click', () => mailBtn && mailBtn.click());

  // Плавность папок: размытая копия картинки внутри передней стенки (вместо живого backdrop-filter)
  document.querySelectorAll('.h-fix .ic').forEach(ic => { const src = ic.querySelector('.ic__in'), front = ic.querySelector('.ic__front'); if (!src || !front) return;
    const c = src.cloneNode(); c.className = 'ic__blur'; c.removeAttribute('style');
    Object.assign(c.style, { left: src.style.left, top: `calc(${src.style.top} - 50px)`, width: src.style.width }); front.appendChild(c); });
})();

/* Верёвки не просвечивают сквозь стекло окна и папок: SVG-маска с «дырами» по их рамкам, дыры двигаются вместе с папками */
(() => {
  const svg = document.querySelector('.lines'); if (!svg) return; const NS = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(NS, 'defs'), mask = document.createElementNS(NS, 'mask');
  mask.id = 'ropeHide'; mask.setAttribute('maskUnits', 'userSpaceOnUse'); ['x', 'y', 'width', 'height'].forEach((k, i) => mask.setAttribute(k, [-2000, -2000, 6000, 6000][i]));
  const all = document.createElementNS(NS, 'rect'); [['x', -2000], ['y', -2000], ['width', 6000], ['height', 6000], ['fill', '#fff']].forEach(([k, v]) => all.setAttribute(k, v)); mask.appendChild(all);
  const targets = [...document.querySelectorAll('.win, .h-fix .folder .ic')].map(el => { const r = document.createElementNS(NS, 'rect'); r.setAttribute('fill', '#000'); mask.appendChild(r);
    return { el, r, rad: el.classList.contains('win') ? 28 : 9 }; });
  defs.appendChild(mask); svg.prepend(defs);
  svg.querySelectorAll('path').forEach(p => p.setAttribute('mask', 'url(#ropeHide)'));
  const tick = () => { const sb = svg.getBoundingClientRect(), k = sb.width / 1440 || 1;
    targets.forEach(t => { const b = t.el.getBoundingClientRect(), on = getComputedStyle(t.el).opacity > .05;
      t.r.setAttribute('x', ((b.left - sb.left) / k + 1).toFixed(1)); t.r.setAttribute('y', ((b.top - sb.top) / k + 1).toFixed(1));
      t.r.setAttribute('width', on ? Math.max(0, b.width / k - 2).toFixed(1) : 0); t.r.setAttribute('height', Math.max(0, b.height / k - 2).toFixed(1));
      t.r.setAttribute('rx', t.rad); });
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();

/* «Обо мне» без отвлечения (24.11): картинки контактов проявляются, только когда блок контактов поднялся почти до середины экрана */
(() => { const root = document.documentElement, cx = document.getElementById('contacts'); if (!cx) return;
  const st = t => t * t * (3 - 2 * t);
  const upd = () => { const r = cx.getBoundingClientRect(), e = (innerHeight - r.top) / innerHeight;
    root.style.setProperty('--cxv', st(Math.max(0, Math.min(1, (e - .45) / .4))).toFixed(3)); };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd(); })();
