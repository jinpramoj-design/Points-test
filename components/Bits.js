import { useUsers } from '@/lib/hooks';
export const Avatar = ({ u, s = 40 }) => <div className="av" style={{ width: s, height: s }}>{u?.photo ? <img src={u.photo} alt="" /> : (u?.name || '?')[0]}</div>;
export const Modal = ({ children, onClose }) => <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}><div className="sheet">{children}</div></div>;
export function History({ id, hist }) {
  const users = useUsers(), nm = (x) => x === 'ADMIN' ? 'แอดมิน' : x === 'SYSTEM' ? 'ระบบ' : users.find((u) => u.id === x)?.name || '?';
  if (!hist.length) return <p className="mut">ยังไม่มีประวัติ</p>;
  return hist.map((h) => { const inn = h.to === id; return (
    <div className="card row" key={h.id} style={{ padding: 10 }}><div className="g">
      <b>{h.type === 'redeem' ? 'แลก ' + h.note : (inn ? 'รับจาก ' + nm(h.from) : 'โอนให้ ' + nm(h.to))}</b>
      <div className="mut">{h.createdAt?.toDate().toLocaleString('th-TH')}{h.type !== 'redeem' && h.note ? ' · ' + h.note : ''}</div></div>
      <div className={inn ? 'in' : 'out'}>{inn ? '+' : '-'}{h.amount.toLocaleString()}</div></div>); });
}
