(function (T) {
  const { esc, header } = T.ui;
  const S = window.TideSky;
  const G = T.game;
  const st = T.store;
  let timer = null;

  const uniq = (arr) => arr.filter((x, i) => x && arr.indexOf(x) === i);

  T.pages.ritual = {
    nav: 'sky',
    title: 'Moon ritual',
    render(el) {
      const open = S.openRitual();
      const rituals = G.ensure().moonRituals;

      if (!open) {
        const next = S.nextLunations()[0];
        el.innerHTML = `
        ${header('Moon ritual', { back: '#/sky' })}
        <div class="ritual-closed">
          <span class="moon-disc ${next.type === 'new' ? 'new' : 'full'}" aria-hidden="true"></span>
          <h2>The next ritual opens with the ${next.type === 'new' ? 'new' : 'full'} moon in ${esc(next.sign)}</h2>
          <p class="muted">${esc(next.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}. It stays open for a few days, so there’s no rush.</p>
        </div>`;
        return;
      }

      const lunKey = open.date.toISOString();
      const existing = rituals.find((r) => r.lunation === lunKey);
      const lunar = S.LUNAR[open.sign];
      const house = S.houseInfo(open.lon).house;
      const isNew = open.type === 'new';
      const rec = { type: open.type, lunation: lunKey, sign: open.sign, at: 0 };

      if (existing) {
        el.innerHTML = `
        ${header('Moon ritual', { back: '#/sky' })}
        <div class="ritual-closed">
          <span class="moon-disc ${isNew ? 'new' : 'full'}" aria-hidden="true"></span>
          <h2>Your ${isNew ? 'new' : 'full'} moon ritual is complete</h2>
          <p class="ritual-quote">${esc(existing.intention || existing.released || '')}</p>
          <a class="btn btn-outline btn-block" href="#/sky">Back to your sky</a>
        </div>`;
        return;
      }

      const lastNew = rituals.filter((r) => r.type === 'new').slice(-1)[0];
      const steps = isNew ? ['intro', 'prepare', 'breathe', 'intention', 'speak'] : ['intro', 'prepare', 'bloom', 'release', 'grateful'];
      let i = 0;

      function go(n) { clearTimeout(timer); i = n; draw(); }

      function draw() {
        const step = steps[i];
        const dots = `<div class="ritual-dots" aria-hidden="true">${steps.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>`;
        let body = '';

        if (step === 'intro') body = `
          <span class="moon-disc big ${isNew ? 'new' : 'full'}" aria-hidden="true"></span>
          <p class="ritual-kicker">${isNew ? 'New moon' : 'Full moon'} in ${esc(open.sign)} ${esc(open.glyph)}</p>
          <h1 class="ritual-h page-title" tabindex="-1">${isNew ? 'Plant a seed in the dark' : 'Let the light show you what grew'}</h1>
          <p class="ritual-p">This moon falls in your house of ${esc(house)}.</p>
          <p class="ritual-p">${isNew ? `It’s a doorway for ${esc(lunar.seed)}. Whatever you plant tonight has a whole cycle to grow.` : `It lights up what’s been growing, and helps you release ${esc(lunar.release)}.`}</p>
          <button class="btn btn-moon btn-block" data-next>Begin the ritual</button>`;

        if (step === 'prepare') body = `
          <h1 class="ritual-h page-title" tabindex="-1">Set the space</h1>
          <p class="ritual-p">Light a candle, or just dim the lights. Sit somewhere comfortable. After this screen, let your phone rest face-up beside you, only for reading.</p>
          <p class="ritual-p soft">There’s no wrong way to do this. It’s just you, the moon and your intention.</p>
          <button class="btn btn-moon btn-block" data-next>I’m ready</button>`;

        if (step === 'breathe') body = `
          <h1 class="ritual-h page-title" tabindex="-1">Three slow breaths</h1>
          <div class="ritual-orb" aria-hidden="true"></div>
          <p class="ritual-p center" id="bcue">Breathe in…</p>
          <button class="btn btn-ghost-light btn-block" data-next>Continue</button>`;

        if (step === 'intention') body = `
          <h1 class="ritual-h page-title" tabindex="-1">What do you want to grow?</h1>
          <p class="ritual-p soft">Write it as if it’s already true. One sentence is perfect.</p>
          <div class="chip-row ritual-chips">${uniq([lunar.vow, 'I make before I take.', 'I trust my gut yes.', 'I rest without guilt.']).map((v) => `<button class="chip chip-moon" data-fill="${esc(v)}">${esc(v)}</button>`).join('')}</div>
          <textarea id="rtext" rows="3" class="ritual-input" placeholder="I am…"></textarea>
          <button class="btn btn-moon btn-block" data-save>Plant it</button>`;

        if (step === 'speak') body = `
          <h1 class="ritual-h page-title" tabindex="-1">Say it out loud</h1>
          <p class="ritual-p soft">Softly, three times. Let the words land in your body.</p>
          <p class="ritual-quote big">${esc(rec.intention)}</p>
          <button class="btn btn-moon btn-block" data-finish>It’s planted</button>`;

        if (step === 'bloom') body = `
          <h1 class="ritual-h page-title" tabindex="-1">What has grown?</h1>
          ${lastNew ? `<p class="ritual-p soft">At the new moon in ${esc(lastNew.sign)}, you planted:</p><p class="ritual-quote">${esc(lastNew.intention)}</p>` : '<p class="ritual-p soft">Look back over the last two weeks. What bloomed, even a little?</p>'}
          <textarea id="rtext" rows="3" class="ritual-input" placeholder="Even a small sprout counts…"></textarea>
          <button class="btn btn-moon btn-block" data-save>Next</button>`;

        if (step === 'release') body = `
          <h1 class="ritual-h page-title" tabindex="-1">What are you ready to let go of?</h1>
          <p class="ritual-p soft">Name it, then give it to the moon.</p>
          <div class="chip-row ritual-chips">${uniq([lunar.release, 'the endless scroll', 'comparing myself to others', 'doing it all alone']).map((v) => `<button class="chip chip-moon" data-fill="${esc(v)}">${esc(v)}</button>`).join('')}</div>
          <div class="release-wrap">
            <textarea id="rtext" rows="3" class="ritual-input" placeholder="I release…"></textarea>
            <div class="release-stage" id="stage" aria-hidden="true"></div>
          </div>
          <button class="btn btn-moon btn-block" data-release>Release it to the moon</button>`;

        if (step === 'grateful') body = `
          <h1 class="ritual-h page-title" tabindex="-1">One thank you</h1>
          <p class="ritual-p soft">Name one thing from this cycle you’re grateful for.</p>
          <textarea id="rtext" rows="2" class="ritual-input" placeholder="I’m grateful for…"></textarea>
          <button class="btn btn-moon btn-block" data-finish>Close the ritual</button>`;

        el.innerHTML = `<div class="ritual">${i ? `<button class="ritual-back" aria-label="Back">${T.ui.I.back}</button>` : `<a class="ritual-back" href="#/sky" aria-label="Back">${T.ui.I.back}</a>`}${dots}${body}</div>`;
        const h = el.querySelector('.page-title'); if (h) h.focus({ preventScroll: true });

        const back = el.querySelector('button.ritual-back'); if (back) back.onclick = () => go(i - 1);
        const nx = el.querySelector('[data-next]'); if (nx) nx.onclick = () => go(i + 1);
        el.querySelectorAll('[data-fill]').forEach((b) => (b.onclick = () => { const ta = el.querySelector('#rtext'); ta.value = b.dataset.fill; ta.focus(); }));

        if (step === 'breathe') {
          const cue = el.querySelector('#bcue');
          let n = 0;
          const tick = () => {
            n++;
            if (n > 6) return go(i + 1);
            cue.textContent = n % 2 ? 'Breathe out…' : 'Breathe in…';
            timer = setTimeout(tick, n % 2 ? 6000 : 4000);
          };
          timer = setTimeout(tick, 4000);
        }

        const save = el.querySelector('[data-save]');
        if (save) save.onclick = () => {
          const v = el.querySelector('#rtext').value.trim();
          if (step === 'intention') { if (!v) { T.ui.toast('Write one sentence, even a small one'); return; } rec.intention = v; }
          if (step === 'bloom') rec.bloomed = v;
          go(i + 1);
        };

        const rel = el.querySelector('[data-release]');
        if (rel) rel.onclick = () => {
          const ta = el.querySelector('#rtext');
          const v = ta.value.trim();
          if (!v) { T.ui.toast('Name one thing to let go of'); return; }
          rec.released = v;
          const stage = el.querySelector('#stage');
          stage.innerHTML = v.split('').map((ch, k) => `<span style="animation-delay:${(k * 0.035).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('');
          ta.style.visibility = 'hidden';
          stage.classList.add('go');
          rel.disabled = true;
          T.ui.buzz([10, 80, 10]);
          timer = setTimeout(() => go(i + 1), 2600 + v.length * 35);
        };

        const fin = el.querySelector('[data-finish]');
        if (fin) fin.onclick = async () => {
          if (step === 'grateful') rec.grateful = el.querySelector('#rtext').value.trim();
          rec.at = Date.now();
          G.ensure().moonRituals.push(rec);
          st.save();
          await G.reveal({ type: 'star', moon: rec.type, sign: rec.sign, text: isNew ? '“' + rec.intention + '”' : 'You released ' + rec.released + '. The moon carries it now.' });
          location.hash = '#/';
        };
      }
      draw();
    },
    leave() { clearTimeout(timer); }
  };
})(window.Tide);
