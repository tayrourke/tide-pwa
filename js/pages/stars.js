(function (T) {
  const { esc, header, I } = T.ui;
  const A = window.TideAstro;
  const S = window.TideSky;
  const G = T.game;

  const GLYPH = {
    sun: '☉︎', moon: '☽︎', mercury: '☿︎', venus: '♀︎', mars: '♂︎', jupiter: '♃︎',
    saturn: '♄︎', uranus: '♅︎', neptune: '♆︎', pluto: '♇︎', node: '☊︎'
  };

  function spread(items, minDeg) {
    const list = items.map((it) => ({ ...it, show: it.lon }));
    for (let pass = 0; pass < 60; pass++) {
      list.sort((a, b) => a.show - b.show);
      let moved = false;
      for (let i = 0; i < list.length; i++) {
        const a = list[i], b = list[(i + 1) % list.length];
        const gap = ((b.show - a.show) + 360) % 360;
        if (list.length > 1 && gap < minDeg) {
          const push = (minDeg - gap) / 2 + 0.01;
          a.show -= push; b.show += push; moved = true;
        }
      }
      list.forEach((x) => (x.show = ((x.show % 360) + 360) % 360));
      if (!moved) break;
    }
    return list;
  }

  function wheel(trs, natalOnly) {
    const asc = A.NATAL.asc;
    const P = (lon, r) => { const t = Math.PI + (lon - asc) * Math.PI / 180; return [Math.cos(t) * r, -Math.sin(t) * r]; };
    const now = A.positions();
    let svg = '';
    // sign ring
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = P(i * 30, 162), [x2, y2] = P(i * 30, 138);
      svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(244,238,220,.25)" stroke-width="1"/>`;
      const [gx, gy] = P(i * 30 + 15, 150);
      svg += `<text x="${gx.toFixed(1)}" y="${gy.toFixed(1)}" class="w-sign ${i === 11 ? 'is-pisces' : ''}" text-anchor="middle" dominant-baseline="central">${A.SIGN_GLYPH[i]}</text>`;
    }
    // houses: cusp lines and numbers (Placidus or whole sign, from Settings)
    const cusps = A.CUSPS[A.houseSystem()];
    cusps.forEach((c, i) => {
      const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
      const [x1, y1] = P(c, 78), [x2, y2] = P(c, 138);
      svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(244,238,220,${isAngle ? .45 : .16})" stroke-width="${isAngle ? 1.2 : .8}"/>`;
      const next = cusps[(i + 1) % 12];
      const mid = c + (((next - c) + 360) % 360) / 2;
      const [hx, hy] = P(mid, 68);
      svg += `<text x="${hx.toFixed(1)}" y="${hy.toFixed(1)}" class="w-house" text-anchor="middle" dominant-baseline="central">${i + 1}</text>`;
    });
    // aspect lines for active transits
    trs.forEach((t) => {
      const [x1, y1] = P(A.NATAL[t.natal], 76);
      const [x2, y2] = P(now[t.transit].lon, 76);
      svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${t.easy ? '#8DC5C0' : '#E8B4A4'}" stroke-width="1.3" ${t.easy ? '' : 'stroke-dasharray="4 3"'} opacity=".85"/>`;
    });
    // angles
    [['asc', 'AC'], ['mc', 'MC']].forEach(([k, lbl]) => {
      const [x1, y1] = P(A.NATAL[k], 78), [x2, y2] = P(A.NATAL[k], 138);
      svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(216,180,97,.7)" stroke-width="1.2"/>`;
      const [lx, ly] = P(A.NATAL[k] + 6, 128);
      svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="w-angle" text-anchor="middle" dominant-baseline="central">${lbl}</text>`;
    });
    // natal planets
    const natal = spread(Object.keys(GLYPH).map((k) => ({ k, lon: A.NATAL[k] })), 12);
    natal.forEach((p) => {
      const [x, y] = P(p.show, 100), [tx, ty] = P(p.lon, 78);
      svg += `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="1.8" fill="#F4EEDC"/>`;
      svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="w-natal" text-anchor="middle" dominant-baseline="central">${GLYPH[p.k]}</text>`;
    });
    // transiting planets
    const tr = natalOnly ? [] : spread(A.BODIES.map((k) => ({ k, lon: now[k].lon })), 10);
    tr.forEach((p) => {
      const [x, y] = P(p.show, 124);
      svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="w-transit" text-anchor="middle" dominant-baseline="central">${GLYPH[p.k]}${now[p.k].retro ? '<tspan class="w-r" dx="1" dy="4">r</tspan>' : ''}</text>`;
    });
    return `<svg class="wheel-svg" viewBox="-172 -172 344 344" role="img" aria-label="Your natal chart with today’s planets around it">
      <defs><radialGradient id="wbg"><stop offset="0" stop-color="#2E3566"/><stop offset="1" stop-color="#141C3E"/></radialGradient></defs>
      <circle r="170" fill="url(#wbg)"/>
      <circle r="162" fill="none" stroke="rgba(244,238,220,.35)"/>
      <circle r="138" fill="none" stroke="rgba(244,238,220,.3)"/>
      <circle r="112" fill="none" stroke="rgba(244,238,220,.12)" stroke-dasharray="2 4"/>
      <circle r="78" fill="rgba(11,21,48,.5)" stroke="rgba(244,238,220,.2)"/>
      <circle r="58" fill="none" stroke="rgba(244,238,220,.08)"/>
      ${svg}
    </svg>`;
  }

  const B = window.TideBlueprint;

  function bodygraph() {
    const C = {
      Head: { d: 'M150 18 L176 60 L124 60 Z', x: 150, y: 46 },
      Ajna: { d: 'M124 74 L176 74 L150 116 Z', x: 150, y: 88 },
      Throat: { d: 'M128 136 H172 V180 H128 Z', x: 150, y: 158 },
      G: { d: 'M150 206 L180 236 L150 266 L120 236 Z', x: 150, y: 236 },
      Heart: { d: 'M190 276 L226 262 L218 292 Z', x: 211, y: 277 },
      Spleen: { d: 'M40 302 L40 356 L86 329 Z', x: 54, y: 329 },
      'Solar Plexus': { d: 'M260 302 L260 356 L214 329 Z', x: 246, y: 329 },
      Sacral: { d: 'M125 310 H175 V360 H125 Z', x: 150, y: 335 },
      Root: { d: 'M125 382 H175 V432 H125 Z', x: 150, y: 407 }
    };
    const LINKS = [['Head', 'Ajna'], ['Ajna', 'Throat'], ['Throat', 'G'], ['Throat', 'Spleen'], ['Throat', 'Heart'], ['Throat', 'Solar Plexus'], ['Throat', 'Sacral'],
      ['G', 'Sacral'], ['G', 'Spleen'], ['G', 'Heart'], ['Heart', 'Spleen'], ['Heart', 'Solar Plexus'], ['Sacral', 'Spleen'], ['Sacral', 'Solar Plexus'],
      ['Sacral', 'Root'], ['Spleen', 'Root'], ['Solar Plexus', 'Root']];
    const FILL = { Throat: '#B08A3C', Sacral: '#C75F5F', 'Solar Plexus': '#C2703D' };
    let svg = LINKS.map(([a, b]) => `<line x1="${C[a].x}" y1="${C[a].y}" x2="${C[b].x}" y2="${C[b].y}" stroke="rgba(244,238,220,.14)" stroke-width="5" stroke-linecap="round"/>`).join('');
    // your two channels: 20–34 (Throat to Sacral, left side) and 12–22 (Throat to Solar Plexus)
    svg += `<path d="M134 180 C 118 230, 118 270, 132 310" fill="none" stroke="#E8B4A4" stroke-width="6" stroke-linecap="round"/>`;
    svg += `<path d="M172 172 C 205 210, 230 260, 240 306" fill="none" stroke="#E8B4A4" stroke-width="6" stroke-linecap="round"/>`;
    Object.entries(C).forEach(([name, c]) => {
      const def = B.HD.defined.includes(name);
      svg += `<path d="${c.d}" fill="${def ? FILL[name] : 'rgba(244,238,220,.06)'}" stroke="${def ? 'rgba(255,243,214,.9)' : 'rgba(244,238,220,.45)'}" stroke-width="1.4" stroke-linejoin="round"/>`;
      const gs = B.HD.gates[name];
      if (gs.length) svg += `<text x="${c.x}" y="${c.y + (name === 'Head' ? 6 : name === 'Ajna' ? -2 : 0)}" class="bg-gates" text-anchor="middle" dominant-baseline="central">${gs.join(' ')}</text>`;
    });
    return `<svg class="bodygraph" viewBox="20 8 260 432" role="img" aria-label="Your Human Design bodygraph: Throat, Sacral and Solar Plexus defined, with the Channels of Charisma and Openness">${svg}</svg>`;
  }

  function seqCard(seq) {
    return `<article class="seq">
      <h3>${esc(seq.name)}</h3><p class="muted small-t">${esc(seq.blurb)}</p>
      <div class="seq-grid">${seq.spheres.map((sp) => {
        const k = B.GK[sp.key];
        return `<div class="sphere"><span class="sp-name">${esc(sp.sphere)}</span><b>${sp.key}.${sp.line}</b>
          <span class="sp-sgs">${esc(k[0])} › ${esc(k[1])} › ${esc(k[2])}</span><span class="sp-note">${esc(sp.note)}</span></div>`;
      }).join('')}</div></article>`;
  }

  const PLANET_NAMES = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto', node: 'North Node', asc: 'Ascendant', mc: 'Midheaven' };
  const ord = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');

  function blueprint() {
    const now = new Date();
    const py = B.personalYear(now), pm = B.personalMonth(now), pd = B.personalDay(now);
    return `
      <section class="block">
        <h2>Your birth chart</h2>
        <p class="muted small-t" style="margin-bottom:12px">March 13, 1997 · 8:30 pm · Los Angeles. ${A.houseSystem() === 'placidus' ? 'Placidus' : 'Whole sign'} houses (change in Settings).</p>
        <div class="wheel-card">${wheel([], true)}</div>
        <dl class="placements">${Object.keys(PLANET_NAMES).map((k) => {
          const lon = A.NATAL[k];
          const dm = Math.floor(lon % 30) + '°' + String(Math.floor((lon % 1) * 60)).padStart(2, '0') + '′';
          return `<div><dt><span aria-hidden="true">${GLYPH[k] || (k === 'asc' ? 'AC' : 'MC')}</span> ${PLANET_NAMES[k]}${k === 'mars' ? ' ℞' : ''}</dt><dd>${dm} ${A.signOf(lon)}${k === 'asc' || k === 'mc' ? '' : ' · ' + ord(A.houseOf(lon)) + ' house'}</dd></div>`;
        }).join('')}</dl>
      </section>

      <section class="block">
        <h2>Human Design</h2>
        <div class="hd-wrap">
          <div class="hd-graph">${bodygraph()}</div>
          <dl class="hd-facts">
            <div><dt>Type</dt><dd>${esc(B.HD.type)}</dd></div>
            <div><dt>Strategy</dt><dd>${esc(B.HD.strategy)}</dd></div>
            <div><dt>Authority</dt><dd>${esc(B.HD.authority)}</dd></div>
            <div><dt>Profile</dt><dd>${esc(B.HD.profile)}</dd></div>
            <div><dt>Definition</dt><dd>${esc(B.HD.definition)}</dd></div>
            <div><dt>Signature</dt><dd>${esc(B.HD.signature)}</dd></div>
            <div><dt>Not-self</dt><dd>${esc(B.HD.notSelf)}</dd></div>
          </dl>
        </div>
        <div class="hd-notes">
          <p><b>${esc(B.HD.cross)}.</b> ${esc(B.HD.crossNote)}</p>
          <p><b>Emotional authority.</b> ${esc(B.HD.authorityNote)}</p>
          <p><b>${esc(B.HD.profile)}.</b> ${esc(B.HD.profileNote)}</p>
          ${B.HD.channels.map((c) => `<p><b>${esc(c.name)} (${esc(c.gates)}).</b> ${esc(c.note)}</p>`).join('')}
        </div>
        <h3 class="open-h">Your open centers</h3>
        <ul class="open-list">${B.HD.open.map((o) => `<li><b>${esc(o.c)}</b><span>${esc(o.note)}</span></li>`).join('')}</ul>
      </section>

      <section class="block">
        <h2>Gene Keys</h2>
        ${seqCard(B.SEQUENCES.activation)}
        ${seqCard(B.SEQUENCES.venus)}
        ${seqCard(B.SEQUENCES.pearl)}
        <p class="muted small-t">Calculated from your birth data. Your free official profile at genekeys.com is there if you ever want to double-check.</p>
      </section>

      <section class="block">
        <h2>Numerology</h2>
        <article class="lp-card">
          <span class="lp-num">33</span>
          <div><b>Life Path 33 · ${esc(B.LIFE_PATH.title)}</b>
          <p><span>Gift.</span> ${esc(B.LIFE_PATH.gift)}</p>
          <p><span>Shadow.</span> ${esc(B.LIFE_PATH.shadow)}</p>
          <p><span>Practice.</span> ${esc(B.LIFE_PATH.practice)}</p></div>
        </article>
        <div class="num-row">
          <div><b>${py}</b><span>Personal year</span><small>${esc(B.NUM[py].word)}</small></div>
          <div><b>${pm}</b><span>Personal month</span><small>${esc(B.NUM[pm].word)}</small></div>
          <div><b>${pd}</b><span>Personal day</span><small>${esc(B.NUM[pd].word)}</small></div>
        </div>
      </section>`;
  }

  function venusCard() {
    if (!T.venusWindow) return '';
    const w = T.venusWindow();
    if (!w) return '';
    const now = new Date();
    if (now < w.preShadow || now > w.postShadow) return '';
    const inRetro = now >= w.retro.date && now < w.direct.date;
    const d = (x) => x.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `<a class="venus-banner" href="#/venus">
      <span class="v-glyph" aria-hidden="true">♀︎</span>
      <span><b>${inRetro ? 'Venus is retrograde' : now < w.retro.date ? 'Venus retrograde shadow' : 'Venus after-shadow'}</b>
      <small>${esc(d(w.retro.date))} – ${esc(d(w.direct.date))} · your chart ruler, retracing her steps</small></span>${I.chevron}
    </a>`;
  }

  function todayExtras() {
    const now = new Date();
    const g = B.gateOf(A.sunLon(now));
    const k = B.GK[g.gate];
    const mine = B.HD.allGates.includes(g.gate);
    const pd = B.personalDay(now), py = B.personalYear(now);
    return `
      <section class="block">
        <div class="day-cards">
          <article class="day-card">
            <span class="dc-label">Gene Key of the day</span>
            <b class="dc-big">${g.gate}</b>
            <p class="dc-sgs">${esc(k[0])} › <strong>${esc(k[1])}</strong> › ${esc(k[2])}</p>
            <p class="dc-note">The Sun is lighting Gate ${g.gate} for everyone.${mine ? ' It’s one of your own gates, so you’ll feel it more.' : ''} Notice ${esc(k[0].toLowerCase())} and choose ${esc(k[1].toLowerCase())}.</p>
          </article>
          <article class="day-card">
            <span class="dc-label">Personal day</span>
            <b class="dc-big">${pd}</b>
            <p class="dc-sgs"><strong>${esc(B.NUM[pd].word)}</strong> in a ${py} year</p>
            <p class="dc-note">${esc(B.NUM[pd].line)}</p>
          </article>
        </div>
      </section>`;
  }

  function segs(cur) {
    const tabs = [['today', 'Today', '#/sky'], ['calendar', 'Calendar', '#/sky?view=calendar'], ['blueprint', 'Blueprint', '#/sky?view=blueprint']];
    return `<div class="seg sky-seg" role="tablist">${tabs.map(([k, l, h]) => `<a class="seg-btn" role="tab" href="${h}" aria-selected="${k === cur}" ${k === cur ? 'aria-pressed="true"' : ''}>${l}</a>`).join('')}</div>`;
  }

  function calendarView() {
    const ev = T.calendar.events(new Date(), 120);
    const groups = {};
    ev.forEach((e) => { const k = e.date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); (groups[k] = groups[k] || []).push(e); });
    const filters = [['all', 'Everything'], ['big', 'Just the big ones']];
    return `
      <div class="chip-row cal-filters">${filters.map(([k, l], i) => `<button class="chip ${i ? '' : 'is-sel'}" data-cf="${k}">${l}</button>`).join('')}</div>
      ${Object.entries(groups).map(([m, list]) => `
        <section class="cal-month">
          <h2>${esc(m)}</h2>
          <ul class="cal-list">${list.map((e) => `
            <li class="cal-item kind-${e.kind} ${e.big ? 'is-big' : ''}">
              <div class="cal-date"><b>${e.date.getDate()}</b><span>${esc(e.date.toLocaleDateString(undefined, { weekday: 'short' }))}</span></div>
              <div class="cal-body">
                <b><span class="cal-icon" aria-hidden="true">${e.icon}</span>${esc(e.title)}</b>
                <p>${esc(e.text)}</p>
                ${e.link ? `<a class="cal-link" href="${e.link}">Open ${e.kind === 'sabbat' ? 'the family ritual' : 'the moon ritual'}</a>` : ''}
              </div>
            </li>`).join('')}</ul>
        </section>`).join('')}`;
  }

  T.pages.sky = {
    nav: 'sky',
    title: 'Your sky',
    render(el, params) {
      el.classList.remove('cal-big-only');
      const view = ['blueprint', 'calendar'].includes(params.view) ? params.view : 'today';
      if (view === 'calendar') {
        el.innerHTML = `${header('Your sky', { sub: 'The next four months, read through your chart.' })}${segs('calendar')}${calendarView()}`;
        el.querySelectorAll('[data-cf]').forEach((b) => (b.onclick = () => {
          el.querySelectorAll('[data-cf]').forEach((x) => x.classList.toggle('is-sel', x === b));
          el.classList.toggle('cal-big-only', b.dataset.cf === 'big');
          el.querySelectorAll('.cal-month').forEach((m) => { m.hidden = b.dataset.cf === 'big' && !m.querySelector('.is-big'); });
        }));
        return;
      }
      if (view === 'blueprint') {
        el.innerHTML = `${header('Your sky', { sub: 'The blueprint you were born with.' })}
          ${segs('blueprint')}
          ${blueprint()}`;
        return;
      }
      const reading = S.sky();
      const all = A.transits().filter((t, i, arr) => arr.findIndex((x) => x.transit === t.transit && x.natal === t.natal) === i).slice(0, 8);
      const reads = all.map(S.readTransit);
      const open = S.openRitual();
      const done = open && G.ensure().moonRituals.some((r) => r.lunation === open.date.toISOString());
      const next = S.nextLunations();
      const retro = S.retrogrades();
      const past = G.ensure().moonRituals.slice().reverse().slice(0, 6);
      const fmtDate = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      el.innerHTML = `
      ${header('Your sky', { sub: 'Today’s planets moving over the chart you were born with.' })}
      ${segs('today')}
      ${todayExtras()}

      <div class="wheel-card">
        ${wheel(reads)}
        <div class="wheel-legend">
          <span><i class="lg-natal"></i>Your birth chart</span>
          <span><i class="lg-transit"></i>Planets today</span>
          <span><i class="lg-easy"></i>Flowing</span>
          <span><i class="lg-edge"></i>Growing edge</span>
        </div>
      </div>

      <section class="block">
        <div class="moon-now">
          <span class="sky-glyph big" aria-hidden="true">${esc(reading.glyph)}</span>
          <div>
            <b>Moon in ${esc(reading.sign)} · ${esc(reading.phase)}</b>
            <span>Your house of ${esc(reading.houseName)}. ${esc(reading.signLine)}</span>
          </div>
        </div>
        ${retro.map((r) => `<p class="retro-note">${esc(r)}</p>`).join('')}
      </section>

      ${venusCard()}

      <section class="block">
        <h2>Your transits</h2>
        <p class="muted small-t" style="margin-bottom:12px">The strongest first. Faster planets color a day or two. Slower ones are longer chapters.</p>
        ${reads.length ? `<div class="transit-list">${reads.map((t) => `
          <article class="transit ${t.easy ? 'is-easy' : 'is-edge'}">
            <div class="transit-top"><span class="transit-glyphs" aria-hidden="true">${t.glyphs}</span><span class="tone ${t.easy ? 'is-easy' : 'is-edge'}">${esc(t.tone)}</span></div>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.line)}</p>
            <p class="transit-advice">${esc(t.advice)}</p>
            <span class="transit-when">${esc(t.when)}</span>
          </article>`).join('')}</div>` : '<p class="muted">A quiet sky today. Nothing major is touching your chart, so it’s a lovely day to simply make.</p>'}
      </section>

      <section class="block">
        <h2>Moon rituals</h2>
        ${open && !done ? `
          <a class="lunar-card is-open" href="#/ritual">
            <span class="lunar-big" aria-hidden="true">${open.type === 'new' ? '●' : '○'}</span>
            <span><b>${open.type === 'new' ? 'New' : 'Full'} moon in ${esc(open.sign)}</b><small>Your ritual is open now</small></span>${I.chevron}
          </a>` : ''}
        ${next.map((l) => {
          const lunar = S.LUNAR[l.sign];
          return `<div class="lunar-card">
            <span class="lunar-big" aria-hidden="true">${l.type === 'new' ? '●' : '○'}</span>
            <span><b>${l.type === 'new' ? 'New' : 'Full'} moon in ${esc(l.sign)}</b>
            <small>${esc(fmtDate(l.date))}</small>
            <small>Your house of ${esc(S.houseInfo(l.lon).house)}. ${l.type === 'new' ? 'Seeds of ' + esc(lunar.seed) + '.' : 'A time to release ' + esc(lunar.release) + '.'}</small></span>
          </div>`;
        }).join('')}
        ${past.length ? `<details class="drawer"><summary>Intentions and releases</summary>
          <ul class="made-list">${past.map((r) => `<li><time>${esc(new Date(r.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))}</time><span><b>${r.type === 'venus' ? 'Venus review' : r.type === 'new' ? 'Planted' : 'Released'} · ${esc(r.sign)}</b><br>${esc(r.intention || r.released || '')}</span></li>`).join('')}</ul>
        </details>` : ''}
      </section>`;
    }
  };
})(window.Tide);
