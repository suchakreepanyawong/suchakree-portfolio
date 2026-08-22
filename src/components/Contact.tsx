'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Copy,
  Check,
} from 'lucide-react';

const SI = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons';

// Real brand logo as CSS mask — recolorable via background color
function BrandLogo({ slug, color, alt, size = 20 }: { slug: string; color: string; alt: string; size?: number }) {
  const mask = {
    maskImage: `url(${SI}/${slug}.svg)`,
    WebkitMaskImage: `url(${SI}/${slug}.svg)`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  } as React.CSSProperties;
  return (
    <span
      role="img"
      aria-label={alt}
      style={{ ...mask, width: size, height: size, ['--brand' as string]: `#${color}` } as React.CSSProperties}
      className="bg-[var(--brand)] transition-all duration-300"
    />
  );
}

export default function Contact() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const directContacts = [
    {
      key: 'phone',
      brandSlug: undefined,
      label: 'PHONE',
      value: '+66 93 308 5150',
      href: 'tel:+66933085150',
      copyText: '+66933085150',
    },
    {
      key: 'email',
      brandSlug: 'gmail',
      label: 'EMAIL',
      value: 'Suchakree.panyawong@gmail.com',
      href: 'mailto:Suchakree.panyawong@gmail.com',
      copyText: 'Suchakree.panyawong@gmail.com',
    },
    {
      key: 'line',
      brandSlug: 'line',
      label: 'LINE ID',
      value: 'trrem',
      href: undefined,
      copyText: 'trrem',
    },
  ];

  const socialLinks = [
    { key: 'github',       slug: 'github',       color: '181717', label: 'GitHub',       href: 'https://github.com/suchakreeplaystore1' },
    { key: 'linkedin',     slug: 'linkedin',     color: '0A66C2', label: 'LinkedIn',     href: 'https://www.linkedin.com/in/suchakree-panyawong-9682ab330/' },
    { key: 'medium',       slug: 'medium',       color: '000000', label: 'Medium',       href: 'https://medium.com/@suchakree.panyawong' },
    { key: 'credly',       slug: 'credly',       color: 'FF6B00', label: 'Credly',       href: 'https://www.credly.com/users/suchakree-panyawong/edit/badges/credly' },
    { key: 'researchgate', slug: 'researchgate', color: '00CCBB', label: 'ResearchGate', href: 'https://www.researchgate.net/profile/Suchakree-Panyawong' },
  ];

  return (
    <section id="contact" className="relative py-28 bg-white">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 w-full">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="space-y-3 mb-16"
        >
          <span className="section-badge">
            <MessageSquare className="w-3.5 h-3.5 text-[#666666]" /> CONTACT
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]">
            Get In <span className="accent-text">Touch</span>
          </h2>
          <div className="glow-divider w-24" />
        </motion.div>

        {/* Profile Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 rounded-xl border border-[#cccccc] bg-[#fafafa] px-4 py-3 mb-8"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#dcdcdc] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/profile-backup.png"
              alt="Suchakree Panyawong"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <h3 className="flex-1 text-base font-semibold text-[#171717] tracking-[-0.02em] min-w-0 truncate">
            Suchakree Panyawong
          </h3>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Available
          </span>
        </motion.div>

        {/* Direct Contact Rows */}
        <div className="space-y-2 mb-14">
          {directContacts.map((item, idx) => {
            const isCopied = copied === item.key;

            const rowContent = (
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => copy(item.copyText, item.key)}
                className="group flex items-center gap-4 py-3 cursor-pointer"
              >
                {/* Circle Brand Logo (lucide Phone for phone — no brand slug in simple-icons) */}
                <div className="w-12 h-12 rounded-full border-2 border-[#171717] flex items-center justify-center shrink-0">
                  {item.brandSlug ? (
                    <BrandLogo slug={item.brandSlug} color="171717" alt={item.label} size={20} />
                  ) : (
                    <Phone className="w-5 h-5 text-[#171717] stroke-[1.5]" />
                  )}
                </div>

                {/* Label + Value */}
                <div className="flex-1 min-w-0 border-b border-[#eeeeee] pb-3">
                  <p className="text-[11px] font-sans tracking-[0.16em] text-[#999999] mb-0.5 uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-[#171717] group-hover:text-black transition-colors truncate">
                    {item.value}
                  </p>
                </div>

                {/* Copy Button */}
                <div className="shrink-0 pb-2.5 pr-1">
                  {isCopied
                    ? <Check className="w-4 h-4 text-emerald-500" />
                    : <Copy className="w-4 h-4 text-[#d0d0d0] group-hover:text-[#888888] transition-colors" />
                  }
                </div>
              </motion.div>
            );

            return item.href
              ? <a key={item.key} href={item.href}>{rowContent}</a>
              : <div key={item.key}>{rowContent}</div>;
          })}
        </div>

        {/* Social Circle Grid */}
        <div className="flex flex-wrap gap-6 sm:gap-8">
          {socialLinks.map((s, idx) => (
              <motion.a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.25 + idx * 0.07 }}
                title={s.label}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-[76px] h-[76px] rounded-full border-2 border-[#c9c9c9] flex items-center justify-center group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-black/25 transition-all duration-300 shadow-md shadow-black/[0.06]">
                  <BrandLogo slug={s.slug} color={s.color} alt={s.label} size={28} />
                </div>
                <span className="text-sm font-sans font-semibold text-[#666666] group-hover:text-[#171717] transition-colors tracking-wide">
                  {s.label}
                </span>
              </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
