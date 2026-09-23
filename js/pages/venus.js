(function (T) {
  const { esc, header, I } = T.ui;
  const A = window.TideAstro, S = window.TideSky;
  const st = T.store;
  const G = T.game;

  const DAY = 864e5;
  const ord = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
  const fmtD = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
  const shortD = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  /* ---------- Find the retrograde window from the ephemeris, in local time ---------- */
  const lonOn = (date) => A.lonAt('venus', A.dayNum(date));
  const speedOn = (date) => ((lonOn(new Date(date.getTime() + DAY / 2)) - lonOn(new Date(date.getTime() - DAY / 2)) + 540) % 360) - 180;

  function refine(a, b, test) {
    for (let i = 0; i < 40; i++) { const m = new Date((a.getTime() + b.getTime()) / 2); if (test(m)) a = m; else b = m; }
    return new Date((a.getTime() + b.getTime()) / 2);
  }

  function station(from, wantRetro, limitDays) {
    let prev = new Date(from);
    for (let i = 1; i <= (limitDays || 500); i++) {
      const day = new Date(from.getTime() + i * DAY);
      if ((speedOn(day) < 0) === wantRetro && (speedOn(prev) < 0) !== wantRetro) {
        const d = refine(prev, day, (m) => (speedOn(m) < 0) !== wantRetro);
        return { date: d, lon: lonOn(d) };
      }
      prev = day;
    }
    return null;
  }

  function crossing(from, target, days) {
    const out = [];
    let prev = new Date(from);
    for (let i = 1; i <= days; i++) {
      const day = new Date(from.getTime() + i * DAY);
      const a = ((lonOn(prev) - target + 540) % 360) - 180, b = ((lonOn(day) - target + 540) % 360) - 180;
      if (a * b < 0 && Math.abs(a) < 12) out.push(refine(prev, day, (m) => ((((lonOn(m) - target + 540) % 360) - 180) * a) > 0));
      prev = day;
    }
    return out;
  }

  /** The current or next Venus retrograde, with its shadow periods */
  function window_(now) {
    now = now || new Date();
    let back = new Date(now.getTime() - 120 * DAY);
    let retro = station(back, true, 260);
    let direct = retro ? station(retro.date, false, 90) : null;
    if (direct && now > new Date(direct.date.getTime() + 60 * DAY)) {
      retro = station(direct.date, true, 700);
      direct = retro ? station(retro.date, false, 90) : null;
    }
    if (!retro || !direct) return null;
    const preShadow = crossing(new Date(retro.date.getTime() - 80 * DAY), direct.lon, 80).pop();
    const postShadow = crossing(direct.date, retro.lon, 80)[0];
    const ascHits = crossing(new Date(retro.date.getTime() - 60 * DAY), A.NATAL.asc, 160);
    return { retro, direct, preShadow, postShadow, ascHits };
  }

  const PROMPTS = [
    'What do I actually love, underneath what I’m supposed to love?',
    'Where have I been giving more than I receive?',
    'What beauty of mine have I been hiding or apologizing for?',
    'Who or what is asking to come back, and does it deserve to?',
    'What am I worth, and does my work reflect it?',
    'What does love look like when I don’t abandon myself in it?'
  ];

  const DO = [
    'Re-do, re-view, re-work, re-connect. Every good verb starts with re.',
    'Rediscover an old love: a craft, a song, a friend, a dress you stopped wearing.',
    'Rework your prices, your brand colors, your offers, but launch them after.',
    'Let old feelings surface so they can finish.',
    'Be extra gracious with your people. Your Gene Key 22 is grace.'
  ];
  const WAIT = [
    'Big beauty changes: a dramatic haircut, color or tattoo. Wait it out.',
    'New relationships or reunions decided in the moment. Let your wave settle.',
    'Big purchases, rebrands and launches. Prepare now, release after.',
    'Deciding your worth based on how anything performs right now.'
  ];

  T.pages.venus = {
    nav: 'sky',
    title: 'Venus retrograde',
    render(el) {
      const w = window_();
      if (!w) { el.innerHTML = header('Venus retrograde', { back: '#/sky' }) + '<p class="muted">No Venus retrograde nearby.</p>'; return; }
      const now = new Date();
      const s = st.s;
      s.venus = s.venus || {};
      const key = w.retro.date.toISOString().slice(0, 10);
      const rec = s.venus[key] = s.venus[key] || { notes: {}, review: null };

      const phase = now < w.preShadow ? 'before' : now < w.retro.date ? 'shadow' : now < w.direct.date ? 'retro' : now < w.postShadow ? 'post' : 'done';
      const phaseWord = { before: 'Coming up', shadow: 'In the shadow', retro: 'Retrograde now', post: 'In the after-shadow', done: 'Complete' }[phase];
      const retroHouse = A.houseOf(w.retro.lon), directHouse = A.houseOf(w.direct.lon);
      const span = (w.postShadow - w.preShadow);
      const pct = Math.max(0, Math.min(100, ((now - w.preShadow) / span) * 100));

      const marks = [
        { at: w.preShadow, label: 'Shadow begins', note: `Venus reaches ${A.degIn(w.direct.lon)}° ${A.signOf(w.direct.lon)}, the degree she’ll return to. Themes start whispering.` },
        { at: w.retro.date, label: 'Venus turns retrograde', note: `At ${A.degIn(w.retro.lon)}° ${A.signOf(w.retro.lon)}, in your ${ord(retroHouse)} house of ${S.HOUSES[retroHouse].name}.` },
        ...w.ascHits.map((d, i) => ({ at: d, label: `Venus crosses your rising sign (${i + 1} of ${w.ascHits.length})`, note: 'Your chart ruler passes over your Ascendant. How you look, feel and present yourself is being re-made.' })),
        { at: w.direct.date, label: 'Venus turns direct', note: `At ${A.degIn(w.direct.lon)}° ${A.signOf(w.direct.lon)}, in your ${ord(directHouse)} house of ${S.HOUSES[directHouse].name}. Clarity returns.` },
        { at: w.postShadow, label: 'After-shadow ends', note: 'Venus passes her starting degree. Now you can launch, cut, buy and commit.' }
      ].sort((a, b) => a.at - b.at);

      const weekOf = Math.floor((now - w.retro.date) / (7 * DAY));
      const unlocked = phase === 'retro' ? Math.min(PROMPTS.length, weekOf + 1) : phase === 'shadow' || phase === 'before' ? 0 : PROMPTS.length;

      el.innerHTML = `
      ${header('Venus retrograde', { back: '#/sky', sub: 'Your chart ruler, retracing her steps.' })}

      <section class="venus-hero">
        <span class="v-phase">${esc(phaseWord)}</span>
        <h2>${esc(shortD(w.retro.date))} – ${esc(shortD(w.direct.date))}</h2>
        <p>Venus rules your whole chart, and she’s exalted in your Pisces stellium. When she turns back, it isn’t a footnote for you, it’s a personal season. This one walks backward from your ${ord(retroHouse)} house of ${esc(S.HOUSES[retroHouse].name)} into your ${ord(directHouse)} house of ${esc(S.HOUSES[directHouse].name)}, and crosses your rising sign ${w.ascHits.length} times.</p>
        <div class="v-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <div class="v-bar-ends"><span>${esc(shortD(w.preShadow))}</span><span>${esc(shortD(w.postShadow))}</span></div>
      </section>

      <section class="block">
        <h2>Key dates</h2>
        <ul class="v-dates">${marks.map((m) => {
          const past = m.at < now;
          const today = m.at.toDateString() === now.toDateString();
          return `<li class="${past ? 'is-past' : ''} ${today ? 'is-today' : ''}"><div class="v-date">${esc(shortD(m.at))}</div><div><b>${esc(m.label)}${today ? ' · today' : ''}</b><span>${esc(m.note)}</span></div></li>`;
        }).join('')}</ul>
      </section>

      <section class="block v-lists">
        <div class="v-list is-do"><h3>Lean in</h3><ul>${DO.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="v-list is-wait"><h3>Let it wait</h3><ul>${WAIT.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </section>

      <section class="block">
        <h2>Six weeks of questions</h2>
        <p class="muted small-t" style="margin-bottom:12px">One opens each week of the retrograde. Answer slowly, and let your wave settle before you decide anything.</p>
        <ol class="v-prompts">${PROMPTS.map((q, i) => {
          const open = i < unlocked;
          return `<li class="${open ? '' : 'is-locked'}">
            <b>Week ${i + 1}${open ? '' : ' · opens ' + esc(shortD(new Date(w.retro.date.getTime() + i * 7 * DAY)))}</b>
            <p>${esc(q)}</p>
            ${open ? `<textarea rows="2" data-p="${i}" placeholder="Write what comes…">${esc(rec.notes[i] || '')}</textarea>` : ''}
          </li>`;
        }).join('')}</ol>
      </section>

      <section class="block">
        <h2>The Venus review</h2>
        ${rec.review ? `
          <div class="v-review-done"><p class="ritual-quote">${esc(rec.review)}</p><p class="muted small-t center">Sealed ${esc(shortD(new Date(rec.reviewAt)))}</p></div>`
          : `<p class="muted small-t">When Venus turns direct on ${esc(fmtD(w.direct.date))}, close the season by naming what you’re keeping.</p>
          <textarea id="vrev" rows="3" placeholder="What I’m keeping, and what I’m letting go…"></textarea>
          <button class="btn btn-primary btn-block" id="vseal" ${phase === 'post' || phase === 'done' ? '' : 'disabled'}>${phase === 'post' || phase === 'done' ? 'Seal the review' : 'Opens when Venus turns direct'}</button>`}
      </section>`;

      el.querySelectorAll('[data-p]').forEach((t) => (t.oninput = () => { rec.notes[t.dataset.p] = t.value; st.save(); }));
      const seal = el.querySelector('#vseal');
      if (seal) seal.onclick = async () => {
        const v = el.querySelector('#vrev').value.trim();
        if (!v) { T.ui.toast('Name one thing you’re keeping'); return; }
        rec.review = v; rec.reviewAt = Date.now();
        G.ensure().moonRituals.push({ type: 'venus', lunation: 'venus-' + key, sign: A.signOf(w.direct.lon), at: Date.now(), intention: v });
        st.save();
        await G.reveal({ type: 'star', moon: 'new', sign: 'Venus', label: 'Venus retrograde star', meta: 'Sealed as Venus turned direct', text: '“' + v + '”' });
        T.refresh();
      };
    }
  };

  T.venusWindow = window_;
})(window.Tide);
