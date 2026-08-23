'use server';

import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PUBLIC_STORAGE_URL } from '@/lib/supabase';
import { isOwner } from '@/lib/owner';

const TABLES = [
  'certificates',
  'activities',
  'projects',
  'experiences',
  'education',
  'skills',
  'skill_categories',
  'social_links',
] as const;
type TableName = (typeof TABLES)[number];

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('ไม่ได้รับอนุญาต');

  // อนุญาตเฉพาะอีเมลเจ้าของเว็บ — บัญชี OAuth อื่นแม้ล็อกอินได้ก็แก้ข้อมูลไม่ได้
  if (!isOwner(user.email ?? null)) throw new Error('บัญชีนี้ไม่มีสิทธิ์แก้ไขข้อมูล');

  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
    throw new Error('ต้องยืนยัน OTP ก่อนใช้งาน');
  }

  return supabase;
}

/** อัปโหลดรูป: บีบอัดเป็น WebP 2 ขนาด (เต็ม 1600px / thumb 480px) แล้วเก็บใน Storage */
export async function uploadImage(formData: FormData): Promise<{ full: string; thumb: string }> {
  const supabase = await requireAdmin();

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) throw new Error('ไม่พบไฟล์รูป');
  if (!file.type.startsWith('image/')) throw new Error('รองรับเฉพาะไฟล์รูปภาพ');
  if (file.size > 15 * 1024 * 1024) throw new Error('ไฟล์ใหญ่เกิน 15MB');

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const full = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  const path = `${name}.webp`;
  const thumbPath = `${name}-thumb.webp`;

  const uploads = await Promise.all([
    supabase.storage.from('portfolio').upload(path, full, { contentType: 'image/webp', upsert: true }),
    supabase.storage.from('portfolio').upload(thumbPath, thumb, { contentType: 'image/webp', upsert: true }),
  ]);
  const failed = uploads.find((u) => u.error);
  if (failed?.error) throw new Error(`อัปโหลดไม่สำเร็จ: ${failed.error.message}`);

  return {
    full: `${PUBLIC_STORAGE_URL}/${path}`,
    thumb: `${PUBLIC_STORAGE_URL}/${thumbPath}`,
  };
}

function parseForm(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const pair of Array.from(formData.entries())) {
    const [key, value] = pair;
    if (key === 'file' || key === 'id') continue;
    if (typeof value !== 'string') continue;
    const v = value.trim();
    if (v === '') continue;
    if (key === 'sort_order' || key === 'is_current') {
      obj[key] = key === 'is_current' ? v === 'true' || v === 'on' : parseInt(v, 10) || 0;
      continue;
    }
    if (key === 'points' || key === 'tech_stack') {
      obj[key] = v.split('\n').map((line) => line.trim()).filter(Boolean);
      continue;
    }
    obj[key] = v;
  }
  // checkbox ที่ไม่ถูกติ๊กจะไม่ถูกส่งมาเลย — ใช้ hidden marker ตรวจ
  if (formData.has('__checkbox_is_current') && !('is_current' in obj)) {
    obj.is_current = false;
  }
  return obj;
}

export async function saveRow(tableName: string, formData: FormData): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!TABLES.includes(tableName as TableName)) throw new Error('ตารางไม่ถูกต้อง');
    const supabase = await requireAdmin();

    const data = parseForm(formData);

    // ถ้ามีไฟล์รูปแนบมา → อัปโหลดแล้วเก็บ URL (image_url เก็บตัวเต็ม)
    const file = formData.get('file') as File | null;
    if (file && file.size > 0) {
      const { full } = await uploadImage(formData);
      data.image_url = full;
      if (tableName === 'education' || tableName === 'experiences') {
        data.logo_url = full;
        delete data.image_url;
      }
    }

    const id = formData.get('id') as string | null;
    const query = id && id !== 'new'
      ? supabase.from(tableName).update(data).eq('id', id)
      : supabase.from(tableName).insert(data);
    const { error } = await query;
    if (error) throw new Error(error.message);

    revalidatePath('/');
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ' };
  }
}

export async function deleteRow(tableName: string, id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!TABLES.includes(tableName as TableName)) throw new Error('ตารางไม่ถูกต้อง');
    const supabase = await requireAdmin();

    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/');
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'ลบไม่สำเร็จ' };
  }
}

export async function saveSiteContent(entries: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdmin();

    const rows = Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
    if (error) throw new Error(error.message);

    revalidatePath('/');
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ' };
  }
}

export async function signOut(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/');
}
