/* Tide — the Wheel of the Year treasure collections.
   Each sabbat season washes up its own eight treasures. Rare ones only come on high-tide days. */
(function (T) {
  const S = (shape, name, rarity, meaning) => ({ shape, name, rarity, meaning });

  T.SEASONS = [
    { id: 'imbolc', name: 'Imbolc', start: [2, 1], blurb: 'First stirrings. Pisces season lives here, and so does your birthday.',
      pal: { m: '#7FA7A0', a: '#E8B4A4', l: '#F4F1EC' },
      items: [
        S('shell', 'Brigid’s scallop', 'c', 'The first stirring. Something wants to begin.'),
        S('glass', 'Milk sea glass', 'c', 'Nourish yourself first, then pour out.'),
        S('spiral', 'Pisces snail', 'u', 'Three fish, one ocean. It’s your season.'),
        S('star', 'Hearth star', 'c', 'Tend the fire at home. Your Cancer Midheaven.'),
        S('dollar', 'Candlemas sand dollar', 'u', 'Clear the space. Let the light in.'),
        S('kelp', 'Snowdrop kelp', 'c', 'Small and early is still brave.'),
        S('urchin', 'Frost urchin', 'u', 'Protect the tender new thing.'),
        S('pearl', 'Solar return pearl', 'r', 'Another year of you. The ocean is glad.')
      ] },
    { id: 'ostara', name: 'Ostara', start: [3, 20], blurb: 'Seeds and balance. What you plant now, you harvest later.',
      pal: { m: '#9BB57A', a: '#F0C9D4', l: '#F6F2DC' },
      items: [
        S('shell', 'Seedling scallop', 'c', 'Plant one thing today. Water it tomorrow.'),
        S('glass', 'Sprout sea glass', 'c', 'Growth is quiet before it’s visible.'),
        S('spiral', 'Egg snail', 'u', 'Everything you need is already inside.'),
        S('star', 'Blossom star', 'c', 'Share something beautiful. Venus rules your chart.'),
        S('dollar', 'Garden sand dollar', 'u', 'Your hands in the dirt count as making.'),
        S('kelp', 'Spring kelp', 'c', 'Stretch toward the light.'),
        S('urchin', 'Bud urchin', 'u', 'Opening slowly is still opening.'),
        S('pearl', 'Equinox pearl', 'r', 'Balance restored. Day and night, even again.')
      ] },
    { id: 'beltane', name: 'Beltane', start: [5, 1], blurb: 'Bloom and fire. Joy is a practice too.',
      pal: { m: '#D46A6A', a: '#F2B544', l: '#F7E1D9' },
      items: [
        S('shell', 'Rose scallop', 'c', 'Beauty is how you create, not a distraction from it.'),
        S('glass', 'Ember sea glass', 'c', 'Your fire is meant to be shared.'),
        S('spiral', 'Maypole snail', 'u', 'Weave what you love into your days.'),
        S('star', 'Wildflower star', 'c', 'Say yes to what makes your body light up.'),
        S('dollar', 'Bonfire sand dollar', 'u', 'Burn what you’re done carrying.'),
        S('kelp', 'Blossom kelp', 'c', 'Delight counts as productive.'),
        S('urchin', 'Hawthorn urchin', 'u', 'Protect the bloom.'),
        S('pearl', 'Venus pearl', 'r', 'Exalted Venus. Your beauty is a gift to the world.')
      ] },
    { id: 'litha', name: 'Litha', start: [6, 21], blurb: 'The sun at its peak. Shine without performing.',
      pal: { m: '#2E9CA0', a: '#F2C14E', l: '#FBEFC9' },
      items: [
        S('shell', 'Sun scallop', 'c', 'Shine without performing.'),
        S('glass', 'Turquoise sea glass', 'c', 'Salt water heals almost everything.'),
        S('spiral', 'Midsummer snail', 'u', 'Peak energy. Spend it on what you love.'),
        S('star', 'Solstice star', 'c', 'The longest day. Make something with it.'),
        S('dollar', 'Golden sand dollar', 'u', 'Abundance is already here.'),
        S('kelp', 'Sunlit kelp', 'c', 'Float for a while. Pisces knows how.'),
        S('urchin', 'Coral urchin', 'u', 'Warm and wild and yours.'),
        S('pearl', 'Sun pearl', 'r', 'Full light. Gene Key 36 siddhi: compassion.')
      ] },
    { id: 'lammas', name: 'Lammas', start: [8, 1], blurb: 'The first harvest. Bread, and proof of what you made.',
      pal: { m: '#C9A24A', a: '#8C5A3C', l: '#F3E6C4' },
      items: [
        S('shell', 'Wheat scallop', 'c', 'First fruits of what you planted.'),
        S('glass', 'Honey sea glass', 'c', 'Sweetness you made yourself.'),
        S('spiral', 'Loaf snail', 'u', 'Bread takes time. So does anything worth making.'),
        S('star', 'Grain star', 'c', 'Share what you harvest. Life Path 33.'),
        S('dollar', 'Hearth-bread sand dollar', 'u', 'Nourishment is love made tangible.'),
        S('kelp', 'Barley kelp', 'c', 'Cut what’s ready. Leave what isn’t.'),
        S('urchin', 'Bramble urchin', 'u', 'Sweet fruit grows behind thorns.'),
        S('pearl', 'First-harvest pearl', 'r', 'Your first harvest. Proof you’re a creator.')
      ] },
    { id: 'mabon', name: 'Mabon', start: [9, 22], blurb: 'Equal light and dark. Libra season, your rising sign, begins.',
      pal: { m: '#C2703D', a: '#E3A857', l: '#F3D9B1' },
      items: [
        S('shell', 'Harvest scallop', 'c', 'Gratitude for what you’ve already made.'),
        S('glass', 'Amber sea glass', 'c', 'Rough edges, softened by time. So are you.'),
        S('spiral', 'Equinox snail', 'u', 'Equal light, equal dark. Libra rising knows balance.'),
        S('star', 'Apple star', 'c', 'Five points: make, rest, tend, connect, curate.'),
        S('dollar', 'Sand dollar of plenty', 'u', 'Enough is a feeling, not a number.'),
        S('kelp', 'Rust kelp', 'c', 'Rooted, but moving with the current.'),
        S('urchin', 'Chestnut urchin', 'u', 'Soft inside. Boundaries on the outside.'),
        S('pearl', 'Harvest-moon pearl', 'r', 'What you tended all year, gathered.')
      ] },
    { id: 'samhain', name: 'Samhain', start: [10, 31], blurb: 'The veil is thin. Go inward. Your hermit line loves this season.',
      pal: { m: '#5B3F6B', a: '#D89A4B', l: '#CBB8D6' },
      items: [
        S('shell', 'Veil scallop', 'c', 'The veil is thin, like the line between you and the ocean.'),
        S('glass', 'Smoke sea glass', 'c', 'Let the old version of you go gently.'),
        S('spiral', 'Ancestor snail', 'u', 'You carry more wisdom than you know.'),
        S('star', 'Candle star', 'c', 'One small light is enough to see by.'),
        S('dollar', 'Moonlit sand dollar', 'u', 'Rest is sacred in the dark half of the year.'),
        S('kelp', 'Midnight kelp', 'c', 'Go inward. Let the hermit have her time.'),
        S('urchin', 'Obsidian urchin', 'u', 'Protect your energy. Mute what drains it.'),
        S('pearl', 'Black pearl', 'r', 'Beauty made from what irritated you. Gene Key 12.')
      ] },
    { id: 'yule', name: 'Yule', start: [12, 21], blurb: 'The longest night turns back toward light.',
      pal: { m: '#2F5D50', a: '#D8B461', l: '#E6ECEA' },
      items: [
        S('shell', 'Evergreen scallop', 'c', 'Some things stay green in every season.'),
        S('glass', 'Frost sea glass', 'c', 'Quiet is not empty.'),
        S('spiral', 'Solstice snail', 'u', 'The longest night turns back toward light.'),
        S('star', 'North star', 'c', 'Your Virgo North Node: small, finished, useful.'),
        S('dollar', 'Snow sand dollar', 'u', 'Slow down. Nothing blooms in a hurry.'),
        S('kelp', 'Holly kelp', 'c', 'Gather your people close. Your 4th line glows here.'),
        S('urchin', 'Silver urchin', 'u', 'Warmth on the inside, always.'),
        S('pearl', 'Light pearl', 'r', 'Gene Key 11 siddhi. You carry light into dark places.')
      ] }
  ];

  T.SEASONS.forEach((s) => s.items.forEach((it, i) => { it.id = s.id + '-' + i; it.season = s.id; }));
  T.TREASURE = {};
  T.SEASONS.forEach((s) => s.items.forEach((it) => (T.TREASURE[it.id] = it)));

  T.RARITY = { c: 'Common', u: 'Uncommon', r: 'Rare' };

  /* ---------- Art. Each returns an SVG string in a 60×60 box. ---------- */
  let gid = 0;
  const ART = {
    shell: (p) => `
      <path d="M30 50 L8 26 Q10 10 30 8 Q50 10 52 26 Z" fill="${p.m}"/>
      <path d="M30 50 L8 26 Q10 10 30 8 Q50 10 52 26 Z" fill="none" stroke="${p.a}" stroke-width="1.5" stroke-linejoin="round"/>
      ${[[12, 25], [16, 17], [22, 12], [30, 10], [38, 12], [44, 17], [48, 25]].map(([x, y]) => `<path d="M30 49 L${x} ${y}" stroke="${p.l}" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>`).join('')}
      <path d="M24 50 h12 l-2 5 h-8 z" fill="${p.a}"/>`,
    glass: (p) => `
      <path d="M14 22 Q20 10 36 12 Q52 16 50 32 Q48 48 30 48 Q12 48 11 34 Q10 28 14 22 Z" fill="${p.m}" opacity=".85"/>
      <path d="M20 22 Q26 16 34 17" stroke="${p.l}" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".8"/>
      <circle cx="40" cy="36" r="2.5" fill="${p.l}" opacity=".5"/>`,
    spiral: (p) => `
      <circle cx="30" cy="31" r="21" fill="${p.m}"/>
      <path d="M30 31 m0 -3 a3 3 0 1 1 -3 3 a6 6 0 1 1 6 6 a10 10 0 1 1 -10 -10 a14 14 0 1 1 14 14 a17 17 0 0 1 -17 -17" fill="none" stroke="${p.l}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="30" cy="31" r="21" fill="none" stroke="${p.a}" stroke-width="1.5"/>`,
    star: (p) => `
      <path d="M30 6 Q33 20 34 23 Q37 24 53 24 Q41 32 38 35 Q40 40 44 54 Q33 45 30 43 Q27 45 16 54 Q20 40 22 35 Q19 32 7 24 Q23 24 26 23 Q27 20 30 6 Z" fill="${p.m}" stroke="${p.a}" stroke-width="1.5" stroke-linejoin="round"/>
      ${[[30, 16], [30, 24], [42, 26], [36, 38], [24, 38], [18, 26], [30, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${p.l}"/>`).join('')}`,
    dollar: (p) => `
      <circle cx="30" cy="30" r="22" fill="${p.l}" stroke="${p.m}" stroke-width="2"/>
      ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="30" cy="19" rx="3" ry="8" fill="${p.m}" opacity=".85" transform="rotate(${a} 30 30)"/>`).join('')}
      <circle cx="30" cy="30" r="3" fill="${p.a}"/>`,
    kelp: (p) => `
      <path d="M22 54 C14 42 30 36 22 24 C16 15 24 9 26 5" fill="none" stroke="${p.m}" stroke-width="5" stroke-linecap="round"/>
      <path d="M34 54 C42 44 28 36 36 26 C42 18 36 12 38 8" fill="none" stroke="${p.a}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="18" cy="32" rx="5" ry="2.5" fill="${p.m}" transform="rotate(-30 18 32)"/>
      <ellipse cx="41" cy="22" rx="5" ry="2.5" fill="${p.a}" transform="rotate(30 41 22)"/>`,
    urchin: (p) => `
      ${Array.from({ length: 18 }, (_, i) => { const a = i * 20 * Math.PI / 180; return `<line x1="${30 + Math.cos(a) * 12}" y1="${32 + Math.sin(a) * 12}" x2="${30 + Math.cos(a) * 25}" y2="${32 + Math.sin(a) * 25}" stroke="${p.a}" stroke-width="1.8" stroke-linecap="round"/>`; }).join('')}
      <circle cx="30" cy="32" r="14" fill="${p.m}"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180; return `<circle cx="${30 + Math.cos(a) * 8}" cy="${32 + Math.sin(a) * 8}" r="1.4" fill="${p.l}"/>`; }).join('')}`,
    pearl: (p) => {
      const id = 'pg' + (++gid);
      return `<defs><radialGradient id="${id}" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="${p.l}"/><stop offset="1" stop-color="${p.m}"/></radialGradient></defs>
      <ellipse cx="30" cy="50" rx="16" ry="4" fill="${p.a}" opacity=".35"/>
      <circle cx="30" cy="30" r="18" fill="url(#${id})"/>
      <ellipse cx="24" cy="22" rx="5" ry="3" fill="#fff" opacity=".7" transform="rotate(-25 24 22)"/>`;
    }
  };

  function seasonOf(id) { return T.SEASONS.find((s) => s.id === id); }

  T.art = function (treasureOrId, size, opts) {
    const it = typeof treasureOrId === 'string' ? T.TREASURE[treasureOrId] : treasureOrId;
    if (!it) return '';
    opts = opts || {};
    const p = opts.silhouette ? { m: 'var(--line)', a: 'var(--line)', l: 'var(--surface)' } : seasonOf(it.season).pal;
    return `<svg class="t-art" viewBox="0 0 60 60" width="${size || 60}" height="${size || 60}" aria-hidden="true">${ART[it.shape](p)}</svg>`;
  };

  T.artInner = function (it) { return ART[it.shape](seasonOf(it.season).pal); };
  T.seasonOf = seasonOf;
})(window.Tide);
