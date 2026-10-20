import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
export function useUsers() {
  const [l, setL] = useState([]);
  useEffect(() => onSnapshot(collection(db, 'users'), (s) => setL(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.points - a.points))), []);
  return l;
}
export function useHist(id) {
  const [a, setA] = useState([]), [b, setB] = useState([]);
  useEffect(() => {
    const c = collection(db, 'transfers'), f = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));
    const u1 = onSnapshot(query(c, where('to', '==', id)), (s) => setA(f(s)));
    const u2 = onSnapshot(query(c, where('from', '==', id)), (s) => setB(f(s)));
    return () => { u1(); u2(); };
  }, [id]);
  return [...a, ...b].sort((x, y) => (y.createdAt?.seconds || 0) - (x.createdAt?.seconds || 0));
}
