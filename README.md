# Points Arena (Next.js + Firebase)

## ติดตั้ง
1. สร้างโปรเจกต์ใน Firebase Console → เปิด **Authentication (Email/Password)** และ **Firestore**
2. `cp .env.example .env.local` แล้วใส่ค่า (web app config + service account)
3. `npm install` → `npm run dev`
4. Deploy กฎความปลอดภัย: `firestore.rules` (วางใน Console > Firestore > Rules หรือ `firebase deploy --only firestore:rules`)

## ทำคนแรกให้เป็นแอดมิน
สมัครสมาชิกที่ `/` ก่อน แล้วไปที่ Firestore → `users/<uid>` แก้ `role` เป็น `admin`
จากนั้นเข้า `/admin` ด้วยบัญชีนั้น

## โครงสร้าง
- `/` เว็บผู้เล่น (อันดับ, ของรางวัล, โปรไฟล์ + QR/สแกนโอนคะแนน)
- `/admin` เว็บแอดมิน (จัดการของรางวัล, ปรับคะแนน, ดูประวัติผู้เล่น) — แยก deploy เป็นโดเมนอื่นได้
- `app/api/*` คะแนนทุกการเปลี่ยนแปลงทำฝั่งเซิร์ฟเวอร์ด้วย transaction (client แก้คะแนนเองไม่ได้ตาม rules)

## Collections
- `users/{uid}`: name, photo, points, role
- `rewards/{id}`: icon, name, cost
- `transfers/{id}`: from, to, amount, type (transfer/redeem/admin), note, createdAt

## Deploy บน Netlify
1. push โค้ดขึ้น GitHub แล้วใน Netlify เลือก **Add new site → Import from Git** (ตรวจจับ Next.js ให้อัตโนมัติ ตั้งค่าใน `netlify.toml` แล้ว)
2. ไปที่ **Site configuration → Environment variables** ใส่ค่าทั้งหมดจาก `.env.example`
   - `FIREBASE_PRIVATE_KEY` วางทั้งก้อนได้เลย (โค้ดรองรับทั้งแบบมี `\n` และขึ้นบรรทัดจริง)
3. Firebase Console → Authentication → Settings → **Authorized domains** → เพิ่มโดเมน `xxx.netlify.app` (และโดเมนจริงถ้ามี) ไม่เช่นนั้นล็อกอินไม่ได้
4. Deploy แล้วลองเข้า `/` และ `/admin`

อยากแยกเว็บ Admin เป็นอีกโดเมน: สร้างไซต์ Netlify ที่สองจาก repo เดียวกัน แล้วตั้ง redirect `/` → `/admin` ในไซต์นั้น
