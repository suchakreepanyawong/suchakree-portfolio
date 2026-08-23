import { createBrowserClient } from '@supabase/ssr';

/** Supabase client ฝั่ง browser (ล็อกอิน / OTP / MFA enroll) */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
