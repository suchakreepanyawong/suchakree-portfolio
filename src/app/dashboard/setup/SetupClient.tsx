'use client';

import React, { useEffect, useState } from 'react';
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
  const [code, setCode] = useState('');
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

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError(null);
    try {
      // ต้องสร้าง challenge ก่อนเสมอ แล้วจึง verify ด้วย challenge นั้น
      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId });
      if (chError) throw chError;

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (error) throw error;
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'รหัสไม่ถูกต้อง ลองอีกครั้ง');
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
              <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#666666]">รหัส 6 หลักจากแอป</label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-3 rounded-lg border border-[#e0e0e0] text-center text-2xl tracking-[0.5em] font-semibold focus:outline-none focus:border-[#171717]"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
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
