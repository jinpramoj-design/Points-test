import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// ค่าเหล่านี้เป็นค่าสาธารณะของเว็บ (ไม่ใช่ความลับ) ใส่ค่าสำรองไว้กัน build ล้มถ้า env ไม่ถูกส่งมา
const app = getApps()[0] || initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBjtgSMYWEWU9e9ACyIsvuJEJGAXmLUrxY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'points-test-36772.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'points-test-36772',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:865832767090:web:94f50f3b6e83015cb3bceb',
});
export const auth = getAuth(app);
export const db = getFirestore(app);
