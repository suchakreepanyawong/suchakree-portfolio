'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Image as ImageIcon, Trophy, Activity, ChevronDown, ChevronUp, X, Maximize2 } from 'lucide-react';

const certificates = [
  { title: 'Fortinet Certified Fundamentals (FCF) in Cybersecurity', issuer: 'Fortinet Training Institute', year: '2024', accent: 'indigo' },
  { title: 'Fortinet Certified Associate (FCA) & FortiGate Operator', issuer: 'Fortinet Training Institute', year: '2025', accent: 'purple' },
  { title: 'Applied Big Data & AI Technologies Certification', issuer: 'Ministry of Digital Economy', year: '2024', accent: 'pink' },
  { title: 'IC3 Digital Literacy Master Certification', issuer: 'Certiport / Global Standard', year: '2024', accent: 'indigo' },
  { title: 'Network Security Associate & Threat Defense', issuer: 'Cyber Academy Institute', year: '2024', accent: 'purple' },
  { title: 'Cloud Infrastructure & Linux Server Administration', issuer: 'Open Cloud Training', year: '2024', accent: 'pink' },
  { title: 'Enterprise Network Cabling & Fiber Optics Spec', issuer: 'Link Certified Engineering', year: '2023', accent: 'indigo' },
  { title: 'Vulnerability Assessment & Web Defense Fundamentals', issuer: 'National Cyber Security Hub', year: '2024', accent: 'purple' },
  { title: 'Generative AI & LLM Deployment Fundamentals', issuer: 'AI Research Alliance', year: '2025', accent: 'pink' },
  { title: 'Cisco Certified Support Technician (CCST) Cybersecurity', issuer: 'Cisco Networking Academy', year: '2024', accent: 'indigo' },
  { title: 'Linux Professional Institute LPIC-1 System Administrator', issuer: 'Linux Professional Institute', year: '2024', accent: 'purple' },
  { title: 'Certified Secure Software Lifecycle Specialist', issuer: 'OWASP Foundation Chapter', year: '2025', accent: 'pink' },
  { title: 'AWS Certified Cloud Practitioner (CLF-C02)', issuer: 'Amazon Web Services', year: '2024', accent: 'indigo' },
  { title: 'Red Hat Certified Enterprise Application Specialist', issuer: 'Red Hat Academy', year: '2024', accent: 'purple' },
  { title: 'Prompt Engineering & Autonomous AI Agent Mastery', issuer: 'DeepLearning.AI Hub', year: '2025', accent: 'pink' },
];

const activities = [
  { title: 'Thailand National Cyber Exercise 2025', organizer: 'NCSA / Cyber Security Agency', year: '2025', role: 'Defense Operative', accent: 'indigo' },
  { title: 'CTF Bootcamp & Hack The Scammer CTF', organizer: 'Cyber Defense Training', year: '2025', role: 'Competitor', accent: 'purple' },
  { title: 'WAZUH Security Data Protection Workshop', organizer: 'Cyber Security Training Center', year: '2024', role: 'Participant', accent: 'pink' },
  { title: 'Cabling Contest Training & Network Engineering', organizer: 'Link Certified Network Engineering', year: '2024', role: 'Trainee', accent: 'indigo' },
  { title: 'Student Cybersecurity Leadership & Outreach Camp', organizer: 'University Cyber Club', year: '2024', role: 'Coordinator', accent: 'purple' },
  { title: 'Local AI & Open Source Model Hackathon', organizer: 'Tech Innovators Guild', year: '2025', role: 'Developer', accent: 'pink' },
  { title: 'Cyber Threat Intelligence Gathering Seminar', organizer: 'Thai Cyber Network', year: '2024', role: 'Attendee', accent: 'indigo' },
  { title: 'Network Hardware Lab & Server Assembly Workshop', organizer: 'Engineering Faculty', year: '2023', role: 'Lead Assistant', accent: 'purple' },
  { title: 'Digital Forensic & Incident Response Challenge', organizer: 'InfoSec Thailand', year: '2024', role: 'Competitor', accent: 'pink' },
  { title: 'Regional University CTF Cybersecurity Competition', organizer: 'Northern Cyber League', year: '2024', role: 'Team Captain', accent: 'indigo' },
  { title: 'Autonomous RAG & AI Agent Builders Meetup', organizer: 'AI Thailand Community', year: '2025', role: 'Speaker & Builder', accent: 'purple' },
  { title: 'DevSecOps & Secure CI/CD Pipeline Hands-on Lab', organizer: 'Cloud Security Alliance', year: '2024', role: 'Participant', accent: 'pink' },
  { title: 'Ethical Hacking & Web Penetration Testing Camp', organizer: 'Security Research Club', year: '2025', role: 'Trainer Assistant', accent: 'indigo' },
  { title: 'Open Source Linux Kernel & Server Tuning Expo', organizer: 'Thai Linux Users Group', year: '2024', role: 'Contributor', accent: 'purple' },
  { title: 'Smart IoT & Embedded Hardware Innovation Fair', organizer: 'Robotics & IoT Lab', year: '2023', role: 'Exhibitor', accent: 'pink' },
];

