'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Github, Layers, Image as ImageIcon, ExternalLink } from 'lucide-react';
import type { Project, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

export default function Projects({ projects, content }: { projects: Project[]; content: SiteContent }) {
  const [showAll, setShowAll] = React.useState(false);
  const projectsBoxRef = React.useRef<HTMLDivElement>(null);
  const visibleProjects = showAll ? projects : projects.slice(0, 12);

  React.useEffect(() => {
    const projectsBox = projectsBoxRef.current;
    if (!projectsBox) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setShowAll(false);
      },
      { threshold: 0.05, rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(projectsBox);
    return () => observer.disconnect();
  }, []);

  function toggleShowAll() {
    const scrollY = window.scrollY;
    setShowAll((current) => !current);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  }

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
        <div ref={projectsBoxRef} className="relative">
          <AnimatePresence>
            {showAll && projects.length > 12 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed inset-x-0 bottom-5 z-[80] flex justify-center pointer-events-none px-4"
              >
                <button
                  type="button"
                  onClick={toggleShowAll}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#b8b8b8] bg-white/95 px-5 py-2.5 text-sm font-semibold text-[#171717] shadow-xl backdrop-blur-md transition-all duration-200 hover:border-[#171717] hover:shadow-2xl"
                >
                  Show less <ChevronUp className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-4 items-start">

          {visibleProjects.map((project, pIdx) => (
            <div
              key={project.id}
              className="w-full"
            >
            <div className="w-full origin-top scale-[0.98]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: pIdx * 0.1 }}
              className="vercel-card !border-[#999999] !rounded-lg overflow-hidden flex flex-col group shadow-[0_3px_12px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-[#666666] hover:shadow-[0_14px_32px_rgba(0,0,0,0.2)] transition-all duration-300 bg-white"
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
                {project.master_piece && (
                  <span className="absolute top-3 right-3 rounded-full border border-[#f2c14e] bg-[#171717]/95 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[#ffd75a] shadow-[0_4px_14px_rgba(0,0,0,0.28)]">
                    MASTER PIECE
                  </span>
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

            {(project.category || project.repo_url || project.live_url) && (
              <div className="pt-2 border-t border-[#eaeaea] flex items-end justify-between gap-2">
                {project.category ? (
                  <div className="flex flex-wrap gap-1.5">
                    {project.category.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag, tagIdx) => (
                      <span key={`${tag}-${tagIdx}`} className="rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1 text-[10px] font-semibold text-[#555555]">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : <span />}
                {(project.repo_url || project.live_url) && (
                  <div className="flex justify-end gap-2">
                  {project.repo_url && project.show_github !== false && (
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-[104px] items-center justify-center gap-2 rounded-full border border-[#171717] bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#171717] transition-all duration-300 hover:scale-105 hover:bg-[#f5f5f5] active:scale-100"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {project.live_url && project.show_visit !== false && (
                    <span className="group/visit relative inline-flex">
                      <span className="pointer-events-none absolute -inset-1 z-0 rounded-full bg-[#e8a900] opacity-0 blur-sm transition-all duration-300 group-hover/visit:opacity-25 group-hover/visit:blur-md" />
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative z-10 inline-flex min-w-[132px] items-center justify-center gap-2 rounded-full !bg-[#171717] px-5 py-2 text-xs font-bold tracking-wide text-white transition-all duration-300 hover:scale-105 hover:!bg-[#171717] active:scale-100"
                      >
                        Visit Project
                        <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </a>
                    </span>
                  )}
                  </div>
                )}
              </div>
            )}
          </div>
            </motion.div>
            </div>
            </div>
          ))}

        </div>

        {projects.length > 12 && !showAll && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={toggleShowAll}
              className="inline-flex items-center gap-2 rounded-full border border-[#cccccc] bg-white px-5 py-2.5 text-sm font-semibold text-[#171717] shadow-sm transition-all duration-200 hover:border-[#171717] hover:shadow-md"
            >
              Show all
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        </div>

      </div>
    </section>
  );
}
