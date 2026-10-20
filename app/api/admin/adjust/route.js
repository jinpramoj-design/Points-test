import { adb, FieldValue, api, log } from '@/lib/firebaseAdmin';
export const POST = api(async (uid, { target, amount, note = '' }) => {
  const a = Math.trunc(amount);
  if (!target || !a) throw new Error('ข้อมูลไม่ถูกต้อง');
  await adb.runTransaction(async (tx) => {
    const [me, t] = await Promise.all([tx.get(adb.doc(`users/${uid}`)), tx.get(adb.doc(`users/${target}`))]);
    if (me.data()?.role !== 'admin') throw new Error('ไม่มีสิทธิ์แอดมิน');
    if (!t.exists) throw new Error('ไม่พบผู้เล่น');
    if (t.data().points + a < 0) throw new Error('คะแนนไม่พอให้หัก');
    tx.update(t.ref, { points: FieldValue.increment(a) });
    log(tx, a > 0 ? { from: 'ADMIN', to: target, amount: a, type: 'admin', note } : { from: target, to: 'ADMIN', amount: -a, type: 'admin', note: note || 'แอดมินหักคะแนน' });
  });
  return { ok: true };
});
