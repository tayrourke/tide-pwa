(function (T) {
  const { esc, header, pool, setPool, fmt } = T.ui;
  const st = T.store;
  let tick = null;

  function remaining(t) {
    if (!t) return 0;
    return t.paused ? t.left : Math.max(0, t.end - Date.now());
  }
  const mmss = (ms) => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  T.pages.make = {
    nav: 'make',
    title: 'Make',
    render(el, params) {
      const s = st.s;
      let sel = Number(params.min) || (s.timer && s.timer.total / 60000) || 25;

      function draw() {
        clearInterval(tick);
        const t = s.timer;
        const running = !!t;
        const left = remaining(t);
        const level = running ? 1 - left / t.total : 0;
        const d = st.day();

        el.innerHTML = `
        ${header('Make', { sub: 'Small and finished beats big and brilliant. Every full session grows your coral one branch.' })}
        <div class="pool timer ${running && left === 0 ? 'is-full' : ''}" id="tpool">
          ${pool(level)}
          <div class="pool-count"><b id="tleft">${running ? mmss(left) : sel + ':00'}</b><span>${running ? (t.paused ? 'paused' : 'making') : 'minutes'}</span></div>
        </div>
        ${running ? `
          <div class="btn-row">
            <button class="btn btn-outline" id="stop">End early</button>
            <button class="btn btn-primary" id="pause">${t.paused ? 'Resume' : 'Pause'}</button>
          </div>` : `
          <div class="seg" role="group" aria-label="Session length">
            ${[10, 25, 45].map((m) => `<button class="seg-btn" aria-pressed="${m === sel}" data-m="${m}">${m} min</button>`).join('')}
          </div>
          <button class="btn btn-primary btn-block" id="start">Start making</button>`}
        <div class="coral-meter">
          <svg viewBox="-34 -64 68 70" width="56" height="58" aria-hidden="true">${T.game.coralSVG(Math.max(1, T.game.ensure().coral.stage), 0, 0, 1)}</svg>
          <div><b>${T.game.ensure().coral.stage} of 10 branches</b><span class="muted small-t">${T.game.ensure().coral.done ? T.game.ensure().coral.done + ' coral grown so far' : 'Your first coral is growing'}</span></div>
        </div>
        ${d.focus && !running ? `<p class="center muted small-t">Today’s gut yes: <b class="ink">${esc(d.focus)}</b></p>` : ''}

        <section class="block">
          <h2>Log a make</h2>
          <form class="adder" id="mform">
            <input id="mtext" placeholder="What did you make?" aria-label="What did you make" autocomplete="off">
            <button class="btn btn-primary" type="submit">Log it</button>
          </form>
          ${d.makes.length ? `<ul class="made-list">${d.makes.map((m) => `<li><time>${esc(fmt.time(new Date(m.at)))}</time><span>${esc(m.text)}</span></li>`).join('')}</ul>` : '<p class="muted small-t">Nothing yet today. A caption counts. A clean counter counts.</p>'}
          <a class="row-link" href="#/treasures"><span>My treasures and tide journal</span>${T.ui.I.chevron}</a>
        </section>`;

        el.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { sel = Number(b.dataset.m); draw(); }));
        const start = el.querySelector('#start');
        if (start) start.onclick = () => { s.timer = { total: sel * 60000, end: Date.now() + sel * 60000, paused: false }; st.save(); T.ui.buzz(); draw(); };
        const pause = el.querySelector('#pause');
        if (pause) pause.onclick = () => {
          const t = s.timer;
          if (t.paused) { t.end = Date.now() + t.left; t.paused = false; delete t.left; }
          else { t.left = remaining(t); t.paused = true; }
          st.save(); draw();
        };
        const stop = el.querySelector('#stop');
        if (stop) stop.onclick = () => finish(true);

        el.querySelector('#mform').onsubmit = (e) => {
          e.preventDefault();
          const v = el.querySelector('#mtext').value.trim();
          if (!v) return;
          st.addMake(v);
          const rewards = T.game.checkRewards();
          if (rewards.length) T.game.revealAll(rewards).then(draw);
          else { T.ui.toast('Logged. That’s a make.'); draw(); }
        };

        if (running && !t.paused) {
          const tp = el.querySelector('#tpool'), tl = el.querySelector('#tleft');
          tick = setInterval(() => {
            if (!document.body.contains(tl)) return clearInterval(tick);
            const l = remaining(s.timer);
            tl.textContent = mmss(l);
            setPool(tp, 1 - l / s.timer.total);
            if (l <= 0) { clearInterval(tick); finish(false); }
          }, 500);
        }
      }

      function finish(early) {
        s.timer = null; st.save();
        if (!early) T.ui.buzz([30, 60, 30, 60, 30]);
        el.innerHTML = `
        ${header(early ? 'Session ended' : 'Time. You made something.', { back: '#/make' })}
        <div class="pool big is-full">${pool(1)}<div class="pool-count"><b>✓</b><span>${early ? 'still counts' : 'high tide'}</span></div></div>
        <form id="fform" class="stack">
          <label class="lbl" for="ftext">What did you make?</label>
          <input id="ftext" placeholder="Even a small thing counts" autocomplete="off">
          <button class="btn btn-primary btn-block" type="submit">Log it</button>
          <button type="button" class="btn btn-ghost btn-block" id="skipf">Skip</button>
        </form>`;
        el.querySelector('#ftext').focus();
        const growth = early ? null : T.game.growCoral();
        el.querySelector('#fform').onsubmit = async (e) => {
          e.preventDefault();
          const v = el.querySelector('#ftext').value.trim();
          const rewards = [];
          if (growth) rewards.push({ type: 'coral', ...growth });
          if (v) { st.addMake(v); rewards.push(...T.game.checkRewards()); }
          if (rewards.length) await T.game.revealAll(rewards);
          location.hash = '#/';
        };
        el.querySelector('#skipf').onclick = async () => {
          if (growth) await T.game.reveal({ type: 'coral', ...growth });
          location.hash = '#/';
        };
      }

      draw();
    },
    leave() { clearInterval(tick); }
  };
})(window.Tide);
