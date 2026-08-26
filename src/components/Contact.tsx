'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Copy,
  Check,
} from 'lucide-react';
import type { SocialLink, SiteContent } from '@/lib/types';
import AccentTitle from './AccentTitle';

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

export default function Contact({ socialLinks, email, content }: { socialLinks: SocialLink[]; email: string; content: SiteContent }) {
  const [copied, setCopied] = useState<string | null>(null);
  const displayName = (content.about_full_name ?? '').trim() || 'Suchakree Panyawong';
  const phone = (content.contact_phone ?? '').trim() || '+66 93 308 5150';
  const lineId = (content.contact_line ?? '').trim() || 'trrem';

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
      value: phone,
      href: `tel:${phone.replace(/\s+/g, '')}`,
      copyText: phone,
    },
    {
      key: 'email',
      brandSlug: 'gmail',
      label: 'EMAIL',
      value: email,
      href: `mailto:${email}`,
      copyText: email,
    },
    {
      key: 'line',
      brandSlug: 'line',
      label: 'LINE ID',
      value: lineId,
      href: undefined,
      copyText: lineId,
    },
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
            <MessageSquare className="w-3.5 h-3.5 text-[#666666]" /> {content.contact_badge || 'CONTACT'}
          </span>
          <AccentTitle
            title={content.contact_title || 'Get In Touch'}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]"
          />
          <div className="glow-divider w-24" />
        </motion.div>

        {/* Profile Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 sm:gap-4 rounded-xl border border-[#999999] bg-[#fafafa] px-3.5 py-2.5 sm:px-4 sm:py-3 mb-6 sm:mb-8"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#dcdcdc] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/profile-backup.png"
              alt={displayName}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <h3 className="flex-1 text-sm sm:text-base font-semibold text-[#171717] tracking-[-0.02em] min-w-0 truncate">
            {displayName}
          </h3>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-white shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Available
          </span>
        </motion.div>

        {/* Direct Contact Rows */}
        <div className="space-y-1 sm:space-y-2 mb-10 sm:mb-14">
          {directContacts.map((item, idx) => {
            const isCopied = copied === item.key;

            const rowContent = (
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => copy(item.copyText, item.key)}
                className="group flex items-center gap-3 sm:gap-4 py-2 sm:py-3 cursor-pointer min-w-0"
              >
                {/* Circle Brand Logo (lucide Phone for phone — no brand slug in simple-icons) */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#171717] flex items-center justify-center shrink-0">
                  {item.brandSlug ? (
                    <BrandLogo slug={item.brandSlug} color="171717" alt={item.label} size={16} />
                  ) : (
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#171717] stroke-[1.5]" />
                  )}
                </div>

                {/* Label + Value */}
                <div className="flex-1 min-w-0 border-b border-[#eeeeee] pb-2 sm:pb-3">
                  <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.16em] text-[#999999] mb-0.5 uppercase">
                    {item.label}
                  </p>
                  <p className="text-xs sm:text-base font-semibold text-[#171717] group-hover:text-black transition-colors truncate">
                    {item.value}
                  </p>
                </div>

                {/* Copy Button */}
                <div className="shrink-0 pb-2 sm:pb-2.5 pr-1">
                  {isCopied
                    ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d0d0d0] group-hover:text-[#888888] transition-colors" />
                  }
                </div>
              </motion.div>
            );

            return item.href
              ? <a key={item.key} href={item.href} className="block min-w-0 w-full">{rowContent}</a>
              : <div key={item.key} className="min-w-0">{rowContent}</div>;
          })}
        </div>

        {/* Social Circle Grid */}
        <div className="flex flex-wrap gap-4 sm:gap-8">
          {socialLinks.map((s, idx) => (
              <motion.a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.25 + idx * 0.07 }}
                title={s.label}
                className="group flex flex-col items-center gap-1.5 sm:gap-3"
              >
                <div className="w-12 h-12 sm:w-[76px] sm:h-[76px] rounded-full border-2 border-[#c9c9c9] flex items-center justify-center group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-black/25 transition-all duration-300 shadow-md shadow-black/[0.06]">
                  <BrandLogo slug={s.platform} color={s.color ?? "171717"} alt={s.label} size={20} />
                </div>
                <span className="text-xs sm:text-sm font-sans font-semibold text-[#666666] group-hover:text-[#171717] transition-colors tracking-wide truncate max-w-[80px] sm:max-w-none text-center">
                  {s.label}
                </span>
              </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
