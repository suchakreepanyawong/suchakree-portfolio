'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Layers, Image as ImageIcon, ExternalLink } from 'lucide-react';
import type { Project, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

export default function Projects({ projects, content }: { projects: Project[]; content: SiteContent }) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleProjects = showAll ? projects : projects.slice(0, 6);

  return (
    <section id="projects" className="relative flex items-center py-20 overflow-hidden bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full space-y-10">

        {/* Section Header */}
        <div className="space-y-3 flex flex-col items-center text-center">
          <span className="section-badge">
            <Layers className="w-3.5 h-3.5 text-[#666666]" /> {content.projects_badge || 'PROJECTS'}
          </span>
          <AccentTitle
            title={content.projects_title || 'Featured Projects'}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]"
          />
          <p className="text-[#666666] text-sm max-w-xl font-normal">
            {content.projects_subtitle || 'A curated collection of projects I have designed, built, and delivered — from idea to implementation.'}
          </p>
          <div className="glow-divider w-24" />
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 items-start">

          {visibleProjects.map((project, pIdx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: pIdx * 0.1 }}
              className={`vercel-card !border-[#b8b8b8] !rounded-lg overflow-hidden flex flex-col group hover:border-[#999999] hover:shadow-md transition-all duration-300 bg-white md:will-change-transform ${pIdx % 2 === 0 ? 'md:translate-y-12' : ''}`}
            >
              {/* Image Preview Area */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#f7f7f7] border-b border-[#eaeaea]">
                <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] via-transparent to-transparent" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#888888] group-hover:text-[#171717] transition-colors duration-300">
                    <ImageIcon className="w-8 h-8 stroke-[1.2]" />
                    <span className="text-[10px] font-sans tracking-widest text-[#888888] group-hover:text-[#171717]">PROJECT PREVIEW</span>
                  </div>
                )}
              </div>

          {/* Card Body */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#171717] group-hover:text-black transition-colors">{project.title}</h3>
              {project.description && (
                <p className="text-[#666666] text-[0.86rem] sm:text-[0.98rem] leading-relaxed min-h-[84px]">
                  {project.description}
                </p>
              )}
            </div>

            {project.live_url && (
                <div className="pt-2 border-t border-[#eaeaea] flex justify-end">
                  <span className="group/visit relative inline-flex">
                    <span className="pointer-events-none absolute -inset-1 z-0 rounded-full bg-[#e8a900] opacity-0 blur-sm transition-all duration-300 group-hover/visit:opacity-25 group-hover/visit:blur-md" />
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn relative z-10 inline-flex items-center gap-2 rounded-full !bg-[#171717] px-4 py-2 text-xs font-bold tracking-wide text-white transition-all duration-300 hover:scale-105 hover:!bg-[#171717] active:scale-100"
                    >
                      Visit
                      <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </span>
                </div>
            )}
          </div>
            </motion.div>
          ))}

        </div>

        {projects.length > 6 && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-[#cccccc] bg-white px-5 py-2.5 text-sm font-semibold text-[#171717] shadow-sm transition-all duration-200 hover:border-[#171717] hover:shadow-md"
            >
              {showAll ? 'Show less' : 'Show all'}
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
