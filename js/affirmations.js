/* Tide — affirmations and focus reminders.
   Written for Taylor's chart: Pisces Sun, Mercury and Venus, Libra rising, Gemini Moon, Virgo Mars and North Node,
   2/4 Manifesting Generator with emotional authority, the Channel of Charisma (20–34) and Openness (12–22),
   the Right Angle Cross of Eden, and Gene Keys 36 · 6 · 11 · 12.
   `src` is the part of your chart an affirmation draws on, shown under it in the app.
   Shared by the app and the service worker, so hourly nudges can use them too. */
(function (root) {
  const A = (text, src) => ({ text, src: src || '' });

  const THEMES = {
    highest: {
      name: 'Highest self', glyph: '✦',
      items: [
        A('I am becoming the woman I came here to be, one small true choice at a time.'),
        A('My highest self is not far away. She is who I am when I stop scrolling and start creating.'),
        A('I was born under three Pisces lights. I trust the depth I carry.', 'Pisces Sun, Mercury and Venus'),
        A('My life’s work is humanity. My real stories help people feel less alone.', 'Gene Key 36'),
        A('I lead with compassion, and it starts with me.', 'Gene Key 36 siddhi'),
        A('I respond to life instead of forcing it. What is meant for me finds me.', 'Manifesting Generator'),
        A('My gifts are called out of me when I am rested and ready.', '2/4 profile'),
        A('I honor my waves. My clarity comes in time, and it is always worth the wait.', 'Emotional authority'),
        A('I carry the Cross of Eden. I keep my wonder and grow wise through living.', 'Right Angle Cross of Eden'),
        A('I am a channel for something bigger than me.'),
        A('I choose presence over perfection.'),
        A('I am allowed to take up space in my own life.')
      ]
    },
    abundance: {
      name: 'Abundance', glyph: '✧',
      items: [
        A('Abundance flows to me as easily as water finds the sea.'),
        A('Money is a current, and I am open to it.'),
        A('I receive as generously as I give.', 'Life Path 33'),
        A('My Venus is exalted. I am built to attract beauty, love and plenty.', 'Venus in Pisces'),
        A('There is more than enough, and I am worthy of my share.'),
        A('Every small thing I make plants a seed of abundance.'),
        A('My community grows because I show up as myself.', '4th line'),
        A('I say yes to the opportunities that light my whole body up.', 'Sacral response'),
        A('Wealth comes to me through my truth, not my hustle.'),
        A('I let good things be easy.'),
        A('My big, original ideas are blessed.', 'Jupiter in Aquarius'),
        A('I am abundant in time, energy, love and money.')
      ]
    },
    love: {
      name: 'Love', glyph: '♡',
      items: [
        A('I am deeply loved, and I let myself feel it.'),
        A('Love moves through me like the tide. It always returns.'),
        A('I give love without abandoning myself.'),
        A('I am worthy of the love I so freely give.'),
        A('My heart is soft and my boundaries are strong.'),
        A('My home overflows with warmth and laughter.', 'Cancer Midheaven'),
        A('I let myself be cherished.'),
        A('I speak to myself the way I speak to the ones I love most.'),
        A('Love is balance, and I deserve both sides of it.', 'Libra rising'),
        A('I am open to being fully seen and fully loved.', 'Channel of Openness'),
        A('The love I pour into my family returns to me, multiplied.'),
        A('Love is my native language.', 'Venus in Pisces')
      ]
    },
    confidence: {
      name: 'Confidence', glyph: '☀︎',
      items: [
        A('When I act on what lights me up, people feel it.', 'Channel of Charisma'),
        A('I trust my voice. What I have to say matters.'),
        A('I don’t need to be louder. I need to be true.'),
        A('I am capable, clear and certain of my worth.'),
        A('I finish what I start, and I am proud of what I make.', 'Mars and North Node in Virgo'),
        A('I back myself, even before anyone else does.'),
        A('My energy is magnetic when I follow my gut.', 'Sacral response'),
        A('I begin before I feel ready. Readiness follows.', 'Saturn in Aries'),
        A('I stand tall in who I am, soft and strong at once.'),
        A('Every time I choose creating over consuming, I become more myself.'),
        A('My words land with grace and power.', 'Mercury in Pisces'),
        A('I am the authority on my own life.')
      ]
    },
    joy: {
      name: 'Joy', glyph: '✺',
      items: [
        A('Joy is my birthright, and I claim it today.'),
        A('I find magic in ordinary moments.'),
        A('I let myself play.'),
        A('My creativity is a fountain that never runs dry.', 'Pisces stellium'),
        A('I laugh easily and often.'),
        A('Delight counts. Joy is a practice.'),
        A('I choose what lights me up.'),
        A('Beauty finds me everywhere I look.', 'Venus in Pisces'),
        A('I am light, I am free, I am here.'),
        A('My joy is contagious, and my girls catch it.'),
        A('I let myself enjoy my life now, not someday.'),
        A('My curious heart gets fed by wonder, not the feed.', 'Gemini Moon')
      ]
    },
    mama: {
      name: 'Present mama', glyph: '☽︎',
      items: [
        A('I am the mother my girls need, and I am enough.'),
        A('When I am with my children, I am all the way here.'),
        A('My presence is the greatest gift I give them.'),
        A('I put the phone down and pick up the moment.'),
        A('I show my daughters, by example, how to love themselves.'),
        A('Our home is a soft, safe, joyful place to grow.', 'Cancer Midheaven'),
        A('I parent from peace, not pressure.'),
        A('I forgive myself quickly and repair with love.'),
        A('My girls see a woman who creates, rests and shines.'),
        A('These days are sacred. I am here for them.'),
        A('I am patient, playful and present.'),
        A('My love roots them. My joy sets them free.')
      ]
    },
    release: {
      name: 'Release', glyph: '〰︎',
      items: [
        A('I release what was never mine to carry.'),
        A('I let go of comparison. My path is my own.', 'Gene Key 12'),
        A('I release the need to be everything to everyone.', 'Life Path 33'),
        A('Old stories dissolve in me like salt in water.', 'South Node in Pisces'),
        A('I release the scroll. My attention is sacred.'),
        A('I forgive myself for the times I didn’t know better.'),
        A('I release guilt and choose grace.'),
        A('What leaves my life makes room for what is meant for me.'),
        A('I breathe out fear and breathe in trust.'),
        A('I release perfection. Small and finished is enough.', 'Virgo North Node'),
        A('I let go of the version of me that played small.'),
        A('I am free.')
      ]
    },
    master: {
      name: 'Master 33', glyph: '✵',
      items: [
        A('I am the Master Teacher. I lead with love.', 'Life Path 33'),
        A('My presence is medicine.', 'Life Path 33'),
        A('I heal by how I live, not by how much I give.', 'Life Path 33'),
        A('I am a lighthouse. I don’t chase. I shine.'),
        A('I am here for higher work, and I am ready for it.'),
        A('Everything I have lived through becomes wisdom I give away.', 'Gene Key 36'),
        A('I am worthy of receiving everything I teach.', 'Life Path 33'),
        A('My life is my message, and I live it with integrity.'),
        A('I rise, and I bring others with me.', 'Channel of Charisma'),
        A('I am divinely guided in every step I take.')
      ]
    },
    creation: {
      name: 'Creation', glyph: '✎',
      items: [
        A('I am a creator, not a consumer.'),
        A('I make before I take.'),
        A('Small and finished beats big and brilliant.', 'Virgo North Node'),
        A('My ideas become real when I give them my hands.', 'Gene Key 11'),
        A('I create from overflow, not pressure.'),
        A('The world needs what only I can make.')
      ]
    }
  };

  // Transit-powered affirmations: what today's strongest transit is inviting
  const TRANSIT = {
    sun: ['Today I let my light be seen.', 'I shine gently, without apology.'],
    mercury: ['My words flow with ease and truth today.', 'I speak slowly and say exactly what I mean.'],
    venus: ['Love and beauty flow toward me today.', 'I am enough exactly as I am. I have nothing to compare.'],
    mars: ['I have all the courage I need today.', 'I move my energy with grace. I choose my response.'],
    jupiter: ['Blessings are expanding in my life right now.', 'I say yes to what matters and no to what doesn’t.'],
    saturn: ['I build my dreams one steady brick at a time.', 'I can do hard things, gently.'],
    uranus: ['I welcome beautiful surprises.', 'I stay soft and flexible as life rearranges itself.'],
    neptune: ['My intuition is clear, and I trust it.', 'My boundaries protect my dreams.'],
    pluto: ['I am becoming my most powerful self.', 'I let what’s ending end, and I trust what’s beginning.']
  };

  const FOCUS = {
    work: [
      'I am here for higher work. One thing, fully.',
      'I am here for higher work. My attention is sacred.',
      'I am here for higher work. What is the one thing right now?',
      'Stay with it. My focus is a form of devotion.',
      'I am here for higher work. I finish the small thing in front of me.',
      'Close the feed, open your gift. You are here for higher work.'
    ],
    family: [
      'My higher work right now is them. I am all the way here.',
      'Higher work looks like this moment with my girls.',
      'Right now, being present is the whole job.'
    ],
    rest: [
      'My higher work right now is rest. I let it be sacred.',
      'Resting is part of my higher work tonight.'
    ]
  };

  const ORDER = ['highest', 'master', 'abundance', 'love', 'confidence', 'joy', 'mama', 'release', 'creation'];

  const HOUSE_AFF = {
    1: 'I honor my body, and I let my beauty be seen.',
    2: 'I know my worth, and I receive abundantly.',
    3: 'My words are clear, kind and powerful.',
    4: 'My home is my sanctuary. I am rooted in love.',
    5: 'I create with joy and play with my whole heart.',
    6: 'My daily rituals are sacred, and they hold me.',
    7: 'I attract loving, balanced partnership.',
    8: 'I transform, and I trust what is ending.',
    9: 'My wisdom is meant to be shared, and I share it.',
    10: 'My work shines, and the right people find it.',
    11: 'I am held by my community, and I lift them too.',
    12: 'I rest deeply and trust what I cannot see yet.'
  };
  const CLOSERS = [
    'I am the Master Teacher, and I lead with love.',
    'I fill my own cup first, and it overflows to everyone I love.',
    'I am here for higher work, and I am ready.',
    'I am stepping into my highest self, right now.',
    'Love is my power, and I use it wisely.'
  ];

  /** Today's incantation: four lines woven from the Gene Key of the day, your personal day number, the moon's house and your Life Path */
  function incantation(date) {
    date = date || new Date();
    const out = [];
    const B = root.TideBlueprint, AS = root.TideAstro, SK = root.TideSky;
    if (B && AS) {
      const g = B.gateOf(AS.sunLon(date));
      const k = B.GK[g.gate];
      const mine = B.HD.allGates.includes(g.gate);
      out.push({ text: `I rise from ${k[0].toLowerCase()} into ${k[1].toLowerCase()}.`, src: `Gene Key ${g.gate} of the day${mine ? ', also in your own chart' : ''}` });
    }
    if (B) {
      const pd = B.personalDay(date), py = B.personalYear(date);
      out.push({ text: B.NUM[pd].aff, src: `Personal day ${pd} · ${B.NUM[pd].word}, in your ${py} year` });
    }
    if (SK) {
      const s = SK.sky(date);
      out.push({ text: HOUSE_AFF[s.house], src: `Moon in ${s.sign}, your ${ordinal(s.house)} house` });
    }
    out.push({ text: CLOSERS[hash(date.toDateString()) % CLOSERS.length], src: 'Life Path 33' });
    return out;
  }
  const ordinal = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');

  function all(custom) {
    const out = [];
    ORDER.forEach((k) => THEMES[k].items.forEach((a, i) => out.push({ ...a, theme: k, id: k + '-' + i })));
    (custom || []).forEach((c) => out.push({ text: c.text, src: 'Your own words', theme: c.theme || 'highest', id: c.id }));
    return out;
  }

  /** Which themes fit this hour of the day (and the block of your day, if known) */
  function themesFor(date, block) {
    const h = date.getHours();
    if (block === 'school' || block === 'family') return ['mama', 'joy', 'love'];
    if (block === 'hermit' || block === 'reflect') return ['release', 'love'];
    if (h < 10) return ['highest', 'master', 'confidence', 'creation'];
    if (h < 15) return ['abundance', 'confidence', 'creation', 'joy'];
    if (h < 18) return ['joy', 'mama', 'abundance'];
    return ['love', 'release', 'highest', 'master'];
  }

  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /** A fresh affirmation for this hour. Deterministic per hour, so the app and nudges agree. */
  function forHour(date, opts) {
    opts = opts || {};
    const key = date.toDateString() + ' ' + date.getHours();
    // once a day, around midday, the affirmation comes from today's strongest transit
    if (date.getHours() === 12 && root.TideSky && root.TideSky.topTransits) {
      const t = root.TideSky.topTransits(date, 1)[0];
      if (t && TRANSIT[t.transit]) return { text: TRANSIT[t.transit][t.easy ? 0 : 1], src: t.title, theme: 'highest', id: 'transit' };
    }
    // a third of the hours, the affirmation comes from today's incantation
    if (hash(key + 'i') % 3 === 0) {
      const inc = incantation(date);
      const pick = inc[hash(key) % inc.length];
      if (pick) return { ...pick, theme: 'master', id: 'incantation' };
    }
    const themes = themesFor(date, opts.block);
    const pool = all(opts.custom).filter((a) => themes.includes(a.theme));
    const favs = all(opts.custom).filter((a) => (opts.favorites || []).includes(a.id));
    const list = favs.length && hash(key + 'f') % 4 === 0 ? favs : pool;
    return list[hash(key) % list.length];
  }

  function focusLine(date, block) {
    const kind = block === 'school' || block === 'family' ? 'family' : block === 'hermit' || block === 'reflect' ? 'rest' : 'work';
    const list = FOCUS[kind];
    return list[hash(date.toDateString() + date.getHours()) % list.length];
  }

  /** The rhythm block you're in right now, from the blocks you set in the app */
  function blockAt(date, rhythm) {
    if (!rhythm || !rhythm.length) return null;
    const hm = String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
    let cur = null;
    rhythm.slice().sort((a, b) => a.t.localeCompare(b.t)).forEach((b) => { if (b.t <= hm) cur = b; });
    return cur ? cur.type : null;
  }

  root.TideAffirm = { incantation, HOUSE_AFF, THEMES, ORDER, TRANSIT, FOCUS, all, forHour, focusLine, blockAt, themesFor };
})(typeof self !== 'undefined' ? self : window);
