(function (T) {
  const { esc, header } = T.ui;
  const st = T.store;

  T.pages.gut = {
    nav: 'today',
    title: 'Your gut yes',
    render(el) {
      const s = st.s;

      function draw() {
        const d = st.day();
        const p = s.prompts;
        const cur = p.length ? p[s.pi % p.length] : null;
        el.innerHTML = `
        ${header('Your gut yes', { back: '#/', sub: 'Read each idea and notice your body. A yes feels like a lift. A no feels like a sink. You don’t have to think about it.' })}
        <div class="deck">
          <div class="deck-card deck-card--under" aria-hidden="true"></div>
          <div class="deck-card" id="card">
            <span class="muted small-t">${p.length ? ((s.pi % p.length) + 1) + ' of ' + p.length : 'No prompts yet'}</span>
            <p class="deck-prompt">${cur ? esc(cur) : 'Add a few prompts below to get started.'}</p>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-outline" id="no">Unh-unh</button>
          <button class="btn btn-primary" id="yes">Uh-huh</button>
        </div>
        ${d.focus ? `
        <div class="focus-card">
          <span class="muted">Today’s gut yes</span>
          <b>${esc(d.focus)}</b>
          <div class="btn-row tight">
            <a class="btn btn-soft" href="#/make?min=10">Start 10 minutes</a>
            <button class="btn btn-soft" id="didit">${d.done.gut ? 'Done ✓' : 'I did it'}</button>
          </div>
        </div>` : ''}
        <details class="drawer">
          <summary>Edit my prompts</summary>
          <p class="muted small-t">One per line. Keep each one small enough to start in two minutes.</p>
          <textarea id="edit" rows="10">${esc(p.join('\n'))}</textarea>
          <button class="btn btn-primary btn-block" id="save">Save prompts</button>
        </details>`;

        const card = el.querySelector('#card');
        const next = (dir) => {
          card.classList.add(dir === 'yes' ? 'fly-yes' : 'fly-no');
          setTimeout(draw, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
        };
        el.querySelector('#no').onclick = () => {
          if (!p.length) return;
          s.pi = (s.pi + 1) % p.length; st.save(); next('no');
        };
        el.querySelector('#yes').onclick = () => {
          if (!p.length) return;
          st.day().focus = cur; s.pi = (s.pi + 1) % p.length; st.save();
          T.ui.buzz(); next('yes');
        };
        const did = el.querySelector('#didit');
        if (did) did.onclick = () => { st.mark('make', true); T.ui.toast('Added to today’s tide'); draw(); };
        el.querySelector('#save').onclick = () => {
          s.prompts = el.querySelector('#edit').value.split('\n').map((x) => x.trim()).filter(Boolean);
          s.pi = 0; st.save(); T.ui.toast('Prompts saved'); draw();
        };

        // swipe
        let x0 = null;
        card.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
        card.addEventListener('touchend', (e) => {
          if (x0 == null) return;
          const dx = e.changedTouches[0].clientX - x0; x0 = null;
          if (dx > 70) el.querySelector('#yes').click();
          else if (dx < -70) el.querySelector('#no').click();
        });
      }
      draw();
    }
  };
})(window.Tide);
