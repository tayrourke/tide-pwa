(function (T) {
  const { esc, header, fmt, I } = T.ui;
  const st = T.store;
  const G = T.game;

  function grid(season) {
    return `<div class="t-grid">${season.items.map((it) => {
      const n = G.owned(it.id);
      return `<button class="t-cell ${n ? '' : 'is-missing'} rar-${it.rarity}" data-t="${it.id}" ${n ? '' : 'aria-disabled="true"'} aria-label="${n ? esc(it.name) : 'Not found yet'}">
        ${T.art(it, 52, { silhouette: !n })}
        <span class="t-name">${n ? esc(it.name) : (it.rarity === 'r' ? 'High tide only' : 'Still at sea')}</span>
        ${n > 1 ? `<span class="t-count">×${n}</span>` : ''}
      </button>`;
    }).join('')}</div>`;
  }

  T.pages.treasures = {
    nav: 'more',
    title: 'Treasures',
    render(el) {
      const s = G.ensure();
      const cur = G.currentSeason();
      const found = (season) => season.items.filter((i) => G.owned(i.id)).length;
      const others = T.SEASONS.filter((x) => x.id !== cur.id && found(x) > 0);
      const upcoming = T.SEASONS.filter((x) => x.id !== cur.id && found(x) === 0);
      const keys = Object.keys(s.days).sort().reverse().filter((k) => s.days[k].makes && s.days[k].makes.length).slice(0, 21);
      const makingDays = Object.values(s.days).filter((d) => d.done && d.done.make).length;
      const high = Object.keys(s.days).filter((k) => st.doneCount(k) === 6).length;

      el.innerHTML = `
      ${header('Treasures', { sub: 'Each day you make before you take, the sea leaves you one. Rare treasures only come on high-tide days, when you finish all six rituals.' })}

      <section class="season-card" style="--s-m:${cur.pal.m};--s-a:${cur.pal.a};--s-l:${cur.pal.l}">
        <div class="season-top">
          <div><span class="muted small-t">This season</span><h2>${esc(cur.name)}</h2></div>
          <span class="season-n">${found(cur)}<small>/8</small></span>
        </div>
        <p class="season-blurb">${esc(cur.blurb)}</p>
        ${grid(cur)}
        ${found(cur) === 8 ? '<p class="season-done">Collection complete. The whole season, gathered.</p>' : ''}
      </section>

      <div class="stats">
        <div><b>${makingDays}</b><span>making days</span></div>
        <div><b>${s.pearls}</b><span>pearls</span></div>
        <div><b>${s.coral.done}</b><span>coral grown</span></div>
        <div><b>${high}</b><span>high tides</span></div>
      </div>

      ${others.length ? `<section class="block"><h2>Past seasons</h2>${others.map((x) => `
        <details class="drawer season-drawer">
          <summary>${esc(x.name)} <span class="muted small-t">${found(x)} of 8</span></summary>
          ${grid(x)}
        </details>`).join('')}</section>` : ''}

      <section class="block">
        <h2>The year ahead</h2>
        <p class="muted small-t" style="margin-bottom:12px">The Wheel of the Year turns eight times. Each sabbat brings eight new treasures, so something new is always washing in.</p>
        <div class="wheel">${T.SEASONS.map((x) => `<span class="wheel-i ${x.id === cur.id ? 'is-now' : ''}" style="--c:${x.pal.m}"><i></i>${esc(x.name)}</span>`).join('')}</div>
      </section>

      <section class="block">
        <h2>Tide journal</h2>
        ${keys.length ? keys.map((k) => `
          <div class="log-day">
            <h3 class="log-date">${esc(fmt.long(fmt.fromKey(k)))}</h3>
            <ul class="made-list">${s.days[k].makes.map((m) => `<li><span>${esc(m.text)}</span></li>`).join('')}</ul>
          </div>`).join('') : '<p class="muted small-t">Everything you make shows up here, day by day.</p>'}
      </section>`;

      el.querySelectorAll('.t-cell:not(.is-missing)').forEach((b) => (b.onclick = () => {
        G.reveal({ type: 'treasure', tid: b.dataset.t, view: true });
      }));
    }
  };
})(window.Tide);
