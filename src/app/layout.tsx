import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_Thai, Nunito } from 'next/font/google';
import './globals.css';

const interSans = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-thai',
  subsets: ['thai'],
  weight: ['100', '300', '400', '500', '600', '700'],
});

const nunito = Nunito({
  variable: '--font-friendly',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Suchakree Panyawong - Personal Portfolio | Software Developer & Cybersecurity',
  description: 'Portfolio of Suchakree Panyawong, Software Developer, Cybersecurity & AI Enthusiast.',
  keywords: ['Suchakree Panyawong', 'Cybersecurity', 'Local AI', 'RAG', 'Software Developer', 'Linux Architecture'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${interSans.variable} ${jetbrainsMono.variable} ${notoSansThai.variable} ${nunito.variable}`}>
      <head>
        {/* Clear any stale dark-mode preference stored from previous dark-theme sessions */}
        <script dangerouslySetInnerHTML={{ __html: `localStorage.removeItem('theme');document.documentElement.classList.remove('dark');` }} />
      </head>
      <body className="min-h-screen bg-[#fafafa] text-[#171717] font-sans selection:bg-[#171717] selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}

