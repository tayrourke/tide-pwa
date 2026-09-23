/* Tide — the slow game.
   One treasure a day, for making before you take. Rare ones only on high-tide days.
   Surfed urges become pearls. Finished make sessions grow coral. Nothing is lost for missing a day. */
(function (T) {
  const st = T.store;

  /* ---------- Wheel of the Year ---------- */
  function currentSeason(date) {
    date = date || new Date();
    const md = (date.getMonth() + 1) * 100 + date.getDate();
    const sorted = T.SEASONS.slice().sort((a, b) => (a.start[0] * 100 + a.start[1]) - (b.start[0] * 100 + b.start[1]));
    let cur = sorted[sorted.length - 1]; // Yule wraps into January
    sorted.forEach((s) => { if (md >= s.start[0] * 100 + s.start[1]) cur = s; });
    return cur;
  }

  function nextSeason(date) {
    const cur = currentSeason(date);
    const sorted = T.SEASONS.slice().sort((a, b) => (a.start[0] * 100 + a.start[1]) - (b.start[0] * 100 + b.start[1]));
    const i = sorted.indexOf(cur);
    return sorted[(i + 1) % sorted.length];
  }

  /* ---------- Moon ---------- */
  const SYNODIC = 29.530588853;
  const NEW_MOON_REF = Date.UTC(2000, 0, 6, 18, 14);
  function moon(date) {
    date = date || new Date();
    const days = (date.getTime() - NEW_MOON_REF) / 864e5;
    const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
    const f = age / SYNODIC; // 0 new, .5 full
    const names = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
    const name = names[Math.round(f * 8) % 8];
    return { f, age, name, illum: (1 - Math.cos(2 * Math.PI * f)) / 2 };
  }

  /** SVG path for the lit part of the moon, centered at 0,0 radius r */
  function moonPath(f, r) {
    const waxing = f < 0.5;
    const k = Math.cos(2 * Math.PI * f); // 1 new, -1 full
    const rx = Math.abs(k) * r;
    // outer limb on the lit side, terminator ellipse
    const sweepOuter = waxing ? 1 : 0;
    const sweepInner = (k > 0) === waxing ? 0 : 1;
    return `M0 ${-r} A${r} ${r} 0 0 ${sweepOuter} 0 ${r} A${rx} ${r} 0 0 ${sweepInner} 0 ${-r} Z`;
  }

  /* ---------- Time of day sky ---------- */
  function sky(date) {
    const dt = date || new Date();
    const h = dt.getHours() + dt.getMinutes() / 60;
    if (h < 5 || h >= 21) return { id: 'night', top: '#0B1530', bottom: '#2A2F5A', stars: 1, waterTop: '#27476A', waterBot: '#163244' };
    if (h < 7.5) return { id: 'dawn', top: '#232850', bottom: '#E8B4A4', stars: .65, waterTop: '#6F8AA3', waterBot: '#2F5F6A' };
    if (h < 17) return { id: 'day', top: '#4E5F9E', bottom: '#CBD8EA', stars: .42, waterTop: '#8DB3C6', waterBot: '#3D7B80' };
    if (h < 19.5) return { id: 'golden', top: '#33366A', bottom: '#F0C9A8', stars: .62, waterTop: '#7F8FAE', waterBot: '#35606C' };
    return { id: 'dusk', top: '#141C40', bottom: '#7E6FA6', stars: .88, waterTop: '#3E5580', waterBot: '#1D3A4C' };
  }

  /* ---------- State ---------- */
  function ensure() {
    const s = st.s;
    s.treasures = s.treasures || [];     // { tid, at }
    s.pearls = s.pearls || 0;
    s.coral = s.coral || { stage: 0, done: 0 };
    s.moonRituals = s.moonRituals || [];
    s.surfs = s.surfs || 0;
    return s;
  }

  function owned(tid) { return ensure().treasures.filter((t) => t.tid === tid).length; }

  function pickTreasure(kind) {
    const season = currentSeason();
    const d = new Date();
    // birthday: the solar return pearl washes up on March 13
    if (d.getMonth() === 2 && d.getDate() === 13) return 'imbolc-7';
    const w = kind === 'high' ? { c: 0, u: 55, r: 45 } : { c: 68, u: 32, r: 0 };
    let roll = Math.random() * 100, rarity = 'c';
    if (roll < w.c) rarity = 'c'; else if (roll < w.c + w.u) rarity = 'u'; else rarity = 'r';
    const pool = season.items.filter((i) => i.rarity === rarity);
    const unowned = pool.filter((i) => !owned(i.id));
    const from = unowned.length && Math.random() < 0.65 ? unowned : pool;
    return from[Math.floor(Math.random() * from.length)].id;
  }

  /** Called whenever rituals change. Returns rewards to reveal, in order. */
  function checkRewards() {
    const s = ensure();
    const d = st.day();
    d.awarded = d.awarded || {};
    const out = [];
    if (st.doneCount(st.today()) >= 4 && !d.awarded.make) {
      const tid = pickTreasure('daily');
      s.treasures.push({ tid, at: Date.now() });
      d.awarded.make = true;
      out.push({ type: 'treasure', tid, isNew: owned(tid) === 1, why: 'Four stars lit. The tide brought you something.' });
    }
    if (st.doneCount(st.today()) === 6 && !d.awarded.high) {
      const tid = pickTreasure('high');
      s.treasures.push({ tid, at: Date.now() });
      d.awarded.high = true;
      out.push({ type: 'treasure', tid, isNew: owned(tid) === 1, why: 'High tide. All six practices, today.' });
    }
    if (out.length) st.save();
    return out;
  }

  function addPearl() { const s = ensure(); s.pearls++; s.surfs++; st.save(); }

  function growCoral() {
    const s = ensure();
    s.coral.stage++;
    let completed = false;
    if (s.coral.stage >= 10) { s.coral.done++; s.coral.stage = 0; completed = true; }
    st.save();
    return { stage: s.coral.stage, done: s.coral.done, completed };
  }

  /* ---------- Coral art: grows branch by branch ---------- */
  const CORAL = [
    'M0 0 C0 -10 -2 -18 0 -26',
    'M0 -12 C-6 -16 -10 -20 -12 -28',
    'M0 -16 C6 -20 9 -26 10 -34',
    'M0 -26 C-2 -32 1 -38 -2 -44',
    'M-12 -28 C-16 -32 -15 -38 -19 -42',
    'M10 -34 C15 -38 14 -44 18 -49',
    'M-6 -18 C-12 -18 -17 -22 -21 -24',
    'M-2 -44 C4 -48 5 -53 3 -58',
    'M18 -49 C22 -52 26 -53 27 -58',
    'M-19 -42 C-22 -48 -20 -52 -24 -56'
  ];
  function coralSVG(stage, x, y, scale, color) {
    const n = Math.max(1, stage);
    return `<g transform="translate(${x} ${y}) scale(${scale || 1})" class="coral">
      ${CORAL.slice(0, n).map((d) => `<path d="${d}" fill="none" stroke="${color || '#E4AE9E'}" stroke-width="3.2" stroke-linecap="round"/>`).join('')}
      ${CORAL.slice(0, n).map((d) => { const m = d.match(/(-?[\d.]+) (-?[\d.]+)$/); return m ? `<circle cx="${m[1]}" cy="${m[2]}" r="2.4" fill="${color || '#E4AE9E'}"/>` : ''; }).join('')}
    </g>`;
  }

  /* ---------- Reveal: a slow wash-up moment ---------- */
  function reveal(r) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'reveal';
      wrap.setAttribute('role', 'dialog');
      wrap.setAttribute('aria-modal', 'true');
      let art = '', title = '', name = '', meta = '', body = '';
      if (r.type === 'treasure') {
        const it = T.TREASURE[r.tid];
        const season = T.seasonOf(it.season);
        art = T.art(it, 150);
        title = r.view ? 'From your collection' : r.isNew ? 'Something washed up' : 'Another one washed up';
        name = it.name;
        meta = `${T.RARITY[it.rarity]} · ${season.name}${r.isNew ? ' · new' : ''}`;
        body = it.meaning;
      } else if (r.type === 'pearl') {
        const it = { shape: 'pearl', season: 'imbolc' };
        art = `<svg class="t-art" viewBox="0 0 60 60" width="130" height="130" aria-hidden="true">${T.artInner(it)}</svg>`;
        title = 'You breathed through it';
        name = 'A pearl';
        meta = `${ensure().pearls} pearl${ensure().pearls === 1 ? '' : 's'} in your pool`;
        body = 'The urge rose and fell with your breath, and you stayed. That’s the whole practice.';
      } else if (r.type === 'star') {
        art = `<svg viewBox="-40 -40 80 80" width="150" height="150" aria-hidden="true">${starArt(r.moon)}</svg>`;
        title = 'A new star in your sky';
        name = r.label || (r.moon === 'new' ? 'New moon star · ' + r.sign : 'Full moon star · ' + r.sign);
        meta = r.meta || (ensure().moonRituals.length + ' moon ritual' + (ensure().moonRituals.length === 1 ? '' : 's') + ' kept');
        body = r.text || (r.moon === 'new' ? 'Your intention is planted among the stars.' : 'What you released is carried off by the moon.');
      } else if (r.type === 'coral') {
        art = `<svg viewBox="-40 -70 80 80" width="150" height="150" aria-hidden="true">${coralSVG(r.completed ? 10 : r.stage, 0, 0, 1)}</svg>`;
        title = r.completed ? 'Your coral is complete' : 'Your coral grew';
        name = r.completed ? 'Coral number ' + r.done : 'Branch ' + r.stage + ' of 10';
        meta = r.completed ? 'A new one starts growing next session' : 'One branch for every finished session';
        body = 'Small and finished, over and over. That’s your Virgo North Node, growing.';
      }
      wrap.innerHTML = `
        <div class="reveal-card ${r.type === 'star' ? 'is-cosmic' : ''}">
          <p class="reveal-title">${T.ui.esc(title)}</p>
          <div class="reveal-art">${art}</div>
          <h2 class="reveal-name" tabindex="-1">${T.ui.esc(name)}</h2>
          <p class="reveal-meta">${T.ui.esc(meta)}</p>
          <p class="reveal-body">${T.ui.esc(body)}</p>
          ${r.why ? `<p class="reveal-why">${T.ui.esc(r.why)}</p>` : ''}
          <button class="btn btn-primary btn-block" data-close>${r.view ? 'Close' : r.type === 'treasure' ? 'Place it in my pool' : 'Keep going'}</button>
        </div>`;
      document.body.appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('open'));
      if (!r.view) T.ui.buzz(r.type === 'treasure' && T.TREASURE[r.tid].rarity === 'r' ? [20, 60, 20, 60, 40] : [15, 50, 15]);
      const close = () => { wrap.classList.remove('open'); setTimeout(() => { wrap.remove(); resolve(); }, 450); };
      wrap.querySelector('[data-close]').onclick = close;
      wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      setTimeout(() => wrap.querySelector('[data-close]').focus(), 500);
    });
  }

  function starArt(kind) {
    const c = kind === 'full' ? '#F4EEDC' : '#E8B4A4';
    return `<defs><radialGradient id="sg${++clipStar}"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>
      <circle r="34" fill="url(#sg${clipStar})"/>
      <path d="M0 -30 C2 -8 8 -2 30 0 C8 2 2 8 0 30 C-2 8 -8 2 -30 0 C-8 -2 -2 -8 0 -30Z" fill="${c}"/>
      <circle r="4" fill="#fff"/>`;
  }
  let clipStar = 0;

  /** Stars earned over time: one per making day, plus a bright one per moon ritual */
  function skyStars() {
    const s = ensure();
    const makingDays = Object.values(s.days).filter((d) => d.done && d.done.make).length;
    return { small: makingDays, moons: s.moonRituals.slice() };
  }

  async function revealAll(list) { for (const r of list) await reveal(r); }

  /** A gentle text-only card for the message in a bottle */
  function letter(text, src) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'reveal';
      wrap.innerHTML = `<div class="reveal-card letter">
        <p class="reveal-title">A message in a bottle</p>
        <p class="letter-text" tabindex="-1">${T.ui.esc(text)}</p>
        <p class="reveal-meta">${T.ui.esc(src)}</p>
        <button class="btn btn-primary btn-block" data-close>Carry it with me today</button>
      </div>`;
      document.body.appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('open'));
      const close = () => { wrap.classList.remove('open'); setTimeout(() => { wrap.remove(); resolve(); }, 450); };
      wrap.querySelector('[data-close]').onclick = close;
      setTimeout(() => wrap.querySelector('[data-close]').focus(), 500);
    });
  }

  T.game = { skyStars, starArt, currentSeason, nextSeason, moon, moonPath, sky, ensure, owned, checkRewards, addPearl, growCoral, coralSVG, reveal, revealAll, letter };
})(window.Tide);
