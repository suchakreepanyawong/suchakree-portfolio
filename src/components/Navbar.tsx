'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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

export default function Navbar() {
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
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 border border-[#eaeaea] backdrop-blur-xl shadow-lg shadow-black/[0.04] w-full max-w-[960px]">

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

        {/* Download Resume CTA — hidden until public/resume.pdf exists */}

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 rounded-full text-zinc-600 hover:text-black hover:bg-zinc-100"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="pointer-events-auto absolute top-18 left-4 right-4 bg-white/95 backdrop-blur-2xl border border-[#eaeaea] rounded-2xl p-4 shadow-xl space-y-1 md:hidden">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-sm font-bold tracking-wider transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
