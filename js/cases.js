/* Кейсы для модалки (web и mobile). Тексты — из case-1-statistika-short и site-case-descriptions-v1.
   Модалка: полоса прогресса сверху, справа штрихи-навигация по разделам, скроллбара нет. */
window.CASES = {
  'case-stat': {
    h: '<em>Восемь кабинетов статистики</em> → один раздел',
    meta: ['Июн — Дек 2024', 'WEB', 'Mobile'],
    lead: 'Собрала разрозненную статистику сообществ ВКонтакте в&nbsp;единый раздел для&nbsp;веба и&nbsp;мобилки. Мою библиотеку компонентов взяли другие продукты.',
    img: 'assets/case1-cover.webp',
    sections: [
      ['Коротко', '<dl class="cm__dl"><dt>Задача</dt><dd>Собрать единый раздел статистики, чтобы автор в&nbsp;одном месте видел рост и&nbsp;понимал, какой контент работает.</dd><dt>Ограничение</dt><dd>Каждая команда сохраняет свои метрики и&nbsp;сама развивает свою вкладку.</dd><dt>Моя роль</dt><dd>Концепт и&nbsp;структура раздела, макеты 10&nbsp;разделов для&nbsp;веба и&nbsp;мобилки, библиотека компонентов, прототип для&nbsp;тестов.</dd><dt>Результат</dt><dd>Запуск на&nbsp;вебе в&nbsp;декабре 2024, затем на&nbsp;мобилке. Решение масштабировали на&nbsp;профили.</dd></dl>'],
      ['Восемь статистик без&nbsp;владельца', '<p>Статистика была разбросана по&nbsp;восьми местам: сообщество, клипы, видео, истории, музыка, мини-приложения. Каждая команда делала свою «сбоку», поэтому логика, дизайн и&nbsp;названия метрик различались, а&nbsp;цифры не&nbsp;совпадали. Мобильная версия была урезана, хотя около половины авторов смотрят статистику с&nbsp;телефона.</p>'],
      ['Два раунда тестов', '<p>Немодерируемый тест мобилки на&nbsp;~300 админах нашёл две проблемы: вкладки за&nbsp;краем экрана не&nbsp;находили, а&nbsp;выбор периода внизу почти не&nbsp;замечали. Добавили подскролл табов и&nbsp;перенесли календарь наверх.</p><p class="cm__note">Вывод: структура, перенесённая с&nbsp;десктопа, ломается на&nbsp;мобилке в&nbsp;навигации.</p>'],
      ['Библиотека для&nbsp;других продуктов', '<p>Чтобы 10&nbsp;разделов на&nbsp;двух платформах работали одинаково, я&nbsp;собрала локальную библиотеку на&nbsp;основе дизайн-системы ВКонтакте: графики, таблицы, лэйауты, все состояния. Её используют кабинет автора VK&nbsp;Видео и&nbsp;страницы монетизации.</p>'],
      ['Что получилось', '<ul class="cm__ul"><li><b>8 → 1</b> автор видит эффект от&nbsp;всего контента на&nbsp;одном экране</li><li><b>×3,5</b> аудитория статистики профилей после масштабирования</li><li><b>Стандарт</b> мои компоненты используют другие команды</li></ul>'],
      ['Что сделала бы иначе', '<p>Договорилась бы о&nbsp;дашборде пострелизных метрик до&nbsp;запуска и&nbsp;проектировала бы мобилку параллельно с&nbsp;вебом.</p>']
    ]
  },
  'case-path': {
    h: 'Как помочь новому автору <em>не&nbsp;бросить сообщество</em>',
    meta: ['Мар — Июл 2025', 'WEB', 'Mobile'],
    lead: 'Новые авторы бросали создание сообщества на&nbsp;первом шаге, а&nbsp;созданное оставляли пустым, и&nbsp;в&nbsp;рекомендации оно не&nbsp;попадало. Я&nbsp;пересобрала путь: одна форма создания, оформление прямо в&nbsp;сообществе и&nbsp;блок, который даёт автору один шаг за&nbsp;раз.',
    img: 'assets/case2-cover.webp',
    sections: [
      ['Коротко', '<dl class="cm__dl"><dt>Задача</dt><dd>Упростить создание и&nbsp;довести автора до&nbsp;условий попадания в&nbsp;рекомендации.</dd><dt>Ограничение</dt><dd>В&nbsp;рекомендации попадают только оформленные и&nbsp;активные сообщества, а&nbsp;новый автор об&nbsp;этом не&nbsp;знал.</dd><dt>Моя роль</dt><dd>Дизайн всего трека на&nbsp;iOS, Android и&nbsp;вебе: точка входа, флоу создания, контекстный и&nbsp;блочный онбординг, страница загрузки обложки.</dd><dt>Результат</dt><dd>Онбординг на&nbsp;проде на&nbsp;всех платформах, механику перенесли на&nbsp;бизнес-сообщества и&nbsp;веб.</dd></dl>'],
      ['Что получилось', '<ul class="cm__ul"><li><b>до +16%</b> полностью оформленных сообществ</li><li><b>~+10%</b> авторов дошли до&nbsp;5 постов</li><li><b>+12–14%</b> сообществ готовы к&nbsp;рекомендациям</li></ul>']
    ]
  },
  'case-car': {
    h: 'Почему один дизайн <em>по&#8209;разному работает</em> на&nbsp;iOS и&nbsp;Android',
    meta: ['2025 — 2026', 'iOS', 'Android'],
    lead: 'Блок рекомендаций авторов в&nbsp;новой ленте ронял подписки. За&nbsp;четыре A/B&#8209;теста мы&nbsp;с&nbsp;продактом и&nbsp;аналитиком нашли вариант, который поднимает подписки на&nbsp;Android, и&nbsp;разобрались, почему iOS реагирует иначе.',
    img: 'assets/carousel-cover.webp',
    sections: [['Кейс в&nbsp;процессе', '<p>Полную версию расскажу на&nbsp;созвоне.</p>']]
  }
};

