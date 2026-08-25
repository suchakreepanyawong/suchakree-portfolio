'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, BookOpen, Heart, Sparkles } from 'lucide-react';

const TYPE_SPEED = 75;
const DELETE_SPEED = 12;
const PAUSE_AFTER_TYPED = 2500;
const PAUSE_AFTER_DELETED = 500;

function Typewriter({ segments }: { segments: { text: string; className?: string }[] }) {
  const full = segments.map((s) => s.text).join('');
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && length < full.length) {
      timeout = setTimeout(() => setLength((l) => l + 1), TYPE_SPEED);
    } else if (!deleting && length === full.length) {
      timeout = setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPED);
    } else if (deleting && length > 0) {
      timeout = setTimeout(() => setLength((l) => l - 1), DELETE_SPEED);
    } else {
      timeout = setTimeout(() => setDeleting(false), PAUSE_AFTER_DELETED);
    }
    return () => clearTimeout(timeout);
  }, [length, deleting, full]);

  let consumed = 0;
  const rendered = segments.map((seg, i) => {
    const start = consumed;
    consumed += seg.text.length;
    const visible = full.slice(0, length).slice(start, consumed);
    if (!visible) return null;
    return (
      <span key={i} className={seg.className}>
        {visible}
      </span>
    );
  });

  return (
    <span className="relative inline-block">
      <span className="text-[#ffd84d] mr-1.5 select-none">&gt;</span>
      {rendered}
      <span className="ml-0.5 inline-block w-[7px] h-[15px] translate-y-[2px] bg-[#ffd84d] animate-pulse" />
    </span>
  );
}

