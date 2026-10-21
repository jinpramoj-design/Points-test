'use client';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '@/lib/firebase';
import { call } from '@/lib/api';
import { useUsers, useHist } from '@/lib/hooks';
import { Avatar, Modal, History } from './Bits';
import Scanner from './Scanner';
import Logo from './Logo';
import { useEffect } from 'react';

export default function Main({ me }) {
  const [tab, setTab] = useState('lb');
  return <div className="wrap">
    <div className="hdr"><Logo size={34} /><b>Points Arena</b></div>
    {tab === 'lb' && <Leaderboard me={me} />}{tab === 'rw' && <Rewards me={me} />}{tab === 'pf' && <Profile me={me} />}
    <nav>{[['lb', '🏆 อันดับ'], ['rw', '🎁 ของรางวัล'], ['pf', '👤 โปรไฟล์']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</nav></div>;
}
function Leaderboard({ me }) {
  const users = useUsers();
  return <><h1>🏆 อันดับคะแนน</h1>{users.map((u, i) => <div key={u.id} className="card row" style={u.id === me.id ? { borderColor: 'var(--pri)' } : {}}>
    <b style={{ width: 24 }}>{i + 1}</b><Avatar u={u} /><div className="g"><b>{u.name}</b></div><b>{u.points.toLocaleString()}</b></div>)}</>;
}
function Rewards({ me }) {
  const [l, setL] = useState([]), [msg, setMsg] = useState('');
  useEffect(() => onSnapshot(query(collection(db, 'rewards'), orderBy('cost')), (s) => setL(s.docs.map((d) => ({ id: d.id, ...d.data() })))), []);
  const redeem = async (r) => { try { await call('/api/redeem', { rewardId: r.id }); setMsg('แลก ' + r.name + ' สำเร็จ 🎉'); } catch (e) { setMsg(e.message); } };
  return <><h1>🎁 ของรางวัล</h1><p className="mut">คะแนนของคุณ: <b>{me.points.toLocaleString()}</b> {msg && '· ' + msg}</p>
    {l.map((r) => <div key={r.id} className="card row"><span style={{ fontSize: 30 }}>{r.icon}</span><div className="g"><b>{r.name}</b><div className="mut">{r.cost.toLocaleString()} คะแนน</div></div>
      <button className="btn" disabled={me.points < r.cost} onClick={() => redeem(r)}>แลก</button></div>)}</>;
}
function Profile({ me }) {
  const [m, setM] = useState(null), [to, setTo] = useState(null), [amt, setAmt] = useState(''), [err, setErr] = useState(''), [name, setName] = useState(me.name), [photo, setPhoto] = useState(me.photo || '');
  const hist = useHist(me.id), close = () => { setM(null); setTo(null); setAmt(''); setErr(''); };
  async function scanned(id) {
    const s = await getDoc(doc(db, 'users', id));
    if (!s.exists() || id === me.id) { setErr('QR/ID ไม่ถูกต้อง'); return; }
    setTo({ id, ...s.data() }); setM('send');
  }
  async function send() { try { await call('/api/transfer', { to: to.id, amount: +amt }); close(); } catch (e) { setErr(e.message); } }
  function pick(e) {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 160; const s = Math.min(im.width, im.height);
      c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 160, 160); setPhoto(c.toDataURL('image/jpeg', 0.8)); }; im.src = r.result; };
    r.readAsDataURL(f);
  }
  async function saveEdit() { if (!name.trim()) return; await updateDoc(doc(db, 'users', me.id), { name: name.trim(), photo }); close(); }
  return <><h1>👤 โปรไฟล์</h1>
    <div className="card c hero"><div style={{ display: 'flex', justifyContent: 'center' }}><Avatar u={me} s={72} /></div><h2>{me.name}</h2><div className="mut">ID: {me.id}</div>
      <div className="big">{me.points.toLocaleString()}</div><div className="mut">คะแนนของฉัน</div>
      <div className="row" style={{ marginTop: 14 }}><button className="btn g" onClick={() => setM('scan')}>📷 โอนคะแนน</button><button className="btn sec g" onClick={() => setM('qr')}>⬇️ รับคะแนน</button></div>
      <button className="btn sec sm" style={{ marginTop: 10 }} onClick={() => setM('edit')}>✏️ แก้ไขชื่อ / รูป</button></div>
    <h3>ประวัติคะแนน</h3><History id={me.id} hist={hist} />
    <button className="btn sec" style={{ width: '100%', marginTop: 14 }} onClick={() => signOut(auth)}>ออกจากระบบ</button>
    {m && <Modal onClose={close}>
      {m === 'qr' && <div className="c"><h3>รับคะแนน</h3><p className="mut">ให้อีกฝ่ายสแกน QR นี้</p><div style={{ background: '#fff', padding: 14, display: 'inline-block', borderRadius: 12 }}><QRCodeSVG value={'PTS:' + me.id} size={200} /></div><p className="mut">{me.name} · {me.id}</p></div>}
      {m === 'scan' && <><h3>สแกนเพื่อโอนคะแนน</h3>{err && <p className="out">{err}</p>}<Scanner onCode={scanned} /></>}
      {m === 'send' && <><h3>โอนคะแนนให้ {to.name}</h3><p className="mut">คะแนนที่มี: {me.points.toLocaleString()}</p>
        <input type="number" min="1" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="จำนวนคะแนน" />
        <div className="row" style={{ marginBottom: 10 }}>{[50, 100, 250, 500].map((n) => <button key={n} className="btn sec sm" onClick={() => setAmt(n)}>{n}</button>)}</div>
        {err && <p className="out">{err}</p>}<button className="btn" style={{ width: '100%' }} onClick={send}>ยืนยันการโอน</button></>}
      {m === 'edit' && <><h3>แก้ไขโปรไฟล์</h3><div style={{ display: 'flex', justifyContent: 'center' }}><Avatar u={{ name, photo }} s={80} /></div>
        <input type="file" accept="image/*" onChange={pick} /><label className="mut">ชื่อ</label><input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
        <button className="btn" style={{ width: '100%' }} onClick={saveEdit}>บันทึก</button></>}
      <button className="btn sec" style={{ width: '100%', marginTop: 8 }} onClick={close}>ปิด</button></Modal>}</>;
}
