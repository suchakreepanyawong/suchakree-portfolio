import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const PUBLIC_STORAGE_URL = `${supabaseUrl}/storage/v1/object/public/portfolio`;

/** Server-side client — ใช้ใน server components / route handlers (อ่านข้อมูลสาธารณะ) */
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
