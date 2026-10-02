'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Lock, AlertCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden>
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.5c-1.5 0-1.96.93-1.96 1.89V12h3.32l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12Z" />
      <path fill="#fff" d="M16.67 15.47 17.2 12h-3.32V9.71c0-.96.46-1.89 1.96-1.89h1.5V4.87s-1.37-.24-2.68-.24c-2.74 0-4.53 1.67-4.53 4.67V12H7.08v3.47h3.05v8.38a12.1 12.1 0 0 0 3.75 0v-8.38h2.79Z" />
    </svg>
  );
}

export default function LoginClient() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [step, setStep] = useState<'choose' | 'otp'>('choose');
  const [otp, setOtp] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // หลัง redirect กลับจาก Google/Facebook: ตรวจ session แล้วพาไปขั้น OTP (หรือหน้า setup ครั้งแรก)
  useEffect(() => {
    let cancelled = false;

    async function continueAfterAuth() {
      // ถ้าถูก middleware เด้งออกเพราะไม่ใช่บัญชีเจ้าของ → ล้าง session แล้วแจ้งเตือน
      const params = new URLSearchParams(window.location.search);
      const denied = params.get('denied') === '1';
      const timedOut = params.get('timeout') === '1';

      if (denied) {
        await supabase.auth.signOut();
        if (!cancelled) {
          setError('บัญชีนี้ไม่มีสิทธิ์เข้าถึง Dashboard — ใช้บัญชีของเจ้าของเว็บเท่านั้น');
          setChecking(false);
        }
        return;
      }

      if (timedOut && !cancelled) {
        setError('ออกจากระบบอัตโนมัติเนื่องจากเซสชันหมดอายุ (เกิน 1 ชั่วโมง) เพื่อความปลอดภัย');
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setChecking(false);
        return;
      }

      // ผ่าน OTP ครบแล้ว หรือ ยังไม่เปิดใช้ OTP → เข้า dashboard เลย
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === 'aal2' || aal?.nextLevel !== 'aal2') {
        router.push('/dashboard');
        return;
      }

      const { data: factorList } = await supabase.auth.mfa.listFactors();
      const totp = factorList?.totp?.find((f) => f.status === 'verified');

      if (!totp) {
        router.push('/dashboard/setup');
        return;
      }

      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (chError) {
        if (!cancelled) {
          setError(chError.message);
          setChecking(false);
        }
        return;
      }
      if (cancelled) return;
      setFactorId(totp.id);
      setChallengeId(challenge.id);
      setStep('otp');
      setChecking(false);
    }

    continueAfterAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') continueAfterAuth();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOAuth(provider: 'google' | 'facebook') {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // หน้าเว็บจะถูกพาไปหน้าล็อกอินของ provider แล้วกลับมาที่นี่
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
      setLoading(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: otp.trim(),
      });
      if (error) throw error;
      // ตั้ง cookie เวลาที่ยืนยันตัวตนสำเร็จ (มีอายุ 1 ชั่วโมง)
      document.cookie = `dashboard_session_at=${Date.now()}; path=/; max-age=3600; SameSite=Lax`;
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'รหัส OTP ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#eaeaea] bg-white shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#171717] text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-[#171717]">Dashboard Login</h1>
            <p className="text-xs text-[#888888]">
              {step === 'choose' ? 'สำหรับเจ้าของเว็บเท่านั้น' : 'ใส่รหัส 6 หลักจากแอป Authenticator'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {checking ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
              <p className="text-xs text-[#999]">กำลังตรวจสอบ...</p>
            </div>
          ) : step === 'choose' ? (
            <div className="space-y-3">
              <button
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#dadce0] bg-white text-sm font-semibold text-[#3c4043] hover:bg-[#f8f9fa] hover:shadow-sm disabled:opacity-60 transition-all"
              >
                <GoogleIcon />
                ดำเนินการต่อด้วย Google
              </button>
              <button
                onClick={() => handleOAuth('facebook')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2] text-sm font-semibold text-white hover:bg-[#166fe5] hover:shadow-sm disabled:opacity-60 transition-all"
              >
                <FacebookIcon />
                ดำเนินการต่อด้วย Facebook
              </button>
              {loading && (
                <p className="text-center text-[11px] text-[#999] flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> กำลังเปลี่ยนไปหน้าล็อกอิน...
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666666]">รหัส OTP (6 หลัก)</label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-3 rounded-lg border border-[#e0e0e0] text-center text-2xl tracking-[0.5em] font-semibold focus:outline-none focus:border-[#171717] bg-white"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                ยืนยันรหัส
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-[#aaaaaa] pt-4">
          ป้องกันด้วย OAuth + OTP สองชั้น
        </p>
      </div>
    </div>
  );
}
