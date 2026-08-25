'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDown, ArrowUp, ArrowUpDown, Award, Briefcase, Check, ChevronDown, ChevronLeft,
  Cloud, Code2, Cpu, Database, ExternalLink, FolderTree, GraduationCap, GripVertical, Layers, Link2,
  Loader2, LogOut, Mail, Menu, Home, Monitor, Pencil, Plus, RotateCcw, Settings,
  ShieldCheck, Sparkles, Trash2, Trophy, Upload, UserPlus, User, X,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { addAuthorizedUser, deleteRow, removeAuthorizedUser, reorderRows, saveRow, saveSiteContent, signOut, uploadImage, uploadResume } from './actions';

type Row = Record<string, unknown>;

interface FieldSpec {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'tags' | 'image' | 'checkbox' | 'select' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
  cropAspect?: number;
  iconPreview?: boolean; // ช่อง slug โซเชียล: แสดงตัวอย่างไอคอนจริงใต้ช่องกรอก
  listTitle?: boolean; // ใช้เป็นชื่อการ์ดในลิสต์
  listSubtitle?: boolean; // ใช้เป็นบรรทัดรองในลิสต์
}

interface CollectionSpec {
  key: string;
  label: string;
  shortLabel?: string; // ชื่อย่อสำหรับหัวข้อในคอลัมน์แคบ (มือถือ)
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldSpec[];
  collapsible?: boolean; // บล็อกรอง เก็บ/ขยายได้
  reorderable?: boolean; // มีโหมดจัดเรียงขึ้น/ลง
  subtitleFn?: (row: Row, categories: Row[]) => string;
}

interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'tags';
  placeholder?: string; // แสดงค่าเริ่มต้นของเว็บตอนยังไม่ได้กรอก
  cropAspect?: number;  // ถ้ากำหนด: เลือกรูปแล้วต้องครอปตามอัตราส่วนนี้ก่อนอัปโหลด
}

interface SectionDef {
  key: string;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  contentTitle?: string;
  contentFields?: ContentField[];
  collections?: CollectionSpec[];
}

/* ---------- spec ของแต่ละคอลเลกชัน (ตารางใน DB) ---------- */

const EDUCATION_SPEC: CollectionSpec = {
  key: 'education',
  label: 'การศึกษา',
  description: 'แสดงผลเป็นไทม์ไลน์ในหน้า About',
  icon: GraduationCap,
  reorderable: true,
  fields: [
    { key: 'institution', label: 'ชื่อสถาบัน', type: 'text', listTitle: true, required: true },
    { key: 'degree', label: 'วุฒิการศึกษา / สาขา', type: 'text', listSubtitle: true, required: true },
    { key: 'period', label: 'ช่วงเวลา (เช่น 2023 — 2026)', type: 'text' },
    { key: 'is_current', label: 'กำลังศึกษาอยู่', type: 'checkbox' },
    { key: 'file', label: 'โลโก้สถาบัน', type: 'image' },
  ],
};

/** ใช้กับหน้าจอแก้ไข skill ย่อย (หมวดหมู่กำหนดตามกลุ่มที่กดเพิ่ม หรือแก้ย้ายกลุ่มได้) */
const SKILL_SPEC: CollectionSpec = {
  key: 'skills',
  label: 'Skill',
  icon: Code2,
  fields: [
    { key: 'category_id', label: 'หมวดหมู่', type: 'select', required: true },
    { key: 'name', label: 'ชื่อทักษะ', type: 'text', listTitle: true, required: true },
    { key: 'icon_url', label: 'ไอคอน (URL)', type: 'text', listSubtitle: true, placeholder: 'https://cdn...' },
  ],
};

/** ไอคอนหมวดหมู่ skills (ตรงกับที่หน้าเว็บใช้) */
const CAT_ICON_NAMES = { Monitor, Code2, Database, Cloud, Sparkles, Cpu } as const;
function catIcon(name: unknown): React.ComponentType<{ className?: string }> {
  const key = String(name ?? '') as keyof typeof CAT_ICON_NAMES;
  return CAT_ICON_NAMES[key] ?? Code2;
}

const EXPERIENCES_SPEC: CollectionSpec = {
  key: 'experiences',
  label: 'ประสบการณ์',
  icon: Briefcase,
  reorderable: true,
  fields: [
    { key: 'organization', label: 'ชื่อองค์กร (อังกฤษ)', type: 'text', listTitle: true, required: true },
    { key: 'organization_th', label: 'ชื่อองค์กร (ไทย)', type: 'text' },
    { key: 'title', label: 'ตำแหน่งงาน', type: 'text', listSubtitle: true, required: true },
    { key: 'address', label: 'ที่อยู่', type: 'textarea' },
    { key: 'file', label: 'โลโก้องค์กร', type: 'image' },
  ],
};

