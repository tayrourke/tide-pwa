// Sends one Tide nudge to your phone.
// The phone picks the exact words (it knows your day, your rhythm and your sky); this only says which kind of nudge it is.
import webpush from 'web-push';

const TIME_ZONE = 'America/Los_Angeles';
const RUN_MINUTE = 3; // matches the cron in .github/workflows/tide-nudges.yml
const SPECIAL = { 7: 'morning', 15: 'afternoon', 20: 'evening' };

const toMin = (s, fallback) => {
  if (!s) return fallback;
  const [h, m] = String(s).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const START = toMin(process.env.NUDGE_START, 7 * 60);
const END = toMin(process.env.NUDGE_END, 21 * 60 + 30);
const HALF_HOURS = String(process.env.HALF_HOURS || 'true').toLowerCase() !== 'false';

function laNow() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  return { h: Number(parts.find((p) => p.type === 'hour').value), m: Number(parts.find((p) => p.type === 'minute').value) };
}

function whichSlot() {
  if (process.env.SLOT) return process.env.SLOT; // manual test run
  const { h, m } = laNow();
  const now = h * 60 + m;
  if (now < START || now >= END) return null;
  const onTheHour = ((m - RUN_MINUTE + 60) % 60) < 30;
  if (onTheHour) return SPECIAL[h] || 'affirm';
  return HALF_HOURS ? 'focus' : null;
}

if (String(process.env.TIDE_PAUSED || '').toLowerCase() === 'true') { console.log('Nudges are paused (TIDE_PAUSED).'); process.exit(0); }

const need = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'PUSH_SUBSCRIPTION'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing GitHub secrets: ' + missing.join(', ') + '. See PUSH-SETUP.md.');
  process.exit(1);
}

const slot = whichSlot();
if (!slot) { console.log('Quiet hours in Los Angeles. Nothing sent.'); process.exit(0); }

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:hello@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscription;
try { subscription = JSON.parse(process.env.PUSH_SUBSCRIPTION); }
catch (e) { console.error('PUSH_SUBSCRIPTION isn’t valid. Copy it again from Tide → Settings → My phone’s address.'); process.exit(1); }

try {
  await webpush.sendNotification(subscription, JSON.stringify({ slot }), { TTL: 1500, urgency: 'normal' });
  console.log('Sent the ' + slot + ' nudge.');
} catch (err) {
  if (err.statusCode === 404 || err.statusCode === 410) {
    console.error('Your phone’s address has expired. Open Tide → Settings, turn nudges off and on, and paste the new address into PUSH_SUBSCRIPTION.');
  } else {
    console.error('Couldn’t send:', err.statusCode || '', err.body || err.message);
  }
  process.exit(1);
}
