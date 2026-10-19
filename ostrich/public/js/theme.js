// Применяем тему до отрисовки страницы, чтобы не было «мигания»
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* ignore */ }
})();
