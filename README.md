# valetskaya-site

Сайт-портфолио: одна статическая страница на HTML, CSS и JS, без сборки и зависимостей.

## Файлы

- `index.html` — разметка и все тексты страницы
- `styles.css` — оформление (светлая и тёмная тема, адаптив под телефон)
- `script.js` — мобильное меню и год в подвале
- `favicon.svg` — иконка вкладки

## Что заменить

Откройте `index.html` и замените заглушки на свои данные:

1. «Имя Фамилия» — в `<title>`, логотипе и подвале
2. Профессию, город, заголовок и подзаголовок в первом блоке
3. Текст «Обо мне» и цифры (`X+`, `XX`)
4. Карточки проектов и услуги
5. Контакты: `you@example.com`, ссылки на Telegram и LinkedIn
6. `<meta name="description">` — описание для поисковиков

Фото: положите файл, например `photo.jpg`, рядом с `index.html` и замените блок `<div class="about-photo">…</div>` на
`<img class="about-photo" src="photo.jpg" alt="Имя Фамилия">`.

Цвет акцента меняется в `styles.css`, переменная `--accent`.

## Просмотр

Откройте `index.html` в браузере двойным щелчком.

## Публикация на GitHub Pages

Settings → Pages → Source: «Deploy from a branch», ветка `main`, папка `/ (root)`.
Сайт появится по адресу `https://emguseii.github.io/valetskaya-site/`.
