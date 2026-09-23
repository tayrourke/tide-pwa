/* Tide — push settings.
   Paste your VAPID *public* key between the quotes (see PUSH-SETUP.md, step 1).
   The public key is safe to commit. The private key never goes in this repo. */
window.Tide = window.Tide || {};
Tide.CONFIG = {
  VAPID_PUBLIC_KEY: 'BNo3Z3LqruZWcyaXBmoaq1ME0mQ-SKkg8AE2lNqvMhPfJ_xmTM6l-L1VCddLdPaVLAJF6GCElyVIXlcLi5wtyIs',
  // Shown in Settings so you remember when the tide will reach you.
  // To change the real times, edit .github/workflows/tide-nudges.yml and push/send.mjs.
  NUDGES: [
    { time: 'Every hour', what: 'A fresh affirmation, chosen for the hour and the block of your day' },
    { time: 'Every :30', what: 'A reminder that you’re here for higher work (during homeschool, it’s “be here with them”)' },
    { time: '7 am', what: 'Morning: make before you take' },
    { time: '3 pm', what: 'Afternoon: your creation window' },
    { time: '8 pm', what: 'Evening: phone-free rest, or your moon ritual on new and full moons' },
    { time: 'Quiet', what: 'Nothing between 9:30 pm and 7 am' }
  ]
};
