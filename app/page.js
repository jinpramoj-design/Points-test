"use client";
import { useMe } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';
import Main from '@/components/Main';
export default function Home() {
  const { u, me } = useMe();
  if (u === undefined || (u && !me)) return <p className="c">กำลังโหลด…</p>;
  return u ? <Main me={me} /> : <AuthForm />;
}
