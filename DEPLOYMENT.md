# 🚀 Suchakree Portfolio — Deployment Plan

> เอกสารนี้ใช้สำหรับทำงานต่อในแชทใหม่ สรุปสถานะปัจจุบัน + ขั้นตอน Deploy จริงบน Vercel + แผน Supabase ในอนาคต

---

## 📋 สถานะปัจจุบันของโปรเจกต์ (สำคัญ — อ่านก่อนเริ่ม)

- **โปรเจกต์:** Next.js 14.2.35 (App Router) + Tailwind CSS + framer-motion + lucide-react
- **ตำแหน่ง:** `C:\Users\sucha\Desktop\Suchakree-Portfolio`
- **Git:** ยัง**ไม่เคย** `git init` (ต้องทำเป็นขั้นแรกของการ deploy)
- **Build:** `npm run build` ผ่านสมบูรณ์ ✅ — เป็น static generation ทั้งหน้า (145 kB First Load JS)
- **หน้าเว็บ:** หน้าเดียว (`/`) ประกอบด้วย sections: Home → About → Skills → Projects → Experience → Portfolio → Contact → Footer
- **โครงสร้างข้อมูล:** ข้อมูลทั้งหมด (skills, certificates, activities, education, experience) ยังเป็น **hardcode ในไฟล์ .tsx** — ภายหลังจะย้ายไป Supabase
- **รูปภาพ:** อยู่ใน `public/images/` + ไอคอนโหลดจาก CDN (devicons / simple-icons)

### ⚠️ งานที่ต้องทำก่อน/ระหว่าง Deploy

1. **`public/resume.pdf` ยังไม่มีไฟล์** — ปุ่ม "Download Resume" ใน Navbar (`src/components/Navbar.tsx`) ชี้ไป `/resume.pdf` ซึ่งเป็นลิงก์ตาย ต้องใส่ไฟล์ PDF จริง หรือถ้ายังไม่มีให้ซ่อนปุ่มไปก่อน
2. ตรวจ `next.config.mjs` ไม่มี config พิเศษ — deploy ได้ทันทีไม่ต้องแก้อะไร

---

## 🎯 ขั้นตอนที่ 1 — เตรียม Git Repository

### 1.1 สร้าง .gitignore (ถ้ายังไม่มี)

ตรวจสอบว่ามีไฟล์ `.gitignore` ที่มีเนื้อหาอย่างน้อย:

```
node_modules/
.next/
out/
.env
.env.local
.vercel
```

### 1.2 Initialize + Commit แรก

```bash
cd C:\Users\sucha\Desktop\Suchakree-Portfolio
git init
git add .
git commit -m "Initial commit: portfolio ready for deploy"
```

### 1.3 สร้าง GitHub Repository

1. ไปที่ https://github.com/new
2. ชื่อแนะนำ: `suchakree-portfolio`
3. เลือก **Private** หรือ **Public** ก็ได้ (Public ใช้ Vercel free ได้เต็มที่)
4. อย่าติ๊ก "Add a README" (เรามี commit แล้ว)
5. Push ขึ้นไป:

```bash
git branch -M main
git remote add origin https://github.com/<USERNAME>/suchakree-portfolio.git
git push -u origin main
```

> 💡 ถ้าไม่เคยใช้ git บนเครื่อง ให้ตั้งชื่อ/อีเมลก่อน:
> `git config --global user.name "Suchakree Panyawong"`
> `git config --global user.email "Suchakree.panyawong@gmail.com"`

---

## 🎯 ขั้นตอนที่ 2 — Deploy บน Vercel

### วิธี A: ผ่านเว็บ (แนะนำ ง่ายสุด)

1. ไปที่ https://vercel.com แล้วกด **Sign Up / Login with GitHub** (ใช้บัญชี GitHub เดียวกัน)
2. กด **Add New → Project**
3. เลือก repository `suchakree-portfolio` จากรายการ (ถ้าไม่เห็น กด Adjust GitHub App Permissions)
4. Vercel จะตรวจโดยอัตโนมัติว่าเป็น Next.js — ค่าที่ตั้งไว้ถูกต้องแล้ว:
   - Framework Preset: **Next.js**
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. ไม่ต้องใส่ Environment Variables ตอนนี้ (ยังไม่มีความจำเป็น)
6. กด **Deploy** แล้วรอ 1–2 นาที
7. ได้ URL อัตโนมัติรูปแบบ `suchakree-portfolio.vercel.app` ✅

