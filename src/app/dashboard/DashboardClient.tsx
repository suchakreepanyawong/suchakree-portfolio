'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award, Briefcase, Check, ChevronDown, ChevronLeft, Code2, ExternalLink,
  FolderTree, GraduationCap, Layers, Link2, Loader2, LogOut, Mail, Menu, Home,
  Pencil, Plus, RotateCcw, Settings, ShieldCheck, Trash2, Trophy, User, X,
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
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldSpec[];
  collapsible?: boolean; // บล็อกรอง เก็บ/ขยายได้
  subtitleFn?: (row: Row, categories: Row[]) => string;
}

interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image';
  placeholder?: string; // แสดงค่าเริ่มต้นของเว็บตอนยังไม่ได้กรอก
}

interface SectionDef {
  key: string;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  contentTitle?: string;
  contentFields?: ContentField[];
  headerBlock?: { title: string; fields: ContentField[] }; // badge/ชื่อ/คำโปรยของ section
  collections?: CollectionSpec[];
}

/* ---------- spec ของแต่ละคอลเลกชัน (ตารางใน DB) ---------- */

const EDUCATION_SPEC: CollectionSpec = {
  key: 'education',
  label: 'การศึกษา',
  description: 'แสดงผลเป็นไทม์ไลน์ในหน้า About',
  icon: GraduationCap,
  fields: [
    { key: 'institution', label: 'ชื่อสถาบัน', type: 'text', listTitle: true, required: true },
    { key: 'degree', label: 'วุฒิการศึกษา / สาขา', type: 'text', listSubtitle: true, required: true },
    { key: 'period', label: 'ช่วงเวลา (เช่น 2023 — 2026)', type: 'text' },
    { key: 'gpa', label: 'GPA', type: 'text' },
    { key: 'is_current', label: 'กำลังศึกษาอยู่', type: 'checkbox' },
    { key: 'file', label: 'โลโก้สถาบัน', type: 'image' },
  ],
};

const SKILLS_SPEC: CollectionSpec = {
  key: 'skills',
  label: 'รายการ Skill',
  icon: Code2,
  subtitleFn: (row, categories) =>
    String(categories.find((c) => String(c.id) === String(row.category_id))?.name ?? ''),
  fields: [
    { key: 'category_id', label: 'หมวดหมู่', type: 'select', required: true },
    { key: 'name', label: 'ชื่อทักษะ', type: 'text', listTitle: true, required: true },
    { key: 'icon_url', label: 'ไอคอน (URL)', type: 'text', listSubtitle: true, placeholder: 'https://cdn...' },
  ],
};

const SKILL_CATEGORIES_SPEC: CollectionSpec = {
  key: 'skill_categories',
  label: 'หมวดหมู่ของ Skills',
  description: 'กลุ่มที่แสดงเป็นการ์ดใหญ่ในหน้า Skills (เช่น Frontend, Tools)',
  icon: FolderTree,
  collapsible: true,
  fields: [
    { key: 'name', label: 'ชื่อหมวดหมู่', type: 'text', listTitle: true, required: true },
    {
      key: 'icon',
      label: 'ไอคอนประจำหมวด',
      type: 'select',
      options: [
        { value: 'Code2', label: 'โค้ด (Code2)' },
        { value: 'Monitor', label: 'หน้าจอ (Monitor)' },
        { value: 'Database', label: 'ฐานข้อมูล (Database)' },
        { value: 'Cloud', label: 'คลาวด์ (Cloud)' },
        { value: 'Sparkles', label: 'ประกาย (Sparkles)' },
        { value: 'Cpu', label: 'ชิป (Cpu)' },
      ],
    },
    { key: 'sort_order', label: 'ลำดับการแสดง (ตัวเลขเล็กมาก่อน)', type: 'number' },
  ],
};

const EXPERIENCES_SPEC: CollectionSpec = {
  key: 'experiences',
  label: 'ประสบการณ์',
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
};

const PROJECTS_SPEC: CollectionSpec = {
  key: 'projects',
  label: 'โปรเจกต์',
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
};

