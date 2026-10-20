import { adb, FieldValue, api, log } from '@/lib/firebaseAdmin';
export const POST = api(async (uid, { rewardId }) => {
  await adb.runTransaction(async (tx) => {
    const f = adb.doc(`users/${uid}`), r = adb.doc(`rewards/${rewardId}`);
    const [fs, rs] = await Promise.all([tx.get(f), tx.get(r)]);
    if (!rs.exists) throw new Error('ไม่พบของรางวัล');
    const { cost, name } = rs.data();
    if (fs.data().points < cost) throw new Error('คะแนนไม่พอ');
    tx.update(f, { points: FieldValue.increment(-cost) });
    log(tx, { from: uid, to: 'SYSTEM', amount: cost, type: 'redeem', note: name });
  });
  return { ok: true };
});
