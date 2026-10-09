import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * จุดรับลิงก์กลับจาก Google OAuth
 * ใช้ pattern ที่ถูกต้องสำหรับ Route Handler: ผูก cookie กับ response object โดยตรง
 * (ไม่ใช้ cookies() จาก next/headers เพราะ set-cookie ไม่ติดกับ NextResponse.redirect)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard/login?error=oauth`);
  }

  // เตรียม response redirect ก่อน แล้วให้ supabase client attach cookie เข้าไปตรงๆ
  const redirectResponse = NextResponse.redirect(`${origin}/dashboard/login`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // attach session cookies โดยตรงกับ redirect response
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/dashboard/login?error=oauth`);
  }

  return redirectResponse;
}
