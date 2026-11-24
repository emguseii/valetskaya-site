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
  // 0 · Общий масштаб блоков ниже первого экрана (её вопрос «сайт стал мельче»): множитель к масштабу A
  row('Весь сайт · масштаб', 'kz', [['1', '100 %'], ['1.1', '110 %'], ['1.2', '120 %']], '1');
  new MutationObserver(() => dispatchEvent(new Event('resize'))).observe(root, { attributes: true, attributeFilter: ['data-kz'] }); over();
  // Весь сайт: новый стиль «один акцент на экран» (24.11) / как было. Читается при загрузке — кнопка перезагружает страницу
  row('Весь сайт · стиль', 'style', [['new', 'новый · стильно, один акцент'], ['old', 'как было']], root.dataset.style, true);
  // 1 · Первый экран. Облака web.js читает при загрузке — кнопка перезагружает страницу (значение — в html[data-sky-top], ставит скрипт в <head>)
  row('Первый экран · облака', 'sky1', [['.6', 'как сейчас'], ['.35', 'меньше'], ['.15', 'мало'], ['0', 'чистое небо']], root.dataset.skyTop, true);
  // 2 · Кейсы
  row('Углы', 'corners', [['sharp', 'острые (Figma 222:3330)'], ['round', 'скруглённые (217:2820)']], 'sharp');
  root.dataset.bigf = 'plain'; // раскрытая папка без лаймовой обводки (Figma 41:205)
  row('Кейсы · сетка', 'cases', [['n1', 'NEW · Figma 238:8845'], ['e2', 'Т2 · по Figma 222:3330'], ['e1', 'С · стиль, моно'], ['e1o', 'С · стиль, RT Obligat'], ['s2', 'Ш2'], ['d1', 'Д1 · плитка']], 'n1');
  root.dataset.caseb = 'glass'; // 24.11: фон карточек кейсов — стекло
  // 3 · Обо мне
  root.dataset.abouth = 'over'; // 24.11: заголовок «Обо мне» — стекло поверх карточек
  root.dataset.aboutbg = 'none'; // подложки у «Обо мне» нет
  // 4 · Контакты
  row('Контакты · кнопки', 'cxb', [['rect', 'прямоугольники'], ['icons', 'иконки-стекло'], ['mono', 'иконки с подписью (Figma 234:8018)']], 'mono');
  document.body.appendChild(pick); set(mode);

  // Кейсы, швейцарская сетка: подпись блока (черновик текста — отредактируем, если раскладка понравится)
  document.querySelector('.cases__grid').insertAdjacentHTML('afterbegin', '<div class="cases-index"><b class="cases-index__h">Кейсы</b><span class="cases-index__m">(03) избранное<br>ВКонтакте<br>2024 — 2026</span></div>');
  // «Обо мне» стеклом (Figma 165:2635): форма букв — её вектор about-title.webp как маска, внутри — размытый и подсвеченный фон
  document.getElementById('pile').insertAdjacentHTML('afterbegin', '<div class="pile__glass" aria-hidden="true"><i class="bd"></i><i class="rim"></i></div>');
  // кромка букв: SVG-фильтр «форма минус сжатая форма» = светлый контур (filter нельзя вешать на родителя стекла — он отключает backdrop-filter)
  document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="glassRim" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="e"/><feComposite in="SourceGraphic" in2="e" operator="out"/></filter></svg>');
  // «Навести порядок» — круглая кнопка с иконкой «вернуть» (её просьба 24.11); подпись остаётся для экранных читалок и во всплывающей подсказке
  { const t = document.querySelector('.pile__tidy'); if (t) { t.setAttribute('aria-label', 'Навести порядок'); t.title = 'Навести порядок';
    t.innerHTML = '<svg class="replay" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3C4.55217 3.00007 4.99992 3.44783 5 4V6.3457C5.89841 5.23377 7.05365 4.34399 8.37793 3.76172C10.2496 2.93879 12.3458 2.77755 14.3213 3.30469C16.2966 3.8319 18.0343 5.01616 19.2471 6.66211C20.4597 8.30812 21.0759 10.3185 20.9941 12.3613C20.9122 14.4043 20.1365 16.3586 18.7959 17.9023C17.4553 19.446 15.6294 20.488 13.6182 20.8555C11.6069 21.2229 9.53026 20.8938 7.73047 19.9238C5.93071 18.9537 4.51372 17.3996 3.71484 15.5176C3.49947 15.0093 3.73694 14.4218 4.24512 14.2061C4.75333 13.9905 5.34076 14.2283 5.55664 14.7363C6.17797 16.2 7.27912 17.4086 8.67871 18.1631C10.0786 18.9176 11.6944 19.1735 13.2588 18.8877C14.8231 18.6018 16.2435 17.7915 17.2861 16.5908C18.3287 15.3901 18.9314 13.8702 18.9951 12.2812C19.0587 10.6924 18.5798 9.12885 17.6367 7.84863C16.6934 6.56844 15.3421 5.64638 13.8057 5.23633C12.2692 4.82635 10.6384 4.95175 9.18262 5.5918C7.87668 6.166 6.78247 7.12531 6.03906 8.33398H9.33398C9.88606 8.33418 10.3339 8.78189 10.334 9.33398C10.3339 9.88609 9.88606 10.3338 9.33398 10.334H4C3.44776 10.334 3.00007 9.88621 3 9.33398V4C3.00008 3.44778 3.44776 3 4 3Z"/></svg>'; } } // Web / Round Button / Replay (Figma 238:8138)
  // Подписи кейсов для Ш3–Ш5: номер, короткое название, год — вместо длинного заголовка в карточке (меньше букв)
  [['01', 'Новая статистика', '2024'], ['02', 'Путь нового автора', '2025'], ['03', 'Карусель авторов', '2025–2026']].forEach(([n, t, y], i) => {
    const c = document.querySelectorAll('.cases__grid .case')[i]; if (!c) return;
    c.insertAdjacentHTML('afterend', `<div class="case-cap case-cap--${i + 1}" aria-hidden="true"><span class="case-cap__n">${n}</span><b class="case-cap__t">${t}</b><span class="case-cap__y">${y}</span></div>`);
    c.nextElementSibling.addEventListener('click', () => c.click()); });
  // Роль — в заголовке окна (её выбор 24.11)
  document.querySelector('.win__top span').textContent = 'Продуктовый дизайнер.app'; // её комментарий в Figma 24.11

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
  // Кнопки контактов по её компоненту Figma 234:8018 «Button / Contacts» (24.11 вечером): иконка 60 (её PNG, белый 30 %) + подпись моно-капсом
  document.querySelector('.cx__icons').insertAdjacentHTML('afterend', `<div class="cx__mono">
    <a class="cx__m" href="${href('Telegram')}" target="_blank" rel="noopener"><img src="assets/contacts/Telegram.png" alt="" width="60" height="60"><span>Telegram</span></a>
    <a class="cx__m" href="${href('LinkedIn')}" target="_blank" rel="noopener"><img src="assets/contacts/Linkedin.png" alt="" width="60" height="60"><span>LinkedIn</span></a>
    <button class="cx__m" type="button" data-copy-proxy2 title="Скопировать почту"><img src="assets/contacts/Email.svg" alt="" width="60" height="60"><span>Почта</span></button>
    <a class="cx__m" href="${href('Резюме')}" target="_blank" rel="noopener"><img src="assets/contacts/CV.png" alt="" width="60" height="60"><span>Резюме</span></a></div>`);
  document.querySelector('[data-copy-proxy2]').addEventListener('click', () => mailBtn && mailBtn.click());

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



