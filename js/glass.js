/* Ветка glass · «жидкое стекло» карточек кейсов по Figma 73:1923 (эффект Glass: Refraction 100, Depth 61, Dispersion 100,
   Frost 0, Splay 100, Light −45° / 80 %). Преломление у краёв и радужная кайма — SVG-фильтр в backdrop-filter.
   Такой фильтр умеют только браузеры на Chromium (Chrome, Edge, Arc, Яндекс). Остальные — как было до (блюр) или 20 % фона. */
(() => {
  const ua = navigator.userAgentData;
  const chromium = ua ? ua.brands.some(b => /Chromium/.test(b.brand)) : /Chrome\//.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent) || /Edg\//.test(navigator.userAgent);
  const canLiquid = chromium && CSS.supports('backdrop-filter', 'url(#x)');
  const canBlur = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  const root = document.documentElement, KEY = { liquid: 'glass-liquid', blur: 'glass-blur', flat: 'glass-flat' };
  const auto = canLiquid ? 'liquid' : canBlur ? 'blur' : 'flat';

  const NS = 'http://www.w3.org/2000/svg';
  const holder = document.createElementNS(NS, 'svg');
  holder.setAttribute('aria-hidden', 'true');
  Object.assign(holder.style, { position: 'absolute', width: 0, height: 0, overflow: 'hidden' });
  document.body.appendChild(holder);

  // Карта смещений — одна картинка на обе оси: красный канал — сдвиг по X, зелёный — по Y.
  // У краёв (полоса band px) пиксели берутся «изнутри» — изгиб, как у толстого стекла; в середине смещения нет.
  // Оптимизация 23.11: 1 карта и 1 проход смещения вместо 2 карт и 6 проходов (≈×2 быстрее); радужная кайма — цветные кромки в CSS;
  // карта рисуется один раз в canvas (готовая PNG); фильтр работает только у элементов на экране.
  const ramp = (n, band) => { const b = Math.min(band, n / 3), p = v => (v / n * 100).toFixed(2) + '%';
    return [[0, 255], [b * .18, 236], [b * .45, 186], [b, 128], [n - b, 128], [n - b * .45, 70], [n - b * .18, 20], [n, 0]].map(([o, v]) => [p(o), v]); };
  const map = (w, h, band) => {
    const c = Object.assign(document.createElement('canvas'), { width: w, height: h }), g = c.getContext('2d');
    const grad = (x2, y2, n, col) => { const lg = g.createLinearGradient(0, 0, x2, y2);
      ramp(n, band).forEach(([o, v]) => lg.addColorStop(parseFloat(o) / 100, col(v))); return lg; };
    g.fillStyle = grad(w, 0, w, v => `rgb(${v},0,0)`); g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = grad(0, h, h, v => `rgb(0,${v},0)`); g.fillRect(0, 0, w, h);
    return c.toDataURL('image/png');
  };

  /* Что стеклим (23.11): одна настройка на вид элемента, одинаковые элементы делят один фильтр.
     Сила изгиба пропорциональна размеру: у маленьких — тоньше полоса и меньше сдвиг, иначе картинка «рвётся».
     Папки в герое (и закрытые, и открытая) остаются как были. */
  const KINDS = [
    { id: 'lq-case', sel: '.v7 .case', band: 54, scale: 70 }   // кейсы 430×524
    // 23.11: пробовали на папках и маленьких карточках — оставили только на кейсах (её решение)
  ];
  const build = () => {
    let html = '';
    KINDS.forEach(k => { const el = document.querySelector(k.sel); if (!el) return;
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight); if (!w || !h) return;
      html += `<filter id="${k.id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage href="${map(w, h, k.band)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>
        <feDisplacementMap in="SourceGraphic" in2="m" scale="${k.scale}" xChannelSelector="R" yChannelSelector="G"/>
      </filter>`; });
    if (holder.dataset.html !== html) { holder.innerHTML = html; holder.dataset.html = html; }
  };
  if (canLiquid) { build(); addEventListener('resize', () => { clearTimeout(build.t); build.t = setTimeout(build, 150); });
    // фильтр считается только у элементов в зоне видимости (класс .in-view)
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting)), { rootMargin: '100px' });
    KINDS.forEach(k => document.querySelectorAll(k.sel).forEach(el => io.observe(el))); }

  const apply = m => { Object.values(KEY).forEach(c => root.classList.remove(c)); root.classList.add(KEY[m]);
    const u = new URL(location); u.searchParams.set('glass', m); history.replaceState(null, '', u);
    $$sw.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
    note.hidden = !(m === 'liquid' && !canLiquid); };

  /* Переключатель (только в ветке glass): как выглядит сайт в разных типах браузеров.
     Доли — десктопные браузеры в России, Statcounter, июнь 2026: Chrome 51,2 + Яндекс 28,8 + Opera 7,6 + Edge 6,1 ≈ 94 % (все на Chromium);
     Firefox 2,9 + Safari 1,8 ≈ 5 %; браузеры без размытия — старые версии, меньше 1 %. */
  const sw = document.createElement('div'); sw.className = 'glasspick'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Стекло в разных браузерах');
  sw.innerHTML = `<div class="glasspick__head"><b>Стекло в браузерах</b>
    <button type="button" class="glasspick__fold" aria-expanded="true" aria-label="Свернуть панель"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
    <button type="button" data-m="liquid"><span>Жидкое стекло</span><small>Chrome, Яндекс, Opera, Edge · ≈94&nbsp;%</small></button>
    <button type="button" data-m="blur"><span>Размытие, как было</span><small>Safari, Firefox · ≈5&nbsp;%</small></button>
    <button type="button" data-m="flat"><span>Фон 20&nbsp;%</span><small>старые браузеры · &lt;1&nbsp;%</small></button>
    <em class="glasspick__note" hidden>Этот браузер не умеет жидкое стекло — открой в Chrome</em>
    <i>доли: десктоп, Россия, Statcounter, июнь 2026</i>`;
  document.body.appendChild(sw);
  const $$sw = [...sw.querySelectorAll('button[data-m]')], note = sw.querySelector('.glasspick__note');
  // шеврон: свернуть/развернуть панель, состояние запоминается в браузере
  const fold = sw.querySelector('.glasspick__fold'), setFold = v => { sw.classList.toggle('is-folded', v);
    fold.setAttribute('aria-expanded', String(!v)); fold.setAttribute('aria-label', v ? 'Развернуть панель' : 'Свернуть панель');
    try { localStorage.setItem('glasspick-folded', v ? '1' : ''); } catch (e) {} };
  fold.addEventListener('click', () => setFold(!sw.classList.contains('is-folded')));
  try { if (localStorage.getItem('glasspick-folded')) setFold(true); } catch (e) {}
  $$sw.forEach(b => b.addEventListener('click', () => apply(b.dataset.m)));
  const q = new URLSearchParams(location.search).get('glass');
  apply(KEY[q] ? q : auto);
})();
