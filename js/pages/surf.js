(function (T) {
  const { esc, header, fmt } = T.ui;
  const st = T.store;
  const G = T.game;
  const IN = 4, OUT = 6, BREATHS = 9;           // 9 slow breaths, about 90 seconds
  const CYCLE = IN + OUT, DURATION = CYCLE * BREATHS;
  let raf = null;

  const WHISPERS = [
    'Notice the pull. You don’t have to do anything with it.',
    'Let your shoulders drop. Unclench your jaw.',
    'The urge is a wave. You’re the water, not the wave.',
    'It’s already softening.',
    'You stayed. That’s the whole practice.'
  ];
  const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);

  T.pages.surf = {
    nav: 'pool',
    title: 'Breathe',
    render(el) {
      intro();

      function intro() {
        const s = G.ensure();
        el.innerHTML = `
        ${header('Breathe with the wave', { sub: 'Nine slow breaths, about a minute and a half. Breathe in as the wave rises, out as it falls. The urge usually passes by the end, and the sea leaves you a pearl.' })}
        <div class="surf-stage idle">
          <svg viewBox="0 0 360 220" class="surf-svg" aria-hidden="true">
            <path d="M0 150 Q45 140 90 150 T180 150 T270 150 T360 150 V220 H0Z" fill="var(--water)" opacity=".5"/>
            <path d="M0 162 Q45 154 90 162 T180 162 T270 162 T360 162 V220 H0Z" fill="var(--water)"/>
            <circle cx="180" cy="142" r="8" fill="#F7F3EA" stroke="#D8CFC0"/>
          </svg>
        </div>
        <button class="btn btn-primary btn-block" id="go">Start breathing</button>
        <button class="btn btn-ghost btn-block" id="skip">Skip to what I’m craving</button>
        <p class="center muted small-t surf-count">${s.surfs ? `You’ve breathed through <strong>${s.surfs}</strong> urge${s.surfs === 1 ? '' : 's'}. ${s.pearls} pearl${s.pearls === 1 ? '' : 's'} in your pool.` : 'Every urge you breathe through leaves a pearl in your pool.'}</p>`;
        el.querySelector('#go').onclick = ride;
        el.querySelector('#skip').onclick = () => cravings(false);
      }

      function ride() {
        el.innerHTML = `
        <div class="surf-ride">
          <p class="breath-word" id="word" aria-live="polite">Breathe in</p>
          <p class="breath-count" id="count">Breath 1 of ${BREATHS}</p>
          <div class="surf-stage">
            <svg viewBox="0 0 360 260" class="surf-svg" aria-hidden="true">
              <path id="back" fill="var(--water)" opacity=".45"/>
              <path id="front" fill="var(--water)"/>
              <circle id="pearl" r="8" fill="#F7F3EA" stroke="#D8CFC0"/>
            </svg>
          </div>
          <p class="surf-phase" id="phase">${esc(WHISPERS[0])}</p>
          <button class="btn btn-ghost btn-block" id="stop">Stop</button>
        </div>`;
        const back = el.querySelector('#back'), front = el.querySelector('#front'), pearl = el.querySelector('#pearl');
        const word = el.querySelector('#word'), count = el.querySelector('#count'), phase = el.querySelector('#phase');
        let lastWord = 'in', lastBreath = 0, lastWhisper = 0;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const t0 = performance.now();

        function wavePath(amp, offset, base, width) {
          // a single swell centered at 180 on a gently rolling line
          let d = `M0 ${base}`;
          for (let x = 0; x <= 360; x += 6) {
            const swell = amp * Math.exp(-Math.pow((x - 180) / width, 2));
            const ripple = Math.sin((x + offset) / 28) * 3;
            d += ` L${x} ${(base - swell + ripple).toFixed(1)}`;
          }
          return d + ` L360 260 L0 260 Z`;
        }

        function frame(now) {
          const t = (now - t0) / 1000;
          const breath = Math.min(BREATHS - 1, Math.floor(t / CYCLE));
          const c = t - breath * CYCLE;
          const inhaling = c < IN;
          const amp = (inhaling ? ease(c / IN) : 1 - ease((c - IN) / OUT)) * 130;
          const off = reduce ? 0 : t * 14;
          back.setAttribute('d', wavePath(amp * .8, off * .6 + 40, 214, 95));
          front.setAttribute('d', wavePath(amp, off, 224, 80));
          pearl.setAttribute('cx', 180);
          pearl.setAttribute('cy', (224 - amp - 9 + Math.sin(off / 28 + 6.4) * 3).toFixed(1));
          const w = inhaling ? 'in' : 'out';
          if (w !== lastWord) { lastWord = w; word.textContent = inhaling ? 'Breathe in' : 'Breathe out'; word.classList.toggle('is-out', !inhaling); T.ui.buzz(inhaling ? 8 : 4); }
          if (breath !== lastBreath) { lastBreath = breath; count.textContent = 'Breath ' + (breath + 1) + ' of ' + BREATHS; }
          const wi = Math.min(WHISPERS.length - 1, Math.floor(breath / 2));
          if (wi !== lastWhisper) { lastWhisper = wi; phase.textContent = WHISPERS[wi]; }
          if (t >= DURATION) { raf = null; return done(); }
          raf = requestAnimationFrame(frame);
        }
        raf = requestAnimationFrame(frame);
        el.querySelector('#stop').onclick = () => { cancelAnimationFrame(raf); raf = null; intro(); };
      }

      async function done() {
        G.addPearl();
        await G.reveal({ type: 'pearl' });
        cravings(true);
      }

      function cravings(surfed) {
        el.innerHTML = `
        ${header(surfed ? 'What were you craving?' : 'What are you actually craving?', { back: '#/surf' })}
        <p class="muted" style="margin:-8px 0 16px">Underneath the scroll there’s usually a real need. Let’s meet it.</p>
        <div class="choice-list">
          ${T.DATA.CRAVINGS.map((c) => `<button class="choice" data-c="${c.id}">${esc(c.label)}</button>`).join('')}
        </div>
        <a class="btn btn-ghost btn-block" href="#/">I’m good now. Back to my pool</a>`;
        el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => answer(b.dataset.c)));
      }

      function answer(id) {
        const c = T.DATA.CRAVINGS.find((x) => x.id === id);
        st.s.sos.push({ at: Date.now(), choice: id });
        st.save();
        const end = c.timer ? new Date(Date.now() + c.timer * 60000) : null;
        el.innerHTML = `
        ${header('', { back: '#/surf' })}
        <article class="sos-answer">
          <h1 class="page-title" tabindex="-1">${esc(c.head)}</h1>
          <p class="lead">${esc(c.body)}</p>
          <p class="key-note">${esc(c.key)}</p>
          ${end ? `<p class="back-by">Back by <b>${esc(fmt.time(end))}</b></p>` : ''}
          <button class="btn btn-primary btn-block" id="act">${esc(c.cta)}</button>
          <button class="btn btn-ghost btn-block" id="other">Something else</button>
        </article>`;
        el.querySelector('#other').onclick = () => cravings(true);
        el.querySelector('#act').onclick = async () => {
          if (c.mark) {
            st.mark(c.mark, true);
            const rewards = G.checkRewards();
            T.ui.toast('The tide rose');
            if (rewards.length) await G.revealAll(rewards);
          }
          location.hash = c.go || '#/';
        };
        el.querySelector('.page-title').focus();
      }
    },
    leave() { if (raf) cancelAnimationFrame(raf); raf = null; }
  };
})(window.Tide);
