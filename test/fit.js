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
  row('Роль:', 'role', [['bubble', 'бабл'], ['window', 'в заголовке окна'], ['line', 'строкой'], ['tag', 'биркой']], 'tag');
  row('Папки:', 'folder', [['glass', 'стекло'], ['solid', 'непрозрачные']], 'glass');
  row('Фон кейсов:', 'caseb', [['glass', 'стекло (сейчас)'], ['blue', 'синий'], ['light', 'светлее неба'], ['deep', 'тёмно-синий'], ['white', 'белый · синий акцент'], ['marker', 'белый · лаймовый маркер']], 'white');
  row('Кейсы:', 'cases', [['now', 'как сейчас'], ['s1', 'Ш1 · индекс слева'], ['s2', 'Ш2 · крупный + два']], 's1');
  // верёвки: web.js читает при загрузке — переключение перезагружает страницу
  { const l = document.createElement('span'); l.textContent = 'Верёвки:'; l.style.marginLeft = '8px'; pick.appendChild(l);
    const curR = q.get('rope') === 'phys' ? 'phys' : 'now';
    [['now', 'как сейчас'], ['phys', 'физика']].forEach(([v, t]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', String(v === curR));
      b.addEventListener('click', () => { const u = new URL(location); u.searchParams.set('rope', v); location.href = u; }); pick.appendChild(b); }); }
  pick.appendChild(desc); document.body.appendChild(pick); set(mode);

  // Кейсы, швейцарская сетка: подпись блока (черновик текста — отредактируем, если раскладка понравится)
  document.querySelector('.cases__grid').insertAdjacentHTML('afterbegin', '<div class="cases-index"><span class="cases-index__l">кейсы · 2024–2026 · ВКонтакте</span><b class="cases-index__h">Кейсы</b><p class="cases-index__p">Статистика сообществ, путь нового автора и&nbsp;лента рекомендаций — от&nbsp;гипотезы до&nbsp;релиза.</p></div>');
  // Роль: элементы для вариантов «в окне», «строкой», «биркой»
  const stage = document.getElementById('stage'), winT = document.querySelector('.win__top span');
  const line = document.createElement('b'); line.className = 'role-line'; line.innerHTML = '<em>Product</em><br>designer'; stage.appendChild(line);
  const tag = document.createElement('div'); tag.className = 'role-tag'; tag.innerHTML = '<i></i><span>роль</span><b>Продуктовый<br>дизайнер</b>'; stage.appendChild(tag);
  stage.insertAdjacentHTML('beforeend', '<svg class="role-rope" viewBox="0 0 1440 900" aria-hidden="true"><path d="M948 170C962 176 974 172 982 160 990 148 994 140 998 134"/></svg>');
  const roleSync = () => { winT.textContent = root.dataset.role === 'window' ? 'Валя.app — Product Designer' : 'Валя.app'; };
  new MutationObserver(roleSync).observe(root, { attributes: true, attributeFilter: ['data-role'] }); roleSync();

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
