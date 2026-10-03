import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

/**
 * จุดรับลิงก์กลับจาก Google/Facebook OAuth
 * → แลก code เป็น session แล้วส่งไปหน้า login เสมอ
 * → LoginClient จะตรวจ MFA / ตั้ง cookie / redirect ต่อเองอัตโนมัติ
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // ส่งไปหน้า login เสมอ (ไม่ใช่ /dashboard) เพื่อให้ LoginClient
      // เป็นผู้ตั้ง dashboard_session_at cookie ก่อน ป้องกัน false-positive timeout
      return NextResponse.redirect(`${origin}/dashboard/login`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard/login?error=oauth`);
}
