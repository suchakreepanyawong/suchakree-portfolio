import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthorizedEmail } from '@/lib/owner';

/**
 * คุมประตู /dashboard — refresh session + บังคับล็อกอิน (และ MFA สำหรับหน้าจัดการจริง)
 * หน้า /dashboard/login และ /dashboard/setup ไม่ต้องมี aal2
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/dashboard/login';
  const isSetup = pathname === '/dashboard/setup';

  // ไม่ได้ล็อกอิน → เด้งไป login (ยกเว้นอยู่หน้า login อยู่แล้ว)
  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/login';
    return NextResponse.redirect(url);
  }

  // ด่านผู้ใช้ที่ได้รับอนุญาต: ต้องเป็นเจ้าของ หรืออยู่ในลิสต์ authorized_users
  // user.email อาจเป็น undefined สำหรับ Google OAuth บางกรณี → ใช้ user_metadata.email เป็น fallback
  const userEmail =
    user?.email?.trim() || (user?.user_metadata?.email as string | undefined)?.trim() || null;
  const authorized = await isAuthorizedEmail(supabase, userEmail);
  if (user && !isLogin && !authorized) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/login';
    url.searchParams.set('denied', '1');
    return NextResponse.redirect(url);
  }

  // ตรวจสอบระดับ MFA: ถ้าบัญชีเปิด OTP ไว้แต่ยังไม่ได้ยืนยัน (aal1) ให้ส่งไปหน้า login เพื่อกรอก OTP
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsMfa = aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2';

  if (user && !isLogin && !isSetup && needsMfa) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/login';
    url.searchParams.set('mfa', 'required');
    return NextResponse.redirect(url);
  }

  // ตรวจสอบอายุของ Session สำหรับ Dashboard (บังคับ 1 ชั่วโมง / 3,600,000 ms)
  // ตรวจเฉพาะผู้ใช้ที่ผ่านขั้นตอน OTP หรือเข้าถึงหน้า dashboard แล้วเท่านั้น
  const MAX_SESSION_AGE_MS = 60 * 60 * 1000;
  const sessionAtCookie = request.cookies.get('dashboard_session_at')?.value;
  const sessionAt = sessionAtCookie ? parseInt(sessionAtCookie, 10) : 0;
  const isSessionExpired = !sessionAt || Date.now() - sessionAt > MAX_SESSION_AGE_MS;

  if (user && !isLogin && !isSetup && !needsMfa && isSessionExpired) {
    // ล้าง session และเด้งไปหน้า login พร้อมแจ้งเตือนหมดอายุ
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/login';
    url.searchParams.set('timeout', '1');
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.delete('dashboard_session_at');
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
