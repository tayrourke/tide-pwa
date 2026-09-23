/* Tide — UI helpers */
(function (T) {
  T.pages = T.pages || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const fmt = {
    long: (d) => d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    short: (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    dow: (d) => d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
    time: (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    fromKey: (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); },
    hm: (t) => { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return fmt.time(d); }
  };

  function greeting(name) {
    const h = new Date().getHours();
    const part = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return part + ', ' + name;
  }

  const I = {
    pool: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 14c2.5-1.6 5-1.6 7.5 0s5 1.6 7.5 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    surf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 16c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 12C6 6 12 4 16 6c-3 0-5 2-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    treasures: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20L4 11c.5-4 4-6 8-6s7.5 2 8 6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 20L8 7M12 20V5M12 20l4-13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    sky: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 3.5a8.5 8.5 0 1 0 5 12.6A7 7 0 0 1 15.5 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M18 4l.6 1.6L20 6l-1.4.5L18 8l-.6-1.5L16 6l1.4-.4z" fill="currentColor"/></svg>',
    affirm: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M18.5 16.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" fill="currentColor"/></svg>',
    make: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1M2 15c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  let clipN = 0;
  /** Tide pool: level 0..1 */
  function pool(level, opts) {
    opts = opts || {};
    const id = 'clip' + (++clipN);
    const y = 196 - 188 * Math.max(0, Math.min(1, level));
    return `<svg class="pool-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs><clipPath id="${id}"><circle cx="100" cy="100" r="92"/></clipPath></defs>
      <circle cx="100" cy="100" r="97" fill="none" stroke="var(--line)" stroke-width="2.5"/>
      <g clip-path="url(#${id})">
        <rect width="200" height="200" fill="var(--surface)"/>
        <g class="pool-fill" style="transform:translateY(${y}px)">
          <g class="pool-wave pool-wave--back"><path fill="var(--water)" opacity=".45" d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10 V260 H0Z"/></g>
          <g class="pool-wave"><path fill="var(--water)" d="M0 16 Q25 6 50 16 T100 16 T150 16 T200 16 T250 16 T300 16 T350 16 T400 16 V260 H0Z"/></g>
        </g>
      </g>
      ${opts.ring ? '' : ''}
    </svg>`;
  }

  function setPool(el, level) {
    const g = el.querySelector('.pool-fill');
    if (g) g.style.transform = 'translateY(' + (196 - 188 * Math.max(0, Math.min(1, level))) + 'px)';
  }

  function header(title, opts) {
    opts = opts || {};
    return `<header class="page-head ${opts.back ? 'has-back' : ''}">
      ${opts.back ? `<a class="back" href="${opts.back}" aria-label="Back">${I.back}</a>` : ''}
      <div>
        ${title ? `<h1 class="page-title" tabindex="-1">${esc(title)}</h1>` : ''}
        ${opts.sub ? `<p class="page-sub">${esc(opts.sub)}</p>` : ''}
      </div>
    </header>`;
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function buzz(p) { try { navigator.vibrate && navigator.vibrate(p || 12); } catch (e) {} }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => toast('Copied'), () => fallback());
    }
    fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied'); } catch (e) { toast('Select the text to copy it'); }
      ta.remove();
    }
  }

  function ritualRow(r, done) {
    return `<li class="ritual-row ${done ? 'is-done' : ''}">
      <button class="ritual-tick" data-tick="${r.id}" aria-pressed="${!!done}" aria-label="${esc(r.title)}"><span class="tick">${I.check}</span></button>
      <div class="ritual-text">
        <b>${esc(r.title)}</b>
        <span>${esc(r.sub)}</span>
      </div>
      ${r.link ? `<a class="ritual-go" href="${r.link}" aria-label="Open ${esc(r.title)}">${I.chevron}</a>` : ''}
    </li>`;
  }

  T.ui = { $, $$, esc, fmt, greeting, I, pool, setPool, header, toast, buzz, copy, ritualRow };
})(window.Tide);
