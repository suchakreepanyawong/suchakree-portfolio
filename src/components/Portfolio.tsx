'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Image as ImageIcon, Trophy, Activity, ChevronDown, ChevronUp, X, Maximize2, ExternalLink } from 'lucide-react';
import type { Activity as ActivityItem, Certificate, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

type Item = Certificate | ActivityItem;

function isCert(item: Item): item is Certificate {
  return 'issuer' in item;
}

function isPdfUrl(url?: string | null) {
  return Boolean(url?.toLowerCase().split('?')[0].endsWith('.pdf'));
}

export default function Portfolio({ certificates, activities, content }: { certificates: Certificate[]; activities: ActivityItem[]; content: SiteContent }) {
  const [tab, setTab] = useState<'certificates' | 'activities'>('certificates');
  const [selected, setSelected] = useState<Item | null>(null);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const portfolioRef = useRef<HTMLElement>(null);
  const portfolioBoxRef = useRef<HTMLDivElement>(null);
  const items = tab === 'certificates' ? certificates : activities;
  const showAll = tab === 'certificates' ? showAllCertificates : showAllActivities;
  const visibleItems = showAll ? items : items.slice(0, 9);

  useEffect(() => {
    const portfolioBox = portfolioBoxRef.current;
    if (!portfolioBox) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setShowAllCertificates(false);
          setShowAllActivities(false);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(portfolioBox);
    return () => observer.disconnect();
  }, []);

  function toggleShowAll() {
    const scrollY = window.scrollY;
    if (tab === 'certificates') setShowAllCertificates((value) => !value);
    else setShowAllActivities((value) => !value);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  }

  return (
    <section ref={portfolioRef} id="portfolio" className="relative py-28 overflow-hidden bg-white">
      {/* Ambient soft glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full space-y-12">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <span className="section-badge">
              <Award className="w-3.5 h-3.5 text-[#666666]" /> {content.portfolio_badge || 'PORTFOLIO'}
            </span>
            <AccentTitle
              title={content.portfolio_title || 'Certificates & Activities'}
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]"
            />
            <p className="text-xs sm:text-sm text-[#666666] font-normal">
              {content.portfolio_subtitle || 'A collection of my achievements and activities.'}
            </p>
            <div className="glow-divider w-24" />
          </motion.div>
        </div>

        {/* Scrollable Card Container with Vercel Hairline & Indicator */}
        <div ref={portfolioBoxRef} className="relative">

          {/* Top bar: counts + underline tab switcher */}
          <div className="flex flex-wrap items-center justify-end gap-3 pb-3 border-b border-[#eaeaea] mb-4">
            <div className="flex items-center gap-1 rounded-lg border border-[#d4d4d4] bg-[#fafafa] p-1 shadow-sm">
              {([
                { key: 'certificates', label: 'Certificates', count: certificates.length, Icon: Trophy },
                { key: 'activities',   label: 'Activities',   count: activities.length,   Icon: Activity },
              ] as const).map(({ key, label, count, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-sm transition-all duration-200 cursor-pointer ${
                    tab === key
                      ? 'bg-white text-[#171717] font-semibold shadow-sm ring-1 ring-[#c8c8c8]'
                      : 'text-[#777777] font-medium hover:bg-white hover:text-[#555555]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab === key ? 'text-emerald-500' : ''}`} />
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${tab === key ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f0f0f0] text-[#888888]'}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {showAll && items.length > 9 && (
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
                  Show less {tab === 'certificates' ? 'Certificates' : 'Activities'}
                  <ChevronUp className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid แสดง Certificate แบบอิสระไร้กรอบ พร้อมเนื้อหาด้านล่าง */}
          <div className="pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-6">
              {visibleItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
                  onClick={() => setSelected(item)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  {/* Floating Certificate Image Area */}
                  <div className="relative w-full h-48 sm:h-52 flex items-center justify-center p-1">
                    {item.image_url ? (
                      item.image_url.toLowerCase().includes('.pdf') ? (
                        // PDF เก่า: ใช้ iframe แสดงผล
                        <iframe
                          src={item.image_url}
                          title={item.title}
                          className="w-full h-full border-0 bg-white pointer-events-none rounded-md shadow-lg"
                          style={{ minHeight: '200px' }}
                        />
                      ) : (
                        // WebP/รูปภาพ: แสดงเป็น img tag พร้อม fallback
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            item.image_url.endsWith('.webp') && !item.image_url.endsWith('-thumb.webp')
                              ? item.image_url.replace(/\.webp$/, '-thumb.webp')
                              : item.image_url
                          }
                          alt={item.title}
                          loading="lazy"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (item.image_url && img.src !== item.image_url) {
                              img.src = item.image_url;
                            }
                          }}
                          className="max-w-full max-h-full w-auto h-auto object-contain rounded-md shadow-lg shadow-black/10 border border-neutral-200/70 group-hover:shadow-2xl group-hover:scale-[1.00] transition-all duration-300 bg-white scale-[0.97]"
                        />
                      )
                    ) : (
                      <div className="w-full h-full rounded-md bg-neutral-100 flex flex-col items-center justify-center gap-2 text-neutral-400 border border-neutral-200">
                        {isCert(item) ? <Trophy className="w-8 h-8 stroke-[1.2]" /> : <Activity className="w-8 h-8 stroke-[1.2]" />}
                        <span className="text-[10px] tracking-wider font-semibold">PREVIEW</span>
                      </div>
                    )}
                  </div>

                  {/* Caption title below — จัดวางตรงกลางตามภาพตัวอย่าง */}
                  <div className="mt-3.5 text-center px-2 space-y-1 w-full max-w-sm">
                    <h3 className="text-sm sm:text-base font-medium text-[#171717] leading-snug group-hover:text-black transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#777777]">
                      {isCert(item) ? item.issuer : item.organizer}
                      {item.year ? ` · ${item.year}` : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {items.length > 9 && !showAll && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={toggleShowAll}
                className="inline-flex items-center gap-2 rounded-full border border-[#cccccc] bg-white px-5 py-2.5 text-sm font-semibold text-[#171717] shadow-sm transition-all duration-200 hover:border-[#171717] hover:shadow-md"
              >
                {showAll ? `Show less ${tab === 'certificates' ? 'Certificates' : 'Activities'}` : `Show all ${tab === 'certificates' ? 'Certificates' : 'Activities'}`}
                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Modal - click card to enlarge (Clean Image View without scrollbars) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
          >
            {/* Close button prominent on the top right */}
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110] flex items-center justify-center w-11 h-11 rounded-full bg-white text-[#171717] hover:bg-neutral-200 shadow-2xl transition-all active:scale-95 cursor-pointer border border-white/30"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-auto"
            >
              {selected.image_url ? (
                <div className="relative flex items-center justify-center">
                  {selected.image_url.toLowerCase().includes('.pdf') ? (
                    // PDF: แสดงผ่าน iframe
                    <iframe
                      src={selected.image_url}
                      title={selected.title}
                      className="w-[85vw] max-w-4xl h-[70vh] sm:h-[78vh] border-0 bg-white rounded-xl shadow-2xl"
                    />
                  ) : (
                    // WebP/รูปภาพ — ไม่มีกรอบซ้อน
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.image_url}
                      alt={selected.title}
                      className="max-w-[88vw] max-h-[78vh] sm:max-h-[82vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
                    />
                  )}
                  {selected.year && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/75 text-white backdrop-blur-md shadow-md">
                      {selected.year}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-[85vw] max-w-lg aspect-[4/3] rounded-2xl bg-white flex flex-col items-center justify-center gap-4 text-[#888888] shadow-2xl">
                  {isCert(selected)
                    ? <Trophy className="w-20 h-20 stroke-[1.2]" />
                    : <Activity className="w-20 h-20 stroke-[1.2]" />}
                  <span className="text-sm font-sans tracking-widest">
                    {isCert(selected) ? 'CERTIFICATE' : 'ACTIVITY'}
                  </span>
                </div>
              )}

              {/* Minimal caption below */}
              <div className="mt-3 text-center max-w-2xl px-4">
                <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-md">
                  {selected.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 font-normal">
                  {isCert(selected) ? selected.issuer : selected.organizer}
                  {!isCert(selected) && selected.role ? ` — ${selected.role}` : ''}
                </p>
                {selected.detail_url && (
                  <div className="pt-2">
                    <a
                      href={selected.detail_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-[#171717] hover:bg-neutral-200 transition-colors shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      ดูรายละเอียด / Verify
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
