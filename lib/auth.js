'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
const Ctx = createContext({});
export const useMe = () => useContext(Ctx);
export function Provider({ children }) {
  const [u, setU] = useState(undefined); // undefined = กำลังโหลด
  const [me, setMe] = useState(null);
  useEffect(() => onAuthStateChanged(auth, (x) => { setU(x); if (!x) setMe(null); }), []);
  useEffect(() => { if (!u) return; return onSnapshot(doc(db, 'users', u.uid), (s) => setMe(s.exists() ? { id: s.id, ...s.data() } : null)); }, [u]);
  return <Ctx.Provider value={{ u, me }}>{children}</Ctx.Provider>;
}
