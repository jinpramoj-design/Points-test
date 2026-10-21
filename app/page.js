"use client";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useMe } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';
import Main from '@/components/Main';
export default function Home() {
  const { u, me, err } = useMe();
  if (u === undefined) return <p className="c">กำลังโหลด…</p>;
  if (u && !me) return err ? <div className="wrap c"><p className="out">เชื่อมฐานข้อมูลไม่ได้: {err}</p><p className="mut">ตรวจว่าสร้าง Firestore และ Publish rules แล้ว</p><button className="btn sec" onClick={() => signOut(auth)}>ออกจากระบบ</button></div> : <p className="c">กำลังโหลด…</p>;
  return u ? <Main me={me} /> : <AuthForm />;
}
