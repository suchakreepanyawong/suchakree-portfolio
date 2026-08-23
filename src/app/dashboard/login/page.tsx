'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, Loader2, Lock, AlertCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mfa') === 'required') {
      setMfaRequired(true);
    }
  }, []);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: factorList } = await supabase.auth.mfa.listFactors();
      const totp = factorList?.totp?.[0];

      if (!totp) {
        // ยังไม่เคยตั้ง OTP — ไปหน้า setup เพื่อสแกน QR ครั้งแรก
        router.push('/dashboard/setup');
        return;
      }

      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (chError) throw chError;
      setFactorId(challenge.id);
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: factorId,
        code: otp.trim(),
      });
      if (error) throw error;
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
              {step === 'password' ? 'สำหรับเจ้าของเว็บเท่านั้น' : 'ใส่รหัส 6 หลักจากแอป Authenticator'}
            </p>
          </div>

          {mfaRequired && step === 'password' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>ต้องล็อกอินใหม่พร้อม OTP เพื่อเข้าหน้าจัดการ</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'password' ? (
            <form onSubmit={handlePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666666]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:border-[#171717] bg-white"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666666]">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:border-[#171717] bg-white"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                เข้าสู่ระบบ
              </button>
            </form>
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
          ป้องกันด้วยรหัสผ่าน + OTP สองชั้น
        </p>
      </div>
    </div>
  );
}
