# Turning on Tide's nudges

About 15 minutes, once. After this, the tide reaches your phone every half hour from 7 am to 9:30 pm: a fresh affirmation on the hour, a "here for higher work" reminder on the half hour, and special nudges at 7 am, 3 pm and 8 pm. Free, with no server and no database.

**How it works:** a GitHub Action wakes up at each nudge time and taps your phone. Your phone then reads how your day is going (and the moon) and picks the words. That's why a morning nudge says something different if you've already made something.

You'll need: Tide in its own GitHub repo with GitHub Pages on, and an iPhone on iOS 16.4 or newer.

---

## 1. Make your keys

Your keys are a matching pair. The **public** key goes in the app. The **private** key stays secret in GitHub.

In Cursor, open the terminal (View → Terminal) and run:

```
npx web-push generate-vapid-keys
```

It prints a Public Key and a Private Key. Keep that window open.

Open `js/config.js` and paste the **Public Key** between the quotes:

```js
VAPID_PUBLIC_KEY: 'BPx...your public key...',
```

Commit and push. The public key is safe to be public.

## 2. Add your secrets to GitHub

On github.com, open your Tide repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add these three:

| Name | Value |
|---|---|
| `VAPID_PUBLIC_KEY` | the Public Key |
| `VAPID_PRIVATE_KEY` | the Private Key |
| `VAPID_SUBJECT` | `mailto:` plus your email, like `mailto:you@example.com` |

Never put the private key in any file in the repo.

## 3. Turn nudges on from your phone

1. Open Tide from its **home screen icon**. It has to be the installed app, not a Safari tab.
2. Wait a few seconds for the new version to load, then close and reopen it once.
3. Go to **More → Settings → Nudges from the tide**.
4. Tap **Let the tide reach me** and allow notifications.
5. Open **My phone's address (for GitHub)** and tap **Copy address**.

## 4. Give GitHub your phone's address

Back in the repo's Actions secrets, add one more:

| Name | Value |
|---|---|
| `PUSH_SUBSCRIPTION` | the address you just copied |

## 5. Send a test

In the repo, go to **Actions** → **Tide nudges** → **Run workflow**. Pick a nudge and run it. Within a minute or so your phone should buzz.

If it doesn't:

- Check that the run is green in Actions. A red run tells you what's missing.
- Make sure notifications for Tide are on in iPhone **Settings → Notifications → Tide**.
- Focus modes can hold notifications back. Add Tide to your allowed apps if you want it to come through.

---

## Good to know

- **Daylight saving is handled.** The Action runs every half hour and checks Los Angeles time before sending.
- **They don't pile up.** Each hourly and half-hourly nudge replaces the one before it, so your lock screen only ever shows the latest.
- **Nudges can run a few minutes late.** GitHub's schedule isn't exact, which is why it runs at :03 and :33.
- **Adjust without touching code.** In the repo: Settings → Secrets and variables → Actions → **Variables** tab. Add `TIDE_PAUSED` = `true` to pause everything, `HALF_HOURS` = `false` to drop the half-hour reminders, or `NUDGE_START` / `NUDGE_END` (like `8:00` and `21:00`) to change your hours.
- **iPhone Focus modes** can hold nudges during school hours or sleep if you ever want a break without changing anything here.
- **Keep the repo alive.** GitHub pauses schedules in public repos after 60 days without a commit. Any small push restarts them.
- **If your phone's address expires** (after reinstalling Tide, a new phone, or clearing Safari data), the Action will fail and GitHub will email you. Turn nudges off and on in Settings and update `PUSH_SUBSCRIPTION`.
- **Changing the special times:** edit `SPECIAL` in `push/send.mjs`, and the list in `js/config.js` so Settings shows the right times.
- **Changing the words:** affirmations and focus lines live in `js/affirmations.js`. The morning, afternoon and evening nudges live in `js/sky.js`, in the `whisper` function.
