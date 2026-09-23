/* Tide — router & boot */
(function (T) {
  const st = T.store;
  const view = document.getElementById('view');
  let current = null;
  let lastDay = null;

  const ROUTES = [
    [/^\/?$/, 'pool'],
    [/^\/(surf|sos)$/, 'surf'],
    [/^\/sit$/, 'sit'],
    [/^\/gut$/, 'gut'],
    [/^\/make$/, 'make'],
    [/^\/(treasures|log)$/, 'treasures'],
    [/^\/affirm$/, 'affirm'],
    [/^\/sky$/, 'sky'],
    [/^\/sabbat$/, 'sabbat'],
    [/^\/venus$/, 'venus'],
    [/^\/ritual$/, 'ritual'],
    [/^\/rhythm$/, 'rhythm'],
    [/^\/reflect$/, 'reflect'],
    [/^\/design$/, 'design'],
    [/^\/more$/, 'more'],
    [/^\/settings$/, 'settings']
  ];

  function parse() {
    const raw = (location.hash || '#/').slice(1);
    const [path, qs] = raw.split('?');
    const params = {};
    if (qs) qs.split('&').forEach((p) => { const [k, v] = p.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    for (const [re, name, keys] of ROUTES) {
      const m = path.match(re);
      if (m) { (keys || []).forEach((k, i) => (params[k] = m[i + 1])); return { name, params }; }
    }
    return { name: 'pool', params };
  }

  function render() {
    const { name, params } = parse();
    const page = T.pages[name] || T.pages.pool;
    if (current && current.leave) current.leave();
    current = page;
    lastDay = st.today();

    view.classList.remove('enter');
    void view.offsetWidth;
    page.render(view, params);
    view.classList.add('enter');

    document.title = (page.title && name !== 'pool' ? page.title + ' · ' : '') + 'Tide';
    document.querySelectorAll('.tab').forEach((t) => {
      const on = t.dataset.nav === page.nav;
      t.classList.toggle('is-active', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    document.body.dataset.page = name;
    window.scrollTo(0, 0);
    const h = view.querySelector('.page-title');
    if (h && T._navigated) h.focus({ preventScroll: true });
    T._navigated = true;
  }

  T.applyTheme = function () {
    const t = st.s.settings.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#142230' : '#E9F0EF');
  };

  T.refresh = render;

  function hideBoot() {
    const boot = document.getElementById('boot');
    if (!boot || boot.classList.contains('is-gone')) return;
    boot.classList.add('is-gone');
    setTimeout(() => { if (boot.parentNode) boot.remove(); }, 600);
  }

  function finishBoot() {
    const started = window.__tideBoot || performance.now();
    const wait = Math.max(0, 1600 - (performance.now() - started));
    setTimeout(() => { if (!T._updating) hideBoot(); }, wait);
  }

  st.load();
  if (window.TideAstro) TideAstro.setHouseSystem(st.s.settings.houseSystem || 'placidus');
  T.applyTheme();
  window.addEventListener('hashchange', render);
  // New day while the app stays open (common for home-screen PWAs)
  const checkDay = () => { if (lastDay && lastDay !== st.today()) render(); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDay(); });
  setInterval(checkDay, 60000);
  render();
  finishBoot();

  // A new version takes over behind the load screen, then the app reloads once.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      T._updating = true;
      const word = document.getElementById('bootWord');
      if (word) { word.textContent = 'Inhale'; word.classList.remove('is-out'); }
      location.reload();
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => reg.update()).catch(() => {});
    });
  }
})(window.Tide);
