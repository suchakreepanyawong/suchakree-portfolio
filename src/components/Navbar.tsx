'use client';

import React, { useState, useEffect } from 'react';
import { Download, Menu, X } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Experience', href: '#experience' },
  { name: 'Projects', href: '#projects' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar({ resumeUrl }: { resumeUrl?: string }) {
  const [activeSection, setActiveSection] = useState('home');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'experience', 'projects', 'portfolio', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Vercel-style Floating Nav Container - Clean White */}
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 border border-[#999999] backdrop-blur-xl shadow-2xl shadow-black/[0.18] w-full max-w-[960px]">

        {/* Logo Avatar - pinned left */}
        <a
          href="#home"
          className="relative w-10 h-10 rounded-full overflow-hidden border border-[#eaeaea] shrink-0 hover:border-[#999999] transition-all flex items-center justify-center bg-zinc-100"
        >
          <Image
            src="/images/Logo.jpg"
            alt="Suchakree Logo"
            fill
            className="object-cover"
            sizes="40px"
            priority
          />
        </a>

        {/* Desktop Nav Items - centered */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5 min-w-0">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-full text-sm font-bold tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'text-[#171717]'
                    : 'text-[#171717] hover:bg-[#f2f2f2]'
                }`}
              >
                {link.name}
                <span
                  className={`absolute left-3.5 right-3.5 -bottom-0.5 h-[2.5px] rounded-full bg-emerald-500 transition-all duration-200 ${
                    isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <span className="group/resume relative hidden md:inline-flex shrink-0">
          <span className="pointer-events-none absolute -inset-1 z-0 rounded-full bg-[#c98500] opacity-0 blur-sm transition-all duration-300 group-hover/resume:opacity-30 group-hover/resume:blur-md" />
          <a
            href={resumeUrl || '/resume.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="group/resume-button relative z-10 inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#292929] active:scale-100"
          >
            <Download className="w-3.5 h-3.5 transition-transform duration-200 group-hover/resume-button:translate-x-0.5 group-hover/resume-button:-rotate-6" />
            Download Resume
          </a>
        </span>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden ml-auto p-1.5 rounded-full text-zinc-600 hover:text-black hover:bg-zinc-100"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="pointer-events-auto absolute top-[70px] left-4 right-4 bg-white/95 backdrop-blur-2xl border border-[#d0d0d0] rounded-2xl p-3 shadow-2xl space-y-1 md:hidden animate-fade-in">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-[#171717] hover:bg-[#f5f5f5] border border-transparent'
                }`}
              >
                {link.name}
              </a>
            );
          })}
          <div className="pt-2 border-t border-[#eaeaea]">
            <a
              href={resumeUrl || '/resume.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#292929]"
            >
              <Download className="w-3.5 h-3.5" />
              Download Resume
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