const CERTIFICATES_SPEC: CollectionSpec = {
  key: 'certificates',
  label: 'ใบรับรอง (Certificates)',
  icon: Trophy,
  fields: [
    { key: 'title', label: 'ชื่อใบรับรอง', type: 'text', listTitle: true, required: true },
    { key: 'issuer', label: 'หน่วยงานที่ออก', type: 'text', listSubtitle: true, required: true },
    { key: 'year', label: 'ปี (เช่น 2025)', type: 'text' },
    { key: 'detail_url', label: 'ลิงก์รายละเอียด (ซ่อนในปุ่ม "ดูรายละเอียด")', type: 'text', placeholder: 'https://...' },
    { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
    { key: 'file', label: 'รูปใบรับรอง', type: 'image' },
  ],
};

const ACTIVITIES_SPEC: CollectionSpec = {
  key: 'activities',
  label: 'กิจกรรม (Activities)',
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
};

const SOCIAL_SPEC: CollectionSpec = {
  key: 'social_links',
  label: 'ช่องทางโซเชียล',
  description: 'แสดงเป็นไอคอนวงกลมในหน้าแรกและหน้า Contact',
  icon: Link2,
  fields: [
    { key: 'platform', label: 'แพลตฟอร์ม (slug เช่น github)', type: 'text', listTitle: true, required: true },
    { key: 'label', label: 'ชื่อแสดงผล', type: 'text', required: true },
    { key: 'url', label: 'ลิงก์', type: 'text', listSubtitle: true, required: true },
    { key: 'color', label: 'สี (hex ไม่มี #)', type: 'text', placeholder: '181717' },
  ],
};

/* ---------- ฟิลด์หัวข้อ (badge/ชื่อ/คำโปรย) ของแต่ละ section ---------- */

function headerFields(prefix: string, defBadge: string, defTitle: string, defSubtitle?: string): ContentField[] {
  const fields: ContentField[] = [
    { key: `${prefix}_badge`, label: 'ป้ายเล็กเหนือชื่อ (badge)', type: 'text', placeholder: defBadge },
    { key: `${prefix}_title`, label: 'ชื่อหัวข้อใหญ่ (คำสุดท้ายถูกเน้นสีอัตโนมัติ)', type: 'text', placeholder: defTitle },
  ];
  if (defSubtitle) {
    fields.push({ key: `${prefix}_subtitle`, label: 'คำโปรยใต้ชื่อหัวข้อ', type: 'textarea', placeholder: defSubtitle });
  }
  return fields;
}

/* ---------- จัดกลุ่มตามหน้าเว็บจริง ---------- */

const SECTIONS: SectionDef[] = [
  {
    key: 'home',
    label: 'หน้าแรก',
    short: 'หน้าแรก',
    icon: Home,
    contentTitle: 'ข้อความหน้าแรก (Hero)',
    contentFields: [
      { key: 'hero_greeting', label: 'คำทักทายเหนือชื่อ', type: 'text', placeholder: "Hi There, I'm" },
      { key: 'hero_name', label: 'ชื่อใหญ่ (ชื่อ นามสกุล — นามสกุลขึ้นบรรทัดที่สอง)', type: 'text' },
      { key: 'hero_typed_text', label: 'ข้อความ typewriter', type: 'textarea' },
      { key: 'hero_photo', label: 'รูปโปรไฟล์ใหญ่ (หน้าแรก)', type: 'image' },
    ],
  },
  {
    key: 'about',
    label: 'About',
    short: 'About',
    icon: User,
    contentTitle: 'ข้อมูลส่วนตัว (หน้า About)',
    contentFields: [
      { key: 'about_full_name', label: 'ชื่อเต็ม', type: 'text' },
      { key: 'about_nickname', label: 'ชื่อเล่น', type: 'text' },
      { key: 'about_nationality', label: 'สัญชาติ', type: 'text' },
      { key: 'about_location', label: 'ที่อยู่ปัจจุบัน', type: 'text' },
      { key: 'about_languages', label: 'ภาษา (คั่นด้วยลูกน้ำ เช่น Thai (Native), English)', type: 'text' },
      { key: 'about_photo', label: 'รูปโปรไฟล์ (หน้า About)', type: 'image' },
      { key: 'about_interests', label: 'สิ่งที่สนใจ (Interests — บรรทัดละ 1 ข้อ)', type: 'textarea', placeholder: 'Cybersecurity & Networking\nArtificial Intelligence & Machine Learning' },
    ],
    collections: [EDUCATION_SPEC],
    headerBlock: {
      title: 'หัวข้อ section About',
      fields: headerFields('about', 'ABOUT ME', 'Background & Education', 'A brief overview of my academic background and technical focus areas.'),
    },
  },
  {
    key: 'skills',
    label: 'Skills',
    short: 'Skills',
    icon: Code2,
    collections: [SKILLS_SPEC, SKILL_CATEGORIES_SPEC],
    headerBlock: {
      title: 'หัวข้อ section Skills',
      fields: headerFields('skills', 'TECH STACK', 'Skills & Abilities', 'The technologies, languages, and specialized tools I leverage for software engineering and cyber defense.'),
    },
  },
  {
    key: 'experience',
    label: 'Experience',
    short: 'Exp.',
    icon: Briefcase,
    collections: [EXPERIENCES_SPEC],
    headerBlock: {
      title: 'หัวข้อ section Experience',
      fields: headerFields('experience', 'EXPERIENCE', 'Intern Experience', 'Practical professional experience in IT support, cybersecurity operations, and community technical service.'),
    },
  },
  {
    key: 'projects',
    label: 'Projects',
    short: 'Projects',
    icon: Layers,
    collections: [PROJECTS_SPEC],
    headerBlock: {
      title: 'หัวข้อ section Projects',
      fields: headerFields('projects', 'PROJECTS', 'Featured Projects', 'A curated collection of projects I have designed, built, and delivered — from idea to implementation.'),
    },
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    short: 'Portfolio',
    icon: Trophy,
    collections: [CERTIFICATES_SPEC, ACTIVITIES_SPEC],
    headerBlock: {
      title: 'หัวข้อ section Portfolio',
      fields: headerFields('portfolio', 'PORTFOLIO', 'Certificates & Activities', 'A collection of my achievements and activities.'),
    },
  },
  {
    key: 'contact',
    label: 'Contact',
    short: 'Contact',
    icon: Mail,
    contentTitle: 'ช่องทางติดต่อ',
    contentFields: [
      { key: 'contact_email', label: 'อีเมลติดต่อ', type: 'text' },
      { key: 'contact_phone', label: 'เบอร์โทรศัพท์', type: 'text', placeholder: '+66 93 308 5150' },
      { key: 'contact_line', label: 'LINE ID', type: 'text', placeholder: 'trrem' },
    ],
    collections: [SOCIAL_SPEC],
    headerBlock: {
      title: 'หัวข้อ section Contact',
      fields: headerFields('contact', 'CONTACT', 'Get In Touch'),
    },
  },
  {
    key: 'settings',
    label: 'ตั้งค่า',
    short: 'ตั้งค่า',
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

export default function DashboardClient({ data }: { data: Record<string, Row[] | Record<string, string>> }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>('home');
  const [editing, setEditing] = useState<{ table: string; row: Row | null } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

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
    await signOut();
    router.push('/dashboard/login');
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
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold text-[#666] hover:text-[#171717] hover:bg-[#f2f2f2] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
        {/* Tab bar — เดสก์ท็อปเท่านั้น (มือถือใช้แถบล่าง) */}
        <div className="hidden lg:block max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-nowrap gap-1 pb-px overflow-x-auto no-scrollbar">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 pb-32 lg:pb-10">
        {tab === 'settings' ? (
          <OtpManager onToast={notify} />
        ) : (
          <SectionBody
            key={section.key}
            section={section}
            data={data}
            content={content}
            categories={categories}
            editing={editing}
            onEdit={(table, row) => setEditing(row === null && table === editing?.table ? null : { table, row })}
            onRowSaved={handleRowSaved}
            onContentSaved={handleContentSaved}
            onDelete={handleDelete}
          />
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

/* ---------- เนื้อหาของแต่ละ section ---------- */

function SectionBody({
  section, data, content, categories, editing, onEdit, onRowSaved, onContentSaved, onDelete,
}: {
  section: SectionDef;
  data: Record<string, Row[] | Record<string, string>>;
  content: Record<string, string>;
  categories: Row[];
  editing: { table: string; row: Row | null } | null;
  onEdit: (table: string, row: Row | null) => void;
  onRowSaved: (ok: boolean, msg: string) => void;
  onContentSaved: (ok: boolean, msg: string) => void;
  onDelete: (table: string, id: string, title: string) => void;
}) {
  const editingSpec = editing ? section.collections?.find((c) => c.key === editing.table) : undefined;

  return (
    <div className="space-y-6">
      {section.contentFields && section.contentFields.length > 0 && (
        <SiteContentFields
          title={section.contentTitle ?? 'ข้อความ'}
          fields={section.contentFields}
          content={content}
          onSaved={onContentSaved}
        />
      )}

      {section.collections?.map((spec) => {
        if (editing && editingSpec?.key === spec.key) {
          return (
            <RowEditor
              key={spec.key}
              spec={spec}
              row={editing.row}
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
          />
        );
      })}

      {section.headerBlock && (
        <SiteContentFields
          title={section.headerBlock.title}
          fields={section.headerBlock.fields}
          content={content}
          onSaved={onContentSaved}
          collapsible
          description="เว้นว่าง = ใช้ค่าเดิมของเว็บ (placeholder คือค่าปัจจุบัน)"
        />
      )}
    </div>
  );
}

/* ---------- ลิสต์รายการของ 1 คอลเลกชัน ---------- */

function CollectionBlock({
  spec, rows, categories, onEdit, onDelete,
}: {
  spec: CollectionSpec;
  rows: Row[];
  categories: Row[];
  onEdit: (table: string, row: Row | null) => void;
  onDelete: (table: string, id: string, title: string) => void;
}) {
  const [open, setOpen] = useState(!spec.collapsible);
  const Icon = spec.icon;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={spec.collapsible ? () => setOpen((o) => !o) : undefined}
          className={`flex items-center gap-1.5 min-w-0 ${spec.collapsible ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {spec.collapsible && (
            <ChevronDown className={`w-4 h-4 text-[#666] transition-transform shrink-0 ${open ? '' : '-rotate-90'}`} />
          )}
          <Icon className="w-4 h-4 text-[#666] shrink-0" />
          <h3 className="text-sm font-bold text-[#171717] truncate">{spec.label}</h3>
          <span className="text-[11px] font-semibold text-[#666] bg-[#f2f2f2] rounded-full px-2 py-0.5 shrink-0">
            {rows.length}
          </span>
        </button>
        {open && (
          <button
            onClick={() => onEdit(spec.key, null)}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#171717] text-white text-xs font-semibold hover:bg-black transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่ม
          </button>
        )}
      </div>

      {spec.description && open && (
        <p className="text-xs text-[#666] leading-relaxed">{spec.description}</p>
      )}

      {open && (
        <div className="space-y-2">
          {rows.map((row) => {
            const sub = rowSubtitle(row, spec, categories);
            return (
              <div
                key={String(row.id)}
                onClick={() => onEdit(spec.key, row)}
                className="cursor-pointer rounded-xl border border-[#eaeaea] bg-white p-3 flex items-center gap-3 hover:border-[#cccccc] active:border-[#171717] transition-colors"
              >
                {typeof row.image_url === 'string' && row.image_url ? (
                  <img
                    src={(row.image_url as string).replace('.webp', '-thumb.webp')}
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).src = row.image_url as string; }}
                    className="w-14 h-10 rounded-md object-cover border border-[#eaeaea] shrink-0"
                  />
                ) : typeof row.logo_url === 'string' && row.logo_url ? (
                  <img src={row.logo_url as string} alt="" className="w-10 h-10 rounded-md object-contain border border-[#eaeaea] shrink-0" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#171717] truncate">{rowTitle(row, spec)}</p>
                  {sub && <p className="text-xs text-[#666] truncate">{sub}</p>}
                </div>
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
              </div>
            );
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
      )}
    </section>
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
          const current = row?.[field.key];
          const defaultValue = Array.isArray(current) ? current.join('\n') : current ?? '';

          if (field.type === 'image') {
            const url = (row?.image_url ?? row?.logo_url) as string | undefined;
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-semibold text-[#666]">{field.label}</label>
                {url && <img src={url} alt="" className="w-full max-w-[240px] rounded-lg border border-[#eaeaea]" />}
                <input type="file" name={field.key} accept="image/*" className="text-sm text-[#171717] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[#f2f2f2] file:text-sm file:font-semibold" />
                <p className="text-xs text-[#666]">รูปจะถูกบีบอัดเป็น WebP อัตโนมัติ (เต็ม 1600px + thumb 480px)</p>
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <label key={field.key} className="flex items-center gap-2.5 cursor-pointer">
                <input type="hidden" name={`__checkbox_${field.key}`} value="1" />
                <input type="checkbox" name={field.key} defaultChecked={Boolean(current)} className="w-4 h-4 accent-[#171717]" />
                <span className="text-sm font-semibold text-[#666]">{field.label}</span>
              </label>
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
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                name={field.key}
                defaultValue={String(defaultValue)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] text-base focus:outline-none focus:border-[#171717]"
              />
              {field.hint && <p className="text-xs text-[#666]">{field.hint}</p>}
            </div>
          );
        })}
      </div>

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
            {fields.map(({ key, label, type, placeholder }) => (
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
                      onChange={(e) => e.target.files?.[0] && handleUpload(key, e.target.files[0])}
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