const PROJECTS_SPEC: CollectionSpec = {
  key: 'projects',
  label: 'โปรเจกต์',
  icon: Layers,
  reorderable: true,
  fields: [
    { key: 'title', label: 'ชื่อโปรเจกต์', type: 'text', listTitle: true, required: true },
    { key: 'category', label: 'ประเภทโปรเจกต์ (Tag)', type: 'tags', placeholder: 'เช่น Web App, Cybersecurity' },
    { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
    { key: 'live_url', label: 'ลิงก์ปุ่ม Visit (ปุ่มดำมุมขวาล่างของการ์ด)', type: 'text', placeholder: 'https://...' },
    { key: 'repo_url', label: 'ลิงก์ GitHub', type: 'text', placeholder: 'https://github.com/...' },
    { key: 'show_visit', label: 'แสดงปุ่ม Visit Project', type: 'checkbox' },
    { key: 'show_github', label: 'แสดงปุ่ม GitHub', type: 'checkbox' },
    { key: 'file', label: 'รูปปกโปรเจกต์ — ครอปเป็น 16:10 ก่อนอัปโหลด', type: 'image', cropAspect: 16 / 10 },
  ],
};

const CERTIFICATES_SPEC: CollectionSpec = {
  key: 'certificates',
  label: 'ใบรับรอง (Certificates)',
  shortLabel: 'ใบรับรอง',
  icon: Trophy,
  reorderable: true,
  fields: [
    { key: 'title', label: 'ชื่อใบรับรอง', type: 'text', listTitle: true, required: true },
    { key: 'issuer', label: 'หน่วยงานที่ออก', type: 'text', listSubtitle: true, required: true },
    { key: 'year', label: 'ปี (เช่น 2025)', type: 'text' },
    { key: 'detail_url', label: 'ลิงก์รายละเอียด (ซ่อนในปุ่ม "ดูรายละเอียด")', type: 'text', placeholder: 'https://...' },
    { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
    { key: 'featured', label: 'Featured — แสดงป้ายรายการเด่น', type: 'checkbox' },
    { key: 'file', label: 'รูปใบรับรอง', type: 'image' },
  ],
};

const ACTIVITIES_SPEC: CollectionSpec = {
  key: 'activities',
  label: 'กิจกรรม (Activities)',
  shortLabel: 'กิจกรรม',
  icon: Award,
  reorderable: true,
  fields: [
    { key: 'title', label: 'ชื่อกิจกรรม', type: 'text', listTitle: true, required: true },
    { key: 'organizer', label: 'ผู้จัด', type: 'text', listSubtitle: true, required: true },
    { key: 'year', label: 'ปี', type: 'text' },
    { key: 'role', label: 'บทบาท', type: 'text' },
    { key: 'detail_url', label: 'ลิงก์รายละเอียด', type: 'text', placeholder: 'https://...' },
    { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
    { key: 'featured', label: 'Featured — แสดงป้ายรายการเด่น', type: 'checkbox' },
    { key: 'file', label: 'รูปกิจกรรม', type: 'image' },
  ],
};

const SOCIAL_SPEC: CollectionSpec = {
  key: 'social_links',
  label: 'ช่องทางโซเชียล',
  description: 'แสดงเป็นไอคอนวงกลมในหน้าแรกและหน้า Contact',
  icon: Link2,
  reorderable: true,
  fields: [
    { key: 'platform', label: 'ไอคอน — slug แพลตฟอร์ม (เช่น github, linkedin, facebook)', type: 'text', listTitle: true, required: true, iconPreview: true },
    { key: 'label', label: 'ชื่อแสดงผล', type: 'text', required: true },
    { key: 'url', label: 'ลิงก์', type: 'text', listSubtitle: true, required: true },
    { key: 'color', label: 'สี (hex ไม่มี #)', type: 'text', placeholder: '181717' },
  ],
};

/* ---------- จัดกลุ่มตามหน้าเว็บจริง ---------- */

const SECTIONS: SectionDef[] = [
  {
    key: 'home',
    label: 'หน้าแรก',
    short: 'หน้าแรก',
    icon: Home,
    contentTitle: 'ข้อมูลหน้าแรก',
    contentFields: [
      { key: 'hero_typed_text', label: 'คำบรรยายใต้ชื่อ', type: 'textarea', placeholder: 'Bachelor of Engineering student in Computer Engineering at Rajamangala University of Technology Lanna.' },
      { key: 'hero_photo', label: 'รูปโปรไฟล์หน้าแรก — เลือกรูปแล้วครอปได้ก่อนอัปโหลด', type: 'image', cropAspect: 4 / 5 },
    ],
    collections: [SOCIAL_SPEC],
  },
  {
    key: 'about',
    label: 'About',
    short: 'About',
    icon: User,
    contentTitle: 'ข้อมูลส่วนตัว',
    contentFields: [
      { key: 'about_languages', label: 'ภาษา', type: 'tags' },
      { key: 'about_location', label: 'ที่อยู่ปัจจุบัน', type: 'text' },
      { key: 'about_interests', label: 'สิ่งที่สนใจ (บรรทัดละ 1 ข้อ)', type: 'textarea' },
      { key: 'about_photo', label: 'รูปโปรไฟล์ About — เลือกรูปแล้วครอปได้ก่อนอัปโหลด', type: 'image', cropAspect: 1 },
    ],
    collections: [EDUCATION_SPEC],
  },
  {
    key: 'skills',
    label: 'Skills',
    short: 'Skills',
    icon: Code2,
  },
  {
    key: 'experience',
    label: 'Experience',
    short: 'Exp.',
    icon: Briefcase,
    collections: [EXPERIENCES_SPEC],
  },
  {
    key: 'projects',
    label: 'Projects',
    short: 'Projects',
    icon: Layers,
    collections: [PROJECTS_SPEC],
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    short: 'Portfolio',
    icon: Trophy,
    collections: [CERTIFICATES_SPEC, ACTIVITIES_SPEC],
  },
  {
    key: 'contact',
    label: 'Contact',
    short: 'Contact',
    icon: Mail,
    collections: [SOCIAL_SPEC],
  },
  {
    key: 'settings',
    label: 'OTP',
    short: 'OTP',
    icon: Settings,
  },
];

/* ---------- แท็บหลักของแถบล่างมือถือ + ที่เหลืออยู่ใน "เพิ่มเติม" ---------- */

const BOTTOM_NAV_KEYS = ['home', 'about', 'skills', 'projects'];
const MORE_NAV_KEYS = ['experience', 'portfolio', 'contact', 'settings'];

function rowTitle(row: Row, spec: CollectionSpec): string {
  const f = spec.fields.find((x) => x.listTitle);
  return String(row[f?.key ?? 'id'] ?? '');
}

function rowSubtitle(row: Row, spec: CollectionSpec, categories: Row[]): string {
  if (spec.subtitleFn) return spec.subtitleFn(row, categories);
  const f = spec.fields.find((x) => x.listSubtitle);
  if (!f) return '';
  const v = row[f.key];
  if (Array.isArray(v)) return v.join(', ');
  return String(v ?? '');
}

export default function DashboardClient({ data }: { data: Record<string, unknown> }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>('home');
  const [editing, setEditing] = useState<{ table: string; row: Row | null; preset?: Record<string, string> } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const categories = data.skill_categories as Row[];
  const content = data.site_content as Record<string, string>;
  const section = SECTIONS.find((s) => s.key === tab) ?? SECTIONS[0];

  function switchTab(key: string) {
    setTab(key);
    setEditing(null);
    setMoreOpen(false);
  }

  function notify(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function handleRowSaved(ok: boolean, msg: string) {
    notify(msg, ok);
    if (ok) {
      setEditing(null);
      router.refresh();
    }
  }

  function handleContentSaved(ok: boolean, msg: string) {
    notify(msg, ok);
    if (ok) router.refresh();
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
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.push('/dashboard/login');
    } catch {
      setSigningOut(false);
      notify('ออกจากระบบไม่สำเร็จ', false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#eaeaea]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <a href="/" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f2f2f2] text-[#666]" title="กลับหน้าเว็บ">
              <ChevronLeft className="w-4 h-4" />
            </a>
            <h1 className="text-base font-bold text-[#171717] truncate">Dashboard</h1>
            <span className="lg:hidden text-sm font-semibold text-[#666] truncate">· {section.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              title="เปิดหน้าเว็บจริงแท็บใหม่"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717]"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold text-[#666] hover:text-[#171717] hover:bg-[#f2f2f2] disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              {signingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{signingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}</span>
            </button>
          </div>
        </div>
        {/* Tab bar — เดสก์ท็อปเท่านั้น (มือถือใช้แถบล่าง) */}
        <div className="hidden lg:block max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-nowrap justify-between gap-0.5 pb-px overflow-x-auto no-scrollbar">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex items-center gap-1 px-2.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  tab === key
                    ? 'border-emerald-500 text-[#171717]'
                    : 'border-transparent text-[#666] hover:text-[#171717]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* แท็บ Portfolio ใช้พื้นที่กว้างกว่าเพื่อวาง 2 คอลัมน์ขนานกัน */}
      <main className={`mx-auto px-4 sm:px-6 py-5 pb-32 lg:pb-10 ${tab === 'portfolio' ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {tab === 'settings' ? (
          <div className="space-y-6">
            <OtpManager onToast={notify} />
            <AuthorizedUsersManager
              emails={(data.authorized_users as string[]) ?? []}
              tableError={(data.authorized_users_error as string) ?? null}
              currentEmail={(data.current_email as string) ?? ''}
              onToast={notify}
            />
          </div>
        ) : (
          <>
            {tab === 'home' && <ResumeUploader currentUrl={content.resume_url} onToast={notify} />}
            <SectionBody
              key={section.key}
              section={section}
              data={data}
              content={content}
              categories={categories}
              editing={editing}
              onEdit={(table, row, preset) => setEditing(row === null && table === editing?.table ? null : { table, row, preset })}
              onRowSaved={handleRowSaved}
              onContentSaved={handleContentSaved}
              onDelete={handleDelete}
              onToast={notify}
            />
          </>
        )}
      </main>

      {/* แถบนำทางล่าง (มือถือ) — สไตล์แอปจริง */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#eaeaea] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {BOTTOM_NAV_KEYS.map((key) => {
            const s = SECTIONS.find((x) => x.key === key)!;
            const Icon = s.icon;
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex flex-col items-center justify-center gap-0.5 pt-2 pb-2 min-h-[56px] transition-colors ${active ? 'text-emerald-600' : 'text-[#666]'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold leading-none">{s.short}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 pt-2 pb-2 min-h-[56px] transition-colors ${moreOpen || MORE_NAV_KEYS.includes(tab) ? 'text-emerald-600' : 'text-[#666]'}`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-semibold leading-none">เพิ่มเติม</span>
          </button>
        </div>
      </nav>

      {/* Sheet "เพิ่มเติม" (มือถือ) */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setMoreOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
            <div className="pt-3 flex justify-center">
              <span className="w-10 h-1 rounded-full bg-[#e0e0e0]" />
            </div>
            <p className="px-5 pt-3 pb-2 text-xs font-bold text-[#666] uppercase tracking-wider">ส่วนอื่นๆ</p>
            <div className="grid grid-cols-2 gap-2 p-4 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {MORE_NAV_KEYS.map((key) => {
                const s = SECTIONS.find((x) => x.key === key)!;
                const Icon = s.icon;
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => switchTab(key)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
                      active
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-[#eaeaea] bg-white text-[#171717] active:bg-[#f5f5f5]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-semibold">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg border max-w-[92vw] ${
          toast.ok ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-700'
        }`}>
          {toast.ok ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
          <span className="truncate">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

function fileNameFromUrl(url?: string) {
  if (!url) return '';
  try {
    const path = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(path.split('/').pop() ?? '');
  } catch {
    return url.split('/').pop()?.split('?')[0] ?? '';
  }
}

function isPdfUrl(url?: string) {
  return Boolean(url?.toLowerCase().split('?')[0].endsWith('.pdf'));
}

function ResumeUploader({ currentUrl, onToast }: { currentUrl?: string; onToast: (msg: string, ok: boolean) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const result = await uploadResume(formData);
      onToast('อัปโหลด Resume สำเร็จ — เว็บอัปเดตแล้ว', true);
      window.location.reload();
      void result;
    } catch (error: unknown) {
      onToast(error instanceof Error ? error.message : 'อัปโหลด Resume ไม่สำเร็จ', false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-2.5">
      <h2 className="text-sm font-bold text-[#171717]">Resume</h2>
      <div className="rounded-xl border border-[#eaeaea] bg-white p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f2f2f2] text-[#171717] flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#171717]">อัปโหลด Resume</p>
            <p className="text-xs text-[#666] truncate">{currentUrl ? `ไฟล์ที่ใช้งานอยู่: ${fileNameFromUrl(currentUrl)}` : 'ยังไม่มี Resume บนเว็บไซต์'}</p>
          </div>
          {currentUrl && (
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#666] hover:text-[#171717] shrink-0">
              ดูไฟล์
            </a>
          )}
        </div>
        <label className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#171717] text-white text-sm font-semibold cursor-pointer hover:bg-black transition-colors">
          <Upload className="w-4 h-4" />
          {uploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ PDF'}
          <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleChange} disabled={uploading} />
        </label>
        <p className="text-xs text-[#666]">รองรับไฟล์ PDF ขนาดไม่เกิน 15MB และปุ่ม Download Resume จะใช้ไฟล์ล่าสุด</p>
      </div>
    </section>
  );
}

/* ---------- เนื้อหาของแต่ละ section ---------- */

function SectionBody({
  section, data, content, categories, editing, onEdit, onRowSaved, onContentSaved, onDelete, onToast,
}: {
  section: SectionDef;
  data: Record<string, unknown>;
  content: Record<string, string>;
  categories: Row[];
  editing: { table: string; row: Row | null; preset?: Record<string, string> } | null;
  onEdit: (table: string, row: Row | null, preset?: Record<string, string>) => void;
  onRowSaved: (ok: boolean, msg: string) => void;
  onContentSaved: (ok: boolean, msg: string) => void;
  onDelete: (table: string, id: string, title: string) => void;
  onToast: (msg: string, ok: boolean) => void;
}) {
  const editingSpec = editing ? section.collections?.find((c) => c.key === editing.table) : undefined;

  // Skills: จัดกลุ่มตามหมวดหมู่ แก้ไข/เพิ่ม/ลบได้เฉพาะ skill ย่อย (หมวดหมู่คงที่)
  if (section.key === 'skills') {
    const rows = (data.skills as Row[]) ?? [];
    return (
      <div className="space-y-6">
        {editing?.table === 'skills' ? (
          <RowEditor
            spec={SKILL_SPEC}
            row={editing.row}
            presetValues={editing.preset}
            categories={categories}
            onCancel={() => onEdit('skills', null)}
            onSaved={onRowSaved}
          />
        ) : (
          <SkillsGroups rows={rows} categories={categories} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {section.contentFields && section.contentFields.length > 0 && (
        <SiteContentFields
          title={section.contentTitle ?? 'ข้อมูลหน้าแรก'}
          fields={section.contentFields}
          content={content}
          onSaved={onContentSaved}
        />
      )}

      {section.collections && section.collections.length > 1 ? (
        // หลายคอลเลกชัน (เช่น Portfolio): 2 คอลัมน์ขนานกันทุกขนาดจอ (การ์ดย่อบนมือถือ)
        // ฟอร์มแก้ไขกางเต็มความกว้างบนมือถือ (col-span-2) แล้วกลับมาอยู่คอลัมน์เดียวบนจอกว้าง
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 items-start">
          {section.collections.map((spec) => (
            editing && editingSpec?.key === spec.key ? (
              <div key={spec.key} className="col-span-2 lg:col-span-1">
                <RowEditor
                  spec={spec}
                  row={editing.row}
                  presetValues={editing.preset}
                  categories={categories}
                  onCancel={() => onEdit(spec.key, null)}
                  onSaved={onRowSaved}
                />
              </div>
            ) : (
              <CollectionBlock
                key={spec.key}
                spec={spec}
                rows={(data[spec.key] as Row[]) ?? []}
                categories={categories}
                onEdit={onEdit}
                onDelete={onDelete}
                onToast={onToast}
              />
            )
          ))}
        </div>
      ) : (
        section.collections?.map((spec) => {
          if (editing && editingSpec?.key === spec.key) {
            return (
              <RowEditor
                key={spec.key}
                spec={spec}
                row={editing.row}
                presetValues={editing.preset}
                categories={categories}
                onCancel={() => onEdit(spec.key, null)}
                onSaved={onRowSaved}
              />
            );
          }
          return (
            <CollectionBlock
              key={spec.key}
              spec={spec}
              rows={(data[spec.key] as Row[]) ?? []}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
              onToast={onToast}
            />
          );
        })
      )}
    </div>
  );
}

/* ---------- Skills แบ่งตามหมวดหมู่ (หมวดหมู่คงที่ แก้ได้เฉพาะ skill ย่อย) ---------- */

function SkillsGroups({
  rows, categories, onEdit, onDelete,
}: {
  rows: Row[];
  categories: Row[];
  onEdit: (table: string, row: Row | null, preset?: Record<string, string>) => void;
  onDelete: (table: string, id: string, title: string) => void;
}) {
  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const Icon = catIcon(cat.icon);
        const items = rows.filter((s) => String(s.category_id) === String(cat.id));
        return (
          <section key={String(cat.id)} className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-4 h-4 text-[#666] shrink-0" />
                <h3 className="text-sm font-bold text-[#171717] truncate">{String(cat.name)}</h3>
                <span className="text-[11px] font-semibold text-[#666] bg-[#f2f2f2] rounded-full px-2 py-0.5 shrink-0">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => onEdit('skills', null, { category_id: String(cat.id) })}
                className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#171717] text-white text-xs font-semibold hover:bg-black transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่ม
              </button>
            </div>

            <div className="space-y-2">
              {items.map((row) => (
                <div
                  key={String(row.id)}
                  onClick={() => onEdit('skills', row)}
                  className="cursor-pointer rounded-xl border border-[#eaeaea] bg-white p-3 flex items-center gap-3 hover:border-[#cccccc] active:border-[#171717] transition-colors"
                >
                  {typeof row.icon_url === 'string' && row.icon_url ? (
                    <img src={row.icon_url} alt="" className="w-8 h-8 rounded-md object-contain border border-[#eaeaea] shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-[#f5f5f5] shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-[#171717] truncate flex-1">{String(row.name ?? '')}</p>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit('skills', row); }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717]"
                      title="แก้ไข"
                      aria-label={`แก้ไข ${String(row.name ?? '')}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete('skills', String(row.id), String(row.name ?? '')); }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-red-50 hover:text-red-600"
                      title="ลบ"
                      aria-label={`ลบ ${String(row.name ?? '')}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <button
                  onClick={() => onEdit('skills', null, { category_id: String(cat.id) })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-dashed border-[#cccccc] text-xs font-semibold text-[#666] hover:border-[#171717] hover:text-[#171717] bg-white/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  ยังไม่มี skill ในหมวดนี้ — กดเพื่อเพิ่ม
                </button>
              )}
            </div>
          </section>
        );
      })}
      {categories.length === 0 && (
        <p className="text-sm text-[#666] py-6 text-center">ไม่พบหมวดหมู่ skills ในระบบ</p>
      )}
    </div>
  );
}

/* ---------- แถวที่ลากจัดเรียงได้ (dnd-kit): ที่จับอยู่ซ้าย การ์ดเดิมไม่ถูกแตะ ---------- */

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-1 ${isDragging ? 'relative z-30' : undefined}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="ลากเพื่อจัดเรียง"
        aria-label="ลากเพื่อจัดเรียง"
        className="w-9 h-9 mt-0.5 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717] cursor-grab active:cursor-grabbing touch-none shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ---------- ลิสต์รายการของ 1 คอลเลกชัน ---------- */

function CollectionBlock({
  spec, rows, categories, onEdit, onDelete, onToast, compact,
}: {
  spec: CollectionSpec;
  rows: Row[];
  categories: Row[];
  onEdit: (table: string, row: Row | null, preset?: Record<string, string>) => void;
  onDelete: (table: string, id: string, title: string) => void;
  onToast?: (msg: string, ok: boolean) => void;
  compact?: boolean; // คอลัมน์แคบ: การ์ดแนวตั้ง ขนาดเล็ก
}) {
  const router = useRouter();
  const [open, setOpen] = useState(!spec.collapsible);
  const [reorder, setReorder] = useState(false);
  const [orderIds, setOrderIds] = useState<string[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const Icon = spec.icon;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const shown = orderIds
    ? orderIds.map((id) => rows.find((r) => String(r.id) === id)).filter(Boolean) as Row[]
    : rows;

  function toggleReorder() {
    if (!reorder) setOrderIds(rows.map((r) => String(r.id)));
    else setOrderIds(null);
    setReorder(!reorder);
  }

  async function persistOrder(next: string[]) {
    setSavingOrder(true);
    const res = await reorderRows(spec.key, next);
    if (!res.ok) {
      onToast?.(res.error ?? 'จัดเรียงไม่สำเร็จ', false);
      setOrderIds(rows.map((r) => String(r.id)));
    } else {
      router.refresh();
    }
    setSavingOrder(false);
  }

  async function move(index: number, dir: -1 | 1) {
    if (!orderIds) return;
    const next = [...orderIds];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrderIds(next);
    await persistOrder(next);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id || !orderIds) return;
    const oldIndex = orderIds.indexOf(String(active.id));
    const newIndex = orderIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(orderIds, oldIndex, newIndex);
    setOrderIds(next);
    void persistOrder(next);
  }

  return (
    <section className="space-y-2.5">
      <div className={`flex items-center justify-between gap-2 ${compact ? 'flex-wrap' : ''}`}>
        <button
          type="button"
          onClick={spec.collapsible ? () => setOpen((o) => !o) : undefined}
          className={`flex items-center gap-1.5 min-w-0 ${spec.collapsible ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {spec.collapsible && (
            <ChevronDown className={`w-4 h-4 text-[#666] transition-transform shrink-0 ${open ? '' : '-rotate-90'}`} />
          )}
          <Icon className={`text-[#666] shrink-0 ${compact ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4'}`} />
          {compact && spec.shortLabel ? (
            <>
              <span className="sm:hidden text-xs font-bold text-[#171717] truncate">{spec.shortLabel}</span>
              <span className="hidden sm:inline text-sm font-bold text-[#171717] truncate">{spec.label}</span>
            </>
          ) : (
            <h3 className="text-sm font-bold text-[#171717] truncate">{spec.label}</h3>
          )}
          <span className="text-[11px] font-semibold text-[#666] bg-[#f2f2f2] rounded-full px-2 py-0.5 shrink-0">
            {rows.length}
          </span>
        </button>
        {open && (
          <div className="flex items-center gap-2 shrink-0">
            {spec.reorderable && rows.length > 1 && (
              <button
                onClick={toggleReorder}
                className={`h-8 px-2.5 sm:h-9 sm:px-3 inline-flex items-center gap-1 rounded-lg border text-[11px] sm:text-xs font-semibold transition-colors ${
                  reorder
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'border-[#e0e0e0] text-[#666] hover:border-[#171717] hover:text-[#171717]'
                }`}
              >
                {savingOrder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
                {reorder ? 'เสร็จ' : 'จัดเรียง'}
              </button>
            )}
            {!(compact && reorder) && (
              <button
                onClick={() => onEdit(spec.key, null)}
                className="h-8 px-3 sm:h-9 sm:px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#171717] text-white text-[11px] sm:text-xs font-semibold hover:bg-black transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่ม
              </button>
            )}
          </div>
        )}
      </div>

      {spec.description && open && (
        <p className="text-xs text-[#666] leading-relaxed">{spec.description}</p>
      )}

      {open && (() => {
        const list = (
          <div className="space-y-2">
            {shown.map((row, idx) => {
              const sub = rowSubtitle(row, spec, categories);

              // คอลัมน์แคบ: การ์ดแนวตั้ง (รูปบน-ข้อความล่าง) ขนาดกระทัดรัด
              if (compact) {
              const img = typeof row.image_url === 'string' && row.image_url ? row.image_url : null;
              const compactCard = (
                <div
                  key={String(row.id)}
                  onClick={reorder ? undefined : () => onEdit(spec.key, row)}
                  className={`overflow-hidden rounded-xl border border-[#eaeaea] bg-white transition-colors ${
                    reorder ? '' : 'cursor-pointer hover:border-[#cccccc] active:border-[#171717]'
                  }`}
                >
                  {img && (
                    isPdfUrl(img) ? (
                      <iframe
                        src={`${img}#page=1&view=FitH`}
                        title={`${rowTitle(row, spec)} preview`}
                        className="w-full aspect-[16/10] border-b border-[#eaeaea] bg-white"
                      />
                    ) : (
                      <img
                        src={img.replace('.webp', '-thumb.webp')}
                        alt=""
                        onError={(e) => { (e.target as HTMLImageElement).src = img; }}
                        className="w-full aspect-[16/10] object-cover border-b border-[#eaeaea] bg-[#f7f7f7]"
                      />
                    )
                  )}
                  <div className="p-2">
                    {reorder ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-[#999] w-4 text-center">{idx + 1}</span>
                        <div className="flex-1" />
                        <button
                          onClick={() => move(idx, -1)}
                          disabled={idx === 0 || savingOrder}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717] disabled:opacity-25"
                          title="ขึ้น" aria-label="ย้ายขึ้น"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => move(idx, 1)}
                          disabled={idx === shown.length - 1 || savingOrder}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717] disabled:opacity-25"
                          title="ลง" aria-label="ย้ายลง"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#171717] leading-snug line-clamp-2">
                          {rowTitle(row, spec)}
                        </p>
                        {sub && <p className="text-[10px] text-[#666] truncate pt-0.5">{sub}</p>}
                        <div className="flex justify-end gap-0.5 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(spec.key, row); }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717]"
                            title="แก้ไข" aria-label={`แก้ไข ${rowTitle(row, spec)}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(spec.key, String(row.id), rowTitle(row, spec)); }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#666] hover:bg-red-50 hover:text-red-600"
                            title="ลบ" aria-label={`ลบ ${rowTitle(row, spec)}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
              return reorder && orderIds ? (
                <SortableRow key={String(row.id)} id={String(row.id)}>{compactCard}</SortableRow>
              ) : compactCard;
            }

            const regularCard = (
              <div
                key={String(row.id)}
                onClick={reorder ? undefined : () => onEdit(spec.key, row)}
                className={`rounded-xl border border-[#eaeaea] bg-white p-3 flex items-center gap-3 transition-colors ${
                  reorder ? '' : 'cursor-pointer hover:border-[#cccccc] active:border-[#171717]'
                }`}
              >
                {reorder && (
                  <span className="text-xs font-bold text-[#999] w-5 text-center shrink-0">{idx + 1}</span>
                )}
                {typeof row.image_url === 'string' && row.image_url ? (
                  isPdfUrl(row.image_url as string) ? (
                    <iframe
                      src={`${row.image_url as string}#page=1&view=FitH`}
                      title={`${rowTitle(row, spec)} preview`}
                      className="h-14 w-20 shrink-0 rounded-md border border-[#eaeaea] bg-white"
                    />
                  ) : (
                    <img
                      src={(row.image_url as string).replace('.webp', '-thumb.webp')}
                      alt=""
                      onError={(e) => { (e.target as HTMLImageElement).src = row.image_url as string; }}
                      className="w-14 h-10 rounded-md object-cover border border-[#eaeaea] shrink-0"
                    />
                  )
                ) : typeof row.logo_url === 'string' && row.logo_url ? (
                  <img src={row.logo_url as string} alt="" className="w-10 h-10 rounded-md object-contain border border-[#eaeaea] shrink-0" />
                ) : typeof row.platform === 'string' && row.platform ? (
                  <span className="w-10 h-10 rounded-full border-2 border-[#d0d0d0] bg-white flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={`${SI_CDN}/${String(row.platform).toLowerCase()}.svg`}
                      alt=""
                      className="w-4 h-4 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                    />
                  </span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#171717] truncate">{rowTitle(row, spec)}</p>
                  {sub && <p className="text-xs text-[#666] truncate">{sub}</p>}
                </div>
                {reorder ? (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0 || savingOrder}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717] disabled:opacity-25 disabled:hover:bg-transparent"
                      title="ขึ้น"
                      aria-label="ย้ายขึ้น"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === shown.length - 1 || savingOrder}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717] disabled:opacity-25 disabled:hover:bg-transparent"
                      title="ลง"
                      aria-label="ย้ายลง"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(spec.key, row); }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717]"
                      title="แก้ไข"
                      aria-label={`แก้ไข ${rowTitle(row, spec)}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(spec.key, String(row.id), rowTitle(row, spec)); }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-red-50 hover:text-red-600"
                      title="ลบ"
                      aria-label={`ลบ ${rowTitle(row, spec)}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              );
              return reorder && orderIds ? (
                <SortableRow key={String(row.id)} id={String(row.id)}>{regularCard}</SortableRow>
              ) : regularCard;
            })}

          {rows.length === 0 && (
            <button
              onClick={() => onEdit(spec.key, null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-5 rounded-xl border border-dashed border-[#cccccc] text-sm font-semibold text-[#666] hover:border-[#171717] hover:text-[#171717] bg-white/60 transition-colors"
            >
              <Plus className="w-4 h-4" />
              ยังไม่มีข้อมูล — กดเพื่อเพิ่ม
            </button>
          )}
          </div>
        );
        // โหมดจัดเรียง: ครอบลิสต์ด้วย drag & drop (ลากที่จับด้านซ้าย)
        return reorder && orderIds ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
              {list}
            </SortableContext>
          </DndContext>
        ) : list;
      })()}
    </section>
  );
}

const SI_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons';

/* ---------- ค้นหาโลโก้ skill อัตโนมัติจากชื่อ ---------- */

function checkImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

const SLUG_ALIASES: Record<string, string[]> = {
  'c++': ['cplusplus'],
  'c#': ['csharp'],
  'node.js': ['nodejs'],
  'next.js': ['nextjs'],
  'vue.js': ['vuejs'],
  'nuxt.js': ['nuxtjs'],
  aws: ['amazonwebservices'],
  'visual studio code': ['vscode'],
  'vs code': ['vscode'],
  postgres: ['postgresql'],
  mongo: ['mongodb'],
  'kali linux': ['kalilinux'],
};

function slugCandidates(name: string): string[] {
  const n = name.trim().toLowerCase();
  if (!n) return [];
  const base = n.replace(/[^a-z0-9]/g, '');
  const list = [...(SLUG_ALIASES[n] ?? []), ...(SLUG_ALIASES[base] ?? [])];
  if (base) list.push(base);
  return Array.from(new Set(list));
}

async function resolveIconUrl(name: string): Promise<string | null> {
  for (const slug of slugCandidates(name)) {
    const simple = `https://cdn.simpleicons.org/${slug}`;
    if (await checkImage(simple)) return simple;
    const devicon = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
    if (await checkImage(devicon)) return devicon;
  }
  return null;
}

/** ช่องชื่อ skill + โลโก้ที่ค้นหาอัตโนมัติ (แก้ URL มือได้เสมอ) */
function SkillNameWithIcon({ nameDefault, iconDefault }: { nameDefault: string; iconDefault: string }) {
  const [name, setName] = useState(nameDefault);
  const [iconUrl, setIconUrl] = useState(iconDefault);
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'notfound'>('idle');
  const [touchedIcon, setTouchedIcon] = useState(false);

  useEffect(() => {
    if (touchedIcon || !name.trim()) return;
    setStatus('searching');
    const t = setTimeout(async () => {
      const found = await resolveIconUrl(name);
      if (found) {
        setIconUrl(found);
        setStatus('found');
      } else {
        setStatus('notfound');
      }
    }, 500);
    return () => clearTimeout(t);
  }, [name, touchedIcon]);

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#666]">ชื่อทักษะ (โลโก้จะหาให้อัตโนมัติ)</label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#666]">โลโก้ (URL)</label>
        <div className="flex items-start gap-2.5 rounded-lg border border-[#eaeaea] bg-[#fafafa] px-3 py-2.5">
          <span className="w-9 h-9 rounded-md bg-white border border-[#eaeaea] flex items-center justify-center shrink-0 overflow-hidden">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt=""
                className="w-6 h-6 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
              />
            ) : null}
          </span>
          <p className="text-xs text-[#666] leading-snug pt-1.5">
            {status === 'searching' && 'กำลังค้นหาโลโก้...'}
            {status === 'found' && <span className="text-emerald-600 font-semibold">พบโลโก้อัตโนมัติแล้ว ✓</span>}
            {status === 'notfound' && 'ไม่พบโลโก้อัตโนมัติ — วาง URL รูปเองด้านล่างได้เลย'}
            {status === 'idle' && !iconUrl && 'เริ่มพิมพ์ชื่อทักษะเพื่อค้นหาโลโก้'}
            {status === 'idle' && iconUrl && 'โลโก้ปัจจุบัน'}
          </p>
        </div>
        <input
          name="icon_url"
          value={iconUrl}
          onChange={(e) => { setTouchedIcon(true); setIconUrl(e.target.value); }}
          className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] text-sm text-[#171717]"
          placeholder="URL โลโก้ (เติมอัตโนมัติ — แก้ได้)"
        />
      </div>
    </>
  );
}

/** ช่องกรอก slug โซเชียล พร้อมไอคอนตัวอย่างสดจาก simple-icons */
function SlugPreviewInput({ name, defaultValue, placeholder, required }: { name: string; defaultValue: string; placeholder?: string; required?: boolean }) {
  const [slug, setSlug] = useState(defaultValue);
  const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return (
    <div className="space-y-1.5">
      <input
        type="text"
        name={name}
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
      />
      <div className="flex items-center gap-2.5 rounded-lg border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
        <span className="w-9 h-9 rounded-full border-2 border-[#d0d0d0] bg-white flex items-center justify-center shrink-0 overflow-hidden">
          {clean ? (
            <img
              src={`${SI_CDN}/${clean}.svg`}
              alt=""
              className="w-4 h-4 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
            />
          ) : null}
        </span>
        <p className="text-xs text-[#666] leading-snug">
          {clean ? <>ไอคอนที่จะแสดงบนเว็บ — <span className="font-semibold text-[#171717]">{clean}</span></> : 'พิมพ์ slug (เช่น github) เพื่อดูตัวอย่างไอคอน'}
        </p>
      </div>
    </div>
  );
}

/* ---------- ตัวแก้ไข 1 แถวข้อมูล ---------- */

function RowEditor({
  spec, row, presetValues, categories, onCancel, onSaved,
}: {
  spec: CollectionSpec;
  row: Row | null;
  presetValues?: Record<string, string>;
  categories: Row[];
  onCancel: () => void;
  onSaved: (ok: boolean, msg: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [croppedFiles, setCroppedFiles] = useState<Record<string, File>>({});
  const [croppedPreviews, setCroppedPreviews] = useState<Record<string, string>>({});
  const [tagValues, setTagValues] = useState<Record<string, string>>(() => ({
    category: String(row?.category ?? ''),
  }));
  const [crop, setCrop] = useState<{ key: string; file: File; aspect: number } | null>(null);
  const previewUrlsRef = useRef<Record<string, string>>({});

  useEffect(() => () => {
    Object.values(previewUrlsRef.current).forEach((preview) => URL.revokeObjectURL(preview));
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (row) fd.set('id', String(row.id));
    for (const [k, v] of Object.entries(presetValues ?? {})) fd.set(k, v);
    for (const [key, file] of Object.entries(croppedFiles)) fd.set(key, file);
    setError(null);
    startTransition(async () => {
      const res = await saveRow(spec.key, fd);
      onSaved(res.ok, res.ok ? 'บันทึกสำเร็จ — เว็บอัปเดตแล้ว' : (res.error ?? 'บันทึกไม่สำเร็จ'));
      if (!res.ok) setError(res.error ?? 'บันทึกไม่สำเร็จ');
    });
  }

  async function handleFileChange(key: string, file: File, cropAspect?: number) {
    if (file.type === 'application/pdf') {
      try {
        setError(null);
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        const buffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 2.5 }); // High resolution 2.5x
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('ไม่สามารถประมวลผล Canvas ได้');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx as any, viewport }).promise;

        canvas.toBlob((blob) => {
          if (!blob) return;
          const webpFile = new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, { type: 'image/webp' });
          setCroppedFiles((files) => ({ ...files, [key]: webpFile }));
          const preview = URL.createObjectURL(webpFile);
          const prev = previewUrlsRef.current[key];
          if (prev) URL.revokeObjectURL(prev);
          previewUrlsRef.current[key] = preview;
          setCroppedPreviews((previews) => ({ ...previews, [key]: preview }));
        }, 'image/webp', 0.95);
      } catch (err: unknown) {
        setError(err instanceof Error ? `แปลง PDF ไม่สำเร็จ: ${err.message}` : 'แปลง PDF ไม่สำเร็จ');
      }
      return;
    }

    if (cropAspect) {
      setCrop({ key, file, aspect: cropAspect });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[#171717] truncate">
          {row ? 'แก้ไข' : 'เพิ่ม'}{spec.label}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#f2f2f2] hover:text-[#171717] shrink-0"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="rounded-xl border border-[#eaeaea] bg-white p-4 space-y-4">
        {spec.fields.map((field) => {
          // ฟิลด์ที่ถูกกำหนดค่าล็ว์ไว้ (เช่น หมวดหมู่ตอนเพิ่มจากในกลุ่ม) ไม่ต้องแสดง
          if (presetValues && field.key in presetValues) return null;
          // ฟอร์ม skill: ชื่อ + โลโก้รวมเป็นชุดเดียวที่หาโลโก้ให้อัตโนมัติ
          if (spec.key === 'skills' && field.key === 'name') {
            return (
              <SkillNameWithIcon
                key={field.key}
                nameDefault={String(row?.name ?? '')}
                iconDefault={String(row?.icon_url ?? '')}
              />
            );
          }
          if (spec.key === 'skills' && field.key === 'icon_url') return null;
          const current = row?.[field.key];
          const defaultValue = Array.isArray(current)
            ? current.join('\n')
            : current ?? (spec.key === 'projects' && field.key === 'live_url' && !row ? '#' : '');

          if (field.type === 'image') {
            const url = (row?.image_url ?? row?.logo_url) as string | undefined;
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-semibold text-[#666]">{field.label}</label>
                {(croppedPreviews[field.key] ?? url) && (
                  <>
                    {isPdfUrl(croppedPreviews[field.key] ?? url) ? (
                      <a href={croppedPreviews[field.key] ?? url} target="_blank" rel="noopener noreferrer" className="flex w-full max-w-[240px] items-center justify-center rounded-lg border border-[#eaeaea] bg-[#f7f7f7] p-8 text-sm font-semibold text-[#555]">เปิดไฟล์ PDF</a>
                    ) : (
                      <img src={croppedPreviews[field.key] ?? url} alt={`${field.label} ที่ใช้งานอยู่`} className="w-full max-w-[240px] rounded-lg border border-[#eaeaea]" />
                    )}
                    {url && <p className="text-xs text-[#666] truncate">ไฟล์ที่ใช้งานอยู่: {fileNameFromUrl(url)}</p>}
                  </>
                )}
                <input
                  type="file"
                  name="file"
                  accept={spec.key === 'certificates' ? 'image/*,.pdf,application/pdf' : 'image/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleFileChange(field.key, file, field.cropAspect);
                  }}
                  className="text-sm text-[#171717] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[#f2f2f2] file:text-sm file:font-semibold"
                />
                <p className="text-xs text-[#666]">{spec.key === 'certificates' ? 'รองรับไฟล์รูปภาพและ PDF ขนาดไม่เกิน 15MB (PDF จะแปลงเป็นภาพ WebP คมชัดอัตโนมัติ)' : field.cropAspect ? 'เลือกรูปแล้วครอปให้พอดี 16:10 ก่อนบันทึก' : 'รูปจะถูกบีบอัดเป็น WebP อัตโนมัติ (เต็ม 1600px + thumb 480px)'}</p>
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <label key={field.key} className="flex items-center gap-2.5 cursor-pointer">
                <input type="hidden" name={`__checkbox_${field.key}`} value="1" />
                <input
                  type="checkbox"
                  name={field.key}
                  defaultChecked={current === undefined && (field.key === 'show_visit' || field.key === 'show_github') ? true : Boolean(current)}
                  className="w-4 h-4 accent-[#171717]"
                />
                <span className="text-sm font-semibold text-[#666]">{field.label}</span>
              </label>
            );
          }

          if (field.type === 'tags') {
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-semibold text-[#666]">{field.label}</label>
                <input type="hidden" name={field.key} value={tagValues[field.key] ?? ''} />
                <TagListInput
                  value={tagValues[field.key] ?? ''}
                  onChange={(value) => setTagValues((values) => ({ ...values, [field.key]: value }))}
                  placeholder={field.placeholder}
                />
              </div>
            );
          }

          if (field.type === 'select') {
            const opts = field.options ?? categories.map((c) => ({ value: String(c.id), label: String(c.name) }));
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-semibold text-[#666]">{field.label}</label>
                <select
                  name={field.key}
                  defaultValue={String(current ?? '')}
                  required={field.required}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base bg-white focus:outline-none focus:border-[#171717]"
                >
                  <option value="">— เลือก —</option>
                  {opts.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-semibold text-[#666]">{field.label}</label>
                <textarea
                  name={field.key}
                  defaultValue={String(defaultValue)}
                  rows={field.key === 'description' || field.key === 'address' ? 3 : 4}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
                />
              </div>
            );
          }

          return (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-semibold text-[#666]">{field.label}</label>
              {field.iconPreview ? (
                <SlugPreviewInput name={field.key} defaultValue={String(defaultValue)} placeholder={field.placeholder} required={field.required} />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  name={field.key}
                  defaultValue={String(defaultValue)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
                />
              )}
              {field.hint && <p className="text-xs text-[#666]">{field.hint}</p>}
            </div>
          );
        })}
      </div>

      {crop && (
        <ImageCropper
          file={crop.file}
          aspect={crop.aspect}
          onCancel={() => setCrop(null)}
          onConfirm={(blob) => {
            const file = new File([blob], 'project-cover.webp', { type: 'image/webp' });
            setCroppedFiles((files) => ({ ...files, [crop.key]: file }));
            const preview = URL.createObjectURL(file);
            const previousPreview = previewUrlsRef.current[crop.key];
            if (previousPreview) URL.revokeObjectURL(previousPreview);
            previewUrlsRef.current[crop.key] = preview;
            setCroppedPreviews((previews) => ({ ...previews, [crop.key]: preview }));
            setCrop(null);
          }}
        />
      )}

      {/* ปุ่มบันทึกติดขอบล่าง อยู่เหนือแถบนำทางมือถือ */}
      <div className="sticky bottom-24 lg:bottom-4 z-20 flex gap-2 rounded-2xl border border-[#eaeaea] bg-white/95 backdrop-blur p-2 shadow-lg">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          บันทึก
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 px-5 rounded-xl border border-[#e0e0e0] text-sm font-semibold text-[#666] hover:bg-white transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

/* ---------- ตัวครอปรูป (ใช้เฉพาะรูปโปรไฟล์ hero/about) ---------- */

function ImageCropper({
  file, aspect, onCancel, onConfirm,
}: {
  file: File;
  aspect: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState<{ x: number; y: number } | null>(null); // null = กึ่งกลาง
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [livePreview, setLivePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const interactionRef = useRef<{
    mode: 'move' | 'resize';
    dir?: string;
    px: number;
    py: number;
    rect: { x: number; y: number; w: number; h: number };
  } | null>(null);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const box = boxRef.current;
  const scale = nat && box ? Math.min(box.clientWidth / nat.w, box.clientHeight / nat.h) * zoom : 1;

  useEffect(() => {
    if (!nat || !boxRef.current) return;
    const frame = requestAnimationFrame(() => {
      const boxEl = boxRef.current;
      if (!boxEl) return;
      const bw = boxEl.clientWidth;
      const bh = boxEl.clientHeight;
      const fitScale = Math.min(bw / nat.w, bh / nat.h);
      setOff({
        x: (bw - nat.w * fitScale) / 2,
        y: (bh - nat.h * fitScale) / 2,
      });
      const w = Math.min(bw * 0.78, bh * 0.78 * aspect);
      const h = Math.min(bh * 0.78, w / aspect);
      setSelection({ x: (bw - w) / 2, y: (bh - h) / 2, w, h });
    });
    return () => cancelAnimationFrame(frame);
  }, [nat, aspect]);

  useEffect(() => {
    if (!nat || !off || !selection || !imgRef.current) return;
    const image = imgRef.current;
    if (!image.complete || image.naturalWidth === 0) return;
    const s = Math.min(boxRef.current!.clientWidth / nat.w, boxRef.current!.clientHeight / nat.h) * zoom;
    const sx = Math.max(0, (selection.x - off.x) / s);
    const sy = Math.max(0, (selection.y - off.y) / s);
    const sw = Math.min(selection.w / s, nat.w - sx);
    const sh = Math.min(selection.h / s, nat.h - sy);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw));
    canvas.height = Math.max(1, Math.round(sh));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, sx, sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    setLivePreview(canvas.toDataURL('image/webp', 0.9));
  }, [nat, off, selection, zoom]);

  function clamp(natW: number, natH: number, s: number, o: { x: number; y: number }, bw: number, bh: number) {
    return {
      x: Math.min(0, Math.max(bw - natW * s, o.x)),
      y: Math.min(0, Math.max(bh - natH * s, o.y)),
    };
  }

  function handleZoom(next: number) {
    if (!nat || !boxRef.current || !off) return;
    const bw = boxRef.current.clientWidth;
    const bh = boxRef.current.clientHeight;
    const oldS = Math.max(bw / nat.w, bh / nat.h) * zoom;
    const newS = Math.max(bw / nat.w, bh / nat.h) * next;
    // ยึดจุดกึ่งกลางไว้ตอนซูม
    const cx = bw / 2, cy = bh / 2;
    const raw = {
      x: cx - (cx - off.x) * (newS / oldS),
      y: cy - (cy - off.y) * (newS / oldS),
    };
    setOff(clamp(nat.w, nat.h, newS, raw, bw, bh));
    setZoom(next);
  }

  function resetPosition() {
    if (!nat || !boxRef.current) return;
    const bw = boxRef.current.clientWidth;
    const bh = boxRef.current.clientHeight;
    const s = Math.min(bw / nat.w, bh / nat.h) * zoom;
    setOff({
      x: (bw - nat.w * s) / 2,
      y: (bh - nat.h * s) / 2,
    });
    const w = Math.min(bw * 0.78, bh * 0.78 * aspect);
    const h = Math.min(bh * 0.78, w / aspect);
    setSelection({ x: (bw - w) / 2, y: (bh - h) / 2, w, h });
  }

  function beginSelection(e: React.PointerEvent<HTMLElement>, mode: 'move' | 'resize', dir?: string) {
    if (!selection) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    interactionRef.current = { mode, dir, px: e.clientX, py: e.clientY, rect: selection };
  }

  function updateSelection(e: React.PointerEvent<HTMLDivElement>) {
    const boxEl = boxRef.current;
    if (!boxEl) return;
    const interaction = interactionRef.current;
    if (!interaction) return;
    const dx = e.clientX - interaction.px;
    const dy = e.clientY - interaction.py;
    const { rect } = interaction;
    const bw = boxEl.clientWidth;
    const bh = boxEl.clientHeight;
    let next = { ...rect };

    if (interaction.mode === 'move') {
      next.x = Math.max(0, Math.min(bw - rect.w, rect.x + dx));
      next.y = Math.max(0, Math.min(bh - rect.h, rect.y + dy));
    } else {
      const dir = interaction.dir ?? '';
      const minSize = 56;
      const ratio = aspect;
      const fromWidth = (requestedWidth: number, anchorX: number, anchorY: number, signX: number, signY: number) => {
        const maxWidth = signX > 0 ? bw - anchorX : anchorX;
        const maxHeight = signY > 0 ? bh - anchorY : anchorY;
        const widthLimit = Math.min(maxWidth, maxHeight * ratio);
        const width = Math.max(minSize, Math.min(widthLimit, requestedWidth));
        next.w = width;
        next.h = width / ratio;
        next.x = signX > 0 ? anchorX : anchorX - width;
        next.y = signY > 0 ? anchorY : anchorY - next.h;
      };

      if (dir === 'e') {
        fromWidth(rect.w + dx, rect.x, rect.y + rect.h / 2, 1, 1);
        next.y = rect.y + (rect.h - next.h) / 2;
      } else if (dir === 'w') {
        fromWidth(rect.w - dx, rect.x + rect.w, rect.y + rect.h / 2, -1, 1);
        next.y = rect.y + (rect.h - next.h) / 2;
      } else if (dir === 's') {
        fromWidth((rect.h + dy) * ratio, rect.x + rect.w / 2, rect.y, 1, 1);
        next.x = rect.x + (rect.w - next.w) / 2;
      } else if (dir === 'n') {
        fromWidth((rect.h - dy) * ratio, rect.x + rect.w / 2, rect.y + rect.h, 1, -1);
        next.x = rect.x + (rect.w - next.w) / 2;
      } else {
        const widthDelta = dir.includes('e') ? dx : -dx;
        const heightDelta = dir.includes('s') ? dy : -dy;
        const width = Math.max(minSize, Math.abs(widthDelta) > Math.abs(heightDelta * ratio)
          ? rect.w + widthDelta
          : (rect.h + heightDelta) * ratio);
        const anchorX = dir.includes('w') ? rect.x + rect.w : rect.x;
        const anchorY = dir.includes('n') ? rect.y + rect.h : rect.y;
        fromWidth(width, anchorX, anchorY, dir.includes('e') ? 1 : -1, dir.includes('s') ? 1 : -1);
      }
    }
    setSelection(next);
  }

  function confirm() {
    const img = imgRef.current;
    const boxEl = boxRef.current;
    if (!img || !boxEl || !nat || !off) return;
    setBusy(true);
    const bw = boxEl.clientWidth, bh = boxEl.clientHeight;
    const s = Math.min(bw / nat.w, bh / nat.h) * zoom;
    const rect = selection ?? { x: 0, y: 0, w: bw, h: bh };
    const sx = Math.max(0, (rect.x - off.x) / s);
    const sy = Math.max(0, (rect.y - off.y) / s);
    const sw = Math.min(rect.w / s, nat.w - sx);
    const sh = Math.min(rect.h / s, nat.h - sy);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(Math.min(sw, nat.w - sx));
    canvas.height = Math.round(Math.min(sh, nat.h - sy));
    const ctx = canvas.getContext('2d');
    if (!ctx) { setBusy(false); return; }
    ctx.drawImage(img, sx, sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((b) => {
      setBusy(false);
      if (b) onConfirm(b);
    }, 'image/webp', 0.92);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={busy ? undefined : onCancel} />
      <div className="relative w-full max-w-4xl max-h-[96vh] overflow-y-auto rounded-2xl bg-white p-3 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#171717]">จัดตำแหน่งรูปโปรไฟล์</p>
            <p className="text-xs text-[#666] pt-0.5">ลากรูปเองเพื่อเลือกส่วนที่ต้องการ แล้วใช้ซูมช่วยจัดกรอบ</p>
          </div>
          <button
            type="button"
            onClick={resetPosition}
            disabled={!nat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] px-2.5 py-2 text-xs font-semibold text-[#666] hover:border-[#171717] hover:text-[#171717] disabled:opacity-40"
            title="จัดรูปกลับกึ่งกลาง"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            รีเซ็ต
          </button>
        </div>

        <div
          ref={boxRef}
          style={{ aspectRatio: nat ? `${nat.w} / ${nat.h}` : String(aspect) }}
          className="relative w-full max-w-[720px] max-h-[62vh] sm:max-h-[68vh] mx-auto overflow-hidden rounded-xl bg-[#f2f2f2] touch-none"
          onPointerMove={updateSelection}
          onPointerUp={(e) => {
            interactionRef.current = null;
            e.currentTarget.releasePointerCapture?.(e.pointerId);
          }}
          onPointerCancel={() => {
            interactionRef.current = null;
          }}
        >
          {url && (
            <img
              ref={imgRef}
              src={url}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                const n = { w: el.naturalWidth, h: el.naturalHeight };
                setNat((prev) => prev ?? n);
                const b = boxRef.current;
                if (b) {
                  const s = Math.min(b.clientWidth / n.w, b.clientHeight / n.h);
                  setOff((prev) => prev ?? {
                    x: (b.clientWidth - n.w * s) / 2,
                    y: (b.clientHeight - n.h * s) / 2,
                  });
                  const w = Math.min(b.clientWidth * 0.78, b.clientHeight * 0.78 * aspect);
                  const h = Math.min(b.clientHeight * 0.78, w / aspect);
                  setSelection((prev) => prev ?? {
                    x: (b.clientWidth - w) / 2,
                    y: (b.clientHeight - h) / 2,
                    w,
                    h,
                  });
                } else {
                  setOff((prev) => prev ?? { x: 0, y: 0 });
                }
              }}
              style={
                nat
                  ? {
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: nat.w * scale,
                      height: nat.h * scale,
                      transform: `translate(${off?.x ?? 0}px, ${off?.y ?? 0}px)`,
                      userSelect: 'none',
                    }
                  : { opacity: 0 }
              }
            />
          )}
          {selection && (
            <div
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.48)] cursor-move"
              style={{ left: selection.x, top: selection.y, width: selection.w, height: selection.h }}
              onPointerDown={(e) => beginSelection(e, 'move')}
            >
              {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((dir) => (
                <span
                  key={dir}
                  className={`absolute z-10 block h-3 w-3 rounded-sm border border-[#171717] bg-white ${
                    dir === 'nw' ? '-left-1.5 -top-1.5 cursor-nwse-resize' :
                    dir === 'n' ? 'left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize' :
                    dir === 'ne' ? '-right-1.5 -top-1.5 cursor-nesw-resize' :
                    dir === 'e' ? '-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize' :
                    dir === 'se' ? '-bottom-1.5 -right-1.5 cursor-nwse-resize' :
                    dir === 's' ? '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' :
                    dir === 'sw' ? '-bottom-1.5 -left-1.5 cursor-nesw-resize' :
                    '-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize'
                  }`}
                  onPointerDown={(e) => beginSelection(e, 'resize', dir)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#666]">Demo live — พื้นที่ที่จะนำไปใช้จริง</p>
          <div className="flex items-center justify-center overflow-hidden rounded-lg border border-[#e0e0e0] bg-[#f2f2f2] p-2">
            <div className="w-full max-w-[420px] overflow-hidden" style={{ aspectRatio: String(aspect) }}>
              {livePreview && <img src={livePreview} alt="ตัวอย่างพื้นที่ที่จะนำไปใช้จริง" className="h-full w-full object-cover" />}
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-[#666]">Demo นี้สร้างจากพื้นที่เดียวกับไฟล์ที่จะอัปโหลดจริง</p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={confirm}
            disabled={!nat || busy}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            ใช้รูปนี้
          </button>
          <button
            onClick={onCancel}
            disabled={busy}
            className="h-11 px-5 rounded-xl border border-[#e0e0e0] text-sm font-semibold text-[#666] hover:bg-white disabled:opacity-50 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

/** ลิสต์รายการแบบกดเพิ่ม/ลบ (เก็บเป็นข้อความคั่นลูกน้ำ — ตรงกับที่หน้าเว็บอ่าน) */
function TagListInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  const [input, setInput] = useState('');

  function add() {
    const v = input.trim();
    if (!v) return;
    onChange([...items, v].join(', '));
    setInput('');
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i).join(', '));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={`${it}-${i}`} className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-full bg-[#f2f2f2] border border-[#e5e5e5] text-sm font-semibold text-[#171717]">
            {it}
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-6 h-6 rounded-full hover:bg-[#e0e0e0] flex items-center justify-center"
              aria-label={`ลบ ${it}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-[#666] py-1">ยังไม่มีรายการ — เว้นว่างจะใช้ค่าเดิมของเว็บ</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? 'เช่น Thai (Native)'}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="px-4 py-2.5 inline-flex items-center rounded-lg bg-[#171717] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- ตัวแก้ไขข้อความของ section (site_content) ---------- */

function SiteContentFields({
  title, fields, content, onSaved, collapsible, description,
}: {
  title: string;
  fields: ContentField[];
  content: Record<string, string>;
  onSaved: (ok: boolean, msg: string) => void;
  collapsible?: boolean;
  description?: string;
}) {
  const [open, setOpen] = useState(!collapsible);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.key] = content[f.key] ?? '';
    return init;
  });
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ key: string; file: File; aspect: number } | null>(null);
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
    const subset: Record<string, string> = {};
    for (const f of fields) subset[f.key] = values[f.key] ?? '';
    startTransition(async () => {
      const res = await saveSiteContent(subset);
      onSaved(res.ok, res.ok ? 'บันทึกสำเร็จ — เว็บอัปเดตแล้ว' : (res.error ?? 'บันทึกไม่สำเร็จ'));
      if (!res.ok) setError(res.error ?? 'บันทึกไม่สำเร็จ');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
        className={`flex items-center gap-1.5 min-w-0 w-full text-left ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {collapsible && (
          <ChevronDown className={`w-4 h-4 text-[#666] transition-transform shrink-0 ${open ? '' : '-rotate-90'}`} />
        )}
        <h3 className="text-sm font-bold text-[#171717] truncate">{title}</h3>
      </button>

      {description && open && <p className="text-xs text-[#666] leading-relaxed -mt-2">{description}</p>}

      {open && (
        <>
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <div className="rounded-xl border border-[#eaeaea] bg-white p-4 space-y-4">
            {fields.map(({ key, label, type, placeholder, cropAspect }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-semibold text-[#666]">{label}</label>
                {type === 'image' ? (
                  <div className="space-y-2">
                    {values[key] && <img src={values[key]} alt="" className="w-28 h-28 rounded-lg border border-[#eaeaea] object-cover" />}
                    <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-[#f2f2f2] text-xs font-semibold text-[#171717] cursor-pointer hover:bg-[#eaeaea] transition-colors">
                    {uploadingKey === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    เลือกรูป
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (cropAspect) {
                          setCrop({ key, file: f, aspect: cropAspect });
                        } else {
                          handleUpload(key, f);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                    </div>
                    <input
                      type="text"
                      value={values[key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] text-sm text-[#171717]"
                      placeholder="URL รูป (อัปโหลดแล้วจะเติมให้อัตโนมัติ — เว้นว่าง = ใช้รูปเริ่มต้นของเว็บ)"
                    />
                  </div>
                ) : type === 'tags' ? (
                  <TagListInput
                    value={values[key] ?? ''}
                    onChange={(v) => setValues((prev) => ({ ...prev, [key]: v }))}
                    placeholder={placeholder}
                  />
                ) : type === 'textarea' ? (
                  <textarea
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    rows={3}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="sticky bottom-24 lg:bottom-4 z-20 flex rounded-2xl border border-[#eaeaea] bg-white/95 backdrop-blur p-2 shadow-lg">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              บันทึกส่วนนี้
            </button>
          </div>
        </>
      )}

      {crop && (
        <ImageCropper
          file={crop.file}
          aspect={crop.aspect}
          onCancel={() => setCrop(null)}
          onConfirm={(blob) => {
            const f = new File([blob], 'crop.webp', { type: 'image/webp' });
            handleUpload(crop.key, f);
            setCrop(null);
          }}
        />
      )}
    </form>
  );
}

/* ---------- จัดการผู้ใช้ที่ได้รับอนุญาต (authorized_users) ---------- */

function AuthorizedUsersManager({
  emails, tableError, currentEmail, onToast,
}: {
  emails: string[];
  tableError: string | null;
  currentEmail: string;
  onToast: (msg: string, ok: boolean) => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const current = currentEmail.trim().toLowerCase();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    setBusy(true);
    const res = await addAuthorizedUser(input);
    if (res.ok) {
      onToast(`เพิ่ม ${input.trim()} เรียบร้อย — แจ้งเจ้าตัวล็อกอินด้วย Google/Facebook อีเมลนี้ได้เลย`, true);
      setInput('');
      router.refresh();
    } else {
      onToast(res.error ?? 'เพิ่มไม่สำเร็จ', false);
    }
    setBusy(false);
  }

  async function handleRemove(email: string) {
    if (!confirm(`เพิกถอนสิทธิ์ "${email}" หรือไม่?`)) return;
    setBusy(true);
    const res = await removeAuthorizedUser(email);
    if (res.ok) {
      onToast('เพิกถอนสิทธิ์แล้ว', true);
      router.refresh();
    } else {
      onToast(res.error ?? 'ลบไม่สำเร็จ', false);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-[#171717]">ผู้ใช้ที่มีสิทธิ์แก้ไขเว็บ</h2>

      <div className="rounded-xl border border-[#eaeaea] bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f2f2f2] text-[#171717] flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <p className="flex-1 text-sm text-[#171717] leading-relaxed">
            อีเมลในลิสต์นี้ล็อกอิน Dashboard ได้ด้วย Google/Facebook ของตัวเอง (ถ้าไม่ได้ตั้ง OTP ไว้จะไม่ถูกถามรหัส)
          </p>
        </div>

        {tableError ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm leading-relaxed">
            ยังโหลดลิสต์ไม่ได้ — กรุณารันสคริปต์ <code className="font-mono text-xs">supabase/rls-owner-fix.sql</code> ใน Supabase → SQL Editor ก่อน
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map((email) => {
              const isSelf = email.toLowerCase() === current;
              return (
                <div key={email} className="rounded-xl border border-[#eaeaea] bg-white p-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#171717] truncate">{email}</p>
                    {isSelf && <p className="text-xs text-emerald-600 font-semibold">บัญชีที่กำลังใช้งาน</p>}
                  </div>
                  <button
                    onClick={() => handleRemove(email)}
                    disabled={busy || isSelf}
                    title={isSelf ? 'ลบบัญชีที่ใช้งานอยู่ไม่ได้' : 'เพิกถอนสิทธิ์'}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-[#666] hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#666] shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {emails.length === 0 && (
              <p className="text-sm text-[#666] py-4 text-center rounded-xl border border-dashed border-[#cccccc]">
                ยังไม่มีผู้ใช้ในลิสต์ (เจ้าของหลักเข้าได้เสมอแม้ไม่อยู่ในลิสต์)
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleAdd} className="flex gap-2 pt-1">
          <input
            type="email"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="อีเมลที่จะอนุญาต เช่น friend@gmail.com"
            className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-sm focus:outline-none focus:border-[#171717]"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="h-11 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#171717] text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition-colors shrink-0"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            เพิ่ม
          </button>
        </form>

        <p className="text-xs text-[#666] leading-relaxed">
          หลังเพิ่ม ผู้นั้นล็อกอินครั้งแรกด้วย OAuth แล้วระบบจะสร้างบัญชีให้อัตโนมัติ (อาจรอ ~1 นาทีหลังเพิ่มก่อนสิทธิ์ใช้งาน)
        </p>
      </div>
    </div>
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
      <h2 className="text-base font-bold text-[#171717]">จัดการ OTP (2FA)</h2>

      <div className="rounded-xl border border-[#eaeaea] bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'on' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f2f2f2] text-[#171717]'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-[#171717]">
              {status === 'loading' ? 'กำลังตรวจสอบ...' : status === 'on' ? 'OTP เปิดใช้งานอยู่' : 'OTP ยังไม่เปิดใช้งาน'}
            </p>
            <p className="text-sm text-[#171717]">
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-base font-semibold hover:bg-black transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              เริ่มใช้ OTP (สแกน QR)
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/dashboard/setup?force=1')}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-base font-semibold hover:bg-black transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                เปลี่ยน OTP ใหม่
              </button>
              <button
                onClick={disableOtp}
                disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-base font-semibold hover:bg-red-50 transition-colors"
              >
                ปิดใช้งาน OTP
              </button>
            </>
          )}
        </div>

        <p className="text-sm text-[#171717] leading-relaxed">
          เปลี่ยน/เริ่มใช้ OTP: ลบรายการเก่าในแอป Authenticator ก่อน แล้วกดปุ่มด้านบน สแกน QR ใหม่ และใส่รหัสยืนยัน — ป้ายชื่อจะเป็น "Suchakree-portfolio-Dashboard"
        </p>
      </div>
    </div>
  );
}
