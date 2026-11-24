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
  row('Первый экран · облака', 'sky1', [['.6', 'как сейчас'], ['.35', 'меньше'], ['.15', 'мало']], root.dataset.skyTop, true);
  document.body.appendChild(pick); set(mode);

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
    <button class="cx__m" type="button" data-copy-proxy2 title="Скопировать почту"><img src="assets/contacts/Email.svg" alt="" width="60" height="60"><img class="cx__mh" src="assets/contacts/hover/Email.png" alt="" width="60" height="60"><span>Почта</span></button>
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
    targets.forEach(t => { const b = t.el.getBoundingClientRect(), on = !t.el.closest('.folder.on') && getComputedStyle(t.el).opacity > .05; // раскрытая папка — дыру убираем сразу, без промежуточных кадров (иначе верёвки мигали)
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
    ${big('nc__big--3', '#case-path', '5x4', 'onboarding', '<em>+16</em> оформленных<br>сообществ авторами', 'апрель — июль 2025 · WEB · Mobile')}
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
  const ob = document.querySelector('.nc__big--3 img'); if (ob) ob.src = 'assets/cases/onboarding-v2.webp';
  // 2) карточка, на которой висит верёвка: дырочка сверху, не таскается
  const card = document.querySelector('#pile .card--lime'); if (!card) return;
  card.insertAdjacentHTML('afterbegin', '<i class="card__hole" aria-hidden="true"></i>'); card.classList.add('card--hung');
  card.addEventListener('pointerdown', e => e.stopImmediatePropagation(), { capture: true });
  const svg = document.createElementNS(NS, 'svg'); svg.classList.add('longrope'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><linearGradient id="longGlass" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".25" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset=".75" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".75"/></linearGradient></defs><path class="longrope__p"/>';
  document.body.prepend(svg);
  const path = svg.querySelector('path'), grad = svg.querySelector('#longGlass');
  const draw = () => { const win = document.querySelector('.win'), hole = card.querySelector('.card__hole'); if (!win || !hole) return;
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
})();
