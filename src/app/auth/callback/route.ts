import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

/** จุดรับลิงก์กลับจาก Google OAuth → แลก session แล้วเข้า dashboard (middleware จะบังคับ OTP) */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard/login?error=oauth`);
}
