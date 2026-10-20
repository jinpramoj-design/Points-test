'use client';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
export default function Scanner({ onCode }) {
  const v = useRef(), [err, setErr] = useState(''), [id, setId] = useState('');
  useEffect(() => {
    let st, raf, live = true; const c = document.createElement('canvas');
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } }).then((s) => {
      st = s; v.current.srcObject = s; v.current.play();
      const tick = () => {
        if (!live) return; const e = v.current;
        if (e?.readyState === 4) {
          c.width = e.videoWidth; c.height = e.videoHeight; const x = c.getContext('2d'); x.drawImage(e, 0, 0);
          const d = x.getImageData(0, 0, c.width, c.height), r = jsQR(d.data, d.width, d.height);
          if (r?.data.startsWith('PTS:')) { onCode(r.data.slice(4)); return; }
        }
        raf = requestAnimationFrame(tick);
      }; tick();
    }).catch(() => setErr('เปิดกล้องไม่ได้ — กรอก ID ผู้รับด้านล่างแทน'));
    return () => { live = false; cancelAnimationFrame(raf); st?.getTracks().forEach((t) => t.stop()); };
  }, []);
  return <><video ref={v} playsInline muted /><p className="mut c">{err || 'เล็งกล้องไปที่ QR Code ของผู้รับ'}</p>
    <input placeholder="หรือกรอก ID ผู้รับ" value={id} onChange={(e) => setId(e.target.value)} />
    <button className="btn sec" style={{ width: '100%' }} disabled={!id} onClick={() => onCode(id.trim())}>ใช้ ID นี้</button></>;
}
