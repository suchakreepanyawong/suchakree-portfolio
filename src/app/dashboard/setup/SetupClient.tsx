'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const OTP_LABEL = 'Suchakree-portfolio-Dashboard';

export default function SetupClient() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const force = new URLSearchParams(window.location.search).get('force') === '1';
        const { data: factorList } = await supabase.auth.mfa.listFactors();
        const existing = factorList?.totp?.find((f) => f.status === 'verified');
        if (existing && !force) {
          router.replace('/dashboard');
          return;
        }
        // ลบ factor เดิมออกให้หมด (ทั้งค้างและตัวเก่าเมื่อ force)
        const stale = factorList?.totp?.filter((f) => force || (f.status as string) === 'unverified') ?? [];
        for (const f of stale) {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }

        // สร้าง factor ใหม่เพื่อสแกน QR
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: OTP_LABEL,
        });
        if (error) throw error;

        // สร้าง otpauth URI เองเพื่อคุมป้ายชื่อในแอป Authenticator ให้สวย
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const account = user?.email ?? 'owner';
        const uri =
          `otpauth://totp/${encodeURIComponent(`${OTP_LABEL}:${account}`)}` +
          `?secret=${data.totp.secret}` +
          `&issuer=${encodeURIComponent(OTP_LABEL)}` +
          `&algorithm=SHA1&digits=6&period=30`;
        setOtpauthUri(uri);
        setSecret(data.totp.secret);
        setFactorId(data.id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'เริ่มต้นไม่สำเร็จ');
      } finally {
        setStarting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDigitChange(index: number, value: string) {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    const digit = cleanVal.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  }

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

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtpDigits(next);

    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  }

  const otpCode = otpDigits.join('');

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError(null);
    try {
      // ต้องสร้าง challenge ก่อนเสมอ แล้วจึง verify ด้วย challenge นั้น
      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId });
      if (chError) throw chError;

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: otpCode,
      });
      if (error) throw error;
      // ตั้ง cookie เวลาที่ยืนยันตัวตนสำเร็จ (มีอายุ 1 ชั่วโมง)
      document.cookie = `dashboard_session_at=${Date.now()}; path=/; max-age=3600; SameSite=Lax`;
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'รหัสไม่ถูกต้อง ลองอีกครั้ง');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#eaeaea] bg-white shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#171717] text-white flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-[#171717]">ตั้งค่า OTP ครั้งแรก</h1>
            <p className="text-xs text-[#888888] leading-relaxed">
              ทำครั้งเดียว — สแกน QR ด้วยแอป Google Authenticator / Authy บนมือถือ
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {starting ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
            </div>
          ) : otpauthUri ? (
            <>
              <div className="flex justify-center p-4 bg-white rounded-xl border border-[#eaeaea]">
                <QRCodeSVG value={otpauthUri} size={192} level="M" />
              </div>
              {secret && (
                <div className="text-center space-y-1">
                  <p className="text-[11px] text-[#888888]">สแกนไม่ได้? พิมพ์รหัสนี้ในแอปด้วยตัวเอง:</p>
                  <code className="block text-[11px] bg-[#f5f5f5] border border-[#eaeaea] rounded px-2 py-1.5 break-all select-all">
                    {secret}
                  </code>
                </div>
              )}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#666666] text-center">
                    รหัส 6 หลักจากแอป
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
                  ยืนยันและเข้าใช้งาน
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
