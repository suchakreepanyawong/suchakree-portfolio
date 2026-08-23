-- ============================================================
-- SECURITY: สิทธิ์เขียน/ลบ = เจ้าของหลัก + ผู้ใช้ในลิสต์ authorized_users
-- รัน 1 ครั้งใน Supabase Dashboard → SQL Editor → Run
-- (รันซ้ำได้ ไม่ทำลายข้อมูล)
--
-- ⚠️ หากคุณล็อกอิน Dashboard ด้วยอีเมลอื่น (ไม่ใช่ suchakree.panyawong@gmail.com)
--    ให้แก้อีเมลในส่วน "เจ้าของหลัก" ด้านล่างให้ตรงก่อนรัน
-- ============================================================

-- ---------- ตารางผู้ใช้ที่ได้รับอนุญาต (เพิ่ม/ลบได้จากหน้า Dashboard แท็บ OTP) ----------
create table if not exists public.authorized_users (
  email text primary key,
  added_at timestamptz default now()
);

-- เจ้าของหลัก (แก้อีเมลตรงนี้ถ้าจำเป็น)
insert into public.authorized_users (email) values
  ('suchakree.panyawong@gmail.com')
on conflict (email) do nothing;

-- ฟังก์ชันเช็คสิทธิ์ — security definer กันนโยบาย RLS วนซ้ำอ้างถึงตัวเอง
create or replace function public.is_authorized() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.authorized_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

-- ---------- RLS ของตาราง authorized_users เอง ----------
-- อ่านได้เฉพาะคนที่ล็อกอิน / เพิ่ม-ลบได้เฉพาะผู้ที่อยู่ในลิสต์ (แอปกันลบตัวเองอีกชั้น)
alter table public.authorized_users enable row level security;

drop policy if exists "authorized read" on public.authorized_users;
drop policy if exists "authorized insert" on public.authorized_users;
drop policy if exists "authorized delete" on public.authorized_users;

create policy "authorized read" on public.authorized_users
  for select to authenticated using (true);

create policy "authorized insert" on public.authorized_users
  for insert to authenticated with check (public.is_authorized());

create policy "authorized delete" on public.authorized_users
  for delete to authenticated using (public.is_authorized());

-- ---------- ตารางข้อมูลเว็บทั้งหมด: อ่านได้ทุกคน / เขียน-ลบได้เฉพาะผู้ที่ได้รับอนุญาต ----------
do $$
declare t text;
begin
  foreach t in array array['site_content','social_links','skill_categories','skills','projects','certificates','activities','experiences','education']
  loop
    execute format('drop policy if exists "auth insert" on %I', t);
    execute format('drop policy if exists "auth update" on %I', t);
    execute format('drop policy if exists "auth delete" on %I', t);
    execute format('drop policy if exists "owner insert" on %I', t);
    execute format('drop policy if exists "owner update" on %I', t);
    execute format('drop policy if exists "owner delete" on %I', t);
    execute format('create policy "owner insert" on %I for insert to authenticated with check (public.is_authorized())', t);
    execute format('create policy "owner update" on %I for update to authenticated using (public.is_authorized()) with check (public.is_authorized())', t);
    execute format('create policy "owner delete" on %I for delete to authenticated using (public.is_authorized())', t);
  end loop;
end $$;

-- ---------- Storage (รูปทั้งหมด): อ่านได้ทุกคน / อัปโหลด-แก้ไข-ลบได้เฉพาะผู้ที่ได้รับอนุญาต ----------
drop policy if exists "auth upload portfolio bucket" on storage.objects;
drop policy if exists "auth update portfolio bucket" on storage.objects;
drop policy if exists "auth delete portfolio bucket" on storage.objects;
drop policy if exists "owner upload portfolio bucket" on storage.objects;
drop policy if exists "owner update portfolio bucket" on storage.objects;
drop policy if exists "owner delete portfolio bucket" on storage.objects;

create policy "owner upload portfolio bucket"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio' and public.is_authorized());

create policy "owner update portfolio bucket"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio' and public.is_authorized())
with check (bucket_id = 'portfolio' and public.is_authorized());

create policy "owner delete portfolio bucket"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio' and public.is_authorized());