/* Т2 (Figma 222:3330): крупные подписи кейсов отдельными блоками в сетке; у мелких — её названия */
(() => { const cs = [...document.querySelectorAll('.cases__grid .case')];
  cs.forEach((c, i) => { const h = c.querySelector('.case__h'); if (!h) return;
    const d = document.createElement('div'); d.className = 'case-ob case-ob--' + (i + 1); d.setAttribute('aria-hidden', 'true'); d.innerHTML = h.innerHTML;
    d.addEventListener('click', () => c.click()); d.style.cursor = 'pointer'; c.parentNode.appendChild(d); });
  const T = ['Управление подписчиками', '<em>Компонент</em> → рекламный баннер', '<em>Кое-что</em> для профиля'];
  document.querySelectorAll('.files .file').forEach((f, i) => { if (!T[i]) return; f.insertAdjacentHTML('afterbegin', `<b class="file-ob" aria-hidden="true">${T[i]}</b>`); });
})();


/* Кейсы NEW (Figma 238:8845, её компоненты Case / Big и Case / Small, 24.11 вечером). Всё выровнено по центральной оси:
   большие кейсы слева кончаются у центра, справа — начинаются от центра; мелкие — колонкой справа от центра */
(() => { const cs = document.querySelector('.cases'); if (!cs) return;
  const big = (cls, href, ratio, img, h, m) => `<a class="nc__big ${cls}" href="${href}"><span class="nc__cv nc__cv--${ratio}"><img src="assets/cases/${img}.webp" alt="" loading="lazy"></span><span class="nc__d"><b class="nc__h">${h}</b><span class="nc__m">${m}</span></span></a>`;
  const small = (img, meta, h) => `<div class="nc__sm"><span class="nc__scv"><img src="assets/cases/${img}.webp" alt="" loading="lazy"><b class="nc__g">${meta}</b></span><b class="nc__sh">${h}</b></div>`;
  cs.insertAdjacentHTML('beforeend', `<div class="nc">
    ${big('nc__big--1', '#case-stat', '1x1', 'stat', '<em>new</em> статистика на web<br>и с нуля на mobile', 'июль — декабрь 2024 · WEB · Mobile')}
    ${big('nc__big--2', '#case-car', '3x2', 'carousel', '<em>4 A/B‑теста:</em> почему iOS<br>и Android реагировали<br>по‑разному', 'февраль 2025 · февраль 2026 · WEB · Mobile')}
    ${big('nc__big--3', '#case-path', '5x4', 'onboarding', '<em>+16</em> оформленных<br>сообществ авторами', 'апрель — июль 2025 · WEB · Mobile')}
    <span class="nc__more">(+3) ещё в работе</span>
    <div class="nc__small">
      ${small('subs', 'SPA · 2025 · в процессе', 'UX/UI Улучшения<br>раздела<br>подписчиков')}
      ${small('ad', 'DS · 2026', 'маркетинговый<br>компонент<br>для быстрого<br>запуска кампаний')}
      ${small('mediawall', 'NDA · 2026', 'Медиастена<br>профиля')}
    </div></div>`);
})();
