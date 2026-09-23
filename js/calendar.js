/* Tide — your sky calendar.
   Everything coming up in the next few months, read through your chart. */
(function (T) {
  const A = window.TideAstro, S = window.TideSky;
  const R = Math.PI / 180;
  const NAME = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };
  const THEME = { sun: 'focus and vitality', mercury: 'ideas and conversations', venus: 'love, beauty and money', mars: 'drive and courage', jupiter: 'growth and luck', saturn: 'lessons and structure' };
  const ord = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
  const signIdx = (lon) => Math.floor(A.norm(lon) / 30);

  function moonLat(date) {
    const d = A.dayNum(date) - 1.5;
    const M = 134.963 + 13.064993 * d, F = 93.272 + 13.22935 * d, D = 297.85 + 12.190749 * d;
    return 5.128 * Math.sin(F * R) + 0.2806 * Math.sin((M + F) * R) + 0.2777 * Math.sin((M - F) * R) + 0.1732 * Math.sin((2 * D - F) * R);
  }

  function natalHit(lon) {
    let best = null;
    Object.keys(S.NATAL_WORDS).forEach((k) => {
      const sep = Math.abs(((A.norm(lon) - A.NATAL[k] + 540) % 360) - 180);
      if (sep < 3 && (!best || sep < best.sep)) best = { k, sep };
    });
    return best ? S.NATAL_WORDS[best.k].long : null;
  }

  function events(from, days) {
    from = from || new Date();
    days = days || 120;
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
    const end = new Date(start.getTime() + days * 864e5);
    const out = [];

    // New and full moons, eclipses
    let d = new Date(start.getTime() - 864e5);
    for (let i = 0; i < 12; i++) {
      const n = A.lunation('new', d), f = A.lunation('full', d);
      const l = n.date < f.date ? n : f;
      if (l.date > end) break;
      const ecl = Math.abs(moonLat(l.date)) < 1.6;
      const house = A.houseOf(l.lon);
      const hit = natalHit(l.lon);
      const lunar = S.LUNAR[l.sign];
      out.push({
        date: l.date, kind: ecl ? 'eclipse' : l.type === 'new' ? 'new' : 'full', icon: l.type === 'new' ? '●' : '○',
        title: `${ecl ? (l.type === 'new' ? 'Solar eclipse' : 'Lunar eclipse') : (l.type === 'new' ? 'New moon' : 'Full moon')} in ${l.sign}`,
        text: `Your ${ord(house)} house of ${S.HOUSES[house].name}. ${l.type === 'new' ? 'Plant seeds of ' + lunar.seed + '.' : 'Release ' + lunar.release + '.'}${hit ? ' It lands right on ' + hit + '.' : ''}${ecl ? ' Eclipses speed things up, so keep it gentle and don’t force big decisions.' : ''}`,
        big: !!hit || ecl, link: '#/ritual'
      });
      d = new Date(l.date.getTime() + 864e5);
    }

    // Daily scan for sign changes and retrograde stations
    const bodies = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    let prev = null;
    for (let i = 0; i <= days; i++) {
      const day = new Date(start.getTime() + i * 864e5);
      const p = A.positions(day);
      if (prev) {
        bodies.forEach((b) => {
          if (signIdx(p[b].lon) !== signIdx(prev[b].lon)) {
            const sign = A.SIGNS[signIdx(p[b].lon)];
            const house = A.houseOf(p[b].lon);
            let text = `${b === 'sun' ? 'The Sun' : NAME[b]} lights up your ${ord(house)} house of ${S.HOUSES[house].name} for the coming weeks, bringing ${THEME[b]}.`;
            if (b === 'sun' && sign === 'Pisces') text = 'Your season. The Sun moves through your Pisces stellium, toward your solar return.';
            if (b === 'sun' && sign === 'Libra') text = 'The Sun crosses your rising sign. A season to tend your body and how you show up.';
            out.push({ date: day, kind: 'ingress', icon: '→', title: `${NAME[b]} enters ${sign}`, text, big: b === 'sun' || b === 'jupiter' || b === 'saturn' });
          }
          if (b !== 'sun' && p[b].retro !== prev[b].retro) {
            const sign = A.SIGNS[signIdx(p[b].lon)];
            const house = A.houseOf(p[b].lon);
            const text = p[b].retro
              ? ({ mercury: 'Revisit, reread and finish old drafts. Double-check plans and messages.', venus: 'Revisit what and who you love. Hold off on big beauty or money changes.', mars: 'Slow your push. Tend what you already started.', jupiter: 'Growth turns inward. Review where you’ve been saying yes.', saturn: 'Rework the structures in your life. Patience pays.' }[b]) + ` It happens in your ${ord(house)} house of ${S.HOUSES[house].name}.`
              : `${NAME[b]} moves forward again. What stalled starts to flow.`;
            out.push({ date: day, kind: 'station', icon: p[b].retro ? '℞' : '↻', title: `${NAME[b]} turns ${p[b].retro ? 'retrograde' : 'direct'} in ${sign}`, text: b === 'venus' ? text + ' Venus rules your whole chart, so this one is personal.' : text, big: b === 'mercury' || b === 'venus' || b === 'mars', link: b === 'venus' ? '#/venus' : undefined });
          }
        });
      }
      prev = p;
    }

    // Big, slow transits to your chart, on the days they're exact
    const slow = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const targets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'asc', 'mc', 'node'];
    const ASP = [['conj', 'conjunct', 0], ['sext', 'sextile', 60], ['sq', 'square', 90], ['tri', 'trine', 120], ['opp', 'opposite', 180]];
    slow.forEach((b) => targets.forEach((t) => ASP.forEach(([id, nm, ang]) => {
      let last = null, lastOrb = 99, falling = false;
      for (let i = 0; i <= days; i++) {
        const day = new Date(start.getTime() + i * 864e5);
        const lon = A.lonAt(b, A.dayNum(day));
        const sep = Math.abs(((lon - A.NATAL[t] + 540) % 360) - 180);
        const orb = Math.abs(sep - ang);
        if (orb > lastOrb && falling && lastOrb < 0.35) {
          const read = S.readTransit({ transit: b, natal: t, aspect: { id, name: nm, tone: id === 'sext' || id === 'tri' ? 'easy' : id === 'conj' ? 'fusion' : 'hard' }, orb: 0, applying: true });
          out.push({ date: last, kind: 'transit', icon: '✦', title: read.title + ' (exact)', text: read.line + ' ' + read.advice, big: true });
        }
        falling = orb < lastOrb;
        lastOrb = orb; last = day;
      }
    })));

    // Sabbats
    for (let i = 0; i <= days; i++) {
      const day = new Date(start.getTime() + i * 864e5);
      const sb = S.sabbatToday(day);
      if (sb) out.push({ date: day, kind: 'sabbat', icon: '❋', title: `${sb.name}, ${sb.gloss}`, text: 'Your family ritual with the girls is ready.', big: true, link: '#/sabbat' });
    }

    // Solar return
    for (let i = 0; i <= days; i++) {
      const day = new Date(start.getTime() + i * 864e5);
      if (day.getMonth() === 2 && day.getDate() === 13) out.push({ date: day, kind: 'birthday', icon: '☉', title: 'Your solar return', text: 'The Sun comes home to where it was when you were born. A new personal year begins.', big: true });
    }

    return out.filter((e) => e.date >= new Date(start.getTime() - 12 * 36e5) && e.date <= end).sort((a, b) => a.date - b.date);
  }

  T.calendar = { events };
})(window.Tide);
