import { adb, FieldValue, api, log } from '@/lib/firebaseAdmin';
export const POST = api(async (uid, { to, amount, note = '' }) => {
  const a = Math.floor(amount);
  if (!to || to === uid || !(a > 0)) throw new Error('ข้อมูลไม่ถูกต้อง');
  await adb.runTransaction(async (tx) => {
    const f = adb.doc(`users/${uid}`), t = adb.doc(`users/${to}`);
    const [fs, ts] = await Promise.all([tx.get(f), tx.get(t)]);
    if (!ts.exists) throw new Error('ไม่พบผู้รับ');
    if (fs.data().points < a) throw new Error('คะแนนไม่พอ');
    tx.update(f, { points: FieldValue.increment(-a) });
    tx.update(t, { points: FieldValue.increment(a) });
    log(tx, { from: uid, to, amount: a, type: 'transfer', note: String(note).slice(0, 80) });
  });
  return { ok: true };
});
