# kapital-site — витрина «Капитал Детям»

Публичный репозиторий GitHub Pages сайта капиталдетям.рф.

⚠️ НЕ коммитить сюда руками: ветка gh-pages полностью перезаписывается
автоматическим деплоем из приватного репозитория stasdodesign/Invest-now
(peaceiris/actions-gh-pages, force push при каждом мерже в main).

Схема:
- Invest-now (приватный) — исходный код: Vite + React + TS
- Invest-now → Actions → сборка dist/ → force push в gh-pages этого репо
- Домены: капиталдетям.рф (apex, A 185.199.108–111.153),
  www → CNAME stasdodesign.github.io, HTTPS — Let's Encrypt
- CNAME, .nojekyll, 404.html — часть сборки (в public/ проекта Invest-now)

Сайт: https://капиталдетям.рф
