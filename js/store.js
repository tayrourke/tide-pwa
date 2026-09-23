/* Tide — storage. Everything lives in localStorage on this device. */
(function (T) {
  const KEY = 'tide-v1';
  let S = null;

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dayKey(new Date());
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function defaults() {
    return {
      v: 2,
      days: {},          // 'YYYY-MM-DD' -> { done:{}, makes:[], focus:'', wave:'', reflect:{}, awarded:{}, bottle }
      prompts: clone(T.DATA.PROMPTS),
      pi: 0,
      sos: [],           // { at, choice }
      treasures: [],     // { tid, at }
      pearls: 0,         // one per surfed wave
      surfs: 0,
      sits: 0,           // completed stillness sits
      coral: { stage: 0, done: 0 },
      affirm: { custom: [], favorites: [], spoken: {} },  // spoken: { 'YYYY-MM-DD': n }
      moonRituals: [],   // { type:'new'|'full', lunation, sign, at, intention?, bloomed?, released?, grateful? }
      rhythm: clone(T.DATA.RHYTHM),
      settings: { theme: 'auto', name: T.DATA.name, houseSystem: 'placidus', chime: true }
    };
  }

  function migrate(s) {
    // v1 stored a single "made" string per day
    Object.values(s.days || {}).forEach((d) => {
      d.done = d.done || {};
      d.makes = d.makes || [];
      if (d.made && d.made.trim() && !d.makes.length) d.makes.push({ text: d.made.trim(), at: Date.now() });
      delete d.made;
      d.reflect = d.reflect || {};
    });
    s.v = 2;
    return s;
  }

  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
    const d = defaults();
    if (!S || typeof S !== 'object') S = d;
    Object.keys(d).forEach((k) => { if (S[k] === undefined) S[k] = d[k]; });
    S.settings = Object.assign(d.settings, S.settings);
    migrate(S);
    return S;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
      if (T.push) T.push.mirror();
      return true;
    }
    catch (e) { T.ui && T.ui.toast('Couldn’t save. Export a backup from Settings.'); return false; }
  }

  function day(k) {
    k = k || today();
    if (!S.days[k]) S.days[k] = { done: {}, makes: [], focus: '', wave: '', reflect: {} };
    return S.days[k];
  }

  function peekDay(k) { return S.days[k] || null; }

  function doneCount(k) {
    const d = S.days[k];
    if (!d) return 0;
    return T.DATA.RITUALS.filter((r) => d.done[r.id]).length;
  }

  function mark(id, val) {
    const d = day();
    d.done[id] = val === undefined ? !d.done[id] : !!val;
    save();
    return d.done[id];
  }

  function addMake(text) {
    const d = day();
    d.makes.push({ text, at: Date.now() });
    d.done.make = true;
    save();
  }

  function streak() {
    let s = 0;
    const c = new Date();
    const has = (dt) => { const d = S.days[dayKey(dt)]; return d && d.done.make; };
    if (!has(c)) c.setDate(c.getDate() - 1);
    while (has(c)) { s++; c.setDate(c.getDate() - 1); }
    return s;
  }

  function lastNDays(n) {
    const out = [];
    const c = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const dt = new Date(c.getFullYear(), c.getMonth(), c.getDate() - i);
      out.push({ key: dayKey(dt), date: dt });
    }
    return out;
  }

  function exportJSON() { return JSON.stringify(S, null, 2); }

  function importJSON(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || !data.days) throw new Error('This file isn’t a Tide backup.');
    localStorage.setItem(KEY, JSON.stringify(data));
    load();
  }

  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} load(); }

  T.store = {
    load, save, day, peekDay, doneCount, mark, addMake, streak, lastNDays,
    exportJSON, importJSON, reset, today, dayKey, uid, clone,
    get s() { return S; }
  };
})(window.Tide);
