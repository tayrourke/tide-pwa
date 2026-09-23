/* Tide — Taylor's blueprint.
   Gene Keys, Human Design and numerology, calculated from March 13, 1997, 8:30 pm, Los Angeles
   and checked against the Swiss Ephemeris. Shared by the app and the service worker. */
(function (root) {
  // Shadow → Gift → Siddhi for all 64 Gene Keys
  const GK = {
    1: ['Entropy', 'Freshness', 'Beauty'], 2: ['Dislocation', 'Orientation', 'Unity'], 3: ['Chaos', 'Innovation', 'Innocence'],
    4: ['Intolerance', 'Understanding', 'Forgiveness'], 5: ['Impatience', 'Patience', 'Timelessness'], 6: ['Conflict', 'Diplomacy', 'Peace'],
    7: ['Division', 'Guidance', 'Virtue'], 8: ['Mediocrity', 'Style', 'Exquisiteness'], 9: ['Inertia', 'Determination', 'Invincibility'],
    10: ['Self-Obsession', 'Naturalness', 'Being'], 11: ['Obscurity', 'Idealism', 'Light'], 12: ['Vanity', 'Discrimination', 'Purity'],
    13: ['Discord', 'Discernment', 'Empathy'], 14: ['Compromise', 'Competence', 'Bounteousness'], 15: ['Dullness', 'Magnetism', 'Florescence'],
    16: ['Indifference', 'Versatility', 'Mastery'], 17: ['Opinion', 'Far-Sightedness', 'Omniscience'], 18: ['Judgement', 'Integrity', 'Perfection'],
    19: ['Co-Dependence', 'Sensitivity', 'Sacrifice'], 20: ['Superficiality', 'Self-Assurance', 'Presence'], 21: ['Control', 'Authority', 'Valour'],
    22: ['Dishonour', 'Graciousness', 'Grace'], 23: ['Complexity', 'Simplicity', 'Quintessence'], 24: ['Addiction', 'Invention', 'Silence'],
    25: ['Constriction', 'Acceptance', 'Universal Love'], 26: ['Pride', 'Artfulness', 'Invisibility'], 27: ['Selfishness', 'Altruism', 'Selflessness'],
    28: ['Purposelessness', 'Totality', 'Immortality'], 29: ['Half-Heartedness', 'Commitment', 'Devotion'], 30: ['Desire', 'Lightness', 'Rapture'],
    31: ['Arrogance', 'Leadership', 'Humility'], 32: ['Failure', 'Preservation', 'Veneration'], 33: ['Forgetting', 'Mindfulness', 'Revelation'],
    34: ['Force', 'Strength', 'Majesty'], 35: ['Hunger', 'Adventure', 'Boundlessness'], 36: ['Turbulence', 'Humanity', 'Compassion'],
    37: ['Weakness', 'Equality', 'Tenderness'], 38: ['Struggle', 'Perseverance', 'Honour'], 39: ['Provocation', 'Dynamism', 'Liberation'],
    40: ['Exhaustion', 'Resolve', 'Divine Will'], 41: ['Fantasy', 'Anticipation', 'Emanation'], 42: ['Expectation', 'Detachment', 'Celebration'],
    43: ['Deafness', 'Insight', 'Epiphany'], 44: ['Interference', 'Teamwork', 'Synarchy'], 45: ['Dominance', 'Synergy', 'Communion'],
    46: ['Seriousness', 'Delight', 'Ecstasy'], 47: ['Oppression', 'Transmutation', 'Transfiguration'], 48: ['Inadequacy', 'Resourcefulness', 'Wisdom'],
    49: ['Reaction', 'Revolution', 'Rebirth'], 50: ['Corruption', 'Equilibrium', 'Harmony'], 51: ['Agitation', 'Initiative', 'Awakening'],
    52: ['Stress', 'Restraint', 'Stillness'], 53: ['Immaturity', 'Expansion', 'Superabundance'], 54: ['Greed', 'Aspiration', 'Ascension'],
    55: ['Victimisation', 'Freedom', 'Freedom'], 56: ['Distraction', 'Enrichment', 'Intoxication'], 57: ['Unease', 'Intuition', 'Clarity'],
    58: ['Dissatisfaction', 'Vitality', 'Bliss'], 59: ['Dishonesty', 'Intimacy', 'Transparency'], 60: ['Limitation', 'Realism', 'Justice'],
    61: ['Psychosis', 'Inspiration', 'Sanctity'], 62: ['Intellect', 'Precision', 'Impeccability'], 63: ['Doubt', 'Inquiry', 'Truth'],
    64: ['Confusion', 'Imagination', 'Illumination']
  };

  // The Rave mandala: gate order around the zodiac, starting at 2° Aquarius (302°)
  const WHEEL = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
  function gateOf(lon) {
    const a = (((lon - 302) % 360) + 360) % 360;
    return { gate: WHEEL[Math.floor(a / 5.625)], line: Math.floor((a % 5.625) / 0.9375) + 1 };
  }

  const SEQUENCES = {
    activation: {
      name: 'Activation Sequence', blurb: 'Your purpose and life’s work.',
      spheres: [
        { sphere: 'Life’s Work', key: 36, line: 2, from: 'Personality Sun', note: 'Your real stories help people feel less alone.' },
        { sphere: 'Evolution', key: 6, line: 2, from: 'Personality Earth', note: 'Let tension settle before you act or post.' },
        { sphere: 'Radiance', key: 11, line: 4, from: 'Design Sun', note: 'Ideals made real. You glow through your close circle.' },
        { sphere: 'Purpose', key: 12, line: 4, from: 'Design Earth', note: 'Discernment: what you say, what you let in, what you refuse.' }
      ]
    },
    venus: {
      name: 'Venus Sequence', blurb: 'Your heart, relationships and emotional patterns.',
      spheres: [
        { sphere: 'Attraction', key: 36, line: 2, from: 'Design Moon', note: 'You draw people in through honest feeling.' },
        { sphere: 'IQ', key: 14, line: 6, from: 'Design Venus', note: 'Your mind is at its best serving something bigger than you.' },
        { sphere: 'EQ', key: 6, line: 6, from: 'Personality Mars', note: 'Emotional maturity grows as you stop avoiding friction.' },
        { sphere: 'SQ', key: 22, line: 2, from: 'Personality Venus', note: 'Grace in love. Letting yourself be fully felt.' },
        { sphere: 'Core', key: 6, line: 2, from: 'Design Mars', note: 'Your deepest healing is making peace with conflict.' }
      ]
    },
    pearl: {
      name: 'Pearl Sequence', blurb: 'Your prosperity and how you serve.',
      spheres: [
        { sphere: 'Vocation', key: 6, line: 2, from: 'Design Mars', note: 'You prosper by bringing peace and diplomacy to people.' },
        { sphere: 'Culture', key: 61, line: 2, from: 'Design Jupiter', note: 'You thrive around people who inspire you.' },
        { sphere: 'Pearl', key: 19, line: 5, from: 'Personality Jupiter', note: 'Your sensitivity to others’ needs is your wealth.' },
        { sphere: 'Brand', key: 36, line: 2, from: 'Personality Sun', note: 'Humanity. Real, warm, lived.' }
      ]
    }
  };

  const HD = {
    type: 'Manifesting Generator',
    strategy: 'Wait to respond, then inform',
    signature: 'Satisfaction and peace',
    notSelf: 'Frustration and anger',
    authority: 'Emotional (Solar Plexus)',
    authorityNote: 'There’s no truth in the now for you. Ride your wave and decide once you feel calm clarity.',
    profile: '2/4 Hermit / Opportunist',
    profileNote: 'You need time alone to let your gifts ripen, and they’re called out through the people you already know.',
    definition: 'Single definition',
    cross: 'Right Angle Cross of Eden (36/6 | 11/12)',
    crossNote: 'Keeping your wonder and innocence while you grow wise through real, lived experience.',
    channels: [
      { gates: '20–34', name: 'Channel of Charisma', note: 'Sacral power wired straight to your voice. When you act on a real yes, people feel it.' },
      { gates: '12–22', name: 'Channel of Openness', note: 'Feeling expressed through words. Speak when your wave feels right and your words move people.' }
    ],
    defined: ['Throat', 'Sacral', 'Solar Plexus'],
    open: [
      { c: 'Head', note: 'You don’t have to answer every question in your mind.' },
      { c: 'Ajna', note: 'You don’t have to be certain. It’s okay to change your mind.' },
      { c: 'G', note: 'Your direction comes through places and people. Choose your environments with care.' },
      { c: 'Heart', note: 'You have nothing to prove to anyone.' },
      { c: 'Spleen', note: 'You don’t have to hold on to what isn’t good for you.' },
      { c: 'Root', note: 'You don’t have to hurry. The pressure isn’t yours.' }
    ],
    gates: { Head: [61], Ajna: [11, 17], Throat: [12, 20], G: [25, 46], Heart: [], Spleen: [18], 'Solar Plexus': [6, 22, 36], Sacral: [14, 34], Root: [19, 41, 54, 60] },
    allGates: [6, 11, 12, 14, 17, 18, 19, 20, 22, 25, 34, 36, 41, 46, 54, 60, 61]
  };

  /* ---------- Numerology ---------- */
  const BIRTH = { m: 3, d: 13, y: 1997 };
  const digits = (n) => String(n).split('').reduce((a, c) => a + Number(c), 0);
  function reduce(n, keepMasters) {
    while (n > 9 && !(keepMasters && (n === 11 || n === 22 || n === 33))) n = digits(n);
    return n;
  }
  const lifePath = () => 33; // 3 + 1 + 3 + 1 + 9 + 9 + 7 = 33, a master number
  function personalYear(date) { return reduce(digits(BIRTH.m) + digits(BIRTH.d) + digits(date.getFullYear()), true); }
  function personalMonth(date) { return reduce(personalYear(date) + date.getMonth() + 1, true); }
  function personalDay(date) { return reduce(personalMonth(date) + date.getDate(), true); }

  const NUM = {
    1: { word: 'Beginnings', line: 'Start something. Your energy is fresh and self-led today.', aff: 'I begin boldly. I am the author of my life.' },
    2: { word: 'Partnership', line: 'Go gently. Cooperation, patience and listening win today.', aff: 'I am soft, receptive and deeply supported.' },
    3: { word: 'Expression', line: 'Create, speak, share. Joy and words are your medicine today.', aff: 'My voice is a gift, and joy pours through everything I make.' },
    4: { word: 'Foundation', line: 'Build the structure. Steady work pays off today.', aff: 'I build a life that holds me, one steady brick at a time.' },
    5: { word: 'Freedom', line: 'Expect change. Say yes to something new, but stay rooted.', aff: 'I welcome change. I am free, and I am safe.' },
    6: { word: 'Love and home', line: 'Tend your family and your home. Love is the work today.', aff: 'My love makes my home a sanctuary.' },
    7: { word: 'Spirit', line: 'Go inward. Rest, reflect, pray. Wisdom comes in the quiet.', aff: 'In stillness, I hear exactly what I need to know.' },
    8: { word: 'Power and abundance', line: 'Step into your power. Money, results and influence move today.', aff: 'I am powerful and abundant. Wealth flows to me with ease.' },
    9: { word: 'Completion', line: 'Finish, forgive, release. Make space for what’s next.', aff: 'I release with love, and I am ready for what comes.' },
    11: { word: 'Intuition', line: 'A master day. Trust the downloads and inspiration.', aff: 'I am a clear channel. My intuition is divine guidance.' },
    22: { word: 'Master building', line: 'A master day. Build something that lasts.', aff: 'I turn my biggest dreams into something real.' },
    33: { word: 'Master teaching', line: 'A master day. Lead with love and teach by example.', aff: 'I am a master teacher. My love heals what it touches.' }
  };

  const LIFE_PATH = {
    number: 33,
    title: 'The Master Teacher',
    gift: 'Healing, nurturing and teaching through love. People grow in your presence.',
    shadow: 'Over-giving, martyrdom and holding yourself to impossible standards.',
    practice: 'Fill your own cup first. You teach most powerfully by how you live, not by how much you give.'
  };

  root.TideBlueprint = { GK, gateOf, SEQUENCES, HD, NUM, LIFE_PATH, lifePath, personalYear, personalMonth, personalDay };
})(typeof self !== 'undefined' ? self : window);
