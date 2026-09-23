(function (T) {
  const { esc, fmt, greeting } = T.ui;
  const st = T.store;
  const G = T.game;

  const W = 360, H = 340, SAND = 294;
  const surfaceFor = (level) => 264 - level * 96; // 264 low tide … 168 high tide, so the sky always shows

  /* Your Pisces constellation: one star per ritual, tied at the knot by making */
  const CONST = [
    { id: 'unplug', x: 66, y: 84 }, { id: 'still', x: 98, y: 100 }, { id: 'present', x: 128, y: 118 },
    { id: 'make', x: 160, y: 140 }, { id: 'move', x: 196, y: 118 }, { id: 'serve', x: 226, y: 92 }
  ];
  const FISH_RINGS = [[50, 70], [242, 74]];

  function constellation(done, reflect) {
    const lit = (id) => !!done[id];
    const all = CONST.every((p) => lit(p.id));
    let out = '';
    for (let i = 0; i < CONST.length - 1; i++) {
      const a = CONST[i], b = CONST[i + 1];
      const on = lit(a.id) && lit(b.id);
      out += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#F4EEDC" stroke-width="${on ? 1.1 : .6}" stroke-opacity="${on ? .6 : .12}" ${on ? '' : 'stroke-dasharray="2 4"'}/>`;
    }
    FISH_RINGS.forEach(([cx, cy]) => {
      for (let k = 0; k < 6; k++) {
        const a = k * 60 * Math.PI / 180;
        out += `<circle cx="${(cx + Math.cos(a) * 11).toFixed(1)}" cy="${(cy + Math.sin(a) * 8).toFixed(1)}" r="${all ? 1.4 : .8}" fill="#F4EEDC" opacity="${all ? .85 : .2}"/>`;
      }
    });
    CONST.forEach((p) => {
      const on = lit(p.id);
      out += on
        ? `<g ${reflect ? '' : `data-star="${p.id}"`}><circle cx="${p.x}" cy="${p.y}" r="9" fill="url(#glow)"/><circle cx="${p.x}" cy="${p.y}" r="2.8" fill="#FFF8EA" class="${reflect ? '' : 'twinkle'}"/>${reflect ? '' : `<circle cx="${p.x}" cy="${p.y}" r="16" fill="transparent"/>`}</g>`
        : `<g ${reflect ? '' : `data-star="${p.id}"`}><circle cx="${p.x}" cy="${p.y}" r="1.8" fill="#F4EEDC" opacity=".35"/>${reflect ? '' : `<circle cx="${p.x}" cy="${p.y}" r="16" fill="transparent"/>`}</g>`;
    });
    if (all && !reflect) out += `<text x="146" y="64" fill="#F4EEDC" opacity=".6" font-size="9" font-style="italic" font-family="Fraunces, Georgia, serif" text-anchor="middle">the fishes, complete</text>`;
    return out;
  }

  function lifetimeStars() {
    const { small, moons } = G.skyStars();
    let seed = 42, out = '';
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < Math.min(small, 160); i++) {
      const x = 8 + rnd() * (W - 16), y = 10 + rnd() * 150;
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + rnd() * .7).toFixed(2)}" fill="#FFE9C2" opacity=".9" class="star" style="animation-delay:${(rnd() * 6).toFixed(1)}s"/>`;
    }
    moons.forEach((m, i) => {
      const x = 250 + ((i * 47) % 90), y = 96 + ((i * 29) % 60);
      const c = m.type === 'full' ? '#F4EEDC' : '#E8B4A4';
      out += `<path transform="translate(${x} ${y}) scale(.22)" d="M0 -30 C2 -8 8 -2 30 0 C8 2 2 8 0 30 C-2 8 -8 2 -30 0 C-8 -2 -2 -8 0 -30Z" fill="${c}" class="star" opacity=".95"/>`;
    });
    return out;
  }

  const FISH = [
    { id: 'sun', label: 'Sun in Pisces', note: 'Who you are: feeling, imagination, the ocean itself.', body: '#E3B85A', fin: '#C9963A', size: 1 },
    { id: 'mercury', label: 'Mercury in Pisces', note: 'How you think and speak: in images, stories and downloads.', body: '#BFD6D6', fin: '#8FB3B3', size: .9 },
    { id: 'venus', label: 'Venus in Pisces', note: 'Your chart ruler, exalted. Beauty is how you create.', body: '#E8A89A', fin: '#D1847A', size: 1.12 }
  ];

  function allAsks() {
    const out = [];
    T.DATA.KEYS.forEach((k) => k.asks.forEach((a) => out.push({ a, src: 'Gene Key ' + k.key + ' · ' + k.gift })));
    T.DATA.EXTRA_ASKS.forEach((a) => out.push({ a, src: 'North Node Virgo' }));
    return out;
  }
  function askOfDay() {
    const asks = allAsks(), d = new Date();
    const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    return asks[doy % asks.length];
  }

  function tideWords(n) {
    if (n === 0) return 'Low tide';
    if (n < 3) return 'The tide is coming in';
    if (n < 6) return 'Rising tide';
    return 'High tide';
  }

  function stars() {
    let seed = 7, out = '';
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = rnd() * 170, r = rnd() * 1.1 + .35;
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#F4EEDC" class="star" style="animation-delay:${(rnd() * 6).toFixed(1)}s"/>`;
    }
    return out;
  }

  function fishSVG(f) {
    return `<g class="fish" data-fish="${f.id}">
      <g class="fish-flip">
        <g class="fish-body" transform="scale(${f.size})">
          <path class="fish-tail" d="M-9 0 L-19 -7 Q-16 0 -19 7 Z" fill="${f.fin}"/>
          <ellipse cx="0" cy="0" rx="12" ry="5.8" fill="${f.body}"/>
          <path d="M-2 -5 Q2 -10 6 -5" fill="${f.fin}" opacity=".9"/>
          <circle cx="6.5" cy="-1.3" r="1.3" fill="#1B2A3A"/>
        </g>
      </g>
    </g>`;
  }

  function sandTreasures(list) {
    const recent = list.slice(-13);
    return recent.map((t, i) => {
      const x = 92 + i * 20 + (i % 2 ? 6 : 0);
      const y = SAND + 10 + (i % 3) * 9;
      const rot = ((i * 37) % 50) - 25;
      return `<g transform="translate(${x - 13} ${y - 13}) rotate(${rot} 13 13)" class="sand-t"><svg width="26" height="26" viewBox="0 0 60 60">${T.artInner(T.TREASURE[t.tid])}</svg></g>`;
    }).join('');
  }

  function pearlsSVG(n) {
    const shown = Math.min(n, 14);
    let out = '';
    for (let i = 0; i < shown; i++) {
      const x = 330 - (i % 5) * 7 - Math.floor(i / 5) * 3;
      const y = SAND + 34 - Math.floor(i / 5) * 6;
      out += `<circle cx="${x}" cy="${y}" r="3.2" fill="#F7F3EA" stroke="#D8CFC0" stroke-width=".6"/>`;
    }
    return out;
  }

  function clouds(sky) {
    if (sky.id === 'night') return '';
    const c = sky.id === 'day' ? '#FFFFFF' : '#F5D9CC';
    return `<g class="clouds" opacity="${sky.id === 'day' ? .7 : sky.id === 'dusk' ? .18 : .4}">
      <g class="cloud cloud-a"><ellipse cx="60" cy="70" rx="34" ry="10" fill="${c}"/><ellipse cx="78" cy="63" rx="20" ry="10" fill="${c}"/></g>
      <g class="cloud cloud-b"><ellipse cx="190" cy="110" rx="28" ry="8" fill="${c}"/><ellipse cx="204" cy="104" rx="15" ry="8" fill="${c}"/></g>
    </g>`;
  }

  function rocks(sky) {
    const dark = sky.id === 'night' || sky.id === 'dusk';
    const r1 = dark ? '#1E2F3E' : '#566B73', r2 = dark ? '#2A3E4F' : '#6F858B', dot = dark ? '#3C5263' : '#C9C2B2';
    return `<g class="rocks">
      <path d="M0 150 Q14 140 26 158 Q40 176 34 214 Q30 250 44 ${SAND + 4} L0 ${H}Z" fill="${r1}"/>
      <path d="M0 196 Q20 190 30 214 Q38 240 58 ${SAND + 2} L0 ${H}Z" fill="${r2}"/>
      <path d="M${W} 176 Q${W - 18} 170 ${W - 30} 190 Q${W - 44} 214 ${W - 38} 246 Q${W - 34} 272 ${W - 56} ${SAND + 4} L${W} ${H}Z" fill="${r1}"/>
      <path d="M${W} 226 Q${W - 16} 222 ${W - 24} 244 Q${W - 30} 266 ${W - 44} ${SAND + 2} L${W} ${H}Z" fill="${r2}"/>
      ${[[12, 172], [20, 186], [9, 220], [26, 236], [W - 14, 196], [W - 26, 214], [W - 12, 250], [W - 22, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${dot}"/>`).join('')}
    </g>`;
  }

  function goalLine(n, d) {
    const aw = d.awarded || {};
    let msg;
    if (n >= 6) msg = 'High tide. Every star is lit.';
    else if (aw.make) msg = `Treasure found. Light all six for a rare one.`;
    else msg = `Light ${4 - n} more star${4 - n === 1 ? '' : 's'} and the sea brings you a treasure.`;
    return `<div class="goal" id="goal">
      <div class="goal-dots" aria-hidden="true">${[1, 2, 3, 4, 5, 6].map((i) => `<i class="${i <= n ? 'on' : ''} ${i === 4 ? 'mark' : ''} ${i === 6 ? 'rare' : ''}"></i>`).join('')}</div>
      <p class="goal-msg" id="goalMsg">${esc(msg)}</p>
    </div>`;
  }

  function sabbatBanner() {
    if (!T.sabbats) return '';
    const { open, next } = T.sabbats.current();
    const x = open || next;
    const days = Math.round((x.date - new Date(new Date().toDateString())) / 864e5);
    if (!open && days > 5) return '';
    const rec = T.sabbats.record(x);
    if (rec.done) return '';
    return `<a class="sabbat-banner" href="#/sabbat" style="--s-m:${x.s.pal.m};--s-l:${x.s.pal.l}">
      <span class="sb-glyph" aria-hidden="true">❋</span>
      <span><b>${esc(x.s.name)} with the girls ${esc(T.sabbats.whenWord(x.date))}</b><small>${esc(T.sabbats.GLOSS[x.s.id])} · your family ritual is ready</small></span>${T.ui.I.chevron}
    </a>`;
  }

  function venusBanner() {
    if (!T.venusWindow) return '';
    const w = T.venusWindow();
    if (!w) return '';
    const now = new Date();
    if (now < w.retro.date || now > w.direct.date) return '';
    const week = Math.floor((now - w.retro.date) / (7 * 864e5)) + 1;
    return `<a class="venus-banner" href="#/venus"><span class="v-glyph" aria-hidden="true">♀︎</span>
      <span><b>Venus retrograde · week ${week}</b><small>Your chart ruler is retracing her steps. Revisit, don’t launch.</small></span>${T.ui.I.chevron}</a>`;
  }

  function scrollBanner(d) {
    if (new Date().getHours() < 18 || d.screen) return '';
    return `<a class="scroll-banner" href="#/reflect"><span><b>Tonight’s scroll check</b><small>Two numbers from Screen Time, 20 seconds</small></span>${T.ui.I.chevron}</a>`;
  }

  function affirmCard() {
    const s = st.s, af = s.affirm || { custom: [], favorites: [] };
    const a = TideAffirm.forHour(new Date(), { custom: af.custom, favorites: af.favorites, block: TideAffirm.blockAt(new Date(), s.rhythm) });
    const th = TideAffirm.THEMES[a.theme] || TideAffirm.THEMES.highest;
    return `<a class="affirm-card" href="#/affirm">
      <span class="affirm-label">${esc(a.id === 'transit' ? '✦ From your sky this hour' : th.glyph + ' ' + th.name + ' · this hour')}</span>
      <p class="affirm-text">${esc(a.text)}</p>
      ${a.src ? `<span class="affirm-src">${esc(a.src)}</span>` : ''}
    </a>`;
  }

  function ritualDone(l) {
    return G.ensure().moonRituals.some((r) => r.lunation === l.date.toISOString());
  }

  function skyCard(reading) {
    const top = TideSky.topTransits(new Date(), 1)[0];
    const open = TideSky.openRitual();
    const next = TideSky.nextLunations()[0];
    const retro = TideSky.retrogrades()[0];
    const dayWord = (dt) => {
      const days = Math.round((new Date(dt.toDateString()) - new Date(new Date().toDateString())) / 864e5);
      return days === 0 ? 'tonight' : days === 1 ? 'tomorrow' : dt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };
    let lunar = '';
    if (open && !ritualDone(open)) {
      lunar = `<a class="lunar-open" href="#/ritual"><span class="lunar-glyph">${open.type === 'new' ? '●' : '○'}</span><span><b>${open.type === 'new' ? 'New' : 'Full'} moon in ${esc(open.sign)}</b><small>Your moon ritual is open</small></span>${T.ui.I.chevron}</a>`;
    } else if (next) {
      lunar = `<p class="lunar-next"><span class="lunar-glyph">${next.type === 'new' ? '●' : '○'}</span>${next.type === 'new' ? 'New' : 'Full'} moon in ${esc(next.sign)} ${esc(dayWord(next.date))}</p>`;
    }
    return `
      <section class="sky-card">
        <span class="sky-label">Your sky today</span>
        <h2><span class="sky-glyph" aria-hidden="true">${esc(reading.glyph)}</span> Moon in ${esc(reading.sign)}</h2>
        <p class="sky-house">Your house of ${esc(reading.houseName)}</p>
        <p class="sky-line">${esc(reading.signLine)}</p>
        ${top ? `<div class="sky-transit"><span class="tone ${top.easy ? 'is-easy' : 'is-edge'}">${esc(top.tone)}</span><b>${esc(top.title)}</b><p>${esc(top.advice)}</p></div>` : ''}
        ${retro ? `<p class="sky-retro">${esc(retro)}</p>` : ''}
        ${lunar}
        <a class="sky-more" href="#/sky">See all your transits ${T.ui.I.chevron}</a>
      </section>`;
  }

  let raf = null;

  T.pages.pool = {
    nav: 'pool',
    title: 'Pool',
    render(el) {
      const s = G.ensure();
      const d = st.day();
      const n = st.doneCount(st.today());
      const season = G.currentSeason();
      const next = G.nextSeason();
      const moon = G.moon();
      const sky = G.sky();
      const streak = st.streak();
      const found = season.items.filter((i) => G.owned(i.id)).length;
      const nextStart = new Date(new Date().getFullYear() + (next.id === 'imbolc' && new Date().getMonth() === 11 ? 1 : 0), next.start[0] - 1, next.start[1]);
      const daysToNext = Math.ceil((nextStart - new Date(new Date().toDateString())) / 864e5);
      const glossOf = (id) => (TideSky.season(new Date(2026, T.SEASONS.find((x) => x.id === id).start[0] - 1, T.SEASONS.find((x) => x.id === id).start[1])).gloss);
      const reading = TideSky.sky();
      const seasonLine = reading.sabbat
        ? `${reading.sabbat.name} begins today, ${reading.sabbat.gloss}`
        : daysToNext > 0 && daysToNext <= 3
          ? `${next.name}, ${glossOf(next.id)}, begins ${daysToNext === 1 ? 'tomorrow' : 'in ' + daysToNext + ' days'}`
          : `${season.name} season, ${glossOf(season.id)}`;
      let level = n / 6;
      let surface = surfaceFor(level);
      const bottleReady = d.done.make && !d.bottle;

      el.innerHTML = `
      <header class="pool-head">
        <p class="eyebrow-date">${esc(fmt.long(new Date()))}</p>
        <h1 class="greet page-title" tabindex="-1">${esc(greeting(s.settings.name || 'friend'))}</h1>
        <p class="pool-meta">${esc(seasonLine)}</p>
      </header>

      ${sabbatBanner()}
      <div class="scene-card sky-${sky.id}">
        <svg class="scene" id="scene" viewBox="0 0 ${W} ${H}" role="img" aria-label="Your tide pool. Moon in ${esc(reading.sign)}. ${esc(tideWords(n))}, ${n} of 6 rituals done. ${s.treasures.length} treasures, ${s.pearls} pearls.">
          <defs>
            <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="1" stop-color="${sky.bottom}"/></linearGradient>
            <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.waterTop}" stop-opacity=".82"/><stop offset=".6" stop-color="${sky.waterBot}" stop-opacity=".62"/><stop offset="1" stop-color="${sky.waterBot}" stop-opacity=".4"/></linearGradient>
            <radialGradient id="glow"><stop offset="0" stop-color="#FFF3D6" stop-opacity=".85"/><stop offset="1" stop-color="#FFF3D6" stop-opacity="0"/></radialGradient>
            <clipPath id="waterClip"><rect id="wclip" x="0" y="${surface + 4}" width="${W}" height="${SAND - surface}"/></clipPath>
            <radialGradient id="milky" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#E9E3FF" stop-opacity=".16"/><stop offset="1" stop-color="#E9E3FF" stop-opacity="0"/></radialGradient>
            <linearGradient id="sandG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2E6CE"/><stop offset="1" stop-color="#E0CFAE"/></linearGradient>
          </defs>
          <rect width="${W}" height="${H}" fill="url(#skyG)"/>
          <ellipse cx="170" cy="92" rx="220" ry="36" fill="url(#milky)" transform="rotate(-18 170 92)"/>
          <g opacity="${sky.stars}">${stars()}</g>
          <g id="lifetime">${lifetimeStars()}</g>
          <g id="constellation">${constellation(d.done, false)}</g>
          ${clouds(sky)}
          <g transform="translate(298 48)" class="moon" data-moon>
            <circle r="17" fill="#F4EEDC" opacity=".16"/>
            <path d="${G.moonPath(moon.f, 17)}" fill="#F4EEDC"/>
            <circle r="30" fill="transparent"/>
          </g>

          <path d="M0 ${SAND} Q60 ${SAND - 8} 120 ${SAND - 2} T240 ${SAND - 4} T360 ${SAND - 2} V${H} H0Z" fill="url(#sandG)"/>
          ${rocks(sky)}
          <g id="water" class="water" style="transform:translateY(${surface}px)">
            <g class="wave-drift wave-slow"><path d="M0 4 Q30 -4 60 4 T120 4 T180 4 T240 4 T300 4 T360 4 T420 4 T480 4 T540 4 T600 4 T660 4 T720 4 V${H + 40} H0Z" fill="#A9D0CB" opacity=".45"/></g>
            <g class="wave-drift"><path d="M0 8 Q45 -2 90 8 T180 8 T270 8 T360 8 T450 8 T540 8 T630 8 T720 8 V${H + 40} H0Z" fill="url(#waterG)"/></g>
            <path d="M70 34 q20 -4 40 0 M220 80 q16 -3 32 0 M120 130 q22 -4 44 0" stroke="#fff" stroke-opacity=".14" stroke-width="2" fill="none" stroke-linecap="round"/>
          </g>
          <g clip-path="url(#waterClip)">
            <g id="reflection" class="reflection" style="transform:translateY(${2 * surface}px) scaleY(-1)">
              <g class="shimmer">${constellation(d.done, true)}<ellipse cx="298" cy="48" rx="14" ry="5" fill="#F4EEDC" opacity=".14"/></g>
            </g>
          </g>

          ${G.coralSVG(s.coral.stage || (s.coral.done ? 10 : 0), 46, SAND + 6, 1.05)}
          ${s.coral.done > 1 ? G.coralSVG(10, 70, SAND + 12, .55, '#D8B461') : ''}
          ${sandTreasures(s.treasures)}
          ${pearlsSVG(s.pearls)}

          <g id="ripples"></g>
          <g id="fishes">${FISH.map(fishSVG).join('')}</g>

          ${bottleReady ? `<g id="bottle" class="bottle" data-bottle style="transform:translate(236px, ${surface - 6}px)">
            <g class="bob">
              <rect x="-7" y="-20" width="14" height="24" rx="6" fill="#CFE3DE" stroke="#8FB3B3" stroke-width="1.2" opacity=".95"/>
              <rect x="-3.5" y="-27" width="7" height="8" rx="2" fill="#CFE3DE" stroke="#8FB3B3" stroke-width="1.2"/>
              <rect x="-3" y="-31" width="6" height="5" rx="1.5" fill="#B08A5A"/>
              <rect x="-4" y="-14" width="8" height="12" rx="1.5" fill="#F4EEDC"/>
              <circle r="26" cy="-10" fill="transparent"/>
            </g>
          </g>` : ''}
        </svg>
        <div class="scene-chip"><b id="tideN">${n}</b> of 6 stars lit · <span id="tideW">${esc(tideWords(n))}</span></div>
      </div>
      <p class="scene-hint" id="hint">${bottleReady ? 'A message in a bottle just drifted in. Tap it.' : d.done.make ? 'Tap the water and your three Pisces fish swim to you. Tap a star to see its ritual.' : 'Each practice lights a star in your Pisces constellation. Create something first and a message in a bottle drifts in.'}</p>

      ${goalLine(n, d)}
      <ul class="practices" aria-label="Today’s practices">
        ${T.DATA.RITUALS.map((r) => `<li class="practice ${d.done[r.id] ? 'is-done' : ''}">
          <button class="p-tick" data-tick="${r.id}" aria-pressed="${!!d.done[r.id]}" aria-label="${esc(r.title)}"><span class="tick">${T.ui.I.check}</span></button>
          <button class="p-body" data-open="${r.id}" aria-expanded="false">
            <b><span class="p-icon" aria-hidden="true">${r.icon}</span>${esc(r.title)}</b>
            <span class="p-done">${esc(r.done)}</span>
            <span class="p-why" hidden>${esc(r.why)}${r.link ? ` <a href="${r.link}">Open</a>` : ''}</span>
          </button>
        </li>`).join('')}
      </ul>
      <p class="muted small-t center streak-line">${streak ? (streak === 1 ? 'Day one of making before taking' : streak + ' days in a row of making before taking') : 'Each ritual you finish lights a star and raises the water.'}</p>
      <a class="sit-cta" href="#/sit">
        <b>Sit in stillness</b>
        <small>${(d.sits && d.sits.length) ? 'You already sat today. Sit again if the wave is loud.' : 'Five quiet minutes with your wave. Finishing lights the stillness star.'}</small>
      </a>
      ${d.focus ? `<a class="focus-card" href="#/gut"><span class="muted">Today’s gut yes</span><b>${esc(d.focus)}</b></a>` : ''}

      ${venusBanner()}
      ${scrollBanner(d)}
      ${affirmCard()}

      <a class="surf-cta" href="#/surf">
        <span class="surf-wave" aria-hidden="true">${T.ui.I.wave}</span>
        <span><b>Feel the pull to scroll?</b><small>Breathe with the wave instead. Nine slow breaths, and the sea gives you a pearl</small></span>
      </a>

      ${skyCard(reading)}

      <section class="block">
        <div class="tiles">
          <a class="tile" href="#/make"><b>Make</b><span>Your coral has ${s.coral.stage} of 10 branches</span></a>
          <a class="tile" href="#/treasures"><b>Treasures</b><span>${found} of 8 ${esc(season.name)} treasures found</span></a>
          <a class="tile" href="#/gut"><b>Your gut yes</b><span>Let your body choose</span></a>
          <a class="tile" href="#/reflect"><b>Reflect</b><span>${d.wave ? 'Done for today' : 'Evening check-in'}</span></a>
        </div>
      </section>`;

      /* ---------- living scene ---------- */
      const svg = el.querySelector('#scene');
      const water = el.querySelector('#water');
      const ripples = el.querySelector('#ripples');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const fishEls = FISH.map((f) => el.querySelector(`[data-fish="${f.id}"]`));
      const fish = FISH.map((f, i) => ({
        ...f,
        x: 70 + i * 100, y: surface + 30 + i * 18,
        a: Math.random() * Math.PI * 2,
        speed: 11 + i * 2.5,
        tx: null, ty: null, until: 0, face: 1
      }));

      function bounds() { return { x0: 18, x1: W - 18, y0: surface + 16, y1: SAND - 8 }; }

      function place(f, elx) {
        elx.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`);
        elx.firstElementChild.setAttribute('transform', `scale(${f.face} 1) rotate(${(f.tilt || 0).toFixed(1)})`);
      }

      fish.forEach((f, i) => { const b = bounds(); f.y = Math.min(Math.max(f.y, b.y0), b.y1); place(f, fishEls[i]); });

      let last = performance.now();
      function loop(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const b = bounds();
        fish.forEach((f, i) => {
          if (f.tx != null && now < f.until) {
            const want = Math.atan2(f.ty - f.y, f.tx - f.x);
            let diff = want - f.a; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            f.a += diff * Math.min(1, dt * 2.2);
            const dist = Math.hypot(f.tx - f.x, f.ty - f.y);
            f.v = dist < 14 ? 6 : f.speed * 2.1;
          } else {
            f.a += (Math.random() - .5) * dt * 1.6;
            f.v = f.speed;
          }
          // near an edge, turn softly back toward open water
          const m = 22;
          const chasing = f.tx != null && now < f.until;
          if (!chasing && (f.x < b.x0 + m || f.x > b.x1 - m || f.y < b.y0 + 8 || f.y > b.y1 - 8)) {
            const want = Math.atan2((b.y0 + b.y1) / 2 - f.y, (b.x0 + b.x1) / 2 - f.x);
            let diff = want - f.a; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            f.a += diff * Math.min(1, dt * 1.6);
          }
          f.x += Math.cos(f.a) * f.v * dt;
          f.y += Math.sin(f.a) * f.v * dt * .7;
          f.x = Math.min(Math.max(f.x, b.x0), b.x1);
          f.y = Math.min(Math.max(f.y, b.y0), b.y1);
          const c = Math.cos(f.a);
          if (c > .25) f.face = 1; else if (c < -.25) f.face = -1;
          f.tilt = Math.max(-18, Math.min(18, Math.sin(f.a) * 22)) * f.face;
          place(f, fishEls[i]);
        });
        raf = requestAnimationFrame(loop);
      }
      if (!reduce) raf = requestAnimationFrame(loop);

      function toSvg(evt) {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX; pt.y = evt.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
      }

      svg.addEventListener('pointerdown', (evt) => {
        if (evt.target.closest('[data-bottle]')) return openBottle();
        const p = toSvg(evt);
        const starEl = evt.target.closest('[data-star]');
        if (starEl) {
          const r = T.DATA.RITUALS.find((x) => x.id === starEl.dataset.star);
          T.ui.toast(r.title + (st.day().done[r.id] ? ' · lit' : ' · waiting to be lit'));
          return;
        }
        if (evt.target.closest('[data-moon]')) { T.ui.toast(moon.name + ' · ' + Math.round(moon.illum * 100) + '% lit'); return; }
        const hit = fish.find((f) => Math.hypot(f.x - p.x, f.y - p.y) < 20);
        if (hit) { T.ui.toast(hit.label + ' · ' + hit.note); hit.a += Math.PI; return; }
        if (p.y < surface) return;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${p.x} ${p.y})`);
        g.innerHTML = '<circle r="16" class="ripple"/><circle r="16" class="ripple ripple-2"/>';
        ripples.appendChild(g);
        setTimeout(() => g.remove(), 2600);
        fish.forEach((f, i) => { f.tx = p.x + (i - 1) * 16; f.ty = p.y + (i % 2 ? 6 : -6); f.until = performance.now() + 3200; });
        T.ui.buzz(6);
      });

      async function openBottle() {
        const a = askOfDay();
        st.day().bottle = true; st.save();
        const bt = el.querySelector('#bottle');
        if (bt) bt.classList.add('gone');
        await G.letter(a.a, a.src);
        el.querySelector('#hint').textContent = 'Tap the water and your three Pisces fish swim to you. Tap a star to see its ritual.';
      }

      el.querySelectorAll('[data-open]').forEach((b) => (b.onclick = (e) => {
        if (e.target.closest('a')) return;
        const why = b.querySelector('.p-why');
        why.hidden = !why.hidden;
        b.setAttribute('aria-expanded', String(!why.hidden));
      }));

      /* ---------- rituals raise the water ---------- */
      el.querySelectorAll('[data-tick]').forEach((btn) => {
        btn.onclick = async () => {
          const val = st.mark(btn.dataset.tick);
          T.ui.buzz();
          btn.closest('.practice').classList.toggle('is-done', val);
          btn.setAttribute('aria-pressed', val);
          const n2 = st.doneCount(st.today());
          level = n2 / 6; surface = surfaceFor(level);
          water.style.transform = `translateY(${surface}px)`;
          const bt = el.querySelector('#bottle');
          if (bt) bt.style.transform = `translate(236px, ${surface - 6}px)`;
          const dd = st.day().done;
          el.querySelector('#constellation').innerHTML = constellation(dd, false);
          el.querySelector('#reflection').style.transform = `translateY(${2 * surface}px) scaleY(-1)`;
          el.querySelector('#reflection .shimmer').innerHTML = constellation(dd, true) + '<ellipse cx="298" cy="48" rx="14" ry="5" fill="#F4EEDC" opacity=".14"/>';
          const wc = el.querySelector('#wclip'); wc.setAttribute('y', surface + 4); wc.setAttribute('height', SAND - surface);
          el.querySelector('#tideN').textContent = n2;
          el.querySelector('#tideW').textContent = tideWords(n2);
          const rewards = G.checkRewards();
          el.querySelector('#goal').outerHTML = goalLine(n2, st.day());
          if (rewards.length) {
            setTimeout(async () => { await G.revealAll(rewards); T.refresh(); }, 900);
          } else if (btn.dataset.tick === 'make' && val && !st.day().bottle) {
            setTimeout(() => { T.refresh(); T.ui.toast('A bottle is drifting in…'); }, 1400);
          }
        };
      });
    },
    leave() { cancelAnimationFrame(raf); raf = null; }
  };
})(window.Tide);
