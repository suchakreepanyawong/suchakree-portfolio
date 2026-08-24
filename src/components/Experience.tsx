'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin } from 'lucide-react';

import type { ExperienceItem, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

export default function Experience({ experiences, content }: { experiences: ExperienceItem[]; content: SiteContent }) {
  return (
    <section id="experience" className="relative min-h-screen flex items-center py-28 overflow-hidden bg-white">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full space-y-12">

        {/* Header */}
        <div className="space-y-3">
          <span className="section-badge">
            <Briefcase className="w-3.5 h-3.5 text-[#666666]" /> {content.experience_badge || 'EXPERIENCE'}
          </span>
          <AccentTitle
            title={content.experience_title || 'Intern Experience'}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]"
          />
          <p className="text-[#666666] text-sm max-w-xl font-normal">
            {content.experience_subtitle || 'Practical professional experience in IT support, cybersecurity operations, and community technical service.'}
          </p>
          <div className="glow-divider w-24" />
        </div>

        {/* Cards */}
        <div className="relative space-y-4 pl-8">
          {/* Timeline line */}
          <span className="absolute left-[6px] top-4 bottom-4 w-px bg-[#d4d4d4]" />
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.organization + exp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <span className={`absolute left-[-32px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ring-4 ring-white z-10 ${idx === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-[#171717] bg-white'}`} />
              <div className="vercel-card !border-[#b8b8b8] px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-4 sm:gap-8">
                {/* Organization logo */}
                <div className="w-16 h-16 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.logo_url ?? ""}
                    alt={`${exp.organization} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.visibility = 'hidden';
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-[#171717] tracking-tight">
                    {exp.organization}
                  </h3>
                  <p className="text-sm font-semibold text-[#171717] pt-1">
                    {exp.organization_th}
                  </p>
                  <div className="pt-0 sm:pt-8 text-sm text-[#666666]">
                    <p>{exp.title}</p>
                    {'address' in exp && exp.address && (
                      <p className="flex items-start gap-1.5 leading-relaxed pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-1" />
                        <span>{exp.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
