import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// เริ่มต้นแบบ lazy: จะอ่าน env ตอนมี request จริงเท่านั้น ไม่ใช่ตอน build
function init() {
  if (getApps()[0]) return getApps()[0];
  const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: key } = process.env;
  if (!projectId || !clientEmail || !key) throw new Error('ยังไม่ได้ตั้งค่า FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY');
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey: key.replace(/\\n/g, '\n') }) });
}
export const adb = new Proxy({}, { get: (_, k) => { const d = getFirestore(init()); const v = d[k]; return typeof v === 'function' ? v.bind(d) : v; } });
export { FieldValue };
export const api = (h) => async (req) => {
  try {
    const t = (req.headers.get('authorization') || '').replace('Bearer ', '');
    const { uid } = await getAuth(init()).verifyIdToken(t);
    return Response.json(await h(uid, await req.json()));
  } catch (e) { return Response.json({ error: e.message }, { status: 400 }); }
};
export const log = (tx, d) => tx.set(adb.collection('transfers').doc(), { ...d, createdAt: FieldValue.serverTimestamp() });
