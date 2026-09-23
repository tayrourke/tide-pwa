# Tide — make before you take

A daily ritual PWA for creating instead of scrolling. Built around Taylor's design:
Gene Keys 36 · 6 · 11 · 12, Virgo North Node, 2/4 Manifesting Generator, emotional authority, Life Path 33.

No build step, no framework, no account. Plain HTML, CSS and JS. Data stays in the phone's localStorage.

## How the game works (slow on purpose)

- **Six highest-self practices:** create before you consume, move your body, be all the way with the girls, teach or give one thing, five minutes of stillness, unplug for the night. Tap a practice to see why it fits your chart. The stillness practice opens a guided sit. Four lit stars bring a treasure; all six bring a rare one.
- **Sit in stillness** (`#/sit`): a guided 5, 10, or 20 minute sit. It walks from arriving in the body, through the breath, to noticing your emotional wave, then a soft bell. Five minutes lights the stillness star. A closing line (“what did you notice?”) stays on that day.
- **Ocean meets cosmos:** each practice lights one of six stars in your Pisces constellation. At high tide the water rises high enough to reflect them. Every making day adds a permanent star to your sky, and every moon ritual adds a bright one.
- **The pool** is a living scene: sky follows the time of day, the real moon phase hangs over the water, and your three Pisces fish (Sun, Mercury, and Venus, your chart ruler) swim in it. Tap the water and they come to you. Tap a fish or the moon to see what it is.
- **The tide** is today's six rituals. Each one raises the water. Low tide leaves the fish crowded in the shallows.
- **Treasures:** one washes up each day you make before you take. Rare ones only on high-tide days (all six). Each sabbat season on the Wheel of the Year has its own eight, so something new is always washing in. On March 13 a Solar Return pearl washes up.
- **Message in a bottle:** after your first make, a bottle drifts in carrying the day's Gene Key contemplation.
- **Pearls:** breathe through an urge (nine slow breaths) and a pearl settles in your pool.
- **Coral:** every full make session grows one branch. Ten branches finish a coral.
- **Your sky:** your natal chart wheel with today's planets around it, and your transits read in plain words, strongest first. Planet positions are calculated on the phone and checked against the Swiss Ephemeris.
- **Moon rituals:** a guided new moon ritual (set an intention) and full moon ritual (see what grew, release something, give thanks). Each opens a day before the lunation and stays open for three days after.
- **The sky today:** the moon's real sign and phase, read through your chart (whole-sign houses from Libra rising).
- **Blueprint (Sky → Blueprint):** birth chart wheel with houses and exact placements, Human Design bodygraph with type, authority, profile, cross, channels and open centers, all three Gene Keys sequences, and Life Path 33 with your personal year, month and day.
- **Daily incantation:** four lines woven from the Gene Key of the day, your personal day number, the moon's house in your chart and Life Path 33, with a guided speak-it-out-loud mode.
- **With the girls:** a guided family ritual for every sabbat (gather list, four hands-on steps, a question to ask, something to make, a blessing to say together, and a memory to keep). Celebrating brings the season's pearl.
- **Venus retrograde guide:** because Venus rules your chart, her retrograde gets its own page (`#/venus`): key dates computed live from the ephemeris (shadow, station, the three passes over your rising sign, station direct, after-shadow), what to lean into and what to let wait, six weekly questions that unlock one per week, and a closing Venus review that becomes a star in your sky.
- **Sky calendar:** the next four months of new and full moons, eclipses, retrogrades, sign changes, exact big transits to your chart, sabbats and your solar return, all read through your houses.
- **Scroll check:** a nightly two-number check from Screen Time (Apple doesn't let web apps read it), with a weekly chart and an insight showing which practices actually quiet the scroll.
- **I am:** about 100 affirmations written for your chart across eight themes (highest self, abundance, love, confidence, joy, present mama, release, creation), plus a daily one drawn from your strongest transit. Favorite them, say them out loud, and add your own.
- **Nudges:** a fresh affirmation every hour and a "here for higher work" reminder every half hour, rhythm-aware (during homeschool it reminds you to be with the girls), plus special nudges at 7 am, 3 pm and 8 pm. Quiet from 9:30 pm to 7 am. Setup is in `PUSH-SETUP.md`.
- **Accuracy:** natal chart, Human Design, Gene Keys and house cusps were recalculated with the Swiss Ephemeris. Placidus houses by default, whole sign in Settings.
- Missing a day never takes anything away.

| Page | Route | What it does |
|---|---|---|
| Pool | `#/` | The living tide pool, six ritual chips, bottle, surf button |
| Sit | `#/sit` | Guided 5/10/20-minute stillness. Five minutes lights the stillness star |
| Breathe | `#/surf` | Nine slow breaths with a rising and falling wave, then name the real craving and get a swap |
| Make | `#/make` | 10/25/45-minute timer, coral growth, quick "log a make" |
| I am | `#/affirm` | Affirmations by theme, favorites, your own words, speak-it-out-loud |
| With the girls | `#/sabbat` | Family sabbat rituals and the year ahead |
| Sky | `#/sky` | Chart wheel, transits, retrogrades, upcoming lunations, past intentions |
| Moon ritual | `#/ritual` | Guided new and full moon rituals |
| Treasures | `#/treasures` | This season's collection, past seasons, the year ahead, tide journal |
| Gut check | `#/gut` | Swipeable prompt deck for finding today's yes |
| Rhythm | `#/rhythm` | Your day as color-coded blocks with a "now" marker. Editable |
| Reflect | `#/reflect` | Evening wave check-in, prompts, 7-day view |
| My design | `#/design` | Activation Sequence, chart and Human Design |
| Settings | `#/settings` | Name, theme, backup export/import, erase |

## File map

```
tide/
├── index.html              app shell + tab bar
├── PUSH-SETUP.md           one-time setup for nudges
├── .github/workflows/      the scheduled nudge sender (GitHub Actions)
├── push/                   the little script that sends a nudge
├── manifest.webmanifest    install info, icons, home-screen shortcuts
├── sw.js                   offline cache (bump VERSION after every change)
├── css/app.css             all styles, light + dark tokens at the top
├── icons/                  app icons (svg + png)
└── js/
    ├── config.js           your public push key + nudge times shown in Settings
    ├── data.js             personal content: rituals, prompts, keys, rhythm, cravings
    ├── affirmations.js     every affirmation and focus line (shared with sw.js)
    ├── blueprint.js        Gene Keys table, Human Design details, numerology (shared with sw.js)
    ├── astro.js            planet positions, your natal chart, aspects, new and full moons
    ├── sky.js              readings: moon, transits, moon ritual themes, every nudge's words (shared with sw.js)
    ├── push.js             turning nudges on/off on this phone
    ├── treasures.js        the eight sabbat collections + treasure art
    ├── game.js             seasons, moon, rewards, coral, reveal cards
    ├── store.js            localStorage layer, streaks, backup
    ├── ui.js               helpers, icons
    ├── app.js              hash router + boot
    └── pages/              one file per page, including sit.js
```

## Putting Tide in its own repo

1. Create a new GitHub repo (for example `tide`) and upload everything in this folder, including the hidden `.github` folder.
2. In the repo: Settings → Pages → deploy from the `main` branch, root folder.
3. It will live at `https://<you>.github.io/tide/`. Open it in Safari → Share → Add to Home Screen.
4. For nudges, follow `PUSH-SETUP.md`.

All paths are relative, so it works at any address. Tide keeps its own storage (`tide-v1`) and its own service worker, so it won't collide with Hearthkeep even on the same GitHub account.

## Editing tips (in Cursor)

- Change prompts, rituals, rhythm defaults, Gene Key text: `js/data.js`.
- Rename or rewrite treasures, or add a ninth to a season: `js/treasures.js`.
- Colors and fonts: the top of `css/app.css`.
- New page: add `js/pages/yourpage.js` defining `Tide.pages.yourpage = { nav, title, render(el, params) {} }`, add a `<script>` tag in `index.html`, add a route in `js/app.js`, and add the file to `SHELL` in `sw.js`.
- After any change, bump `VERSION` in `sw.js` so the installed app picks it up.

## Backups

Everything lives on the phone. Settings → Export backup saves a JSON file; Import restores it. Do this before clearing Safari data or switching phones.
