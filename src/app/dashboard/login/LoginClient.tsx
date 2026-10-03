'use client';

import React, { useEffect, useState, useRef } from 'react';
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

export default function LoginClient() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [step, setStep] = useState<'choose' | 'otp'>('choose');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // หลัง redirect กลับจาก Google: ตรวจ session แล้วพาไปขั้น OTP (หรือหน้า setup ครั้งแรก)
  useEffect(() => {
    let cancelled = false;

    async function continueAfterAuth() {
      // ถ้าถูก middleware เด้งออกเพราะไม่ใช่บัญชีเจ้าของ → ล้าง session แล้วแจ้งเตือน
      const params = new URLSearchParams(window.location.search);
      const denied = params.get('denied') === '1';
      const timedOut = params.get('timeout') === '1';
      const oauthError = params.get('error') === 'oauth';

      // ล้าง URL params ทันทีเพื่อไม่ให้ค้างและยิงซ้ำ
      if (denied || timedOut || oauthError) {
        window.history.replaceState({}, '', '/dashboard/login');
      }

      if (denied) {
        await supabase.auth.signOut();
        if (!cancelled) {
          setError('บัญชีนี้ไม่มีสิทธิ์เข้าถึง Dashboard — ใช้บัญชีของเจ้าของเว็บเท่านั้น');
          setChecking(false);
        }
        return;
      }

      if (timedOut) {
        await supabase.auth.signOut();
        if (!cancelled) {
          setError('ออกจากระบบอัตโนมัติเนื่องจากเซสชันหมดอายุ (เกิน 1 ชั่วโมง) เพื่อความปลอดภัย');
          setChecking(false);
        }
        return;
      }

      if (oauthError) {
        if (!cancelled) {
          setError('เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
          setChecking(false);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setChecking(false);
        return;
      }

      // ผ่าน OTP ครบแล้ว หรือ ยังไม่เปิดใช้ OTP → ตั้ง cookie แล้วเข้า dashboard
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === 'aal2' || aal?.nextLevel !== 'aal2') {
        document.cookie = `dashboard_session_at=${Date.now()}; path=/; max-age=3600; SameSite=Lax`;
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
      // ยิง continueAfterAuth เฉพาะเมื่อ login สำเร็จจาก OAuth
      if (event === 'SIGNED_IN') continueAfterAuth();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // โฟกัสช่องแรกอัตโนมัติเมื่อเข้าสู่ขั้นตอน OTP
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    // ล้าง URL params ที่ค้างจากครั้งก่อน (denied, timeout) ก่อน redirect
    window.history.replaceState({}, '', '/dashboard/login');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
      setLoading(false);
    }
  }

  // จัดการการเปลี่ยนตัวเลขในแต่ละช่อง
  function handleDigitChange(index: number, value: string) {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    // กรณีพิมพ์ 1 ตัว
    const digit = cleanVal.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    // เลื่อนโฟกัสไปช่องถัดไปอัตโนมัติ
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  }

  // จัดการ Backspace ถอยหลัง
  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        inputRefs.current[index - 1]?.select();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  }

  // จัดการวาง (Paste) รหัส 6 หลักทีเดียว
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtpDigits(next);

    // ย้ายโฟกัสไปช่องสุดท้ายที่มีตัวเลข หรือช่องสุดท้าย
    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  }

  const otpCode = otpDigits.join('');

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: otpCode,
      });
      if (error) throw error;
      // ตั้ง cookie เวลาที่ยืนยันตัวตนสำเร็จ (มีอายุ 1 ชั่วโมง)
      document.cookie = `dashboard_session_at=${Date.now()}; path=/; max-age=3600; SameSite=Lax`;
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'รหัส OTP ไม่ถูกต้อง');
      // ล้างช่อง OTP เพื่อให้กรอกใหม่
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#dadce0] bg-white text-sm font-semibold text-[#3c4043] hover:bg-[#f8f9fa] hover:shadow-sm disabled:opacity-60 transition-all cursor-pointer"
              >
                <GoogleIcon />
                ดำเนินการต่อด้วย Google
              </button>
              {loading && (
                <p className="text-center text-[11px] text-[#999] flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> กำลังเปลี่ยนไปหน้าล็อกอิน...
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#666666] text-center">
                  รหัส OTP (6 หลัก)
                </label>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={handlePaste}
                      onFocus={(e) => e.target.select()}
                      className="w-11 h-13 text-center text-xl font-bold rounded-lg border border-[#d1d5db] bg-white text-[#171717] focus:outline-none focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10 transition-all"
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                ยืนยันรหัส
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-[#aaaaaa] pt-4">
          ป้องกันด้วย Google OAuth + OTP สองชั้น
        </p>
      </div>
    </div>
  );
}
