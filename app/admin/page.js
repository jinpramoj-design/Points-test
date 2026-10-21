"use client";
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useMe } from '@/lib/auth';
import { call } from '@/lib/api';
import { useUsers, useHist } from '@/lib/hooks';
import AuthForm from '@/components/AuthForm';
import Logo from '@/components/Logo';
import { Avatar, Modal, History } from '@/components/Bits';

export default function Admin() {
  const { u, me, err } = useMe();
  if (u === undefined) return <p className="c">กำลังโหลด…</p>;
  if (u && !me) return err ? <div className="wrap c"><p className="out">เชื่อมฐานข้อมูลไม่ได้: {err}</p><p className="mut">ตรวจว่าสร้าง Firestore และ Publish rules แล้ว</p><button className="btn sec" onClick={() => signOut(auth)}>ออกจากระบบ</button></div> : <p className="c">กำลังโหลด…</p>;
  if (!u) return <AuthForm adminOnly />;
  if (me.role !== 'admin') return <div className="wrap c"><p>บัญชีนี้ไม่มีสิทธิ์แอดมิน</p><button className="btn sec" onClick={() => signOut(auth)}>ออกจากระบบ</button></div>;
  return <Panel />;
}
function Panel() {
  const users = useUsers(), [rw, setRw] = useState([]), [pl, setPl] = useState(null), [ed, setEd] = useState(null);
  useEffect(() => onSnapshot(query(collection(db, 'rewards'), orderBy('cost')), (s) => setRw(s.docs.map((d) => ({ id: d.id, ...d.data() })))), []);
  return <div className="wrap wide">
    <div className="row"><div className="g row"><Logo size={36} /><h1 style={{ margin: 0 }}>Points Arena Admin</h1></div><button className="btn sec sm" onClick={() => signOut(auth)}>ออกจากระบบ</button></div>
    <h3>ผู้เล่น ({users.length})</h3>
    <div className="card" style={{ overflowX: 'auto' }}><table><thead><tr><th>#</th><th>ผู้เล่น</th><th>คะแนน</th><th /></tr></thead><tbody>
      {users.map((x, i) => <tr key={x.id}><td>{i + 1}</td><td><div className="row"><Avatar u={x} s={32} />{x.name}</div></td><td><b>{x.points.toLocaleString()}</b></td>
        <td><button className="btn sec sm" onClick={() => setPl(x)}>ประวัติ / ปรับคะแนน</button></td></tr>)}</tbody></table></div>
    <div className="row"><h3 className="g">ของรางวัล</h3><button className="btn sm" onClick={() => setEd({ icon: '🎁', name: '', cost: 100 })}>＋ เพิ่ม</button></div>
    {rw.map((r) => <div key={r.id} className="card row"><span style={{ fontSize: 28 }}>{r.icon}</span><div className="g"><b>{r.name}</b><div className="mut">{r.cost.toLocaleString()} คะแนน</div></div>
      <button className="btn sec sm" onClick={() => setEd(r)}>แก้ไข</button></div>)}
    {pl && <Player p={users.find((x) => x.id === pl.id) || pl} onClose={() => setPl(null)} />}
    {ed && <RewardForm r={ed} onClose={() => setEd(null)} />}</div>;
}
function Player({ p, onClose }) {
  const hist = useHist(p.id), [a, setA] = useState(''), [note, setNote] = useState(''), [err, setErr] = useState('');
  const adj = async (sg) => { try { setErr(''); await call('/api/admin/adjust', { target: p.id, amount: sg * +a, note }); setA(''); setNote(''); } catch (e) { setErr(e.message); } };
  return <Modal onClose={onClose}><div className="row"><Avatar u={p} s={52} /><div className="g"><b>{p.name}</b><div className="mut">{p.id}</div></div><b style={{ fontSize: 24 }}>{p.points.toLocaleString()}</b></div>
    <h4>ปรับคะแนน</h4><input type="number" min="1" placeholder="จำนวนคะแนน" value={a} onChange={(e) => setA(e.target.value)} /><input placeholder="หมายเหตุ (ไม่บังคับ)" value={note} onChange={(e) => setNote(e.target.value)} />
    {err && <p className="out">{err}</p>}<div className="row"><button className="btn g" disabled={!a} onClick={() => adj(1)}>＋ เพิ่ม</button><button className="btn sec g" disabled={!a} onClick={() => adj(-1)}>－ ลด</button></div>
    <h4>ประวัติคะแนน</h4><History id={p.id} hist={hist} /><button className="btn sec" style={{ width: '100%' }} onClick={onClose}>ปิด</button></Modal>;
}
function RewardForm({ r, onClose }) {
  const [f, setF] = useState({ icon: r.icon, name: r.name, cost: r.cost });
  const save = async () => { const d = { icon: f.icon || '🎁', name: f.name.trim(), cost: Math.max(1, Math.floor(+f.cost)) }; if (!d.name) return; r.id ? await updateDoc(doc(db, 'rewards', r.id), d) : await addDoc(collection(db, 'rewards'), d); onClose(); };
  return <Modal onClose={onClose}><h3>{r.id ? 'แก้ไข' : 'เพิ่ม'}ของรางวัล</h3>
    <label className="mut">ไอคอน</label><input value={f.icon} maxLength={4} onChange={(e) => setF({ ...f, icon: e.target.value })} />
    <label className="mut">ชื่อ</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
    <label className="mut">คะแนนที่ใช้แลก</label><input type="number" min="1" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} />
    <button className="btn" style={{ width: '100%' }} onClick={save}>บันทึก</button>
    {r.id && <button className="btn sec" style={{ width: '100%', marginTop: 8, color: 'var(--no)' }} onClick={async () => { await deleteDoc(doc(db, 'rewards', r.id)); onClose(); }}>ลบของรางวัล</button>}
    <button className="btn sec" style={{ width: '100%', marginTop: 8 }} onClick={onClose}>ปิด</button></Modal>;
}
