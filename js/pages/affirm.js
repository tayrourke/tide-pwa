(function (T) {
  const { esc, header, I } = T.ui;
  const AF = window.TideAffirm;
  const st = T.store;
  let timer = null;

  function state() {
    const s = st.s;
    s.affirm = s.affirm || { custom: [], favorites: [], spoken: {} };
    s.affirm.custom = s.affirm.custom || []; s.affirm.favorites = s.affirm.favorites || []; s.affirm.spoken = s.affirm.spoken || {};
    return s.affirm;
  }

  T.pages.affirm = {
    nav: 'affirm',
    title: 'I am',
    render(el) {
      const af = state();
      let filter = 'all';
      let current = AF.forHour(new Date(), { custom: af.custom, favorites: af.favorites, block: AF.blockAt(new Date(), st.s.rhythm) });
      const history = [];

      function pool() {
        const list = AF.all(af.custom);
        if (filter === 'all') return list;
        if (filter === 'favorites') return list.filter((a) => af.favorites.includes(a.id));
        return list.filter((a) => a.theme === filter);
      }

      function next() {
        const p = pool().filter((a) => a.id !== current.id && !history.slice(-6).includes(a.id));
        const from = p.length ? p : pool();
        if (!from.length) return;
        history.push(current.id);
        current = from[Math.floor(Math.random() * from.length)];
        drawCard(true);
      }

      function spokenToday() { return af.spoken[st.today()] || 0; }

      function drawCard(animate) {
        const box = el.querySelector('#acard');
        const th = AF.THEMES[current.theme] || AF.THEMES.highest;
        const fav = af.favorites.includes(current.id);
        box.innerHTML = `
          <div class="a-top"><span class="a-theme">${esc(th.glyph)} ${esc(current.id === 'transit' ? 'From your sky today' : th.name)}</span>
          ${current.id !== 'transit' ? `<button class="icon-btn a-fav ${fav ? 'is-on' : ''}" id="fav" aria-pressed="${fav}" aria-label="${fav ? 'Remove from favorites' : 'Add to favorites'}">♡</button>` : ''}</div>
          <p class="a-text" id="atext">${esc(current.text)}</p>
          ${current.src ? `<p class="a-src">${esc(current.src)}</p>` : ''}`;
        box.classList.remove('is-speaking');
        if (animate) { box.classList.remove('a-in'); void box.offsetWidth; box.classList.add('a-in'); }
        const f = el.querySelector('#fav');
        if (f) f.onclick = () => {
          const i = af.favorites.indexOf(current.id);
          if (i >= 0) af.favorites.splice(i, 1); else af.favorites.push(current.id);
          st.save(); T.ui.buzz(8); drawCard(false);
        };
      }

      function drawCount() {
        const n = spokenToday();
        el.querySelector('#acount').innerHTML = n ? `<span class="a-stars" aria-hidden="true">${'✦'.repeat(Math.min(n, 9))}</span> ${n} spoken out loud today` : 'Say one out loud. Your voice makes it real.';
      }

      el.innerHTML = `
        ${header('I am', { sub: 'Words for stepping into your highest self, written for your chart.' })}
        <section class="inc-card">
          <span class="inc-label">✵ Today’s incantation</span>
          <ol class="inc-lines">${AF.incantation(new Date()).map((l) => `<li><p>${esc(l.text)}</p><span>${esc(l.src)}</span></li>`).join('')}</ol>
          <button class="btn btn-moon btn-block" id="incGo">Speak your incantation</button>
        </section>
        <h2 class="a-lib-h">Your affirmations</h2>
        <div class="chip-row a-filters" role="group" aria-label="Themes">
          <button class="chip is-sel" data-f="all">All</button>
          ${AF.ORDER.map((k) => `<button class="chip" data-f="${k}">${esc(AF.THEMES[k].glyph)} ${esc(AF.THEMES[k].name)}</button>`).join('')}
          <button class="chip" data-f="favorites">♡ Favorites</button>
        </div>

        <article class="a-card" id="acard" aria-live="polite"></article>
        <div class="btn-row">
          <button class="btn btn-outline" id="anext">Another</button>
          <button class="btn btn-primary" id="aspeak">Say it out loud</button>
        </div>
        <p class="center muted small-t a-count" id="acount"></p>

        <section class="block">
          <h2>My own words</h2>
          <p class="muted small-t" style="margin-bottom:10px">Write affirmations in your own voice. They join your hourly nudges too.</p>
          <form id="aform" class="stack">
            <textarea id="anew" rows="2" placeholder="I am…" aria-label="Your affirmation"></textarea>
            <div class="adder">
              <select id="atheme" aria-label="Theme">${AF.ORDER.map((k) => `<option value="${k}">${esc(AF.THEMES[k].name)}</option>`).join('')}</select>
              <button class="btn btn-primary" type="submit">Add</button>
            </div>
          </form>
          <ul class="a-list" id="alist"></ul>
        </section>

        <section class="block">
          <a class="row-link" href="#/settings"><span>Hourly affirmations on your phone</span>${I.chevron}</a>
        </section>`;

      function drawCustom() {
        el.querySelector('#alist').innerHTML = af.custom.length ? af.custom.slice().reverse().map((c) => `
          <li><div><span class="a-li-theme">${esc(AF.THEMES[c.theme].glyph)} ${esc(AF.THEMES[c.theme].name)}</span><p>${esc(c.text)}</p></div>
          <button class="icon-btn" data-del="${esc(c.id)}" aria-label="Delete">${I.x}</button></li>`).join('') : '';
        el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => {
          af.custom = af.custom.filter((c) => c.id !== b.dataset.del);
          af.favorites = af.favorites.filter((id) => id !== b.dataset.del);
          st.save(); drawCustom();
        }));
      }

      el.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => {
        filter = b.dataset.f;
        el.querySelectorAll('[data-f]').forEach((x) => x.classList.toggle('is-sel', x === b));
        if (!pool().length) { T.ui.toast(filter === 'favorites' ? 'Tap the heart on any affirmation to keep it here' : 'Nothing here yet'); return; }
        if (!pool().some((a) => a.id === current.id)) next(); else drawCard(true);
      }));

      el.querySelector('#anext').onclick = next;
      el.querySelector('#incGo').onclick = () => speakIncantation(AF.incantation(new Date()));

      function speakIncantation(lines) {
        const wrap = document.createElement('div');
        wrap.className = 'inc-speak';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-modal', 'true');
        document.body.appendChild(wrap);
        let i = 0;
        const show = () => {
          if (i >= lines.length) {
            wrap.innerHTML = `<div class="inc-stage"><p class="inc-cue">It is done.</p><p class="inc-line">And so it is.</p>
              <button class="btn btn-moon btn-block" data-close>Carry it with me</button></div>`;
            af.spoken[st.today()] = spokenToday() + lines.length;
            st.save(); drawCount(); T.ui.buzz([20, 60, 20]);
            wrap.querySelector('[data-close]').onclick = () => { wrap.classList.remove('open'); setTimeout(() => wrap.remove(), 450); };
            wrap.querySelector('[data-close]').focus();
            return;
          }
          const l = lines[i];
          wrap.innerHTML = `<div class="inc-stage">
            <p class="inc-cue">Breathe in. Then say it out loud.</p>
            <p class="inc-line" tabindex="-1">${esc(l.text)}</p>
            <p class="inc-src">${esc(l.src)}</p>
            <div class="inc-dots">${lines.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
            <button class="btn btn-moon btn-block" data-next>${i === lines.length - 1 ? 'Seal it' : 'I said it'}</button>
            <button class="btn btn-ghost-light btn-block" data-stop>Stop</button>
          </div>`;
          wrap.querySelector('.inc-line').focus();
          T.ui.buzz(8);
          wrap.querySelector('[data-next]').onclick = () => { i++; show(); };
          wrap.querySelector('[data-stop]').onclick = () => { wrap.classList.remove('open'); setTimeout(() => wrap.remove(), 450); };
        };
        show();
        requestAnimationFrame(() => wrap.classList.add('open'));
      }
      el.querySelector('#aspeak').onclick = () => {
        const box = el.querySelector('#acard'), btn = el.querySelector('#aspeak');
        box.classList.add('is-speaking');
        btn.disabled = true; btn.textContent = 'Slowly… let it land';
        T.ui.buzz(10);
        clearTimeout(timer);
        timer = setTimeout(() => {
          af.spoken[st.today()] = spokenToday() + 1;
          st.save();
          btn.disabled = false; btn.textContent = 'Say it out loud';
          drawCount();
          if (spokenToday() === 3) T.ui.toast('Three spoken today. You are becoming her.');
          next();
        }, 4200);
      };

      el.querySelector('#aform').onsubmit = (e) => {
        e.preventDefault();
        const v = el.querySelector('#anew').value.trim();
        if (!v) return;
        af.custom.push({ id: 'mine-' + st.uid(), text: v, theme: el.querySelector('#atheme').value });
        st.save();
        el.querySelector('#anew').value = '';
        T.ui.toast('Added to your affirmations');
        drawCustom();
      };

      drawCard(false); drawCount(); drawCustom();
    },
    leave() { clearTimeout(timer); }
  };
})(window.Tide);
