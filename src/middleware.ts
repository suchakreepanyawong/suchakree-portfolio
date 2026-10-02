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

  // หมายเหตุ: ผู้ที่ล็อกอินแล้วแต่ยังไม่ใส่ OTP ให้อยู่หน้า login ได้ (หน้า login จะแสดงขั้น OTP เอง)
  // ห้าม redirect ล็อกอินแล้วไป /dashboard เด็ดขาด — จะวนลูปกับกฎ aal2 ด้านล่าง

  // ด่านผู้ใช้ที่ได้รับอนุญาต: ล็อกอินบัญชีใดก็ได้ผ่าน OAuth แต่ต้องเป็นเจ้าของ
  // หรืออยู่ในลิสต์ authorized_users เท่านั้น (OTP ป้องกันเฉพาะบัญชีที่ตั้ง OTP ไว้ จึงต้องเช็คตัวตนที่นี่ด้วย)
  if (user && !isLogin && !(await isAuthorizedEmail(supabase, user.email ?? null))) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/login';
    url.searchParams.set('denied', '1');
    return NextResponse.redirect(url);
  }

  // ตรวจสอบอายุของ Session สำหรับ Dashboard (บังคับ 1 ชั่วโมง / 3,600,000 ms ทุกกรณี)
  const MAX_SESSION_AGE_MS = 60 * 60 * 1000;
  const sessionAtCookie = request.cookies.get('dashboard_session_at')?.value;
  const sessionAt = sessionAtCookie ? parseInt(sessionAtCookie, 10) : 0;
  const isSessionExpired = !sessionAt || Date.now() - sessionAt > MAX_SESSION_AGE_MS;

  if (user && !isLogin && !isSetup && isSessionExpired) {
    // ล้าง session และเด้งไปหน้า login
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/login';
    url.searchParams.set('timeout', '1');
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.delete('dashboard_session_at');
    return redirectResponse;
  }

  // OTP เป็นตัวเลือก: บังคับ aal2 เฉพาะเมื่อผู้ใช้ "เปิดใช้" OTP ไว้ (มี verified factor)
  // ถ้ายังไม่เคยตั้ง OTP → ล็อกอินผ่าน OAuth แล้วเข้าได้เลย
  if (user && !isLogin && !isSetup) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/login';
      url.searchParams.set('mfa', 'required');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
