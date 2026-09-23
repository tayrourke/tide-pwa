(function (T) {
  const { esc, header, fmt, I, pool } = T.ui;
  const st = T.store;
  const nowHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  /* ---------- More menu ---------- */
  T.pages.more = {
    nav: 'more',
    title: 'More',
    render(el) {
      const items = [
        ['#/settings', 'Settings', 'Notifications, name, theme and backup'],
        ['#/venus', 'Venus retrograde', 'Your chart ruler’s season: key dates, what to do and what to wait on'],
        ['#/sabbat', 'With the girls', 'Family rituals for each sabbat on the Wheel of the Year'],
        ['#/sit', 'Sit in stillness', 'A guided five, ten or twenty minutes with your wave'],
        ['#/surf', 'Breathe with the wave', 'Nine slow breaths when the pull comes'],
        ['#/treasures', 'Treasures', 'Your seasonal collection and tide journal'],
        ['#/rhythm', 'Rhythm', 'Your day in blocks, with protected make and hermit time'],
        ['#/reflect', 'Reflect', 'Evening check-in and your week at a glance'],
        ['#/sky?view=blueprint', 'My blueprint', 'Birth chart with houses, Human Design, Gene Keys and Life Path 33'],
        ['#/gut', 'Your gut yes', 'Let your body choose what to make']
      ];
      el.innerHTML = `${header('More')}
      <ul class="link-list big">${items.map(([h, t, s]) => `<li><a href="${h}"><span><b>${t}</b><span class="muted small-t">${s}</span></span>${I.chevron}</a></li>`).join('')}</ul>`;
    }
  };

  /* ---------- Rhythm ---------- */
  T.pages.rhythm = {
    nav: 'more',
    title: 'Rhythm',
    render(el) {
      const s = st.s;
      let editing = false;

      function draw() {
        const blocks = s.rhythm.slice().sort((a, b) => a.t.localeCompare(b.t));
        const hm = nowHM();
        let curIdx = -1;
        blocks.forEach((b, i) => { if (b.t <= hm) curIdx = i; });
        const types = T.DATA.BLOCK_TYPES;

        el.innerHTML = `
        ${header('Rhythm', { back: '#/more', sub: 'A shape for the day, not a cage. Protect the make and hermit blocks first.' })}
        <div class="legend">${Object.keys(types).map((k) => `<span class="legend-i type-${k}"><i></i>${types[k]}</span>`).join('')}</div>
        ${editing ? `
          <ul class="edit-blocks">
            ${blocks.map((b) => `
            <li class="edit-block" data-id="${esc(b.t + b.label)}">
              <div class="eb-row">
                <input type="time" value="${esc(b.t)}" data-f="t" aria-label="Start time">
                <select data-f="type" aria-label="Block type">${Object.keys(types).map((k) => `<option value="${k}" ${k === b.type ? 'selected' : ''}>${types[k]}</option>`).join('')}</select>
                <button class="icon-btn" data-rm aria-label="Remove block">${I.x}</button>
              </div>
              <input data-f="label" value="${esc(b.label)}" placeholder="Block name" aria-label="Block name">
              <input data-f="note" value="${esc(b.note || '')}" placeholder="Note (optional)" aria-label="Note">
            </li>`).join('')}
          </ul>
          <div class="btn-row">
            <button class="btn btn-outline" id="add">${I.plus} Add block</button>
            <button class="btn btn-primary" id="done">Save</button>
          </div>
          <button class="btn btn-ghost btn-block" id="restore">Restore the default rhythm</button>
        ` : `
          <ol class="timeline">
            ${blocks.map((b, i) => `
            <li class="tl type-${esc(b.type)} ${i === curIdx ? 'is-now' : ''} ${i < curIdx ? 'is-past' : ''}">
              <time>${esc(fmt.hm(b.t))}</time>
              <div class="tl-body">
                <b>${esc(b.label)}</b>
                ${b.note ? `<span>${esc(b.note)}</span>` : ''}
                ${i === curIdx ? '<em class="now-pill">Now</em>' : ''}
              </div>
            </li>`).join('')}
          </ol>
          <button class="btn btn-outline btn-block" id="edit">Edit my rhythm</button>
        `}`;

        if (!editing) {
          el.querySelector('#edit').onclick = () => { editing = true; draw(); };
          const now = el.querySelector('.is-now');
          if (now) now.scrollIntoView({ block: 'center', behavior: 'auto' });
          window.scrollTo(0, 0);
          return;
        }
        const collect = () => {
          s.rhythm = Array.from(el.querySelectorAll('.edit-block')).map((li) => ({
            t: li.querySelector('[data-f="t"]').value || '00:00',
            type: li.querySelector('[data-f="type"]').value,
            label: li.querySelector('[data-f="label"]').value.trim() || 'Untitled',
            note: li.querySelector('[data-f="note"]').value.trim()
          }));
        };
        el.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => { b.closest('.edit-block').remove(); }));
        el.querySelector('#add').onclick = () => { collect(); s.rhythm.push({ t: '12:00', type: 'make', label: 'New block', note: '' }); draw(); };
        el.querySelector('#done').onclick = () => { collect(); st.save(); editing = false; T.ui.toast('Rhythm saved'); draw(); };
        el.querySelector('#restore').onclick = () => {
          if (!confirm('Replace your rhythm with the default?')) return;
          s.rhythm = st.clone(T.DATA.RHYTHM); st.save(); editing = false; draw();
        };
      }
      draw();
    }
  };

  /* ---------- Reflect ---------- */
  const QS = [
    { id: 'proud', label: 'What am I proud of today?' },
    { id: 'pull', label: 'What pulled me toward scrolling?' },
    { id: 'feel', label: 'What am I feeling, honestly?' },
    { id: 'tomorrow', label: 'Tomorrow’s one thing' }
  ];
  function scrollWeek() {
    const S = st.s;
    const week = st.lastNDays(7);
    const vals = week.map((w) => { const d = S.days[w.key]; return d && d.screen ? d.screen.ig : null; });
    if (!vals.some((v) => v != null)) return '<p class="muted small-t sc-empty">Your week of Instagram minutes shows up here after your first check.</p>';
    const max = Math.max(30, ...vals.filter((v) => v != null));
    const bars = week.map((w, i) => {
      const v = vals[i], n = st.doneCount(w.key);
      const h = v == null ? 0 : Math.max(4, (v / max) * 90);
      return `<div class="sc-col"><span class="sc-v">${v == null ? '' : v}</span><div class="sc-bar ${v == null ? 'is-none' : ''}" style="height:${h}px"></div><b>${esc(fmt.dow(w.date))}</b><span class="sc-stars">${'✦'.repeat(Math.min(n, 6)) || '·'}</span></div>`;
    }).join('');
    return `<div class="sc-chart" role="img" aria-label="Instagram minutes for the last seven days">${bars}</div>${insight()}`;
  }

  function insight() {
    const S = st.s;
    const days = st.lastNDays(28).map((w) => ({ k: w.key, d: S.days[w.key] })).filter((x) => x.d && x.d.screen && x.d.screen.ig != null);
    if (days.length < 4) return `<p class="sc-insight muted">After a few more check-ins, Tide will show you which practices actually quiet the scroll.</p>`;
    const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const lines = [];
    const hi = days.filter((x) => st.doneCount(x.k) >= 4).map((x) => x.d.screen.ig);
    const lo = days.filter((x) => st.doneCount(x.k) < 4).map((x) => x.d.screen.ig);
    if (hi.length >= 2 && lo.length >= 2) lines.push(`On days you lit 4 or more stars, you averaged <b>${avg(hi)} min</b> on Instagram, compared with <b>${avg(lo)} min</b> on other days.`);
    let best = null;
    T.DATA.RITUALS.forEach((r) => {
      const yes = days.filter((x) => x.d.done[r.id]).map((x) => x.d.screen.ig);
      const no = days.filter((x) => !x.d.done[r.id]).map((x) => x.d.screen.ig);
      if (yes.length >= 2 && no.length >= 2) {
        const diff = avg(no) - avg(yes);
        if (diff > 0 && (!best || diff > best.diff)) best = { r, diff };
      }
    });
    if (best) lines.push(`Your strongest medicine so far: <b>${esc(best.r.title.toLowerCase())}</b>. Those days, you scrolled <b>${best.diff} fewer minutes</b>.`);
    return lines.length ? `<div class="sc-insight">${lines.map((l) => `<p>${l}</p>`).join('')}</div>` : '';
  }

  T.pages.reflect = {
    nav: 'more',
    title: 'Reflect',
    render(el) {
      const d = st.day();
      const week = st.lastNDays(7);
      el.innerHTML = `
      ${header('Reflect', { back: '#/more', sub: 'Emotional authority: clarity comes over time. Notice where your wave is, no judgment.' })}
      <section class="block">
        <h2>My wave today</h2>
        <div class="seg seg-3" role="group" aria-label="Emotional wave">
          ${T.DATA.WAVES.map((w) => `<button class="seg-btn" data-wave="${w.id}" aria-pressed="${d.wave === w.id}">${w.label}</button>`).join('')}
        </div>
      </section>
      <section class="block scroll-check">
        <h2>Tonight’s scroll check</h2>
        <p class="muted small-t">Apple doesn’t let apps like Tide read Screen Time, so this takes 20 seconds: open <b>Settings → Screen Time → See All App &amp; Website Activity</b>, tap <b>Day</b>, and copy two numbers.</p>
        <div class="sc-inputs">
          <label><span>Instagram</span><span class="sc-field"><input type="number" inputmode="numeric" min="0" id="scIg" value="${d.screen && d.screen.ig != null ? d.screen.ig : ''}" placeholder="0"><i>min</i></span></label>
          <label><span>Total screen time</span><span class="sc-field"><input type="number" inputmode="numeric" min="0" id="scH" value="${d.screen && d.screen.total != null ? Math.floor(d.screen.total / 60) : ''}" placeholder="0"><i>h</i><input type="number" inputmode="numeric" min="0" max="59" id="scM" value="${d.screen && d.screen.total != null ? d.screen.total % 60 : ''}" placeholder="0"><i>m</i></span></label>
        </div>
        <button class="btn btn-primary btn-block" id="scSave">${d.screen ? 'Update' : 'Save'} tonight’s numbers</button>
        <div id="scWeek">${scrollWeek()}</div>
      </section>

      <div class="stack">
        ${QS.map((q) => `<div class="field"><label class="lbl" for="rq-${q.id}">${q.label}</label>
          <textarea id="rq-${q.id}" data-q="${q.id}" rows="2">${esc(d.reflect[q.id] || '')}</textarea></div>`).join('')}
      </div>

      <section class="block">
        <h2>This week</h2>
        <div class="week">
          ${week.map((w) => {
            const dd = st.peekDay(w.key);
            const n = st.doneCount(w.key);
            const wave = dd && dd.wave;
            return `<div class="wk ${w.key === st.today() ? 'is-today' : ''}">
              <div class="pool tiny">${pool(n / 6)}</div>
              <b>${esc(fmt.dow(w.date))}</b>
              <span class="wk-wave wave-${wave || 'none'}" title="${wave ? esc(T.DATA.WAVES.find((x) => x.id === wave).label) : 'No check-in'}"></span>
              <span class="wk-n">${n}/6</span>
            </div>`;
          }).join('')}
        </div>
        <p class="muted small-t">Pools show each day’s tide. The mark under each shows your wave: up, steady or down.</p>
      </section>`;

      el.querySelectorAll('[data-wave]').forEach((b) => (b.onclick = () => {
        d.wave = b.dataset.wave; st.save();
        el.querySelectorAll('[data-wave]').forEach((x) => x.setAttribute('aria-pressed', x === b));
        T.ui.toast('Noted. Waves move.');
      }));
      el.querySelectorAll('[data-q]').forEach((t) => (t.oninput = () => { d.reflect[t.dataset.q] = t.value; st.save(); }));
      el.querySelector('#scSave').onclick = () => {
        const ig = parseInt(el.querySelector('#scIg').value, 10);
        const h = parseInt(el.querySelector('#scH').value, 10) || 0, m = parseInt(el.querySelector('#scM').value, 10) || 0;
        if (isNaN(ig) && !h && !m) { T.ui.toast('Add at least your Instagram minutes'); return; }
        d.screen = { ig: isNaN(ig) ? 0 : ig, total: h * 60 + m, at: Date.now() };
        st.save();
        el.querySelector('#scWeek').innerHTML = scrollWeek();
        el.querySelector('#scSave').textContent = 'Update tonight’s numbers';
        T.ui.toast('Saved. Honest numbers are a gift to yourself.');
      };
    }
  };

  /* ---------- Design ---------- */
  T.pages.design = {
    nav: 'more',
    title: 'My design',
    render(el) {
      el.innerHTML = `
      ${header('My design', { back: '#/more', sub: 'Your Activation Sequence, chart and Human Design, and what each one asks of you.' })}
      <div class="keys">
        ${T.DATA.KEYS.map((k) => `
        <article class="key-card">
          <span class="muted small-t">${esc(k.sphere)}</span>
          <h2>Gene Key ${esc(k.key)}</h2>
          <div class="spectrum">
            <span class="sp sp-shadow"><i>Shadow</i>${esc(k.shadow)}</span>
            <span class="sp sp-gift"><i>Gift</i>${esc(k.gift)}</span>
            <span class="sp sp-siddhi"><i>Siddhi</i>${esc(k.siddhi)}</span>
          </div>
          <p>${esc(k.about)}</p>
          <details class="drawer"><summary>Contemplations</summary>
            <ul class="asks">${k.asks.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
          </details>
        </article>`).join('')}
      </div>
      <section class="block">
        <h2>Chart and Human Design</h2>
        <dl class="chart">
          ${T.DATA.CHART.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${esc(c.text)}</dd></div>`).join('')}
        </dl>
        <p class="muted small-t">Gene Keys calculated from birth data. Double-check the lines against your free profile at genekeys.com.</p>
      </section>`;
    }
  };

  /* ---------- Settings ---------- */
  T.pages.settings = {
    nav: 'more',
    title: 'Settings',
    render(el) {
      const s = st.s;
      el.innerHTML = `
      ${header('Settings', { back: '#/more' })}
      <section class="block nudges">
        <h2>Nudges from the tide</h2>
        <p class="muted small-t">Gentle notifications, only to this phone. Each one reads how your day is going, and the moon, before it speaks.</p>
        <ul class="nudge-times">${T.CONFIG.NUDGES.map((n) => `<li><b>${esc(n.time)}</b><span>${esc(n.what)}</span></li>`).join('')}</ul>
        <div id="nudgeBox"><p class="muted small-t">Checking…</p></div>
      </section>

      <div class="stack">
        <div class="field"><label class="lbl" for="sname">My name</label><input id="sname" value="${esc(s.settings.name)}" autocomplete="off"></div>
        <div class="field"><span class="lbl">Theme</span>
          <div class="seg seg-3" role="group" aria-label="Theme">
            ${['auto', 'light', 'dark'].map((t) => `<button class="seg-btn" data-theme="${t}" aria-pressed="${s.settings.theme === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
          </div>
        </div>
      </div>

      <section class="block">
        <h2>House system</h2>
        <p class="muted small-t">Changes which house the moon, new moons and full moons fall in. Placidus is what most chart websites use. Whole sign is the older, simpler way.</p>
        <div class="seg seg-2" role="group" aria-label="House system">
          ${[['placidus', 'Placidus'], ['whole', 'Whole sign']].map(([k, l]) => `<button class="seg-btn" data-hs="${k}" aria-pressed="${(s.settings.houseSystem || 'placidus') === k}">${l}</button>`).join('')}
        </div>
      </section>

      <section class="block">
        <h2>Backup</h2>
        <p class="muted small-t">Everything is saved on this phone only. Export a backup now and then, especially before clearing Safari data.</p>
        <div class="btn-row">
          <button class="btn btn-outline" id="exp">Export backup</button>
          <label class="btn btn-outline" for="imp">Import backup</label>
          <input type="file" id="imp" accept="application/json,.json" hidden>
        </div>
      </section>

      <section class="block">
        <h2>Put Tide where Instagram was</h2>
        <ol class="howto">
          <li>Open Tide in Safari and tap Share, then Add to Home Screen.</li>
          <li>Move Instagram off your home screen, and put Tide in its spot.</li>
          <li>Put Meta Business Suite on your home screen for posting.</li>
          <li>Set a Screen Time limit on Instagram, with a passcode someone else holds.</li>
          <li>Keep your Brick somewhere that takes a walk to reach.</li>
          <li>Long-press the Tide icon for shortcuts straight to Breathe and Make.</li>
        </ol>
      </section>

      <section class="block">
        <h2>Start over</h2>
        <button class="btn btn-danger btn-block" id="reset">Erase everything</button>
      </section>`;

      const box = el.querySelector('#nudgeBox');
      async function drawNudges() {
        const st2 = await Promise.race([
          T.push.status(),
          new Promise((resolve) => setTimeout(() => resolve({ state: 'slow' }), 4000))
        ]);
        const msgs = {
          unsupported: '<p class="note">This browser can’t receive notifications. Open Tide in Safari on your iPhone (iOS 16.4 or newer).</p>',
          'not-installed': '<p class="note">Open Tide from its home screen icon to turn nudges on. iPhones only allow notifications for apps added to the home screen.</p>',
          'needs-setup': '<p class="note">This phone doesn’t have the notification key yet. Close Tide completely, then open it again from the home screen icon.</p>',
          slow: '<p class="note">Still connecting. Close Tide completely, then open it again from the home screen icon.</p>',
          denied: '<p class="note">Notifications are blocked. Turn them on in iPhone Settings → Notifications → Tide, then come back.</p>'
        };
        if (msgs[st2.state]) { box.innerHTML = msgs[st2.state]; return; }
        if (st2.state === 'off') {
          box.innerHTML = '<button class="btn btn-primary btn-block" id="nOn">Let the tide reach me</button>';
          box.querySelector('#nOn').onclick = async () => {
            try { await T.push.enable(); T.ui.toast('The tide can reach you now'); drawNudges(); }
            catch (err) { T.ui.toast(err.message || 'That didn’t work. Try again.'); }
          };
          return;
        }
        box.innerHTML = `
          <p class="on-line"><span class="dot-on" aria-hidden="true"></span>Nudges are on for this phone</p>
          <details class="drawer">
            <summary>My phone’s address (for GitHub)</summary>
            <p class="muted small-t">Copy this and paste it into the <b>PUSH_SUBSCRIPTION</b> secret in your GitHub repo. It’s private, so don’t post it anywhere public.</p>
            <textarea readonly rows="5" id="subTxt">${esc(st2.sub)}</textarea>
            <button class="btn btn-outline btn-block" id="nCopy">Copy address</button>
          </details>
          <div class="btn-row">
            <button class="btn btn-outline" id="nTest">Send me a sample</button>
            <button class="btn btn-ghost" id="nOff">Turn off</button>
          </div>`;
        box.querySelector('#nCopy').onclick = () => T.ui.copy(st2.sub);
        box.querySelector('#nTest').onclick = () => T.push.sample().catch(() => T.ui.toast('Couldn’t show a sample'));
        box.querySelector('#nOff').onclick = async () => { await T.push.disable(); T.ui.toast('Nudges turned off'); drawNudges(); };
      }
      drawNudges();

      el.querySelectorAll('[data-hs]').forEach((b) => (b.onclick = () => {
        s.settings.houseSystem = b.dataset.hs; st.save(); TideAstro.setHouseSystem(b.dataset.hs);
        el.querySelectorAll('[data-hs]').forEach((x) => x.setAttribute('aria-pressed', x === b));
        T.ui.toast(b.dataset.hs === 'placidus' ? 'Using Placidus houses' : 'Using whole sign houses');
      }));
      el.querySelector('#sname').oninput = (e) => { s.settings.name = e.target.value.trim() || T.DATA.name; st.save(); };
      el.querySelectorAll('[data-theme]').forEach((b) => (b.onclick = () => {
        s.settings.theme = b.dataset.theme; st.save(); T.applyTheme();
        el.querySelectorAll('[data-theme]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      }));
      el.querySelector('#exp').onclick = () => {
        const blob = new Blob([st.exportJSON()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tide-backup-' + st.today() + '.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      };
      el.querySelector('#imp').onchange = (e) => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          try { st.importJSON(r.result); T.applyTheme(); T.ui.toast('Backup restored'); location.hash = '#/'; }
          catch (err) { T.ui.toast(err.message || 'That file couldn’t be read.'); }
        };
        r.readAsText(f);
      };
      el.querySelector('#reset').onclick = () => {
        if (!confirm('Erase all your days, makes, treasures, pearls, coral and settings? This can’t be undone.')) return;
        st.reset(); T.applyTheme(); location.hash = '#/';
      };
    }
  };
})(window.Tide);
