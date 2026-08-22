'use client';

import React from 'react';

const links = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  return (
    <footer className="py-10 border-t border-[#eaeaea] bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <a href="#home" className="text-sm font-semibold text-[#171717] tracking-[-0.02em]">
            Suchakree <span className="accent-text">Panyawong</span>
          </a>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-5 border-t border-[#eaeaea] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-sans text-[#999999]">
          <span>
            © {new Date().getFullYear()} Suchakree Panyawong. All rights reserved.
          </span>
          <span>Built with Next.js · Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
