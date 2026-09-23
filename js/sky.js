/* Tide — the sky and the whispers.
   Shared by the app (window) and the service worker (self), so nudges can read the moon too.
   Houses are whole-sign from Libra rising. */
(function (root) {
  const SEASONS = [
    { id: 'imbolc', name: 'Imbolc', m: 2, d: 1, gloss: 'the first stirring of spring' },
    { id: 'ostara', name: 'Ostara', m: 3, d: 20, gloss: 'the spring equinox' },
    { id: 'beltane', name: 'Beltane', m: 5, d: 1, gloss: 'the fire festival of bloom' },
    { id: 'litha', name: 'Litha', m: 6, d: 21, gloss: 'the summer solstice' },
    { id: 'lammas', name: 'Lammas', m: 8, d: 1, gloss: 'the first harvest' },
    { id: 'mabon', name: 'Mabon', m: 9, d: 22, gloss: 'the autumn equinox' },
    { id: 'samhain', name: 'Samhain', m: 10, d: 31, gloss: 'when the veil is thin' },
    { id: 'yule', name: 'Yule', m: 12, d: 21, gloss: 'the winter solstice' }
  ];

  function season(date) {
    date = date || new Date();
    const md = (date.getMonth() + 1) * 100 + date.getDate();
    let cur = SEASONS[SEASONS.length - 1];
    SEASONS.forEach((s) => { if (md >= s.m * 100 + s.d) cur = s; });
    return cur;
  }
  function sabbatToday(date) {
    date = date || new Date();
    return SEASONS.find((s) => s.m === date.getMonth() + 1 && s.d === date.getDate()) || null;
  }

  /* ---------- Moon: phase and sign (accurate to well under a degree) ---------- */
  const rad = (x) => x * Math.PI / 180;
  function moonLongitude(date) {
    const d = (date.getTime() / 864e5 + 2440587.5) - 2451545.0;
    const L = 218.316 + 13.176396 * d, M = 134.963 + 13.064993 * d, D = 297.850 + 12.190749 * d;
    const Ms = 357.529 + 0.98560028 * d, F = 93.272 + 13.229350 * d;
    const lon = L + 6.289 * Math.sin(rad(M)) - 1.274 * Math.sin(rad(M - 2 * D)) + 0.658 * Math.sin(rad(2 * D))
      - 0.186 * Math.sin(rad(Ms)) - 0.059 * Math.sin(rad(2 * M - 2 * D)) - 0.057 * Math.sin(rad(M - 2 * D + Ms))
      + 0.053 * Math.sin(rad(M + 2 * D)) + 0.046 * Math.sin(rad(2 * D - Ms)) + 0.041 * Math.sin(rad(M - Ms))
      - 0.035 * Math.sin(rad(D)) - 0.031 * Math.sin(rad(M + Ms)) - 0.015 * Math.sin(rad(2 * F - 2 * D)) + 0.011 * Math.sin(rad(M - 4 * D));
    return ((lon % 360) + 360) % 360;
  }

  const SYNODIC = 29.530588853, NEW_REF = Date.UTC(2000, 0, 6, 18, 14);
  function moonPhase(date) {
    const age = ((((date.getTime() - NEW_REF) / 864e5) % SYNODIC) + SYNODIC) % SYNODIC;
    const f = age / SYNODIC;
    const i = Math.round(f * 8) % 8;
    return { f, i, name: PHASES[i].name };
  }

  const PHASES = [
    { name: 'New moon', line: 'Plant a quiet intention for this cycle. Whisper it, write it, let it be small.' },
    { name: 'Waxing crescent', line: 'Small steps, gathered daily. This is when tiny makes add up.' },
    { name: 'First quarter', line: 'A little resistance is normal now. Push through it gently.' },
    { name: 'Waxing gibbous', line: 'Refine what you started. Keep going, it’s almost ripe.' },
    { name: 'Full moon', line: 'Let it be seen. Share something you made.' },
    { name: 'Waning gibbous', line: 'Teach what you learned. Your Life Path 33 wants to pour out.' },
    { name: 'Last quarter', line: 'Release what feels heavy. Mute it, clear it, let it go.' },
    { name: 'Waning crescent', line: 'Rest before the new moon. Less doing, more dreaming.' }
  ];

  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const GLYPHS = ['♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎', '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎'];

  // What each house of your chart is about, and what the moon passing through it asks of you
  const HOUSES = {
    1: { name: 'self and body', line: 'Tend your body and your beauty first today.' },
    2: { name: 'worth, money and values', line: 'Make something that reminds you what you’re worth. Abundance loves attention.' },
    3: { name: 'words and voice', line: 'Write, speak, caption. Your words flow easily today.' },
    4: { name: 'home and roots', line: 'Stay close to home. Cook something, nest, tend your roots.' },
    5: { name: 'creativity, joy and children', line: 'Make something just for joy, with the girls if you can.' },
    6: { name: 'daily ritual and wellbeing', line: 'Small rituals carry you today. One tidy, finished thing.' },
    7: { name: 'partnership', line: 'A good day for one real, face-to-face conversation.' },
    8: { name: 'depth and transformation', line: 'Go deep. Let something end so something truer can begin.' },
    9: { name: 'learning, teaching and faith', line: 'Share what you know. The teacher in you is easy to reach today.' },
    10: { name: 'public work and calling', line: 'Your work glows today. A beautiful day to create for your community.' },
    11: { name: 'community and friendship', line: 'Reach out to your people. Your network is where your light spreads.' },
    12: { name: 'rest, dreams and spirit', line: 'Retreat, dream, and make something small and quiet.' }
  };
  // Signs that hold something personal in your chart
  const SIGN_NOTE = {
    Pisces: 'The moon is swimming past your Sun, Mercury and Venus. Deep, beautiful making days.',
    Libra: 'The moon crosses your rising sign. You feel everything in your body today.',
    Cancer: 'The moon rises to your Midheaven. Your work wants to be seen.',
    Virgo: 'The moon touches your North Node and your Mars. Craft and finishing feel good.',
    Gemini: 'The moon comes home to your birth moon. An emotional reset day.'
  };
  const houseOfLon = (lon) => (root.TideAstro ? root.TideAstro.houseOf(lon) : ((Math.floor(lon / 30) - 6 + 12) % 12) + 1);
  const houseName = (lon) => HOUSES[houseOfLon(lon)].name;
  const MOON_IN = {}; // kept for older callers

  function sky(date) {
    date = date || new Date();
    const lon = moonLongitude(date);
    const si = Math.floor(lon / 30);
    const sign = SIGNS[si];
    const ph = moonPhase(date);
    const h = houseOfLon(lon);
    return {
      sign, glyph: GLYPHS[si], house: h, houseName: HOUSES[h].name,
      signLine: SIGN_NOTE[sign] || HOUSES[h].line, houseLine: HOUSES[h].line, phase: ph.name, phaseLine: PHASES[ph.i].line, f: ph.f,
      season: season(date), sabbat: sabbatToday(date)
    };
  }

  /* ---------- Whispers: the words a nudge uses, chosen from how your day is going ---------- */
  const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

  function whisper(slot, state, date) {
    date = date || new Date();
    const today = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    const st = state && state.date === today ? state : { done: {}, n: 0, bottle: false };
    const name = (state && state.name) || 'love';
    const s = sky(date);
    const seed = date.getDate() + date.getMonth() * 31;
    const made = !!st.done.make;

    if (state && state.houseSystem && root.TideAstro) root.TideAstro.setHouseSystem(state.houseSystem);

    if (slot === 'affirm' && root.TideAffirm) {
      const block = root.TideAffirm.blockAt(date, state && state.rhythm);
      const a = root.TideAffirm.forHour(date, { block, custom: state && state.custom, favorites: state && state.favorites });
      const th = root.TideAffirm.THEMES[a.theme];
      return { title: a.id === 'transit' ? '✦ From your sky today' : a.id === 'incantation' ? '✵ Today’s incantation' : `${th.glyph} ${th.name}`, body: a.text, url: './#/affirm', tag: 'tide-hourly' };
    }
    if (slot === 'focus' && root.TideAffirm) {
      const block = root.TideAffirm.blockAt(date, state && state.rhythm);
      return { title: 'Here for higher work', body: root.TideAffirm.focusLine(date, block), url: './#/', tag: 'tide-hourly' };
    }

    const lun = root.TideAstro ? openRitual(date) : null;
    const lunToday = lun && lun.date.toDateString() === date.toDateString();
    if (slot === 'evening' && lunToday) {
      return lun.type === 'new'
        ? { title: `New moon in ${lun.sign} tonight`, body: `Your ritual is open. Light a candle and plant an intention for ${LUNAR[lun.sign].seed}.`, url: './#/ritual' }
        : { title: `Full moon in ${lun.sign} tonight`, body: `Your ritual is open. See what bloomed, and release ${LUNAR[lun.sign].release}.`, url: './#/ritual' };
    }

    if (slot === 'morning') {
      if (lunToday && !made) return { title: `${lun.type === 'new' ? 'New' : 'Full'} moon in ${lun.sign} today`, body: 'Make one small thing this morning. Tonight, your moon ritual is waiting.', url: './#/make' };
      if (s.sabbat) return { title: s.sabbat.name + ' begins today', body: `It’s ${s.sabbat.gloss}. Your ritual with the girls is ready, and new treasures are washing in.`, url: './#/sabbat' };
      if (made && !st.bottle) return { title: 'A bottle drifted in', body: 'You made before you took. Your message is floating in the pool.', url: './#/' };
      if (made) return { title: 'You already made something', body: 'The rest of the morning is yours. Go live it.', url: './#/' };
      if (s.sign === 'Pisces') return { title: 'The moon is swimming through Pisces', body: 'Your Sun, Mercury and Venus are all lit up. Make one small thing before you open any feed.', url: './#/make' };
      return pick([
        { title: `Good morning, ${name}`, body: 'The tide is out. Make one small thing before you open anything else. A treasure is waiting.', url: './#/make' },
        { title: 'Your fish are in the shallows', body: 'One small make brings the tide in, and something washes up for you.', url: './#/make' },
        { title: 'Make before you take', body: 'A caption, a clean counter, a paragraph. Small and finished. The sea is holding a treasure for you.', url: './#/make' },
        { title: `Moon in ${s.sign}`, body: s.signLine + ' Start with one small make.', url: './#/make' }
      ], seed);
    }

    if (slot === 'afternoon') {
      if (st.n >= 6) return { title: 'High tide today', body: 'All six. The sea is full. Go be in your real life.', url: './#/' };
      if (!made) return { title: 'It’s your creation window', body: 'Ten minutes of making grows a branch of coral and brings the tide in. Want to ride it?', url: './#/make' };
      return pick([
        { title: `The tide is rising · ${st.n} of 6`, body: 'One more ritual lifts your fish higher. Which one is calling you?', url: './#/' },
        { title: 'Your coral wants to grow', body: 'A ten-minute make adds a branch. Small and finished beats big and brilliant.', url: './#/make' },
        { title: s.phase, body: s.phaseLine, url: './#/' },
        ...topTransits(date, 1).map((t) => ({ title: t.title, body: t.advice, url: './#/sky' }))
      ], seed);
    }

    if (slot === 'evening') {
      if (!st.done.unplug) return pick([
        { title: 'Hermit hour', body: 'Phone on the charger, you in the quiet. Your soul refills in the stillness.', url: './#/' },
        { title: 'The moon is up', body: `${s.phase} in ${s.sign}. Put the phone down and let the evening be slow.`, url: './#/' },
        { title: 'Before the scroll', body: 'If you feel the pull tonight, breathe with the wave instead. Nine breaths, and a pearl.', url: './#/surf' }
      ], seed);
      return { title: 'A full day, gently held', body: `${st.n} of 6 today. Rest well, ${name}. The tide comes back tomorrow.`, url: './#/reflect' };
    }

    return { title: 'Tide', body: 'The sea is thinking of you.', url: './' };
  }

  /* ---------- Transits, read through Taylor's chart ---------- */
  const PLANET = {
    sun: { name: 'Sun', glyph: '☉︎', gives: 'a spotlight and fresh life', easy: 'Let yourself be seen a little today.', hard: 'Notice where you’re pushing. Soften, and let your light be quiet today.' },
    moon: { name: 'Moon', glyph: '☽︎' },
    mercury: { name: 'Mercury', glyph: '☿︎', gives: 'thoughts, messages and conversations', easy: 'Write, caption, reach out. Words come easily today.', hard: 'Slow down before you send or post. Read it once more.' },
    venus: { name: 'Venus', glyph: '♀︎', gives: 'beauty, love and ease', easy: 'Make something beautiful, and let yourself enjoy it.', hard: 'Watch for comparison. Beauty you make beats beauty you scroll.' },
    mars: { name: 'Mars', glyph: '♂︎', gives: 'heat, drive and courage', easy: 'Start the thing. Your energy is behind you.', hard: 'Move your body before you react. It’s just energy looking for a door.' },
    jupiter: { name: 'Jupiter', glyph: '♃︎', gives: 'growth, luck and generosity', easy: 'Say yes to the opening. Think a little bigger.', hard: 'Don’t overcommit. More isn’t always better.' },
    saturn: { name: 'Saturn', glyph: '♄︎', gives: 'structure, patience and a lesson', easy: 'Build the routine. Small daily bricks add up.', hard: 'It may feel heavy. Do one small finished thing and let that be enough.' },
    uranus: { name: 'Uranus', glyph: '♅︎', gives: 'surprise, change and awakening', easy: 'Try something new. Break a pattern on purpose.', hard: 'Expect the unexpected. Stay flexible and breathe.' },
    neptune: { name: 'Neptune', glyph: '♆︎', gives: 'dreams, intuition and softness', easy: 'Trust your intuition. Make art from your dreams.', hard: 'Guard your boundaries. The scroll will feel extra foggy right now.' },
    pluto: { name: 'Pluto', glyph: '♇︎', gives: 'deep transformation', easy: 'Let the old version of you evolve.', hard: 'Something is ending so something truer can begin.' }
  };
  const NATAL_WORDS = {
    sun: { short: 'Sun', long: 'your Pisces Sun, the core of who you are' },
    moon: { short: 'Moon', long: 'your Gemini Moon, your feelings and what soothes you' },
    mercury: { short: 'Mercury', long: 'your Pisces Mercury, how you think and speak' },
    venus: { short: 'Venus', long: 'your Pisces Venus, your chart ruler and creative gift' },
    mars: { short: 'Mars', long: 'your Virgo Mars, your drive and how you work' },
    jupiter: { short: 'Jupiter', long: 'your Aquarius Jupiter, your luck and big vision' },
    saturn: { short: 'Saturn', long: 'your Aries Saturn, your discipline and life lessons' },
    uranus: { short: 'Uranus', long: 'your Aquarius Uranus, your inner rebel' },
    neptune: { short: 'Neptune', long: 'your Capricorn Neptune, your dreams' },
    pluto: { short: 'Pluto', long: 'your Sagittarius Pluto, your deepest power' },
    asc: { short: 'Ascendant', long: 'your Libra rising, your body and how you meet the world' },
    mc: { short: 'Midheaven', long: 'your Cancer Midheaven, your public work and calling' },
    node: { short: 'North Node', long: 'your Virgo North Node, your soul’s growth path' }
  };
  const VERB = { conj: 'meets', sext: 'opens a door to', sq: 'stirs up', tri: 'flows easily into', opp: 'asks for balance with' };
  const TONE = { conj: 'Merging', sext: 'Opening', sq: 'Growing edge', tri: 'Flowing', opp: 'Balancing' };
  const SOFT = ['sun', 'mercury', 'venus', 'jupiter'];

  function readTransit(tr) {
    const P = PLANET[tr.transit], N = NATAL_WORDS[tr.natal];
    const easy = tr.aspect.tone === 'easy' || (tr.aspect.id === 'conj' && SOFT.includes(tr.transit));
    const slow = ['saturn', 'uranus', 'neptune', 'pluto'].includes(tr.transit);
    const when = tr.orb < (slow ? 0.25 : 0.4) ? 'Exact now' : slow ? (tr.applying ? 'A longer chapter, still building' : 'A longer chapter, slowly easing') : (tr.applying ? 'Building' : 'Easing');
    return {
      key: tr.transit + '-' + tr.aspect.id + '-' + tr.natal,
      title: `${P.name} ${tr.aspect.name} your ${N.short}`,
      glyphs: `${P.glyph} → ${tr.natal === 'asc' ? 'AC' : tr.natal === 'mc' ? 'MC' : tr.natal === 'node' ? '☊︎' : PLANET[tr.natal].glyph}`,
      line: `${tr.transit === 'sun' ? 'The Sun' : P.name} ${VERB[tr.aspect.id]} ${N.long}, bringing ${P.gives}.`,
      advice: easy ? P.easy : P.hard,
      tone: TONE[tr.aspect.id], easy, when, transit: tr.transit, natal: tr.natal
    };
  }

  function topTransits(date, n) {
    if (!root.TideAstro) return [];
    const seen = new Set();
    return root.TideAstro.transits(date).filter((t) => { const k = t.transit + t.natal; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, n || 3).map(readTransit);
  }

  function retrogrades(date) {
    if (!root.TideAstro) return [];
    const p = root.TideAstro.positions(date || new Date());
    return ['mercury', 'venus', 'mars'].filter((b) => p[b].retro).map((b) => ({
      mercury: 'Mercury is retrograde. Revisit, reread, finish old drafts instead of starting new ones.',
      venus: 'Venus is retrograde. Revisit what you find beautiful and who you give your heart to.',
      mars: 'Mars is retrograde. Slow your push. Tend what you already started.'
    })[b]);
  }

  /* ---------- Moon rituals ---------- */
  const LUNAR = {
    Aries: { seed: 'courage and fresh starts', release: 'impatience, and doing it all alone', vow: 'I begin before I feel ready.' },
    Taurus: { seed: 'pleasure, steadiness and your body', release: 'comfort that has turned into stuckness', vow: 'I slow down and savor what I make.' },
    Gemini: { seed: 'curiosity, learning and your voice', release: 'scattered attention and overthinking', vow: 'I follow one curiosity all the way through.' },
    Cancer: { seed: 'home, nourishment and mothering yourself', release: 'caring for everyone else first', vow: 'I nourish myself first, then pour out.' },
    Leo: { seed: 'joy, creativity and being seen', release: 'needing applause to feel worthy', vow: 'I create for the joy of it.' },
    Virgo: { seed: 'craft, health and daily ritual', release: 'perfectionism and self-criticism', vow: 'Small and finished is enough.' },
    Libra: { seed: 'balance, beauty and partnership', release: 'people-pleasing', vow: 'I choose balance over busy.' },
    Scorpio: { seed: 'depth, intimacy and your power', release: 'control and old resentment', vow: 'I let myself be fully seen.' },
    Sagittarius: { seed: 'adventure, faith and big vision', release: 'restlessness and escaping', vow: 'I trust where I’m going.' },
    Capricorn: { seed: 'goals, structure and legacy', release: 'pressure and all-work-no-rest', vow: 'I build slowly, and I rest.' },
    Aquarius: { seed: 'community, originality and the future', release: 'hiding the parts that feel different', vow: 'I share my strange, true ideas.' },
    Pisces: { seed: 'dreams, intuition and surrender', release: 'escaping, blurry boundaries and the endless scroll', vow: 'I make before I take.' }
  };

  /** The moon ritual that's open right now, if any (from a day before until three days after) */
  function openRitual(date) {
    if (!root.TideAstro) return null;
    date = date || new Date();
    const A = root.TideAstro;
    const cands = ['new', 'full'].map((t) => A.lunation(t, new Date(date.getTime() - 3 * 864e5), 1)).filter(Boolean);
    const within = cands.filter((l) => date - l.date > -864e5 && date - l.date < 3 * 864e5);
    return within.sort((a, b) => Math.abs(date - a.date) - Math.abs(date - b.date))[0] || null;
  }

  function nextLunations(date) {
    if (!root.TideAstro) return [];
    return ['new', 'full'].map((t) => root.TideAstro.lunation(t, date || new Date(), 1)).sort((a, b) => a.date - b.date);
  }

  const houseInfo = (lon) => ({ house: houseName(lon), n: houseOfLon(lon) });

  root.TideSky = { HOUSES, houseName, sky, season, sabbatToday, moonLongitude, moonPhase, whisper, SIGNS, PHASES, PLANET, NATAL_WORDS, readTransit, topTransits, retrogrades, LUNAR, openRitual, nextLunations, houseInfo };
})(typeof self !== 'undefined' ? self : window);