### วิธี B: ผ่าน Vercel CLI (ถ้าชอบใช้ terminal)

```bash
npm i -g vercel
vercel login
vercel          # ตอบคำถามตาม default ทั้งหมด
vercel --prod   # deploy จริงขึ้น production
```

### ผูกโดเมนเอง ( optional แต่แนะนำ )

1. Vercel Dashboard → Project → **Settings → Domains**
2. พิมพ์โดเมนที่ซื้อไว้ (เช่น `suchakree.dev`) แล้วทำตาม instructions ตั้ง DNS:
   - A record: `76.76.21.21`
   - หรือ CNAME: `cname.vercel-dns.com`
3. Vercel ออก SSL (HTTPS) ให้อัตโนมัติฟรี

### หลัง Deploy — Workflow การอัปเดตเว็บ

ทุกครั้งที่แก้โค้ดแล้ว push ขึ้น GitHub → Vercel จะ deploy ใหม่อัตโนมัติ:

```bash
git add .
git commit -m "describe สิ่งที่แก้"
git push
```

---

## 🎯 ขั้นตอนที่ 3 (อนาคต) — Supabase Dashboard & CMS

> เป้าหมาย: เพิ่ม/แก้/ลบผลงาน, ใบรับรอง, skills, สถานะ (Available badge) ได้จากหน้า Dashboard โดยไม่ต้องแก้โค้ด

### 3.1 สร้างโปรเจกต์ Supabase

1. ไปที่ https://supabase.com → **New Project**
2. ตั้งชื่อ เช่น `suchakree-portfolio-db` เลือก region ใกล้ไทย (Singapore)
3. เก็บค่าต่อไปนี้จาก Settings → API:
   - `Project URL` → ใช้เป็น `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → ใช้เป็น `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → เก็บเป็นความลับ สำหรับ API ฝั่ง server เท่านั้น (ห้าม expose)

### 3.2 โครงสร้างตารางที่แนะนำ (ออกแบบตามข้อมูลปัจจุบัน)

```sql
-- ใบรับรอง
create table certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  year text,
  image_url text,
  created_at timestamptz default now()
);

-- กิจกรรม
create table activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text not null,
  year text,
  role text,
  created_at timestamptz default now()
);

-- ผลงาน/โปรเจกต์
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,          -- เช่น CYBERSECURITY, AI/RAG
  tech_stack text[],      -- array เช่น {'Python','FastAPI'}
  image_url text,
  repo_url text,
  live_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- skills แยกตามหมวด
create table skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0
);
create table skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references skill_categories(id) on delete cascade,
  name text not null,
  icon_url text
);

-- สถานะ/ตั้งค่าเว็บ (เช่น Available badge)
create table site_settings (
  key text primary key,
  value text
);
```

**Row Level Security:** สำหรับข้อมูลสาธารณะ (อ่านได้ทุกคน) ใช้ policy:

```sql
alter table certificates enable row level security;
create policy "Public read" on certificates for select using (true);
-- ไม่ต้องเปิด insert/update ผ่าน anon — ใช้ Dashboard ของ Supabase เอง หรือ service_role
```

### 3.3 เชื่อม Next.js กับ Supabase

```bash
npm install @supabase/supabase-js
```