window.openCaseModal = function (modal, body, id) {
  const c = CASES[id]; if (!c) return false;
  const secs = c.sections || [];
  body.innerHTML = `<div class="cm__progress" aria-hidden="true"><i></i></div>
    <nav class="cm__nav" aria-label="Разделы кейса">${['Начало', ...secs.map(s => s[0])].map((t, i) => `<a href="#" data-i="${i}" aria-label="${t.replace(/&nbsp;/g, ' ')}"><span>${t}</span></a>`).join('')}</nav>
    <section class="cm__sec" data-i="0"><h2 class="cm__h" id="modal-h">${c.h}</h2>
      <div class="cm__meta">${c.meta.map(m => `<span class="chip">${m}</span>`).join('')}</div>
      <p class="cm__lead">${c.lead}</p><img class="cm__img" src="${c.img}" alt=""></section>
    ${secs.map((s, i) => `<section class="cm__sec" data-i="${i + 1}"><h3 class="cm__h3">${s[0]}</h3>${s[1].replace(/(<dt>.*?<\/dd>)/g, '<div>$1</div>')}</section>`).join('')}`;
  modal.hidden = false; document.documentElement.style.overflow = 'hidden';
  const scroller = modal.querySelector('.case-modal__in'); scroller.scrollTop = 0;
  scroller.focus({ preventScroll: true });
  const bar = body.querySelector('.cm__progress i'), links = [...body.querySelectorAll('.cm__nav a')], sections = [...body.querySelectorAll('.cm__sec')];
  const upd = () => {
    const max = scroller.scrollHeight - scroller.clientHeight; bar.style.transform = `scaleX(${max > 0 ? scroller.scrollTop / max : 1})`;
    let cur = 0; sections.forEach((s, i) => { if (s.offsetTop - scroller.clientHeight * .35 <= scroller.scrollTop) cur = i; });
    if (scroller.scrollTop >= max - 2) cur = sections.length - 1;
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  scroller.onscroll = upd; upd();
  links.forEach((a, i) => a.onclick = e => { e.preventDefault(); scroller.scrollTo({ top: sections[i].offsetTop - 24, behavior: 'smooth' }); });
  return true;
};
