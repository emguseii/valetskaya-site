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

  // Карта смещений: у краёв (полоса BAND px) пиксели берутся «изнутри» — изгиб, как у толстого стекла; в середине — без смещения
  const BAND = 54, SCALE = 70, DISP = [1, 1.09, 1.18]; // DISP — разброс по каналам R/G/B: радужная кайма (Dispersion)
  const map = (w, h, axis) => {
    const n = axis === 'x' ? w : h, b = Math.min(BAND, n / 3), p = v => (v / n * 100).toFixed(2) + '%';
    const c = v => axis === 'x' ? `rgb(${v},128,128)` : `rgb(128,${v},128)`;
    const stops = [[0, 255], [b * .18, 236], [b * .45, 186], [b, 128], [n - b, 128], [n - b * .45, 70], [n - b * .18, 20], [n, 0]]
      .map(([o, v]) => `<stop offset="${p(o)}" stop-color="${c(v)}"/>`).join('');
    const g = axis === 'x' ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="0" y2="1"';
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="${NS}" width="${w}" height="${h}"><defs><linearGradient id="g" ${g}>${stops}</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
  };

  const build = () => {
    const card = document.querySelector('.v7 .case'); if (!card) return;
    const w = Math.round(card.offsetWidth), h = Math.round(card.offsetHeight);
    if (holder.dataset.size === w + 'x' + h) return; holder.dataset.size = w + 'x' + h;
    const ch = (k, i) => {
      const m = [0, 1, 2].map(j => j === i ? [0, 1, 2, 3, 4].map(k => +(k === j)).join(' ') : '0 0 0 0 0'); // оставляем только свой канал
      return `<feDisplacementMap in="SourceGraphic" in2="mx" scale="${SCALE * k}" xChannelSelector="R" yChannelSelector="G" result="dx${i}"/>
        <feDisplacementMap in="dx${i}" in2="my" scale="${SCALE * k}" xChannelSelector="R" yChannelSelector="G" result="d${i}"/>
        <feColorMatrix in="d${i}" type="matrix" values="${m.join(' ')} 0 0 0 1 0" result="c${i}"/>`;
    };
    holder.innerHTML = `<filter id="liquid" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage href="${map(w, h, 'x')}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="mx"/>
      <feImage href="${map(w, h, 'y')}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="my"/>
      ${DISP.map(ch).join('')}
      <feComposite in="c0" in2="c1" operator="arithmetic" k2="1" k3="1" result="rg"/>
      <feComposite in="rg" in2="c2" operator="arithmetic" k2="1" k3="1"/>
    </filter>`;
  };
  if (canLiquid) { build(); addEventListener('resize', () => { clearTimeout(build.t); build.t = setTimeout(build, 150); }); }

  const apply = m => { Object.values(KEY).forEach(c => root.classList.remove(c)); root.classList.add(KEY[m]);
    const u = new URL(location); u.searchParams.set('glass', m); history.replaceState(null, '', u);
    $$sw.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
    note.hidden = !(m === 'liquid' && !canLiquid); };

  /* Переключатель (только в ветке glass): как выглядит сайт в разных типах браузеров.
     Доли — десктопные браузеры в России, Statcounter, июнь 2026: Chrome 51,2 + Яндекс 28,8 + Opera 7,6 + Edge 6,1 ≈ 94 % (все на Chromium);
     Firefox 2,9 + Safari 1,8 ≈ 5 %; браузеры без размытия — старые версии, меньше 1 %. */
  const sw = document.createElement('div'); sw.className = 'glasspick'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Стекло в разных браузерах');
  sw.innerHTML = `<b>Стекло в браузерах</b>
    <button type="button" data-m="liquid"><span>Жидкое стекло</span><small>Chrome, Яндекс, Opera, Edge · ≈94&nbsp;%</small></button>
    <button type="button" data-m="blur"><span>Размытие, как было</span><small>Safari, Firefox · ≈5&nbsp;%</small></button>
    <button type="button" data-m="flat"><span>Фон 20&nbsp;%</span><small>старые браузеры · &lt;1&nbsp;%</small></button>
    <em class="glasspick__note" hidden>Этот браузер не умеет жидкое стекло — открой в Chrome</em>
    <i>доли: десктоп, Россия, Statcounter, июнь 2026</i>`;
  document.body.appendChild(sw);
  const $$sw = [...sw.querySelectorAll('button')], note = sw.querySelector('.glasspick__note');
  $$sw.forEach(b => b.addEventListener('click', () => apply(b.dataset.m)));
  const q = new URLSearchParams(location.search).get('glass');
  apply(KEY[q] ? q : auto);
})();
