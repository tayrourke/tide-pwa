/* Tide — the Wheel of the Year with the girls.
   Simple, hands-on family rituals for ages 7 to 11. Natural materials, real food, beeswax candles. */
(function (T) {
  const { esc, header, I } = T.ui;
  const st = T.store;
  const G = T.game;

  const RITES = {
    mabon: {
      meaning: 'Day and night are exactly equal. We say thank you for the harvest and share what we have.',
      gather: ['Apples and a knife (grown-up job)', 'Cinnamon', 'A beeswax candle', 'Small papers, pencils and a jar'],
      steps: [
        'Light the candle together. Tell the girls today has the same amount of day and night, perfectly balanced.',
        'Gratitude jar: everyone writes three thank-yous, reads one out loud, and folds them into the jar. You’ll open it at Yule.',
        'Cut an apple sideways to find the hidden star inside. Sprinkle with cinnamon and share it.',
        'Balance game: stand on one foot and name one thing you want to keep and one thing you want to let go of.'
      ],
      ask: 'What are you proud of that grew in you this year?',
      make: 'Bake an apple crisp, or string a garland of fallen leaves.',
      blessing: 'As the wheel turns, we give thanks. Balanced in light and dark, we are held.'
    },
    samhain: {
      meaning: 'The last harvest. We remember people we love who came before us, and get cozy for the dark half of the year.',
      gather: ['Photos of grandparents and ancestors', 'Candles', 'A pumpkin', 'Paper and pencils'],
      steps: [
        'Make a remembering table with photos, a candle and a favorite food of someone you love.',
        'Tell one true story about someone in the family from long ago.',
        'Carve or paint the pumpkin together, and each whisper a wish into it.',
        'Each writes one thing they’re done with this year, then tear it into tiny pieces and bury it in the garden.'
      ],
      ask: 'What do you want to leave behind with this year?',
      make: 'Pumpkin soup and roasted pumpkin seeds.',
      blessing: 'We remember. We are grateful. We are never alone.'
    },
    yule: {
      meaning: 'The longest night of the year. From tomorrow, the sun starts coming back.',
      gather: ['Candles', 'Oranges, whole cloves and ribbon', 'Evergreen branches', 'The Mabon gratitude jar'],
      steps: [
        'Turn off every light and sit together in the dark for one quiet minute.',
        'Light one candle: the sun is being reborn. Then light the rest.',
        'Open the Mabon gratitude jar and read the thank-yous out loud.',
        'Make orange pomanders by pressing cloves into oranges, and tie them with ribbon.'
      ],
      ask: 'What light do you want to bring into the new year?',
      make: 'A dried orange garland and warm cocoa by candlelight.',
      blessing: 'In the darkest night, the light returns. So do we.'
    },
    imbolc: {
      meaning: 'The first stirring of spring under the frost. Seeds are waking up, and so are we.',
      gather: ['Seeds and small pots of soil', 'Paper strips or straw', 'Candles', 'A jar of cream'],
      steps: [
        'Clear one space in the house together to make room for spring.',
        'Plant seeds indoors, and let each girl name hers.',
        'Weave a Brigid’s cross from paper strips or straw to hang by the door.',
        'Shake a jar of cream until it turns into butter, taking turns.'
      ],
      ask: 'What new thing do you want to learn this spring?',
      make: 'Fresh butter on warm bread, and honey milk.',
      blessing: 'Seeds awake, light returns, we are ready to grow.'
    },
    ostara: {
      meaning: 'The spring equinox. Day and night are balanced again, and new life bursts out everywhere.',
      gather: ['Eggs', 'Onion skins, turmeric and beets for natural dye', 'Seeds or seedlings', 'Flowers'],
      steps: [
        'Dye eggs with natural colors: onion skins for orange, turmeric for yellow, beets for pink.',
        'Hide the eggs outside for a hunt.',
        'Plant something in the garden together.',
        'Each shares one thing that feels brand new in their life.'
      ],
      ask: 'What are you excited to grow this year?',
      make: 'Flower crowns and a spring picnic.',
      blessing: 'Light and dark in balance. Life, bursting new.'
    },
    beltane: {
      meaning: 'The festival of flowers and fire. Everything is blooming, and we celebrate being alive.',
      gather: ['Ribbons', 'Flowers', 'A small basket', 'A candle or small fire (grown-up job)'],
      steps: [
        'Make flower crowns together.',
        'Tie ribbons to a tree or pole and dance around it, weaving them.',
        'Fill a little May basket with flowers and leave it for a neighbor.',
        'Gather around the candle or fire and each name something that makes you feel alive.'
      ],
      ask: 'What makes you feel the most alive?',
      make: 'Strawberries and cream outside.',
      blessing: 'We bloom, we dance, we are alive.'
    },
    litha: {
      meaning: 'The summer solstice, the longest day. The sun is at its strongest and brightest.',
      gather: ['A glass jar and herbal tea', 'Pressed flowers and clear contact paper', 'A picnic blanket'],
      steps: [
        'Set a jar of sun tea in the sunshine in the morning.',
        'Make sun catchers with pressed flowers and hang them in a window.',
        'Have a picnic and watch the sunset together.',
        'Build a tiny fairy house in the garden.'
      ],
      ask: 'What makes you shine?',
      make: 'Sun tea and sun catchers.',
      blessing: 'Longest day, brightest light. Shine on.'
    },
    lammas: {
      meaning: 'The first harvest. We bake bread and celebrate the work of our hands.',
      gather: ['Flour, yeast or sourdough starter, salt', 'Corn husks and string', 'Garden baskets'],
      steps: [
        'Bake bread together, and let each girl shape a small loaf or a bread person.',
        'Harvest whatever is ready in the garden.',
        'Make little dolls from corn husks.',
        'Share one loaf with a neighbor or friend.'
      ],
      ask: 'What did you work hard on this summer?',
      make: 'Fresh bread with butter and honey.',
      blessing: 'From seed to bread, our work is blessed.'
    }
  };

  const GLOSS = { imbolc: 'the first stirring of spring', ostara: 'the spring equinox', beltane: 'the fire festival of bloom', litha: 'the summer solstice', lammas: 'the first harvest', mabon: 'the autumn equinox', samhain: 'when the veil is thin', yule: 'the winter solstice' };

  function dateOf(season, year) { return new Date(year, season.start[0] - 1, season.start[1]); }

  /** The sabbat whose ritual is open now (5 days before to 7 days after), or the next one */
  function current(now) {
    now = now || new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const list = [];
    [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].forEach((y) => T.SEASONS.forEach((s) => list.push({ s, date: dateOf(s, y) })));
    list.sort((a, b) => a.date - b.date);
    const open = list.find((x) => (today - x.date) / 864e5 <= 7 && (x.date - today) / 864e5 <= 5);
    const next = list.find((x) => x.date >= today);
    return { open, next, upcoming: list.filter((x) => x.date >= today).slice(0, 8) };
  }

  function record(x) {
    const s = st.s;
    s.sabbats = s.sabbats || {};
    const key = x.s.id + '-' + x.date.getFullYear();
    s.sabbats[key] = s.sabbats[key] || { steps: {}, gather: {}, memory: '', done: false };
    return s.sabbats[key];
  }

  const daysUntil = (d) => Math.round((d - new Date(new Date().toDateString())) / 864e5);
  const whenWord = (d) => { const n = daysUntil(d); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n === -1 ? 'yesterday' : n < 0 ? Math.abs(n) + ' days ago' : 'in ' + n + ' days'; };

  T.sabbats = { current, RITES, GLOSS, record, whenWord };

  T.pages.sabbat = {
    nav: 'more',
    title: 'With the girls',
    render(el) {
      const { open, next, upcoming } = current();
      const x = open || next;
      const rite = RITES[x.s.id];
      const rec = record(x);
      const isOpen = !!open;

      function draw() {
        el.innerHTML = `
        ${header(`${x.s.name} with the girls`, { back: '#/', sub: `${GLOSS[x.s.id][0].toUpperCase() + GLOSS[x.s.id].slice(1)}, ${x.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} (${whenWord(x.date)}).` })}

        <section class="sabbat-hero" style="--s-m:${x.s.pal.m};--s-a:${x.s.pal.a};--s-l:${x.s.pal.l}">
          <p class="sb-meaning">${esc(rite.meaning)}</p>
          <p class="sb-note">Say this to the girls in your own words to open the ritual.</p>
        </section>

        <section class="block">
          <h2>Gather</h2>
          <ul class="checklist">${rite.gather.map((g, i) => `<li><label><input type="checkbox" data-g="${i}" ${rec.gather[i] ? 'checked' : ''}><span>${esc(g)}</span></label></li>`).join('')}</ul>
        </section>

        <section class="block">
          <h2>The ritual</h2>
          <ol class="sb-steps">${rite.steps.map((s, i) => `<li class="${rec.steps[i] ? 'is-done' : ''}"><button class="sb-step" data-s="${i}" aria-pressed="${!!rec.steps[i]}"><span class="tick">${I.check}</span><span>${esc(s)}</span></button></li>`).join('')}</ol>
        </section>

        <section class="block sb-cards">
          <div class="sb-card"><span>Ask them</span><p>${esc(rite.ask)}</p></div>
          <div class="sb-card"><span>Make together</span><p>${esc(rite.make)}</p></div>
          <div class="sb-card sb-blessing"><span>Say together to close</span><p>${esc(rite.blessing)}</p></div>
        </section>

        <section class="block">
          <h2>Keep a memory</h2>
          <textarea id="mem" rows="3" placeholder="What did they say? What made you laugh?">${esc(rec.memory)}</textarea>
          ${rec.done
            ? `<p class="sb-done">You celebrated ${esc(x.s.name)} together ✦</p>`
            : `<button class="btn btn-primary btn-block" id="finish" ${isOpen ? '' : 'disabled'}>${isOpen ? 'We celebrated' : 'Opens ' + esc(whenWord(new Date(x.date.getTime() - 5 * 864e5)))}</button>`}
          <p class="muted small-t center" style="margin-top:8px">Celebrating together brings the season’s pearl into your pool.</p>
        </section>

        <section class="block">
          <h2>The year ahead</h2>
          <ul class="link-list">${upcoming.map((u) => `<li><div class="yr-row"><span class="yr-dot" style="background:${u.s.pal.m}"></span><span><b>${esc(u.s.name)}</b><span class="muted small-t">${esc(u.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: u.date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined }))} · ${esc(GLOSS[u.s.id])}</span></span></div></li>`).join('')}</ul>
        </section>`;

        el.querySelectorAll('[data-g]').forEach((c) => (c.onchange = () => { rec.gather[c.dataset.g] = c.checked; st.save(); }));
        el.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { const i = b.dataset.s; rec.steps[i] = !rec.steps[i]; st.save(); T.ui.buzz(8); draw(); }));
        el.querySelector('#mem').oninput = (e) => { rec.memory = e.target.value; st.save(); };
        const fin = el.querySelector('#finish');
        if (fin) fin.onclick = async () => {
          rec.done = true; rec.at = Date.now();
          const tid = x.s.id + '-7'; // the season's pearl
          G.ensure().treasures.push({ tid, at: Date.now() });
          st.mark('present', true);
          st.save();
          await G.reveal({ type: 'treasure', tid, isNew: G.owned(tid) === 1, why: `You celebrated ${x.s.name} with the girls.` });
          const more = G.checkRewards();
          if (more.length) await G.revealAll(more);
          draw();
        };
      }
      draw();
    }
  };
})(window.Tide);
