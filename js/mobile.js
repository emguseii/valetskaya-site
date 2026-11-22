/* v6 · Mobile: глаза по скроллу в «Обо мне», колода с подсказкой-движением и самосбросом, файлы, модалка кейса */
{
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement, clamp = v => Math.max(0, Math.min(1, v));
  const toastEl = $('.toast'); let tt;
  const toast = m => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2400); };

  Eyes($('#eyes'), 'scroll');

  // Облака-шейдер сгущаются на блоке кейсов
  Sky('#cases');

  // Стопка: смахни верхнюю. Подсказка — первая карточка сама слегка смахивается.
  // В конце — карточка «Это всё» с конфетти и «Смотреть сначала»: карточки аккуратно поднимаются на место по очереди, снизу.
  const deck = $('#deck'), cards = $$('.dc', deck), endCard = $('.dc--end', deck); let touched = false;
  const live = () => cards.filter(c => !c.classList.contains('out'));
  const layout = () => { live().forEach((c, i) => { c.style.setProperty('--i', Math.min(i, 2)); c.style.zIndex = 100 - i; c.classList.toggle('deep', i > 2); });
    if (live()[0] === endCard) confetti(); };
  const confetti = () => { if (reduce) return; const cv = $('.confetti', endCard), r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr; const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    const cols = ['#e4ff3a', '#ffffff', '#78b8ff', '#e4ff3a'], P = Array.from({ length: 90 }, () => ({ x: r.width / 2, y: r.height * .42, vx: (Math.random() - .5) * 9, vy: -Math.random() * 9 - 3, s: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .3, c: cols[Math.random() * 4 | 0] }));
    const t0 = performance.now(); (function f(now) { const t = now - t0; ctx.clearRect(0, 0, r.width, r.height);
      P.forEach(p => { p.vy += .28; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t / 1600); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (t < 1600) requestAnimationFrame(f); else ctx.clearRect(0, 0, r.width, r.height); })(t0); };
  const restart = () => { const back = cards.filter(c => c !== endCard);
    back.forEach(c => { c.classList.add('rise'); c.classList.remove('out'); c.style.setProperty('--x', '0px'); c.style.setProperty('--rot', '0deg'); });
    deck.classList.add('restarting'); setTimeout(() => deck.classList.remove('restarting'), 900);
    layout(); void deck.offsetWidth;
    back.slice().reverse().forEach((c, k) => setTimeout(() => c.classList.remove('rise'), reduce ? 0 : 60 + k * 70)); };
  endCard.querySelector('.dc__again').addEventListener('click', restart);
  cards.filter(c => c !== endCard).forEach(c => {
    let sx, sy, dx = 0, horiz = null;
    c.addEventListener('pointerdown', e => { if (c !== live()[0]) return; touched = true; sx = e.clientX; sy = e.clientY; dx = 0; horiz = null; c.setPointerCapture(e.pointerId); c.classList.add('drag'); });
    c.addEventListener('pointermove', e => { if (!c.hasPointerCapture(e.pointerId)) return; dx = e.clientX - sx;
      if (horiz === null && Math.abs(dx) + Math.abs(e.clientY - sy) > 6) horiz = Math.abs(dx) > Math.abs(e.clientY - sy);
      if (horiz) { c.style.setProperty('--x', dx + 'px'); c.style.setProperty('--rot', dx / 20 + 'deg'); } });
    const up = e => { if (!c.hasPointerCapture(e.pointerId)) return; c.releasePointerCapture(e.pointerId); c.classList.remove('drag');
      if (Math.abs(dx) > 80 || Math.abs(dx) < 5) { const d = dx < 0 ? -1 : 1; c.style.setProperty('--x', d * 130 + 'vw'); c.style.setProperty('--rot', d * 18 + 'deg'); c.classList.add('out'); layout(); }
      else { c.style.setProperty('--x', '0px'); c.style.setProperty('--rot', '0deg'); } };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  });
  layout();
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !touched && !reduce) { const top = cards[0]; setTimeout(() => { top.classList.remove('hint'); void top.offsetWidth; top.classList.add('hint'); }, 400); } }), { threshold: .6 }).observe(deck);

  // Закрытые файлы
  $$('[data-locked]').forEach(f => f.addEventListener('click', () => {
    const s = $('small', f); if (!s.dataset.o) s.dataset.o = s.innerHTML;
    f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake', 'plate-on');
    s.innerHTML = f.hasAttribute('data-nda') ? 'Покажу на&nbsp;созвоне без&nbsp;записи' : 'Дописываю, расскажу на&nbsp;созвоне';
    clearTimeout(f._t); f._t = setTimeout(() => { f.classList.remove('plate-on'); s.innerHTML = s.dataset.o; }, 2600);
  }));
  $$('[data-copy-btn]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copyBtn); toast('Почта скопирована'); } catch { toast(b.dataset.copyBtn); } }));

  // Док прячется у контактов
  const dock = $('.dock'), contacts = $('#contacts');
  // Док: прячется при прокрутке вниз (Safari iOS 26 в этот момент сжимает свою плавающую строку и не перекрывает его),
  // возвращается при прокрутке вверх; у контактов прячется совсем
  let lastY = scrollY;
  addEventListener('scroll', () => { const y = scrollY, down = y > lastY + 4, up = y < lastY - 4;
    const atContacts = contacts.getBoundingClientRect().top < innerHeight * .55;
    if (atContacts || (down && y > 200)) dock.classList.add('hide'); else if (up || y < 200) dock.classList.remove('hide');
    if (Math.abs(y - lastY) > 4) lastY = y; }, { passive: true });

  // Кейс — модалкой снизу, со своим адресом
  const modal = $('#modal'), body = $('#modal-body');
  const route = () => { const id = location.hash.slice(1);
    if (CASES[id]) openCaseModal(modal, body, id); else if (!modal.hidden) { modal.hidden = true; root.style.overflow = ''; } };
  // Пришли по прямой ссылке на кейс — × не уводит с сайта «назад», а закрывает модалку на месте
  let inside = false;
  addEventListener('hashchange', () => { inside = true; route(); }); route();
  const close = () => { if (inside && CASES[location.hash.slice(1)]) history.back(); else { history.replaceState(null, '', location.pathname + location.search); route(); } };
  $('.case-modal__x').addEventListener('click', close);
}
