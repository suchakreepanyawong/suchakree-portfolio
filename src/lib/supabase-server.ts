import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Supabase client ฝั่ง server ที่ผูกกับ cookie ของผู้ใช้ (ใช้กับ server actions / RLS) */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // เรียกจาก server component — middleware จะจัดการ refresh เอง
          }
        },
      },
    }
  );
}
