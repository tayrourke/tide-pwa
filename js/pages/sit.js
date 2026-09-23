/* Tide — guided stillness. Completing five minutes lights the stillness star. */
(function (T) {
  const { esc, header, fmt } = T.ui;
  const st = T.store;
  let tick = null;
  let closing = false;
  let audioCtx = null;

  const PHASES = [
    { until: 0.12, title: 'Arrive', line: 'Feel the weight of your body. Let your jaw unclench and your shoulders drop.' },
    { until: 0.34, title: 'Body', line: 'Move your attention slowly from your feet to your face. Notice what’s tight. Leave it there.' },
    { until: 0.72, title: 'Breath', line: 'Follow the circle. When your mind leaves, come back, without a story about why.' },
    { until: 0.9, title: 'The wave', line: 'Notice where you are: riding high, steady, or in the trough. You don’t have to decide anything.' },
    { until: 1, title: 'Stay', line: 'Let the sit finish itself. Stay until the bell.' }
  ];

  function remaining(t) {
    if (!t) return 0;
    return t.paused ? t.left : Math.max(0, t.end - Date.now());
  }
  const mmss = (ms) => {
    const s = Math.ceil(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  function phaseFor(elapsed, total) {
    const p = total ? Math.min(1, elapsed / total) : 0;
    return PHASES.find((ph) => p <= ph.until) || PHASES[PHASES.length - 1];
  }

  function chime(kind) {
    if (st.s.settings.chime === false) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const play = (freq, delay, dur, gain) => {
        const t0 = audioCtx.currentTime + delay;
        const o = audioCtx.createOscillator();
        const over = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        over.type = 'sine';
        o.frequency.setValueAtTime(freq, t0);
        over.frequency.setValueAtTime(freq * 2, t0);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(gain, t0 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g);
        over.connect(g);
        g.connect(audioCtx.destination);
        o.start(t0);
        over.start(t0);
        o.stop(t0 + dur + 0.05);
        over.stop(t0 + dur + 0.05);
      };
      if (kind === 'end') { play(392, 0, 2.6, 0.07); play(523.25, 0.45, 3.1, 0.06); }
      else play(523.25, 0, 2.2, 0.06);
    } catch (e) {}
  }

  function weekDots() {
    return st.lastNDays(7).map((w) => {
      const d = st.peekDay(w.key);
      const n = d && d.sits ? d.sits.length : 0;
      const today = w.key === st.today();
      return `<span class="sit-day ${n ? 'is-sat' : ''} ${today ? 'is-today' : ''}" title="${esc(fmt.dow(w.date))}${n ? ', ' + n + ' sit' + (n === 1 ? '' : 's') : ''}"><i></i><b>${esc(fmt.dow(w.date))}</b></span>`;
    }).join('');
  }

  T.pages.sit = {
    nav: 'pool',
    title: 'Sit',
    render(el) {
      closing = false;
      const running = st.s.sitTimer && remaining(st.s.sitTimer) > 0;
      if (st.s.sitTimer && !running && !st.s.sitTimer.paused) finish(false);
      else if (running || (st.s.sitTimer && st.s.sitTimer.paused)) session();
      else intro();

      function intro() {
        clearInterval(tick);
        const sits = st.s.sits || 0;
        const chimeOn = st.s.settings.chime !== false;
        el.innerHTML = `
        ${header('Sit in stillness', { back: '#/', sub: 'Emotional authority finds clarity in quiet, not in the moment. Sit, feel the wave, and let the decision wait.' })}
        <div class="sit-orb is-idle" aria-hidden="true"></div>
        <div class="seg" role="group" aria-label="Sit length">
          ${[5, 10, 20].map((m) => `<button class="seg-btn" aria-pressed="${m === 5}" data-m="${m}">${m} min</button>`).join('')}
        </div>
        <button class="btn btn-primary btn-block" id="start">Begin sitting</button>
        <button class="chip ${chimeOn ? 'chip-strong' : ''}" id="chime" aria-pressed="${chimeOn}" type="button">${chimeOn ? 'Soft bell on' : 'Soft bell off'}</button>
        <div class="sit-week" aria-label="Sits this week">${weekDots()}</div>
        <p class="center muted small-t">${sits ? `You’ve finished <strong>${sits}</strong> sit${sits === 1 ? '' : 's'}. Five minutes lights today’s stillness star.` : 'Five minutes lights today’s stillness star. Ten and twenty are here when you want more quiet.'}</p>`;
        let sel = 5;
        el.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => {
          sel = Number(b.dataset.m);
          el.querySelectorAll('[data-m]').forEach((x) => x.setAttribute('aria-pressed', x === b));
        }));
        el.querySelector('#chime').onclick = () => {
          st.s.settings.chime = st.s.settings.chime === false;
          st.save();
          intro();
        };
        el.querySelector('#start').onclick = () => {
          st.s.sitTimer = { total: sel * 60000, end: Date.now() + sel * 60000, paused: false };
          st.save();
          chime('start');
          T.ui.buzz(8);
          session();
        };
      }

      function session() {
        clearInterval(tick);
        const t = st.s.sitTimer;
        const left = remaining(t);
        const elapsed = t.total - left;
        const ph = phaseFor(elapsed, t.total);
        el.innerHTML = `
        <div class="sit-ride">
          <p class="sit-phase" id="phase">${esc(ph.title)}</p>
          <p class="sit-line" id="line">${esc(ph.line)}</p>
          <div class="sit-orb ${t.paused ? 'is-paused' : ''}" id="orb" aria-hidden="true"></div>
          <p class="sit-time" id="left" aria-live="polite">${mmss(left)}</p>
          <p class="muted small-t" id="state">${t.paused ? 'Paused' : 'Sitting'}</p>
          <div class="btn-row">
            <button class="btn btn-outline" id="stop">End</button>
            <button class="btn btn-primary" id="pause">${t.paused ? 'Resume' : 'Pause'}</button>
          </div>
        </div>`;
        const leftEl = el.querySelector('#left');
        const phaseEl = el.querySelector('#phase');
        const lineEl = el.querySelector('#line');
        const orb = el.querySelector('#orb');
        const stateEl = el.querySelector('#state');
        let lastTitle = ph.title;

        function paint() {
          const timer = st.s.sitTimer;
          if (!timer || !document.body.contains(leftEl)) return;
          const l = remaining(timer);
          leftEl.textContent = mmss(l);
          const next = phaseFor(timer.total - l, timer.total);
          if (next.title !== lastTitle) {
            lastTitle = next.title;
            phaseEl.textContent = next.title;
            lineEl.textContent = next.line;
          }
          if (!timer.paused && l <= 0) finish(false);
        }
        if (!t.paused) tick = setInterval(paint, 500);

        el.querySelector('#pause').onclick = () => {
          const timer = st.s.sitTimer;
          if (timer.paused) {
            timer.end = Date.now() + timer.left;
            timer.paused = false;
            delete timer.left;
            orb.classList.remove('is-paused');
            stateEl.textContent = 'Sitting';
            tick = setInterval(paint, 500);
          } else {
            timer.left = remaining(timer);
            timer.paused = true;
            clearInterval(tick);
            orb.classList.add('is-paused');
            stateEl.textContent = 'Paused';
          }
          el.querySelector('#pause').textContent = timer.paused ? 'Resume' : 'Pause';
          st.save();
        };
        el.querySelector('#stop').onclick = () => finish(true);
      }

      async function finish(early) {
        if (closing) return;
        closing = true;
        clearInterval(tick);
        const timer = st.s.sitTimer;
        const total = timer ? timer.total : 0;
        const left = timer ? remaining(timer) : total;
        const elapsed = Math.max(0, total - left);
        st.s.sitTimer = null;
        st.save();

        const kept = elapsed >= 45000;
        const lights = elapsed >= 5 * 60000 - 1500;
        if (!kept) {
          T.ui.toast('Come back when you have a quiet minute.');
          closing = false;
          intro();
          return;
        }
        if (!early) chime('end');
        const minutes = Math.max(1, Math.round(elapsed / 60000));
        const d = st.day();
        d.sits = d.sits || [];
        const rec = { at: Date.now(), min: minutes, note: '' };
        d.sits.push(rec);
        st.s.sits = (st.s.sits || 0) + 1;
        let rewards = [];
        if (lights) {
          st.mark('still', true);
          rewards = T.game.checkRewards();
        } else st.save();

        el.innerHTML = `
        ${header(lights ? 'You sat. The star is lit.' : 'You sat.', { back: '#/' })}
        <div class="sit-orb is-idle" aria-hidden="true"></div>
        <p class="sit-done">${minutes} quiet minute${minutes === 1 ? '' : 's'}.${lights ? '' : ' Five minutes lights the stillness star.'}</p>
        <form id="sform" class="stack">
          <label class="lbl" for="snote">What did you notice?</label>
          <textarea id="snote" rows="3" placeholder="A feeling, a tightness, nothing at all"></textarea>
          <button class="btn btn-primary btn-block" type="submit">Keep this</button>
          <a class="btn btn-ghost btn-block" href="#/">Back to the pool</a>
        </form>`;
        if (rewards.length) T.game.revealAll(rewards);
        el.querySelector('#sform').onsubmit = (e) => {
          e.preventDefault();
          rec.note = el.querySelector('#snote').value.trim();
          st.save();
          T.ui.toast('Noted.');
          location.hash = '#/';
        };
        el.querySelector('#snote').focus();
      }
    },
    leave() { clearInterval(tick); tick = null; }
  };
})(window.Tide);
