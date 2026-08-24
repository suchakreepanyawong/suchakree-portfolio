'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Image as ImageIcon } from 'lucide-react';
import type { Project, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

export default function Projects({ projects, content }: { projects: Project[]; content: SiteContent }) {
  return (
    <section id="projects" className="relative min-h-screen flex items-center py-28 overflow-hidden bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full space-y-12">

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {projects.map((project, pIdx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: pIdx * 0.1 }}
              className="vercel-card !border-[#cccccc] overflow-hidden flex flex-col group hover:border-[#b8b8b8] hover:shadow-md transition-all duration-300 bg-white"
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
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#171717] group-hover:text-black transition-colors">{project.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.repo_url && (
                        <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md text-[10px] font-sans bg-[#f5f5f5] border border-[#eaeaea] text-[#555555] hover:border-[#999999] hover:text-[#171717] transition-colors">
                          Repo
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md text-[10px] font-sans bg-[#171717] border border-[#171717] text-white hover:bg-black transition-colors">
                          Live
                        </a>
                      )}
                      {project.detail_url && (
                        <a href={project.detail_url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md text-[10px] font-sans bg-white border border-[#eaeaea] text-[#555555] hover:border-[#999999] hover:text-[#171717] transition-colors">
                          Details
                        </a>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-[#666666] text-xs sm:text-sm leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                {(project.tech_stack?.length ?? 0) > 0 && (
                  <div className="pt-3 border-t border-[#eaeaea] flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech_stack.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-sans bg-[#f5f5f5] border border-[#eaeaea] text-[#555555]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}
