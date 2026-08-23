import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * ผู้ที่มีสิทธิ์เข้า Dashboard มี 2 แบบ:
 * 1. "เจ้าของหลัก" — กำหนดผ่าน env OWNER_EMAIL (คั่นหลายอีเมลด้วยลูกน้ำ) หรือค่าเริ่มต้นด้านล่าง
 *    (เจ้าของหลักลบตัวเองออกจากลิสต์ใน Dashboard ไม่ได้ กันล็อกตัวเองออก)
 * 2. "ผู้ใช้ที่ได้รับอนุญาต" — เพิ่ม/ลบได้จากหน้า Dashboard (แท็บ OTP) เก็บในตาราง authorized_users
 */
const DEFAULT_OWNER_EMAILS = 'suchakree.panyawong@gmail.com';

export function getOwnerEmails(): string[] {
  const raw = process.env.OWNER_EMAIL?.trim() || DEFAULT_OWNER_EMAILS;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** เจ้าของหลักหรือไม่ (เช็คจาก env/ค่าเริ่มต้น ไม่แตะฐานข้อมูล) */
export function isOwner(email: string | undefined | null): boolean {
  if (!email) return false;
  return getOwnerEmails().includes(email.trim().toLowerCase());
}

/* cache ผลการเช็คสิทธิ์สั้นๆ ลดการยิง query ทุก request ใน middleware */
const authCache = new Map<string, { ok: boolean; expires: number }>();
const CACHE_MS = 60_000;

/**
 * อีเมลนี้เข้า Dashboard ได้หรือไม่ — เจ้าของหลัก หรืออยู่ในตาราง authorized_users
 * (ตารางยังไม่ถูกสร้าง/ยังไม่รัน SQL → อนุญาตเฉพาะเจ้าของหลักเท่านั้น)
 */
export async function isAuthorizedEmail(
  supabase: SupabaseClient,
  email: string | undefined | null,
): Promise<boolean> {
  if (!email) return false;
  const key = email.trim().toLowerCase();
  if (isOwner(key)) return true;

  const cached = authCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.ok;

  const { data, error } = await supabase
    .from('authorized_users')
    .select('email')
    .eq('email', key)
    .maybeSingle();

  if (error) {
    // ตารางยังไม่มี หรือ DB ผิดพลาด — ใช้ cache เดิมถ้ามี ไม่งั้น fail-closed
    return cached ? cached.ok : false;
  }

  const ok = Boolean(data);
  authCache.set(key, { ok, expires: Date.now() + CACHE_MS });
  return ok;
}