const accentMap: Record<string, { pill: string; glow: string; border: string; dot: string; hover: string; gridColor: string }> = {
  indigo: {
    pill: 'bg-white/[0.04] text-zinc-300 border-white/10',
    glow: 'from-white/[0.05] via-transparent to-transparent',
    border: 'hover:border-white/30',
    dot: 'bg-zinc-400',
    hover: 'group-hover:text-white',
    gridColor: '#ffffff',
  },
  purple: {
    pill: 'bg-white/[0.04] text-zinc-300 border-white/10',
    glow: 'from-white/[0.05] via-transparent to-transparent',
    border: 'hover:border-white/30',
    dot: 'bg-zinc-400',
    hover: 'group-hover:text-white',
    gridColor: '#ffffff',
  },
  pink: {
    pill: 'bg-white/[0.04] text-zinc-300 border-white/10',
    glow: 'from-white/[0.05] via-transparent to-transparent',
    border: 'hover:border-white/30',
    dot: 'bg-zinc-400',
    hover: 'group-hover:text-white',
    gridColor: '#ffffff',
  },
};

export default function Portfolio() {
  const [tab, setTab] = useState<'certificates' | 'activities'>('certificates');
  const [selected, setSelected] = useState<(typeof certificates)[number] | (typeof activities)[number] | null>(null);
  const items = tab === 'certificates' ? certificates : activities;

  return (
    <section id="portfolio" className="relative py-28 overflow-hidden bg-white">
      {/* Ambient soft glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full space-y-12">

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
              <Award className="w-3.5 h-3.5 text-[#666666]" /> PORTFOLIO
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]">
              Certificates & <span className="accent-text">Activities</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] font-normal">
              A collection of my achievements and activities.
            </p>
            <div className="glow-divider w-24" />
          </motion.div>
        </div>

        {/* Scrollable Card Container with Vercel Hairline & Indicator */}
        <div className="relative rounded-2xl border border-[#cccccc] bg-white p-4 sm:p-6 shadow-sm">
          
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

          {/* Scrollable Viewport — shows ~6 cards (2 rows), rest via scroll */}
          <div className="max-h-[1920px] sm:max-h-[980px] lg:max-h-[660px] overflow-y-auto lux-scrollbar pr-2 pb-4 scroll-smooth">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item, idx) => (
                <motion.div
                  key={`${tab}-${item.title}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                  onClick={() => setSelected(item)}
                  className="vercel-card !border-[#cccccc] overflow-hidden flex flex-col group hover:border-[#b8b8b8] hover:shadow-md transition-all duration-200 bg-white cursor-pointer"
                >
                  {/* Flush image area */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#f7f7f7] border-b border-[#eaeaea]">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] via-transparent to-transparent" />
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{ backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#888888] group-hover:text-[#171717] transition-colors duration-200">
                      {tab === 'certificates'
                        ? <Trophy className="w-7 h-7 stroke-[1.2]" />
                        : <Activity className="w-7 h-7 stroke-[1.2]" />
                      }
                      <span className="text-[10px] font-sans tracking-widest text-[#888888] group-hover:text-[#171717]">
                        {tab === 'certificates' ? 'CERT PREVIEW' : 'ACTIVITY PREVIEW'}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-sans bg-white/90 border border-[#eaeaea] text-[#555555] backdrop-blur-sm shadow-sm">
                      {item.year}
                    </div>

                    {/* Zoom-in icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors duration-200">
                      <div className="p-2.5 rounded-full bg-white/95 border border-[#eaeaea] text-[#171717] shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171717] leading-snug line-clamp-2 group-hover:text-black transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-sans text-[#888888]">
                      {'issuer' in item ? item.issuer : item.organizer}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl flex items-end justify-center pb-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-[#eaeaea] text-[#666666] text-xs font-sans backdrop-blur-md shadow-sm">
              <span>SCROLL DOWN</span>
              <ChevronDown className="w-3 h-3 text-[#666666] animate-bounce" />
            </div>
          </div>
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
              <div className="relative w-full aspect-[16/9] bg-[#f7f7f7] border-b border-[#eaeaea]">
                <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] via-transparent to-transparent" />
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#888888]">
                  {('issuer' in selected)
                    ? <Trophy className="w-20 h-20 stroke-[1.2]" />
                    : <Activity className="w-20 h-20 stroke-[1.2]" />}
                  <span className="text-xs font-sans tracking-widest">
                    {('issuer' in selected) ? 'CERT PREVIEW' : 'ACTIVITY PREVIEW'}
                  </span>
                </div>
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
                  {'issuer' in selected ? selected.issuer : selected.organizer}
                </p>
                <div className="glow-divider w-24" />
                <p className="text-sm text-[#666666] leading-relaxed">
                  {'issuer' in selected
                    ? 'Verified credential — click the Credly link in the profile section to view the full certificate.'
                    : 'Extracurricular activity — participated as listed above.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
