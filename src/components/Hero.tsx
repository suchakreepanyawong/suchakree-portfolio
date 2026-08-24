'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronDown, ArrowDown } from 'lucide-react';
import type { SocialLink } from '@/lib/types';

const SI = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons';

// Real brand logo as CSS mask — recolorable via background color
function BrandLogo({ slug, color, alt, size = 16, hoverWhite = false }: { slug: string; color: string; alt: string; size?: number; hoverWhite?: boolean }) {
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
      className={`block shrink-0 bg-[var(--brand)] transition-all duration-200 group-hover:scale-110 ${hoverWhite ? 'group-hover:!bg-white' : ''}`}
    />
  );
}



function useTypewriter(text: string, speed = 55) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
}

function BioText({ text }: { text: string }) {
  const typed = useTypewriter(text);
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-[#666666] text-base sm:text-lg leading-relaxed max-w-xl font-normal min-h-[3rem]"
    >
      <span className="text-[#171717]">{typed}</span>
      <span className="inline-block w-[2px] h-[1em] bg-[#171717] ml-0.5 align-middle animate-pulse" />
    </motion.p>
  );
}

export default function Hero({ socialLinks, typedText, name, greeting, photo }: { socialLinks: SocialLink[]; typedText: string; name?: string; greeting?: string; photo?: string }) {
  const parts = (name ?? '').trim() ? (name as string).trim().split(/\s+/) : ['Suchakree', 'Panyawong'];
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || 'Panyawong';
  const heroGreeting = (greeting ?? '').trim() || "Hi There, I'm";
  const heroPhoto = (photo ?? '').trim() || '/images/profile.png';

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden"
    >
      {/* Vercel-style Soft Mesh Gradient Ambient Layer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] vercel-mesh-glow rounded-full blur-[120px] pointer-events-none opacity-80" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Text Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-7 text-left z-10"
          >
            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.02em] text-[#171717] break-words"
            >
              {heroGreeting}
            </motion.p>

            {/* Staggered Name Layout with Negative Tracking */}
            <div className="space-y-1">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] text-[#171717] leading-[1.05] break-words"
            >
              {firstName}
            </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[1.05] break-words pl-6 sm:pl-8 md:pl-16 lg:pl-24"
              >
                <span className="accent-text">
                  {lastName}
                </span>
              </motion.h1>
            </div>

            {/* Short Bio Statement with Typewriter */}
            <BioText text={typedText} />

            {/* CTA Buttons - Vercel Marketing Scale Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#about"
                className="button-primary-pill group flex items-center gap-2.5 bg-[#171717] text-white px-7 py-3 rounded-full font-medium text-base hover:bg-black transition-colors shadow-sm"
              >
                <span>About Me</span>
                <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="#contact"
                className="button-secondary-pill px-7 py-3 rounded-full border border-[#eaeaea] bg-white text-[#171717] hover:bg-[#f5f5f5] hover:border-[#cccccc] transition-colors text-base font-medium shadow-sm"
              >
                Contact Me
              </a>
            </div>

            {/* Social Links - Circle icons with labels below */}
            <div className="flex flex-wrap items-start gap-2 sm:gap-2.5 pt-4">
              {socialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#d0d0d0] flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-black/30 transition-all duration-300 shadow-md shadow-black/[0.08]">
                    <BrandLogo slug={s.platform} color={s.color ?? "171717"} alt={s.label} size={22} />
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Hero Profile Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="relative group">
              {/* Outer subtle shadow & border ring */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-black/[0.04] to-black/[0.08] blur-lg opacity-80 group-hover:opacity-100 transition duration-500" />
              
              {/* Image Frame with Vercel Hairline */}
              <div className="relative w-72 h-[360px] sm:w-[340px] sm:h-[430px] md:w-[400px] md:h-[500px] lg:w-[440px] lg:h-[550px] rounded-2xl overflow-hidden bg-white border border-[#b8b8b8] shadow-xl group-hover:border-[#999999] transition-all duration-300">
                <img
                  src={heroPhoto}
                  alt={`${firstName} ${lastName}`}
                  className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.04] group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Floating Scroll Indicator Arrow at bottom - truly centered */}
      <div className="absolute bottom-6 left-0 w-full flex flex-col items-center gap-1 text-zinc-500 text-xs font-semibold pointer-events-none animate-bounce">
        <span>Scroll to Explore</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
