/* Tide — notifications on this phone.
   The app mirrors a tiny summary of today into IndexedDB, so the service worker
   can choose the right words when a nudge arrives. */
(function (T) {
  const DB = 'tide', STORE = 'kv';

  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }

  async function mirror() {
    try {
      const s = T.store.s, d = s.days[T.store.today()] || { done: {} };
      const state = {
        date: T.store.today(),
        done: d.done || {},
        n: T.store.doneCount(T.store.today()),
        bottle: !!d.bottle,
        name: s.settings.name,
        houseSystem: s.settings.houseSystem || 'placidus',
        rhythm: s.rhythm,
        custom: s.affirm ? s.affirm.custom : [],
        favorites: s.affirm ? s.affirm.favorites : []
      };
      const db = await idb();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(state, 'state');
    } catch (e) { /* storage unavailable: nudges fall back to general words */ }
  }

  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  function b64ToBytes(b64) {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  }

  async function registration() {
    if (!('serviceWorker' in navigator)) throw new Error('This browser can’t run Tide’s background helper.');
    return navigator.serviceWorker.ready;
  }

  async function status() {
    if (!supported()) return { state: 'unsupported' };
    if (!standalone()) return { state: 'not-installed' };
    if (!T.CONFIG.VAPID_PUBLIC_KEY) return { state: 'needs-setup' };
    if (Notification.permission === 'denied') return { state: 'denied' };
    try {
      const reg = await registration();
      const sub = await reg.pushManager.getSubscription();
      return sub ? { state: 'on', sub: JSON.stringify(sub) } : { state: 'off' };
    } catch (e) { return { state: 'off' }; }
  }

  async function enable() {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Notifications weren’t allowed. You can turn them on in iPhone Settings → Notifications → Tide.');
    const reg = await registration();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(T.CONFIG.VAPID_PUBLIC_KEY) });
    await mirror();
    return JSON.stringify(sub);
  }

  async function disable() {
    const reg = await registration();
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
  }

  async function sample() {
    const reg = await registration();
    const s = T.store.s, d = s.days[T.store.today()] || { done: {} };
    const h = new Date().getHours();
    const slot = ['affirm', 'focus', h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'][Math.floor(Math.random() * 3)];
    const w = TideSky.whisper(slot, { date: T.store.today(), done: d.done || {}, n: T.store.doneCount(T.store.today()), bottle: !!d.bottle, name: s.settings.name, houseSystem: s.settings.houseSystem, rhythm: s.rhythm, custom: s.affirm ? s.affirm.custom : [], favorites: s.affirm ? s.affirm.favorites : [] });
    await reg.showNotification(w.title, { body: w.body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: w.url }, tag: 'tide-sample' });
  }

  T.push = { mirror, status, enable, disable, sample, standalone, supported };
})(window.Tide);