import type { EducationItem, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

const DEFAULT_INTERESTS = [
  'Cybersecurity & Networking',
  'Artificial Intelligence & Machine Learning',
  'Web Development & UI/UX',
  'Creative Design & Plan',
];

export default function About({ content, education }: { content: SiteContent; education: EducationItem[] }) {
  const interests = (content.about_interests ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const interestsList = interests.length > 0 ? interests : DEFAULT_INTERESTS;

  return (
    <section id="about" className="relative min-h-screen flex items-center py-28 overflow-hidden bg-white">
      {/* Mesh Ambient Glow */}
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full space-y-14">

        {/* Section Header */}
        <div className="space-y-3">
          <span className="section-badge">
            <User className="w-3.5 h-3.5 text-[#666666]" /> {content.about_badge || 'ABOUT ME'}
          </span>
          <AccentTitle
            title={content.about_title || 'Background & Education'}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]"
          />
          <p className="text-[#666666] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
            {content.about_subtitle || 'A brief overview of my academic background and technical focus areas.'}
          </p>
          <div className="glow-divider w-24 pt-2" />
        </div>

        {/* Profile Overview — formal two-column card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-[#999999] bg-[#fafafa] shadow-sm overflow-hidden mt-0 lg:-mt-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">

            {/* Left: Photo */}
            <div className="relative p-7 sm:p-9 border-b lg:border-b-0 lg:border-r border-[#eaeaea] min-w-0">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[#eaeaea] shadow-md bg-white">
                <img
                  src={content.about_photo ?? "/images/profile-2.png"}
                  alt="Suchakree Panyawong"
                  className="w-full h-full object-cover object-top scale-105"
                />
              </div>
              <div className="pt-5 flex items-center justify-center">
                <div className="w-full rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#0d0d0d] px-4 py-2.5 shadow-sm overflow-hidden text-center border border-[#333333]">
                  <p className="text-xs sm:text-sm tracking-wide whitespace-nowrap overflow-hidden" style={{ fontFamily: 'var(--font-friendly), var(--font-thai), sans-serif' }}>
                    <Typewriter
                      segments={[
                        { text: 'Hello my name is ', className: 'italic font-semibold text-[#e8e8e8]' },
                        { text: 'Suchakree', className: 'italic font-extrabold bg-gradient-to-r from-[#ffd84d] to-[#ffb300] bg-clip-text text-transparent' },
                        { text: ', Nice to meet you 😊', className: 'italic font-semibold text-[#e8e8e8]' },
                      ]}
                    />
                  </p>
                </div>
              </div>
              <div className="relative mt-2 h-24 overflow-hidden bg-[linear-gradient(rgba(23,23,23,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(23,23,23,0.05)_1px,transparent_1px)] bg-[size:18px_18px] lg:h-20">
                <motion.div
                  aria-hidden="true"
                  animate={{ x: ['-20%', '110%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#d4ae1e]/20 to-transparent blur-md"
                />
                <motion.div
                  aria-hidden="true"
                  animate={{ scaleX: [0.85, 1, 0.85], opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-[7%] right-[7%] top-1/2 h-px bg-[#171717]/25 shadow-[0_0_10px_rgba(212,174,30,0.8)]"
                />
                <motion.div
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-1/2 top-1/2 z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4ae1e]/70 border-t-[#171717] shadow-[0_0_18px_rgba(212,174,30,0.55)] lg:h-24 lg:w-24"
                >
                  <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#d4ae1e] shadow-[0_0_12px_#d4ae1e]" />
                </motion.div>
                <motion.div
                  aria-hidden="true"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-1/2 top-1/2 z-10 h-16 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-[#171717]/35 lg:h-14 lg:w-32"
                >
                  <span className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#171717]" />
                </motion.div>
                {[0, 1, 2, 3, 4, 5, 6].map((particle) => (
                  <motion.span
                    key={particle}
                    aria-hidden="true"
                    animate={{
                      y: [0, particle % 2 === 0 ? -14 : 14, 0],
                      opacity: [0.2, 1, 0.2], scale: [0.6, 1.5, 0.6],
                    }}
                    transition={{ duration: 1.2 + particle * 0.18, repeat: Infinity, ease: 'easeInOut', delay: particle * 0.16 }}
                    className={`absolute top-1/2 h-1.5 w-1.5 rounded-full shadow-[0_0_10px_#d4ae1e] ${particle % 2 === 0 ? 'bg-[#d4ae1e]' : 'bg-[#171717]'}`}
                    style={{ left: `${10 + particle * 12}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="p-7 sm:p-9 space-y-16">
              <div className="space-y-4">
                {[
                  ['Full Name', content.about_full_name ?? ''],
                  ['Nickname', content.about_nickname ?? ''],
                  ['Nationality', content.about_nationality ?? ''],
                  ['Languages', content.about_languages ?? ''],
                  ['Current Location', content.about_location ?? ''],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-b border-[#e5e5e5] pb-3.5 last:border-0 last:pb-0">
                    <span className="w-full sm:w-40 shrink-0 text-[11px] font-medium font-sans tracking-[0.14em] text-[#666666] uppercase">{label}</span>
                    {label === 'Languages' ? (
                      <span className="flex flex-col gap-1 text-[15px] font-semibold font-sans text-[#171717]">
                        {(content.about_languages ?? '').split(',').map((l) => l.trim()).filter(Boolean).length > 0 ? (
                          (content.about_languages ?? '').split(',').map((l) => l.trim()).filter(Boolean).map((lang) => (
                            <span key={lang} className="flex items-start gap-3"><span className="text-[#888888] shrink-0 select-none">›</span>{lang}</span>
                          ))
                        ) : (
                          <>
                            <span className="flex items-start gap-3"><span className="text-[#888888] shrink-0 select-none">›</span>Thai (Native)</span>
                            <span className="flex items-start gap-3"><span className="text-[#888888] shrink-0 select-none">›</span>English (Intermediate)</span>
                            <span className="flex items-start gap-3"><span className="text-[#888888] shrink-0 select-none">›</span>Chinese (Beginner)</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-[15px] font-semibold font-sans text-[#171717] pl-[18px]">{value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Interests */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 border-b border-[#e5e5e5] pb-2.5">
                  <h4 className="text-[11px] font-medium font-sans tracking-[0.14em] text-[#666666] uppercase">Interests</h4>
                  <Heart className="w-4 h-4 text-[#666666]" />
                </div>
                <ul className="space-y-2.5 pl-0 lg:pl-[194px]">
                  {interestsList.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] text-[#171717] font-semibold font-sans">
                      <span className="text-[#888888] mt-[1px] shrink-0 select-none">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Education Timeline */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#666666]" />
            <h3 className="text-xl sm:text-2xl font-semibold text-[#171717] tracking-tight">Education</h3>
          </div>

          <div className="relative space-y-4 pl-8">
            {/* Timeline line */}
            <span className="absolute left-[6px] top-4 bottom-4 w-px bg-[#d4d4d4]" />
            {education.map((edu, idx) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative"
              >
                {/* Timeline dot */}
                <span className={`absolute left-[-32px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ring-4 ring-white ${edu.is_current ? 'border-emerald-500 bg-emerald-50' : 'border-[#171717] bg-white'} z-10`} />
                <div className="vercel-card !border-[#999999] py-9 px-6 sm:px-8 relative overflow-hidden group">
                {/* Period — top right (จอใหญ่) / บรรทัดของตัวเอง (มือถือ) */}
                <div className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-8 text-sm sm:text-base font-bold text-[#171717] whitespace-nowrap hidden sm:block">
                  {edu.period}
                </div>

                <div className="flex items-center gap-4 sm:gap-5 pr-0 sm:pr-40">
                  {/* Institution logo */}
                  <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={edu.logo_url ?? ""}
                      alt={`${edu.institution} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement).style.visibility = 'hidden';
                      }}
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base sm:text-lg font-semibold text-[#171717]">
                        {edu.institution}
                      </h4>
                    </div>
                    <p className="text-sm font-medium text-[#444444]">{edu.degree}</p>
                    <p className="text-sm text-[#888888]">GPA : {edu.gpa}</p>
                    {edu.period && (
                      <p className="text-xs font-bold text-[#171717] sm:hidden pt-1">{edu.period}</p>
                    )}
                  </div>
                </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