สร้าง `.env.local` (และเพิ่มค่าเดียวกันใน Vercel → Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ใช้เฉพาะใน server components / route handlers
```

สร้าง client `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

แก้ component ที่ hardcode อยู่ (เช่น `src/components/Portfolio.tsx`) ให้ fetch จาก Supabase:

```ts
const { data: certificates } = await supabase.from('certificates').select('*').order('year', { ascending: false });
```

> เนื่องจาก component ปัจจุบันเป็น `'use client'` + framer-motion ให้ fetch ใน parent server component แล้วส่ง props ลงมา หรือใช้ `getServerSideProps`-style ใน `page.tsx`

### 3.4 ทางเลือกสำหรับหน้า Dashboard จัดการข้อมูล

- **ทางที่ง่ายสุด:** ใช้ตาราง GUI ของ Supabase เอง (Table Editor) — ไม่ต้องเขียน Dashboard เพิ่ม แก้ข้อมูลได้ทันทีจากเว็บ Supabase
- **ทางที่ยืดหยุ่น:** สร้างหน้า `/admin` ใน Next.js ติดตั้ง Supabase Auth (email/password สำหรับเจ้าของคนเดียว) + form CRUD ต่อตาราง — ป้องกันด้วย middleware ตรวจ session

### 3.5 ลำดับการทำงานที่แนะนำเมื่อถึงขั้นนี้

1. สร้างตาราง + RLS บน Supabase
2. ย้ายข้อมูล hardcode ปัจจุบัน (certificates 15 รายการ, activities 15 รายการ, skills 6 หมวด, projects 2 รายการ, education 4, experience 3) ลงตาราง
3. แก้โค้ดให้ดึงจาก DB + ทำ loading skeleton
4. ทำหน้า /admin (optional)
5. Deploy อัปเดต (git push — Vercel ทำเอง)

---

## ✅ Checklist สรุป

- [ ] ใส่ `resume.pdf` ใน `public/` (หรือซ่อนปุ่มชั่วคราว)
- [ ] `git init` + commit + push ขึ้น GitHub
- [ ] Import repo บน Vercel → Deploy
- [ ] เปิดเว็บจริง `*.vercel.app` แล้วทดสอบทุก section + ปุ่ม resume
- [ ] (ภายหลัง) ผูก custom domain
- [ ] (ภายหลัง) สร้าง Supabase project + ตาราง + ย้ายข้อมูล
- [ ] (ภายหลัง) Environment variables เพิ่มบน Vercel

---

## 🛠️ คำสั่งที่ใช้บ่อย

| งาน | คำสั่ง |
|---|---|
| รัน dev | `npm run dev` |
| Build ทดสอบ | `npm run build` |
| Deploy (CLI) | `vercel --prod` |
| อัปเดตเว็บ | `git add . && git commit -m "..." && git push` |
| Type check | `npx tsc --noEmit` |

---

*อัปเดตล่าสุด: 2026-08-22 — สร้างหลังจบ session ปรับแต่ง UI เสร็จสมบูรณ์ และทดสอบ performance ผ่าน (build static สมบูรณ์ 145 kB, ทุก section แสดงผลถูกต้อง)*

---

## 🔒 Security — การป้องกัน Dashboard (อัปเดตล่าสุด)

Dashboard ป้องกันด้วย **3 ชั้น** (หลังจากแก้ช่องโหว่ให้คนแปลกหน้าเข้าได้):

1. **ชั้นโค้ด** — `middleware.ts` และ `requireAdmin()` ใน `actions.ts` เช็คว่าอีเมลของบัญชีที่ล็อกอินตรงกับเจ้าของหรือไม่ (กำหนดใน `src/lib/owner.ts` หรือผ่าน env `OWNER_EMAIL` คั่นหลายอีเมลด้วยลูกน้ำ) บัญชีอื่นโดนเด้งออกพร้อมข้อความ "บัญชีนี้ไม่มีสิทธิ์เข้าถึง Dashboard"
2. **ชั้นฐานข้อมูล (RLS)** — รันสคริปต์ `supabase/rls-owner-fix.sql` ใน Supabase → SQL Editor แล้วตาราง/รูปทั้งหมดจะเขียน-ลบได้เฉพาะอีเมลเจ้าของเท่านั้น (อ่านได้ทุกคนตามปกติเพื่อแสดงหน้าเว็บ)
3. **ชั้น Supabase Auth** — แนะนำปิด "Allow new users to sign up" ใน Supabase → Authentication → Sign In / Up เพื่อไม่ให้คนแปลกหน้าสร้างบัญชีในโปรเจกต์เลย (บัญชีเจ้าของเดิมใช้งานได้ปกติ)

**หลังตั้งค่าครบ ควรตรวจ:** Supabase → Authentication → Users — ถ้ามีบัญชีแปลกหน้าที่ไม่ใช่ของคุณ (สร้างก่อนแก้ช่องโหว่) ให้ลบทิ้ง

**ถ้าเปลี่ยนอีเมลที่ใช้ล็อกอิน:** แก้ ① env `OWNER_EMAIL` ใน Vercel → Settings → Environment Variables (และ `.env.local` ตอนรันในเครื่อง) และ ② อีเมลใน `is_owner()` ของสคริปต์ SQL แล้วรันใหม่
