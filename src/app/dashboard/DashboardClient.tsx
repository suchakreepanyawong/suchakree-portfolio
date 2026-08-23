'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award, Trophy, Layers, Briefcase, GraduationCap, Code2, Link2, FileText,
  Plus, Pencil, Trash2, X, Loader2, Check, LogOut, ChevronLeft, RotateCcw, ShieldCheck,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { deleteRow, saveRow, saveSiteContent, signOut, uploadImage } from './actions';

type Row = Record<string, unknown>;

interface FieldSpec {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'checkbox' | 'select' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
  listTitle?: boolean; // ใช้เป็นชื่อการ์ดในลิสต์
  listSubtitle?: boolean; // ใช้เป็นบรรทัดรองในลิสต์
}

interface CollectionSpec {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldSpec[];
}

const COLLECTIONS: CollectionSpec[] = [
  {
    key: 'certificates',
    label: 'Certificates',
    icon: Trophy,
    fields: [
      { key: 'title', label: 'ชื่อใบรับรอง', type: 'text', listTitle: true, required: true },
      { key: 'issuer', label: 'หน่วยงานที่ออก', type: 'text', listSubtitle: true, required: true },
      { key: 'year', label: 'ปี (เช่น 2025)', type: 'text' },
      { key: 'detail_url', label: 'ลิงก์รายละเอียด (ซ่อนในปุ่ม "ดูรายละเอียด")', type: 'text', placeholder: 'https://...' },
      { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
      { key: 'file', label: 'รูปใบรับรอง', type: 'image' },
    ],
  },
  {
    key: 'activities',
    label: 'Activities',
    icon: Award,
    fields: [
      { key: 'title', label: 'ชื่อกิจกรรม', type: 'text', listTitle: true, required: true },
      { key: 'organizer', label: 'ผู้จัด', type: 'text', listSubtitle: true, required: true },
      { key: 'year', label: 'ปี', type: 'text' },
      { key: 'role', label: 'บทบาท', type: 'text' },
      { key: 'detail_url', label: 'ลิงก์รายละเอียด', type: 'text', placeholder: 'https://...' },
      { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
      { key: 'file', label: 'รูปกิจกรรม', type: 'image' },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: Layers,
    fields: [
      { key: 'title', label: 'ชื่อโปรเจกต์', type: 'text', listTitle: true, required: true },
      { key: 'category', label: 'หมวด (badge บนการ์ด เช่น CYBERSECURITY)', type: 'text' },
      { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
      { key: 'tech_stack', label: 'Tech stack (บรรทัดละ 1 อัน)', type: 'textarea', placeholder: 'Python\nFastAPI' },
      { key: 'repo_url', label: 'ลิงก์ GitHub Repo', type: 'text', placeholder: 'https://github.com/...' },
      { key: 'live_url', label: 'ลิงก์เว็บที่ใช้งานจริง (Live)', type: 'text', placeholder: 'https://...' },
      { key: 'detail_url', label: 'ลิงก์หน้ารายละเอียด', type: 'text', placeholder: 'https://...' },
      { key: 'file', label: 'รูปปกโปรเจกต์', type: 'image' },
    ],
  },
  {
    key: 'experiences',
    label: 'Experience',
    icon: Briefcase,
    fields: [
      { key: 'organization', label: 'ชื่อองค์กร (อังกฤษ)', type: 'text', listTitle: true, required: true },
      { key: 'organization_th', label: 'ชื่อองค์กร (ไทย)', type: 'text' },
      { key: 'title', label: 'ตำแหน่งงาน', type: 'text', listSubtitle: true, required: true },
      { key: 'tag', label: 'ป้ายกำกับ (เช่น Enterprise IT)', type: 'text' },
      { key: 'address', label: 'ที่อยู่', type: 'textarea' },
      { key: 'description', label: 'คำอธิบายงาน', type: 'textarea' },
      { key: 'points', label: 'รายละเอียดงาน (บรรทัดละ 1 ข้อ)', type: 'textarea' },
      { key: 'file', label: 'โลโก้องค์กร', type: 'image' },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    icon: GraduationCap,
    fields: [
      { key: 'institution', label: 'ชื่อสถาบัน', type: 'text', listTitle: true, required: true },
      { key: 'degree', label: 'วุฒิการศึกษา / สาขา', type: 'text', listSubtitle: true, required: true },
      { key: 'period', label: 'ช่วงเวลา (เช่น 2023 — 2026)', type: 'text' },
      { key: 'gpa', label: 'GPA', type: 'text' },
      { key: 'is_current', label: 'กำลังศึกษาอยู่', type: 'checkbox' },
      { key: 'file', label: 'โลโก้สถาบัน', type: 'image' },
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    icon: Code2,
    fields: [
      { key: 'category_id', label: 'หมวดหมู่', type: 'select', required: true },
      { key: 'name', label: 'ชื่อทักษะ', type: 'text', listTitle: true, required: true },
      { key: 'icon_url', label: 'ไอคอน (URL)', type: 'text', listSubtitle: true, placeholder: 'https://cdn...' },
    ],
  },
  {
    key: 'social_links',
    label: 'Social Links',
    icon: Link2,
    fields: [
      { key: 'platform', label: 'แพลตฟอร์ม (slug เช่น github)', type: 'text', listTitle: true, required: true },
      { key: 'label', label: 'ชื่อแสดงผล', type: 'text', required: true },
      { key: 'url', label: 'ลิงก์', type: 'text', listSubtitle: true, required: true },
      { key: 'color', label: 'สี (hex ไม่มี #)', type: 'text', placeholder: '181717' },
    ],
  },
];

const SITE_CONTENT_FIELDS: { key: string; label: string; type: 'text' | 'textarea' | 'image' }[] = [
  { key: 'hero_name', label: 'ชื่อหน้าแรก', type: 'text' },
  { key: 'hero_badge', label: 'ข้อความป้ายสถานะ (Available badge)', type: 'text' },
  { key: 'hero_typed_text', label: 'ข้อความ typewriter หน้าแรก', type: 'textarea' },
  { key: 'about_full_name', label: 'ชื่อเต็ม (หน้า About)', type: 'text' },
  { key: 'about_nickname', label: 'ชื่อเล่น', type: 'text' },
  { key: 'about_nationality', label: 'สัญชาติ', type: 'text' },
  { key: 'about_location', label: 'ที่อยู่ปัจจุบัน', type: 'text' },
  { key: 'about_languages', label: 'ภาษา (คั่นด้วยลูกน้ำ)', type: 'text' },
  { key: 'about_photo', label: 'รูปโปรไฟล์ (หน้า About)', type: 'image' },
  { key: 'contact_email', label: 'อีเมลติดต่อ', type: 'text' },
];

function rowTitle(row: Row, spec: CollectionSpec): string {
  const f = spec.fields.find((x) => x.listTitle);
  return String(row[f?.key ?? 'id'] ?? '');
}

function rowSubtitle(row: Row, spec: CollectionSpec): string {
  const f = spec.fields.find((x) => x.listSubtitle);
  if (!f) return '';
  const v = row[f.key];
  if (Array.isArray(v)) return v.join(', ');
  return String(v ?? '');
}

export default function DashboardClient({ data }: { data: Record<string, Row[] | Record<string, string>> }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>('content');
  const [editing, setEditing] = useState<{ table: string; row: Row | null } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const categories = data.skill_categories as Row[];

  const tabs = useMemo(
    () => [
      { key: 'content', label: 'ข้อความหลัก', icon: FileText },
      ...COLLECTIONS.map((c) => ({ key: c.key, label: c.label, icon: c.icon })),
      { key: 'otp', label: 'จัดการ OTP', icon: ShieldCheck },
    ],
    []
  );

  function notify(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(table: string, id: string, title: string) {
    if (!confirm(`ลบ "${title}" หรือไม่? การลบไม่สามารถย้อนกลับได้`)) return;
    const res = await deleteRow(table, id);
    if (res.ok) {
      notify('ลบสำเร็จ', true);
      router.refresh();
    } else {
      notify(res.error ?? 'ลบไม่สำเร็จ', false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push('/dashboard/login');
  }

  async function handleResetOtp() {
    if (!confirm('รีเซ็ต OTP? ต้องสแกน QR ใหม่อีกครั้ง (แนะนำให้ลบรายการเก่าในแอป Authenticator ทิ้งก่อน)')) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: factorList } = await supabase.auth.mfa.listFactors();
      const verified = factorList?.totp?.find((f) => f.status === 'verified');
      if (verified) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: verified.id });
        if (error) throw error;
      }
      router.push('/dashboard/setup');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'รีเซ็ตไม่สำเร็จ', false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#eaeaea]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <a href="/" className="p-1.5 rounded-lg hover:bg-[#f2f2f2] text-[#666]" title="กลับหน้าเว็บ">
              <ChevronLeft className="w-4 h-4" />
            </a>
            <h1 className="text-sm font-bold text-[#171717] truncate">Dashboard จัดการ Portfolio</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleResetOtp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#666] hover:text-[#171717] hover:bg-[#f2f2f2] transition-colors"
              title="ล้าง OTP ปัจจุบันแล้วสแกน QR ใหม่"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รีเซ็ต OTP</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#666] hover:text-[#171717] hover:bg-[#f2f2f2] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-px">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setEditing(null); }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  tab === key
                    ? 'border-emerald-500 text-[#171717]'
                    : 'border-transparent text-[#999] hover:text-[#171717]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {tab === 'otp' ? (
          <OtpManager onToast={notify} />
        ) : tab === 'content' ? (
          <SiteContentEditor
            content={data.site_content as Record<string, string>}
            onSaved={(ok, msg) => { notify(msg, ok); if (ok) router.refresh(); }}
          />
        ) : (
          (() => {
            const spec = COLLECTIONS.find((c) => c.key === tab)!;
            const rows = (data[tab] as Row[]) ?? [];
            if (editing?.table === tab) {
              return (
                <RowEditor
                  spec={spec}
                  row={editing.row}
                  categories={categories}
                  onCancel={() => setEditing(null)}
                  onSaved={(ok, msg) => {
                    notify(msg, ok);
                    if (ok) { setEditing(null); router.refresh(); }
                  }}
                />
              );
            }
            return (
              <div className="space-y-3">
                <button
                  onClick={() => setEditing({ table: tab, row: null })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#cccccc] text-sm font-semibold text-[#555] hover:border-[#171717] hover:text-[#171717] bg-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม{spec.label}ใหม่
                </button>

                {rows.map((row) => (
                  <div key={String(row.id)} className="rounded-xl border border-[#eaeaea] bg-white p-4 flex items-center gap-3 hover:border-[#cccccc] transition-colors">
                    {typeof row.image_url === 'string' && row.image_url ? (
                      <img src={(row.image_url as string).replace('.webp', '-thumb.webp')} alt="" className="w-14 h-10 rounded-md object-cover border border-[#eaeaea] shrink-0" />
                    ) : typeof row.logo_url === 'string' && row.logo_url ? (
                      <img src={row.logo_url as string} alt="" className="w-10 h-10 rounded-md object-contain border border-[#eaeaea] shrink-0" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#171717] truncate">{rowTitle(row, spec)}</p>
                      {rowSubtitle(row, spec) && (
                        <p className="text-xs text-[#888] truncate">{rowSubtitle(row, spec)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditing({ table: tab, row })} className="p-2 rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717]" title="แก้ไข">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(tab, String(row.id), rowTitle(row, spec))} className="p-2 rounded-lg text-[#666] hover:bg-red-50 hover:text-red-600" title="ลบ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {rows.length === 0 && (
                  <p className="text-center text-xs text-[#aaa] py-10">ยังไม่มีข้อมูล — กดปุ่มด้านบนเพื่อเพิ่ม</p>
                )}
              </div>
            );
          })()
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg border ${
          toast.ok ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-700'
        }`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ---------- ตัวแก้ไข 1 แถวข้อมูล ---------- */

function RowEditor({
  spec, row, categories, onCancel, onSaved,
}: {
  spec: CollectionSpec;
  row: Row | null;
  categories: Row[];
  onCancel: () => void;
  onSaved: (ok: boolean, msg: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (row) fd.set('id', String(row.id));
    setError(null);
    startTransition(async () => {
      const res = await saveRow(spec.key, fd);
      onSaved(res.ok, res.ok ? 'บันทึกสำเร็จ — เว็บอัปเดตแล้ว' : (res.error ?? 'บันทึกไม่สำเร็จ'));
      if (!res.ok) setError(res.error ?? 'บันทึกไม่สำเร็จ');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#171717]">
          {row ? 'แก้ไข' : 'เพิ่ม'}{spec.label}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg text-[#666] hover:bg-[#f2f2f2]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
      )}

      <div className="rounded-xl border border-[#eaeaea] bg-white p-4 sm:p-5 space-y-4">
        {spec.fields.map((field) => {
          const current = row?.[field.key];
          const defaultValue = Array.isArray(current) ? current.join('\n') : current ?? '';

          if (field.type === 'image') {
            const url = (row?.image_url ?? row?.logo_url) as string | undefined;
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666]">{field.label}</label>
                {url && <img src={url} alt="" className="w-full max-w-[240px] rounded-lg border border-[#eaeaea]" />}
                <input type="file" name={field.key} accept="image/*" className="text-xs text-[#555] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[#f2f2f2] file:text-xs file:font-semibold" />
                <p className="text-[11px] text-[#aaa]">รูปจะถูกบีบอัดเป็น WebP อัตโนมัติ (เต็ม 1600px + thumb 480px)</p>
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <label key={field.key} className="flex items-center gap-2.5 cursor-pointer">
                <input type="hidden" name={`__checkbox_${field.key}`} value="1" />
                <input type="checkbox" name={field.key} defaultChecked={Boolean(current)} className="w-4 h-4 accent-[#171717]" />
                <span className="text-xs font-semibold text-[#666]">{field.label}</span>
              </label>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666]">{field.label}</label>
                <select name={field.key} defaultValue={String(current ?? '')} required className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm bg-white focus:outline-none focus:border-[#171717]">
                  <option value="">— เลือก —</option>
                  {categories.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-semibold text-[#666]">{field.label}</label>
                <textarea
                  name={field.key}
                  defaultValue={String(defaultValue)}
                  rows={field.key === 'description' || field.key === 'address' ? 3 : 4}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:border-[#171717]"
                />
              </div>
            );
          }

          return (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-semibold text-[#666]">{field.label}</label>
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                name={field.key}
                defaultValue={String(defaultValue)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:border-[#171717]"
              />
              {field.hint && <p className="text-[11px] text-[#aaa]">{field.hint}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          บันทึก
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-3 rounded-xl border border-[#e0e0e0] text-sm font-semibold text-[#666] hover:bg-white transition-colors">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

/* ---------- ตัวแก้ไขข้อความหลัก (site_content) ---------- */

function SiteContentEditor({
  content, onSaved,
}: {
  content: Record<string, string>;
  onSaved: (ok: boolean, msg: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(content);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(key: string, file: File) {
    setUploadingKey(key);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await uploadImage(fd);
      setValues((v) => ({ ...v, [key]: res.full }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploadingKey(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveSiteContent(values);
      onSaved(res.ok, res.ok ? 'บันทึกสำเร็จ — เว็บอัปเดตแล้ว' : (res.error ?? 'บันทึกไม่สำเร็จ'));
      if (!res.ok) setError(res.error ?? 'บันทึกไม่สำเร็จ');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-sm font-bold text-[#171717]">ข้อความหลักของเว็บ</h2>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

      <div className="rounded-xl border border-[#eaeaea] bg-white p-4 sm:p-5 space-y-4">
        {SITE_CONTENT_FIELDS.map(({ key, label, type }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-semibold text-[#666]">{label}</label>
            {type === 'image' ? (
              <div className="space-y-2">
                {values[key] && <img src={values[key]} alt="" className="w-28 h-28 rounded-lg border border-[#eaeaea] object-cover" />}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUpload(key, e.target.files[0])}
                    className="text-xs text-[#555] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[#f2f2f2] file:text-xs file:font-semibold"
                  />
                  {uploadingKey === key && <Loader2 className="w-4 h-4 animate-spin text-[#999]" />}
                </div>
                <input
                  type="text"
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] text-xs text-[#888]"
                  placeholder="URL รูป (อัปโหลดแล้วจะเติมให้อัตโนมัติ)"
                />
              </div>
            ) : type === 'textarea' ? (
              <textarea
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:border-[#171717]"
              />
            ) : (
              <input
                type="text"
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:border-[#171717]"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        บันทึกข้อความทั้งหมด
      </button>
    </form>
  );
}


/* ---------- จัดการ OTP (เปิด/ปิด/เปลี่ยน) ---------- */

function OtpManager({ onToast }: { onToast: (msg: string, ok: boolean) => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'on' | 'off'>('loading');
  const [busy, setBusy] = useState(false);

  async function refreshStatus() {
    const supabase = createSupabaseBrowserClient();
    const { data: factorList } = await supabase.auth.mfa.listFactors();
    const verified = factorList?.totp?.some((f) => f.status === 'verified');
    setStatus(verified ? 'on' : 'off');
  }

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function disableOtp() {
    if (!confirm('ปิดใช้งาน OTP? ครั้งถัดไปจะเข้า Dashboard ด้วย Google/Facebook อย่างเดียว')) return;
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: factorList } = await supabase.auth.mfa.listFactors();
      const all = factorList?.totp ?? [];
      for (const f of all) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      onToast('ปิดใช้งาน OTP แล้ว', true);
      await refreshStatus();
    } catch {
      onToast('ปิดไม่สำเร็จ', false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-[#171717]">จัดการ OTP (2FA)</h2>

      <div className="rounded-xl border border-[#eaeaea] bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'on' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f2f2f2] text-[#999]'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#171717]">
              {status === 'loading' ? 'กำลังตรวจสอบ...' : status === 'on' ? 'OTP เปิดใช้งานอยู่' : 'OTP ยังไม่เปิดใช้งาน'}
            </p>
            <p className="text-xs text-[#888]">
              {status === 'on'
                ? 'ทุกครั้งที่ล็อกอินเข้า Dashboard ต้องใส่รหัส 6 หลักจากแอป Authenticator'
                : 'ล็อกอินด้วย Google/Facebook แล้วเข้าได้เลย ไม่ต้องใส่รหัสเพิ่ม'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#f0f0f0]">
          {status === 'off' ? (
            <button
              onClick={() => router.push('/dashboard/setup')}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              เริ่มใช้ OTP (สแกน QR)
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/dashboard/setup?force=1')}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                เปลี่ยน OTP ใหม่
              </button>
              <button
                onClick={disableOtp}
                disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                ปิดใช้งาน OTP
              </button>
            </>
          )}
        </div>

        <p className="text-[11px] text-[#aaa] leading-relaxed">
          เปลี่ยน/เริ่มใช้ OTP: ลบรายการเก่าในแอป Authenticator ก่อน แล้วกดปุ่มด้านบน สแกน QR ใหม่ และใส่รหัสยืนยัน — ป้ายชื่อจะเป็น "Suchakree-portfolio-Dashboard"
        </p>
      </div>
    </div>
  );
}
