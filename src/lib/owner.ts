/**
 * ตัวตนของเจ้าของเว็บ — บัญชีเดียวเท่านั้นที่แก้ไขข้อมูลผ่าน Dashboard ได้
 * กำหนดอีเมลได้ผ่านตัวแปรสภาพแวดล้อม OWNER_EMAIL (คั่นหลายอีเมลด้วยลูกน้ำ)
 * เช่น OWNER_EMAIL=suchakree.panyawong@gmail.com,other@gmail.com
 * ถ้าไม่ได้ตั้งค่า จะใช้อีเมลเจ้าของเริ่มต้นด้านล่าง
 */
const DEFAULT_OWNER_EMAILS = 'suchakree.panyawong@gmail.com';

export function getOwnerEmails(): string[] {
  const raw = process.env.OWNER_EMAIL?.trim() || DEFAULT_OWNER_EMAILS;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwner(email: string | undefined | null): boolean {
  if (!email) return false;
  return getOwnerEmails().includes(email.trim().toLowerCase());
}
