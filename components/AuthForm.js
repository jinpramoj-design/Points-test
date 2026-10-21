'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Logo from './Logo';
export default function AuthForm({ adminOnly }) {
  const [up, setUp] = useState(false), [f, setF] = useState({ name: '', email: '', pw: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function go() {
    setErr(''); setBusy(true);
    try {
      if (up) {
        if (!f.name.trim()) throw new Error('กรุณาใส่ชื่อ');
        const c = await createUserWithEmailAndPassword(auth, f.email, f.pw);
        await setDoc(doc(db, 'users', c.user.uid), { name: f.name.trim(), points: 0, role: 'user', photo: '', createdAt: serverTimestamp() });
      } else await signInWithEmailAndPassword(auth, f.email, f.pw);
    } catch (e) { setErr(e.message.replace('Firebase: ', '')); }
    setBusy(false);
  }
  return (
    <div className="wrap c"><div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}><Logo size={76} /></div><h1>Points Arena{adminOnly && ' Admin'}</h1>
      <div className="card" style={{ textAlign: 'left' }}>
        {!adminOnly && <div className="row" style={{ marginBottom: 12 }}>
          <button className={'btn g' + (up ? ' sec' : '')} onClick={() => setUp(false)}>เข้าสู่ระบบ</button>
          <button className={'btn g' + (up ? '' : ' sec')} onClick={() => setUp(true)}>สมัครสมาชิก</button></div>}
        {up && <><label className="mut">ชื่อที่แสดง</label><input value={f.name} onChange={set('name')} maxLength={20} /></>}
        <label className="mut">อีเมล</label><input type="email" value={f.email} onChange={set('email')} />
        <label className="mut">รหัสผ่าน (6 ตัวขึ้นไป)</label><input type="password" value={f.pw} onChange={set('pw')} />
        {err && <p className="out">{err}</p>}
        <button className="btn" style={{ width: '100%' }} disabled={busy} onClick={go}>{up ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button>
      </div></div>
  );
}
