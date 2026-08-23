-- ============================================================
-- SECURITY FIX: จำกัดสิทธิ์เขียน/ลบข้อมูลให้เฉพาะอีเมลเจ้าของเว็บ
-- รัน 1 ครั้งใน Supabase Dashboard → SQL Editor → Run
--
-- ⚠️ หากคุณล็อกอิน Dashboard ด้วยอีเมลอื่น (ไม่ใช่ suchakree.panyawong@gmail.com)
--    ให้แก้อีเมลในฟังก์ชัน is_owner() ด้านล่างให้ตรงก่อนรัน
-- ============================================================

-- ตัวเช็คว่าเป็นเจ้าของหรือไม่ (เทียบอีเมลใน JWT ของ session ปัจจุบัน)
create or replace function public.is_owner() returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'suchakree.panyawong@gmail.com'
$$;

-- ตารางข้อมูลทั้งหมด: อ่านได้ทุกคน (หน้าเว็บ) / เขียน-ลบได้เฉพาะเจ้าของ
do $$
declare t text;
begin
  foreach t in array array['site_content','social_links','skill_categories','skills','projects','certificates','activities','experiences','education']
  loop
    execute format('drop policy if exists "auth insert" on %I', t);
    execute format('drop policy if exists "auth update" on %I', t);
    execute format('drop policy if exists "auth delete" on %I', t);
    execute format('create policy "owner insert" on %I for insert to authenticated with check (public.is_owner())', t);
    execute format('create policy "owner update" on %I for update to authenticated using (public.is_owner()) with check (public.is_owner())', t);
    execute format('create policy "owner delete" on %I for delete to authenticated using (public.is_owner())', t);
  end loop;
end $$;

-- Storage (รูปทั้งหมด): อ่านได้ทุกคน / อัปโหลด-แก้ไข-ลบได้เฉพาะเจ้าของ
drop policy if exists "auth upload portfolio bucket" on storage.objects;
drop policy if exists "auth update portfolio bucket" on storage.objects;
drop policy if exists "auth delete portfolio bucket" on storage.objects;

create policy "owner upload portfolio bucket"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio' and public.is_owner());

create policy "owner update portfolio bucket"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio' and public.is_owner())
with check (bucket_id = 'portfolio' and public.is_owner());

create policy "owner delete portfolio bucket"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio' and public.is_owner());
