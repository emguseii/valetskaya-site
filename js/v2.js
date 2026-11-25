/* ТЕСТОВАЯ КОПИЯ · переключатель масштаба блоков (23.11): ?fit=now|A|B|C. Грузится после web.js и перекрывает его --s / --sb.
   hero — доля от прежнего масштаба первого экрана (меньше — больше неба вокруг); kb — масштаб кейсов и «Обо мне»
   от min(ширина/1440, высота/900), как у контактов. */
(() => {
  const root = document.documentElement;
  const P = {
    now: { name: 'Сейчас', hero: .70, kc: .67, ka: .75, kx: 1.10, air: 32, desc: 'Её примерка 24.11 (масштаб браузера 100 %): от прежних размеров первый экран 70 %, кейсы 67 %, «Обо мне» 75 %, контакты 110 %. Подгонка — по ширине окна.' },
    A: { name: 'A · По высоте окна', hero: 1, kb: .92, air: 0, desc: 'Кейсы и «Обо мне» масштабируются как контакты — по ширине и высоте окна. Первый экран как был.' },
    B: { name: 'B · Воздух', hero: .86, kb: .84, air: 36, desc: 'A + воздух: первый экран на 14 % меньше и с небом вокруг, колонка кейсов уже, промежутки между экранами 160, между карточками 32.' }
  };
  const BOX = { y: 56, w: 1320, h: 790 }, BAR = 30, PAD = 24;
  const q = new URLSearchParams(location.search);
  let mode = 'A'; // 24.11 её выбор: по умолчанию A
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
    if (mode !== 'now') root.style.setProperty('--sb', (Math.min(W / 1440, H / 900, 1.25) * p.kb * (+root.dataset.kz || 1)).toFixed(4)); };
  addEventListener('resize', over); over();

  const pick = document.createElement('nav'); pick.className = 'fitpick'; pick.setAttribute('aria-label', 'Варианты масштаба (тест)');
  const x = document.createElement('button'); x.type = 'button'; x.className = 'fitpick__x'; x.textContent = '‹'; x.setAttribute('aria-label', 'Свернуть панель');
  x.addEventListener('click', () => { const m = pick.classList.toggle('min'); x.setAttribute('aria-label', m ? 'Развернуть панель' : 'Свернуть панель'); });
  const lab = document.createElement('span'); lab.textContent = 'ТЕСТ'; const desc = document.createElement('p');
  pick.append(x, lab);
  const set = m => { mode = m; pick.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === m))); desc.textContent = P[m].desc;
    const u = new URL(location); u.searchParams.set('fit', m); history.replaceState(null, '', u);
    dispatchEvent(new Event('resize')); }; // web.js пересчитает своё, затем over() — своё; герой заново раздвинет узлы
  // 24.11: масштаб выбран — A (по высоте окна); варианты «Сейчас» и B убраны из панели
  // Закреплённые решения (развилки убраны): роль в заголовке окна, папки — стекло, футер без меню, кейсы Ш2, больше воздуха у «Обо мне», уголков на глазах нет
  Object.assign(root.dataset, { role: 'window', folder: 'glass', footnav: 'off', aboutair: 'air', cnr: 'off' });
  /* Панель: строки идут в порядке блоков страницы, название — всегда слева в своей колонке (её правило 24.11) */
  const rowEl = label => { const r = document.createElement('div'); r.className = 'fitrow'; const l = document.createElement('span'); l.className = 'fitrow__l'; l.textContent = label; r.appendChild(l); pick.appendChild(r); return r; };
  const row = (label, key, opts, def, reload) => { const r = rowEl(label); let cur = q.get(key) || def; root.dataset[key] = cur;
    opts.forEach(([v, t]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.dataset[key] = v;
      const mark = () => r.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset[key] === cur)));
      b.addEventListener('click', () => { const u = new URL(location); u.searchParams.set(key, v);
        if (reload) { location.href = u; return; } cur = v; root.dataset[key] = v; history.replaceState(null, '', u); mark(); });
      r.appendChild(b); mark(); }); };
  // 24.11 вечером: вариант №1 зафиксирован, развилки убраны (её зачёркивания на скрине 21:57). Закреплено: масштаб 100 %, стиль «как было»,
  // острые углы, кейсы NEW (Figma 238:8845), кнопки контактов с подписью (234:8018)
  Object.assign(root.dataset, { corners: 'sharp', cases: 'n1', cxb: 'mono', bigf: 'plain', caseb: 'glass', abouth: 'over', aboutbg: 'none' });
  // Сравнение: вариант №1 (зафиксирован) / №2 (Figma 238:8845 + её комментарии 24.11 вечером). Читается при загрузке — кнопка перезагружает страницу
  row('Вариант', 'v', [['1', '№1'], ['2', '№2']], root.dataset.v || '1', true);
  // Первый экран · облака (web.js читает при загрузке — кнопка перезагружает страницу)
  // №2: при наведении на папку — фон размыт одним слоем (её идея 25.11) или как есть
  row('Ховер папки · фон', 'hb', [['blur', 'размыть'], ['none', 'как есть']], 'blur');
  row('Первый экран · облака', 'sky1', [['.6', 'как сейчас'], ['.35', 'меньше'], ['.15', 'мало']], root.dataset.skyTop, true);
    if (!window.PROD) document.body.appendChild(pick); set(mode);

  // «Обо мне» стеклом (Figma 165:2635): форма букв — её вектор about-title.webp как маска, внутри — размытый и подсвеченный фон
  document.getElementById('pile').insertAdjacentHTML('afterbegin', '<div class="pile__glass" aria-hidden="true"><i class="bd"></i><i class="rim"></i></div>');
  // кромка букв: SVG-фильтр «форма минус сжатая форма» = светлый контур (filter нельзя вешать на родителя стекла — он отключает backdrop-filter)
  document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="glassRim" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="e"/><feComposite in="SourceGraphic" in2="e" operator="out"/></filter></svg>');
  // «Навести порядок» — круглая кнопка с иконкой «вернуть» (её просьба 24.11); подпись остаётся для экранных читалок и во всплывающей подсказке
  { const t = document.querySelector('.pile__tidy'); if (t) { t.setAttribute('aria-label', 'Навести порядок'); t.title = 'Навести порядок';
    t.innerHTML = '<svg class="replay" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3C4.55217 3.00007 4.99992 3.44783 5 4V6.3457C5.89841 5.23377 7.05365 4.34399 8.37793 3.76172C10.2496 2.93879 12.3458 2.77755 14.3213 3.30469C16.2966 3.8319 18.0343 5.01616 19.2471 6.66211C20.4597 8.30812 21.0759 10.3185 20.9941 12.3613C20.9122 14.4043 20.1365 16.3586 18.7959 17.9023C17.4553 19.446 15.6294 20.488 13.6182 20.8555C11.6069 21.2229 9.53026 20.8938 7.73047 19.9238C5.93071 18.9537 4.51372 17.3996 3.71484 15.5176C3.49947 15.0093 3.73694 14.4218 4.24512 14.2061C4.75333 13.9905 5.34076 14.2283 5.55664 14.7363C6.17797 16.2 7.27912 17.4086 8.67871 18.1631C10.0786 18.9176 11.6944 19.1735 13.2588 18.8877C14.8231 18.6018 16.2435 17.7915 17.2861 16.5908C18.3287 15.3901 18.9314 13.8702 18.9951 12.2812C19.0587 10.6924 18.5798 9.12885 17.6367 7.84863C16.6934 6.56844 15.3421 5.64638 13.8057 5.23633C12.2692 4.82635 10.6384 4.95175 9.18262 5.5918C7.87668 6.166 6.78247 7.12531 6.03906 8.33398H9.33398C9.88606 8.33418 10.3339 8.78189 10.334 9.33398C10.3339 9.88609 9.88606 10.3338 9.33398 10.334H4C3.44776 10.334 3.00007 9.88621 3 9.33398V4C3.00008 3.44778 3.44776 3 4 3Z"/></svg>'; } } // Web / Round Button / Replay (Figma 238:8138)
  // Роль — в заголовке окна (её выбор 24.11)
  document.querySelector('.win__top span').textContent = 'Продуктовый дизайнер.app'; // её комментарий в Figma 24.11

  const src = [...document.querySelectorAll('.cx__btn')], mailBtn = src.find(b => b.dataset.copyBtn);
  const href = t => (src.find(b => b.textContent.includes(t)) || {}).href || '#';
  // Кнопки контактов по её компоненту Figma 234:8018 «Button / Contacts» (24.11 вечером): иконка 60 (её PNG, белый 30 %) + подпись моно-капсом
  document.querySelector('.cx__btns').insertAdjacentHTML('afterend', `<div class="cx__mono">
    <a class="cx__m" href="${href('Telegram')}" target="_blank" rel="noopener"><img src="assets/contacts/Telegram.png" alt="" width="60" height="60"><img class="cx__mh" src="assets/contacts/hover/Telegram.png" alt="" width="60" height="60"><span>Telegram</span></a>
    <a class="cx__m" href="${href('LinkedIn')}" target="_blank" rel="noopener"><img src="assets/contacts/Linkedin.png" alt="" width="60" height="60"><img class="cx__mh" src="assets/contacts/hover/Linkedin.png" alt="" width="60" height="60"><span>LinkedIn</span></a>
    <button class="cx__m" type="button" data-copy-proxy2 title="Скопировать почту"><img src="assets/contacts/Email.svg?v=3" alt="" width="60" height="60"><img class="cx__mh" src="assets/contacts/hover/Email.png" alt="" width="60" height="60"><span>Почта</span></button>
    <a class="cx__m" href="${href('Резюме')}" target="_blank" rel="noopener"><img src="assets/contacts/CV.png" alt="" width="60" height="60"><img class="cx__mh" src="assets/contacts/hover/CV.png" alt="" width="60" height="60"><span>Резюме</span></a></div>`);
  document.querySelector('[data-copy-proxy2]').addEventListener('click', () => mailBtn && mailBtn.click());

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
    targets.forEach(t => { const b = t.el.getBoundingClientRect(), on = !t.el.closest('.folder.on') && getComputedStyle(t.el).opacity > .98; // раскрытая папка — дыру убираем сразу, без промежуточных кадров (иначе верёвки мигали)
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





/* Кейсы NEW (Figma 238:8845, её компоненты Case / Big и Case / Small, 24.11 вечером). Всё выровнено по центральной оси:
   большие кейсы слева кончаются у центра, справа — начинаются от центра; мелкие — колонкой справа от центра */
(() => { const cs = document.querySelector('.cases'); if (!cs) return;
  const big = (cls, href, ratio, img, h, m) => `<a class="nc__big ${cls}" href="${href}"><span class="nc__cv nc__cv--${ratio}"><img src="assets/cases/${img}.webp" alt="" loading="lazy"></span><span class="nc__d"><b class="nc__h">${h}</b><span class="nc__m">${m}</span></span></a>`;
  const small = (img, meta, h) => `<div class="nc__sm"><span class="nc__scv"><img src="assets/cases/${img}.webp" alt="" loading="lazy"><b class="nc__g">${meta}</b></span><b class="nc__sh">${h}</b></div>`;
  cs.insertAdjacentHTML('beforeend', `<div class="nc">
    ${big('nc__big--1', '#case-stat', '1x1', 'stat', '<em>new</em> статистика на web<br>и с нуля на mobile', 'июль — декабрь 2024 · WEB · Mobile')}
    ${big('nc__big--2', '#case-car', '3x2', 'carousel', '<em>4 A/B‑теста:</em> почему iOS<br>и Android реагировали<br>по‑разному', 'февраль 2025 · февраль 2026 · WEB · Mobile')}
    ${big('nc__big--3', '#case-path', '5x4', 'onboarding', '<em>+16%</em> оформленных<br>сообществ авторами', 'апрель — июль 2025 · WEB · Mobile')}
    <span class="nc__more">(+3) ещё в работе</span>
    <div class="nc__small">
      ${small('subs', 'SPA · 2025 · в процессе', 'UX/UI<br>Улучшения<br>раздела<br>подписчиков')}
      ${small('ad', 'DS · 2026', 'маркетинговый<br>компонент<br>для быстрого<br>запуска кампаний')}
      ${small('mediawall', 'NDA · 2026', 'Медиастена<br>профиля')}
    </div></div>`);
})();


/* ══ Вариант №2 (Figma 238:8845 + её комментарии 24.11 вечером) ══
   1) верёвки — белое стекло (градиент с бликами солнца вместо лайма);
   2) длинная верёвка: от окна с глазами вниз по центральной оси, мимо кейсов, до лаймовой карточки «что делала» в «Обо мне» —
      карточка на ней висит (её не таскают), остальные карточки таскаются;
   3) новая обложка онбординга; 4) текст и кнопки контактов ниже на 40 */
(() => { const root = document.documentElement; if (root.dataset.v !== '2') return;
  const NS = 'http://www.w3.org/2000/svg';
  // 1) градиент «стекло» для верёвок: полупрозрачный белый с двумя бликами (свет сверху слева, −45°, как в её эффекте Glass)
  const lines = document.querySelector('.lines');
  if (lines) { const d = lines.querySelector('defs') || lines.insertBefore(document.createElementNS(NS, 'defs'), lines.firstChild);
    d.insertAdjacentHTML('beforeend', '<linearGradient id="ropeGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".18" stop-color="#fff" stop-opacity=".35"/><stop offset=".42" stop-color="#e9f2ff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#cfe0ff" stop-opacity=".35"/><stop offset=".85" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>'); }
  // 3) обложка онбординга
  const ob = document.querySelector('.nc__big--3 img'); if (ob) ob.src = 'assets/cases/onboarding-v4.webp';
  // обложка статистики (кейс стал 490) и мелкие кейсы по её новой вёрстке (Figma 230:4446, 24.11 22:37): метки слева от оси, порядок NDA → DS → WIP
  const st = document.querySelector('.nc__big--1 img'); if (st) st.src = 'assets/cases/stat-v4.webp';
  // её новые обложки x5 (25.11), сжаты до 2x webp; фон 20 % уже внутри картинок
  const car = document.querySelector('.nc__big--2 img'); if (car) car.src = 'assets/cases/carousel-v4.webp';
  // мелкие кейсы по её новой вёрстке (Figma 230:4427, 25.11): у каждого своя композиция, все привязаны к центральной оси;
  // лаймовые год и тип — слева от оси, название — от оси вправо; между блоками названий 154
  const sm = (mod, img, lime, h, coverFirst) => { const cv = `<span class="nc2s__cv"><img src="assets/cases/${img}.webp" alt="" loading="lazy"></span>`;
    const tx = `<b class="nc2s__lime">${lime}</b><b class="nc2s__t">${h}</b>`;
    return `<div class="nc2s nc2s--${mod}">${coverFirst ? cv + '<span class="nc2s__tx">' + tx + '</span>' : '<span class="nc2s__tx">' + tx + '</span>' + cv}</div>`; };
  const more = document.querySelector('.nc__more'); if (more) more.textContent = 'кейсы поменьше';
  const nc = document.querySelector('.nc'); if (nc) nc.insertAdjacentHTML('beforeend',
    sm('mw', 'mediawall-v4', '20<br>26', 'Медиастена<br>профиля<br>(NDA)') +
    sm('ad', 'ad-v4', '20<br>26<br><br><br>DS', 'компо-<br>нент<br>для<br>марке-<br>тинга', true) +
    sm('subs', 'subs-v4', '20<br>25<br><br><br>WIP', 'дизайн<br>лифтинг<br>раздела<br>подпис-<br>чиков'));
  // Первый блок по её компонентам (Figma 290:6454 Folders / Default, 25.11): кадр 1520 → наша сцена 1440 (сдвиг −40 по x, +14 по y,
  // чтобы окно встало на своё место). Папки — пустые стеклянные 120×95 с новыми подписями, бирки и верёвки — как во фрейме
  // лого — её компонент Web/Logo/Имя (Figma 41:91) векторами: рукописная фамилия с обводкой 1px цветом фона
  { const nm = document.querySelector('.name'); if (nm) nm.src = 'assets/hero-name-v8.svg'; }
  // ховер папки: один размытый слой между узлами и раскрытой папкой — дешевле, чем размывать каждый узел отдельно
  document.getElementById('stage')?.insertAdjacentHTML('beforeend', '<i class="veil" aria-hidden="true"></i>');
  // раскрытая папка не вылезает за край окна (её правка 25.11): считаем, где она окажется, и сдвигаем внутрь с полями 16 (сверху — под меню)
  document.querySelectorAll('.folder').forEach(f => { const big = f.querySelector('.big'); if (!big) return;
    new MutationObserver(() => { if (!f.classList.contains('on')) { big.style.translate = ''; return; }
      const r = f.getBoundingClientRect(), k = r.width / f.offsetWidth || 1, L = big.classList.contains('big--left') ? -78 : -18, M = 28, TOP = 60;
      const l = r.left + L * k, t = r.top - 43 * k, w = 328 * k, h = 266 * k;
      let dx = 0, dy = 0; if (l < M) dx = M - l; else if (l + w > innerWidth - M) dx = innerWidth - M - (l + w);
      if (t < TOP) dy = TOP - t; else if (t + h > innerHeight - M) dy = innerHeight - M - (t + h);
      big.style.translate = (dx / k).toFixed(1) + 'px ' + (dy / k).toFixed(1) + 'px'; }).observe(f, { attributes: true, attributeFilter: ['class'] }); });
  // верёвка не просвечивает сквозь раскрытую папку: дыра в маске верёвок по её рамке
  { const mask = document.getElementById('ropeHide'), svgL = document.querySelector('.lines'); if (mask && svgL) {
    const bigs = [...document.querySelectorAll('.folder .big')].map(b => { const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r.setAttribute('fill', '#000'); r.setAttribute('rx', 24); mask.appendChild(r); return { b, r }; });
    const tk = () => { const sb = svgL.getBoundingClientRect(), k = sb.width / 1440 || 1;
      bigs.forEach(({ b, r }) => { const on = b.closest('.folder.on'); if (!on) { r.setAttribute('width', 0); return; } const q = b.getBoundingClientRect();
        r.setAttribute('x', ((q.left - sb.left) / k).toFixed(1)); r.setAttribute('y', ((q.top - sb.top) / k + 8).toFixed(1));
        r.setAttribute('width', (q.width / k).toFixed(1)); r.setAttribute('height', Math.max(0, q.height / k - 8).toFixed(1)); });
      requestAnimationFrame(tk); }; requestAnimationFrame(tk); } }
  { const F = (x, y) => [x - 40, y + 14];
    const pos = { f1: [142, 630, -4], f3: [1160, 256, -5], f2: [838, 702, 7], t1: [45, 267, -4], t3: [1097, 517, 4], t2: [518, 663, -6] };
    for (const [id, [l, t, r]] of Object.entries(pos)) { const n = document.getElementById(id); if (!n) continue;
      n.style.left = l + 'px'; n.style.top = t + 'px'; if (id[0] === 't') n.style.setProperty('--r', r + 'deg'); else n.style.rotate = r + 'deg'; }
    const fm = document.querySelector('#f1 .folder__m'); if (fm) fm.textContent = 'NEW раздел';
    const bh = (id, html) => { const b = document.querySelector('#' + id + ' .big__h'); if (b) b.innerHTML = html; };
    // картинка раскрытой папки — её экспорт из компонента (Figma 290:6321 и др.): 328×175 внизу папки
    for (const [id, img] of [['f1', 'folder-stat'], ['f2', 'folder-path'], ['f3', 'folder-car']]) { const pv = document.querySelector('#' + id + ' .big__pv');
      if (pv) pv.innerHTML = '<img class="big__full" src="assets/' + img + '.webp" alt="" loading="lazy">'; }
    bh('f1', '<em>Редизайн</em> раздела на&nbsp;web и&nbsp;mobile'); bh('f3', '<em>4 A/B‑теста</em> реком блока в&nbsp;ленте');
    // верёвки — её кривые из фрейма (одна чуть опущена, чтобы раскрытая «Статистика» не перекрывала верхнюю линию)
    const R = { t1: ['matrix(.9382 -.3461 .3461 .9382 198.9531 247.1182)', 'M0 27.586C60.511-4.986 134.313-17.589 156.847 40.139 210.553 177.725-48.902 250.232 41.914 332.958 99.928 385.805 138.791 261.893 232.567 341.993 300.649 400.146 346.464 364.072 356.523 354.139'],
      t2: ['translate(656.6641 447)', 'M77.334 0C162.334 112.5-72.264 134.6 23.336 233'],
      f3: ['translate(828 285.6592)', 'M0 166.841C324 401.341 241.5-76.659 421.5 10.841'],
      f1: ['matrix(-.8776 .4793 .4793 .8776 714.6836 444.7695)', 'M0 11.087C54.239 106.231 113.553-16.745 183.595 1.974 253.328 20.611 260.181 96.308 337.237 98.663 371.947 99.723 434.631 80.882 436.04 21.916'],
      f2: ['matrix(.9382 -.3461 .3461 .9382 755.6328 450.6348)', 'M.39 0C91.848 149.379-95.727 194.15 74.773 314.15'],
      t3: ['translate(802.5 454)', 'M0 0C21 47.167 70.5 132.469 163 126 322 114.881 340-94 455.5 71.5'] };
    for (const [id, [tr, d]] of Object.entries(R)) { const p = document.querySelector('.lines path[data-to="' + id + '"]'); if (!p) continue;
      p.setAttribute('transform', 'translate(-40 14) ' + tr); p.setAttribute('d', d); } }
  // ↑ в футере — иконка arrow_up_outline_24 (Figma 270:5797) вместо символа
  const up = document.querySelector('.foot__up'); if (up) up.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.9999 3C12.2651 3.00006 12.5195 3.10549 12.707 3.29298L20.707 11.2932C21.0973 11.6837 21.0973 12.3168 20.707 12.7073C20.3165 13.0978 19.6834 13.0977 19.2929 12.7073L12.9999 6.41416V20.0005C12.9999 20.5527 12.5521 21.0004 11.9999 21.0005C11.4476 21.0005 10.9999 20.5528 10.9999 20.0005V6.41416L4.70696 12.7073C4.31647 13.0978 3.68343 13.0977 3.29289 12.7073C2.90237 12.3168 2.90237 11.6837 3.29289 11.2932L11.2929 3.29298L11.3661 3.22657C11.5441 3.0808 11.7679 3 11.9999 3Z"/></svg>';
  // 2) карточка, на которой висит верёвка: дырочка сверху, не таскается
  const card = document.querySelector('#pile .card--lime'); if (!card) return;
  card.insertAdjacentHTML('afterbegin', '<i class="card__hole" aria-hidden="true"></i>'); card.classList.add('card--hung');
  // её идея 25.11: карточку на верёвке тоже можно тащить — схватили, она перестаёт качаться и верёвка исчезает; ↺ возвращает всё
  // слои «Обо мне» (её правка 25.11): «курсы» (кремовая) над «образованием» (белая), игрушка над голубой «после работы»
  const pileItems = [...document.querySelectorAll('#pile .card, #pile .toy')];
  const zfix = () => { const z = [10, 11, 14, 13, 17, 18, 16]; /* курсы над образованием, но под «сильной стороной» */ pileItems.forEach((el, i) => { if (z[i] != null) el.style.zIndex = z[i]; }); };
  zfix(); document.querySelector('.pile__tidy')?.addEventListener('click', () => setTimeout(zfix, 50));
  const free = on => { card.classList.toggle('free', on); svg.classList.toggle('off', on); if (!on) setTimeout(draw, 950); };
  card.addEventListener('pointerdown', e => { if (e.button > 0) return; free(true); });
  document.querySelector('.pile__tidy')?.addEventListener('click', () => free(false));
  const svg = document.createElementNS(NS, 'svg'); svg.classList.add('longrope'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><linearGradient id="longGlass" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".25" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset=".75" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".75"/></linearGradient></defs><path class="longrope__p"/>';
  document.body.prepend(svg);
  const path = svg.querySelector('path'), grad = svg.querySelector('#longGlass');
  const draw = () => { const win = document.querySelector('.win'), hole = card.querySelector('.card__hole'); if (!win || !hole) return;
    svg.setAttribute('height', 0); svg.setAttribute('width', 0); // иначе верёвка сама держит высоту страницы → лишний отступ под футером после ↺
    const W = document.documentElement.scrollWidth, H = document.documentElement.scrollHeight, sy = scrollY, sx = scrollX;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const w = win.getBoundingClientRect(), h = hole.getBoundingClientRect();
    const a = { x: w.left + w.width / 2 + sx, y: w.bottom + sy - 2 }, b = { x: h.left + h.width / 2 + sx, y: h.top + h.height / 2 + sy };
    // путь (её правка 22:10): в блоке кейсов верёвка идёт строго по центральной оси — это якорь, по ней выровнены кейсы;
    // выше — плавный спуск от окна к оси, ниже — плавный подход к дырочке карточки
    const nc = document.querySelector('.nc'), r = nc ? nc.getBoundingClientRect() : null;
    const cx = r ? r.left + r.width / 2 + sx : a.x, top = r ? r.top + sy : a.y + 200, bot = r ? r.bottom + sy : b.y - 200;
    const k1 = Math.min(160, (top - a.y) / 2), k2 = Math.min(220, (b.y - bot) / 2), f = n => n.toFixed(1);
    const d = `M${f(a.x)} ${f(a.y)} C${f(a.x)} ${f(a.y + k1)} ${f(cx)} ${f(top - k1)} ${f(cx)} ${f(top)} L${f(cx)} ${f(bot)} C${f(cx)} ${f(bot + k2)} ${f(b.x)} ${f(b.y - k2)} ${f(b.x)} ${f(b.y)}`;
    path.setAttribute('d', d); grad.setAttribute('y1', a.y); grad.setAttribute('y2', b.y); };
  let t; const later = () => { clearTimeout(t); t = setTimeout(draw, 80); };
  addEventListener('load', draw); addEventListener('resize', later); new ResizeObserver(later).observe(document.body);
  document.querySelectorAll('img').forEach(i => i.addEventListener('load', later, { once: true }));
  setTimeout(draw, 600); setTimeout(draw, 2000);
  // «Обо мне» по её логике (Figma 252:10056, 25.11): буквы лежат ПОД карточками, слегка видны и сильно размыты (Layer Blur 12).
  // Первое касание карточки — появляется кнопка ↺. Чем больше букв открыто, тем резче: 6 шагов 12 → 10 → … → 0.
  // Резкость 0 — когда открыто 57 % площади букв (её розовая область во фрейме 270:5706 = 57 % букв), сверху ложится доп. слой.
  // Открытость считается по самим буквам (маска about-title.webp), а не по прямоугольнику надписи; проверка — elementFromPoint,
  // поэтому учитываются наклоны карточек. Считается только при перетаскивании и не чаще кадра.
  const pile = document.getElementById('pile'), word = pile && pile.querySelector('.pile__glass'), tidy = document.querySelector('.pile__tidy');
  if (pile && word) { word.insertAdjacentHTML('beforeend', '<i class="hi"></i>');
    const N = .57, STEPS = 6, MAX = 12; let pts = [], f0 = null, q = 0;
    const mask = new Image(); mask.src = 'assets/about-title.webp';
    mask.onload = () => { const c = document.createElement('canvas'), W = 112, H = 28; c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(mask, 0, 0, W, H);
      const a = g.getImageData(0, 0, W, H).data; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > 120) pts.push([(x + .5) / W, (y + .5) / H]);
      if (pts.length > 220) { const k = pts.length / 220; pts = pts.filter((_, i) => i % Math.ceil(k) === 0); } setTimeout(reveal, 400); };
    const vis = () => { const r = word.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight || !pts.length) return null; let free = 0, n = 0;
      for (const [u, v] of pts) { const x = r.left + u * r.width, y = r.top + v * r.height; if (y < 0 || y > innerHeight) continue; n++;
        const el = document.elementFromPoint(x, y); if (!el || !el.closest('#pile .card, #pile .toy')) free++; } return n ? free / n : null; };
    const reveal = () => { q = 0; const f = vis(); if (f === null) return; if (f0 === null) f0 = Math.min(f, .3);
      const t = Math.max(0, Math.min(1, (f - f0) / Math.max(.05, N - f0))), step = Math.round(t * STEPS);
      word.style.setProperty('--tb', (MAX * (1 - step / STEPS)).toFixed(0) + 'px'); word.classList.toggle('sharp', step === STEPS); word.dataset.step = step; };
    const tick = () => { if (!q) q = requestAnimationFrame(reveal); };
    // кнопка ↺: касание карточки = начало перемещения, кнопка появляется сразу и больше не прячется до нажатия на неё
    pile.addEventListener('pointerdown', e => { if (e.target.closest('.card, .toy') && tidy) tidy.hidden = false; }, true);
    pile.addEventListener('pointermove', e => { if (e.buttons) { if (tidy) tidy.hidden = false; tick(); } }); pile.addEventListener('pointerup', () => setTimeout(reveal, 300));
    tidy?.addEventListener('click', () => setTimeout(() => { reveal(); tidy.hidden = true; }, 950));
    addEventListener('scroll', () => { if (f0 === null) tick(); }, { passive: true }); addEventListener('resize', tick); }
})();
