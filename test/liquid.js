/* ТЕСТ · настоящее жидкое стекло (25.11, только тест — на прод не подключено).
   Эффект как её Glass в Figma (Refraction, Dispersion, Light −45°): у краёв фон за элементом изгибается, как в толстом стекле,
   по кромке — радужная кайма и блик сверху справа. Делается SVG-фильтром в backdrop-filter — так умеют только браузеры на Chromium
   (Chrome, Яндекс, Opera, Edge ≈ 94 %). В Safari и Firefox остаётся обычное размытие, как сейчас.
   Где стекло — выбирается в тестовой панели: строка «Жидкое стекло». Фильтр считается только у видимых элементов. */
(() => {
  const root = document.documentElement; if (root.dataset.v !== '2') return;
  const ua = navigator.userAgentData;
  const chromium = ua ? ua.brands.some(b => /Chromium/.test(b.brand)) : /Chrome\//.test(navigator.userAgent);
  if (!chromium || !CSS.supports('backdrop-filter', 'url(#x)')) { root.dataset.lqOff = '1'; return; }

  // Карта смещений для скруглённого прямоугольника: в полосе band у края пиксели берутся «изнутри» (по нормали к краю),
  // сила растёт к самой кромке. Красный канал — сдвиг по X, зелёный — по Y, 128 — без сдвига.
  const map = (w, h, r, band) => {
    const c = Object.assign(document.createElement('canvas'), { width: w, height: h }), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
    const hw = w / 2, hh = h / 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x + .5 - hw, py = y + .5 - hh, qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), out = Math.hypot(ox, oy), sd = out + Math.min(Math.max(qx, qy), 0) - r; // < 0 внутри
      const dist = -sd; let nx = 0, ny = 0;
      if (dist < band) { if (out > 0) { nx = ox / out; ny = oy / out; } else if (qx > qy) nx = 1; else ny = 1;
        nx *= Math.sign(px); ny *= Math.sign(py); const s = Math.pow(1 - Math.max(0, dist) / band, 2);
        nx *= -s; ny *= -s; } // берём пиксель ближе к центру
      const i = (y * w + x) * 4; d[i] = 128 + nx * 127; d[i + 1] = 128 + ny * 127; d[i + 2] = 128; d[i + 3] = 255; }
    g.putImageData(im, 0, 0); return c.toDataURL('image/png'); };

  const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  holder.setAttribute('aria-hidden', 'true'); Object.assign(holder.style, { position: 'absolute', width: 0, height: 0, overflow: 'hidden' });
  document.body.appendChild(holder);

  // что стеклим: группа (как в панели), селектор, радиус, полоса изгиба и сила сдвига — у маленьких тоньше, иначе картинка рвётся
  const KINDS = [
    { g: 'btn', id: 'lq-tidy', sel: '.pile__tidy', r: 999, band: 14, scale: 18 },
    { g: 'btn', id: 'lq-up', sel: '.foot__up', r: 999, band: 10, scale: 14 },
    { g: 'folder', id: 'lq-big', sel: '.h-fix .big', r: 25, band: 34, scale: 44, w: 328, h: 266 },
    { g: 'win', id: 'lq-win', sel: '.win', r: 28, band: 30, scale: 40 },
    { g: 'cover', id: 'lq-c1', sel: '.nc__big--1 .nc__cv', r: 0, band: 40, scale: 50 },
    { g: 'cover', id: 'lq-c2', sel: '.nc__big--2 .nc__cv', r: 0, band: 26, scale: 32 },
    { g: 'cover', id: 'lq-c3', sel: '.nc__big--3 .nc__cv', r: 0, band: 40, scale: 50 }
  ];
  const build = () => { let html = '';
    KINDS.forEach(k => { const el = document.querySelector(k.sel); if (!el) return;
      const w = Math.round(k.w || el.offsetWidth), h = Math.round(k.h || el.offsetHeight); if (!w || !h) return;
      const r = Math.min(k.r, w / 2, h / 2);
      html += `<filter id="${k.id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage href="${map(w, h, r, k.band)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>
        <feDisplacementMap in="SourceGraphic" in2="m" scale="${k.scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`; });
    holder.innerHTML = html; };
  const start = () => { build();
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('lq-in', e.isIntersecting)), { rootMargin: '120px' });
    KINDS.forEach(k => document.querySelectorAll(k.sel).forEach(el => { el.classList.add('lq', 'lq--' + k.g); el.style.setProperty('--lq', `url(#${k.id})`); io.observe(el); })); };
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
  addEventListener('resize', () => { clearTimeout(build.t); build.t = setTimeout(build, 200); });
})();
