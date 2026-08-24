'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Image as ImageIcon, Trophy, Activity, ChevronDown, ChevronUp, X, Maximize2, ExternalLink } from 'lucide-react';
import type { Activity as ActivityItem, Certificate, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

type Item = Certificate | ActivityItem;

function isCert(item: Item): item is Certificate {
  return 'issuer' in item;
}

export default function Portfolio({ certificates, activities, content }: { certificates: Certificate[]; activities: ActivityItem[]; content: SiteContent }) {
  const [tab, setTab] = useState<'certificates' | 'activities'>('certificates');
  const [selected, setSelected] = useState<Item | null>(null);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const items = [...(tab === 'certificates' ? certificates : activities)].sort(
    (left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)),
  );
  const showAll = tab === 'certificates' ? showAllCertificates : showAllActivities;
  const visibleItems = showAll ? items : items.slice(0, 9);

  return (
    <section id="portfolio" className="relative py-28 overflow-hidden bg-white">
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
        <div className="relative rounded-2xl border border-[#b8b8b8] bg-white p-4 sm:p-6 shadow-sm">

          {/* Top bar: counts + underline tab switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#eaeaea] mb-4">
            <div className="flex items-center gap-5">
              {([
                { key: 'certificates', label: 'Certificates', count: certificates.length, Icon: Trophy },
                { key: 'activities',   label: 'Activities',   count: activities.length,   Icon: Activity },
              ] as const).map(({ key, label, count, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 pb-2.5 -mb-3 px-1 text-sm transition-all duration-200 cursor-pointer border-b-2 ${
                    tab === key
                      ? 'border-emerald-500 text-[#171717] font-semibold'
                      : 'border-transparent text-[#888888] font-medium hover:text-[#171717]'
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

          {/* แสดง 9 รายการแรก และขยายลงมาเมื่อกดปุ่ม */}
          <div className="pr-2 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                  onClick={() => setSelected(item)}
                  className="vercel-card !border-[#b8b8b8] !rounded-xl overflow-hidden flex flex-col group hover:border-[#999999] hover:shadow-md transition-all duration-200 bg-white cursor-pointer"
                >
                  {/* Flush image area */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#f7f7f7] border-b border-[#eaeaea]">
                    {item.image_url ? (
                      <img
                        src={item.image_url.includes('-thumb.webp') ? item.image_url : item.image_url.replace('.webp', '-thumb.webp')}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => { if (item.image_url) (e.target as HTMLImageElement).src = item.image_url; }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] via-transparent to-transparent" />
                        <div
                          className="absolute inset-0 opacity-[0.03]"
                          style={{ backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#888888] group-hover:text-[#171717] transition-colors duration-200">
                          {isCert(item)
                            ? <Trophy className="w-7 h-7 stroke-[1.2]" />
                            : <Activity className="w-7 h-7 stroke-[1.2]" />
                          }
                          <span className="text-[10px] font-sans tracking-widest text-[#888888] group-hover:text-[#171717]">
                            {isCert(item) ? 'CERT PREVIEW' : 'ACTIVITY PREVIEW'}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors duration-200">
                      <div className="p-2.5 rounded-full bg-white/95 border border-[#eaeaea] text-[#171717] shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                    {item.featured && (
                      <span className="absolute top-3 right-3 rounded-full bg-[#171717]/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Card body — ปีอยู่ซ้ายล่างก่อนคำบรรยาย */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                    {item.year && (
                      <span className="inline-flex self-start px-2 py-0.5 rounded text-[10px] font-sans bg-[#f5f5f5] border border-[#eaeaea] text-[#555555]">
                        {item.year}
                      </span>
                    )}
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171717] leading-snug line-clamp-2 group-hover:text-black transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-sans text-[#888888]">
                      {isCert(item) ? item.issuer : item.organizer}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#666666]">
                      ดูรายละเอียด <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {items.length > 9 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => tab === 'certificates' ? setShowAllCertificates((value) => !value) : setShowAllActivities((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-[#cccccc] bg-white px-5 py-2.5 text-sm font-semibold text-[#171717] shadow-sm transition-all duration-200 hover:border-[#171717] hover:shadow-md"
              >
                {showAll ? `Show less ${tab === 'certificates' ? 'Certificates' : 'Activities'}` : `Show all ${tab === 'certificates' ? 'Certificates' : 'Activities'}`}
                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Modal - click card to enlarge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-[#eaeaea] shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 border border-[#eaeaea] text-[#666666] hover:text-[#171717] hover:border-[#cccccc] shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Enlarged preview area */}
              <div className="relative w-full aspect-[16/10] bg-[#f7f7f7] border-b border-[#eaeaea]">
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    alt={selected.title}
                    className="absolute inset-0 w-full h-full object-contain bg-white"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] via-transparent to-transparent" />
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{ backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#888888]">
                      {isCert(selected)
                        ? <Trophy className="w-20 h-20 stroke-[1.2]" />
                        : <Activity className="w-20 h-20 stroke-[1.2]" />}
                      <span className="text-xs font-sans tracking-widest">
                        {isCert(selected) ? 'CERT PREVIEW' : 'ACTIVITY PREVIEW'}
                      </span>
                    </div>
                  </>
                )}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded text-xs font-sans bg-white/90 border border-[#eaeaea] text-[#555555] backdrop-blur-sm shadow-sm">
                  {selected.year}
                </div>
              </div>

              {/* Details */}
              <div className="p-6 sm:p-8 space-y-3">
                <h3 className="text-lg sm:text-2xl font-semibold text-[#171717] tracking-[-0.02em] leading-snug">
                  {selected.title}
                </h3>
                <p className="text-sm font-sans text-[#888888]">
                  {isCert(selected) ? selected.issuer : selected.organizer}
                  {!isCert(selected) && selected.role ? ` — ${selected.role}` : ''}
                </p>
                <div className="glow-divider w-24" />
                <p className="text-sm text-[#666666] leading-relaxed">
                  {selected.description
                    ?? (isCert(selected)
                      ? 'Verified credential — click the link below to view the full certificate.'
                      : 'Extracurricular activity — participated as listed above.')}
                </p>
                {selected.detail_url && (
                  <a
                    href={selected.detail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-[#555555] text-[#171717] shadow-md shadow-black/10 hover:shadow-lg hover:border-[#171717] hover:bg-[#f0f0f0] active:scale-95 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    ดูรายละเอียด / Verify
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
