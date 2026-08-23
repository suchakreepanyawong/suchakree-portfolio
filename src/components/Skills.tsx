'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Monitor, Database, Cloud, Cpu, Sparkles, LucideIcon } from 'lucide-react';
import type { SkillCategory } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Code2,
  Database,
  Cloud,
  Sparkles,
  Cpu,
};

export default function Skills({ categories }: { categories: SkillCategory[] }) {

  return (
    <section id="skills" className="relative py-16 sm:py-20 overflow-hidden bg-[#fafafa]">
      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="space-y-2 flex flex-col items-center text-center">
          <span className="section-badge">
            <Code2 className="w-3.5 h-3.5 text-[#666666]" /> TECH STACK
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]">
            Skills & <span className="accent-text">Abilities</span>
          </h2>
          <p className="text-[#666666] text-sm max-w-lg font-normal">
            The technologies, languages, and specialized tools I leverage for software engineering and cyber defense.
          </p>
          <div className="glow-divider w-24" />
        </div>

        {/* Compact 2-column category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
          {categories.map((category, catIdx) => {
            const CatIcon = iconMap[category.icon] ?? Code2;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: catIdx * 0.05 }}
                className="rounded-2xl bg-white border border-[#cccccc] shadow-sm p-4 sm:p-5 space-y-3"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#eaeaea]">
                  <div className="w-6 h-6 rounded-md bg-[#f0f0f0] border border-[#eaeaea] flex items-center justify-center text-[#171717]">
                    <CatIcon className="w-3.5 h-3.5 text-[#171717]" />
                  </div>
                  <h3 className="text-xs font-sans font-semibold tracking-wider text-[#171717] uppercase">
                    {category.name}
                  </h3>
                  <span className="text-[11px] font-sans text-[#888888] ml-auto">
                    {category.skills.length} tools
                  </span>
                </div>

                {/* Skill Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.skills.map((skill, sIdx) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: sIdx * 0.02 }}
                      className="group flex items-center gap-2 p-2 rounded-lg bg-[#fafafa] border border-[#ececec] hover:border-[#cccccc] hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-5 h-5 rounded-md bg-white border border-[#ebebeb] flex items-center justify-center p-0.5 shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={skill.icon_url ?? ''}
                          alt={skill.name}
                          className="w-full h-full object-contain filter group-hover:brightness-95 transition-all"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#444444] group-hover:text-[#171717] truncate transition-colors">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

