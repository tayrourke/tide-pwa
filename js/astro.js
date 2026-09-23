/* Tide — the astrology engine.
   Planet positions from Paul Schlyter's orbital elements (checked against the Swiss Ephemeris:
   within a fraction of a degree, plenty for transits). Shared by the app and the service worker. */
(function (root) {
  const R = Math.PI / 180;
  const sin = (x) => Math.sin(x * R), cos = (x) => Math.cos(x * R);
  const norm = (x) => ((x % 360) + 360) % 360;
  const dayNum = (date) => date.getTime() / 864e5 + 2440587.5 - 2451543.5;

  /* ---------- Taylor’s natal chart: March 13, 1997, 8:30 pm, Los Angeles ---------- */
  const NATAL = {
    sun: 353.64, moon: 62.04, mercury: 356.06, venus: 348.75, mars: 177.99,
    jupiter: 311.59, saturn: 8.16, uranus: 307.25, neptune: 299.32, pluto: 245.59,
    asc: 206.09, mc: 118.96, node: 178.75
  };

  const EL = {
    mercury: (d) => [48.3313 + 3.24587e-5 * d, 7.0047 + 5.0e-8 * d, 29.1241 + 1.01444e-5 * d, 0.387098, 0.205635 + 5.59e-10 * d, 168.6562 + 4.0923344368 * d],
    venus: (d) => [76.6799 + 2.4659e-5 * d, 3.3946 + 2.75e-8 * d, 54.891 + 1.38374e-5 * d, 0.72333, 0.006773 - 1.302e-9 * d, 48.0052 + 1.6021302244 * d],
    mars: (d) => [49.5574 + 2.11081e-5 * d, 1.8497 - 1.78e-8 * d, 286.5016 + 2.92961e-5 * d, 1.523688, 0.093405 + 2.516e-9 * d, 18.6021 + 0.5240207766 * d],
    jupiter: (d) => [100.4542 + 2.76854e-5 * d, 1.303 - 1.557e-7 * d, 273.8777 + 1.64505e-5 * d, 5.20256, 0.048498 + 4.469e-9 * d, 19.895 + 0.0830853001 * d],
    saturn: (d) => [113.6634 + 2.3898e-5 * d, 2.4886 - 1.081e-7 * d, 339.3939 + 2.97661e-5 * d, 9.55475, 0.055546 - 9.499e-9 * d, 316.967 + 0.0334442282 * d],
    uranus: (d) => [74.0005 + 1.3978e-5 * d, 0.7733 + 1.9e-8 * d, 96.6612 + 3.0565e-5 * d, 19.18171 - 1.55e-8 * d, 0.047318 + 7.45e-9 * d, 142.5905 + 0.011725806 * d],
    neptune: (d) => [131.7806 + 3.0173e-5 * d, 1.77 - 2.55e-7 * d, 272.8461 - 6.027e-6 * d, 30.05826 + 3.313e-8 * d, 0.008606 + 2.15e-9 * d, 260.2471 + 0.005995147 * d]
  };

  function kepler(M, e) {
    let E = M + (e / R) * sin(M) * (1 + e * cos(M));
    for (let i = 0; i < 8; i++) E = E - (E - (e / R) * sin(E) - M) / (1 - e * cos(E));
    return E;
  }

  function sunPos(d) {
    const w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = norm(356.047 + 0.9856002585 * d);
    const E = kepler(M, e);
    const xv = cos(E) - e, yv = Math.sqrt(1 - e * e) * sin(E);
    const v = Math.atan2(yv, xv) / R, r = Math.hypot(xv, yv);
    const lon = norm(v + w);
    return { lon, r, x: r * cos(lon), y: r * sin(lon) };
  }

  function helio(name, d) {
    const [N, i, w, a, e, M0] = EL[name](d);
    const M = norm(M0), E = kepler(M, e);
    const xv = a * (cos(E) - e), yv = a * Math.sqrt(1 - e * e) * sin(E);
    const v = Math.atan2(yv, xv) / R, r = Math.hypot(xv, yv);
    const xh = r * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i));
    const yh = r * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i));
    let lon = norm(Math.atan2(yh, xh) / R);
    const Mj = norm(19.895 + 0.0830853001 * d), Ms = norm(316.967 + 0.0334442282 * d), Mu = norm(142.5905 + 0.011725806 * d);
    if (name === 'jupiter') lon += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21) - 0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
    if (name === 'saturn') lon += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3) + 0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32);
    if (name === 'uranus') lon += 0.04 * sin(Ms - 2 * Mu + 6) + 0.035 * sin(Ms - 3 * Mu + 33) - 0.015 * sin(Mj - Mu + 20);
    const rp = Math.hypot(xh, yh);
    return { x: rp * cos(lon), y: rp * sin(lon) };
  }

  function plutoHelio(d) {
    const S = 50.03 + 0.033459652 * d, P = 238.95 + 0.003968789 * d;
    const lon = 238.9508 + 0.00400703 * d - 19.799 * sin(P) + 19.848 * cos(P) + 0.897 * sin(2 * P) - 4.956 * cos(2 * P) + 0.61 * sin(3 * P) + 1.211 * cos(3 * P) - 0.341 * sin(4 * P) - 0.19 * cos(4 * P) + 0.128 * sin(5 * P) - 0.034 * cos(5 * P) - 0.038 * sin(6 * P) + 0.031 * cos(6 * P) + 0.02 * sin(S - P) - 0.01 * cos(S - P);
    const lat = -3.9082 - 5.453 * sin(P) - 14.975 * cos(P) + 3.527 * sin(2 * P) + 1.673 * cos(2 * P) - 1.051 * sin(3 * P) + 0.328 * cos(3 * P) + 0.179 * sin(4 * P) - 0.292 * cos(4 * P) + 0.019 * sin(5 * P) + 0.1 * cos(5 * P) - 0.031 * sin(6 * P) - 0.026 * cos(6 * P) + 0.011 * cos(S - P);
    const r = 40.72 + 6.68 * sin(P) + 6.9 * cos(P) - 1.18 * sin(2 * P) - 0.03 * cos(2 * P) + 0.15 * sin(3 * P) - 0.14 * cos(3 * P);
    const L = lon + 3.82394e-5 * (d - 1.5); // precess from J2000 to date
    return { x: r * cos(lat) * cos(L), y: r * cos(lat) * sin(L) };
  }

  function moonLon(d) {
    const L = 218.316 + 13.176396 * (d - 1.5), M = 134.963 + 13.064993 * (d - 1.5), D = 297.85 + 12.190749 * (d - 1.5);
    const Ms = 357.529 + 0.98560028 * (d - 1.5), F = 93.272 + 13.22935 * (d - 1.5);
    return norm(L + 6.289 * sin(M) - 1.274 * sin(M - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * M - 2 * D)
      - 0.057 * sin(M - 2 * D + Ms) + 0.053 * sin(M + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(M - Ms)
      - 0.035 * sin(D) - 0.031 * sin(M + Ms) - 0.015 * sin(2 * F - 2 * D) + 0.011 * sin(M - 4 * D));
  }

  function lonAt(name, d) {
    const s = sunPos(d);
    if (name === 'sun') return s.lon;
    if (name === 'moon') return moonLon(d);
    const h = name === 'pluto' ? plutoHelio(d) : helio(name, d);
    return norm(Math.atan2(h.y + s.y, h.x + s.x) / R);
  }

  const BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  function positions(date) {
    const d = dayNum(date || new Date());
    const out = {};
    BODIES.forEach((b) => {
      const l = lonAt(b, d);
      const l2 = lonAt(b, d + 1);
      out[b] = { lon: l, retro: b !== 'sun' && b !== 'moon' && ((l2 - l + 540) % 360 - 180) < 0 };
    });
    return out;
  }

  /* ---------- Signs ---------- */
  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const SIGN_GLYPH = ['♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎', '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎'];
  const signOf = (lon) => SIGNS[Math.floor(norm(lon) / 30)];
  const degIn = (lon) => Math.floor(norm(lon) % 30);
  // House cusps for your birth time and place. Placidus from the Swiss Ephemeris; whole sign from Libra rising.
  const CUSPS = {
    placidus: [206.09, 234.53, 265.81, 298.96, 331.57, 1.0, 26.09, 54.53, 85.81, 118.96, 151.57, 181.0],
    whole: [180, 210, 240, 270, 300, 330, 0, 30, 60, 90, 120, 150]
  };
  let HOUSE_SYSTEM = 'placidus';
  function setHouseSystem(sys) { if (CUSPS[sys]) HOUSE_SYSTEM = sys; }
  function houseOf(lon, sys) {
    const c = CUSPS[sys || HOUSE_SYSTEM];
    const l = norm(lon);
    for (let i = 0; i < 12; i++) {
      const a = c[i], b = c[(i + 1) % 12];
      if (norm(l - a) < norm(b - a)) return i + 1;
    }
    return 1;
  }

  /* ---------- Lunations ---------- */
  function elong(d) { return norm(moonLon(d) - sunPos(d).lon); }
  function findPhase(from, target, dir) {
    // step to the next (dir=1) or previous (dir=-1) time the moon–sun angle crosses target
    let d = dayNum(from);
    const f = (x) => ((elong(x) - target + 540) % 360) - 180;
    let prev = f(d);
    for (let i = 0; i < 24 * 32; i++) {
      const d2 = d + dir / 24;
      const cur = f(d2);
      const crossed = dir > 0 ? (prev < 0 && cur >= 0) : (prev > 0 && cur <= 0);
      if (crossed && Math.abs(cur - prev) < 90) {
        let a = Math.min(d, d2), b = Math.max(d, d2);
        for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (f(m) < 0) a = m; else b = m; }
        const dm = (a + b) / 2;
        return { date: new Date((dm - 2440587.5 + 2451543.5) * 864e5), lon: moonLon(dm) };
      }
      d = d2; prev = cur;
    }
    return null;
  }
  function lunation(type, from, dir) {
    const r = findPhase(from || new Date(), type === 'new' ? 0 : 180, dir || 1);
    return r && { type, date: r.date, lon: r.lon, sign: signOf(r.lon), glyph: SIGN_GLYPH[Math.floor(r.lon / 30)], house: houseOf(r.lon) };
  }

  /* ---------- Aspects & transits ---------- */
  const ASPECTS = [
    { id: 'conj', name: 'conjunct', angle: 0, tone: 'fusion' },
    { id: 'sext', name: 'sextile', angle: 60, tone: 'easy' },
    { id: 'sq', name: 'square', angle: 90, tone: 'hard' },
    { id: 'tri', name: 'trine', angle: 120, tone: 'easy' },
    { id: 'opp', name: 'opposite', angle: 180, tone: 'hard' }
  ];
  const ORB = { sun: 2, mercury: 2, venus: 2, mars: 2, jupiter: 2, saturn: 2, uranus: 1.5, neptune: 1.5, pluto: 1.5 };
  const WEIGHT = { sun: 2, mercury: 1, venus: 2, mars: 2, jupiter: 3, saturn: 4, uranus: 4, neptune: 4, pluto: 5 };
  const NATAL_WEIGHT = { sun: 5, moon: 4, venus: 5, mercury: 3, mars: 3, asc: 4, mc: 4, node: 3, jupiter: 2, saturn: 2, uranus: 1, neptune: 1, pluto: 1 };

  function sep(a, b) { const x = Math.abs(norm(a) - norm(b)); return x > 180 ? 360 - x : x; }

  function transits(date) {
    date = date || new Date();
    const d = dayNum(date);
    const out = [];
    Object.keys(ORB).forEach((t) => {
      const lt = lonAt(t, d), lt2 = lonAt(t, d + 1);
      Object.keys(NATAL).forEach((n) => {
        ASPECTS.forEach((a) => {
          const orb = Math.abs(sep(lt, NATAL[n]) - a.angle);
          if (orb <= ORB[t]) {
            const orb2 = Math.abs(sep(lt2, NATAL[n]) - a.angle);
            out.push({
              transit: t, natal: n, aspect: a, orb,
              applying: orb2 < orb,
              score: WEIGHT[t] * NATAL_WEIGHT[n] * (1.6 - orb / ORB[t]) * (a.id === 'conj' ? 1.3 : 1)
            });
          }
        });
      });
    });
    return out.sort((x, y) => y.score - x.score);
  }

  root.TideAstro = { CUSPS, setHouseSystem, houseSystem: () => HOUSE_SYSTEM, NATAL, BODIES, SIGNS, SIGN_GLYPH, positions, lonAt, dayNum, signOf, degIn, houseOf, lunation, transits, sunLon: (date) => sunPos(dayNum(date)).lon, moonLon: (date) => moonLon(dayNum(date)), norm };
})(typeof self !== 'undefined' ? self : window);
